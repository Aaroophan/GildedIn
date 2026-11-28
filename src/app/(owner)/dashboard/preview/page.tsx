import type {Metadata} from 'next';
import {ownedPreviewPage} from '@/server/editor/preview-page.ts';
import type {PreviewQuery} from '@/server/editor/preview-page.ts';
export const metadata:Metadata={title:'Protected draft preview',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
const widths={mobile:390,tablet:820,desktop:1200} as const;
export default async function OwnerPreview({searchParams}:{searchParams:Promise<PreviewQuery>}){
  const preview=await ownedPreviewPage(await searchParams);
  const href=(mode:typeof preview.mode,animations:typeof preview.animations)=>
    `/dashboard/preview?portfolioId=${encodeURIComponent(preview.portfolioId)}&revision=${preview.revision}&mode=${mode}&animations=${animations}`;
  const frame=href(preview.mode,preview.animations).replace('/dashboard/preview?','/owner-preview-frame?');
  return <main id="main" className="gi-owner-main gi-protected-preview">
    <p className="gi-eyebrow">OWNER-ONLY / DRAFT VIEW</p><h1>Protected preview</h1>
    <p>This is the last server-acknowledged private draft, revision <strong>{preview.revision}</strong>.
      It is not a published page or a shareable preview link. Unsaved editor changes are not included.</p>
    <nav className="gi-protected-preview-controls" aria-label="Preview viewport">
      {(['desktop','tablet','mobile'] as const).map(mode=><a key={mode}
        className={preview.mode===mode?'gi-button gi-button-primary':'gi-button gi-button-secondary'}
        aria-current={preview.mode===mode?'page':undefined} href={href(mode,preview.animations)}>{mode}</a>)}
      <a className="gi-button gi-button-secondary" href={href(preview.mode,preview.animations==='play'?'paused':'play')}>
        {preview.animations==='play'?'Pause animation preview':'Play animation preview'}</a>
      <a className="gi-button gi-button-secondary" href={`/dashboard/portfolios/${preview.portfolioId}/editor`}>Back to editor</a>
    </nav>
    {preview.issues.length?<section className="gi-owner-panel" aria-label="Preview issues"><h2>Draft checks</h2>
      <ul>{preview.issues.map((issue,i)=><li key={i}>{issue.message} <span>{issue.repair}</span></li>)}</ul></section>:null}
    {preview.plan?<div className="gi-protected-preview-viewport" tabIndex={0} aria-label="Scrollable isolated viewport">
      <iframe title={`${preview.mode} owner-only draft preview`} src={frame} loading="eager"
        referrerPolicy="no-referrer" width={widths[preview.mode]} height="760"
        style={{width:widths[preview.mode],height:760,border:0}}/>
    </div>:<p role="alert">The current draft cannot be rendered as a complete preview. Review the issues above; no previously published content has been substituted.</p>}
    <p className="gi-small-copy">Responsive CSS runs inside the isolated viewport. Motion follows reduced-motion preferences and is paused unless you choose Play. Uploaded media is unavailable until approved delivery is implemented.</p>
  </main>;
}
