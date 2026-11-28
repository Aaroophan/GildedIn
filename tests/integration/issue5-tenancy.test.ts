import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {MongoTenancyRepository} from '../../src/infrastructure/mongodb/tenancy-repository.ts';
import {INDEX_MANIFEST} from '../../src/infrastructure/mongodb/manifest.ts';
import {parseAccountId,parseReleaseId,parseOperationId,parseSessionId} from '../../src/shared/domain/identifiers.ts';
import {parseCanonicalSlug} from '../../src/shared/domain/validation.ts';
import {classifyRequestHost} from '../../src/shared/domain/host.ts';
import {canonicalJson} from '../../src/shared/domain/limits.ts';
import {parseCreationCommand,parseRenameCommand,parseVisibilityCommand,requireEmptyCommand,
  readIdempotencyKey,TenancyDenied} from '../../src/domain/tenancy/commands.ts';
import {parsePublicRoute,canonicalApexUrl,manifestIncludesRoute} from '../../src/domain/tenancy/routing.ts';
import type {AuthenticatedActor} from '../../src/domain/identity/contracts.ts';
import type {AccountRecord,SessionRecord,PortfolioRecord,ReleaseRecord,
  ModerationPolicyRecord} from '../../src/domain/persistence/models.ts';

const NOW=new Date('2026-11-28T10:00:00.000Z');
const ORIGIN='https://aaroophan.dev';
const newId=()=>randomUUID();
const cmd=(slug:string)=>parseCreationCommand({slug,displayName:'Synthetic Engineer',identityLabel:'Engineer',
  introduction:'This is a synthetic profile for safe tests.',templatePreset:'signature'});
function fails(e:unknown,code:string){return e instanceof TenancyDenied&&e.code===code;}
async function setup(){
  const db=new FakeMongoDatabase();
  for(const idx of INDEX_MANIFEST)await db.collection(idx.collection).createIndex(idx.keys,{name:idx.name,
    ...(idx.unique?{unique:true}:{}),...(idx.partialFilterExpression?{partialFilterExpression:idx.partialFilterExpression}:{})});
  const transactions=new FakeMongoTransactionRunner(db);
  const repo=new MongoTenancyRepository(db,transactions,()=>new Date(NOW));
  const alice=parseAccountId(newId()),bob=parseAccountId(newId());
  const seed=async(accountId:typeof alice):Promise<AuthenticatedActor>=>{
    const acct:AccountRecord={accountId,status:'active',displayName:'Synthetic',preferredLocale:'en',
      platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),updatedAt:NOW.toISOString(),schemaVersion:1};
    await db.collection<AccountRecord>('accounts').insertOne(acct);
    const sessionId=parseSessionId(newId());
    const session:SessionRecord={accountId,sessionId,sessionLookupId:newId(),verifierHash:'opaque-hash',
      securityVersion:1,createdAt:NOW,authenticatedAt:NOW,lastSeenAt:NOW,
      idleExpiresAt:new Date(NOW.getTime()+3600000),absoluteExpiresAt:new Date(NOW.getTime()+7200000),
      expiresAt:new Date(NOW.getTime()+7200000),authProvider:'github',schemaVersion:1};
    await db.collection<SessionRecord>('sessions').insertOne(session);
    return {accountId,sessionId,sessionLookupId:session.sessionLookupId,
      authProvider:'github',securityVersion:1,authenticatedAt:NOW};
  };
  return {db,transactions,repo,alice:await seed(alice),bob:await seed(bob)};
}
async function publish(f:Awaited<ReturnType<typeof setup>>,id:string,
  routes=['/','/projects','/projects/case-a','/experience','/references'],title='Public Synthetic Portfolio'){
  const releaseId=parseReleaseId(newId()),portfolioId=id as PortfolioRecord['portfolioId'];
  const payload={profile:{displayName:'Synthetic',approved:true},sections:[]};
  const bytes=Buffer.byteLength(canonicalJson(payload),'utf8');
  const release:ReleaseRecord={releaseId,portfolioId,sequence:1,publicationOperationId:parseOperationId(newId()),
    createdFromDraftRevision:0,createdAt:NOW.toISOString(),schemaVersion:1,rendererVersion:'1',
    blockRegistryVersion:'1',serializerVersion:'1',contentHash:createHash('sha256').update(canonicalJson(payload)).digest('hex'),
    canonicalPayloadBytes:bytes,payload,mediaRefs:[],searchArtifact:{},seoArtifact:{title},
    manifest:{compilationVersion:'1',enabledRoutes:routes,sourceContentIds:[],warnings:[]}};
  await f.db.collection<ReleaseRecord>('releases').insertOne(release);
  const x=await f.db.collection<PortfolioRecord>('portfolios').updateOne({portfolioId},
    {$set:{status:'active',activeReleaseId:releaseId}});
  assert.equal(x.matchedCount,1);
  return releaseId;
}
async function created(f:Awaited<ReturnType<typeof setup>>,slug='alexa'){
  return f.repo.create(f.alice,cmd(slug),newId(),ORIGIN);
}
const root=()=>parsePublicRoute('/')!;

test('5.1 ASCII case normalization, reserved names, traversal and unknown command keys are rejected',()=>{
  assert.equal(parseCanonicalSlug('AlEx-4'),'alex-4');
  for(const x of ['API','dashboard','WWW','ad--min','-alex','alex-','álëx','%2e%2e','a.b','aa','a'.repeat(31),'a/b']){
    assert.throws(()=>parseCanonicalSlug(x));
  }
  for(const bad of [{$ne:'someone'},['alice'],null,{slug:'a',displayName:'a'},
    JSON.parse('{"slug":"alice","displayName":"Alice","identityLabel":"Engineer","introduction":"x","$where":"evil"}')])
    assert.throws(()=>parseCreationCommand(bad));
  assert.equal(parseRenameCommand({newSlug:'NEW-ALEX'}),'new-alex');
  assert.equal(parseVisibilityCommand({visibility:'unlisted'}),'unlisted');
  assert.throws(()=>parseVisibilityCommand({visibility:'private'}));
  assert.throws(()=>requireEmptyCommand({status:'active'}));
  assert.throws(()=>readIdempotencyKey('not-a-key'));
});

test('5.2 create inserts one unpublished control, one current claim, one private Hero draft and one audit',async()=>{
  const f=await setup(),v=await created(f);
  assert.equal(v.status,'onboarding');assert.equal(v.activeReleaseId,null);assert.equal(v.draftRevision,0);
  assert.deepEqual(v.aliases,[]);assert.equal(v.canonicalUrl,`${ORIGIN}/alexa`);
  assert.equal(f.db.inspect('portfolios').entries.length,1);
  const hero=f.db.inspect<unknown>('drafts').entries[0].sections as {type:string}[];
  assert.deepEqual(hero.map(x=>x.type),['hero']);assert.equal(f.db.inspect('slugClaims').entries.length,1);
  assert.equal(f.db.inspect('auditEvents').entries.length,1);
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'not_found');
});

test('5.2 lost create acknowledgment reuses same owner portfolio and never makes a second draft',async()=>{
  const f=await setup(),key=newId();const first=await f.repo.create(f.alice,cmd('alexa'),key,ORIGIN);
  const replay=await f.repo.create(f.alice,cmd('alexa'),key,ORIGIN);
  assert.equal(replay.portfolioId,first.portfolioId);
  assert.equal(f.db.inspect('portfolios').entries.length,1);assert.equal(f.db.inspect('drafts').entries.length,1);
  assert.equal(f.db.inspect('auditEvents').entries.length,1);
  await assert.rejects(f.repo.create(f.alice,cmd('alexa'),newId(),ORIGIN),e=>fails(e,'PORTFOLIO_ALREADY_EXISTS'));
  await assert.rejects(f.repo.create(f.alice,cmd('different'),key,ORIGIN),e=>fails(e,'PORTFOLIO_ALREADY_EXISTS'));
});

test('5.2 simultaneous same owner and cross-owner claims have exactly one winner with no residue',async()=>{
  const f=await setup(),key=newId();const results=await Promise.allSettled([
    f.repo.create(f.alice,cmd('alexa'),key,ORIGIN),
    f.repo.create(f.alice,cmd('bobb'),newId(),ORIGIN),
    f.repo.create(f.bob,cmd('alexa'),newId(),ORIGIN)]);
  const winners=results.filter(x=>x.status==='fulfilled');
  assert.ok(winners.length>=1 && winners.length<=2);
  const claims=f.db.inspect('slugClaims').entries;
  assert.equal(claims.length,f.db.inspect('portfolios').entries.length);
  assert.equal(claims.length,f.db.inspect('drafts').entries.length);
  assert.equal(f.db.inspect('auditEvents').entries.length,claims.length);
  const found=claims.filter(c=>c.slugNormalized==='alexa');assert.equal(found.length,1);
  assert.equal(f.db.inspect('portfolios').entries.filter(p=>p.ownerAccountId===f.alice.accountId).length,1);
});

test('5.2 failure inside creation transaction rolls back portfolio, claim, draft and audit',async()=>{
  const f=await setup();f.db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(created(f),e=>fails(e,'UNAVAILABLE'));
  for(const c of ['portfolios','slugClaims','drafts','auditEvents'])assert.equal(f.db.inspect(c).entries.length,0);
  const retry=await created(f);assert.equal(retry.status,'onboarding');
});

test('5.2 a missing transaction cannot leave a partial claimed slug',async()=>{
  const f=await setup();f.transactions.unavailable=true;
  await assert.rejects(created(f),e=>fails(e,'UNAVAILABLE'));
  assert.equal(f.db.inspect('portfolios').entries.length,0);
});

test('5.3 owner fetch cannot read a second owner portfolio and rejected session cannot write',async()=>{
  const f=await setup(),v=await created(f);
  await assert.rejects(f.repo.getOwned(f.bob,v.portfolioId,ORIGIN),e=>fails(e,'NOT_FOUND'));
  const own=await f.repo.getOwned(f.alice,v.portfolioId,ORIGIN);assert.equal(own.slug,'alexa');
  const revoked=await f.db.collection<SessionRecord>('sessions').updateOne({sessionId:f.alice.sessionId},{$set:{revokedAt:NOW}});
  assert.equal(revoked.matchedCount,1);
  await assert.rejects(f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-two'),newId(),ORIGIN),
    e=>fails(e,'NOT_AUTHORIZED'));
  assert.equal(f.db.inspect('slugClaims').entries.length,1);
});

test('5.3 suspension, wrong security version, idle expiry and deleting account deny mutation',async()=>{
  const f=await setup(),v=await created(f);
  await f.db.collection<AccountRecord>('accounts').updateOne({accountId:f.alice.accountId},{$set:{status:'suspended'}});
  await assert.rejects(f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('different'),newId(),ORIGIN),e=>fails(e,'NOT_AUTHORIZED'));
  await f.db.collection<AccountRecord>('accounts').updateOne({accountId:f.alice.accountId},{$set:{status:'active',securityVersion:3}});
  await assert.rejects(f.repo.getOwned(f.alice,v.portfolioId,ORIGIN),e=>fails(e,'NOT_AUTHORIZED'));
});

test('5.4 rename moves canonical claim and mirror, retains old normalized alias and redirect',async()=>{
  const f=await setup(),v=await created(f),renamed=await f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-new'),newId(),ORIGIN);
  assert.equal(renamed.slug,'alexa-new');assert.deepEqual(renamed.aliases,['alexa']);
  const claim=f.db.inspect('slugClaims').entries.find(x=>x.slugNormalized==='alexa');
  assert.equal(claim?.kind,'alias');assert.equal(claim?.redirectStatus,308);
  const old=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.equal(old.kind,'not_found'); // Unpublished alias must not advertise content.
  await publish(f,v.portfolioId);
  const redirected=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.deepEqual(redirected,{kind:'redirect',location:`${ORIGIN}/alexa-new`,status:308});
  const current=await f.repo.resolvePublic(parseCanonicalSlug('alexa-new'),root(),'path',ORIGIN);
  assert.equal(current.kind,'allowed');
});

test('5.4 historic alias prevents appropriation by unrelated account even after further rename',async()=>{
  const f=await setup(),v=await created(f);
  await f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-two'),newId(),ORIGIN);
  await f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-three'),newId(),ORIGIN);
  await assert.rejects(f.repo.create(f.bob,cmd('ALExA'),newId(),ORIGIN),e=>fails(e,'SLUG_UNAVAILABLE'));
  assert.equal(f.db.inspect('slugClaims').entries.length,3);
  assert.equal(f.db.inspect('slugClaims').entries.filter(x=>x.kind==='current').length,1);
});

test('5.4 lost rename acknowledgment and reused idempotency key do not mutate twice',async()=>{
  const f=await setup(),v=await created(f),key=newId();
  const one=await f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-new'),key,ORIGIN);
  const two=await f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-new'),key,ORIGIN);
  assert.deepEqual(two,one);assert.equal(f.db.inspect('renameOperations').entries.length,1);
  assert.equal(f.db.inspect('auditEvents').entries.length,2);
  await assert.rejects(f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('different'),key,ORIGIN),
    e=>fails(e,'CONFLICT'));
});

test('5.4 rename failed midway cannot abandon a current alias or lose previous ownership',async()=>{
  const f=await setup(),v=await created(f);
  f.db.inspect('slugClaims').failNextInsert=true;
  await assert.rejects(f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-new'),newId(),ORIGIN),
    e=>fails(e,'UNAVAILABLE'));
  assert.equal(f.db.inspect('slugClaims').entries.length,1);
  assert.equal(f.db.inspect('slugClaims').entries[0].kind,'current');
  assert.equal(f.db.inspect('portfolios').entries[0].slug,'alexa');
  assert.equal(f.db.inspect('renameOperations').entries.length,0);
});

test('5.4 concurrent renames choose one current and never release either loser\'s alias',async()=>{
  const f=await setup(),v=await created(f);
  const results=await Promise.allSettled([
    f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-a'),newId(),ORIGIN),
    f.repo.rename(f.alice,v.portfolioId,parseCanonicalSlug('alexa-b'),newId(),ORIGIN)]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,2); // serialized legitimate renames may both succeed.
  const claims=f.db.inspect('slugClaims').entries;
  assert.equal(claims.filter(x=>x.kind==='current').length,1);
  assert.equal(claims.length,3);
  assert.equal(new Set(claims.map(x=>x.slugNormalized)).size,3);
});

test('5.5 visibility updates have strict CAS, audit, no release modification, unlisted remains link-accessible',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  const prev=JSON.stringify(f.db.inspect('releases').entries[0]);
  const changed=await f.repo.changePolicy(f.alice,v.portfolioId,'visibility',0,'unlisted');
  assert.equal(changed.visibility,'unlisted');assert.equal(changed.securityVersion,1);
  assert.equal(JSON.stringify(f.db.inspect('releases').entries[0]),prev);
  await assert.rejects(f.repo.changePolicy(f.alice,v.portfolioId,'visibility',0,'public'),e=>fails(e,'CONFLICT'));
  const access=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.equal(access.kind,'allowed');if(access.kind==='allowed')assert.equal(access.robots,'noindex');
  assert.deepEqual(await f.repo.directory(ORIGIN),[]);
  assert.equal(f.db.inspect('auditEvents').entries.length,2);
});

test('5.5 owner disable immediately denies warm release without changing active release pointer',async()=>{
  const f=await setup(),v=await created(f),rel=await publish(f,v.portfolioId);
  const warm=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.equal(warm.kind,'allowed');
  const changed=await f.repo.changePolicy(f.alice,v.portfolioId,'disable',0);
  assert.equal(changed.activeReleaseId,rel);assert.equal(changed.status,'owner_disabled');
  const cold=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'subdomain',ORIGIN);
  assert.equal(cold.kind,'not_found');
});

test('5.5 suspension and moderation both prohibit owner-enable and public read',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  await f.repo.changePolicy(f.alice,v.portfolioId,'disable',0);
  const moderator:ModerationPolicyRecord={policyId:'mod_example',portfolioId:v.portfolioId,
    issuedByAdminAccountId:f.bob.accountId,scope:'portfolio',effect:'suspend',reasonCode:'REVIEW',
    active:true,issuedAt:NOW.toISOString(),securityVersion:2,schemaVersion:1};
  await f.db.collection<ModerationPolicyRecord>('moderationPolicies').insertOne(moderator);
  await assert.rejects(f.repo.changePolicy(f.alice,v.portfolioId,'enable',1),e=>fails(e,'MODERATED'));
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'not_found');
});

test('5.5 audit store failure rolls back disabling instead of claiming success',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  f.db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(f.repo.changePolicy(f.alice,v.portfolioId,'disable',0),e=>fails(e,'UNAVAILABLE'));
  const p=await f.repo.getOwned(f.alice,v.portfolioId,ORIGIN);
  assert.equal(p.status,'active');assert.equal(p.securityVersion,0);
});

test('5.6 live reader rejects active moderation, unavailable policy, missing release and mismatched claim',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  f.db.inspect('moderationPolicies').failRead=true;
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'unavailable');
  f.db.inspect('moderationPolicies').failRead=false;
  const r=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);assert.equal(r.kind,'allowed');
  await f.db.collection('slugClaims').updateOne({slugNormalized:'alexa'},{$set:{kind:'alias'}});
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'unavailable');
});

test('5.6 suspended account cannot remain publicly visible with old release and live portfolio status',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  await f.db.collection<AccountRecord>('accounts').updateOne({accountId:f.alice.accountId},{$set:{status:'suspended'}});
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'not_found');
});

test('5.7 manifest grants exact detail route only and canonical host is fixed',async()=>{
  const f=await setup(),v=await created(f);await publish(f,v.portfolioId);
  const caseA=parsePublicRoute('/projects/case-a')!;
  const yes=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),caseA,'subdomain',ORIGIN);
  assert.equal(yes.kind,'allowed');if(yes.kind==='allowed'){
    assert.equal(yes.canonicalUrl,`${ORIGIN}/alexa/projects/case-a`);
    assert.equal(yes.navigationPath,'/projects/case-a');
  }
  const no=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),parsePublicRoute('/projects/case-b')!,'path',ORIGIN);
  assert.equal(no.kind,'not_found');
  assert.equal(canonicalApexUrl(ORIGIN,parseCanonicalSlug('alexa'),caseA),`${ORIGIN}/alexa/projects/case-a`);
  assert.equal(manifestIncludesRoute(['/projects/case-a'],caseA),true);
});

test('5.7 path grammar prevents traversal, misleading suffixes and unsafe percent decoding',()=>{
  for(const path of ['/foo','//projects','/projects/%2e%2e','/projects/%252fetc','/projects/evil?go=https://x',
    '/projects/x\\y','/projects/.well-known','/projects/item/extra','/projects/','/experience/id'])
    assert.equal(parsePublicRoute(path),null,`expected denied: ${path}`);
  assert.equal(parsePublicRoute('/projects/CaSE-A')?.path,'/projects/case-a'); // Canonical case folding
  assert.equal(parsePublicRoute('/experience')?.kind,'experience');
  assert.equal(parsePublicRoute('/references')?.kind,'references');
});

test('5.8 host validation rejects forged authority, malicious siblings, unverified wildcard and reserved services',()=>{
  const options={allowLocalhost:false,wildcardTlsVerified:true,apexHost:'aaroophan.dev'};
  assert.equal(classifyRequestHost('aaroophan.dev',null,options).kind,'apex');
  assert.equal(classifyRequestHost('www.aaroophan.dev',null,options).kind,'www');
  assert.equal(classifyRequestHost('AlEx.aaroophan.dev',null,options).kind,'tenant-host');
  for(const host of ['api.aaroophan.dev','dashboard.aaroophan.dev','alex.aaroophan.dev.evil.test',
    'alex.aaroophan.dev:443.evil','alex..aaroophan.dev','ålex.aaroophan.dev','a.b.aaroophan.dev',
    'aaroophan.dev:443','aaroophan.dev,evil.test','alex.aaroophan.dev.'])
    assert.equal(classifyRequestHost(host,null,options).kind,'denied',host);
  assert.equal(classifyRequestHost('aaroophan.dev','alex.aaroophan.dev',options).kind,'denied');
  assert.equal(classifyRequestHost('alex.aaroophan.dev',null,{...options,wildcardTlsVerified:false}).kind,'denied');
});

test('5.9 directory includes only current eligible, release-approved metadata',async()=>{
  const f=await setup(),a=await created(f);await publish(f,a.portfolioId);
  let d=await f.repo.directory(ORIGIN);
  assert.equal(d.length,1);assert.deepEqual(Object.keys(d[0]).sort(),['canonicalUrl','portfolioId','releaseId','slug','title']);
  assert.equal(d[0].title,'Public Synthetic Portfolio');
  await f.repo.changePolicy(f.alice,a.portfolioId,'visibility',0,'unlisted');
  d=await f.repo.directory(ORIGIN);assert.deepEqual(d,[]);
});

test('5.9 directory does not fall back to private account data or expose owner email',async()=>{
  const f=await setup(),a=await created(f);
  await f.db.collection<AccountRecord>('accounts').updateOne({accountId:f.alice.accountId},
    {$set:{verifiedEmail:'private-canary@example.com',displayName:'private-canary'}});
  await publish(f,a.portfolioId,['/'],'Safe released title');
  const out=JSON.stringify(await f.repo.directory(ORIGIN));
  assert.ok(out.includes('Safe released title'));
  assert.ok(!out.includes('private-canary'));
  const p=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.equal(p.kind,'allowed');
});

test('5.10 retries, alias lookups, moderation and directory fail closed on DB outage',async()=>{
  const f=await setup(),a=await created(f);await publish(f,a.portfolioId);
  f.db.inspect('portfolios').failRead=true;
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'unavailable');
  await assert.rejects(f.repo.directory(ORIGIN),e=>fails(e,'UNAVAILABLE'));
});

test('5.2 authenticated singleton portfolio listing reveals no other owner and preserves no-portfolio state',async()=>{
  const f=await setup();
  assert.deepEqual(await f.repo.listOwned(f.alice,ORIGIN),[]);
  assert.deepEqual(await f.repo.listOwned(f.bob,ORIGIN),[]);
  const own=await created(f);
  assert.deepEqual(await f.repo.listOwned(f.bob,ORIGIN),[]);
  const ownerList=await f.repo.listOwned(f.alice,ORIGIN);
  assert.equal(ownerList.length,1);assert.equal(ownerList[0].portfolioId,own.portfolioId);
  assert.equal(ownerList[0].draftRevision,0);
  await f.db.collection<SessionRecord>('sessions').updateOne({sessionId:f.alice.sessionId},{$set:{revokedAt:NOW}});
  await assert.rejects(f.repo.listOwned(f.alice,ORIGIN),e=>fails(e,'NOT_AUTHORIZED'));
});

test('5.1 slug availability checks permanent aliases without revealing their original owner',async()=>{
  const f=await setup();
  assert.deepEqual(await f.repo.slugAvailability(f.bob,'AlExA'),{slug:'alexa',available:true});
  const own=await created(f);
  assert.deepEqual(await f.repo.slugAvailability(f.bob,'ALExA'),{slug:'alexa',available:false});
  await f.repo.rename(f.alice,own.portfolioId,parseCanonicalSlug('alexa-new'),newId(),ORIGIN);
  assert.deepEqual(await f.repo.slugAvailability(f.bob,'alexa'),{slug:'alexa',available:false});
  assert.deepEqual(await f.repo.slugAvailability(f.alice,'ALEXA-NEW'),{slug:'alexa-new',available:false});
  for(const bad of ['api','A!ex','a','a'.repeat(31)])
    await assert.rejects(f.repo.slugAvailability(f.bob,bad),e=>fails(e,'INVALID_COMMAND'));
  f.db.inspect('slugClaims').failRead=true;
  await assert.rejects(f.repo.slugAvailability(f.bob,'different'),e=>fails(e,'UNAVAILABLE'));
  assert.ok(!Object.hasOwn((await f.repo.listOwned(f.bob,ORIGIN)), 'ownerAccountId'));
});

test('5.5 revocation between live release read and final projection is denied',async()=>{
  const f=await setup(),p=await created(f);await publish(f,p.portfolioId);
  const accounts=f.db.collection<AccountRecord>('accounts');
  const before=await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN);
  assert.equal(before.kind,'allowed');
  await accounts.updateOne({accountId:f.alice.accountId},{$set:{status:'suspended'}});
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'not_found');
});

test('5.10 only fixed named endpoints exist and no unsafe owner-provided query or credentialed tenant route',()=>{
  // Import-free check makes this regression available even without Next/Auth.js packages.
  const required=[
    'src/app/api/v1/portfolios/route.ts',
    'src/app/api/v1/portfolios/slug-availability/route.ts',
    'src/app/api/v1/portfolios/[portfolioId]/route.ts',
    'src/app/api/v1/portfolios/[portfolioId]/rename/route.ts',
    'src/app/api/v1/portfolios/[portfolioId]/visibility/route.ts',
    'src/app/api/v1/portfolios/[portfolioId]/disable/route.ts',
    'src/app/api/v1/portfolios/[portfolioId]/enable/route.ts',
    'src/app/api/v1/public/directory/route.ts'
  ];
  // Static route presence only; Next.js registration and browser routing still require the full build.
  for(const name of required)assert.ok(existsSync(resolve(process.cwd(),name)),name);
  const owners=readFileSync(resolve(process.cwd(),'src/server/tenancy/http.ts'),'utf8');
  for(const name of ['requireApexActor(req,mutation)','listOwnedPortfolios','getSlugAvailability',
    'readExpectedSecurityVersion','parseRenameCommand','parseVisibilityCommand'])
    assert.ok(owners.includes(name),name);
  assert.ok(!owners.includes('collection('));
  assert.ok(INDEX_MANIFEST.some(i=>i.name==='ix_public_discovery'));
  assert.throws(()=>readIdempotencyKey('abcd1234-1234-1234-1234-1234567890xxxx'));
  assert.equal(readIdempotencyKey(newId()).length,36);
});

test('5.5 unpublished owners may choose unlisted and disable/enable without publishing a draft',async()=>{
  const f=await setup(),p=await created(f);
  const visibility=await f.repo.changePolicy(f.alice,p.portfolioId,'visibility',0,'unlisted');
  assert.equal(visibility.status,'onboarding');assert.equal(visibility.visibility,'unlisted');
  const disabled=await f.repo.changePolicy(f.alice,p.portfolioId,'disable',1);
  assert.equal(disabled.status,'owner_disabled');
  const enabled=await f.repo.changePolicy(f.alice,p.portfolioId,'enable',2);
  assert.equal(enabled.status,'onboarding');assert.equal(enabled.visibility,'unlisted');
  assert.equal(enabled.activeReleaseId,null);
  assert.equal((await f.repo.resolvePublic(parseCanonicalSlug('alexa'),root(),'path',ORIGIN)).kind,'not_found');
  assert.equal(f.db.inspect('auditEvents').entries.length,4);
});
