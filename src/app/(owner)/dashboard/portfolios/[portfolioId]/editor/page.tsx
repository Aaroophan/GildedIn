import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {requireContentRepository} from '@/bootstrap/identity-runtime.ts';
import {projectOwnerDraft} from '@/domain/content/owner-view.ts';
import HeroEditor from '@/ui/owner/hero-editor.tsx';
export const metadata:Metadata={title:'Edit portfolio content',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function EditorPage({params}:{params:Promise<{portfolioId:string}>}){
  const {portfolio,actor}=await requireOwnerPage();
  if(!portfolio)redirect('/dashboard/onboarding');
  if(portfolio.portfolioId!==(await params).portfolioId)notFound();
  const doc=projectOwnerDraft(await (await requireContentRepository()).getOwnedDraft(actor,portfolio.portfolioId));
  return <main id="main" className="gi-owner-main"><p className="gi-eyebrow">PRIVATE DRAFT</p>
    <h1>Edit your story</h1><p>This text editor saves the existing typed Hero fields. The free-positioned canvas, protected preview and publication workflow are separate upcoming features.</p>
    <HeroEditor portfolioId={portfolio.portfolioId} revision={doc.revision} initial={{
      displayName:String(doc.profile.displayName??''),identityLabel:String(doc.profile.identityLabel??''),
      introduction:String(doc.profile.introduction??'')}}/>
    <section className="gi-owner-panel"><h2>Content structure</h2>
      <p>{doc.sections.length} section(s) in your private draft, including the required Hero.</p>
      {doc.contentCollections.map(c=><p key={c.collectionId}>{c.collectionId}: {c.items.length} item(s), not public until reviewed and approved.</p>)}
      <p>Authored visual blocks: {doc.nodes.length} of 20. No draft data is served from public URLs.</p>
      <a href="/dashboard/tools/sections">Sections & collections</a> · <a href="/dashboard/portfolio">Visibility settings</a>
    </section>
  </main>;
}
