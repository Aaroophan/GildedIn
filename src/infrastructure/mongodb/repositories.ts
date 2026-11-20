/** MongoDB-backed tenant repositories. All queries are constructed server-side with fixed names and
 * predicates; never pass through client Mongo filters, projections, operators or owner identifiers.
 */
import {createHash} from 'node:crypto';
import type {AccountId,PortfolioId,ReleaseId,MediaId,OperationId} from '../../shared/domain/identifiers.ts';
import {parsePortfolioId,parseReleaseId,parseOperationId} from '../../shared/domain/identifiers.ts';
import {canonicalJson,PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
import {assertSafeJsonValue,parseUtcTimestamp} from '../../shared/domain/validation.ts';
import type {VerifiedActor,VerifiedPublicPortfolio,PublicReadDecision,SaveDraftResult,ActivateResult,
  TenantRepositories,PublicReleaseReader,PublicationRepository,PrivacyRepositories} from '../../domain/persistence/ports.ts';
import type {PortfolioRecord,DraftRecord,ReleaseRecord,MediaRecord,PublishOperationRecord,
  ModerationPolicyRecord,ContactMessageRecord,AnalyticsDailyRecord} from '../../domain/persistence/models.ts';
import {isMongoDuplicateKey,PersistenceConflict,PersistenceUnavailable} from './driver.ts';
import type {MongoDatabase} from './driver.ts';
import {parsePortfolioRecord,parseDraftRecord,parseReleaseRecord,parseMediaRecord,
  parsePublishOperationRecord,parseModerationPolicyRecord,parseContactRecord,parseAnalyticsRecord} from './validation.ts';

function verified(actor:VerifiedActor):AccountId {
  if(!actor || actor.sessionVerified!==true || !Number.isSafeInteger(actor.securityVersion) || actor.securityVersion<0 ||
     typeof actor.accountId!=='string') throw new PersistenceUnavailable();
  return actor.accountId;
}
function checkedId(id:PortfolioId):PortfolioId {return parsePortfolioId(id);}
function sha256(data:string):string{return createHash('sha256').update(data).digest('hex');}
const activeOwnerStatuses=['onboarding','active','owner_disabled'] as const;
/** One server-private dependency may pass an actual official MongoDB driver `db` into these adapters. */
export class MongoTenantRepository implements TenantRepositories {
  private readonly db:MongoDatabase;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,now:()=>Date=()=>new Date()){this.db=db;this.now=now;}
  async getOwnedPortfolio(actor:VerifiedActor,id:PortfolioId):Promise<PortfolioRecord|null>{
    const ownerAccountId=verified(actor);
    const raw=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:checkedId(id),ownerAccountId,
      status:{$in:[...activeOwnerStatuses]}});
    return raw?parsePortfolioRecord(raw):null;
  }
  async getOwnedDraft(actor:VerifiedActor,id:PortfolioId):Promise<DraftRecord|null>{
    if(!await this.getOwnedPortfolio(actor,id))return null;
    const raw=await this.db.collection<DraftRecord>('drafts').findOne({portfolioId:checkedId(id)});
    return raw?parseDraftRecord(raw):null;
  }
  async compareAndSave(actor:VerifiedActor,id:PortfolioId,expectedRevision:number,
    clientMutationId:string,snapshot:Omit<DraftRecord,'revision'|'draftMutationId'|'draftMutationFingerprint'|'updatedAt'|'updatedBy'>):Promise<SaveDraftResult>{
    const owner=verified(actor);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||
      !/^[a-zA-Z0-9_-]{8,96}$/.test(clientMutationId))throw new PersistenceConflict();
    if(!await this.getOwnedPortfolio(actor,id))return {kind:'not_found'};
    if(snapshot.portfolioId!==id||snapshot.schemaVersion!==1)throw new PersistenceConflict();
    // Exact allowlist: no active pointer or control/role mutation can enter through a draft update.
    const required=new Set(['portfolioId','schemaVersion','rendererVersion','profile','sections','collectionDefinitions',
      'contentCollections','nodes','theme','navigation','seo','aiApprovals','mediaRefs','createdAt']);
    if(Object.keys(snapshot).length!==required.size || Object.keys(snapshot).some(k=>!required.has(k)))throw new PersistenceConflict();
    const content=canonicalJson(snapshot);
    if(Buffer.byteLength(content,'utf8')>512*1024)throw new PersistenceConflict();
    const fingerprint=sha256(content);
    const previousMutation=await this.db.collection<DraftRecord>('drafts').findOne({portfolioId:id,draftMutationId:clientMutationId});
    if(previousMutation){
      const previous=parseDraftRecord(previousMutation);
      if(previous.draftMutationFingerprint!==fingerprint)throw new PersistenceConflict();
      return {kind:'replayed',draft:previous};
    }
    const next:DraftRecord={...snapshot,revision:expectedRevision+1,
      draftMutationId:clientMutationId,draftMutationFingerprint:fingerprint,
      updatedAt:this.now().toISOString(),updatedBy:owner};
    parseDraftRecord(next);
    const raw=await this.db.collection<DraftRecord>('drafts').findOneAndUpdate({portfolioId:id,revision:expectedRevision},
      {$set:{...next}}, {returnDocument:'after'});
    if(raw)return {kind:'saved',draft:parseDraftRecord(raw)};
    const current=await this.db.collection<DraftRecord>('drafts').findOne({portfolioId:id});
    if(!current)return {kind:'not_found'};
    const stored=parseDraftRecord(current);
    if(stored.draftMutationId===clientMutationId){
      if(stored.draftMutationFingerprint!==fingerprint)throw new PersistenceConflict();
      return {kind:'replayed',draft:stored};
    }
    return {kind:'conflict'};
  }
  async listOwnedMedia(actor:VerifiedActor,id:PortfolioId,limit=30):Promise<MediaRecord[]>{
    if(!Number.isInteger(limit)||limit<1||limit>30)throw new PersistenceConflict();
    const owner=verified(actor);
    if(!await this.getOwnedPortfolio(actor,id))return [];
    const raw=await this.db.collection<MediaRecord>('mediaAssets').find({portfolioId:id,
      uploadedByAccountId:owner},{projection:{_id:0,stagingKey:0,verifiedOriginalKey:0}})
      .sort({createdAt:-1,mediaId:1}).limit(limit).toArray();
    // Projection intentionally excludes private keys; internal parser expects missing fields permitted.
    return raw.map(parseMediaRecord);
  }
  async getOwnedRelease(actor:VerifiedActor,id:PortfolioId,releaseId:ReleaseId):Promise<ReleaseRecord|null>{
    verified(actor);if(!await this.getOwnedPortfolio(actor,id))return null;
    const raw=await this.db.collection<ReleaseRecord>('releases').findOne({portfolioId:id,releaseId:parseReleaseId(releaseId)});
    return raw?parseReleaseRecord(raw):null;
  }
  /** Owner may only enable/disable own portfolio, not undo admin suspension/deletion. */
  async comparePolicy(actor:VerifiedActor,id:PortfolioId,expectedSecurityVersion:number,
    change:Pick<PortfolioRecord,'visibility'|'status'>):Promise<PortfolioRecord|null>{
    const owner=verified(actor);
    if(!['active','owner_disabled'].includes(change.status)||!['public','unlisted'].includes(change.visibility)||
      !Number.isSafeInteger(expectedSecurityVersion)||expectedSecurityVersion<0)throw new PersistenceConflict();
    const raw=await this.db.collection<PortfolioRecord>('portfolios').findOneAndUpdate({portfolioId:id,
      ownerAccountId:owner,status:{$in:['active','owner_disabled']},securityVersion:expectedSecurityVersion},
      {$set:{status:change.status,visibility:change.visibility,updatedAt:this.now().toISOString()},
        $inc:{securityVersion:1}}, {returnDocument:'after'});
    return raw?parsePortfolioRecord(raw):null;
  }
}

export class MongoPublicReleaseReader implements PublicReleaseReader {
  private readonly db:MongoDatabase;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,now:()=>Date=()=>new Date()){this.db=db;this.now=now;}
  async getCurrentPublicRelease(identity:VerifiedPublicPortfolio):Promise<PublicReadDecision>{
    if(identity?.hostResolutionVerified!==true)return {kind:'denied',reason:'policy_unavailable'};
    try{
      const id=checkedId(identity.portfolioId);
      const controlRaw=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:id});
      if(!controlRaw)return {kind:'denied',reason:'missing'};
      const p=parsePortfolioRecord(controlRaw);
      if(p.status!=='active'||!p.activeReleaseId)return {kind:'denied',reason:'no_active_release'};
      // Must consult current moderation. Failure is denial, not an excuse to use cached content.
      const restrictions=await this.db.collection<ModerationPolicyRecord>('moderationPolicies')
        .find({portfolioId:id,active:true},{projection:{_id:0}}).sort({issuedAt:-1}).limit(101).toArray();
      if(restrictions.length>100)return {kind:'denied',reason:'policy_unavailable'};
      for(const raw of restrictions){const m=parseModerationPolicyRecord(raw);
        if(!m.expiresAt||m.expiresAt>this.now()){
          // Item-level masking belongs to the semantic release renderer (Issue 14); until then deny all.
          if(m.effect==='deny_public'||m.effect==='quarantine'||m.effect==='suspend')return {kind:'denied',reason:'suppressed'};
        }
      }
      const release=await this.db.collection<ReleaseRecord>('releases').findOne({portfolioId:id,releaseId:p.activeReleaseId});
      if(!release)return {kind:'denied',reason:'unsupported_release'};
      const ready=parseReleaseRecord(release);
      return {kind:'allowed',portfolioId:id,activeReleaseId:p.activeReleaseId,
        release:ready,securityVersion:p.securityVersion,visibility:p.visibility};
    }catch{return {kind:'denied',reason:'policy_unavailable'};}
  }
}

export class MongoPublicationRepository implements PublicationRepository {
  private readonly db:MongoDatabase;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,now:()=>Date=()=>new Date()){this.db=db;this.now=now;}
  private async owned(actor:VerifiedActor,id:PortfolioId):Promise<PortfolioRecord|null>{
    return new MongoTenantRepository(this.db,this.now).getOwnedPortfolio(actor,id);
  }
  async createOperation(actor:VerifiedActor,source:PublishOperationRecord):Promise<{kind:'created'|'existing';operation:PublishOperationRecord}>{
    const owner=verified(actor);const row=parsePublishOperationRecord(source);
    if(row.ownerAccountId!==owner||!await this.owned(actor,row.portfolioId))throw new PersistenceConflict();
    const coll=this.db.collection<PublishOperationRecord>('publishOperations');
    try{await coll.insertOne(row);return {kind:'created',operation:row};}catch(e){if(!isMongoDuplicateKey(e))throw e;}
    const existing=await coll.findOne({portfolioId:row.portfolioId,idempotencyKeyHash:row.idempotencyKeyHash,ownerAccountId:owner});
    if(!existing)throw new PersistenceConflict();
    const same=parsePublishOperationRecord(existing);
    if(same.requestFingerprint!==row.requestFingerprint||same.draftRevision!==row.draftRevision)
      throw new PersistenceConflict();
    return {kind:'existing',operation:same};
  }
  async getOperation(actor:VerifiedActor,id:PortfolioId,keyHash:string):Promise<PublishOperationRecord|null>{
    const owner=verified(actor);
    if(!/^[a-f0-9]{64}$/.test(keyHash)||!await this.owned(actor,id))return null;
    const raw=await this.db.collection<PublishOperationRecord>('publishOperations').findOne({
      portfolioId:id,ownerAccountId:owner,idempotencyKeyHash:keyHash});
    return raw?parsePublishOperationRecord(raw):null;
  }
  async insertPrepared(actor:VerifiedActor,release:ReleaseRecord):Promise<{kind:'created'|'existing'|'conflict';release?:ReleaseRecord}>{
    verified(actor);const safe=parseReleaseRecord(release);
    const portfolio=await this.owned(actor,safe.portfolioId);
    if(!portfolio||portfolio.status!=='active'||safe.sequence!==portfolio.publishSequence+1)
      return {kind:'conflict'};
    const operation=await this.db.collection<PublishOperationRecord>('publishOperations').findOne({
      portfolioId:safe.portfolioId,ownerAccountId:actor.accountId,operationId:safe.publicationOperationId,
      stage:{$in:['received','validating','preparing','prepared','activating']}});
    if(!operation)return {kind:'conflict'};
    const parsed=parsePublishOperationRecord(operation);
    if(parsed.draftRevision!==safe.createdFromDraftRevision||
       parsed.expectedPreviousReleaseId!==portfolio.activeReleaseId)return {kind:'conflict'};
    try{await this.db.collection<ReleaseRecord>('releases').insertOne(safe);
      await this.db.collection<PublishOperationRecord>('publishOperations').updateOne({
        operationId:safe.publicationOperationId,portfolioId:safe.portfolioId,ownerAccountId:actor.accountId},
        {$set:{stage:'prepared',preparedReleaseId:safe.releaseId,updatedAt:this.now().toISOString()}});
      return {kind:'created',release:safe};}
    catch(e){if(!isMongoDuplicateKey(e))throw e;}
    const existing=await this.db.collection<ReleaseRecord>('releases').findOne({
      portfolioId:safe.portfolioId,releaseId:safe.releaseId});
    if(existing){const parsedRelease=parseReleaseRecord(existing);
      if(parsedRelease.publicationOperationId===safe.publicationOperationId&&parsedRelease.contentHash===safe.contentHash){
        await this.db.collection<PublishOperationRecord>('publishOperations').updateOne({
          operationId:safe.publicationOperationId,portfolioId:safe.portfolioId,ownerAccountId:actor.accountId},
          {$set:{stage:'prepared',preparedReleaseId:safe.releaseId,updatedAt:this.now().toISOString()}});
        return {kind:'existing',release:parsedRelease};
      }}
    return {kind:'conflict'}; // Prepared sequence occupied by another op: conservative blocking, never leak.
  }
  async activate(actor:VerifiedActor,p:{portfolioId:PortfolioId;operationId:OperationId;releaseId:ReleaseId;
    expectedActiveReleaseId:ReleaseId|null;expectedSecurityVersion:number;expectedPublishSequence:number}):Promise<ActivateResult>{
    const owner=verified(actor);parseOperationId(p.operationId);parseReleaseId(p.releaseId);
    const portfolio=await this.owned(actor,p.portfolioId);if(!portfolio)return {kind:'not_found'};
    // Lost response after CAS: authoritative pointer/marker wins, never re-activate or duplicate release.
    if(portfolio.activeReleaseId===p.releaseId&&portfolio.lastActivatedOperationId===p.operationId)
      return {kind:'already_activated',portfolio};
    if(portfolio.status!=='active'||portfolio.publishSequence!==p.expectedPublishSequence||
      portfolio.securityVersion!==p.expectedSecurityVersion||portfolio.activeReleaseId!==p.expectedActiveReleaseId)
      return {kind:'conflict'};
    const operationRaw=await this.db.collection<PublishOperationRecord>('publishOperations').findOne({
      operationId:p.operationId,portfolioId:p.portfolioId,ownerAccountId:owner});
    if(!operationRaw)return {kind:'not_ready'};
    const operation=parsePublishOperationRecord(operationRaw);
    if(!['prepared','activating'].includes(operation.stage)||operation.preparedReleaseId!==p.releaseId||
      operation.expectedPreviousReleaseId!==p.expectedActiveReleaseId)return {kind:'not_ready'};
    const releaseRaw=await this.db.collection<ReleaseRecord>('releases').findOne({
      portfolioId:p.portfolioId,releaseId:p.releaseId,publicationOperationId:p.operationId,
      sequence:p.expectedPublishSequence+1});
    if(!releaseRaw)return {kind:'not_ready'};
    parseReleaseRecord(releaseRaw); // reject invalid hash/unsupported serializer/version
    try{
      const moderations=await this.db.collection<ModerationPolicyRecord>('moderationPolicies').find({
        portfolioId:p.portfolioId,active:true}).sort({issuedAt:-1}).limit(101).toArray();
      if(moderations.length>100)return {kind:'unavailable'};
      for(const m of moderations){const policy=parseModerationPolicyRecord(m);
        if(!policy.expiresAt||policy.expiresAt>this.now())return {kind:'conflict'};}
    }catch{return {kind:'unavailable'};}
    const raw=await this.db.collection<PortfolioRecord>('portfolios').findOneAndUpdate({
      portfolioId:p.portfolioId,ownerAccountId:owner,status:'active',
      activeReleaseId:p.expectedActiveReleaseId,securityVersion:p.expectedSecurityVersion,
      publishSequence:p.expectedPublishSequence},
      {$set:{activeReleaseId:p.releaseId,lastActivatedOperationId:p.operationId,updatedAt:this.now().toISOString()},
       $inc:{publishSequence:1}}, {returnDocument:'after'});
    if(!raw){const current=await this.owned(actor,p.portfolioId);
      if(current?.activeReleaseId===p.releaseId&&current.lastActivatedOperationId===p.operationId)
        return {kind:'already_activated',portfolio:current};
      return {kind:'conflict'};}
    // Operation status update is a recoverable journal side effect. NEVER roll back the pointer if it fails.
    try{await this.db.collection<PublishOperationRecord>('publishOperations').updateOne({
      operationId:p.operationId,portfolioId:p.portfolioId,ownerAccountId:owner},
      {$set:{stage:'activated',activatedReleaseId:p.releaseId,updatedAt:this.now().toISOString()}});}catch{}
    return {kind:'activated',portfolio:parsePortfolioRecord(raw)};
  }
}

export class MongoPrivacyRepository implements PrivacyRepositories {
  private readonly db:MongoDatabase;
  constructor(db:MongoDatabase){this.db=db;}
  private owner(actor:VerifiedActor,id:PortfolioId){return new MongoTenantRepository(this.db).getOwnedPortfolio(actor,id);}
  async listOwnedUnexpiredContact(actor:VerifiedActor,id:PortfolioId,now:Date,limit=20):Promise<ContactMessageRecord[]>{
    verified(actor);if(!this.safeLimit(limit,20)||!await this.owner(actor,id))return [];
    const rows=await this.db.collection<ContactMessageRecord>('contactMessages').find({
      portfolioId:id,expiresAt:{$gt:now},status:{$ne:'deleted'}})
      .sort({receivedAt:-1,messageId:1}).limit(limit).toArray();
    return rows.map(parseContactRecord).filter(r=>r.expiresAt>now);
  }
  async getOwnedUnexpiredContact(actor:VerifiedActor,id:PortfolioId,messageId:string,now:Date):Promise<ContactMessageRecord|null>{
    verified(actor);if(!await this.owner(actor,id)||!/^.{1,100}$/.test(messageId))return null;
    const row=await this.db.collection<ContactMessageRecord>('contactMessages').findOne({
      portfolioId:id,messageId,expiresAt:{$gt:now},status:{$ne:'deleted'}});
    if(!row)return null;const message=parseContactRecord(row);return message.expiresAt>now?message:null;
  }
  async readAggregate(actor:VerifiedActor,id:PortfolioId,day:string):Promise<AnalyticsDailyRecord[]>{
    verified(actor);if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!await this.owner(actor,id))return [];
    const raw=await this.db.collection<AnalyticsDailyRecord>('analyticsDaily').find({portfolioId:id,day})
      .sort({metricKey:1,targetId:1}).limit(50).toArray();
    return raw.map(parseAnalyticsRecord);
  }
  private safeLimit(n:number,max:number){if(!Number.isSafeInteger(n)||n<1||n>max)throw new PersistenceConflict();return true;}
}
