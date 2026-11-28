'use client';
import {useEffect,useRef,useState} from 'react';
import {SECTION_TYPES} from '../../../domain/content/types.ts';
import type {ComponentType,VisualNode} from '../../../domain/composition/types.ts';
import {COMPONENT_TYPES} from '../../../domain/composition/registry.ts';
import {newEditorSection} from '../../../domain/editor/commands.ts';
import {parseRichText,importMarkdown,exportMarkdown} from '../../../domain/content/rich-text.ts';
import {canonicalJson} from '../../../shared/domain/limits.ts';
import type {StructureView} from './contracts.ts';
const catalog:Readonly<Record<ComponentType,string>>={
  heading:'Heading',text:'Text',button:'Button',link:'Link',image:'Image',container:'Container',group:'Group',grid:'Grid',
  card:'Card',repeater:'Collection cards',gallery:'Gallery',tabs:'Tabs',accordion:'Accordion',carousel:'Carousel',
  timeline:'Timeline',contactForm:'Contact form',comparisonTable:'Comparison table'};
function depth(node:VisualNode,nodes:VisualNode[]):number{
  let parent=node.parentNodeId,count=0;const seen=new Set<string>();
  while(parent&&!seen.has(parent)&&count<3){seen.add(parent);count++;
    parent=nodes.find(n=>n.nodeId===parent)?.parentNodeId;}
  return count;
}
function FieldEditor({label,initial,kind,commit}:{label:string;initial:unknown;kind:'text'|'number'|'boolean';commit:(v:unknown)=>void}){
  const [value,setValue]=useState(String(initial??''));
  useEffect(()=>setValue(String(initial??'')),[initial]);
  if(kind==='boolean')return <label className="gi-canvas-item-field"><input type="checkbox" checked={initial===true}
    onChange={e=>commit(e.currentTarget.checked)}/>{label}</label>;
  return <label className="gi-canvas-item-field">{label}
    <input type={kind==='number'?'number':'text'} value={value} maxLength={3000}
      onChange={e=>setValue(e.currentTarget.value)}
      onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setValue(String(initial??''));}}
      onBlur={()=>{if(value===String(initial??''))return;
        if(kind==='number'){if(value.trim()===''||!Number.isFinite(Number(value))){setValue(String(initial??''));return;}
          commit(Number(value));return;}
        commit(value);}}
    /></label>;
}
/** Only losslessly round-trippable safe Markdown documents can be edited here.
 * Rich images, tables or diagram structures stay untouched for a future dedicated inspector. */
function RichMarkdownField({label,initial,commit}:{label:string;initial:unknown;commit:(v:unknown)=>void}){
  let source='';let editable=false;
  try{
    const value=initial??{type:'doc',version:1,blocks:[]};
    const parsed=parseRichText(value);
    source=exportMarkdown(parsed);
    editable=canonicalJson(importMarkdown(source))===canonicalJson(parsed);
  }catch{editable=false;}
  const [draft,setDraft]=useState(source),[error,setError]=useState('');
  useEffect(()=>{setDraft(source);setError('');},[source]);
  if(!editable)return <p className="gi-canvas-help">{label}: This structured rich-text document has image/table/diagram or formatting nodes that cannot be safely round-tripped by the small Markdown editor. Its original AST is preserved. Use the dedicated rich-text workflow when available.</p>;
  const apply=()=>{if(draft===source)return;
    try{commit(importMarkdown(draft));setError('');}
    catch{setError('This Markdown contains unsupported structure. The previous content remains unchanged.');}};
  return <div className="gi-canvas-rich-field"><label>{label} · safe Markdown
    <textarea rows={5} maxLength={40000} value={draft} onChange={e=>setDraft(e.currentTarget.value)}
      onBlur={apply} onKeyDown={e=>{if(e.key==='Escape'){setDraft(source);setError('');}}}/></label>
    {error?<p className="gi-canvas-warning" role="alert">{error}</p>:null}
    <p className="gi-canvas-help">Plain paragraphs, headings H2-H4, lists, quotes, code and approved HTTPS links only. No raw HTML or MDX.</p>
  </div>;
}
export default function CanvasStructure(view:StructureView){
  const [newSectionType,setSectionType]=useState<typeof SECTION_TYPES[number]>('about');
  const [selectedCollection,setCollection]=useState('');
  const [search,setSearch]=useState('');
  // Ephemeral native drag fallback; persisted ordering is a validated typed command.
  // Arrow controls remain the equivalent keyboard/touch path.
  const dragging=useRef<{kind:'section'|'item';id:string;collectionId?:string}|null>(null);
  function endDrag(){dragging.current=null;}
  function dropSection(targetId:string){const from=dragging.current;endDrag();
    if(from?.kind==='section'&&from.id!==targetId)view.execute({type:'reorderSection',sectionId:from.id,targetSectionId:targetId});}
  function dropItem(targetId:string,collectionId:string){const from=dragging.current;endDrag();
    if(from?.kind==='item'&&from.collectionId===collectionId&&from.id!==targetId)
      view.execute({type:'reorderItem',collectionId,contentId:from.id,targetContentId:targetId});}
  const section=view.activeSection;
  const layers=view.nodes.filter(n=>n.sectionId===section.sectionId).sort((a,b)=>a.readingOrder-b.readingOrder);
  const current=view.doc.contentCollections.find(c=>c.collectionId===(selectedCollection||view.doc.contentCollections[0]?.collectionId));
  const definition=view.doc.collectionDefinitions.find(d=>d.collectionId===current?.collectionId);
  return <aside className="gi-canvas-side gi-canvas-structure" aria-label="Canvas sections and block library">
    <div className="gi-canvas-tabs" role="tablist" aria-label="Editor structure tabs">
      {(['sections','blocks','collections'] as const).map(tab=><button key={tab} type="button" role="tab"
        aria-selected={view.view===tab} onClick={()=>view.setView(tab)}>{tab==='sections'?'Structure':tab==='blocks'?'Blocks':'Content'}</button>)}
    </div>
    {view.view==='sections'?<div className="gi-canvas-panel-body">
      <h2>Sections</h2><p className="gi-canvas-help">Hero always stays first. Drag optional rows, or use the arrow buttons on keyboard and touch. Changes remain private until saved.</p>
      <ol className="gi-canvas-section-list">{view.doc.sections.map((s,index)=>
        <li key={s.sectionId} className={s.sectionId===section.sectionId?'gi-active-section':''}
          draggable={index>0} onDragStart={e=>{if(index===0){e.preventDefault();return;}
            dragging.current={kind:'section',id:s.sectionId};e.dataTransfer.effectAllowed='move';
            e.dataTransfer.setData('text/plain','GildedIn internal section order');}}
          onDragOver={e=>{if(dragging.current?.kind==='section'){e.preventDefault();e.dataTransfer.dropEffect='move';}}}
          onDrop={e=>{e.preventDefault();dropSection(s.sectionId);}} onDragEnd={endDrag}>
          <button type="button" aria-current={s.sectionId===section.sectionId?'true':undefined}
            onClick={()=>view.setActiveSection(s.sectionId)}>{s.title||s.type}
            <small>{s.type}{s.visible?'':' · hidden'}</small></button>
          <span className="gi-canvas-inline-actions"><button type="button" title={`Move ${s.title} up`} aria-label={`Move ${s.title} up`}
            disabled={index<=1} onClick={()=>view.execute({type:'moveSection',sectionId:s.sectionId,step:-1})}>↑</button>
            <button type="button" title={`Move ${s.title} down`} aria-label={`Move ${s.title} down`}
              disabled={index===0||index===view.doc.sections.length-1}
              onClick={()=>view.execute({type:'moveSection',sectionId:s.sectionId,step:1})}>↓</button></span>
        </li>)}</ol>
      <div className="gi-canvas-add-row"><label htmlFor="gi-new-section">Add optional section</label>
        <select id="gi-new-section" value={newSectionType} onChange={e=>setSectionType(e.target.value as typeof SECTION_TYPES[number])}>
          {SECTION_TYPES.filter(x=>x!=='hero'&&x!=='custom').map(type=><option key={type} value={type}>{type}</option>)}
        </select><button type="button" onClick={()=>{const s=newEditorSection(newSectionType,crypto.randomUUID(),view.doc.sections);
          if(view.execute({type:'addSection',section:s}))view.setActiveSection(s.sectionId);}}>Add section</button></div>
      <hr/><div className="gi-canvas-layers-heading"><h2>Layers</h2><span>{view.nodes.length}/20 blocks</span></div>
      <p className="gi-canvas-help">Click, Shift-click, or use the checkbox to select more than one layer.</p>
      {layers.length?<ul className="gi-canvas-layers">{layers.map(node=>
        <li key={node.nodeId} style={{paddingLeft:`${depth(node,view.nodes)*12}px`}}>
          <label className={view.selectedIds.includes(node.nodeId)?'gi-canvas-layer gi-layer-selected':'gi-canvas-layer'}>
            <input type="checkbox" checked={view.selectedIds.includes(node.nodeId)}
              onChange={()=>view.select(node.nodeId,true)} aria-label={`Select ${node.componentType} layer`}/>
            <button type="button" aria-current={view.selectedIds.includes(node.nodeId)?'true':undefined}
              onClick={e=>view.select(node.nodeId,e.shiftKey||e.ctrlKey||e.metaKey)}>
              <strong>{node.componentType}</strong><small>Order {node.readingOrder+1}{node.locked?' · locked':''}
                {node.visibilityByBreakpoint?.[view.breakpoint]===false?' · hidden':''}</small></button>
            <button type="button" aria-label={`${node.locked?'Unlock':'Lock'} ${node.componentType}`}
              onClick={()=>view.execute({type:'lock',nodeId:node.nodeId,locked:!node.locked})}>
              {node.locked?'🔒':'◇'}</button>
          </label></li>)}</ul>:<p className="gi-canvas-help">No authored blocks. Add one from Blocks.</p>}
    </div>:null}
    {view.view==='blocks'?<div className="gi-canvas-panel-body">
      <h2>Safe blocks</h2><p className="gi-canvas-help">New blocks default to Auto layout. All nested authored blocks count toward 20.</p>
      <label className="gi-canvas-filter">Find block<input type="search" placeholder="Heading, card, grid…" value={search}
        onChange={e=>setSearch(e.target.value)}/></label>
      <div className="gi-canvas-blocks">{COMPONENT_TYPES.filter(t=>catalog[t].toLowerCase().includes(search.trim().toLowerCase())).map(type=>{
        const missingMedia=type==='image'&&view.doc.mediaRefs.length===0;
        const missingCollection=['repeater','timeline'].includes(type)&&!view.doc.contentCollections.length;
        const unavailable=missingMedia||missingCollection||view.nodes.length>=20;
        return <button key={type} type="button" disabled={unavailable} onClick={()=>view.addBlock(type)}
          title={missingMedia?'Upload owned media in Issue 12 first':missingCollection?'Create a typed collection first':undefined}>
          <span className="gi-canvas-block-symbol" aria-hidden="true">{type==='heading'?'H':type==='text'?'T':type==='grid'?'▦':type==='image'?'▧':'◇'}</span>
          <span>{catalog[type]}{unavailable?<small>{missingMedia?'Media not ready':missingCollection?'Needs collection':'Block limit reached'}</small>:null}</span>
        </button>;
      })}</div>
    </div>:null}
    {view.view==='collections'?<div className="gi-canvas-panel-body">
      <h2>Reusable content</h2><p className="gi-canvas-help">A content item is stored once. Drag rows to reorder, or use arrow buttons with keyboard and touch.</p>
      {view.doc.contentCollections.length?<>
        <label className="gi-canvas-filter">Collection<select value={current?.collectionId??''} onChange={e=>setCollection(e.target.value)}>
          {view.doc.contentCollections.map(c=><option key={c.collectionId} value={c.collectionId}>
            {view.doc.collectionDefinitions.find(x=>x.collectionId===c.collectionId)?.displayName??c.collectionId}</option>)}
        </select></label>
        {current?.items.length?<ol className="gi-canvas-content-items">{current.items.map((item,index)=><li key={item.contentId}
          draggable onDragStart={e=>{dragging.current={kind:'item',id:item.contentId,collectionId:current.collectionId};
            e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','GildedIn internal item order');}}
          onDragOver={e=>{if(dragging.current?.kind==='item'&&dragging.current.collectionId===current.collectionId){
            e.preventDefault();e.dataTransfer.dropEffect='move';}}}
          onDrop={e=>{e.preventDefault();dropItem(item.contentId,current.collectionId);}} onDragEnd={endDrag}>
          <details><summary>{item.slug??`Item ${index+1}`} <span>{item.ownerVisibility==='draft_only'?'PRIVATE DRAFT':'PUBLIC CANDIDATE'}</span></summary>
            <div className="gi-canvas-content-editors">
              {definition?.fields.filter(f=>['text','url','email','number','boolean'].includes(f.type)).map(field=><FieldEditor
                key={`${item.contentId}-${field.fieldId}`} label={field.label} initial={item.fields[field.fieldId]}
                kind={field.type==='number'?'number':field.type==='boolean'?'boolean':'text'}
                commit={value=>view.execute({type:'setItemField',collectionId:current.collectionId,contentId:item.contentId,
                  fieldId:field.fieldId,value})}/>)}
              {definition?.fields.filter(f=>f.type==='richText').map(field=><RichMarkdownField
                key={`${item.contentId}-${field.fieldId}`} label={field.label} initial={item.fields[field.fieldId]}
                commit={value=>view.execute({type:'setItemField',collectionId:current.collectionId,contentId:item.contentId,
                  fieldId:field.fieldId,value})}/>)}
            </div>
          </details><div className="gi-canvas-inline-actions">
            <button type="button" disabled={index===0} title="Move content up"
              onClick={()=>view.execute({type:'moveItem',collectionId:current.collectionId,contentId:item.contentId,step:-1})}>↑</button>
            <button type="button" disabled={index===current.items.length-1} title="Move content down"
              onClick={()=>view.execute({type:'moveItem',collectionId:current.collectionId,contentId:item.contentId,step:1})}>↓</button>
          </div></li>)}</ol>:<p className="gi-canvas-help">No items yet. Draft item creation remains in the typed content workflow.</p>}
      </>:<p className="gi-canvas-help">No collections created. Canvas bindings use content collections when available.</p>}
    </div>:null}
  </aside>;
}
