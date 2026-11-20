// Intentionally fail rather than misrepresent an unavailable browser/a11y/performance runner as a pass.
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
const required=['node_modules/@playwright/test/package.json','node_modules/@axe-core/playwright/package.json','node_modules/@lhci/cli/package.json'];
const missing=required.filter(x=>!existsSync(resolve(x)));
if(missing.length){console.error('BLOCKED: browser/a11y/LHCI dependencies not installed with an audited lockfile: '+missing.join(', '));process.exitCode=2;}
else {console.log('Browser dependencies detected; run the scoped browser and performance suites described in engineering/testing.md.');}
