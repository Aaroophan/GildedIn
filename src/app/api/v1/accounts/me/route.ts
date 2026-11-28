import {getMe,patchMe,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=getMe;
export const PATCH=patchMe;
export const OPTIONS=optionsDenied;
