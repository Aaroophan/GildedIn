# Issue 11 — actual local source and security verification

**Project:** GildedIn · **Date:** 2026-11-29 · **Source:** user-supplied latest `GildedIn.zip`, all twelve unchanged `docs/specifications/01..12`, unchanged `13-implementation-plan.md` · **Decision: PRODUCTION NO-GO**.

## Implemented source boundaries

| Plan | Changes delivered | Local evidence | Gate |
| --- | --- | --- | --- |
| 11.1 | Existing protected GET/PUT/PATCH, strict workspace PUT and CAS reused; current actor/portfolio validated on every write/read | Issue 6/10 regression + 11 fake-tenant denial and static checks | Local PASS; real Next/Auth/Mongo BLOCKED |
| 11.2 | 850 ms bounded canvas debounce, immutable submitted payload/token, single in-flight request, snapshot-specific saved status | `issue11-autosave.test.ts`, static source check | Local PASS; browser interaction BLOCKED |
| 11.3 | 16-entry server receipt ledger, read-only owner receipt GET, idempotent same-token replay, unknown-outcome reconciliation and 1/2/4s backoff | fake Mongo lost ACK, old ledger receipt, tampered duplicate token, rollback | Local PASS; real network/DB fault testing BLOCKED |
| 11.4 | 409/412-aware owner conflict panel, no silent overwrite, server revision comparison, explicit REPLACE with new CAS | fake Mongo two-tab one-winner, pure state-machine checks | Local PASS; **409/412 SPEC-CONFLICT-001 OPEN**, browser BLOCKED |
| 11.5 | accountId+portfolioId-scoped sessionStorage snapshot, 24h TTL, 120kB max, strict parse, explicit restore/discard, logout purge | validation/expiry/cross-account unit tests + source guards | Local PASS; multi-window real browser BLOCKED |
| 11.6 | owner-only `/preview` GET, `/dashboard/preview` page, independent `/owner-preview-frame` auth, no-store/no-index/same-origin CSP framing | static trust boundary tests, synthetic cross-owner repository tests | Source PASS; real protected route/browser CSP BLOCKED |
| 11.7 | one semantic tree, responsive iframe at 1200/820/390 CSS px, default-paused Play; owner-only revision label | query parser negative matrix and source guard | PARTIAL: actual visual, JS, Three.js, zoom, SR/browser proof BLOCKED |
| 11.8 | read-only server prepublication compiler and ready_public media proof; blocker/warning panel with repair navigation | pure invalid Hero/private media tests, no release-pointer test | Local PASS; full media/browser overlap BLOCKED |
| 11.9 | auth/portfolio disabled/read/save denial, cross-tab status notice, beforeunload, signout recovery purge | fake Mongo disabled status, unauthorized, old-session and server-state tests | Local PASS; real provider/account switching/deletion BLOCKED |
| 11.10 | all previous synthetic regressions plus dedicated positive, negative, cross-tenant, rollback and source boundary suite | offline chain passes; no real public release written by Issue 11 | Local PASS; canonical end-to-end acceptance BLOCKED |

## Reproducible observed commands

```bash
npm run verify:issue11:offline
```

**Result:** PASS, **412/412 tests**, **0 failures**, of which **31 new**: 14 pure autosave/preview unit, 10 fake-Mongo integration, 7 static/security source tests. Earlier **381/381** Issue 1–10 tests preserved. Five prior tests that explicitly expected *disabled* previews and *manual-only* canvas save were updated to assert the stronger Issue 11 owner-only, no-public-leakage and revision-controlled contracts; no security denial case was removed. This command also runs inventory, module boundaries, secrets, supply-chain/license and CI checks plus the new `scripts/check-autosave-contracts.mjs` (15 required source files).

Additional observed isolated checks:

```bash
tsc --noEmit -p tsconfig.domain.json
tsc --noEmit -p tsconfig.content.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types
tsc --noEmit -p tsconfig.tenancy.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types
tsc --noEmit -p tsconfig.identity.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types
tsc --noEmit -p tsconfig.persistence.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types
```

**Result:** PASS each isolated configuration. Global TypeScript AST syntax parser: **214 TS/TSX files** (source, tests, existing browser test references), **0 parse errors**. Syntax parsing does **not** typecheck Next/React code or prove runtime hydration. `tsconfig.security.json` and the entire application typecheck are **BLOCKED** due missing baseline NextAuth, Next, MongoDB and Zod modules; the newly added server/editor TypeScript checks had no non-module errors after typed projection fixes.

## Security/side-effect evidence

- Fake Mongo two-tenant requests for `getOwnedEditableDraft`, `readMutationStatus` and `readReleaseReadyMediaIds` deny wrong-owner reads, including guessed IDs and valid token substitution. Disabling the owner portfolio denies new workspace saves, mutation receipts, ready-media reads and protected draft reads. Existing transaction runner provides rollback/fault simulation only, not proof of actual MongoDB server availability.
- Replayed mutation ID and matching SHA-256 fingerprint do not increment revision twice. The same ID with a different payload is rejected; stale concurrent expected revision never overwrites a newer save. The server holds only a bounded 16-entry receipt history; an evicted/unknown receipt is never treated as a confirmed failure or success.
- Public projection/route tests from earlier issues continue to deny unpublished drafts. New Issue 11 preview deliberately fetches an owned editable draft, not an active release, and new validation compiles without creating a release or setting the live active pointer. Preview and mutations/validate HTTP adapters set `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, and authenticated apex checks. Frame/owner page security relies on `requireOwnerPage` plus proxy CSP; this must still be proved by a running browser.
- Recovery local storage holds private draft data in sessionStorage and is scoped/expiring, but is **not an encrypted backup**. The UI discloses shared-device risk. Client cannot elevate privacy approvals through the workspace save.
- No package install or paid provider services were used to force green CI. The user-uploaded `.env` was omitted from the working tree and final source archive; no real client secrets/production records were tested.

## Open decisions, known limits, and deployment gates

**SPEC-CONFLICT-001 (OPEN):** Source 02 and source 06/08/ADR-032 disagree on application `409` versus literal `If-Match` `412`. Existing Issue 6/10 owner endpoints currently yield `409 CONTENT_CONFLICT`, and this implementation handles 409/412 on the client. **No claim** is made that correct 412 conditional HTTP semantics are implemented. Owner/API architect review and canonical acceptance updates remain required before production.

**Scope limitations:** Root `/` private preview only (explicit nonroot preview routes rejected); actual media delivery and approved upload state remain Issue 12; cinematic Three.js is not enabled from private draft; Hero field edits remain a separate manually saved CAS form; preview cannot display unsaved local canvas edits; owner iframe uses safe semantic renderer, not full later public publishing pipeline; generated CSS layout problems still need browser tests. Issues 13–14 immutable publishing and anonymous public delivery are intentionally absent.

**BLOCKED / NOT RUN external gates:** `npm ci` against the full intended verified package set, full Next/React/NextAuth compile/build/hydration, real MongoDB atomicity/transient loss and live-free-tier proof, real Google/GitHub OAuth callback and host-only session cookie behavior, browser cross-origin/CSP/frame headers, Playwright/axe/NVDA/VoiceOver and 320px/200%-400% zoom, GPU fallback/animation performance, verified license/font rights, actual media pipeline, privacy/legal review, DNS/TLS, billing/zero-charge provider feasibility. Missing evidence is not a pass. No production deployment is authorized by Issue 11.
