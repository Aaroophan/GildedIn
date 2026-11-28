/** Official MongoDB Node driver, loaded lazily after strict environment preflight.
 * No network in module initialization. NEVER called from test bootstrap or the browser.
 * A verified transaction-capable tier is required for security-critical multi-record writes.
 */
import {loadServerEnvironment} from '../server/config/server.ts';
import {ConfigurationDenied} from '../server/config/preflight.ts';
import type {MongoDatabase} from '../infrastructure/mongodb/driver.ts';
import type {MongoTransactionRunner} from '../infrastructure/mongodb/audit.ts';
import {MongoAuthRepository} from '../infrastructure/mongodb/auth-repository.ts';
import {MongoTenancyRepository} from '../infrastructure/mongodb/tenancy-repository.ts';
import {MongoContentRepository} from '../infrastructure/mongodb/content-repository.ts';
interface DriverClient {
  connect():Promise<unknown>;
  db(name:string):MongoDatabase;
  startSession():{withTransaction<T>(cb:()=>Promise<T>,options?:Record<string,unknown>):Promise<T>;
    endSession():Promise<void>};
}
interface RuntimeRepositories {identity:MongoAuthRepository;tenancy:MongoTenancyRepository;content:MongoContentRepository;}
let cached:Promise<RuntimeRepositories>|undefined;
function approvedLocalMongoUri(uri:string,db:string):boolean{
  return /^mongodb:\/\/(?:127\.0\.0\.1|localhost):27017\/[a-z][a-z0-9_]{2,60}$/.test(uri)&&
    uri.endsWith('/'+db)&&!/(prod|live|tenant|customer)/i.test(db);
}
async function start():Promise<RuntimeRepositories>{
  const env=loadServerEnvironment();
  if(env.APP_ENV==='test'||env.APP_ENV==='preview'||!env.MONGODB_URI)
    throw new ConfigurationDenied('identity-database-disabled');
  if(env.APP_ENV==='local'&&!approvedLocalMongoUri(env.MONGODB_URI,env.MONGODB_DB))
    throw new ConfigurationDenied('local-mongodb-must-be-loopback');
  // The official driver is an explicit required dependency. Do not open a raw socket, bypass
  // the configured driver or silently use an in-memory database outside isolated tests.
  const {MongoClient}=await import('mongodb');
  const client:DriverClient=new MongoClient(env.MONGODB_URI,{maxPoolSize:5,minPoolSize:0,
    serverSelectionTimeoutMS:3000,connectTimeoutMS:3000,retryWrites:true}) as unknown as DriverClient;
  await client.connect();
  const db=client.db(env.MONGODB_DB);
  const transactionRunner:MongoTransactionRunner={execute:async<T>(cb:(session:unknown)=>Promise<T>):Promise<T>=>{
    const session=client.startSession();
    try {
      return await session.withTransaction(()=>cb(session),{
        readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:5000});
    }finally{await session.endSession();}
  }};
  return {identity:new MongoAuthRepository(db,transactionRunner),
    tenancy:new MongoTenancyRepository(db,transactionRunner),
    content:new MongoContentRepository(db,transactionRunner)};
}
async function loadRuntime():Promise<RuntimeRepositories>{
  cached??=start();
  try{return await cached;}catch(e){cached=undefined;throw e;}
}
export async function requireIdentityRepository():Promise<MongoAuthRepository>{
  return (await loadRuntime()).identity;
}
export async function requireTenancyRepository():Promise<MongoTenancyRepository>{
  return (await loadRuntime()).tenancy;
}


export async function requireContentRepository():Promise<MongoContentRepository>{
  return (await loadRuntime()).content;
}
