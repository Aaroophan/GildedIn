/** Closed block catalog, not a dynamic React/component loader. */
import {parseMediaId} from '../../shared/domain/identifiers.ts';
import {contentIssue} from '../content/errors.ts';
import {shape,list,string,integer,token,safeHttps} from '../content/strict.ts';
import type {ComponentType,SemanticRole} from './types.ts';
export const COMPONENT_TYPES=['heading','text','button','link','image','container','group','grid','card',
  'repeater','gallery','tabs','accordion','carousel','timeline','contactForm','comparisonTable'] as const;
export const PARENT_COMPONENTS:readonly ComponentType[]=['container','group','grid','card'];
const TEXTUAL:readonly ComponentType[]=['heading','text','button','link','card'];
export const COMPONENT_REGISTRY=Object.freeze(Object.fromEntries(COMPONENT_TYPES.map(t=>[t,Object.freeze({
  version:1,acceptsChildren:PARENT_COMPONENTS.includes(t),hasMeaningfulText:TEXTUAL.includes(t),
  defaultLayout:{mode:'auto',flow:'column'},
})]))) as Readonly<Record<ComponentType,{version:1;acceptsChildren:boolean;hasMeaningfulText:boolean;
  defaultLayout:{mode:'auto';flow:'column'}}>>;
const text=(r:Record<string,unknown>,key:string,path:string,max=1000)=>
  r[key]===undefined?undefined:string(r[key],max,`${path}.${key}`);
function shortItems(value:unknown,path:string,max=12):{id:string;label:string;body:string}[]{
  return list(value,max,path).map((v,i)=>{
    const p=`${path}.${i}`,r=shape(v,['id','label','body'],p);
    return {id:token(r.id,`${p}.id`),label:string(r.label,100,`${p}.label`,1),
      body:string(r.body,2000,`${p}.body`)};
  });
}
function safeHref(value:unknown,path:string):string{
  if(typeof value==='string'&&/^mailto:[^\s@<>]+@[^\s@<>]+$/i.test(value))return value;
  return safeHttps(value,path);
}
export function parseBlockProps(kind:ComponentType,raw:unknown,path:string):Record<string,unknown>{
  let r:Record<string,unknown>;
  switch(kind){
  case 'heading':{
    r=shape(raw,['text','level'],path);const level=integer(r.level,1,3,`${path}.level`);
    return {level,...(text(r,'text',path,600)===undefined?{}:{text:text(r,'text',path,600)})};
  }
  case 'text':{
    r=shape(raw,['text','tone'],path);
    if(r.tone!==undefined&&!['body','muted','lead'].includes(String(r.tone)))contentIssue(`${path}.tone`,'block_prop','Unknown text tone.');
    return {...(text(r,'text',path,10000)===undefined?{}:{text:text(r,'text',path,10000)}),
      ...(r.tone===undefined?{}:{tone:r.tone})};
  }
  case 'button':case 'link':{
    r=shape(raw,['label','href','variant'],path);
    const label=string(r.label,160,`${path}.label`,1);
    if(r.variant!==undefined&&!['primary','secondary','quiet'].includes(String(r.variant)))contentIssue(`${path}.variant`,'block_prop','Unsupported variant.');
    const href=r.href===undefined?undefined:safeHref(r.href,`${path}.href`);
    return {label,...(href?{href}:{}),...(r.variant?{variant:r.variant}:{})};
  }
  case 'image':{
    r=shape(raw,['mediaId','alt','caption'],path);
    let mediaId;try{mediaId=parseMediaId(r.mediaId);}catch{return contentIssue(`${path}.mediaId`,'invalid_media','An owned media ID is required.');}
    const alt=string(r.alt,300,`${path}.alt`);
    return {mediaId,alt,...(text(r,'caption',path,400)!==undefined?{caption:text(r,'caption',path,400)}:{})};
  }
  case 'container':case 'group':case 'grid':case 'card':{
    r=shape(raw,['variant','label'],path);
    if(r.variant!==undefined&&!['standard','outlined','elevated','decorative'].includes(String(r.variant)))
      contentIssue(`${path}.variant`,'block_prop','Unsupported container variant.');
    return {...(r.variant?{variant:r.variant}:{}),...(text(r,'label',path,160)!==undefined?{label:text(r,'label',path,160)}:{})};
  }
  case 'repeater':case 'timeline':{
    r=shape(raw,['variant','maxVisible','sort','categoryId'],path);
    const variant=r.variant??(kind==='timeline'?'timeline':'cards');
    if(!['cards','projectCards','skills','timeline'].includes(String(variant)))
      contentIssue(`${path}.variant`,'block_prop','Unsupported repeater template.');
    const maxVisible=r.maxVisible===undefined?20:integer(r.maxVisible,1,20,`${path}.maxVisible`);
    if(r.sort!==undefined&&!['order','featured'].includes(String(r.sort)))contentIssue(`${path}.sort`,'block_prop','Unsupported sort mode.');
    return {variant,maxVisible,sort:r.sort??'order',...(r.categoryId===undefined?{}:{categoryId:token(r.categoryId,`${path}.categoryId`)})};
  }
  case 'gallery':{
    r=shape(raw,['items'],path);
    const items=list(r.items,20,`${path}.items`).map((v,i)=>{
      const p=`${path}.items.${i}`,item=shape(v,['mediaId','alt','caption'],p);
      let mediaId;try{mediaId=parseMediaId(item.mediaId);}catch{return contentIssue(p,'invalid_media','An owned media ID is required.');}
      return {mediaId,alt:string(item.alt,300,`${p}.alt`),
        ...(item.caption===undefined?{}:{caption:string(item.caption,300,`${p}.caption`)})};
    });
    return {items};
  }
  case 'tabs':case 'accordion':{
    r=shape(raw,['items','label'],path);const items=shortItems(r.items,`${path}.items`);
    if(items.length<1)contentIssue(`${path}.items`,'missing_items','At least one accessible panel is required.');
    if(new Set(items.map(x=>x.id)).size!==items.length)contentIssue(path,'duplicate_tab','Panel IDs must be unique.');
    return {items,...(r.label===undefined?{}:{label:string(r.label,160,`${path}.label`)})};
  }
  case 'carousel':{
    r=shape(raw,['slides','label'],path);const slides=shortItems(r.slides,`${path}.slides`,20);
    if(!slides.length)contentIssue(path,'missing_slides','Carousel needs at least one slide.');
    if(new Set(slides.map(x=>x.id)).size!==slides.length)contentIssue(path,'duplicate_slide','Slide IDs must be unique.');
    return {slides,...(r.label===undefined?{}:{label:string(r.label,160,`${path}.label`)})};
  }
  case 'contactForm':{
    r=shape(raw,['label','consentLabel'],path);
    return {label:string(r.label,160,`${path}.label`,1),
      consentLabel:string(r.consentLabel,500,`${path}.consentLabel`,1)};
  }
  case 'comparisonTable':{
    r=shape(raw,['caption','headers','rows'],path);
    const headers=list(r.headers,6,`${path}.headers`).map((s,i)=>string(s,120,`${path}.headers.${i}`,1));
    if(!headers.length)contentIssue(`${path}.headers`,'table','The table needs column headers.');
    const rows=list(r.rows,20,`${path}.rows`).map((v,i)=>{
      const columns=list(v,headers.length,`${path}.rows.${i}`);
      if(columns.length!==headers.length)contentIssue(`${path}.rows.${i}`,'table','Every row must match the header count.');
      return columns.map((s,j)=>string(s,300,`${path}.rows.${i}.${j}`));
    });
    return {caption:string(r.caption,160,`${path}.caption`,1),headers,rows};
  }
  }
}
export function defaultSemanticRole(kind:ComponentType,props:Readonly<Record<string,unknown>>):SemanticRole|undefined{
  if(kind==='heading')return `h${props.level}` as SemanticRole;
  if(kind==='text')return 'paragraph';
  if(kind==='card')return 'article';
  return undefined;
}
export function componentTag(kind:ComponentType,role?:SemanticRole):string{
  if(kind==='heading')return role??'h2';
  if(kind==='text')return 'p';
  if(kind==='button')return 'button';
  if(kind==='link')return 'a';
  if(kind==='image')return 'figure';
  if(kind==='card')return 'article';
  if(kind==='tabs'||kind==='accordion'||kind==='carousel')return 'section';
  if(kind==='comparisonTable')return 'table';
  if(kind==='contactForm')return 'section';
  if(kind==='repeater'||kind==='timeline'||kind==='gallery')return 'ul';
  return role==='navigation'?'nav':'div';
}
