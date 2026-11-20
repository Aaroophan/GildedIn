import type { AccountId, PortfolioId, ReleaseId, OperationId, DraftRevision } from '../../shared/domain/identifiers.ts';
/** No public read of drafts. Prepared releases are not public until an authorized pointer activation. */
export interface PublishIntent { readonly actor: AccountId; readonly portfolio: PortfolioId; readonly expectedDraftRevision: DraftRevision; readonly idempotencyKey: string; }
export interface PublishOutcome { readonly operationId: OperationId; readonly activeReleaseId: ReleaseId | null; readonly state: 'preparing' | 'activated' | 'propagation-pending'; }
export interface PublicationPort { publish(intent: PublishIntent): Promise<PublishOutcome>; }
