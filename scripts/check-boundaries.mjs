import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'src');
function recursive(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?recursive(path.join(dir,item.name)):/\.(ts|tsx|mjs|js)$/.test(item.name)?[path.join(dir,item.name)]:[]);
}
/** This checker is a lightweight dependency safeguard; TypeScript/ESLint (Issue 2) will add AST coverage. */
export function importsOf(source) {
  const items=[];
  const expressions=[/\b(?:import|export)\s+(?:type\s+)?(?:[^'"`]*?\s+from\s*)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g];
  for(const pattern of expressions)for(const match of source.matchAll(pattern))items.push(match[1]);
  return [...new Set(items)];
}
function section(f) {
  const rel=path.relative(src,f).replace(/\\/g,'/');
  const first=rel.split('/')[0];
  return ['shared','domain','app','application','infrastructure','editor'].includes(first)?first:'other';
}
export function checkEdge(from,to) {
  const srcClass=section(from),dstClass=section(to);
  if (srcClass==='shared' && dstClass!=='shared') return 'Pure shared domain cannot import application, feature or infrastructure code';
  if(srcClass==='domain' && ['app','application','infrastructure','editor'].includes(dstClass)) return 'Domain must not import an adapter, editor, app or use case';
  if(srcClass==='application' && ['app','infrastructure','editor'].includes(dstClass)) return 'Use cases depend only on domains and owned ports';
  if(srcClass==='app' && dstClass==='infrastructure') return 'HTTP route must not access infrastructure/collections directly';
  if(srcClass==='domain' && /[/\\]delivery[/\\]/.test(from) && /[/\\](editor|publishing)[/\\]/.test(to)) return 'Public release reader cannot use editor/draft internals';
  return null;
}
export function assertNoForbiddenImports(fileSources) {
  const errors=[]; const graph=new Map();
  for(const [filename,content] of fileSources) {
    const edges=[];
    for(const specifier of importsOf(content)) {
      if(['domain','shared','application'].includes(section(filename)) && /^(next(?:\/|$)|react(?:\/|$)|mongodb$|groq-sdk$|@upstash\/|@vercel\/)/.test(specifier))
        errors.push(`${filename}: pure layer imported framework/vendor ${specifier}`);
      if(section(filename)==='app' && /^(mongodb|groq-sdk|@upstash\/|@vercel\/)/.test(specifier))
        errors.push(`${filename}: route reached provider SDK ${specifier}`);
      const candidate=specifier.startsWith('@/')?path.join(src,specifier.slice(2)):
        specifier.startsWith('.')?path.resolve(path.dirname(filename),specifier):null;
      if(!candidate)continue;
      if(/\.(css|svg|png|jpg|jpeg|webp)$/.test(specifier)) continue; // CSS/assets are build inputs, not dependency-graph modules.
      const resolved=[candidate,candidate+'.ts',candidate+'.tsx',path.join(candidate,'index.ts'),path.join(candidate,'index.tsx')].find(p=>fileSources.has(p));
      if(!resolved) {errors.push(`${filename}: unresolved local import ${specifier}`); continue;}
      const denied=checkEdge(filename,resolved);
      if(denied) errors.push(`${filename}: ${denied}: ${specifier}`);
      edges.push(resolved);
    }
    graph.set(filename,edges);
  }
  const white=new Set(),grey=new Set();
  const walk=(node,chain=[])=>{
    if(grey.has(node)) {errors.push(`Circular source imports: ${[...chain,node].map(x=>path.basename(x)).join(' -> ')}`); return;}
    if(white.has(node))return;
    grey.add(node);
    for(const to of graph.get(node)??[])walk(to,[...chain,node]);
    grey.delete(node);white.add(node);
  };
  for(const file of graph.keys())walk(file);
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const entries=new Map(recursive(src).map(f=>[f,fs.readFileSync(f,'utf8')]));
  const errs=assertNoForbiddenImports(entries);
  if(errs.length){console.error(errs.join('\n'));process.exitCode=1;}
  else console.log(`PASS: ${entries.size} sources checked; no forbidden/cyclic static dependencies.`);
}
