/** Issue 6 HTTP adapter: authenticated apex ingress -> strict typed commands -> CAS draft persistence. */
import {requireApexActor} from '../identity/http.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {readBoundedJson} from '../http/ingress.ts';
import {newRequestId} from '../security/crypto.ts';
import {parsePortfolioId,parseContentId} from '../../shared/domain/identifiers.ts';
import {parseContentMutation} from '../../domain/content/commands.ts';
import {parseCollectionDefinition} from '../../domain/content/schema.ts';
import {previewSchemaChange} from '../../domain/content/migration.ts';
import {deletionImpact,validateForPublication} from '../../domain/content/model.ts';
import {projectOwnerDraft} from '../../domain/content/owner-view.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
const baseHeaders=(requestId:string)=>({'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie, Origin, Host',
  'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','X-Request-Id':requestId});
export function contentError(e:unknown):Response {
  const requestId=newRequestId();
  let code='CONTENT_UNAVAILABLE',status=503,issues:unknown[]=[];
  if(e instanceof ContentDenied){code=e.code;issues=[...e.issues];
    status=e.code==='CONTENT_INVALID'?422:e.code==='CONTENT_CAPACITY'?413:
      e.code==='CONTENT_NOT_FOUND'?404:e.code==='CONTENT_NOT_AUTHORIZED'?403:
      e.code==='CONTENT_IN_USE'||e.code==='CONTENT_CONFLICT'||
      e.code==='CONTENT_MIGRATION_CONFIRMATION_REQUIRED'?409:503;
  }else if(e&&typeof e==='object'&&'httpStatus' in e&&typeof e.httpStatus==='number'){
    status=e.httpStatus;code='REQUEST_DENIED';
  }else if(e&&typeof e==='object'&&'code' in e&&typeof e.code==='string'&&
    ['NOT_AUTHENTICATED','NOT_AUTHORIZED','REAUTHENTICATION_REQUIRED'].includes(e.code)){
    status=e.code==='NOT_AUTHENTICATED'?401:403;code='ACCESS_DENIED';
  }
  const title=status===401?'Authentication required':status===422?'Invalid content':status===409?'Content conflict':
    status===404?'Resource not found':status===403?'Access denied':
      status===413?'Capacity exceeded':'Temporarily unavailable';
  return new Response(JSON.stringify({type:'https://aaroophan.dev/problems/content',title,status,code,
    detail:'The requested content operation could not be completed.',requestId,issues}),
    {status,headers:{...baseHeaders(requestId),'Content-Type':'application/problem+json'}});
}
function respond(payload:unknown,status=200,revision?:number):Response{
  const id=newRequestId();return new Response(JSON.stringify(payload),{status,
    headers:{...baseHeaders(id),...(revision===undefined?{}:{ETag:`"rev-${revision}"`})}});
}
function parseId(id:string){try{return parsePortfolioId(id);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}}
export function parseMutationToken(req:Request):string{
  const id=req.headers.get('x-client-mutation-id');
  if(!id||!/^[a-zA-Z0-9_-]{8,96}$/.test(id))throw new ContentDenied('CONTENT_INVALID');
  return id;
}
export function requiredIfMatch(req:Request):number {
  const head=req.headers.get('if-match');
  if(!head||!/^"rev-(?:0|[1-9][0-9]{0,9})"$/.test(head))throw new ContentDenied('CONTENT_INVALID');
  return Number(head.slice(5,-1));
}
async function execute(req:Request,mutation:boolean,fn:(actor:Awaited<ReturnType<typeof requireApexActor>>)=>Promise<Response>):Promise<Response>{
  try{return await fn(await requireApexActor(req,mutation));}catch(e){return contentError(e);}
}
/** Read only. Does not imply publish eligibility or authorize any public route. */
export function getDraft(req:Request,rawId:string):Promise<Response>{
  return execute(req,false,async actor=>{
    if(new URL(req.url).search)throw new ContentDenied('CONTENT_INVALID');
    const draft=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    return respond({draft:projectOwnerDraft(draft)},200,draft.revision);
  });
}
export function patchDraft(req:Request,rawId:string):Promise<Response>{
  return execute(req,true,async actor=>{
    const command=parseContentMutation(await readBoundedJson(req,350000));
    const result=await (await requireContentRepository()).apply(actor,parseId(rawId),command);
    if(result.kind==='conflict')return contentError(new ContentDenied('CONTENT_CONFLICT',
      [{path:'expectedRevision',code:'stale_revision',message:'Load and reconcile the latest saved draft.'}]));
    return respond({status:result.kind,revision:result.draft.revision,updatedAt:result.draft.updatedAt},200,result.draft.revision);
  });
}
export function putDraft(req:Request,rawId:string):Promise<Response>{
  return execute(req,true,async actor=>{
    const revision=requiredIfMatch(req);
    const body=await readBoundedJson(req,350000);
    const saved=await (await requireContentRepository()).putContent(actor,parseId(rawId),body,revision,parseMutationToken(req));
    if(saved.kind==='conflict')return contentError(new ContentDenied('CONTENT_CONFLICT',
      [{path:'revision',code:'stale_revision',message:'Load and reconcile the latest saved draft.'}]));
    return respond({status:saved.kind,revision:saved.draft.revision},200,saved.draft.revision);
  });
}
/** Validation never publishes or returns private data to anyone but the current owner.
 * Publication still needs Issue 13's deterministic compiled payload and atomic release gate. */
export function validateDraft(req:Request,rawId:string):Promise<Response>{
  return execute(req,true,async actor=>{
    const body=await readBoundedJson(req,128);
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==0)
      throw new ContentDenied('CONTENT_INVALID');
    const draft=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    try{validateForPublication(draft);return respond({valid:true,blockers:[],revision:draft.revision});}
    catch(e){if(e instanceof ContentDenied&&e.code==='CONTENT_INVALID')
      return respond({valid:false,blockers:e.issues,revision:draft.revision});throw e;}
  });
}
/** Advanced import is a preview operation ONLY. The owner must separately confirm an actual mutation. */
export function previewSchemaImport(req:Request,rawId:string):Promise<Response>{
  return execute(req,true,async actor=>{
    const payload=await readBoundedJson(req,32768);
    const preview=await (await requireContentRepository()).previewSchemaImport(actor,parseId(rawId),payload);
    return respond(preview);
  });
}
/** Nonmutating impact inspection for native schema designer changes. */
export function previewSchemaImpact(req:Request,rawId:string):Promise<Response>{
  return execute(req,true,async actor=>{
    const source=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    const payload=await readBoundedJson(req,32768);
    const schema=parseCollectionDefinition(payload,'schema.candidate');
    const impact=await previewSchemaChange(source,schema,source.revision);
    return respond({impact,revision:source.revision});
  });
}
/** Returns only safe own dependent IDs, never another tenant's data. */
export function previewDeletionImpact(req:Request,rawId:string,rawContentId:string):Promise<Response>{
  return execute(req,false,async actor=>{
    if(new URL(req.url).search)throw new ContentDenied('CONTENT_INVALID');
    const source=await (await requireContentRepository()).getOwnedDraft(actor,parseId(rawId));
    let contentId;try{contentId=parseContentId(rawContentId);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}
    return respond({impact:deletionImpact(source,contentId),revision:source.revision});
  });
}
export const optionsDenied=()=>new Response(null,{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin'}});
