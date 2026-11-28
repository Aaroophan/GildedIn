/** Responsive owner navigation works with ordinary links even without client JavaScript. */
import type {ReactNode} from 'react';
import type {OwnerPageContext} from '../../server/owner/context.ts';
import {ownerLifecycle} from '../../domain/onboarding/model.ts';
import DashboardSignOut from './sign-out.tsx';
const tools=[['sections','Sections & collections'],['media','Media'],['publishing','Publications'],
  ['gilden','Gilden privacy'],['inbox','Inbox'],['analytics','Analytics'],['seo','SEO & discovery'],
  ['exports','Exports & deletion']] as const;
export const OWNER_TOOLS:readonly string[]=tools.map(x=>x[0]);
export function OwnerShell({ctx,children}:{ctx:OwnerPageContext;children:ReactNode}){
  const status=ctx.portfolio?ownerLifecycle(ctx.portfolio):null;
  return <div className="gi-owner-root">
    <header className="gi-owner-header"><a className="gi-brand" href="/" aria-label="GildedIn home">Gilded<span>In</span></a>
      <p className="gi-owner-account">Signed in as <strong>{ctx.account.displayName}</strong></p>
      <DashboardSignOut/></header>
    <div className="gi-owner-columns">
      <aside className="gi-owner-sidebar"><details className="gi-owner-menu" open>
        <summary>Dashboard navigation</summary><nav aria-label="Owner dashboard navigation">
          <a href="/dashboard">Overview</a>
          {ctx.portfolio?<>
            <a href={`/dashboard/portfolios/${ctx.portfolio.portfolioId}/editor`}>Edit portfolio content</a>
            <a href="/dashboard/portfolio">Portfolio identity & visibility</a>
            {tools.map(([slug,label])=><a href={`/dashboard/tools/${slug}`} key={slug}>{label}</a>)}
          </>:<a href="/dashboard/onboarding">Create portfolio</a>}
          <a href="/dashboard/account">Account & sign-in</a>
        </nav></details>
        {status?<p className="gi-owner-side-status">{status.title}<span>{status.draftLabel}</span></p>:null}
      </aside>
      <div className="gi-owner-content">{children}</div>
    </div><footer className="gi-owner-footer">Private owner workspace · <a href="/privacy">Privacy notice</a> · No guaranteed independent backups</footer>
  </div>;
}
