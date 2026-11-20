import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {applyMongoSchemaAndIndexes,INDEX_MANIFEST,MONGO_COLLECTIONS} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoTenantRepository,MongoPublicReleaseReader,MongoPublicationRepository,MongoPrivacyRepository}
  from '../../src/infrastructure/mongodb/repositories.ts';
import {MongoIdentityPersistence} from '../../src/infrastructure/mongodb/identity.ts';
import {MongoMediaQuotaRepository,initializeLocalMediaQuota} from '../../src/infrastructure/mongodb/quota.ts';
import {canonicalJson,PRODUCT_LIMITS} from '../../src/shared/domain/limits.ts';
import {PersistenceConflict,PersistenceUnavailable} from '../../src/infrastructure/mongodb/driver.ts';
import {parseAccountId,parsePortfolioId,parseReleaseId,parseOperationId,parseMediaId}
 from '../../src/shared/domain/identifiers.ts';
import type {VerifiedActor,VerifiedPublicPortfolio} from '../../src/domain/persistence/ports.ts';
import type {PortfolioRecord,DraftRecord,ReleaseRecord,PublishOperationRecord,MediaRecord,ContactMessageRecord,
  AnalyticsDailyRecord,AccountRecord,ProviderIdentityRecord,SlugClaimRecord} from '../../src/domain/persistence/models.ts';

const A=parseAccountId('11111111-1111-4111-8111-111111111111');
const B=parseAccountId('22222222-2222-4222-8222-222222222222');
const PA=parsePortfolioId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
const PB=parsePortfolioId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
const R=parseReleaseId('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
const OP=parseOperationId('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
const MEDIA=parseMediaId('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
const DATE='2026-11-19T00:00:00.000Z';
const NOW=new Date('2026-11-20T00:00:00.000Z');
const actor=(id=A):VerifiedActor=>({accountId:id,sessionVerified:true,securityVersion:0});
const resolution=(id=PA):VerifiedPublicPortfolio=>({portfolioId:id,hostResolutionVerified:true});
const portfolio=(id=PA,owner=A,status:PortfolioRecord['status']='active'):PortfolioRecord=>({
  portfolioId:id,ownerAccountId:owner,slug:id===PA?'synthetic-alpha':'synthetic-beta',
  displayHandle:'Fixture Only',status,visibility:'public',activeReleaseId:null,
  publishSequence:0,securityVersion:0,
  aiAccess:{enabled:false,revocationVersion:0,deniedSourceIds:[]},publicStatisticsEnabled:false,
  quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},createdAt:DATE,updatedAt:DATE,schemaVersion:1,
});
const draft=(id=PA,updatedBy=A):DraftRecord=>({portfolioId:id,revision:0,schemaVersion:1,
  rendererVersion:'1.0',profile:{displayName:'Synthetic Fixture'},sections:[],collectionDefinitions:[],
  contentCollections:[],nodes:[],theme:{},navigation:{},seo:{},aiApprovals:{},mediaRefs:[],
  createdAt:DATE,updatedAt:DATE,updatedBy});
const release=(id=PA):ReleaseRecord=>{
  const payload={profile:{displayName:'Synthetic'},sections:[],contentCollections:[],composition:[],theme:{},publicSettings:{}};
  return {releaseId:R,portfolioId:id,sequence:1,publicationOperationId:OP,createdFromDraftRevision:0,
    createdAt:DATE,schemaVersion:1,rendererVersion:'1.0',blockRegistryVersion:'1.0',serializerVersion:'1.0',
    contentHash:createHash('sha256').update(canonicalJson(payload)).digest('hex'),
    canonicalPayloadBytes:Buffer.byteLength(canonicalJson(payload)),payload,mediaRefs:[],
    searchArtifact:{},seoArtifact:{},manifest:{compilationVersion:'1.0',enabledRoutes:['/'],sourceContentIds:[],warnings:[]}};
};
const operation=():PublishOperationRecord=>({operationId:OP,portfolioId:PA,ownerAccountId:A,
  idempotencyKeyHash:'a'.repeat(64),requestFingerprint:'b'.repeat(64),draftRevision:0,
  expectedPreviousReleaseId:null,stage:'received',attemptedAt:DATE,updatedAt:DATE,attemptCount:1,schemaVersion:1});
const setup=async()=>{
  const db=new FakeMongoDatabase();await applyMongoSchemaAndIndexes(db,true);
  await db.collection<PortfolioRecord>('portfolios').insertOne(portfolio());
  await db.collection<PortfolioRecord>('portfolios').insertOne(portfolio(PB,B));
  await db.collection<DraftRecord>('drafts').insertOne(draft());
  await db.collection<DraftRecord>('drafts').insertOne(draft(PB,B));
  return db;
};

test('3.1/3.2 inventory fixed; indexes include aliases and tenant uniqueness; no unsafe reservation TTL',async()=>{
  assert.equal(MONGO_COLLECTIONS.length,19);
  const db=new FakeMongoDatabase();
  await assert.rejects(applyMongoSchemaAndIndexes(db,false));
  await applyMongoSchemaAndIndexes(db,true);
  assert.equal(INDEX_MANIFEST.some(x=>x.collection==='slugClaims'&&x.name==='uq_slug_all_claims'&&x.unique),true);
  assert.equal(INDEX_MANIFEST.some(x=>x.collection==='uploadReservations'&&'expiresAt' in x.keys&&x.expireAfterSeconds===0),false);
  assert.equal(db.inspect('accounts').indexes.some(x=>x.options.unique===true),true);
});
test('3.2 duplicate provider subject and reserved alias race fail via actual unique-index model',async()=>{
  const db=await setup();const identity=new MongoIdentityPersistence(db);
  const ia:ProviderIdentityRecord={identityId:'synthetic_identity_a',accountId:A,provider:'google',providerSubject:'issuer-subject-123',issuer:'https://accounts.google.com',linkedAt:DATE,schemaVersion:1};
  await db.collection<AccountRecord>('accounts').insertOne({accountId:A,status:'active',displayName:'Synthetic',preferredLocale:'en',
    platformRoles:['user'],securityVersion:0,createdAt:DATE,updatedAt:DATE,schemaVersion:1});
  await db.collection<AccountRecord>('accounts').insertOne({accountId:B,status:'active',displayName:'Synthetic B',preferredLocale:'en',
    platformRoles:['user'],securityVersion:0,createdAt:DATE,updatedAt:DATE,schemaVersion:1});
  await identity.insertVerifiedProviderLink(ia,true);
  await assert.rejects(identity.insertVerifiedProviderLink({...ia,identityId:'new_id',accountId:B},true),PersistenceConflict);
  assert.equal((await identity.findAccountForIdentity('google','issuer-subject-123'))?.accountId,A);
  const claim:SlugClaimRecord={slugNormalized:'portfolio-old',portfolioId:PA,kind:'alias',claimedAt:DATE,schemaVersion:1};
  await assert.rejects(identity.insertOwnedSlugClaim(A,claim),PersistenceConflict);
  // A historical alias is a trusted rename transition, not a new public claim command.
  await db.collection<SlugClaimRecord>('slugClaims').insertOne(claim);
  await assert.rejects(identity.insertOwnedSlugClaim(B,{...claim,kind:'current',portfolioId:PB}),PersistenceConflict);
  assert.equal((await identity.findClaim('PORTFOLIO-OLD'))?.portfolioId,PA);
});
test('3.3 rejects unknown privileges, version drift, malicious BSON fields and draft pollution',async()=>{
  const db=await setup();const repo=new MongoTenantRepository(db,()=>NOW);
  const bad=portfolio();(bad as unknown as Record<string,unknown>).adminRole='admin';
  await db.collection<PortfolioRecord>('portfolios').insertOne({...bad,portfolioId:parsePortfolioId('33333333-3333-4333-8333-333333333333'),ownerAccountId:parseAccountId('33333333-3333-4333-8333-333333333333')});
  await assert.rejects(repo.getOwnedPortfolio(actor(parseAccountId('33333333-3333-4333-8333-333333333333')),
    parsePortfolioId('33333333-3333-4333-8333-333333333333')));
  const poisoned=draft();poisoned.profile={nested:JSON.parse('{"$where":"return true"}')};
  await assert.rejects(repo.compareAndSave(actor(),PA,0,'mutation_123456',{
    ...poisoned}));
});
test('3.4 two tenants cannot read, mutate, list media, or retrieve another release',async()=>{
  const db=await setup();const r=new MongoTenantRepository(db,()=>NOW);
  assert.equal((await r.getOwnedPortfolio(actor(B),PA)),null);
  assert.equal((await r.getOwnedDraft(actor(B),PA)),null);
  assert.equal((await r.getOwnedRelease(actor(B),PA,R)),null);
  assert.deepEqual(await r.listOwnedMedia(actor(B),PA),[]);
  assert.deepEqual(await r.compareAndSave(actor(B),PA,0,'mutation_foreign_42',draft()),{kind:'not_found'});
});
test('3.6 revision CAS allows exactly one writer, conflicting second writer never overwrites',async()=>{
  const db=await setup();const r=new MongoTenantRepository(db,()=>NOW);
  const {revision,updatedAt,updatedBy,...snapshot}=draft();void revision;void updatedAt;void updatedBy;
  const results=await Promise.all([r.compareAndSave(actor(),PA,0,'mutation_aaaaaaaa',snapshot),
    r.compareAndSave(actor(),PA,0,'mutation_bbbbbbbb',snapshot)]);
  assert.deepEqual(results.map(x=>x.kind).sort(),['conflict','saved']);
  const state=await r.getOwnedDraft(actor(),PA);assert.equal(state?.revision,1);
  assert.equal(state?.draftMutationId,results[0].kind==='saved'?'mutation_aaaaaaaa':'mutation_bbbbbbbb');
  const replay=await r.compareAndSave(actor(),PA,0,state!.draftMutationId!,snapshot);
  assert.equal(replay.kind,'replayed');assert.equal((await r.getOwnedDraft(actor(),PA))?.revision,1);
  await assert.rejects(r.compareAndSave(actor(),PA,1,state!.draftMutationId!,{
    ...snapshot,profile:{different:true}}),PersistenceConflict);
});
test('3.5 live policy CAS refuses stale revision or owner suspension override',async()=>{
  const db=await setup(),r=new MongoTenantRepository(db,()=>NOW);
  assert.equal((await r.comparePolicy(actor(B),PA,0,{status:'active',visibility:'unlisted'})),null);
  await assert.rejects(r.comparePolicy(actor(),PA,0,{status:'suspended',visibility:'public'}));
  assert.equal((await r.comparePolicy(actor(),PA,0,{status:'owner_disabled',visibility:'unlisted'}))?.securityVersion,1);
  assert.equal((await r.comparePolicy(actor(),PA,0,{status:'active',visibility:'public'})),null);
});
test('3.7 prepared releases never serve publicly; only authoritative pointer activation makes eligible',async()=>{
  const db=await setup(),pr=new MongoPublicationRepository(db,()=>NOW),view=new MongoPublicReleaseReader(db,()=>NOW);
  const source=operation();assert.equal((await pr.createOperation(actor(),source)).kind,'created');
  assert.equal((await pr.createOperation(actor(),source)).kind,'existing');
  await assert.rejects(pr.createOperation(actor(),{...source,requestFingerprint:'c'.repeat(64)}),PersistenceConflict);
  assert.equal((await pr.insertPrepared(actor(),release())).kind,'created');
  assert.equal((await view.getCurrentPublicRelease(resolution())).kind,'denied');
  const p={portfolioId:PA,operationId:OP,releaseId:R,expectedActiveReleaseId:null,
    expectedSecurityVersion:0,expectedPublishSequence:0};
  assert.equal((await pr.activate(actor(),p)).kind,'activated');
  assert.equal((await pr.activate(actor(),p)).kind,'already_activated');
  const allowed=await view.getCurrentPublicRelease(resolution());assert.equal(allowed.kind,'allowed');
  if(allowed.kind==='allowed')assert.equal(allowed.release.contentHash,release().contentHash);
  assert.equal((await db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:PA}))?.publishSequence,1);
  assert.equal((await pr.insertPrepared(actor(),release())).kind,'conflict');
});
test('3.5 public gate denies in live moderation, disabled state, missing policy and malformed release',async()=>{
  const db=await setup();const pr=new MongoPublicationRepository(db,()=>NOW);
  await pr.createOperation(actor(),operation());await pr.insertPrepared(actor(),release());
  await pr.activate(actor(),{portfolioId:PA,operationId:OP,releaseId:R,expectedActiveReleaseId:null,
    expectedSecurityVersion:0,expectedPublishSequence:0});
  const reader=new MongoPublicReleaseReader(db,()=>NOW);
  const m={policyId:'synthetic_moderation',portfolioId:PA,scope:'content_item',targetId:'any',
    effect:'deny_public',reasonCode:'policy_violation',issuedByAdminAccountId:B,active:true,
    issuedAt:DATE,securityVersion:1,schemaVersion:1} as const;
  await db.collection('moderationPolicies').insertOne(m);
  assert.equal((await reader.getCurrentPublicRelease(resolution())).kind,'denied');
  db.inspect('moderationPolicies').failRead=true;
  assert.equal((await reader.getCurrentPublicRelease(resolution())).kind,'denied');
  db.inspect('moderationPolicies').failRead=false;
  await db.collection('portfolios').updateOne({portfolioId:PA},{$set:{status:'suspended'}});
  assert.equal((await reader.getCurrentPublicRelease(resolution())).kind,'denied');
});
test('3.8 global quota reservation is atomic under many parallel attempts; owner cannot borrow another quota',async()=>{
  const db=await setup();await initializeLocalMediaQuota(db,2*1024*1024,true,NOW);
  const q=new MongoMediaQuotaRepository(db,()=>NOW);
  const rows=await Promise.allSettled(Array.from({length:10},(_,i)=>q.reserve(actor(),{
    reservationId:`11111111-1111-4111-8111-${String(i+1).padStart(12,'0')}`,
    idempotencyHash:'a'.repeat(64),portfolioId:PA,mediaId:MEDIA,kind:'image',
    bytes:1024*1024,physicalBytes:1024*1024,expiresAt:'2026-11-20T00:05:00.000Z'})));
  assert.equal(rows.filter(x=>x.status==='fulfilled').length,2);
  const usage=await q.currentUsage(actor(),PA);assert.equal(usage?.reservedOriginalFiles,2);
  assert.equal((await q.currentUsage(actor(B),PA)),null);
  const global=await db.collection('quotaBuckets').findOne({bucketId:'global:media'}) as {global:{reservedPhysicalBytes:number}};
  assert.equal(global.global.reservedPhysicalBytes,2*1024*1024);
});
test('3.8 failed reservation journal keeps conservative capacity; cleanup proof releases; replay idempotent',async()=>{
  const db=await setup();await initializeLocalMediaQuota(db,1024*1024,true,NOW);
  const q=new MongoMediaQuotaRepository(db,()=>NOW);
  const input={reservationId:'11111111-1111-4111-8111-000000000111',idempotencyHash:'c'.repeat(64),
    portfolioId:PA,mediaId:MEDIA,kind:'image' as const,bytes:700000,physicalBytes:700000,
    expiresAt:'2026-11-20T00:01:00.000Z'};
  db.inspect('uploadReservations').failNextInsert=true;
  await assert.rejects(q.reserve(actor(),input));
  assert.equal((await q.currentUsage(actor(),PA))?.reservedBytes,700000);
  const repaired=await q.reserve(actor(),input);assert.equal(repaired.state,'reserved');
  assert.equal((await q.reconcileExpired(new Date('2026-11-20T00:02:00Z'),async()=>false)),0);
  assert.equal((await q.currentUsage(actor(),PA))?.reservedBytes,700000);
  assert.equal((await q.reconcileExpired(new Date('2026-11-20T00:02:00Z'),async()=>true)),1);
  assert.equal((await q.currentUsage(actor(),PA))?.reservedBytes,0);
  await assert.rejects(q.reserve(actor(),input),PersistenceConflict);
});
test('3.8 finalize accepts verified bytes once; does not overspend or release committed original',async()=>{
  const db=await setup();await initializeLocalMediaQuota(db,2*1024*1024,true,NOW);
  const q=new MongoMediaQuotaRepository(db,()=>NOW);
  const id='11111111-1111-4111-8111-000000000222';
  await q.reserve(actor(),{reservationId:id,idempotencyHash:'e'.repeat(64),portfolioId:PA,mediaId:MEDIA,
    kind:'image',bytes:800000,physicalBytes:900000,expiresAt:'2026-11-20T00:05:00.000Z'});
  await assert.rejects(q.finalize(actor(),id,900000,950000),PersistenceConflict);
  await q.finalize(actor(),id,700000,780000);await q.finalize(actor(),id,700000,780000);
  assert.equal((await q.currentUsage(actor(),PA))?.committedOriginalFiles,1);
  assert.equal((await q.currentUsage(actor(),PA))?.reservedBytes,0);
  await assert.rejects(q.release(actor(),id,async()=>true),PersistenceConflict);
});
test('3.9 expired contact is denied at read time even when TTL has not physically deleted it',async()=>{
  const db=await setup();const privacy=new MongoPrivacyRepository(db);
  const msg:ContactMessageRecord={messageId:'synthetic_contact_expired',portfolioId:PA,receivedAt:DATE,
    expiresAt:new Date('2026-11-19T12:00:00Z'),sender:{name:'Test',email:'only@example.test'},body:'SYNTHETIC_PRIVATE_SENTINEL',
    consentNoticeVersion:'v1',status:'new',antiAbuse:{decisionCode:'ALLOWED'},schemaVersion:1};
  await db.collection<ContactMessageRecord>('contactMessages').insertOne(msg);
  await db.collection<ContactMessageRecord>('contactMessages').insertOne({...msg,messageId:'synthetic_contact_valid',
    expiresAt:new Date('2026-11-21T00:00:00Z')});
  assert.equal((await privacy.listOwnedUnexpiredContact(actor(),PA,NOW)).length,1);
  assert.equal(await privacy.getOwnedUnexpiredContact(actor(),PA,msg.messageId,NOW),null);
  assert.deepEqual(await privacy.listOwnedUnexpiredContact(actor(B),PA,NOW),[]);
  assert.equal((await db.collection('contactMessages').findOne({messageId:msg.messageId}))!==null,true);
  const record:AnalyticsDailyRecord={portfolioId:PA,day:'2026-11-20',metricKey:'page_view',count:10,
    updatedAt:DATE,schemaVersion:1};
  await db.collection('analyticsDaily').insertOne(record);
  assert.equal((await privacy.readAggregate(actor(),PA,'2026-11-20')).length,1);
  assert.deepEqual(await privacy.readAggregate(actor(B),PA,'2026-11-20'),[]);
});
