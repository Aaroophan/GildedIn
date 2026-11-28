/** Preview-first schema migrations. Unknown changes never rewrite an immutable release. */
import {canonicalJson} from '../../shared/domain/limits.ts';
import {parseContentDraft,locateApprovalField} from './model.ts';
import type {LooseContentDraft} from './model.ts';
import {parseCollectionDefinition,parseFieldValue} from './schema.ts';
import {contentIssue,ContentDenied} from './errors.ts';
import type {ContentDraftShape,CollectionDefinition,SchemaImpact,FieldDefinition} from './types.ts';
async function digest(data:unknown):Promise<string>{
  const buffer=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalJson(data)));
  return Array.from(new Uint8Array(buffer),n=>n.toString(16).padStart(2,'0')).join('');
}
/** Requires the caller's latest draft revision to fence approval from earlier editing tabs. */
export async function previewSchemaChange(source:LooseContentDraft,raw:unknown,revision:number):Promise<SchemaImpact>{
  if(!Number.isSafeInteger(revision)||revision<0)contentIssue('revision','invalid_revision','Revision is required.');
  const draft=parseContentDraft(source);
  const updated=parseCollectionDefinition(raw,'schema.candidate');
  const previous=draft.collectionDefinitions.find(d=>d.collectionId===updated.collectionId);
  if(!previous)contentIssue('schema.collectionId','missing_collection','Collection does not exist.');
  if(updated.schemaId!==previous!.schemaId||updated.kind!==previous!.kind||
    updated.schemaVersion!==previous!.schemaVersion+1)
    contentIssue('schema.schemaVersion','migration_version','Keep the same schema identity and increment by one.');
  const items=draft.contentCollections.find(c=>c.collectionId===updated.collectionId)?.items??[];
  const newFields=new Map(updated.fields.map(f=>[f.fieldId,f]));
  const oldFields=new Map(previous!.fields.map(f=>[f.fieldId,f]));
  const changedFieldIds:string[]=[],lostFieldIds:string[]=[],affectedPaths:string[]=[];
  let destructive=false;
  for(const old of previous!.fields){
    const next=newFields.get(old.fieldId);
    if(!next){lostFieldIds.push(old.fieldId);changedFieldIds.push(old.fieldId);
      for(const item of items)if(item.fields[old.fieldId]!==undefined)affectedPaths.push(`${item.contentId}.${old.fieldId}`);
      if(items.some(i=>i.fields[old.fieldId]!==undefined))destructive=true;
      continue;
    }
    // Only a rename of name/label/description or widening of value-compatible bounds is lossless.
    if(old.type!==next.type||old.targetCollectionId!==next.targetCollectionId||
      old.publicVisibility!==next.publicVisibility||old.aiVisibility!==next.aiVisibility||
      old.searchable!==next.searchable||old.required!==next.required||
      canonicalJson(old.options??[])!==canonicalJson(next.options??[])||
      canonicalJson(old.fields??[])!==canonicalJson(next.fields??[])||
      canonicalJson(old.item??null)!==canonicalJson(next.item??null)||
      canonicalJson(old.validation??{})!==canonicalJson(next.validation??{})){
      changedFieldIds.push(old.fieldId);
      for(const item of items){const val=item.fields[old.fieldId];if(val!==undefined){
        try {parseFieldValue(next,val,`impact.${item.contentId}.${old.fieldId}`,true);}
        catch {destructive=true;affectedPaths.push(`${item.contentId}.${old.fieldId}`);}
      }}
      // Removing public or AI visibility is safe (will revoke); opening access does not auto-approve.
      if(old.type!==next.type||old.targetCollectionId!==next.targetCollectionId)destructive=true;
    }
  }
  for(const added of updated.fields.filter(f=>!oldFields.has(f.fieldId))){
    if(added.required&&!Object.hasOwn(added,'defaultValue')){
      destructive=true;changedFieldIds.push(added.fieldId);
      for(const item of items)affectedPaths.push(`${item.contentId}.${added.fieldId}`);
    }
  }
  const affected=new Set(affectedPaths.map(p=>p.split('.')[0]));
  const dependentNodeIds=draft.nodes.flatMap(raw=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return [];
    const n=raw as Record<string,unknown>,binding=n.contentBinding as Record<string,unknown>|undefined;
    return binding?.collectionId===updated.collectionId&&typeof n.nodeId==='string'?[n.nodeId]:[];
  });
  const confirmationHash=await digest({revision,previous,updated,items});
  return {schemaId:updated.schemaId,fromVersion:previous!.schemaVersion,toVersion:updated.schemaVersion,
    compatible:!destructive,destructive,affectedItems:affected.size,affectedPaths:affectedPaths.slice(0,80),
    dependentNodeIds:dependentNodeIds.slice(0,30),lostFieldIds,changedFieldIds,confirmationHash};
}
/** Modifies one in-memory candidate; the caller must commit it with CAS or not at all. */
export async function migrateSchema(source:LooseContentDraft,raw:unknown,revision:number,confirmation?:string):
  Promise<{candidate:ContentDraftShape;impact:SchemaImpact}>{
  const draft=parseContentDraft(source);
  const updated=parseCollectionDefinition(raw,'schema.candidate');
  const impact=await previewSchemaChange(draft,updated,revision);
  if(impact.destructive&&confirmation!==impact.confirmationHash)
    throw new ContentDenied('CONTENT_MIGRATION_CONFIRMATION_REQUIRED',
      [{path:'schema',code:'confirm_impact',message:'Review and explicitly confirm the migration impact.'}]);
  const copy=structuredClone(draft);
  const pos=copy.collectionDefinitions.findIndex(d=>d.collectionId===updated.collectionId);
  copy.collectionDefinitions[pos]=updated;
  const newFields=new Map(updated.fields.map(f=>[f.fieldId,f]));
  const records=copy.contentCollections.find(c=>c.collectionId===updated.collectionId);
  if(records)for(const item of records.items){
    const fields:Record<string,unknown>=Object.create(null);
    for(const [key,val] of Object.entries(item.fields)){
      const next=newFields.get(key);if(!next)continue;
      try{fields[key]=parseFieldValue(next,val,`items.${item.contentId}.${key}`,true);}
      catch{if(!impact.destructive)throw new ContentDenied('CONTENT_INVALID');}
    }
    item.fields=fields;item.schemaVersion=updated.schemaVersion;
    const ancestors=(id:string)=>id.split('.').slice(0,-1).map((_,i)=>id.split('.').slice(0,i+1).join('.'));
    const previousPublic=new Set(item.publicFieldIds);
    item.publicFieldIds=item.publicFieldIds.filter(id=>locateApprovalField(updated.fields,id)?.publicVisibility==='owner_choice'&&
      ancestors(id).every(parent=>previousPublic.has(parent)&&
        locateApprovalField(updated.fields,parent)?.publicVisibility==='owner_choice'));
    const previousAi=new Set(item.aiApprovedFieldIds);
    item.aiApprovedFieldIds=item.aiApprovedFieldIds.filter(id=>item.publicFieldIds.includes(id)&&
      locateApprovalField(updated.fields,id)?.aiVisibility==='requires_explicit_approval'&&
      ancestors(id).every(parent=>previousAi.has(parent)&&item.publicFieldIds.includes(parent)&&
        locateApprovalField(updated.fields,parent)?.aiVisibility==='requires_explicit_approval'));
  }
  return {candidate:parseContentDraft(copy),impact};
}
