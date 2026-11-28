/** Static boundaries only. Real DOM, JS-disabled, 400% zoom and WebGL evidence require browsers. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=(s:string)=>readFileSync(new URL(`../../${s}`,import.meta.url),'utf8');
test('8.1 public theme values are only generated from the strict domain token contract',()=>{
  assert.match(src('src/ui/design/theme-scope.tsx'),/parseDesignTheme\(/);
  assert.match(src('src/ui/design/theme-scope.tsx'),/scopedThemeVariables/);
  assert.match(src('src/app/globals.css'),/data-gi-theme=light/);
  assert.doesNotMatch(src('src/ui/design/theme-scope.tsx'),/dangerouslySetInnerHTML|styleSheet|eval\(/);
});
test('8.3 interactive primitives use native controls, accessible names, focus and dialog return',()=>{
  const jsx=src('src/ui/design/primitives.tsx'),css=src('src/app/globals.css');
  assert.match(jsx,/aria-invalid=\{!!error\}/);assert.match(jsx,/aria-describedby=/);
  assert.match(jsx,/aria-selected=/);assert.match(jsx,/role="tablist"/);
  assert.match(jsx,/ref\.current\?\.showModal\(\)/);
  assert.match(jsx,/returnFocus\.current\?\.focus\(\)/);
  assert.match(css,/:focus-visible/);assert.match(css,/min-height:44px/);
});
test('8.4 technical corners are inert and CSS reduced-motion settles immediately',()=>{
  assert.match(src('src/ui/design/technical-frame.tsx'),/aria-hidden="true"/);
  const css=src('src/app/globals.css');
  assert.match(css,/pointer-events:none/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.gi-corners i:nth-child\(4\)/);
});
test('8.5 hero semantic title is SSR present, animation overlay is screen-reader-hidden',()=>{
  const jsx=src('src/ui/design/intro.tsx'),letters=src('src/ui/design/letter-reveal.tsx');
  assert.match(jsx,/<h1 className="gi-intro-title">\{body\}\{children\}<\/h1>/);
  assert.ok(jsx.indexOf('</h1>')<jsx.indexOf('<LetterReveal'), 'Replay must not be part of the heading accessible name');
  assert.match(letters,/aria-hidden="true"/);assert.match(letters,/import\('animejs'\)/);
  assert.doesNotMatch(letters,/innerHTML|eval\(|document\.write\(/);
  assert.ok(letters.indexOf('</span>{motion')>letters.indexOf('aria-hidden="true"')); // replay outside hidden overlay
});
test('8.7 actual 3D engine is deferred and the static SSR backdrop is always present',()=>{
  const host=src('src/ui/design/scene-backdrop.tsx'),scene=src('src/ui/design/scene/three-scene.tsx');
  assert.match(host,/lazy\(\(\)=>import\('\.\/scene\/three-scene\.tsx'\)\)/);
  assert.match(host,/<div className="gi-scene-static"\/>/);
  assert.match(scene,/await import\('three'\)/);
  assert.match(scene,/requestAnimationFrame/);
  assert.match(scene,/cancelAnimationFrame/);
  assert.match(scene,/webglcontextlost/);
  assert.match(scene,/document\.visibilityState/);
  assert.match(scene,/\.dispose\(\)/);
  assert.doesNotMatch(scene,/fetch\(|XMLHttpRequest|ShaderMaterial|eval\(|innerHTML|iframe/);
});
test('8.9 visitor preference is local-only and reduced-motion remains overriding',()=>{
  const controls=src('src/ui/design/motion-settings.tsx'),host=src('src/ui/design/scene-backdrop.tsx');
  assert.match(controls,/localStorage\.setItem/);assert.match(controls,/matchMedia\(/);
  assert.match(controls,/effectiveMotion\(/);assert.match(host,/reducedMotion/);
  assert.match(controls,/data-gi-motion=\{motion\}/);
  assert.match(src('src/app/globals.css'),/\[data-gi-motion=off\] \.gi-corners/);
  assert.doesNotMatch(controls,/fetch\(|navigator\.sendBeacon|cookie|location\.href/);
});
test('8.10 no source-exposed personal media or user code is imported for this visual foundation',()=>{
  const page=src('src/app/(platform)/page.tsx'),css=src('src/app/globals.css');
  assert.match(page,/Create your portfolio/);assert.match(page,/publishedExamples/);
  assert.match(page,/directory\(env.APP_CANONICAL_ORIGIN\)/);
  assert.doesNotMatch(page,/\/images\/|\.obj\b|\.mp4\b/);
  assert.doesNotMatch(css,/@import\b|url\(https?:/);
});
test('8.1/8.8 private theme endpoint and scene data cannot be mistaken for public draft delivery',()=>{
  const adapter=src('src/server/design/http.ts');
  assert.match(adapter,/requireApexActor\(req,true\)/);assert.match(adapter,/getOwnedDraft/);
  assert.match(adapter,/parseDesignTheme\(/);assert.match(adapter,/private, no-store/);
  assert.doesNotMatch(adapter,/activateRelease|activeReleaseId|publicDirectory/);
  assert.match(src('src/domain/design/scene.ts'),/activeReleaseVerified/);
});
