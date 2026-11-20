# Issue 2 evidence report

This report is generated for an isolated, offline patch. It distinguishes locally executed checks from files or configurations not executable in this environment. Details of each subissue's proof/blocked status are in `issue-2-status.json`. No prod test run, live provider request, GitHub repository change or public deployment occurred.

## Recorded local results (2026-11-20)

- `npm run verify:issue2`: PASS — 72 tests passed, 0 failed; 97 requirements/36 ADRs/18 gates verified; architectural imports, secret check, lock consistency, license inventory and domain TypeScript passed.
- `npm run check:ci`: PASS — local static workflow audit. The GitHub workflow itself was not executed.
- `tsc --noEmit -p tsconfig.security.local.json` with a temporary local symlink to globally available `@types/node`: PASS for new security modules except the Zod-dependent schema. Temporary symlink/config were removed; this is not the full project typecheck.
- `npm run test:browser`: BLOCKED (exit 2; Playwright/axe/LHCI packages absent).
- Real provider connectivity, release readiness, deploy and branch protection: NOT RUN/BLOCKED; release NO-GO.

## Local reproduction commands

```sh
npm run check:requirements
npm run check:boundaries
npm run check:secrets
npm run check:supply-chain
npm run check:ci
npm run check:licenses
npm test
npm run typecheck:domain
```

## Unavailable checks

`npm ci --ignore-scripts` / `npm run typecheck` / `npm run lint` / `npm run build`: offline npm registry in this environment. Verified package-lock contains Zod 4.1.13, which was made an explicit direct dependency; full install and runtime build must be executed with network in CI/local machine and any found failures fixed before merge. The isolated Node tests do not require those dependencies.

`Vitest`, `Playwright`, `axe`, `Lighthouse CI`: dependency/runtime installation missing, so no claim of their passing. Reference configs are intentionally not activated. Provider/DNS/TLS/HSTS/real-host tests: BLOCKED until Issues 4/19 and actual deployment proof. Mongo-backed durable audit: blocked until Issue 3. These are non-waivable evidence gaps.

## Threat/requirement mapping

- 2.1: OPS-001, OPS-003, SEC-006, SEC-011; T-OPS-01, T-OPS-03, T-SEC-06, T-SEC-11
- 2.2: OPS-003, SEC-011; T-OPS-03, T-SEC-11; ADR-029
- 2.3: SEC-001, OPS-003, PRF-001; T-SEC-01, T-OPS-03, T-PRF-01
- 2.4: SEC-003, SEC-004, TEN-007; T-SEC-03, T-SEC-04, T-TEN-07; TH-04, TH-41
- 2.5: SEC-006, SEC-011, IAM-005; T-SEC-06, T-SEC-11, T-IAM-05; TH-27
- 2.6: OPS-004, SEC-010, AI-008; T-OPS-04, T-SEC-10, T-AI-08; TH-31
- 2.7: SEC-010, OPS-004, ADM-003; T-SEC-10, T-OPS-04, T-ADM-03
- 2.8: SEC-006, SEC-011, OPS-003; T-SEC-06, T-SEC-11, T-OPS-03; TH-28
- 2.9: SEC-003, SEC-007, TEN-009; T-SEC-03, T-SEC-07, T-TEN-09; ADR-026
- 2.10: OPS-003, SEC-011, OPS-007; T-OPS-03, T-SEC-11, T-OPS-07

Original Issue 1 specification `SPEC-CONFLICT-001` (409 vs 412) is retained and not silently rewritten.
