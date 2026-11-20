import test from 'node:test';
import assert from 'node:assert/strict';
import { API_NAMESPACE, API_DEFAULT_PAGE_SIZE, API_MAX_PAGE_SIZE, createProblem, parsePageSize, DRAFT_CONCURRENCY_STATES } from '../../src/shared/domain/api.ts';
import { classifyRequestHost } from '../../src/shared/domain/host.ts';
const fixed={allowLocalhost:true,wildcardTlsVerified:false};
test('API conventions reserve v1 and signed status protocol without raw exception data',()=>{
  assert.equal(API_NAMESPACE,'/api/v1');
  assert.equal(API_DEFAULT_PAGE_SIZE,20);
  assert.equal(API_MAX_PAGE_SIZE,50);
  assert.equal(DRAFT_CONCURRENCY_STATES.domainRevisionConflict.status,409);
  assert.equal(DRAFT_CONCURRENCY_STATES.failedIfMatch.status,412);
  const message=createProblem('draftConflict','req_123456abcdef');
  assert.deepEqual([message.status,message.code,message.type], [409,'DRAFT_CONFLICT','https://aaroophan.dev/problems/draft-conflict']);
  assert.equal(createProblem('notFound','req_123456abcdef').status,404);
  assert.throws(()=>createProblem('internal','visitor-supplied-url'));
});
test('page sizes are bounded with no automatic acceptance of coercible strings',()=>{
  assert.equal(parsePageSize(undefined),20);
  assert.equal(parsePageSize(50),50);
  for(const p of ['50',0,-1,51,3.5,Infinity])assert.throws(()=>parsePageSize(p));
});
test('apex and development-only hosts allowed; unknown or forged hosts denied',()=>{
  assert.equal(classifyRequestHost('aaroophan.dev',null,fixed).kind,'apex');
  assert.equal(classifyRequestHost('localhost:3000',null,fixed).kind,'localhost');
  assert.equal(classifyRequestHost('www.aaroophan.dev',null,fixed).kind,'www');
  assert.equal(classifyRequestHost('localhost:3000',null,{allowLocalhost:false,wildcardTlsVerified:false}).kind,'denied');
  for(const h of ['example.org','evilaaroophan.dev','aaroophan.dev.evil.com','localhost:9000','127.0.0.1:3001','api.aaroophan.dev','two.parts.aaroophan.dev','alex.aaroophan.dev.'])
    assert.equal(classifyRequestHost(h,null,fixed).kind,'denied');
  assert.equal(classifyRequestHost('aaroophan.dev','attacker.org',fixed).kind,'denied');
});
test('wildcard classification is distinct from owner/policy proof and explicitly launch gated',()=>{
  assert.deepEqual(classifyRequestHost('Alex.aaroophan.dev',null,{allowLocalhost:false,wildcardTlsVerified:true}),{
    kind:'tenant-host',hostname:'alex.aaroophan.dev',slug:'alex'
  });
  assert.equal(classifyRequestHost('Alex.aaroophan.dev',null,{allowLocalhost:false,wildcardTlsVerified:false}).kind,'denied');
  assert.equal(classifyRequestHost('dashboard.aaroophan.dev',null,{allowLocalhost:false,wildcardTlsVerified:true}).kind,'denied');
});
