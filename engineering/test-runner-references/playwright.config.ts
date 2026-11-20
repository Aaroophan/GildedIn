/** REFERENCE - NOT INSTALLED/ENABLED; Playwright must run after test-bootstrap and a reviewed lockfile. */
import {defineConfig, devices} from '@playwright/test';
import {assertIsolatedTestEnvironment} from '../../src/server/config/preflight.ts';
assertIsolatedTestEnvironment(process.env);
export default defineConfig({testDir:'./engineering/test-runner-references',testMatch:/.*\.browser\.spec\.ts$/,
 forbidOnly:true,retries:0,workers:1,timeout:25000,
 use:{baseURL:'http://localhost:3000',trace:'off',screenshot:'off',video:'off'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}}],
 reporter:[['line']],
 webServer:{command:'npm run dev',url:'http://localhost:3000',reuseExistingServer:false,timeout:120000,
 env:{APP_ENV:'local',APP_CANONICAL_ORIGIN:'http://localhost:3000',APP_DOMAIN:'localhost',MEDIA_PROVIDER:'memory',MONGODB_DB:'gildedin_local',
 FEATURE_AI_PLATFORM:'off',FEATURE_UPLOADS_PLATFORM:'off',FEATURE_RSS_SYNC:'off',FEATURE_REGISTRATION:'off'}},
});
