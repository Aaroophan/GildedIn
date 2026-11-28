import {getMutationReceipt,optionsDenied} from '../../../../../../../../server/editor/preview.ts';
interface Params{params:Promise<{portfolioId:string;mutationId:string}>;}
export async function GET(req:Request,{params}:Params){const {portfolioId,mutationId}=await params;
  return getMutationReceipt(req,portfolioId,mutationId);}
export const OPTIONS=optionsDenied;
