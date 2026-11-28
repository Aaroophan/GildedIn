'use client';
import {useEffect,useState} from 'react';
import {GiField,GiButton} from '../design/primitives.tsx';
import {ownerRequest,OwnerRequestError} from './request.ts';
type Hero={displayName:string;identityLabel:string;introduction:string};
export default function HeroEditor({portfolioId,revision,initial}:{portfolioId:string;revision:number;initial:Hero}){
  const [values,setValues]=useState<Hero>(initial),[saved,setSaved]=useState<Hero>(initial);
  const [currentRevision,setRevision]=useState(revision),[busy,setBusy]=useState(false),[status,setStatus]=useState('Saved draft');
  const dirty=values.displayName!==saved.displayName||values.identityLabel!==saved.identityLabel||values.introduction!==saved.introduction;
  useEffect(()=>{if(!dirty)return;const before=(event:BeforeUnloadEvent)=>{event.preventDefault();};
    window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);},[dirty]);
  async function save(){if(!dirty)return;
    setBusy(true);setStatus('Saving private draft…');
    try{const operations=(Object.keys(values) as (keyof Hero)[]).filter(k=>values[k]!==saved[k])
      .map(field=>({type:'setProfileField',field,value:values[field]}));
      const r=await ownerRequest<{revision:number}>(`/api/v1/portfolios/${portfolioId}/draft`,
        'PATCH',{expectedRevision:currentRevision,clientMutationId:crypto.randomUUID(),operations});
      if(!Number.isSafeInteger(r.revision)||r.revision<=currentRevision)throw new Error();
      setRevision(r.revision);setSaved({...values});setStatus(`Changes saved as private draft · revision ${r.revision}. Public release unchanged.`);
    }catch(e){setStatus(e instanceof OwnerRequestError?e.message:'Save not confirmed. Keep this page open and retry.');}
    finally{setBusy(false);}}
  function update(k:keyof Hero,value:string){setValues(p=>({...p,[k]:value}));setStatus('Unsaved changes');}
  return <section className="gi-owner-panel" aria-label="Hero profile fields"><h2>Hero profile</h2>
    <GiField label="Display name" maxLength={100} required value={values.displayName}
      onChange={e=>update('displayName',e.currentTarget.value)}/>
    <GiField label="Professional identity" maxLength={120} required value={values.identityLabel}
      onChange={e=>update('identityLabel',e.currentTarget.value)}/>
    <div className="gi-field"><label htmlFor="gi-hero-introduction">Short introduction (required)</label>
      <textarea id="gi-hero-introduction" required maxLength={800} rows={5} value={values.introduction}
        onChange={e=>update('introduction',e.currentTarget.value)}/></div>
    <div className="gi-owner-actions"><GiButton type="button" disabled={busy||!dirty||!values.displayName.trim()||!values.identityLabel.trim()||!values.introduction.trim()}
      onClick={save}>{busy?'Saving…':'Save draft changes'}</GiButton>
      <GiButton type="button" variant="secondary" disabled={busy||!dirty} onClick={()=>{
        setValues(saved);setStatus('Unsaved changes discarded.');}}>Discard local edits</GiButton></div>
    <p role="status" aria-live="polite">{status}</p>
    <p className="gi-small-copy">A confirmed server revision is the only saved state. The browser cannot silently overwrite another tab&apos;s edits.</p>
  </section>;
}
