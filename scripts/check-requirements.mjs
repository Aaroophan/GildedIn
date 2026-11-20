import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const json = p => JSON.parse(read(p));
const fatal = message => { throw new Error(`Requirement baseline verification failed: ${message}`); };

/** Scan canonical four-column tables, including the malformed unescaped pipe in PUB-007. */
export function parseCanonicalRequirements(text) {
  const segment = text.split('## 6. Privacy and data minimization requirements')[0];
  const result = [];
  for (const line of segment.split(/\r?\n/)) {
    if (!/^\|\s*[A-Z]{2,4}-\d{3}\s*\|/.test(line)) continue;
    let cells = line.slice(1,-1).split('|').map(cell => cell.trim());
    if (cells[0] === 'PUB-007' && cells.length === 5) cells = [cells[0], cells[1], `${cells[2]} | ${cells[3]}`, cells[4]];
    if (cells.length !== 4) fatal(`malformed row ${cells[0]}`);
    result.push({id:cells[0],priority:cells[1],requirement:cells[2].replace(/\s+/g,' '),acceptance:cells[3],verificationIds:[...cells[3].matchAll(/T-[A-Z]{2,4}-\d{2}/g)].map(m=>m[0])});
  }
  return result;
}
export function verifyRequirementInventory(canonical, registry) {
  if (canonical.length !== 97 || registry.length !== 97) fatal('expected exactly 97 canonical and 97 recorded requirements');
  if (new Set(registry.map(x=>x.id)).size !== 97) fatal('duplicate requirement ID');
  for (let i = 0;i<canonical.length;i++) {
    const actual=registry[i], expected=canonical[i];
    for (const key of ['id','priority','requirement','acceptance']) if (actual[key] !== expected[key]) fatal(`changed ${expected.id}.${key}`);
    if (JSON.stringify(actual.verificationIds) !== JSON.stringify(expected.verificationIds)) fatal(`changed ${expected.id}.verificationIds`);
    if (!['NOT STARTED','IN PROGRESS','IMPLEMENTED'].includes(actual.implementationStatus)) fatal('bad implementation status '+actual.id);
    if (!['NOT RUN','PASS','FAIL','BLOCKED','INCONCLUSIVE'].includes(actual.verificationStatus)) fatal('invalid test status '+actual.id);
  }
  if (canonical.filter(x=>x.priority==='P0').length!==63 || canonical.filter(x=>x.priority==='P1').length!==34) fatal('priority counts changed');
}
export function verifyAdrInventory(sourceText, decisions) {
  const rows=[...sourceText.matchAll(/^\|\s*(\d{3})\s*\|([^\n]*)$/gm)].map(m=>m[0]);
  if (rows.length!==36 || decisions.length!==36) fatal('expected 36 decision rows');
  for (let i=0;i<36;i++) {
    const cells=rows[i].slice(1,-1).split('|').map(x=>x.trim());
    const recorded=decisions[i];
    if (recorded.id!==`ADR-${cells[0]}`||recorded.title!==cells[1]||recorded.sourceStatus!==cells[2]) fatal('ADR drift '+recorded.id);
  }
}
export function verifyDeploymentGates(text, gates) {
  const ids=[...text.matchAll(/^\|\s*\*\*(DEP-\d{2})\*\*\s*\|/gm)].map(m=>m[1]);
  if (ids.length!==18) fatal('expected 18 normative deployment gates');
  for (const id of ids) if (!gates.some(g=>g.id===id && g.verificationStatus==='BLOCKED')) fatal('unverified deployment gate treated as passed: '+id);
}
export function verifyConstraints(limits, constraints) {
  const vals=Object.fromEntries(constraints.map(x=>[x.key,x.value]));
  const expected={schemaNestingDepth:3,customFieldsPerSection:20,authoredVisualNodesPortfolioWide:20,collectionItems:20,
    publishedReleaseUtf8Bytes:102400,retainedPublishedReleases:3,mediaOriginalBytesPerPortfolio:15*1048576,
    mediaOriginalFileCount:30,imageInputBytes:1048576,pdfInputBytes:2*1048576,maxImageWidth:4096,maxImageHeight:4096};
  for (const [name,value] of Object.entries(expected)) if (vals[name]!==value) fatal('fixed limit changed: '+name);
  const compiled=limits;
  for (const [name,limitKey] of Object.entries({schemaNestingDepth:'schemaNestingDepth',customFieldsPerSection:'customFieldsPerSection',
    authoredVisualNodesPortfolioWide:'authoredVisualNodesPerPortfolio',collectionItems:'collectionItems',
    publishedReleaseUtf8Bytes:'publishedReleaseBytes',retainedPublishedReleases:'publishedReleasesRetained',
    mediaOriginalBytesPerPortfolio:'mediaOriginalBytesPerPortfolio',mediaOriginalFileCount:'originalMediaFilesPerPortfolio',
    imageInputBytes:'imageBytes',pdfInputBytes:'pdfBytes',maxImageWidth:'maxImageWidth',maxImageHeight:'maxImageHeight'})) {
    if (compiled[limitKey]!==expected[name]) fatal('code/config limit drift: '+name);
  }
}
export function verifySpecificationFiles() {
  const docs=fs.readdirSync(path.join(root,'docs/specifications')).filter(x=>/^\d{2}-.+\.md$/.test(x));
  if (docs.length!==13) fatal('expected all 12 specs and implementation plan');
  for (let n=1;n<=13;n++) if(!docs.some(d=>d.startsWith(String(n).padStart(2,'0')+'-'))) fatal('missing spec '+n);
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {PRODUCT_LIMITS}=await import('../src/shared/domain/limits.ts');
  verifyRequirementInventory(parseCanonicalRequirements(read('docs/specifications/02-requirements-and-scope.md')),json('engineering/registers/requirements.json').requirements);
  verifyAdrInventory(read('docs/specifications/12-architecture-decision-record.md'),json('engineering/registers/architecture-decisions.json').decisions);
  verifyDeploymentGates(read('docs/specifications/10-deployment-strategy.md'),json('engineering/registers/feasibility-gates.json').gates);
  verifyConstraints(PRODUCT_LIMITS,json('engineering/registers/constraints.json').constraints);
  verifySpecificationFiles();
  console.log('PASS: 97 canonical requirements (63 P0, 34 P1), 36 ADRs, 18 deployment gates, fixed limit constants, all 13 documents.');
}
