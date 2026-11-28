import {redirect} from 'next/navigation';
import type {Metadata} from 'next';
import {createHash} from 'node:crypto';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {loadServerEnvironment} from '@/server/config/server.ts';
import OnboardingWizard from '@/ui/owner/onboarding-wizard.tsx';
export const metadata:Metadata={title:'Create a portfolio',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function OnboardingPage(){
  const ctx=await requireOwnerPage('/dashboard/onboarding');
  if(ctx.portfolio)redirect('/dashboard');
  const scope=createHash('sha256').update(`gildedin-onboarding:v1:${ctx.actor.accountId}`).digest('hex').slice(0,40);
  return <main className="gi-owner-main" id="main"><p className="gi-eyebrow">START YOUR STORY</p>
    <h1>Create your portfolio</h1><p>Your information remains in a private draft until you explicitly publish it later. No project, employer, or work history is required.</p>
    <OnboardingWizard accountScopeHash={scope} accountDisplayName={ctx.account.displayName}
      publicOrigin={loadServerEnvironment().APP_CANONICAL_ORIGIN}/>
  </main>;
}
