/** Fixed Mongo identity/session/slug primitives. Future OAuth verification and account commands (Issue 4)
 * must call these only after validating provider state/nonce/issuer and an eligible actor.
 */
import type {MongoDatabase} from './driver.ts';
import {isMongoDuplicateKey,PersistenceConflict} from './driver.ts';
import type {AccountRecord,ProviderIdentityRecord,SessionRecord,SlugClaimRecord} from '../../domain/persistence/models.ts';
import type {AccountId,PortfolioId} from '../../shared/domain/identifiers.ts';
import {parseAccountId,parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {parseCanonicalSlug} from '../../shared/domain/validation.ts';
import {constantTimeTokenMatch} from '../../server/security/crypto.ts';
import {parseAccountRecord} from './validation.ts';

export class MongoIdentityPersistence {
  private readonly db:MongoDatabase;
  constructor(db:MongoDatabase){this.db=db;}
  async insertAccountFromVerifiedProvider(account:AccountRecord):Promise<void>{
    const safe=parseAccountRecord(account);
    if(safe.status!=='active'||safe.platformRoles.length!==1||safe.platformRoles[0]!=='user')
      throw new PersistenceConflict(); // no self-provisioned administrator
    try{await this.db.collection<AccountRecord>('accounts').insertOne(safe);}
    catch(e){if(isMongoDuplicateKey(e))throw new PersistenceConflict();throw e;}
  }
  async findAccountForIdentity(provider:'google'|'github',providerSubject:string):Promise<AccountRecord|null>{
    if(!['google','github'].includes(provider)||typeof providerSubject!=='string'||providerSubject.length<1||
      providerSubject.length>200)throw new PersistenceConflict();
    const identity=await this.db.collection<ProviderIdentityRecord>('providerIdentities').findOne({provider,providerSubject});
    if(!identity)return null;
    const raw=await this.db.collection<AccountRecord>('accounts').findOne({accountId:identity.accountId,status:'active'});
    return raw?parseAccountRecord(raw):null;
  }
  /** Never call before OAuth provider proof and explicit linking authorization (Issue 4). */
  async insertVerifiedProviderLink(identity:ProviderIdentityRecord,proofConfirmed:boolean):Promise<void>{
    if(!proofConfirmed||!['google','github'].includes(identity.provider)||
      !identity.providerSubject||identity.providerSubject.length>200||identity.schemaVersion!==1)
      throw new PersistenceConflict();
    parseAccountId(identity.accountId);
    const account=await this.db.collection<AccountRecord>('accounts').findOne({accountId:identity.accountId,status:'active'});
    if(!account)throw new PersistenceConflict();
    parseAccountRecord(account);
    try{await this.db.collection<ProviderIdentityRecord>('providerIdentities').insertOne(identity);}
    catch(e){if(isMongoDuplicateKey(e))throw new PersistenceConflict();throw e;}
  }
  /** Requires proof obtained via session verifier, not just an attacker-supplied session ID. */
  async findUnrevokedSession(sessionLookupId:string,presentedVerifier:string,now:Date):Promise<Pick<SessionRecord,'accountId'|'securityVersion'>|null>{
    if(!/^[a-zA-Z0-9_-]{16,160}$/.test(sessionLookupId))return null;
    const session=await this.db.collection<SessionRecord>('sessions').findOne({sessionLookupId,
      expiresAt:{$gt:now},revokedAt:{$exists:false}});
    if(!session||session.expiresAt<=now||!constantTimeTokenMatch(presentedVerifier,session.verifierHash))return null;
    const account=await this.db.collection<AccountRecord>('accounts').findOne({accountId:session.accountId,status:'active',
      securityVersion:session.securityVersion});
    if(!account)return null;
    parseAccountRecord(account);
    // Token verifier was checked timing-safely; IAM must still check provider/session policy.
    return {accountId:session.accountId,securityVersion:session.securityVersion};
  }
  /** Initial claim only. Historic alias changes require the verified rename saga in Issue 5. */
  async insertOwnedSlugClaim(accountId:AccountId,claim:SlugClaimRecord):Promise<void>{
    parseAccountId(accountId);parsePortfolioId(claim.portfolioId);
    if(claim.schemaVersion!==1||claim.kind!=='current'||parseCanonicalSlug(claim.slugNormalized)!==claim.slugNormalized)
      throw new PersistenceConflict();
    const owner=await this.db.collection('portfolios').findOne({portfolioId:claim.portfolioId,
      ownerAccountId:accountId,status:{$in:['active','onboarding','owner_disabled']}});
    if(!owner)throw new PersistenceConflict();
    try{await this.db.collection<SlugClaimRecord>('slugClaims').insertOne(claim);}
    catch(e){if(isMongoDuplicateKey(e))throw new PersistenceConflict();throw e;}
  }
  async findClaim(slug:string):Promise<{portfolioId:PortfolioId;kind:'current'|'alias'}|null>{
    const normalized=parseCanonicalSlug(slug);
    const claim=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({slugNormalized:normalized});
    if(!claim||!['current','alias'].includes(claim.kind))return null;
    return {portfolioId:parsePortfolioId(claim.portfolioId),kind:claim.kind as 'current'|'alias'};
  }
}
