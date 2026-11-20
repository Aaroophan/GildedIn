# Issue 1 — Local evidence and blocked gates

**Date:** 2026-11-20  **Product:** GildedIn  **Scope:** Issue 1.1–1.10 only  **Environment:** isolated Linux container, Node 22.16.0, npm 10.9.2, TypeScript 5.8.3 (globally available). No production credentials, database, OAuth, media provider or network-backed test resources used.

## Executed and observed

| Command / inspection | Result | Status |
| --- | --- | --- |
| Parse source 02 canonical 97 requirements | 97 unique; 63 P0 + 34 P1; all test IDs extracted | **PASS** |
| Parse source 12 ADR index | 36 distinct ADR-001..ADR-036 with exact source statuses | **PASS** |
| Parse source 10 normative DEP gates | 18 normative gates, each BLOCKED for actual provider evidence | **PASS** (ledger validity only) |
| `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` | Dependency manifest reconciled with original lock using offline lock metadata; removes unused prototype dependencies | **PASS** (lock only, no package install) |
| `npm run verify:foundation` | Requirement, import boundary, source-secret checks and Node unit tests and pure TypeScript domain compilation succeeded | **PASS** |
| `npm run typecheck:domain` | Pure domain/shared TypeScript and compile-time wrong-ID negative assertions pass | **PASS** |
| `npm run check:boundaries` | No forbidden/cyclic static imports; representative deliberate violations detected | **PASS** |
| `npm run check:secrets` | No local `.env`/private key/high-confidence embedded credential in shipped source | **PASS** |
| `npm run test:domain` | **34 tests passed, 0 failed** (limits, validation, API, host, registers, dependency checks, governance, audit, synthetic sentinel fixtures) | **PASS** |
| TypeScript 5.8.3 `transpileModule` syntax parse of 36 TS/TSX files | 0 syntax diagnostics (not a framework build/typecheck) | **PASS** (syntax only) |
| Historical `npm ci --offline` in sanitized original source | Failed `ENOTCACHED` (uncached package tarball; no `.env`/personal assets used) | **BLOCKED** |
| New project `npm ci --offline` | Failed `ENOTCACHED` (npm registry tarball unavailable); direct registry lookup failed with `EAI_AGAIN` | **BLOCKED** |
| New project `npm run build`, `npm run lint`, Next-aware `npm run typecheck`, HTTP/browser smoke | Not run; dependencies cannot be installed with available network/cache | **BLOCKED** |
| Actual DNS/TLS, OAuth cookie, MongoDB consistency, provider billing/privacy/CI protections | No live accounts/providers connected or tested | **BLOCKED** for production use |
| MIT/asset/font rights | Historic binaries excluded; no verified ownership/license decision | **BLOCKED** under ADR-031 |

## Security negatives included in local tests

- Reject invalid/mixed identifiers, user-supplied owner fields, Mongo operators, dangerous JSON keys, cycles and accessors.
- Reject reserved/Unicode/encoded slugs, forged/unknown hosts, unverified wildcard subdomains and mismatched forwarded hosts.
- Reject publication byte count 102,401, authored blocks 21, fields/items 21, media over limits and invalid image dimensions.
- Detect deliberately removed requirement IDs, modified normative requirement text, ADR drift and a prematurely verified deployment gate.
- Detect forbidden imports and cycles, and synthetic private-sentinel leakage into a test public projection.
- Deny a billable provider change and require an ADR for contract-changing package upgrades.

## Truthfulness note

Passing pure validators is **not** proof of secure production routes, MongoDB concurrency, OAuth account ownership, actual CDN revocation, browser accessibility, or correct Next.js build/runtime. Source-11 canonical acceptance case IDs remain unexecuted in the requirement register until those surfaces exist. The initial application shell deliberately serves no user data, requires no `.env`, and cannot publish. **Issue 1 is delivered with local checks passed and honest external/framework verification blockers.**
