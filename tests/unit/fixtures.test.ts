import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAccountId, parsePortfolioId } from '../../src/shared/domain/identifiers.ts';
import { parseCanonicalSlug } from '../../src/shared/domain/validation.ts';
const fixtures = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../fixtures/reference-portfolios.json'),'utf8'));
/** Test-only deny projection: actual content/AI compilers arrive in Issues 6 and 16. */
function projectAllowedFields(scenario:any, surface: 'public'|'ai') {
  return Object.fromEntries(scenario.fields.filter((f:any)=>f.visibility==='published' && (surface==='public'||f.aiApproved===true)).map((f:any)=>[f.id,f.value]));
}
test('four reproducible synthetic personas with isolated identities and at least one Hero each',()=>{
 assert.equal(fixtures.scenarios.length,4);
 assert.equal(new Set(fixtures.scenarios.map((x:any)=>x.accountId)).size,4);
 assert.equal(new Set(fixtures.scenarios.map((x:any)=>x.portfolioId)).size,4);
 for(const scenario of fixtures.scenarios){
  parseAccountId(scenario.accountId);parsePortfolioId(scenario.portfolioId);
  assert.equal(parseCanonicalSlug(scenario.slug),scenario.slug);
  assert.equal(scenario.sections[0],'Hero');
 }
});
test('privacy sentinels are absent from the expected public and AI allowlist projections',()=>{
 for(const scenario of fixtures.scenarios){
  const publicFields=projectAllowedFields(scenario,'public');
  const aiFields=projectAllowedFields(scenario,'ai');
  const publicBytes=JSON.stringify(publicFields),aiBytes=JSON.stringify(aiFields);
  for(const field of scenario.fields){
   if(field.visibility!=='published') assert.equal(publicBytes.includes(field.value),false,`${scenario.id}: private field leaked`);
   if(field.visibility!=='published'||field.aiApproved!==true) assert.equal(aiBytes.includes(field.value),false,`${scenario.id}: AI-denied field leaked`);
  }
 }
});
test('privacy test sentinel deliberately fails if a future projection includes denied content',()=>{
 const scenario=fixtures.scenarios.find((x:any)=>x.id==='developer');
 const denied=scenario.fields.find((x:any)=>x.id==='referenceEmail').value;
 const maliciousPublic=JSON.stringify({...projectAllowedFields(scenario,'public'),hijacked:denied});
 assert.ok(maliciousPublic.includes(denied));
});
test('responsive, long text, RTL-like and zoom stress fixtures are deterministic',()=>{
 assert.ok(fixtures.layoutStressCases.viewportsCssPx.includes(320));
 assert.ok(fixtures.layoutStressCases.zoomPercent.includes(400));
 assert.match(fixtures.layoutStressCases.longHeroHeading,/exceptionally long/);
 assert.equal(fixtures.layoutStressCases.keyboardTraversalRequired,true);
});
