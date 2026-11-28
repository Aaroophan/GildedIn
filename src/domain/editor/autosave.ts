/** Deterministic Issue 11 client-save protocol. No browser or network dependencies. */
export type DraftSavePhase='saved'|'unsaved'|'saving'|'uncertain'|'conflict'|'blocked';
export interface PendingDraftSave {fingerprint:string;expectedRevision:number;clientMutationId:string;}
export interface DraftSaveCursor {revision:number;acknowledgedFingerprint:string;phase:DraftSavePhase;
  pending?:PendingDraftSave;}
export type MutationStatus={status:'acknowledged'|'unrecognized';revision:number;acknowledgedRevision?:number};
export function beginDraftSave(cursor:DraftSaveCursor,fingerprint:string,token:string):DraftSaveCursor{
  if(cursor.pending||cursor.phase==='conflict'||cursor.phase==='blocked'||
    !/^[A-Za-z0-9_-]{8,96}$/.test(token))throw new Error('DRAFT_SAVE_NOT_READY');
  if(fingerprint===cursor.acknowledgedFingerprint)return {...cursor,phase:'saved'};
  return {...cursor,phase:'saving',pending:{fingerprint,expectedRevision:cursor.revision,clientMutationId:token}};
}
export function completeDraftSave(cursor:DraftSaveCursor,token:string,revision:number,
  currentFingerprint:string):DraftSaveCursor{
  if(!cursor.pending||cursor.pending.clientMutationId!==token||
    revision!==cursor.pending.expectedRevision+1)throw new Error('DRAFT_ACK_MISMATCH');
  const fingerprint=cursor.pending.fingerprint;
  return {revision,acknowledgedFingerprint:fingerprint,
    phase:currentFingerprint===fingerprint?'saved':'unsaved'};
}
export function uncertainDraftSave(cursor:DraftSaveCursor):DraftSaveCursor{
  if(!cursor.pending)throw new Error('DRAFT_NOT_IN_FLIGHT');
  return {...cursor,phase:'uncertain'};
}
/** Never conclude an unrecognized operation failed: the ledger is deliberately bounded. */
export function reconcileDraftSave(cursor:DraftSaveCursor,status:MutationStatus,currentFingerprint:string):
  {kind:'acknowledged'|'retry'|'conflict';cursor:DraftSaveCursor}{
  const pending=cursor.pending;if(!pending)throw new Error('DRAFT_NO_PENDING_MUTATION');
  if(status.status==='acknowledged'&&status.acknowledgedRevision===pending.expectedRevision+1&&
    status.revision===status.acknowledgedRevision){
    return {kind:'acknowledged',cursor:completeDraftSave(cursor,pending.clientMutationId,status.revision,currentFingerprint)};
  }
  if(status.status==='unrecognized'&&status.revision===pending.expectedRevision)
    return {kind:'retry',cursor:{...cursor,phase:'saving'}};
  return {kind:'conflict',cursor:{...cursor,phase:'conflict'}};
}
export const DRAFT_RECOVERY_TTL_MS=24*60*60*1000;
export const DRAFT_RECOVERY_MAX_BYTES=120_000;
export interface DraftRecovery {version:1;accountId:string;portfolioId:string;baseRevision:number;
  createdAt:number;expiresAt:number;workspace:{schemaVersion:1;sections:unknown[];nodes:unknown[];contentCollections:unknown[]};}
export function recoveryStorageKey(accountId:string,portfolioId:string):string{
  if(!/^[a-f0-9-]{36}$/.test(accountId)||!/^[a-f0-9-]{36}$/.test(portfolioId))
    throw new Error('INVALID_RECOVERY_ID');
  return `gildedin:unsaved:v1:${accountId}:${portfolioId}`;
}
export function encodeRecovery(value:DraftRecovery):string|null{
  try{const raw=JSON.stringify(value);
    if(new TextEncoder().encode(raw).byteLength>DRAFT_RECOVERY_MAX_BYTES)return null;
    return raw;
  }catch{return null;}
}
/** Parse untrusted sessionStorage only after auth resolved the expected account and portfolio. */
export function readScopedRecovery(raw:string|null,accountId:string,portfolioId:string,now:number):DraftRecovery|null{
  if(!raw||new TextEncoder().encode(raw).byteLength>DRAFT_RECOVERY_MAX_BYTES||!Number.isFinite(now))return null;
  try{const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const v=value as Record<string,unknown>;
    if(Object.keys(v).sort().join(',')!==['version','accountId','portfolioId','baseRevision',
      'createdAt','expiresAt','workspace'].sort().join(','))return null;
    if(v.version!==1||v.accountId!==accountId||v.portfolioId!==portfolioId||
      !Number.isSafeInteger(v.baseRevision)||Number(v.baseRevision)<0||
      typeof v.createdAt!=='number'||typeof v.expiresAt!=='number'||
      v.createdAt>now||v.expiresAt<=now||v.expiresAt-v.createdAt>DRAFT_RECOVERY_TTL_MS)return null;
    const w=v.workspace;
    if(!w||typeof w!=='object'||Array.isArray(w))return null;
    const ws=w as Record<string,unknown>;
    if(Object.keys(ws).sort().join(',')!==['schemaVersion','sections','nodes','contentCollections'].sort().join(',')||
      ws.schemaVersion!==1||!Array.isArray(ws.sections)||!Array.isArray(ws.nodes)||
      !Array.isArray(ws.contentCollections))return null;
    return v as unknown as DraftRecovery;
  }catch{return null;}
}
/** No content is emitted: compared metadata is safe for the private conflict panel. */
export function workspaceDiff(local:{sections:unknown[];nodes:unknown[];contentCollections:unknown[]},
  latest:{sections:unknown[];nodes:unknown[];contentCollections:unknown[]}):string[]{
  const report:string[]=[];
  for(const key of ['sections','nodes','contentCollections'] as const)
    if(JSON.stringify(local[key])!==JSON.stringify(latest[key]))report.push(key==='nodes'?'Canvas blocks and layout':
      key==='sections'?'Section order and visibility':'Reusable content fields and order');
  return report;
}
