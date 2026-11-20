/** Optional live-local ONLY MongoDB verification. Never loads .env, production credentials,
 * shared cloud databases or any tenant information. Requires official mongodb Node driver
 * installed and localhost mongod; neither is available in the isolated artifact environment.
 */
import {randomBytes,randomUUID} from 'node:crypto';
import {assertIsolatedTestEnvironment} from '../src/server/config/preflight.ts';
import {applyMongoSchemaAndIndexes} from '../src/infrastructure/mongodb/manifest.ts';
const suffix=randomBytes(8).toString('hex');
const name=`gildedin_test_${suffix}`;
const uri=`mongodb://127.0.0.1:27017/${name}`;
const env={...process.env,APP_ENV:'test',MONGODB_URI:uri,MONGODB_DB:name,
  MEDIA_PROVIDER:'memory',APP_DOMAIN:'localhost',APP_CANONICAL_ORIGIN:'http://localhost:3000',
  FEATURE_AI_PLATFORM:'off',FEATURE_UPLOADS_PLATFORM:'off',FEATURE_RSS_SYNC:'off',
  FEATURE_REGISTRATION:'off',APP_WILDCARD_ENABLED:'false'};
// Existing poisoned environment must be rejected rather than overwritten for a live socket.
for(const key of ['MONGODB_URI','MONGODB_DB','APP_ENV','AUTH_SECRET','AUTH_GOOGLE_SECRET',
  'AUTH_GITHUB_SECRET','GROQ_API_KEY','REDIS_REST_TOKEN','VERCEL_ENV','PRODUCTION_MONGODB_URI']){
  if(process.env[key]){console.error(`BLOCKED: ${key} must not be set for local isolated proof`);process.exit(2);}
}
try{assertIsolatedTestEnvironment(env);}catch(error){console.error(`BLOCKED: ${error.reason??'unsafe-environment'}`);process.exit(2);}
const driverPackage='mongodb';
let MongoClient;
try{({MongoClient}=await import(driverPackage));}
catch{console.error('BLOCKED: official MongoDB Node driver is not installed. Install a reviewed version, update the lockfile, and rerun locally.');process.exit(2);}
const samples=process.argv.includes('--samples=500')?500:100;
const client=new MongoClient(uri,{serverSelectionTimeoutMS:2500,connectTimeoutMS:2500,maxPoolSize:2,
  retryWrites:false,directConnection:true});
const proof={scope:'random local disposable database only',samples,results:{},actualTier:'local-mongod'};
let connected=false;
try{
  await client.connect();connected=true;
  const db=client.db(name);
  await applyMongoSchemaAndIndexes(db,true);
  proof.results.validators_and_indexes='PASS';
  const tenantId=randomUUID(),accountId=randomUUID();
  await db.collection('portfolios').insertOne({portfolioId:tenantId,ownerAccountId:accountId,
    slug:'synthetic-local',displayHandle:'Local proof',status:'active',visibility:'public',activeReleaseId:null,
    publishSequence:0,securityVersion:0,aiAccess:{enabled:false,revocationVersion:0,deniedSourceIds:[]},
    publicStatisticsEnabled:false,quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),schemaVersion:1});
  let uniqueDenied=false;
  try{await db.collection('portfolios').insertOne({portfolioId:randomUUID(),ownerAccountId:accountId,
    slug:'synthetic-other',displayHandle:'Local proof',status:'active',visibility:'public',activeReleaseId:null,
    publishSequence:0,securityVersion:0,aiAccess:{enabled:false,revocationVersion:0,deniedSourceIds:[]},
    publicStatisticsEnabled:false,quotaSummary:{originalFileCount:0,usedBytes:0,reservedBytes:0},
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),schemaVersion:1});}
  catch(e){if(e.code===11000)uniqueDenied=true;else throw e;}
  proof.results.unique_owner_portfolio=uniqueDenied?'PASS':'FAIL';
  await db.collection('slugClaims').insertOne({slugNormalized:'synthetic-alias',portfolioId:tenantId,
    kind:'alias',claimedAt:new Date().toISOString(),schemaVersion:1});
  let aliasDenied=false;
  try{await db.collection('slugClaims').insertOne({slugNormalized:'synthetic-alias',portfolioId:randomUUID(),
    kind:'current',claimedAt:new Date().toISOString(),schemaVersion:1});}
  catch(e){if(e.code===11000)aliasDenied=true;else throw e;}
  proof.results.alias_unique_across_history=aliasDenied?'PASS':'FAIL';
  await db.collection('drafts').insertOne({portfolioId:tenantId,revision:0,schemaVersion:1,
    rendererVersion:'1.0',profile:{},sections:[],collectionDefinitions:[],contentCollections:[],nodes:[],
    theme:{},navigation:{},seo:{},aiApprovals:{},mediaRefs:[],createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),updatedBy:accountId});
  const first=await db.collection('drafts').findOneAndUpdate({portfolioId:tenantId,revision:0},{$inc:{revision:1}},
    {returnDocument:'after'});
  const second=await db.collection('drafts').findOneAndUpdate({portfolioId:tenantId,revision:0},{$inc:{revision:1}},
    {returnDocument:'after'});
  proof.results.single_document_cas=first?.revision===1&&second===null?'PASS':'FAIL';
  const iso=await db.collection('drafts').findOne({portfolioId:tenantId,revision:1});
  proof.results.isolated_tenant_read=iso&&iso.updatedBy===accountId?'PASS':'FAIL';
  let transactions='BLOCKED';
  try{const session=client.startSession();try{await session.withTransaction(async()=>{
    await db.collection('accounts').findOne({accountId:randomUUID()},{session});
  });transactions='PASS';}finally{await session.endSession();}}
  catch{transactions='BLOCKED - standalone or selected tier does not prove multi-document transactions';}
  proof.results.transactions=transactions;
  // Planning scale fixture; this measures *local* storage only, not Atlas Free entitlement.
  for(let i=0;i<samples;i++){
    const id=randomUUID();await db.collection('accounts').insertOne({accountId:id,status:'active',
      displayName:`Synthetic ${i}`,preferredLocale:'en',platformRoles:['user'],securityVersion:0,
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),schemaVersion:1});
  }
  const counted=await db.collection('accounts').countDocuments();
  proof.results.sample_records=counted===samples?'PASS':'FAIL';
  const explain=await db.collection('accounts').find({accountId:randomUUID()}).limit(1).explain('executionStats');
  proof.results.query_examined_docs=explain.executionStats?.totalDocsExamined??'unknown';
  try{const size=await db.command({collStats:'accounts'});proof.results.account_collection_bytes=size.size??'unknown';}
  catch{proof.results.account_collection_bytes='BLOCKED: cluster may disallow collStats';}
  console.log(JSON.stringify(proof,null,2));
  if(Object.values(proof.results).includes('FAIL'))process.exitCode=1;
}catch(e){console.error(`BLOCKED: local MongoDB proof could not complete: ${e?.code??e?.name??'UNAVAILABLE'}`);process.exitCode=2;}
finally{if(connected){
  // The only drop target is the random DB created in this process, never supplied by a caller.
  try{await client.db(name).dropDatabase();}catch{console.error('BLOCKED: synthetic local database cleanup failed; remove only the generated gildedin_test_ namespace after verification');process.exitCode=2;}
}await client.close();}
