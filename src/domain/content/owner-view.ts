/** Allowlisted owner draft DTO. Never serialize Mongo metadata or internal idempotency hashes. */
import type {DraftRecord} from '../persistence/models.ts';
import {parseContentDraft} from './model.ts';
import type {ContentDraftShape} from './types.ts';
export type OwnedDraftView=ContentDraftShape & Pick<DraftRecord,
  'portfolioId'|'revision'|'schemaVersion'|'rendererVersion'|'theme'|'navigation'|'seo'|
  'aiApprovals'|'createdAt'|'updatedAt'>;
export function projectOwnerDraft(stored:DraftRecord):OwnedDraftView{
  const doc=parseContentDraft(stored);
  return {portfolioId:stored.portfolioId,revision:stored.revision,schemaVersion:stored.schemaVersion,
    rendererVersion:stored.rendererVersion,...doc,theme:structuredClone(stored.theme),
    navigation:structuredClone(stored.navigation),seo:structuredClone(stored.seo),
    aiApprovals:structuredClone(stored.aiApprovals),createdAt:stored.createdAt,updatedAt:stored.updatedAt};
}
