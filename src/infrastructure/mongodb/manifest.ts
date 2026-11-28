/** Reviewed fixed MongoDB namespaces and index/validator declarations per spec 05 §6, §21.
 * Never pass a collection name from a user's custom schema or an HTTP request.
 */
import type {MongoDatabase,MongoFilter} from './driver.ts';
export const MONGO_COLLECTIONS = [
  'accounts','providerIdentities','sessions','portfolios','slugClaims','renameOperations','drafts','releases',
  'publishOperations','mediaAssets','uploadReservations','quotaBuckets','aiContexts',
  'contactMessages','analyticsDaily','moderationPolicies','abuseReports','auditEvents',
  'externalFeeds','deletionOperations','authLinkIntents','authOAuthExchanges',
] as const;
export type MongoCollectionName = typeof MONGO_COLLECTIONS[number];
export interface IndexSpec {readonly collection:MongoCollectionName;readonly name:string;
  readonly keys:Readonly<Record<string,1|-1>>;readonly unique?:boolean;
  readonly expireAfterSeconds?:0;readonly partialFilterExpression?:MongoFilter;}
const idx=(collection:MongoCollectionName,name:string,keys:Record<string,1|-1>,opt:Partial<IndexSpec>={}):IndexSpec=>({collection,name,keys,...opt});
export const INDEX_MANIFEST:readonly IndexSpec[] = Object.freeze([
  idx('accounts','uq_account_id',{accountId:1},{unique:true}),
  idx('providerIdentities','uq_provider_subject',{provider:1,providerSubject:1},{unique:true}),
  idx('providerIdentities','ix_provider_account',{accountId:1}),
  idx('sessions','uq_session_lookup',{sessionLookupId:1},{unique:true}),
  idx('authLinkIntents','uq_link_intent_hash',{intentHash:1},{unique:true}),
  idx('authLinkIntents','ix_link_actor',{accountId:1,sessionLookupId:1,state:1}),
  idx('authOAuthExchanges','uq_oauth_exchange',{oauthHash:1},{unique:true}),
  idx('authOAuthExchanges','ttl_oauth_exchange',{expiresAt:1},{expireAfterSeconds:0}),
  idx('authLinkIntents','ttl_link_intent',{expiresAt:1},{expireAfterSeconds:0}),
  idx('sessions','ttl_sessions',{expiresAt:1},{expireAfterSeconds:0}),
  idx('portfolios','uq_portfolio_id',{portfolioId:1},{unique:true}),
  idx('portfolios','uq_single_owner_portfolio',{ownerAccountId:1},{unique:true}),
  idx('portfolios','ix_public_discovery',{status:1,visibility:1,createdAt:-1}),
  idx('slugClaims','uq_slug_all_claims',{slugNormalized:1},{unique:true}),
  idx('slugClaims','ix_slug_owner_kind',{portfolioId:1,kind:1}),
  idx('renameOperations','uq_rename_key',{portfolioId:1,idempotencyHash:1},{unique:true}),
  idx('slugClaims','uq_one_current_claim',{portfolioId:1,kind:1},{unique:true,partialFilterExpression:{kind:'current'}}),
  idx('drafts','uq_draft_portfolio',{portfolioId:1},{unique:true}),
  idx('releases','uq_release_id',{releaseId:1},{unique:true}),
  idx('releases','uq_release_sequence',{portfolioId:1,sequence:-1},{unique:true}),
  idx('releases','uq_release_scope',{portfolioId:1,releaseId:1},{unique:true}),
  idx('publishOperations','uq_publish_key',{portfolioId:1,idempotencyKeyHash:1},{unique:true}),
  idx('publishOperations','uq_publish_operation',{operationId:1},{unique:true}),
  idx('mediaAssets','uq_media_id',{mediaId:1},{unique:true}),
  idx('mediaAssets','ix_owned_media_state',{portfolioId:1,state:1}),
  idx('uploadReservations','uq_reservation_id',{reservationId:1},{unique:true}),
  // DO NOT TTL raw expiresAt: quota lease must be reconciled first; only terminal purgeAfter is TTL safe.
  idx('uploadReservations','ttl_reconciled_reservations',{purgeAfter:1},{expireAfterSeconds:0}),
  idx('quotaBuckets','uq_quota_bucket',{bucketId:1},{unique:true}),
  idx('aiContexts','uq_ai_context_policy',{portfolioId:1,releaseId:1,approvalPolicyVersion:1},{unique:true}),
  idx('contactMessages','uq_contact_id',{messageId:1},{unique:true}),
  idx('contactMessages','ix_contact_inbox',{portfolioId:1,expiresAt:1,receivedAt:-1}),
  idx('contactMessages','ttl_contact_30_day',{expiresAt:1},{expireAfterSeconds:0}),
  idx('analyticsDaily','uq_daily_metric',{portfolioId:1,day:1,metricKey:1,targetId:1},{unique:true}),
  idx('moderationPolicies','uq_moderation_id',{policyId:1},{unique:true}),
  idx('moderationPolicies','ix_live_moderation',{portfolioId:1,active:1}),
  idx('abuseReports','uq_abuse_report',{reportId:1},{unique:true}),
  idx('abuseReports','ix_abuse_queue',{status:1,createdAt:-1}),
  idx('auditEvents','uq_audit_event',{eventId:1},{unique:true}),
  idx('auditEvents','uq_audit_operation_kind',{operationId:1,kind:1},{unique:true}),
  idx('auditEvents','ttl_audit',{expiresAt:1},{expireAfterSeconds:0}),
  idx('externalFeeds','uq_one_feed_owner',{portfolioId:1},{unique:true}),
  idx('deletionOperations','uq_deletion_operation',{operationId:1},{unique:true}),
  idx('deletionOperations','ix_deletion_owner',{accountId:1,stage:1}),
]);

// Data-level validators protect against accidental bypass of app parsers; they cannot enforce all
// cross-document ownership/cas/release compiler invariants. Those remain repository-level requirements.
const str=(max=200)=>({bsonType:'string',minLength:1,maxLength:max});
const number=()=>({bsonType:['int','long','double','decimal'],minimum:0});
const utc=str(35);
const date={bsonType:'date'};
const uuid=str(36);
const record=(required:readonly string[],properties:Record<string,unknown>,extra=false)=>({
  bsonType:'object',required:[...required],additionalProperties:extra,
  properties:{_id:{},...properties,schemaVersion:{enum:[1]}},
});
const fixedRecord=(required:readonly string[],properties:Record<string,unknown>)=>record(required,properties);
const reusable={portfolioId:uuid,accountId:uuid,createdAt:utc,updatedAt:utc};
export const COLLECTION_SCHEMAS:Readonly<Partial<Record<MongoCollectionName,Record<string,unknown>>>> = {
  accounts:fixedRecord(['accountId','status','displayName','platformRoles','securityVersion','schemaVersion'],{
    accountId:uuid,status:{enum:['active','suspended','deleting']},displayName:str(180),preferredLocale:{enum:['en']},
    platformRoles:{bsonType:'array',maxItems:2,items:{enum:['user','admin']}},securityVersion:number(),
    verifiedEmail:str(254),emailVerifiedAt:utc,createdAt:utc,updatedAt:utc,deletingAt:utc,lastSensitiveAuthAt:utc}),
  providerIdentities:fixedRecord(['identityId','accountId','provider','providerSubject','schemaVersion'],{
    identityId:str(100),accountId:uuid,provider:{enum:['google','github']},providerSubject:str(200),issuer:str(300),linkedAt:utc}),
  sessions:fixedRecord(['sessionId','accountId','sessionLookupId','verifierHash','expiresAt','schemaVersion'],{
    sessionId:str(100),accountId:uuid,sessionLookupId:str(160),verifierHash:str(160),securityVersion:number(),
    expiresAt:date,revokedAt:date,createdAt:date,authenticatedAt:date,lastSeenAt:date,
    idleExpiresAt:date,absoluteExpiresAt:date,authProvider:{enum:['google','github']},csrfProofHash:str(64)}),
  portfolios:fixedRecord(['portfolioId','ownerAccountId','slug','status','visibility','securityVersion','schemaVersion'],{
    portfolioId:uuid,ownerAccountId:uuid,slug:str(30),displayHandle:str(100),
    status:{enum:['onboarding','active','owner_disabled','suspended','deleting']},
    visibility:{enum:['public','unlisted']},activeReleaseId:{bsonType:['null','string']},
    publishSequence:number(),securityVersion:number(),lastActivatedOperationId:uuid,
    aiAccess:{bsonType:'object'},quotaSummary:{bsonType:'object'},publicStatisticsEnabled:{bsonType:'bool'},
    creationIdempotencyHash:str(64),creationRequestFingerprint:str(64),
    lastRenameRequestHash:str(64),lastRenameTargetSlug:str(30),createdAt:utc,updatedAt:utc}),
  slugClaims:fixedRecord(['slugNormalized','portfolioId','kind','claimedAt','schemaVersion'],{
    slugNormalized:str(30),portfolioId:uuid,kind:{enum:['current','alias','reserved']},claimedAt:utc,retiredAt:utc,redirectStatus:{enum:[308]}}),
  renameOperations:fixedRecord(['operationId','portfolioId','ownerAccountId','idempotencyHash','requestFingerprint','fromSlug','toSlug','createdAt','schemaVersion'],{
    operationId:uuid,portfolioId:uuid,ownerAccountId:uuid,idempotencyHash:str(64),requestFingerprint:str(64),
    fromSlug:str(30),toSlug:str(30),createdAt:utc}),
  drafts:fixedRecord(['portfolioId','revision','profile','sections','contentCollections','nodes','schemaVersion'],{
    portfolioId:uuid,revision:number(),rendererVersion:str(80),draftMutationId:str(96),
    draftMutationFingerprint:str(64),profile:{bsonType:'object'},sections:{bsonType:'array',maxItems:100},
    collectionDefinitions:{bsonType:'array',maxItems:100},contentCollections:{bsonType:'array',maxItems:100},
    nodes:{bsonType:'array',maxItems:20},theme:{bsonType:'object'},navigation:{bsonType:'object'},
    seo:{bsonType:'object'},aiApprovals:{bsonType:'object'},mediaRefs:{bsonType:'array',maxItems:30},
    createdAt:utc,updatedAt:utc,updatedBy:uuid}),
  releases:fixedRecord(['releaseId','portfolioId','sequence','publicationOperationId','contentHash','canonicalPayloadBytes','payload','schemaVersion'],{
    releaseId:uuid,portfolioId:uuid,sequence:number(),publicationOperationId:uuid,
    createdFromDraftRevision:number(),createdAt:utc,rendererVersion:str(80),
    blockRegistryVersion:str(80),serializerVersion:str(80),contentHash:str(64),
    canonicalPayloadBytes:{bsonType:'int',minimum:0,maximum:102400},payload:{bsonType:'object'},
    mediaRefs:{bsonType:'array',maxItems:30},searchArtifact:{bsonType:'object'},
    seoArtifact:{bsonType:'object'},manifest:{bsonType:'object'}}),
  publishOperations:fixedRecord(['operationId','portfolioId','ownerAccountId','idempotencyKeyHash','requestFingerprint','stage','schemaVersion'],{
    operationId:uuid,portfolioId:uuid,ownerAccountId:uuid,idempotencyKeyHash:str(64),
    requestFingerprint:str(64),draftRevision:number(),expectedPreviousReleaseId:{bsonType:['null','string']},
    stage:str(40),preparedReleaseId:uuid,activatedReleaseId:uuid,attemptedAt:utc,updatedAt:utc,
    attemptCount:number(),finishedAt:utc,retryAfter:utc,errorCode:str(80),lease:{bsonType:'object'}}),
  mediaAssets:fixedRecord(['mediaId','portfolioId','uploadedByAccountId','state','kind','variants','schemaVersion'],{
    mediaId:uuid,portfolioId:uuid,uploadedByAccountId:uuid,state:str(40),kind:{enum:['image','resume_pdf']},
    declaredMimeType:str(80),verifiedMimeType:str(80),bytesOriginal:number(),sha256:str(64),
    stagingKey:str(300),verifiedOriginalKey:str(300),variants:{bsonType:'array',maxItems:12},
    createdAt:utc,verifiedAt:utc,publishedAt:utc,deleteRequestedAt:utc,rejectionCode:str(80),
    originalNameDisplay:str(200),image:{bsonType:'object'},pdf:{bsonType:'object'}}),
  uploadReservations:fixedRecord(['reservationId','portfolioId','accountId','mediaId','state','expiresAt','schemaVersion'],{
    reservationId:uuid,...reusable,mediaId:uuid,intendedKind:{enum:['image','resume_pdf']},claimedBytes:number(),
    quotaBytesReserved:number(),state:str(40),expiresAt:date,purgeAfter:date,idempotencyHash:str(64)}),
  quotaBuckets:fixedRecord(['bucketId','revision','global','portfolios','leases','schemaVersion'],{
    bucketId:{enum:['global:media']},revision:number(),capacityBytes:number(),
    global:{bsonType:'object'},portfolios:{bsonType:'object'},leases:{bsonType:'object'},updatedAt:utc}),
  aiContexts:fixedRecord(['contextId','portfolioId','releaseId','approvalPolicyVersion','sources','schemaVersion'],{
    contextId:str(100),portfolioId:uuid,releaseId:uuid,approvalPolicyVersion:number(),
    contentHash:str(64),status:str(40),sources:{bsonType:'array',maxItems:200},createdAt:utc,expiresAt:date}),
  contactMessages:fixedRecord(['messageId','portfolioId','receivedAt','expiresAt','sender','body','schemaVersion'],{
    messageId:str(100),portfolioId:uuid,receivedAt:utc,expiresAt:date,sender:{bsonType:'object'},
    body:str(10000),subject:str(200),consentNoticeVersion:str(80),status:{enum:['new','read','flagged','deleted']},
    antiAbuse:{bsonType:'object'}}),
  analyticsDaily:fixedRecord(['portfolioId','day','metricKey','count','schemaVersion'],{
    portfolioId:uuid,day:str(10),metricKey:str(40),targetId:str(100),count:number(),updatedAt:utc}),
  moderationPolicies:fixedRecord(['policyId','portfolioId','scope','effect','active','securityVersion','schemaVersion'],{
    policyId:str(100),portfolioId:uuid,scope:str(30),targetId:str(160),effect:str(40),reasonCode:str(80),
    issuedByAdminAccountId:uuid,active:{bsonType:'bool'},issuedAt:utc,liftedAt:utc,expiresAt:date,securityVersion:number(),
    internalNoteRef:str(160)}),
  abuseReports:fixedRecord(['reportId','portfolioId','status','createdAt','schemaVersion'],{
    reportId:str(100),portfolioId:uuid,status:str(40),reasonCode:str(80),createdAt:utc,expiresAt:date}),
  auditEvents:fixedRecord(['eventId','operationId','kind','accountId','createdAt','expiresAt','schemaVersion'],{
    eventId:str(100),operationId:uuid,kind:str(50),accountId:uuid,portfolioId:uuid,
    createdAt:date,expiresAt:date,result:str(40),reasonCode:str(80)}),
  externalFeeds:fixedRecord(['feedId','portfolioId','provider','state','schemaVersion'],{
    feedId:str(100),portfolioId:uuid,provider:str(50),state:str(40),updatedAt:utc,expiresAt:date,
    previews:{bsonType:'array',maxItems:20}}),
  deletionOperations:fixedRecord(['operationId','accountId','stage','schemaVersion'],{
    operationId:uuid,accountId:uuid,stage:str(40),updatedAt:utc}),
  authLinkIntents:fixedRecord(['intentHash','accountId','sessionLookupId','provider','state','expiresAt','schemaVersion'],{
    intentHash:str(64),accountId:uuid,sessionLookupId:str(160),provider:{enum:['google','github']},
    state:{enum:['issued','consumed']},createdAt:date,expiresAt:date,consumedAt:date}),
  authOAuthExchanges:fixedRecord(['oauthHash','accountId','provider','createdAt','expiresAt','schemaVersion'],{
    oauthHash:str(64),accountId:uuid,provider:{enum:['google','github']},createdAt:date,expiresAt:date}),
};

/** Explicit manual migration only. Caller has already run test-mode/local preflight and has review approval.
 * Never call this from an HTTP request or application startup in production.
 */
export async function applyMongoSchemaAndIndexes(db:MongoDatabase,approvedLocalMigration:boolean):Promise<void>{
  if(!approvedLocalMigration)throw new Error('MONGODB_MIGRATION_APPROVAL_REQUIRED');
  if(!db.createCollection||!db.listCollections||!db.command)throw new Error('MONGODB_ADMIN_ADAPTER_MISSING');
  const existing=new Set((await db.listCollections({}).toArray()).map(c=>c.name));
  for(const name of MONGO_COLLECTIONS){
    const validator={$jsonSchema:COLLECTION_SCHEMAS[name]};
    if(!existing.has(name))await db.createCollection(name,{validator,validationAction:'error',validationLevel:'strict'});
    else await db.command({collMod:name,validator,validationAction:'error',validationLevel:'strict'});
  }
  for(const spec of INDEX_MANIFEST){
    await db.collection(spec.collection).createIndex(spec.keys,{name:spec.name,
      ...(spec.unique?{unique:true}:{}),
      ...(spec.expireAfterSeconds===0?{expireAfterSeconds:0}:{}),
      ...(spec.partialFilterExpression?{partialFilterExpression:spec.partialFilterExpression}:{})});
  }
}
