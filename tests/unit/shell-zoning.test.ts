import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const file=(p:string)=>fs.readFileSync(path.join(root,p),'utf8');
test('issue 4 dashboard enforces live opaque session and preview remains disabled',()=>{
 const dashboard=file('src/app/(owner)/dashboard/page.tsx');
 assert.match(dashboard,/requireSession\(/);
 assert.match(dashboard,/SESSION_COOKIE_NAME/);
 assert.doesNotMatch(dashboard,/MongoClient|\.collection\s*\(/);
 const preview=file('src/app/(owner)/dashboard/preview/page.tsx');
 assert.match(preview,/notFound\(\)/);
});
test('guessed public paths and internal rewritten tenants cannot read private draft',()=>{
 for (const p of ['src/app/(public)/[slug]/page.tsx','src/app/_tenant/[slug]/page.tsx']){
  assert.match(file(p),/notFound\(\)/);
  assert.doesNotMatch(file(p),/getDraft|getOwnedDraft|MongoClient/);
 }
});
test('proxy wildcard cannot be enabled by unreviewed environment flag',()=>{
 const proxy=file('src/proxy.ts');
 assert.match(proxy,/wildcardTlsVerified:\s*false/);
 assert.match(proxy,/421/);
});
test('API v1 placeholder uses no-store Problem Details and never connects a provider',()=>{
 const api=file('src/app/api/v1/[[...path]]/route.ts');
 assert.match(api,/createProblem\('unavailable'/);
 assert.match(api,/application\/problem\+json/);
 assert.match(api,/no-store/);
 assert.doesNotMatch(api,/mongodb|groq-sdk|fetch\(/);
});
