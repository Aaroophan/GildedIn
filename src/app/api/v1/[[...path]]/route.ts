import { NextResponse } from 'next/server';
import { createProblem } from '../../../../shared/domain/api.ts';
import { newRequestId, newOpaqueToken } from '../../../../server/security/crypto.ts';
import { assertTrustedRequestHost, assertApexMutation } from '../../../../server/http/ingress.ts';
import { loadServerEnvironment } from '../../../../server/config/server.ts';
import { makeSecurityHeaders } from '../../../../server/http/headers.ts';

/** All endpoints remain disabled until actual identity, authorization and data ports exist. */
function reject(request: Request, mutation: boolean) {
  const requestId=newRequestId();
  let status=503;
  let problem:ReturnType<typeof createProblem>=createProblem('unavailable',requestId);
  try {
    const configuration=loadServerEnvironment();
    const origin=configuration.APP_CANONICAL_ORIGIN;
    const policy={canonicalOrigin:origin,allowLocalhost:configuration.APP_ENV==='local'||configuration.APP_ENV==='test'||configuration.APP_ENV==='preview',csrfExpectedHash:null};
    if(mutation)assertApexMutation(request,policy);
    else assertTrustedRequestHost(request,policy);
  }catch(error) {
    // No error details; configuration failure is a 503, attacker request a generic 403.
    if ((error as Error).name==='ConfigurationDenied') {problem=createProblem('unavailable',requestId);status=503;}
    else {problem=createProblem('forbidden',requestId);status=403;}
  }
  return NextResponse.json(problem,{status,headers:{'Content-Type':'application/problem+json',
    'X-Request-Id':requestId,...makeSecurityHeaders('api',{nonce:newOpaqueToken()})}});
}
export const GET=(req:Request)=>reject(req,false);
export const POST=(req:Request)=>reject(req,true);
export const PUT=(req:Request)=>reject(req,true);
export const PATCH=(req:Request)=>reject(req,true);
export const DELETE=(req:Request)=>reject(req,true);
export const OPTIONS=()=>new Response(null,{status:403,headers:{'Cache-Control':'private, no-store','Vary':'Origin'}});
