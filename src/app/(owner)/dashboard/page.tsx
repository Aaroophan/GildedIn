import {cookies,headers} from 'next/headers';
import {redirect,notFound} from 'next/navigation';
import {loadServerEnvironment} from '@/server/config/server.ts';
import {requireIdentityRepository} from '@/bootstrap/identity-runtime.ts';
import {SESSION_COOKIE_NAME} from '@/server/identity/session-cookie.ts';
import DashboardSignOut from './sign-out.tsx';
import AccountControls from './account-controls.tsx';
export const dynamic='force-dynamic';
/** Issue 4's minimal protected landing. Full owner dashboard arrives in Issue 9. */
export default async function Dashboard(){
  const requestHeaders=await headers();
  let env:ReturnType<typeof loadServerEnvironment>;
  try{env=loadServerEnvironment();}catch{notFound();}
  if(requestHeaders.get('host')!==new URL(env.APP_CANONICAL_ORIGIN).host)notFound();
  const value=(await cookies()).get(SESSION_COOKIE_NAME)?.value??null;
  if(!value)redirect('/login');
  try {
    const repo=await requireIdentityRepository();const actor=await repo.requireSession(value);
    const profile=await repo.readPrivateAccount(actor);
    return <main className="centered" id="main"><span className="eyebrow">OWNER ACCOUNT</span>
      <h1>Welcome, {profile.displayName}</h1><p>Your GildedIn account is protected by a revocable, apex-only session.</p>
      <p>{profile.portfolioSummaries.length===0?'You have no portfolio yet. Portfolio onboarding arrives in Issue 9.':
        'Your portfolio is available in your account record; editing will be enabled later.'}</p>
      <p>Linked sign-in methods: {profile.linkedProviders.map(x=>x.provider).join(', ')}</p>
      <DashboardSignOut/><AccountControls linkedProviders={profile.linkedProviders}/></main>;
  }catch{redirect('/login');}
}
