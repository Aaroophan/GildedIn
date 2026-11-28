'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent,KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {ContentDraftShape} from '../../../domain/content/types.ts';
import type {ComponentType,VisualNode,Breakpoint,AbsoluteLayout,SafeLayout} from '../../../domain/composition/types.ts';
import {parseCompositionNodes} from '../../../domain/composition/validation.ts';
import {resolveLayout} from '../../../domain/composition/layout.ts';
import {applyCanvasCommand} from '../../../domain/editor/commands.ts';
import type {CanvasCommand} from '../../../domain/editor/commands.ts';
import {initialHistory,commitHistory,undoHistory,redoHistory} from '../../../domain/editor/history.ts';
import {gestureGeometry,normalizedAbsolute,breakpointForWidth} from '../../../domain/editor/geometry.ts';
import type {Handle,GeometryGuide} from '../../../domain/editor/geometry.ts';
import {inspectCanvasLayout} from '../../../domain/editor/diagnostics.ts';
import {OwnerRequestError,ownerRequest} from '../request.ts';
import CanvasStage from './canvas-stage.tsx';
import CanvasStructure from './canvas-structure.tsx';
import CanvasInspector from './canvas-inspector.tsx';
interface SaveResponse {revision:number;updatedAt:string;status:'saved'|'replayed';}
interface Gesture {nodeId:string;pointerId:number;startX:number;startY:number;parentWidth:number;parentHeight:number;
  original:AbsoluteLayout;source:SafeLayout;handle:Handle;neighbors:AbsoluteLayout[];}
const DEVICE_WIDTHS:Record<Breakpoint,number>={desktop:1200,tablet:820,mobile:390};
const seed=(doc:ContentDraftShape):ContentDraftShape=>JSON.parse(JSON.stringify(doc)) as ContentDraftShape;
export default function CanvasEditor({portfolioId,revision,initial}:{portfolioId:string;revision:number;initial:ContentDraftShape}){
  const [history,setHistory]=useState(()=>initialHistory(seed(initial)));
  const [savedFingerprint,setSavedFingerprint]=useState(()=>JSON.stringify(initial));
  const [serverRevision,setRevision]=useState(revision);
  const [selectedIds,setSelected]=useState<string[]>([]);
  const [sectionId,setSectionId]=useState(initial.sections[0]?.sectionId??'');
  const [sideView,setSideView]=useState<'sections'|'blocks'|'collections'>('sections');
  const [width,setWidth]=useState(1200),[zoom,setZoom]=useState(100);
  const [preview,setPreview]=useState(false),[playing,setPlaying]=useState(false);
  const [snapping,setSnapping]=useState(true),[busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('Local editing ready. No changes have been published.');
  const [gesture,setGesture]=useState<{nodeId:string;layout:AbsoluteLayout;guides:GeometryGuide[]} | undefined>();
  const [inlineNodeId,setInlineNodeId]=useState<string|null>(null),[inlineValue,setInlineValue]=useState('');
  const gestureRef=useRef<Gesture|null>(null);
  const inlineRef=useRef<string|null>(null);
  const retryRef=useRef<{fingerprint:string;token:string}|null>(null);
  const doc=history.present;
  const fingerprint=JSON.stringify(doc);
  const dirty=fingerprint!==savedFingerprint;
  const parsed=useMemo(()=>parseCompositionNodes(doc.nodes,doc.sections,{allowLegacy:true}),[doc.nodes,doc.sections]);
  const nodes=parsed.nodes;
  const current=doc.sections.find(s=>s.sectionId===sectionId)??doc.sections[0];
  const mode=breakpointForWidth(width),selected=nodes.find(n=>n.nodeId===selectedIds[0])??null;
  const diagnostics=useMemo(()=>inspectCanvasLayout(doc,width),[doc,width]);
  const unsafeLegacy=parsed.legacyNodes.length>0;
  useEffect(()=>{
    if(!dirty)return;const leaving=(event:BeforeUnloadEvent)=>{event.preventDefault();};
    window.addEventListener('beforeunload',leaving);return()=>window.removeEventListener('beforeunload',leaving);
  },[dirty]);
  useEffect(()=>{
    if(!doc.sections.some(s=>s.sectionId===sectionId))setSectionId(doc.sections[0]?.sectionId??'');
    setSelected(old=>old.filter(id=>nodes.some(n=>n.nodeId===id)));
  },[doc,sectionId,nodes]);
  function announce(text:string){setNotice(text);}
  function execute(command:CanvasCommand):boolean{
    if(busy){announce('Finish the current save before making another change.');return false;}
    try{
      const next=applyCanvasCommand(doc,command);
      if(JSON.stringify(next)===fingerprint)return true;
      setHistory(commitHistory(history,next));
      retryRef.current=null;announce('Unsaved local edit. Public release unchanged.');
      return true;
    }catch(e){
      const issues=e&&typeof e==='object'&&'issues' in e?(e as {issues?:{message:string}[]}).issues:undefined;
      announce(issues?.[0]?.message??'The proposed change is invalid. Previous work is unchanged.');return false;
    }
  }
  function select(nodeId:string,additive:boolean){
    if(inlineRef.current)endInline(true);
    setSelected(old=>additive?(old.includes(nodeId)?old.filter(id=>id!==nodeId):[...old,nodeId]):[nodeId]);
    const chosen=nodes.find(n=>n.nodeId===nodeId);
    if(chosen&&chosen.sectionId!==sectionId)setSectionId(chosen.sectionId);
  }
  function addBlock(componentType:ComponentType){
    if(!current)return;
    const hasCollection=['repeater','timeline'].includes(componentType);
    const binding=hasCollection&&doc.contentCollections.length?{source:'collection' as const,
      collectionId:doc.contentCollections[0].collectionId}:undefined;
    const id=crypto.randomUUID();
    if(execute({type:'insert',nodeId:id,componentType,sectionId:current.sectionId,
      ...(componentType==='image'?{props:{mediaId:doc.mediaRefs[0],alt:'Describe this image'}}:{}),
      ...(binding?{binding}:{})}))setSelected([id]);
  }
  function startInline(id:string){
    const node=nodes.find(n=>n.nodeId===id);
    if(!node||node.locked||node.contentBinding||!['heading','text'].includes(node.componentType))return;
    if(inlineRef.current&&inlineRef.current!==id)endInline(true);
    inlineRef.current=id;setInlineNodeId(id);setInlineValue(String(node.props.text??''));
  }
  function endInline(save:boolean){
    const id=inlineRef.current;if(!id)return;
    inlineRef.current=null;setInlineNodeId(null);
    if(save){const node=nodes.find(n=>n.nodeId===id);
      if(node&&String(node.props.text??'')!==inlineValue)
        execute({type:'setProps',nodeId:id,props:{...node.props,text:inlineValue}});}
  }
  function pointerDown(nodeId:string,handle:Handle,event:ReactPointerEvent<HTMLButtonElement>){
    if(busy||preview||unsafeLegacy)return;
    const node=nodes.find(n=>n.nodeId===nodeId);if(!node||node.locked)return;
    const parent=event.currentTarget.closest('[data-editor-node]')?.parentElement;
    const box=parent?.getBoundingClientRect();if(!box||box.width<=0||box.height<=0)return;
    const source=resolveLayout(node.layout,node.responsiveOverrides??{},mode,node.semanticRole!=='decorative');
    const original=normalizedAbsolute(source,mode);
    const neighbors=nodes.filter(x=>x.nodeId!==nodeId&&x.sectionId===node.sectionId&&
      x.parentNodeId===node.parentNodeId).flatMap(x=>{
        const l=resolveLayout(x.layout,x.responsiveOverrides??{},mode,x.semanticRole!=='decorative');
        return l.mode==='auto'?[]:[normalizedAbsolute(l,mode)];});
    event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current={nodeId,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,
      parentWidth:box.width,parentHeight:box.height,original,source,handle,neighbors};
    setSelected([nodeId]);
  }
  function geometryFor(event:ReactPointerEvent<HTMLButtonElement>){
    const active=gestureRef.current;if(!active||active.pointerId!==event.pointerId)return null;
    return gestureGeometry(active.original,event.clientX-active.startX,event.clientY-active.startY,
      active.parentWidth,active.parentHeight,active.handle,{snap:snapping&&!event.altKey,neighbors:active.neighbors});
  }
  function pointerMove(event:ReactPointerEvent<HTMLButtonElement>){
    const result=geometryFor(event),active=gestureRef.current;
    if(result&&active)setGesture({nodeId:active.nodeId,...result});
  }
  function pointerEnd(event:ReactPointerEvent<HTMLButtonElement>,cancel=false){
    const active=gestureRef.current;if(!active||active.pointerId!==event.pointerId)return;
    const pixels=Math.abs(event.clientX-active.startX)+Math.abs(event.clientY-active.startY);
    const result=cancel?null:geometryFor(event);
    gestureRef.current=null;setGesture(undefined);
    if(!result||pixels<3)return;
    const layout:SafeLayout=active.source.mode==='hybrid'?{...active.source,placement:result.layout}:result.layout;
    execute({type:'setLayout',nodeId:active.nodeId,layout,breakpoint:mode});
  }
  function undo(){if(busy)return;setHistory(undoHistory(history));announce('Undo applied locally. Save to acknowledge the new draft.');}
  function redo(){if(busy)return;setHistory(redoHistory(history));announce('Redo applied locally. Save to acknowledge the new draft.');}
  async function save(){
    if(busy||!dirty||unsafeLegacy)return;
    const snapshot=history.present,snapshotFingerprint=JSON.stringify(snapshot);
    const pending=retryRef.current?.fingerprint===snapshotFingerprint?retryRef.current:
      {fingerprint:snapshotFingerprint,token:crypto.randomUUID()};
    retryRef.current=pending;setBusy(true);announce('Saving private editor draft with revision check…');
    try{
      const result=await ownerRequest<SaveResponse>(`/api/v1/portfolios/${portfolioId}/draft/workspace`,
        'PUT',{schemaVersion:1,sections:snapshot.sections,nodes:snapshot.nodes,
          contentCollections:snapshot.contentCollections},
        {'If-Match':`"rev-${serverRevision}"`,'X-Client-Mutation-Id':pending.token});
      if(!Number.isSafeInteger(result.revision)||result.revision<=serverRevision)throw new Error('Invalid revision acknowledgement');
      setRevision(result.revision);setSavedFingerprint(snapshotFingerprint);retryRef.current=null;
      announce(`Private draft saved · revision ${result.revision}. No public release was created.`);
    }catch(e){
      const conflict=e instanceof OwnerRequestError&&e.status===409;
      announce(conflict?'Revision conflict: another saved edit changed this draft. Local work remains here; reload only after reviewing it.':
        e instanceof OwnerRequestError?`${e.message} Your local changes were not discarded.`:
        'Save acknowledgement not received. Your local changes remain. Retry the same operation before reloading.');
    }finally{setBusy(false);}
  }
  function keyboard(event:ReactKeyboardEvent<HTMLElement>){
    if(!(event.ctrlKey||event.metaKey)||event.altKey)return;
    const target=event.target as HTMLElement;
    if(target.closest('input,textarea,select,[contenteditable="true"]'))return;
    const key=event.key.toLowerCase();
    if(key==='z'){event.preventDefault();if(event.shiftKey)redo();else undo();}
    else if(key==='y'){event.preventDefault();redo();}
    else if(key==='d'&&selected){event.preventDefault();
      const children=(id:string):string[]=>[id,...nodes.filter(n=>n.parentNodeId===id).flatMap(n=>children(n.nodeId))];
      execute({type:'duplicate',nodeId:selected.nodeId,ids:children(selected.nodeId).map(()=>crypto.randomUUID())});}
  }
  const stageView={doc,nodes,activeSection:current,selectedIds,breakpoint:mode,width,zoom,preview,playing,gesture,
    select,execute,pointerDown,pointerMove,pointerEnd,inlineNodeId,inlineValue,startInline,
    changeInline:setInlineValue,endInline,endPlay:()=>setPlaying(false)};
  return <section className="gi-canvas-editor" aria-label="GildedIn visual canvas editor" onKeyDown={keyboard}>
    <div className="gi-canvas-topbar"><div className="gi-canvas-topbar-title">
      <p className="gi-eyebrow">GILDEDIN / COMPOSITION WORKSPACE</p><h1>Visual canvas</h1>
      <span className="gi-canvas-draft-tag">PRIVATE DRAFT</span></div>
      <div className="gi-canvas-top-actions">
        <button type="button" disabled={!history.past.length||busy} onClick={undo}>↶ Undo</button>
        <button type="button" disabled={!history.future.length||busy} onClick={redo}>↷ Redo</button>
        <div className="gi-canvas-mode-group" role="group" aria-label="Responsive viewport">
          {(['desktop','tablet','mobile'] as const).map(target=><button key={target} type="button"
            aria-pressed={mode===target} onClick={()=>setWidth(DEVICE_WIDTHS[target])}>{target}</button>)}
        </div>
        <button type="button" aria-pressed={preview} onClick={()=>{setPreview(x=>!x);setPlaying(false);}}>
          {preview?'Edit layout':'Preview draft'}</button>
        <button type="button" onClick={()=>{setPreview(true);setPlaying(false);
          requestAnimationFrame(()=>setPlaying(true));}}>Play animation preview</button>
        <button type="button" className="gi-canvas-publish" disabled title="Publishing follows Issue 13's immutable release protocol">
          Publish · not available</button>
      </div>
    </div>
    <div className="gi-canvas-toolbar"><div className="gi-canvas-save-state" aria-live="polite" role="status">
      <span className={dirty?'gi-canvas-status-dot gi-unsaved':'gi-canvas-status-dot'} aria-hidden="true"/>
      {busy?'Saving…':dirty?'Unsaved local changes':`Saved · revision ${serverRevision}`} · No public changes
    </div><div className="gi-canvas-toolbar-controls">
      <label>Width <input type="range" min="320" max="1440" step="10" value={width}
        onChange={e=>setWidth(Number(e.currentTarget.value))}/> <output>{width}px</output></label>
      <label>Zoom <input type="range" min="50" max="150" step="10" value={zoom}
        onChange={e=>setZoom(Number(e.currentTarget.value))}/> <output>{zoom}%</output></label>
      <label className="gi-canvas-snap-toggle"><input type="checkbox" checked={snapping}
        onChange={e=>setSnapping(e.currentTarget.checked)}/> Snap guides</label>
      <button className="gi-canvas-save-button" type="button" disabled={!dirty||busy||unsafeLegacy}
        onClick={()=>void save()}>{busy?'Saving…':'Save draft'}</button>
    </div></div>
    {unsafeLegacy?<p className="gi-canvas-warning" role="alert">This draft contains {parsed.legacyNodes.length} legacy reference-only node(s). They require explicit owner migration before a canonical composition can be saved. No automatic conversion will occur.</p>:null}
    <div className="gi-canvas-notice" role="status" aria-live="polite">{notice}</div>
    <div className={`gi-canvas-grid${preview?' gi-preview-open':''}`}>
      {!preview?<CanvasStructure {...stageView} view={sideView} setView={setSideView} setActiveSection={id=>{
        if(inlineRef.current)endInline(true);setSectionId(id);setSelected([]);}} addBlock={addBlock}/>:null}
      <div className="gi-canvas-main">
        <div className="gi-canvas-current-section"><label>Current section <select value={current?.sectionId??''}
          onChange={e=>{setSectionId(e.target.value);setSelected([]);}}>
          {doc.sections.map(s=><option key={s.sectionId} value={s.sectionId}>{s.title||s.type}</option>)}
        </select></label><span>{nodes.filter(n=>n.sectionId===current?.sectionId).length} authored blocks · {mode}</span></div>
        <CanvasStage {...stageView}/>
        {!preview?<div className="gi-canvas-tray"><details open={diagnostics.length>0}>
          <summary>Accessibility & layout checks · {diagnostics.length} notice(s)</summary>
          {diagnostics.length?<ul>{diagnostics.map((issue,index)=><li key={`${issue.code}-${issue.nodeId}-${index}`}>
            <button type="button" onClick={()=>select(issue.nodeId,false)}><strong>{issue.code}</strong> · {issue.message}</button>
            <span>{issue.repair}</span></li>)}</ul>:<p>No static diagnostics found. Browser zoom, keyboard and screen-reader review remain required.</p>}
        </details></div>:null}
      </div>
      {!preview?<CanvasInspector {...stageView} selected={selected} announce={announce}/>:null}
    </div>
    <div className="gi-canvas-footer-bar"><p><strong>{nodes.length}/20</strong> authored blocks across {doc.sections.length} section(s) · depth max 3 · one shared content graph</p>
      <div><button type="button" onClick={()=>{if(window.confirm('Discard all unsaved local edits and reload the latest authorized draft?'))
        window.location.reload();}}>Reload server draft</button>
        <a href="/dashboard/portfolio">Portfolio controls</a>
        <a href="/dashboard">Dashboard</a></div></div>
  </section>;
}
