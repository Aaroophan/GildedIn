import {revokeCurrent,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const POST=revokeCurrent;
export const OPTIONS=optionsDenied;
