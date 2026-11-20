import {readFileSync} from 'node:fs';
const text=readFileSync('.github/workflows/verify.yml','utf8');
export function auditWorkflow(source){
 const issues=[];
 if(/pull_request_target|workflow_run\s*:/.test(source))issues.push('privileged workflow trigger is not approved');
 if(/\$\{\{\s*secrets\./i.test(source))issues.push('PR workflow references secrets');
 if(/persist-credentials:\s*true/.test(source)||!/persist-credentials:\s*false/.test(source))issues.push('checkout credentials must not persist');
 const matches=[...source.matchAll(/uses:\s*([^\s#]+)/g)].map(x=>x[1]);
 if(matches.length===0)issues.push('no actions listed');
 for(const action of matches)if(!/^[\w-]+\/[\w-]+@[a-f0-9]{40}$/.test(action))issues.push(`unpinned action ${action}`);
 for(const expected of ['npm ci --ignore-scripts','npm run check:secrets','npm run check:licenses','npm test','npm run typecheck','npm run build'])
   if(!source.includes(expected))issues.push(`required workflow step missing: ${expected}`);
 if(!/permissions:\s*\n\s+contents:\s*read/.test(source))issues.push('permissions must be read-only');
 return issues;
}
const result=auditWorkflow(text);
if(result.length){console.error(result.join('\n'));process.exitCode=1;}
else console.log('PASS: fork-safe unprivileged CI, immutable actions, locked install and mandatory baseline.');
