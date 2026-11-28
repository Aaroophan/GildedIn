'use client';
import {useState} from 'react';
interface LinkedProvider {identityId:string;provider:'google'|'github';}
/** Minimal Issue 4 account controls. Full settings UX belongs to Issue 9. */
export default function AccountControls({linkedProviders}:{linkedProviders:readonly LinkedProvider[]}){
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  async function mutate(url:string,method:'POST'|'DELETE',body:unknown){
    const proof=await fetch('/api/v1/accounts/me/csrf',{cache:'no-store',credentials:'same-origin'});
    if(!proof.ok)throw new Error('csrf');
    const data=await proof.json() as {csrfToken:string};
    return fetch(url,{method,cache:'no-store',credentials:'same-origin',
      headers:{'Content-Type':'application/json','X-CSRF-Token':data.csrfToken},body:JSON.stringify(body)});
  }
  async function link(provider:'google'|'github'){
    setBusy(true);setMessage('');
    try{const res=await mutate('/api/v1/accounts/me/providers/link-intent','POST',{provider});
      if(!res.ok)throw new Error('link');
      const next=await res.json() as {authorizationUrl?:string};
      if(next.authorizationUrl!==`/login/link?provider=${provider}`)throw new Error('invalid-location');
      window.location.assign(next.authorizationUrl);
    }catch{setMessage('Could not start linking. Sign in again to refresh your recent authentication.');setBusy(false);}
  }
  async function unlink(identity:LinkedProvider){
    if(!window.confirm(`Remove ${identity.provider} as a sign-in method? Your session will be revoked and you must sign in again with the remaining provider.`))return;
    setBusy(true);setMessage('');
    try{const res=await mutate(`/api/v1/accounts/me/providers/${encodeURIComponent(identity.identityId)}`,'DELETE',{});
      if(!res.ok){setMessage(res.status===409?'You must keep at least one verified login.':
        'Removal denied. To remove a provider, sign in through the provider you will keep.');return;}
      window.location.assign('/login');
    }catch{setMessage('Could not remove the provider. Try again after reauthentication.');}
    finally{setBusy(false);}
  }
  async function revokeAll(){
    if(!window.confirm('Sign out all devices, including this one? You will need to sign in with your verified provider again.'))return;
    setBusy(true);setMessage('');
    try{const res=await mutate('/api/v1/accounts/me/sessions/revoke-all','POST',{});
      if(!res.ok)throw new Error('revoke');
      window.location.assign('/login');
    }catch{setMessage('Could not revoke sessions. A new provider sign-in may be required.');}
    finally{setBusy(false);}
  }
  return <section aria-label="Sign-in security" className="account-controls">
    <h2>Sign-in security</h2>
    <p>Connected methods: {linkedProviders.map(x=>x.provider==='google'?'Google':'GitHub').join(' and ')||'Unavailable'}.</p>
    <p>To link or remove a login, you need a provider-verified sign-in within the last ten minutes.</p>
    {(['google','github'] as const).map(provider=>linkedProviders.some(x=>x.provider===provider)?null:
      <button key={provider} type="button" disabled={busy} onClick={()=>link(provider)}>
        Link {provider==='google'?'Google':'GitHub'}
      </button>)}
    {linkedProviders.length===1?<p>Your only verified login method cannot be removed.</p>:null}
    {linkedProviders.length>1&&linkedProviders.map(item=><button key={item.identityId}
      type="button" disabled={busy} onClick={()=>unlink(item)}>Remove {item.provider}</button>)}
    <button type="button" disabled={busy} onClick={revokeAll}>Sign out on every device</button>
    <p>For a sensitive change, you may need to <a href="/login?returnTo=%2Fdashboard%2Faccount">verify your provider identity again</a>.</p>
    {message&&<p role="alert">{message}</p>}
  </section>;
}
