import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {INDEX_MANIFEST} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoContentRepository} from '../../src/infrastructure/mongodb/content-repository.ts';
import {MongoTenancyRepository} from '../../src/infrastructure/mongodb/tenancy-repository.ts';
import {parseCreationCommand} from '../../src/domain/tenancy/commands.ts';
import {parseAccountId,parseSessionId,parseMediaId} from '../../src/shared/domain/identifiers.ts';
import type {AuthenticatedActor} from '../../src/domain/identity/contracts.ts';
import type {AccountRecord,SessionRecord,MediaRecord} from '../../src/domain/persistence/models.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import {compileComposition} from '../../src/domain/composition/compiler.ts';
const NOW=new Date('2026-11-28T10:00:00.000Z');const ORIGIN='https://aaroophan.dev';
const fails=(code:string)=>(e:unknown)=>e instanceof ContentDenied&&e.code===code;
async function setup(){
  const db=new FakeMongoDatabase();for(const ix of INDEX_MANIFEST)
    await db.collection(ix.collection).createIndex(ix.keys,{name:ix.name,
      ...(ix.unique?{unique:true}:{}),...(ix.partialFilterExpression?{partialFilterExpression:ix.partialFilterExpression}:{})});
  const tx=new FakeMongoTransactionRunner(db),content=new MongoContentRepository(db,tx,()=>new Date(NOW));
  const tenancy=new MongoTenancyRepository(db,tx,()=>new Date(NOW));
  const seed=async():Promise<AuthenticatedActor>=>{
    const accountId=parseAccountId(randomUUID()),sessionId=parseSessionId(randomUUID());
    const a:AccountRecord={accountId,status:'active',displayName:'Example',preferredLocale:'en',
      platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),updatedAt:NOW.toISOString(),schemaVersion:1};
    await db.collection<AccountRecord>('accounts').insertOne(a);
    const sessionLookupId=randomUUID(),s:SessionRecord={sessionId,accountId,sessionLookupId,
      verifierHash:'test-verifier',securityVersion:1,createdAt:NOW,authenticatedAt:NOW,lastSeenAt:NOW,
      idleExpiresAt:new Date(NOW.getTime()+3600000),absoluteExpiresAt:new Date(NOW.getTime()+86400000),
      expiresAt:new Date(NOW.getTime()+86400000),authProvider:'github',schemaVersion:1};
    await db.collection<SessionRecord>('sessions').insertOne(s);
    return {accountId,sessionId,sessionLookupId,securityVersion:1,authProvider:'github',authenticatedAt:NOW};
  };
  const a=await seed(),b=await seed();
  const create=(actor:AuthenticatedActor,slug:string)=>tenancy.create(actor,parseCreationCommand({
    slug,displayName:'Synthetic Creator',identityLabel:'Engineer',
    introduction:'Synthetic draft-only content.',templatePreset:'signature'}),randomUUID(),ORIGIN);
  const pa=await create(a,'synthetic-a'),pb=await create(b,'synthetic-b');
  return {db,tx,content,tenancy,a,b,pa,pb};
}
function heading(sectionId:string,changes:Record<string,unknown>={}){
  return {nodeId:randomUUID(),sectionId,componentType:'heading',componentVersion:1,
    props:{level:1},contentBinding:{source:'profile',fieldId:'displayName'},
    layout:{mode:'auto',flow:'column'},visualOrder:0,readingOrder:0,
    semanticRole:'h1',interaction:{kind:'none'},...changes};
}
function payload(sectionId:string,changes:Record<string,unknown>={}){
  return {schemaVersion:1,nodes:[heading(sectionId,changes)]};
}
test('7.1/7.9 authorized composition saves one versioned tree in the same private draft only',async()=>{
  const f=await setup(),old=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const p=payload((old.sections[0] as {sectionId:string}).sectionId),saved=await f.content.putComposition(f.a,f.pa.portfolioId,p,0,randomUUID());
  assert.equal(saved.kind,'saved');
  const doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(doc.revision,1);assert.deepEqual(doc.profile,old.profile);assert.equal(doc.nodes.length,1);
  const compiled=compileComposition(doc);assert.equal(compiled.ok,true);
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
test('7.1/7.10 guessed foreign portfolio rejects before composition mutation',async()=>{
  const f=await setup(),old=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const p=payload((old.sections[0] as {sectionId:string}).sectionId);
  await assert.rejects(f.content.putComposition(f.b,f.pa.portfolioId,p,0,randomUUID()),fails('CONTENT_NOT_FOUND'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('7.9 two simultaneous writers cannot overwrite a winning draft revision',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const sid=(doc.sections[0] as {sectionId:string}).sectionId;
  const a=payload(sid),b=payload(sid,{props:{level:1,text:'Another public heading'}});
  const [x,y]=await Promise.all([f.content.putComposition(f.a,f.pa.portfolioId,a,0,randomUUID()),
    f.content.putComposition(f.a,f.pa.portfolioId,b,0,randomUUID())]);
  assert.deepEqual([x.kind,y.kind].sort(),['conflict','saved']);
  const result=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(result.revision,1);assert.equal(result.nodes.length,1);
});
test('7.9 identical request replay returns same revision and conflicting replay token fails',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const id=randomUUID(),p=payload((doc.sections[0] as {sectionId:string}).sectionId);
  const first=await f.content.putComposition(f.a,f.pa.portfolioId,p,0,id);
  assert.equal(first.kind,'saved');
  const again=await f.content.putComposition(f.a,f.pa.portfolioId,p,0,id);
  assert.equal(again.kind,'replayed');
  await assert.rejects(f.content.putComposition(f.a,f.pa.portfolioId,{schemaVersion:1,nodes:[]},0,id),
    fails('CONTENT_CONFLICT'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('7.5 malicious component props, unsupported version, foreign source rejected atomically',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const section=(doc.sections[0] as {sectionId:string}).sectionId;
  const evil=[{componentVersion:999},{props:{level:1,html:'<script>alert(1)</script>'}},
    {contentBinding:{source:'collectionItem',collectionId:'foreign',contentId:randomUUID()}},
    {sectionId:randomUUID()}, {layout:{mode:'auto',flow:'column',style:'url(evil)'}}];
  for(const mod of evil)await assert.rejects(f.content.putComposition(f.a,f.pa.portfolioId,payload(section,mod),0,randomUUID()),
    fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('7.9 synthetic transaction failure never claims success and restores old state',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  f.tx.unavailable=true;
  await assert.rejects(f.content.putComposition(f.a,f.pa.portfolioId,
    payload((doc.sections[0] as {sectionId:string}).sectionId),0,randomUUID()),fails('CONTENT_UNAVAILABLE'));
  f.tx.unavailable=false;
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('7.5 image block cannot reference missing or foreign-owned media',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const sid=(doc.sections[0] as {sectionId:string}).sectionId,mediaId=parseMediaId(randomUUID());
  const image={nodeId:randomUUID(),sectionId:sid,componentType:'image',componentVersion:1,
    props:{mediaId,alt:'Diagram'},layout:{mode:'auto',flow:'column'},visualOrder:0,readingOrder:0,
    interaction:{kind:'none'}};
  await assert.rejects(f.content.putComposition(f.a,f.pa.portfolioId,{schemaVersion:1,nodes:[image]},0,randomUUID()),
    fails('CONTENT_INVALID'));
  const foreign:MediaRecord={mediaId,portfolioId:f.pb.portfolioId,uploadedByAccountId:f.b.accountId,
    state:'ready_private',kind:'image',declaredMimeType:'image/png',verifiedMimeType:'image/png',
    bytesOriginal:800,sha256:'1'.repeat(64),variants:[],createdAt:NOW.toISOString(),schemaVersion:1};
  await f.db.collection<MediaRecord>('mediaAssets').insertOne(foreign);
  await assert.rejects(f.content.putComposition(f.a,f.pa.portfolioId,{schemaVersion:1,nodes:[image]},0,randomUUID()),
    fails('CONTENT_INVALID'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('7.5 owned media may be saved privately, but compiler still refuses unapproved public delivery',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const sid=(doc.sections[0] as {sectionId:string}).sectionId,mediaId=parseMediaId(randomUUID());
  const m:MediaRecord={mediaId,portfolioId:f.pa.portfolioId,uploadedByAccountId:f.a.accountId,
    state:'ready_private',kind:'image',declaredMimeType:'image/png',verifiedMimeType:'image/png',
    bytesOriginal:800,sha256:'1'.repeat(64),variants:[],createdAt:NOW.toISOString(),schemaVersion:1};
  await f.db.collection<MediaRecord>('mediaAssets').insertOne(m);
  const image={nodeId:randomUUID(),sectionId:sid,componentType:'image',componentVersion:1,
    props:{mediaId,alt:'Diagram'},layout:{mode:'auto',flow:'column'},visualOrder:0,readingOrder:0,
    interaction:{kind:'none'}};
  const saved=await f.content.putComposition(f.a,f.pa.portfolioId,{schemaVersion:1,nodes:[image]},0,randomUUID());
  assert.equal(saved.kind,'saved');
  const result=compileComposition(await f.content.getOwnedDraft(f.a,f.pa.portfolioId));
  assert.equal(result.ok,false);assert.ok(result.issues.some(i=>i.code==='unapproved_media'));
});
test('7.9 no release or public artifact is activated on validation or composition save',async()=>{
  const f=await setup(),doc=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const sid=(doc.sections[0] as {sectionId:string}).sectionId;
  const saved=await f.content.putComposition(f.a,f.pa.portfolioId,payload(sid),0,randomUUID());
  assert.equal(saved.kind,'saved');assert.equal(compileComposition((await f.content.getOwnedDraft(f.a,f.pa.portfolioId))).ok,true);
  for(const name of ['releases','publishOperations'])assert.equal(f.db.inspect(name).entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
