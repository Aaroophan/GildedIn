import {getOwnedTheme,putOwnedTheme,optionsDenied} from '../../../../../../../server/design/http.ts';
interface Context{params:Promise<{portfolioId:string}>;}
export async function GET(req:Request,{params}:Context){return getOwnedTheme(req,(await params).portfolioId);}
export async function PUT(req:Request,{params}:Context){return putOwnedTheme(req,(await params).portfolioId);}
export const OPTIONS=optionsDenied;
