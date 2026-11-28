import {getProviders,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=getProviders;
export const OPTIONS=optionsDenied;
