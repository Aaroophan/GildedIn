/** Domain-facing public resolver contract; there is no owner draft access from public paths. */
import type {AccountId,PortfolioId,ReleaseId,SecurityVersion} from '../../shared/domain/identifiers.ts';
import type {CanonicalSlug} from '../../shared/domain/validation.ts';
import type {ReleaseRecord} from '../persistence/models.ts';
import type {PublicRoute} from './routing.ts';
export type PublicRouteResult={kind:'allowed';portfolioId:PortfolioId;slug:CanonicalSlug;
  release:ReleaseRecord;route:PublicRoute;visibility:'public'|'unlisted';canonicalUrl:string;
  navigationPath:string;robots:'index'|'noindex';securityVersion:number}|
  {kind:'redirect';location:string;status:308}|{kind:'not_found'|'unavailable'};
export interface PublicDirectoryItem {portfolioId:PortfolioId;slug:CanonicalSlug;
  canonicalUrl:string;title:string;releaseId:string;}

/** Original Issue 1 domain contracts retained for public-delivery and future content modules.
 * A tenant slug is never itself an owner principal. The verified-public context may
 * only be created after a fresh authoritative policy and active-release decision.
 */
export interface OwnedPortfolioContext {readonly accountId:AccountId;readonly portfolioId:PortfolioId;}
export interface VerifiedPublicContext {readonly portfolioId:PortfolioId;readonly slug:CanonicalSlug;
  readonly activeReleaseId:ReleaseId;readonly securityVersion:SecurityVersion;}
export interface TenancyPort {
  requireOwnedPortfolio(actor:AccountId,portfolioId:PortfolioId):Promise<OwnedPortfolioContext|null>;
  resolveEligiblePublicRelease(slug:CanonicalSlug):Promise<VerifiedPublicContext|null>;
}
