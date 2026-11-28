/** Server-side purpose-limited, atomic workspace snapshot merger.
 * Preserves account, policy, approvals, media and release controls from the authoritative draft.
 */
import type {ContentDraftShape,SectionDefinition,ContentCollection,ContentItem} from '../content/types.ts';
import {ContentDenied} from '../content/errors.ts';
import {ensureJson,shape,list} from '../content/strict.ts';
import {parseSection,parseContentDraft} from '../content/model.ts';
import {parseCompositionNodes} from '../composition/validation.ts';
import {canonicalJson} from '../../shared/domain/limits.ts';
export interface EditorWorkspacePayload {schemaVersion:1;sections:SectionDefinition[];
  contentCollections:ContentCollection[];nodes:unknown[];}
function reject(path:string,message:string):never{
  throw new ContentDenied('CONTENT_INVALID',[{path,code:'protected_field',message}]);
}
const same=(a:unknown,b:unknown)=>a===undefined||b===undefined?a===b:canonicalJson(a)===canonicalJson(b);
/** Exhaustive whitelist for existing section changes; new sections are strictly private by default. */
const SECTION_MUTABLE=new Set(['title','order','visible']);
const ITEM_MUTABLE=new Set(['fields','sortOrder','updatedAt']);
export function mergeEditorWorkspace(authoritative:unknown,raw:unknown,nowIso:string):ContentDraftShape{
  const value=shape(raw,['schemaVersion','sections','nodes','contentCollections'],'workspace');
  if(value.schemaVersion!==1)reject('workspace.schemaVersion','Only editor schema version 1 is supported.');
  ensureJson(value,'workspace',16,350_000);
  const stored=parseContentDraft(authoritative as Parameters<typeof parseContentDraft>[0]);
  const sections=list(value.sections,100,'workspace.sections').map((s,i)=>parseSection(s,`workspace.sections.${i}`));
  const oldSections=new Map(stored.sections.map(s=>[s.sectionId,s] as const));
  for(const section of sections){
    if(section.type==='hero'&&!section.visible)
      reject('workspace.sections.hero.visible','The required Hero section must stay visible.');
    const old=oldSections.get(section.sectionId);
    if(old){for(const key of Object.keys({...old,...section}) as (keyof SectionDefinition)[])
      if(!SECTION_MUTABLE.has(key)&&!same(old[key],section[key]))
        reject(`workspace.sections.${section.sectionId}.${key}`,'Editor cannot change section identity, permissions or schema bindings.');
    }else if(section.type==='hero'||section.type==='custom'||section.aiSectionApproved||section.searchEligible||
      section.layoutPreset!=='auto'||section.schemaDefinitionId||section.customValues)
      reject('workspace.sections','New sections must be non-Hero, builtin, unapproved and use safe Auto defaults.');
  }
  const collections=list(value.contentCollections,100,'workspace.contentCollections') as ContentCollection[];
  if(collections.length!==stored.contentCollections.length)reject('workspace.contentCollections','Editor cannot add or remove collections.');
  const originals=new Map(stored.contentCollections.map(c=>[c.collectionId,c] as const));
  const updatedCollections:ContentCollection[]=[];
  for(const collection of collections){
    const old=originals.get(collection.collectionId);
    if(!old||!Array.isArray(collection.items)||old.items.length!==collection.items.length)
      reject('workspace.contentCollections','Collection identity or item count changed.');
    const oldItems=new Map(old.items.map(i=>[i.contentId,i] as const));
    const normalized:ContentItem[]=[];
    for(const entry of collection.items){
      const item=oldItems.get(entry.contentId);
      if(!item)reject('workspace.contentCollections.items','Editor cannot adopt a different content item.');
      for(const key of Object.keys({...item,...entry}) as (keyof ContentItem)[])
        if(!ITEM_MUTABLE.has(key)&&!same(item[key],entry[key]))
          reject(`workspace.contentCollections.${collection.collectionId}.${key}`,
            'Editor cannot change content ownership, public field approval or security metadata.');
      // updatedAt is ALWAYS assigned by the server, only when source fields actually changed.
      const updatedAt=same(item.fields,entry.fields)?item.updatedAt:nowIso;
      normalized.push({...item,fields:entry.fields,sortOrder:entry.sortOrder,updatedAt});
    }
    updatedCollections.push({collectionId:collection.collectionId,items:normalized});
  }
  const nodes=parseCompositionNodes(value.nodes,sections,{allowLegacy:false}).nodes;
  // This also verifies no dangling nodes/relationships or changed public projection metadata.
  return parseContentDraft({...stored,sections,contentCollections:updatedCollections,nodes});
}
