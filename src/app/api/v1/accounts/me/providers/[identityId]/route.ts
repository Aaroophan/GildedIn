import {deleteProvider,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function DELETE(request:Request,{params}:{params:Promise<{identityId:string}>}){
  const {identityId}=await params;return deleteProvider(request,identityId);
}
export const OPTIONS=optionsDenied;
