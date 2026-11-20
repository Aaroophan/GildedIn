/** Bounded security audit port. The Mongo durability implementation belongs to Issue 3. */
import type { AccountId, PortfolioId, OperationId } from '../../shared/domain/identifiers.ts';
export type SecurityAuditKind =
  'provider.link'|'provider.unlink'|'session.revoke'|'account.delete'|'publication.activate'|
  'ai.approval.change'|'moderation.change'|'admin.access'|'admin.role.change'|'secret.rotate';
export type SecurityAuditOutcome = 'intent'|'accepted'|'denied'|'failed';
export interface SecurityAuditEvent {
  readonly eventId:string;
  readonly operationId:OperationId;
  readonly kind:SecurityAuditKind;
  readonly accountId:AccountId;
  readonly portfolioId?:PortfolioId;
  readonly createdAt:string;
  readonly result:SecurityAuditOutcome;
  readonly reasonCode:string;
  readonly expiresAt:string;
}
export class AuditStorageUnavailable extends Error {
  constructor() {super('AUDIT_STORAGE_UNAVAILABLE');this.name='AuditStorageUnavailable';}
}
const securityKinds=new Set(['provider.link','provider.unlink','session.revoke','account.delete','publication.activate',
'ai.approval.change','moderation.change','admin.access','admin.role.change','secret.rotate']);
export function projectSecurityAudit(source:SecurityAuditEvent):SecurityAuditEvent {
  if (!securityKinds.has(source.kind)||!/^evt_[A-Za-z0-9_-]{8,64}$/.test(source.eventId)||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(source.operationId)||
    !/^[A-Z][A-Z0-9_]{1,48}$/.test(source.reasonCode)||
    !['intent','accepted','denied','failed'].includes(source.result)||
    !Number.isFinite(Date.parse(source.createdAt))||!Number.isFinite(Date.parse(source.expiresAt))||
    Date.parse(source.expiresAt)<=Date.parse(source.createdAt))throw new Error('INVALID_AUDIT_EVENT');
  // Explicitly omit extra attacker-provided fields and all raw request/private data.
  return {eventId:source.eventId,operationId:source.operationId,kind:source.kind,
    accountId:source.accountId, ...(source.portfolioId===undefined?{}:{portfolioId:source.portfolioId}),
    createdAt:source.createdAt,result:source.result,reasonCode:source.reasonCode,expiresAt:source.expiresAt};
}
export interface SecurityAuditStore {
  /** Must be atomic with the domain state change; never a best-effort independent log. */
  runAtomically<T>(event:SecurityAuditEvent, commit:()=>Promise<T>):Promise<T>;
  /** Must require authenticated actor with a separately verified policy, not a public route. */
  getEvent(eventId:string, actor:{accountId:AccountId; isApprovedAdmin:boolean}, now:Date):Promise<SecurityAuditEvent|null>;
}

/** Deterministic fake for isolated tests only. NOT a production persistence adapter. */
export class InMemoryTestAuditStore implements SecurityAuditStore {
  private readonly events=new Map<string,SecurityAuditEvent>();
  private readonly completed=new Map<string,unknown>();
  private busy:Promise<void>=Promise.resolve();
  public unavailable=false;
  async runAtomically<T>(source:SecurityAuditEvent, commit:()=>Promise<T>):Promise<T> {
    const event=projectSecurityAudit(source);
    if(this.unavailable)throw new AuditStorageUnavailable();
    // Serialized fake to model one atomic, idempotent commit. Real Mongo protocol must prove equivalent behavior.
    let unlock!:()=>void;
    const next=new Promise<void>(resolve=>{unlock=resolve;});
    const previous=this.busy;this.busy=next;
    await previous;
    try {
      if(this.completed.has(event.operationId))return this.completed.get(event.operationId) as T;
      if(this.events.has(event.eventId))throw new Error('AUDIT_EVENT_COLLISION');
      if(this.unavailable)throw new AuditStorageUnavailable();
      const result=await commit();
      this.events.set(event.eventId,event);
      this.completed.set(event.operationId,result);
      return result;
    } finally {unlock();}
  }
  async getEvent(id:string, actor:{accountId:AccountId;isApprovedAdmin:boolean},now:Date):Promise<SecurityAuditEvent|null> {
    if(this.unavailable)throw new AuditStorageUnavailable();
    const e=this.events.get(id);
    if(!e||Date.parse(e.expiresAt)<=now.getTime())return null;
    if(actor.isApprovedAdmin||actor.accountId===e.accountId)return e;
    return null; // indistinguishable from nonexistent event
  }
  countForTest():number{return this.events.size;}
}
