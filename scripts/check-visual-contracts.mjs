/** Offline invariants only. Does not claim a browser, GPU, font bundle, or Lighthouse score. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const source=(path)=>readFileSync(resolve(path),'utf8');
const css=source('src/app/globals.css');
const theme=source('src/domain/design/theme.ts');
const scene=source('src/ui/design/scene/three-scene.tsx');
const host=source('src/ui/design/scene-backdrop.tsx');
const app=source('src/app/(platform)/page.tsx');
const errors=[];
function check(ok,reason){if(!ok)errors.push(reason);}
for(const token of ['canvas','surface','text-primary','text-secondary','accent','focus','danger','warning','success'])
  check(css.includes(`--gi-${token}`),`missing semantic CSS variable ${token}`);
check(css.includes('[data-gi-theme=light]'),'light color scheme missing');
check(css.includes('prefers-reduced-motion:reduce'),'system reduced motion missing');
check(css.includes('forced-colors:active'),'high contrast fallback missing');
check(css.includes('min-height:44px'),'touch target default missing');
check(!/@import\b|url\(https?:/i.test(css),'external style/font origin is not reviewed');
check(!/dangerouslySetInnerHTML|eval\(|new Function\(/.test(host+scene+theme),'executable rendering primitive detected');
check(host.includes('lazy(()=>import(')&&scene.includes("await import('three')"),'Three.js not deferred');
check(scene.includes('webglcontextlost')&&scene.includes('cancelAnimationFrame'),'WebGL recovery or cleanup missing');
check(app.includes('not enabled here'),'stage not truthfully labeled');
check(existsSync('engineering/visual-fixtures/issue8-static.html'),'static QA fixture absent');
if(errors.length){console.error('FAIL: '+errors.join('; '));process.exitCode=1;}
else console.log('PASS: static visual contracts, no unreviewed CSS/font origins, deferred 3D and stage labeling. Browser/performance checks remain BLOCKED.');
