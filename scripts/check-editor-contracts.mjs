/** CI guard for editor source contract; full runtime/browser proof remains separate. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const src=p=>readFileSync(resolve(root,p),'utf8');
const required=['src/domain/editor/commands.ts','src/domain/editor/history.ts','src/domain/editor/geometry.ts',
 'src/domain/editor/workspace.ts','src/domain/editor/diagnostics.ts','src/server/editor/http.ts',
 'src/ui/owner/canvas/canvas-editor.tsx','src/ui/owner/canvas/canvas-stage.tsx',
 'src/ui/owner/canvas/canvas-inspector.tsx','src/ui/owner/canvas/canvas-structure.tsx',
 'src/app/api/v1/portfolios/[portfolioId]/draft/workspace/route.ts'];
for(const path of required)if(!existsSync(resolve(root,path)))throw new Error(`Missing editor boundary: ${path}`);
for(const path of required.filter(x=>x.startsWith('src/ui/'))){const text=src(path);
 if(/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\s*\(|new Function\s*\(/.test(text))throw new Error(`Unreviewed DOM/code injection in ${path}`);
 if(/localStorage|sessionStorage|indexedDB/.test(text))throw new Error(`Private editor persistence disallowed: ${path}`);
}
const output=src('src/server/editor/http.ts');
for(const term of ['requireApexActor(req,true)','requiredIfMatch(req)','parseMutationToken(req)','putEditorWorkspace'])
 if(!output.includes(term))throw new Error(`Workspace security contract changed: ${term}`);
if(!src('src/domain/editor/workspace.ts').includes("section.type==='hero'&&!section.visible"))
 throw new Error('Editor Hero visibility invariant missing.');
console.log(`PASS: ${required.length} editor boundary files checked; owner-only save, private UI and Hero invariant present.`);
