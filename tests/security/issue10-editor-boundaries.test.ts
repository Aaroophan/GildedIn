/** Source boundary tests supplement (but never replace) actual browser and provider evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p:string)=>readFileSync(new URL(`../../${p}`,import.meta.url),'utf8');
const names=['canvas-editor.tsx','canvas-stage.tsx','canvas-structure.tsx','canvas-inspector.tsx'];
test('10.1 owner workspace route verifies current session and exact portfolio ownership server-side',()=>{
  const page=read('src/app/(owner)/dashboard/portfolios/[portfolioId]/editor/page.tsx');
  assert.match(page,/requireOwnerPage\(\)/);
  assert.match(page,/portfolio\.portfolioId\s*!==\s*\(await params\)\.portfolioId/);
  assert.match(page,/getOwnedDraft\(actor,portfolio\.portfolioId\)/);
  assert.match(page,/force-dynamic/);
  assert.doesNotMatch(page,/unstable_cache|revalidate\s*:\s*[1-9]/);
});
test('10.10 workspace mutation requires actual apex session/Origin/CSRF and strict body parsing',()=>{
  const http=read('src/server/editor/http.ts');
  assert.match(http,/requireApexActor\(req,true\)/);
  assert.match(http,/requiredIfMatch\(req\)/);
  assert.match(http,/parseMutationToken\(req\)/);
  assert.match(http,/readBoundedJson\(req,350_000\)/);
  assert.match(http,/Cache-Control.*private, no-store/);
  const router=read('src/app/api/v1/portfolios/[portfolioId]/draft/workspace/route.ts');
  assert.match(router,/putCanvasWorkspace/);assert.match(router,/optionsDenied/);
});
test('10.9 canvas writes only through dedicated revision-controlled same-origin mutation',()=>{
  const ui=read('src/ui/owner/canvas/canvas-editor.tsx');
  assert.match(ui,/ownerRequest<SaveResponse>/);assert.match(ui,/draft\/workspace/);
  assert.match(ui,/If-Match/);assert.match(ui,/X-Client-Mutation-Id/);
  assert.match(ui,/Unsaved local changes/);assert.match(ui,/Publish · not available/);
  assert.doesNotMatch(ui,/localStorage|sessionStorage|indexedDB|setInterval\s*\(/);
});
test('10.3, 10.8 geometry delegates to finite domain commands; no editable DOM injection',()=>{
  const stage=read('src/ui/owner/canvas/canvas-stage.tsx');
  const ui=read('src/ui/owner/canvas/canvas-editor.tsx');
  assert.match(stage,/onPointerCancel/);assert.match(stage,/onLostPointerCapture/);
  assert.match(stage,/onKeyDown/);assert.match(ui,/gestureGeometry\(/);assert.match(ui,/type:'setLayout'/);
  for(const p of names){const src=read('src/ui/owner/canvas/'+p);
    assert.doesNotMatch(src,/dangerouslySetInnerHTML|\beval\(|new Function\(|\.innerHTML\s*=/);
    assert.doesNotMatch(src,/(?:localStorage|sessionStorage)\.setItem\s*\(/);}
});
test('10.7 no raw draft reaches public route or anonymous endpoint via canvas components',()=>{
  for(const p of names){const src=read('src/ui/owner/canvas/'+p);
    assert.doesNotMatch(src,/src\/server\/public|\/api\/v1\/public|publicReleases|activeReleaseId\s*=/);}
  const repo=read('src/infrastructure/mongodb/content-repository.ts');
  assert.match(repo,/putEditorWorkspace\(/);assert.match(repo,/mergeEditorWorkspace\(/);
  assert.match(repo,/this\.save\(actor,id/);
});
test('10.10 edit surface remains separate from production publishing and autosave',()=>{
  const ui=read('src/ui/owner/canvas/canvas-editor.tsx');
  assert.doesNotMatch(ui,/\/api\/v1\/portfolios\/.*\/publish/);
  assert.match(ui,/Save draft/);assert.match(ui,/Play animation preview/);
  const merge=read('src/domain/editor/workspace.ts');
  assert.match(merge,/SECTION_MUTABLE/);assert.match(merge,/ITEM_MUTABLE/);
  assert.match(merge,/section\.type==='hero'&&!section\.visible/);
});
