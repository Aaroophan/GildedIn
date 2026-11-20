import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ignore=new Set(['docs','.git','node_modules','.next','engineering']);
export function assessRepositoryFiles(files) {
  const issues=[];
  for(const [filename,content] of files){
    const base=path.basename(filename);
    if((base==='.env'||base.startsWith('.env.'))&&base!=='.env.example')issues.push('Unauthorized env file: '+filename);
    if(/\.(pem|p12|pfx|key)$/i.test(base))issues.push('Sensitive private-key extension: '+filename);
    if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content))issues.push('Private key text: '+filename);
    if(/\b(?:GROQ_API_KEY|MONGODB_URI|AUTH_SECRET|GOOGLE_CLIENT_SECRET|GITHUB_CLIENT_SECRET)\s*[:=]\s*['"][^'"\s]{8,}/.test(content))issues.push('Potential embedded provider credential: '+filename);
  }
  return issues;
}
const scan=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>{
  if(ent.isDirectory())return ignore.has(ent.name)?[]:scan(path.join(dir,ent.name));
  if(ent.isFile()&&(/\.(ts|tsx|js|mjs|json|md|yaml|yml)$/.test(ent.name)||ent.name.startsWith('.env')))return [[path.relative(root,path.join(dir,ent.name)),fs.readFileSync(path.join(dir,ent.name),'utf8')]];
  return [];
});
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const findings=assessRepositoryFiles(new Map(scan(root)));
  if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}
  else console.log('PASS: no local .env, private-key files, or high-confidence embedded credentials in shipped source.');
}
