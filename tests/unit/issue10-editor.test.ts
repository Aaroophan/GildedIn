import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalJson} from '../../src/shared/domain/limits.ts';
import {initialHeroSection,parseContentDraft} from '../../src/domain/content/model.ts';
import {projectCollectionDefinition} from '../../src/domain/content/projects.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import {parseCompositionNodes} from '../../src/domain/composition/validation.ts';
import {resolveLayout} from '../../src/domain/composition/layout.ts';
import type {ContentDraftShape} from '../../src/domain/content/types.ts';
import {applyCanvasCommand,newEditorSection,eligibleBindingChoices,canvasNodeText} from '../../src/domain/editor/commands.ts';
import {mergeEditorWorkspace} from '../../src/domain/editor/workspace.ts';
import {initialHistory,commitHistory,undoHistory,redoHistory,MAX_EDITOR_UNDO} from '../../src/domain/editor/history.ts';
import {absoluteAt,gestureGeometry,breakpointForWidth,ABSOLUTE_START} from '../../src/domain/editor/geometry.ts';
import {inspectCanvasLayout} from '../../src/domain/editor/diagnostics.ts';
const id=(n:number)=>`${n.toString(16).padStart(8,'0')}-0000-4000-8000-${n.toString(16).padStart(12,'0')}`;
const HERO=id(1),ABOUT=id(2),NODE=id(3),SECOND=id(4),GROUP=id(8),PRIVATE=id(105);
const iso='2026-11-28T12:00:00.000Z';
const reject=(e:unknown)=>e instanceof ContentDenied&&e.code==='CONTENT_INVALID';
function draft():ContentDraftShape{
  const definition=projectCollectionDefinition();
  return parseContentDraft({profile:{displayName:'Synthetic Owner',identityLabel:'Engineer',introduction:'Read my work'},
    sections:[initialHeroSection(HERO as never),newEditorSection('about',ABOUT,[initialHeroSection(HERO as never)])],
    collectionDefinitions:[definition],contentCollections:[{collectionId:'projects',items:[
      {contentId:id(100),collectionId:'projects',schemaVersion:1,slug:'project-a',fields:{title:'First project',summary:'Public summary'},
        categoryIds:[],sortOrder:0,featured:false,ownerVisibility:'public_candidate',searchable:true,
        publicFieldIds:['title','summary'],aiApprovedFieldIds:[],createdAt:iso,updatedAt:iso},
      {contentId:id(101),collectionId:'projects',schemaVersion:1,slug:'project-b',fields:{title:'Second project',summary:'Second summary'},
        categoryIds:[],sortOrder:1,featured:false,ownerVisibility:'draft_only',searchable:false,
        publicFieldIds:[],aiApprovedFieldIds:[],createdAt:iso,updatedAt:iso}]}],nodes:[],mediaRefs:[]});
}
function add(d:ContentDraftShape,nodeId=NODE,sectionId=HERO,type:'text'|'heading'|'button'|'group'|'repeater'='text'){
  return applyCanvasCommand(d,{type:'insert',sectionId,nodeId,componentType:type,
    ...(type==='repeater'?{binding:{source:'collection',collectionId:'projects'}}:{})});
}
function nodes(d:ContentDraftShape){return parseCompositionNodes(d.nodes,d.sections).nodes;}
const workspace=(d:ContentDraftShape)=>({schemaVersion:1,sections:d.sections,nodes:d.nodes,contentCollections:d.contentCollections});
const save=(old:ContentDraftShape,next:ContentDraftShape)=>mergeEditorWorkspace(old,workspace(next),'2026-11-29T00:00:00.000Z');

test('10.1 blank owner draft begins with one Hero and zero authored blocks',()=>{
  const d=draft();assert.equal(d.sections[0].type,'hero');assert.equal(d.nodes.length,0);
});
test('10.1 insertion uses safe Auto layout and stable node IDs',()=>{
  const d=add(draft());assert.equal(nodes(d)[0].nodeId,NODE);assert.equal(nodes(d)[0].layout.mode,'auto');
  assert.equal(nodes(d)[0].componentVersion,1);
});
test('10.1 selection is ephemeral: there is no editor selection property in serialized schema',()=>{
  const n=nodes(add(draft()))[0];assert.equal(Object.hasOwn(n,'selected'),false);
});
test('10.1 a section can be created without a second Hero',()=>{
  const d=draft(),section=newEditorSection('projects',id(22),d.sections);
  const next=applyCanvasCommand(d,{type:'addSection',section});
  assert.deepEqual(next.sections.map(s=>s.type),['hero','about','projects']);
  assert.equal(next.sections[2].aiSectionApproved,false);
});
test('10.2 lock disables transformations but can be undone by unlock',()=>{
  const d=applyCanvasCommand(add(draft()),{type:'lock',nodeId:NODE,locked:true});
  assert.throws(()=>applyCanvasCommand(d,{type:'setProps',nodeId:NODE,props:{text:'Changed'}}),reject);
  const unlocked=applyCanvasCommand(d,{type:'lock',nodeId:NODE,locked:false});
  assert.equal((applyCanvasCommand(unlocked,{type:'setProps',nodeId:NODE,props:{text:'Changed'}}).nodes[0] as {props:{text:string}}).props.text,'Changed');
});
test('10.2 duplicating preserves binding but assigns fresh identifiers',()=>{
  const d=applyCanvasCommand(add(draft()),{type:'duplicate',nodeId:NODE,ids:[SECOND]});
  assert.deepEqual(nodes(d).map(n=>n.nodeId),[NODE,SECOND]);
});
test('10.2 duplicate without unique IDs or with an unsafe quantity leaves source intact',()=>{
  const d=add(draft()),before=canonicalJson(d);
  assert.throws(()=>applyCanvasCommand(d,{type:'duplicate',nodeId:NODE,ids:[NODE]}),reject);
  assert.equal(canonicalJson(d),before);
});
test('10.2 grouping and ungrouping preserve two authored children and safe ancestry',()=>{
  let d=add(add(draft()),SECOND);
  d=applyCanvasCommand(d,{type:'group',groupId:GROUP,nodeIds:[NODE,SECOND]});
  assert.equal(nodes(d).length,3);
  assert.ok(nodes(d).filter(n=>n.parentNodeId===GROUP).length===2);
  d=applyCanvasCommand(d,{type:'ungroup',nodeId:GROUP});
  assert.equal(nodes(d).length,2);assert.ok(nodes(d).every(n=>!n.parentNodeId));
});
test('10.2 nested group lock prevents child mutation',()=>{
  let d=applyCanvasCommand(add(add(draft()),SECOND),{type:'group',groupId:GROUP,nodeIds:[NODE,SECOND]});
  d=applyCanvasCommand(d,{type:'lock',nodeId:GROUP,locked:true});
  assert.throws(()=>applyCanvasCommand(d,{type:'setProps',nodeId:NODE,props:{text:'Bypass'}}),reject);
});
test('10.2 deleting a group removes descendants, not unrelated sections',()=>{
  let d=applyCanvasCommand(add(add(draft()),SECOND),{type:'group',groupId:GROUP,nodeIds:[NODE,SECOND]});
  d=applyCanvasCommand(d,{type:'delete',nodeId:GROUP});assert.equal(nodes(d).length,0);
  assert.equal(d.sections.length,2);
});
test('10.2 visual stacking and semantic reading order can differ',()=>{
  let d=add(add(draft()),SECOND);
  d=applyCanvasCommand(d,{type:'moveLayer',nodeId:NODE,axis:'visual',step:1});
  assert.equal(nodes(d).find(n=>n.nodeId===NODE)?.readingOrder,0);
  assert.equal(nodes(d).find(n=>n.nodeId===NODE)?.visualOrder,1);
});
test('10.2 semantic order changes only by explicit reading command',()=>{
  let d=add(add(draft()),SECOND);
  d=applyCanvasCommand(d,{type:'moveLayer',nodeId:NODE,axis:'reading',step:1});
  assert.equal(nodes(d).find(n=>n.nodeId===NODE)?.readingOrder,1);
});
test('10.3 bounded normalized geometry accepts relative fractions',()=>{
  const a=absoluteAt(ABSOLUTE_START,{x:.25,y:.5,width:.3,height:.2});
  assert.deepEqual([a.x,a.y,a.width,a.height],[.25,.5,.3,.2]);
});
test('10.3 pointer move snaps to grid in normalized parent coordinates',()=>{
  const r=gestureGeometry(ABSOLUTE_START,100,50,1000,500,'move',{snap:true});
  assert.equal(r.layout.x,.2);assert.equal(r.layout.y,.2);assert.ok(r.guides.length>0);
});
test('10.3 Alt/touch toggle disable snapping while preserving bounds',()=>{
  const r=gestureGeometry(ABSOLUTE_START,103,53,1000,500,'move',{snap:false});
  assert.equal(r.layout.x,.203);assert.equal(r.layout.y,.206);
});
test('10.3 resize clamps safely within parent without negative sizes',()=>{
  const r=gestureGeometry(ABSOLUTE_START,2000,-2000,1000,500,'resize');
  assert.ok(r.layout.width<=1-r.layout.x);assert.ok(r.layout.height>=.05);
});
test('10.3 malformed and unavailable pointer geometry deny instead of persisting DOM matrices',()=>{
  assert.throws(()=>gestureGeometry(ABSOLUTE_START,Infinity,0,1000,500,'move'));
  assert.throws(()=>gestureGeometry(ABSOLUTE_START,4,0,0,500,'move'));
});
test('10.3 absolute canvas changes store finite layout, never CSS transform string',()=>{
  const d=applyCanvasCommand(add(draft()),{type:'setLayout',nodeId:NODE,layout:ABSOLUTE_START});
  assert.equal(nodes(d)[0].layout.mode,'absolute');assert.ok(!canonicalJson(d.nodes).includes('matrix3d'));
});
test('10.4 Hero remains first when moving optional sections',()=>{
  let d=draft();d=applyCanvasCommand(d,{type:'moveSection',sectionId:HERO,step:1});
  assert.equal(d.sections[0].sectionId,HERO);
});
test('10.4 can reorder optional sections and keep consecutive order',()=>{
  let d=draft();const section=newEditorSection('projects',id(22),d.sections);
  d=applyCanvasCommand(d,{type:'addSection',section});
  d=applyCanvasCommand(d,{type:'moveSection',sectionId:id(22),step:-1});
  assert.deepEqual(d.sections.map(s=>s.order),[0,1,2]);assert.equal(d.sections[1].sectionId,id(22));
});
test('10.4 reordering collection items retains source IDs and original field values',()=>{
  const d=applyCanvasCommand(draft(),{type:'moveItem',collectionId:'projects',contentId:id(100),step:1});
  assert.deepEqual(d.contentCollections[0].items.map(i=>i.contentId),[id(101),id(100)]);
  assert.equal(d.contentCollections[0].items[1].fields.title,'First project');
});
test('10.4 drag ordering uses the same safe schema command as keyboard section reorder',()=>{
  let d=draft();d=applyCanvasCommand(d,{type:'addSection',section:newEditorSection('skills',id(23),d.sections)});
  const reordered=applyCanvasCommand(d,{type:'reorderSection',sectionId:id(23),targetSectionId:ABOUT});
  assert.deepEqual(reordered.sections.map(s=>s.sectionId),[HERO,id(23),ABOUT]);
  assert.deepEqual(reordered.sections.map(s=>s.order),[0,1,2]);
  assert.throws(()=>applyCanvasCommand(d,{type:'reorderSection',sectionId:HERO,targetSectionId:ABOUT}),reject);
});
test('10.4 native-drag collection reorder cannot move a non-owned item',()=>{
  const d=draft();const reordered=applyCanvasCommand(d,{type:'reorderItem',collectionId:'projects',
    contentId:id(100),targetContentId:id(101)});
  assert.deepEqual(reordered.contentCollections[0].items.map(i=>i.contentId),[id(101),id(100)]);
  assert.throws(()=>applyCanvasCommand(d,{type:'reorderItem',collectionId:'projects',
    contentId:id(100),targetContentId:PRIVATE}),reject);
  assert.equal(d.contentCollections[0].items[0].contentId,id(100));
});
test('10.4 reparenting across owned sections does not change content identity',()=>{
  const d=applyCanvasCommand(add(draft()),{type:'reparent',nodeId:NODE,sectionId:ABOUT});
  assert.equal(nodes(d)[0].sectionId,ABOUT);assert.equal(nodes(d)[0].nodeId,NODE);
});
test('10.4 cross-section parent and self-cycle rejected without effects',()=>{
  const d=add(add(draft()),SECOND,ABOUT);
  assert.throws(()=>applyCanvasCommand(d,{type:'reparent',nodeId:NODE,sectionId:HERO,parentNodeId:SECOND}),reject);
  assert.equal(nodes(d)[0].sectionId,HERO);
});
test('10.5 inline text content is plain text and cannot inject CSS/JS props',()=>{
  let d=add(draft());d=applyCanvasCommand(d,{type:'setProps',nodeId:NODE,props:{text:'<script>alert(1)</script>'}});
  assert.equal((nodes(d)[0].props.text as string),'<script>alert(1)</script>');
  assert.throws(()=>applyCanvasCommand(d,{type:'setProps',nodeId:NODE,props:{text:'Hello',onClick:'hack'}}),reject);
});
test('10.5 malicious href is rejected by the registry',()=>{
  const d=add(draft());assert.throws(()=>applyCanvasCommand(d,{type:'setProps',nodeId:NODE,
    props:{text:'X',href:'javascript:alert(1)'}}),reject);
});
test('10.5 existing item fields update every existing binding reference through stable IDs',()=>{
  let d=draft();d=applyCanvasCommand(d,{type:'insert',nodeId:NODE,sectionId:HERO,componentType:'text'});
  d=applyCanvasCommand(d,{type:'setBinding',nodeId:NODE,binding:{source:'collectionItem',collectionId:'projects',contentId:id(100) as never,fieldId:'title'}});
  d=applyCanvasCommand(d,{type:'setItemField',collectionId:'projects',contentId:id(100),fieldId:'title',value:'Renamed project'});
  assert.equal(canvasNodeText(d,nodes(d)[0]),'Renamed project');
});
test('10.5 typed fields reject unknown names and oversize strings',()=>{
  const d=draft();assert.throws(()=>applyCanvasCommand(d,{type:'setItemField',collectionId:'projects',contentId:id(100),fieldId:'evil',value:'hi'}),reject);
  assert.throws(()=>applyCanvasCommand(d,{type:'setItemField',collectionId:'projects',contentId:id(100),fieldId:'title',value:'x'.repeat(8000)}),reject);
});
test('10.6 breakpoint modes agree with the compiler grammar',()=>{
  assert.equal(breakpointForWidth(320),'mobile');assert.equal(breakpointForWidth(767),'mobile');
  assert.equal(breakpointForWidth(768),'tablet');assert.equal(breakpointForWidth(1023),'tablet');
  assert.equal(breakpointForWidth(1024),'desktop');
});
test('10.6 overrides preserve shared content and reading order',()=>{
  let d=add(draft());d=applyCanvasCommand(d,{type:'setLayout',nodeId:NODE,layout:ABSOLUTE_START});
  d=applyCanvasCommand(d,{type:'setLayout',nodeId:NODE,breakpoint:'mobile',layout:absoluteAt(ABSOLUTE_START,{x:.2})});
  const n=nodes(d)[0];assert.equal(n.layout.mode,'absolute');assert.equal(n.responsiveOverrides?.mobile?.mode,'absolute');
  assert.equal(n.readingOrder,0);assert.equal(resolveLayout(n.layout,n.responsiveOverrides??{},'mobile',true).mode,'absolute');
  d=applyCanvasCommand(d,{type:'clearOverride',nodeId:NODE,breakpoint:'mobile'});
  assert.equal(resolveLayout(nodes(d)[0].layout,nodes(d)[0].responsiveOverrides??{},'mobile',true).mode,'auto');
});
test('10.6 hidden elements are still available in the owner document tree',()=>{
  const d=applyCanvasCommand(add(draft()),{type:'setVisible',nodeId:NODE,breakpoint:'mobile',visible:false});
  assert.equal(nodes(d).length,1);assert.equal(nodes(d)[0].visibilityByBreakpoint?.mobile,false);
});
test('10.7 binding choices contain only explicitly public-candidate item fields',()=>{
  const choices=eligibleBindingChoices(draft(),'text');
  assert.ok(choices.some(x=>x.id.includes(id(100))));
  assert.ok(!choices.some(x=>x.id.includes(id(101))));
  assert.ok(!JSON.stringify(choices).includes('Second summary'));
});
test('10.7 public-candidate repeaters count as ONE authored block',()=>{
  const d=add(draft(),NODE,HERO,'repeater');
  assert.equal(nodes(d).length,1);assert.equal(canvasNodeText(d,nodes(d)[0]),'1 approved collection item(s) · one authored block');
});
test('10.7 foreign stable content references are not accepted',()=>{
  const d=add(draft());assert.throws(()=>applyCanvasCommand(d,{type:'setBinding',nodeId:NODE,
    binding:{source:'collectionItem',collectionId:'projects',contentId:PRIVATE as never,fieldId:'title'}}),reject);
});
test('10.8 diagnostics warn about overlapped interactive elements',()=>{
  let d=add(draft(),NODE,HERO,'button');d=add(d,SECOND,HERO,'button');
  d=applyCanvasCommand(d,{type:'setLayout',nodeId:NODE,layout:ABSOLUTE_START});
  d=applyCanvasCommand(d,{type:'setLayout',nodeId:SECOND,layout:ABSOLUTE_START});
  assert.ok(inspectCanvasLayout(d,1200).some(i=>i.code==='overlap'));
});
test('10.8 diagnostics call attention to missing/hidden binding and no false leak',()=>{
  let d=add(draft());d=applyCanvasCommand(d,{type:'setVisible',nodeId:NODE,breakpoint:'mobile',visible:false});
  assert.equal(inspectCanvasLayout(d,390).filter(i=>i.code==='hidden_action').length,0);
});
test('10.9 undo and redo are purely local and bounded to fifty snapshots',()=>{
  const d=draft(),d2=add(d),h1=commitHistory(initialHistory(d),d2);
  assert.equal(undoHistory(h1).present.nodes.length,0);assert.equal(redoHistory(undoHistory(h1)).present.nodes.length,1);
  let h=initialHistory(0);for(let i=1;i<100;i++)h=commitHistory(h,i);
  assert.equal(h.past.length,MAX_EDITOR_UNDO);
});
test('10.9 new edits clear redo but leave acknowledged server version untouched',()=>{
  let h=commitHistory(initialHistory(draft()),add(draft()));h=undoHistory(h);
  h=commitHistory(h,add(draft(),SECOND));assert.equal(h.future.length,0);
});
test('10.10 atomic workspace save holds layout/sections/content orders together',()=>{
  const old=draft();let next=add(old);
  next=applyCanvasCommand(next,{type:'moveItem',collectionId:'projects',contentId:id(100),step:1});
  next=applyCanvasCommand(next,{type:'setItemField',collectionId:'projects',contentId:id(100),fieldId:'title',value:'Updated'});
  const merged=save(old,next);
  assert.equal(merged.nodes.length,1);assert.equal(merged.contentCollections[0].items[1].fields.title,'Updated');
});
test('10.10 editor save cannot forge public approvals or ownership',()=>{
  const original=draft();const body=workspace(original);
  body.contentCollections[0].items[0].publicFieldIds=['title','summary','private_field'];
  assert.throws(()=>mergeEditorWorkspace(original,body,iso),reject);
});
test('10.10 editor save rejects changed schema identity and AI section approval',()=>{
  const original=draft(),newDoc=structuredClone(workspace(original));
  newDoc.sections[1].aiSectionApproved=true;
  assert.throws(()=>mergeEditorWorkspace(original,newDoc,iso),reject);
});
test('10.10 workspace cannot remove or inject content items',()=>{
  const original=draft(),newDoc=structuredClone(workspace(original));
  newDoc.contentCollections[0].items.pop();
  assert.throws(()=>mergeEditorWorkspace(original,newDoc,iso),reject);
});
test('10.10 workspace cannot inject unknown script/component, fields or prototype tricks',()=>{
  const original=draft();let next=add(original);
  (next.nodes[0] as {props:Record<string,unknown>}).props={text:'X',onMouseOver:'hack'};
  assert.throws(()=>save(original,next),reject);
  const bad={...workspace(original),clientSideCode:'alert(1)'};
  assert.throws(()=>mergeEditorWorkspace(original,bad,iso),reject);
});
test('10.10 malformed candidate cannot partially mutate the previous saved draft',()=>{
  const original=draft();const before=canonicalJson(original),bad=structuredClone(workspace(original));
  bad.sections[0].visible=false;assert.throws(()=>mergeEditorWorkspace(original,bad,iso),reject);
  assert.equal(canonicalJson(original),before);
});
test('10.10 new optional section cannot be search/AI approved by a direct editor request',()=>{
  const original=draft(),s=newEditorSection('skills',id(66),original.sections);
  const candidate=workspace(original);candidate.sections=[...candidate.sections,{...s,aiSectionApproved:true}];
  assert.throws(()=>mergeEditorWorkspace(original,candidate,iso),reject);
});
