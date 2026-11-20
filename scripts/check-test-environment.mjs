import {assertIsolatedTestEnvironment} from '../src/server/config/preflight.ts';
try {assertIsolatedTestEnvironment(process.env);console.log('PASS: isolated test environment, no external credentials');}
catch(e){console.error('BLOCKED: '+(e.reason??'invalid-test-environment'));process.exitCode=2;}
