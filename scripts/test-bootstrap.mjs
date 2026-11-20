/** The first script in EVERY supported test command; refuse poisoned env before child process / socket. */
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import process from 'node:process';
const root=resolve(import.meta.dirname,'..');
const env={...process.env};
if (env.APP_ENV && env.APP_ENV !== 'test') {console.error('BLOCKED: tests require APP_ENV=test');process.exit(2);}
if (env.MONGODB_DB && !/^gildedin_test_[a-z0-9]{8,50}$/.test(env.MONGODB_DB)) {console.error('BLOCKED: unsafe database scope');process.exit(2);}
env.APP_ENV='test';
env.MONGODB_DB??=`gildedin_test_${randomBytes(8).toString('hex')}`;
env.MEDIA_PROVIDER??='memory';
env.APP_DOMAIN??='localhost';
env.APP_CANONICAL_ORIGIN??='http://localhost:3000';
env.FEATURE_AI_PLATFORM??='off';env.FEATURE_UPLOADS_PLATFORM??='off';env.FEATURE_RSS_SYNC??='off';env.FEATURE_REGISTRATION??='off';
env.APP_WILDCARD_ENABLED??='false';
const preflight=await import('../src/server/config/preflight.ts');
try {preflight.assertIsolatedTestEnvironment(env);} catch(e) {console.error(`BLOCKED: ${e.reason??'unsafe-test-environment'}`);process.exit(2);}
const scripts = {
 unit:['--test','tests/unit/*.test.ts','tests/security/*.test.ts'],
 integration:['--test','tests/integration/*.test.ts'],
 all:['--test','tests/unit/*.test.ts','tests/security/*.test.ts','tests/integration/*.test.ts'],
};
const lane=process.argv[2]??'all';if(!scripts[lane]){console.error('Unknown test lane');process.exit(2);}
const files=scripts[lane].slice(1).flatMap(glob => {
 const {readdirSync}=requireDirectory();
 const directory=resolve(root,glob.split('/').slice(0,-1).join('/'));
 try{return readdirSync(directory).filter(n=>n.endsWith('.test.ts')).map(n=>resolve(directory,n));}catch{return [];}
});
function requireDirectory(){return {readdirSync:fsReaddirSync};}
import {readdirSync as fsReaddirSync} from 'node:fs';
if(files.length===0){console.error('BLOCKED: no tests found');process.exit(2);}
const result=spawnSync(process.execPath,['--experimental-strip-types','--test',...files],{cwd:root,env,stdio:'inherit',timeout:120000});
process.exit(result.status??2);
