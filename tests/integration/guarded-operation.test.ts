import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {InMemoryTestAuditStore} from '../../src/server/observability/audit.ts';
import {parseOperationId,parseAccountId} from '../../src/shared/domain/identifiers.ts';
import {newOpaqueToken,hashOpaqueToken} from '../../src/server/security/crypto.ts';
import {assertApexMutation} from '../../src/server/http/ingress.ts';

test('adversarial mutation denial leaves audit and synthetic domain unchanged',async()=>{
 const store=new InMemoryTestAuditStore();const token=newOpaqueToken();const state={changes:0};
 const request=new Request('http://localhost:3000/api/v1/portfolios',{method:'POST',body:'{}',headers:{
  host:'localhost:3000',origin:'https://evil.aaroophan.dev','sec-fetch-site':'same-site',
  'content-type':'application/json','x-csrf-token':token}});
 assert.throws(()=>assertApexMutation(request,{canonicalOrigin:'http://localhost:3000',allowLocalhost:true,csrfExpectedHash:hashOpaqueToken(token)}));
 assert.deepEqual(state,{changes:0});assert.equal(store.countForTest(),0);
});
test('unavailable security audit prevents commit for isolated synthetic tenant',async()=>{
 const store=new InMemoryTestAuditStore();store.unavailable=true;let changes=0;
 const event={eventId:'evt_abcdefgh99',operationId:parseOperationId(randomUUID()),kind:'session.revoke' as const,
  accountId:parseAccountId('11111111-1111-4111-8111-111111111111'),createdAt:'2026-01-01T00:00:00Z',
  expiresAt:'2026-03-01T00:00:00Z',result:'intent' as const,reasonCode:'SESSION_REVOKE'};
 await assert.rejects(store.runAtomically(event,async()=>{changes++;return true;}));
 assert.equal(changes,0);
});
