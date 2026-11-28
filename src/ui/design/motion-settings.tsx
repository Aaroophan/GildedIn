'use client';
/** Visitor-only preference, local to the browser. No tracking, server write or device fingerprint. */
import {createContext,useContext,useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {effectiveMotion,validMotionLevel,MOTION_LEVELS} from '../../domain/design/motion.ts';
import type {MotionLevel} from '../../domain/design/theme.ts';
interface MotionState {motion:MotionLevel;selected:MotionLevel|null;reducedMotion:boolean;
  setSelected:(choice:MotionLevel)=>void;}
const MotionContext=createContext<MotionState|undefined>(undefined);
const PREF_KEY='gildedin:visual-intensity:v1';
export function MotionProvider({children,defaultMotion='standard',forceOff=false}:{children:ReactNode;defaultMotion?:MotionLevel;forceOff?:boolean}){
  const [selected,setSelectedState]=useState<MotionLevel|null>(null),[reduced,setReduced]=useState(true);
  useEffect(()=>{
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange=()=>setReduced(query.matches);
    onChange();query.addEventListener('change',onChange);
    try{const stored=window.localStorage.getItem(PREF_KEY);
      if(validMotionLevel(stored))setSelectedState(stored);}catch{/* browser may deny storage */}
    const onStorage=(event:StorageEvent)=>{if(event.key===PREF_KEY)
      setSelectedState(validMotionLevel(event.newValue)?event.newValue:null);};
    window.addEventListener('storage',onStorage);
    return ()=>{query.removeEventListener('change',onChange);window.removeEventListener('storage',onStorage);};
  },[]);
  const setSelected=(choice:MotionLevel)=>{
    if(!validMotionLevel(choice))return;
    setSelectedState(choice);
    try{window.localStorage.setItem(PREF_KEY,choice);}catch{/* still works this session */}
  };
  const motion=forceOff?'off':effectiveMotion(defaultMotion,selected,reduced);
  return <MotionContext.Provider value={{motion,selected,reducedMotion:reduced,setSelected}}>
    <div className="gi-motion-scope" data-gi-motion={motion}>{children}</div>
  </MotionContext.Provider>;
}
export function useMotionSettings():MotionState{
  const context=useContext(MotionContext);
  if(!context)throw new Error('MOTION_PROVIDER_REQUIRED');
  return context;
}
export function MotionControls(){
  const {motion,selected,reducedMotion,setSelected}=useMotionSettings();
  return <fieldset className="gi-motion-controls" aria-describedby="gi-motion-explanation">
    <legend>Visual effects</legend><div className="gi-motion-choice">
      {MOTION_LEVELS.map(choice=><button key={choice} type="button" className="gi-control"
        aria-pressed={(selected??motion)===choice} onClick={()=>setSelected(choice)}>
        {choice==='off'?'Off':choice==='subtle'?'Subtle':choice==='standard'?'Standard':'Cinematic'}
      </button>)}
    </div><p id="gi-motion-explanation" className="gi-small-copy">
      {reducedMotion?'Reduced motion is enabled in your system; animations stay off.':
        'Your selection stays in this browser. All content works without effects.'}</p>
  </fieldset>;
}
