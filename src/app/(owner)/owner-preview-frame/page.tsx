import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {SemanticComposition} from '@/server/composition/semantic-renderer.tsx';
import {ownedPreviewPage} from '@/server/editor/preview-page.ts';
import type {PreviewQuery} from '@/server/editor/preview-page.ts';
export const metadata:Metadata={title:'Private draft frame',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
/** Same-origin iframe only: all ownership checks repeat, and the parent never sends private postMessages. */
export default async function PreviewFrame({searchParams}:{searchParams:Promise<PreviewQuery>}){
  const nonce=(await headers()).get('x-nonce');
  if(!nonce)notFound();
  const preview=await ownedPreviewPage(await searchParams);
  if(!preview.plan)return <main role="alert" className="gi-owner-panel">
    <h1>Preview unavailable</h1><p>This private draft has validation problems or a newer saved revision.</p>
    <ul>{preview.issues.map((item,i)=><li key={i}>{item.message}</li>)}</ul></main>;
  return <main id="main" className="gi-private-preview-frame" aria-label="Private responsive composition">
    <SemanticComposition plan={preview.plan} basePath="" nonce={nonce} theme={preview.theme}
      pauseMotion={preview.animations==='paused'} enableCinematic={false}/>
  </main>;
}
