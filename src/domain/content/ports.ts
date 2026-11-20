import type { PortfolioId, ContentId } from '../../shared/domain/identifiers.ts';
/** Publishing receives only explicitly classified fields, never arbitrary tenant MongoDB documents. */
export interface PublicContentProjection { readonly portfolioId: PortfolioId; readonly sourceIds: readonly ContentId[]; readonly fields: Readonly<Record<string, unknown>>; }
export interface ContentProjectionPort {
  compilePublicContent(portfolioId: PortfolioId, draftVersion: number): Promise<PublicContentProjection>;
}
