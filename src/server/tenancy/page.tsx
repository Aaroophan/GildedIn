import {headers} from 'next/headers';
import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import {resolveServerPublicPage,safePublicTitle} from './public.ts';
import type {PublicRouteResult} from '../../domain/tenancy/ports.ts';
/** Runtime policy reads must not be cached by page or ISR. */
interface PageOptions {slug:string;rest?:string[];form:'path'|'subdomain';}
async function load(opts:PageOptions):Promise<PublicRouteResult>{
  const h=await headers();
  if(opts.rest && (opts.rest.length>4||opts.rest.some(s=>typeof s!=='string')))return {kind:'not_found'};
  return resolveServerPublicPage({slug:opts.slug,path:opts.rest?.length?'/'+opts.rest.join('/'):'/',
    form:opts.form,host:h.get('host'),forwardedHost:h.get('x-forwarded-host'),
    forwardedProto:h.get('x-forwarded-proto')});
}
export async function publicPageMetadata(opts:PageOptions):Promise<Metadata>{
  const result=await load(opts);
  if(result.kind!=='allowed')return {title:'Not available',robots:{index:false,follow:false}};
  // Search inclusion remains disabled until Issue 14 validates full HTML/SEO delivery and real TLS.
  return {title:safePublicTitle(result),robots:{index:false,follow:false},
    alternates:{canonical:result.canonicalUrl}};
}
export async function publicPage(opts:PageOptions){
  const result=await load(opts);
  if(result.kind==='redirect')permanentRedirect(result.location);
  if(result.kind!=='allowed')notFound();
  const links=result.release.manifest.enabledRoutes.filter(s=>['/','/projects','/experience','/references'].includes(s));
  return <main id="main" className="centered">
    <span className="eyebrow">PUBLISHED PORTFOLIO · VERIFIED ROUTE</span>
    <h1>{safePublicTitle(result)}</h1>
    <p>{result.visibility==='unlisted'? 'This portfolio is unlisted but accessible to people with its link.':
      'This published portfolio has passed the live visibility and moderation check.'}</p>
    <nav aria-label="Published portfolio sections"><ul>
      {links.map(path=><li key={path}><a href={opts.form==='subdomain'?path:`/${result.slug}${path==='/'?'':path}`}>
        {path==='/'?'Home':path.slice(1)}</a></li>)}
    </ul></nav>
    <p>The safe full-content renderer and public media delivery are scheduled for Issues 7, 13 and 14.</p>
  </main>;
}
