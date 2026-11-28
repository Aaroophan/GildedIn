import {changeVisibility} from '@/server/tenancy/http.ts';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const POST=async(req:Request,{params}:{params:Promise<{portfolioId:string}>})=>
  changeVisibility(req,(await params).portfolioId);
