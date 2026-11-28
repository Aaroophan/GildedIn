import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {signIn} from '@/auth.ts';
import {loadServerEnvironment} from '@/server/config/server.ts';

export const metadata:Metadata={title:'Sign in to GildedIn',robots:{index:false,follow:false}};

/** Server Actions are a security boundary too: recheck host and exact Origin on EVERY invocation.
 * An OAuth flow may begin only at the canonical account origin, never a tenant subdomain.
 */
async function providerSignIn(provider:'google'|'github'){
  'use server';
  const env=loadServerEnvironment();const h=await headers();
  if(h.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host ||
     h.get('origin')!==env.APP_CANONICAL_ORIGIN ||
     (h.has('x-forwarded-host')&&h.get('x-forwarded-host')!==h.get('host')) ||
     (h.has('sec-fetch-site')&&h.get('sec-fetch-site')!=='same-origin'&&h.get('sec-fetch-site')!=='none'))
    throw new Error('ACCOUNT_ORIGIN_DENIED');
  if(!env.AUTH_SECRET||!env.MONGODB_URI||!
     (provider==='google'?(env.AUTH_GOOGLE_ID&&env.AUTH_GOOGLE_SECRET):
       (env.AUTH_GITHUB_ID&&env.AUTH_GITHUB_SECRET)))
    throw new Error('PROVIDER_NOT_CONFIGURED');
  await signIn(provider,{redirectTo:'/login/complete'});
}
export default async function LoginPage(){
  const incoming=await headers();
  let google=false,github=false;
  let env:ReturnType<typeof loadServerEnvironment>|null=null;
  try{env=loadServerEnvironment();}catch{ /* invalid config must not enable sign-in */ }
  if(!env)notFound();
  if(incoming.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host ||
     (incoming.has('x-forwarded-host')&&incoming.get('x-forwarded-host')!==incoming.get('host')))notFound();
  try {
    google=!!(env.AUTH_GOOGLE_ID&&env.AUTH_GOOGLE_SECRET&&env.AUTH_SECRET&&env.MONGODB_URI);
    github=!!(env.AUTH_GITHUB_ID&&env.AUTH_GITHUB_SECRET&&env.AUTH_SECRET&&env.MONGODB_URI);
  }catch {/* Invalid configuration must never enable a provider action. */}
  return <main id="main" className="centered" aria-labelledby="login-title">
    <span className="eyebrow">ACCOUNT ACCESS</span><h1 id="login-title">Sign in to GildedIn</h1>
    <p>Continue through your Google or GitHub account. We do not store a GildedIn password.</p>
    {google?<form action={async()=>{'use server';await providerSignIn('google');}}>
      <button type="submit">Continue with Google</button></form>:<p>Google sign-in is not configured on this environment.</p>}
    {github?<form action={async()=>{'use server';await providerSignIn('github');}}>
      <button type="submit">Continue with GitHub</button></form>:<p>GitHub sign-in is not configured on this environment.</p>}
    <p>Linking another provider is a separate authenticated action, not an email-based account merge.</p>
    <a className="return-link" href="/">Back to GildedIn</a>
  </main>;
}
