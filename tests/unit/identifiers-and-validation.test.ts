import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAccountId, parsePortfolioId, parseMonotonicVersion, InvalidIdentifierError } from '../../src/shared/domain/identifiers.ts';
import { assertPlainCommand, assertSafeJsonValue, parseBoundedText, parseUtcTimestamp, parseCanonicalSlug, classifyHttpsUrl, InputValidationError } from '../../src/shared/domain/validation.ts';
const UUID_A='8a1154d0-4119-48a5-87dd-674710a48011';

test('opaque IDs accept valid typed UUIDs but reject slugs, email and arbitrary object IDs',()=>{
  assert.equal(parseAccountId(UUID_A),UUID_A);
  assert.equal(parsePortfolioId(UUID_A.toUpperCase()),UUID_A);
  for(const value of ['alex','user@example.net','507f1f77bcf86cd799439011','../private','8a1154d0-4119-48a5-07dd-674710a48011',null,{}])
    assert.throws(()=>parseAccountId(value),InvalidIdentifierError);
});
test('typed monotonic revision refuses coercion, negatives and non-integers',()=>{
  assert.equal(parseMonotonicVersion<'draft'>(0),0);
  for(const value of [-1,'1',1.5,NaN,Infinity]) assert.throws(()=>parseMonotonicVersion(value));
});
test('canonical slug uses ASCII-only case normalization, shared reserved words and strict grammar',()=>{
  assert.equal(parseCanonicalSlug('AleX-portfolio'),'alex-portfolio');
  for(const value of ['álex','al','a'.repeat(31),'-alex','alex-','alex--test','admin','DashBoard','api','www','alice%2fsecret','foo/bar','foo.bar','foo\\bar','例子',''])
    assert.throws(()=>parseCanonicalSlug(value),InputValidationError);
});
test('strict command fields deny foreign fields, Mongo operators, getters and malicious prototype',()=>{
  assert.deepEqual(assertPlainCommand({name:'Demo'},new Set(['name'])),{name:'Demo'});
  for(const value of [{name:'test',ownerAccountId:'foreign'}, {'$set':{role:'admin'}}, {'user.name':'bad'}, JSON.parse('{"__proto__":{"role":"admin"}}')])
    assert.throws(()=>assertPlainCommand(value,new Set(['name'])),InputValidationError);
  const withGetter=Object.defineProperty({},'name',{get(){throw Error('accessed getter');},enumerable:true});
  assert.throws(()=>assertPlainCommand(withGetter,new Set(['name'])),InputValidationError);
});
test('deep JSON must exclude unknown prototypes, cycles, prototype pollution and executable data',()=>{
  assert.doesNotThrow(()=>assertSafeJsonValue({name:'good',attrs:[1,true,{ok:null}]}));
  const x:any={};x.loop=x;
  const forbidden=[JSON.parse('{"payload":{"constructor":{"prototype":{}}}}'), {'$where':'this.admin'}, {date:new Date()}, x, {value:Infinity}, {run:()=>1}];
  for(const v of forbidden)assert.throws(()=>assertSafeJsonValue(v),InputValidationError);
});
test('field length counts Unicode scalars and rejects control characters',()=>{
  assert.equal(parseBoundedText('🎯🎯',2),'🎯🎯');
  assert.throws(()=>parseBoundedText('🎯🎯🎯',2));
  assert.throws(()=>parseBoundedText('text\u0000',20));
});
test('timestamps are strict UTC, not invalid adjusted calendar values',()=>{
  assert.equal(parseUtcTimestamp('2026-11-20T12:45:30Z'),'2026-11-20T12:45:30.000Z');
  for(const value of ['2026-02-30T12:45:30Z','2026-11-20','2026-11-20T12:45:30+05:30','foo',12])assert.throws(()=>parseUtcTimestamp(value));
});
test('HTTPS parser is structural and explicitly does not confer egress/SSRF permission',()=>{
  const info=classifyHttpsUrl('https://example.org/blog?x=1');
  assert.equal(info.kind,'approved-https-candidate');assert.equal(info.requiresServerSideSsrfChecks,true);
  for(const value of ['javascript:alert(1)','http://example.org','https://localhost/path','https://127.0.0.1/path','https://172.16.0.1/path','https://8.8.8.8/path','https://admin:secret@example.org','https://[::1]/','https://example.org:8080/','https://example.org/#fragment'])
    assert.throws(()=>classifyHttpsUrl(value),InputValidationError);
});
