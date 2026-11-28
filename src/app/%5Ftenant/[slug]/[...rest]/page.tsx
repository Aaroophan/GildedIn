import type {Metadata} from 'next';
import {publicPage,publicPageMetadata} from '@/server/tenancy/page.tsx';
export const runtime='nodejs';export const dynamic='force-dynamic';export const revalidate=0;
export async function generateMetadata({params}:{params:Promise<{slug:string;rest:string[]}>}):Promise<Metadata>{
  return publicPageMetadata({...await params,form:'subdomain'});
}
export default async function TenantDetail({params}:{params:Promise<{slug:string;rest:string[]}>}){
  return publicPage({...await params,form:'subdomain'});
}
