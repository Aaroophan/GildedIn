import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {requireContentRepository} from '@/bootstrap/identity-runtime.ts';
import {projectOwnerDraft} from '@/domain/content/owner-view.ts';
import type {ContentDraftShape} from '@/domain/content/types.ts';
import CanvasEditor from '@/ui/owner/canvas/canvas-editor.tsx';
export const metadata:Metadata={title:'Visual canvas editor',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function EditorPage({params}:{params:Promise<{portfolioId:string}>}){
  const {portfolio,actor}=await requireOwnerPage();
  if(!portfolio)redirect('/dashboard/onboarding');
  if(portfolio.portfolioId!==(await params).portfolioId)notFound();
  const raw=await (await requireContentRepository()).getOwnedEditableDraft(actor,portfolio.portfolioId);
  const doc=projectOwnerDraft(raw);
  // Serializing the typed DTO removes any non-plain prototype from the parsed Mongo projection;
  // it does not grant public access. Account and release control metadata are not sent to the client.
  const editorDraft=JSON.parse(JSON.stringify({profile:doc.profile,sections:doc.sections,
    collectionDefinitions:doc.collectionDefinitions,contentCollections:doc.contentCollections,
    nodes:doc.nodes,mediaRefs:doc.mediaRefs})) as ContentDraftShape;
  return <main id="main" className="gi-owner-main gi-owner-canvas-page">
    <CanvasEditor portfolioId={portfolio.portfolioId} accountId={actor.accountId} revision={doc.revision} initial={editorDraft}/>
    <section className="gi-owner-panel"><h2>Hero identity</h2>
      <p>Update your profile fields in their own editor to avoid competing saves with canvas autosave.</p>
      <a className="gi-button gi-button-secondary" href={`/dashboard/portfolios/${portfolio.portfolioId}/hero`}>Edit Hero identity</a>
    </section>
  </main>;
}
