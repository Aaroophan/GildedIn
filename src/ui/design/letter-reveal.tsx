'use client';
import {useEffect,useRef,useState} from 'react';
import {MOTION_TIMINGS} from '../../domain/design/motion.ts';
import {useMotionSettings} from './motion-settings.tsx';
/** Anime.js is optional to *render* text, not optional to the user's ability to read it. */
export function LetterReveal({text}:{text:string}){
  const ref=useRef<HTMLSpanElement>(null),played=useRef(false),[active,setActive]=useState(false),
    [count,setCount]=useState(0);
  const {motion}=useMotionSettings();
  useEffect(()=>{
    if(motion==='off'||!ref.current){setActive(false);return;}
    let cancelled=false;const sessionKey='gildedin:intro:v1';let first=true;
    try{first=sessionStorage.getItem(sessionKey)!=='played';sessionStorage.setItem(sessionKey,'played');}catch{}
    const duration=first?MOTION_TIMINGS.letterFullDurationMs:MOTION_TIMINGS.letterReturnDurationMs;
    // Keep the full semantic source text visible throughout, including before enhancement starts.
    import('animejs').then(({animate,stagger})=>{
      if(cancelled||!ref.current)return;
      setActive(true);played.current=true;
      const letters=ref.current.querySelectorAll('.gi-intro-letter');
      animate(letters,{opacity:[0,0.85,0],translateY:[6,0],
        delay:stagger(first?MOTION_TIMINGS.letterStaggerMs:6),duration:duration,
        ease:'outCubic'});
    }).catch(()=>{if(!cancelled)setActive(false);});
    return ()=>{cancelled=true;setActive(false);};
  },[motion,count,text]);
  const glyphs=Array.from(text).slice(0,160);
  return <><span ref={ref} className="gi-letter-overlay" aria-hidden="true" data-active={active?'yes':'no'}>
    {glyphs.map((char,i)=><span key={`${i}-${char}`} className="gi-intro-letter">
      {char===' '? '\u00a0':char}</span>)}
  </span>{motion!=='off'?<button className="gi-replay-intro" type="button" aria-label="Replay title highlight"
      onClick={()=>setCount(v=>v+1)}>Replay title highlight</button>:null}</>;
}
