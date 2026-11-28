import {previewSchemaImport,optionsDenied} from '../../../../../../../server/content/http.ts';
interface Params {params:Promise<{portfolioId:string}>;}
export async function POST(req:Request,{params}:Params){return previewSchemaImport(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
