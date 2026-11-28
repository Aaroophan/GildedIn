/** Server-side public resolver: independent of proxy, never exposes draft/account data. */
import {loadServerEnvironment} from '../config/server.ts';
import {requireTenancyRepository} from '../../bootstrap/identity-runtime.ts';
import {classifyRequestHost} from '../../shared/domain/host.ts';
import {parseCanonicalSlug} from '../../shared/domain/validation.ts';
import {parsePublicRoute} from '../../domain/tenancy/routing.ts';
import type {PublicRouteResult} from '../../domain/tenancy/ports.ts';

/** Call for EVERY public request, not only first host lookup or a cache-fill. */
export async function resolveServerPublicPage(source:{slug:string;path:string;
  form:'path'|'subdomain';host:string|null;forwardedHost:string|null;
  forwardedProto:string|null}):Promise<PublicRouteResult>{
  try{
    const env=loadServerEnvironment();
    const classified=classifyRequestHost(source.host,source.forwardedHost,{
      apexHost:new URL(env.APP_CANONICAL_ORIGIN).host,
      allowLocalhost:env.APP_ENV==='local',
      wildcardTlsVerified:env.APP_ENV==='production'&&env.APP_WILDCARD_ENABLED==='true'&&
        env.APP_WILDCARD_TLS_VERIFIED==='true'});
    if(source.forwardedProto&&source.forwardedProto!==new URL(env.APP_CANONICAL_ORIGIN).protocol.slice(0,-1))
      return {kind:'not_found'};
    const slug=parseCanonicalSlug(source.slug),route=parsePublicRoute(source.path);
    if(!route)return {kind:'not_found'};
    if(source.form==='path'&&classified.kind!=='apex'&&classified.kind!=='localhost')
      return {kind:'not_found'};
    if(source.form==='subdomain'&&(classified.kind!=='tenant-host'||classified.slug!==slug))
      return {kind:'not_found'};
    return await (await requireTenancyRepository()).resolvePublic(slug,route,source.form,env.APP_CANONICAL_ORIGIN);
  }catch{return {kind:'unavailable'};}
}
/** Only compiled-public metadata ever appears in the unfinished Issue 5 routing shell. */
export function safePublicTitle(result:Extract<PublicRouteResult,{kind:'allowed'}>):string{
  const title=result.release.seoArtifact.title;
  return typeof title==='string'&&title.length>0&&title.length<=160&&
    !/[<>\u0000-\u001f\u007f]/.test(title)?title:'Published portfolio';
}
