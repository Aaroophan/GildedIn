/** Hard bounds and plain-data checking shared by the field, AST and schema parsers. */
import {assertPlainCommand,assertSafeJsonValue} from '../../shared/domain/validation.ts';
import {utf8ByteCount,canonicalJson} from '../../shared/domain/limits.ts';
import {contentIssue} from './errors.ts';
export const MAX_DRAFT_CONTENT_BYTES=350_000;
export function shape(v:unknown,allowed:readonly string[],path:string):Record<string,unknown>{
  try{return assertPlainCommand(v,new Set(allowed));}
  catch{ return contentIssue(path,'invalid_shape','Only documented fields are accepted.'); }
}
export function list(v:unknown,max:number,path:string):unknown[]{
  if(!Array.isArray(v)||v.length>max)return contentIssue(path,'invalid_array','The list is invalid or exceeds its limit.');
  return v;
}
export function string(v:unknown,max:number,path:string,min=0):string{
  if(typeof v!=='string'||[...v].length>max||v.length<min||/\u0000/.test(v))
    return contentIssue(path,'invalid_text','A bounded text value is required.');
  return v;
}
export function integer(v:unknown,min:number,max:number,path:string):number{
  if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)
    return contentIssue(path,'invalid_number','An integer inside the supported range is required.');
  return v;
}
export function flag(v:unknown,path:string):boolean{
  if(typeof v!=='boolean')return contentIssue(path,'invalid_boolean','A boolean is required.');
  return v;
}
export function token(v:unknown,path:string,max=64):string{
  const s=string(v,max,path,1);
  if(!/^[a-z][a-z0-9_-]*$/.test(s)||s.includes('__')||s==='constructor'||s==='prototype'||s.includes('where'))
    return contentIssue(path,'unsafe_identifier','A safe lowercase identifier is required.');
  return s;
}
export function unique<T>(arr:T[],key:(value:T)=>string,path:string):void{
  if(new Set(arr.map(key)).size!==arr.length)contentIssue(path,'duplicate_id','Identifiers must be unique.');
}
export function ensureJson(v:unknown,path:string,maxDepth=14,maxBytes=MAX_DRAFT_CONTENT_BYTES):void{
  try{assertSafeJsonValue(v,maxDepth);if(utf8ByteCount(canonicalJson(v))>maxBytes)throw new Error();}
  catch{return contentIssue(path,'unsafe_json','Unsupported, cyclic, executable or oversized JSON.');}
}
export function dateOnly(v:unknown,path:string):string{
  const s=string(v,10,path,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(`${s}T00:00:00.000Z`))||
    new Date(`${s}T00:00:00.000Z`).toISOString().slice(0,10)!==s)
    return contentIssue(path,'invalid_date','Use a real YYYY-MM-DD date.');
  return s;
}
export function safeHttps(v:unknown,path:string):string{
  const s=string(v,2048,path,1);
  if(/[\u0000-\u0020\u007f<>\\]/.test(s))return contentIssue(path,'invalid_url','A safe HTTPS URL is required.');
  try{
    const u=new URL(s);
    if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||!u.hostname||
      /^(localhost|.*\.(?:localhost|test|local|internal)|\[.*\]|[\d.]+)$/i.test(u.hostname))throw new Error();
    return u.href;
  }catch{return contentIssue(path,'invalid_url','A safe HTTPS URL is required.');}
}
