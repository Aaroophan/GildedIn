/** Named owner API adapters: exact apex host, opaque session, fresh live account, CSRF and field allowlists. */
import {requireApexActor} from '../identity/http.ts';
import {requireTenancyRepository} from '../../bootstrap/identity-runtime.ts';
import {loadServerEnvironment} from '../config/server.ts';
import {readBoundedJson,assertTrustedRequestHost} from '../http/ingress.ts';
import {newRequestId} from '../security/crypto.ts';
import {createProblem} from '../../shared/domain/api.ts';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {TenancyDenied,parseCreationCommand,parseRenameCommand,
  parseVisibilityCommand,readIdempotencyKey,requireEmptyCommand} from '../../domain/tenancy/commands.ts';
import type {AuthenticatedActor} from '../../domain/identity/contracts.ts';

const headers=(id:string)=>({'Content-Type':'application/json; charset=utf-8',
  'X-Content-Type-Options':'nosniff','X-Request-Id':id,'Cache-Control':'private, no-store, max-age=0',
  'Vary':'Cookie, Origin, Host','X-Robots-Tag':'noindex, nofollow'});
function respond(payload:unknown,status=200):Response{
  const id=newRequestId();return new Response(JSON.stringify(payload),{status,headers:headers(id)});
}
export function tenancyError(e:unknown):Response {
  const id=newRequestId();
  if(e instanceof TenancyDenied){
    const status=e.code==='INVALID_COMMAND'?422:e.code==='NOT_FOUND'?404:
      e.code==='NOT_AUTHORIZED'?403:e.code==='NOT_PUBLISHED'?409:
      e.code==='MODERATED'?403:e.code==='SLUG_UNAVAILABLE'||e.code==='PORTFOLIO_ALREADY_EXISTS'||e.code==='CONFLICT'?409:503;
    const title=status===422?'Invalid request':status===404?'Resource not found':
      status===409?'Conflict':status===503?'Temporarily unavailable':'Access denied';
    const safe=e.code==='PORTFOLIO_ALREADY_EXISTS'?'PORTFOLIO_ALREADY_EXISTS':
      e.code==='SLUG_UNAVAILABLE'?'SLUG_UNAVAILABLE':
      e.code==='INVALID_COMMAND'?'INPUT_VALIDATION_FAILED':e.code==='CONFLICT'?'PRECONDITION_FAILED':
      status===404?'RESOURCE_NOT_FOUND':status===503?'CAPABILITY_UNAVAILABLE':'ACCESS_DENIED';
    return new Response(JSON.stringify({type:'https://aaroophan.dev/problems/portfolio',title,status,
      detail:'The requested portfolio action cannot be completed.',code:safe,requestId:id}),
      {status,headers:{...headers(id),'Content-Type':'application/problem+json'}});
  }
  const kind=e&&typeof e==='object'&&'code' in e&&e.code==='NOT_AUTHENTICATED'?'unauthorized':
    e&&typeof e==='object'&&'httpStatus' in e?'forbidden':'unavailable';
  const problem=createProblem(kind,id);
  return new Response(JSON.stringify(problem),{status:problem.status,
    headers:{...headers(id),'Content-Type':'application/problem+json'}});
}
async function operation(req:Request,mutation:boolean,
  cb:(actor:AuthenticatedActor)=>Promise<Response>):Promise<Response>{
  try{return await cb(await requireApexActor(req,mutation));}
  catch(e){return tenancyError(e);}
}
function origin(){return loadServerEnvironment().APP_CANONICAL_ORIGIN;}
function idempotency(req:Request){return readIdempotencyKey(req.headers.get('idempotency-key'));}
function id(raw:string){try{return parsePortfolioId(raw);}catch{throw new TenancyDenied('NOT_FOUND');}}
export function createPortfolio(req:Request):Promise<Response>{return operation(req,true,async actor=>{
  const body=parseCreationCommand(await readBoundedJson(req,4096));
  const result=await (await requireTenancyRepository()).create(actor,body,idempotency(req),origin());
  return respond({...result,dashboardUrl:`/dashboard/portfolios/${result.portfolioId}/editor`},201);
});}
/** Owner-only singleton list. No arbitrary owner filter or projection is accepted. */
export function listOwnedPortfolios(req:Request):Promise<Response>{return operation(req,false,async actor=>{
  const url=new URL(req.url);
  if(url.search)throw new TenancyDenied('INVALID_COMMAND');
  const items=await (await requireTenancyRepository()).listOwned(actor,origin());
  return respond({items});
});}
/** Advisory only. A unique index remains the last authority at actual claim time. */
export function getSlugAvailability(req:Request):Promise<Response>{return operation(req,false,async actor=>{
  const url=new URL(req.url),params=[...url.searchParams.entries()];
  if(url.search.length>100||params.length!==1||params[0][0]!=='slug'||!params[0][1])
    throw new TenancyDenied('INVALID_COMMAND');
  const result=await (await requireTenancyRepository()).slugAvailability(actor,params[0][1]);
  return respond({...result,advisory:true});
});}
export function getOwnedPortfolio(req:Request,rawId:string):Promise<Response>{return operation(req,false,async actor=>{
  const result=await (await requireTenancyRepository()).getOwned(actor,id(rawId),origin());return respond(result);
});}
export function renamePortfolio(req:Request,rawId:string):Promise<Response>{return operation(req,true,async actor=>{
  const body=parseRenameCommand(await readBoundedJson(req,1024));
  const result=await (await requireTenancyRepository()).rename(actor,id(rawId),body,idempotency(req),origin());
  return respond(result);
});}
export function changeVisibility(req:Request,rawId:string):Promise<Response>{return operation(req,true,async actor=>{
  const body=await readBoundedJson(req,1024);
  const visibility=parseVisibilityCommand(body);
  const version=readExpectedSecurityVersion(req);
  const p=await (await requireTenancyRepository()).changePolicy(actor,id(rawId),'visibility',version,visibility);
  return respond(publicPolicyResult(p));
});}
export function disablePortfolio(req:Request,rawId:string):Promise<Response>{return operation(req,true,async actor=>{
  requireEmptyCommand(await readBoundedJson(req,128));const version=readExpectedSecurityVersion(req);
  const p=await (await requireTenancyRepository()).changePolicy(actor,id(rawId),'disable',version);
  return respond(publicPolicyResult(p));
});}
export function enablePortfolio(req:Request,rawId:string):Promise<Response>{return operation(req,true,async actor=>{
  requireEmptyCommand(await readBoundedJson(req,128));const version=readExpectedSecurityVersion(req);
  const p=await (await requireTenancyRepository()).changePolicy(actor,id(rawId),'enable',version);
  return respond(publicPolicyResult(p));
});}
function readExpectedSecurityVersion(req:Request):number{
  const raw=req.headers.get('if-match');
  if(!raw||!/^"[0-9]{1,12}"$/.test(raw))throw new TenancyDenied('INVALID_COMMAND');
  const n=Number(raw.slice(1,-1));if(!Number.isSafeInteger(n))throw new TenancyDenied('INVALID_COMMAND');
  return n;
}
function publicPolicyResult(p:{portfolioId:string;status:string;visibility:string;
  activeReleaseId:string|null;securityVersion:number}){
  return {portfolioId:p.portfolioId,status:p.status,visibility:p.visibility,
    activeReleaseId:p.activeReleaseId,securityVersion:p.securityVersion,
    robotsIndexing:p.status==='active'&&p.visibility==='public'&&p.activeReleaseId?'index':'noindex'};
}
/** Public routes also check host independently, not just in proxy. */
export async function readPublicDirectory(req:Request):Promise<Response>{
  try{const env=loadServerEnvironment();assertTrustedRequestHost(req,{canonicalOrigin:env.APP_CANONICAL_ORIGIN,
    allowLocalhost:env.APP_ENV==='local',csrfExpectedHash:null});
    if(req.headers.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host)throw new TenancyDenied('NOT_FOUND');
    const items=await (await requireTenancyRepository()).directory(env.APP_CANONICAL_ORIGIN);
    return respond({items});
  }catch(e){return tenancyError(e);}
}
