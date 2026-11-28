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
import {useDraftAutosave} from './use-draft-autosave.ts';
import type {DraftValidationReport} from '../../../domain/editor/preflight.ts';
import CanvasStage from './canvas-stage.tsx';
import CanvasStructure from './canvas-structure.tsx';
import CanvasInspector from './canvas-inspector.tsx';
interface Gesture {nodeId:string;pointerId:number;startX:number;startY:number;parentWidth:number;parentHeight:number;
  original:AbsoluteLayout;source:SafeLayout;handle:Handle;neighbors:AbsoluteLayout[];}
const DEVICE_WIDTHS:Record<Breakpoint,number>={desktop:1200,tablet:820,mobile:390};
const seed=(doc:ContentDraftShape):ContentDraftShape=>JSON.parse(JSON.stringify(doc)) as ContentDraftShape;
export default function CanvasEditor({portfolioId,accountId,revision,initial}:{portfolioId:string;accountId:string;revision:number;initial:ContentDraftShape}){
  const [history,setHistory]=useState(()=>initialHistory(seed(initial)));
  const [selectedIds,setSelected]=useState<string[]>([]);
  const [sectionId,setSectionId]=useState(initial.sections[0]?.sectionId??'');
  const [sideView,setSideView]=useState<'sections'|'blocks'|'collections'>('sections');
  const [width,setWidth]=useState(1200),[zoom,setZoom]=useState(100);
  const [preview,setPreview]=useState(false),[playing,setPlaying]=useState(false);
  const [snapping,setSnapping]=useState(true);
  const [report,setReport]=useState<DraftValidationReport|null>(null),[checking,setChecking]=useState(false);
  const [replaceConfirmation,setReplaceConfirmation]=useState('');
  const [notice,setNotice]=useState('Local editing ready. No changes have been published.');
  const [gesture,setGesture]=useState<{nodeId:string;layout:AbsoluteLayout;guides:GeometryGuide[]} | undefined>();
  const [inlineNodeId,setInlineNodeId]=useState<string|null>(null),[inlineValue,setInlineValue]=useState('');
  const gestureRef=useRef<Gesture|null>(null);
  const inlineRef=useRef<string|null>(null);
  const doc=history.present;
  const fingerprint=JSON.stringify(doc);
  const parsed=useMemo(()=>parseCompositionNodes(doc.nodes,doc.sections,{allowLegacy:true}),[doc.nodes,doc.sections]);
  const nodes=parsed.nodes;
  const current=doc.sections.find(s=>s.sectionId===sectionId)??doc.sections[0];
  const mode=breakpointForWidth(width),selected=nodes.find(n=>n.nodeId===selectedIds[0])??null;
  const diagnostics=useMemo(()=>inspectCanvasLayout(doc,width),[doc,width]);
  const unsafeLegacy=parsed.legacyNodes.length>0;
  const autosave=useDraftAutosave({portfolioId,accountId,revision,initial,draft:doc,legacy:unsafeLegacy,
    onRestore:next=>setHistory(initialHistory(seed(next)))});
  const dirty=autosave.dirty,serverRevision=autosave.revision,busy=autosave.phase==='saving';
  const saved=autosave.phase==='saved'&&!dirty;
  const protectedPreview=`/dashboard/preview?portfolioId=${encodeURIComponent(portfolioId)}&revision=${serverRevision}&mode=${mode}&animations=paused`;
  async function checkForPublication(){
    if(!saved||checking)return;
    setChecking(true);announce('Checking server-saved draft without publishing…');
    try{
      const answer=await ownerRequest<DraftValidationReport>(`/api/v1/portfolios/${portfolioId}/draft/validate`,'POST',{});
      if(answer.revision!==serverRevision){announce('Server revision changed. Reconcile before reviewing validation.');return;}
      setReport(answer);announce(answer.valid?'Prepublication checks found no static blockers. Browser and media verification still required.':
        `${answer.blockers.length} prepublication blocker(s) found. No public release changed.`);
    }catch(e){announce(e instanceof OwnerRequestError?e.message:'The validation request did not complete. No publication was attempted.');}
    finally{setChecking(false);}
  }
  useEffect(()=>{setReport(null);},[fingerprint]);
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
    try{
      const next=applyCanvasCommand(doc,command);
      if(JSON.stringify(next)===fingerprint)return true;
      setHistory(commitHistory(history,next));
      announce('Unsaved local edit. Public release unchanged.');
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
    if(preview||unsafeLegacy)return;
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
  function undo(){setHistory(undoHistory(history));announce('Undo applied locally. Save to acknowledge the new draft.');}
  function redo(){setHistory(redoHistory(history));announce('Redo applied locally. Save to acknowledge the new draft.');}
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
        <button type="button" disabled={!history.past.length} onClick={undo}>↶ Undo</button>
        <button type="button" disabled={!history.future.length} onClick={redo}>↷ Redo</button>
        <div className="gi-canvas-mode-group" role="group" aria-label="Responsive viewport">
          {(['desktop','tablet','mobile'] as const).map(target=><button key={target} type="button"
            aria-pressed={mode===target} onClick={()=>setWidth(DEVICE_WIDTHS[target])}>{target}</button>)}
        </div>
        <button type="button" aria-pressed={preview} onClick={()=>{setPreview(x=>!x);setPlaying(false);}}>
          {preview?'Edit layout':'Local layout preview'}</button>
        <button type="button" onClick={()=>{setPreview(true);setPlaying(false);
          requestAnimationFrame(()=>setPlaying(true));}}>Play local animation preview</button>
        {saved?<a className="gi-button gi-button-secondary" href={protectedPreview}>Open protected saved preview</a>:
          <button type="button" disabled title="Save and confirm your draft before opening the owner-only preview">Protected preview requires saved draft</button>}
        <button type="button" className="gi-canvas-publish" disabled title="Publishing follows Issue 13's immutable release protocol">
          Publish · not available</button>
      </div>
    </div>
    <div className="gi-canvas-toolbar"><div className="gi-canvas-save-state" aria-live="polite" role="status">
      <span className={dirty?'gi-canvas-status-dot gi-unsaved':'gi-canvas-status-dot'} aria-hidden="true"/>
      {autosave.phase==='saving'?'Saving…':autosave.phase==='uncertain'?'Save outcome unknown':
        autosave.phase==='conflict'?'Revision conflict':autosave.phase==='blocked'?'Editing access changed':
        dirty?'Unsaved local changes':`Saved · revision ${serverRevision}`} · No public changes
    </div><div className="gi-canvas-toolbar-controls">
      <label>Width <input type="range" min="320" max="1440" step="10" value={width}
        onChange={e=>setWidth(Number(e.currentTarget.value))}/> <output>{width}px</output></label>
      <label>Zoom <input type="range" min="50" max="150" step="10" value={zoom}
        onChange={e=>setZoom(Number(e.currentTarget.value))}/> <output>{zoom}%</output></label>
      <label className="gi-canvas-snap-toggle"><input type="checkbox" checked={snapping}
        onChange={e=>setSnapping(e.currentTarget.checked)}/> Snap guides</label>
      <button className="gi-canvas-save-button" type="button"
        disabled={!dirty||autosave.phase!=='unsaved'||unsafeLegacy||autosave.recovery!==null}
        onClick={()=>void autosave.saveNow()}>Save now</button>
      {autosave.phase==='uncertain'?<button type="button" onClick={()=>void autosave.reconcile()}>Check save outcome</button>:null}
      <button type="button" disabled={!saved||checking} onClick={()=>void checkForPublication()}>
        {checking?'Checking…':'Validate saved draft'}</button>
    </div></div>
    {unsafeLegacy?<p className="gi-canvas-warning" role="alert">This draft contains {parsed.legacyNodes.length} legacy reference-only node(s). They require explicit owner migration before a canonical composition can be saved. No automatic conversion will occur.</p>:null}
    <div className="gi-canvas-notice" role="status" aria-live="polite">{notice} {autosave.message}</div>
    {autosave.recovery?<section className="gi-owner-panel gi-editor-recovery" aria-label="Recovered local changes">
      <h2>Unsaved work was found in this browser</h2>
      <p>Created {new Date(autosave.recovery.createdAt).toLocaleString()} from revision {autosave.recovery.baseRevision}.
        It has not been accepted by the server. Browser recovery is temporary and can expose private text on a shared device.</p>
      <div className="gi-owner-actions"><button type="button" onClick={()=>void autosave.restoreRecovery()}>
        Review recovered work in editor</button><button type="button" onClick={autosave.discardRecovery}>
        Keep server draft and discard browser recovery</button></div></section>:null}
    {autosave.phase==='conflict'?<section className="gi-owner-panel gi-editor-conflict" role="alert">
      <h2>A newer draft revision exists</h2><p>Your browser edits remain intact. Autosave is paused to avoid overwriting another tab.</p>
      {autosave.remote?<><p>Latest server revision: <strong>{autosave.remote.revision}</strong>.
        Review these changed areas before deciding how to continue:</p>
        <ul>{autosave.differences.length?autosave.differences.map(x=><li key={x}>{x}</li>):
          <li>The server revision changed; no differences in the editor workspace were detected.</li>}</ul>
        <label>Type REPLACE to explicitly replace the newer server workspace after reviewing it.
          <input value={replaceConfirmation} onChange={e=>setReplaceConfirmation(e.currentTarget.value)}/></label>
        <button type="button" disabled={replaceConfirmation!=='REPLACE'} onClick={()=>{
          autosave.overrideAfterReview();setReplaceConfirmation('');}}>Use my local workspace as the next revision</button>
      </>:<button type="button" onClick={()=>void autosave.inspectLatest()}>Retry loading latest saved draft</button>}
      <button type="button" onClick={()=>{if(window.confirm('Discard local changes and reload the latest saved draft?'))
        autosave.discardAndReload();}}>Discard local work and reload the server</button>
      <p>Replacing the latest workspace is destructive. Copy the content you want to preserve before choosing it. No automatic merge occurs.</p>
    </section>:null}
    {autosave.phase==='blocked'?<p role="alert" className="gi-canvas-warning">This session no longer has confirmed editing permission.
      No further saves or protected preview requests will be made. <a href="/login?returnTo=%2Fdashboard">Sign in again</a>.</p>:null}
    {report?<section className="gi-owner-panel gi-editor-validation" aria-label="Server prepublication report">
      <h2>Prepublication validation · revision {report.revision}</h2>
      <p>{report.blockers.length} blocker(s), {report.warnings.length} warning(s). This is not permission to publish.</p>
      <ul>{[...report.blockers,...report.warnings].map((issue,index)=><li key={`${index}-${issue.code}`}>
        <button type="button" onClick={()=>{if(issue.nodeId)select(issue.nodeId,false);
          else if(issue.sectionId)setSectionId(issue.sectionId);setPreview(false);}}>
          <strong>{issue.severity}: {issue.code}</strong> — {issue.message}</button>
        <p>{issue.repair}</p></li>)}</ul>
      {!report.blockers.length&&!report.warnings.length?<p>No static issues reported. Browser and live media checks are separate.</p>:null}
    </section>:null}
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
        autosave.discardAndReload();}}>Reload server draft</button>
        <a href="/dashboard/portfolio">Portfolio controls</a>
        <a href="/dashboard">Dashboard</a></div></div>
  </section>;
}
