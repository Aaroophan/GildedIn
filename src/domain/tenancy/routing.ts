/** Portable, immutable route grammar and canonical builder. No untrusted Location/host interpolation. */
import {parseCanonicalSlug} from '../../shared/domain/validation.ts';
import type {CanonicalSlug} from '../../shared/domain/validation.ts';
export type PublicRoute = {kind:'root'|'projects'|'project-detail'|'experience'|'references';
  path:string;slug?:CanonicalSlug};
const safeSegment=/^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/;
export function parsePublicRoute(path:string):PublicRoute|null {
  if(typeof path!=='string'||path.length>256||!path.startsWith('/')||path.includes('//')||
     /[%\\\u0000-\u001f\u007f?#]/.test(path)||path.includes('..')||path.endsWith('/.')||path.endsWith('/..'))return null;
  const parts=path.split('/').slice(1);
  if(parts.length===1&&parts[0]==='')return {kind:'root',path:'/'};
  if(parts.some(x=>!safeSegment.test(x)))return null;
  if(parts.length===1&&parts[0]==='projects')return {kind:'projects',path:'/projects'};
  if(parts.length===1&&parts[0]==='experience')return {kind:'experience',path:'/experience'};
  if(parts.length===1&&parts[0]==='references')return {kind:'references',path:'/references'};
  if(parts.length===2&&parts[0]==='projects'){
    try {const slug=parseCanonicalSlug(parts[1]);return {kind:'project-detail',path:`/projects/${slug}`,slug};}
    catch{return null;}
  }
  return null;
}
/** Do not trust a stale route manifest or a guessable item ID. */
export function manifestIncludesRoute(routes:readonly string[],route:PublicRoute):boolean{
  if(!Array.isArray(routes)||routes.length>200)return false;
  return routes.includes(route.path);
}
export function canonicalApexUrl(origin:string,slug:CanonicalSlug,route:PublicRoute):string {
  const parsed=new URL(origin);
  if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/')
    throw new Error('UNTRUSTED_CANONICAL_ORIGIN');
  const portfolio=parseCanonicalSlug(slug);
  return new URL(`/${portfolio}${route.path==='/'?'':route.path}`,parsed).href;
}
export function tenantNavigationPath(route:PublicRoute):string {return route.path;}
export function pathNavigationPath(slug:CanonicalSlug,route:PublicRoute):string {
  return `/${parseCanonicalSlug(slug)}${route.path==='/'?'':route.path}`;
}
