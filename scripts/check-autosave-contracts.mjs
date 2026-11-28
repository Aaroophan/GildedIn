/** Lightweight source-boundary sentinels; never substitute for real browser/database tests. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const paths=[
  'src/domain/editor/autosave.ts','src/domain/editor/preflight.ts','src/domain/editor/preview.ts',
  'src/infrastructure/mongodb/content-repository.ts','src/server/editor/preview.ts',
  'src/server/editor/preview-page.ts','src/ui/owner/canvas/use-draft-autosave.ts',
  'src/ui/owner/canvas/canvas-editor.tsx',
  'src/app/(owner)/dashboard/preview/page.tsx',
  'src/app/(owner)/owner-preview-frame/page.tsx',
  'src/app/api/v1/portfolios/[portfolioId]/preview/route.ts',
  'src/app/api/v1/portfolios/[portfolioId]/draft/mutations/[mutationId]/route.ts',
  'src/app/api/v1/portfolios/[portfolioId]/draft/validate/route.ts',
  'src/server/http/headers.ts','src/proxy.ts',
];
for(const p of paths)if(!existsSync(resolve(root,p)))throw new Error(`Missing Issue 11 source: ${p}`);
const load=p=>readFileSync(resolve(root,p),'utf8');
const match=(p,regex,message)=>{if(!regex.test(load(p)))throw new Error(`Issue 11 source contract: ${message} (${p})`);};
const no=(p,regex,message)=>{if(regex.test(load(p)))throw new Error(`Issue 11 unsafe source: ${message} (${p})`);};
match(paths[3],/draftMutationLedger/,'bounded mutation receipts');
match(paths[3],/readMutationStatus\(actor/,'owner-scoped ledger lookup');
match(paths[3],/this\.readOwned\(actor,id,session,false\)/,'disabled-owner CAS denial');
match(paths[4],/requireApexActor\(req,false\)/,'authenticated preview/receipt GET');
match(paths[4],/requireApexActor\(req,true\)/,'authenticated CSRF validation');
match(paths[4],/private, no-store/,'private preview cache');
match(paths[4],/noindex, nofollow, noarchive/,'no preview indexing');
match(paths[5],/getOwnedEditableDraft/,'active owned preview draft');
match(paths[5],/compileComposition/,'canonical compiler');
no(paths[5],/readPublicRelease|activeReleaseId/,'no active-release preview fallback');
match(paths[6],/850/,'bounded debounce');
match(paths[6],/X-Client-Mutation-Id/,'idempotent save token');
match(paths[6],/If-Match/,'revision CAS');
match(paths[6],/reconcileDraftSave/,'reconcile uncertain outcome');
match(paths[6],/readScopedRecovery/,'scoped recovery validation');
match(paths[6],/recoveryStorageKey\(accountId,portfolioId\)/,'account/tenant scope');
match(paths[7],/useDraftAutosave/,'editor integration');
match(paths[8],/ownedPreviewPage/,'owner page');
match(paths[9],/ownedPreviewPage/,'owner frame');
match(paths[9],/SemanticComposition/,'semantic SSR');
match(paths[13],/SAMEORIGIN/,'same origin preview iframe');
match(paths[13],/frame-ancestors/,'CSP frame policy');
match(paths[14],/owner-preview-frame/,'deny tenant preview host');
for(const p of paths.filter(x=>x.startsWith('src/ui/')||x.startsWith('src/app/(owner)/')))
  no(p,/dangerouslySetInnerHTML|\beval\s*\(|new Function\s*\(/,'unreviewed code/HTML');
console.log(`PASS: ${paths.length} Issue 11 source boundaries checked; live browser/DB/CSP integration remains separate.`);
