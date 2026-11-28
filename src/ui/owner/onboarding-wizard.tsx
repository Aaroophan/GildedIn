'use client';
import {useEffect,useState} from 'react';
import {GiField,GiButton,GiNotice} from '../design/primitives.tsx';
import {EMPTY_WIZARD,JOURNEY_STEPS,normalizeOnboardingSlug,wizardStepErrors,createFromWizard} from '../../domain/onboarding/model.ts';
import type {WizardData,JourneyStep,WizardErrors} from '../../domain/onboarding/model.ts';
import {ownerRequest,OwnerRequestError} from './request.ts';
const ONE_DAY=86_400_000;
type Saved={formatVersion:1;accountScopeHash:string;createdAt:number;expiresAt:number;data:WizardData;mutationKey:string};
function isData(value:unknown):value is WizardData{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const d=value as Record<string,unknown>;
  return Object.keys(d).sort().join(',')===
    ['displayName','slug','identityLabel','introduction','templatePreset','firstProjectTitle','firstProjectSummary'].sort().join(',')&&
    ['displayName','slug','identityLabel','introduction','firstProjectTitle','firstProjectSummary'].every(k=>typeof d[k]==='string'&&(d[k] as string).length<=900)&&
    ['signature','minimal','studio'].includes(String(d.templatePreset));
}
export default function OnboardingWizard({accountScopeHash,accountDisplayName,publicOrigin}:{accountScopeHash:string;
  accountDisplayName:string;publicOrigin:string}){
  const [data,setData]=useState<WizardData>({...EMPTY_WIZARD,displayName:accountDisplayName});
  const [stepIndex,setStepIndex]=useState(0),[errors,setErrors]=useState<WizardErrors>({});
  const [mutationKey,setMutationKey]=useState(''),[hydrated,setHydrated]=useState(false);
  const [createdAt,setCreatedAt]=useState(()=>Date.now());
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[availability,setAvailability]=useState('');
  const key=`gi:onboarding:v1:${accountScopeHash}`;
  useEffect(()=>{
    try{const stored=localStorage.getItem(key);if(stored){const obj=JSON.parse(stored) as Partial<Saved>;
      if(obj.formatVersion===1&&obj.accountScopeHash===accountScopeHash&&typeof obj.expiresAt==='number'&&
        obj.expiresAt>Date.now()&&typeof obj.createdAt==='number'&&
        obj.expiresAt<=obj.createdAt+ONE_DAY&&obj.createdAt<=Date.now()&&isData(obj.data)&&typeof obj.mutationKey==='string'&&
        /^[0-9a-f-]{36}$/i.test(obj.mutationKey)){
          setData(obj.data);setMutationKey(obj.mutationKey);setCreatedAt(obj.createdAt);setStatus('Recovered an unfinished local onboarding draft. Review it before submitting.');
        }else localStorage.removeItem(key);}}
    catch{/* Storage is optional; nothing is implied saved. */}
    setMutationKey(current=>current||crypto.randomUUID());setHydrated(true);
  },[key,accountScopeHash]);
  useEffect(()=>{if(!hydrated||!mutationKey)return;
    const obj:Saved={formatVersion:1,accountScopeHash,createdAt,expiresAt:createdAt+ONE_DAY,data,mutationKey};
    try{localStorage.setItem(key,JSON.stringify(obj));}catch{setStatus('Local recovery is unavailable. Keep this tab open until your portfolio is created.');}
  },[hydrated,data,mutationKey,key,accountScopeHash,createdAt]);
  const step=JOURNEY_STEPS[stepIndex],slug=normalizeOnboardingSlug(data.slug);
  const previewPath=slug?`${publicOrigin}/${slug}`:`${publicOrigin}/your-name`;
  function change<K extends keyof WizardData>(field:K,value:WizardData[K]){
    setData(old=>({...old,[field]:value}));setErrors(old=>({...old,[field]:undefined}));
    setAvailability('');setStatus('Unsaved to the server. Progress is temporarily kept on this device.');
    setMutationKey(crypto.randomUUID());
  }
  function next(){const found=wizardStepErrors(data,step);setErrors(found);
    if(Object.keys(found).length){setStatus('Review the highlighted fields.');return;}
    setStatus('Progress kept locally on this device; no server portfolio exists yet.');
    setStepIndex(i=>Math.min(i+1,JOURNEY_STEPS.length-1));}
  async function checkSlug(){if(!slug){setErrors(old=>({...old,slug:'Enter a valid username before checking availability.'}));return;}
    setBusy(true);setAvailability('Checking availability…');
    try{const res=await fetch(`/api/v1/portfolios/slug-availability?slug=${encodeURIComponent(slug)}`,{
      credentials:'same-origin',cache:'no-store'});
      if(!res.ok)throw new OwnerRequestError(res.status);
      const result=await res.json() as {available?:boolean};
      setAvailability(result.available===true?'Tentatively available. Final creation reserves the username.':
        'This username is unavailable. Try another.');
    }catch(e){setAvailability('Availability could not be checked. Try again.');}
    finally{setBusy(false);}}
  async function create(){const all=wizardStepErrors(data,'review');setErrors(all);
    if(Object.keys(all).length){setStatus('Review the highlighted information before creating your portfolio.');return;}
    setBusy(true);setStatus('Creating your private draft…');
    try{const cmd=createFromWizard(data);
      const created=await ownerRequest<{portfolioId:string;dashboardUrl:string;activeReleaseId:null}>(
        '/api/v1/portfolios','POST',cmd,{'Idempotency-Key':mutationKey});
      if(!/^[0-9a-f-]{36}$/i.test(created.portfolioId)||created.activeReleaseId!==null)
        throw new Error('Unexpected creation response. Review your dashboard.');
      try{localStorage.removeItem(key);}catch{}
      window.location.assign(`/dashboard/portfolios/${created.portfolioId}/editor`);
    }catch(e){setStatus(e instanceof OwnerRequestError?e.message:
      'Could not confirm portfolio creation. Retry with the same information or open the dashboard to check its status.');}
    finally{setBusy(false);}}
  return <div className="gi-wizard">
    <nav aria-label="Onboarding progress"><ol className="gi-wizard-progress">{JOURNEY_STEPS.map((s,i)=><li key={s}
      aria-current={i===stepIndex?'step':undefined} className={i===stepIndex?'gi-active-step':''}>{i+1}. {s==='professional'?'Professional profile':s[0].toUpperCase()+s.slice(1)}</li>)}</ol></nav>
    <div className="gi-owner-panel"><h2>{step==='identity'?'Your name and public username':step==='professional'?'Your professional introduction':
      step==='appearance'?'Choose a starting design':step==='project'?'Optional first project':'Review your private draft'}</h2>
      {step==='identity'?<>
        <GiField label="Display name" value={data.displayName} maxLength={100} required error={errors.displayName}
          autoComplete="name" onChange={e=>change('displayName',e.currentTarget.value)}/>
        <GiField label="Public username" value={data.slug} maxLength={30} required error={errors.slug}
          hint="3–30 ASCII letters, numbers or hyphens. The public URL will use lowercase."
          onChange={e=>change('slug',e.currentTarget.value)}/>
        <p className="gi-small-copy">Proposed canonical path: <code>{previewPath}</code></p>
        <p className="gi-small-copy">A matching subdomain is only a proposed address until wildcard DNS and TLS are verified.</p>
        <GiButton variant="secondary" type="button" disabled={busy||!slug} onClick={checkSlug}>Check username availability</GiButton>
        {availability?<p role="status" aria-live="polite">{availability}</p>:null}
      </>:null}
      {step==='professional'?<>
        <GiField label="Professional role or identity" required maxLength={120} value={data.identityLabel}
          error={errors.identityLabel} placeholder="e.g. Software engineer, Designer, Student"
          onChange={e=>change('identityLabel',e.currentTarget.value)}/>
        <div className="gi-field"><label htmlFor="gi-onboarding-intro">Short introduction (required)</label>
          <textarea id="gi-onboarding-intro" rows={5} maxLength={800} required value={data.introduction}
            aria-invalid={!!errors.introduction} aria-describedby={errors.introduction?'gi-intro-error':undefined}
            onChange={e=>change('introduction',e.currentTarget.value)}/>
          {errors.introduction?<p id="gi-intro-error" className="gi-field-error">{errors.introduction}</p>:null}</div>
        <p>Tell people what you do or hope to do. No employment record is required.</p>
      </>:null}
      {step==='appearance'?<><p>Every preset keeps accessible content and safe design tokens. Visual canvas customization comes later.</p>
        <fieldset className="gi-wizard-presets"><legend>Starting appearance</legend>
          {(['signature','minimal','studio'] as const).map(p=><label key={p}>
            <input type="radio" name="preset" value={p} checked={data.templatePreset===p}
              onChange={()=>change('templatePreset',p)}/> {p[0].toUpperCase()+p.slice(1)}</label>)}</fieldset>
        {errors.templatePreset?<p role="alert">{errors.templatePreset}</p>:null}</>:null}
      {step==='project'?<><p>This step is optional. You can create a portfolio with no projects or work history.</p>
        <GiField label="First project title (optional)" maxLength={160} value={data.firstProjectTitle}
          error={errors.firstProjectTitle} onChange={e=>change('firstProjectTitle',e.currentTarget.value)}/>
        <div className="gi-field"><label htmlFor="gi-onboarding-project-summary">Project summary (optional)</label>
          <textarea id="gi-onboarding-project-summary" rows={3} maxLength={600} value={data.firstProjectSummary}
            aria-invalid={!!errors.firstProjectSummary}
            onChange={e=>change('firstProjectSummary',e.currentTarget.value)}/>
          {errors.firstProjectSummary?<p role="alert" className="gi-field-error">{errors.firstProjectSummary}</p>:null}</div>
        <div className="gi-owner-actions"><GiButton type="button" variant="secondary" disabled={busy}
          onClick={()=>{change('firstProjectTitle','SAMPLE ONLY — replace before publishing');
            change('firstProjectSummary','Example only: describe a real challenge, the technology you chose and what you learned. Replace this sample with your own work.');}}>
          Use editable example text</GiButton></div>
        <GiNotice kind="info">Illustrative example only: the optional button fills editable text clearly marked SAMPLE ONLY. If you keep it, the example is saved only as a private draft; never claim it as a real accomplishment or publish it without replacing it.</GiNotice>
      </>:null}
      {step==='review'?<><dl className="gi-review-grid"><dt>Name</dt><dd>{data.displayName}</dd><dt>Username</dt><dd>{slug}</dd>
        <dt>Professional label</dt><dd>{data.identityLabel}</dd><dt>Introduction</dt><dd>{data.introduction}</dd>
        <dt>Preset</dt><dd>{data.templatePreset}</dd><dt>Project</dt><dd>{data.firstProjectTitle||'Skipped'}</dd>
        {data.firstProjectSummary?<><dt>Project summary</dt><dd>{data.firstProjectSummary}</dd></>:null}
        <dt>Initial publication</dt><dd>None — owner-only draft</dd><dt>Gilden</dt><dd>Disabled</dd></dl>
        <GiNotice kind="warning">Your data is not backed up independently. Revisions are not backups, and service or data loss may be unrecoverable. Publishing requires a separate explicit action after review.</GiNotice>
        <p>Read the <a href="/privacy">privacy notice</a> before saving. A local recovery copy is readable for up to 24 hours. Expired copies are discarded when this wizard next opens; you can clear yours now.</p>
      </>:null}
      <p role="status" aria-live="polite" className="gi-owner-feedback">{status}</p>
      {Object.keys(errors).length>0&&step==='review'?<p role="alert">Please return to the earlier steps to fix the highlighted information.</p>:null}
      <div className="gi-owner-actions">
        {stepIndex>0?<GiButton type="button" variant="secondary" disabled={busy} onClick={()=>{setStepIndex(i=>i-1);setErrors({});}}>Back</GiButton>:null}
        {step==='review'?<GiButton type="button" disabled={busy} onClick={create}>{busy?'Saving private draft…':'Create private portfolio'}</GiButton>:
          <GiButton type="button" disabled={busy} onClick={next}>{step==='project'&&!data.firstProjectTitle?'Skip project & review':'Continue'}</GiButton>}
        <GiButton variant="secondary" type="button" disabled={busy} onClick={()=>{
          try{localStorage.removeItem(key);}catch{}
          setData({...EMPTY_WIZARD,displayName:accountDisplayName});setCreatedAt(Date.now());setStepIndex(0);setMutationKey(crypto.randomUUID());setStatus('Local onboarding details cleared.');
        }}>Start over & clear local copy</GiButton>
      </div>
    </div>
  </div>;
}
