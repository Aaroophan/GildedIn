/** Pure, testable preference and quality rules; browser signals stay in small client components. */
import type {MotionLevel,Density} from './theme.ts';
export const MOTION_LEVELS=['off','subtle','standard','cinematic'] as const;
export const MOTION_TIMINGS={letterStaggerMs:42,letterFullDurationMs:860,letterReturnDurationMs:180,
  cornerEnterDurationMs:620,cornerReplayDurationMs:220,sceneMaxFps:30} as const;
export type QualityLevel='off'|'low'|'medium'|'high';
export function validMotionLevel(value:unknown):value is MotionLevel{
  return typeof value==='string'&&MOTION_LEVELS.includes(value as MotionLevel);
}
export function effectiveMotion(defaultMotion:MotionLevel,visitorOverride:unknown,reducedMotion:boolean):MotionLevel{
  if(reducedMotion)return 'off';
  return validMotionLevel(visitorOverride)?visitorOverride:defaultMotion;
}
export function deriveSceneQuality(input:{motion:MotionLevel;density:Density;frameMs?:number;
  devicePixelRatio?:number;hardwareConcurrency?:number;saveData?:boolean;visible?:boolean}):{
  quality:QualityLevel;pixelRatio:number;maxParticles:number;targetFps:number;run:boolean}{
  if(input.motion==='off'||input.visible===false)return {quality:'off',pixelRatio:1,maxParticles:0,targetFps:0,run:false};
  let level:QualityLevel=input.motion==='cinematic'?'high':input.motion==='standard'?'medium':'low';
  if(input.saveData||input.hardwareConcurrency!==undefined&&input.hardwareConcurrency<=2||
    input.frameMs!==undefined&&input.frameMs>34){level=level==='high'?'medium':'low';}
  if(input.frameMs!==undefined&&input.frameMs>55)level='low';
  const count=level==='high'?48:level==='medium'?24:8;
  const scale=input.density==='low'?.5:input.density==='high'?1.25:1;
  const dpr=Math.max(1,Math.min(2,Number.isFinite(input.devicePixelRatio)?input.devicePixelRatio??1:1));
  return {quality:level,pixelRatio:Math.min(dpr,level==='high'?1.75:level==='medium'?1.5:1),
    maxParticles:Math.min(60,Math.floor(count*scale)),targetFps:level==='high'?30:level==='medium'?24:15,run:true};
}
