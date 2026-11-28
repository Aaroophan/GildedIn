/** Early owner-facing diagnostics. Publication compiler remains the authoritative gate. */
import type {ContentDraftShape} from '../content/types.ts';
import type {VisualNode,Breakpoint,AbsoluteLayout} from '../composition/types.ts';
import {parseCompositionNodes} from '../composition/validation.ts';
import {resolveLayout} from '../composition/layout.ts';
import {breakpointForWidth} from './geometry.ts';
export interface EditorDiagnostic {code:'overlap'|'small_target'|'text_capacity'|'hidden_action'|'missing_binding';
  nodeId:string;sectionId:string;message:string;repair:string;severity:'warning'|'blocker';}
function rect(node:VisualNode,mode:Breakpoint):AbsoluteLayout|undefined{
  const layout=resolveLayout(node.layout,node.responsiveOverrides??{},mode,node.semanticRole!=='decorative');
  return layout.mode==='absolute'?layout:layout.mode==='hybrid'?layout.placement:undefined;
}
function actual(l:AbsoluteLayout){return {x:l.anchorX==='left'?l.x:l.anchorX==='center'?l.x-l.width/2:1-l.x-l.width,
  y:l.anchorY==='top'?l.y:l.anchorY==='center'?l.y-l.height/2:1-l.y-l.height,w:l.width,h:l.height};}
export function inspectCanvasLayout(draft:ContentDraftShape,width:number):EditorDiagnostic[]{
  const mode=breakpointForWidth(width);
  const {nodes}=parseCompositionNodes(draft.nodes,draft.sections,{allowLegacy:true});
  const visible=nodes.filter(n=>draft.sections.some(s=>s.sectionId===n.sectionId&&s.visible)&&
    n.visibilityByBreakpoint?.[mode]!==false);
  const issues:EditorDiagnostic[]=[];
  for(const node of nodes){
    const actionable=node.componentType==='button'||node.componentType==='link'||node.componentType==='contactForm';
    if(actionable&&node.visibilityByBreakpoint?.[mode]===false)
      issues.push({code:'hidden_action',nodeId:node.nodeId,sectionId:node.sectionId,
        message:'An actionable block is hidden at this breakpoint.',repair:'Review intended visibility and alternate navigation.',severity:'warning'});
    const box=rect(node,mode);
    if(box){
      if(actionable&&(box.width*width<44||box.height*600<44))
        issues.push({code:'small_target',nodeId:node.nodeId,sectionId:node.sectionId,
          message:'The nominal interactive area may be smaller than 44 CSS px.',
          repair:'Increase width/height or switch to Auto layout.',severity:'warning'});
      const text=typeof node.props.text==='string'?node.props.text:'';
      if(text.length>120&&box.height<.18)
        issues.push({code:'text_capacity',nodeId:node.nodeId,sectionId:node.sectionId,
          message:'Long text may extend past its absolute frame, especially at 200%/400% zoom.',
          repair:'Increase height, use Auto layout or inspect at narrow widths.',severity:'warning'});
    }
    if(node.contentBinding?.source==='collectionItem'){
      const c=draft.contentCollections.find(c=>c.collectionId===node.contentBinding?.collectionId);
      if(!c?.items.some(item=>item.contentId===node.contentBinding?.contentId&&
        item.ownerVisibility==='public_candidate'&&item.publicFieldIds.includes(node.contentBinding?.fieldId??'')))
        issues.push({code:'missing_binding',nodeId:node.nodeId,sectionId:node.sectionId,
          message:'The bound content is missing or not explicitly approved for public fields.',
          repair:'Review content visibility in the owner collection before publication.',severity:'blocker'});
    }
  }
  for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
    const a=visible[i],b=visible[j];if(a.sectionId!==b.sectionId||a.parentNodeId!==b.parentNodeId)continue;
    const al=rect(a,mode),bl=rect(b,mode);if(!al||!bl)continue;
    const ar=actual(al),br=actual(bl);
    const ox=Math.max(0,Math.min(ar.x+ar.w,br.x+br.w)-Math.max(ar.x,br.x));
    const oy=Math.max(0,Math.min(ar.y+ar.h,br.y+br.h)-Math.max(ar.y,br.y));
    if(ox*oy/Math.min(ar.w*ar.h,br.w*br.h)<.2)continue;
    for(const node of [a,b])if(['button','link','contactForm','heading'].includes(node.componentType))
      issues.push({code:'overlap',nodeId:node.nodeId,sectionId:node.sectionId,
        message:'Two absolute blocks overlap; an important heading or control may be covered.',
        repair:'Use Auto layout, adjust positions or verify focus/zoom behavior.',severity:'warning'});
  }
  return issues.slice(0,40);
}
