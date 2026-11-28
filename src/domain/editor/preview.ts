/** Strict preview selectors. Only the root composition route is supported by the v1 renderer. */
import type {Breakpoint} from '../composition/types.ts';
export interface PreviewSelection {mode:Breakpoint;route:'/';animations:'paused'|'play';revision?:number;}
export function parsePreviewSelection(url:string):PreviewSelection{
  const params=new URL(url).searchParams;
  let invalid=false;params.forEach((_value,key)=>{if(!['mode','route','animations','revision'].includes(key)||
    params.getAll(key).length!==1)invalid=true;});
  if(invalid)throw new Error('INVALID_PREVIEW_PARAMETER');
  const mode=params.get('mode')??'desktop';
  const route=params.get('route')??'/';
  const animations=params.get('animations')??'paused';
  const rev=params.get('revision');
  if(!['desktop','tablet','mobile'].includes(mode)||route!=='/'||
    !['paused','play'].includes(animations)||
    (rev!==null&&(!/^(0|[1-9][0-9]{0,9})$/.test(rev)||!Number.isSafeInteger(Number(rev)))))
    throw new Error('INVALID_PREVIEW_PARAMETER');
  return {mode:mode as Breakpoint,route:'/',animations:animations as 'paused'|'play',
    ...(rev===null?{}:{revision:Number(rev)})};
}
