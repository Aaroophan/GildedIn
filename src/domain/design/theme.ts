/** Issue 8: one allowlisted, versioned presentation theme. This is NEVER raw CSS. */
import {shape,string,ensureJson} from '../content/strict.ts';
import {contentIssue} from '../content/errors.ts';
export const DESIGN_THEME_VERSION=1 as const;
export const APPEARANCES=['dark','light'] as const;
export const COLOR_KEYS=['canvas','canvasElevated','surface','surfaceRaised','textPrimary','textSecondary',
  'textMuted','accent','accentSoft','border','focus','success','warning','danger'] as const;
export type Appearance=typeof APPEARANCES[number];
export type ColorKey=typeof COLOR_KEYS[number];
export type ThemeColors=Record<ColorKey,string>;
export const PALETTES:Readonly<Record<Appearance,Readonly<ThemeColors>>>={
  dark:{canvas:'#07111F',canvasElevated:'#0A1829',surface:'#0D1E31',surfaceRaised:'#122A40',
    textPrimary:'#EAF4FF',textSecondary:'#AFC4D9',textMuted:'#8BA6BE',accent:'#4CA9EF',
    accentSoft:'#71CFE7',border:'#31536D',focus:'#9BD8FF',success:'#62CEAA',warning:'#F0BC6C',danger:'#FF9DA0'},
  light:{canvas:'#F5F9FE',canvasElevated:'#EAF2FB',surface:'#FFFFFF',surfaceRaised:'#E8F1FB',
    textPrimary:'#0D2238',textSecondary:'#33506A',textMuted:'#49657D',accent:'#0B5EA8',
    accentSoft:'#176D92',border:'#BACDDE',focus:'#0859A5',success:'#096C53',warning:'#865209',danger:'#AC2438'}
};
export type MotionLevel='off'|'subtle'|'standard'|'cinematic';
export type ScenePreset='off'|'technical-grid'|'wireframe'|'content-network';
export type Density='low'|'standard'|'high';
export type FrameVariant='precision-01'|'precision-02';
export interface DesignTheme {
  themeVersion:1;appearance:Appearance;colors:ThemeColors;
  typography:{displayFace:'oswald';bodyFace:'roboto';accentFace:'fallback'|'ink-free';
    signatureFace:'fallback'|'mistral';scale:'compact'|'standard'|'expressive'};
  technicalFrame:{cornerVariant:FrameVariant;gridVariant:'none'|'subtle-perspective';cornerIntensity:'off'|'subtle'|'standard'};
  scene:{preset:ScenePreset;density:Density;interactionIntensity:'off'|'subtle'|'standard'};
  defaultMotion:MotionLevel;
}
export interface FontLicenses {inkFreeWebEmbeddingVerified?:boolean;mistralWebEmbeddingVerified?:boolean;}
function choice<T extends string>(input:unknown,allowed:readonly T[],path:string):T{
  if(typeof input!=='string'||!allowed.includes(input as T))return contentIssue(path,'invalid_token',
    'An approved design option is required.');
  return input as T;
}
const isHex=(value:unknown):value is string=>typeof value==='string'&&/^#[a-fA-F0-9]{6}$/.test(value);
function color(value:unknown,path:string):string{
  if(!isHex(value))return contentIssue(path,'unsafe_color','Only six-digit hexadecimal colors are supported.');
  return value.toUpperCase();
}
function lum(hex:string):number{
  const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
  return v[0]*.2126+v[1]*.7152+v[2]*.0722;
}
export function contrastRatio(a:string,b:string):number{
  if(!isHex(a)||!isHex(b))throw new Error('INVALID_COLOR_FOR_CONTRAST');
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function minimumThemeContrast(colors:ThemeColors):{foreground:ColorKey;background:ColorKey;ratio:number;minimum:number}[]{
  const pairs:readonly [ColorKey,ColorKey,number][]=[
    ['textPrimary','canvas',4.5],['textPrimary','surface',4.5],['textPrimary','surfaceRaised',4.5],
    ['textSecondary','canvas',4.5],['textSecondary','surface',4.5],['textMuted','canvas',4.5],
    ['accent','canvas',4.5],['accent','surface',4.5],['focus','canvas',3],['focus','surface',3],
    ['focus','surfaceRaised',3],['danger','surface',4.5],['success','surface',4.5],['warning','surface',4.5]];
  return pairs.map(([foreground,background,minimum])=>({foreground,background,ratio:contrastRatio(colors[foreground],colors[background]),minimum}));
}
export function defaultTheme(appearance:Appearance='dark'):DesignTheme{
  return {themeVersion:1,appearance,colors:{...PALETTES[appearance]},
    typography:{displayFace:'oswald',bodyFace:'roboto',accentFace:'fallback',signatureFace:'fallback',scale:'standard'},
    technicalFrame:{cornerVariant:'precision-01',gridVariant:'subtle-perspective',cornerIntensity:'subtle'},
    scene:{preset:'technical-grid',density:'standard',interactionIntensity:'standard'},defaultMotion:'standard'};
}
/** Never use client claims about font licenses to authorize a restricted font. */
export function parseDesignTheme(raw:unknown,licenses:FontLicenses={}):DesignTheme{
  ensureJson(raw,'theme',8,8192);
  const t=shape(raw,['themeVersion','appearance','colors','typography','technicalFrame','scene','defaultMotion'],'theme');
  if(t.themeVersion!==1)return contentIssue('theme.themeVersion','unsupported_version','This theme version is unsupported.');
  const appearance=choice(t.appearance,APPEARANCES,'theme.appearance');
  const colorObject=shape(t.colors,COLOR_KEYS,'theme.colors');
  if(Object.keys(colorObject).length!==COLOR_KEYS.length)return contentIssue('theme.colors','missing_color',
    'Every semantic color token must be specified.');
  const colors=Object.fromEntries(COLOR_KEYS.map(k=>[k,color(colorObject[k],`theme.colors.${k}`)])) as ThemeColors;
  const font=shape(t.typography,['displayFace','bodyFace','accentFace','signatureFace','scale'],'theme.typography');
  const displayFace=choice(font.displayFace,['oswald'] as const,'theme.typography.displayFace');
  const bodyFace=choice(font.bodyFace,['roboto'] as const,'theme.typography.bodyFace');
  const accentFace=choice(font.accentFace,['fallback','ink-free'] as const,'theme.typography.accentFace');
  const signatureFace=choice(font.signatureFace,['fallback','mistral'] as const,'theme.typography.signatureFace');
  if(accentFace==='ink-free'&&!licenses.inkFreeWebEmbeddingVerified)return contentIssue('theme.typography.accentFace',
    'font_license_blocked','Ink Free requires verified web-embedding rights.');
  if(signatureFace==='mistral'&&!licenses.mistralWebEmbeddingVerified)return contentIssue('theme.typography.signatureFace',
    'font_license_blocked','Mistral requires verified web-embedding rights.');
  const scale=choice(font.scale,['compact','standard','expressive'] as const,'theme.typography.scale');
  const frame=shape(t.technicalFrame,['cornerVariant','gridVariant','cornerIntensity'],'theme.technicalFrame');
  const technicalFrame={
    cornerVariant:choice(frame.cornerVariant,['precision-01','precision-02'] as const,'theme.technicalFrame.cornerVariant'),
    gridVariant:choice(frame.gridVariant,['none','subtle-perspective'] as const,'theme.technicalFrame.gridVariant'),
    cornerIntensity:choice(frame.cornerIntensity,['off','subtle','standard'] as const,'theme.technicalFrame.cornerIntensity')};
  const inputScene=shape(t.scene,['preset','density','interactionIntensity'],'theme.scene');
  const scene={preset:choice(inputScene.preset,['off','technical-grid','wireframe','content-network'] as const,'theme.scene.preset'),
    density:choice(inputScene.density,['low','standard','high'] as const,'theme.scene.density'),
    interactionIntensity:choice(inputScene.interactionIntensity,['off','subtle','standard'] as const,'theme.scene.interactionIntensity')};
  const defaultMotion=choice(t.defaultMotion,['off','subtle','standard','cinematic'] as const,'theme.defaultMotion');
  for(const check of minimumThemeContrast(colors))if(check.ratio+1e-9<check.minimum)return contentIssue(
    `theme.colors.${check.foreground}`,'insufficient_contrast',
    `The selected foreground is too close to ${check.background} for its functional role.`);
  return {themeVersion:1,appearance,colors,typography:{displayFace,bodyFace,accentFace,signatureFace,scale},
    technicalFrame,scene,defaultMotion};
}
/** Read-only compatibility for the earlier private {preset} draft shape. Never migrate without an owner write. */
export function readOwnerTheme(raw:unknown):DesignTheme{
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Object.getPrototypeOf(raw)===Object.prototype&&
    Object.keys(raw).length===1&&Object.keys(raw)[0]==='preset'&&
    typeof (raw as {preset?:unknown}).preset==='string')return defaultTheme();
  return parseDesignTheme(raw);
}
/** Values have survived strict hex grammar and contrast checks; these keys are constant in code. */
export function scopedThemeVariables(theme:DesignTheme):Record<string,string>{
  const validated=parseDesignTheme(theme);
  const entries=COLOR_KEYS.map(k=>[`--gi-${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,validated.colors[k]]);
  return Object.fromEntries([...entries,['--gi-font-scale',validated.typography.scale==='compact'?'0.94':
    validated.typography.scale==='expressive'?'1.08':'1']]);
}
