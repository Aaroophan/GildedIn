import {contentIssue} from '../content/errors.ts';
import {shape,integer,token} from '../content/strict.ts';
import type {AbsoluteLayout,AutoLayout,SafeLayout,LayoutToken,Breakpoint} from './types.ts';
export const GAPS:Readonly<Record<LayoutToken,string>>={none:'0',xs:'0.25rem',sm:'0.5rem',md:'1rem',lg:'1.5rem',xl:'2.5rem'};
const Z={'decoration':0,'base':1,'raised':2,'overlay':3} as const;
export const AUTO_DEFAULT:AutoLayout=Object.freeze({mode:'auto',flow:'column'});
const SAFE_AUTO=['mode','flow','gapToken','alignment','columns','minWidthToken','maxWidthToken'];
const SAFE_ABS=['mode','x','y','width','height','anchorX','anchorY','zIndexToken','minSizeToken','maxSizeToken','aspectRatio','overflow'];
function pick<T extends string>(value:unknown,accepted:readonly T[],path:string):T{
  if(typeof value!=='string'||!accepted.includes(value as T))contentIssue(path,'layout_token','Unsupported layout constraint.');
  return value as T;
}
function fraction(value:unknown,path:string,min=0,max=1):number{
  if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||!Number.isSafeInteger(value*1_000_000))
    contentIssue(path,'layout_bounds','Normalized geometry must be finite, bounded and have at most six decimals.');
  return value;
}
function parseAuto(raw:unknown,path:string):AutoLayout{
  const r=shape(raw,SAFE_AUTO,path);
  if(r.mode!=='auto')contentIssue(`${path}.mode`,'layout_mode','Expected Auto layout.');
  const flow=pick(r.flow,['row','column','grid'],`${path}.flow`);
  const out:AutoLayout={mode:'auto',flow};
  if(r.gapToken!==undefined)out.gapToken=pick(r.gapToken,Object.keys(GAPS) as LayoutToken[],`${path}.gapToken`);
  if(r.alignment!==undefined)out.alignment=pick(r.alignment,['start','center','end','stretch'] as const,`${path}.alignment`);
  if(r.columns!==undefined){if(flow!=='grid')contentIssue(`${path}.columns`,'layout_conflict','Columns require grid flow.');
    out.columns=integer(r.columns,1,4,`${path}.columns`) as AutoLayout['columns'];}
  if(r.minWidthToken!==undefined)out.minWidthToken=pick(r.minWidthToken,Object.keys(GAPS) as LayoutToken[],`${path}.minWidthToken`);
  if(r.maxWidthToken!==undefined)out.maxWidthToken=pick(r.maxWidthToken,Object.keys(GAPS) as LayoutToken[],`${path}.maxWidthToken`);
  return out;
}
function parseAbsolute(raw:unknown,path:string):AbsoluteLayout{
  const r=shape(raw,SAFE_ABS,path);
  if(r.mode!=='absolute')contentIssue(`${path}.mode`,'layout_mode','Expected Absolute layout.');
  const x=fraction(r.x,`${path}.x`),y=fraction(r.y,`${path}.y`),width=fraction(r.width,`${path}.width`,0.05),
    height=fraction(r.height,`${path}.height`,0.05);
  const anchorX=pick(r.anchorX,['left','center','right'],`${path}.anchorX`);
  const anchorY=pick(r.anchorY,['top','center','bottom'],`${path}.anchorY`);
  const left=anchorX==='left'?x:anchorX==='center'?x-width/2:1-x-width;
  const top=anchorY==='top'?y:anchorY==='center'?y-height/2:1-y-height;
  if(left < -0.000001||top < -0.000001||left+width>1.000001||top+height>1.000001)
    contentIssue(path,'layout_out_of_bounds','Absolute content must fit inside its parent; adjust anchors or size.');
  const overflow=pick(r.overflow,['visible-decorative','clip-decorative','visible-content'],`${path}.overflow`);
  const out:AbsoluteLayout={mode:'absolute',x,y,width,height,anchorX,anchorY,overflow,
    zIndexToken:pick(r.zIndexToken,Object.keys(Z) as AbsoluteLayout['zIndexToken'][],`${path}.zIndexToken`)};
  if(r.minSizeToken!==undefined)out.minSizeToken=pick(r.minSizeToken,Object.keys(GAPS) as LayoutToken[],`${path}.minSizeToken`);
  if(r.maxSizeToken!==undefined)out.maxSizeToken=pick(r.maxSizeToken,Object.keys(GAPS) as LayoutToken[],`${path}.maxSizeToken`);
  if(r.aspectRatio!==undefined)out.aspectRatio=fraction(r.aspectRatio,`${path}.aspectRatio`,0.25,4);
  return out;
}
export function parseLayout(raw:unknown,path='layout'):SafeLayout{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))contentIssue(path,'layout_shape','Layout must be a declarative object.');
  const r=raw as Record<string,unknown>;
  if(r.mode==='auto')return parseAuto(raw,path);
  if(r.mode==='absolute')return parseAbsolute(raw,path);
  if(r.mode==='hybrid'){
    const hybrid=shape(raw,['mode','placement','childrenFlow'],path);
    const placement=parseAbsolute(hybrid.placement,`${path}.placement`);
    const childrenFlow=parseAuto(hybrid.childrenFlow,`${path}.childrenFlow`);
    return {mode:'hybrid',placement,childrenFlow};
  }
  return contentIssue(`${path}.mode`,'layout_mode','Only Auto, Absolute and Hybrid layouts are allowed.');
}
/** Partial overrides inherit ONLY fields valid for their base mode; changing mode requires a complete new layout. */
export function parseResponsiveOverride(raw:unknown,base:SafeLayout,path:string):Partial<SafeLayout>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))contentIssue(path,'override','Invalid responsive override.');
  const r=raw as Record<string,unknown>;
  if(r.mode!==undefined&&r.mode!==base.mode)return parseLayout(raw,path);
  const allowed=base.mode==='auto'?SAFE_AUTO:base.mode==='absolute'?SAFE_ABS:['mode','placement','childrenFlow'];
  const values=shape(raw,allowed,path);
  const combined={...base,...values};
  return parseLayout(combined,path);
}
export function resolveLayout(base:SafeLayout,overrides:Partial<Record<Breakpoint,Partial<SafeLayout>>>,
  mode:Breakpoint,meaningful:boolean):SafeLayout{
  const target=overrides[mode];
  if(target)return target as SafeLayout;
  // A protected mobile derivation avoids clipping and viewport-level horizontal overflow.
  if(mode==='mobile'&&meaningful&&base.mode!=='auto')return AUTO_DEFAULT;
  if(mode==='tablet'&&meaningful&&base.mode==='absolute')return AUTO_DEFAULT;
  return base;
}
function num(n:number){return String(Math.round(n*100_000)/100_000);}
function absoluteCss(l:AbsoluteLayout):string{
  const left=l.anchorX==='left'?l.x:l.anchorX==='center'?l.x-l.width/2:1-l.x-l.width;
  const top=l.anchorY==='top'?l.y:l.anchorY==='center'?l.y-l.height/2:1-l.y-l.height;
  // Meaningful elements never clip text; browser intrinsic content may expand beyond nominal height.
  return `position:absolute;left:${num(left*100)}%;top:${num(top*100)}%;width:${num(l.width*100)}%;max-width:100%;min-height:${num(l.height*100)}%;z-index:${Z[l.zIndexToken]};overflow:${l.overflow==='clip-decorative'?'hidden':'visible'};${l.aspectRatio?`aspect-ratio:${num(l.aspectRatio)};`:''}`;
}
function autoCss(l:AutoLayout):string{
  const flow=l.flow==='grid'?`display:grid;grid-template-columns:repeat(${l.columns??1},minmax(0,1fr));`:
    `display:flex;flex-direction:${l.flow};flex-wrap:${l.flow==='row'?'wrap':'nowrap'};`;
  const align={start:'flex-start',center:'center',end:'flex-end',stretch:'stretch'}[l.alignment??'stretch'];
  return `position:relative;width:auto;height:auto;min-width:0;max-width:100%;overflow:visible;${flow}gap:${GAPS[l.gapToken??'md']};align-items:${align};`;
}
export function layoutCss(layout:SafeLayout):string{
  return layout.mode==='auto'?autoCss(layout):layout.mode==='absolute'?absoluteCss(layout):
    `${absoluteCss(layout.placement)}${autoCss(layout.childrenFlow).replace('position:relative;width:auto;height:auto;min-width:0;max-width:100%;overflow:visible;','')}`;
}
/** CSS is made ONLY from numerically bounded layouts + finite tokens, never owner-supplied CSS. */
export function nodeCss(nodeId:string,base:SafeLayout,overrides:Partial<Record<Breakpoint,Partial<SafeLayout>>>,
  visibility:Partial<Record<Breakpoint,boolean>>,meaningful:boolean):string{
  const selector=`.gi-node-${nodeId.replace(/-/g,'')}`;
  const css=(mode:Breakpoint)=>`${selector}{${layoutCss(resolveLayout(base,overrides,mode,meaningful))}${visibility[mode]===false?'display:none!important;':''}}`;
  return css('desktop')+`@media (min-width:768px) and (max-width:1023px){${css('tablet')}}`+
    `@media (max-width:767px){${css('mobile')}}`;
}
