import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultTheme,parseDesignTheme,readOwnerTheme,PALETTES,contrastRatio,minimumThemeContrast,
  scopedThemeVariables} from '../../src/domain/design/theme.ts';
import {effectiveMotion,deriveSceneQuality,MOTION_LEVELS,MOTION_TIMINGS} from '../../src/domain/design/motion.ts';
import {buildReleasedSceneGraph} from '../../src/domain/design/scene.ts';
import {FONT_ROLES,FONT_LOADING_GATE} from '../../src/domain/design/fonts.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
const invalid=(e:unknown)=>e instanceof ContentDenied&&e.code==='CONTENT_INVALID';
const id=(n:number)=>`00000000-0000-4000-8000-${n.toString(16).padStart(12,'0')}`;
const released=(sources:unknown[]=[])=>({schemaVersion:1,releaseId:id(100),portfolioId:id(101),
  activeReleaseVerified:true,sceneOptIn:true,sources});
const source=(i:number,changes:Record<string,unknown>={})=>({sourceId:id(i),kind:'project',
  title:`Project ${i}`,publicApproved:true,sceneApproved:true,relatedSourceIds:[],...changes});
test('8.1 theme contract carries all named semantic tokens and supports both dedicated palettes',()=>{
  for(const appearance of ['dark','light'] as const){
    const theme=defaultTheme(appearance),normalized=parseDesignTheme(theme);
    assert.equal(normalized.appearance,appearance);
    assert.deepEqual(normalized.colors,PALETTES[appearance]);
    assert.equal(Object.keys(normalized.colors).length,14);
    assert.equal(normalized.themeVersion,1);
    assert.ok(minimumThemeContrast(normalized.colors).every(c=>c.ratio>=c.minimum));
  }
});
test('8.1 owner editable colors are valid hexadecimal tokens only; no CSS or selectors',()=>{
  for(const value of ['url(https://evil.test)','var(--danger)','rgba(0,0,0,0.5)',
    '#FFF','red','#123456;transform:rotate(1deg)','#000000\ncolor:red']){
    assert.throws(()=>parseDesignTheme({...defaultTheme(),colors:{...defaultTheme().colors,accent:value}}),invalid);
  }
  assert.throws(()=>parseDesignTheme({...defaultTheme(),style:'body{display:none}'}),invalid);
  assert.throws(()=>parseDesignTheme({...defaultTheme(),themeVersion:2}),invalid);
});
test('8.1 normal and focus contrast are enforced across canvases and elevated cards',()=>{
  assert.throws(()=>parseDesignTheme({...defaultTheme('dark'),colors:{...defaultTheme('dark').colors,
    textSecondary:'#112233'}}),invalid);
  assert.throws(()=>parseDesignTheme({...defaultTheme('light'),colors:{...defaultTheme('light').colors,
    focus:'#EEEEEE'}}),invalid);
  assert.ok(contrastRatio('#FFFFFF','#000000')>20);
  assert.ok(contrastRatio('#000000','#000000')===1);
});
test('8.1 customizable palette remains scoped via only generated --gi-* variables',()=>{
  const theme=parseDesignTheme({...defaultTheme(),colors:{...defaultTheme().colors,accent:'#5DBFF0'}});
  const vars=scopedThemeVariables(theme);
  assert.equal(vars['--gi-accent'],'#5DBFF0');assert.equal(vars['--gi-canvas'],'#07111F');
  assert.ok(Object.keys(vars).every(k=>k.startsWith('--gi-')));
  assert.ok(Object.values(vars).every(v=>/^#[a-fA-F0-9]{6}$/.test(v)||v==='1'));
});
test('8.1 unknown theme props, prototype attacks and arbitrary scene/shader settings fail',()=>{
  const theme=defaultTheme();
  for(const payload of [
    {...theme,scene:{...theme.scene,shader:'void main(){ }'}},
    {...theme,technicalFrame:{...theme.technicalFrame,strokeCss:'url(evil)'}},
    {...theme,typography:{...theme.typography,fontUrl:'https://evil.test'}},
    {...theme,scene:{...theme.scene,preset:'javascript'}},
    {...theme,defaultMotion:'always-loop'}])assert.throws(()=>parseDesignTheme(payload),invalid);
  assert.throws(()=>parseDesignTheme(JSON.parse('{"themeVersion":1,"__proto__":{"admin":true}}')),invalid);
});
test('8.2 proprietary handwriting fonts cannot be selected without separately verified embedding rights',()=>{
  const theme=defaultTheme();
  assert.throws(()=>parseDesignTheme({...theme,typography:{...theme.typography,accentFace:'ink-free'}}),invalid);
  assert.throws(()=>parseDesignTheme({...theme,typography:{...theme.typography,signatureFace:'mistral'}}),invalid);
  const permitted=parseDesignTheme({...theme,typography:{...theme.typography,accentFace:'ink-free'}},
    {inkFreeWebEmbeddingVerified:true});
  assert.equal(permitted.typography.accentFace,'ink-free');
  assert.match(FONT_ROLES.accent.license,/NOT verified/);
  assert.equal(FONT_LOADING_GATE.oswald,'font-binary-not-bundled');
});
test('8.2 older Issue 5 theme preset is a read-only compatibility input, not a valid new full write',()=>{
  assert.deepEqual(readOwnerTheme({preset:'signature'}),defaultTheme());
  assert.throws(()=>parseDesignTheme({preset:'signature'}),invalid);
  assert.throws(()=>readOwnerTheme({preset:'signature',html:'<script>'}),invalid);
});
test('8.6 animation tokens are bounded and no perpetual animation is needed',()=>{
  assert.deepEqual(MOTION_LEVELS,['off','subtle','standard','cinematic']);
  assert.ok(MOTION_TIMINGS.letterFullDurationMs<=1200);
  assert.ok(MOTION_TIMINGS.cornerReplayDurationMs<=300);
});
test('8.9 system reduced motion overrides visitor and owner defaults',()=>{
  assert.equal(effectiveMotion('cinematic','cinematic',true),'off');
  assert.equal(effectiveMotion('standard',null,false),'standard');
  assert.equal(effectiveMotion('standard','off',false),'off');
  assert.equal(effectiveMotion('standard','invalid',false),'standard');
  assert.equal(effectiveMotion('off','cinematic',false),'cinematic');
});
test('8.9 adaptive quality refuses continuous work when off, hidden or low-power',()=>{
  assert.equal(deriveSceneQuality({motion:'off',density:'high'}).run,false);
  assert.equal(deriveSceneQuality({motion:'cinematic',density:'high',visible:false}).targetFps,0);
  const full=deriveSceneQuality({motion:'cinematic',density:'high',devicePixelRatio:6});
  const slow=deriveSceneQuality({motion:'cinematic',density:'high',frameMs:60,devicePixelRatio:6});
  assert.equal(full.quality,'high');assert.equal(slow.quality,'low');
  assert.ok(slow.maxParticles<full.maxParticles);assert.ok(slow.pixelRatio<=1.75);
  assert.equal(deriveSceneQuality({motion:'standard',density:'standard',saveData:true}).quality,'low');
  assert.equal(deriveSceneQuality({motion:'subtle',density:'low',hardwareConcurrency:1}).quality,'low');
});
test('8.8 only a verified opt-in release projection can make content-driven 3D nodes',()=>{
  assert.throws(()=>buildReleasedSceneGraph({...released([source(1)]),activeReleaseVerified:false}),invalid);
  assert.throws(()=>buildReleasedSceneGraph({...released([source(1)]),sceneOptIn:false}),invalid);
  assert.throws(()=>buildReleasedSceneGraph({...released([source(1)]),ownerDraft:{secret:'hidden'}}),invalid);
  assert.throws(()=>buildReleasedSceneGraph({...released([source(1)]),releaseId:'draft'}),invalid);
});
test('8.8 hidden/private or non-scene-approved source is not even emitted as a graphical ID',()=>{
  for(const change of [{publicApproved:false},{sceneApproved:false},{kind:'private'},
    {title:'Private',fields:{email:'sentinel@example.test'}},
    {relatedSourceIds:[id(999)]}])assert.throws(()=>buildReleasedSceneGraph(released([source(1,change)])),invalid);
});
test('8.8 scene graph contains coordinates/IDs only, not potentially private owner text',()=>{
  const graph=buildReleasedSceneGraph(released([source(1,{title:'Public display name',relatedSourceIds:[id(2)]}),
    source(2)]));
  const json=JSON.stringify(graph);
  assert.equal(graph.nodes.length,2);assert.equal(graph.edges.length,1);
  assert.ok(!json.includes('Public display name'));assert.ok(!json.includes('title'));
  assert.equal(graph.releaseId,id(100));
});
test('8.8 deterministic scene graph and no mutation of approved source records',()=>{
  const projection=released([source(1,{relatedSourceIds:[id(2)]}),source(2,{relatedSourceIds:[id(1)]})]);
  const before=structuredClone(projection);
  assert.deepEqual(buildReleasedSceneGraph(projection),buildReleasedSceneGraph(projection));
  assert.deepEqual(projection,before);
  assert.equal(buildReleasedSceneGraph(projection).edges.length,1);
});
test('8.8 max 24 sources and 36 edges; no foreign/cyclic/conflicting IDs',()=>{
  assert.equal(buildReleasedSceneGraph(released(Array.from({length:24},(_,i)=>source(i+1)))).nodes.length,24);
  assert.throws(()=>buildReleasedSceneGraph(released(Array.from({length:25},(_,i)=>source(i+1)))),invalid);
  assert.throws(()=>buildReleasedSceneGraph(released([source(1),source(1)])),invalid);
  assert.throws(()=>buildReleasedSceneGraph(released([source(1,{relatedSourceIds:[id(1)]})])),invalid);
  const dense=Array.from({length:11},(_,i)=>source(i+1,{relatedSourceIds:
    Array.from({length:11},(_,j)=>id(j+1)).filter(x=>x!==id(i+1))}));
  assert.throws(()=>buildReleasedSceneGraph(released(dense)),invalid);
});
test('8.8 scene graph never follows a relationship not present in the same release',()=>{
  const draft=released([source(1,{relatedSourceIds:[id(2)]})]);
  assert.throws(()=>buildReleasedSceneGraph(draft),invalid);
});
