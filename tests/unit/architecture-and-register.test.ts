import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertNoForbiddenImports, importsOf } from '../../scripts/check-boundaries.mjs';
import { parseCanonicalRequirements, verifyRequirementInventory, verifyAdrInventory, verifyDeploymentGates } from '../../scripts/check-requirements.mjs';
import { assessRepositoryFiles } from '../../scripts/check-secrets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(load(p));
test('canonical requirements exactly equal source 02 and cannot drop an ID undetected',()=>{
 const source=load('docs/specifications/02-requirements-and-scope.md');
 const actual=json('engineering/registers/requirements.json').requirements;
 const expected=parseCanonicalRequirements(source);
 assert.equal(expected.length,97);
 assert.doesNotThrow(()=>verifyRequirementInventory(expected,actual));
 assert.throws(()=>verifyRequirementInventory(expected,actual.slice(1)));
 assert.throws(()=>verifyRequirementInventory(expected,[{...actual[0],requirement:'changed'},...actual.slice(1)]));
});
test('ADRs/statuses and 18 actual deployment gates preserve source authority',()=>{
 assert.doesNotThrow(()=>verifyAdrInventory(load('docs/specifications/12-architecture-decision-record.md'),json('engineering/registers/architecture-decisions.json').decisions));
 assert.doesNotThrow(()=>verifyDeploymentGates(load('docs/specifications/10-deployment-strategy.md'),json('engineering/registers/feasibility-gates.json').gates));
 const gates=json('engineering/registers/feasibility-gates.json').gates.map(g=>({...g}));gates[0].verificationStatus='PASS';
 assert.throws(()=>verifyDeploymentGates(load('docs/specifications/10-deployment-strategy.md'),gates));
});
test('static dependency checker catches route-to-database, domain-to-Next and cycle injection',()=>{
 const src=path.join(root,'src');const fake=new Map([
  [path.join(src,'app','test.ts'),"import {get} from '../infrastructure/repo.ts';"],
  [path.join(src,'infrastructure','repo.ts'),"export const get=()=>0;"],
  [path.join(src,'domain','content','bad.ts'),"import NextRequest from 'next/server';"],
 ]);
 assert.ok(assertNoForbiddenImports(fake).length>=2);
 const cycle=new Map([
  [path.join(src,'domain','content','a.ts'),"import './b.ts'"],
  [path.join(src,'domain','content','b.ts'),"import './a.ts'"],
 ]);
 assert.ok(assertNoForbiddenImports(cycle).some(x=>x.includes('Circular')));
 assert.deepEqual(importsOf("import type {A} from './A.ts'; export { B } from './B.ts'"),['./A.ts','./B.ts']);
});
test('secret checker fails when a malicious env file or private key is shipped',()=>{
 assert.deepEqual(assessRepositoryFiles(new Map([['src/a.ts','export const a=1;']])),[]);
 assert.ok(assessRepositoryFiles(new Map([['.env','X=unknown']])).length>0);
 assert.ok(assessRepositoryFiles(new Map([['secret.pem',['-----BEGIN PRIVATE', 'KEY-----'].join(' ')]])).length>0);
});
