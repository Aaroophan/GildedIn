# GildedIn

**GildedIn** is the new free, open-source, multi-user, specification-led portfolio platform. The previously existing GildedIn app is solely a **prototype/visual reference**, not a trusted runtime baseline. This ZIP continues the Issue 1 foundation with code for **Issue 2 — isolated development, secure configuration, CI and test foundations**.

The 12 authoritative specifications and implementation plan are bundled in `docs/specifications/`. Do not describe these early shells as a functional SaaS: authentication, Mongo-backed repositories, content editor, publishing, owner dashboard, media and Gilden remain disabled until their assigned issues.

## What was added in Issue 2

- **2.1:** Zod schema and dependency-free fail-closed config preflight (`src/server/config/*`); optional providers OFF; no secret payload serialized to clients.
- **2.2:** Isolated test bootstrap and loopback-only Mongo identity guard; rejects production indicators, real keys and live adapter selection before executing a test (`scripts/test-bootstrap.mjs`).
- **2.3:** Node-native isolated test runner, synthetic clock/store, adversarial unit/integration tests, plus explicitly blocked Vitest, Playwright, axe and Lighthouse reference configurations until dependencies can be installed and audited.
- **2.4:** Exact-origin and host checks, Fetch Metadata/CSRF enforcement, content type/method/body-size limits, default-deny credentialed CORS (`src/server/http/ingress.ts`).
- **2.5:** Cryptographic one-time tokens, verifier hashes, constant-time checks and a rotation procedure. No actual OAuth/session credentials are enabled yet.
- **2.6:** Allowlisted structured logging with privacy-safe fields, server-generated request IDs and a safe sink-failure fallback (`src/server/observability/logger.ts`).
- **2.7:** Typed, idempotent **security audit port** with a scoped synthetic fake; *real durable Mongo storage is deferred to Issue 3*, so privileged actions remain disabled.
- **2.8:** Fork-safe read-only workflow with full-SHA pinned Actions, locked install, zero provider keys, test/lock/secret/license/CI checks, npm dependency advisory gate.
- **2.9:** Strict CSP, randomized nonce, no-store private response profile, no HSTS includeSubDomains until verified live-host evidence. Browser CSP testing remains blocked.
- **2.10:** PR and release checklists, static malicious-workflow dry-run, issue-to-test traceability and explicit **NO-GO** gates.

## Local use (Node.js 22.16.0 + npm 10.9.2)

```sh
npm ci --ignore-scripts
npm run verify:issue2
npm run typecheck
npm run lint
npm run build
```

For a local-only placeholder UI, copy `.env.example` to ignored `.env.local` (in PowerShell: `Copy-Item .env.example .env.local`), then run `npm run dev` and visit `http://localhost:3000`. Test commands invoke a preflight and set a random `gildedin_test_*` namespace; no cloud account or production data is required. You can run unit/integration tests **without npm install** in Node.js 22.16+ using `npm test`.

Use `engineering/issue-2-setup.md` for detailed instructions, and `engineering/evidence/issue-2-report.md` + `issue-2-status.json` for recorded PASS/BLOCKED/INCONCLUSIVE outcomes. `npm run test:browser`, `test:accessibility` and `test:performance` deliberately report `BLOCKED` until the required packages and browsers can be installed in a reviewed lockfile.

## Trust and deployment status

**NOT ready for launch.** No production host/provider connection, real OAuth, Mongo transaction proof, wildcard DNS/TLS, media store, paid service or billable feature has been enabled. External provider, browser and GitHub branch enforcement evidence remains blocked. Do not equate a green isolated test run with production security or accessibility proof.

No `.env`, OAuth tokens, private prototype media, real personal profile assets or font binaries are included. The ZIP is source and tests only, not a ZIP of `node_modules`. The selected project's open-source license is still an ADR-031 decision, not a granted license file.
