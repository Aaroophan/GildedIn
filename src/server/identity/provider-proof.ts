/** Only call from the Auth.js provider-verified callback. No arbitrary HTTP JSON accepted. */
import {validateVerifiedIdentity,IdentityDenied} from '../../domain/identity/contracts.ts';
import type {VerifiedProviderIdentity} from '../../domain/identity/contracts.ts';
interface AuthJsProviderAccount {provider:string;providerAccountId:string;}
export function proofFromVerifiedAuthJsCallback(account:AuthJsProviderAccount|null|undefined,
  profile:Record<string,unknown>|undefined):VerifiedProviderIdentity {
  if(!account||!profile)throw new IdentityDenied('INVALID_PROVIDER_PROOF');
  if(account.provider==='google') {
    if(profile.sub!==account.providerAccountId||typeof profile.sub!=='string')
      throw new IdentityDenied('INVALID_PROVIDER_PROOF');
    const name=typeof profile.name==='string'?profile.name:'GildedIn member';
    return validateVerifiedIdentity({provider:'google',subject:account.providerAccountId,
      issuer:'https://accounts.google.com',displayName:name,
      ...(profile.email_verified===true&&typeof profile.email==='string'?{verifiedEmail:profile.email}:{})});
  }
  if(account.provider==='github') {
    // Auth.js obtains profile.id using GitHub's authenticated provider response, NOT a public login.
    if(String(profile.id)!==account.providerAccountId)throw new IdentityDenied('INVALID_PROVIDER_PROOF');
    const name=typeof profile.name==='string'&&profile.name.trim()?profile.name:'GildedIn member';
    // Never infer verified email from GitHub's public profile or an unverified scope.
    return validateVerifiedIdentity({provider:'github',subject:account.providerAccountId,
      issuer:'https://github.com',displayName:name});
  }
  throw new IdentityDenied('INVALID_PROVIDER_PROOF');
}
