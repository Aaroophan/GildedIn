/** Owner-scoped private theme draft API. A theme change never publishes a release. */
import {requireApexActor} from '../identity/http.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {readBoundedJson} from '../http/ingress.ts';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {parseDesignTheme,readOwnerTheme,minimumThemeContrast} from '../../domain/design/theme.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
import {contentError,requiredIfMatch,parseMutationToken,optionsDenied} from '../content/http.ts';
import {newRequestId} from '../security/crypto.ts';
export {optionsDenied};
const parseId=(raw:string)=>{try{return parsePortfolioId(raw);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}};
function respond(body:unknown,rev:number){return new Response(JSON.stringify(body),{headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store, max-age=0',
  'X-Content-Type-Options':'nosniff','Vary':'Host, Origin, Cookie','X-Robots-Tag':'noindex, nofollow',
  'X-Request-Id':newRequestId(),ETag:`"rev-${rev}"`}});}
export async function getOwnedTheme(req:Request,rawPortfolioId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,false);
    if(new URL(req.url).search)throw new ContentDenied('CONTENT_INVALID');
    const draft=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawPortfolioId));
    const theme=readOwnerTheme(draft.theme);
    return respond({revision:draft.revision,theme,contrast:minimumThemeContrast(theme.colors)
      .map(({foreground,background,ratio,minimum})=>({foreground,background,
        ratio:Number(ratio.toFixed(2)),minimum}))},draft.revision);
  }catch(e){return contentError(e);}
}
export async function putOwnedTheme(req:Request,rawPortfolioId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,true),expected=requiredIfMatch(req),token=parseMutationToken(req);
    const body=parseDesignTheme(await readBoundedJson(req,8192));
    const result=await (await requireContentRepository()).putTheme(actor,parseId(rawPortfolioId),body,expected,token);
    if(result.kind==='conflict')throw new ContentDenied('CONTENT_CONFLICT',[
      {path:'revision',code:'stale_revision',message:'Reload the latest draft before changing its appearance.'}]);
    return respond({status:result.kind,revision:result.draft.revision,
      theme:readOwnerTheme(result.draft.theme)},result.draft.revision);
  }catch(e){return contentError(e);}
}
