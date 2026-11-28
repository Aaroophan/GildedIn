import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {classifyRequestHost} from './shared/domain/host.ts';
import {classifyRoute,makeSecurityHeaders} from './server/http/headers.ts';

/** Edge-only route zoning; all authorization and live policy checks repeat inside Node handlers.
 * Wildcard routing MUST remain off until verified DNS, TLS, edge hostname and cache evidence.
 */
export function proxy(request:NextRequest){
  const path=request.nextUrl.pathname;
  const origin=process.env.APP_CANONICAL_ORIGIN??'https://aaroophan.dev';
  let apexHost='aaroophan.dev';
  try{apexHost=new URL(origin).host;}catch{ /* invalid config fails within server entry */ }
  const wildcardTlsVerified=process.env.APP_ENV==='production'&&
    process.env.APP_WILDCARD_ENABLED==='true'&&process.env.APP_WILDCARD_TLS_VERIFIED==='true';
  const decision=classifyRequestHost(request.headers.get('host'),request.headers.get('x-forwarded-host'),{
    allowLocalhost:process.env.APP_ENV==='local',apexHost,wildcardTlsVerified});
  const denied=(status=404)=>new NextResponse('This address is not available.',{
    status,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain; charset=utf-8',
      'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
  if(decision.kind==='denied')return denied(421);
  const edgeProto=request.headers.get('x-forwarded-proto');
  if(edgeProto && edgeProto!==new URL(origin).protocol.slice(0,-1))return denied(421);
  // The internal /_tenant tree is never a public apex URL, and is not a privilege bypass.
  if(/^\/_tenant(?:\/|$)/.test(path))return denied();
  if(decision.kind==='www'){
    const to=new URL(path,origin);
    return NextResponse.redirect(to,308);
  }
  if(decision.kind==='tenant-host' && /^\/(?:api|dashboard|owner-preview-frame|admin|login|auth|settings|_next|_tenant)(?:\/|$)/.test(path))
    return denied();
  const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);
  const nonce=btoa(String.fromCharCode(...bytes));
  const security={...makeSecurityHeaders(classifyRoute(path),{
    nonce,verifiedTls:false,publicCacheApproved:false})};
  // Until Issue 14 search checks, noindex is a safe default even for otherwise visible public shells.
  if(decision.kind==='tenant-host'||classifyRoute(path)==='public')security['X-Robots-Tag']='noindex, nofollow, noarchive';
  const forwarded=new Headers(request.headers);
  forwarded.set('x-nonce',nonce);
  forwarded.set('Content-Security-Policy',security['Content-Security-Policy']);
  const next=decision.kind==='tenant-host'?new URL(`/_tenant/${decision.slug}${path==='/'?'':path}`,origin):null;
  const response=next?NextResponse.rewrite(next,{request:{headers:forwarded}}):
    NextResponse.next({request:{headers:forwarded}});
  for(const [name,value] of Object.entries(security))response.headers.set(name,value);
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
