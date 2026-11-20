import type { PortfolioId, ReleaseId, PolicyVersion } from '../../shared/domain/identifiers.ts';
/** Gilden may use only the matching active release AND the current owner-approved AI policy version. */
export interface ApprovedKnowledgeContext { readonly portfolioId: PortfolioId; readonly releaseId: ReleaseId; readonly policyVersion: PolicyVersion; readonly citations: readonly string[]; }
export interface GildenKnowledgePort { readIfCurrentlyApproved(portfolioId: PortfolioId, activeRelease: ReleaseId, currentPolicy: PolicyVersion): Promise<ApprovedKnowledgeContext | null>; }
