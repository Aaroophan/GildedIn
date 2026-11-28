import {notFound,redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {OWNER_TOOLS} from '@/ui/owner/shell.tsx';
export const dynamic='force-dynamic';
const labels:Record<string,[string,string]>={
  sections:['Sections & collections','The visual section manager will arrive with the canvas editor. You can edit your initial Hero content now.'],
  media:['Media','Secure image and PDF ingestion, quota reservations and deletion will arrive with Issue 12. New uploads are unavailable.'],
  publishing:['Publications','Release preparation, publication, restoration and propagation tracking will arrive with Issue 13. Your draft cannot be published from this screen.'],
  gilden:['Gilden privacy','Gilden is disabled until explicit field approvals, release binding and AI-provider privacy gates are verified in Issue 16.'],
  inbox:['Contact inbox','Consent-based contact submissions and owner-only inbox will arrive with Issue 17. No messages are currently served here.'],
  analytics:['Analytics','Privacy-conscious aggregate analytics are not enabled until Issue 17. No visitor tracking is activated by this page.'],
  seo:['SEO & discovery','Public search, canonical metadata and released-content SEO will arrive with Issues 14 and 17. No draft is indexable.'],
  exports:['Exports & deletion','Secure export and irreversible deletion, with recent-auth safeguards, will arrive with Issue 18. No data operation is initiated here.']};
export default async function ToolPage({params}:{params:Promise<{tool:string}>}){
  const tool=(await params).tool;
  if(!OWNER_TOOLS.includes(tool))notFound();
  const {portfolio}=await requireOwnerPage();if(!portfolio)redirect('/dashboard/onboarding');
  const [title,description]=labels[tool];
  return <main id="main" className="gi-owner-main"><p className="gi-eyebrow">OWNER WORKSPACE</p><h1>{title}</h1>
    <div className="gi-owner-panel"><p>{description}</p><p>No unsaved or unpublished data is exposed on this page.</p>
      <a href="/dashboard">Back to overview</a></div></main>;
}
