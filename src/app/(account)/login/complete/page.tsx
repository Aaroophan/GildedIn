import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {loadServerEnvironment} from '@/server/config/server.ts';
import CompleteButton from './complete-button.tsx';
export const metadata:Metadata={title:'Finish secure sign-in',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function CompleteLogin(){
  const env=loadServerEnvironment();const h=await headers();
  if(h.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host ||
     (h.has('x-forwarded-host')&&h.get('x-forwarded-host')!==h.get('host')))notFound();
  return <main id="main" className="centered"><span className="eyebrow">SECURE SIGN-IN</span>
    <h1>Finish signing in</h1><p>Your provider verified your identity. Complete the one-time exchange to create a revocable GildedIn session.</p>
    <CompleteButton/><a href="/login">Return to sign-in</a></main>;
}
