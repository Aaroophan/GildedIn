import type {AccountId,PortfolioId,ReleaseId,MediaId,OperationId} from '../../shared/domain/identifiers.ts';
import type {DraftRecord,PortfolioRecord,ReleaseRecord,MediaRecord,PublishOperationRecord,
  MediaQuotaControlRecord,UploadReservationRecord,ContactMessageRecord,AnalyticsDailyRecord} from './models.ts';
/** Only the future server-side IAM boundary may construct a verified actor. No actorId is taken from input JSON. */
export interface VerifiedActor {readonly accountId:AccountId;readonly sessionVerified:true;readonly securityVersion:number;}
export type SaveDraftResult={kind:'saved'|'replayed';draft:DraftRecord}|{kind:'conflict'|'not_found'};
export type PolicyChange={expectedSecurityVersion:number;expectedActiveReleaseId:ReleaseId|null;
  expectedPublishSequence:number;status:PortfolioRecord['status'];visibility:PortfolioRecord['visibility'];
  aiEnabled:boolean};
export type ActivateResult={kind:'activated'|'already_activated';portfolio:PortfolioRecord}|
  {kind:'not_ready'|'conflict'|'not_found'|'unavailable'};
export interface TenantRepositories {
  getOwnedPortfolio(actor:VerifiedActor,id:PortfolioId):Promise<PortfolioRecord|null>;
  getOwnedDraft(actor:VerifiedActor,id:PortfolioId):Promise<DraftRecord|null>;
  compareAndSave(actor:VerifiedActor,id:PortfolioId,expectedRevision:number,
    clientMutationId:string,snapshot:Omit<DraftRecord,'revision'|'draftMutationId'|'draftMutationFingerprint'|'updatedAt'|'updatedBy'>):Promise<SaveDraftResult>;
  listOwnedMedia(actor:VerifiedActor,id:PortfolioId,limit?:number):Promise<MediaRecord[]>;
  getOwnedRelease(actor:VerifiedActor,id:PortfolioId,releaseId:ReleaseId):Promise<ReleaseRecord|null>;
  comparePolicy(actor:VerifiedActor,id:PortfolioId,expectedSecurityVersion:number,
    change:Pick<PortfolioRecord,'visibility'|'status'>):Promise<PortfolioRecord|null>;
}
/** A verified host/slug resolve result issued server-side, never the raw browser slug or portfolio ID. */
export interface VerifiedPublicPortfolio {readonly portfolioId:PortfolioId;readonly hostResolutionVerified:true;}
export type PublicReadDecision = {kind:'allowed';portfolioId:PortfolioId;
  activeReleaseId:ReleaseId;release:ReleaseRecord;securityVersion:number;visibility:'public'|'unlisted'}|
  {kind:'denied';reason:'no_active_release'|'suppressed'|'missing'|'policy_unavailable'|'unsupported_release'};
export interface PublicReleaseReader {getCurrentPublicRelease(identity:VerifiedPublicPortfolio):Promise<PublicReadDecision>;}
export interface PublicationRepository {
  createOperation(actor:VerifiedActor,operation:PublishOperationRecord):Promise<{kind:'created'|'existing';operation:PublishOperationRecord}>;
  getOperation(actor:VerifiedActor,id:PortfolioId,keyHash:string):Promise<PublishOperationRecord|null>;
  insertPrepared(actor:VerifiedActor,release:ReleaseRecord):Promise<{kind:'created'|'existing'|'conflict';release?:ReleaseRecord}>;
  activate(actor:VerifiedActor,params:{portfolioId:PortfolioId;operationId:OperationId;releaseId:ReleaseId;
    expectedActiveReleaseId:ReleaseId|null;expectedSecurityVersion:number;expectedPublishSequence:number}):Promise<ActivateResult>;
}
export interface MediaQuotaRepository {reserve(actor:VerifiedActor,input:{reservationId:string;idempotencyHash:string;
  portfolioId:PortfolioId;mediaId:MediaId;kind:'image'|'resume_pdf';bytes:number;physicalBytes:number;
  expiresAt:string}):Promise<UploadReservationRecord>;
  finalize(actor:VerifiedActor,reservationId:string,verifiedBytes:number,physicalBytes:number):Promise<void>;
  release(actor:VerifiedActor,reservationId:string,cleanupConfirmed:()=>Promise<boolean>):Promise<void>;
  reconcileExpired(now:Date,cleanupConfirmed:(reservationId:string)=>Promise<boolean>):Promise<number>;
  currentUsage(actor:VerifiedActor,portfolioId:PortfolioId):Promise<MediaQuotaControlRecord['global']|null>;
}
export interface PrivacyRepositories {
  listOwnedUnexpiredContact(actor:VerifiedActor,id:PortfolioId,now:Date,limit?:number):Promise<ContactMessageRecord[]>;
  getOwnedUnexpiredContact(actor:VerifiedActor,id:PortfolioId,messageId:string,now:Date):Promise<ContactMessageRecord|null>;
  readAggregate(actor:VerifiedActor,id:PortfolioId,day:string):Promise<AnalyticsDailyRecord[]>;
}
