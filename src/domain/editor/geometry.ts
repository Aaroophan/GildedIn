/** Pure normalized pointer geometry adapter. No DOM matrices or editor vendor state persist. */
import type {AbsoluteLayout,SafeLayout,Breakpoint} from '../composition/types.ts';
import {parseLayout,resolveLayout} from '../composition/layout.ts';
export type Handle='move'|'resize';
export interface GeometryGuide {axis:'x'|'y';position:number;reason:'grid'|'edge'|'center'|'sibling';}
export interface GeometryResult {layout:AbsoluteLayout;guides:GeometryGuide[];}
export const ABSOLUTE_START:AbsoluteLayout={mode:'absolute',x:0.1,y:0.1,width:0.6,height:0.22,
  anchorX:'left',anchorY:'top',zIndexToken:'base',overflow:'visible-content'};
const round=(n:number)=>Math.round(n*1_000_000)/1_000_000;
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
export function normalizedAbsolute(source:SafeLayout,breakpoint:Breakpoint):AbsoluteLayout{
  const layout=resolveLayout(source,{},breakpoint,true);
  return layout.mode==='absolute'?layout:layout.mode==='hybrid'?layout.placement:{...ABSOLUTE_START};
}
export function absoluteAt(base:AbsoluteLayout,values:Partial<Pick<AbsoluteLayout,'x'|'y'|'width'|'height'>>):AbsoluteLayout{
  const width=round(clamp(values.width??base.width,0.05,1));
  const height=round(clamp(values.height??base.height,0.05,1));
  // Inspector and pointer commands normalize to left/top anchors before changing geometry.
  const originalLeft=base.anchorX==='left'?base.x:base.anchorX==='center'?base.x-base.width/2:1-base.x-base.width;
  const originalTop=base.anchorY==='top'?base.y:base.anchorY==='center'?base.y-base.height/2:1-base.y-base.height;
  const x=round(clamp(values.x??originalLeft,0,1-width));
  const y=round(clamp(values.y??originalTop,0,1-height));
  return parseLayout({...base,anchorX:'left',anchorY:'top',x,y,width,height},'editor.geometry') as AbsoluteLayout;
}
/** Snaps edges, centers, a 2.5% grid and matching sibling edges within a modest tolerance. */
function snapAxis(start:number,length:number,neighbors:readonly AbsoluteLayout[],snap=true):{value:number;guide?:GeometryGuide}{
  if(!snap)return {value:start};
  const options:{value:number;reason:GeometryGuide['reason'];position:number}[]=[];
  for(let i=0;i<=40;i++){const n=round(i*.025);options.push({value:n,reason:'grid',position:n});}
  for(const edge of [0,.5-length/2,1-length])options.push({value:edge,reason:'edge',position:edge});
  for(const item of neighbors){
    const pos=item.x;
    for(const target of [pos,pos+item.width,pos+item.width/2-length/2])
      options.push({value:target,reason:'sibling',position:target});
  }
  const sorted=options.map(o=>({...o,distance:Math.abs(start-o.value)})).filter(o=>o.distance<=.0125)
    .sort((a,b)=>a.distance-b.distance);
  const winner=sorted[0];
  return winner?{value:winner.value,guide:{axis:'x',position:winner.position,reason:winner.reason}}:{value:start};
}
export function gestureGeometry(start:AbsoluteLayout,pixelDx:number,pixelDy:number,parentWidth:number,parentHeight:number,
  handle:Handle,opts:{snap?:boolean;neighbors?:readonly AbsoluteLayout[]}={}):GeometryResult{
  if(!Number.isFinite(pixelDx)||!Number.isFinite(pixelDy)||!Number.isFinite(parentWidth)||!Number.isFinite(parentHeight)||
    parentWidth<=0||parentHeight<=0)throw new Error('EDITOR_GEOMETRY_UNAVAILABLE');
  const source=absoluteAt(start,{}),neighbors=opts.neighbors??[];
  if(handle==='move'){
    const rawX=clamp(source.x+pixelDx/parentWidth,0,1-source.width);
    const rawY=clamp(source.y+pixelDy/parentHeight,0,1-source.height);
    const snapX=snapAxis(rawX,source.width,neighbors,opts.snap!==false);
    const snapY=snapAxis(rawY,source.height,neighbors.map(n=>({...n,x:n.y,width:n.height})),opts.snap!==false);
    const layout=absoluteAt(source,{x:snapX.value,y:snapY.value});
    return {layout,guides:[...(snapX.guide?[snapX.guide]:[]),...(snapY.guide?[{...snapY.guide,axis:'y' as const}]:[])]};
  }
  const width=clamp(source.width+pixelDx/parentWidth,.05,1-source.x);
  const height=clamp(source.height+pixelDy/parentHeight,.05,1-source.y);
  const snapX=snapAxis(source.x+width,0,[],opts.snap!==false);
  const snapY=snapAxis(source.y+height,0,[],opts.snap!==false);
  return {layout:absoluteAt(source,{width:clamp(snapX.value-source.x,.05,1-source.x),
    height:clamp(snapY.value-source.y,.05,1-source.y)}),guides:[...(snapX.guide?[snapX.guide]:[]),
      ...(snapY.guide?[{...snapY.guide,axis:'y' as const}]:[])]};
}
export function breakpointForWidth(width:number):Breakpoint{
  return width<768?'mobile':width<1024?'tablet':'desktop';
}
