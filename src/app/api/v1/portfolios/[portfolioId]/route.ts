import {getOwnedPortfolio} from '@/server/tenancy/http.ts';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const GET=async(req:Request,{params}:{params:Promise<{portfolioId:string}>})=>
  getOwnedPortfolio(req,(await params).portfolioId);
