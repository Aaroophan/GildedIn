'use client';
/** UX helper only. Every named mutation is authorized, CSRF-checked and validated on the server. */
import {explainOwnerError} from '../../domain/onboarding/model.ts';
export class OwnerRequestError extends Error{
  constructor(readonly status:number,readonly code?:string){super(explainOwnerError(status,code));}
}
export async function ownerRequest<T>(path:string,method:'POST'|'PATCH'|'PUT'|'DELETE',body:unknown,
  extra:Record<string,string>={}):Promise<T>{
  if(!/^\/api\/v1\/(?:accounts\/me(?:\/[a-zA-Z0-9/_-]+)?|portfolios(?:\/[a-zA-Z0-9/_-]+)?)$/.test(path)||path.includes('//'))
    throw new OwnerRequestError(422);
  const csrf=await fetch('/api/v1/accounts/me/csrf',{credentials:'same-origin',cache:'no-store'});
  if(!csrf.ok)throw new OwnerRequestError(csrf.status);
  const proof=await csrf.json() as {csrfToken?:string};
  if(typeof proof.csrfToken!=='string')throw new OwnerRequestError(503);
  const result=await fetch(path,{method,cache:'no-store',credentials:'same-origin',headers:{
    'Content-Type':'application/json','X-CSRF-Token':proof.csrfToken,...extra},body:JSON.stringify(body)});
  if(!result.ok){let code:string|undefined;
    try{const data=await result.json() as {code?:unknown};if(typeof data.code==='string'&&data.code.length<100)code=data.code;}
    catch{}throw new OwnerRequestError(result.status,code);}
  return result.json() as Promise<T>;
}
