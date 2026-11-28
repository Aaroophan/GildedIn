'use client';
import {useState} from 'react';
import {GiField,GiButton} from '../design/primitives.tsx';
import {ownerRequest,OwnerRequestError} from './request.ts';
export default function AccountProfileEditor({initialName}:{initialName:string}){
  const [name,setName]=useState(initialName),[ack,setAck]=useState(initialName);
  const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
  async function save(){setBusy(true);setStatus('Saving profile…');
    try{const result=await ownerRequest<{displayName:string}>('/api/v1/accounts/me','PATCH',{displayName:name.trim()});
      setName(result.displayName);setAck(result.displayName);setStatus('Account display name saved.');}
    catch(e){setStatus(e instanceof OwnerRequestError?e.message:'Could not confirm the update. Please try again.');}
    finally{setBusy(false);}}
  return <div><GiField label="Account display name" value={name} maxLength={100} required
    onChange={e=>{setName(e.currentTarget.value);setStatus('Unsaved account changes.');}}/>
    <div className="gi-owner-actions"><GiButton type="button" disabled={busy||name.trim()===ack||!name.trim()} onClick={save}>
      {busy?'Saving…':'Save profile'}</GiButton></div><p role="status" aria-live="polite">{status}</p>
  </div>;
}
