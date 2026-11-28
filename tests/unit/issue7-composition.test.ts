import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalJson} from '../../src/shared/domain/limits.ts';
import {initialHeroSection,parseContentDraft} from '../../src/domain/content/model.ts';
import {projectCollectionDefinition} from '../../src/domain/content/projects.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import {parseCompositionNodes,parseVisualNode} from '../../src/domain/composition/validation.ts';
import {parseLayout,resolveLayout,nodeCss} from '../../src/domain/composition/layout.ts';
import {compileComposition} from '../../src/domain/composition/compiler.ts';
import {inspectCompositionCompatibility,assertSupportedRenderPlanVersion} from '../../src/domain/composition/versions.ts';
import {COMPONENT_TYPES} from '../../src/domain/composition/registry.ts';
import type {ContentDraftShape} from '../../src/domain/content/types.ts';
import type {VisualNode} from '../../src/domain/composition/types.ts';
const id=(n:number)=>`${n.toString(16).padStart(8,'0')}-0000-4000-8000-${n.toString(16).padStart(12,'0')}`;
const HERO=id(1),PROJECTS=id(2),HEADING=id(3),REPEATER=id(4);
const iso='2026-11-28T10:00:00.000Z';
const denies=(code='CONTENT_INVALID')=>(e:unknown)=>e instanceof ContentDenied&&e.code===code;
const hero=()=>initialHeroSection(HERO as never);
const projectsSection=()=>({...hero(),sectionId:PROJECTS as never,type:'projects' as const,title:'Work',order:1,
  publicAnchor:'projects',canvasRootId:'root_projects'});
function node(n:number,section=HERO,changes:Record<string,unknown>={}):Record<string,unknown>{
  return {nodeId:id(n),sectionId:section,componentType:'text',componentVersion:1,props:{text:'Example'},
    layout:{mode:'auto',flow:'column'},visualOrder:n-1,readingOrder:n-1,interaction:{kind:'none'},...changes};
}
const heading=()=>node(3,HERO,{componentType:'heading',props:{level:1},semanticRole:'h1',
  readingOrder:0,visualOrder:0,contentBinding:{source:'profile',fieldId:'displayName'}});
const repeater=()=>node(4,PROJECTS,{componentType:'repeater',props:{variant:'projectCards',maxVisible:20},
  readingOrder:0,visualOrder:0,contentBinding:{source:'collection',collectionId:'projects'}});
function project(n:number,publicVisibility=true){return {contentId:id(100+n),collectionId:'projects',schemaVersion:1,
  slug:`project-${n+1}`,fields:{title:`Example project ${n+1}`,summary:'Public example summary'},
  categoryIds:[],sortOrder:n,featured:n===0,ownerVisibility:publicVisibility?'public_candidate':'draft_only',
  searchable:true,publicFieldIds:['title','summary'],aiApprovedFieldIds:[],createdAt:iso,updatedAt:iso};}
function draft(count=1):ContentDraftShape{
  const definition=projectCollectionDefinition();
  return {profile:{displayName:'Synthetic Owner',identityLabel:'Engineer',introduction:'Example public introduction'},
    sections:[hero(),projectsSection()],collectionDefinitions:[definition],contentCollections:[{collectionId:'projects',
      items:Array.from({length:count},(_,n)=>project(n)) as never}],nodes:[heading(),repeater()],mediaRefs:[]};
}
function failShape(nodes:unknown[],d=draft()){return ()=>parseCompositionNodes(nodes,d.sections);}
const absolute=(x=0.1,y=0.1,width=0.45,height=0.4)=>({mode:'absolute',x,y,width,height,
  anchorX:'left',anchorY:'top',zIndexToken:'raised',overflow:'visible-content'});

test('7.1 component catalog is closed and spans approved content, data, container and interactive types',()=>{
  assert.equal(COMPONENT_TYPES.length,17);
  for(const name of ['heading','text','button','link','image','group','grid','card','repeater',
    'gallery','tabs','accordion','carousel','timeline','contactForm','comparisonTable'])
    assert.ok(COMPONENT_TYPES.includes(name as never));
});
test('7.1 exact v1 graph parses, keeps stable IDs and does not alter reusable content',()=>{
  const d=draft();const old=canonicalJson(d);
  const parsed=parseCompositionNodes(d.nodes,d.sections);
  assert.deepEqual(parsed.nodes.map(n=>n.nodeId),[HEADING,REPEATER]);
  assert.equal(parsed.legacyNodes.length,0);assert.equal(canonicalJson(d),old);
  assert.equal(parseContentDraft(d).nodes.length,2);
});
test('7.1 unknown component, future version, code and arbitrary props are denied',()=>{
  for(const bad of [{componentType:'html'},{componentVersion:2},{script:'alert(1)'},
    {props:{text:'safe',style:'position:absolute'}},{props:{text:'hi',onClick:'evil'}}])
    assert.throws(failShape([node(5,HERO,bad)]),denies());
});
test('7.1 duplicate IDs, foreign section, missing parent, cross-section parent fail',()=>{
  assert.throws(failShape([node(5),node(5)]),denies());
  assert.throws(failShape([node(5,id(500))]),denies());
  assert.throws(failShape([node(5,HERO,{parentNodeId:id(19)})]),denies());
  assert.throws(failShape([node(5,HERO,{componentType:'group',props:{}}),
    node(6,PROJECTS,{parentNodeId:id(5)})]),denies());
});
test('7.1 parents must be approved containers and nested cycles fail closed',()=>{
  assert.throws(failShape([node(5),node(6,HERO,{parentNodeId:id(5)})]),denies());
  assert.throws(failShape([node(5,HERO,{componentType:'group',props:{},parentNodeId:id(6)}),
    node(6,HERO,{componentType:'group',props:{},parentNodeId:id(5)})]),denies());
});
test('7.1 authored tree depth three accepted, fourth level denied',()=>{
  const group=(n:number,parent?:number)=>node(n,HERO,{componentType:'group',props:{},
    ...(parent?{parentNodeId:id(parent)}:{}),readingOrder:n-1});
  assert.equal(parseCompositionNodes([group(5),group(6,5),group(7,6)],draft().sections).nodes.length,3);
  assert.throws(failShape([group(5),group(6,5),group(7,6),group(8,7)]),denies());
});
test('7.1 entire portfolio rejects 21st authored node (repeater children excluded)',()=>{
  const list=Array.from({length:20},(_,i)=>node(i+10,HERO,{readingOrder:i,visualOrder:i}));
  assert.equal(parseCompositionNodes(list,draft().sections).nodes.length,20);
  assert.throws(failShape([...list,node(35,HERO,{readingOrder:20,visualOrder:20})]),denies());
});
test('7.1 legacy Issue 6 reference stubs remain private-editable but cannot compile or auto-migrate',()=>{
  const d=draft();d.nodes=[{nodeId:'legacy_reference',contentBinding:{source:'collectionItem',
    collectionId:'projects',contentId:id(100),fieldId:'title'}}];
  assert.equal(parseContentDraft(d).nodes.length,1);
  assert.equal(inspectCompositionCompatibility(d.nodes,d.sections).action,'migrate_legacy_stubs');
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(i=>i.code==='legacy_node'));
});
test('7.2 Auto, Absolute, Hybrid have finite, strictly typed semantics',()=>{
  assert.equal(parseLayout({mode:'auto',flow:'grid',columns:4,gapToken:'sm'}).mode,'auto');
  assert.equal(parseLayout(absolute()).mode,'absolute');
  assert.equal(parseLayout({mode:'hybrid',placement:absolute(),childrenFlow:{mode:'auto',flow:'row'}}).mode,'hybrid');
  assert.throws(()=>parseLayout({mode:'auto',flow:'grid',columns:5}),denies());
  assert.throws(()=>parseLayout({mode:'auto',flow:'column',x:200}),denies());
});
test('7.2 overflow, contradictory anchors, impossible sizes and injection are denied',()=>{
  for(const input of [absolute(0.8,0.1,0.5),absolute(-0.1),absolute(NaN),
    {...absolute(),zIndexToken:'999999'}, {...absolute(),overflow:'hidden'},
    {...absolute(),aspectRatio:100}, {...absolute(),style:'url(javascript:evil)'}])
    assert.throws(()=>parseLayout(input),denies());
});
test('7.2 decorative clipping cannot hide important text or controls',()=>{
  const bad={...absolute(),overflow:'clip-decorative'};
  assert.throws(()=>parseVisualNode(node(5,HERO,{layout:bad})),denies());
  assert.equal(parseVisualNode(node(5,HERO,{componentType:'image',props:{mediaId:id(50),alt:''},
    semanticRole:'decorative',layout:bad})).semanticRole,'decorative');
});
test('7.3 mobile/tablet auto reflow derived from one desktop record; CSS covers intermediate widths',()=>{
  const base=parseLayout(absolute());
  assert.equal(resolveLayout(base,{},'mobile',true).mode,'auto');
  assert.equal(resolveLayout(base,{},'tablet',true).mode,'auto');
  assert.equal(resolveLayout(base,{},'desktop',true).mode,'absolute');
  const css=nodeCss(HEADING,base,{}, {},true);
  assert.match(css,/@media \(max-width:767px\)/);
  assert.match(css,/@media \(min-width:768px\) and \(max-width:1023px\)/);
  assert.match(css,/position:absolute/);assert.match(css,/position:relative/);
});
test('7.3 responsive overrides update only the node and never clone content records',()=>{
  const n=parseVisualNode(node(5,HERO,{layout:absolute(),responsiveOverrides:{
    mobile:{mode:'auto',flow:'grid',columns:1},tablet:{mode:'auto',flow:'row'}},
    visibilityByBreakpoint:{mobile:false}}));
  assert.equal(n.responsiveOverrides?.mobile?.mode,'auto');
  assert.equal(n.visibilityByBreakpoint?.mobile,false);
  assert.throws(()=>parseVisualNode(node(5,HERO,{responsiveOverrides:{phone:{mode:'auto'}}})),denies());
});
test('7.3 incomplete mode-switch override and undocumented CSS props are denied',()=>{
  assert.throws(()=>parseVisualNode(node(5,HERO,{layout:absolute(),responsiveOverrides:{mobile:{mode:'auto'}}})),denies());
  assert.throws(()=>parseVisualNode(node(5,HERO,{responsiveOverrides:{mobile:{x:0.2}}})),denies());
});
test('7.4 at most one Hero h1 and native semantic roles cannot be forged',()=>{
  const d=draft();d.nodes=[heading(),node(5,HERO,{componentType:'heading',props:{level:1},
    semanticRole:'h1',readingOrder:1,visualOrder:1})];
  assert.throws(failShape(d.nodes,d),denies());
  assert.throws(()=>parseVisualNode(node(5,HERO,{semanticRole:'h1'})),denies());
  assert.throws(failShape([node(5,PROJECTS,{componentType:'heading',props:{level:1},semanticRole:'h1'})]),denies());
});
test('7.4 semantic reading order is separate from visual order and heading is in HTML plan',()=>{
  const d=draft();d.nodes=[node(5,HERO,{readingOrder:1,visualOrder:0}),heading()];
  const output=compileComposition(d);assert.equal(output.ok,true);
  assert.deepEqual(output.plan?.sections[0].nodes.map(n=>n.nodeId),[HEADING,id(5)]);
  assert.equal(output.plan?.sections[0].nodes[0].tag,'h1');
});
test('7.4 hidden h1 on mobile is a publication blocker, not just a CSS change',()=>{
  const d=draft();d.nodes=[{...heading(),visibilityByBreakpoint:{mobile:false}},repeater()];
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='hidden_primary_heading'&&x.breakpoint==='mobile'));
});
test('7.4 an inaccessible decorative container cannot contain meaningful child content',()=>{
  assert.throws(failShape([node(5,HERO,{componentType:'group',props:{},semanticRole:'decorative',
    readingOrder:0,visualOrder:0}),node(6,HERO,{parentNodeId:id(5),readingOrder:1,visualOrder:1})]),denies());
});
test('7.5 unsafe href and unknown runtime property cannot become React props',()=>{
  const safe=node(5,HERO,{componentType:'link',props:{label:'Official site',href:'https://example.com/'}});
  assert.equal(parseVisualNode(safe).componentType,'link');
  for(const href of ['javascript:alert(1)','data:text/html,evil','http://example.com',
    'https://localhost/admin','https://127.0.0.1/'])
    assert.throws(()=>parseVisualNode(node(5,HERO,{componentType:'link',props:{label:'Unsafe',href}})),denies());
});
test('7.5 static authored script-like text is inert data; never an executable prop',()=>{
  const d=draft();d.nodes=[heading(),node(5,HERO,{props:{text:'<script>alert(1)</script>'},
    readingOrder:1,visualOrder:1}),repeater()];
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.equal(out.plan?.sections[0].nodes[1].text,'<script>alert(1)</script>');
  assert.ok(!out.plan?.css.includes('<script>'));
  assert.equal(out.plan?.sections[0].nodes[1].tag,'p');
});
test('7.6 repeater counts once; 20 eligible items generate 20 stable instance keys',()=>{
  const d=draft(20);const out=compileComposition(d);
  assert.equal(out.ok,true);
  assert.equal(out.plan?.authoredNodeCount,2);
  assert.equal(out.plan?.generatedRepeaterItems,20);
  assert.equal(out.plan?.sections[1].nodes[0].items?.length,20);
  assert.equal(new Set(out.plan?.sections[1].nodes[0].items?.map(x=>x.key)).size,20);
});
test('7.6 hidden item does not render even when it exists in source collection',()=>{
  const d=draft(2);d.contentCollections[0].items[1].ownerVisibility='draft_only';
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.equal(out.plan?.generatedRepeaterItems,1);
  assert.ok(!canonicalJson(out.plan).includes('project-2'));
});
test('7.6 per-field private data is unavailable to repeaters and bound labels',()=>{
  const d=draft(1);const def=d.collectionDefinitions[0];def.fields.push({fieldId:'private_email',name:'private_email',
    label:'Private email',type:'email',required:false,publicVisibility:'private',aiVisibility:'denied',searchable:false});
  d.contentCollections[0].items[0].fields.private_email='sentinel@example.com';
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.ok(!canonicalJson(out.plan).includes('sentinel@example.com'));
  assert.ok(!canonicalJson(out.plan).includes('private_email'));
});
test('7.6 a bound private field becomes an explicit blocker and never renders private text',()=>{
  const d=draft();d.nodes.push(node(5,PROJECTS,{readingOrder:1,visualOrder:1,
    contentBinding:{source:'collectionItem',collectionId:'projects',contentId:id(100),fieldId:'role'}}));
  d.contentCollections[0].items[0].fields.role='Private staff note';
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='binding_unapproved'));
  assert.ok(!canonicalJson(out).includes('Private staff note'));
});
test('7.7 fixed action grammar rejects selector/code/network primitives and invalid targets',()=>{
  for(const action of [{kind:'eval',code:'alert(1)'},{kind:'navigate',routeId:'https://evil.com'},
    {kind:'togglePanel',targetNodeId:id(999)},{kind:'advanceCarousel',carouselNodeId:REPEATER,delta:44},
    {kind:'scrollToSection',sectionId:id(999)}])
    assert.throws(failShape([node(5,HERO,{componentType:'button',props:{label:'Run'},interaction:action})]),denies());
});
test('7.7 verified panel and tab actions use stable node IDs, not DOM selectors',()=>{
  const panel=node(5,HERO,{componentType:'group',props:{},readingOrder:0,visualOrder:0});
  const button=node(6,HERO,{componentType:'button',props:{label:'Details'},readingOrder:1,visualOrder:1,
    interaction:{kind:'togglePanel',targetNodeId:id(5)}});
  assert.equal(parseCompositionNodes([panel,button],draft().sections).nodes.length,2);
  const tabs=node(7,HERO,{componentType:'tabs',props:{items:[{id:'a',label:'A',body:'Safe'}]},
    readingOrder:2,visualOrder:2});
  const switcher=node(8,HERO,{componentType:'button',props:{label:'Show A'},readingOrder:3,visualOrder:3,
    interaction:{kind:'switchTab',groupNodeId:id(7),tabId:'a'}});
  assert.equal(parseCompositionNodes([panel,button,tabs,switcher],draft().sections).nodes.length,4);
});
test('7.7 exposed actions require an actual local target and cannot conflict with URLs',()=>{
  assert.throws(()=>parseVisualNode(node(5,HERO,{componentType:'button',props:{label:'Go',href:'https://example.com'},
    interaction:{kind:'navigate',routeId:'home'}})),denies());
  assert.throws(()=>parseVisualNode(node(5,HERO,{componentType:'image',props:{mediaId:id(55),alt:'A'},
    interaction:{kind:'openContactForm'}})),denies());
});
test('7.8 only reviewed v1 version tuple may render; unknown future version fails closed',()=>{
  assert.throws(()=>parseVisualNode(node(5,HERO,{componentVersion:999})),denies());
  const out=compileComposition(draft());assert.equal(out.ok,true);
  assert.doesNotThrow(()=>assertSupportedRenderPlanVersion(out.plan!));
  assert.throws(()=>assertSupportedRenderPlanVersion({...out.plan!,registryVersion:'future' as never}),
    denies('CONTENT_UNAVAILABLE'));
  assert.throws(()=>assertSupportedRenderPlanVersion({...out.plan!,schemaVersion:2 as never}),
    denies('CONTENT_UNAVAILABLE'));
});
test('7.9 compiler deterministic, source immutable, style tokens bounded and no network dependence',()=>{
  const d=draft(2),before=canonicalJson(d);
  const a=compileComposition(d),b=compileComposition(d);
  assert.equal(a.ok,true);assert.equal(canonicalJson(a),canonicalJson(b));
  assert.equal(canonicalJson(d),before);
  assert.match(a.plan!.css,/gi-node-/);assert.ok(!a.plan!.css.includes('eval('));
});
test('7.9 missing Hero publish data blocks release without silently inventing credentials',()=>{
  const d=draft();delete d.profile.displayName;
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='publish_required'));
});
test('7.9 no authored H1 gets safe platform fallback, not duplicate authored nodes',()=>{
  const d=draft();d.nodes=[repeater()];
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.equal(out.plan?.authoredNodeCount,1);
  assert.equal(out.plan?.sections[0].nodes[0].role,'h1');
  assert.ok(out.issues.some(x=>x.code==='generated_h1'&&x.severity==='warning'));
});
test('7.9 absolutely positioned overlapping interactive controls block publication',()=>{
  const d=draft();d.nodes=[heading(),node(5,HERO,{componentType:'button',props:{label:'One'},
    layout:absolute(),readingOrder:1,visualOrder:1,interaction:{kind:'navigate',routeId:'home'}}),
  node(6,HERO,{componentType:'button',props:{label:'Two'},layout:absolute(0.2,0.2,0.45,0.4),
    readingOrder:2,visualOrder:2,interaction:{kind:'navigate',routeId:'home'}}),repeater()];
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='control_occlusion'&&x.breakpoint==='desktop'));
});
test('7.9 release-byte budget is bounded by canonical UTF-8 output size',()=>{
  const out=compileComposition(draft(),{maxBytes:128});assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='release_size'));
});
test('7.9 images and contact forms are blocked without verified delivery/admission services',()=>{
  const d=draft();d.nodes=[heading(),node(5,HERO,{componentType:'image',props:{mediaId:id(45),alt:'A'},
    readingOrder:1,visualOrder:1})];
  assert.ok(compileComposition(d).issues.some(x=>x.code==='unapproved_media'));
  const f=draft();f.nodes=[heading(),node(5,HERO,{componentType:'contactForm',
    props:{label:'Contact',consentLabel:'Contact data consent'},readingOrder:1,visualOrder:1})];
  assert.ok(compileComposition(f).issues.some(x=>x.code==='contact_unavailable'));
});
test('7.10 parent/child ordered output is semantic even if layers visually reversed',()=>{
  const d=draft();d.nodes=[heading(),node(5,HERO,{componentType:'group',props:{label:'Case study'},
    readingOrder:1,visualOrder:2}),node(6,HERO,{parentNodeId:id(5),readingOrder:2,visualOrder:1,
    props:{text:'Inside semantic parent'}}),repeater()];
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.equal(out.plan?.sections[0].nodes[1].children[0].text,'Inside semantic parent');
});

// Additional regression cases discovered during the final renderer and data-minimization review.
test('7.6 empty optional collections remain publishable without inventing projects',()=>{
  const d=draft(0);const out=compileComposition(d);
  assert.equal(out.ok,true);assert.equal(out.plan?.generatedRepeaterItems,0);
  assert.equal(out.plan?.sections[1].nodes[0].items?.length,0);
});
test('7.6 provenance contains only publicly rendered items and respects repeater display cap',()=>{
  const d=draft(3);(d.nodes[1] as VisualNode).props.maxVisible=1;
  const out=compileComposition(d);assert.equal(out.ok,true);
  assert.deepEqual(out.plan?.sourceContentIds,[id(100)]);
  assert.equal(out.plan?.generatedRepeaterItems,1);
});
test('7.4 first authored semantic heading is H1 and subsequent levels cannot skip',()=>{
  const d=draft();d.nodes=[node(5,HERO,{componentType:'heading',props:{level:2,text:'Lead'},
    readingOrder:0,visualOrder:0}),{...heading(),readingOrder:1,visualOrder:1},repeater()];
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='heading_order'));
  d.nodes=[heading(),node(5,HERO,{componentType:'heading',props:{level:3,text:'Skipped'},
    readingOrder:1,visualOrder:1}),repeater()];
  const result=compileComposition(d);assert.equal(result.ok,false);
  assert.ok(result.issues.some(x=>x.code==='heading_skip'));
});
test('7.9 long bound Hero text in tiny explicit absolute layout is a release blocker',()=>{
  const d=draft();d.profile.introduction='Long approved summary '.repeat(20);
  d.nodes=[heading(),node(5,HERO,{props:{},readingOrder:1,visualOrder:1,
    contentBinding:{source:'profile',fieldId:'introduction'},layout:absolute(0.1,0.1,0.45,0.1),
    responsiveOverrides:{mobile:{mode:'auto',flow:'column'}}}),repeater()];
  const out=compileComposition(d);assert.equal(out.ok,false);
  assert.ok(out.issues.some(x=>x.code==='bound_text_overflow'&&x.breakpoint==='desktop'));
});
test('7.9 rich text binds as an inert typed AST and release denies unapproved embedded images',()=>{
  const d=draft();const media=id(90);
  d.contentCollections[0].items[0].fields.problem={type:'doc',version:1,blocks:[
    {type:'paragraph',children:[{type:'text',text:'<script>alert(1)</script>'}]},
    {type:'image',mediaId:media,alt:'Diagram of an example project'}]};
  d.contentCollections[0].items[0].publicFieldIds.push('problem');d.mediaRefs=[media as never];
  d.nodes.push(node(5,PROJECTS,{componentType:'text',props:{},readingOrder:1,visualOrder:1,
    contentBinding:{source:'collectionItem',collectionId:'projects',contentId:id(100),fieldId:'problem'}}));
  const denied=compileComposition(d);assert.equal(denied.ok,false);
  assert.ok(denied.issues.some(i=>i.code==='unapproved_rich_media'));
  const approved=compileComposition(d,{approvedMediaIds:new Set([media])});
  assert.equal(approved.ok,true);
  const rich=approved.plan?.sections[1].nodes[1].richText;
  assert.equal(rich?.blocks[0].type,'paragraph');
  assert.ok(canonicalJson(rich).includes('<script>alert(1)</script>'));
  assert.ok(!approved.plan?.css.includes('script'));
});
