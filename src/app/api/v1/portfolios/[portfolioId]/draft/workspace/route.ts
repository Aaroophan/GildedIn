import {putCanvasWorkspace,optionsDenied} from '../../../../../../../server/editor/http.ts';
interface Context {params:Promise<{portfolioId:string}>;}
export async function PUT(req:Request,{params}:Context){return putCanvasWorkspace(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
