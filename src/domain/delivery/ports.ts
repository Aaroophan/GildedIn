import type { ReleaseId } from '../../shared/domain/identifiers.ts';
import type { VerifiedPublicContext } from '../tenancy/ports.ts';
/** Only a verified active release projection may be rendered. */
export interface PublicReleaseView { readonly releaseId: ReleaseId; readonly semanticHtmlModel: Readonly<Record<string, unknown>>; }
export interface PublicDeliveryPort { readActiveRelease(context: VerifiedPublicContext): Promise<PublicReleaseView>; }
