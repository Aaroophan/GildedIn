# Issue 9 — implementation and actual verification evidence

**Date:** 2026-11-28. **Scope:** `13-implementation-plan.md` Issue 9.1–9.10, governed by original 01–12 specifications. **Verdict:** source implemented for all ten tasks with meaningful local evidence, but **NOT CLOSED**, **PRODUCTION NO-GO**. The user-provided plan is unchanged. Results below are observations, not an assertion that all source-11 acceptance checks were completed against a production service.

## Reproducible local outcomes

| Command / evidence | Observed result | Interpretation |
| --- | --- | --- |
| Baseline `npm test` before Issue 9 | PASS, 288/288 | Issues 1–8 regression baseline |
| `node --experimental-strip-types --test tests/unit/issue9-onboarding.test.ts tests/integration/issue9-onboarding.test.ts tests/security/issue9-surface-boundaries.test.ts` | PASS, **32/32** | 13 pure onboarding, 10 synthetic fake-Mongo and 9 route/security source checks |
| `npm run verify:issue9:offline` | PASS, **320/320** tests with zero failures | Combined local tests + requirements, boundary, secrets, dependency/license inventory, CI, domain TS and visual-contract assertions |
| `tsc --noEmit -p tsconfig.domain.json` | PASS | Pure shared/domain types |
| `tsc --noEmit -p tsconfig.{content,identity,tenancy,persistence}.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types` (five separate commands including domain) | PASS for each | Isolated TS checks with preinstalled external Node types; **not full React/Next typecheck** |
| Global TypeScript `createSourceFile()` pass over `src`, `tests`, `scripts` | PASS, **182 TS/TSX files**, 0 parse errors | Syntax only; no provider runtime guarantees |
| `npm run check:boundaries` | PASS, 151 sources | The server guard imports *domain-owned* DTOs; no new infrastructure import through server or app zone |
| `npm run check:visual-contracts` | PASS | Static design inheritance and no unreviewed visual-origin sources |
| Original plan byte-for-byte comparison | PASS (`cmp`) | `docs/specifications/13-implementation-plan.md` matches supplied implementation plan |
| Real installed Next.js/React build, OAuth, DNS, TLS, MongoDB, cookie/session/CSRF browser E2E, Playwright/axe/Lighthouse | **BLOCKED / NOT RUN** | Required dependencies/service credentials/live test infrastructure unavailable; not substituted with mocks |

The prior synthetic suite and Issue 9 tests use **only synthetic account IDs** and local in-memory MongoDB fixtures. No production account, token, database, provider charge, or customer records were used. No secrets from the uploaded `.env` were read or included in the output.

## Per-subissue implementation and evidence

| ID | Source artifact | Local verification | Outstanding closure gate |
| --- | --- | --- | --- |
| **9.1** Marketing homepage/nav | `src/app/(platform)/page.tsx`, `src/ui/design/platform-shell.tsx`, existing live-policy filtered directory port | static security check: directory only, no draft or fabricated cards | actual SSR+cache, published flagship eligibility, Lighthouse, no-JS and browser |
| **9.2** Google/GitHub sign-in | `src/app/(account)/login/**`, safe `safeDashboardReturnTo` | explicit host/origin checks and URL-denial tests | real Google/GitHub Auth.js callback and provider failure/browser CSRF |
| **9.3** Guided wizard | `src/ui/owner/onboarding-wizard.tsx`, `src/domain/onboarding/model.ts`, `src/domain/tenancy/commands.ts`, `src/infrastructure/mongodb/tenancy-repository.ts` | 13 pure unit tests and synthetic transactional create, rollback, retry, optional first project or explicitly opted-in SAMPLE ONLY project text | real Mongo indexes/transactions, browser refresh/availability/no-JS assistive journey |
| **9.4** No-portfolio dashboard | `src/server/owner/context.ts`, `src/app/(owner)/dashboard/page.tsx` | owned/foreign read, real snapshot revision/status/quota and restricted state tests | browser, cache and actual OAuth session |
| **9.5** Owner navigation | `src/ui/owner/shell.tsx`, authenticated tool detail route, responsive CSS | no host bypass and static owner tool entry checks | 320px/zoom/touch/screen-reader validation, features from future issues |
| **9.6** Owner account UI | `src/ui/owner/account-profile-editor.tsx`, prior session-bound `account-controls.tsx` | source security and preexisting profile/provider/auth unit and fake-integration tests | real provider link/unlink and recent auth/browser revocation |
| **9.7** Owner portfolio UI | `src/ui/owner/portfolio-settings.tsx`, existing named endpoints | conditional policy/rename, role/isolation/foreign-account tests, no release pointer assignment | actual collision/alias redirects and cache/policy on host |
| **9.8** Disclosures | `/privacy`, owner dashboard and settings, shared quota constants | source/canonical limit assertions and owner-scoped quota tests | independent legal review, final retention/provider evidence |
| **9.9** Accessible state/error handling | client wizard, Hero editor, owner request helper, responsive CSS | safe allowlist error messages, validation, dirty/saved state and source checks | actual failed-network, 400% zoom, touch and screen-reader behavior |
| **9.10** End-to-end negative matrix | `tests/unit/issue9-onboarding.test.ts`, `tests/integration/issue9-onboarding.test.ts`, `tests/security/issue9-surface-boundaries.test.ts` | 320/320 offline; two-tenant denial; private project, zero releases, transaction rollback and replay | real sign-in → private draft → edit flow, cross-tenant browser probes and public absent-route proof |

See machine-readable [Issue 9 statuses](issue-9-status.json) for canonical requirement/test references and each task's closure state. Subissues remain `BLOCKED` for production, rather than incorrectly being marked fully complete based on source tests.

## Security observations and honest limitations

- Owner guard rechecks apex Host, forwarded claims, revocable server session, current active account and owned singleton portfolio. Only after this are private SSR DTOs passed to React components. Owner read models are positive allowlists. Public tenant routes never import owner draft internals.
- Initial optional project is `draft_only`, `searchable:false`, no AI/public approved fields; one-transaction insert includes portfolio/slug/draft/audit; fake rollback and single-key replay tested. **No live MongoDB transaction proof exists**, and no production publish/preview route is added.
- Owner mutation helper uses same-origin CSRF and purpose-specific API paths. The server continues to own security versions and all authorization. `activeReleaseId`, role, ownerAccountId, Mongo queries and provider tokens are never editable UI fields. The GitHub email can be absent; email text never determines account identity.
- Browser recovery is temporary localStorage, not secure storage or a durable backup. The account-scoped key is hashed and the recoverable payload has a 24-hour TTL checked when the wizard opens, with a user-clear action. An unopened browser can retain expired *physical* storage until the wizard is opened again; that limitation is disclosed instead of promising guaranteed automatic deletion.
- The `unlisted` option explicitly remains accessible by anyone with the URL when there is a release. An unpublished draft remains private/404 to visitors. Owner-disabled/suspended/deleting statuses are distinct; policy checks are server-side, and absence of live policy must deny public access.
- Full visual editor, secure upload/media, immutable publication/restoration, SEO releases, Gilden, inbox, analytics, account export/deletion and legal notice acceptance are **not implemented in Issue 9**; the owner navigation advertises them as unavailable, not as active links to privileged operations.
- Remaining inherited architecture conflict: persisted draft revision 409 versus HTTP `If-Match` precondition 412 mapping must be reviewed as a `SPEC-CONFLICT`, not silently redefined.
- Full React/Next.js typechecks, browser interactions, font and cinematic bundles, actual OAuth, MongoDB, DNS/TLS, CSP, privacy/legal and zero-spend provider eligibility are **BLOCKED**. Neither provider secrets nor payment cards were added.

**Decision:** retain NO-GO until the source-11 acceptance checks have *actual* passing live/browser evidence, not merely synthetic or source-level green checks.
