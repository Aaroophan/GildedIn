import {validateComposition,optionsDenied} from '../../../../../../../../server/composition/http.ts';
interface Context {params:Promise<{portfolioId:string}>;}
export async function POST(req:Request,{params}:Context){return validateComposition(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
