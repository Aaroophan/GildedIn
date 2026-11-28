import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {requireOwnerPage} from '@/server/owner/context.ts';
import PortfolioSettings from '@/ui/owner/portfolio-settings.tsx';
export const metadata:Metadata={title:'Portfolio identity & visibility',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function PortfolioSettingsPage(){
  const {portfolio}=await requireOwnerPage('/dashboard/portfolio');
  if(!portfolio)redirect('/dashboard/onboarding');
  return <main className="gi-owner-main" id="main"><p className="gi-eyebrow">PORTFOLIO SETTINGS</p><h1>Identity & visibility</h1>
    <PortfolioSettings initial={portfolio}/>
  </main>;
}
