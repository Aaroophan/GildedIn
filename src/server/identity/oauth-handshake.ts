/** Server-created CSRF token, bound to the transient encrypted Auth.js OAuth cookie.
 * This cookie is NOT the application credential. Auth.js token is valid only for 5 minutes
 * and may be exchanged once through the atomic MongoDB OAuth-exchange journal.
 */
import {createHmac,timingSafeEqual} from 'node:crypto';
import {IdentityDenied} from '../../domain/identity/contracts.ts';
export const OAUTH_COOKIE_NAME='__Host-gildedin_oauth';
export function readOAuthCookie(header:string|null):string|null {
  for(const candidate of (header??'').split(';')){
    const value=candidate.trim();
    if(value.startsWith(OAUTH_COOKIE_NAME+'=')){
      const token=value.slice(OAUTH_COOKIE_NAME.length+1);
      return token.length>=24&&token.length<=8192&&/^[A-Za-z0-9._-]+$/.test(token)?token:null;
    }
  }
  return null;
}
export function oauthExchangeCsrf(rawOAuthCookie:string,secret:string):string {
  if(rawOAuthCookie.length<24||rawOAuthCookie.length>8192||secret.length<43)
    throw new IdentityDenied('NOT_AUTHENTICATED');
  return createHmac('sha256',secret).update('gildedin:oauth-exchange:v1\0').update(rawOAuthCookie).digest('base64url');
}
export function verifyOAuthExchangeCsrf(token:string|null,rawOAuthCookie:string,secret:string):void {
  const expected=oauthExchangeCsrf(rawOAuthCookie,secret);
  if(!token||!/^[-_A-Za-z0-9]{43}$/.test(token))throw new IdentityDenied('NOT_AUTHENTICATED');
  if(!timingSafeEqual(Buffer.from(token),Buffer.from(expected)))throw new IdentityDenied('NOT_AUTHENTICATED');
}
