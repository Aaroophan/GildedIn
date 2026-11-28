'use client';
/** Platform preference cannot alter a portfolio's stored theme or published design. */
import {useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {defaultTheme} from '../../domain/design/theme.ts';
import type {Appearance} from '../../domain/design/theme.ts';
import {ThemeScope} from './theme-scope.tsx';
import {MotionProvider,MotionControls} from './motion-settings.tsx';
import {SceneBackdrop} from './scene-backdrop.tsx';
const KEY='gildedin:platform-appearance:v1';
export function PlatformShell({children}:{children:ReactNode}){
  const [appearance,setAppearance]=useState<Appearance>('dark');
  useEffect(()=>{try{const saved=localStorage.getItem(KEY);
    if(saved==='dark'||saved==='light')setAppearance(saved);}catch{}},[]);
  const change=()=>{const next=appearance==='dark'?'light':'dark';setAppearance(next);
    try{localStorage.setItem(KEY,next);}catch{}};
  const theme=defaultTheme(appearance);
  return <ThemeScope theme={theme} className="gi-landing"><MotionProvider defaultMotion={theme.defaultMotion}>
    <SceneBackdrop theme={theme}/>
    <header className="gi-brand-header">
      <a href="/" className="gi-brand" aria-label="GildedIn home">Gilded<span>In</span></a>
      <nav aria-label="Platform navigation"><a href="#gi-vision">Vision</a>
        <a href="#gi-foundations">Foundations</a><a href="/login">Account</a>
        <button className="gi-control" type="button" onClick={change} aria-label={`Switch to ${appearance==='dark'?'light':'dark'} appearance`}>
          {appearance==='dark'?'Light theme':'Dark theme'}</button></nav>
    </header>
    {children}
    <footer className="footer">GildedIn · Specification-led portfolio technology · <a href="/login">Account status</a></footer>
    <div className="gi-preference-panel"><MotionControls/></div>
  </MotionProvider></ThemeScope>;
}
