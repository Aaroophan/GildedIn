import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {InMemoryTestAuditStore,projectSecurityAudit,AuditStorageUnavailable} from '../../src/server/observability/audit.ts';
import {parseAccountId,parsePortfolioId,parseOperationId} from '../../src/shared/domain/identifiers.ts';
function sample(){return {eventId:'evt_abcdefgh123',operationId:parseOperationId(randomUUID()),kind:'publication.activate' as const,
 accountId:parseAccountId('11111111-1111-4111-8111-111111111111'),portfolioId:parsePortfolioId('22222222-2222-4222-8222-222222222222'),
 createdAt:'2026-01-01T00:00:00.000Z',expiresAt:'2026-04-01T00:00:00.000Z',result:'accepted' as const,reasonCode:'PUBLISH_OK'};}
test('audit sanitization never persists private body or chat',()=>{
 const entry=sample();
 const output=JSON.stringify(projectSecurityAudit({...entry,contactBody:'PRIVATE_SENTINEL',chatPrompt:'SECRET'} as any));
 assert.ok(!output.includes('PRIVATE_SENTINEL'));assert.ok(!output.includes('SECRET'));assert.ok(!output.includes('chatPrompt'));
});
test('audit rejects invalid kind and unbounded reason',()=>{
 assert.throws(()=>projectSecurityAudit({...sample(),kind:'foo' as any}));
 assert.throws(()=>projectSecurityAudit({...sample(),reasonCode:'PUBLISH\nSECRET'}));
});
test('audit adapter failure occurs before privileged commit side effects',async()=>{
 const store=new InMemoryTestAuditStore();store.unavailable=true;let writes=0;
 await assert.rejects(store.runAtomically(sample(),async()=>{writes++;return true;}),AuditStorageUnavailable);
 assert.equal(writes,0);assert.equal(store.countForTest(),0);
});
test('audit same operation ID is idempotent, even when retried',async()=>{
 const store=new InMemoryTestAuditStore();const entry=sample();let writes=0;
 assert.equal(await store.runAtomically(entry,async()=>++writes),1);
 assert.equal(await store.runAtomically(entry,async()=>++writes),1);
 assert.equal(store.countForTest(),1);assert.equal(writes,1);
});
test('audit reads are actor-scoped and expired records are denied before TTL cleanup',async()=>{
 const store=new InMemoryTestAuditStore();const e=sample();await store.runAtomically(e,async()=>true);
 const another=parseAccountId('33333333-3333-4333-8333-333333333333');
 assert.equal(await store.getEvent(e.eventId,{accountId:another,isApprovedAdmin:false},new Date('2026-01-02')),null);
 assert.ok(await store.getEvent(e.eventId,{accountId:e.accountId,isApprovedAdmin:false},new Date('2026-01-02')));
 assert.equal(await store.getEvent(e.eventId,{accountId:e.accountId,isApprovedAdmin:false},new Date('2026-04-02')),null);
});
