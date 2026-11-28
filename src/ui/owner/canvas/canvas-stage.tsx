'use client';
import type {CSSProperties,ReactNode} from 'react';
import {resolveLayout,GAPS} from '../../../domain/composition/layout.ts';
import {canvasNodeText} from '../../../domain/editor/commands.ts';
import type {VisualNode,SafeLayout,AbsoluteLayout} from '../../../domain/composition/types.ts';
import type {CanvasView} from './contracts.ts';
function absoluteCoordinates(g:AbsoluteLayout){
  return {x:g.anchorX==='left'?g.x:g.anchorX==='center'?g.x-g.width/2:1-g.x-g.width,
    y:g.anchorY==='top'?g.y:g.anchorY==='center'?g.y-g.height/2:1-g.y-g.height};
}
function editorStyle(value:SafeLayout):CSSProperties{
  const common:CSSProperties={maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'};
  if(value.mode==='auto')return {...common,position:'relative',display:value.flow==='grid'?'grid':'flex',
    flexDirection:value.flow==='grid'?undefined:value.flow,flexWrap:value.flow==='row'?'wrap':'nowrap',
    gridTemplateColumns:value.flow==='grid'?`repeat(${value.columns??1},minmax(0,1fr))`:undefined,
    gap:GAPS[value.gapToken??'md'],alignItems:value.alignment==='center'?'center':value.alignment==='end'?'flex-end':
      value.alignment==='start'?'flex-start':'stretch'};
  const g=value.mode==='hybrid'?value.placement:value;
  const a=absoluteCoordinates(g);
  return {...common,position:'absolute',left:`${a.x*100}%`,top:`${a.y*100}%`,
    width:`${g.width*100}%`,minHeight:`${g.height*100}%`,
    zIndex:{decoration:0,base:1,raised:2,overlay:3}[g.zIndexToken],
    ...(value.mode==='hybrid'?{display:'flex',flexDirection:value.childrenFlow.flow==='row'?'row':'column'}:{})};
}
function ShortRepeat({view,node}:{view:CanvasView;node:VisualNode}){
  const binding=node.contentBinding;
  const items=binding?.source==='collection'?view.doc.contentCollections.find(c=>c.collectionId===binding.collectionId)?.items??[]:[];
  const eligible=items.filter(i=>i.ownerVisibility==='public_candidate').slice(0,Math.min(20,Number(node.props.maxVisible??20)));
  return <div className="gi-canvas-repeater">
    {eligible.length?eligible.map(item=>{
      const title=typeof item.fields.title==='string'&&item.publicFieldIds.includes('title')?item.fields.title:
        item.slug??'Approved item';
      return <div key={item.contentId} className="gi-canvas-repeater-card">{title}</div>;
    }):<span className="gi-canvas-placeholder">No eligible published-field items yet. Draft items are not public.</span>}
  </div>;
}
function BlockBody({view,node,children}:{view:CanvasView;node:VisualNode;children?:ReactNode}){
  const text=canvasNodeText(view.doc,node),kind=node.componentType;
  if(kind==='heading')return node.props.level===1?<h1 className="gi-canvas-node-heading">{text}</h1>:
    node.props.level===3?<h3 className="gi-canvas-node-heading">{text}</h3>:<h2 className="gi-canvas-node-heading">{text}</h2>;
  if(kind==='text')return <p className="gi-canvas-node-copy">{text}</p>;
  if(kind==='button')return <span className="gi-canvas-fake-button">{text}</span>;
  if(kind==='link')return <span className="gi-canvas-fake-link">{text}</span>;
  if(kind==='repeater'||kind==='timeline')return <ShortRepeat view={view} node={node}/>;
  if(kind==='image'||kind==='gallery')return <div className="gi-canvas-placeholder">Media placeholder · upload and approval required</div>;
  if(kind==='tabs'||kind==='accordion'||kind==='carousel'){
    const items=(kind==='carousel'?node.props.slides:node.props.items) as {id:string;label:string;body:string}[]|undefined;
    return <div className="gi-canvas-panels"><strong>{String(node.props.label??kind)}</strong>
      {items?.map(item=><div key={item.id}><strong>{item.label}</strong><p>{item.body}</p></div>)}</div>;
  }
  if(kind==='comparisonTable'){
    const headers=(node.props.headers??[]) as string[],rows=(node.props.rows??[]) as string[][];
    return <table className="gi-canvas-table"><caption>{String(node.props.caption??'Comparison')}</caption>
      <thead><tr>{headers.map((h,i)=><th key={i} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table>;
  }
  if(kind==='contactForm')return <div className="gi-canvas-placeholder">Contact form · requires a protected published endpoint (Issue 17)</div>;
  if(['container','group','grid','card'].includes(kind))return <div className="gi-canvas-group">
    {node.props.label?<strong>{String(node.props.label)}</strong>:<span className="gi-canvas-mini-label">{kind} frame</span>}
    <div className="gi-canvas-child-wrap">{children}</div></div>;
  return <div>{text}{children}</div>;
}
export default function CanvasStage(view:CanvasView){
  const active=view.activeSection;
  const displayed=view.nodes.filter(n=>n.sectionId===active.sectionId);
  const byParent=(parent?:string)=>displayed.filter(n=>n.parentNodeId===parent)
    .sort((a,b)=>a.readingOrder-b.readingOrder);
  function renderTree(parent?:string):ReactNode{
    return byParent(parent).map(node=>{
      const isVisible=node.visibilityByBreakpoint?.[view.breakpoint]!==false;
      if(!isVisible)return null;
      const resolved=resolveLayout(node.layout,node.responsiveOverrides??{},view.breakpoint,
        node.semanticRole!=='decorative');
      const current=view.gesture?.nodeId===node.nodeId?view.gesture.layout:resolved;
      const selected=view.selectedIds.includes(node.nodeId);
      const editing=view.inlineNodeId===node.nodeId;
      const canInline=!node.contentBinding&&['heading','text'].includes(node.componentType)&&!node.locked;
      return <div key={node.nodeId} className={`gi-canvas-node${selected?' gi-is-selected':''}`}
        data-editor-node={node.nodeId} data-editor-component={node.componentType}
        style={editorStyle(current)}>
        {editing?<textarea className="gi-canvas-inline" autoFocus value={view.inlineValue}
          aria-label={`Edit ${node.componentType} text`} onChange={e=>view.changeInline(e.currentTarget.value)}
          onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();view.endInline(false);}else if(e.key==='Enter'&&!e.shiftKey){
            e.preventDefault();view.endInline(true);}}}
          onBlur={()=>view.endInline(true)} maxLength={node.componentType==='heading'?600:10000}/>:<BlockBody view={view} node={node}>
          {renderTree(node.nodeId)}</BlockBody>}
        {!view.preview?<>
          <button className="gi-canvas-select-surface" type="button" aria-label={`Select ${node.componentType} block${node.locked?' (locked)':''}`}
            aria-pressed={selected} onClick={e=>view.select(node.nodeId,e.shiftKey||e.ctrlKey||e.metaKey)}
            onDoubleClick={()=>{if(canInline)view.startInline(node.nodeId);else{
              const child=byParent(node.nodeId)[0];if(child)view.select(child.nodeId,false);}}}
            onKeyDown={e=>{if(e.key==='Escape'&&node.parentNodeId)view.select(node.parentNodeId,false);
              if(e.key==='F2'&&canInline){e.preventDefault();view.startInline(node.nodeId);}}}/>
          {selected?<div className="gi-canvas-handles" aria-label="Canvas transform controls">
            <button type="button" className="gi-canvas-drag-handle" title="Drag to reposition; use inspector for no-drag controls"
              aria-label={`Move ${node.componentType} block`}
              disabled={node.locked} onPointerDown={e=>view.pointerDown(node.nodeId,'move',e)}
              onPointerMove={view.pointerMove} onPointerUp={e=>view.pointerEnd(e)}
              onPointerCancel={e=>view.pointerEnd(e,true)} onLostPointerCapture={e=>view.pointerEnd(e,true)}>
                <span aria-hidden="true">✥</span></button>
            <button type="button" className="gi-canvas-resize-handle" title="Drag to resize; inspector has numeric controls"
              aria-label={`Resize ${node.componentType} block`} disabled={node.locked}
              onPointerDown={e=>view.pointerDown(node.nodeId,'resize',e)} onPointerMove={view.pointerMove}
              onPointerUp={e=>view.pointerEnd(e)} onPointerCancel={e=>view.pointerEnd(e,true)}
              onLostPointerCapture={e=>view.pointerEnd(e,true)}><span aria-hidden="true">◢</span></button>
          </div>:null}</>:null}
      </div>;
    });
  }
  const hasH1=displayed.some(n=>n.semanticRole==='h1');
  return <div className="gi-canvas-viewport" aria-label="Owner-only responsive canvas">
    <div className="gi-canvas-scroll">
      <div className="gi-canvas-sheet" data-editor-preview={view.preview?'true':'false'}
        data-editor-motion={view.playing?'play':'off'} onAnimationEnd={view.endPlay}
        style={{width:`${view.width}px`,transform:`scale(${view.zoom/100})`,transformOrigin:'top left',
          marginBottom:`${Math.round(600*(view.zoom/100-1))}px`}}>
        <div className="gi-canvas-section-label"><span>PRIVATE DRAFT / {active.type.toUpperCase()}</span>
          <span>{view.width} CSS px · {view.breakpoint}</span></div>
        <section className="gi-canvas-section-frame" aria-label={`${active.title} editing canvas`}>
          {active.type==='hero'&&!hasH1?<header className="gi-canvas-hero-scaffold">
            <p className="gi-eyebrow">YOUR PORTFOLIO</p>
            <h1>{String(view.doc.profile.displayName??'Your name')}</h1>
            <p>{String(view.doc.profile.identityLabel??'Your professional identity')}</p>
            <p>{String(view.doc.profile.introduction??'Your introduction')}</p>
          </header>:<header className="gi-canvas-section-title"><h2>{active.title}</h2></header>}
          <div className="gi-canvas-nodes" aria-label="Authored visual blocks">
            {renderTree()}
            {!displayed.length?<div className="gi-canvas-empty">Select a block from the library to arrange this section.
              <span>Initial Hero content is a protected scaffold, not an authored visual block.</span></div>:null}
            {view.gesture?.guides.map((guide,i)=><span key={`${guide.axis}-${i}`} aria-hidden="true"
              className={`gi-canvas-snap-guide gi-guide-${guide.axis}`}
              style={guide.axis==='x'?{left:`${guide.position*100}%`}:{top:`${guide.position*100}%`}}/>)}
          </div>
        </section>
      </div>
    </div>
    <p className="gi-canvas-disclaimer">Canvas is private authoring, not the public portfolio. Responsive layout and reading order are validated again before publication.</p>
  </div>;
}
