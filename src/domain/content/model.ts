/** Strict content aggregate parser. A draft and a published release are NEVER interchangeable. */
import {parseContentId,parseSectionId,parseMediaId} from '../../shared/domain/identifiers.ts';
import type {ContentId,SectionId,MediaId} from '../../shared/domain/identifiers.ts';
import {PRODUCT_LIMITS,validateAuthoredNodes,canonicalJson} from '../../shared/domain/limits.ts';
import {parseUtcTimestamp,parseCanonicalSlug} from '../../shared/domain/validation.ts';
import {parseFieldDefinition,parseCollectionDefinition,parseFieldValue} from './schema.ts';
import {contentIssue} from './errors.ts';
import {shape,list,string,integer,flag,token,unique,ensureJson} from './strict.ts';
import {SECTION_TYPES} from './types.ts';
import {parseCompositionNodes} from '../composition/validation.ts';
import type {SectionDefinition,CollectionDefinition,ContentCollection,ContentItem,ContentDraftShape,
  FieldDefinition,VisibilityUse,ContentBinding,ContentCandidate,ProjectionCandidates,DeletionImpact} from './types.ts';

function anyId(raw:unknown,kind:'content'|'section'|'media',path:string):ContentId|SectionId|MediaId{
  try{return kind==='content'?parseContentId(raw):kind==='section'?parseSectionId(raw):parseMediaId(raw);}
  catch{return contentIssue(path,'invalid_id','A stable opaque identifier is required.');}
}
export function initialHeroSection(id:SectionId):SectionDefinition {
  return {sectionId:id,type:'hero',title:'Introduction',order:0,visible:true,searchEligible:true,
    aiSectionApproved:false,canvasRootId:`root_${id}`,layoutPreset:'default',publicAnchor:'intro'};
}
function parseSectionValues(raw:unknown,path:string):Record<string,unknown>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.getPrototypeOf(raw)!==Object.prototype)
    contentIssue(path,'invalid_shape','Custom values must be a plain object.');
  return shape(raw,Object.keys(raw as object),path);
}
/** A nested approval is not inherited from its parent. Each path is explicitly reviewed. */
export function locateApprovalField(fields:FieldDefinition[],path:string):FieldDefinition|undefined {
  const segments=path.split('.');
  if(!segments.length||segments.length>4||segments.some(part=>!part||part.length>64))return undefined;
  let field=fields.find(x=>x.fieldId===segments[0]);
  for(const segment of segments.slice(1)){
    if(!field)return undefined;
    if(field.type==='object')field=field.fields?.find(x=>x.fieldId===segment);
    else if(field.type==='list')field=field.item?.fieldId===segment?field.item:undefined;
    else return undefined;
  }
  return field;
}
function parseApprovalPath(raw:unknown,fields:FieldDefinition[],path:string):{key:string;field:FieldDefinition}{
  const key=string(raw,255,path,1);
  for(const part of key.split('.'))token(part,path);
  const field=locateApprovalField(fields,key);
  if(!field)return contentIssue(path,'unknown_field','Only existing schema field paths may be approved.');
  return {key,field};
}
export function parseSection(raw:unknown,path='section'):SectionDefinition{
  const s=shape(raw,['sectionId','type','title','navigationLabel','order','visible','searchEligible',
    'aiSectionApproved','canvasRootId','layoutPreset','publicAnchor','schemaDefinitionId','customValues'],path);
  const type=s.type;
  if(typeof type!=='string'||!SECTION_TYPES.includes(type as typeof SECTION_TYPES[number]))
    contentIssue(`${path}.type`,'invalid_section_type','Unsupported section type.');
  const sectionId=anyId(s.sectionId,'section',`${path}.sectionId`) as SectionId;
  const result:SectionDefinition={sectionId,type:type as SectionDefinition['type'],
    title:string(s.title,120,`${path}.title`),order:integer(s.order,0,99,`${path}.order`),
    visible:flag(s.visible,`${path}.visible`),searchEligible:flag(s.searchEligible,`${path}.searchEligible`),
    aiSectionApproved:flag(s.aiSectionApproved,`${path}.aiSectionApproved`),
    canvasRootId:string(s.canvasRootId,80,`${path}.canvasRootId`,1),
    layoutPreset:token(s.layoutPreset,`${path}.layoutPreset`),publicAnchor:token(s.publicAnchor,`${path}.publicAnchor`),
    ...(s.navigationLabel===undefined?{}:{navigationLabel:string(s.navigationLabel,100,`${path}.navigationLabel`)}),
    ...(s.schemaDefinitionId===undefined?{}:{schemaDefinitionId:token(s.schemaDefinitionId,`${path}.schemaDefinitionId`)}),
    ...(s.customValues===undefined?{}:{customValues:parseSectionValues(s.customValues,`${path}.customValues`)})};
  return result;
}
export function parseContentItem(raw:unknown,definition:CollectionDefinition,path='item'):ContentItem{
  const r=shape(raw,['contentId','collectionId','schemaVersion','slug','fields','categoryIds','sortOrder',
    'featured','ownerVisibility','searchable','publicFieldIds','aiApprovedFieldIds','createdAt','updatedAt'],path);
  const contentId=anyId(r.contentId,'content',`${path}.contentId`) as ContentId;
  if(r.collectionId!==definition.collectionId)contentIssue(`${path}.collectionId`,'foreign_collection','Item collection does not match its schema.');
  if(r.schemaVersion!==definition.schemaVersion)contentIssue(`${path}.schemaVersion`,'schema_mismatch','Item requires a compatible schema migration.');
  let slug:string|undefined;
  if(r.slug!==undefined){try{slug=parseCanonicalSlug(r.slug);}catch{
    contentIssue(`${path}.slug`,'invalid_slug','A safe route slug is required.');}}
  const fields=shape(r.fields,definition.fields.map(f=>f.fieldId),`${path}.fields`);
  const normalized:Record<string,unknown>=Object.create(null);
  for(const field of definition.fields)if(Object.hasOwn(fields,field.fieldId))
    normalized[field.fieldId]=parseFieldValue(field,fields[field.fieldId],`${path}.fields.${field.fieldId}`,true);
  if(definition.kind==='projects'&&typeof normalized.started_on==='string'&&
    typeof normalized.ended_on==='string'&&normalized.ended_on<normalized.started_on)
    contentIssue(`${path}.fields.ended_on`,'date_range','End date must follow start date.');
  const categories=list(r.categoryIds,20,`${path}.categoryIds`).map((v,i)=>token(v,`${path}.categoryIds.${i}`));
  unique(categories,x=>x,`${path}.categoryIds`);
  for(const c of categories)if(!definition.categories.some(x=>x.categoryId===c))
    contentIssue(`${path}.categoryIds`,'unknown_category','Referenced category is unavailable.');
  const publicFieldIds=list(r.publicFieldIds,20,`${path}.publicFieldIds`).map((x,i)=>
    parseApprovalPath(x,definition.fields,`${path}.publicFieldIds.${i}`).key);
  unique(publicFieldIds,x=>x,`${path}.publicFieldIds`);
  const pathAncestors=(key:string)=>key.split('.').slice(0,-1).map((_,i)=>key.split('.').slice(0,i+1).join('.'));
  for(const key of publicFieldIds){
    const field=locateApprovalField(definition.fields,key)!;
    if(field.publicVisibility!=='owner_choice'||pathAncestors(key).some(a=>
      !publicFieldIds.includes(a)||locateApprovalField(definition.fields,a)?.publicVisibility!=='owner_choice'))
      contentIssue(`${path}.publicFieldIds`,'field_private','Nested public fields need explicitly approved eligible parents.');
  }
  const aiApprovedFieldIds=list(r.aiApprovedFieldIds,20,`${path}.aiApprovedFieldIds`).map((x,i)=>
    parseApprovalPath(x,definition.fields,`${path}.aiApprovedFieldIds.${i}`).key);
  unique(aiApprovedFieldIds,x=>x,`${path}.aiApprovedFieldIds`);
  for(const key of aiApprovedFieldIds){
    if(!publicFieldIds.includes(key)||locateApprovalField(definition.fields,key)?.aiVisibility!=='requires_explicit_approval'||
      pathAncestors(key).some(a=>!aiApprovedFieldIds.includes(a)||
        locateApprovalField(definition.fields,a)?.aiVisibility!=='requires_explicit_approval'))
      contentIssue(`${path}.aiApprovedFieldIds`,'ai_denied','AI needs explicit approval for every nested field path.');
  }
  if(r.ownerVisibility!=='draft_only'&&r.ownerVisibility!=='public_candidate')
    contentIssue(`${path}.ownerVisibility`,'invalid_visibility','Only known visibility values are permitted.');
  let createdAt,updatedAt;
  try{createdAt=parseUtcTimestamp(r.createdAt);updatedAt=parseUtcTimestamp(r.updatedAt);}catch{
    return contentIssue(path,'invalid_time','Valid record timestamps are required.');}
  return {contentId,collectionId:definition.collectionId,schemaVersion:definition.schemaVersion,
    ...(slug?{slug}:{}),fields:normalized,categoryIds:categories,
    sortOrder:integer(r.sortOrder,0,19,`${path}.sortOrder`),featured:flag(r.featured,`${path}.featured`),
    ownerVisibility:r.ownerVisibility as ContentItem['ownerVisibility'],searchable:flag(r.searchable,`${path}.searchable`),
    publicFieldIds,aiApprovedFieldIds,createdAt,updatedAt};
}
export interface LooseContentDraft {profile:Record<string,unknown>;sections:unknown[];collectionDefinitions:unknown[];
  contentCollections:unknown[];nodes:unknown[];mediaRefs:readonly unknown[];}
export function normalizeLegacyHero<T extends LooseContentDraft>(draft:T):T{
  // Issue 5 created a single pre-schema Hero with legacy `fields` and `visibility` properties.
  // Do not interpret other unknown versions; perform a narrowly scoped, deterministic draft-only migration.
  const sections=draft.sections as unknown[];
  if(sections.length!==1)return draft;
  const old=sections[0];
  if(!old||typeof old!=='object'||Array.isArray(old))return draft;
  const v=old as Record<string,unknown>;
  if(v.type!=='hero'||v.visibility!=='draft_private'||Object.keys(v).sort().join(',')!==
    'fields,order,sectionId,type,visibility')return draft;
  try{
    const fields=shape(v.fields,['displayName','identityLabel','introduction'],'legacy.hero.fields');
    if(v.order!==0)return draft;
    if(['displayName','identityLabel','introduction'].some(k=>fields[k]!==draft.profile[k]))return draft;
    const id=parseSectionId(v.sectionId);
    return {...draft,sections:[initialHeroSection(id)]} as T;
  }catch{return draft;}
}
export function parseContentDraft<T extends LooseContentDraft>(raw:T):ContentDraftShape{
  ensureJson({profile:raw.profile,sections:raw.sections,collectionDefinitions:raw.collectionDefinitions,
    contentCollections:raw.contentCollections,nodes:raw.nodes,mediaRefs:raw.mediaRefs},'draft.content',16,350_000);
  const draft=normalizeLegacyHero(raw);
  const profile=shape(draft.profile,['displayName','identityLabel','introduction'],'profile');
  const typedProfile:Record<string,unknown>=Object.create(null);
  for(const key of ['displayName','identityLabel','introduction'] as const)
    if(profile[key]!==undefined)typedProfile[key]=string(profile[key],key==='introduction'?800:key==='identityLabel'?120:100,`profile.${key}`);
  const sections=list(draft.sections,100,'sections').map((x,i)=>parseSection(x,`sections.${i}`));
  if(!sections.length||sections[0].type!=='hero'||sections[0].order!==0||
    sections.filter(x=>x.type==='hero').length!==1)
    contentIssue('sections','hero_required','Exactly one first-position Hero section is required.');
  unique(sections,x=>x.sectionId,'sections');unique(sections,x=>x.publicAnchor,'sections');
  if(sections.some((s,i)=>s.order!==i))contentIssue('sections','section_order','Section order must be consecutive starting with Hero.');
  const collectionDefinitions=list(draft.collectionDefinitions,100,'collectionDefinitions')
    .map((x,i)=>parseCollectionDefinition(x,`collectionDefinitions.${i}`));
  unique(collectionDefinitions,x=>x.collectionId,'collectionDefinitions');
  unique(collectionDefinitions,x=>x.schemaId,'collectionDefinitions');
  for(const definition of collectionDefinitions){
    if(definition.sectionId&&!sections.some(s=>s.sectionId===definition.sectionId))
      contentIssue('collectionDefinitions','missing_section','Collection section does not exist.');
  }
  for(const section of sections){
    const def=collectionDefinitions.find(x=>x.schemaId===section.schemaDefinitionId);
    if(section.schemaDefinitionId&&!def)contentIssue('sections','missing_schema','Custom section schema does not exist.');
    if(section.type==='custom'&&!section.schemaDefinitionId)contentIssue('sections','missing_schema','Custom sections require a schema.');
    const fields=def?.fields??[];
    if(section.customValues){
      const rawFields=shape(section.customValues,fields.map(x=>x.fieldId),`sections.${section.order}.customValues`);
      const normalizedFields:Record<string,unknown>=Object.create(null);
      for(const [key,val] of Object.entries(rawFields)){
        const field=fields.find(x=>x.fieldId===key)!;
        normalizedFields[key]=parseFieldValue(field,val,`sections.${section.order}.customValues.${key}`,true);
      }
      section.customValues=normalizedFields;
    }
  }
  const contentCollections=list(draft.contentCollections,100,'contentCollections').map((x,i):ContentCollection=>{
    const path=`contentCollections.${i}`;const r=shape(x,['collectionId','items'],path);
    const collectionId=token(r.collectionId,`${path}.collectionId`);
    const def=collectionDefinitions.find(d=>d.collectionId===collectionId);
    if(!def)contentIssue(`${path}.collectionId`,'missing_schema','Collection definition not found.');
    const items=list(r.items,PRODUCT_LIMITS.collectionItems,`${path}.items`)
      .map((entry,index)=>parseContentItem(entry,def!,`${path}.items.${index}`));
    unique(items,x=>x.contentId,`${path}.items`);
    if(items.some((item,index)=>item.sortOrder!==index))contentIssue(`${path}.items`,'item_order','Item order must be consecutive.');
    if(def!.kind==='projects'){
      const slugs=items.filter(x=>x.slug).map(x=>x.slug!);unique(slugs,x=>x,`${path}.items.slug`);
    }
    return {collectionId,items};
  });
  unique(contentCollections,x=>x.collectionId,'contentCollections');
  // Stable IDs must be unique across every collection, not merely inside one list.
  unique(contentCollections.flatMap(c=>c.items),x=>x.contentId,'contentCollections.items');
  const nodes=list(draft.nodes,PRODUCT_LIMITS.authoredVisualNodesPerPortfolio,'nodes');
  try{validateAuthoredNodes(nodes as Parameters<typeof validateAuthoredNodes>[0]);}
  catch{contentIssue('nodes','block_limit','Authored nodes exceed safety limits.');}
  // Canonical Issue 7 graphs are strictly validated; exact Issue 6 reference stubs remain
  // private/editable until converted and may NOT be compiled into a public release.
  const composition=parseCompositionNodes(nodes,sections,{allowLegacy:true});
  const canonicalById=new Map(composition.nodes.map(n=>[n.nodeId,n] as const));
  const parsedNodes=nodes.map(n=>canonicalById.get((n as {nodeId:string}).nodeId as never)??n);
  const mediaRefs=list(draft.mediaRefs,PRODUCT_LIMITS.originalMediaFilesPerPortfolio,'mediaRefs').map((m,i)=>
    anyId(m,'media',`mediaRefs.${i}`) as MediaId);
  unique(mediaRefs,x=>x,'mediaRefs');
  const result:ContentDraftShape={profile:typedProfile,sections,collectionDefinitions,contentCollections,nodes:parsedNodes,mediaRefs};
  validateReferenceGraph(result);
  return result;
}
export function validateForPublication(source:ContentDraftShape):void{
  const draft=parseContentDraft(source);
  if(!draft.sections[0].visible)contentIssue('sections.0.visible','hero_required','The published Hero must be visible.');
  for(const name of ['displayName','identityLabel','introduction']){
    const value=draft.profile[name];
    if(typeof value!=='string'||!value.trim())contentIssue(`profile.${name}`,'publish_required','Hero profile field is required to publish.');
  }
  for(const [i,c] of draft.contentCollections.entries()){
    const def=draft.collectionDefinitions.find(d=>d.collectionId===c.collectionId)!;
    for(const [j,item] of c.items.entries()){
      if(item.ownerVisibility!=='public_candidate')continue;
      for(const field of def.fields)if(field.required&&item.fields[field.fieldId]===undefined)
        contentIssue(`contentCollections.${i}.items.${j}.fields.${field.fieldId}`,'publish_required','Required public field is missing.');
    }
  }
}
export function parseContentBinding(raw:unknown,path:string):ContentBinding{
  const r=shape(raw,['source','collectionId','contentId','fieldId','derivedKey','fallback'],path);
  if(!['profile','collectionItem','collection','derived'].includes(String(r.source)))
    contentIssue(path,'binding_source','Unsupported binding source.');
  const source=r.source as ContentBinding['source'];
  const binding:ContentBinding={source};
  if(source==='collection'||source==='collectionItem')binding.collectionId=token(r.collectionId,`${path}.collectionId`);
  else if(r.collectionId!==undefined)contentIssue(path,'binding_source','Collection is not used by this binding.');
  if(source==='collectionItem')binding.contentId=anyId(r.contentId,'content',`${path}.contentId`) as ContentId;
  else if(r.contentId!==undefined)contentIssue(path,'binding_source','Item identity is not used by this binding.');
  if(r.fieldId!==undefined){
    if(source==='profile'){
      if(!['displayName','identityLabel','introduction'].includes(String(r.fieldId)))
        contentIssue(`${path}.fieldId`,'invalid_profile_field','Only approved Hero profile fields can be bound.');
      binding.fieldId=r.fieldId as string;
    }else binding.fieldId=token(r.fieldId,`${path}.fieldId`);
  }
  if(source==='derived'){
    if(!['experienceDuration','projectDuration','formattedDate'].includes(String(r.derivedKey)))
      contentIssue(path,'binding_derived','Unsupported derived value.');
    binding.derivedKey=r.derivedKey as ContentBinding['derivedKey'];
  }else if(r.derivedKey!==undefined)contentIssue(path,'binding_derived','Derived key cannot be used here.');
  if(r.fallback!==undefined)binding.fallback=string(r.fallback,200,`${path}.fallback`);
  return binding;
}
function extractBindings(nodes:unknown[]):{nodeId:string;binding:ContentBinding}[]{
  const result:{nodeId:string;binding:ContentBinding}[]=[];
  for(const [index,raw] of nodes.entries()){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))contentIssue(`nodes.${index}`,'node_shape','Invalid node.');
    const node=raw as Record<string,unknown>;
    if(node.contentBinding!==undefined){
      const nodeId=string(node.nodeId,80,`nodes.${index}.nodeId`,1);
      result.push({nodeId,binding:parseContentBinding(node.contentBinding,`nodes.${index}.contentBinding`)});
    }
  }
  return result;
}
function itemIndex(source:ContentDraftShape){
  return new Map(source.contentCollections.flatMap(c=>c.items.map(item=>[item.contentId,
    {item,definition:source.collectionDefinitions.find(d=>d.collectionId===c.collectionId)!}] as const)));
}
function eachRelation(field:FieldDefinition,value:unknown,cb:(id:ContentId,targetCollectionId:string)=>void):void{
  if(value===undefined||value===null)return;
  if(field.type==='relation'){
    for(const target of Array.isArray(value)?value:[value])cb(target as ContentId,field.targetCollectionId!);
  }else if(field.type==='object'){
    const rec=value as Record<string,unknown>;
    for(const nested of field.fields??[])eachRelation(nested,rec[nested.fieldId],cb);
  }else if(field.type==='list'){
    for(const item of value as unknown[])eachRelation(field.item!,item,cb);
  }
}
export function validateReferenceGraph(source:ContentDraftShape):void{
  const indexed=itemIndex(source);const graph=new Map<string,string[]>();
  for(const {item,definition} of indexed.values()){
    const edges:string[]=[];
    for(const field of definition.fields)eachRelation(field,item.fields[field.fieldId],(id,collectionId)=>{
      const target=indexed.get(id);
      if(!target||target.item.collectionId!==collectionId)
        contentIssue(`items.${item.contentId}.fields.${field.fieldId}`,'foreign_relation','Relation target is missing or outside this portfolio and collection.');
      edges.push(id);
    });
    graph.set(item.contentId,edges);
  }
  // Longest directed path with memoization: a previously inspected shared node
  // cannot hide a deeper path reached from a different root. Cycles fail closed.
  const active=new Set<string>(),longest=new Map<string,number>();
  const walk=(id:string):number=>{
    if(active.has(id))contentIssue(`items.${id}`,'reference_cycle','Cyclic content relationships are not allowed.');
    const cached=longest.get(id);if(cached!==undefined)return cached;
    active.add(id);
    let depth=0;
    for(const neighbor of graph.get(id)??[])depth=Math.max(depth,1+walk(neighbor));
    active.delete(id);
    if(depth>3)contentIssue(`items.${id}`,'relation_depth','Relationship traversal exceeds three hops.');
    longest.set(id,depth);return depth;
  };
  for(const id of graph.keys())walk(id);
  // Section-local reusable values are also first-class relations, not a bypass.
  for(const section of source.sections){
    const def=source.collectionDefinitions.find(x=>x.schemaId===section.schemaDefinitionId);
    if(!def||!section.customValues)continue;
    for(const field of def.fields)eachRelation(field,section.customValues[field.fieldId],(id,collectionId)=>{
      const target=indexed.get(id);
      if(!target||target.item.collectionId!==collectionId)
        contentIssue(`sections.${section.sectionId}.customValues.${field.fieldId}`,'foreign_relation',
          'A section relation must target an item in this portfolio and collection.');
    });
  }
  for(const {nodeId,binding} of extractBindings(source.nodes)){
    if(binding.source==='collection'||binding.source==='collectionItem'){
      const def=source.collectionDefinitions.find(x=>x.collectionId===binding.collectionId);
      if(!def)contentIssue(`nodes.${nodeId}`,'missing_collection','Binding collection is missing.');
      if(binding.source==='collectionItem'){
        const target=indexed.get(binding.contentId!);
        if(!target||target.item.collectionId!==binding.collectionId)
          contentIssue(`nodes.${nodeId}`,'missing_item','Binding target is missing or belongs to another collection.');
      }
      if(binding.fieldId&&!def!.fields.some(f=>f.fieldId===binding.fieldId))
        contentIssue(`nodes.${nodeId}`,'missing_field','Binding field does not exist.');
    }
  }
}
export function deletionImpact(raw:ContentDraftShape,contentId:ContentId):DeletionImpact{
  const source=parseContentDraft(raw);
  const indexed=itemIndex(source);
  if(!indexed.has(contentId))contentIssue('contentId','missing_item','Item does not exist.');
  const usedByItems:string[]=[],usedBySections:string[]=[],usedByNodes:string[]=[];
  for(const {item,definition} of indexed.values()){
    if(item.contentId===contentId)continue;
    for(const field of definition.fields)eachRelation(field,item.fields[field.fieldId],id=>{
      if(id===contentId)usedByItems.push(item.contentId);
    });
  }
  for(const sec of source.sections){
    const def=source.collectionDefinitions.find(x=>x.schemaId===sec.schemaDefinitionId);
    for(const field of def?.fields??[])eachRelation(field,sec.customValues?.[field.fieldId],id=>{
      if(id===contentId)usedBySections.push(sec.sectionId);
    });
  }
  for(const {nodeId,binding} of extractBindings(source.nodes))if(binding.contentId===contentId)usedByNodes.push(nodeId);
  return {contentId,usedByItems:[...new Set(usedByItems)],usedByNodes:[...new Set(usedByNodes)],
    usedBySections:[...new Set(usedBySections)],canDelete:!usedByItems.length&&!usedByNodes.length&&!usedBySections.length};
}
/** Explicit positive field projection. This DOES NOT authorize public delivery;
 * Issue 13 must compile and pin an immutable release and re-check current policy.
 * Deep field paths and media are each independently allowlisted, even inside lists.
 */
export function projectEligibleContent(raw:ContentDraftShape,requests:readonly {sectionId:SectionId;binding:ContentBinding}[],
  purpose:VisibilityUse,approvedMediaIds:ReadonlySet<string>=new Set()):ProjectionCandidates{
  const source=parseContentDraft(raw),indexed=itemIndex(source);const result:ContentCandidate[]=[];
  const select=(field:FieldDefinition,value:unknown,path:string,item:ContentItem):unknown=>{
    if(value===undefined||field.publicVisibility!=='owner_choice'||!item.publicFieldIds.includes(path)||
      (purpose==='search'&&!field.searchable)||
      (purpose==='ai'&&(field.aiVisibility!=='requires_explicit_approval'||!item.aiApprovedFieldIds.includes(path))))
      return undefined;
    if(field.type==='image'||field.type==='pdf')return approvedMediaIds.has((value as {mediaId:string}).mediaId)?value:undefined;
    if(field.type==='relation'){
      const available=(Array.isArray(value)?value:[value]).filter(id=>
        indexed.get(id as ContentId)?.item.ownerVisibility==='public_candidate');
      return available.length?available:undefined;
    }
    if(field.type==='object'){
      const output:Record<string,unknown>=Object.create(null);
      for(const child of field.fields??[]){
        const nested=select(child,(value as Record<string,unknown>)[child.fieldId],`${path}.${child.fieldId}`,item);
        if(nested!==undefined)output[child.fieldId]=nested;
      }
      return Object.keys(output).length?output:undefined;
    }
    if(field.type==='list'){
      const projected=(value as unknown[]).map(v=>select(field.item!,v,`${path}.${field.item!.fieldId}`,item))
        .filter(v=>v!==undefined);
      return projected.length?projected:undefined;
    }
    return value;
  };
  for(const [i,{sectionId,binding}] of requests.entries()){
    const section=source.sections.find(x=>x.sectionId===sectionId);
    if(!section||!section.visible||(purpose==='search'&&!section.searchEligible)||
      (purpose==='ai'&&!section.aiSectionApproved))continue;
    const selection=parseContentBinding(binding,`projection.requests.${i}`);
    if(selection.source==='profile'){
      const allowed=['displayName','identityLabel','introduction'];
      if(selection.fieldId&&!allowed.includes(selection.fieldId))continue;
      if(section.type!=='hero')continue;
      const fields:Record<string,unknown>=Object.create(null);
      for(const f of allowed)if((!selection.fieldId||selection.fieldId===f)&&typeof source.profile[f]==='string')
        fields[f]=source.profile[f];
      if(Object.keys(fields).length)result.push({source:'profile',sourceId:section.sectionId,fields});
      continue;
    }
    if(!['collection','collectionItem'].includes(selection.source))continue;
    const def=source.collectionDefinitions.find(x=>x.collectionId===selection.collectionId);
    const entries=source.contentCollections.find(x=>x.collectionId===selection.collectionId)?.items??[];
    if(!def)continue;
    for(const item of entries){
      if(selection.contentId&&selection.contentId!==item.contentId)continue;
      if(item.ownerVisibility!=='public_candidate'||(purpose==='search'&&!item.searchable))continue;
      const fields:Record<string,unknown>=Object.create(null);
      for(const field of def.fields){
        if(selection.fieldId&&selection.fieldId!==field.fieldId)continue;
        const selected=select(field,item.fields[field.fieldId],field.fieldId,item);
        if(selected!==undefined)fields[field.fieldId]=selected;
      }
      if(Object.keys(fields).length)result.push({source:'collectionItem',sourceId:item.contentId,
        collectionId:def.collectionId,fields});
    }
  }
  return {contentContractVersion:1,purpose,items:result};
}
