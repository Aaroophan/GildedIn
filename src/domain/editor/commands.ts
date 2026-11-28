/** Issue 10: finite editor commands over the Issue 6/7 owned schema, never over editor DOM. */
import type {ContentDraftShape,ContentBinding,SectionDefinition} from '../content/types.ts';
import {parseContentDraft,parseContentBinding,parseSection} from '../content/model.ts';
import {ContentDenied} from '../content/errors.ts';
import {parseCompositionNodes,parseVisualNode} from '../composition/validation.ts';
import {PARENT_COMPONENTS} from '../composition/registry.ts';
import {parseLayout,AUTO_DEFAULT} from '../composition/layout.ts';
import type {VisualNode,ComponentType,SafeLayout,Breakpoint,SafeInteraction} from '../composition/types.ts';
import {absoluteAt,ABSOLUTE_START} from './geometry.ts';
import {parseNodeId,parseSectionId} from '../../shared/domain/identifiers.ts';
export type CanvasCommand=
  | {type:'insert';nodeId:string;sectionId:string;componentType:ComponentType;parentNodeId?:string;props?:Record<string,unknown>;binding?:ContentBinding}
  | {type:'setProps';nodeId:string;props:Record<string,unknown>}
  | {type:'setLayout';nodeId:string;layout:SafeLayout;breakpoint?:Breakpoint}
  | {type:'clearOverride';nodeId:string;breakpoint:'mobile'|'tablet'}
  | {type:'setVisible';nodeId:string;breakpoint:Breakpoint;visible:boolean}
  | {type:'lock';nodeId:string;locked:boolean}
  | {type:'moveLayer';nodeId:string;axis:'visual'|'reading';step:-1|1}
  | {type:'duplicate';nodeId:string;ids:string[]}
  | {type:'delete';nodeId:string}
  | {type:'group';nodeIds:string[];groupId:string}
  | {type:'ungroup';nodeId:string}
  | {type:'reparent';nodeId:string;sectionId:string;parentNodeId?:string}
  | {type:'setBinding';nodeId:string;binding?:ContentBinding}
  | {type:'setInteraction';nodeId:string;interaction:SafeInteraction}
  | {type:'addSection';section:SectionDefinition}
  | {type:'removeSection';sectionId:string}
  | {type:'setSection';sectionId:string;title?:string;visible?:boolean}
  | {type:'moveSection';sectionId:string;step:-1|1}
  | {type:'reorderSection';sectionId:string;targetSectionId:string}
  | {type:'moveItem';collectionId:string;contentId:string;step:-1|1}
  | {type:'reorderItem';collectionId:string;contentId:string;targetContentId:string}
  | {type:'setItemField';collectionId:string;contentId:string;fieldId:string;value:unknown};
function deny(message:string,path='canvas'):never{
  throw new ContentDenied('CONTENT_INVALID',[{path,code:'editor_rejected',message}]);
}
const propsFor=(type:ComponentType):Record<string,unknown>=>{
  switch(type){
  case 'heading':return {level:2,text:'New heading'};
  case 'text':return {text:'Write your story here.',tone:'body'};
  case 'button':case 'link':return {label:'Learn more'};
  case 'image':return {mediaId:'',alt:''}; // requires selecting an owned image before insertion
  case 'repeater':case 'timeline':return {variant:type==='timeline'?'timeline':'cards',maxVisible:20,sort:'order'};
  case 'gallery':return {items:[]};
  case 'tabs':case 'accordion':return {items:[{id:'one',label:'First panel',body:'Add content'}]};
  case 'carousel':return {slides:[{id:'one',label:'First slide',body:'Add content'}]};
  case 'contactForm':return {label:'Contact',consentLabel:'I agree to share this message with the portfolio owner.'};
  case 'comparisonTable':return {caption:'Comparison',headers:['Feature','Details'],rows:[['Example','Description']]};
  default:return {};
  }
};
function owned(nodes:VisualNode[],nodeId:string):VisualNode{
  const node=nodes.find(n=>n.nodeId===nodeId);
  if(!node)deny('The selected block no longer exists.','nodeId');
  return node!;
}
function writable(nodes:VisualNode[],nodeId:string):VisualNode{
  const node=owned(nodes,nodeId);
  if(node.locked)deny('Unlock this layer before changing it.','nodeId');
  let parent=node.parentNodeId;const visited=new Set<string>();
  while(parent&&!visited.has(parent)){visited.add(parent);const owner=owned(nodes,parent);
    if(owner.locked)deny('Unlock the containing group before changing its children.','nodeId');
    parent=owner.parentNodeId;}
  return node;
}
function descendants(nodes:VisualNode[],root:string):VisualNode[]{
  const all:VisualNode[]=[];const visit=(id:string)=>{
    const node=owned(nodes,id);all.push(node);
    for(const child of nodes.filter(n=>n.parentNodeId===id))visit(child.nodeId);
  };visit(root);return all;
}
/** Order is a separate semantic traversal, never inferred from z-order. */
function reindex(nodes:VisualNode[],sectionId:string):void{
  const section=nodes.filter(n=>n.sectionId===sectionId);
  const compare=(a:VisualNode,b:VisualNode)=>a.readingOrder-b.readingOrder||a.nodeId.localeCompare(b.nodeId);
  let position=0;
  const walk=(parent?:string)=>{
    const siblings=section.filter(n=>n.parentNodeId===parent).sort(compare);
    for(const node of siblings){node.readingOrder=position++;walk(node.nodeId);}
  };
  walk();
  section.sort((a,b)=>a.visualOrder-b.visualOrder||a.nodeId.localeCompare(b.nodeId))
    .forEach((n,i)=>{n.visualOrder=i;});
}
function touch(node:VisualNode,updates:Partial<VisualNode>){Object.assign(node,updates);}
export function newEditorSection(type:SectionDefinition['type'],id:string,existing:readonly SectionDefinition[]):SectionDefinition{
  if(type==='hero'||type==='custom')deny('Choose a supported optional section type.','section.type');
  parseSectionId(id);
  const number=existing.filter(x=>x.type===type).length+1;
  const publicAnchor=`${type}${number===1?'':`-${number}`}`;
  return parseSection({sectionId:id,type,title:type[0].toUpperCase()+type.slice(1),order:existing.length,
    visible:true,searchEligible:false,aiSectionApproved:false,canvasRootId:`root_${id.replace(/-/g,'')}`,
    layoutPreset:'auto',publicAnchor},'editor.newSection');
}
/** Produces an entirely new candidate; the previous valid draft remains intact on every failure. */
export function applyCanvasCommand(source:ContentDraftShape,command:CanvasCommand):ContentDraftShape{
  const current=parseContentDraft(source);
  // Never auto-migrate the private Issue 6 reference-only stubs into arbitrary visual blocks.
  const nodes=parseCompositionNodes(current.nodes,current.sections,{allowLegacy:false}).nodes
    .map(n=>structuredClone(n));
  const draft:ContentDraftShape={...current,nodes,sections:current.sections.map(s=>structuredClone(s)),
    contentCollections:current.contentCollections.map(c=>({collectionId:c.collectionId,
      items:c.items.map(i=>structuredClone(i))}))};
  const sectionExists=(sectionId:string)=>{
    if(!draft.sections.some(s=>s.sectionId===sectionId))deny('Choose a section in this portfolio.','sectionId');
  };
  const parentAllowed=(id:string|undefined,sectionId:string)=>{
    if(id){const parent=owned(nodes,id);if(parent.sectionId!==sectionId||!PARENT_COMPONENTS.includes(parent.componentType))
      deny('Choose an approved group/container inside the same section.','parentNodeId');}
  };
  switch(command.type){
  case 'insert':{
    sectionExists(command.sectionId);parentAllowed(command.parentNodeId,command.sectionId);
    if(nodes.length>=20)deny('The portfolio has reached 20 authored visual blocks.');
    const nodeId=parseNodeId(command.nodeId);
    if(nodes.some(n=>n.nodeId===nodeId))deny('The block identifier is already used.');
    const peers=nodes.filter(n=>n.sectionId===command.sectionId);
    const node=parseVisualNode({nodeId,sectionId:command.sectionId,
      ...(command.parentNodeId?{parentNodeId:command.parentNodeId}:{}),componentType:command.componentType,
      componentVersion:1,props:command.props??propsFor(command.componentType),
      ...(command.binding?{contentBinding:command.binding}:{}),layout:AUTO_DEFAULT,
      visualOrder:peers.length,readingOrder:peers.length,interaction:{kind:'none'}},'editor.insert');
    nodes.push(node);break;
  }
  case 'setProps':writable(nodes,command.nodeId).props=command.props;break;
  case 'setLayout':{
    const node=writable(nodes,command.nodeId);
    const value=parseLayout(command.layout,'editor.layout');
    if(command.breakpoint&&command.breakpoint!=='desktop')
      node.responsiveOverrides={...node.responsiveOverrides,[command.breakpoint]:value};
    else node.layout=value;
    break;
  }
  case 'clearOverride':{
    const node=writable(nodes,command.nodeId),v={...node.responsiveOverrides};delete v[command.breakpoint];
    if(Object.keys(v).length)node.responsiveOverrides=v;else delete node.responsiveOverrides;
    break;
  }
  case 'setVisible':{
    const node=writable(nodes,command.nodeId);
    node.visibilityByBreakpoint={...node.visibilityByBreakpoint,[command.breakpoint]:command.visible};break;
  }
  case 'lock':owned(nodes,command.nodeId).locked=command.locked;break;
  case 'moveLayer':{
    const node=writable(nodes,command.nodeId);
    const siblings=nodes.filter(x=>x.sectionId===node.sectionId&&
      (command.axis==='visual'||x.parentNodeId===node.parentNodeId))
      .sort((a,b)=>(command.axis==='visual'?a.visualOrder-b.visualOrder:a.readingOrder-b.readingOrder));
    const index=siblings.findIndex(x=>x.nodeId===node.nodeId),neighbor=siblings[index+command.step];
    if(neighbor){const key=command.axis==='visual'?'visualOrder':'readingOrder';
      const old=node[key];node[key]=neighbor[key];neighbor[key]=old;}
    break;
  }
  case 'duplicate':{
    const originals=descendants(nodes,command.nodeId);writable(nodes,command.nodeId);
    if(originals.length!==command.ids.length||nodes.length+originals.length>20)
      deny('Duplicating this group would exceed 20 authored blocks or its ID count.');
    const idMap=new Map(originals.map((node,i)=>[node.nodeId,parseNodeId(command.ids[i])]));
    if(new Set(idMap.values()).size!==idMap.size||[...idMap.values()].some(id=>nodes.some(n=>n.nodeId===id)))
      deny('Duplicate blocks need new unique UUIDs.');
    const offset=Math.max(0,...nodes.filter(n=>n.sectionId===originals[0].sectionId).map(x=>x.readingOrder))+1;
    originals.forEach((node,i)=>nodes.push({...structuredClone(node),nodeId:idMap.get(node.nodeId)!,
      ...(node.parentNodeId?{parentNodeId:idMap.get(node.parentNodeId)??node.parentNodeId}:{}),
      readingOrder:offset+i,visualOrder:offset+i,locked:false}));
    break;
  }
  case 'delete':{
    writable(nodes,command.nodeId);const remove=new Set(descendants(nodes,command.nodeId).map(n=>n.nodeId));
    for(let i=nodes.length-1;i>=0;i--)if(remove.has(nodes[i].nodeId))nodes.splice(i,1);
    // Dangling action targets or references are detected by the final graph validation, not silently removed.
    break;
  }
  case 'group':{
    if(command.nodeIds.length<2||new Set(command.nodeIds).size!==command.nodeIds.length||nodes.length>=20)
      deny('Choose two or more distinct unlocked blocks within the 20-block limit.');
    const selected=command.nodeIds.map(id=>writable(nodes,id));
    if(selected.some(n=>n.sectionId!==selected[0].sectionId||n.parentNodeId!==selected[0].parentNodeId))
      deny('Grouping requires siblings in one section and parent.');
    if(selected.some(n=>selected.some(other=>other.nodeId===n.parentNodeId)))deny('Select siblings, not a group and its descendants.');
    const groupId=parseNodeId(command.groupId);
    if(nodes.some(n=>n.nodeId===groupId))deny('Group identifier already exists.');
    const allAbs=selected.every(n=>n.layout.mode==='absolute'&&n.layout.anchorX==='left'&&n.layout.anchorY==='top');
    let layout:SafeLayout=AUTO_DEFAULT;
    if(allAbs){
      const abs=selected.map(n=>n.layout as Extract<SafeLayout,{mode:'absolute'}>);
      const x=Math.min(...abs.map(n=>n.x)),y=Math.min(...abs.map(n=>n.y));
      const right=Math.max(...abs.map(n=>n.x+n.width)),bottom=Math.max(...abs.map(n=>n.y+n.height));
      const w=Math.max(.05,right-x),h=Math.max(.05,bottom-y);
      layout=absoluteAt(ABSOLUTE_START,{x,y,width:w,height:h});
      selected.forEach(node=>{
        const old=node.layout as Extract<SafeLayout,{mode:'absolute'}>;
        node.layout=absoluteAt(old,{x:(old.x-x)/w,y:(old.y-y)/h,width:old.width/w,height:old.height/h});
      });
    }
    const originalParent=selected[0].parentNodeId;
    selected.forEach(n=>n.parentNodeId=groupId);
    nodes.push(parseVisualNode({nodeId:groupId,sectionId:selected[0].sectionId,
      ...(originalParent?{parentNodeId:originalParent}:{}),
      componentType:'group',componentVersion:1,props:{label:'Group'},layout,
      readingOrder:Math.min(...selected.map(x=>x.readingOrder)),
      visualOrder:Math.min(...selected.map(x=>x.visualOrder)),interaction:{kind:'none'}},'editor.group'));
    break;
  }
  case 'ungroup':{
    const group=writable(nodes,command.nodeId);
    if(!['group','container','grid'].includes(group.componentType))deny('Select a container/group to ungroup.');
    for(const child of nodes.filter(n=>n.parentNodeId===group.nodeId)){
      if(group.parentNodeId)child.parentNodeId=group.parentNodeId;else delete child.parentNodeId;
      if(group.layout.mode==='absolute'&&child.layout.mode==='absolute'&&
        group.layout.anchorX==='left'&&group.layout.anchorY==='top'&&child.layout.anchorX==='left'&&child.layout.anchorY==='top'){
        const outer=group.layout,inner=child.layout;
        child.layout=absoluteAt(inner,{x:outer.x+inner.x*outer.width,y:outer.y+inner.y*outer.height,
          width:inner.width*outer.width,height:inner.height*outer.height});
      }else if(group.layout.mode!=='auto')child.layout=AUTO_DEFAULT;
    }
    nodes.splice(nodes.findIndex(n=>n.nodeId===group.nodeId),1);
    break;
  }
  case 'reparent':{
    const node=writable(nodes,command.nodeId);sectionExists(command.sectionId);
    if(command.parentNodeId&&descendants(nodes,node.nodeId).some(n=>n.nodeId===command.parentNodeId))
      deny('A group cannot be moved into itself or its descendants.');
    parentAllowed(command.parentNodeId,command.sectionId);
    const subtree=descendants(nodes,node.nodeId);
    for(const child of subtree)child.sectionId=parseSectionId(command.sectionId);
    if(command.parentNodeId)node.parentNodeId=parseNodeId(command.parentNodeId);else delete node.parentNodeId;
    const destination=nodes.filter(n=>n.sectionId===command.sectionId&&!subtree.includes(n));
    subtree.forEach((n,i)=>{n.readingOrder=destination.length+i;n.visualOrder=destination.length+i;});
    break;
  }
  case 'setBinding':{
    const node=writable(nodes,command.nodeId);
    if(command.binding)node.contentBinding=parseContentBinding(command.binding,'editor.binding');
    else delete node.contentBinding;
    break;
  }
  case 'setInteraction':writable(nodes,command.nodeId).interaction=command.interaction;break;
  case 'addSection':{
    if(draft.sections.some(s=>s.sectionId===command.section.sectionId)||command.section.type==='hero'||
      command.section.type==='custom')deny('New sections must have unique IDs and supported types.');
    const section=parseSection(command.section,'editor.section');
    if(section.order!==draft.sections.length||section.aiSectionApproved||section.searchEligible)
      deny('New sections are private, not pre-approved for AI or search.');
    draft.sections.push(section);break;
  }
  case 'removeSection':{
    const section=draft.sections.find(s=>s.sectionId===command.sectionId);
    if(!section||section.type==='hero'||draft.collectionDefinitions.some(c=>c.sectionId===section.sectionId))
      deny('Hero and sections with attached schemas cannot be removed.');
    draft.sections=draft.sections.filter(s=>s.sectionId!==command.sectionId);
    for(let i=nodes.length-1;i>=0;i--)if(nodes[i].sectionId===command.sectionId)nodes.splice(i,1);
    draft.sections.forEach((s,i)=>{s.order=i;});break;
  }
  case 'setSection':{
    const section=draft.sections.find(s=>s.sectionId===command.sectionId);
    if(!section)deny('Section unavailable.');
    if(command.title!==undefined)section!.title=command.title;
    if(command.visible!==undefined){if(section!.type==='hero'&&!command.visible)deny('The Hero must remain visible.');
      section!.visible=command.visible;}
    break;
  }
  case 'moveSection':{
    const index=draft.sections.findIndex(s=>s.sectionId===command.sectionId);
    const target=index+command.step;
    if(index<0)deny('Section not found.');
    if(index===0||target<=0||target>=draft.sections.length)break;
    [draft.sections[index],draft.sections[target]]=[draft.sections[target],draft.sections[index]];
    draft.sections.forEach((s,i)=>{s.order=i;});break;
  }
  case 'reorderSection':{
    const origin=draft.sections.findIndex(s=>s.sectionId===command.sectionId);
    const target=draft.sections.findIndex(s=>s.sectionId===command.targetSectionId);
    if(origin<0||target<0)deny('Section no longer exists.');
    if(origin===0)deny('The required Hero section cannot move.');
    if(origin!==target){const [section]=draft.sections.splice(origin,1);
      draft.sections.splice(Math.max(1,target),0,section);
      draft.sections.forEach((s,i)=>{s.order=i;});}
    break;
  }
  case 'reorderItem':{
    const collection=draft.contentCollections.find(c=>c.collectionId===command.collectionId);
    if(!collection)deny('Collection unavailable.');
    const origin=collection.items.findIndex(i=>i.contentId===command.contentId);
    const target=collection.items.findIndex(i=>i.contentId===command.targetContentId);
    if(origin<0||target<0)deny('Content item does not belong to this collection.');
    if(origin!==target){const [item]=collection.items.splice(origin,1);
      collection.items.splice(target,0,item);
      collection.items.forEach((i,index)=>{i.sortOrder=index;});}
    break;
  }
  case 'moveItem':{
    const collection=draft.contentCollections.find(c=>c.collectionId===command.collectionId);
    if(!collection)deny('Collection unavailable.');
    const index=collection!.items.findIndex(i=>i.contentId===command.contentId);
    if(index<0)deny('Item unavailable.');
    const next=index+command.step;
    if(next<0||next>=collection!.items.length)break;
    [collection!.items[index],collection!.items[next]]=[collection!.items[next],collection!.items[index]];
    collection!.items.forEach((item,i)=>{item.sortOrder=i;});break;
  }
  case 'setItemField':{
    const collection=draft.contentCollections.find(c=>c.collectionId===command.collectionId);
    const item=collection?.items.find(i=>i.contentId===command.contentId);
    if(!item)deny('Content item is not owned by this draft.');
    const definition=draft.collectionDefinitions.find(c=>c.collectionId===command.collectionId);
    if(!definition?.fields.some(f=>f.fieldId===command.fieldId))deny('Unknown typed field.');
    item!.fields={...item!.fields,[command.fieldId]:command.value};break;
  }
  default:{const impossible:never=command;return impossible;}
  }
  for(const section of draft.sections)reindex(nodes,section.sectionId);
  // Re-parse the FULL candidate: IDs, graph, props, breakpoint rules, fields, limits and links.
  return parseContentDraft(draft);
}
/** Inspector choices are positive allowlist projections, never a private-item values dump. */
export interface BindingChoice {id:string;label:string;binding:ContentBinding;}
export function eligibleBindingChoices(doc:ContentDraftShape,kind:ComponentType):BindingChoice[]{
  const source=parseContentDraft(doc),choices:BindingChoice[]=[];
  if(['text','heading','card','button','link'].includes(kind)){
    for(const fieldId of ['displayName','identityLabel','introduction'])choices.push({id:`profile:${fieldId}`,
      label:`Hero · ${fieldId}`,binding:{source:'profile',fieldId}});
  }
  for(const collection of source.contentCollections){
    const definition=source.collectionDefinitions.find(c=>c.collectionId===collection.collectionId);
    if(!definition)continue;
    if(['repeater','timeline'].includes(kind)){
      choices.push({id:`collection:${collection.collectionId}`,label:`${definition.displayName} · public eligible items`,
        binding:{source:'collection',collectionId:collection.collectionId}});
      continue;
    }
    if(!['text','heading','card','button','link'].includes(kind))continue;
    for(const item of collection.items){if(item.ownerVisibility!=='public_candidate')continue;
      for(const field of definition.fields){if(!item.publicFieldIds.includes(field.fieldId)||
        !['text','richText','url'].includes(field.type))continue;
        choices.push({id:`item:${item.contentId}:${field.fieldId}`,
          label:`${definition.displayName} · ${field.label} (${item.slug??'item'})`,binding:{source:'collectionItem',
            collectionId:collection.collectionId,contentId:item.contentId,fieldId:field.fieldId}});
      }
    }
  }
  return choices.slice(0,240);
}
/** Render owner-only draft content without guessing private data or bypassing release approval. */
export function canvasNodeText(doc:ContentDraftShape,node:VisualNode):string{
  const binding=node.contentBinding;
  if(binding?.source==='profile')return String(doc.profile[binding.fieldId??'displayName']??binding.fallback??'');
  if(binding?.source==='collectionItem'){
    const item=doc.contentCollections.find(c=>c.collectionId===binding.collectionId)?.items
      .find(i=>i.contentId===binding.contentId);
    if(!item||item.ownerVisibility!=='public_candidate'||!item.publicFieldIds.includes(binding.fieldId??''))
      return '[Private or missing item — not eligible for publication]';
    const value=item.fields[binding.fieldId??''];return typeof value==='string'?value:'[Structured field: inspect content]';
  }
  if(binding?.source==='collection'){
    const c=doc.contentCollections.find(x=>x.collectionId===binding.collectionId);
    const count=c?.items.filter(i=>i.ownerVisibility==='public_candidate').length??0;
    return `${count} approved collection item(s) · one authored block`;
  }
  if(binding)return '[Derived source available only after compilation]';
  return String(node.props.text??node.props.label??node.props.caption??node.componentType);
}
export function selectedDependentNodes(nodes:readonly VisualNode[],id:string):string[]{
  return nodes.filter(n=>n.interaction.kind==='togglePanel'||n.interaction.kind==='openModal'
    ?n.interaction.targetNodeId===id:n.interaction.kind==='switchTab'?n.interaction.groupNodeId===id:
      n.interaction.kind==='advanceCarousel'?n.interaction.carouselNodeId===id:false).map(n=>n.nodeId);
}
