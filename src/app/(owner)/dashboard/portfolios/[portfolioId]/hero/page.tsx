import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {requireContentRepository} from '@/bootstrap/identity-runtime.ts';
import {projectOwnerDraft} from '@/domain/content/owner-view.ts';
import HeroEditor from '@/ui/owner/hero-editor.tsx';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Edit private Hero identity',robots:{index:false,follow:false}};
export default async function HeroPage({params}:{params:Promise<{portfolioId:string}>}){
  const {portfolio,actor}=await requireOwnerPage();
  if(!portfolio)redirect('/dashboard/onboarding');
  if((await params).portfolioId!==portfolio.portfolioId)notFound();
  const draft=projectOwnerDraft(await (await requireContentRepository()).getOwnedEditableDraft(actor,portfolio.portfolioId));
  return <main id="main" className="gi-owner-main"><p className="gi-eyebrow">PRIVATE CONTENT / HERO</p>
    <h1>Edit your profile identity</h1>
    <p>The Hero editor uses separate revision-controlled profile mutations. Return to the canvas to reload the saved identity.</p>
    <HeroEditor portfolioId={portfolio.portfolioId} revision={draft.revision} initial={{
      displayName:String(draft.profile.displayName??''),identityLabel:String(draft.profile.identityLabel??''),
      introduction:String(draft.profile.introduction??'')}}/>
    <a className="gi-button gi-button-secondary" href={`/dashboard/portfolios/${portfolio.portfolioId}/editor`}>Back to canvas editor</a>
  </main>;
}
