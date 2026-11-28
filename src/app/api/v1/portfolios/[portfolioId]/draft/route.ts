import {getDraft,patchDraft,putDraft,optionsDenied} from '../../../../../../server/content/http.ts';
interface Params {params:Promise<{portfolioId:string}>;}
export async function GET(req:Request,{params}:Params){return getDraft(req,(await params).portfolioId);}
export async function PATCH(req:Request,{params}:Params){return patchDraft(req,(await params).portfolioId);}
export async function PUT(req:Request,{params}:Params){return putDraft(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
