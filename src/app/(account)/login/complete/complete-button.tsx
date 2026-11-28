'use client';
import {useState} from 'react';
export default function CompleteButton(){
  const [error,setError]=useState('');const [working,setWorking]=useState(false);
  async function finish(){
    setWorking(true);setError('');
    try {
      const first=await fetch('/api/auth/ready',{cache:'no-store',credentials:'same-origin'});
      if(!first.ok)throw new Error('ready');
      const {csrfToken}=await first.json() as {csrfToken:string};
      const second=await fetch('/api/v1/accounts/me/sessions/complete',{method:'POST',credentials:'same-origin',
        cache:'no-store',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:'{}'});
      if(!second.ok)throw new Error('exchange');
      window.location.assign('/dashboard');
    }catch{setError('The sign-in exchange could not be completed. Return to sign-in and try again.');}
    finally{setWorking(false);}
  }
  return <div><button type="button" onClick={finish} disabled={working}>
    {working?'Completing sign-in…':'Finish secure sign-in'}</button>
    {error&&<p role="alert">{error}</p>}</div>;
}
