# GildedIn — Issue 5 implementation candidate

This is the **full GildedIn source project**, preserving the Issue 1–4 foundations and implementing the **Issue 5 domain and route layer**: authenticated portfolio creation, permanent slug claims, historical alias redirects, strict host resolution, live publication/moderation checks, and owner-only controls. The 12 authoritative specifications plus the implementation plan remain in `docs/specifications/`.

**Release status: NO-GO.** The baseline ZIP did not have the official `next-auth` and `mongodb` packages installed or locked; real Next.js runtime, Google/GitHub callbacks, local Mongo replica-set transactions, wildcard DNS/TLS and browser-host cookie proofs could not be run here. No production host, media service or OAuth registration is activated. All optional features and wildcard subdomain routing default to off. In particular this archive is a source implementation, **not a proven working SaaS or live login application**.

## Issue 5 behavior

- One **authenticated, active account** can create one unpublished portfolio, one **globally unique** normalized ASCII slug, and one private **Hero draft**, atomically with a durable audit entry; `Idempotency-Key` replay cannot create a second draft. Collisions are enforced by unique-index declarations (real index installation requires live verification).
- Renaming is transactional: the old name stays permanently claimed as an alias and redirects (308) to the current canonical apex path, including a validated detail suffix. A separate `renameOperations` journal covers replay and recovery without releasing historical names.
- Owner `GET /api/v1/portfolios`, `GET /api/v1/portfolios/:portfolioId`, `GET /api/v1/portfolios/slug-availability?slug=…`, `POST /api/v1/portfolios`, and named rename/visibility/disable/enable commands are **apex-only**. All mutations demand exact Origin, session-bound CSRF, live account/session checks, and, for policy changes, an `If-Match` security version. The advisory slug check never substitutes for the actual unique insert.
- Visibility `public`/`unlisted` may be selected **before or after** publication; unlisted is still accessible by direct link once a release exists, but absent from the directory. Disable works before publication and returns to onboarding when re-enabled without a release; admin moderation cannot be overridden.
- Apex `/{slug}` and verified tenant hostname `{slug}.aaroophan.dev` share one repository-based live policy+release gate. Public detail path grammar covers `/projects`, `/projects/{projectSlug}`, `/experience`, `/references`. Authoritative policy, owner account status, current release pointer, moderation and route manifest are checked independently of caches. Unknown, suspended or disabled tenants get no release. The public page is intentionally only a **safe metadata/routing shell**, since the full renderer belongs to Issues 7/13/14.
- Wildcard routing remains disabled until **all three** gates are true: `APP_ENV=production`, `APP_WILDCARD_ENABLED=true`, and `APP_WILDCARD_TLS_VERIFIED=true`. `_tenant` is an internal rewritten route whose Next file-system folder is encoded `%5Ftenant`; direct apex entry is denied. Real Next routing must still be proven after dependencies are installed.
- The obsolete unaudited `MongoTenantRepository.comparePolicy` write path now **fails closed**. Only `MongoTenancyRepository.changePolicy`, with atomic audit persistence, can mutate current policy.

## Verify

```bash
# Offline, dependency-free policy, domain, and synthetic multi-tenant checks
npm run verify:issue5:offline

# On a trusted connected workstation, install and review official dependencies.
# This changes package.json and the package lock; do not pretend they are currently installed.
npm run deps:identity
npm ci --ignore-scripts
npm run typecheck:tenancy
npm run typecheck
npm run build

# OPTIONAL: only a disposable local loopback transaction-capable MongoDB replica set
# with all provider, production and database env variables UNSET
npm run db:prove-issue5-local
```

Synthetic Node tests check concurrent owner/slug claims, rename alias permanence, typed conflicts, audit failure rollback, session revocation, malicious hostnames, public/hidden transitions, stale policy, and constrained directory projection. They **cannot verify** real Mongo transaction or App Router/host rewrites. For precise status and blocked gates, see [Issue 5 setup](engineering/issue-5-setup.md), [host and policy design](engineering/tenancy/host-and-policy.md), [test evidence](engineering/evidence/issue-5-report.md), and [per-subissue status](engineering/evidence/issue-5-status.json).

The original `.env` and prototype personal media are not included. Licensing ADR-031, no-spend eligibility, real trusted-edge host configuration and current deployment gates remain pending.
