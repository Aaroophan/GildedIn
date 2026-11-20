/** REFERENCE - NOT INSTALLED/ENABLED. Add vitest as pinned dependency with a reviewed lock. */
import {defineConfig} from 'vitest/config';
export default defineConfig({test:{environment:'node',include:['tests/unit/**/*.test.ts','tests/security/**/*.test.ts','tests/integration/**/*.test.ts'],
 pool:'forks',maxWorkers:2, testTimeout:10000,hookTimeout:10000,
 setupFiles:['./engineering/test-runner-references/vitest-guard.ts'],
 reporters:['default','json'],outputFile:{json:'./test-results/isolated-vitest.json'}}});
