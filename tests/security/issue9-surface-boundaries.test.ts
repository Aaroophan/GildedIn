import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=(name:string)=>readFileSync(new URL(`../../${name}`,import.meta.url),'utf8');
test('9.1 marketing only reads policy-filtered public directory, not raw drafts or owner accounts',()=>{
  const page=src('src/app/(platform)/page.tsx');
  assert.match(page,/\.directory\(env.APP_CANONICAL_ORIGIN\)/);
  assert.match(page,/Create your portfolio/);
  assert.doesNotMatch(page,/getOwnedDraft|readPrivateAccount|\.collection\(|PRIVATE_PROJECT_SENTINEL/);
});
test('9.2 sign-in server action enforces apex Origin and forwards only allowlisted return paths',()=>{
  const login=src('src/app/(account)/login/page.tsx');
  assert.match(login,/h\.get\('origin'\)!==env.APP_CANONICAL_ORIGIN/);
  assert.match(login,/safeDashboardReturnTo\(returnTo\)/);
  assert.match(login,/AUTH_GITHUB_ID/);assert.match(login,/AUTH_GOOGLE_ID/);
  assert.doesNotMatch(login,/password\s*:\s*|dangerouslySetInnerHTML/);
  const complete=src('src/app/(account)/login/complete/complete-button.tsx');
  assert.match(complete,/safeDashboardReturnTo\(returnTo\)/);
  assert.match(complete,/\/sessions\/complete/);
});
test('9.3 onboarding data is bounded, scoped, expires and can be cleared',()=>{
  const wiz=src('src/ui/owner/onboarding-wizard.tsx');
  assert.match(wiz,/gi:onboarding:v1:/);assert.match(wiz,/accountScopeHash/);
  assert.match(wiz,/ONE_DAY/);assert.match(wiz,/removeItem\(key\)/);
  assert.match(wiz,/ownerRequest<.*\>/);assert.match(wiz,/Idempotency-Key/);
  assert.doesNotMatch(wiz,/authToken|OAuthAccessToken|NEXT_PUBLIC_SECRET/);
});
test('9.4 dashboard and owner tools require current session, scoped portfolio and no shared cache',()=>{
  const gate=src('src/server/owner/context.ts');
  assert.match(gate,/requireSession\(token\)/);assert.match(gate,/readPrivateAccount\(actor\)/);
  assert.match(gate,/listOwned\(actor/);assert.match(gate,/x-forwarded-host/);
  assert.match(src('src/app/(owner)/dashboard/layout.tsx'),/force-dynamic/);
  assert.match(src('src/app/(owner)/dashboard/portfolio/page.tsx'),/requireOwnerPage/);
  assert.match(src('src/app/(owner)/dashboard/tools/[tool]/page.tsx'),/requireOwnerPage/);
  assert.doesNotMatch(gate,/req\.body|next\/cache|unstable_cache/);
});
test('9.6 linked-login operations use existing exact APIs and session-bound CSRF',()=>{
  const controls=src('src/app/(owner)/dashboard/account-controls.tsx');
  assert.match(controls,/\/api\/v1\/accounts\/me\/csrf/);
  assert.match(controls,/X-CSRF-Token/);assert.match(controls,/providers\/link-intent/);
  assert.match(controls,/sessions\/revoke-all/);assert.match(controls,/linkedProviders.length>1/);
  assert.doesNotMatch(controls,/accessToken|refreshToken|deleteAccount/);
});
test('9.7 rename/visibility/enable/disable use purpose-specific server commands and revision CAS',()=>{
  const settings=src('src/ui/owner/portfolio-settings.tsx');
  assert.match(settings,/\/rename`/);assert.match(settings,/\/\$\{action\}`/);
  assert.match(settings,/If-Match/);assert.match(settings,/Idempotency-Key/);
  assert.match(settings,/securityVersion/);assert.match(settings,/anyone with the direct link/);
  assert.doesNotMatch(settings,/\{\s*activeReleaseId\s*:/);
});
test('9.7 private Hero editor sends documented typed operations, not arbitrary Mongo update',()=>{
  const editor=src('src/ui/owner/hero-editor.tsx');
  assert.match(editor,/setProfileField/);assert.match(editor,/expectedRevision/);
  assert.match(editor,/clientMutationId/);assert.match(editor,/Unsaved changes/);
  assert.doesNotMatch(editor,/\$set|ownerAccountId|dangerouslySetInnerHTML/);
  const page=src('src/app/(owner)/dashboard/portfolios/[portfolioId]/editor/page.tsx');
  assert.match(page,/portfolio\.portfolioId!==/);assert.match(page,/getOwnedDraft\(actor/);
});
test('9.8 privacy notice discloses no backups, published versus unlisted and local storage',()=>{
  const policy=src('src/app/(platform)/privacy/page.tsx');
  assert.match(policy,/no guaranteed? independent backups/i);
  assert.match(policy,/Unlisted releases/);assert.match(policy,/24 hours/);
  assert.match(policy,/pre-launch product notice/);
});
test('9.10 published route never imports or receives mutable onboarding or private Hero draft',()=>{
  for(const name of ['src/app/(public)/[slug]/page.tsx','src/app/%5Ftenant/[slug]/page.tsx',
    'src/server/tenancy/public.ts']){
    const text=src(name);assert.doesNotMatch(text,/onboarding-wizard|ownerRequest|requireOwnerPage|readPrivateAccount|\bgetOwnedDraft\b/);
  }
});
