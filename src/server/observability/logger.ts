/** Allowlisted operational logging: no raw request/header/body/object/exception serialization. */
import { newRequestId } from '../security/crypto.ts';
export type LogLevel = 'debug'|'info'|'warn'|'error';
export type RouteClass = 'platform'|'account'|'owner'|'tenant'|'public-api'|'unknown';
export type ActorCategory = 'anonymous'|'owner'|'administrator'|'system'|'unknown';
export type LogOutcome = 'success'|'denied'|'failure'|'degraded';
export interface LogEvent {
  readonly level:LogLevel;
  readonly event: 'http.request'|'security.denied'|'operation.result'|'provider.unavailable'|'audit.unavailable';
  readonly routeClass:RouteClass;
  readonly actorCategory:ActorCategory;
  readonly outcome:LogOutcome;
  readonly requestId:string;
  readonly operationId?:string;
  readonly code?:string;
  readonly status?:number;
  readonly durationMs?:number;
}
export interface LogSink { write(line: string): void; }
const id=/^(?:req_[A-Za-z0-9_-]{6,64}|op_[A-Za-z0-9_-]{6,64})$/;
const code=/^[A-Z][A-Z0-9_]{1,48}$/;
const eventTypes=new Set(['http.request','security.denied','operation.result','provider.unavailable','audit.unavailable']);
const values={level:new Set(['debug','info','warn','error']), routeClass:new Set(['platform','account','owner','tenant','public-api','unknown']),
 actorCategory:new Set(['anonymous','owner','administrator','system','unknown']),outcome:new Set(['success','denied','failure','degraded'])};
export function projectLog(input: LogEvent, now: () => Date = () => new Date()) {
  if (!Object.entries(values).every(([k,allowed])=>allowed.has(input[k as keyof typeof values] as string)) ||
      !eventTypes.has(input.event) || !id.test(input.requestId) ||
      (input.operationId!==undefined && (!id.test(input.operationId)||!input.operationId.startsWith('op_'))) ||
      (input.code!==undefined && !code.test(input.code)))throw new Error('INVALID_LOG_FIELD');
  const timestamp=now().toISOString();
  if (Number.isNaN(Date.parse(timestamp)))throw new Error('INVALID_CLOCK');
  if(input.status!==undefined&&(!Number.isInteger(input.status)||input.status<100||input.status>599))throw new Error('INVALID_LOG_STATUS');
  if(input.durationMs!==undefined&&(!Number.isSafeInteger(input.durationMs)||input.durationMs<0||input.durationMs>120000))throw new Error('INVALID_LOG_DURATION');
  return {timestamp,level:input.level,event:input.event,routeClass:input.routeClass,actorCategory:input.actorCategory,
    outcome:input.outcome,requestId:input.requestId,
    ...(input.operationId===undefined?{}:{operationId:input.operationId}),
    ...(input.code===undefined?{}:{code:input.code}),
    ...(input.status===undefined?{}:{status:input.status}),
    ...(input.durationMs===undefined?{}:{durationMs:input.durationMs})};
}
export function createLogger(sink:LogSink, now?:()=>Date) {
  let sinkFailureCount=0;
  return Object.freeze({
    record(event:LogEvent):boolean {
      try {sink.write(JSON.stringify(projectLog(event,now)));return true;}
      catch {sinkFailureCount++;return false;} // never echo an exception/body or change authorization
    },
    failedSinks:()=>sinkFailureCount,
    requestId:()=>newRequestId(),
  });
}
export const consoleJsonSink:LogSink={write(line){process.stdout.write(`${line}\n`);}};
