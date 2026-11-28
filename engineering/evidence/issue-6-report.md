# Issue 6 — implementation and evidence report

**Project:** GildedIn · **Date:** 28 November 2026 · **Authority:** twelve original specifications (01–12) and latest 13 implementation plan · **Release decision:** **NO-GO / BLOCKED**. Original Issue 5 sources preserved and extended; no production data, paid services, live OAuth accounts, remote database or private uploaded images used. Code, local tests, and browser/provider requirements have deliberately different outcomes.

## Reproducible evidence (actually executed)

| Check | Outcome | Scope and limitation |
| --- | --- | --- |
| `npm test` | **PASS — 204 of 204 tests, 0 failures** | Includes 50 focused Issue 6 unit/fake-Mongo transaction tests and 154 predecessor tests; no actual Mongo, Next.js server or browser |
| `npm run typecheck:domain` | **PASS** | TS strict types for pure domain, all content modules; no runtime dependencies |
| `tsc --noEmit -p tsconfig.persistence.json --typeRoots <preinstalled Node types>` | **PASS** | Local TypeScript compilation using container global Node types (not user installation) |
| `tsc --noEmit -p tsconfig.identity.json --typeRoots <preinstalled Node types>` | **PASS** | Local identity/persistence TypeScript compilation |
| `tsc --noEmit -p tsconfig.tenancy.json --typeRoots <preinstalled Node types>` | **PASS** | Includes imported new content repository and owner creation Hero |
| `npm run check:requirements` | **PASS** | 97 canonical requirements, 36 ADRs, 18 deployment gates and all 13 canonical docs |
| `npm run check:boundaries` | **PASS** | No static import/cycle errors in 106 project source files before addition of nonadapter owner DTO module |
| `npm run check:secrets` | **PASS** | No `.env`, private key, or high-confidence embedded credentials in packaged tree |
| `npm run check:supply-chain` + `npm run check:licenses` | **PASS (existing locked inventory)** | Original 10 direct dependency entries/393 license items; **missing `mongodb` and `next-auth` NOT validated** |
| `npm run check:ci` | **PASS** | Restored fork-safe CI workflow with pinned Actions, locked install and required checks |
| Full Next.js typecheck/build, browser E2E, real authenticated REST, real Mongo transactions/indexes, real OAuth/TLS | **BLOCKED / NOT RUN** | npm registry and real provider dependencies unavailable; no deployment and no false real-service claims |

## Sub-issue implementation map

| Plan | Source implementation | Synthetic verification | Gate still open |
| --- | --- | --- | --- |
| **6.1** Sections, one first Hero, publish-minimum identity | `domain/content/types.ts`, `model.ts`, Issue 5 `tenancy-repository.ts` typed first Hero | PASS — duplicate/missing/out-of-order Hero, optional Projects, profile publish readiness and legacy compatibility | Real publisher and browser |
| **6.2** Primitive types, nested validators, controlled media/relation values | `schema.ts`, `strict.ts`, `rich-text.ts`, `content-repository.ts` | PASS — all approved types, URLs, numbers, dates, nested depth, media owner/type/finalization | Real media provider/DB |
| **6.3** Safe schemas, JSON import, impact confirmation | `schema.ts`, `migration.ts`, owner schema-import and impact endpoints | PASS — `$ref`, prototype/dangerous operators, open objects, depth/caps denied; revision-specific confirmation | Full editor UI and real HTTP |
| **6.4** Stable content items and collections, create/update/reorder/hide/delete | `model.ts`, `commands.ts`, `content-repository.ts` | PASS — item IDs stable, 20-item boundary, categories, optimistic revision, replay and immutable releases | Real transaction/CAS concurrency |
| **6.5** Relations and deletion impact | `model.ts`, `commands.ts`, deletion-impact endpoint | PASS — missing/foreign targets, cycles, graph depth, section references, blocking live bindings, explicit detach | Real multi-tenant Mongo |
| **6.6** Deep public/search/AI allowlist and privacy | `model.ts`, `owner-view.ts` | PASS — hidden/private sentinel, nested list/object per-path approvals, AI denied by default, candidate search | **Real release compiler, current policy, Gilden and search** |
| **6.7** Safe rich text, Markdown, inert diagrams | `rich-text.ts` | PASS — AST, escaped output, HTTPS links, raw HTML/MDX denial, Mermaid click/style denial | **WYSIWYG integration, full Markdown, real browser XSS, approved diagram renderer** |
| **6.8** Project case studies and categories | `projects.ts`, `commands.ts`, `model.ts` | PASS — title, route slug uniqueness in portfolio, URLs, dates, gallery and 6 case-study chapters | Detail UI/SSR/compiler |
| **6.9** Deterministic derived dates and migration checks | `derived.ts`, `migration.ts` | PASS — leap dates, month bounds, stale impact, compatible migration, explicit destructive confirmation | Actual DB migration rehearsal/rollback |
| **6.10** Negative matrix / all prior tests | Unit/integration Issue6 tests + previous 154 | PASS — local content tests; 204 total regression green | **Source 11 T-CNT-10 and T-CNT-11 E2E, live browser/provider gates** |

**Canonical acceptance IDs:** Local deterministic evidence exercises relevant portions of `T-CNT-01` through `T-CNT-09`, as well as `T-SEC-02`, `T-SEC-04`, `T-SEC-07`, `T-SEC-08`, `T-EDT-08`, `T-EDT-09`, `T-PUB-02`. This is **not** a claim that the complete canonical T-CNT suite passed end-to-end: UI, renderer, active release, provider, and browser cases are absent. `T-CNT-10` is **NOT RUN**, as external Medium/GitHub feed cache/SSRF belongs to Issue 15. `T-CNT-11` is **BLOCKED**, as source 11 requires a generated **release-only** search index, not just a private-draft candidate projection; belongs to Issues 13–14. See `issue-6-status.json`.

## Security proofs and design choices

- All owner routes require trusted apex Host, session, current account security version, exact Origin and session-bound CSRF; repository rechecks the same actor and portfolio inside the transaction before a single revision CAS. A foreign ID is an opaque 404 / denied without foreign content. A missing transaction runner denies before mutation.
- Every command is finite/discriminated; unknown fields, arbitrary JSON Patch, Mongo selectors, changed `activeReleaseId`, platform roles, `nodes`, `seo`, other protected draft controls and malformed nested values are denied. New data remains private unless explicitly approved per item/section/field path.
- Pinned `contentId` and one-owned-document design mean a project edit changes every draft binding, not an already prepared immutable public release. Deletion checks every bound item, section and node before a write. Concurrent stale edits conflict and an idempotent replay does not save twice.
- Rich-text HTML is an **escaped fallback**, not a general sanitized component system or an externally loaded iframe. Mermaid stays inert text and the code does not execute it. A browser XSS proof cannot be inferred from a pure-string test.
- Content `projectEligibleContent` returns **internal candidates only**, not publicly accessible data. An active release and current moderation/visibility controls remain mandatory from Issues 5/13–14.
- The old uploaded ZIP omitted `.github/workflows/verify.yml`; its absence broke baseline `npm test` before changes. The existing Issue 2 security workflow was restored with immutable pinned Actions and safe fork settings. The uploaded `.env` and any personal/profile media assets were explicitly excluded from packaged source.

## Unresolved contract / deployment gates

1. **SPEC-CONFLICT-CARRIED-FORWARD — draft `If-Match` 409 vs RFC 9110 412.** Source 02 requires `409` for stale draft conflict; source 06 §34.1 explicitly says strict `If-Match` could require `412` and leaves a reviewed interoperability choice. Current PUT follows the product 409 while PATCH uses a typed expectedRevision and 409; this is not a newly resolved standard. Owner editor client/contract review before launch required.
2. **Actual npm install / Next.** The existing uploaded `package.json`/lockfile do not install `next-auth` or official `mongodb`. Offline registry means no dependency release, complete Next app typecheck/build, actual authentication or REST request proof. No synthetic npm lock records were fabricated. Review and install maintained versions on a connected trusted machine, then run `npm ci`, `npm run typecheck`, and `npm run build`.
3. **MongoDB correctness.** Full transaction support/latency, schema validators, unique indexes, update semantics on the chosen free tier and potential concurrent account suspension are not proven by a fake. Real local replica-set and selected provider proofs required; no production database used.
4. **Browser/renderer.** WYSIWYG editor, actual sanitized HTML output, keyboard/no-JavaScript, SSR, search index, active release, media, Gilden and rich-text diagram rendering, browser stored-XSS, Host/cookie/CSRF, CDN policy revocation and genuine wildcard DNS/TLS are pending downstream issues. `test:browser` not run. No release published.
5. **Operations.** Zero-card/no-overage eligibility, provider privacy/terms, independent backups, actual source/font licenses and protected branch/launch checklists G-01…G-16 remain unresolved under Issue 19/20. ADR-031 pending.

**Decision: NO-GO.** Source-code implementation and reproducible synthetic content safeguards are supplied; real integrated production or full feature closure is **not** asserted. Never expose the pure projection directly to the public or AI until the validated release compiler, current-policy gate and actual provider tests are complete.
