import type {Metadata} from 'next';
import {requireOwnerPage} from '@/server/owner/context.ts';
import AccountProfileEditor from '@/ui/owner/account-profile-editor.tsx';
import AccountControls from '../account-controls.tsx';
export const metadata:Metadata={title:'Account & sign-in',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function AccountSettings(){
  const {account}=await requireOwnerPage('/dashboard/account');
  return <main className="gi-owner-main" id="main"><p className="gi-eyebrow">SECURE ACCOUNT</p><h1>Account & sign-in</h1>
    <section className="gi-owner-panel"><h2>Your profile</h2>
      <AccountProfileEditor initialName={account.displayName}/>
      <p>Email availability: {account.verifiedEmail?'A verified email is available on your account.':'No verified email is available. Email-dependent features remain unavailable.'}</p>
      <p>Existing identity providers are separate. Matching email addresses do not merge accounts.</p></section>
    <section className="gi-owner-panel"><AccountControls linkedProviders={account.linkedProviders}/></section>
    <section className="gi-owner-panel"><h2>Data and privacy</h2><p>Three retained releases, when publication is enabled, are version history—not independent backups. The service does not guarantee recovery or uninterrupted availability.</p>
      <p>Exports and account deletion are not enabled until their lifecycle and security gates are implemented. <a href="/privacy">Review our privacy notice</a>.</p></section>
  </main>;
}
