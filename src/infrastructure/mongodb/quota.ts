/** No-spend media admission. ONE authoritative MongoDB document holds global and per-portfolio
 * committed/reserved counts and reservation leases; the atomic CAS is the admission point.
 * Optional uploadReservations records are secondary journals and never independently grant storage.
 */
import type {MongoDatabase} from './driver.ts';
import {PersistenceConflict,PersistenceUnavailable} from './driver.ts';
import type {VerifiedActor,MediaQuotaRepository} from '../../domain/persistence/ports.ts';
import type {MediaQuotaControlRecord,QuotaLease,QuotaUsage,UploadReservationRecord} from '../../domain/persistence/models.ts';
import type {PortfolioId} from '../../shared/domain/identifiers.ts';
import {parsePortfolioId,parseMediaId,parseAccountId} from '../../shared/domain/identifiers.ts';
import {PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
import {parseUtcTimestamp,assertSafeJsonValue} from '../../shared/domain/validation.ts';
import {MongoTenantRepository} from './repositories.ts';

const empty=():QuotaUsage=>({committedBytes:0,reservedBytes:0,committedPhysicalBytes:0,
  reservedPhysicalBytes:0,committedOriginalFiles:0,reservedOriginalFiles:0});
const nonnegative=(n:number)=>Number.isSafeInteger(n)&&n>=0;
const bounded=(n:number,max:number)=>nonnegative(n)&&n<=max;
function validLedger(raw:MediaQuotaControlRecord):MediaQuotaControlRecord {
  if(!raw||raw.bucketId!=='global:media'||raw.schemaVersion!==1||!nonnegative(raw.revision)||
    !nonnegative(raw.capacityBytes)||raw.capacityBytes===0||!raw.global||!raw.portfolios||!raw.leases)
    throw new PersistenceUnavailable();
  assertSafeJsonValue(raw);
  for(const u of [raw.global,...Object.values(raw.portfolios)]){
    if(Object.keys(empty()).some(k=>!nonnegative(u[k as keyof QuotaUsage])))throw new PersistenceUnavailable();
  }
  for(const [key,l] of Object.entries(raw.leases)){
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27,28}$/i.test(key)||
      !['reserved','committed','released','expired'].includes(l.state)||
      !nonnegative(l.expectedBytes)||!nonnegative(l.physicalBytes))throw new PersistenceUnavailable();
    parsePortfolioId(l.portfolioId);parseAccountId(l.accountId);parseMediaId(l.mediaId);
    parseUtcTimestamp(l.expiresAt);
  }
  return raw;
}
/** One-time explicit bounded bootstrap, never implicitly create unlimited quota on first upload. */
export async function initializeLocalMediaQuota(db:MongoDatabase,capacityBytes:number,approved:boolean,now=new Date()):Promise<void>{
  if(!approved||!Number.isSafeInteger(capacityBytes)||capacityBytes<1||capacityBytes>10*1024*1024*1024)
    throw new PersistenceUnavailable();
  const row:MediaQuotaControlRecord={bucketId:'global:media',revision:0,capacityBytes,
    global:empty(),portfolios:{},leases:{},updatedAt:now.toISOString(),schemaVersion:1};
  try{await db.collection<MediaQuotaControlRecord>('quotaBuckets').insertOne(row);}
  catch(e){if(e&&typeof e==='object'&&'code' in e&&e.code===11000){
    const current=await db.collection<MediaQuotaControlRecord>('quotaBuckets').findOne({bucketId:'global:media'});
    if(!current||current.capacityBytes!==capacityBytes)throw new PersistenceConflict();return;
  }throw e;}
}
export class MongoMediaQuotaRepository implements MediaQuotaRepository {
  private readonly db:MongoDatabase;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,now:()=>Date=()=>new Date()){this.db=db;this.now=now;}
  private async read(){const raw=await this.db.collection<MediaQuotaControlRecord>('quotaBuckets').findOne({bucketId:'global:media'});
    if(!raw)throw new PersistenceUnavailable();return validLedger(raw);}
  private async cas(previous:MediaQuotaControlRecord,next:MediaQuotaControlRecord):Promise<boolean>{
    const updated=await this.db.collection<MediaQuotaControlRecord>('quotaBuckets').updateOne({
      bucketId:'global:media',revision:previous.revision},
      {$set:{global:next.global,portfolios:next.portfolios,leases:next.leases,updatedAt:next.updatedAt},
       $inc:{revision:1}});
    return updated.matchedCount===1;
  }
  private usage(row:MediaQuotaControlRecord,id:PortfolioId):QuotaUsage{return row.portfolios[id]??empty();}
  private adjust(usage:QuotaUsage,d:{[K in keyof QuotaUsage]?:number}):QuotaUsage{
    const result={...usage};
    for(const [key,delta] of Object.entries(d)){
      const k=key as keyof QuotaUsage;result[k]+=delta as number;
      if(!nonnegative(result[k]))throw new PersistenceUnavailable();
    }
    return result;
  }
  async reserve(actor:VerifiedActor,input:{reservationId:string;idempotencyHash:string;portfolioId:PortfolioId;
    mediaId:import('../../shared/domain/identifiers.ts').MediaId;kind:'image'|'resume_pdf';bytes:number;
    physicalBytes:number;expiresAt:string}):Promise<UploadReservationRecord>{
    if(actor?.sessionVerified!==true)throw new PersistenceUnavailable();
    parsePortfolioId(input.portfolioId);parseMediaId(input.mediaId);
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.reservationId)||
      !/^[a-f0-9]{64}$/.test(input.idempotencyHash)||
      !['image','resume_pdf'].includes(input.kind)||!nonnegative(input.bytes)||input.bytes<1||
      input.bytes>(input.kind==='image'?PRODUCT_LIMITS.imageBytes:PRODUCT_LIMITS.pdfBytes)||
      !nonnegative(input.physicalBytes)||input.physicalBytes<input.bytes)throw new PersistenceConflict();
    const expiration=parseUtcTimestamp(input.expiresAt);const now=this.now();
    if(Date.parse(expiration)<=now.getTime()||Date.parse(expiration)>now.getTime()+3600_000)throw new PersistenceConflict();
    const owned=await new MongoTenantRepository(this.db,this.now).getOwnedPortfolio(actor,input.portfolioId);
    if(!owned||!['active','onboarding'].includes(owned.status))throw new PersistenceConflict();
    const journal:UploadReservationRecord={reservationId:input.reservationId,portfolioId:input.portfolioId,
      accountId:actor.accountId,mediaId:input.mediaId,intendedKind:input.kind,claimedBytes:input.bytes,
      quotaBytesReserved:input.physicalBytes,state:'reserved',createdAt:now.toISOString(),
      expiresAt:new Date(expiration),idempotencyHash:input.idempotencyHash,schemaVersion:1};
    for(let tries=0;tries<15;tries++){
      const prior=await this.read();const earlier=prior.leases[input.reservationId];
      if(!earlier && await this.db.collection<UploadReservationRecord>('uploadReservations')
        .findOne({reservationId:input.reservationId}))throw new PersistenceConflict();
      if(earlier){
        if(earlier.accountId!==actor.accountId||earlier.portfolioId!==input.portfolioId||
          earlier.idempotencyHash!==input.idempotencyHash||earlier.mediaId!==input.mediaId||
          earlier.expectedBytes!==input.bytes||earlier.physicalBytes!==input.physicalBytes)
          throw new PersistenceConflict();
        if(earlier.state!=='reserved'||Date.parse(earlier.expiresAt)<=now.getTime())throw new PersistenceConflict();
        // Journal may be missing after a crash. Repair before issuing any upload capability.
        await this.ensureJournal(journal);return journal;
      }
      if(Object.keys(prior.leases).length>=2000)throw new PersistenceUnavailable();
      const local=this.usage(prior,input.portfolioId);
      if(local.committedBytes+local.reservedBytes+input.bytes>PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio||
         local.committedOriginalFiles+local.reservedOriginalFiles+1>PRODUCT_LIMITS.originalMediaFilesPerPortfolio)
        throw new PersistenceConflict();
      if(prior.global.committedPhysicalBytes+prior.global.reservedPhysicalBytes+input.physicalBytes>prior.capacityBytes)
        throw new PersistenceUnavailable();
      const lease:QuotaLease={portfolioId:input.portfolioId,accountId:actor.accountId,
        mediaId:input.mediaId,kind:input.kind,expectedBytes:input.bytes,physicalBytes:input.physicalBytes,
        expiresAt:expiration,state:'reserved',idempotencyHash:input.idempotencyHash};
      const next:MediaQuotaControlRecord={...prior,
        global:this.adjust(prior.global,{reservedBytes:input.bytes,reservedPhysicalBytes:input.physicalBytes,reservedOriginalFiles:1}),
        portfolios:{...prior.portfolios,[input.portfolioId]:this.adjust(local,{reservedBytes:input.bytes,
          reservedPhysicalBytes:input.physicalBytes,reservedOriginalFiles:1})},
        leases:{...prior.leases,[input.reservationId]:lease},updatedAt:now.toISOString()};
      if(await this.cas(prior,next)){
        // Crash between CAS and journal: lease remains safely allocated and can be reconciled by key.
        await this.ensureJournal(journal);return journal;
      }
    }
    throw new PersistenceUnavailable();
  }
  /** Removes terminal lease metadata only after authoritative journal records finalization.
   * Committed original counts remain in the quota aggregate even after lease compaction.
   */
  private async compactTerminal(id:string,state:'committed'|'released'|'expired'):Promise<void>{
    const journal=await this.db.collection<UploadReservationRecord>('uploadReservations').findOne({reservationId:id,state});
    if(!journal)return;
    for(let tries=0;tries<15;tries++){
      const prior=await this.read(),lease=prior.leases[id];
      if(!lease||lease.state!==state)return;
      const leases={...prior.leases};delete leases[id];
      if(await this.cas(prior,{...prior,leases,updatedAt:this.now().toISOString()}))return;
    }
  }
  private async ensureJournal(row:UploadReservationRecord){
    const coll=this.db.collection<UploadReservationRecord>('uploadReservations');
    try{await coll.insertOne(row);}catch(e){
      if(!(e&&typeof e==='object'&&'code' in e&&e.code===11000))throw e;
      const existing=await coll.findOne({reservationId:row.reservationId,portfolioId:row.portfolioId,accountId:row.accountId});
      if(!existing||existing.mediaId!==row.mediaId||existing.idempotencyHash!==row.idempotencyHash)
        throw new PersistenceConflict();
    }
  }
  async finalize(actor:VerifiedActor,reservationId:string,verifiedBytes:number,physicalBytes:number):Promise<void>{
    if(actor?.sessionVerified!==true||!nonnegative(verifiedBytes)||!nonnegative(physicalBytes)||verifiedBytes<1)
      throw new PersistenceConflict();
    for(let tries=0;tries<15;tries++){
      const prior=await this.read(),lease=prior.leases[reservationId];
      if(!lease){
        const journal=await this.db.collection<UploadReservationRecord>('uploadReservations').findOne({reservationId,accountId:actor.accountId,state:'committed'});
        if(journal&&journal.claimedBytes===verifiedBytes&&journal.quotaBytesReserved===physicalBytes)return;
        throw new PersistenceConflict();
      }
      if(lease.accountId!==actor.accountId)throw new PersistenceConflict();
      if(lease.state==='committed'){
        // Can't prove original actual bytes on replay until journal finalized: fail closed.
        const rec=await this.db.collection<UploadReservationRecord>('uploadReservations').findOne({reservationId});
        if(lease.verifiedBytes===verifiedBytes && lease.actualPhysicalBytes===physicalBytes){
          await this.db.collection<UploadReservationRecord>('uploadReservations').updateOne({reservationId,accountId:actor.accountId},
            {$set:{state:'committed',claimedBytes:verifiedBytes,quotaBytesReserved:physicalBytes,
              purgeAfter:new Date(this.now().getTime()+7*86400_000)}});
          await this.compactTerminal(reservationId,'committed');return;
        }
        throw new PersistenceConflict();
      }
      if(lease.state!=='reserved'||Date.parse(lease.expiresAt)<=this.now().getTime()||
        verifiedBytes>lease.expectedBytes||physicalBytes>lease.physicalBytes||physicalBytes<verifiedBytes)
        throw new PersistenceConflict();
      const local=this.usage(prior,lease.portfolioId);
      const d={reservedBytes:-lease.expectedBytes,reservedPhysicalBytes:-lease.physicalBytes,
        reservedOriginalFiles:-1,committedBytes:verifiedBytes,committedPhysicalBytes:physicalBytes,committedOriginalFiles:1};
      const next:MediaQuotaControlRecord={...prior,global:this.adjust(prior.global,d),
        portfolios:{...prior.portfolios,[lease.portfolioId]:this.adjust(local,d)},
        leases:{...prior.leases,[reservationId]:{...lease,state:'committed',verifiedBytes,actualPhysicalBytes:physicalBytes}},updatedAt:this.now().toISOString()};
      if(await this.cas(prior,next)){
        // If journal update fails, committed capacity is NOT released automatically.
        await this.db.collection<UploadReservationRecord>('uploadReservations').updateOne({
          reservationId,accountId:actor.accountId,state:{$in:['reserved','finalizing']}},
          {$set:{state:'committed',claimedBytes:verifiedBytes,quotaBytesReserved:physicalBytes,
            purgeAfter:new Date(this.now().getTime()+7*86400_000)}});
        await this.compactTerminal(reservationId,'committed');
        return;
      }
    }
    throw new PersistenceUnavailable();
  }
  async release(actor:VerifiedActor,reservationId:string,cleanupConfirmed:()=>Promise<boolean>):Promise<void>{
    if(actor?.sessionVerified!==true)throw new PersistenceUnavailable();
    if(!await cleanupConfirmed())throw new PersistenceUnavailable(); // physical cleanup proof is required
    for(let tries=0;tries<15;tries++){
      const prior=await this.read(),lease=prior.leases[reservationId];
      if(!lease){const journal=await this.db.collection<UploadReservationRecord>('uploadReservations').findOne({reservationId,accountId:actor.accountId,state:'released'});
        if(journal)return;throw new PersistenceConflict();}
      if(lease.accountId!==actor.accountId)throw new PersistenceConflict();
      if(lease.state==='released'||lease.state==='expired')return;
      if(lease.state==='committed')throw new PersistenceConflict(); // never delete a committed original via failed-intent cleanup
      const d={reservedBytes:-lease.expectedBytes,reservedPhysicalBytes:-lease.physicalBytes,reservedOriginalFiles:-1};
      const next:MediaQuotaControlRecord={...prior,global:this.adjust(prior.global,d),
        portfolios:{...prior.portfolios,[lease.portfolioId]:this.adjust(this.usage(prior,lease.portfolioId),d)},
        leases:{...prior.leases,[reservationId]:{...lease,state:'released'}},updatedAt:this.now().toISOString()};
      if(await this.cas(prior,next)){
        await this.db.collection<UploadReservationRecord>('uploadReservations').updateOne({reservationId,accountId:actor.accountId},
          {$set:{state:'released',purgeAfter:new Date(this.now().getTime()+7*86400_000)}});
        await this.compactTerminal(reservationId,'released');
        return;
      }
    }
    throw new PersistenceUnavailable();
  }
  async reconcileExpired(now:Date,cleanupConfirmed:(reservationId:string)=>Promise<boolean>):Promise<number>{
    if(!Number.isFinite(now.valueOf()))throw new PersistenceConflict();let count=0;
    const initial=await this.read();
    for(const [id,original] of Object.entries(initial.leases)){
      if(original.state!=='reserved'||Date.parse(original.expiresAt)>now.getTime())continue;
      if(!await cleanupConfirmed(id))continue; // unknown physical state => capacity retained, no charge risk
      for(let tries=0;tries<15;tries++){
        const prior=await this.read(),lease=prior.leases[id];
        if(!lease||lease.state!=='reserved'||Date.parse(lease.expiresAt)>now.getTime())break;
        const d={reservedBytes:-lease.expectedBytes,reservedPhysicalBytes:-lease.physicalBytes,reservedOriginalFiles:-1};
        const next:MediaQuotaControlRecord={...prior,global:this.adjust(prior.global,d),
          portfolios:{...prior.portfolios,[lease.portfolioId]:this.adjust(this.usage(prior,lease.portfolioId),d)},
          leases:{...prior.leases,[id]:{...lease,state:'expired'}},updatedAt:now.toISOString()};
        if(await this.cas(prior,next)){
          // Missing journal after prior crash is safe: same ledger is authoritative.
          await this.db.collection<UploadReservationRecord>('uploadReservations').updateOne({reservationId:id},
            {$set:{state:'expired',purgeAfter:new Date(now.getTime()+7*86400_000)}});
          await this.compactTerminal(id,'expired');count++;break;
        }
        if(tries===14)throw new PersistenceUnavailable();
      }
    }
    return count;
  }
  async currentUsage(actor:VerifiedActor,id:PortfolioId):Promise<QuotaUsage|null>{
    if(actor?.sessionVerified!==true||!await new MongoTenantRepository(this.db,this.now).getOwnedPortfolio(actor,id))return null;
    const state=await this.read();return {...this.usage(state,id)};
  }
}
