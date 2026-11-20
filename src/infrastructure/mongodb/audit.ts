/** Restricted durable audit adapter. Requires a REAL Mongo transaction from an injected driver
 * session runner. Never pretend two independent Mongo writes are atomic or fall back to in-memory.
 */
import type {MongoDatabase} from './driver.ts';
import {isMongoDuplicateKey,PersistenceConflict} from './driver.ts';
import {AuditStorageUnavailable,projectSecurityAudit} from '../../server/observability/audit.ts';
import type {SecurityAuditStore,SecurityAuditEvent} from '../../server/observability/audit.ts';
import type {AccountId} from '../../shared/domain/identifiers.ts';

export interface MongoTransactionRunner {
  /** `callback` and all business writes must use the same official driver session. */
  execute<T>(callback:(session:unknown)=>Promise<T>):Promise<T>;
}
interface AuditBson extends Omit<SecurityAuditEvent,'createdAt'|'expiresAt'> {
  createdAt:Date;expiresAt:Date;schemaVersion:1;
}
export class MongoDurableAuditStore implements SecurityAuditStore {
  private readonly db:MongoDatabase;
  private readonly transactions:MongoTransactionRunner|null;
  constructor(db:MongoDatabase,transactions:MongoTransactionRunner|null){this.db=db;this.transactions=transactions;}
  async runAtomically<T>(source:SecurityAuditEvent,commit:(ctx?:{mongoSession?:unknown})=>Promise<T>):Promise<T>{
    if(!this.transactions)throw new AuditStorageUnavailable();
    const safe=projectSecurityAudit(source);
    const bson:AuditBson={...safe,createdAt:new Date(safe.createdAt),expiresAt:new Date(safe.expiresAt),schemaVersion:1};
    try{return await this.transactions.execute(async(session)=>{
      // No best-effort append after commit. Business transaction must receive this same session.
      const result=await commit({mongoSession:session});
      await this.db.collection<AuditBson>('auditEvents').insertOne(bson,{session});
      return result;
    });}catch(e){if(isMongoDuplicateKey(e))throw new PersistenceConflict();throw new AuditStorageUnavailable();}
  }
  async getEvent(eventId:string,actor:{accountId:AccountId;isApprovedAdmin:boolean},now:Date):Promise<SecurityAuditEvent|null>{
    if(!/^evt_[A-Za-z0-9_-]{8,64}$/.test(eventId)||!Number.isFinite(now.valueOf()))return null;
    const filter=actor.isApprovedAdmin?{eventId,expiresAt:{$gt:now}}:
      {eventId,accountId:actor.accountId,expiresAt:{$gt:now}};
    const raw=await this.db.collection<AuditBson>('auditEvents').findOne(filter);
    if(!raw||raw.expiresAt<=now)return null;
    const {schemaVersion,_id,...data}=raw as AuditBson & {_id?:unknown};void schemaVersion;void _id;
    return projectSecurityAudit({...data,createdAt:raw.createdAt.toISOString(),expiresAt:raw.expiresAt.toISOString()});
  }
}
/** Only for adapter wiring after the local tier proves transaction support. Official MongoClient.withSession
 * / session.withTransaction should implement `execute`; do not blindly enable on unknown free tiers.
 */
