import test from 'node:test';
import assert from 'node:assert/strict';
import {createProblem} from '../../src/shared/domain/api.ts';
import {proofFromVerifiedAuthJsCallback} from '../../src/server/identity/provider-proof.ts';
import {oauthExchangeCsrf,verifyOAuthExchangeCsrf,readOAuthCookie,OAUTH_COOKIE_NAME} from '../../src/server/identity/oauth-handshake.ts';
import {cookieForSession,parseCookie,SESSION_COOKIE_NAME} from '../../src/server/identity/session-cookie.ts';
import {assertSafeReturnPath,requireRecentAuthentication,parseProfilePatch} from '../../src/domain/identity/contracts.ts';
import {parseAccountId,parseSessionId} from '../../src/shared/domain/identifiers.ts';
const accountId=parseAccountId('11111111-1111-4111-8111-111111111111');
const sessionId=parseSessionId('22222222-2222-4222-8222-222222222222');
test('T-IAM-01 OAuth proof requires provider-subject consistency and refuses GitHub profile email',()=>{
  const g=proofFromVerifiedAuthJsCallback({provider:'google',providerAccountId:'signed-sub'},
    {sub:'signed-sub',name:'Test',email_verified:true,email:'verified@example.invalid'});
  assert.equal(g.verifiedEmail,'verified@example.invalid');
  assert.throws(()=>proofFromVerifiedAuthJsCallback({provider:'google',providerAccountId:'signed-sub'},
    {sub:'attacker-sub',name:'Test'}));
  assert.throws(()=>proofFromVerifiedAuthJsCallback({provider:'github',providerAccountId:'22'},
    {id:23,login:'other'}));
  const gh=proofFromVerifiedAuthJsCallback({provider:'github',providerAccountId:'22'},
    {id:22,login:'synthetic',name:'GitHub',email:'unverified@example.invalid'});
  assert.equal(gh.verifiedEmail,undefined);
  assert.throws(()=>proofFromVerifiedAuthJsCallback({provider:'facebook',providerAccountId:'1'},
    {id:1}));
});
test('T-IAM-05 OAuth exchange CSRF is keyed to encrypted session cookie and cannot be reused',()=>{
  const secret='S'.repeat(64);
  const cookie1='synthetic.oauth.jwt.segment.alpha';const cookie2='synthetic.oauth.jwt.segment.bravo';
  const proof=oauthExchangeCsrf(cookie1,secret);
  assert.match(proof,/^[a-zA-Z0-9_-]{43}$/);
  assert.doesNotThrow(()=>verifyOAuthExchangeCsrf(proof,cookie1,secret));
  assert.throws(()=>verifyOAuthExchangeCsrf(proof,cookie2,secret));
  assert.throws(()=>verifyOAuthExchangeCsrf(proof,cookie1,'T'.repeat(64)));
  assert.throws(()=>verifyOAuthExchangeCsrf(null,cookie1,secret));
  assert.equal(readOAuthCookie(`${OAUTH_COOKIE_NAME}=${cookie1}`),cookie1);
  assert.equal(readOAuthCookie('authjs.session-token=spoofed'),null);
  const c=cookieForSession('a'.repeat(43),60);
  assert.equal(parseCookie(c,SESSION_COOKIE_NAME),'a'.repeat(43));
  assert.equal(parseCookie(`${SESSION_COOKIE_NAME}=broken`,SESSION_COOKIE_NAME),null);
});
test('T-IAM-08 recent proof is account/session-specific and rejects stale or future data',()=>{
  const now=new Date('2026-11-20T01:00:00Z');
  const actor={accountId,sessionId,sessionLookupId:'token-id',authProvider:'google' as const,securityVersion:0,authenticatedAt:new Date(now.getTime()-900000)};
  assert.throws(()=>requireRecentAuthentication(actor,now));
  assert.doesNotThrow(()=>requireRecentAuthentication({...actor,authenticatedAt:new Date(now.getTime()-120000)},now));
  assert.throws(()=>requireRecentAuthentication({...actor,authenticatedAt:new Date(now.getTime()+600000)},now));
});
test('T-IAM-02/T-SEC-04 profile rejects mass assignment and return paths cannot redirect off apex',()=>{
  for(const input of [{displayName:'Owner',platformRoles:['admin']},
    JSON.parse('{"displayName":"Owner","__proto__":{"isAdmin":true}}'),{emailVerifiedAt:'today'},
    {displayName:'<img onerror=1>'}]) assert.throws(()=>parseProfilePatch(input));
  assert.deepEqual(parseProfilePatch({displayName:'  Safe  '}),{displayName:'Safe'});
  for(const attempted of ['//evil.example','https://evil.example/','/\\evil','/%2f%2fevil','/dashboard?next=//evil'])
    assert.equal(assertSafeReturnPath(attempted),'/dashboard');
  assert.equal(assertSafeReturnPath('/dashboard/settings'),'/dashboard/settings');
  const p=createProblem('unauthorized','req_1234567');
  assert.equal(JSON.stringify(p).includes('synthetic.oauth.jwt'),false);
});
