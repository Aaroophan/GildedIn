import {readFileSync} from 'node:fs';
const p=JSON.parse(readFileSync('package.json','utf8'));
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const root=lock.packages?.[''];
const problems=[];
for(const kind of ['dependencies','devDependencies']) for(const [name,version] of Object.entries(p[kind]??{})) {
  if(root?.[kind]?.[name]!==version)problems.push(`root lock disagrees for ${name}`);
  const entry=lock.packages?.[`node_modules/${name}`];
  if(!entry||!entry.resolved||!entry.integrity)problems.push(`unlocked or unverified package ${name}`);
}
if(p.packageManager!=='npm@10.9.2')problems.push('packageManager not pinned');
if(problems.length){console.error('FAIL: '+problems.join('; '));process.exitCode=1;}
else console.log(`PASS: ${Object.keys(p.dependencies??{}).length+Object.keys(p.devDependencies??{}).length} direct dependencies and lockfile identities verified.`);
