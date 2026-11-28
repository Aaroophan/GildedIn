import {createHash} from 'node:crypto';
import {parseAccountId,parsePortfolioId,parseReleaseId,parseMediaId,parseOperationId} from '../../shared/domain/identifiers.ts';
import {assertPlainCommand,assertSafeJsonValue,parseCanonicalSlug,parseUtcTimestamp,parseBoundedText} from '../../shared/domain/validation.ts';
import {canonicalJson,PRODUCT_LIMITS,validatePublishedByteCount} from '../../shared/domain/limits.ts';
import {PersistedRecordRejected} from './driver.ts';
import type {AccountRecord,PortfolioRecord,DraftRecord,ReleaseRecord,MediaRecord,PublishOperationRecord,
  ModerationPolicyRecord,ContactMessageRecord,AnalyticsDailyRecord,AIContextRecord} from '../../domain/persistence/models.ts';

const ids={account:parseAccountId,portfolio:parsePortfolioId,release:parseReleaseId,media:parseMediaId,operation:parseOperationId};
function obj(v:unknown,keys:readonly string[]):Record<string,unknown>{
  if(!v||typeof v!=='object'||Array.isArray(v))throw new PersistedRecordRejected();
  const r=assertPlainCommand(v,new Set([...keys,'_id']));
  const {_id:omit,...output}=r;void omit;return output;
}
const version=(r:Record<string,unknown>)=>{if(r.schemaVersion!==1)throw new PersistedRecordRejected();};
const integer=(x:unknown,max=Number.MAX_SAFE_INTEGER)=>{if(typeof x!=='number'||!Number.isSafeInteger(x)||x<0||x>max)throw new PersistedRecordRejected();return x;};
const bool=(x:unknown)=>{if(typeof x!=='boolean')throw new PersistedRecordRejected();};
const text=(x:unknown,max=200)=>parseBoundedText(x,max);
const date=(x:unknown)=>{if(!(x instanceof Date)||!Number.isFinite(x.valueOf()))throw new PersistedRecordRejected();};
function en<T extends string>(v:unknown,values:readonly T[]):T{
  if(typeof v!=='string'||!values.includes(v as T))throw new PersistedRecordRejected();return v as T;
}
const array=(x:unknown,max:number)=>{if(!Array.isArray(x)||x.length>max)throw new PersistedRecordRejected();return x as unknown[];};
const utc=(v:unknown)=>parseUtcTimestamp(v);
function validateSafeDraftNested(data:Record<string,unknown>){
  for(const key of ['profile','theme','navigation','seo','aiApprovals'])obj(data[key],Object.keys((data[key]??{}) as object));
  for(const key of ['sections','collectionDefinitions','contentCollections','nodes'])array(data[key],key==='nodes'?20:100);
  array(data.mediaRefs,PRODUCT_LIMITS.originalMediaFilesPerPortfolio).forEach(parseMediaId);
  // Full bounded data engine authoring schemas arrive in Issue 6; reject unsafe JSON now.
  for(const key of ['profile','sections','collectionDefinitions','contentCollections','nodes','theme','navigation','seo','aiApprovals'])
    assertSafeJsonValue(data[key],16);
  // Snapshot transport has its own bound; the 100 KiB public limit applies to RELEASE only.
  if(Buffer.byteLength(canonicalJson({profile:data.profile,sections:data.sections,
    collectionDefinitions:data.collectionDefinitions,contentCollections:data.contentCollections,nodes:data.nodes,
    theme:data.theme,navigation:data.navigation,seo:data.seo,aiApprovals:data.aiApprovals}), 'utf8')>512*1024)
    throw new PersistedRecordRejected();
}

/** Strict allowlist decoders at the repository boundary; never forward BSON or unknown control keys. */
export function parseAccountRecord(raw:unknown):AccountRecord{
  try{const r=obj(raw,['accountId','status','displayName','preferredLocale','verifiedEmail','emailVerifiedAt',
    'platformRoles','securityVersion','lastSensitiveAuthAt','createdAt','updatedAt','deletingAt','schemaVersion']);version(r);
    ids.account(r.accountId);en(r.status,['active','suspended','deleting']);text(r.displayName,180);
    if(r.preferredLocale!=='en')throw new Error();
    const roles=array(r.platformRoles,2);if(roles.length===0||new Set(roles).size!==roles.length)throw new Error();
    roles.forEach(x=>en(x,['user','admin']));integer(r.securityVersion);utc(r.createdAt);utc(r.updatedAt);
    if(r.verifiedEmail!==undefined)text(r.verifiedEmail,254);
    for(const k of ['emailVerifiedAt','lastSensitiveAuthAt','deletingAt'])if(r[k]!==undefined)utc(r[k]);
    return r as unknown as AccountRecord;}catch{throw new PersistedRecordRejected();}
}
export function parsePortfolioRecord(raw:unknown):PortfolioRecord{
  try{const r=obj(raw,['portfolioId','ownerAccountId','slug','displayHandle','status','visibility','activeReleaseId',
    'publishSequence','securityVersion','lastActivatedOperationId','aiAccess','publicStatisticsEnabled',
    'quotaSummary','creationIdempotencyHash','creationRequestFingerprint','lastRenameRequestHash','lastRenameTargetSlug','createdAt','updatedAt','schemaVersion']);version(r);
    ids.portfolio(r.portfolioId);ids.account(r.ownerAccountId);
    if(parseCanonicalSlug(r.slug)!==r.slug)throw new Error();text(r.displayHandle,100);
    en(r.status,['onboarding','active','owner_disabled','suspended','deleting']);en(r.visibility,['public','unlisted']);
    if(r.activeReleaseId!==null)ids.release(r.activeReleaseId);
    integer(r.publishSequence);integer(r.securityVersion);
    if(r.lastActivatedOperationId!==undefined)ids.operation(r.lastActivatedOperationId);
    const ai=obj(r.aiAccess,['enabled','revocationVersion','deniedSourceIds','disabledAt']);
    bool(ai.enabled);integer(ai.revocationVersion);
    array(ai.deniedSourceIds,100).forEach(v=>text(v,160));
    if(ai.disabledAt!==undefined)utc(ai.disabledAt);
    const quota=obj(r.quotaSummary,['originalFileCount','usedBytes','reservedBytes']);
    integer(quota.originalFileCount,PRODUCT_LIMITS.originalMediaFilesPerPortfolio);
    integer(quota.usedBytes,PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio);
    integer(quota.reservedBytes,PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio);
    for(const hashKey of ['creationIdempotencyHash','creationRequestFingerprint','lastRenameRequestHash'])
      if(r[hashKey]!==undefined && !/^[a-f0-9]{64}$/.test(String(r[hashKey])))throw new Error();
    if(r.lastRenameTargetSlug!==undefined && parseCanonicalSlug(r.lastRenameTargetSlug)!==r.lastRenameTargetSlug)throw new Error();
    bool(r.publicStatisticsEnabled);utc(r.createdAt);utc(r.updatedAt);
    return r as unknown as PortfolioRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseDraftRecord(raw:unknown):DraftRecord{
  try{const r=obj(raw,['portfolioId','revision','schemaVersion','rendererVersion','draftMutationId',
    'draftMutationFingerprint','profile','sections','collectionDefinitions','contentCollections','nodes',
    'theme','navigation','seo','aiApprovals','mediaRefs','createdAt','updatedAt','updatedBy']);version(r);
    ids.portfolio(r.portfolioId);ids.account(r.updatedBy);integer(r.revision);text(r.rendererVersion,40);
    if(r.draftMutationId!==undefined)text(r.draftMutationId,96);
    if(r.draftMutationFingerprint!==undefined&&!/^[a-f0-9]{64}$/.test(String(r.draftMutationFingerprint)))throw new Error();
    utc(r.createdAt);utc(r.updatedAt);validateSafeDraftNested(r);return r as unknown as DraftRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseReleaseRecord(raw:unknown):ReleaseRecord{
  try{const r=obj(raw,['releaseId','portfolioId','sequence','publicationOperationId','createdFromDraftRevision',
    'createdAt','schemaVersion','rendererVersion','blockRegistryVersion','serializerVersion',
    'contentHash','canonicalPayloadBytes','payload','mediaRefs','searchArtifact','seoArtifact','manifest']);version(r);
    ids.release(r.releaseId);ids.portfolio(r.portfolioId);ids.operation(r.publicationOperationId);
    integer(r.sequence);if((r.sequence as number)<1)throw new Error();integer(r.createdFromDraftRevision);
    utc(r.createdAt);text(r.rendererVersion,80);text(r.blockRegistryVersion,80);text(r.serializerVersion,80);
    if(!/^[a-f0-9]{64}$/.test(String(r.contentHash)))throw new Error();
    integer(r.canonicalPayloadBytes,PRODUCT_LIMITS.publishedReleaseBytes);
    const payload=obj(r.payload,Object.keys(r.payload as object));
    assertSafeJsonValue(payload);const size=validatePublishedByteCount(payload);
    if(size!==r.canonicalPayloadBytes||createHash('sha256').update(canonicalJson(payload)).digest('hex')!==r.contentHash)throw new Error();
    array(r.mediaRefs,PRODUCT_LIMITS.originalMediaFilesPerPortfolio).forEach(ids.media);
    for(const field of ['searchArtifact','seoArtifact']){const sub=obj(r[field],Object.keys(r[field] as object));assertSafeJsonValue(sub);}
    const manifest=obj(r.manifest,['compilationVersion','enabledRoutes','sourceContentIds','warnings']);
    text(manifest.compilationVersion,50);
    for(const k of ['enabledRoutes','sourceContentIds','warnings'])array(manifest[k],200).forEach(x=>text(x,200));
    return r as unknown as ReleaseRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parsePublishOperationRecord(raw:unknown):PublishOperationRecord{
  try{const r=obj(raw,['operationId','portfolioId','ownerAccountId','idempotencyKeyHash',
    'requestFingerprint','draftRevision','expectedPreviousReleaseId','stage','preparedReleaseId',
    'activatedReleaseId','attemptedAt','updatedAt','finishedAt','retryAfter','errorCode','attemptCount','lease','schemaVersion']);version(r);
    ids.operation(r.operationId);ids.portfolio(r.portfolioId);ids.account(r.ownerAccountId);
    if(!/^[a-f0-9]{64}$/.test(String(r.idempotencyKeyHash))||!/^[a-f0-9]{64}$/.test(String(r.requestFingerprint)))throw new Error();
    integer(r.draftRevision);integer(r.attemptCount,1000);
    if(r.expectedPreviousReleaseId!==null)ids.release(r.expectedPreviousReleaseId);
    en(r.stage,['received','validating','preparing','prepared','activating','activated','propagation_pending','completed','failed_retryable','failed_terminal']);
    for(const key of ['preparedReleaseId','activatedReleaseId'])if(r[key]!==undefined)ids.release(r[key]);
    for(const key of ['attemptedAt','updatedAt','finishedAt','retryAfter'])if(r[key]!==undefined)utc(r[key]);
    if(r.errorCode!==undefined){text(r.errorCode,80);if(!/^[A-Z0-9_]+$/.test(String(r.errorCode)))throw new Error();}
    if(r.lease!==undefined){const lease=obj(r.lease,['owner','until','fencingToken']);text(lease.owner,80);utc(lease.until);integer(lease.fencingToken);}
    return r as unknown as PublishOperationRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseMediaRecord(raw:unknown):MediaRecord{
  try{const r=obj(raw,['mediaId','portfolioId','uploadedByAccountId','state','kind','declaredMimeType','originalNameDisplay',
    'verifiedMimeType','bytesOriginal','sha256','image','pdf','stagingKey','verifiedOriginalKey','variants',
    'createdAt','verifiedAt','publishedAt','deleteRequestedAt','rejectionCode','schemaVersion']);version(r);
    ids.media(r.mediaId);ids.portfolio(r.portfolioId);ids.account(r.uploadedByAccountId);
    en(r.state,['intent_issued','uploading','quarantined','processing','ready_private','ready_public','deletion_pending','deleted','rejected']);
    en(r.kind,['image','resume_pdf']);text(r.declaredMimeType,80);utc(r.createdAt);
    if(r.bytesOriginal!==undefined)integer(r.bytesOriginal,PRODUCT_LIMITS.pdfBytes);
    if(r.originalNameDisplay!==undefined)text(r.originalNameDisplay,200);
    for(const k of ['verifiedAt','publishedAt','deleteRequestedAt'])if(r[k]!==undefined)utc(r[k]);
    if(r.verifiedMimeType!==undefined)text(r.verifiedMimeType,80);
    if(r.sha256!==undefined&&!/^[a-f0-9]{64}$/.test(String(r.sha256)))throw new Error();
    for(const k of ['stagingKey','verifiedOriginalKey'])if(r[k]!==undefined){text(r[k],300);if(!/^(staging|media)\/[a-zA-Z0-9/_-]+$/.test(String(r[k])))throw new Error();}
    const variants=array(r.variants,12);
    for(const item of variants){const v=obj(item,['kind','objectKey','bytes','sha256']);text(v.kind,50);text(v.objectKey,300);integer(v.bytes,10*1024*1024);if(!/^[a-f0-9]{64}$/.test(String(v.sha256)))throw new Error();}
    if(r.image!==undefined){const m=obj(r.image,['width','height','orientationApplied']);integer(m.width,4096);integer(m.height,4096);bool(m.orientationApplied);}
    if(r.pdf!==undefined){const m=obj(r.pdf,['parseOk','pageCount','aiExtractionAllowed']);bool(m.parseOk);bool(m.aiExtractionAllowed);if(m.pageCount!==undefined)integer(m.pageCount,200);}
    if(r.rejectionCode!==undefined)text(r.rejectionCode,80);
    return r as unknown as MediaRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseContactRecord(raw:unknown):ContactMessageRecord{
  try{const r=obj(raw,['messageId','portfolioId','receivedAt','expiresAt','sender','subject','body',
    'consentNoticeVersion','status','antiAbuse','schemaVersion']);version(r);
    text(r.messageId,100);ids.portfolio(r.portfolioId);utc(r.receivedAt);date(r.expiresAt);
    if((r.expiresAt as Date).getTime()>Date.parse(r.receivedAt as string)+PRODUCT_LIMITS.contactRetentionDays*86400_000)throw new Error();
    const sender=obj(r.sender,['name','email','organization']);text(sender.name,160);text(sender.email,254);
    if(sender.organization!==undefined)text(sender.organization,160);
    if(r.subject!==undefined)text(r.subject,200);text(r.body,10000);text(r.consentNoticeVersion,80);
    en(r.status,['new','read','flagged','deleted']);
    const a=obj(r.antiAbuse,['decisionCode']);text(a.decisionCode,64);
    return r as unknown as ContactMessageRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseAnalyticsRecord(raw:unknown):AnalyticsDailyRecord{
  try{const r=obj(raw,['portfolioId','day','metricKey','targetId','count','updatedAt','schemaVersion']);version(r);
    ids.portfolio(r.portfolioId);if(!/^\d{4}-\d{2}-\d{2}$/.test(String(r.day)))throw new Error();
    en(r.metricKey,['page_view','project_click','outbound_click','ai_start','ai_success','ai_unavailable']);
    if(r.targetId!==undefined)text(r.targetId,100);integer(r.count);utc(r.updatedAt);
    return r as unknown as AnalyticsDailyRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseModerationPolicyRecord(raw:unknown):ModerationPolicyRecord{
  try{const r=obj(raw,['policyId','portfolioId','scope','targetId','effect','reasonCode',
    'issuedByAdminAccountId','active','issuedAt','liftedAt','expiresAt','securityVersion','schemaVersion']);version(r);
    text(r.policyId,100);ids.portfolio(r.portfolioId);ids.account(r.issuedByAdminAccountId);
    en(r.scope,['portfolio','content_item','route','media','ai']);
    en(r.effect,['deny_public','deny_ai','quarantine','suspend']);
    if(r.targetId!==undefined)text(r.targetId,160);text(r.reasonCode,80);
    bool(r.active);utc(r.issuedAt);if(r.liftedAt!==undefined)utc(r.liftedAt);
    if(r.expiresAt!==undefined)date(r.expiresAt);integer(r.securityVersion);
    return r as unknown as ModerationPolicyRecord;
  }catch{throw new PersistedRecordRejected();}
}
export function parseAIContextRecord(raw:unknown):AIContextRecord{
  try{const r=obj(raw,['contextId','portfolioId','releaseId','approvalPolicyVersion','contentHash',
    'status','sources','createdAt','expiresAt','schemaVersion']);version(r);
    text(r.contextId,100);ids.portfolio(r.portfolioId);ids.release(r.releaseId);
    integer(r.approvalPolicyVersion);if(!/^[a-f0-9]{64}$/.test(String(r.contentHash)))throw new Error();
    en(r.status,['preparing','ready','invalidated','failed']);
    for(const s of array(r.sources,200)){const v=obj(s,['sourceId','kind','contentId','approvedText','citationTarget','sourceVersion']);
      text(v.sourceId,160);en(v.kind,['profile','section','content_item','approved_document','faq']);
      text(v.approvedText,6000);text(v.citationTarget,500);integer(v.sourceVersion);if(v.contentId!==undefined)text(v.contentId,160);}
    utc(r.createdAt);if(r.expiresAt!==undefined)date(r.expiresAt);
    return r as unknown as AIContextRecord;
  }catch{throw new PersistedRecordRejected();}
}
