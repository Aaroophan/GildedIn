# Issue 9 — implement and verify owner onboarding, dashboard and settings

**Authority:** the twelve GildedIn specifications under `docs/specifications/` and the unchanged `13-implementation-plan.md`, Issue 9. **Source implementation / local synthetic testing** only; production release remains **NO-GO**.

## Run offline verification

From the ZIP extraction root, on Node >=22.16 and `tsc` present:

```bash
npm run verify:issue9:offline
```

This runs the foundational checks, requirements/ADR inventory, architecture boundaries, secret, supply-chain, licenses, CI, 320 synthetic unit/security/integration tests (288 older, 32 Issue 9), design source checks and pure domain TypeScript. Running `npm test` alone reproduces all 320 tests without production data. The included fake MongoDB runner is transactional but **does not prove** availability on a particular hosted MongoDB tier. Synthetic tests prove that a single action writes the Hero, optional project, slug, portfolio and audit together and that a second owner's IDs cannot read them.

The five TypeScript configurations `tsconfig.domain.json`, `content`, `identity`, `tenancy`, `persistence` were additionally checked here using a preinstalled external `@types/node` type root. The full React/Next.js App Router typecheck and Next build cannot run here: the originally uploaded lockfile does not contain official Auth.js or MongoDB and there is no installed `node_modules`. Do not interpret the offline passing tests as a successful browser journey.

## Routes and manual workflow

Start local dev **after** verified dependency install and safe `.env.example` values (never real production credentials in test mode):

```bash
npm run deps:identity
npm run deps:visual
npm ci
npm run typecheck
npm run build
npm run dev
```

These `deps:*` scripts are prior issue candidate exact version choices; review upstream versions, their licenses and regenerate/review lockfile on a networked trusted workstation. They have **not** been executed in this offline implementation. The existing `npm run test:browser`, `test:accessibility` and `test:performance` scripts are prerequisite guards, not completed real browser suites.

Once signed in via a **verified local Google/GitHub OAuth setup**: open `/dashboard` to see an account with no portfolio; click Create your portfolio, then enter a name, username, professional label, introduction, select one of three preset names, optionally add one private project and review. Submission is idempotent; a confirmed response takes you to the private Hero editor. Save a Hero change and observe a new server draft revision; the public URL must remain inaccessible. Use `/dashboard/account` for account display and linked providers, and `/dashboard/portfolio` to rename/choose public vs unlisted/disable access. The `tools/{tool}` pages honestly describe unavailable features.

At 320, 375, 768, 1024 and 1440 CSS px, 200% and 400% zoom, keyboard, touch, no JavaScript, reduced-motion and forced-colors: inspect heading and focus order, responsive navigation, step errors, button targets, status announcements, recovery semantics and no horizontal scroll. Repeat with expired session, no verified GitHub email, duplicate username, unavailable MongoDB, stale draft revision, disabled/suspended portfolio and another account's portfolio ID. **These are manual/browser verification tasks, not claimed completed.** Check actual browser cookie domain, Origin/CSRF and cached-public-policy behavior on verified hosts.

See [contracts](onboarding/contracts.md), [evidence](evidence/issue-9-report.md), and [machine-readable status](evidence/issue-9-status.json). Keep all twelve authoritative docs and the plan alongside this report.

## Unresolved release prerequisites

1. Auth.js and official MongoDB dependencies installed, locked, typechecked and built with actual Next.js; OAuth Google and GitHub callbacks tested against real provider sandbox configuration.
2. Proven DB tier transactions, indexes, crash recovery, idempotency and real session/CSRF/recent-auth state; cross-tenant negative probes against the actual driver.
3. Playwright/axe screen-reader, keyboard, mobile, no-JS, 200%/400% zoom, failure/retry and slow-network checks; Lighthouse and bundle budget evidence.
4. Privacy notice reviewed for applicable law, retention and training/provider terms; independently confirmed no-charge hosting, DNS/TLS, storage/privacy/cookies and fonts/licenses.
5. Issues 10–18 implemented, including actual publication and private preview. No success is claimed for a public draft link or a fabricated released portfolio.

**Packaging:** uploaded private `.env` omitted without copying contents. Personal/prototype media and runtime/build caches omitted from source delivery. `.env.example` contains placeholders only.
