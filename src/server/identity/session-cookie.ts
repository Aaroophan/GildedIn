/** Cookie policy for the apex. Never set Domain, and never return this cookie from tenant origins. */
export const SESSION_COOKIE_NAME='__Host-gildedin_session';
export const LINK_COOKIE_NAME='__Host-gildedin_link';
export function cookieForSession(value:string,maxAgeSeconds:number):string {
  if(!/^[A-Za-z0-9_-]{43}$/.test(value)||!Number.isInteger(maxAgeSeconds)||maxAgeSeconds<1||maxAgeSeconds>604800)
    throw new Error('INVALID_SESSION_COOKIE');
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}
export const clearSessionCookie=()=>`${SESSION_COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
export function cookieForLinkIntent(value:string):string {
  if(!/^[A-Za-z0-9_-]{43}$/.test(value))throw new Error('INVALID_LINK_COOKIE');
  return `${LINK_COOKIE_NAME}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300`;
}
export const clearLinkCookie=()=>`${LINK_COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
export function parseCookie(header:string|null,name:string):string|null {
  for(const pair of (header??'').split(';')) {
    const trimmed=pair.trim();
    if(trimmed.startsWith(name+'=')){const value=trimmed.slice(name.length+1);
      return /^[A-Za-z0-9_-]{43}$/.test(value)?value:null;}
  }
  return null;
}
