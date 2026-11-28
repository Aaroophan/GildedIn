import {disablePortfolio} from '@/server/tenancy/http.ts';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const POST=async(req:Request,{params}:{params:Promise<{portfolioId:string}>})=>
  disablePortfolio(req,(await params).portfolioId);
