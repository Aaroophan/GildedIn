import type {Metadata} from 'next';
import {cookies,headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {signIn} from '@/auth.ts';
import {loadServerEnvironment} from '@/server/config/server.ts';
import {requireIdentityRepository} from '@/bootstrap/identity-runtime.ts';
import {LINK_COOKIE_NAME,SESSION_COOKIE_NAME} from '@/server/identity/session-cookie.ts';
import type {IdentityProvider} from '@/domain/identity/contracts.ts';

export const metadata:Metadata={title:'Link a sign-in provider',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';

async function verifyLink(provider:IdentityProvider,mutation:boolean){
  const env=loadServerEnvironment();const h=await headers();
  if(h.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host ||
     (h.has('x-forwarded-host')&&h.get('x-forwarded-host')!==h.get('host')) ||
     (mutation && (h.get('origin')!==env.APP_CANONICAL_ORIGIN ||
        (h.has('sec-fetch-site')&&!['same-origin','none'].includes(h.get('sec-fetch-site')!)))))
    notFound();
  const jar=await cookies();const token=jar.get(SESSION_COOKIE_NAME)?.value??null;
  const nonce=jar.get(LINK_COOKIE_NAME)?.value??null;
  const repo=await requireIdentityRepository();const actor=await repo.requireSession(token);
  await repo.requirePendingLinkIntent(actor,nonce,provider);
}
async function beginLink(provider:IdentityProvider){
  'use server';
  await verifyLink(provider,true);
  await signIn(provider,{redirectTo:'/login'});
}
export default async function LinkProviderPage({searchParams}:{searchParams:Promise<{provider?:string}>}){
  const params=await searchParams;
  const provider=params.provider;
  if(provider!=='google'&&provider!=='github')notFound();
  try{await verifyLink(provider,false);}catch{notFound();}
  return <main id="main" className="centered">
    <span className="eyebrow">EXPLICIT PROVIDER LINKING</span>
    <h1>Confirm {provider==='google'?'Google':'GitHub'} linking</h1>
    <p>You are linking a second verified login to your existing GildedIn account.
      Your accounts will never be merged just because their email addresses match.</p>
    <form action={async()=>{'use server';await beginLink(provider);}}>
      <button type="submit">Verify and link {provider==='google'?'Google':'GitHub'}</button>
    </form>
    <p>Your current session will be revoked after successful linking. Sign in again to continue.</p>
    <a href="/dashboard">Cancel and return to your dashboard</a>
  </main>;
}
