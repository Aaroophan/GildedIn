import {validateDraft,optionsDenied} from '../../../../../../../server/content/http.ts';
interface Params {params:Promise<{portfolioId:string}>;}
export async function POST(req:Request,{params}:Params){return validateDraft(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
