import {getOwnerValidation,optionsDenied} from '../../../../../../../server/editor/preview.ts';
interface Params {params:Promise<{portfolioId:string}>;}
export async function POST(req:Request,{params}:Params){return getOwnerValidation(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
