import type {ReactNode} from 'react';
import type {FrameVariant} from '../../domain/design/theme.ts';
/** Non-interactive SVG/CSS ornament. Always aria-hidden, never a focus or border substitute. */
export function TechnicalFrame({children,variant='precision-01',intensity='subtle',as='div',className=''}:{
  children:ReactNode;variant?:FrameVariant;intensity?:'off'|'subtle'|'standard';as?:'div'|'article'|'section';className?:string}){
  const content=<><span className="gi-corners" aria-hidden="true"><i/><i/><i/><i/></span>{children}</>;
  const cls=`gi-technical-frame gi-frame-${variant} gi-frame-${intensity} ${className}`.trim();
  return as==='article'?<article className={cls}>{content}</article>:
    as==='section'?<section className={cls}>{content}</section>:<div className={cls}>{content}</div>;
}
