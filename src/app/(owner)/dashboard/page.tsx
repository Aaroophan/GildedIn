import {requireOwnerPage} from '@/server/owner/context.ts';
import {ownerLifecycle,ownerQuota} from '@/domain/onboarding/model.ts';
import {TechnicalFrame} from '@/ui/design/technical-frame.tsx';
export const dynamic='force-dynamic';
export default async function Dashboard(){
  const {account,portfolio}=await requireOwnerPage();
  if(!portfolio)return <main id="main" className="gi-owner-main"><p className="gi-eyebrow">YOUR WORKSPACE</p>
    <h1>Create your first portfolio.</h1><p>You have an account, but no portfolio yet. Start with your name, a professional label and a short introduction. Projects and employment history are optional.</p>
    <p><a className="gi-link-button" href="/dashboard/onboarding">Create your portfolio</a></p>
    <p className="gi-small-copy">Creating a portfolio saves a private draft. Nothing becomes public automatically.</p></main>;
  const status=ownerLifecycle(portfolio),quota=ownerQuota(portfolio);
  return <main id="main" className="gi-owner-main"><p className="gi-eyebrow">PORTFOLIO OVERVIEW</p>
    <h1>{account.displayName}&apos;s workspace</h1><p>Your portfolio: <strong>{portfolio.slug}</strong></p>
    <div className="gi-owner-cards">
      <TechnicalFrame as="section" className="gi-owner-card"><h2>Publication</h2><p className="gi-owner-status-text">{status.title}</p><p>{status.explanation}</p>
        <p>{status.publiclyAccessible?<a href={portfolio.canonicalUrl}>View the published release</a>:'Public URL is not active until a release is published.'}</p>
        <p>{portfolio.visibility==='unlisted'?'Unlisted sites can still be viewed by anyone with the link.':status.robots}</p>
      </TechnicalFrame>
      <TechnicalFrame as="section" className="gi-owner-card"><h2>Draft</h2><p className="gi-owner-status-text">{status.draftLabel}</p>
        <p>Saved content stays separate from the public release. Unsaved browser edits are not represented by this server revision.</p>
        {status.canEdit?<a className="gi-link-button" href={`/dashboard/portfolios/${portfolio.portfolioId}/editor`}>Edit your content</a>:null}
      </TechnicalFrame>
      <TechnicalFrame as="section" className="gi-owner-card"><h2>Limits & services</h2>
        <p>{quota.blocksLimit} authored blocks, {quota.itemsPerCollection} items per collection, {Math.round(quota.publishedReleaseBytes/1024)} KiB per released document.</p>
        <p>{quota.mediaFilesUsed??0} of {quota.mediaFilesLimit} original files; {Math.round((quota.mediaUsedBytes??0)/1024)} KiB used of {Math.round(quota.mediaBytesLimit/1024/1024)} MiB allowed.</p>
        <p>Global storage capacity, inbox, analytics, publishing and AI availability must be verified separately.</p>
      </TechnicalFrame>
    </div>
    <section className="gi-owner-panel"><h2>Next steps</h2><div className="gi-owner-actions">
      {status.canEdit?<a className="gi-button gi-button-secondary" href={`/dashboard/portfolios/${portfolio.portfolioId}/editor`}>Review and edit content</a>:null}
      <a className="gi-button gi-button-secondary" href="/dashboard/portfolio">Visibility & URLs</a>
      <a className="gi-button gi-button-secondary" href="/dashboard/tools/publishing">Publication status</a>
      <a className="gi-button gi-button-secondary" href="/dashboard/account">Sign-in security</a>
    </div><p className="gi-small-copy">Publishing and protected draft preview are not enabled until their separate release and preview requirements are verified.</p></section>
  </main>;
}
