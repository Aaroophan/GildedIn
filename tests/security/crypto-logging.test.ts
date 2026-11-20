import test from 'node:test';
import assert from 'node:assert/strict';
import {newOpaqueToken,newRequestId,hashOpaqueToken,constantTimeTokenMatch,requireCsrfProof} from '../../src/server/security/crypto.ts';
import {createLogger,projectLog} from '../../src/server/observability/logger.ts';
import {makeSecurityHeaders,classifyRoute} from '../../src/server/http/headers.ts';
test('request IDs and tokens are fresh cryptographically random strings',()=>{
 const t1=newOpaqueToken(),t2=newOpaqueToken();
 assert.notEqual(t1,t2);assert.match(newRequestId(),/^req_[A-Za-z0-9_-]{12,}$/);
});
test('hash verifier never exposes token and mismatches reject',()=>{
 const t=newOpaqueToken(),digest=hashOpaqueToken(t);
 assert.equal(digest.length,64);assert.ok(!digest.includes(t));
 assert.equal(constantTimeTokenMatch(t,digest),true);
 assert.equal(constantTimeTokenMatch(newOpaqueToken(),digest),false);
 assert.throws(()=>requireCsrfProof(null,digest));
});
const valid={level:'warn' as const,event:'security.denied' as const,routeClass:'account' as const,
 actorCategory:'unknown' as const,outcome:'denied' as const,requestId:newRequestId(),code:'ORIGIN_DENIED'};
test('log projection drops cookies, AI messages, extra fields, request bodies',()=>{
 const event={...valid,body:'PRIVATE_SENTINEL',cookie:'SESSION_SECRET',prompt:'AI_PROMPT'};
 const output=JSON.stringify(projectLog(event,()=>new Date('2026-01-01T00:00:00Z')));
 for(const banned of ['PRIVATE_SENTINEL','SESSION_SECRET','AI_PROMPT','cookie','body','prompt'])assert.ok(!output.includes(banned));
});
test('log projection rejects malicious field injection/newlines and unknown actor classes',()=>{
 assert.throws(()=>projectLog({...valid,code:'X\nSECRET',requestId:valid.requestId}));
 assert.throws(()=>projectLog({...valid,actorCategory:'admin-impersonated' as any}));
});
test('logging failure cannot throw or authorize a protected operation',()=>{
 const logger=createLogger({write(){throw new Error('SECRET_STACK')}});
 assert.equal(logger.record(valid),false);assert.equal(logger.failedSinks(),1);
});
test('logging output is bounded and avoids private input fields',()=>{
 const lines:string[]=[];const logger=createLogger({write(s){lines.push(s)}},()=>new Date('2026-01-01T00:00:00Z'));
 assert.equal(logger.record(valid),true);assert.equal(lines.length,1);
 assert.equal(JSON.parse(lines[0]).code,'ORIGIN_DENIED');
});
test('private routes are no-store, noindex and protected by restrictive CSP',()=>{
 for(const kind of ['auth','api','preview','owner','contact','audit'] as const){
 const h=makeSecurityHeaders(kind,{nonce:'AAAAAAAAAAAAAAAAAAAAAAAA'});
 assert.match(h['Cache-Control'],/no-store/);assert.match(h['X-Robots-Tag'],/noindex/);
 assert.ok(!h['Content-Security-Policy'].includes('unsafe-eval'));
 assert.ok(!h['Content-Security-Policy'].includes('unsafe-inline'));
 assert.ok(!('Strict-Transport-Security' in h));
 }
});
test('HSTS includeSubDomains requires explicit verified TLS and subdomain readiness',()=>{
 const nonce='AAAAAAAAAAAAAAAAAAAAAAAA';
 assert.equal(makeSecurityHeaders('public',{nonce}).hasOwnProperty('Strict-Transport-Security'),false);
 assert.equal(makeSecurityHeaders('public',{nonce,verifiedTls:true,hostReadyForSubdomains:false})['Strict-Transport-Security'],'max-age=300');
 assert.match(makeSecurityHeaders('public',{nonce,verifiedTls:true,hostReadyForSubdomains:true})['Strict-Transport-Security'],/includeSubDomains/);
});
test('preview classification cannot accidentally be treated as a generic owner route',()=>{
 assert.equal(classifyRoute('/dashboard/preview'),'preview');assert.equal(classifyRoute('/dashboard'),'owner');
});
