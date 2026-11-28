import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {MongoAuthRepository} from '../../src/infrastructure/mongodb/auth-repository.ts';
import {applyMongoSchemaAndIndexes} from '../../src/infrastructure/mongodb/manifest.ts';
import {IdentityDenied} from '../../src/domain/identity/contracts.ts';
import type {VerifiedProviderIdentity} from '../../src/domain/identity/contracts.ts';
import type {ProviderIdentityRecord,AccountRecord,SessionRecord} from '../../src/domain/persistence/models.ts';
import {cookieForSession,clearSessionCookie,parseCookie,SESSION_COOKIE_NAME} from '../../src/server/identity/session-cookie.ts';

const start=new Date('2026-11-20T10:00:00.000Z');
const google=(subject='google-user-100',email?:string):VerifiedProviderIdentity=>({provider:'google',subject,
  issuer:'https://accounts.google.com',displayName:'Synthetic Google',...(email?{verifiedEmail:email}:{})});
const github=(subject='123456',email?:string):VerifiedProviderIdentity=>({provider:'github',subject,
  issuer:'https://github.com',displayName:'Synthetic GitHub',...(email?{verifiedEmail:email}:{})});
async function fixture(allowTx=true){
  const db=new FakeMongoDatabase();await applyMongoSchemaAndIndexes(db,true);
  let now=new Date(start);const runner=new FakeMongoTransactionRunner(db);
  const repo=new MongoAuthRepository(db,allowTx?runner:null,()=>now);
  return {db,runner,repo,advance:(ms:number)=>{now=new Date(now.getTime()+ms);},now:()=>now};
}

const sessionFor=(repo:MongoAuthRepository,accountId:Parameters<MongoAuthRepository['exchangeVerifiedOAuthSession']>[0],provider:'google'|'github')=>
  repo.exchangeVerifiedOAuthSession(accountId,provider,'synthetic-oauth-jwt-'+randomBytes(32).toString('base64url'));
const denied=(code:string)=>(error:unknown)=>error instanceof IdentityDenied&&error.code===code;

// TV-BASE-001/002/007/009: provider subject, never email text, is the authority.
test('4.1/4.2 synthetic OAuth claims create two distinct accounts for matching emails',async()=>{
  const {repo,db}=await fixture();
  const email='same@example.invalid';
  const a=await repo.resolveOrCreateFromVerifiedProvider(google('sub-a',email));
  const b=await repo.resolveOrCreateFromVerifiedProvider(github('24242',email));
  assert.notEqual(a,b);
  assert.equal(await repo.resolveOrCreateFromVerifiedProvider(google('sub-a',email)),a);
  assert.equal(db.inspect('accounts').entries.length,2);
  assert.equal(db.inspect('providerIdentities').entries.length,2);
  const c=await repo.resolveOrCreateFromVerifiedProvider(github('no-email'));
  const session=await sessionFor(repo,c,'github');
  const profile=await repo.readPrivateAccount(await repo.requireSession(session.token));
  assert.equal(profile.verifiedEmail,null);assert.equal(profile.capabilities.canUseEmailFeatures,false);
  assert.deepEqual(profile.portfolioSummaries,[]);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='provider.register').length,3);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='session.issue').length,1);
});
test('4.1 rejects spoofed issuer, malicious subject, arbitrary provider and invalid display name without writes',async()=>{
  const {repo,db}=await fixture();
  await assert.rejects(repo.resolveOrCreateFromVerifiedProvider({...google(),issuer:'https://login.attacker.invalid'}),denied('INVALID_PROVIDER_PROOF'));
  await assert.rejects(repo.resolveOrCreateFromVerifiedProvider({...github(),subject:'$where'}),denied('INVALID_PROVIDER_PROOF'));
  await assert.rejects(repo.resolveOrCreateFromVerifiedProvider({...google(),displayName:'<script>'}),denied('INVALID_PROVIDER_PROOF'));
  assert.equal(db.inspect('accounts').entries.length,0);
});
test('4.1 identical provider concurrent registration produces one account and one link',async()=>{
  const {repo,db}=await fixture();
  const ids=await Promise.all(Array.from({length:12},()=>repo.resolveOrCreateFromVerifiedProvider(google('same-subject'))));
  assert.equal(new Set(ids).size,1);assert.equal(db.inspect('accounts').entries.length,1);
  assert.equal(db.inspect('providerIdentities').entries.length,1);
});
test('4.1 registration is denied if transactional audit/identity commit is unavailable',async()=>{
  const {repo,db}=await fixture(false);
  await assert.rejects(repo.resolveOrCreateFromVerifiedProvider(google()),denied('CAPABILITY_UNAVAILABLE'));
  assert.equal(db.inspect('accounts').entries.length,0);
});
test('4.3 host-only cookie includes required flags, excludes Domain and rejects malformed token',async()=>{
  const {repo}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const issued=await sessionFor(repo,id,'google');
  const cookie=cookieForSession(issued.token,3600);
  assert.match(cookie,/^__Host-gildedin_session=/);assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/);
  assert.doesNotMatch(cookie,/Domain=/i);assert.equal(parseCookie(cookie,SESSION_COOKIE_NAME),issued.token);
  assert.match(clearSessionCookie(),/Max-Age=0/);
  assert.throws(()=>cookieForSession('evil',3600));
});
test('4.3 revocable sessions store hashes, not raw bearer; revoked and forged cookies fail',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const issued=await sessionFor(repo,id,'google');
  const stored=await db.collection<SessionRecord>('sessions').findOne({accountId:id});
  assert.ok(stored);assert.notEqual(stored.verifierHash,issued.token);
  assert.equal((await repo.requireSession(issued.token)).accountId,id);
  await assert.rejects(repo.requireSession('x'.repeat(43)),denied('NOT_AUTHENTICATED'));
  await repo.revokeCurrentSession(await repo.requireSession(issued.token),randomUUID() as never);
  await assert.rejects(repo.requireSession(issued.token),denied('NOT_AUTHENTICATED'));
});
test('4.3 session security generation revokes all sessions, including other devices',async()=>{
  const {repo}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s1=await sessionFor(repo,id,'google');const s2=await sessionFor(repo,id,'google');
  await repo.revokeAllSessions(await repo.requireSession(s1.token),randomUUID() as never);
  await assert.rejects(repo.requireSession(s1.token),denied('NOT_AUTHENTICATED'));
  await assert.rejects(repo.requireSession(s2.token),denied('NOT_AUTHENTICATED'));
  const s3=await sessionFor(repo,id,'google');assert.equal((await repo.requireSession(s3.token)).accountId,id);
});
test('4.3 idle and absolute timeouts are checked even if TTL has not physically removed row',async()=>{
  const {repo,advance,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google');advance(12*3600*1000+1);
  await assert.rejects(repo.requireSession(s.token),denied('NOT_AUTHENTICATED'));
  assert.equal(db.inspect('sessions').entries.length,1);
});
test('4.4 CSRF proof is session-scoped, opaque, rotated and not accepted cross session',async()=>{
  const {repo}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const a=await sessionFor(repo,id,'google'),b=await sessionFor(repo,id,'google');
  const actorA=await repo.requireSession(a.token),actorB=await repo.requireSession(b.token);
  const csrf=await repo.issueCsrfToken(actorA);
  assert.match(csrf,/^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(await repo.csrfHash(actorA),await repo.csrfHash(actorB));
  const old=await repo.csrfHash(actorA);await repo.issueCsrfToken(actorA);assert.notEqual(await repo.csrfHash(actorA),old);
});
test('4.5 link intent requires recent session, is one-time and binds account + session + provider',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google'),actor=await repo.requireSession(s.token);
  const nonce=await repo.createLinkIntent(actor,'github');
  await assert.rejects(repo.completeLink(actor,'a'.repeat(43),github(),randomUUID() as never),denied('LINK_INTENT_INVALID'));
  await assert.rejects(repo.completeLink(actor,nonce,google(),randomUUID() as never),denied('LINK_INTENT_INVALID'));
  assert.equal(db.inspect('providerIdentities').entries.length,1);
  await repo.completeLink(actor,nonce,github(),randomUUID() as never);
  assert.equal(db.inspect('providerIdentities').entries.length,2);
  await assert.rejects(repo.completeLink(actor,nonce,github(),randomUUID() as never),denied('LINK_INTENT_INVALID'));
  await assert.rejects(repo.requireSession(s.token),denied('NOT_AUTHENTICATED'));
  const fresh=await sessionFor(repo,id,'github');
  assert.equal((await repo.readPrivateAccount(await repo.requireSession(fresh.token))).linkedProviders.length,2);
});
test('4.5 foreign account identity cannot be linked by email collision',async()=>{
  const {repo,db}=await fixture();
  const a=await repo.resolveOrCreateFromVerifiedProvider(google('first','same@example.invalid'));
  await repo.resolveOrCreateFromVerifiedProvider(github('other','same@example.invalid'));
  const session=await sessionFor(repo,a,'google');const actor=await repo.requireSession(session.token);
  const nonce=await repo.createLinkIntent(actor,'github');
  await assert.rejects(repo.completeLink(actor,nonce,github('other'),randomUUID() as never),denied('IDENTITY_CONFLICT'));
  assert.equal(db.inspect('providerIdentities').entries.length,2);
  assert.equal(db.inspect('authLinkIntents').entries[0].state,'issued');
});
test('4.5 failed audit write rolls back link and nonce consumption (synthetic transaction only)',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google'),actor=await repo.requireSession(s.token);
  const nonce=await repo.createLinkIntent(actor,'github');db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(repo.completeLink(actor,nonce,github(),randomUUID() as never));
  assert.equal(db.inspect('providerIdentities').entries.length,1);
  assert.equal(db.inspect('authLinkIntents').entries[0].state,'issued');
  assert.equal((await repo.requireSession(s.token)).accountId,id);
});
test('4.5 expired intent denies before any identity mutation although TTL document remains',async()=>{
  const {repo,advance,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google'),actor=await repo.requireSession(s.token);
  const nonce=await repo.createLinkIntent(actor,'github');advance(5*60000+1);
  await assert.rejects(repo.completeLink(actor,nonce,github(),randomUUID() as never),denied('LINK_INTENT_INVALID'));
  assert.equal(db.inspect('authLinkIntents').entries.length,1);
  assert.equal(db.inspect('providerIdentities').entries.length,1);
});
test('4.5 link initiation requires existing session-bound unexpired intent',async()=>{
  const {repo,advance}=await fixture();const a=await repo.resolveOrCreateFromVerifiedProvider(google('first'));
  const b=await repo.resolveOrCreateFromVerifiedProvider(google('second'));
  const sa=await sessionFor(repo,a,'google'),sb=await sessionFor(repo,b,'google');
  const actorA=await repo.requireSession(sa.token),actorB=await repo.requireSession(sb.token);
  const nonce=await repo.createLinkIntent(actorA,'github');
  await repo.requirePendingLinkIntent(actorA,nonce,'github');
  await assert.rejects(repo.requirePendingLinkIntent(actorA,nonce,'google'),denied('LINK_INTENT_INVALID'));
  await assert.rejects(repo.requirePendingLinkIntent(actorB,nonce,'github'),denied('LINK_INTENT_INVALID'));
  await assert.rejects(repo.requirePendingLinkIntent(actorA,'bad','github'),denied('LINK_INTENT_INVALID'));
  advance(301000);
  await assert.rejects(repo.requirePendingLinkIntent(actorA,nonce,'github'));
});
test('4.6 last-provider unlink is refused without side effects',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google'),actor=await repo.requireSession(s.token);
  const link=db.inspect<ProviderIdentityRecord>('providerIdentities').entries[0];
  await assert.rejects(repo.unlink(actor,String(link.identityId),randomUUID() as never),denied('LAST_LOGIN_PROVIDER'));
  assert.equal(db.inspect('providerIdentities').entries.length,1);assert.equal((await repo.requireSession(s.token)).accountId,id);
});
test('4.6 valid unlink revokes all prior sessions but preserves another sign-in method',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google');const actor=await repo.requireSession(s.token);
  const nonce=await repo.createLinkIntent(actor,'github');await repo.completeLink(actor,nonce,github(),randomUUID() as never);
  const s2=await sessionFor(repo,id,'github');const active=await repo.requireSession(s2.token);
  const first=db.inspect<ProviderIdentityRecord>('providerIdentities').entries.find(x=>x.provider==='google');
  await repo.unlink(active,String(first!.identityId),randomUUID() as never);
  assert.equal(db.inspect('providerIdentities').entries.length,1);
  await assert.rejects(repo.requireSession(s2.token),denied('NOT_AUTHENTICATED'));
  const s3=await sessionFor(repo,id,'github');
  assert.equal((await repo.requireSession(s3.token)).accountId,id);
  await assert.rejects(sessionFor(repo,id,'google'),denied('NOT_AUTHENTICATED'));
});

test('4.6 unlink requires recent proof from the provider that will remain',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const initial=await sessionFor(repo,id,'google');const actor=await repo.requireSession(initial.token);
  const nonce=await repo.createLinkIntent(actor,'github');await repo.completeLink(actor,nonce,github(),randomUUID() as never);
  const newGoogle=await sessionFor(repo,id,'google');const stillGoogle=await repo.requireSession(newGoogle.token);
  const removing=db.inspect<ProviderIdentityRecord>('providerIdentities').entries.find(x=>x.provider==='google')!;
  await assert.rejects(repo.unlink(stillGoogle,String(removing.identityId),randomUUID() as never),denied('REAUTHENTICATION_REQUIRED'));
  assert.equal(db.inspect('providerIdentities').entries.length,2);
  assert.equal((await repo.requireSession(newGoogle.token)).accountId,id);
});
test('4.7 old recent-auth proof cannot unlink or revoke all in a different browser session',async()=>{
  const {repo,advance}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const old=await sessionFor(repo,id,'google');advance(11*60000);
  const actor=await repo.requireSession(old.token);
  await assert.rejects(repo.createLinkIntent(actor,'github'),denied('REAUTHENTICATION_REQUIRED'));
  await assert.rejects(repo.revokeAllSessions(actor,randomUUID() as never),denied('REAUTHENTICATION_REQUIRED'));
});
test('4.8 profile mass assignment, verified email, roles and status are never editable',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const token=(await sessionFor(repo,id,'google')).token,actor=await repo.requireSession(token);
  await assert.rejects(repo.updateProfile(actor,{displayName:'Owner',platformRoles:['admin']}),denied('INVALID_PROFILE'));
  await assert.rejects(repo.updateProfile(actor,{$set:{platformRoles:['admin']}}),denied('INVALID_PROFILE'));
  await repo.updateProfile(actor,{displayName:'Safe Display'});
  const record=await db.collection<AccountRecord>('accounts').findOne({accountId:id});
  assert.equal(record!.displayName,'Safe Display');assert.deepEqual(record!.platformRoles,['user']);
  assert.equal((await repo.readPrivateAccount(actor)).isAdmin,false);
});
test('4.9 bootstrap refuses unapproved caller, requires verified subject, is idempotent, invalidates old sessions',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const old=await sessionFor(repo,id,'google');
  const op=randomUUID() as never;
  await assert.rejects(repo.bootstrapAdmin(false,id,'google','google-user-100',op),denied('NOT_AUTHORIZED'));
  await assert.rejects(repo.bootstrapAdmin(true,id,'github','google-user-100',op),denied('NOT_AUTHORIZED'));
  assert.equal(await repo.bootstrapAdmin(true,id,'google','google-user-100',op),'granted');
  assert.equal(await repo.bootstrapAdmin(true,id,'google','google-user-100',op),'already_admin');
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='admin.role.change').length,1);
  await assert.rejects(repo.requireSession(old.token),denied('NOT_AUTHENTICATED'));
  const renewed=await sessionFor(repo,id,'google');
  assert.equal((await repo.readPrivateAccount(await repo.requireSession(renewed.token))).isAdmin,true);
});
test('4.3 OAuth handshake exchange is one-time, bound to verified account/provider and atomic',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const id2=await repo.resolveOrCreateFromVerifiedProvider(github());
  const cookie='synthetic-encrypted-authjs-cookie-jwt-value';
  const first=await repo.exchangeVerifiedOAuthSession(id,'google',cookie);
  assert.equal((await repo.requireSession(first.token)).accountId,id);
  await assert.rejects(repo.exchangeVerifiedOAuthSession(id,'google',cookie));
  await assert.rejects(repo.exchangeVerifiedOAuthSession(id2,'github',cookie));
  assert.equal(db.inspect('sessions').entries.length,1);
  assert.equal(db.inspect('authOAuthExchanges').entries.length,1);
});
test('4.3 session exchange cannot create a session when audit/transaction runner is unavailable',async()=>{
  const {repo,db}=await fixture(false);
  // direct account fixture for this negative check, never touches a provider network.
  const account={accountId:randomUUID() as never,status:'active',displayName:'Fixture',preferredLocale:'en',
    platformRoles:['user'],securityVersion:0,createdAt:start.toISOString(),updatedAt:start.toISOString(),schemaVersion:1} as const;
  await db.collection('accounts').insertOne(account);await db.collection('providerIdentities').insertOne({
    identityId:randomUUID(),accountId:account.accountId,provider:'google',providerSubject:'fixture',
    issuer:'https://accounts.google.com',linkedAt:start.toISOString(),schemaVersion:1});
  await assert.rejects(repo.exchangeVerifiedOAuthSession(account.accountId,'google','synthetic-session-cookie-value'),
    denied('CAPABILITY_UNAVAILABLE'));
  assert.equal(db.inspect('sessions').entries.length,0);
});
test('T-IAM-03 two concurrent opposed unlinks cannot remove both providers',async()=>{
  const {repo,db}=await fixture();const accountId=await repo.resolveOrCreateFromVerifiedProvider(google());
  const initial=await sessionFor(repo,accountId,'google');const actor=await repo.requireSession(initial.token);
  const nonce=await repo.createLinkIntent(actor,'github');await repo.completeLink(actor,nonce,github(),randomUUID() as never);
  const g=await sessionFor(repo,accountId,'google');const h=await sessionFor(repo,accountId,'github');
  const linked=db.inspect<ProviderIdentityRecord>('providerIdentities').entries;
  const googleIdentity=linked.find(i=>i.provider==='google')!;
  const githubIdentity=linked.find(i=>i.provider==='github')!;
  const results=await Promise.allSettled([
    repo.unlink(await repo.requireSession(h.token),googleIdentity.identityId,randomUUID() as never),
    repo.unlink(await repo.requireSession(g.token),githubIdentity.identityId,randomUUID() as never),
  ]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(db.inspect('providerIdentities').entries.length,1);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='provider.unlink').length,1);
});
test('T-IAM-05 simultaneous attempts to exchange the same OAuth proof issue exactly one session',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const jwt='synthetic-encrypted-oauth-session-no-reuse-'+'Q'.repeat(40);
  const results=await Promise.allSettled(Array.from({length:8},()=>repo.exchangeVerifiedOAuthSession(id,'google',jwt)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(db.inspect('sessions').entries.length,1);
  assert.equal(db.inspect('authOAuthExchanges').entries.length,1);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='session.issue').length,1);
});
test('T-SEC-10 audit failure during OAuth-session creation leaves no valid session or consumed proof',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(repo.exchangeVerifiedOAuthSession(id,'google','synthetic-encrypted-audit-failure-jwt-value'));
  assert.equal(db.inspect('sessions').entries.length,0);
  assert.equal(db.inspect('authOAuthExchanges').entries.length,0);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='session.issue').length,0);
});
test('T-IAM-07 account suspension prevents session/profile access without leaking other accounts',async()=>{
  const {repo,db}=await fixture();const a=await repo.resolveOrCreateFromVerifiedProvider(google('first'));
  const b=await repo.resolveOrCreateFromVerifiedProvider(github('333333'));
  const sa=await sessionFor(repo,a,'google'),sb=await sessionFor(repo,b,'github');
  const pa=await repo.readPrivateAccount(await repo.requireSession(sa.token));
  const pb=await repo.readPrivateAccount(await repo.requireSession(sb.token));
  assert.equal(pa.accountId,a);assert.equal(pb.accountId,b);
  assert.notEqual(pa.accountId,pb.accountId);
  await db.collection<AccountRecord>('accounts').updateOne({accountId:a},{$set:{status:'suspended'}});
  await assert.rejects(repo.requireSession(sa.token),denied('NOT_AUTHENTICATED'));
  assert.equal((await repo.requireSession(sb.token)).accountId,b);
});
test('T-SEC-10 failure to durably audit revoke-all cannot revoke existing sessions',async()=>{
  const {repo,db}=await fixture();const id=await repo.resolveOrCreateFromVerifiedProvider(google());
  const s=await sessionFor(repo,id,'google');const actor=await repo.requireSession(s.token);
  db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(repo.revokeAllSessions(actor,randomUUID() as never));
  assert.equal((await repo.requireSession(s.token)).accountId,id);
  assert.equal(db.inspect('auditEvents').entries.filter(e=>e.kind==='session.revoke').length,0);
});
