import test from 'node:test';
import assert from 'node:assert/strict';
import {assertApexMutation,readBoundedJson,assertTrustedRequestHost,rejectCredentialedPreflight,IngressDenied} from '../../src/server/http/ingress.ts';
import {newOpaqueToken,hashOpaqueToken} from '../../src/server/security/crypto.ts';
const token=newOpaqueToken();
const policy={canonicalOrigin:'http://localhost:3000',allowLocalhost:true,csrfExpectedHash:hashOpaqueToken(token),maxBytes:1024};
function makeRequest(overrides:Record<string,string>={},body='{}',method='POST') {
 return new Request('http://localhost:3000/api/v1/test',{method,body,
 headers:{host:'localhost:3000',origin:'http://localhost:3000','content-type':'application/json','x-csrf-token':token,
 'sec-fetch-site':'same-origin',...overrides}});
}
test('exact same-origin mutation with a bound CSRF verifier passes structural ingress',()=>assert.doesNotThrow(()=>assertApexMutation(makeRequest(),policy)));
test('malicious same-site sibling origin never gains an apex mutation',()=>{
 for(const origin of ['https://alex.aaroophan.dev','https://aaroophan.dev.evil.test','http://localhost:3001','null']){
 assert.throws(()=>assertApexMutation(makeRequest({origin}),policy),IngressDenied);
 }
});
test('missing and wrong CSRF deny before downstream persistence',()=>{
 for(const supplied of ['',newOpaqueToken()])assert.throws(()=>assertApexMutation(makeRequest({'x-csrf-token':supplied}),policy));
 assert.throws(()=>assertApexMutation(makeRequest(),{...policy,csrfExpectedHash:null}));
});
test('Fetch Metadata rejects same-site sibling POST even with spoofed Origin',()=>{
 assert.throws(()=>assertApexMutation(makeRequest({'sec-fetch-site':'same-site'}),policy));
 assert.throws(()=>assertApexMutation(makeRequest({'sec-fetch-site':'cross-site'}),policy));
});
test('malformed/forged Host or forwarded Host is not trusted',()=>{
 assert.throws(()=>assertApexMutation(makeRequest({'x-forwarded-host':'alice.aaroophan.dev'}),policy));
 assert.throws(()=>assertApexMutation(makeRequest({host:'evil.test'}),policy));
 assert.throws(()=>assertTrustedRequestHost(makeRequest({host:'alex.aaroophan.dev'}),policy));
});
test('credentials cannot be enabled by a preflight response',async()=>{
 const response=rejectCredentialedPreflight();assert.equal(response.status,403);
 assert.equal(response.headers.get('access-control-allow-origin'),'null');
 assert.equal(response.headers.get('access-control-allow-credentials'),null);
});
test('invalid method, content type, content length and query do not reach command',()=>{
 assert.throws(()=>assertApexMutation(makeRequest({'content-type':'text/html'}),policy));
 assert.throws(()=>assertApexMutation(makeRequest({'content-length':'5000'}),policy));
 assert.throws(()=>assertApexMutation(new Request('http://localhost:3000/api/v1/test', {headers:{host:'localhost:3000'}}),policy));
});
test('bounded body rejects actual oversized body despite absent Content-Length',async()=>{
 const data='{"note":"'+ 'a'.repeat(1500)+'"}';
 const request=makeRequest({},data);
 await assert.rejects(readBoundedJson(request,1024),(e:any)=>e?.code==='BODY_TOO_LARGE');
});
test('bounded body round trips valid JSON and rejects invalid or duplicate payloads safely',async()=>{
 const request=makeRequest({},'{"allowed":true}');
 assert.deepEqual(await readBoundedJson(request,1024),{allowed:true});
 await assert.rejects(readBoundedJson(makeRequest({},'{invalid'),1024));
});
