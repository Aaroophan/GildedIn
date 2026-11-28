# GildedIn Issue 8 - development and verification setup

**Purpose:** Bring the source-03 dark/navy/blue design language into one reusable design-token system, accessible UI building blocks, technical-corner decoration and a progressive, *optional* cinematic layer. Source specs 01-12 and `13-implementation-plan.md` remain normative. **Not a production-ready launch.**

## Start on a workstation

From the extracted `GildedIn/` folder:

```bash
npm run verify:issue8:offline
```

This requires a compatible Node 22 and global/local `tsc`. Offline mode covers deterministic unit/security/synthetic-integration tests, the architecture, inventory and CI checks, the strict design domain and basic source visual-contract assertions. It deliberately does *not* pretend to verify a Next.js page build, browser focus or GPU.

On a trusted internet-connected development machine, install the reviewed dependencies and regenerate the lockfile:

```bash
npm run deps:identity
npm run deps:visual
npm ci
npm run typecheck:content
npm run typecheck
npm run build
npm run test:browser
npm run test:accessibility
npm run test:performance
```

`deps:visual` chooses **candidate** exact packages `animejs@4.5.0`, `three@0.187.0`, and `@types/three@0.187.0`, which were not installed/verified in this offline handoff. `deps:identity` is the previous milestone's candidate OAuth/database installation, also unverified here. Review new packages and lockfile before committing; compatibility and vulnerabilities must be proven against the actual machine. Browser test commands currently run *prerequisite checks*, not a successful Playwright/Lighthouse run. They are release blockers until real browser suites exist and pass.

## Try the design without private data

Open `engineering/visual-fixtures/issue8-static.html` and `issue8-light.html` in a supported local browser. They use synthetic headings and descriptions and link `src/app/globals.css` directly. Compare at 320, 375, 768, 1024 and 1440 CSS px, 200%/400% zoom, keyboard navigation, high contrast and reduced motion. **Opening the files is a manual exploratory review**, not a substitute for real SSR, hydration or Lighthouse results. The isolated Chromium binary in the preparation environment failed to render a screenshot; no screenshot is claimed.

The Next.js homepage (`src/app/(platform)/page.tsx`) is explicitly labelled an **implementation preview**. Theme selection and visitor visual-effect intensity use browser-local storage. The HTML heading and text are rendered before any effect; optional WebGL never owns navigation or form actions. The platform appearance preference does not mutate a portfolio's theme.

## Owner theme API

For an eligible authenticated owner on the approved account apex:

- `GET /api/v1/portfolios/{portfolioId}/draft/theme` returns only their current theme, revision and color contrast inspection. No-store.
- `PUT` to the same path requires exact Origin, CSRF header, `If-Match: "rev-N"`, `X-Client-Mutation-Id` and a complete validated theme v1 object. It writes within the existing scoped draft revision CAS; no release pointer can be changed by the endpoint.
- Unknown CSS/colors/component keys, unsafe font selectors, stale versions, foreign portfolio IDs and expired sessions are denied; server-owned account IDs and raw Mongo filters are never accepted.

See [design security contracts](design/contracts.md), [evidence](evidence/issue-8-report.md) and [machine-readable statuses](evidence/issue-8-status.json).

## Required manual and connected proof (not yet passed)

Check real font licensing and actual font loading; 3D bundle split and WebGL/no-WebGL/context-loss; React Strict Mode remount and event cleanup; responsive/zoom overlap/overflow; forced-colors and focus contrast; dialog/trap/return focus; non-JS text; reduced-motion and user-Off CSS; real browser CSP with external libraries; accurate compressed transfer size and performance budgets (Lighthouse >=90 where required). Re-run authentic OAuth/session/CSRF, real MongoDB replica-set transaction, DNS/TLS and release-only scene sourcing gates from previous issues. Do not promote to production while any security or provider proof is blocked.

The user-uploaded `.env` and personal prototype images were excluded from the delivered source ZIP. No production accounts, payments, provider tokens or customer information were used.
