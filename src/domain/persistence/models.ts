/** Domain-owned persistence record shapes. No Mongo driver or web framework dependencies. */
import type { AccountId, PortfolioId, ReleaseId, MediaId, OperationId } from '../../shared/domain/identifiers.ts';

export type UTC = string;
export type AccountStatus = 'active'|'suspended'|'deleting';
export interface AccountRecord {
  accountId:AccountId; status:AccountStatus; displayName:string; preferredLocale:'en';
  verifiedEmail?:string; emailVerifiedAt?:UTC; platformRoles:('user'|'admin')[];
  securityVersion:number; lastSensitiveAuthAt?:UTC; createdAt:UTC; updatedAt:UTC;
  deletingAt?:UTC; schemaVersion:1;
}
export interface ProviderIdentityRecord {
  identityId:string; accountId:AccountId; provider:'google'|'github';
  providerSubject:string; issuer:string; linkedAt:UTC; schemaVersion:1;
}
export interface SessionRecord {
  sessionId:string; accountId:AccountId; sessionLookupId:string; verifierHash:string;
  securityVersion:number; expiresAt:Date; revokedAt?:Date; createdAt:Date; schemaVersion:1;
  authenticatedAt?:Date; lastSeenAt?:Date; idleExpiresAt?:Date; absoluteExpiresAt?:Date;
  authProvider?:'google'|'github'; csrfProofHash?:string;
}
export type PortfolioStatus = 'onboarding'|'active'|'owner_disabled'|'suspended'|'deleting';
export interface PortfolioRecord {
  portfolioId:PortfolioId; ownerAccountId:AccountId; slug:string; displayHandle:string;
  status:PortfolioStatus; visibility:'public'|'unlisted'; activeReleaseId:ReleaseId|null;
  publishSequence:number; securityVersion:number; lastActivatedOperationId?:OperationId;
  aiAccess:{enabled:boolean; revocationVersion:number; deniedSourceIds:string[]; disabledAt?:UTC};
  publicStatisticsEnabled:boolean; quotaSummary:{originalFileCount:number;usedBytes:number;reservedBytes:number};
  createdAt:UTC; updatedAt:UTC; schemaVersion:1;
}
export interface SlugClaimRecord {
  slugNormalized:string; portfolioId:PortfolioId; kind:'current'|'alias'|'reserved';
  claimedAt:UTC; schemaVersion:1;
}
/** Draft is ONE bounded document. No activeReleaseId or other control-plane fields. */
export interface DraftRecord {
  portfolioId:PortfolioId; revision:number; schemaVersion:1; rendererVersion:string;
  draftMutationId?:string; draftMutationFingerprint?:string;
  profile:Record<string,unknown>; sections:unknown[]; collectionDefinitions:unknown[];
  contentCollections:unknown[]; nodes:unknown[]; theme:Record<string,unknown>;
  navigation:Record<string,unknown>; seo:Record<string,unknown>;
  aiApprovals:Record<string,unknown>; mediaRefs:MediaId[];
  createdAt:UTC; updatedAt:UTC; updatedBy:AccountId;
}
export interface ReleaseRecord {
  releaseId:ReleaseId; portfolioId:PortfolioId; sequence:number;
  publicationOperationId:OperationId; createdFromDraftRevision:number; createdAt:UTC;
  schemaVersion:1; rendererVersion:string; blockRegistryVersion:string;
  serializerVersion:string; contentHash:string; canonicalPayloadBytes:number;
  payload:Record<string,unknown>; mediaRefs:MediaId[];
  searchArtifact:Record<string,unknown>; seoArtifact:Record<string,unknown>;
  manifest:{compilationVersion:string;enabledRoutes:string[];sourceContentIds:string[];warnings:string[]};
}
export type PublishStage = 'received'|'validating'|'preparing'|'prepared'|'activating'|
  'activated'|'propagation_pending'|'completed'|'failed_retryable'|'failed_terminal';
export interface PublishOperationRecord {
  operationId:OperationId; portfolioId:PortfolioId; ownerAccountId:AccountId;
  idempotencyKeyHash:string; requestFingerprint:string; draftRevision:number;
  expectedPreviousReleaseId:ReleaseId|null; stage:PublishStage;
  preparedReleaseId?:ReleaseId; activatedReleaseId?:ReleaseId;
  attemptedAt:UTC; updatedAt:UTC; finishedAt?:UTC; retryAfter?:UTC;
  errorCode?:string; attemptCount:number;
  lease?:{owner:string;until:UTC;fencingToken:number}; schemaVersion:1;
}
export type MediaState = 'intent_issued'|'uploading'|'quarantined'|'processing'|
  'ready_private'|'ready_public'|'deletion_pending'|'deleted'|'rejected';
export interface MediaRecord {
  mediaId:MediaId; portfolioId:PortfolioId; uploadedByAccountId:AccountId;
  state:MediaState; kind:'image'|'resume_pdf'; declaredMimeType:string;
  originalNameDisplay?:string; verifiedMimeType?:string; bytesOriginal?:number; sha256?:string;
  image?:{width:number;height:number;orientationApplied:boolean};
  pdf?:{parseOk:boolean;pageCount?:number;aiExtractionAllowed:boolean};
  stagingKey?:string; verifiedOriginalKey?:string;
  variants:{kind:string;objectKey:string;bytes:number;sha256:string}[];
  createdAt:UTC; verifiedAt?:UTC; publishedAt?:UTC;
  deleteRequestedAt?:UTC; rejectionCode?:string; schemaVersion:1;
}
export type ReservationState = 'reserved'|'capability_issued'|'finalizing'|'committed'|'released'|'expired';
export interface UploadReservationRecord {
  reservationId:string; portfolioId:PortfolioId; accountId:AccountId;
  mediaId:MediaId; intendedKind:'image'|'resume_pdf'; claimedBytes:number;
  quotaBytesReserved:number; state:ReservationState; createdAt:UTC;
  expiresAt:Date; purgeAfter?:Date; idempotencyHash:string; schemaVersion:1;
}
export interface QuotaUsage {committedBytes:number;reservedBytes:number;committedPhysicalBytes:number;
  reservedPhysicalBytes:number;committedOriginalFiles:number;reservedOriginalFiles:number;}
export interface QuotaLease {portfolioId:PortfolioId;accountId:AccountId;mediaId:MediaId;
  kind:'image'|'resume_pdf';expectedBytes:number;physicalBytes:number;expiresAt:UTC;
  state:'reserved'|'committed'|'released'|'expired';idempotencyHash:string;verifiedBytes?:number;actualPhysicalBytes?:number;}
/** Single-document authoritative admission aggregate; details in engineering/persistence/consistency.md. */
export interface MediaQuotaControlRecord {
  bucketId:'global:media';revision:number;capacityBytes:number;global:QuotaUsage;
  portfolios:Record<string,QuotaUsage>;leases:Record<string,QuotaLease>;updatedAt:UTC;schemaVersion:1;
}
export interface AIContextRecord {contextId:string;portfolioId:PortfolioId;releaseId:ReleaseId;
  approvalPolicyVersion:number;contentHash:string;status:'preparing'|'ready'|'invalidated'|'failed';
  sources:{sourceId:string;kind:'profile'|'section'|'content_item'|'approved_document'|'faq';
  approvedText:string;citationTarget:string;sourceVersion:number;contentId?:string}[];
  createdAt:UTC;expiresAt?:Date;schemaVersion:1;}
export interface ModerationPolicyRecord {policyId:string;portfolioId:PortfolioId;
  scope:'portfolio'|'content_item'|'route'|'media'|'ai';targetId?:string;
  effect:'deny_public'|'deny_ai'|'quarantine'|'suspend';reasonCode:string;
  issuedByAdminAccountId:AccountId;active:boolean;issuedAt:UTC;liftedAt?:UTC;
  expiresAt?:Date;securityVersion:number;schemaVersion:1;}
export interface ContactMessageRecord {messageId:string;portfolioId:PortfolioId;receivedAt:UTC;
  expiresAt:Date;sender:{name:string;email:string;organization?:string};subject?:string;
  body:string;consentNoticeVersion:string;status:'new'|'read'|'flagged'|'deleted';
  antiAbuse:{decisionCode:string};schemaVersion:1;}
export interface AnalyticsDailyRecord {portfolioId:PortfolioId;day:string;
  metricKey:'page_view'|'project_click'|'outbound_click'|'ai_start'|'ai_success'|'ai_unavailable';
  targetId?:string;count:number;updatedAt:UTC;schemaVersion:1;}
export interface ExternalFeedRecord {feedId:string;portfolioId:PortfolioId;provider:'medium_rss'|'github_public';
  state:'disabled'|'ready'|'error';updatedAt:UTC;expiresAt?:Date;
  previews:{title:string;canonicalUrl:string;publishedAt?:UTC}[];schemaVersion:1;}
export interface AbuseReportRecord {reportId:string;portfolioId:PortfolioId;status:'open'|'triaged'|'closed';
  reasonCode:string;createdAt:UTC;expiresAt?:Date;schemaVersion:1;}
export interface DeletionOperationRecord {operationId:OperationId;accountId:AccountId;
  stage:'requested'|'processing'|'completed'|'failed_retryable';updatedAt:UTC;schemaVersion:1;}
