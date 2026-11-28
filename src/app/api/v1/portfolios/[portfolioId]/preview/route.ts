import {getDraftPreview,optionsDenied} from '../../../../../../server/editor/preview.ts';
interface Params{params:Promise<{portfolioId:string}>;}
export async function GET(req:Request,{params}:Params){return getDraftPreview(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
