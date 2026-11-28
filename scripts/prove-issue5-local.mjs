/** Real Issue 5 proof in a strictly random, disposable local MongoDB database ONLY.
 * Requires official driver and a transaction-capable local replica set. No env file or
 * caller-supplied DB, internet, OAuth provider, prod credentials or persistent fixture.
 * A synthetic proof never authorizes a live deployment or wildcard TLS claim.
 */
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {assertIsolatedTestEnvironment} from '../src/server/config/preflight.ts';
import {applyMongoSchemaAndIndexes} from '../src/infrastructure/mongodb/manifest.ts';
import {MongoTenancyRepository} from '../src/infrastructure/mongodb/tenancy-repository.ts';
import {parseCreationCommand} from '../src/domain/tenancy/commands.ts';
import {parseCanonicalSlug} from '../src/shared/domain/validation.ts';
import {parsePublicRoute} from '../src/domain/tenancy/routing.ts';
const denied=['MONGODB_URI','MONGODB_DB','APP_ENV','AUTH_SECRET','AUTH_GOOGLE_SECRET',
 'AUTH_GITHUB_SECRET','GROQ_API_KEY','REDIS_REST_TOKEN','VERCEL_ENV','PRODUCTION_MONGODB_URI'];
if(denied.some(k=>process.env[k])){
 console.error('BLOCKED: this proof must run with all database, provider and environment settings unset');process.exit(2);
}
const name=`gildedin_test_${randomBytes(8).toString('hex')}`,uri=`mongodb://127.0.0.1:27017/${name}`;
const env={...process.env,APP_ENV:'test',MONGODB_URI:uri,MONGODB_DB:name,MEDIA_PROVIDER:'memory',
 APP_DOMAIN:'localhost',APP_CANONICAL_ORIGIN:'http://localhost:3000',FEATURE_AI_PLATFORM:'off',
 FEATURE_UPLOADS_PLATFORM:'off',FEATURE_RSS_SYNC:'off',FEATURE_REGISTRATION:'off',APP_WILDCARD_ENABLED:'false'};
try{assertIsolatedTestEnvironment(env);}catch(e){console.error(`BLOCKED: ${e.reason??'unsafe_test_env'}`);process.exit(2);}
let MongoClient;
try{({MongoClient}=await import('mongodb'));}catch{console.error('BLOCKED: official mongodb package not installed');process.exit(2);}
const client=new MongoClient(uri,{directConnection:true,maxPoolSize:3,minPoolSize:0,
 serverSelectionTimeoutMS:2500,connectTimeoutMS:2500,retryWrites:false});
const report={database:'disposable local loopback only',outcomes:{},notes:[]};
let connected=false;
try{
 await client.connect();connected=true;
 const db=client.db(name);await applyMongoSchemaAndIndexes(db,true);
 report.outcomes.schema_and_indexes='PASS';
 const now=new Date(),origin='https://aaroophan.dev',owner1=randomUUID(),owner2=randomUUID();
 const transaction={execute:async cb=>{const session=client.startSession();
   try{return await session.withTransaction(()=>cb(session),{
    readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:5000});}
   finally{await session.endSession();}}};
 const actors=[];
 for(const accountId of [owner1,owner2]){
   const sessionId=randomUUID(),sessionLookupId=randomUUID();
   await db.collection('accounts').insertOne({accountId,status:'active',displayName:'Synthetic owner',
     preferredLocale:'en',platformRoles:['user'],securityVersion:1,createdAt:now.toISOString(),
     updatedAt:now.toISOString(),schemaVersion:1});
   await db.collection('sessions').insertOne({sessionId,sessionLookupId,accountId,
     verifierHash:'synthetic-non-secret-proof',securityVersion:1,createdAt:now,
     authenticatedAt:now,lastSeenAt:now,idleExpiresAt:new Date(now.getTime()+3600_000),
     absoluteExpiresAt:new Date(now.getTime()+7200_000),expiresAt:new Date(now.getTime()+7200_000),
     authProvider:'github',schemaVersion:1});
   actors.push({accountId,sessionId,sessionLookupId,securityVersion:1,authProvider:'github',authenticatedAt:now});
 }
 const repository=new MongoTenancyRepository(db,transaction,()=>new Date());
 const make=slug=>parseCreationCommand({slug,displayName:'Synthetic Engineer',identityLabel:'Engineer',
   introduction:'Local disposable test fixture.',templatePreset:'signature'});
 const first=await repository.create(actors[0],make('proof-owner'),randomUUID(),origin);
 assert.equal((await repository.listOwned(actors[0],origin)).length,1);
 assert.deepEqual(await repository.listOwned(actors[1],origin),[]);
 assert.equal((await repository.resolvePublic(parseCanonicalSlug('proof-owner'),parsePublicRoute('/'),
   'path',origin)).kind,'not_found');
 report.outcomes.atomic_private_create='PASS';
 const aliasKey=randomUUID();const renamed=await repository.rename(actors[0],first.portfolioId,
   parseCanonicalSlug('renamed-owner'),aliasKey,origin);
 assert.equal(renamed.slug,'renamed-owner');
 assert.equal((await repository.rename(actors[0],first.portfolioId,parseCanonicalSlug('renamed-owner'),aliasKey,origin)).slug,
   'renamed-owner');
 assert.equal((await repository.slugAvailability(actors[1],'proof-owner')).available,false);
 report.outcomes.alias_and_idempotent_rename='PASS';
 const collide=await Promise.allSettled([
   repository.create(actors[1],make('proof-owner'),randomUUID(),origin),
   repository.create(actors[1],make('new-owner'),randomUUID(),origin)]);
 assert.equal(collide.filter(p=>p.status==='fulfilled').length,1);
 report.outcomes.concurrent_slug_claims='PASS';
 await assert.rejects(repository.getOwned(actors[1],first.portfolioId,origin));
 const latest=await repository.getOwned(actors[0],first.portfolioId,origin);
 await repository.changePolicy(actors[0],first.portfolioId,'visibility',latest.securityVersion,'unlisted');
 const before=await repository.getOwned(actors[0],first.portfolioId,origin);
 const after=await repository.changePolicy(actors[0],first.portfolioId,'disable',before.securityVersion);
 assert.equal(after.status,'owner_disabled');
 report.outcomes.owner_scoping_and_atomic_policy='PASS';
 const rows=await db.collection('slugClaims').find({portfolioId:first.portfolioId}).sort({claimedAt:1}).limit(10).toArray();
 assert.equal(rows.filter(r=>r.kind==='current').length,1);
 assert.equal(rows.filter(r=>r.kind==='alias').length,1);
 assert.equal(await db.collection('drafts').countDocuments({portfolioId:first.portfolioId}),1);
 assert.equal(await db.collection('renameOperations').countDocuments({portfolioId:first.portfolioId}),1);
 report.outcomes.durable_claim_and_operation_state='PASS';
 console.log(JSON.stringify(report,null,2));
}catch(e){console.error(`BLOCKED: local MongoDB Issue 5 proof failed: ${e?.code??e?.name??'UNAVAILABLE'}`);
 process.exitCode=2;
}finally{
 if(connected){try{await client.db(name).dropDatabase();}catch{
   console.error('BLOCKED: unable to purge generated random disposable test database');process.exitCode=2;
 }}await client.close();
}
