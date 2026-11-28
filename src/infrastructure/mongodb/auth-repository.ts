/** Issue 4. Authenticated, actor-scoped identity persistence. NEVER import from client or route.
 * Multi-document operations require a proven driver transaction; otherwise deny before writes.
 */
import {createHash,randomUUID} from 'node:crypto';
import {newOpaqueToken,hashOpaqueToken,constantTimeTokenMatch} from '../../server/security/crypto.ts';
import type {MongoDatabase} from './driver.ts';
import {isMongoDuplicateKey} from './driver.ts';
import type {MongoTransactionRunner} from './audit.ts';
import {parseAccountRecord} from './validation.ts';
import type {AccountRecord,ProviderIdentityRecord,SessionRecord,PortfolioRecord} from '../../domain/persistence/models.ts';
import type {AccountId,OperationId} from '../../shared/domain/identifiers.ts';
import {parseAccountId,parseOperationId,parseSessionId} from '../../shared/domain/identifiers.ts';
import {IdentityDenied,SESSION_ABSOLUTE_MS,SESSION_IDLE_MS,LINK_INTENT_MS,
  validateVerifiedIdentity,parseProfilePatch,requireRecentAuthentication} from '../../domain/identity/contracts.ts';
import type {AuthenticatedActor,VerifiedProviderIdentity,IdentityProvider} from '../../domain/identity/contracts.ts';
import {projectSecurityAudit} from '../../server/observability/audit.ts';
import type {SecurityAuditKind} from '../../server/observability/audit.ts';

export interface LinkIntentRecord {
  intentHash:string;accountId:AccountId;sessionLookupId:string;provider:IdentityProvider;
  state:'issued'|'consumed';createdAt:Date;expiresAt:Date;consumedAt?:Date;schemaVersion:1;
}
export interface PrivateAccountSummary {
  accountId:AccountId;displayName:string;verifiedEmail:string|null;status:'active';
  isAdmin:boolean;createdAt:string;linkedProviders:readonly {identityId:string;provider:IdentityProvider;linkedAt:string}[];
  portfolioSummaries:readonly {portfolioId:string;slug:string;status:string}[];
  capabilities:{canCreatePortfolio:boolean;canLinkProvider:boolean;canUseEmailFeatures:boolean};
}
interface IssuedSession {token:string;session:SessionRecord;}
const uuid=()=>randomUUID();
const lookupId=(token:string)=>createHash('sha256').update(token).digest('base64url');
const safeTime=(d:Date)=>Number.isFinite(d.valueOf());
const userAccount=(identity:VerifiedProviderIdentity,now:Date):AccountRecord=>({
  accountId:parseAccountId(uuid()),status:'active',displayName:identity.displayName,
  preferredLocale:'en',...(identity.verifiedEmail?{verifiedEmail:identity.verifiedEmail,emailVerifiedAt:now.toISOString()}:{}),
  platformRoles:['user'],securityVersion:0,createdAt:now.toISOString(),updatedAt:now.toISOString(),schemaVersion:1,
});
const linkRow=(accountId:AccountId,identity:VerifiedProviderIdentity,now:Date):ProviderIdentityRecord=>({
  identityId:uuid(),accountId,provider:identity.provider,providerSubject:identity.subject,
  issuer:identity.issuer,linkedAt:now.toISOString(),schemaVersion:1,
});

export class MongoAuthRepository {
  private readonly db:MongoDatabase;
  private readonly transactions:MongoTransactionRunner|null;
  private readonly clock:()=>Date;
  constructor(db:MongoDatabase,transactions:MongoTransactionRunner|null,clock:()=>Date=()=>new Date()) {
    this.db=db;this.transactions=transactions;this.clock=clock;
  }
  private now():Date {const n=this.clock();if(!safeTime(n))throw new IdentityDenied('CAPABILITY_UNAVAILABLE');return n;}
  private async transactional<T>(fn:(session:unknown)=>Promise<T>):Promise<T> {
    if(!this.transactions)throw new IdentityDenied('CAPABILITY_UNAVAILABLE');
    // Do not retry a non-idempotent transaction inside the repository. The driver will
    // retry transient conflicts using a reviewed bounded official-driver transaction policy.
    return this.transactions.execute(fn);
  }
  private async audit(session:unknown,accountId:AccountId,kind:SecurityAuditKind,
    operationId:OperationId,reasonCode:string,now:Date):Promise<void> {
    const projected=projectSecurityAudit({eventId:`evt_${newOpaqueToken()}`,operationId,kind,accountId,
      createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+90*86400000).toISOString(),
      result:'accepted',reasonCode});
    await this.db.collection('auditEvents').insertOne({...projected,createdAt:now,
      expiresAt:new Date(projected.expiresAt),schemaVersion:1},{session});
  }
  private async getAccount(accountId:AccountId,session?:unknown):Promise<AccountRecord|null> {
    const account=await this.db.collection<AccountRecord>('accounts').findOne({accountId,status:'active'},
      session?{session}:undefined);
    return account?parseAccountRecord(account):null;
  }
  /** Never join on an email. Called only with provider proof that Auth.js actually verified. */
  async resolveOrCreateFromVerifiedProvider(source:VerifiedProviderIdentity):Promise<AccountId> {
    const provider=validateVerifiedIdentity(source),now=this.now();
    const existing=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
      provider:provider.provider,providerSubject:provider.subject});
    if(existing){
      const active=await this.getAccount(existing.accountId);
      if(!active||existing.issuer!==provider.issuer)throw new IdentityDenied('ACCOUNT_UNAVAILABLE');
      return active.accountId;
    }
    try{return await this.transactional(async session=>{
      // Re-read within transaction: unique provider+subject index is final collision backstop.
      const second=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
        provider:provider.provider,providerSubject:provider.subject},{session});
      if(second){if(second.issuer!==provider.issuer)throw new IdentityDenied('IDENTITY_CONFLICT');
        const active=await this.getAccount(second.accountId,session);
        if(!active)throw new IdentityDenied('ACCOUNT_UNAVAILABLE');return active.accountId;}
      const account=userAccount(provider,now);
      await this.db.collection<AccountRecord>('accounts').insertOne(account,{session});
      await this.db.collection<ProviderIdentityRecord>('providerIdentities').insertOne(linkRow(account.accountId,provider,now),{session});
      await this.audit(session,account.accountId,'provider.register',parseOperationId(uuid()),'PROVIDER_REGISTERED',now);
      return account.accountId;
    });}catch(e){
      if(!isMongoDuplicateKey(e))throw e;
      // Idempotent concurrent signup; do not return an uncommitted or unrelated email match.
      const winner=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
        provider:provider.provider,providerSubject:provider.subject});
      if(!winner||winner.issuer!==provider.issuer||!(await this.getAccount(winner.accountId)))
        throw new IdentityDenied('IDENTITY_CONFLICT');
      return winner.accountId;
    }
  }
  /** One-time exchange from a short Auth.js callback session to a revocable database session.
   * The opaque OAuth JWT digest has a unique index and expires after the OAuth handshake.
   */
  async exchangeVerifiedOAuthSession(accountId:AccountId,provider:IdentityProvider,
    authJsCookie:string):Promise<IssuedSession> {
    if(typeof authJsCookie!=='string'||authJsCookie.length<24||authJsCookie.length>8192)
      throw new IdentityDenied('NOT_AUTHENTICATED');
    const now=this.now();const oauthHash=createHash('sha256').update(authJsCookie).digest('hex');
    return this.transactional(async session=>{
      const account=await this.getAccount(accountId,session);
      if(!account)throw new IdentityDenied('NOT_AUTHENTICATED');
      const linked=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
        accountId,provider},{session});
      if(!linked)throw new IdentityDenied('NOT_AUTHENTICATED');
      const token=newOpaqueToken();const row:SessionRecord={
        sessionId:parseSessionId(uuid()),accountId,sessionLookupId:lookupId(token),verifierHash:hashOpaqueToken(token),
        securityVersion:account.securityVersion,createdAt:now,authenticatedAt:now,
        lastSeenAt:now,idleExpiresAt:new Date(now.getTime()+SESSION_IDLE_MS),
        absoluteExpiresAt:new Date(now.getTime()+SESSION_ABSOLUTE_MS),
        expiresAt:new Date(now.getTime()+SESSION_ABSOLUTE_MS),authProvider:provider,schemaVersion:1,
      };
      // Insert both under same transaction. Any duplicate, failure, or crash => no newly valid session.
      await this.db.collection('authOAuthExchanges').insertOne({oauthHash,accountId,provider,createdAt:now,
        expiresAt:new Date(now.getTime()+15*60_000),schemaVersion:1},{session});
      await this.db.collection<SessionRecord>('sessions').insertOne(row,{session});
      await this.audit(session,accountId,'session.issue',parseOperationId(uuid()),'SESSION_CREATED',now);
      return {token,session:row};
    });
  }
  async findOwnedAccountByProvider(provider:IdentityProvider,subject:string):Promise<AccountRecord|null>{
    if(!/^[A-Za-z0-9_-][A-Za-z0-9_:\-./]{0,199}$/.test(subject)||!['google','github'].includes(provider))return null;
    const identity=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({provider,providerSubject:subject});
    return identity?this.getAccount(identity.accountId):null;
  }
  async requireSession(rawToken:string|null):Promise<AuthenticatedActor> {
    if(!rawToken||!/^[A-Za-z0-9_-]{43}$/.test(rawToken))throw new IdentityDenied('NOT_AUTHENTICATED');
    const now=this.now();
    const session=await this.db.collection<SessionRecord>('sessions').findOne({
      sessionLookupId:lookupId(rawToken),expiresAt:{$gt:now},revokedAt:{$exists:false}});
    if(!session||!constantTimeTokenMatch(rawToken,session.verifierHash)||
      !session.authenticatedAt||!session.idleExpiresAt||!session.absoluteExpiresAt||
      !safeTime(session.authenticatedAt)||session.idleExpiresAt<=now||session.absoluteExpiresAt<=now||
      session.createdAt>now||session.authenticatedAt>now||!session.authProvider)
      throw new IdentityDenied('NOT_AUTHENTICATED');
    const account=await this.getAccount(session.accountId);
    if(!account||account.securityVersion!==session.securityVersion)
      throw new IdentityDenied('NOT_AUTHENTICATED');
    const linked=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
      accountId:account.accountId,provider:session.authProvider});
    if(!linked)throw new IdentityDenied('NOT_AUTHENTICATED');
    // Idle renewal with single-document conditional write; never extend absolute expiry.
    const nextIdle=new Date(Math.min(now.getTime()+SESSION_IDLE_MS,session.absoluteExpiresAt.getTime()));
    if(nextIdle.getTime()-session.idleExpiresAt.getTime()>60_000){
      const updated=await this.db.collection<SessionRecord>('sessions').updateOne({
        sessionLookupId:session.sessionLookupId,revokedAt:{$exists:false},securityVersion:session.securityVersion,
        idleExpiresAt:session.idleExpiresAt},{$set:{idleExpiresAt:nextIdle,lastSeenAt:now}});
      if(updated.matchedCount!==1)throw new IdentityDenied('NOT_AUTHENTICATED');
    }
    return Object.freeze({accountId:account.accountId,sessionId:parseSessionId(session.sessionId),
      sessionLookupId:session.sessionLookupId,authProvider:session.authProvider,authenticatedAt:session.authenticatedAt,
      securityVersion:account.securityVersion});
  }
  async issueCsrfToken(actor:AuthenticatedActor):Promise<string> {
    const now=this.now(),token=newOpaqueToken();
    const result=await this.db.collection<SessionRecord>('sessions').updateOne({
      sessionId:actor.sessionId,accountId:actor.accountId,securityVersion:actor.securityVersion,
      revokedAt:{$exists:false},expiresAt:{$gt:now}},{$set:{csrfProofHash:hashOpaqueToken(token)}});
    if(result.matchedCount!==1)throw new IdentityDenied('NOT_AUTHENTICATED');
    return token;
  }
  async csrfHash(actor:AuthenticatedActor):Promise<string|null> {
    const now=this.now();const session=await this.db.collection<SessionRecord>('sessions').findOne({
      sessionId:actor.sessionId,accountId:actor.accountId,securityVersion:actor.securityVersion,
      expiresAt:{$gt:now},revokedAt:{$exists:false}});
    return session?.csrfProofHash??null;
  }
  async readPrivateAccount(actor:AuthenticatedActor):Promise<PrivateAccountSummary> {
    const account=await this.getAccount(actor.accountId);
    if(!account||account.securityVersion!==actor.securityVersion)throw new IdentityDenied('NOT_AUTHENTICATED');
    const links=await this.db.collection<ProviderIdentityRecord>('providerIdentities').find({accountId:actor.accountId})
      .sort({linkedAt:1}).limit(8).toArray();
    const owned=await this.db.collection<PortfolioRecord>('portfolios').find({ownerAccountId:actor.accountId})
      .sort({createdAt:1}).limit(2).toArray();
    return {accountId:account.accountId,displayName:account.displayName,verifiedEmail:account.verifiedEmail??null,
      status:'active',isAdmin:account.platformRoles.includes('admin'),createdAt:account.createdAt,
      linkedProviders:links.map(link=>({identityId:link.identityId,provider:link.provider,linkedAt:link.linkedAt})),
      portfolioSummaries:owned.map(p=>({portfolioId:p.portfolioId,slug:p.slug,status:p.status})),
      capabilities:{canCreatePortfolio:owned.length===0,canLinkProvider:links.length<2,
        canUseEmailFeatures:!!account.verifiedEmail}};
  }
  async updateProfile(actor:AuthenticatedActor,raw:unknown):Promise<PrivateAccountSummary> {
    const patch=parseProfilePatch(raw),now=this.now();
    const result=await this.db.collection<AccountRecord>('accounts').updateOne({accountId:actor.accountId,
      status:'active',securityVersion:actor.securityVersion},{$set:{displayName:patch.displayName,updatedAt:now.toISOString()}});
    if(result.matchedCount!==1)throw new IdentityDenied('ACCOUNT_UNAVAILABLE');
    return this.readPrivateAccount(actor);
  }
  async revokeCurrentSession(actor:AuthenticatedActor,operationId:OperationId):Promise<void> {
    const now=this.now();parseOperationId(operationId);
    await this.transactional(async session=>{
      const result=await this.db.collection<SessionRecord>('sessions').updateOne({sessionId:actor.sessionId,
        accountId:actor.accountId,securityVersion:actor.securityVersion,revokedAt:{$exists:false}},
        {$set:{revokedAt:now}},{session});
      if(result.matchedCount!==1)throw new IdentityDenied('NOT_AUTHENTICATED');
      await this.audit(session,actor.accountId,'session.revoke',operationId,'SESSION_REVOKED',now);
    });
  }
  async revokeAllSessions(actor:AuthenticatedActor,operationId:OperationId):Promise<void> {
    requireRecentAuthentication(actor,this.now());parseOperationId(operationId);const now=this.now();
    await this.transactional(async session=>{
      const updated=await this.db.collection<AccountRecord>('accounts').updateOne({accountId:actor.accountId,
        status:'active',securityVersion:actor.securityVersion},
        {$inc:{securityVersion:1},$set:{updatedAt:now.toISOString()}},{session});
      if(updated.matchedCount!==1)throw new IdentityDenied('ACCOUNT_CONFLICT');
      await this.audit(session,actor.accountId,'session.revoke',operationId,'ALL_SESSIONS_REVOKED',now);
    });
  }
  /** Read-only and scoped: the OAuth initiation page cannot be reached with a guessed intent,
   * another user's session, a mismatched provider, or an expired TTL document.
   */
  async requirePendingLinkIntent(actor:AuthenticatedActor,rawIntent:string|null,
    provider:IdentityProvider):Promise<void>{
    requireRecentAuthentication(actor,this.now());
    if(!rawIntent||!/^[A-Za-z0-9_-]{43}$/.test(rawIntent)||!['google','github'].includes(provider))
      throw new IdentityDenied('LINK_INTENT_INVALID');
    const intent=await this.db.collection<LinkIntentRecord>('authLinkIntents').findOne({
      intentHash:hashOpaqueToken(rawIntent),accountId:actor.accountId,
      sessionLookupId:actor.sessionLookupId,provider,state:'issued',expiresAt:{$gt:this.now()}});
    if(!intent)throw new IdentityDenied('LINK_INTENT_INVALID');
  }
  async createLinkIntent(actor:AuthenticatedActor,provider:IdentityProvider):Promise<string>{
    const now=this.now();requireRecentAuthentication(actor,now);
    if(!['google','github'].includes(provider))throw new IdentityDenied('INVALID_PROVIDER_PROOF');
    const existing=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({accountId:actor.accountId,provider});
    if(existing)throw new IdentityDenied('IDENTITY_CONFLICT');
    const token=newOpaqueToken();
    await this.db.collection<LinkIntentRecord>('authLinkIntents').insertOne({intentHash:hashOpaqueToken(token),
      accountId:actor.accountId,sessionLookupId:actor.sessionLookupId,provider,state:'issued',createdAt:now,
      expiresAt:new Date(now.getTime()+LINK_INTENT_MS),schemaVersion:1});
    return token;
  }
  async completeLink(actor:AuthenticatedActor,rawIntent:string,source:VerifiedProviderIdentity,
    operationId:OperationId):Promise<void>{
    const provider=validateVerifiedIdentity(source),now=this.now();parseOperationId(operationId);
    if(!/^[A-Za-z0-9_-]{43}$/.test(rawIntent))throw new IdentityDenied('LINK_INTENT_INVALID');
    requireRecentAuthentication(actor,now);
    await this.transactional(async session=>{
      const intent=await this.db.collection<LinkIntentRecord>('authLinkIntents').findOne({
        intentHash:hashOpaqueToken(rawIntent),accountId:actor.accountId,
        sessionLookupId:actor.sessionLookupId,provider:provider.provider,
        state:'issued',expiresAt:{$gt:now}},{session});
      if(!intent)throw new IdentityDenied('LINK_INTENT_INVALID');
      const account=await this.getAccount(actor.accountId,session);
      if(!account||account.securityVersion!==actor.securityVersion)throw new IdentityDenied('NOT_AUTHENTICATED');
      const linked=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
        provider:provider.provider,providerSubject:provider.subject},{session});
      if(linked)throw new IdentityDenied('IDENTITY_CONFLICT');
      const claimed=await this.db.collection<LinkIntentRecord>('authLinkIntents').updateOne({
        intentHash:intent.intentHash,state:'issued',expiresAt:{$gt:now}},{$set:{state:'consumed',consumedAt:now}},{session});
      if(claimed.matchedCount!==1)throw new IdentityDenied('LINK_INTENT_INVALID');
      await this.db.collection<ProviderIdentityRecord>('providerIdentities').insertOne(linkRow(actor.accountId,provider,now),{session});
      // Bump version to revoke all prior sessions, including the session that initiated the link.
      const bumped=await this.db.collection<AccountRecord>('accounts').updateOne({accountId:actor.accountId,
        status:'active',securityVersion:actor.securityVersion},
        {$inc:{securityVersion:1},$set:{updatedAt:now.toISOString()}},{session});
      if(bumped.matchedCount!==1)throw new IdentityDenied('ACCOUNT_CONFLICT');
      await this.audit(session,actor.accountId,'provider.link',operationId,'PROVIDER_LINKED',now);
    });
  }
  async unlink(actor:AuthenticatedActor,identityId:string,operationId:OperationId):Promise<void>{
    const now=this.now();requireRecentAuthentication(actor,now);parseOperationId(operationId);
    if(!/^[a-f0-9-]{36}$/i.test(identityId))throw new IdentityDenied('IDENTITY_CONFLICT');
    await this.transactional(async session=>{
      const account=await this.getAccount(actor.accountId,session);
      if(!account||account.securityVersion!==actor.securityVersion)throw new IdentityDenied('NOT_AUTHENTICATED');
      const links=await this.db.collection<ProviderIdentityRecord>('providerIdentities').find({accountId:actor.accountId},{session})
        .sort({linkedAt:1}).limit(8).toArray();
      if(!links.some(i=>i.identityId===identityId))throw new IdentityDenied('IDENTITY_CONFLICT');
      if(links.length<=1)throw new IdentityDenied('LAST_LOGIN_PROVIDER');
      // Recent proof from the provider that will REMAIN is stronger than a stale row count.
      // Prevent unlinking the very provider used to authenticate this session.
      const remainingVerified=links.find(i=>i.provider===actor.authProvider&&i.identityId!==identityId);
      if(!remainingVerified)throw new IdentityDenied('REAUTHENTICATION_REQUIRED');
      // Shared account write in the same real transaction serializes two simultaneous unlinks.
      const bumped=await this.db.collection<AccountRecord>('accounts').updateOne({accountId:actor.accountId,
        status:'active',securityVersion:actor.securityVersion},
        {$inc:{securityVersion:1},$set:{updatedAt:now.toISOString()}},{session});
      if(bumped.matchedCount!==1)throw new IdentityDenied('ACCOUNT_CONFLICT');
      const removed=await this.db.collection<ProviderIdentityRecord>('providerIdentities').deleteOne({
        accountId:actor.accountId,identityId},{session});
      if(removed.deletedCount!==1)throw new IdentityDenied('ACCOUNT_CONFLICT');
      await this.audit(session,actor.accountId,'provider.unlink',operationId,'PROVIDER_UNLINKED',now);
    });
  }
  /** Privileged offline-only command: never callable from an HTTP route or user registration. */
  async bootstrapAdmin(approvedOperator:boolean,accountId:AccountId,provider:IdentityProvider,
    stableSubject:string,operationId:OperationId):Promise<'granted'|'already_admin'> {
    if(!approvedOperator)throw new IdentityDenied('NOT_AUTHORIZED');
    parseAccountId(accountId);parseOperationId(operationId);
    const identity=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({
      accountId,provider,providerSubject:stableSubject});
    if(!identity)throw new IdentityDenied('NOT_AUTHORIZED');
    const now=this.now();
    return this.transactional(async session=>{
      const account=await this.getAccount(accountId,session);
      if(!account)throw new IdentityDenied('ACCOUNT_UNAVAILABLE');
      if(account.platformRoles.includes('admin'))return 'already_admin';
      const changed=await this.db.collection<AccountRecord>('accounts').updateOne({accountId,
        status:'active',securityVersion:account.securityVersion,platformRoles:['user']},
        {$set:{platformRoles:['user','admin'],updatedAt:now.toISOString()},$inc:{securityVersion:1}},{session});
      if(changed.matchedCount!==1)throw new IdentityDenied('ACCOUNT_CONFLICT');
      await this.audit(session,accountId,'admin.role.change',operationId,'OPERATOR_BOOTSTRAP',now);
      return 'granted';
    });
  }
}
