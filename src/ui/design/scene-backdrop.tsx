'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
import type {DesignTheme} from '../../domain/design/theme.ts';
import type {SceneGraph} from '../../domain/design/scene.ts';
import {deriveSceneQuality} from '../../domain/design/motion.ts';
import {useMotionSettings} from './motion-settings.tsx';
/** Actual Three.js and shaders are not in the server HTML or critical JS path. */
const ThreeScene=lazy(()=>import('./scene/three-scene.tsx'));
export function SceneBackdrop({theme,sceneGraph}:{theme:DesignTheme;sceneGraph?:SceneGraph}){
  const {motion,reducedMotion}=useMotionSettings(),[visible,setVisible]=useState(false),[ready,setReady]=useState(false),
    [failed,setFailed]=useState(false);
  useEffect(()=>{
    if(motion==='off'||reducedMotion||theme.scene.preset==='off'){setVisible(false);return;}
    const onVisibility=()=>setVisible(document.visibilityState==='visible');
    onVisibility();document.addEventListener('visibilitychange',onVisibility);
    return ()=>document.removeEventListener('visibilitychange',onVisibility);
  },[motion,reducedMotion,theme.scene.preset]);
  useEffect(()=>{
    if(!visible||failed||motion==='off'){setReady(false);return;}
    let cancelled=false;const enable=()=>{if(!cancelled)setReady(true);};
    const timer=window.setTimeout(enable,220); // defer behind first paint
    return ()=>{cancelled=true;window.clearTimeout(timer);setReady(false);};
  },[visible,failed,motion]);
  const quality=deriveSceneQuality({motion,density:theme.scene.density,visible:visible&&!reducedMotion});
  // When no approved release scene exists, content-network degrades to a DECORATIVE grid.
  const preset=theme.scene.preset==='content-network'&&!sceneGraph?'technical-grid':theme.scene.preset;
  return <div className="gi-scene-backdrop" aria-hidden="true" data-scene-preset={preset}>
    <div className="gi-scene-static"/>
    {ready&&!failed&&quality.run&&preset!=='off'?<Suspense fallback={null}>
      <ThreeScene preset={preset} quality={quality.quality} color={theme.colors.accentSoft}
        graph={preset==='content-network'?sceneGraph:undefined} onFailure={()=>setFailed(true)}/>
    </Suspense>:null}
  </div>;
}
