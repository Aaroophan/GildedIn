# Issue 1 — Ten sub-issue implementation handoff

**Product:** GildedIn (brand-new software product; earlier GildedIn was a prototype). **Primary authority:** [13 Implementation Plan, Issue 1](../docs/specifications/13-implementation-plan.md). Every sub-issue below has concrete artifacts; completion beyond narrow local proofs is limited by the evidence report and downstream dependencies.

| Sub-issue | Implemented artifact(s) | Reproducible evidence | Outstanding gate |
| --- | --- | --- | --- |
| **1.1 — Canonical requirements** | `engineering/registers/requirements.json` (97 verbatim requirement statements), `constraints.json` (fixed scope and byte units), `scripts/check-requirements.mjs` | Exact source consistency + mutated/missing ID negative tests | Provider/real acceptance tests not run |
| **1.2 — Safe prototype inventory** | `engineering/prototype-audit.md`, `registers/prototype-inventory.json`; legacy runtime, .env and personal media excluded | Sanitized source-only archive inspection; offline install attempted | Original build blocked by npm tarball cache/network |
| **1.3 — Dependency map** | `engineering/architecture.md`, typed domain-owned ports in `src/domain`, `scripts/check-boundaries.mjs` | Forbidden route→DB, domain→Next, cyclic imports rejected in negative tests | Broader AST+ESLint check in Issue 2 |
| **1.4 — Typed IDs and strict validation** | `src/shared/domain/{identifiers,validation,host}.ts`, `tests/type-guards.ts` | Typecheck, wrong ID type compile test, invalid slugs, prototypes, JSON, timestamps, URL candidates | Provider-subject proof and host resolution remain later issues |
| **1.5 — Shared limits and byte counts** | `src/shared/domain/limits.ts` + shared constraints register | Boundary tests on nested authored nodes, schemas, fields, collections, media and 102,400 UTF-8 bytes | Atomic quota reservation in Issue 12 |
| **1.6 — API/error/audit vocabulary** | `src/shared/domain/{api,audit}.ts`, initial `/api/v1` fail-closed handler | RFC 9457 shaped typed Problem Details, safe response examples and narrow audit projection tests | Final 409/412 wire semantics decision in Issue 11; HTTP integration in Issue 2 |
| **1.7 — Decision governance** | `architecture-decisions.json`, `src/shared/domain/governance.ts`, `engineering/decisions/*` | Provider with paid overflow BLOCKED; compatible reviewed patch routine; ADR statuses checked | Conditional suppliers, MIT and spec conflict remain unresolved |
| **1.8 — Application shell** | New Next.js `src/app` platform/login/dashboard/preview/slug/_tenant placeholders, `src/proxy.ts`, `next.config.ts` | Source parse passed and mock/no-data host classification tests | Next install/build and browser smoke BLOCKED offline |
| **1.9 — Synthetic fixtures** | `tests/fixtures/reference-portfolios.json` (4 personas, multiple tenants, public/AI-denied/private sentinels, viewport/motion stress), fixture tests | Sentinel expected-projection absence and deliberate leak detection | Real release/AI projection compilers are later issues |
| **1.10 — Feasibility ledger** | `feasibility-gates.json` (18 source DEP gates + 10 focused subgates); `provider-research.md` | All normative launch gates remain BLOCKED, ledger checked against spec 10; official terms reviewed | Actual account settings, live TLS, billing and deployment evidence in Issue 19 |

## Repeatable command order

```bash
npm ci                      # requires normal registry access; BLOCKED in this isolated environment
npm run verify:foundation   # dependency-free source/domain checks on Node 22.16+ with global/local tsc
npm run typecheck           # requires Next/React type packages
npm run lint                # requires installed ESLint packages
npm run build               # requires installed Next.js packages
npm run dev                 # only for local non-tenant, non-secret foundation shell
```

A `BLOCKED` or `NOT RUN` acceptance cannot be relabeled `PASS`. This issue does not authorize production deployment, publish, user registration, migration of personal prototype media, or integration with a real MongoDB/Groq/OAuth account.
