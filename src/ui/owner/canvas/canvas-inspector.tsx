'use client';
import {useEffect,useState} from 'react';
import {resolveLayout,AUTO_DEFAULT} from '../../../domain/composition/layout.ts';
import {ABSOLUTE_START,absoluteAt,normalizedAbsolute} from '../../../domain/editor/geometry.ts';
import {eligibleBindingChoices,canvasNodeText,selectedDependentNodes} from '../../../domain/editor/commands.ts';
import {inspectCanvasLayout} from '../../../domain/editor/diagnostics.ts';
import type {VisualNode,SafeLayout,AbsoluteLayout,SafeInteraction} from '../../../domain/composition/types.ts';
import type {InspectorView} from './contracts.ts';
type Tab='content'|'layout'|'responsive'|'accessibility'|'actions';
function TextControl({label,value,commit,max=2000,large=false}:{label:string;value:string;commit:(v:string)=>void;max?:number;large?:boolean}){
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  return <label className="gi-canvas-control">{label}
    {large?<textarea rows={5} maxLength={max} value={draft} onChange={e=>setDraft(e.currentTarget.value)}
      onBlur={()=>{if(value!==draft)commit(draft);}}
      onKeyDown={e=>{if(e.key==='Escape')setDraft(value);}}/>:
      <input type="text" maxLength={max} value={draft} onChange={e=>setDraft(e.currentTarget.value)}
        onBlur={()=>{if(value!==draft)commit(draft);}}
        onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setDraft(value);}}/>}</label>;
}
function Numeric({label,value,commit,min=0,max=100,step=1}:{label:string;value:number;commit:(value:number)=>void;
  min?:number;max?:number;step?:number}){
  const [draft,setDraft]=useState(String(value));
  useEffect(()=>setDraft(String(value)),[value]);
  const submit=()=>{const next=Number(draft);if(Number.isFinite(next)&&next>=min&&next<=max&&next!==value)commit(next);
    else setDraft(String(value));};
  return <div className="gi-canvas-number"><label>{label}<input type="number" min={min} max={max} step={step}
    value={draft} onChange={e=>setDraft(e.currentTarget.value)} onBlur={submit}
    onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setDraft(String(value));}}/></label>
    <div className="gi-canvas-inline-actions"><button type="button" title={`Decrease ${label}`} disabled={value<=min}
      onClick={()=>commit(Math.max(min,Math.round((value-step)*1000)/1000))}>−</button>
      <button type="button" title={`Increase ${label}`} disabled={value>=max}
        onClick={()=>commit(Math.min(max,Math.round((value+step)*1000)/1000))}>+</button></div></div>;
}
function PanelItemsEditor({view,node}:{view:InspectorView;node:VisualNode}){
  const key=node.componentType==='carousel'?'slides':'items';
  const values=(node.props[key]??[]) as {id:string;label:string;body:string}[];
  return <div className="gi-canvas-complex-items"><p className="gi-canvas-help">Panels are typed text. Raw HTML, scripts and iframe code are not accepted.</p>
    {values.map((item,i)=><fieldset key={item.id}><legend>Item {i+1}</legend>
      <TextControl label="Tab / slide title" value={item.label} max={100}
        commit={value=>view.execute({type:'setProps',nodeId:node.nodeId,
          props:{...node.props,[key]:values.map((x,j)=>j===i?{...x,label:value}:x)}})}/>
      <TextControl label="Body" value={item.body} max={2000} large
        commit={value=>view.execute({type:'setProps',nodeId:node.nodeId,
          props:{...node.props,[key]:values.map((x,j)=>j===i?{...x,body:value}:x)}})}/>
      <button type="button" disabled={values.length===1} onClick={()=>view.execute({type:'setProps',nodeId:node.nodeId,
        props:{...node.props,[key]:values.filter((_,j)=>j!==i)}})}>Remove item</button>
    </fieldset>)}
    <button type="button" disabled={values.length>=(node.componentType==='carousel'?20:12)}
      onClick={()=>{const id=`panel${values.length+1}`;if(values.some(x=>x.id===id))return;
        view.execute({type:'setProps',nodeId:node.nodeId,props:{...node.props,
          [key]:[...values,{id,label:'New panel',body:'Describe this item'}]}});}}>Add panel</button>
  </div>;
}
export default function CanvasInspector(view:InspectorView){
  const [tab,setTab]=useState<Tab>('content');
  const node=view.selected,blocked=node?.locked??false;
  const doc=view.doc;
  const scope=node?resolveLayout(node.layout,node.responsiveOverrides??{},view.breakpoint,
    node.semanticRole!=='decorative'):AUTO_DEFAULT;
  const parentIsFrame=node&&['container','grid','card','group'].includes(node.componentType);
  const abs=node?normalizedAbsolute(scope,view.breakpoint):ABSOLUTE_START;
  const command=(cmd:SafeLayout)=>node?view.execute({type:'setLayout',nodeId:node.nodeId,layout:cmd,
    breakpoint:view.breakpoint}):false;
  const geometry=(patch:Partial<Pick<AbsoluteLayout,'x'|'y'|'width'|'height'>>)=>{
    if(!node)return;
    const updated=absoluteAt(abs,patch);
    command(scope.mode==='hybrid'?{...scope,placement:updated}:updated);
  };
  const issues=inspectCanvasLayout(doc,view.width);
  const choices=node?eligibleBindingChoices(doc,node.componentType):[];
  const chosen=node?.contentBinding?JSON.stringify(node.contentBinding):'';
  const selectionIssues=node?issues.filter(i=>i.nodeId===node.nodeId):[];
  const localSelected=view.selectedIds;
  const textProp=node?node.componentType==='heading'||node.componentType==='text'?'text':
    node.componentType==='link'||node.componentType==='button'?'label':
      ['container','group','grid','card','contactForm'].includes(node.componentType)?'label':null:null;
  const updateProps=(key:string,value:unknown)=>node?view.execute({type:'setProps',nodeId:node.nodeId,
    props:{...node.props,[key]:value}}):false;
  return <aside className="gi-canvas-side gi-canvas-inspector" aria-label="Selected block inspector">
    <div className="gi-canvas-inspector-head"><span className="gi-eyebrow">INSPECTOR / OWNER DRAFT</span>
      <h2>{node?node.componentType:'Nothing selected'}</h2>
      {node?<p className="gi-canvas-help">{node.sectionId===view.activeSection.sectionId?view.activeSection.title:'Section'}
        {node.parentNodeId?' / nested layer':''} · {node.nodeId.slice(0,8)}</p>:
        <p className="gi-canvas-help">Select a layer or an element on canvas to edit it.</p>}
    </div>
    {node?<>
      <div className="gi-canvas-inspector-nav" role="tablist" aria-label="Inspector property groups">
        {(['content','layout','responsive','accessibility','actions'] as const).map(item=><button key={item}
          role="tab" type="button" aria-selected={tab===item} onClick={()=>setTab(item)}>{item==='accessibility'?'A11y':item}</button>)}
      </div>
      <div className="gi-canvas-inspector-body" role="tabpanel">
      {blocked?<p className="gi-canvas-warning">Layer is locked. Unlock before modifying properties.</p>:null}
      {tab==='content'?<>
        <h3>Content</h3>
        {textProp&&!node.contentBinding?<TextControl key={`${node.nodeId}-${textProp}`} label={textProp==='text'?'Text content':'Label'}
          max={node.componentType==='heading'?600:node.componentType==='text'?10000:160}
          large={node.componentType==='text'} value={String(node.props[textProp]??'')}
          commit={value=>updateProps(textProp,value)}/>:null}
        {node.contentBinding?<p className="gi-canvas-binding-label">Content uses the stable source ID, not a copy. {canvasNodeText(doc,node)}</p>:null}
        {node.componentType==='heading'?<label className="gi-canvas-control">Heading level
          <select value={Number(node.props.level??2)} disabled={blocked} onChange={e=>updateProps('level',Number(e.target.value))}>
            {[1,2,3].map(l=><option key={l} value={l}>H{l}{l===1?' · Hero only':''}</option>)}</select></label>:null}
        {node.componentType==='link'||node.componentType==='button'?<TextControl label="Safe HTTPS link (optional)" max={2048}
          value={String(node.props.href??'')} commit={value=>{
            const props={...node.props};if(value.trim())props.href=value;else delete props.href;
            view.execute({type:'setProps',nodeId:node.nodeId,props});}}/>:null}
        {['container','group','grid','card'].includes(node.componentType)?<label className="gi-canvas-control">Appearance
          <select disabled={blocked} value={String(node.props.variant??'standard')}
            onChange={e=>updateProps('variant',e.target.value)}>{['standard','outlined','elevated','decorative'].map(v=><option key={v}>{v}</option>)}</select></label>:null}
        {['tabs','accordion','carousel'].includes(node.componentType)?<PanelItemsEditor view={view} node={node}/>:null}
        {node.componentType==='comparisonTable'?<>
          <TextControl label="Table caption" max={160} value={String(node.props.caption??'')}
            commit={v=>updateProps('caption',v)}/>
          {((node.props.headers??[]) as string[]).map((h,i)=><TextControl key={i} label={`Column ${i+1} heading`}
            value={h} max={120} commit={value=>updateProps('headers',((node.props.headers??[]) as string[]).map((v,j)=>j===i?value:v))}/>)}
          <p className="gi-canvas-help">Table body uses the safe bounded schema. Edit the source collection for reusable data.</p>
        </>:null}
        {node.componentType==='repeater'||node.componentType==='timeline'?<>
          <Numeric label="Maximum displayed items" min={1} max={20} value={Number(node.props.maxVisible??20)}
            commit={value=>updateProps('maxVisible',Math.round(value))}/>
          <label className="gi-canvas-control">Sort items<select value={String(node.props.sort??'order')}
            onChange={e=>updateProps('sort',e.target.value)}><option value="order">Owner order</option>
            <option value="featured">Featured first</option></select></label>
        </>:null}
        <hr/><h3>Reusable content binding</h3>
        {['text','heading','card','button','link','repeater','timeline'].includes(node.componentType)?<>
          <label className="gi-canvas-control">Approved content source<select disabled={blocked}
            value={choices.find(x=>JSON.stringify(x.binding)===chosen)?.id??(node.contentBinding?'unavailable':'none')}
            onChange={e=>{if(e.target.value==='none')view.execute({type:'setBinding',nodeId:node.nodeId});
              else {const choice=choices.find(c=>c.id===e.target.value);
                if(choice)view.execute({type:'setBinding',nodeId:node.nodeId,binding:choice.binding});}}}>
            {node.contentBinding&&!choices.some(c=>JSON.stringify(c.binding)===chosen)?
              <option value="unavailable">Previous binding is private or unavailable</option>:null}
            {!['repeater','timeline'].includes(node.componentType)?<option value="none">No binding — local block text</option>:null}
            {choices.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select></label><p className="gi-canvas-help">Only existing approved public-candidate fields appear here. Draft-only fields never enter public binding choices.</p>
          {node.contentBinding?.source==='collectionItem'?<p className="gi-canvas-help">Edit the original item once in the Content panel. All bound blocks update locally.</p>:null}
        </>:<p className="gi-canvas-help">This block does not accept a data binding.</p>}
      </>:null}
      {tab==='layout'?<><h3>Layout and geometry</h3>
        <label className="gi-canvas-control">Layout mode<select disabled={blocked} value={scope.mode}
          onChange={e=>{const mode=e.currentTarget.value;
            const next:SafeLayout=mode==='auto'?{mode:'auto',flow:'column',gapToken:'md'}:
              mode==='hybrid'?{mode:'hybrid',placement:{...ABSOLUTE_START},childrenFlow:{mode:'auto',flow:'column'}}:
              {...ABSOLUTE_START};
            if(scope.mode==='absolute'&&mode==='auto'&&!window.confirm('Convert positioning to natural Auto flow? Geometry will be replaced.'))return;
            command(next);}}>
          <option value="auto">Auto · fluid</option><option value="absolute">Absolute · parent relative</option>
          {parentIsFrame?<option value="hybrid">Hybrid · positioned group with Auto children</option>:null}
        </select></label>
        {scope.mode==='auto'?<>
          <label className="gi-canvas-control">Flow<select disabled={blocked} value={scope.flow}
            onChange={e=>command({...scope,flow:e.target.value as 'row'|'column'|'grid',
              ...(e.target.value==='grid'?{columns:scope.columns??2}:{columns:undefined})})}>
            <option value="column">Stack vertically</option><option value="row">Flow horizontally</option>
            <option value="grid">Responsive grid</option></select></label>
          {scope.flow==='grid'?<Numeric label="Grid columns" min={1} max={4} value={scope.columns??2}
            commit={v=>command({...scope,columns:v as 1|2|3|4})}/>:null}
          <label className="gi-canvas-control">Gap<select disabled={blocked} value={scope.gapToken??'md'}
            onChange={e=>command({...scope,gapToken:e.target.value as 'none'|'xs'|'sm'|'md'|'lg'|'xl'})}>
            {['none','xs','sm','md','lg','xl'].map(v=><option key={v} value={v}>{v}</option>)}
          </select></label></>:<>
          <p className="gi-canvas-help">Coordinates and dimensions are percentages of the containing frame, not screen pixels.</p>
          <Numeric label="Left %" value={Math.round(abs.x*1000)/10} step={1} max={Math.round((1-abs.width)*1000)/10}
            commit={v=>geometry({x:v/100})}/>
          <Numeric label="Top %" value={Math.round(abs.y*1000)/10} step={1} max={Math.round((1-abs.height)*1000)/10}
            commit={v=>geometry({y:v/100})}/>
          <Numeric label="Width %" value={Math.round(abs.width*1000)/10} step={1} min={5}
            max={Math.round((1-abs.x)*1000)/10} commit={v=>geometry({width:v/100})}/>
          <Numeric label="Height %" value={Math.round(abs.height*1000)/10} step={1} min={5}
            max={Math.round((1-abs.y)*1000)/10} commit={v=>geometry({height:v/100})}/>
          <label className="gi-canvas-control">Layer depth<select value={abs.zIndexToken} disabled={blocked}
            onChange={e=>command(scope.mode==='hybrid'?{...scope,placement:{...abs,zIndexToken:e.target.value as AbsoluteLayout['zIndexToken']}}:
              {...abs,zIndexToken:e.target.value as AbsoluteLayout['zIndexToken']})}>
            {(['decoration','base','raised','overlay'] as const).map(v=><option key={v}>{v}</option>)}</select></label>
          <div className="gi-canvas-nudge" aria-label="Move selected block without dragging"><h4>Position nudge · 1%</h4>
            <div><button type="button" disabled={blocked} aria-label="Move left" onClick={()=>geometry({x:abs.x-.01})}>←</button>
              <button type="button" disabled={blocked} aria-label="Move up" onClick={()=>geometry({y:abs.y-.01})}>↑</button>
              <button type="button" disabled={blocked} aria-label="Move down" onClick={()=>geometry({y:abs.y+.01})}>↓</button>
              <button type="button" disabled={blocked} aria-label="Move right" onClick={()=>geometry({x:abs.x+.01})}>→</button></div></div>
        </>}
        <p className="gi-canvas-help">Reading order and visual layer order are independent.</p>
        <div className="gi-canvas-action-grid">
          <button type="button" disabled={blocked} onClick={()=>view.execute({type:'moveLayer',nodeId:node.nodeId,axis:'visual',step:-1})}>Send back</button>
          <button type="button" disabled={blocked} onClick={()=>view.execute({type:'moveLayer',nodeId:node.nodeId,axis:'visual',step:1})}>Bring forward</button>
          <button type="button" disabled={blocked} onClick={()=>view.execute({type:'moveLayer',nodeId:node.nodeId,axis:'reading',step:-1})}>Read earlier</button>
          <button type="button" disabled={blocked} onClick={()=>view.execute({type:'moveLayer',nodeId:node.nodeId,axis:'reading',step:1})}>Read later</button>
        </div>
      </>:null}
      {tab==='responsive'?<><h3>Responsive overrides</h3>
        <p className="gi-canvas-help">{view.breakpoint.toUpperCase()}: {view.width}px. Shared content and reading order remain unchanged.</p>
        <strong>{node.responsiveOverrides?.[view.breakpoint]?'Intentional breakpoint override':'Derived from base layout'}</strong>
        {view.breakpoint!=='desktop'&&node.responsiveOverrides?.[view.breakpoint]?<button type="button"
          onClick={()=>view.execute({type:'clearOverride',nodeId:node.nodeId,
            breakpoint:view.breakpoint as 'mobile'|'tablet'})}>Clear override · use derived layout</button>:null}
        <label className="gi-canvas-checkbox"><input type="checkbox" checked={node.visibilityByBreakpoint?.[view.breakpoint]!==false}
          onChange={e=>view.execute({type:'setVisible',nodeId:node.nodeId,breakpoint:view.breakpoint,visible:e.target.checked})}/>
          Show at {view.breakpoint} width</label>
        <p className="gi-canvas-help">Mobile widths below 768px, tablet 768–1023px, desktop 1024px and above. Use the toolbar width control for intermediate sizes.</p>
      </>:null}
      {tab==='accessibility'?<><h3>Accessibility and hierarchy</h3>
        <p>Semantic role: <strong>{node.semanticRole??'Native structural element'}</strong></p>
        <p>Reading position: {node.readingOrder+1} · visual position: {node.visualOrder+1}</p>
        <p className="gi-canvas-help">Moving blocks never changes the tab sequence. Use the Read earlier/later controls to adjust semantic order.</p>
        {node.componentType==='image'?<TextControl label="Alternative text" max={300} value={String(node.props.alt??'')}
          commit={v=>updateProps('alt',v)}/>:null}
        {node.componentType==='heading'?<p>Use Content tab to choose H1/H2/H3; only one Hero H1 is permitted.</p>:null}
        {selectionIssues.length?<ul className="gi-canvas-diagnostics">{selectionIssues.map((i,k)=><li key={k}>
          <strong>{i.code}</strong> · {i.message} <span>{i.repair}</span></li>)}</ul>:<p>Static checks found no known issue for this block. Manual zoom and assistive-technology testing is still required.</p>}
      </>:null}
      {tab==='actions'?<><h3>Interactions and structure</h3>
        {['button','link','card'].includes(node.componentType)?<label className="gi-canvas-control">Approved interaction
          <select disabled={blocked||node.props.href!==undefined} value={node.interaction.kind==='navigate'?`navigate:${node.interaction.routeId}`:
            node.interaction.kind==='scrollToSection'?`scroll:${node.interaction.sectionId}`:node.interaction.kind}
            onChange={e=>{const [kind,payload]=e.target.value.split(':');
              const action:SafeInteraction=kind==='navigate'?{kind:'navigate',routeId:payload as 'home'}:
                kind==='scroll'?{kind:'scrollToSection',sectionId:payload as never}:
                kind==='openContactForm'?{kind:'openContactForm'}:{kind:'none'};
              view.execute({type:'setInteraction',nodeId:node.nodeId,interaction:action});}}>
            <option value="none">No action</option>
            {(['home','projects','experience','references','contact'] as const).map(r=><option key={r} value={`navigate:${r}`}>Navigate: {r}</option>)}
            {doc.sections.filter(s=>s.visible).map(s=><option key={s.sectionId} value={`scroll:${s.sectionId}`}>Scroll: {s.title}</option>)}
            <option value="openContactForm">Open approved contact form</option>
          </select></label>:<p className="gi-canvas-help">This block is not a direct trigger. Only approved button/link/card actions can be attached.</p>}
        <label className="gi-canvas-checkbox"><input type="checkbox" checked={Boolean(node.locked)}
          onChange={e=>view.execute({type:'lock',nodeId:node.nodeId,locked:e.target.checked})}/> Lock layer</label>
        <h4>Move to another section</h4>
        <label className="gi-canvas-control">New containing section<select disabled={blocked} value={node.sectionId}
          onChange={e=>view.execute({type:'reparent',nodeId:node.nodeId,sectionId:e.target.value})}>
          {doc.sections.map(s=><option key={s.sectionId} value={s.sectionId}>{s.title}</option>)}
        </select></label>
        <label className="gi-canvas-control">Parent group / container<select disabled={blocked} value={node.parentNodeId??'root'}
          onChange={e=>view.execute({type:'reparent',nodeId:node.nodeId,sectionId:node.sectionId,
            ...(e.target.value==='root'?{}:{parentNodeId:e.target.value})})}>
          <option value="root">Section root</option>{view.nodes.filter(n=>n.sectionId===node.sectionId&&
            n.nodeId!==node.nodeId&&['group','container','grid','card'].includes(n.componentType))
              .map(n=><option key={n.nodeId} value={n.nodeId}>{n.componentType} · {n.nodeId.slice(0,8)}</option>)}
        </select></label>
        <h4>Structure actions</h4>
        <div className="gi-canvas-action-grid">
          <button type="button" disabled={blocked||view.nodes.length>=20} onClick={()=>{
            const children=(id:string):string[]=>[id,...view.nodes.filter(n=>n.parentNodeId===id).flatMap(n=>children(n.nodeId))];
            const ids=children(node.nodeId).map(()=>crypto.randomUUID());
            view.execute({type:'duplicate',nodeId:node.nodeId,ids});}}>Duplicate subtree</button>
          <button type="button" disabled={blocked||localSelected.length<2||view.nodes.length>=20}
            onClick={()=>{const groupId=crypto.randomUUID();if(view.execute({type:'group',nodeIds:[...localSelected],groupId}))
              view.select(groupId,false);}}>Group selected</button>
          <button type="button" disabled={blocked||!['group','container','grid'].includes(node.componentType)}
            onClick={()=>view.execute({type:'ungroup',nodeId:node.nodeId})}>Ungroup</button>
          <button type="button" className="gi-canvas-delete" disabled={blocked}
            onClick={()=>{const deps=selectedDependentNodes(view.nodes,node.nodeId);
              const message=`Remove this block and its children from this local draft?${deps.length?` ${deps.length} actions refer to it and must be repaired first.`:''}`;
              if(window.confirm(message))view.execute({type:'delete',nodeId:node.nodeId});}}>Delete layer</button>
        </div>
      </>:null}
      </div>
    </>:<div className="gi-canvas-inspector-body"><p>No layer selected. Choose an element on the canvas or in Structure.</p>
      <p>Pages, content and public approvals remain governed by the existing owner APIs and release compiler.</p></div>}
  </aside>;
}
