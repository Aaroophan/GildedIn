'use client';
import {useState} from 'react';
import {GiField,GiButton,GiNotice} from '../design/primitives.tsx';
import type {OwnerPortfolioSummary} from '../../domain/tenancy/ports.ts';
import {ownerLifecycle,normalizeOnboardingSlug,ownerQuota} from '../../domain/onboarding/model.ts';
import {ownerRequest,OwnerRequestError} from './request.ts';
export default function PortfolioSettings({initial}:{initial:OwnerPortfolioSummary}){
  const [portfolio,setPortfolio]=useState(initial),[target,setTarget]=useState(initial.slug);
  const [renameKey,setRenameKey]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
  const life=ownerLifecycle(portfolio),quota=ownerQuota(portfolio),slug=normalizeOnboardingSlug(target);
  const base=new URL(portfolio.canonicalUrl);base.pathname='/';base.search='';base.hash='';
  const preview=`${base.origin}/${slug||'your-name'}`;
  async function rename(){if(!slug||slug===portfolio.slug)return;
    setBusy(true);setStatus('Reserving the new username…');
    try{const result=await ownerRequest<OwnerPortfolioSummary>(`/api/v1/portfolios/${portfolio.portfolioId}/rename`,
      'POST',{newSlug:slug},{'Idempotency-Key':renameKey});
      setPortfolio(result);setTarget(result.slug);setRenameKey(crypto.randomUUID());setStatus('Username changed. Old URLs remain reserved as redirects.');}
    catch(e){setStatus(e instanceof OwnerRequestError?e.message:'Could not confirm the rename. Refresh and try again.');}
    finally{setBusy(false);}}
  async function policy(action:'visibility'|'disable'|'enable',value?:'public'|'unlisted'){
    setBusy(true);setStatus('Checking current portfolio policy…');
    try{const result=await ownerRequest<{status:OwnerPortfolioSummary['status'];visibility:'public'|'unlisted';
      securityVersion:number;activeReleaseId:string|null}>(
        `/api/v1/portfolios/${portfolio.portfolioId}/${action}`,'POST',action==='visibility'?{visibility:value}:{},
        {'If-Match':`"${portfolio.securityVersion}"`});
      setPortfolio(old=>({...old,status:result.status,visibility:result.visibility,
        securityVersion:result.securityVersion,activeReleaseId:result.activeReleaseId}));
      setStatus('Policy change confirmed by the server. Existing releases are not edited.');}
    catch(e){setStatus(e instanceof OwnerRequestError?e.message:'Policy change was not confirmed. Refresh before retrying.');}
    finally{setBusy(false);}}
  return <>
    <section className="gi-owner-panel"><h2>Current identity</h2>
      <p>Canonical address: {life.publiclyAccessible?<a href={portfolio.canonicalUrl}>{portfolio.canonicalUrl}</a>:<code>{portfolio.canonicalUrl}</code>}</p>
      <p>{life.title}. {life.explanation}</p>
      {portfolio.aliases.length?<p>Previously reserved usernames: {portfolio.aliases.join(', ')}. They cannot be claimed by other accounts while your portfolio exists.</p>:null}
      <GiField label="New public username" maxLength={30} value={target} onChange={e=>{
        setTarget(e.currentTarget.value);setRenameKey(crypto.randomUUID());setStatus('Unsaved username change.');}}
        hint="3–30 ASCII letters, numbers or hyphens. Existing URLs redirect after a successful rename."/>
      <p>Proposed path: <code>{preview}</code></p>
      <p className="gi-small-copy">A corresponding subdomain will work only after independent DNS and TLS verification.</p>
      <GiButton type="button" disabled={busy||!life.canEdit||!slug||slug===portfolio.slug} onClick={rename}>Save username</GiButton>
    </section>
    <section className="gi-owner-panel"><h2>Visibility & indexing</h2>
      <p><strong>{life.title}</strong> · {life.robots}</p>
      <GiNotice kind="warning">Unlisted is not private: anyone with the direct link can view an active release. Changing visibility does not publish your draft or guarantee immediate search-engine removal.</GiNotice>
      <fieldset className="gi-visibility-choice"><legend>Public release discovery policy</legend>
        <label><input type="radio" name="visibility" checked={portfolio.visibility==='public'} disabled={busy||!life.canEdit}
          onChange={()=>policy('visibility','public')}/> Public, eligible for search indexing after publication</label>
        <label><input type="radio" name="visibility" checked={portfolio.visibility==='unlisted'} disabled={busy||!life.canEdit}
          onChange={()=>policy('visibility','unlisted')}/> Unlisted, accessible by direct link after publication</label>
      </fieldset>
      {portfolio.status==='owner_disabled'?<GiButton type="button" variant="secondary" disabled={busy} onClick={()=>policy('enable')}>
        Enable public eligibility</GiButton>:
        <GiButton type="button" variant="danger" disabled={busy||portfolio.status==='suspended'||portfolio.status==='deleting'}
          onClick={()=>{if(window.confirm('Disable public access and Gilden for this portfolio? Your saved drafts stay private.'))void policy('disable');}}>
          Disable public access</GiButton>}
      <p>SEO settings and sitemap inclusion are determined by the current live policy and an active release, not a draft checkbox.</p>
    </section>
    <section className="gi-owner-panel"><h2>Usage and recoverability</h2><p>Original media: {quota.mediaFilesUsed??0} / {quota.mediaFilesLimit} files; {quota.mediaUsedBytes??0} / {quota.mediaBytesLimit} bytes used.
      {portfolio.mediaUsage?.reservedBytes?' Pending uploads reserve additional capacity.':''}</p>
      <p>Limits: {quota.blocksLimit} authored visual blocks, {quota.itemsPerCollection} items per collection, {quota.publishedReleaseBytes} UTF-8 bytes per release. Global storage availability may be lower.</p>
      <GiNotice kind="warning">GildedIn has no guaranteed independent backups, disaster recovery or uninterrupted availability. Version history is not a backup. The service does not request payment cards or sell overages.</GiNotice>
    </section>
    <p className="gi-owner-feedback" role="status" aria-live="polite">{status}</p>
  </>;
}
