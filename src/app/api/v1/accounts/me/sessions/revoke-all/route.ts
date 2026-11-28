import {revokeAll,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const POST=revokeAll;
export const OPTIONS=optionsDenied;
