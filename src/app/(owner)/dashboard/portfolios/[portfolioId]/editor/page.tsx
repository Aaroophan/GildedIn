import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {requireContentRepository} from '@/bootstrap/identity-runtime.ts';
import {projectOwnerDraft} from '@/domain/content/owner-view.ts';
import type {ContentDraftShape} from '@/domain/content/types.ts';
import CanvasEditor from '@/ui/owner/canvas/canvas-editor.tsx';
import HeroEditor from '@/ui/owner/hero-editor.tsx';
export const metadata:Metadata={title:'Visual canvas editor',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function EditorPage({params}:{params:Promise<{portfolioId:string}>}){
  const {portfolio,actor}=await requireOwnerPage();
  if(!portfolio)redirect('/dashboard/onboarding');
  if(portfolio.portfolioId!==(await params).portfolioId)notFound();
  const raw=await (await requireContentRepository()).getOwnedDraft(actor,portfolio.portfolioId);
  const doc=projectOwnerDraft(raw);
  // Serializing the typed DTO removes any non-plain prototype from the parsed Mongo projection;
  // it does not grant public access. Account and release control metadata are not sent to the client.
  const editorDraft=JSON.parse(JSON.stringify({profile:doc.profile,sections:doc.sections,
    collectionDefinitions:doc.collectionDefinitions,contentCollections:doc.contentCollections,
    nodes:doc.nodes,mediaRefs:doc.mediaRefs})) as ContentDraftShape;
  return <main id="main" className="gi-owner-main gi-owner-canvas-page">
    <CanvasEditor portfolioId={portfolio.portfolioId} revision={doc.revision} initial={editorDraft}/>
    <details className="gi-owner-panel gi-canvas-hero-details"><summary>Edit the required Hero identity fields</summary>
      <p>The Hero identity is stored as typed profile fields. Updating it uses the original authenticated content API. If you have unsaved canvas edits, save them first, then reload after profile changes to avoid a stale revision.</p>
      <HeroEditor portfolioId={portfolio.portfolioId} revision={doc.revision} initial={{
        displayName:String(doc.profile.displayName??''),identityLabel:String(doc.profile.identityLabel??''),
        introduction:String(doc.profile.introduction??'')}}/>
    </details>
  </main>;
}
