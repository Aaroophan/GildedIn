/** Built-in developer portfolio project schema and safe case-study helpers. */
import {parseCanonicalSlug} from '../../shared/domain/validation.ts';
import {parseContentId} from '../../shared/domain/identifiers.ts';
import type {ContentId} from '../../shared/domain/identifiers.ts';
import {parseRichText} from './rich-text.ts';
import {parseCollectionDefinition,parseFieldValue} from './schema.ts';
import {contentIssue} from './errors.ts';
import {shape,string,token,list,flag,dateOnly,safeHttps} from './strict.ts';
import type {CollectionDefinition,FieldDefinition} from './types.ts';
function basic(id:string,type:FieldDefinition['type'],required=false):FieldDefinition{
  return {fieldId:id,name:id,label:id.replace(/_/g,' ').replace(/\b\w/g,x=>x.toUpperCase()),
    type,required,publicVisibility:'owner_choice',aiVisibility:'requires_explicit_approval',searchable:type==='text'};
}
/** One canonical project collection can appear in many draft bindings. */
export function projectCollectionDefinition(collectionId='projects',schemaVersion=1,sectionId?:string):CollectionDefinition{
  const fields:FieldDefinition[]=[
    {...basic('title','text',true),validation:{minLength:1,maxLength:160}},
    {...basic('summary','text'),validation:{maxLength:600}},
    {...basic('role','text'),validation:{maxLength:160}},
    {...basic('technologies','list'),item:{...basic('technology','text'),validation:{maxLength:64}},
      validation:{maxItems:20}},
    basic('started_on','date'),basic('ended_on','date'),
    {...basic('source_url','url'),searchable:false},
    {...basic('demo_url','url'),searchable:false},
    {...basic('gallery','list'),item:basic('image','image'),validation:{maxItems:10},searchable:false},
    ...(['problem','architecture','implementation','challenges','results','lessons'] as const)
      .map(id=>({...basic(id,'richText'),searchable:false}))
  ];
  return parseCollectionDefinition({collectionId,schemaId:`${collectionId}_schema`,schemaVersion,
    displayName:'Projects',kind:'projects',itemsLimit:20,fields,categories:[],...(sectionId?{sectionId}:{})});
}
export function suggestProjectSlug(rawTitle:unknown,existing:ReadonlySet<string>=new Set()):string{
  const title=string(rawTitle,160,'project.title',1);
  const clean=title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30).replace(/-+$/,'');
  if(clean.length<3)contentIssue('project.slug','unavailable_slug','Provide a longer ASCII title or a manual slug.');
  for(let i=1;i<=100;i++){
    const suffix=i===1?'':`-${i}`;
    const candidate=clean.slice(0,30-suffix.length).replace(/-+$/,'')+suffix;
    try {const slug=parseCanonicalSlug(candidate);if(!existing.has(slug))return slug;}catch{continue;}
  }
  return contentIssue('project.slug','slug_conflict','No available project slug was found.');
}
/** Case study fields are pure data; no fabricated outcomes, ratings or inferred attribution. */
export function parseProjectCaseStudy(raw:unknown,definition:CollectionDefinition=projectCollectionDefinition()):
  {contentId:ContentId;slug:string;fields:Record<string,unknown>;categoryIds:string[];featured:boolean}{
  if(definition.kind!=='projects')contentIssue('project','invalid_collection','A project schema is required.');
  const p=shape(raw,['contentId','slug','title','summary','role','technologies','startedOn','endedOn',
    'sourceUrl','demoUrl','gallery','problem','architecture','implementation','challenges','results','lessons',
    'categoryIds','featured'],'project');
  let contentId;try{contentId=parseContentId(p.contentId);}catch{return contentIssue('project.contentId','invalid_id','A stable ID is required.');}
  let slug;try{slug=parseCanonicalSlug(p.slug);}catch{return contentIssue('project.slug','invalid_slug','A valid case-study slug is required.');}
  const fields:Record<string,unknown>=Object.create(null);
  const naming:Record<string,string>={title:'title',summary:'summary',role:'role',technologies:'technologies',
    startedOn:'started_on',endedOn:'ended_on',sourceUrl:'source_url',demoUrl:'demo_url',gallery:'gallery',
    problem:'problem',architecture:'architecture',implementation:'implementation',challenges:'challenges',results:'results',lessons:'lessons'};
  for(const [key,fieldId] of Object.entries(naming))if(p[key]!==undefined){
    const field=definition.fields.find(f=>f.fieldId===fieldId);
    if(!field)contentIssue(`project.${key}`,'schema_mismatch','Project schema is missing a field.');
    fields[fieldId]=parseFieldValue(field!,p[key],`project.${key}`,true);
  }
  if(p.title===undefined||!(p.title as string).trim())contentIssue('project.title','missing_title','A title is required.');
  if(fields.started_on&&fields.ended_on&&(fields.ended_on as string)<(fields.started_on as string))
    contentIssue('project.endedOn','date_range','End date must follow start date.');
  const categoryIds=list(p.categoryIds??[],20,'project.categoryIds').map((c,i)=>token(c,`project.categoryIds.${i}`));
  if(new Set(categoryIds).size!==categoryIds.length)contentIssue('project.categoryIds','duplicate_category','Repeated category.');
  return {contentId,slug,fields,categoryIds,featured:p.featured===undefined?false:flag(p.featured,'project.featured')};
}
