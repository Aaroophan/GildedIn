import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {assertIsolatedTestEnvironment,assertNoUnsafeProductionAdapters,assertNoPublicSecrets,assertLocalTestMongoUri,assertOAuthConfiguration} from '../../src/server/config/preflight.ts';
const safe={APP_ENV:'test',MONGODB_DB:'gildedin_test_12345678',APP_DOMAIN:'localhost',APP_CANONICAL_ORIGIN:'http://localhost:3000',MEDIA_PROVIDER:'memory'};
test('synthetic test identity passes without network credentials',()=>assert.doesNotThrow(()=>assertIsolatedTestEnvironment(safe)));
test('explicit environment cannot be silently inferred from NODE_ENV',()=>{
 assert.throws(()=>assertIsolatedTestEnvironment({...safe,APP_ENV:undefined,NODE_ENV:'test'}));
 assert.throws(()=>assertIsolatedTestEnvironment({...safe,APP_ENV:'local',NODE_ENV:'test'}));
});
test('production environment is rejected even when test runtime says development',()=>{
 for(const wrong of ['production','local','preview','INVALID'])assert.throws(()=>assertIsolatedTestEnvironment({...safe,APP_ENV:wrong,NODE_ENV:'development'}));
});
test('test URI must be loopback and exact isolated DB without credentials',()=>{
 assert.doesNotThrow(()=>assertLocalTestMongoUri('mongodb://127.0.0.1:27017/gildedin_test_12345678','gildedin_test_12345678'));
 for(const uri of ['mongodb+srv://user:pass@cluster.example/test','mongodb://mongo.example:27017/gildedin_test_12345678',
 'mongodb://127.0.0.1:27017/production','mongodb://admin:pass@localhost:27017/gildedin_test_12345678',
 'mongodb://localhost:27017,evil.com:27017/gildedin_test_12345678','mongodb://localhost:27017/gildedin_test_12345678?authSource=admin']) {
   assert.throws(()=>assertLocalTestMongoUri(uri,'gildedin_test_12345678'),uri);
 }
});
test('production-shaped database names are denied independently of URI',()=>{
 for(const name of ['production','gildedin_prod','test','gildedin_test','gildedin_test_prod12345'])assert.throws(()=>assertIsolatedTestEnvironment({...safe,MONGODB_DB:name}));
});
test('all real provider credentials poison a test even when provider disabled',()=>{
 for(const field of ['GROQ_API_KEY','AUTH_SECRET','AUTH_GOOGLE_SECRET','REDIS_REST_TOKEN','BLOB_READ_WRITE_TOKEN','VERCEL_TOKEN']){
   assert.throws(()=>assertIsolatedTestEnvironment({...safe,[field]:'SYNTHETIC_SECRET_NOT_REAL'}),field);
 }
});
test('test denies provider adapters, forged production flags, and wildcard routing',()=>{
 for(const [key,val] of Object.entries({MEDIA_PROVIDER:'approved-object-store',VERCEL:'1',APP_WILDCARD_ENABLED:'true',
   FEATURE_AI_PLATFORM:'on',APP_CANONICAL_ORIGIN:'https://aaroophan.dev'}))assert.throws(()=>assertIsolatedTestEnvironment({...safe,[key]:val}),key);
});
test('public build variables must not use secret-bearing names',()=>{
 assert.throws(()=>assertNoPublicSecrets({...safe,NEXT_PUBLIC_GROQ_API_KEY:'canary'}));
 assert.throws(()=>assertNoPublicSecrets({...safe,NEXT_PUBLIC_AUTH_SECRET:'canary'}));
 assert.doesNotThrow(()=>assertNoPublicSecrets({...safe,NEXT_PUBLIC_TURNSTILE_SITE_KEY:'fake-public-site-key'}));
});
test('production cannot boot without approved provider gates and immutable commit provenance',()=>{
 assert.throws(()=>assertNoUnsafeProductionAdapters({...safe,APP_ENV:'production',APP_CANONICAL_ORIGIN:'https://aaroophan.dev',APP_DOMAIN:'aaroophan.dev'}));
 assert.throws(()=>assertNoUnsafeProductionAdapters({...safe,APP_ENV:'preview',GROQ_API_KEY:'canary'}));
});
test('test bootstrap exits before launching test runner on poisoned environment',()=>{
 const r=spawnSync(process.execPath,['--experimental-strip-types','scripts/test-bootstrap.mjs','unit'],{
 cwd:process.cwd(),encoding:'utf8',timeout:20000,
 env:{...process.env,APP_ENV:'production',MONGODB_DB:'production',GROQ_API_KEY:'fake'},
 });
 assert.notEqual(r.status,0);assert.match(r.stderr,/BLOCKED/);assert.doesNotMatch(r.stdout,/Subtest|tests 1/);
});

test('T-IAM-01 OAuth env refuses missing secrets, split provider pairs and callback mismatch before I/O',()=>{
 const localUri='mongodb://127.0.0.1:27017/gildedin_local';
 const basic={APP_ENV:'local',APP_CANONICAL_ORIGIN:'http://localhost:3000',AUTH_URL:'http://localhost:3000',
  MONGODB_URI:localUri,AUTH_SECRET:'X'.repeat(64)};
 assert.doesNotThrow(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_ID:'local-synthetic-id',AUTH_GOOGLE_SECRET:'local-synthetic-value'}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_ID:'orphan-id'}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_SECRET:'orphan-secret'}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_ID:'i',AUTH_GOOGLE_SECRET:'s',AUTH_URL:'https://other.example'}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_ID:'i',AUTH_GOOGLE_SECRET:'s',AUTH_SECRET:undefined}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GOOGLE_ID:'i',AUTH_GOOGLE_SECRET:'s',AUTH_URL:undefined}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GITHUB_ID:'i',AUTH_GITHUB_SECRET:'s',APP_ENV:'preview'}));
 assert.throws(()=>assertOAuthConfiguration({...basic,AUTH_GITHUB_ID:'i',AUTH_GITHUB_SECRET:'s',MONGODB_URI:undefined}));
 assert.throws(()=>assertIsolatedTestEnvironment({...safe,AUTH_URL:'https://aaroophan.dev'}));
});
