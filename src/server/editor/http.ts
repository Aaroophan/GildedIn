/** Manually acknowledged local canvas save; exact apex, session, CSRF and revision required. */
import {requireApexActor} from '../identity/http.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {readBoundedJson} from '../http/ingress.ts';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
import {requiredIfMatch,parseMutationToken,contentError,optionsDenied} from '../content/http.ts';
import {newRequestId} from '../security/crypto.ts';
export {optionsDenied};
export async function putCanvasWorkspace(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,true);
    let portfolioId;try{portfolioId=parsePortfolioId(rawId);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}
    const revision=requiredIfMatch(req),token=parseMutationToken(req);
    const source=await readBoundedJson(req,350_000);
    const result=await (await requireContentRepository()).putEditorWorkspace(actor,portfolioId,source,revision,token);
    if(result.kind==='conflict')throw new ContentDenied('CONTENT_CONFLICT',[
      {path:'revision',code:'stale_revision',message:'Another saved edit has advanced the draft. Reload and reconcile.'}]);
    const requestId=newRequestId();
    return new Response(JSON.stringify({status:result.kind,revision:result.draft.revision,
      updatedAt:result.draft.updatedAt}),{status:200,headers:{'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff',
      'X-Robots-Tag':'noindex, nofollow','X-Request-Id':requestId,'Vary':'Cookie, Host, Origin',
      ETag:`"rev-${result.draft.revision}"`}});
  }catch(e){return contentError(e);}
}
