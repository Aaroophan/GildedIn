'use client';
/** Small fixed interactions. No owner JavaScript, selectors, callbacks or network destinations. */
import {useEffect,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import type {SafeInteraction} from '../../domain/composition/types.ts';
interface Panel {id:string;label:string;body:string;}
export function TabsIsland({id,items,label}:{id:string;items:readonly Panel[];label?:string}){
  const [enhanced,setEnhanced]=useState(false),[current,setCurrent]=useState(0);
  const refs=useRef<(HTMLButtonElement|null)[]>([]);
  useEffect(()=>setEnhanced(true),[]);
  const step=(e:KeyboardEvent<HTMLButtonElement>,i:number)=>{
    const next=e.key==='ArrowRight'?(i+1)%items.length:e.key==='ArrowLeft'?(i+items.length-1)%items.length:
      e.key==='Home'?0:e.key==='End'?items.length-1:-1;
    if(next<0)return;e.preventDefault();setCurrent(next);refs.current[next]?.focus();
  };
  return <section id={`gi-tabs-${id}`} aria-label={label??'Information tabs'}>
    {enhanced?<div role="tablist" aria-label={label??'Information tabs'}>
      {items.map((item,i)=><button type="button" key={item.id} role="tab"
        ref={el=>{refs.current[i]=el;}} id={`gi-tab-${id}-${item.id}`}
        data-gi-tab-id={item.id} tabIndex={current===i?0:-1}
        aria-selected={current===i} aria-controls={`gi-tabpanel-${id}-${item.id}`}
        onClick={()=>setCurrent(i)} onKeyDown={e=>step(e,i)}>{item.label}</button>)}
    </div>:null}
    {items.map((item,i)=><div key={item.id} id={`gi-tabpanel-${id}-${item.id}`}
      role={enhanced?'tabpanel':undefined} tabIndex={enhanced?0:undefined}
      aria-labelledby={enhanced?`gi-tab-${id}-${item.id}`:undefined}
      hidden={enhanced&&current!==i}>
      {!enhanced?<h3>{item.label}</h3>:null}<p>{item.body}</p>
    </div>)}
  </section>;
}
export function CarouselIsland({id,items,label}:{id:string;items:readonly Panel[];label?:string}){
  const [enhanced,setEnhanced]=useState(false),[current,setCurrent]=useState(0);
  useEffect(()=>setEnhanced(true),[]);
  const move=(delta:number)=>setCurrent(i=>(i+delta+items.length)%items.length);
  return <section id={`gi-carousel-${id}`} aria-label={label??'Content carousel'}>
    {items.map((item,i)=><article key={item.id} id={`gi-slide-${id}-${item.id}`}
      aria-roledescription={enhanced?'slide':undefined}
      aria-label={enhanced?`${i+1} of ${items.length}: ${item.label}`:undefined}
      hidden={enhanced&&current!==i}><h3>{item.label}</h3><p>{item.body}</p></article>)}
    {enhanced&&items.length>1?<div>
      <button type="button" data-gi-carousel-action="previous" onClick={()=>move(-1)}
        aria-controls={`gi-carousel-${id}`}>Previous slide</button>
      <button type="button" data-gi-carousel-action="next" onClick={()=>move(1)}
        aria-controls={`gi-carousel-${id}`}>Next slide</button>
    </div>:null}
  </section>;
}
export function ActionIsland({label,action}:{label:string;action:SafeInteraction}){
  const [enhanced,setEnhanced]=useState(false),[expanded,setExpanded]=useState(false);
  const ref=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setEnhanced(true);if(action.kind==='togglePanel'||action.kind==='openModal'){
    const target=document.getElementById(`gi-node-${action.targetNodeId}`);
    if(target){if(action.kind==='openModal'&&target instanceof HTMLDialogElement)target.close();
      else {target.hidden=true;target.setAttribute('inert','');}}
  }},[action]);
  if(!enhanced)return <span>{label}</span>; // No-JS content stays readable; enhancement supplies the button.
  const toggle=()=>{
    if(action.kind==='togglePanel'||action.kind==='openModal'){
      const target=document.getElementById(`gi-node-${action.targetNodeId}`);
      if(!target)return;
      if(action.kind==='openModal'&&target instanceof HTMLDialogElement){
        target.showModal();const focus=target.querySelector<HTMLElement>('button, a, input, [tabindex="0"]');
        focus?.focus();const onClose=()=>{ref.current?.focus();target.removeEventListener('close',onClose);};
        target.addEventListener('close',onClose);return;
      }
      const next=target.hidden;target.hidden=!next;target.toggleAttribute('inert',!next);
      setExpanded(next);if(next)target.querySelector<HTMLElement>('button, a, input, [tabindex="0"]')?.focus();
      else if(target.contains(document.activeElement))ref.current?.focus();
    }else if(action.kind==='switchTab'){
      const target=document.querySelector<HTMLButtonElement>(`#gi-tabs-${action.groupNodeId} [data-gi-tab-id="${action.tabId}"]`);
      target?.click();target?.focus();
    }else if(action.kind==='advanceCarousel'){
      const target=document.querySelector<HTMLButtonElement>(`#gi-carousel-${action.carouselNodeId} [data-gi-carousel-action="${action.delta===1?'next':'previous'}"]`);
      target?.click();target?.focus();
    }else if(action.kind==='openContactForm'){
      const target=document.querySelector<HTMLElement>('[data-gi-contact-form="true"]');
      target?.scrollIntoView({block:'start',behavior:'auto'});target?.focus();
    }
  };
  if(action.kind==='none'||action.kind==='navigate'||action.kind==='scrollToSection')return null;
  return <button type="button" ref={ref} onClick={toggle}
    {...(action.kind==='togglePanel'?{'aria-expanded':expanded,'aria-controls':`gi-node-${action.targetNodeId}`}:{})}>
    {label}</button>;
}
