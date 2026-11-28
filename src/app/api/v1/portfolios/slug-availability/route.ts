import {getSlugAvailability} from '@/server/tenancy/http.ts';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const GET=getSlugAvailability;
export const OPTIONS=()=>new Response(null,{status:403,headers:{'Cache-Control':'private, no-store','Vary':'Origin'}});
