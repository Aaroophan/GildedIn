/** Authenticated apex-only composition API. No preview request can publish or warm public caches. */
import {requireApexActor} from '../identity/http.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {readBoundedJson} from '../http/ingress.ts';
import {newRequestId} from '../security/crypto.ts';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
import {compileComposition} from '../../domain/composition/compiler.ts';
import {COMPOSITION_SCHEMA_VERSION,COMPONENT_REGISTRY_VERSION,COMPOSITION_COMPILER_VERSION,
  COMPOSITION_SERIALIZER_VERSION} from '../../domain/composition/types.ts';
import {contentError,requiredIfMatch,parseMutationToken,optionsDenied} from '../content/http.ts';
export {optionsDenied};
function parseId(value:string){try{return parsePortfolioId(value);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}}
function json(body:unknown,revision:number){return new Response(JSON.stringify(body),{status:200,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store, max-age=0',
  'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',
  'X-Request-Id':newRequestId(),'Vary':'Cookie, Host, Origin',ETag:`"rev-${revision}"`}});}
export async function getComposition(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,false);
    if(new URL(req.url).search)throw new ContentDenied('CONTENT_INVALID');
    const draft=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    return json({revision:draft.revision,schemaVersion:COMPOSITION_SCHEMA_VERSION,
      compilerVersion:COMPOSITION_COMPILER_VERSION,registryVersion:COMPONENT_REGISTRY_VERSION,
      serializerVersion:COMPOSITION_SERIALIZER_VERSION,nodes:draft.nodes},draft.revision);
  }catch(e){return contentError(e);}
}
export async function putComposition(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,true);
    const revision=requiredIfMatch(req),id=parseMutationToken(req),body=await readBoundedJson(req,150_000);
    const saved=await (await requireContentRepository()).putComposition(actor,parseId(rawId),body,revision,id);
    if(saved.kind==='conflict')throw new ContentDenied('CONTENT_CONFLICT',[
      {path:'revision',code:'stale_revision',message:'Reload the latest draft before saving.'}]);
    return json({status:saved.kind,revision:saved.draft.revision},saved.draft.revision);
  }catch(e){return contentError(e);}
}
export async function validateComposition(req:Request,rawId:string):Promise<Response>{
  try{
    const actor=await requireApexActor(req,true);
    const body=await readBoundedJson(req,128);
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==0)
      throw new ContentDenied('CONTENT_INVALID');
    const draft=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    const result=compileComposition(draft,{purpose:'release'});
    // Do not return the candidate render plan or private source via validation endpoints.
    return json({valid:result.ok,issues:result.issues,authoredNodes:result.plan?.authoredNodeCount??draft.nodes.length,
      generatedRepeaterItems:result.plan?.generatedRepeaterItems??0,revision:draft.revision,
      compilerVersion:COMPOSITION_COMPILER_VERSION},draft.revision);
  }catch(e){return contentError(e);}
}
