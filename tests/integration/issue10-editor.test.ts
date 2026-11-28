/** Synthetic Mongo transactions: the canvas never bypasses live account/session/tenant checks. */
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
import {applyCanvasCommand,newEditorSection} from '../../src/domain/editor/commands.ts';
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

test('10.1/10.10 authorized owner can save an authored block and optional private section in one revision',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const additional=newEditorSection('about',randomUUID(),old.sections);
  const candidate=applyCanvasCommand(old,{type:'addSection',section:additional});
  const next=applyCanvasCommand(candidate,{type:'insert',componentType:'heading',sectionId:old.sections[0].sectionId,
    nodeId:randomUUID(),props:{level:1,text:'Owned hero'}});
  const result=await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(next),0,randomUUID());
  assert.equal(result.kind,'saved');const saved=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(saved.revision,1);assert.equal(saved.nodes.length,1);assert.equal(saved.sections.length,2);
  assert.equal(saved.sections[1].searchEligible,false);assert.equal(saved.sections[1].aiSectionApproved,false);
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
test('10.10 guessed foreign portfolio ID cannot read, write or overwrite another owner draft',async()=>{
  const f=await setup(),doc=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  await assert.rejects(f.repo.putEditorWorkspace(f.b,f.pa.portfolioId,snapshot(doc),0,randomUUID()),
    denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.repo.getOwnedDraft(f.b,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('10.9/10.10 two competing editor saves have exactly one winning revision',async()=>{
  const f=await setup(),source=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const x=applyCanvasCommand(source,{type:'insert',nodeId:randomUUID(),componentType:'text',sectionId:source.sections[0].sectionId});
  const y=applyCanvasCommand(source,{type:'insert',nodeId:randomUUID(),componentType:'heading',sectionId:source.sections[0].sectionId});
  const [a,b]=await Promise.all([f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(x),0,randomUUID()),
    f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(y),0,randomUUID())]);
  assert.deepEqual([a.kind,b.kind].sort(),['conflict','saved']);
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('10.9 replay of exact acknowledged editor snapshot is idempotent; token misuse conflicts',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const candidate=applyCanvasCommand(old,{type:'insert',nodeId:randomUUID(),componentType:'heading',
    sectionId:old.sections[0].sectionId});
  const payload=snapshot(candidate),token=randomUUID();
  assert.equal((await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,payload,0,token)).kind,'saved');
  assert.equal((await f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,payload,0,token)).kind,'replayed');
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(old),0,token),
    denied('CONTENT_CONFLICT'));
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('10.10 invalid owner mutations cannot alter Hero visibility or import approval metadata',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  const hidden=snapshot(old);hidden.sections=structuredClone(old.sections).map(s=>({...s,visible:false}));
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,hidden,0,randomUUID()),
    denied('CONTENT_INVALID'));
  const approved=snapshot(old);approved.sections=structuredClone(old.sections).map(s=>({...s,aiSectionApproved:true}));
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,approved,0,randomUUID()),
    denied('CONTENT_INVALID'));
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('10.10 server rejects changed content collections and approval control surfaces',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  for(const addition of [{aiApprovals:{allowAll:true}},{profile:{displayName:'Injected'}},
    {activeReleaseId:randomUUID()},{ownerAccountId:f.b.accountId}]){
    await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,{...snapshot(old),...addition},0,randomUUID()),
      denied('CONTENT_INVALID'));
  }
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('10.10 unknown visual block, code props and foreign content target never persist',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId),sid=old.sections[0].sectionId;
  for(const modifications of [{componentType:'script'}, {props:{html:'<script>alert(1)</script>'}},
    {contentBinding:{source:'collectionItem',collectionId:'other',contentId:randomUUID(),fieldId:'value'}}]){
    const bad={...heading(sid),...modifications};
    await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,
      {...snapshot(old),nodes:[bad]},0,randomUUID()),denied('CONTENT_INVALID'));
  }
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).nodes.length,0);
});
test('10.10 failed database transaction leaves the previous draft and release pointer untouched',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);f.tx.unavailable=true;
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(old),0,randomUUID()),
    denied('CONTENT_UNAVAILABLE'));
  f.tx.unavailable=false;
  assert.equal((await f.repo.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
test('10.10 revoked session is denied before any editor draft side effect',async()=>{
  const f=await setup(),old=await f.repo.getOwnedDraft(f.a,f.pa.portfolioId);
  await f.db.collection<SessionRecord>('sessions').findOneAndUpdate({sessionId:f.a.sessionId},
    {$set:{revokedAt:NOW}},{});
  await assert.rejects(f.repo.putEditorWorkspace(f.a,f.pa.portfolioId,snapshot(old),0,randomUUID()),
    denied('CONTENT_NOT_AUTHORIZED'));
  assert.equal(f.db.inspect('releases').entries.length,0);
});
