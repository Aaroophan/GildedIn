import {getAppCsrf,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=getAppCsrf;
export const OPTIONS=optionsDenied;
