/** Deterministic, no-network composition compiler. Its output is a CANDIDATE only:
 * Issue 13 must pin an immutable release; Issue 5 live-policy gate authorizes public delivery. */
import {canonicalJson,utf8ByteCount,PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
import type {ContentId,SectionId} from '../../shared/domain/identifiers.ts';
import {parseContentDraft,parseContentBinding,projectEligibleContent,validateForPublication} from '../content/model.ts';
import {ContentDenied} from '../content/errors.ts';
import {parseRichText} from '../content/rich-text.ts';
import type {RichTextDoc} from '../content/rich-text.ts';
import type {ContentDraftShape,ContentBinding,ContentCandidate} from '../content/types.ts';
import {nodeCss,resolveLayout} from './layout.ts';
import {parseCompositionNodes} from './validation.ts';
import {componentTag} from './registry.ts';
import {COMPOSITION_COMPILER_VERSION,COMPOSITION_SCHEMA_VERSION,COMPONENT_REGISTRY_VERSION,
  COMPOSITION_SERIALIZER_VERSION} from './types.ts';
import type {VisualNode,SemanticNode,SemanticRenderPlan,CompilationResult,CompilationIssue,
  CompileOptions,Breakpoint} from './types.ts';
const ROUTES={home:'/',projects:'/projects',experience:'/experience',references:'/references',contact:'/contact'} as const;
function makeIssue(code:string,path:string,message:string,repair:string,
  more:Partial<Pick<CompilationIssue,'nodeId'|'sectionId'|'breakpoint'|'severity'>>={}):CompilationIssue{
  return {severity:'blocker',code,path,message,repair,...more};
}
function textOf(value:unknown):string|undefined{
  if(typeof value==='string')return value;
  if(typeof value==='number'||typeof value==='boolean')return String(value);
  if(value&&typeof value==='object'&&(value as {type?:string}).type==='doc'){
    const ast=parseRichText(value);
    const body=(children:readonly {text?:string;children?:unknown[]}[]):string=>children.map(c=>
      c.text??(c.children?body(c.children as {text?:string;children?:unknown[]}[]):'')).join('');
    return ast.blocks.map(b=>{
      if('children' in b)return body(b.children);
      if(b.type==='code')return b.text;
      if(b.type==='diagram')return b.alt;
      if(b.type==='list')return b.items.map(x=>body(x)).join('; ');
      if(b.type==='table')return b.headers.map(x=>body(x)).join(' / ');
      return b.type==='image'?b.alt:'';
    }).join('\n');
  }
  return undefined;
}
function firstField(fields:Readonly<Record<string,unknown>>,preferred?:string):unknown{
  if(preferred)return fields[preferred];
  for(const key of ['title','displayName','name','summary','identityLabel','introduction'])
    if(fields[key]!==undefined)return fields[key];
  return undefined;
}
/** Projecting per section + binding prevents ever fetching a foreign tenant's content or unapproved fields. */
function approvedCandidates(source:ContentDraftShape,node:VisualNode,opts:CompileOptions):ContentCandidate[]{
  if(!node.contentBinding)return [];
  const selection=parseContentBinding(node.contentBinding,`nodes.${node.nodeId}.contentBinding`);
  return projectEligibleContent(source,[{sectionId:node.sectionId,binding:selection}],
    'public',opts.approvedMediaIds??new Set()).items;
}
function approvedTitle(source:ContentDraftShape,entry:ContentCandidate):{title:string;description?:string;href?:string}{
  const fields=entry.fields;
  const title=textOf(firstField(fields))??'Untitled item';
  const description=textOf(fields.summary);
  let href:string|undefined;
  // Route suffixes are derived only from THIS draft's matching collection item and its valid slug.
  if(entry.source==='collectionItem'){
    const item=source.contentCollections.flatMap(c=>c.items).find(x=>x.contentId===entry.sourceId);
    if(item?.slug&&item.collectionId==='projects')href=`/projects/${item.slug}`;
  }
  return {title,...(description?{description}:{}),...(href?{href}:{})};
}
function safeProps(node:VisualNode):Readonly<Record<string,unknown>>{
  // Props already passed the registry. Never copy private draft or binding object into the plan.
  return node.props;
}
/** A stable serialized candidate is suitable for signing in Issue 13, but never directly public. */
export function compileComposition(raw:ContentDraftShape,opts:CompileOptions={}):CompilationResult{
  const issues:CompilationIssue[]=[];
  const block=(code:string,path:string,message:string,repair:string,node?:VisualNode,breakpoint?:Breakpoint)=>
    issues.push(makeIssue(code,path,message,repair,{...(node?{nodeId:node.nodeId,sectionId:node.sectionId}:{}),
      ...(breakpoint?{breakpoint}:{})}));
  let source:ContentDraftShape;
  try{source=parseContentDraft(raw);}catch(e){
    if(e instanceof ContentDenied)return {ok:false,issues:e.issues.map(i=>makeIssue(i.code,i.path,i.message,
      'Repair the invalid draft content or composition in the editor.'))};
    throw e;
  }
  const parsed=parseCompositionNodes(source.nodes,source.sections,{allowLegacy:true});
  if(parsed.legacyNodes.length)block('legacy_node','nodes',
    'Earlier reference-only nodes cannot be compiled into public HTML.',
    'Convert legacy reference stubs into version 1 approved component nodes.');
  if(opts.purpose!=='owner-preview'){
    try{validateForPublication(source);}catch(e){
      if(e instanceof ContentDenied)issues.push(...e.issues.map(i=>makeIssue(i.code,i.path,i.message,
        'Complete required public content before publishing.')));
      else throw e;
    }
  }
  const nodes=parsed.nodes;
  const visibleSectionIds=new Set(source.sections.filter(s=>s.visible).map(s=>s.sectionId));
  const actionable=(n:VisualNode)=>n.componentType==='button'||n.componentType==='link'||n.componentType==='contactForm';
  const visible=(node:VisualNode,mode:Breakpoint)=>{
    let current:VisualNode|undefined=node;
    const byId=new Map(nodes.map(x=>[x.nodeId,x] as const));
    while(current){
      if(current.visibilityByBreakpoint?.[mode]===false)return false;
      current=current.parentNodeId?byId.get(current.parentNodeId):undefined;
    }
    return visibleSectionIds.has(node.sectionId);
  };
  for(const node of nodes){
    for(const bp of ['desktop','tablet','mobile'] as const){
      if(node.semanticRole==='h1'&&!visible(node,bp))
        block('hidden_primary_heading',`nodes.${node.nodeId}.visibilityByBreakpoint.${bp}`,
          'The primary heading must remain available at every breakpoint.','Keep the primary heading visible.',node,bp);
      if(!visible(node,bp))continue;
      const action=node.interaction;
      const target=action.kind==='togglePanel'||action.kind==='openModal'?nodes.find(n=>n.nodeId===action.targetNodeId):
        action.kind==='switchTab'?nodes.find(n=>n.nodeId===action.groupNodeId):
        action.kind==='advanceCarousel'?nodes.find(n=>n.nodeId===action.carouselNodeId):undefined;
      if(target&&!visible(target,bp))block('hidden_action_target',`nodes.${node.nodeId}.interaction`,
        'The action targets content hidden at this breakpoint.',
        'Show the target at this breakpoint or hide/change the action.',node,bp);
      const effective=resolveLayout(node.layout,node.responsiveOverrides??{},bp,node.semanticRole!=='decorative');
      if(effective.mode==='absolute'&&node.semanticRole!=='decorative'&&
        (node.componentType==='text'||node.componentType==='heading')&&
        typeof node.props.text==='string'&&node.props.text.length>200&&effective.height<0.22)
        block('text_overflow',`nodes.${node.nodeId}.layout`,
          'Long meaningful text may be clipped by its constrained positioning.',
          'Convert to Auto layout or give text a larger intrinsic area.',node,bp);
    }
    if(node.componentType==='heading'&&!node.contentBinding&&
      (typeof node.props.text!=='string'||!node.props.text.trim()))
      block('empty_heading',`nodes.${node.nodeId}.props.text`,'A heading needs readable text.',
        'Supply approved heading text or bind a public field.',node);
    if(node.semanticRole==='navigation'&&!node.props.label)
      block('navigation_label',`nodes.${node.nodeId}.props.label`,'Navigation needs an accessible name.',
        'Provide a short navigation label.',node);
    if(actionable(node)&&node.componentType==='button'&&node.interaction.kind==='none'&&node.props.href===undefined)
      block('inert_button',`nodes.${node.nodeId}.interaction`,'A button has no usable action.',
        'Select a safe interaction or remove the button.',node);
    if(node.componentType==='contactForm'&&!opts.contactFormEnabled)
      block('contact_unavailable',`nodes.${node.nodeId}`,
        'Contact submission requires a verified, abuse-protected server endpoint.',
        'Enable the reviewed contact service in Issue 17 before publishing.',node);
    if(node.interaction.kind==='openContactForm'&&!opts.contactFormEnabled)
      block('contact_unavailable',`nodes.${node.nodeId}.interaction`,
        'The contact action cannot open an unavailable form.','Enable a reviewed contact endpoint.',node);
    if(node.componentType==='image'&&!(opts.approvedMediaIds?.has(String(node.props.mediaId))))
      block('unapproved_media',`nodes.${node.nodeId}.props.mediaId`,
        'Only approved, release-ready media can be rendered publicly.','Approve the owned asset before publication.',node);
    if(node.componentType==='gallery'&&
      (node.props.items as {mediaId:string}[]).some(i=>!opts.approvedMediaIds?.has(i.mediaId)))
      block('unapproved_media',`nodes.${node.nodeId}.props.items`,
        'The gallery includes an unavailable or unapproved asset.','Review and approve every gallery asset.',node);
  }
  // Approximate sibling occlusion checks are a necessary preflight, not a WCAG proof.
  for(const bp of ['desktop','tablet','mobile'] as const){
    const siblings=nodes.filter(n=>visible(n,bp)&&actionable(n));
    for(let i=0;i<siblings.length;i++)for(let j=i+1;j<siblings.length;j++){
      const a=siblings[i],b=siblings[j];
      if(a.sectionId!==b.sectionId||a.parentNodeId!==b.parentNodeId)continue;
      const x=resolveLayout(a.layout,a.responsiveOverrides??{},bp,true),
        y=resolveLayout(b.layout,b.responsiveOverrides??{},bp,true);
      if(x.mode!=='absolute'||y.mode!=='absolute')continue;
      const rect=(l:typeof x)=>({left:l.anchorX==='left'?l.x:l.anchorX==='center'?l.x-l.width/2:1-l.x-l.width,
        top:l.anchorY==='top'?l.y:l.anchorY==='center'?l.y-l.height/2:1-l.y-l.height,
        right:l.anchorX==='left'?l.x+l.width:l.anchorX==='center'?l.x+l.width/2:1-l.x,
        bottom:l.anchorY==='top'?l.y+l.height:l.anchorY==='center'?l.y+l.height/2:1-l.y});
      const r=rect(x),s=rect(y);const w=Math.max(0,Math.min(r.right,s.right)-Math.max(r.left,s.left)),
        h=Math.max(0,Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top));
      if(w*h>0.02*Math.min(x.width*x.height,y.width*y.height))
        block('control_occlusion',`nodes.${a.nodeId}.layout`,
          'Two interactive controls overlap in the same stacking context.',
          'Separate controls or switch the parent to Auto layout.',a,bp);
    }
  }
  const rootsByParent=new Map<string,VisualNode[]>();
  for(const node of nodes){
    const key=node.parentNodeId??`section:${node.sectionId}`;
    const group=rootsByParent.get(key)??[];group.push(node);rootsByParent.set(key,group);
  }
  for(const group of rootsByParent.values())group.sort((a,b)=>a.readingOrder-b.readingOrder||a.nodeId.localeCompare(b.nodeId));
  const allSources=new Set<ContentId>();let generated=0;
  const render=(node:VisualNode):SemanticNode|null=>{
    if(!visibleSectionIds.has(node.sectionId))return null;
    const binding=node.contentBinding;
    let entries:ContentCandidate[]=[];
    if(binding){
      try{entries=approvedCandidates(source,node,opts);}catch(e){
        if(e instanceof ContentDenied)block('binding_invalid',`nodes.${node.nodeId}.contentBinding`,
          'The data binding is unavailable.','Select an eligible field in this portfolio.',node);
        else throw e;
      }
      if(!entries.length&&binding.source!=='collection')block('binding_unapproved',`nodes.${node.nodeId}.contentBinding`,
        'No public-approved content exists for this binding.',
        'Approve the item and field for public use, or remove the binding.',node);
    }
    let text:string|undefined,richText:RichTextDoc|undefined,boundHref:string|undefined;
    if(binding&&binding.source!=='collection'){
      const selected=entries[0];
      const value=selected?firstField(selected.fields,binding.fieldId):undefined;
      if(value&&typeof value==='object'&&(value as {type?:string}).type==='doc'&&node.componentType==='text'){
        const doc=parseRichText(value);
        const media=doc.blocks.filter(b=>b.type==='image');
        if(media.some(b=>b.type==='image'&&!opts.approvedMediaIds?.has(b.mediaId)))
          block('unapproved_rich_media',`nodes.${node.nodeId}.contentBinding`,
            'Rich text contains media not approved for release.',
            'Approve every referenced image before publishing.',node);
        else richText=doc;
      }
      if(selected)text=textOf(value);
      if(node.componentType==='link'&&typeof value==='string'&&value.startsWith('https://'))boundHref=value;
      if(!text)block('binding_text_unavailable',`nodes.${node.nodeId}.contentBinding`,
        'The selected public field is missing, hidden or unsupported for this block.',
        'Select a public-approved text or supported data field.',node);
    }else if(!binding)text=typeof node.props.text==='string'?node.props.text:
      typeof node.props.label==='string'?node.props.label:undefined;
    if(text&&node.componentType==='heading'&&text.length>600)
      block('heading_size',`nodes.${node.nodeId}.contentBinding`,
        'The bound heading exceeds its safe text limit.','Use a shorter heading field.',node);
    if(text&&node.componentType==='text'&&text.length>10000)
      block('text_size',`nodes.${node.nodeId}.contentBinding`,
        'The bound text exceeds its safe block limit.','Use a shorter approved excerpt.',node);
    // This is a conservative preflight. Real font/zoom overlap needs browser evidence.
    if(text && (node.componentType==='heading'||node.componentType==='text')){
      for(const bp of ['desktop','tablet','mobile'] as const){
        if(!visible(node,bp))continue;
        const effective=resolveLayout(node.layout,node.responsiveOverrides??{},bp,true);
        if(effective.mode==='absolute'&&text.length>200&&effective.height<0.22)
          block('bound_text_overflow',`nodes.${node.nodeId}.layout`,
            'Long approved content is constrained to a small absolute area.',
            'Convert the meaningful text to Auto layout or enlarge its area.',node,bp);
      }
    }
    let items:SemanticNode['items'];
    if(node.componentType==='repeater'||node.componentType==='timeline'){
      const itemLimit=Number(node.props.maxVisible);
      let collection=entries;
      if(node.props.categoryId){
        const cat=String(node.props.categoryId),ids=new Set(source.contentCollections.flatMap(c=>c.items)
          .filter(i=>i.categoryIds.includes(cat)).map(i=>i.contentId));
        collection=entries.filter(i=>ids.has(i.sourceId as ContentId));
      }
      if(node.props.sort==='featured'){
        const featured=new Set(source.contentCollections.flatMap(c=>c.items).filter(x=>x.featured).map(x=>x.contentId));
        collection=[...collection].sort((a,b)=>Number(featured.has(b.sourceId as ContentId))-Number(featured.has(a.sourceId as ContentId)));
      }
      items=collection.slice(0,itemLimit).map(item=>({key:item.sourceId,...approvedTitle(source,item)}));
      generated+=items.length;
      // Provenance follows only rendered public entries, never items omitted by display limits.
      for(const item of items)allSources.add(item.key as ContentId);
    }else for(const item of entries)if(item.source==='collectionItem')allSources.add(item.sourceId as ContentId);
    let href: string|undefined;
    if(node.interaction.kind==='navigate')href=ROUTES[node.interaction.routeId];
    else if(node.interaction.kind==='scrollToSection'){
      const section=source.sections.find(s=>s.sectionId===(node.interaction as Extract<typeof node.interaction,{kind:'scrollToSection'}>).sectionId);
      if(section?.visible)href=`#gi-section-${section.sectionId.replace(/-/g,'')}`;
    }
    else if(typeof node.props.href==='string')href=node.props.href;
    else if(boundHref)href=boundHref;
    const children=(rootsByParent.get(node.nodeId)??[]).map(render).filter((x):x is SemanticNode=>x!==null);
    return {nodeId:node.nodeId,sectionId:node.sectionId,componentType:node.componentType,
      tag:componentTag(node.componentType,node.semanticRole),...(node.semanticRole?{role:node.semanticRole}:{}),
      ...(text!==undefined?{text}:{}),...(richText?{richText}:{}),...(href?{href}:{}),
      ...(node.componentType==='image'?{alt:String(node.props.alt),mediaId:node.props.mediaId as never}:{}),
      props:safeProps(node),interaction:node.interaction,children,...(items?{items}:{})};
  };
  const sections=source.sections.filter(s=>s.visible).map(s=>({sectionId:s.sectionId,anchor:s.publicAnchor,type:s.type,
    nodes:(rootsByParent.get(`section:${s.sectionId}`)??[]).map(render).filter((n):n is SemanticNode=>n!==null)}));
  // Heading hierarchy follows actual semantic DOM output, not the owner's visual stack.
  // The platform H1 is added below when no authored H1 exists.
  let lastHeadingLevel=0;
  const hasAuthoredH1=nodes.some(n=>visibleSectionIds.has(n.sectionId)&&n.semanticRole==='h1');
  const checkOutline=(items:readonly SemanticNode[]):void=>{
    for(const item of items){
      if(item.componentType==='heading'&&item.role!=='decorative'){
        const level=item.role==='h1'?1:item.role==='h3'?3:2;
        if(!lastHeadingLevel&&hasAuthoredH1&&level!==1)
          block('heading_order',`nodes.${item.nodeId}.readingOrder`,
            'The document must begin with the authored Hero H1 in semantic reading order.',
            'Move the Hero heading before lower-level headings.');
        if(lastHeadingLevel && level>lastHeadingLevel+1)
          block('heading_skip',`nodes.${item.nodeId}.semanticRole`,
            'Heading levels must not skip a structural level in the reading order.',
            'Change this heading to the next permitted level.');
        lastHeadingLevel=level;
      }
      checkOutline(item.children);
    }
  };
  for(const section of sections)checkOutline(section.nodes);
  const h1=nodes.filter(n=>visibleSectionIds.has(n.sectionId)&&n.semanticRole==='h1');
  if(!h1.length){
    if(typeof source.profile.displayName==='string'&&source.profile.displayName.trim()){
      const hero=sections.find(s=>s.type==='hero');
      if(hero){hero.nodes.unshift({nodeId:`platform-hero-${hero.sectionId}`,sectionId:hero.sectionId,
        componentType:'heading',tag:'h1',role:'h1',text:source.profile.displayName,
        props:{level:1},interaction:{kind:'none'},children:[]});
        issues.push(makeIssue('generated_h1','sections.0','The safe platform fallback supplies the primary heading.',
          'Add an authored Hero heading if desired.',{severity:'warning'}));}
    }else block('missing_primary_heading','sections.0','No visible primary heading can be rendered.',
      'Set the Hero display name and add a semantic H1.');
  }
  if(generated>200)block('repeater_expansion','nodes','Generated collection markup exceeds the safe DOM budget.',
    'Reduce repeater counts or collection bindings.');
  const css=`.gi-composition{min-width:0;max-width:100%;overflow-x:clip}`+
    `.gi-composition-section{position:relative;isolation:isolate;min-width:0;max-width:100%;}`+
    `.gi-composition-node{box-sizing:border-box;overflow-wrap:anywhere;min-width:0;}`+
    `.gi-composition-node:focus-visible,.gi-composition-node :focus-visible{outline:3px solid currentColor;outline-offset:3px;}`+
    `.gi-composition-node img{max-width:100%;height:auto;}`+
    `.gi-composition-node pre{max-width:100%;overflow-x:auto;}`+
    nodes.map(n=>nodeCss(n.nodeId,n.layout,n.responsiveOverrides??{},n.visibilityByBreakpoint??{},
      n.semanticRole!=='decorative')).join('');
  const plan:SemanticRenderPlan={schemaVersion:COMPOSITION_SCHEMA_VERSION,compilerVersion:COMPOSITION_COMPILER_VERSION,
    registryVersion:COMPONENT_REGISTRY_VERSION,serializerVersion:COMPOSITION_SERIALIZER_VERSION,
    authoredNodeCount:nodes.length+parsed.legacyNodes.length,generatedRepeaterItems:generated,
    sections,css,sourceContentIds:[...allSources].sort()};
  if(utf8ByteCount(canonicalJson(plan))>(opts.maxBytes??PRODUCT_LIMITS.publishedReleaseBytes))
    block('release_size','composition','Compiled semantic payload exceeds the release size limit.',
      'Reduce content, repeater items or layout complexity.');
  return issues.some(i=>i.severity==='blocker')?{ok:false,issues}: {ok:true,issues,plan};
}
