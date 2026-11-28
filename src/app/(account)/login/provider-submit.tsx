'use client';
import {useFormStatus} from 'react-dom';
export default function ProviderSubmit({provider}:{provider:'Google'|'GitHub'}){
  const {pending}=useFormStatus();
  return <button className="gi-button gi-button-secondary" type="submit" disabled={pending} aria-disabled={pending}>
    {pending?`Opening ${provider}…`:`Continue with ${provider}`}</button>;
}
