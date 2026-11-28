import type {ReactNode} from 'react';
import {LetterReveal} from './letter-reveal.tsx';
/** One real semantic heading in SSR, with a separate, aria-hidden visual effect.
 * Replay controls must not become part of the heading's accessible name. */
export function IntroHeading({title,accent,level=1,children}:{title:string;accent?:string;
  level?:1|2;children?:ReactNode}){
  const body=<span className="gi-meaningful-title">{title}{accent?<><span className="gi-title-punctuation"> </span>
    <em>{accent}</em></>:null}</span>;
  return <div className="gi-intro-wrap">
    {level===1?<h1 className="gi-intro-title">{body}{children}</h1>:
      <h2 className="gi-intro-title">{body}{children}</h2>}
    <LetterReveal text={`${title}${accent?` ${accent}`:''}`}/>
  </div>;
}
