/** These are STATIC source-boundary regression checks, not browser/SSR/conformance evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path:string)=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
test('7.5/7.10 semantic renderer never mounts raw HTML or user CSS from owner input',()=>{
  const jsx=source('src/server/composition/semantic-renderer.tsx');
  assert.doesNotMatch(jsx,/dangerouslySetInnerHTML|createElement\(|innerHTML\s*=|eval\(|new Function\(/);
  assert.match(jsx,/<style nonce=\{nonce\}>\{plan\.css\}<\/style>/);
  assert.match(jsx,/function approvedMediaUrl\(/);
  assert.match(jsx,/UNTRUSTED_RENDER_BASE_PATH/);
});
test('7.4/7.7 no-JavaScript tabs and carousel expose readable semantic bodies',()=>{
  const client=source('src/ui/composition/client-islands.tsx');
  assert.match(client,/hidden=\{enhanced&&current!==i\}/);
  assert.match(client,/<h3>\{item\.label\}<\/h3>/);
  assert.match(client,/onKeyDown=\{e=>step\(e,i\)\}/);
  assert.match(client,/ref\.current\?\.focus\(\)/);
  assert.doesNotMatch(client,/dangerouslySetInnerHTML|eval\(|new Function\(/);
});
test('7.9 owner draft API does not activate a release or return candidate compiled content',()=>{
  const server=source('src/server/composition/http.ts');
  assert.match(server,/requireApexActor\(req,true\)/);
  assert.match(server,/getOwnedDraft/);
  assert.match(server,/return json\(\{valid:result\.ok,issues:result\.issues/);
  assert.doesNotMatch(server,/activateRelease|activeReleaseId\s*=|releasePlan:/);
});
