import {getOAuthReady,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=getOAuthReady;
export const OPTIONS=optionsDenied;
