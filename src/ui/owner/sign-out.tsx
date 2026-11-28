'use client';
import {useState} from 'react';
export default function DashboardSignOut(){
  const[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function signOut(){
    setBusy(true);setError('');
    try {
      const csrf=await fetch('/api/v1/accounts/me/csrf',{credentials:'same-origin',cache:'no-store'});
      if(!csrf.ok)throw new Error();
      const {csrfToken}=await csrf.json() as {csrfToken:string};
      const revoked=await fetch('/api/v1/accounts/me/sessions/revoke',{method:'POST',cache:'no-store',
        credentials:'same-origin',headers:{'X-CSRF-Token':csrfToken,'Content-Type':'application/json'},body:'{}'});
      if(!revoked.ok)throw new Error();
      try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);
        if(key?.startsWith('gi:onboarding:v1:'))localStorage.removeItem(key);}}catch{}
      try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);
        if(key?.startsWith('gildedin:unsaved:v1:'))sessionStorage.removeItem(key);}
        localStorage.setItem('gildedin:account-signout:v1',String(Date.now()));}catch{}
      window.location.assign('/login');
    }catch{setError('Could not revoke this session. Please try again.');}
    finally{setBusy(false);}
  }
  return <div><button type="button" disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'}</button>
    {error&&<p role="alert">{error}</p>}</div>;
}
