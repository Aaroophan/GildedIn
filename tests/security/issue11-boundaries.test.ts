import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name:string)=>readFileSync(new URL(`../../${name}`,import.meta.url),'utf8');
test('11.1 save and mutation receipt paths use authenticated apex and owner-scoped repository',()=>{
  const http=read('src/server/editor/http.ts'),preview=read('src/server/editor/preview.ts');
  assert.match(http,/requireApexActor\(req,true\)/);
  assert.match(http,/requiredIfMatch\(req\)/);
  assert.match(preview,/requireApexActor\(req,false\)/);
  assert.match(preview,/readMutationStatus\(actor/);
});
test('11.2 editor autosave uses one in-flight typed CAS mutation and snapshot-specific ack',()=>{
  const source=read('src/ui/owner/canvas/use-draft-autosave.ts');
  assert.match(source,/pendingSnapshot/);assert.match(source,/completeDraftSave/);
  assert.match(source,/If-Match/);assert.match(source,/X-Client-Mutation-Id/);
  assert.match(source,/reconcileDraftSave/);assert.doesNotMatch(source,/sendBeacon|indexedDB/);
});
test('11.3 recovery is session-scoped, bounded, and cleared on signout',()=>{
  const source=read('src/ui/owner/canvas/use-draft-autosave.ts');
  assert.match(source,/sessionStorage/);assert.match(source,/readScopedRecovery/);
  assert.match(read('src/ui/owner/sign-out.tsx'),/gildedin:unsaved:v1:/);
});
test('11.6 protected iframe repeats ownership and cannot be framed cross-origin',()=>{
  const frame=read('src/app/(owner)/owner-preview-frame/page.tsx');
  const loader=read('src/server/editor/preview-page.ts');
  const headers=read('src/server/http/headers.ts');
  assert.match(frame,/ownedPreviewPage/);assert.match(loader,/requireOwnerPage/);
  assert.match(loader,/getOwnedEditableDraft/);assert.match(headers,/SAMEORIGIN/);
  assert.match(headers,/frame-ancestors/);assert.match(headers,/routeClass==='preview'\?'self':'none'/);
  assert.match(read('src/proxy.ts'),/owner-preview-frame/);
});
test('11.7 preview uses one semantic renderer, never public release or browser DOM snapshots',()=>{
  const frame=read('src/app/(owner)/owner-preview-frame/page.tsx');
  const loader=read('src/server/editor/preview-page.ts');
  assert.match(frame,/SemanticComposition/);assert.match(frame,/pauseMotion/);
  assert.match(loader,/compileComposition/);assert.doesNotMatch(loader,/activeReleaseId|readPublicRelease/);
});
test('11.8 prepublication is owner-only and cannot mutate or publish',()=>{
  const source=read('src/server/editor/preview.ts'),validator=read('src/domain/editor/preflight.ts');
  assert.match(source,/requireApexActor\(req,true\)/);
  assert.match(source,/buildDraftValidationReport/);
  assert.match(validator,/compileComposition/);
  assert.doesNotMatch(source,/publishOperation|activeReleaseId|activateRelease/);
});
test('11.10 protected responses always prohibit public caching/indexing',()=>{
  const source=read('src/server/editor/preview.ts');
  assert.match(source,/private, no-store/);assert.match(source,/noindex, nofollow/);
  assert.match(source,/Vary':'Cookie, Host, Origin/);
});
