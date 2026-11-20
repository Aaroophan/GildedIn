import {readFileSync} from 'node:fs';
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const licenses=new Map();const flagged=[];
for(const [name,metadata] of Object.entries(lock.packages??{})) {
  if(!name||!name.startsWith('node_modules/'))continue;
  const license=metadata.license??'UNKNOWN';
  licenses.set(name,license);
  if(!metadata.license||/(?:^|[- (])(GPL|AGPL|SSPL|BUSL|UNLICENSED)/i.test(license))flagged.push({name,license});
}
const snapshot={total:licenses.size,flagged,licensingCandidate:'MIT - ADR-031 PENDING; not a grant of source ownership'};
console.log(JSON.stringify(snapshot));
if(flagged.length){console.error('BLOCKED: license review required before open-source release');process.exitCode=2;}
