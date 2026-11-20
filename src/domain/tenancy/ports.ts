import type { AccountId, PortfolioId, ReleaseId, SecurityVersion } from '../../shared/domain/identifiers.ts';
import type { CanonicalSlug } from '../../shared/domain/validation.ts';
/** A route slug is not an authorization principal. Public policy is checked independently per request. */
export interface OwnedPortfolioContext { readonly accountId: AccountId; readonly portfolioId: PortfolioId; }
export interface VerifiedPublicContext { readonly portfolioId: PortfolioId; readonly slug: CanonicalSlug; readonly activeReleaseId: ReleaseId; readonly securityVersion: SecurityVersion; }
export interface TenancyPort {
  requireOwnedPortfolio(actor: AccountId, portfolioId: PortfolioId): Promise<OwnedPortfolioContext | null>;
  resolveEligiblePublicRelease(slug: CanonicalSlug): Promise<VerifiedPublicContext | null>;
}
