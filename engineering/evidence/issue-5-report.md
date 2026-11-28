# Issue 5 — implementation and verification report

**Source authority:** original `docs/specifications/01`–`12` and `13-implementation-plan.md`, Issue 5.1–5.10. **Date:** 28 November 2026. **Overall:** source implemented and synthetically exercised; **NO-GO for production**. No customer data, installed paid services, actual OAuth credentials, production DB, real host TLS or user media used. Every subissue retains BLOCKED live gates in [`issue-5-status.json`](issue-5-status.json).

## Executed local evidence

| Check | Result | Important limit |
| --- | --- | --- |
| `npm test` (test bootstrap enforces isolated `APP_ENV=test`) | **PASS — 154 tests, zero failures** across previous Issues 1–4 and Issue 5 | Fake injected database/transaction, not an actual Mongo server or HTTP E2E |
| `tsc --noEmit -p tsconfig.identity.json --typeRoots <container's installed @types>` | **PASS**, includes Issue 5 domain/repositories through infrastructure imports | Cannot typecheck missing external Next/Auth.js/Mongo packages |
| `tsc --noEmit -p tsconfig.tenancy.json --typeRoots <container's installed @types>` | **PASS** | Domain/Mongo types only, not app router compilation |
| `npm run check:requirements` | **PASS**, 97 canonical requirements, 36 ADRs, 18 deployment gates, 13 source documents | Does not confer production eligibility |
| `npm run check:boundaries` | **PASS**, 89 executable source files | Static checks not a complete runtime import audit |
| `npm run check:secrets` | **PASS** | Not proof of external runtime secret safety |
| `npm run check:supply-chain` and `npm run check:licenses` | **PASS**, 10 locked direct deps; 393 lockfile inventory entries, flagged none | Does **not** cover omitted `next-auth` and `mongodb`, ADR-031 licensing still pending |
| `npm run check:ci` | **PASS** static unprivileged/fork-safe workflow check | Real GitHub branch protection and PR execution not performed |
| TypeScript AST syntax parse of `src/**/*.{ts,tsx}` and scripts | **PASS** (see final log) | Syntax is not runtime compatibility or application build |
| `npm run db:prove-issue5-local` | **BLOCKED** if driver is absent; actual replica-set proof NOT RUN | No vendor/tier proof; may only be attempted against generated loopback DB |
| Full Next build, actual browser/Host/cookie/CSRF, physical TLS/DNS, real OAuth | **BLOCKED / NOT RUN** | Required before closing Issue 5 or enabling real users |

Local tests exercise one active owner portfolio, canonical and reserved slugs, case-insensitive duplicate claims, concurrent owner creation and replay, atomic failure rollback, audit failures and a fake unavailable transaction runner. They also exercise historical aliases, rename journal and replay, cross-account refusal, stale or revoked sessions, privacy-safe owner listing/slug advice, pre- and post-publication visibility/disable/enable, blocked admin moderation override, warm released content then suppression, missing and unavailable live policy, public-directory allowlisted title only, valid/invalid detail routes, hostile Host/Forwarded hosts, no unapproved wildcard, and expired/revoked owner account.

## What was implemented

**5.1–5.2:** The canonical slug parser recognizes ASCII 3–30-character names and reserved namespaces; new typed commands accept only owner-editable onboarding fields. `MongoTenancyRepository.create` atomically creates owner control, unique slug claim, **private first Hero draft**, a replay fingerprint and restricted audit event with an authenticated actor resolved again inside the transaction. `uq_single_owner_portfolio`, global `uq_slug_all_claims` and `uq_one_current_claim` are declared physical constraints. The new owner singleton listing and slug availability APIs are intentionally read-only and advisory; the unique DB insert is final.

**5.3–5.4:** `classifyRequestHost`, `proxy.ts` and the internal rewrite guard enforce trusted apex/`www`/verified tenant zones. A rename transaction changes the canonical slug mirror and old claim to a **permanent alias** while installing the new global claim and `renameOperations` idempotency journal; safely built 308 redirects preserve supported detail routes. No hard-coded owner exception, user-supplied Host-derived redirect, alias deletion or user-provided Mongo filter exists.

**5.5–5.6:** Owner visibility, disable and enable commands use a **live DB actor**, policy security-version CAS, fresh moderation check for re-enable and an audit write **in one transaction**. Unpublished owners can change visibility and disable; re-enable without a release returns to onboarding. The prior `MongoTenantRepository.comparePolicy` unaudited mutation is now blocked; all new policy mutation flows use `MongoTenancyRepository.changePolicy`. A public release requires active owner + portfolio, active pointer, current moderation, approved exact release/route manifest and current slug claim; a second policy/owner read detects changes before output. Missing or inconsistent live state denies instead of using cache. A public release record alone does not authorize delivery.

**5.7–5.8:** Apex portfolio routes, encoded `%5Ftenant` internal Next paths, same-route canonical mappings, alias redirects, tenant-host API/account denial and noindex/private cache headers are implemented. The full-content public compiler, media and SEO are deliberately *not* implemented ahead of Issues 7, 13 and 14; page output is an allowlisted released SEO title and simple navigation **after** the current-policy gate. Actual Next App Router behavior, browser cookie scope, DNS and TLS are still unverified.

**5.9–5.10:** Public discovery returns a bounded list from published-release SEO metadata only, excludes unlisted/disabled/suspended/unpublished entries, and revalidates each candidate's live policy. The synthetic cross-tenant negative suite and new **strictly local** real MongoDB proof script are provided. The latter cannot be counted as a successful service test until an operator runs it with an installed official driver and a disposable replica set. Actual rendered browser/Host/CDN tests and all required external gates remain BLOCKED.

## Blockers / go-no-go

1. **Official dependencies:** The baseline ZIP does not lock/install `next-auth` or the official MongoDB Node driver. Registry access to complete installation was unavailable; no fictitious lockfile entries were written. On a connected trusted workstation run `npm run deps:identity`, carefully review the versions and license/advisories, then `npm ci`, full typecheck and Next build.
2. **Actual MongoDB:** MongoDB transaction support, unique index installation, Mongo release/alias races, durable audit rollback, selected no-charge tier consistency/quotas and migration readiness remain **BLOCKED**. The `db:prove-issue5-local` script is intentionally restricted to its **random generated loopback test namespace**, and cannot run with operator-supplied DB env variables.
3. **Actual OAuth and browser:** Real Google/GitHub OIDC/GitHub callback journeys, session/CSRF/protected API browser responses, host-only cookie scope and direct user onboarding remain BLOCKED from Issue 4/9.
4. **Dual host and cache:** Physical wildcard DNS/TLS, trusted edge `Host`/`X-Forwarded-Host`, `www` redirects, encoded rewrite behavior, metadata/robots consistency and revocation across caches/media/feed/SEO paths need live evidence. Wildcard remains disabled. All provisional public pages are noindex, and the global `robots.ts` disallows indexing.
5. **Future milestones:** Real versioned content, visual renderer, publication compiler, media, sitemap/SEO and public API feeds remain in later issues. A safe routing shell is not a complete public portfolio renderer. Provider billing/no-spend, privacy/legal, license, audit retention and real production branching/release G-01..16 gates remain unresolved.

**Decision: NO-GO.** Issue 5's source and deterministic synthetic test contracts are present. None of these results prove an installed working end-to-end Next/Auth/Mongo deployment, real wildcard hostname security or production readiness. Before setting any Issue 5 subissue to PASS for closure, run and record the actual Mongo, Next/HTTP, browser and DNS/TLS checks described in `engineering/issue-5-setup.md` and source 11.
