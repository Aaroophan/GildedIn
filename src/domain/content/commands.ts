/** Finite v1 owner content commands. Never arbitrary JSON Patch or property paths. */
import {parseContentId,parseSectionId} from '../../shared/domain/identifiers.ts';
import type {ContentId,SectionId} from '../../shared/domain/identifiers.ts';
import {parseContentDraft,parseContentItem,parseSection,deletionImpact,parseContentBinding} from './model.ts';
import type {LooseContentDraft} from './model.ts';
import {parseCollectionDefinition} from './schema.ts';
import {migrateSchema} from './migration.ts';
import {contentIssue,ContentDenied} from './errors.ts';
import {list,shape,string,integer,flag,token,ensureJson,unique} from './strict.ts';
import type {ContentDraftShape,ContentItem,ContentBinding} from './types.ts';
export const CONTENT_OPERATIONS=['setProfileField','createSection','updateSection','deleteSection',
  'reorderSections','createCollection','updateCollectionSchema','upsertContentItem','deleteContentItem',
  'reorderCollectionItems','setItemVisibility','setSectionFields','createCategory','renameCategory',
  'deleteCategory','attachContentReference','detachContentReference'] as const;
export interface MutationCommand {expectedRevision:number;clientMutationId:string;operations:unknown[];}
export function parseContentMutation(raw:unknown):MutationCommand{
  const r=shape(raw,['expectedRevision','clientMutationId','operations'],'command');
  const expectedRevision=integer(r.expectedRevision,0,2_147_483_647,'command.expectedRevision');
  const clientMutationId=string(r.clientMutationId,96,'command.clientMutationId',8);
  if(!/^[A-Za-z0-9_-]{8,96}$/.test(clientMutationId))contentIssue('command.clientMutationId','invalid_token','Invalid mutation token.');
  const operations=list(r.operations,20,'command.operations');
  if(!operations.length)contentIssue('command.operations','empty_batch','At least one command is required.');
  ensureJson(operations,'command.operations',16,350_000);
  for(const [i,operation] of operations.entries()){
    const r=shape(operation,['type','field','value','section','sectionId','changes','sectionIds',
      'collection','collectionId','schema','confirmationHash','contentId','fields','slug',
      'categoryIds','featured','ownerVisibility','searchable','publicFieldIds','aiApprovedFieldIds',
      'itemIds','category','categoryId','reassignTo','removeAssignments','nodeId','binding'],
      `command.operations.${i}`);
    if(!CONTENT_OPERATIONS.includes(r.type as typeof CONTENT_OPERATIONS[number]))
      contentIssue(`command.operations.${i}.type`,'unknown_operation','Only documented content commands are allowed.');
  }
  return {expectedRevision,clientMutationId,operations};
}
function itemWithId(raw:unknown,path:string):ContentId{
  try{return parseContentId(raw);}catch{return contentIssue(path,'invalid_id','Invalid content identity.');}
}
function sectionWithId(raw:unknown,path:string):SectionId{
  try{return parseSectionId(raw);}catch{return contentIssue(path,'invalid_id','Invalid section identity.');}
}
function lookupCollection(doc:ContentDraftShape,id:unknown,path:string){
  const collectionId=token(id,path),definition=doc.collectionDefinitions.find(x=>x.collectionId===collectionId);
  const collection=doc.contentCollections.find(x=>x.collectionId===collectionId);
  if(!definition||!collection)contentIssue(path,'missing_collection','Collection does not exist.');
  return {collectionId,definition:definition!,collection:collection!};
}
function lookupItem(doc:ContentDraftShape,collectionId:unknown,contentId:unknown,path:string){
  const look=lookupCollection(doc,collectionId,`${path}.collectionId`);
  const id=itemWithId(contentId,`${path}.contentId`);
  const item=look.collection.items.find(x=>x.contentId===id);
  if(!item)contentIssue(path,'missing_item','Item is missing from this portfolio.');
  return {...look,id,item:item!};
}
/** In-memory candidate only; caller saves one revision after full graph and quota validation. */
export async function applyContentOperations(source:LooseContentDraft,operations:readonly unknown[],
  nowIso:string,expectedRevision:number):Promise<ContentDraftShape>{
  if(!Array.isArray(operations)||operations.length<1||operations.length>20)
    contentIssue('operations','batch_limit','Use 1–20 typed operations per batch.');
  const base=parseContentDraft(source);
  const draft=structuredClone(base);
  for(const [index,command] of operations.entries()){
    const path=`operations.${index}`;
    // Inspect discriminant before parsing its exact allowlist; never interpret caller-defined paths.
    const head=shape(command,['type','field','value','section','sectionId','changes','sectionIds',
      'collection','collectionId','schema','confirmationHash','contentId','fields','slug',
      'categoryIds','featured','ownerVisibility','searchable','publicFieldIds','aiApprovedFieldIds',
      'itemIds','category','categoryId','reassignTo','removeAssignments','nodeId','binding'],path);
    const type=head.type;
    if(type==='setProfileField'){
      const c=shape(command,['type','field','value'],path);
      if(!['displayName','identityLabel','introduction'].includes(String(c.field)))
        contentIssue(`${path}.field`,'private_property','Only editable profile fields are accepted.');
      const field=c.field as 'displayName'|'identityLabel'|'introduction';
      draft.profile[field]=string(c.value,field==='introduction'?800:field==='displayName'?100:120,`${path}.value`);
    }else if(type==='createSection'){
      const c=shape(command,['type','section'],path);
      const newSection=parseSection(c.section,`${path}.section`);
      if(newSection.type==='hero'||draft.sections.some(x=>x.sectionId===newSection.sectionId))
        contentIssue(path,'duplicate_section','Only one Hero and unique section IDs are allowed.');
      newSection.order=draft.sections.length;draft.sections.push(newSection);
    }else if(type==='updateSection'){
      const c=shape(command,['type','sectionId','changes'],path);
      const id=sectionWithId(c.sectionId,`${path}.sectionId`);
      const target=draft.sections.find(s=>s.sectionId===id);if(!target)contentIssue(path,'missing_section','Section not found.');
      const r=shape(c.changes,['title','navigationLabel','visible','searchEligible','aiSectionApproved','publicAnchor','layoutPreset'],`${path}.changes`);
      for(const [key,val] of Object.entries(r)){
        const mutable=target as unknown as Record<string,unknown>;
        if(['visible','searchEligible','aiSectionApproved'].includes(key))mutable[key]=flag(val,`${path}.changes.${key}`);
        else if(key==='publicAnchor'||key==='layoutPreset')mutable[key]=token(val,`${path}.changes.${key}`);
        else mutable[key]=string(val,120,`${path}.changes.${key}`);
      }
      if(target!.type==='hero'&&target!.visible===false)contentIssue(path,'hero_hidden','Hero cannot be hidden.');
    }else if(type==='deleteSection'){
      const c=shape(command,['type','sectionId'],path);const id=sectionWithId(c.sectionId,`${path}.sectionId`);
      const target=draft.sections.find(x=>x.sectionId===id);
      if(!target||target.type==='hero')contentIssue(path,'hero_required','Hero cannot be removed.');
      if(draft.collectionDefinitions.some(x=>x.sectionId===id))contentIssue(path,'section_in_use','Detach section schemas first.');
      draft.sections=draft.sections.filter(x=>x.sectionId!==id).map((s,i)=>({...s,order:i}));
    }else if(type==='reorderSections'){
      const c=shape(command,['type','sectionIds'],path);
      const ids=list(c.sectionIds,100,`${path}.sectionIds`).map(x=>sectionWithId(x,`${path}.sectionIds`));
      unique(ids,x=>x,`${path}.sectionIds`);
      if(ids.length!==draft.sections.length||ids.some(id=>!draft.sections.some(s=>s.sectionId===id))||
        ids[0]!==draft.sections[0].sectionId)contentIssue(path,'section_order','Reorder must preserve every section with Hero first.');
      draft.sections=ids.map((id,i)=>({...draft.sections.find(x=>x.sectionId===id)!,order:i}));
    }else if(type==='createCollection'){
      const c=shape(command,['type','collection'],path);
      const definition=parseCollectionDefinition(c.collection,`${path}.collection`);
      if(draft.collectionDefinitions.some(x=>x.collectionId===definition.collectionId||x.schemaId===definition.schemaId))
        contentIssue(path,'duplicate_collection','Collection identity is already in use.');
      draft.collectionDefinitions.push(definition);draft.contentCollections.push({collectionId:definition.collectionId,items:[]});
    }else if(type==='updateCollectionSchema'){
      const c=shape(command,['type','schema','confirmationHash'],path);
      const migrated=await migrateSchema(draft,c.schema,expectedRevision,
        c.confirmationHash===undefined?undefined:string(c.confirmationHash,64,`${path}.confirmationHash`));
      draft.collectionDefinitions=migrated.candidate.collectionDefinitions;
      draft.contentCollections=migrated.candidate.contentCollections;
    }else if(type==='upsertContentItem'){
      const c=shape(command,['type','collectionId','contentId','fields','slug','categoryIds','featured',
        'ownerVisibility','searchable','publicFieldIds','aiApprovedFieldIds'],path);
      const {collectionId,collection,definition}=lookupCollection(draft,c.collectionId,`${path}.collectionId`);
      const existingId=c.contentId===undefined?undefined:itemWithId(c.contentId,`${path}.contentId`);
      const old=existingId?collection.items.find(x=>x.contentId===existingId):undefined;
      if(existingId&&!old)contentIssue(path,'missing_item','Updates cannot adopt an unknown or foreign item ID.');
      if(!old&&collection.items.length>=20)contentIssue(path,'collection_limit','Collection contains the maximum twenty items.');
      const draftItem={contentId:existingId??parseContentId(globalThis.crypto.randomUUID()),collectionId,
        schemaVersion:definition.schemaVersion,slug:c.slug,
        fields:c.fields,categoryIds:c.categoryIds??[],sortOrder:old?.sortOrder??collection.items.length,
        featured:c.featured??false,ownerVisibility:c.ownerVisibility??'draft_only',
        searchable:c.searchable??false,publicFieldIds:c.publicFieldIds??[],
        aiApprovedFieldIds:c.aiApprovedFieldIds??[],createdAt:old?.createdAt??nowIso,updatedAt:nowIso};
      if(draftItem.slug===undefined)delete draftItem.slug;
      const parsed=parseContentItem(draftItem,definition,`${path}.item`);
      if(old)collection.items[old.sortOrder]=parsed;else collection.items.push(parsed);
    }else if(type==='deleteContentItem'){
      const c=shape(command,['type','collectionId','contentId'],path);
      const {collection,id}=lookupItem(draft,c.collectionId,c.contentId,path);
      const impact=deletionImpact(draft,id);
      if(!impact.canDelete)throw new ContentDenied('CONTENT_IN_USE',[{path,code:'referenced',
        message:'Resolve dependent items, sections and nodes before deletion.'}]);
      collection.items=collection.items.filter(x=>x.contentId!==id).map((x,i)=>({...x,sortOrder:i}));
    }else if(type==='reorderCollectionItems'){
      const c=shape(command,['type','collectionId','itemIds'],path);
      const {collection}=lookupCollection(draft,c.collectionId,`${path}.collectionId`);
      const ids=list(c.itemIds,20,`${path}.itemIds`).map(x=>itemWithId(x,`${path}.itemIds`));
      unique(ids,x=>x,`${path}.itemIds`);
      if(ids.length!==collection.items.length||ids.some(id=>!collection.items.some(item=>item.contentId===id)))
        contentIssue(path,'item_order','Reorder must contain all and only current item IDs.');
      collection.items=ids.map((id,i)=>({...collection.items.find(x=>x.contentId===id)!,sortOrder:i}));
    }else if(type==='setItemVisibility'){
      const c=shape(command,['type','collectionId','contentId','ownerVisibility','searchable',
        'publicFieldIds','aiApprovedFieldIds'],path);
      const {item,collection,definition}=lookupItem(draft,c.collectionId,c.contentId,path);
      const next=parseContentItem({...item,ownerVisibility:c.ownerVisibility,searchable:c.searchable,
        publicFieldIds:c.publicFieldIds,aiApprovedFieldIds:c.aiApprovedFieldIds,updatedAt:nowIso},definition,path);
      collection.items[item.sortOrder]=next;
    }else if(type==='setSectionFields'){
      const c=shape(command,['type','sectionId','fields'],path);
      const id=sectionWithId(c.sectionId,`${path}.sectionId`);
      const section=draft.sections.find(s=>s.sectionId===id);
      if(!section||!section.schemaDefinitionId)contentIssue(path,'section_schema','Section has no custom schema.');
      section!.customValues=shape(c.fields,Object.keys(c.fields as object),`${path}.fields`);
    }else if(type==='createCategory'){
      const c=shape(command,['type','collectionId','category'],path);
      const {definition}=lookupCollection(draft,c.collectionId,`${path}.collectionId`);
      const r=shape(c.category,['categoryId','label'],`${path}.category`);
      const categoryId=token(r.categoryId,`${path}.category.categoryId`);
      if(definition.categories.some(x=>x.categoryId===categoryId)||definition.categories.length>=20)
        contentIssue(path,'category_limit','Category identity is taken or capacity is reached.');
      definition.categories.push({categoryId,label:string(r.label,100,`${path}.category.label`,1),order:definition.categories.length});
    }else if(type==='renameCategory'){
      const c=shape(command,['type','collectionId','categoryId','value'],path);
      const {definition}=lookupCollection(draft,c.collectionId,`${path}.collectionId`);
      const category=definition.categories.find(x=>x.categoryId===token(c.categoryId,`${path}.categoryId`));
      if(!category)contentIssue(path,'missing_category','Category does not exist.');
      category!.label=string(c.value,100,`${path}.value`,1);
    }else if(type==='deleteCategory'){
      const c=shape(command,['type','collectionId','categoryId','reassignTo','removeAssignments'],path);
      const {definition,collection}=lookupCollection(draft,c.collectionId,`${path}.collectionId`);
      const id=token(c.categoryId,`${path}.categoryId`);
      if(!definition.categories.some(x=>x.categoryId===id))contentIssue(path,'missing_category','Category not found.');
      const inUse=collection.items.some(x=>x.categoryIds.includes(id));
      if(inUse&&c.removeAssignments!==true&&c.reassignTo===undefined)
        throw new ContentDenied('CONTENT_IN_USE',[{path,code:'category_in_use',message:'Choose reassignment or explicit removal.'}]);
      const reassigned=c.reassignTo===undefined?undefined:token(c.reassignTo,`${path}.reassignTo`);
      if(reassigned&&(!definition.categories.some(x=>x.categoryId===reassigned)||reassigned===id))
        contentIssue(path,'invalid_category','Replacement category must already exist.');
      for(const item of collection.items){
        if(item.categoryIds.includes(id))item.categoryIds=[...new Set(item.categoryIds.filter(x=>x!==id).concat(reassigned??[]))];
      }
      definition.categories=definition.categories.filter(x=>x.categoryId!==id).map((x,i)=>({...x,order:i}));
    }else if(type==='attachContentReference'||type==='detachContentReference'){
      const c=shape(command,type==='attachContentReference'?['type','nodeId','binding']:['type','nodeId'],path);
      const nodeId=string(c.nodeId,80,`${path}.nodeId`,1);
      const node=draft.nodes.find(x=>x&&typeof x==='object'&&!Array.isArray(x)&&
        (x as Record<string,unknown>).nodeId===nodeId) as Record<string,unknown>|undefined;
      if(!node)contentIssue(path,'missing_node','A pre-existing authored node must be selected.');
      if(type==='attachContentReference')node!.contentBinding=parseContentBinding(c.binding,`${path}.binding`);
      else delete node!.contentBinding;
    }else contentIssue(`${path}.type`,'unknown_operation','Unsupported content operation.');
  }
  return parseContentDraft(draft);
}
