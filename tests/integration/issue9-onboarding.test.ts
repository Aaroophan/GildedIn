import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {INDEX_MANIFEST} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoTenancyRepository} from '../../src/infrastructure/mongodb/tenancy-repository.ts';
import {MongoContentRepository} from '../../src/infrastructure/mongodb/content-repository.ts';
import {parseCreationCommand,TenancyDenied} from '../../src/domain/tenancy/commands.ts';
import {parseAccountId,parseSessionId} from '../../src/shared/domain/identifiers.ts';
import {parseContentDraft} from '../../src/domain/content/model.ts';
import type {AuthenticatedActor} from '../../src/domain/identity/contracts.ts';
import type {AccountRecord,SessionRecord,DraftRecord} from '../../src/domain/persistence/models.ts';
const NOW=new Date('2026-11-28T10:00:00.000Z'),ORIGIN='https://aaroophan.dev';
const uuid=()=>randomUUID();
const cmd=(slug='alice-site',firstProject?:{title:string;summary?:string})=>parseCreationCommand({
  slug,displayName:'Owner-authored Name',identityLabel:'Student',introduction:'I am learning computer science.',
  templatePreset:'signature',...(firstProject?{firstProject}:{})});
async function setup(){
  const db=new FakeMongoDatabase();for(const index of INDEX_MANIFEST)await db.collection(index.collection)
    .createIndex(index.keys,{name:index.name,...(index.unique?{unique:true}:{}),
      ...(index.partialFilterExpression?{partialFilterExpression:index.partialFilterExpression}:{})});
  const transactions=new FakeMongoTransactionRunner(db);
  const tenancy=new MongoTenancyRepository(db,transactions,()=>new Date(NOW));
  const content=new MongoContentRepository(db,transactions,()=>new Date(NOW));
  const seed=async():Promise<AuthenticatedActor>=>{
    const accountId=parseAccountId(uuid()),sessionId=parseSessionId(uuid()),lookup=uuid();
    const account:AccountRecord={accountId,status:'active',displayName:'Synthetic',preferredLocale:'en',
      platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),updatedAt:NOW.toISOString(),schemaVersion:1};
    await db.collection<AccountRecord>('accounts').insertOne(account);
    const session:SessionRecord={sessionId,accountId,sessionLookupId:lookup,verifierHash:'synthetic-verifier',
      securityVersion:1,createdAt:NOW,authenticatedAt:NOW,lastSeenAt:NOW,
      idleExpiresAt:new Date(NOW.getTime()+3600000),absoluteExpiresAt:new Date(NOW.getTime()+7200000),
      expiresAt:new Date(NOW.getTime()+7200000),authProvider:'github',schemaVersion:1};
    await db.collection<SessionRecord>('sessions').insertOne(session);
    return {accountId,sessionId,sessionLookupId:lookup,securityVersion:1,authProvider:'github',authenticatedAt:NOW};
  };
  return {db,transactions,tenancy,content,a:await seed(),b:await seed()};
}
const denied=(code:string)=>(e:unknown)=>e instanceof TenancyDenied&&e.code===code;
test('9.3 guided creation without a project persists exactly one Hero and no public release',async()=>{
  const f=await setup();const p=await f.tenancy.create(f.a,cmd(),uuid(),ORIGIN);
  assert.equal(p.status,'onboarding');assert.equal(p.activeReleaseId,null);
  const draft=await f.content.getOwnedDraft(f.a,p.portfolioId);
  assert.deepEqual(draft.sections.map(x=>x.type),['hero']);
  assert.equal(draft.collectionDefinitions.length,0);assert.equal(draft.revision,0);
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.deepEqual(await f.tenancy.directory(ORIGIN),[]);
});
test('9.3 optional first project is one private typed item within initial atomic create',async()=>{
  const f=await setup();const project={title:'Personal research project',summary:'A synthetic project, written by the owner.'};
  const p=await f.tenancy.create(f.a,cmd('one-project',project),uuid(),ORIGIN);
  const d=await f.content.getOwnedDraft(f.a,p.portfolioId);
  assert.deepEqual(d.sections.map(x=>x.type),['hero','projects']);
  assert.equal(d.collectionDefinitions.length,1);assert.equal(d.contentCollections.length,1);
  const item=d.contentCollections[0].items[0];assert.equal(item.fields.title,project.title);
  assert.equal(item.fields.summary,project.summary);
  assert.equal(item.ownerVisibility,'draft_only');assert.equal(item.searchable,false);
  assert.deepEqual(item.publicFieldIds,[]);assert.deepEqual(item.aiApprovedFieldIds,[]);
  assert.equal(d.nodes.length,0);assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('auditEvents').entries.length,1);
  assert.equal((await f.tenancy.directory(ORIGIN)).length,0);
});
test('9.3 retry with same key does not duplicate project, Hero, slug or audit',async()=>{
  const f=await setup(),key=uuid(),request=cmd('retry-project',{title:'Written once'});
  const first=await f.tenancy.create(f.a,request,key,ORIGIN);
  const again=await f.tenancy.create(f.a,request,key,ORIGIN);
  assert.equal(first.portfolioId,again.portfolioId);
  assert.equal(f.db.inspect('drafts').entries.length,1);
  assert.equal(f.db.inspect('slugClaims').entries.length,1);
  assert.equal(f.db.inspect('auditEvents').entries.length,1);
  assert.equal((await f.content.getOwnedDraft(f.a,first.portfolioId)).contentCollections[0].items.length,1);
});
test('9.3 replay with changed project under same idempotency key is rejected',async()=>{
  const f=await setup(),key=uuid();await f.tenancy.create(f.a,cmd('same-key',{title:'First'}),key,ORIGIN);
  await assert.rejects(f.tenancy.create(f.a,cmd('same-key',{title:'Different'}),key,ORIGIN),denied('PORTFOLIO_ALREADY_EXISTS'));
  assert.equal(f.db.inspect('drafts').entries.length,1);
});
test('9.10 other authenticated account cannot read or modify first owner project/draft',async()=>{
  const f=await setup(),p=await f.tenancy.create(f.a,cmd('only-owner',{title:'PRIVATE_PROJECT_SENTINEL'}),uuid(),ORIGIN);
  await assert.rejects(f.content.getOwnedDraft(f.b,p.portfolioId));
  await assert.rejects(f.tenancy.getOwned(f.b,p.portfolioId,ORIGIN),denied('NOT_FOUND'));
  const ownerDraft=await f.content.getOwnedDraft(f.a,p.portfolioId);
  assert.equal(ownerDraft.contentCollections[0].items[0].fields.title,'PRIVATE_PROJECT_SENTINEL');
  assert.equal(f.db.inspect('releases').entries.length,0);
});
test('9.10 slug claims are unique across unrelated accounts',async()=>{
  const f=await setup();await f.tenancy.create(f.a,cmd('unique-owner'),uuid(),ORIGIN);
  await assert.rejects(f.tenancy.create(f.b,cmd('UNIQUE-OWNER'),uuid(),ORIGIN),denied('SLUG_UNAVAILABLE'));
  assert.equal(f.db.inspect('drafts').entries.length,1);assert.equal(f.db.inspect('portfolios').entries.length,1);
});
test('9.10 failed draft insertion atomically rolls back portfolio and slug reservation',async()=>{
  const f=await setup();f.db.inspect<DraftRecord>('drafts').failNextInsert=true;
  await assert.rejects(f.tenancy.create(f.a,cmd('crash-create',{title:'Test'}),uuid(),ORIGIN));
  for(const name of ['portfolios','slugClaims','drafts','auditEvents'])assert.equal(f.db.inspect(name).entries.length,0,name);
});
test('9.10 missing transaction support rejects before any storage write',async()=>{
  const f=await setup();f.transactions.unavailable=true;
  await assert.rejects(f.tenancy.create(f.a,cmd('unavailable'),uuid(),ORIGIN));
  assert.equal(f.db.inspect('portfolios').entries.length,0);
});
test('9.4 owner sees disabled status and live visibility but unauthorized actor does not',async()=>{
  const f=await setup();const p=await f.tenancy.create(f.a,cmd(),uuid(),ORIGIN);
  const disabled=await f.tenancy.changePolicy(f.a,p.portfolioId,'disable',0);
  assert.equal(disabled.status,'owner_disabled');
  const summary=await f.tenancy.listOwned(f.a,ORIGIN);
  assert.equal(summary[0].status,'owner_disabled');assert.equal(summary[0].activeReleaseId,null);
  assert.deepEqual(await f.tenancy.listOwned(f.b,ORIGIN),[]);
});
test('9.8 owner media quota counts are recorded, not client-invented or world-readable',async()=>{
  const f=await setup();const p=await f.tenancy.create(f.a,cmd(),uuid(),ORIGIN);
  const snap=await f.tenancy.getOwned(f.a,p.portfolioId,ORIGIN);
  assert.deepEqual(snap.mediaUsage,{originalFileCount:0,usedBytes:0,reservedBytes:0});
  await assert.rejects(f.tenancy.getOwned(f.b,p.portfolioId,ORIGIN),denied('NOT_FOUND'));
});
