/** Issue 4: domain-owned identity invariants, independent of OAuth and MongoDB. */
import type {AccountId, SessionId} from '../../shared/domain/identifiers.ts';

export type IdentityProvider = 'google'|'github';
/** Owner-only allowlisted account projection, never a serialized account document. */
export interface PrivateAccountSummary {
  accountId:AccountId;displayName:string;verifiedEmail:string|null;status:'active';
  isAdmin:boolean;createdAt:string;linkedProviders:readonly {identityId:string;provider:IdentityProvider;linkedAt:string}[];
  portfolioSummaries:readonly {portfolioId:string;slug:string;status:string}[];
  capabilities:{canCreatePortfolio:boolean;canLinkProvider:boolean;canUseEmailFeatures:boolean};
}
export interface VerifiedProviderIdentity {
  /** Only constructed in the Auth.js callback after its own OAuth/OIDC verification. */
  readonly provider: IdentityProvider;
  readonly subject: string;
  readonly issuer: string;
  readonly displayName: string;
  readonly verifiedEmail?: string;
}
export interface AuthenticatedActor {
  readonly accountId: AccountId;
  readonly sessionId: SessionId;
  readonly sessionLookupId: string;
  /** Verified login provider for this particular session, not an account-level guess. */
  readonly authProvider: IdentityProvider;
  readonly authenticatedAt: Date;
  readonly securityVersion: number;
}
export class IdentityDenied extends Error {
  readonly code:
    'INVALID_PROVIDER_PROOF'|'NOT_AUTHENTICATED'|'ACCOUNT_UNAVAILABLE'|'REAUTHENTICATION_REQUIRED'|
    'IDENTITY_CONFLICT'|'LINK_INTENT_INVALID'|'LAST_LOGIN_PROVIDER'|'ACCOUNT_CONFLICT'|
    'INVALID_PROFILE'|'NOT_AUTHORIZED'|'CAPABILITY_UNAVAILABLE';
  constructor(code:IdentityDenied['code']) {
    super('Identity operation unavailable.');this.code=code;this.name='IdentityDenied';
  }
}
const validSubject=/^[A-Za-z0-9_-][A-Za-z0-9_:\-./]{0,199}$/;
const emailPattern=/^[^@\s]{1,64}@[^@\s]{1,189}$/;
export function validateVerifiedIdentity(value:VerifiedProviderIdentity):VerifiedProviderIdentity {
  if((value.provider!=='google'&&value.provider!=='github')||!validSubject.test(value.subject)||
     value.issuer!==(value.provider==='google'?'https://accounts.google.com':'https://github.com')||
     typeof value.displayName!=='string'||value.displayName.trim().length<1||
     value.displayName.trim().length>180||/[<>\u0000-\u001f]/.test(value.displayName)||
     (value.verifiedEmail!==undefined&&(!emailPattern.test(value.verifiedEmail)||
       value.verifiedEmail.length>254))) throw new IdentityDenied('INVALID_PROVIDER_PROOF');
  return Object.freeze({...value,displayName:value.displayName.trim(),
    ...(value.verifiedEmail?{verifiedEmail:value.verifiedEmail.trim().toLowerCase()}:{})});
}
export function parseProfilePatch(input:unknown):Readonly<{displayName:string}> {
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype||
    Object.keys(input).length!==1||!Object.hasOwn(input,'displayName')) throw new IdentityDenied('INVALID_PROFILE');
  const displayName=(input as {displayName:unknown}).displayName;
  if(typeof displayName!=='string'||displayName.trim().length<1||displayName.trim().length>180||
     /[<>\u0000-\u001f\u007f]/.test(displayName))throw new IdentityDenied('INVALID_PROFILE');
  return {displayName:displayName.trim()};
}
export function requireRecentAuthentication(actor:AuthenticatedActor,now:Date,maxAgeMs=10*60*1000):void {
  if(!Number.isFinite(now.valueOf())||!Number.isFinite(actor.authenticatedAt.valueOf())||
     actor.authenticatedAt.getTime()>now.getTime()+5000||now.getTime()-actor.authenticatedAt.getTime()>maxAgeMs)
    throw new IdentityDenied('REAUTHENTICATION_REQUIRED');
}
export function assertSafeReturnPath(value:unknown):string {
  if(typeof value!=='string'||value.length>256||!value.startsWith('/')||value.startsWith('//')||
     /[\\?#\u0000-\u001f]/.test(value)||/%(?:2f|5c|0[0-9a-f])/i.test(value))return '/dashboard';
  return /^\/(dashboard(?:\/[a-z0-9-]+)*|login)$/.test(value)?value:'/dashboard';
}
export const SESSION_IDLE_MS=12*60*60*1000;
export const SESSION_ABSOLUTE_MS=7*24*60*60*1000;
export const LINK_INTENT_MS=5*60*1000;
