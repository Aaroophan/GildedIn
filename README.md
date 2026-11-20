# GildedIn

**GildedIn** is the new open-source, specification-led multi-user portfolio publishing platform. The older GildedIn source is a historical visual prototype, not a trusted implementation baseline. This ZIP preserves the Issue 1 architectural foundation and the Issue 2 security/test foundation, and implements the **Issue 3 — MongoDB persistence model and tenant-safe domain repositories** code.

The 12 authoritative specifications and latest implementation plan are bundled under `docs/specifications/` as `01`–`13`. The product is **not** a running portfolio SaaS yet: OAuth, real users, public publishing, media ingestion, live AI, and production hosting remain disabled until their assigned issues.

## Implemented in Issue 3

- **3.1:** Fixed, reviewed inventory of 19 MongoDB namespaces; domain records and owned ports. Owner-created content collections remain embedded in one bounded draft, never new Mongo collections.
- **3.2:** Unique indexes for stable provider subjects, one portfolio/account, current and historical slug claims, releases, operation keys, sessions and quotas. Alias-history uniqueness does not depend on `kind=current`.
- **3.3:** Strict version-1 runtime decoders for account, portfolio, draft, release, media, AI, moderation, contact and analytics records, plus server-owned collection `$jsonSchema` validators. Unsupported/unsafe stored shapes fail closed; prototype schema versions are not silently migrated.
- **3.4:** `MongoTenantRepository` verifies the account/portfolio relationship for every private read/write, and never accepts browser-supplied Mongo filters, projections or arbitrary collection names.
- **3.5:** Authoritative live policy CAS with security version; fail-closed public release resolution with independent moderation lookup, even when immutable content is cached elsewhere.
- **3.6:** One-document draft snapshot compare-and-swap with revision, mutation fingerprint, loss-of-acknowledgment replay and explicit conflicts for stale/foreign/mass-assignment requests.
- **3.7:** Write-once prepared releases and scoped idempotent publishing journal; activation is a conditional atomic update to a single portfolio document, with last-operation recovery and a separate propagation stage.
- **3.8:** Media records, global physical + per-portfolio quota admission in one atomic revisioned document, per-upload reservation journal, conservative cleanup and no premature TTL deletion of unresolved reservations.
- **3.9:** Read-time TTL filtering on the owner-only inbox, bounded aggregate analytics records, release/policy-matched AI contexts and transaction-required security audit storage port.
- **3.10:** Local MongoDB proof script and additive-migration/rollback policy, including isolated 100/500-sample query measurement and tier-capability gates. **Actual MongoDB instance and driver proof is BLOCKED** in this environment; do not infer live tier guarantees from synthetic tests.

The implementation resides in `src/domain/persistence` and `src/infrastructure/mongodb`, with deterministic fake-driver tests in `tests/integration` and `src/testing/mongo-fake.ts`. There are **no public database endpoints**; original private dashboards and API routes remain deny-by-default until Issues 4–5 provide verified authentication and host routing.

## Local execution and validation

Requires Node.js >=22.16.0, npm 10.9.x. With installed npm packages:

```bash
npm ci --ignore-scripts
npm run verify:issue3
npm run typecheck:persistence
npm run typecheck
npm run build
```

Without npm packages, `npm test` and several dependency-free checks can run on Node.js 22.16+. The isolated test runner automatically generates a random safe `gildedin_test_*` namespace and refuses production indicators or provider keys. **Never use production credentials or customer data for these tests.**

Optional **actual local MongoDB** verification requires a separately installed and lockfile-reviewed official MongoDB Node driver plus a localhost MongoDB server:

```bash
npm run db:prove-local
npm run db:prove-local -- --samples=500
```

`db:prove-local` refuses preconfigured database credentials and production settings, generates a fresh disposable loopback database, applies fixed schema/index migrations, verifies uniqueness/CAS and takes local-only size/query measurements. It cleans up only the fresh generated synthetic database. This script is **not** a means to connect to Atlas Free or to claim production readiness; see `engineering/issue-3-setup.md` and `engineering/persistence/migration-and-proofs.md`.

## Verification and release status

`engineering/evidence/issue-3-report.md` is the source for exact local results, what was blocked, and remaining production gates. Review `engineering/evidence/issue-3-status.json` for 3.1–3.10 requirement/test traceability. A green deterministic test suite does **not** prove real MongoDB wire behavior, server-side transactions, Atlas pricing/eligibility, wildcard DNS, CDN revocation, runtime build, browser accessibility or backups. **Production: NO-GO.**

This archive contains no populated `.env`, real identity credentials, prototype media, personal photographs, production dataset, `node_modules` or unlicensed font files. `ADR-031` licensing is still a pending ownership decision; the absence of a LICENSE file is intentional, not permission to claim a chosen license.
