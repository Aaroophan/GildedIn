/** Auth.js is solely the audited OAuth/OIDC protocol verifier and a five-minute handshake.
 * It is NOT the authorization credential for GildedIn account APIs: those require an
 * independently issued, database-revocable __Host-gildedin_session cookie.
 * Library / provider callbacks require live integration proof before opening registration.
 */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import {cookies} from 'next/headers';
import {randomUUID} from 'node:crypto';
import {loadServerEnvironment} from './server/config/server.ts';
import {requireIdentityRepository} from './bootstrap/identity-runtime.ts';
import {proofFromVerifiedAuthJsCallback} from './server/identity/provider-proof.ts';
import {assertSafeReturnPath} from './domain/identity/contracts.ts';
import {LINK_COOKIE_NAME,SESSION_COOKIE_NAME} from './server/identity/session-cookie.ts';
import {OAUTH_COOKIE_NAME} from './server/identity/oauth-handshake.ts';
import type {IdentityProvider} from './domain/identity/contracts.ts';

export const {handlers,auth,signIn,signOut}=NextAuth(()=>{
  const env=loadServerEnvironment();
  const providers=[];
  if(env.AUTH_GOOGLE_ID&&env.AUTH_GOOGLE_SECRET)
    providers.push(Google({clientId:env.AUTH_GOOGLE_ID,clientSecret:env.AUTH_GOOGLE_SECRET}));
  if(env.AUTH_GITHUB_ID&&env.AUTH_GITHUB_SECRET)
    providers.push(GitHub({clientId:env.AUTH_GITHUB_ID,clientSecret:env.AUTH_GITHUB_SECRET,
      authorization:{params:{scope:'read:user'}}}));
  return {
    trustHost:true, // Safe ONLY because /api/auth handler independently rejects forged host/proxy headers.
    secret:env.AUTH_SECRET,
    providers,
    basePath:'/api/auth',
    pages:{signIn:'/login',error:'/login'},
    session:{strategy:'jwt' as const,maxAge:300,updateAge:0},
    jwt:{maxAge:300},
    cookies:{sessionToken:{name:OAUTH_COOKIE_NAME,options:{httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'}}},
    callbacks:{
      async signIn({account,profile}){
        try {
          const verified=proofFromVerifiedAuthJsCallback(account,profile as Record<string,unknown>|undefined);
          const store=await requireIdentityRepository();
          const jar=await cookies();
          const nonce=jar.get(LINK_COOKIE_NAME)?.value;
          if(nonce){
            // Explicit link is not normal sign-in and must retain its original account/session binding.
            const appSession=jar.get(SESSION_COOKIE_NAME)?.value??null;
            const actor=await store.requireSession(appSession);
            await store.completeLink(actor,nonce,verified,randomUUID() as never);
            // Cookie clearing is response-context dependent in Auth.js callbacks.
            // A deletion failure must never report a rolled-back link after durable commit.
            try{jar.delete(LINK_COOKIE_NAME);}catch{/* consumed intent remains unusable; 5-minute cookie expires */}
            return '/login'; // Existing session invalidated; fresh sign-in required.
          }
          const existing=await store.findOwnedAccountByProvider(verified.provider,verified.subject);
          if(!existing&&env.FEATURE_REGISTRATION!=='on')return false;
          await store.resolveOrCreateFromVerifiedProvider(verified);
          return true;
        }catch{return false;}
      },
      async jwt({token,account,profile}){
        // Only attach domain ID after Auth.js has verified the upstream OAuth response.
        if(account&&profile){
          const verified=proofFromVerifiedAuthJsCallback(account,profile as Record<string,unknown>);
          const existing=await (await requireIdentityRepository()).findOwnedAccountByProvider(verified.provider,verified.subject);
          if(!existing)throw new Error('AUTH_ACCOUNT_UNAVAILABLE');
          token.gildedinAccountId=existing.accountId;
          token.gildedinProvider=verified.provider;
          // No OAuth access/refresh token, verified email, or provider subject is stored in this JWT.
        }
        return token;
      },
      async session({session,token}){
        // The handshake is deliberately non-authoritative for any owner API.
        const id=typeof token.gildedinAccountId==='string'?token.gildedinAccountId:'';
        const provider=token.gildedinProvider;
        return {...session,user:{id,name:null,email:null,image:null},
          gildedinProvider:(provider==='google'||provider==='github'?provider:null) as IdentityProvider|null};
      },
      async redirect({url,baseUrl}){
        // Auth.js can pass a host-derived baseUrl; never promote it to a trusted origin.
        const canonical=loadServerEnvironment().APP_CANONICAL_ORIGIN;
        const requested=url.startsWith(canonical)?url.slice(canonical.length):url;
        const path=assertSafeReturnPath(requested);
        void baseUrl;return canonical+(path==='/login'?'/login':path==='/dashboard'?'/login/complete':path);
      },
    },
  };
});
