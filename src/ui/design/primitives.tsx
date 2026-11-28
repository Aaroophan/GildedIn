'use client';
/** Shared native form/navigation primitives. Focus/labels and purpose survive without motion. */
import {useEffect,useId,useRef,useState} from 'react';
import type {ReactNode,ComponentPropsWithRef,InputHTMLAttributes} from 'react';
export function GiButton({children,variant='primary',...rest}:ComponentPropsWithRef<'button'>&{
  variant?:'primary'|'secondary'|'danger'}){
  return <button {...rest} className={`gi-button gi-button-${variant} ${rest.className??''}`.trim()}>{children}</button>;
}
export function GiLink({href,children,className=''}:{href:string;children:ReactNode;className?:string}){
  if(!/^\/(?!\/)[a-z0-9/\-#]*$/.test(href)&&!/^#[a-z][a-z0-9_-]*$/.test(href))
    throw new Error('UNSAFE_GI_LINK');
  return <a className={`gi-link ${className}`} href={href}>{children}</a>;
}
export function GiField({label,error,hint,required,...rest}:InputHTMLAttributes<HTMLInputElement>&{
  label:string;error?:string;hint?:string}){
  const instance=useId(),id=rest.id??`gi-field-${instance}`;
  return <div className="gi-field"><label htmlFor={id}>{label}{required?<span className="gi-required"> (required)</span>:null}</label>
    {hint?<p id={`${id}-hint`} className="gi-field-hint">{hint}</p>:null}
    <input {...rest} id={id} required={required} aria-invalid={!!error}
      aria-describedby={[hint?`${id}-hint`:null,error?`${id}-error`:null].filter(Boolean).join(' ')||undefined}/>
    {error?<p className="gi-field-error" id={`${id}-error`}><span aria-hidden="true">!</span> {error}</p>:null}</div>;
}
export function GiSelect({id,label,options,defaultValue}:{id:string;label:string;options:{value:string;label:string}[];
  defaultValue?:string}){
  return <div className="gi-field"><label htmlFor={id}>{label}</label><select id={id} defaultValue={defaultValue}>
    {options.map(option=><option value={option.value} key={option.value}>{option.label}</option>)}
  </select></div>;
}
export function GiNotice({kind='info',children}:{kind?:'info'|'success'|'warning'|'error';children:ReactNode}){
  return <div className={`gi-notice gi-notice-${kind}`} role={kind==='error'?'alert':'status'}>
    <span aria-hidden="true" className="gi-notice-marker">{kind==='error'?'!':kind==='success'?'✓':'i'}</span>{children}</div>;
}
export function GiDialog({label,trigger,children}:{label:string;trigger:string;children:ReactNode}){
  const ref=useRef<HTMLDialogElement>(null),returnFocus=useRef<HTMLButtonElement>(null);
  const close=()=>ref.current?.close();
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;
    const onClose=()=>returnFocus.current?.focus();
    dialog.addEventListener('close',onClose);return()=>dialog.removeEventListener('close',onClose);},[]);
  return <><GiButton ref={returnFocus} variant="secondary" type="button" onClick={()=>ref.current?.showModal()}>
    {trigger}</GiButton><dialog className="gi-dialog" aria-label={label} ref={ref} onCancel={()=>{}}>
    <div className="gi-dialog-body"><h2>{label}</h2>{children}
      <GiButton type="button" variant="secondary" onClick={close}>Close dialog</GiButton></div></dialog></>;
}
export function GiTabs({label,items}:{label:string;items:{id:string;title:string;body:ReactNode}[]}){
  const [selected,setSelected]=useState(0),[enhanced,setEnhanced]=useState(false);
  const refs=useRef<(HTMLButtonElement|null)[]>([]);
  useEffect(()=>setEnhanced(true),[]);
  if(items.length===0)return <p>No content is available.</p>;
  const select=(key:string,index:number)=>{const next=key==='Home'?0:key==='End'?items.length-1:
    key==='ArrowRight'?(index+1)%items.length:key==='ArrowLeft'?(index+items.length-1)%items.length:-1;
    if(next>=0){setSelected(next);refs.current[next]?.focus();return true;}return false;};
  return <section className="gi-tabs" aria-label={label}>
    {enhanced?<div role="tablist" aria-label={label}>
      {items.map((item,i)=><button role="tab" type="button" key={item.id}
        ref={el=>{refs.current[i]=el;}} aria-selected={selected===i} tabIndex={selected===i?0:-1}
        id={`gi-tab-${item.id}`} aria-controls={`gi-panel-${item.id}`} onClick={()=>setSelected(i)}
        onKeyDown={e=>{if(select(e.key,i))e.preventDefault();}}>{item.title}</button>)}
    </div>:null}
    {items.map((item,i)=><div key={item.id} id={`gi-panel-${item.id}`}
      role={enhanced?'tabpanel':undefined} aria-labelledby={enhanced?`gi-tab-${item.id}`:undefined}
      hidden={enhanced&&i!==selected} tabIndex={enhanced?0:undefined}>
      {!enhanced?<h3>{item.title}</h3>:null}{item.body}</div>)}
  </section>;
}
