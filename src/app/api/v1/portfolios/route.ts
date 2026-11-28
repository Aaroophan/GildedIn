import {createPortfolio,listOwnedPortfolios} from '@/server/tenancy/http.ts';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const POST=createPortfolio;
export const GET=listOwnedPortfolios;
export const OPTIONS=()=>new Response(null,{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin'}});
