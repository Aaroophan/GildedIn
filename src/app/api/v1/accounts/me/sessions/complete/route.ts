import {postOAuthExchange,optionsDenied} from '@/server/identity/http.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const POST=postOAuthExchange;
export const OPTIONS=optionsDenied;
