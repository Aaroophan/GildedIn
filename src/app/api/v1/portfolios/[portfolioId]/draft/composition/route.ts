import {getComposition,putComposition,optionsDenied} from '../../../../../../../server/composition/http.ts';
interface Context {params:Promise<{portfolioId:string}>;}
export async function GET(req:Request,{params}:Context){return getComposition(req,(await params).portfolioId);}
export async function PUT(req:Request,{params}:Context){return putComposition(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
