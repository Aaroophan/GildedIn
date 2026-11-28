/** Synthetic two-tenant Issue 11 revision/receipt tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {FakeMongoTransactionRunner} from '../../src/testing/mongo-transactions.ts';
import {INDEX_MANIFEST} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoContentRepository} from '../../src/infrastructure/mongodb/content-repository.ts';
import {MongoTenancyRepository} from '../../src/infrastructure/mongodb/tenancy-repository.ts';
import {parseCreationCommand} from '../../src/domain/tenancy/commands.ts';
import {parseAccountId,parseSessionId} from '../../src/shared/domain/identifiers.ts';
import type {AuthenticatedActor} from '../../src/domain/identity/contracts.ts';
import type {AccountRecord,SessionRecord} from '../../src/domain/persistence/models.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import {applyCanvasCommand} from '../../src/domain/editor/commands.ts';
import {buildDraftValidationReport} from '../../src/domain/editor/preflight.ts';
const NOW=new Date('2026-11-28T10:00:00.000Z'),ORIGIN='https://aaroophan.dev';
const denied=(code:string)=>(e:unknown)=>e instanceof ContentDenied&&e.code===code;
async function setup(){
  const db=new FakeMongoDatabase();
  for(const ix of INDEX_MANIFEST)await db.collection(ix.collection).createIndex(ix.keys,{name:ix.name,
    ...(ix.unique?{unique:true}:{}),...(ix.partialFilterExpression?{partialFilterExpression:ix.partialFilterExpression}:{})});
  const tx=new FakeMongoTransactionRunner(db),repo=new MongoContentRepository(db,tx,()=>new Date(NOW));
  const tenancy=new MongoTenancyRepository(db,tx,()=>new Date(NOW));
  const actor=async():Promise<AuthenticatedActor>=>{
    const accountId=parseAccountId(randomUUID()),sessionId=parseSessionId(randomUUID()),sessionLookupId=randomUUID();
    await db.collection<AccountRecord>('accounts').insertOne({accountId,status:'active',displayName:'Synthetic Owner',
      preferredLocale:'en',platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),
      updatedAt:NOW.toISOString(),schemaVersion:1});
    await db.collection<SessionRecord>('sessions').insertOne({sessionId,accountId,sessionLookupId,
      verifierHash:'synthetic-hash',securityVersion:1,createdAt:NOW,authenticatedAt:NOW,lastSeenAt:NOW,
      idleExpiresAt:new Date(NOW.getTime()+3600000),absoluteExpiresAt:new Date(NOW.getTime()+86400000),
      expiresAt:new Date(NOW.getTime()+86400000),authProvider:'github',schemaVersion:1});
    return {accountId,sessionId,sessionLookupId,securityVersion:1,authProvider:'github',authenticatedAt:NOW};
  };
  const a=await actor(),b=await actor();
  const create=(who:AuthenticatedActor,slug:string)=>tenancy.create(who,parseCreationCommand({slug,
    displayName:'Synthetic Owner',identityLabel:'Engineer',introduction:'Private canvas workspace',templatePreset:'signature'}),
    randomUUID(),ORIGIN);
  const pa=await create(a,'canvas-owner-a'),pb=await create(b,'canvas-owner-b');
  return {db,tx,repo,a,b,pa,pb};
}
function snapshot(doc:{sections:unknown[];nodes:unknown[];contentCollections:unknown[]}){
  return {schemaVersion:1,sections:doc.sections,nodes:doc.nodes,contentCollections:doc.contentCollections};
}
function heading(sectionId:string){return {nodeId:randomUUID(),sectionId,componentType:'heading',componentVersion:1,
  props:{level:1,text:'Synthetic Hero'},layout:{mode:'auto',flow:'column'},visualOrder:0,readingOrder:0,
  semanticRole:'h1',interaction:{kind:'none'}};}


test('11.1/11.3 mutation ledger records acknowledged revision without returning private content',async()=>{
  const f=await setup(),source=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId),token=randomUUID();
  const candidate=applyCanvasCommand(source,{type:'insert',nodeId:randomUUID(),componentType:'text',
    sectionId:source.sections[0].sectionId});
  assert.equal((await f.repo.readMutationStatus(f.a,f.pa.portfolioId,token)).status,'unrecognized');
  assert.equal((await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(candidate),0,token)).kind,'saved');
  assert.deepEqual(await f.repo.readMutationStatus(f.a,f.pa.portfolioId,token),
    {status:'acknowledged',revision:1,acknowledgedRevision:1});
  const current=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(current.draftMutationLedger?.length,1);
  assert.equal(JSON.stringify(current.draftMutationLedger).includes('Synthetic Owner'),false);
  assert.equal(f.db.inspect('releases').entries.length,0);
});
test('11.3 lost ACK is safely replayable with identical mutation id, without incrementing revision',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const candidate=applyCanvasCommand(draft,{type:'insert',nodeId:randomUUID(),componentType:'heading',
    sectionId:draft.sections[0].sectionId});const token=randomUUID();
  const first=await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(candidate),0,token);
  const second=await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(candidate),0,token);
  assert.equal(first.kind,'saved');assert.equal(second.kind,'replayed');
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('11.3 old mutation receipt survives a later edit, but reports current server revision',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId),a=randomUUID(),b=randomUUID();
  const first=applyCanvasCommand(draft,{type:'insert',nodeId:randomUUID(),componentType:'text',sectionId:draft.sections[0].sectionId});
  await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(first),0,a);
  const second=applyCanvasCommand(first,{type:'insert',nodeId:randomUUID(),componentType:'text',sectionId:first.sections[0].sectionId});
  await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(second),1,b);
  assert.deepEqual(await f.repo.readMutationStatus(f.a,f.pa.portfolioId,a),
    {status:'acknowledged',revision:2,acknowledgedRevision:1});
  assert.equal((await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(first),0,a)).kind,'replayed');
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,2);
});
test('11.3 stale reuse with changed body is rejected rather than treated as success',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId),token=randomUUID();
  await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(draft),0,token);
  const changed=applyCanvasCommand(draft,{type:'insert',nodeId:randomUUID(),componentType:'text',sectionId:draft.sections[0].sectionId});
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(changed),0,token),
    denied('CONTENT_CONFLICT'));
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('11.4 concurrent tabs, one wins while stale other preserves saved server state',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const left=applyCanvasCommand(draft,{type:'insert',nodeId:randomUUID(),componentType:'heading',sectionId:draft.sections[0].sectionId});
  const right=applyCanvasCommand(draft,{type:'insert',nodeId:randomUUID(),componentType:'text',sectionId:draft.sections[0].sectionId});
  const saved=await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(left),0,randomUUID());
  const conflict=await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(right),0,randomUUID());
  assert.equal(saved.kind,'saved');assert.deepEqual(conflict,{kind:'conflict',currentRevision:1});
  assert.deepEqual((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).nodes,left.nodes);
});
test('11.5 ledger remains bounded after many acknowledged edits',async()=>{
  const f=await setup();let draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  for(let i=0;i<19;i++){
    const candidate=snapshot(draft);
    await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,candidate,i,randomUUID());
    draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  }
  assert.equal(draft.revision,19);assert.equal(draft.draftMutationLedger?.length,16);
  assert.equal(draft.draftMutationLedger?.[0].revision,4);
});
test('11.6 direct mutation lookup is denied for another tenant, even with a valid token',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId),token=randomUUID();
  await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(draft),0,token);
  await assert.rejects(f.repo.readMutationStatus(f.b,f.pa.portfolioId,token),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.getOwnedEditableDraft(f.b,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.readReleaseReadyMediaIds(f.b,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
});
test('11.9 disabled owner portfolio denies new saves and protected preview drafts',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  await f.db.collection('portfolios').findOneAndUpdate({portfolioId:f.pa.portfolioId},
    {$set:{status:'owner_disabled'}},{returnDocument:'after'});
  await assert.rejects(f.repo.getOwnedEditableDraft(f.a,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.readMutationStatus(f.a,f.pa.portfolioId,randomUUID()),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.readReleaseReadyMediaIds(f.a,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(draft),0,randomUUID()),
    denied('CONTENT_NOT_FOUND'));
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('11.8 prepublication reports missing required Hero text, without activating a release',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const broken={...draft,profile:{...draft.profile,displayName:''}};
  const report=buildDraftValidationReport(broken,draft.revision);
  assert.equal(report.valid,false);assert.ok(report.blockers.some(x=>x.path.includes('profile.displayName')));
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
test('11.8 unapproved media remains a blocker even when passed as an ID in the owner draft',async()=>{
  const f=await setup(),draft=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const report=buildDraftValidationReport({...draft,mediaRefs:[randomUUID() as never]},draft.revision);
  assert.ok(report.blockers.some(x=>x.code==='unapproved_media_reference'));
});
