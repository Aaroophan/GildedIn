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
import {defaultTheme,parseDesignTheme,readOwnerTheme} from '../../src/domain/design/theme.ts';
const NOW=new Date('2026-11-28T09:30:00.000Z');
const denied=(code:string)=>(e:unknown)=>e instanceof ContentDenied&&e.code===code;
async function setup(){
  const db=new FakeMongoDatabase();for(const index of INDEX_MANIFEST)await db.collection(index.collection)
    .createIndex(index.keys,{name:index.name,...(index.unique?{unique:true}:{}),
      ...(index.partialFilterExpression?{partialFilterExpression:index.partialFilterExpression}:{})});
  const tx=new FakeMongoTransactionRunner(db),content=new MongoContentRepository(db,tx,()=>new Date(NOW));
  const tenancy=new MongoTenancyRepository(db,tx,()=>new Date(NOW));
  const seed=async():Promise<AuthenticatedActor>=>{
    const accountId=parseAccountId(randomUUID()),sessionId=parseSessionId(randomUUID()),sessionLookupId=randomUUID();
    const account:AccountRecord={accountId,status:'active',displayName:'Synthetic Creator',preferredLocale:'en',
      platformRoles:['user'],securityVersion:1,createdAt:NOW.toISOString(),updatedAt:NOW.toISOString(),schemaVersion:1};
    await db.collection('accounts').insertOne(account);
    const session:SessionRecord={sessionId,accountId,sessionLookupId,verifierHash:'test',securityVersion:1,
      createdAt:NOW,authenticatedAt:NOW,lastSeenAt:NOW,idleExpiresAt:new Date(NOW.getTime()+3600000),
      absoluteExpiresAt:new Date(NOW.getTime()+86400000),expiresAt:new Date(NOW.getTime()+86400000),
      authProvider:'github',schemaVersion:1};
    await db.collection('sessions').insertOne(session);
    return {accountId,sessionId,sessionLookupId,securityVersion:1,authProvider:'github',authenticatedAt:NOW};
  };
  const a=await seed(),b=await seed();
  const create=(actor:AuthenticatedActor,slug:string)=>tenancy.create(actor,parseCreationCommand({
    slug,displayName:'Synthetic Creator',identityLabel:'Engineer',introduction:'Example-only content.',
    templatePreset:'signature'}),randomUUID(),'https://aaroophan.dev');
  const pa=await create(a,'visual-owner-a'),pb=await create(b,'visual-owner-b');
  return {db,tx,content,a,b,pa,pb};
}
test('8.1 authenticated theme write persists only the owner draft and uses one revision',async()=>{
  const f=await setup(),old=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.deepEqual(readOwnerTheme(old.theme),defaultTheme());
  const theme=defaultTheme('light');
  const saved=await f.content.putTheme(f.a,f.pa.portfolioId,theme,0,randomUUID());
  assert.equal(saved.kind,'saved');
  const fresh=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.deepEqual(fresh.theme,theme);assert.equal(fresh.revision,1);
  assert.deepEqual(fresh.profile,old.profile);assert.deepEqual(fresh.nodes,old.nodes);
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('portfolios').entries[0].activeReleaseId,null);
});
test('8.1 a second tenant cannot read or change another owner theme',async()=>{
  const f=await setup(),theme=defaultTheme('light');
  await assert.rejects(f.content.putTheme(f.b,f.pa.portfolioId,theme,0,randomUUID()),denied('CONTENT_NOT_FOUND'));
  await assert.rejects(f.content.getOwnedDraft(f.b,f.pa.portfolioId),denied('CONTENT_NOT_FOUND'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('8.1 stale theme update cannot overwrite content/concurrent theme writes',async()=>{
  const f=await setup();
  const [x,y]=await Promise.all([
    f.content.putTheme(f.a,f.pa.portfolioId,defaultTheme('light'),0,randomUUID()),
    f.content.putTheme(f.a,f.pa.portfolioId,defaultTheme('dark'),0,randomUUID())]);
  assert.deepEqual([x.kind,y.kind].sort(),['conflict','saved']);
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('8.1 exact mutation replay is idempotent; changed payload with same token conflicts',async()=>{
  const f=await setup(),key=randomUUID(),light=defaultTheme('light');
  const first=await f.content.putTheme(f.a,f.pa.portfolioId,light,0,key);
  assert.equal(first.kind,'saved');
  const replay=await f.content.putTheme(f.a,f.pa.portfolioId,light,0,key);
  assert.equal(replay.kind,'replayed');assert.equal(replay.draft.revision,1);
  await assert.rejects(f.content.putTheme(f.a,f.pa.portfolioId,defaultTheme('dark'),0,key),
    denied('CONTENT_CONFLICT'));
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,1);
});
test('8.1 malformed theme cannot cause a partial draft update',async()=>{
  const f=await setup();
  for(const bad of [
    {...defaultTheme(),colors:{...defaultTheme().colors,focus:'#000000'}},
    {...defaultTheme(),typography:{...defaultTheme().typography,signatureFace:'mistral'}},
    {...defaultTheme(),scene:{...defaultTheme().scene,source:'https://evil.example'}},
    {...defaultTheme(),defaultMotion:'run_forever'},
    {...defaultTheme(),themeVersion:3},
    {type:'replace',theme:defaultTheme(),activeReleaseId:randomUUID()}]){
    await assert.rejects(f.content.putTheme(f.a,f.pa.portfolioId,bad,0,randomUUID()),denied('CONTENT_INVALID'));
  }
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('8.1 unavailable database transaction never claims the theme was saved',async()=>{
  const f=await setup();f.tx.unavailable=true;
  await assert.rejects(f.content.putTheme(f.a,f.pa.portfolioId,defaultTheme('light'),0,randomUUID()),
    denied('CONTENT_UNAVAILABLE'));
  f.tx.unavailable=false;
  assert.equal((await f.content.getOwnedDraft(f.a,f.pa.portfolioId)).revision,0);
});
test('8.1 saved theme remains validated when read back, and audit/publishing are not bypassed',async()=>{
  const f=await setup();
  const result=await f.content.putTheme(f.a,f.pa.portfolioId,parseDesignTheme(defaultTheme('light')),0,randomUUID());
  assert.equal(result.kind,'saved');
  const stored=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.deepEqual(parseDesignTheme(stored.theme),defaultTheme('light'));
  assert.equal(f.db.inspect('releases').entries.length,0);
  assert.equal(f.db.inspect('publishOperations').entries.length,0);
});
test('8.1 theme save cannot erase previously authored composition nodes',async()=>{
  const f=await setup(),old=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  const sectionId=(old.sections[0] as {sectionId:string}).sectionId;
  const layout={schemaVersion:1,nodes:[{nodeId:randomUUID(),sectionId,componentType:'heading',componentVersion:1,
    props:{level:1},contentBinding:{source:'profile',fieldId:'displayName'},
    layout:{mode:'auto',flow:'column'},visualOrder:0,readingOrder:0,semanticRole:'h1',interaction:{kind:'none'}}]};
  const composed=await f.content.putComposition(f.a,f.pa.portfolioId,layout,0,randomUUID());
  assert.equal(composed.kind,'saved');
  const saved=await f.content.putTheme(f.a,f.pa.portfolioId,defaultTheme('light'),1,randomUUID());
  assert.equal(saved.kind,'saved');
  const final=await f.content.getOwnedDraft(f.a,f.pa.portfolioId);
  assert.equal(final.nodes.length,1);assert.equal(final.revision,2);
});
