import type { AccountId, PortfolioId, MediaId } from '../../shared/domain/identifiers.ts';
export interface OwnedMedia { readonly mediaId: MediaId; readonly verifiedOriginalBytes: number; readonly approvedForPublicRelease: boolean; }
export interface MediaPort { listOwnedMedia(actor: AccountId, portfolio: PortfolioId): Promise<readonly OwnedMedia[]>; }
