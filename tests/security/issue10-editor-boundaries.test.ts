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
  assert.match(page,/getOwnedEditableDraft\(actor,portfolio\.portfolioId\)/);
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
test('10.9 canvas autosave uses a revision-controlled same-origin mutation and receipt lookup',()=>{
  const ui=read('src/ui/owner/canvas/canvas-editor.tsx');
  const hook=read('src/ui/owner/canvas/use-draft-autosave.ts');
  assert.match(ui,/useDraftAutosave/);
  assert.match(hook,/ownerRequest<ResponseAck>/);assert.match(hook,/draft\/workspace/);
  assert.match(hook,/If-Match/);assert.match(hook,/X-Client-Mutation-Id/);
  assert.match(hook,/draft\/mutations\//);
  assert.match(hook,/sessionStorage/);assert.match(hook,/recoveryStorageKey\(accountId,portfolioId\)/);
  assert.match(ui,/Publish · not available/);
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
test('10.10 editor remains separate from production publication while adding private autosave',()=>{
  const ui=read('src/ui/owner/canvas/canvas-editor.tsx');
  assert.doesNotMatch(ui,/\/api\/v1\/portfolios\/.*\/publish/);
  assert.match(ui,/Save now/);assert.match(ui,/Play local animation preview/);
  assert.match(ui,/useDraftAutosave/);
  const merge=read('src/domain/editor/workspace.ts');
  assert.match(merge,/SECTION_MUTABLE/);assert.match(merge,/ITEM_MUTABLE/);
  assert.match(merge,/section\.type==='hero'&&!section\.visible/);
});
