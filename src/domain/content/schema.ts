/** Strict, versioned schema/field registry. Import is data conversion, never JSON Schema execution. */
import {PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
import {parseMediaId,parseContentId,parseSectionId} from '../../shared/domain/identifiers.ts';
import {parseRichText} from './rich-text.ts';
import {contentIssue} from './errors.ts';
import {list,shape,string,integer,flag,token,unique,ensureJson,dateOnly,safeHttps} from './strict.ts';
import type {FieldDefinition,FieldType,FieldValidation,FieldOption,CollectionDefinition,CategoryDefinition} from './types.ts';
import {FIELD_TYPES} from './types.ts';

function choice<T extends string>(v:unknown,values:readonly T[],path:string):T{
  if(typeof v!=='string'||!values.includes(v as T))return contentIssue(path,'invalid_choice','Unsupported choice.');
  return v as T;
}
function parseValidation(raw:unknown,type:FieldType,path:string):FieldValidation{
  const v=shape(raw,['minLength','maxLength','minimum','maximum','precision','minItems','maxItems','allowedSchemes'],path);
  const result:FieldValidation={};
  for(const [key,maximum] of [['minLength',10000],['maxLength',10000],['minItems',20],['maxItems',20],['precision',8]] as const)
    if(v[key]!==undefined)result[key]=integer(v[key],0,maximum,`${path}.${key}`);
  for(const key of ['minimum','maximum'] as const)if(v[key]!==undefined){
    const x=v[key];if(typeof x!=='number'||!Number.isFinite(x)||Math.abs(x)>1e12)
      contentIssue(`${path}.${key}`,'invalid_number','A finite bound is required.');
    result[key]=x as number;
  }
  if(result.minLength!==undefined&&result.maxLength!==undefined&&result.minLength>result.maxLength)
    contentIssue(path,'inverted_bounds','Minimum exceeds maximum.');
  if(result.minItems!==undefined&&result.maxItems!==undefined&&result.minItems>result.maxItems)
    contentIssue(path,'inverted_bounds','Minimum exceeds maximum.');
  if(result.minimum!==undefined&&result.maximum!==undefined&&result.minimum>result.maximum)
    contentIssue(path,'inverted_bounds','Minimum exceeds maximum.');
  if(v.allowedSchemes!==undefined){
    if(type!=='url')contentIssue(path,'invalid_validation','Schemes are only available for URLs.');
    result.allowedSchemes=list(v.allowedSchemes,2,`${path}.allowedSchemes`).map((x,i)=>
      choice(x,['https'] as const,`${path}.allowedSchemes.${i}`));
    if(result.allowedSchemes.length!==1)contentIssue(path,'invalid_validation','Only HTTPS is supported.');
  }
  if((result.minItems!==undefined||result.maxItems!==undefined)&&type!=='list')contentIssue(path,'invalid_validation','List limits require a list.');
  if((result.minLength!==undefined||result.maxLength!==undefined)&&!['text','email'].includes(type))
    contentIssue(path,'invalid_validation','Text bounds require text or email.');
  if((result.minimum!==undefined||result.maximum!==undefined||result.precision!==undefined)&&type!=='number')
    contentIssue(path,'invalid_validation','Numeric bounds require a number.');
  return result;
}
export function parseFieldDefinition(raw:unknown,path='field',depth=0):FieldDefinition{
  ensureJson(raw,path,12,30_000);
  const f=shape(raw,['fieldId','name','label','description','type','required','publicVisibility',
    'aiVisibility','searchable','validation','defaultValue','options','fields','item','targetCollectionId'],path);
  const type=choice(f.type,FIELD_TYPES,`${path}.type`);
  const fieldId=token(f.fieldId,`${path}.fieldId`);
  const name=token(f.name,`${path}.name`);
  const label=string(f.label,120,`${path}.label`,1);
  if(!label.trim())contentIssue(`${path}.label`,'empty_label','A field label is required.');
  const required=flag(f.required,`${path}.required`);
  const publicVisibility=choice(f.publicVisibility,['private','owner_choice'] as const,`${path}.publicVisibility`);
  const aiVisibility=choice(f.aiVisibility,['denied','requires_explicit_approval'] as const,`${path}.aiVisibility`);
  const searchable=flag(f.searchable,`${path}.searchable`);
  if(publicVisibility==='private'&&(searchable||aiVisibility!=='denied'))
    contentIssue(path,'private_field','Private fields cannot be indexed or AI-approved.');
  const validation=f.validation===undefined?undefined:parseValidation(f.validation,type,`${path}.validation`);
  const result:FieldDefinition={fieldId,name,label,type,required,publicVisibility,aiVisibility,searchable,
    ...(f.description===undefined?{}:{description:string(f.description,500,`${path}.description`)}),
    ...(validation?{validation}:{})};
  if(type==='object'){
    if(depth+1>PRODUCT_LIMITS.schemaNestingDepth)contentIssue(path,'depth_limit','Only three nested schema containers are supported.');
    const fields=list(f.fields,PRODUCT_LIMITS.customFieldsPerSection,`${path}.fields`)
      .map((x,i)=>parseFieldDefinition(x,`${path}.fields.${i}`,depth+1));
    unique(fields,x=>x.fieldId,`${path}.fields`);unique(fields,x=>x.name,`${path}.fields`);
    result.fields=fields;
  }else if(f.fields!==undefined)contentIssue(path,'invalid_field','Nested fields require object type.');
  if(type==='list'){
    if(depth+1>PRODUCT_LIMITS.schemaNestingDepth)contentIssue(path,'depth_limit','Only three nested schema containers are supported.');
    if(f.item===undefined)contentIssue(`${path}.item`,'missing_item','Lists require a typed item.');
    result.item=parseFieldDefinition(f.item,`${path}.item`,depth+1);
  }else if(f.item!==undefined)contentIssue(path,'invalid_field','Items require list type.');
  if(type==='select'){
    const options=list(f.options,20,`${path}.options`).map((x,i):FieldOption=>{
      const v=shape(x,['optionId','label'],`${path}.options.${i}`);
      return {optionId:token(v.optionId,`${path}.options.${i}.optionId`),
        label:string(v.label,100,`${path}.options.${i}.label`,1)};
    });
    if(!options.length)contentIssue(path,'missing_options','Select fields require options.');
    unique(options,x=>x.optionId,`${path}.options`);
    result.options=options;
  }else if(f.options!==undefined)contentIssue(path,'invalid_field','Options require select type.');
  if(type==='relation'){
    result.targetCollectionId=token(f.targetCollectionId,`${path}.targetCollectionId`);
  }else if(f.targetCollectionId!==undefined)contentIssue(path,'invalid_field','Only relations can have target collection.');
  if(f.defaultValue!==undefined){
    result.defaultValue=parseFieldValue(result,f.defaultValue,`${path}.defaultValue`,true);
  }
  return result;
}
export function parseFieldValue(field:FieldDefinition,raw:unknown,path:string,allowMissing=false):unknown{
  if(raw===undefined){if(allowMissing)return undefined;return contentIssue(path,'missing_field','Field value is missing.');}
  const rules=field.validation??{};
  if(field.type==='text'||field.type==='email'){
    const value=string(raw,rules.maxLength??(field.type==='email'?254:10000),path,rules.minLength??0);
    if(field.type==='email'&&value&&!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,63}$/i.test(value))
      contentIssue(path,'invalid_email','A valid email address is required.');
    return value;
  }
  if(field.type==='url')return safeHttps(raw,path);
  if(field.type==='richText')return parseRichText(raw,path);
  if(field.type==='date')return dateOnly(raw,path);
  if(field.type==='number'){
    if(typeof raw!=='number'||!Number.isFinite(raw)||(rules.minimum!==undefined&&raw<rules.minimum)||
      (rules.maximum!==undefined&&raw>rules.maximum)||Math.abs(raw)>1e12)
      return contentIssue(path,'invalid_number','A finite number inside its bounds is required.');
    if(rules.precision!==undefined&&Math.abs(raw-Math.round(raw*10**rules.precision)/10**rules.precision)>1e-9)
      return contentIssue(path,'invalid_precision','Number has too many decimal places.');
    return raw;
  }
  if(field.type==='boolean')return flag(raw,path);
  if(field.type==='image'||field.type==='pdf'){
    const m=shape(raw,['mediaId','alt','caption','label'],path);
    let id;try{id=parseMediaId(m.mediaId);}catch{return contentIssue(`${path}.mediaId`,'invalid_media','A valid media ID is required.');}
    if(field.type==='image'){
      const alt=string(m.alt,250,`${path}.alt`);
      return {mediaId:id,alt,...(m.caption===undefined?{}:{caption:string(m.caption,250,`${path}.caption`)})};
    }
    const label=string(m.label,180,`${path}.label`,1);
    return {mediaId:id,label};
  }
  if(field.type==='select'){
    if(typeof raw!=='string'||!field.options?.some(o=>o.optionId===raw))
      return contentIssue(path,'unknown_option','Value is not a configured option.');
    return raw;
  }
  if(field.type==='list'){
    const values=list(raw,rules.maxItems??20,path);
    if(values.length<(rules.minItems??0))contentIssue(path,'too_few_items','More items are required.');
    return values.map((x,i)=>parseFieldValue(field.item!,x,`${path}.${i}`));
  }
  if(field.type==='object'){
    const fields=field.fields??[];
    const rec=shape(raw,fields.map(f=>f.fieldId),path);
    const out:Record<string,unknown>=Object.create(null);
    for(const child of fields){
      if(rec[child.fieldId]!==undefined)out[child.fieldId]=parseFieldValue(child,rec[child.fieldId],`${path}.${child.fieldId}`);
      else if(child.required&&!allowMissing)contentIssue(`${path}.${child.fieldId}`,'missing_field','Required nested field is missing.');
    }
    return out;
  }
  if(field.type==='relation'){
    // Relationship value is a stable content ID, or a bounded ordered list of IDs. Graph checks occur after all items parse.
    const cast=(x:unknown,index:string)=>{try{return parseContentId(x);}catch{return contentIssue(index,'invalid_relation','A stable content ID is required.');}};
    if(Array.isArray(raw)){
      const ids=list(raw,20,path).map((x,i)=>cast(x,`${path}.${i}`));unique(ids,x=>x,path);return ids;
    }
    return cast(raw,path);
  }
  return contentIssue(path,'unknown_field_type','Unsupported field type.');
}
export function parseCollectionDefinition(raw:unknown,path='collection'):CollectionDefinition{
  const c=shape(raw,['collectionId','schemaId','schemaVersion','displayName','sectionId',
    'kind','itemsLimit','fields','categories'],path);
  const collectionId=token(c.collectionId,`${path}.collectionId`);
  const schemaId=token(c.schemaId,`${path}.schemaId`);
  const schemaVersion=integer(c.schemaVersion,1,10000,`${path}.schemaVersion`);
  const kind=choice(c.kind,['projects','experience','education','skills','references','custom'] as const,`${path}.kind`);
  if(c.itemsLimit!==20)contentIssue(`${path}.itemsLimit`,'fixed_limit','Collection size cannot be overridden.');
  let sectionId;try{if(c.sectionId!==undefined)sectionId=parseSectionId(c.sectionId);}catch{
    return contentIssue(`${path}.sectionId`,'invalid_section','Section identity is invalid.');}
  const fields=list(c.fields,PRODUCT_LIMITS.customFieldsPerSection,`${path}.fields`)
    .map((x,i)=>parseFieldDefinition(x,`${path}.fields.${i}`));
  unique(fields,x=>x.fieldId,`${path}.fields`);unique(fields,x=>x.name,`${path}.fields`);
  const categories=list(c.categories,20,`${path}.categories`).map((x,i):CategoryDefinition=>{
    const p=`${path}.categories.${i}`,r=shape(x,['categoryId','label','order'],p);
    return {categoryId:token(r.categoryId,`${p}.categoryId`),label:string(r.label,100,`${p}.label`,1),
      order:integer(r.order,0,19,`${p}.order`)};
  });
  unique(categories,x=>x.categoryId,`${path}.categories`);
  return {collectionId,schemaId,schemaVersion,displayName:string(c.displayName,120,`${path}.displayName`,1),
    kind,itemsLimit:20,fields,categories,...(sectionId?{sectionId}:{})};
}
/** Import accepts a narrow supported JSON Schema Draft 2020-12 subset, never resolves references. */
export function importJsonSchema(raw:unknown,settings:{collectionId:string;schemaId:string;displayName:string;
  kind?:CollectionDefinition['kind'];schemaVersion?:number;sectionId?:string}):CollectionDefinition {
  // `$schema` is the sole recognized standards keyword. Strip it before the generic
  // unsafe-Mongo-key check; all remaining `$ref`, `$where`, `$dynamicRef` etc remain denied.
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.getPrototypeOf(raw)!==Object.prototype)
    contentIssue('schema','invalid_shape','A plain JSON Schema object is required.');
  const input=raw as Record<string,unknown>;
  const dialect=Object.hasOwn(input,'$schema')?input.$schema:undefined;
  if(dialect!==undefined&&dialect!=='https://json-schema.org/draft/2020-12/schema')
    contentIssue('schema.$schema','metaschema','Unsupported JSON Schema dialect.');
  const cleaned:Record<string,unknown>={};
  for(const key of Object.keys(input))if(key!=='$schema')cleaned[key]=input[key];
  ensureJson(cleaned,'schema',10,32_000);
  const top=shape(cleaned,['title','type','properties','required','additionalProperties'], 'schema');
  if(top.type!=='object'||top.additionalProperties!==false)contentIssue('schema','object_required','Root must be a closed object.');
  const props=shape(top.properties,Object.keys((top.properties??{}) as object),'schema.properties');
  const keys=Object.keys(props);if(keys.length>20)contentIssue('schema.properties','field_limit','At most 20 fields are supported.');
  const required=list(top.required??[],20,'schema.required').map((x,i)=>token(x,`schema.required.${i}`));
  unique(required,x=>x,'schema.required');if(required.some(x=>!keys.includes(x)))contentIssue('schema.required','unknown_field','Required field is absent.');
  function translate(name:string,source:unknown,isRequired:boolean,path:string,depth=0):FieldDefinition {
    const p=shape(source,['type','title','description','default','format','enum','minimum','maximum',
      'minLength','maxLength','minItems','maxItems','properties','required','items','additionalProperties'],path);
    const rawType=choice(p.type,['string','number','integer','boolean','object','array'] as const,`${path}.type`);
    let type:FieldType=rawType==='string'?'text':rawType==='integer'||rawType==='number'?'number':
      rawType==='array'?'list':rawType;
    if(p.format!==undefined){
      if(rawType!=='string')contentIssue(path,'invalid_format','Format is only allowed for strings.');
      type=choice(p.format,['date','email','uri'] as const,`${path}.format`)==='uri'?'url':p.format as 'date'|'email';
    }
    if(p.enum!==undefined){
      if(rawType!=='string'||p.format!==undefined)contentIssue(path,'invalid_enum','Select options must be plain strings.');
      type='select';
    }
    const field:FieldDefinition={fieldId:token(name,`${path}.fieldId`),name:token(name,`${path}.name`),
      label:string(p.title??name,120,`${path}.title`,1),type,required:isRequired,
      publicVisibility:'private',aiVisibility:'denied',searchable:false,
      ...(p.description===undefined?{}:{description:string(p.description,500,`${path}.description`)})};
    const v:FieldValidation={};
    for(const key of ['minLength','maxLength','minimum','maximum','minItems','maxItems'] as const)
      if(p[key]!==undefined)(v as Record<string,unknown>)[key]=p[key];
    if(Object.keys(v).length)field.validation=parseValidation(v,type,`${path}.validation`);
    if(type==='select'){
      field.options=list(p.enum,20,`${path}.enum`).map((x,i)=>({optionId:token(x,`${path}.enum.${i}`),label:string(x,100,`${path}.enum.${i}`)}));
      unique(field.options,x=>x.optionId,`${path}.enum`);
    }
    if(type==='object'){
      if(p.additionalProperties!==false)contentIssue(path,'open_object','Nested objects must be closed.');
      if(depth+1>3)contentIssue(path,'depth_limit','Three nested containers maximum.');
      const entries=shape(p.properties,Object.keys((p.properties??{}) as object),`${path}.properties`);
      const requiredNames=list(p.required??[],20,`${path}.required`).map(x=>token(x,`${path}.required`));
      if(requiredNames.some(x=>!Object.hasOwn(entries,x)))contentIssue(path,'unknown_field','Unknown required field.');
      field.fields=Object.entries(entries).map(([k,val])=>translate(k,val,requiredNames.includes(k),`${path}.properties.${k}`,depth+1));
      if(field.fields.length>20)contentIssue(path,'field_limit','Too many nested fields.');
    }
    if(type==='list'){
      if(depth+1>3)contentIssue(path,'depth_limit','Three nested containers maximum.');
      if(p.items===undefined)contentIssue(path,'missing_items','Array item schema required.');
      field.item=translate('item',p.items,true,`${path}.items`,depth+1);
    }
    if(p.default!==undefined)field.defaultValue=parseFieldValue(field,p.default,`${path}.default`,true);
    return parseFieldDefinition(field,path,depth);
  }
  const def={collectionId:settings.collectionId,schemaId:settings.schemaId,schemaVersion:settings.schemaVersion??1,
    displayName:settings.displayName,sectionId:settings.sectionId,kind:settings.kind??'custom',
    itemsLimit:20,fields:keys.map(k=>translate(k,props[k],required.includes(k),`schema.properties.${k}`)),categories:[]};
  return parseCollectionDefinition(def,'imported');
}
