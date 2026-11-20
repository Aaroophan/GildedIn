import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRepositoryFiles} from '../../scripts/check-secrets.mjs';
import {auditWorkflow} from '../../scripts/check-ci.mjs';
test('secret detection flags synthetic private-key headers and injected provider secrets',()=>{
 const violations=assessRepositoryFiles(new Map([['.env','fixture-not-real'],['secret.key',['-----BEGIN','PRIVATE KEY-----'].join(' ')],
 ['src/config.ts',['const x = "GROQ_', 'API_KEY=\\"not_a_real_secret\\"";'].join('')]]));
 assert.ok(violations.length>=2);
});
test('CI policy refuses secret-bearing workflows, mutable actions and dangerous pull_request_target',()=>{
 const bad=`on: pull_request_target\npermissions:\n  contents: write\nsteps:\n - uses: actions/checkout@v4\n - run: echo \${{ secrets.MY_TOKEN }}`;
 assert.ok(auditWorkflow(bad).length>=3);
});
test('workflows with immutable actions are required to preserve mandatory checks',()=>{
 const basic=`permissions:\n  contents: read\nsteps:\n - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8\n   with:\n     persist-credentials: false\n - run: npm ci --ignore-scripts && npm run check:secrets && npm run check:licenses && npm test && npm run typecheck && npm run build`;
 assert.equal(auditWorkflow(basic).length,0);
});
