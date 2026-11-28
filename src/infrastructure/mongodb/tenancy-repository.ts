/** Issue 5: fixed-scope MongoDB ownership, slug claims, live policy and public read models.
 * This module is server-only, and every write uses the exact same official driver session.
 * A missing/unproven transaction runner means denial BEFORE any multi-document mutation.
 */
import {randomUUID,createHash} from 'node:crypto';
import {newOpaqueToken} from '../../server/security/crypto.ts';
import {projectSecurityAudit} from '../../server/observability/audit.ts';
import type {SecurityAuditKind} from '../../server/observability/audit.ts';
import {parsePortfolioId,parseAccountId,parseSectionId,parseContentId} from '../../shared/domain/identifiers.ts';
import type {AccountId,PortfolioId} from '../../shared/domain/identifiers.ts';
import {parseCanonicalSlug} from '../../shared/domain/validation.ts';
import {initialHeroSection} from '../../domain/content/model.ts';
import {projectCollectionDefinition} from '../../domain/content/projects.ts';
import type {SectionDefinition,ContentItem} from '../../domain/content/types.ts';
import type {CanonicalSlug} from '../../shared/domain/validation.ts';
import type {MongoDatabase} from './driver.ts';
import {isMongoDuplicateKey,PersistenceUnavailable} from './driver.ts';
import type {MongoTransactionRunner} from './audit.ts';
import type {AuthenticatedActor} from '../../domain/identity/contracts.ts';
import type {CreationCommand} from '../../domain/tenancy/commands.ts';
import {TenancyDenied} from '../../domain/tenancy/commands.ts';
import type {PortfolioRecord,DraftRecord,SlugClaimRecord,AccountRecord,SessionRecord,
  ReleaseRecord,ModerationPolicyRecord} from '../../domain/persistence/models.ts';
import {parsePortfolioRecord,parseDraftRecord,parseAccountRecord,parseReleaseRecord,
  parseModerationPolicyRecord} from './validation.ts';
import {MongoPublicReleaseReader} from './repositories.ts';
import type {PublicReadDecision} from '../../domain/persistence/ports.ts';
import {canonicalApexUrl,manifestIncludesRoute,parsePublicRoute} from '../../domain/tenancy/routing.ts';
import type {PublicRouteResult,PublicDirectoryItem,OwnerPortfolioSummary} from '../../domain/tenancy/ports.ts';
import type {PublicRoute} from '../../domain/tenancy/routing.ts';

interface RenameOperationRecord {operationId:string;portfolioId:PortfolioId;ownerAccountId:AccountId;
  idempotencyHash:string;requestFingerprint:string;fromSlug:string;toSlug:string;createdAt:string;schemaVersion:1;}
export type {OwnerPortfolioSummary} from '../../domain/tenancy/ports.ts';
const uuid=()=>randomUUID();
const HASH=/^[a-f0-9]{64}$/;
const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
const createFingerprint=(cmd:CreationCommand)=>digest(JSON.stringify([
  cmd.slug,cmd.displayName,cmd.identityLabel,cmd.introduction,cmd.templatePreset,cmd.firstProject??null]));
export class MongoTenancyRepository {
  private readonly db:MongoDatabase;
  private readonly transactions:MongoTransactionRunner|null;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,transactions:MongoTransactionRunner|null,now:()=>Date=()=>new Date()){
    this.db=db;this.transactions=transactions;this.now=now;
  }
  private safeNow():Date {const d=this.now();if(!Number.isFinite(d.getTime()))throw new TenancyDenied('UNAVAILABLE');return d;}
  private async atomic<T>(fn:(session:unknown)=>Promise<T>):Promise<T>{
    if(!this.transactions)throw new TenancyDenied('UNAVAILABLE');
    try{return await this.transactions.execute(fn);}
    catch(error){if(error instanceof TenancyDenied)throw error;
      if(isMongoDuplicateKey(error))throw new TenancyDenied('CONFLICT');
      throw new TenancyDenied('UNAVAILABLE');}
  }
  /** Rechecks both account version and session at write time; an Auth.js claim is not an owner grant. */
  private async requireActor(actor:AuthenticatedActor,session?:unknown):Promise<AccountRecord>{
    if(!actor||typeof actor.accountId!=='string'||!Number.isSafeInteger(actor.securityVersion)||
      actor.securityVersion<0||typeof actor.sessionLookupId!=='string')throw new TenancyDenied('NOT_AUTHORIZED');
    parseAccountId(actor.accountId);
    const account=await this.db.collection<AccountRecord>('accounts').findOne({
      accountId:actor.accountId,status:'active',securityVersion:actor.securityVersion},session?{session}:undefined);
    if(!account)throw new TenancyDenied('NOT_AUTHORIZED');
    const current=this.safeNow();
    const ownSession=await this.db.collection<SessionRecord>('sessions').findOne({
      sessionId:actor.sessionId,sessionLookupId:actor.sessionLookupId,accountId:actor.accountId,
      securityVersion:actor.securityVersion,revokedAt:{$exists:false},expiresAt:{$gt:current},
      idleExpiresAt:{$gt:current},absoluteExpiresAt:{$gt:current}},session?{session}:undefined);
    if(!ownSession)throw new TenancyDenied('NOT_AUTHORIZED');
    return parseAccountRecord(account);
  }
  private async owned(actor:AuthenticatedActor,id:PortfolioId,session?:unknown):Promise<PortfolioRecord>{
    await this.requireActor(actor,session);
    const row=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:parsePortfolioId(id),
      ownerAccountId:actor.accountId,status:{$in:['onboarding','active','owner_disabled']}},session?{session}:undefined);
    if(!row)throw new TenancyDenied('NOT_FOUND');return parsePortfolioRecord(row);
  }
  private async audit(session:unknown,actor:AuthenticatedActor,portfolioId:PortfolioId,
    kind:SecurityAuditKind,reasonCode:string,now:Date):Promise<void>{
    const projected=projectSecurityAudit({eventId:`evt_${newOpaqueToken()}`,operationId:uuid() as never,
      kind,accountId:actor.accountId,portfolioId,createdAt:now.toISOString(),
      expiresAt:new Date(now.getTime()+90*86400000).toISOString(),result:'accepted',reasonCode});
    await this.db.collection('auditEvents').insertOne({...projected,createdAt:now,
      expiresAt:new Date(projected.expiresAt),schemaVersion:1},{session});
  }
  private async currentClaims(id:PortfolioId,session?:unknown):Promise<SlugClaimRecord[]>{
    const rows=await this.db.collection<SlugClaimRecord>('slugClaims').find({portfolioId:id},
      session?{session}:undefined).sort({claimedAt:1}).limit(64).toArray();
    return rows.map(r=>{if(parseCanonicalSlug(r.slugNormalized)!==r.slugNormalized||r.portfolioId!==id||
      !['current','alias'].includes(r.kind)||r.schemaVersion!==1)throw new TenancyDenied('UNAVAILABLE');return r;});
  }
  async create(actor:AuthenticatedActor,cmd:CreationCommand,idempotencyKey:string,
    origin:string):Promise<OwnerPortfolioSummary>{
    const key=digest(idempotencyKey),fingerprint=createFingerprint(cmd),now=this.safeNow();
    if(!HASH.test(key)||!HASH.test(fingerprint)||parseCanonicalSlug(cmd.slug)!==cmd.slug)
      throw new TenancyDenied('INVALID_COMMAND');
    try{return await this.atomic(async(session)=>{
      await this.requireActor(actor,session);
      const existing=await this.db.collection<PortfolioRecord>('portfolios').findOne({ownerAccountId:actor.accountId},{session});
      if(existing){const p=parsePortfolioRecord(existing);
        if(p.creationIdempotencyHash===key&&p.creationRequestFingerprint===fingerprint)
          return this.summary(actor,p,origin,session);
        throw new TenancyDenied('PORTFOLIO_ALREADY_EXISTS');}
      const claimed=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({slugNormalized:cmd.slug},{session});
      if(claimed)throw new TenancyDenied('SLUG_UNAVAILABLE');
      const portfolioId=parsePortfolioId(uuid()),sectionId=parseSectionId(uuid());
      const projectSectionId=cmd.firstProject?parseSectionId(uuid()):undefined;
      const projectSchema=projectSectionId?projectCollectionDefinition('projects',1,projectSectionId):undefined;
      const projectSection:SectionDefinition|undefined=projectSectionId&&projectSchema?{
        sectionId:projectSectionId,type:'projects',title:'Projects',order:1,visible:true,
        searchEligible:true,aiSectionApproved:false,canvasRootId:`root_${projectSectionId}`,
        layoutPreset:'default',publicAnchor:'projects',schemaDefinitionId:projectSchema.schemaId}:undefined;
      const initialProject:ContentItem|undefined=cmd.firstProject&&projectSchema?{
        contentId:parseContentId(uuid()),collectionId:'projects',schemaVersion:1,
        fields:{title:cmd.firstProject.title,...(cmd.firstProject.summary?{summary:cmd.firstProject.summary}:{})},
        categoryIds:[],sortOrder:0,featured:false,ownerVisibility:'draft_only',searchable:false,
        publicFieldIds:[],aiApprovedFieldIds:[],createdAt:now.toISOString(),updatedAt:now.toISOString()}:undefined;
      const row:PortfolioRecord={portfolioId,ownerAccountId:actor.accountId,slug:cmd.slug,
        displayHandle:cmd.displayName,status:'onboarding',visibility:'public',activeReleaseId:null,
        publishSequence:0,securityVersion:0,aiAccess:{enabled:false,revocationVersion:0,deniedSourceIds:[]},
        publicStatisticsEnabled:false,quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},
        creationIdempotencyHash:key,creationRequestFingerprint:fingerprint,
        createdAt:now.toISOString(),updatedAt:now.toISOString(),schemaVersion:1};
      const draft:DraftRecord={portfolioId,revision:0,schemaVersion:1,rendererVersion:'1',
        profile:{displayName:cmd.displayName,identityLabel:cmd.identityLabel,introduction:cmd.introduction},
        sections:[initialHeroSection(sectionId),...(projectSection?[projectSection]:[])],
        collectionDefinitions:projectSchema?[projectSchema]:[],
        contentCollections:initialProject?[{collectionId:'projects',items:[initialProject]}]:[],nodes:[],theme:{preset:cmd.templatePreset},
        navigation:{},seo:{indexingEnabled:false},aiApprovals:{enabled:false},mediaRefs:[],
        createdAt:now.toISOString(),updatedAt:now.toISOString(),updatedBy:actor.accountId};
      parsePortfolioRecord(row);parseDraftRecord(draft);
      await this.db.collection<PortfolioRecord>('portfolios').insertOne(row,{session});
      await this.db.collection<SlugClaimRecord>('slugClaims').insertOne({slugNormalized:cmd.slug,portfolioId,
        kind:'current',claimedAt:now.toISOString(),schemaVersion:1},{session});
      await this.db.collection<DraftRecord>('drafts').insertOne(draft,{session});
      await this.audit(session,actor,portfolioId,'portfolio.create','PORTFOLIO_CREATED',now);
      return this.summary(actor,row,origin,session);
    });}
    catch(error){if(error instanceof TenancyDenied&&error.code==='CONFLICT'){
      // Always recheck this live session before returning a result after a write race.
      await this.requireActor(actor);
      // After a simultaneous writer wins, no foreign owner information is returned.
      const byOwner=await this.db.collection<PortfolioRecord>('portfolios').findOne({ownerAccountId:actor.accountId});
      if(byOwner){const p=parsePortfolioRecord(byOwner);
        if(p.creationIdempotencyHash===key&&p.creationRequestFingerprint===fingerprint)
          return this.summary(actor,p,origin);
        throw new TenancyDenied('PORTFOLIO_ALREADY_EXISTS');}
      throw new TenancyDenied('SLUG_UNAVAILABLE');
    }throw error;}
  }
  private async summary(actor:AuthenticatedActor,p:PortfolioRecord,origin:string,session?:unknown):Promise<OwnerPortfolioSummary>{
    if(p.ownerAccountId!==actor.accountId)throw new TenancyDenied('NOT_AUTHORIZED');
    const aliases=(await this.currentClaims(p.portfolioId,session)).filter(r=>r.kind==='alias').map(x=>x.slugNormalized);
    const draft=await this.db.collection<DraftRecord>('drafts').findOne({portfolioId:p.portfolioId},session?{session}:undefined);
    const revision=draft?parseDraftRecord(draft).revision:null;
    return {portfolioId:p.portfolioId,slug:p.slug,status:p.status,visibility:p.visibility,
      activeReleaseId:p.activeReleaseId,securityVersion:p.securityVersion,draftRevision:revision,
      mediaUsage:{originalFileCount:p.quotaSummary.originalFileCount,usedBytes:p.quotaSummary.usedBytes,reservedBytes:p.quotaSummary.reservedBytes},
      canonicalUrl:canonicalApexUrl(origin,parseCanonicalSlug(p.slug),{kind:'root',path:'/'}),aliases};
  }
  async getOwned(actor:AuthenticatedActor,id:PortfolioId,origin:string):Promise<OwnerPortfolioSummary>{
    const p=await this.owned(actor,id);return this.summary(actor,p,origin);
  }
  /** Only the authenticated owner can list their own singleton portfolio. */
  async listOwned(actor:AuthenticatedActor,origin:string):Promise<OwnerPortfolioSummary[]>{
    try{
      await this.requireActor(actor);
      const rows=await this.db.collection<PortfolioRecord>('portfolios').find({ownerAccountId:actor.accountId})
        .sort({createdAt:1}).limit(2).toArray();
      // A duplicate owner row means the unique index or physical model is compromised: fail closed.
      if(rows.length>1)throw new TenancyDenied('UNAVAILABLE');
      const result:OwnerPortfolioSummary[]=[];
      for(const raw of rows){const p=parsePortfolioRecord(raw);
        // Show the owner a restricted state rather than pretending a suspended or deleting
        // portfolio does not exist; all mutations retain the stricter live-status gate.
        result.push(await this.summary(actor,p,origin));
      }
      return result;
    }catch(e){if(e instanceof TenancyDenied)throw e;throw new TenancyDenied('UNAVAILABLE');}
  }
  /** Advisory only: the final slug claim is the unique database insert inside create/rename.
   * Neither the claiming owner nor the claim kind is disclosed. */
  async slugAvailability(actor:AuthenticatedActor,rawSlug:string):Promise<{slug:string;available:boolean}>{
    await this.requireActor(actor);
    let slug:CanonicalSlug;
    try{slug=parseCanonicalSlug(rawSlug);}catch{throw new TenancyDenied('INVALID_COMMAND');}
    try{
      const claim=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({slugNormalized:slug});
      return {slug,available:claim===null};
    }catch{throw new TenancyDenied('UNAVAILABLE');}
  }
  async rename(actor:AuthenticatedActor,id:PortfolioId,target:CanonicalSlug,idempotencyKey:string,
    origin:string):Promise<OwnerPortfolioSummary>{
    parsePortfolioId(id);parseCanonicalSlug(target);const key=digest(idempotencyKey),fingerprint=digest(target),now=this.safeNow();
    try{return await this.atomic(async(session)=>{
      const p=await this.owned(actor,id,session);
      const previous=await this.db.collection<RenameOperationRecord>('renameOperations').findOne({
        portfolioId:id,idempotencyHash:key,ownerAccountId:actor.accountId},{session});
      if(previous){if(previous.requestFingerprint!==fingerprint)throw new TenancyDenied('CONFLICT');
        return this.summary(actor,p,origin,session);}
      if(p.slug!==target){
        const targetClaim=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({slugNormalized:target},{session});
        if(targetClaim)throw new TenancyDenied('SLUG_UNAVAILABLE');
        const current=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({
          slugNormalized:p.slug,portfolioId:id,kind:'current'},{session});
        if(!current)throw new TenancyDenied('UNAVAILABLE');
        // The unique current-claim index permits only one winner, and both aliases stay reserved.
        await this.db.collection<SlugClaimRecord>('slugClaims').updateOne({slugNormalized:p.slug,
          portfolioId:id,kind:'current'},{$set:{kind:'alias',retiredAt:now.toISOString(),redirectStatus:308}},{session});
        await this.db.collection<SlugClaimRecord>('slugClaims').insertOne({slugNormalized:target,
          portfolioId:id,kind:'current',claimedAt:now.toISOString(),schemaVersion:1},{session});
        const updated=await this.db.collection<PortfolioRecord>('portfolios').updateOne({
          portfolioId:id,ownerAccountId:actor.accountId,slug:p.slug,securityVersion:p.securityVersion,
          status:{$in:['onboarding','active','owner_disabled']}},{$set:{slug:target,
            lastRenameRequestHash:key,lastRenameTargetSlug:target,updatedAt:now.toISOString()},
            $inc:{securityVersion:1}},{session});
        if(updated.matchedCount!==1)throw new TenancyDenied('CONFLICT');
      }
      await this.db.collection<RenameOperationRecord>('renameOperations').insertOne({operationId:uuid(),
        portfolioId:id,ownerAccountId:actor.accountId,idempotencyHash:key,requestFingerprint:fingerprint,
        fromSlug:p.slug,toSlug:target,createdAt:now.toISOString(),schemaVersion:1},{session});
      if(p.slug!==target)await this.audit(session,actor,id,'portfolio.rename','SLUG_RENAMED',now);
      const fresh=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:id,
        ownerAccountId:actor.accountId},{session});
      if(!fresh)throw new TenancyDenied('UNAVAILABLE');return this.summary(actor,parsePortfolioRecord(fresh),origin,session);
    });}
    catch(e){if(e instanceof TenancyDenied&&e.code==='CONFLICT'){
      const op=await this.db.collection<RenameOperationRecord>('renameOperations').findOne({
        portfolioId:id,idempotencyHash:key,ownerAccountId:actor.accountId});
      if(op){if(op.requestFingerprint!==fingerprint)throw new TenancyDenied('CONFLICT');return this.getOwned(actor,id,origin);}
      throw new TenancyDenied('SLUG_UNAVAILABLE');}
      throw e;}
  }
  async changePolicy(actor:AuthenticatedActor,id:PortfolioId,action:'visibility'|'disable'|'enable',
    expectedSecurityVersion:number,visibility?:'public'|'unlisted'):Promise<PortfolioRecord>{
    if(!Number.isSafeInteger(expectedSecurityVersion)||expectedSecurityVersion<0||
      (action==='visibility' && !['public','unlisted'].includes(visibility??'')))throw new TenancyDenied('INVALID_COMMAND');
    return this.atomic(async(session)=>{
      const now=this.safeNow(),p=await this.owned(actor,id,session);
      if(p.securityVersion!==expectedSecurityVersion)throw new TenancyDenied('CONFLICT');
      if(action==='disable'&&!['onboarding','active'].includes(p.status))throw new TenancyDenied('CONFLICT');
      if(action==='enable'&&p.status!=='owner_disabled')throw new TenancyDenied('CONFLICT');
      if(action==='enable'){
        const m=await this.db.collection<ModerationPolicyRecord>('moderationPolicies').find({
          portfolioId:id,active:true},{session}).sort({issuedAt:-1}).limit(101).toArray();
        if(m.length>100)throw new TenancyDenied('UNAVAILABLE');
        if(m.some(raw=>{const p=parseModerationPolicyRecord(raw);
          return (!p.expiresAt||p.expiresAt>now)&&['suspend','deny_public','quarantine'].includes(p.effect);}))
          throw new TenancyDenied('MODERATED');
      }
      const nextStatus=action==='disable'?'owner_disabled':action==='enable'?(p.activeReleaseId?'active':'onboarding'):p.status;
      const nextVisibility=action==='visibility'?visibility:p.visibility;
      const row=await this.db.collection<PortfolioRecord>('portfolios').findOneAndUpdate({
        portfolioId:id,ownerAccountId:actor.accountId,status:p.status,securityVersion:expectedSecurityVersion},
        {$set:{status:nextStatus,visibility:nextVisibility,updatedAt:now.toISOString()},
          $inc:{securityVersion:1}},{session,returnDocument:'after'});
      if(!row)throw new TenancyDenied('CONFLICT');
      const kind=action==='visibility'?'portfolio.visibility.change':action==='disable'?'portfolio.disable':'portfolio.enable';
      await this.audit(session,actor,id,kind,action==='visibility'?'VISIBILITY_CHANGED':
        action==='disable'?'PORTFOLIO_DISABLED':'PORTFOLIO_ENABLED',now);
      return parsePortfolioRecord(row);
    });
  }
  /** Public reads never accept an owner actor, Mongo filter, or untrusted portfolioId. */
  async resolvePublic(slugInput:CanonicalSlug,route:PublicRoute,form:'path'|'subdomain',origin:string):Promise<PublicRouteResult>{
    let claim:SlugClaimRecord|null;
    try {const slug=parseCanonicalSlug(slugInput);
      claim=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({slugNormalized:slug});
      if(!claim)return {kind:'not_found'};
      if(claim.schemaVersion!==1||!['current','alias'].includes(claim.kind)||
        parseCanonicalSlug(claim.slugNormalized)!==claim.slugNormalized) return {kind:'unavailable'};
      const pRaw=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:claim.portfolioId});
      if(!pRaw)return {kind:'not_found'};
      const p=parsePortfolioRecord(pRaw);
      if(p.status!=='active'||!p.activeReleaseId)return {kind:'not_found'};
      const account=await this.db.collection<AccountRecord>('accounts').findOne({
        accountId:p.ownerAccountId,status:'active'});
      if(!account)return {kind:'not_found'};
      parseAccountRecord(account);
      const live:PublicReadDecision=await new MongoPublicReleaseReader(this.db,this.now)
        .getCurrentPublicRelease({portfolioId:p.portfolioId,hostResolutionVerified:true});
      if(live.kind!=='allowed')return live.reason==='policy_unavailable'||live.reason==='unsupported_release'?
        {kind:'unavailable'}:{kind:'not_found'};
      // Current-owner and policy pointer must match the exact snapshot read by the live gate.
      if(live.activeReleaseId!==p.activeReleaseId||live.securityVersion!==p.securityVersion)
        return {kind:'unavailable'};
      if(!manifestIncludesRoute(live.release.manifest.enabledRoutes,route))return {kind:'not_found'};
      const currentClaim=await this.db.collection<SlugClaimRecord>('slugClaims').findOne({
        portfolioId:p.portfolioId,kind:'current'});
      if(!currentClaim||currentClaim.slugNormalized!==p.slug)return {kind:'unavailable'};
      // Recheck owner eligibility and current policy immediately before serialization.
      // A changed control is treated as unavailable, never served from the earlier snapshot.
      const finalOwner=await this.db.collection<AccountRecord>('accounts').findOne({
        accountId:p.ownerAccountId,status:'active'});
      const finalControl=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:p.portfolioId});
      if(!finalOwner||!finalControl)return {kind:'not_found'};
      const checked=parsePortfolioRecord(finalControl);
      if(checked.status!=='active'||checked.activeReleaseId!==live.activeReleaseId||
        checked.securityVersion!==live.securityVersion||checked.slug!==p.slug||
        checked.visibility!==live.visibility)return {kind:'unavailable'};
      const url=canonicalApexUrl(origin,parseCanonicalSlug(p.slug),route);
      if(claim.kind==='alias'||slug!==p.slug)return {kind:'redirect',location:url,status:308};
      return {kind:'allowed',portfolioId:p.portfolioId,slug:parseCanonicalSlug(p.slug),
        release:live.release,route,visibility:live.visibility,canonicalUrl:url,
        navigationPath:form==='subdomain'?route.path:`/${p.slug}${route.path==='/'?'':route.path}`,
        robots:live.visibility==='public'?'index':'noindex',securityVersion:live.securityVersion};
    }catch{return {kind:'unavailable'};}
  }
  async directory(origin:string,limit=20):Promise<PublicDirectoryItem[]>{
    if(!Number.isSafeInteger(limit)||limit<1||limit>20)throw new TenancyDenied('INVALID_COMMAND');
    try {
      const candidates=await this.db.collection<PortfolioRecord>('portfolios').find({
        status:'active',visibility:'public',activeReleaseId:{$ne:null}}).sort({createdAt:-1}).limit(limit*3).toArray();
      const result:PublicDirectoryItem[]=[];
      for(const raw of candidates){if(result.length>=limit)break;
        const p=parsePortfolioRecord(raw),route=parsePublicRoute('/');if(!route)continue;
        const pub=await this.resolvePublic(parseCanonicalSlug(p.slug),route,'path',origin);
        if(pub.kind!=='allowed'||pub.visibility!=='public')continue;
        const title=pub.release.seoArtifact.title;
        // Only release-compiled, explicitly public SEO title. Never private account metadata.
        if(typeof title!=='string'||title.length<1||title.length>160||/[<>\u0000-\u001f]/.test(title))continue;
        result.push({portfolioId:pub.portfolioId,slug:pub.slug,canonicalUrl:pub.canonicalUrl,
          title,releaseId:pub.release.releaseId});
      }
      return result;
    }catch{throw new TenancyDenied('UNAVAILABLE');}
  }
}
