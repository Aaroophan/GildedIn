# Issue 2 local developer and verification guide

Only synthetic accounts/data are authorized. No production cloud project, production OAuth application, real contact records, personal CV material or payment card belongs in tests.

1. Install Node 22.16.0 and npm 10.9.2. Do not raise dependency versions without reviewing lockfile advisories and ADR/requirements impact.
2. Run `npm ci --ignore-scripts`, then `npm run check:supply-chain` and `npm run check:secrets`.
3. Copy `.env.example` to ignored `.env.local` (PowerShell: `Copy-Item .env.example .env.local`). Keep all optional providers OFF; only use local Mongo when required by a future integration suite.
4. Run `npm run verify:issue2`, `npm run typecheck`, `npm run lint`, `npm run build`. Check verified results in `engineering/evidence/issue-2-report.md`.
5. Run `npm run dev`, open `http://localhost:3000`. Sign-in, owner/draft, portfolio routes remain 404/503 until subsequent issues. An unknown or tenant `Host` is denied. Production deployment is not authorized.

## Testing rules

`npm test`, `npm run test:unit`, and `npm run test:integration` always invoke `scripts/test-bootstrap.mjs` first. The script only uses `APP_ENV=test` and a random `gildedin_test_*` namespace; any caller-supplied production `APP_ENV`, nonloopback Mongo URI, provider key, production marker, or unsafe feature flag halts execution before network adapters are imported. For a local Mongo test, supply `MONGODB_URI=mongodb://127.0.0.1:27017/gildedin_test_12345678` with an identical `MONGODB_DB`; no production URI is valid. No destructive cleanup operates against an external database. Fakes are in `src/testing/fakes.ts`.

`npm run test:browser`, `npm run test:accessibility`, and `npm run test:performance` deliberately report **BLOCKED** until a reviewed lockfile includes official Playwright, axe and Lighthouse CI packages. Stubs, mocks, Node unit tests and an optional screenshot cannot substitute for required real browser/assistive evidence. Toolchain adoption must be registered as a reviewed dependency change, with immutable versions and lockfile, then executed using only synthetic data. The browser and Vitest reference configurations in `engineering/test-runner-references/` are design contracts, not falsely activated CI suites.

## CI restrictions and honest governance

`.github/workflows/verify.yml` is a read-only `pull_request` / `push` workflow using SHA-pinned checkout/setup-node actions, no secrets, `npm ci`, source checks, tests, typecheck, lint, build and runtime dependency audit. A green job verifies only the executed code on the current commit; it cannot demonstrate actual Google/GitHub OAuth, wildcard TLS, CDN invalidation, Vercel Hobby eligibility, storage hard stops, accessibility across devices or guaranteed log retention. The workflow has **not** been run on GitHub from this offline environment. `main` branch protection, required checks, review permissions and protected production environment must be configured by an authorized repository maintainer; presence of the YAML is not enforcement.

Security response header profiles are in `src/server/http/headers.ts`, forwarded through `src/proxy.ts`. Nonce-based CSP must undergo actual Next.js, Safari/Firefox/Chromium and Browser axe testing; Next development hot reloading is not proof of production-compatible strict CSP. Owner/callback APIs still deny by design. HSTS, especially `includeSubDomains`, remains unconfigured pending DNS/TLS proof.

Security audit is represented as an atomic `SecurityAuditStore` port and deterministic fake, not a durable Mongo adapter. Issue 3 owns concrete persistence, atomicity and read-scoped retrieval; until then privileged operations must not be activated. Database auditing/logging deliberately never stores raw AI text, contact bodies, cookies or tokens. See source 09.
