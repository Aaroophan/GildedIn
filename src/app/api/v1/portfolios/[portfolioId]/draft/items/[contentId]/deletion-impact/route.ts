import {previewDeletionImpact,optionsDenied} from '../../../../../../../../../server/content/http.ts';
interface Params {params:Promise<{portfolioId:string;contentId:string}>;}
export async function GET(req:Request,{params}:Params){const {portfolioId,contentId}=await params;
  return previewDeletionImpact(req,portfolioId,contentId);}
export const OPTIONS=optionsDenied;
