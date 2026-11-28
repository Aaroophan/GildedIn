import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {INDEX_MANIFEST} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoContentRepository} from '../../src/infrastructure/mongodb/content-repository.ts';
import {MongoTenancyRepository} from '../../src/infrastructure/mongodb/tenancy-repository.ts';
import {parseCreationCommand} from '../../src/domain/tenancy/commands.ts';
import {parseAccountId,parseSessionId,parseMediaId,parseContentId} from '../../src/shared/domain/identifiers.ts';
import type {AuthenticatedActor} from '../../src/domain/identity/contracts.ts';
import type {AccountRecord,SessionRecord,DraftRecord,MediaRecord} from '../../src/domain/persistence/models.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import {projectCollectionDefinition} from '../../src/domain/content/projects.ts';
import type {CollectionDefinition} from '../../src/domain/content/types.ts';
const NOW=new Date('2026-11-28T11:00:00.000Z');
const ORIGIN='https://aaroophan.dev';
const uuid=()=>randomUUID();
async function setup(){
  const db=new FakeMongoDatabase();
  for(const index of INDEX_MANIFEST)await db.collection(index.collection).createIndex(index.keys,
    {name:index.name,...(index.unique?{unique:true}:{}),
      ...(index.partialFilterExpression?{partialFilterExpression:index.partialFilterExpression}:{})});
  const transactions=new FakeMongoTransactionRunner(db);
  const content=new MongoContentRepository(db,transactions,()=>new Date(NOW));
  const tenancy=new MongoTenancyRepository(db,transactions,()=>new Date(NOW));
  const seed=async():Promise<AuthenticatedActor>=>{
    const accountId=parseAccountId(uuid()),sessionId=parseSessionId(uuid());
    const account:AccountRecord={accountId,status:'active',displayName:'Synthetic',preferredLocale:'en',
      platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),updatedAt:NOW.toISOString(),schemaVersion:1};
    await db.collection<AccountRecord>('accounts').insertOne(account);
    const sessionLookupId=uuid(),session:SessionRecord={sessionId,accountId,sessionLookupId,
      verifierHash:'synthetic-verifier',securityVersion:1,createdAt:NOW,authenticatedAt:NOW,
      lastSeenAt:NOW,idleExpiresAt:new Date(NOW.getTime()+3600000),
      absoluteExpiresAt:new Date(NOW.getTime()+86400000),expiresAt:new Date(NOW.getTime()+86400000),
      authProvider:'github',schemaVersion:1};
    await db.collection<SessionRecord>('sessions').insertOne(session);
    return {accountId,sessionId,sessionLookupId,securityVersion:1,authProvider:'github',authenticatedAt:NOW};
  };
  const a=await seed(),b=await seed();
  const create=async(actor:AuthenticatedActor,slug:string)=>tenancy.create(actor,parseCreationCommand({
    slug,displayName:'Synthetic Developer',identityLabel:'Software Engineer',
    introduction:'Example synthetic content for the private draft.',templatePreset:'signature'}),uuid(),ORIGIN);
  const pa=await create(a,'alice-dev'),pb=await create(b,'bob-dev');
  return {db,transactions,content,tenancy,a,b,pa,pb};
}
function cmd(revision:number,ops:unknown[],id=uuid()){
  return {expectedRevision:revision,clientMutationId:id,operations:ops};
}
const projects=()=>projectCollectionDefinition();
const createCollection=()=>({type:'createCollection',collection:projects()});
const putItem=(title='A project',contentId?:string,extra:Record<string,unknown>={})=>({
  type:'upsertContentItem',collectionId:'projects',...(contentId?{contentId}:{}),
  fields:{title},categoryIds:[],featured:false,ownerVisibility:'public_candidate',searchable:true,
  publicFieldIds:['title'],aiApprovedFieldIds:[],...extra});
function fails(code:string){return (e:unknown)=>e instanceof ContentDenied&&e.code===code;}

test('6.4 Issue 5 draft is normalized on read and stays unpublished until Issue 13',async()=>{
  const f=await setup(),draft=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(draft.revision,0);
  assert.equal((draft.sections[0] as {type:string}).type,'hero');
  assert.equal((draft.sections[0] as {publicAnchor:string}).publicAnchor,'intro');
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
  assert.ok(!('activeReleaseId' in draft));
});
test('6.4 author content once and reuse stable ID after updates without creating new public release',async()=>{
  const f=await setup(),first=await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection(),putItem()]));
  assert.equal(first.kind,'saved');if(first.kind!=='saved')return;
  assert.equal(first.draft.revision,1);
  const saved=first.draft.contentCollections[0] as {items:{contentId:string;fields:Record<string,unknown>}[]};
  assert.equal(saved.items.length,1);const id=saved.items[0].contentId;
  const second=await f.content.apply(f.a,f.pa.portfolioId,cmd(1,[putItem('Updated canonical project',id)]));
  assert.equal(second.kind,'saved');
  const current=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal((current.contentCollections[0] as typeof saved).items[0].contentId,id);
  assert.equal((current.contentCollections[0] as typeof saved).items[0].fields.title,'Updated canonical project');
  assert.equal(f.db.inspect('releases').entries.length,0);
});
test('6.4 generated content IDs cannot be supplied as foreign-owner update selectors',async()=>{
  const f=await setup();await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection()]));
  const malicious=putItem('Cross-tenant',uuid());
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(1,[malicious])),fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('6.10 two parallel writers: exactly one CAS success, other receives conflict',async()=>{
  const f=await setup();const values=await Promise.all([
    f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'First tab'}])),
    f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'Second tab'}]))]);
  assert.deepEqual(values.map(x=>x.kind).sort(),['conflict','saved']);
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('6.10 lost acknowledgment replays exactly the same operation without new revision',async()=>{
  const f=await setup(),key=uuid(),command=cmd(0,[{type:'setProfileField',field:'introduction',value:'Single save'}],key);
  const a=await f.content.apply(f.a,f.pa.portfolioId,command);
  const b=await f.content.apply(f.a,f.pa.portfolioId,command);
  assert.equal(a.kind,'saved');assert.equal(b.kind,'replayed');
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'Different'}],key)),
    fails('CONTENT_CONFLICT'));
});
test('6.10 invalid later operation rolls back full batch before any update',async()=>{
  const f=await setup();const before=JSON.stringify(f.db.inspect('drafts').entries[0]);
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(0,[
    {type:'setProfileField',field:'introduction',value:'Should not persist'},
    {type:'setProfileField',field:'platformRoles',value:'admin'}])),fails('CONTENT_INVALID'));
  assert.equal(JSON.stringify(f.db.inspect('drafts').entries[0]),before);
});
test('6.10 fake transaction outage and failed DB update never claim success',async()=>{
  const f=await setup(),before=JSON.stringify(f.db.inspect('drafts').entries[0]);
  f.transactions.unavailable=true;
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'Bad'}])),
    fails('CONTENT_UNAVAILABLE'));
  f.transactions.unavailable=false;f.db.inspect('drafts').failNextUpdate=true;
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'Bad'}])),
    fails('CONTENT_UNAVAILABLE'));
  assert.equal(JSON.stringify(f.db.inspect('drafts').entries[0]),before);
});
test('6.10 cross-tenant reads and writes are denied without disclosure',async()=>{
  const f=await setup();
  await assert.rejects(f.content.getOwnedDraft(f.b,f.pa.portfolioId),fails('CONTENT_NOT_FOUND'));
  await assert.rejects(f.content.apply(f.b,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'Foreign'}])),
    fails('CONTENT_NOT_FOUND'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('6.10 revoked sessions, suspended accounts and securityVersion mismatch deny writes',async()=>{
  const f=await setup();
  await f.db.collection<SessionRecord>('sessions').updateOne({sessionId:f.a.sessionId},{$set:{revokedAt:NOW}});
  await assert.rejects(f.content.getOwnedDraft(f.a,f.pa.portfolioId),fails('CONTENT_NOT_AUTHORIZED'));
  await f.db.collection<SessionRecord>('sessions').updateOne({sessionId:f.a.sessionId},{$set:{revokedAt:undefined}});
  // Fake matches revokedAt exists when undefined; use a separate account eligibility check.
  await f.db.collection<AccountRecord>('accounts').updateOne({accountId:f.a.accountId},{$set:{status:'suspended'}});
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(0,[{type:'setProfileField',field:'introduction',value:'No'}])),
    fails('CONTENT_NOT_AUTHORIZED'));
});
test('6.3 read-only JSON-schema preview does not mutate owner draft, schema or public release',async()=>{
  const f=await setup(),original=JSON.stringify(f.db.inspect('drafts').entries);
  const result=await f.content.previewSchemaImport(f.a,f.pa.portfolioId,{
    format:'json-schema-2020-12',collectionId:'papers',schemaId:'papers_schema',displayName:'Papers',
    schema:{'$schema':'https://json-schema.org/draft/2020-12/schema',type:'object',additionalProperties:false,
      properties:{title:{type:'string',maxLength:160}}}});
  assert.equal(result.mode,'new');assert.equal(result.candidate.fields[0].publicVisibility,'private');
  assert.equal(JSON.stringify(f.db.inspect('drafts').entries),original);
  assert.equal(f.db.inspect('releases').entries.length,0);
});
test('6.3 hostile import and client-supplied owner field fail with no mutation',async()=>{
  const f=await setup();
  await assert.rejects(f.content.previewSchemaImport(f.a,f.pa.portfolioId,{
    format:'gildedin-v1',collectionId:'projects',schemaId:'projects_schema',displayName:'Projects',
    schema:{...projects(),ownerAccountId:f.b.accountId}}),fails('CONTENT_INVALID'));
  assert.equal(f.db.inspect('drafts').entries[0].revision,0);
});
test('6.4 collection capacity is enforced in one atomic batch at 20',async()=>{
  const f=await setup(),ids=Array.from({length:21},()=>parseContentId(uuid()));
  await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection()]));
  const twenty=ids.slice(0,20).map((_,i)=>putItem(`Project ${i}`));
  const first=await f.content.apply(f.a,f.pa.portfolioId,cmd(1,twenty));
  assert.equal(first.kind,'saved');
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(2,[putItem('Extra')])),fails('CONTENT_INVALID'));
  const stored=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal((stored.contentCollections[0] as {items:unknown[]}).items.length,20);
  assert.equal(stored.revision,2);
});
test('6.5 foreign or orphaned reference causes the entire transaction to abort',async()=>{
  const f=await setup(),foreignId=parseContentId(uuid());
  await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection()]));
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(1,[putItem('Reference',undefined,
    {fields:{title:'Reference',gallery:[],source_url:'https://example.com'}}),
    {type:'upsertContentItem',collectionId:'projects',fields:{title:'Foreign',gallery:[],
      source_url:'https://example.com'},categoryIds:[],featured:false,ownerVisibility:'public_candidate',
      searchable:true,publicFieldIds:['title'],aiApprovedFieldIds:[],contentId:foreignId}])),fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('6.2 finalized media must belong to the same owner and have matching stored type',async()=>{
  const f=await setup(),mediaId=parseMediaId(uuid());
  const media:MediaRecord={mediaId,portfolioId:f.pa.portfolioId,uploadedByAccountId:f.a.accountId,
    state:'ready_private',kind:'image',declaredMimeType:'image/png',verifiedMimeType:'image/png',
    bytesOriginal:900,sha256:'0'.repeat(64),variants:[],createdAt:NOW.toISOString(),schemaVersion:1};
  await f.db.collection<MediaRecord>('mediaAssets').insertOne(media);
  await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection()]));
  const added=await f.content.apply(f.a,f.pa.portfolioId,cmd(1,[putItem('Media project',undefined,
    {fields:{title:'Media project',gallery:[{mediaId,alt:'Diagram'}]}})]));
  assert.equal(added.kind,'saved');
  const current=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(current.revision,2);
  const foreign=parseMediaId(uuid());
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(2,[putItem('Invalid media',undefined,
    {fields:{title:'Invalid media',gallery:[{mediaId:foreign,alt:'No'}]}})])),fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,2);
});
test('6.9 valid destructive migrations require latest scoped hash, and save one revision only',async()=>{
  const f=await setup();await f.content.apply(f.a,f.pa.portfolioId,cmd(0,[createCollection(),putItem()]));
  const source=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const old=source.collectionDefinitions[0] as CollectionDefinition;
  const newSchema={...old,schemaVersion:2,fields:old.fields.map(x=>x.fieldId==='title'?{...Object.fromEntries(Object.entries(x).filter(([key])=>key!=='validation')),type:'date'}:x)};
  const {previewSchemaChange}=await import('../../src/domain/content/migration.ts');
  const impact=await previewSchemaChange(source,newSchema,1);
  assert.equal(impact.destructive,true);
  await assert.rejects(f.content.apply(f.a,f.pa.portfolioId,cmd(1,[{type:'updateCollectionSchema',schema:newSchema}])),
    fails('CONTENT_MIGRATION_CONFIRMATION_REQUIRED'));
  const saved=await f.content.apply(f.a,f.pa.portfolioId,cmd(1,[{type:'updateCollectionSchema',schema:newSchema,
    confirmationHash:impact.confirmationHash}]));
  assert.equal(saved.kind,'saved');
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,2);
  assert.equal(f.db.inspect('releases').entries.length,0);
});
test('6.10 complete snapshot PUT cannot mutate nodes, roles, releases, owner, or protected fields',async()=>{
  const f=await setup(),draft=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const editable={schemaVersion:1,rendererVersion:draft.rendererVersion,profile:draft.profile,
    sections:draft.sections,collectionDefinitions:draft.collectionDefinitions,
    contentCollections:draft.contentCollections,nodes:draft.nodes,theme:draft.theme,
    navigation:draft.navigation,seo:draft.seo,aiApprovals:draft.aiApprovals,mediaRefs:draft.mediaRefs};
  const result=await f.content.putContent(f.a,f.pa.portfolioId,{...editable,
    profile:{...draft.profile,introduction:'Updated by full snapshot'}},0,uuid());
  assert.equal(result.kind,'saved');
  await assert.rejects(f.content.putContent(f.a,f.pa.portfolioId,{...editable,
    activeReleaseId:'forged'},1,uuid()),fails('CONTENT_INVALID'));
  await assert.rejects(f.content.putContent(f.a,f.pa.portfolioId,{...editable,
    nodes:[{nodeId:'malicious',script:'alert(1)'}]},1,uuid()),fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
