import type { AccountId, OperationId, PortfolioId } from '../../shared/domain/identifiers.ts';
/** A bounded, redacted audit contract; never accepts arbitrary request bodies or chat text. */
export interface AuditEvent { readonly actorId: AccountId | null; readonly portfolioId: PortfolioId | null; readonly operationId: OperationId; readonly category: 'identity' | 'publication' | 'moderation' | 'deletion' | 'ai-policy'; readonly outcome: 'accepted' | 'denied' | 'failed'; }
export interface AuditWriterPort { append(event: AuditEvent): Promise<void>; }
