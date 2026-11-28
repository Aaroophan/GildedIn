# GildedIn — Issue 4 implementation candidate

GildedIn is the spec-driven Next.js/TypeScript modular-monolith portfolio platform. This archive **preserves Issues 1–3** and adds the code, infrastructure boundaries, HTTP routes and synthetic security tests for **Issue 4 — Google/GitHub authentication, session security and account controls**. It includes the 12 authoritative specifications and `13-implementation-plan.md` under `docs/specifications/`.

**Important:** This is **not** a verified login deployment or ready-to-publish SaaS. The official `next-auth` and `mongodb` packages are **not installed or added to the lockfile in this environment**, so the Next.js app cannot yet build/run its new OAuth routes. The documented `npm run deps:identity` step must be performed on a connected, trusted workstation followed by typecheck, full build and actual database/provider/browser tests. No paid services or production connections were configured.

## Issue 4 implementation

- Stable Google OIDC `sub` and authenticated GitHub numeric-ID identity, with **no email-based account merging** and no broad GitHub repository scope.
- Short-lived Auth.js provider-verification handshake; single-use, CSRF-bound exchange to a separate `__Host-` cookie backed by a revocable MongoDB session/verifier hash. Security-generation revocation, idle/absolute timeouts, audit records and host-only cookies.
- Complete same-origin account API surface: `GET/PATCH /api/v1/accounts/me`, linked-provider summaries, CSRF, session completion, revoke-current/revoke-all and provider link/unlink. Account UI has a minimal sign-in, completion and protected dashboard/security controls; full onboarding/dashboard UX remains in Issue 9.
- Provider linking uses an explicit session/account/provider-bound five-minute intent and a **new verified provider OAuth callback**. Unlink requires fresh authentication via the provider that will remain, preventing simultaneous removal of all usable linked methods.
- Offline operator-only administrator bootstrap with verified provider subject, specific approval and mandatory transactional audit; no first-user admin grant, public admin mutation or unverified email recovery.
- Hard origin/Fetch Metadata/CSRF checks inside route handlers and Server Actions. All app actions are denied on untrusted/sibling tenant hostnames. Protected pages remain no-store; public drafts/previews and editing remain off.
- New restricted MongoDB `authLinkIntents` and `authOAuthExchanges` journals, unique indexes, BSON validators and synthetic rollback/concurrency tests. No production identity data or OAuth tokens in test fixtures.

## Commands

From project root on a trusted, connected developer workstation (Node >=22.16):

```bash
# First install and review the real adapter dependencies; this updates package.json + package-lock.json
npm run deps:identity
npm ci --ignore-scripts
npm run verify:issue4:offline
npm run typecheck
npm run build
```

The **dependency-free, isolated** check suite also runs without real OAuth/DB connections:

```bash
npm test
npm run check:boundaries
npm run check:secrets
npm run check:ci
```

Run `npm run db:prove-local` only against its **randomly generated, disposable loopback MongoDB test database**, after the real driver is installed. Test bootstrap refuses production settings. See [Issue 4 setup](engineering/issue-4-setup.md), [identity security boundaries](engineering/identity/security-boundaries.md), [evidence](engineering/evidence/issue-4-report.md) and [status register](engineering/evidence/issue-4-status.json) for the exact code/verification/blocked matrix.

**Release status: NO-GO.** Actual MongoDB transactions, Auth.js v5/Next.js 16 package compatibility, Google/GitHub callbacks, live session cookie/browser behavior, environment/DNS/TLS, production zero-charge eligibility and full build remain unverified. The original `.env`, personal prototype media, production files and credentials were excluded. Licensing ADR-031 is still pending.
