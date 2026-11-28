/** One validated theme per subtree. Dashboard theme never mutates published owner themes. */
import type {CSSProperties,ReactNode} from 'react';
import {defaultTheme,parseDesignTheme,scopedThemeVariables} from '../../domain/design/theme.ts';
import type {DesignTheme} from '../../domain/design/theme.ts';
export function ThemeScope({children,theme,className=''}:{children:ReactNode;theme?:DesignTheme;className?:string}){
  const safe=parseDesignTheme(theme??defaultTheme());
  return <div data-gi-theme={safe.appearance} data-gi-scale={safe.typography.scale}
    data-gi-grid={safe.technicalFrame.gridVariant} style={scopedThemeVariables(safe) as CSSProperties}
    className={`gi-themed-surface ${className}`.trim()}>{children}</div>;
}
