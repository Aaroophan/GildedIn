import {handlers} from '../../../../auth.ts';
import {loadServerEnvironment} from '../../../../server/config/server.ts';
import {assertTrustedRequestHost} from '../../../../server/http/ingress.ts';
function guard(req:Request):boolean{
  try{
    const env=loadServerEnvironment();
    assertTrustedRequestHost(req,{canonicalOrigin:env.APP_CANONICAL_ORIGIN,
      allowLocalhost:env.APP_ENV==='local',csrfExpectedHash:null});
    if(req.headers.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host)return false;
    if(req.method==='POST'){
      if(req.headers.get('origin')!==env.APP_CANONICAL_ORIGIN)return false;
      const site=req.headers.get('sec-fetch-site');if(site&&site!=='same-origin'&&site!=='none')return false;
    }
    return true;
  }catch{return false;}
}
const deny=()=>new Response(null,{status:403,headers:{'Cache-Control':'private, no-store','Vary':'Origin'}});
export const GET=(req:Request)=>guard(req)?handlers.GET(req):deny();
export const POST=(req:Request)=>guard(req)?handlers.POST(req):deny();
export const OPTIONS=deny;
