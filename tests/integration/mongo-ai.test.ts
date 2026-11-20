import test from 'node:test';
import assert from 'node:assert/strict';
import {FakeMongoDatabase} from '../../src/testing/mongo-fake.ts';
import {applyMongoSchemaAndIndexes} from '../../src/infrastructure/mongodb/manifest.ts';
import {MongoAIContextRepository} from '../../src/infrastructure/mongodb/ai-context.ts';
import {parseAccountId,parsePortfolioId,parseReleaseId} from '../../src/shared/domain/identifiers.ts';
import type {PortfolioRecord,AIContextRecord} from '../../src/domain/persistence/models.ts';
const A=parseAccountId('11111111-1111-4111-8111-111111111111');
const PA=parsePortfolioId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
const R=parseReleaseId('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
const t='2026-11-20T00:00:00.000Z';
const now=()=>new Date(t);
test('3.9 Gilden context only matches current enabled release and policy, never stale/denied sources',async()=>{
 const db=new FakeMongoDatabase();await applyMongoSchemaAndIndexes(db,true);
 const p:PortfolioRecord={portfolioId:PA,ownerAccountId:A,slug:'synthetic-test',displayHandle:'Fixture',
  status:'active',visibility:'public',activeReleaseId:R,publishSequence:1,securityVersion:0,
  aiAccess:{enabled:false,revocationVersion:5,deniedSourceIds:[]},
  publicStatisticsEnabled:false,quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},
  createdAt:t,updatedAt:t,schemaVersion:1};
 await db.collection<PortfolioRecord>('portfolios').insertOne(p);
 const ctx:AIContextRecord={contextId:'synthetic-ai-context',portfolioId:PA,releaseId:R,
  approvalPolicyVersion:5,contentHash:'c'.repeat(64),status:'ready',
  sources:[{sourceId:'synthetic-public-bio',kind:'profile',approvedText:'Synthetic public developer',
    citationTarget:'/synthetic-test',sourceVersion:1}],createdAt:t,schemaVersion:1};
 await db.collection<AIContextRecord>('aiContexts').insertOne(ctx);
 const reader=new MongoAIContextRepository(db,now);
 const id={portfolioId:PA,hostResolutionVerified:true as const};
 assert.equal(await reader.getCurrentApproved(id),null);
 await db.collection('portfolios').updateOne({portfolioId:PA},{$set:{aiAccess:{...p.aiAccess,enabled:true}}});
 assert.equal((await reader.getCurrentApproved(id))?.sources.length,1);
 await db.collection('portfolios').updateOne({portfolioId:PA},{$set:{aiAccess:{enabled:true,revocationVersion:6,deniedSourceIds:[]}}});
 assert.equal(await reader.getCurrentApproved(id),null);
 await db.collection('portfolios').updateOne({portfolioId:PA},{$set:{aiAccess:{enabled:true,revocationVersion:5,deniedSourceIds:['synthetic-public-bio']}}});
 assert.equal(await reader.getCurrentApproved(id),null);
 await db.collection('portfolios').updateOne({portfolioId:PA},{$set:{aiAccess:{enabled:true,revocationVersion:5,deniedSourceIds:[]},status:'suspended'}});
 assert.equal(await reader.getCurrentApproved(id),null);
});
