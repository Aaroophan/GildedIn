import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {signIn} from '@/auth.ts';
import {loadServerEnvironment} from '@/server/config/server.ts';
import {safeDashboardReturnTo} from '@/domain/onboarding/model.ts';
import ProviderSubmit from './provider-submit.tsx';

export const metadata:Metadata={title:'Sign in to GildedIn',robots:{index:false,follow:false}};

/** Server Actions are a security boundary too: recheck host and exact Origin on EVERY invocation.
 * An OAuth flow may begin only at the canonical account origin, never a tenant subdomain.
 */
async function providerSignIn(provider:'google'|'github',returnTo:string){
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
  const safe=safeDashboardReturnTo(returnTo);
  await signIn(provider,{redirectTo:`/login/complete?returnTo=${encodeURIComponent(safe)}`});
}
export default async function LoginPage({searchParams}:{searchParams:Promise<{returnTo?:string;error?:string}>}){
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
  const params=await searchParams;
  const safe=safeDashboardReturnTo(params.returnTo);
  const messages:Record<string,string>={OAuthSignin:'The provider could not start sign-in. Please retry.',
    OAuthCallback:'The sign-in attempt expired or could not be verified. Start again.',
    OAuthAccountNotLinked:'This provider is already associated with a different account. Use your existing sign-in.',
    AccessDenied:'The sign-in attempt was denied. You can try again.'};
  const errorMessage=typeof params.error==='string'&&Object.hasOwn(messages,params.error)?messages[params.error]:
    params.error?'Sign-in did not complete. Try again.':null;
  return <main id="main" className="centered gi-login" aria-labelledby="login-title">
    <a className="gi-brand" href="/">Gilded<span>In</span></a>
    <p className="eyebrow">ACCOUNT ACCESS</p><h1 id="login-title">Sign in to GildedIn</h1>
    <p>Continue through your Google or GitHub account. We do not store a GildedIn password.</p>
    {errorMessage?<p role="alert" className="gi-login-error">{errorMessage}</p>:null}
    {google?<form action={async()=>{'use server';await providerSignIn('google',safe);}}>
      <ProviderSubmit provider="Google"/></form>:<p>Google sign-in is not configured on this environment.</p>}
    {github?<form action={async()=>{'use server';await providerSignIn('github',safe);}}>
      <ProviderSubmit provider="GitHub"/></form>:<p>GitHub sign-in is not configured on this environment.</p>}
    <p>Provider buttons share basic identity information only; GildedIn does not request access to your private repositories. A verified email is optional for sign-in.</p>
    <p>Linking another provider is a separate authenticated action, not an email-based account merge.</p>
    <p>Read the <a href="/privacy">privacy notice</a> before continuing. Successful sign-in returns to {safe==='/dashboard'?'your dashboard':'your requested dashboard page'}.</p>
    <a className="return-link" href="/">Back to GildedIn</a>
  </main>;
}
