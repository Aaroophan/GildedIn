/** Owner-only preview and validation; no active release, bearer sharing or public caches. */
import {requireApexActor} from '../identity/http.ts';
import {readBoundedJson} from '../http/ingress.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
import {compileComposition} from '../../domain/composition/compiler.ts';
import {parseContentDraft} from '../../domain/content/model.ts';
import {parsePreviewSelection} from '../../domain/editor/preview.ts';
import {buildDraftValidationReport} from '../../domain/editor/preflight.ts';
import {newRequestId} from '../security/crypto.ts';
import {contentError,optionsDenied} from '../content/http.ts';
export {optionsDenied};
const json=(value:unknown,revision:number)=>new Response(JSON.stringify(value),{headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store, max-age=0',
  'X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff',
  'Vary':'Cookie, Host, Origin','X-Request-Id':newRequestId(),ETag:`"rev-${revision}"`}});
const id=(raw:string)=>{try{return parsePortfolioId(raw);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}};
export async function getDraftPreview(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,false);
    let selection;try{selection=parsePreviewSelection(req.url);}catch{throw new ContentDenied('CONTENT_INVALID');}
    const portfolioId=id(rawId),repo=await requireContentRepository(),draft=await repo.getOwnedEditableDraft(actor,portfolioId);
    if(selection.revision!==undefined&&selection.revision!==draft.revision)
      throw new ContentDenied('CONTENT_CONFLICT',[{path:'revision',code:'stale_preview',
        message:'The saved draft revision changed. Refresh the private preview.'}]);
    const media=await repo.readReleaseReadyMediaIds(actor,portfolioId);
    const compiled=compileComposition(parseContentDraft(draft),{purpose:'owner-preview',approvedMediaIds:media});
    // A failed compile is an owner-only issue report, never a stale release fallback.
    return json({revision:draft.revision,mode:selection.mode,animations:selection.animations,
      route:selection.route,valid:compiled.ok,issues:compiled.issues,plan:compiled.ok?compiled.plan:null},draft.revision);
  }catch(e){return contentError(e);}
}
export async function getMutationReceipt(req:Request,rawId:string,mutationId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,false);
    if(new URL(req.url).search||!/^[A-Za-z0-9_-]{8,96}$/.test(mutationId))
      throw new ContentDenied('CONTENT_INVALID');
    const result=await (await requireContentRepository()).readMutationStatus(actor,id(rawId),mutationId);
    return json(result,result.revision);
  }catch(e){return contentError(e);}
}
export async function getOwnerValidation(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,true);
    const payload=await readBoundedJson(req,128);
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).length!==0)
      throw new ContentDenied('CONTENT_INVALID');
    const portfolioId=id(rawId),repo=await requireContentRepository(),draft=await repo.getOwnedEditableDraft(actor,portfolioId);
    const approved=await repo.readReleaseReadyMediaIds(actor,portfolioId);
    return json(buildDraftValidationReport(parseContentDraft(draft),draft.revision,approved),draft.revision);
  }catch(e){return contentError(e);}
}
