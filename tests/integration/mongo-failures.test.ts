import test from 'node:test';
import assert from 'node:assert/strict';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {applyMongoSchemaAndIndexes} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoDurableAuditStore} from '../../src/infrastructure/mongodb/audit.ts';
import {MongoIdentityPersistence} from '../../src/infrastructure/mongodb/identity.ts';
import {MongoMediaQuotaRepository,initializeLocalMediaQuota} from '../../src/infrastructure/mongodb/quota.ts';
import {MongoPublicationRepository,MongoPublicReleaseReader} from '../../src/infrastructure/mongodb/repositories.ts';
import {PersistenceConflict,PersistedRecordRejected} from '../../src/infrastructure/mongodb/driver.ts';
import {parseAccountId,parsePortfolioId,parseMediaId,parseOperationId} from '../../src/shared/domain/identifiers.ts';
import {hashOpaqueToken} from '../../src/server/security/crypto.ts';
import {parseContactRecord,parseReleaseRecord,parseDraftRecord} from '../../src/infrastructure/mongodb/validation.ts';
import type {AccountRecord,PortfolioRecord,SessionRecord,ContactMessageRecord} from '../../src/domain/persistence/models.ts';
const ACCOUNT=parseAccountId('11111111-1111-4111-8111-111111111111');
const ACCOUNT2=parseAccountId('22222222-2222-4222-8222-222222222222');
const PORTFOLIO=parsePortfolioId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
const MEDIA=parseMediaId('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
const O=parseOperationId('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
const DATE='2026-11-19T00:00:00.000Z';
const NOW=new Date('2026-11-20T00:00:00Z');
const signed=()=>({accountId:ACCOUNT,sessionVerified:true as const,securityVersion:0});
const record:PortfolioRecord={portfolioId:PORTFOLIO,ownerAccountId:ACCOUNT,slug:'synthetic-test',displayHandle:'Synthetic',
  status:'active',visibility:'public',activeReleaseId:null,publishSequence:0,securityVersion:0,
  aiAccess:{enabled:false,revocationVersion:0,deniedSourceIds:[]},publicStatisticsEnabled:false,
  quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},createdAt:DATE,updatedAt:DATE,schemaVersion:1};
async function setup(){const db=new FakeMongoDatabase();await applyMongoSchemaAndIndexes(db,true);
  await db.collection<PortfolioRecord>('portfolios').insertOne(record);return db;}

test('3.3 unsupported future/old data versions and malformed BSON are rejected before projection',()=>{
  assert.throws(()=>parseDraftRecord({portfolioId:PORTFOLIO,revision:0,schemaVersion:99}),PersistedRecordRejected);
  assert.throws(()=>parseReleaseRecord({schemaVersion:0}),PersistedRecordRejected);
  assert.throws(()=>parseContactRecord({schemaVersion:1,sender:{$where:'evil'}}),PersistedRecordRejected);
});
test('3.2 session lookup is not authentication without timing-safe verifier and live account status',async()=>{
  const db=await setup();const repo=new MongoIdentityPersistence(db);
  const token='a'.repeat(43);
  const account:AccountRecord={accountId:ACCOUNT,status:'active',displayName:'Synthetic',
    preferredLocale:'en',platformRoles:['user'],securityVersion:0,createdAt:DATE,updatedAt:DATE,schemaVersion:1};
  await repo.insertAccountFromVerifiedProvider(account);
  await assert.rejects(repo.insertAccountFromVerifiedProvider({...account,accountId:ACCOUNT2,platformRoles:['admin']}),PersistenceConflict);
  const sess:SessionRecord={sessionId:'synthetic-session',accountId:ACCOUNT,sessionLookupId:'lookup_synthetic_id_123',
    verifierHash:hashOpaqueToken(token),securityVersion:0,createdAt:new Date(DATE),
    expiresAt:new Date('2026-11-22T00:00:00Z'),schemaVersion:1};
  await db.collection('sessions').insertOne(sess);
  assert.equal(await repo.findUnrevokedSession(sess.sessionLookupId,'b'.repeat(43),NOW),null);
  assert.equal((await repo.findUnrevokedSession(sess.sessionLookupId,token,NOW))?.accountId,ACCOUNT);
  await db.collection('accounts').updateOne({accountId:ACCOUNT},{$inc:{securityVersion:1}});
  assert.equal(await repo.findUnrevokedSession(sess.sessionLookupId,token,NOW),null);
  await db.collection('accounts').updateOne({accountId:ACCOUNT},{$set:{status:'suspended'}});
  assert.equal(await repo.findUnrevokedSession(sess.sessionLookupId,token,NOW),null);
});
test('3.5 public release policy fails closed if no host proof, even when portfolio is present',async()=>{
  const db=await setup();const reader=new MongoPublicReleaseReader(db);
  assert.equal((await reader.getCurrentPublicRelease({portfolioId:PORTFOLIO,hostResolutionVerified:false as never})).kind,'denied');
});
test('3.7 publication before prepared operation marker cannot activate; a crash does not serve orphan release',async()=>{
  const db=await setup();const repo=new MongoPublicationRepository(db,()=>NOW);
  assert.deepEqual(await repo.activate(signed(),{portfolioId:PORTFOLIO,operationId:O,
    releaseId:'cccccccc-cccc-4ccc-8ccc-cccccccccccc' as never,expectedActiveReleaseId:null,
    expectedSecurityVersion:0,expectedPublishSequence:0}),{kind:'not_ready'});
  assert.equal((await new MongoPublicReleaseReader(db).getCurrentPublicRelease({portfolioId:PORTFOLIO,
    hostResolutionVerified:true})).kind,'denied');
});
test('3.8 releasing an abandoned upload requires verified object cleanup and is repeatable',async()=>{
  const db=await setup();await initializeLocalMediaQuota(db,1048576,true,NOW);
  const quota=new MongoMediaQuotaRepository(db,()=>NOW);
  const id='11111111-1111-4111-8111-000000000999';
  await quota.reserve(signed(),{reservationId:id,idempotencyHash:'a'.repeat(64),
    portfolioId:PORTFOLIO,mediaId:MEDIA,kind:'image',bytes:100000,physicalBytes:110000,
    expiresAt:'2026-11-20T00:05:00.000Z'});
  await assert.rejects(quota.release(signed(),id,async()=>false));
  assert.equal((await quota.currentUsage(signed(),PORTFOLIO))?.reservedBytes,100000);
  await quota.release(signed(),id,async()=>true);
  assert.equal((await quota.currentUsage(signed(),PORTFOLIO))?.reservedBytes,0);
  await quota.release(signed(),id,async()=>true);
  await assert.rejects(quota.reserve(signed(),{reservationId:id,idempotencyHash:'a'.repeat(64),
    portfolioId:PORTFOLIO,mediaId:MEDIA,kind:'image',bytes:100000,physicalBytes:110000,
    expiresAt:'2026-11-20T00:05:00.000Z'}),PersistenceConflict);
});
test('3.8 local quota initializer refuses silent cap increases on existing ledger',async()=>{
  const db=await setup();await initializeLocalMediaQuota(db,1048576,true,NOW);
  await assert.rejects(initializeLocalMediaQuota(db,2097152,true,NOW),PersistenceConflict);
  await assert.rejects(initializeLocalMediaQuota(db,1048576,false,NOW));
});
test('3.9 audit port denies without proven transaction; fail-injection rolls back synthetic mutation',async()=>{
  const db=await setup();const noTxn=new MongoDurableAuditStore(db,null);
  const event={eventId:'evt_synthetic_event_01',operationId:O,kind:'moderation.change' as const,
    accountId:ACCOUNT,portfolioId:PORTFOLIO,createdAt:DATE,expiresAt:'2027-01-20T00:00:00Z',
    result:'accepted' as const,reasonCode:'POLICY_CHANGE'};
  let attempts=0;
  await assert.rejects(noTxn.runAtomically(event,async()=>{attempts++;return 1;}));
  assert.equal(attempts,0);
  const runner={execute:async<T>(callback:(session:unknown)=>Promise<T>):Promise<T>=>{
    const before=db.snapshot();try{return await callback({synthetic:true});}
    catch(e){db.restore(before);throw e;}
  }};
  const audits=new MongoDurableAuditStore(db,runner);
  db.inspect('auditEvents').failNextInsert=true;
  await assert.rejects(audits.runAtomically(event,async()=>{
    await db.collection('portfolios').updateOne({portfolioId:PORTFOLIO},{$set:{status:'suspended'}});
    return 42;
  }));
  assert.equal((await db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:PORTFOLIO}))?.status,'active');
  assert.equal((await audits.runAtomically(event,async()=>{
    await db.collection('portfolios').updateOne({portfolioId:PORTFOLIO},{$set:{status:'suspended'}});
    return 42;
  })),42);
  assert.equal((await audits.getEvent(event.eventId,{accountId:ACCOUNT,isApprovedAdmin:false},NOW))?.kind,'moderation.change');
  assert.equal(await audits.getEvent(event.eventId,{accountId:ACCOUNT2,isApprovedAdmin:false},NOW),null);
  assert.equal(await audits.getEvent(event.eventId,{accountId:ACCOUNT,isApprovedAdmin:true},new Date('2027-01-21')),null);
  await assert.rejects(audits.runAtomically(event,async()=>99),PersistenceConflict);
});
