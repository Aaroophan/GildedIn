/** All API handlers must run on the apex. Do not route tenant subdomains here.
 * Services do their own actor-authorization checks, independent of proxy.ts.
 */
import {randomUUID} from 'node:crypto';
import {createProblem} from '../../shared/domain/api.ts';
import {newRequestId,hashOpaqueToken} from '../security/crypto.ts';
import {requireIdentityRepository} from '../../bootstrap/identity-runtime.ts';
import {loadServerEnvironment} from '../config/server.ts';
import {assertTrustedRequestHost,assertApexMutation,readBoundedJson} from '../http/ingress.ts';
import {IdentityDenied,requireRecentAuthentication} from '../../domain/identity/contracts.ts';
import type {AuthenticatedActor,IdentityProvider} from '../../domain/identity/contracts.ts';
import {SESSION_COOKIE_NAME,parseCookie,cookieForSession,clearSessionCookie,cookieForLinkIntent} from './session-cookie.ts';
import {readOAuthCookie,oauthExchangeCsrf,verifyOAuthExchangeCsrf} from './oauth-handshake.ts';
import {auth} from '../../auth.ts';

const privateHeaders=(requestId:string)=>({'Cache-Control':'private, no-store, max-age=0',
  'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff',
  'X-Request-Id':requestId,'Vary':'Origin, Cookie'});
const send=(value:unknown,status=200,extra:Record<string,string>={})=>{
  const id=newRequestId();return new Response(JSON.stringify(value),{status,headers:{...privateHeaders(id),...extra}});
};
function problem(kind:'unauthorized'|'forbidden'|'notFound'|'unavailable'|'internal',status?:number):Response{
  const id=newRequestId(),p=createProblem(kind,id);
  return new Response(JSON.stringify(p),{status:status??p.status,headers:{...privateHeaders(id),
    'Content-Type':'application/problem+json'}});
}
function mapError(error:unknown):Response{
  if(error instanceof IdentityDenied){
    if(error.code==='NOT_AUTHENTICATED')return problem('unauthorized');
    if(error.code==='REAUTHENTICATION_REQUIRED')return send({code:'REAUTHENTICATION_REQUIRED',
      detail:'Sign in again to complete this sensitive action.'},403);
    if(error.code==='LAST_LOGIN_PROVIDER')return send({code:'LAST_LOGIN_PROVIDER',
      detail:'At least one verified sign-in method must remain.'},409);
    if(error.code==='INVALID_PROFILE')return send({code:'INPUT_VALIDATION_FAILED',
      detail:'Only a valid display name can be updated.'},422);
    if(error.code==='IDENTITY_CONFLICT'||error.code==='ACCOUNT_CONFLICT')return send({
      code:'IDENTITY_CONFLICT',detail:'The identity or account state changed.'},409);
    if(error.code==='CAPABILITY_UNAVAILABLE')return problem('unavailable');
    return problem('forbidden');
  }
  if(error&&typeof error==='object'&&'code' in error&&error.code===11000)
    return send({code:'IDENTITY_CONFLICT',detail:'This operation conflicts with existing state.'},409);
  // Do not echo MongoDB, upstream OAuth, raw headers, tokens, or exception text.
  return problem('unavailable');
}
function guardHost(req:Request,mutating=false):ReturnType<typeof loadServerEnvironment>{
  const env=loadServerEnvironment();
  const policy={canonicalOrigin:env.APP_CANONICAL_ORIGIN,allowLocalhost:env.APP_ENV==='local',csrfExpectedHash:null};
  assertTrustedRequestHost(req,policy);
  if(req.headers.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host)throw new IdentityDenied('NOT_AUTHORIZED');
  if(mutating){
    if(req.headers.get('origin')!==env.APP_CANONICAL_ORIGIN)throw new IdentityDenied('NOT_AUTHORIZED');
    const site=req.headers.get('sec-fetch-site');
    if(site&&site!=='same-origin'&&site!=='none')throw new IdentityDenied('NOT_AUTHORIZED');
  }
  return env;
}
async function withActor(req:Request,mutation:boolean,
  operation:(repo:Awaited<ReturnType<typeof requireIdentityRepository>>,actor:AuthenticatedActor)=>Promise<Response>):Promise<Response>{
  try{
    const env=guardHost(req,mutation),repo=await requireIdentityRepository();
    const cookie=parseCookie(req.headers.get('cookie'),SESSION_COOKIE_NAME);
    const actor=await repo.requireSession(cookie);
    if(mutation){
      const expected=await repo.csrfHash(actor);
      assertApexMutation(req,{canonicalOrigin:env.APP_CANONICAL_ORIGIN,
        allowLocalhost:env.APP_ENV==='local',csrfExpectedHash:expected});
    }
    return await operation(repo,actor);
  }catch(e){return mapError(e);}
}
export const optionsDenied=()=>new Response(null,{status:403,headers:{'Cache-Control':'private, no-store','Vary':'Origin'}});
export function getMe(req:Request){return withActor(req,false,async(repo,actor)=>send(await repo.readPrivateAccount(actor)));}
export function patchMe(req:Request){return withActor(req,true,async(repo,actor)=>{
  const patch=await readBoundedJson(req,4096);
  const changed=await repo.updateProfile(actor,patch);return send(changed);
});}
export function getProviders(req:Request){return withActor(req,false,async(repo,actor)=>{
  const p=await repo.readPrivateAccount(actor);return send({linkedProviders:p.linkedProviders});
});}
export function getAppCsrf(req:Request){return withActor(req,false,async(repo,actor)=>{
  const token=await repo.issueCsrfToken(actor);
  return send({csrfToken:token});
});}
export function postLinkIntent(req:Request){return withActor(req,true,async(repo,actor)=>{
  requireRecentAuthentication(actor,new Date());
  const body=await readBoundedJson(req,1024);
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||
     !Object.hasOwn(body,'provider'))throw new IdentityDenied('NOT_AUTHORIZED');
  const provider=(body as {provider:unknown}).provider;
  if(provider!=='google'&&provider!=='github')throw new IdentityDenied('NOT_AUTHORIZED');
  const conf=loadServerEnvironment();
  if(!conf.AUTH_SECRET || !(provider==='google' ? (conf.AUTH_GOOGLE_ID&&conf.AUTH_GOOGLE_SECRET) :
    (conf.AUTH_GITHUB_ID&&conf.AUTH_GITHUB_SECRET)))throw new IdentityDenied('CAPABILITY_UNAVAILABLE');
  const token=await repo.createLinkIntent(actor,provider);
  return send({provider,authorizationUrl:`/login/link?provider=${provider}`,
    nextStep:'provider_authorization',expiresInSeconds:300},201,{'Set-Cookie':cookieForLinkIntent(token)});
});}
export function deleteProvider(req:Request,identityId:string){return withActor(req,true,async(repo,actor)=>{
  requireRecentAuthentication(actor,new Date());
  await repo.unlink(actor,identityId,randomUUID() as never);
  return send({revoked:true,reauthenticationRequired:true},200,{'Set-Cookie':clearSessionCookie()});
});}
export function revokeAll(req:Request){return withActor(req,true,async(repo,actor)=>{
  requireRecentAuthentication(actor,new Date());
  const body=await readBoundedJson(req,128);
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==0)
    throw new IdentityDenied('NOT_AUTHORIZED');
  await repo.revokeAllSessions(actor,randomUUID() as never);
  return send({revoked:true},200,{'Set-Cookie':clearSessionCookie()});
});}
export function revokeCurrent(req:Request){return withActor(req,true,async(repo,actor)=>{
  const body=await readBoundedJson(req,128);
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==0)
    throw new IdentityDenied('NOT_AUTHORIZED');
  await repo.revokeCurrentSession(actor,randomUUID() as never);
  return send({revoked:true},200,{'Set-Cookie':clearSessionCookie()});
});}

/** Read-only, same-origin handshake CSRF GET. Auth.js itself verifies the encrypted JWT. */
export async function getOAuthReady(req:Request):Promise<Response>{
  try{
    const env=guardHost(req);
    const oauthSession=await auth();const raw=readOAuthCookie(req.headers.get('cookie'));
    if(!raw||!env.AUTH_SECRET||!oauthSession?.user?.id||
       !['google','github'].includes((oauthSession as {gildedinProvider?:unknown}).gildedinProvider as string))
      return problem('unauthorized');
    return send({csrfToken:oauthExchangeCsrf(raw,env.AUTH_SECRET)});
  }catch(e){return mapError(e);}
}
/** Mutation is denied before DB access unless exact apex origin, CSRF, and Auth.js proof agree. */
export async function postOAuthExchange(req:Request):Promise<Response>{
  try{
    const env=guardHost(req,true);
    const oauthSession=await auth();const raw=readOAuthCookie(req.headers.get('cookie'));
    const provider=(oauthSession as {gildedinProvider?:unknown}|null)?.gildedinProvider;
    const accountId=oauthSession?.user?.id;
    if(!raw||!env.AUTH_SECRET||!accountId||(provider!=='google'&&provider!=='github'))
      return problem('unauthorized');
    verifyOAuthExchangeCsrf(req.headers.get('x-csrf-token'),raw,env.AUTH_SECRET);
    // Reuse bounded-content and exact-origin ingress, with a one-time HMAC CSRF token.
    assertApexMutation(req,{canonicalOrigin:env.APP_CANONICAL_ORIGIN,
      allowLocalhost:env.APP_ENV==='local',csrfExpectedHash:hashOpaqueToken(oauthExchangeCsrf(raw,env.AUTH_SECRET))});
    const body=await readBoundedJson(req,128);
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==0)
      throw new IdentityDenied('NOT_AUTHORIZED');
    const repo=await requireIdentityRepository();
    const issued=await repo.exchangeVerifiedOAuthSession(accountId as never,provider as IdentityProvider,raw);
    return send({authenticated:true,next:'/dashboard'},200,{'Set-Cookie':cookieForSession(issued.token,604800)});
  }catch(e){return mapError(e);}
}
