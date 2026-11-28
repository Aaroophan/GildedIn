/** Graph parser: strict node versions, normalized geometry, safe parents and finite actions. */
import {parseNodeId,parseSectionId} from '../../shared/domain/identifiers.ts';
import type {SectionId,NodeId} from '../../shared/domain/identifiers.ts';
import {PRODUCT_LIMITS,validateAuthoredNodes} from '../../shared/domain/limits.ts';
import {contentIssue} from '../content/errors.ts';
import {ensureJson,shape,list,integer,flag,token} from '../content/strict.ts';
import type {SectionDefinition,ContentBinding} from '../content/types.ts';
import {COMPONENT_TYPES,PARENT_COMPONENTS,parseBlockProps,defaultSemanticRole} from './registry.ts';
import {AUTO_DEFAULT,parseLayout,parseResponsiveOverride} from './layout.ts';
import type {VisualNode,SafeInteraction,SafeLayout,SemanticRole,Breakpoint,ComponentType} from './types.ts';
const SEMANTICS=['h1','h2','h3','paragraph','article','navigation','decorative'] as const;
const BP=['mobile','tablet','desktop'] as const;
function parseId<T extends 'node'|'section'>(value:unknown,kind:T,path:string):T extends 'node'?NodeId:SectionId{
  try{return (kind==='node'?parseNodeId(value):parseSectionId(value)) as T extends 'node'?NodeId:SectionId;}
  catch{return contentIssue(path,'invalid_id','A stable UUID node or section ID is required.');}
}
function interaction(raw:unknown,path:string):SafeInteraction{
  const r=shape(raw,['kind','routeId','sectionId','targetNodeId','groupNodeId','tabId','carouselNodeId','delta'],path);
  switch(r.kind){
  case 'none':shape(raw,['kind'],path);return {kind:'none'};
  case 'navigate':shape(raw,['kind','routeId'],path);
    if(!['home','projects','experience','references','contact'].includes(String(r.routeId)))
      contentIssue(path,'unsafe_route','Navigation uses an approved internal route ID.');
    return {kind:'navigate',routeId:r.routeId as 'home'};
  case 'scrollToSection':shape(raw,['kind','sectionId'],path);
    return {kind:'scrollToSection',sectionId:parseId(r.sectionId,'section',`${path}.sectionId`)};
  case 'togglePanel':case 'openModal':shape(raw,['kind','targetNodeId'],path);
    return {kind:r.kind,targetNodeId:parseId(r.targetNodeId,'node',`${path}.targetNodeId`)};
  case 'switchTab':shape(raw,['kind','groupNodeId','tabId'],path);
    return {kind:'switchTab',groupNodeId:parseId(r.groupNodeId,'node',`${path}.groupNodeId`),
      tabId:token(r.tabId,`${path}.tabId`)};
  case 'advanceCarousel':shape(raw,['kind','carouselNodeId','delta'],path);
    if(r.delta!==-1&&r.delta!==1)contentIssue(path,'interaction_delta','Carousel movement must be one step.');
    return {kind:'advanceCarousel',carouselNodeId:parseId(r.carouselNodeId,'node',`${path}.carouselNodeId`),delta:r.delta as -1|1};
  case 'openContactForm':shape(raw,['kind'],path);return {kind:'openContactForm'};
  default:return contentIssue(path,'unknown_action','Only fixed declarative actions are allowed.');
  }
}
export function parseVisualNode(raw:unknown,path='node'):VisualNode{
  const r=shape(raw,['nodeId','sectionId','parentNodeId','componentType','componentVersion','props',
    'contentBinding','layout','responsiveOverrides','visualOrder','readingOrder','semanticRole',
    'visibilityByBreakpoint','interaction','locked'],path);
  const kind=r.componentType;
  if(typeof kind!=='string'||!COMPONENT_TYPES.includes(kind as ComponentType))
    contentIssue(`${path}.componentType`,'unknown_component','Only reviewed component registry keys are supported.');
  if(r.componentVersion!==1)contentIssue(`${path}.componentVersion`,'component_version','Unsupported component version.');
  const componentType=kind as ComponentType;
  const props=parseBlockProps(componentType,r.props??{},`${path}.props`);
  const layout=parseLayout(r.layout??AUTO_DEFAULT,`${path}.layout`);
  if(layout.mode==='hybrid'&&!PARENT_COMPONENTS.includes(componentType))
    contentIssue(`${path}.layout`,'layout_mode','Hybrid layout is only available to parent containers.');
  const overrides:Partial<Record<Breakpoint,Partial<SafeLayout>>>=Object.create(null);
  if(r.responsiveOverrides!==undefined){
    const all=shape(r.responsiveOverrides,BP,`${path}.responsiveOverrides`);
    for(const breakpoint of BP)if(all[breakpoint]!==undefined)
      overrides[breakpoint]=parseResponsiveOverride(all[breakpoint],layout,`${path}.responsiveOverrides.${breakpoint}`);
  }
  const visible:Partial<Record<Breakpoint,boolean>>=Object.create(null);
  if(r.visibilityByBreakpoint!==undefined){
    const all=shape(r.visibilityByBreakpoint,BP,`${path}.visibilityByBreakpoint`);
    for(const breakpoint of BP)if(all[breakpoint]!==undefined)
      visible[breakpoint]=flag(all[breakpoint],`${path}.visibilityByBreakpoint.${breakpoint}`);
  }
  const role=defaultSemanticRole(componentType,props);
  let semanticRole:SemanticRole|undefined;
  if(r.semanticRole!==undefined){
    if(!SEMANTICS.includes(r.semanticRole as SemanticRole))contentIssue(path,'semantic_role','Unsupported semantic role.');
    semanticRole=r.semanticRole as SemanticRole;
    if(role&&semanticRole!==role || !role&&semanticRole==='h1'||
      !role&&['h2','h3','paragraph'].includes(semanticRole))
      contentIssue(path,'semantic_role','Semantic role must match native element and block type.');
    if(semanticRole==='decorative'&&!['group','container','image'].includes(componentType))
      contentIssue(path,'semantic_role','Meaningful interactive content cannot be decorative.');
  }else semanticRole=role;
  if(semanticRole!=='decorative'&&(layout.mode==='absolute'&&layout.overflow==='clip-decorative'||
    layout.mode==='hybrid'&&layout.placement.overflow==='clip-decorative'))
    contentIssue(`${path}.layout`,'semantic_clipping','Meaningful content cannot use decorative clipping.');
  const action=interaction(r.interaction??{kind:'none'},`${path}.interaction`);
  if(action.kind!=='none'&&componentType!=='button'&&componentType!=='link'&&componentType!=='card')
    contentIssue(path,'interaction_type','Only an approved actionable block may invoke an action.');
  if(action.kind!=='none'&&(props.href!==undefined))
    contentIssue(path,'interaction_conflict','An action cannot also have a different external link target.');
  const result:VisualNode={nodeId:parseId(r.nodeId,'node',`${path}.nodeId`),
    sectionId:parseId(r.sectionId,'section',`${path}.sectionId`),componentType,componentVersion:1,
    props,layout,visualOrder:integer(r.visualOrder,0,19,`${path}.visualOrder`),
    readingOrder:integer(r.readingOrder,0,19,`${path}.readingOrder`),interaction:action,
    ...(semanticRole?{semanticRole}:{}),
    ...(Object.keys(overrides).length?{responsiveOverrides:overrides}:{}),
    ...(Object.keys(visible).length?{visibilityByBreakpoint:visible}:{}),
    ...(r.locked===undefined?{}:{locked:flag(r.locked,`${path}.locked`)})};
  if(r.parentNodeId!==undefined)result.parentNodeId=parseId(r.parentNodeId,'node',`${path}.parentNodeId`);
  if(r.contentBinding!==undefined){
    // Full field and owner scoping is verified by Issue 6's reference graph and public projection.
    shape(r.contentBinding,['source','collectionId','contentId','fieldId','derivedKey','fallback'],`${path}.contentBinding`);
    result.contentBinding=r.contentBinding as ContentBinding;
  }
  if(result.contentBinding?.source==='collection'&&!['repeater','timeline'].includes(componentType))
    contentIssue(path,'binding_type','Collection bindings require a bounded repeater or timeline.');
  if(['repeater','timeline'].includes(componentType) && result.contentBinding?.source!=='collection')
    contentIssue(path,'binding_required','Repeaters require a bounded owned collection binding.');
  return result;
}
export interface ParsedNodes {nodes:VisualNode[];legacyNodes:unknown[];}
/** Legacy Issue 6 node-reference stubs remain editable only, but can never compile as public content. */
export function parseCompositionNodes(raw:unknown,sections:readonly Pick<SectionDefinition,'sectionId'|'visible'|'type'>[],
  opts:{allowLegacy?:boolean}={}):ParsedNodes{
  ensureJson(raw,'nodes',14,150_000);
  const input=list(raw,PRODUCT_LIMITS.authoredVisualNodesPerPortfolio,'nodes');
  validateAuthoredNodes(input as Parameters<typeof validateAuthoredNodes>[0]);
  const legacy:unknown[]=[];
  const nodes=input.map((v,i)=>{
    if(opts.allowLegacy&&v&&typeof v==='object'&&!Array.isArray(v)&&!Object.hasOwn(v,'componentType')){
      const old=shape(v,['nodeId','contentBinding'],`nodes.${i}`);
      if(typeof old.nodeId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(old.nodeId))
        contentIssue(`nodes.${i}`,'legacy_node','Unsupported earlier node ID.');
      if(old.contentBinding!==undefined)
        shape(old.contentBinding,['source','collectionId','contentId','fieldId','derivedKey','fallback'],`nodes.${i}.contentBinding`);
      legacy.push(v);return null;
    }
    return parseVisualNode(v,`nodes.${i}`);
  }).filter((v):v is VisualNode=>v!==null);
  const ids=new Set(nodes.map(n=>n.nodeId));
  if(ids.size!==nodes.length||new Set(legacy.map(v=>(v as {nodeId:string}).nodeId)).size!==legacy.length||
    legacy.some(v=>ids.has((v as {nodeId:string}).nodeId as NodeId)))
    contentIssue('nodes','duplicate_node','Every authored node ID must be globally unique.');
  const sectionsById=new Map(sections.map(s=>[s.sectionId,s] as const));
  const lookup=new Map(nodes.map(n=>[n.nodeId,n] as const));
  const roots:VisualNode[]=[];
  for(const node of nodes){
    if(!sectionsById.has(node.sectionId))contentIssue('nodes','foreign_section','Node section must exist in this portfolio.');
    if(node.parentNodeId){
      const parent=lookup.get(node.parentNodeId);
      if(!parent||parent.sectionId!==node.sectionId||!PARENT_COMPONENTS.includes(parent.componentType))
        contentIssue('nodes','invalid_parent','Parent must be a supported container in the same section.');
    }else roots.push(node);
    const a=node.interaction;
    if(a.kind==='scrollToSection'&&!sectionsById.get(a.sectionId)?.visible)
      contentIssue('nodes','missing_interaction_target','Scroll target must be an existing visible section.');
    if(a.kind==='togglePanel'||a.kind==='openModal'){
      const target=lookup.get(a.targetNodeId);
      if(!target||target.sectionId!==node.sectionId||!PARENT_COMPONENTS.includes(target.componentType)||target.nodeId===node.nodeId)
        contentIssue('nodes','missing_interaction_target','Panel or modal target must be a sibling section container.');
    }
    if(a.kind==='switchTab'){
      const target=lookup.get(a.groupNodeId);
      if(!target||target.componentType!=='tabs'||!(target.props.items as {id:string}[]).some(x=>x.id===a.tabId))
        contentIssue('nodes','missing_interaction_target','Tab ID must belong to an approved tab block.');
    }
    if(a.kind==='advanceCarousel'&&lookup.get(a.carouselNodeId)?.componentType!=='carousel')
      contentIssue('nodes','missing_interaction_target','Carousel target is missing.');
    if(a.kind==='openContactForm'&&!nodes.some(x=>x.componentType==='contactForm'&&x.sectionId===node.sectionId))
      contentIssue('nodes','missing_interaction_target','Contact action requires a contact block in the section.');
  }
  // Actual semantic order is document order, not z-order or insertion order. Parent and child
  // reading positions are both required; a parent cannot move focus behind its own children.
  const visit=new Set<NodeId>(),active=new Set<NodeId>();
  const walk=(node:VisualNode,depth:number)=>{
    if(active.has(node.nodeId)||depth>3)contentIssue('nodes','node_cycle','Nested visual trees must be acyclic and at most three levels.');
    if(visit.has(node.nodeId))return;
    active.add(node.nodeId);
    for(const child of nodes.filter(x=>x.parentNodeId===node.nodeId)){
      if(child.readingOrder<node.readingOrder)contentIssue('nodes','reading_order','A child cannot precede its parent in semantic order.');
      walk(child,depth+1);
    }
    active.delete(node.nodeId);visit.add(node.nodeId);
  };
  for(const root of roots)walk(root,1);
  for(const node of nodes)if(node.semanticRole==='decorative'&&
    nodes.some(x=>x.parentNodeId===node.nodeId&&x.semanticRole!=='decorative'))
    contentIssue('nodes','decorative_focus','A decorative wrapper cannot contain meaningful content.');
  if(visit.size!==nodes.length)contentIssue('nodes','node_cycle','Unreachable or cyclic visual nodes are forbidden.');
  const h1=nodes.filter(n=>n.semanticRole==='h1');
  if(h1.length>1||h1.some(n=>sectionsById.get(n.sectionId)?.type!=='hero'))
    contentIssue('nodes','heading_outline','Only one primary H1 is allowed, inside Hero.');
  const reading=new Set<string>();
  for(const node of nodes){const key=`${node.sectionId}:${node.readingOrder}`;
    if(reading.has(key))contentIssue('nodes','reading_order','Reading order must be unique within each section.');
    reading.add(key);
  }
  return {nodes,legacyNodes:legacy};
}
