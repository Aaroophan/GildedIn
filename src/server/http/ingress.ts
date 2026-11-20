/** Ingress enforcement runs on the server even if Next.js proxy has already inspected a request. */
import { assertSafeJsonValue } from '../../shared/domain/validation.ts';
import { classifyRequestHost } from '../../shared/domain/host.ts';
import { requireCsrfProof } from '../security/crypto.ts';
export type IngressFailure = 'HOST_UNTRUSTED'|'METHOD_NOT_ALLOWED'|'ORIGIN_DENIED'|'FETCH_METADATA_DENIED'|
  'CSRF_PROOF_REQUIRED'|'CONTENT_TYPE_DENIED'|'BODY_TOO_LARGE'|'QUERY_TOO_LARGE'|'BAD_REQUEST';
export class IngressDenied extends Error {
  readonly code:IngressFailure; readonly httpStatus:number;
  constructor(code: IngressFailure, httpStatus: number) {super(code); this.code=code; this.httpStatus=httpStatus; this.name='IngressDenied';}
}
export interface IngressPolicy {
  readonly canonicalOrigin: string;
  readonly allowLocalhost: boolean;
  readonly maxBytes?: number;
  readonly csrfExpectedHash: string | null;
}
function deny(code: IngressFailure, status=403): never { throw new IngressDenied(code,status); }

export function assertTrustedRequestHost(request: Request, options: IngressPolicy): void {
  const host=request.headers.get('host');
  const forwarded=request.headers.get('x-forwarded-host');
  const result=classifyRequestHost(host,forwarded,{allowLocalhost:options.allowLocalhost,wildcardTlsVerified:false});
  if (result.kind!=='apex' && result.kind!=='localhost' && result.kind!=='www') deny('HOST_UNTRUSTED',421);
  const expected = new URL(options.canonicalOrigin).host;
  if (result.hostname!==expected && result.hostname!==`www.${expected}`) deny('HOST_UNTRUSTED',421);
  if (request.headers.has('x-forwarded-proto') && request.headers.get('x-forwarded-proto') !== new URL(options.canonicalOrigin).protocol.slice(0,-1)) {
    deny('HOST_UNTRUSTED',421);
  }
}

/** Protect any state-changing apex endpoint. Exact Origin and session-bound CSRF proof are BOTH required. */
export function assertApexMutation(request: Request, policy: IngressPolicy): void {
  assertTrustedRequestHost(request,policy);
  if(request.headers.get('host')?.toLowerCase()!==new URL(policy.canonicalOrigin).host) deny('HOST_UNTRUSTED',421);
  if (!['POST','PATCH','PUT','DELETE'].includes(request.method)) deny('METHOD_NOT_ALLOWED',405);
  if (request.headers.get('origin') !== policy.canonicalOrigin) deny('ORIGIN_DENIED');
  const fetchSite=request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') deny('FETCH_METADATA_DENIED');
  if (request.headers.has('access-control-request-method') || request.headers.has('access-control-request-headers')) deny('METHOD_NOT_ALLOWED',405);
  try { requireCsrfProof(request.headers.get('x-csrf-token'),policy.csrfExpectedHash); }
  catch { deny('CSRF_PROOF_REQUIRED'); }
  const ct=request.headers.get('content-type');
  if (!ct || !/^application\/json(?:;\s*charset=utf-8)?$/i.test(ct)) deny('CONTENT_TYPE_DENIED',415);
  const len=request.headers.get('content-length');
  if (len && (!/^\d+$/.test(len) || Number(len) > (policy.maxBytes??524288))) deny('BODY_TOO_LARGE',413);
  if (new URL(request.url).search.length>2048) deny('QUERY_TOO_LARGE',414);
}

/** Actual streamed-body limit, never rely only on attacker-supplied Content-Length. */
export async function readBoundedJson(request: Request, maxBytes=524288): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>1048576) deny('BAD_REQUEST',400);
  if (!request.body) deny('BAD_REQUEST',400);
  const reader=request.body.getReader(); const chunks: Uint8Array[]=[]; let n=0;
  try {
    while(true) {
      const {value,done}=await reader.read(); if(done)break;
      n+=value.byteLength;
      if(n>maxBytes) {await reader.cancel().catch(()=>{});deny('BODY_TOO_LARGE',413);}
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const raw=new Uint8Array(n);let offset=0;
  for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}
  try { const parsed:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
    assertSafeJsonValue(parsed);return parsed; }
  catch {deny('BAD_REQUEST',400);}
}

/** Credentialed CORS is deliberately disabled, including sibling tenant subdomains. */
export function rejectCredentialedPreflight(): Response {
  return new Response(null,{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Origin':'null'}});
}
