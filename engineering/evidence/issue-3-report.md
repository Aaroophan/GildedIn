# Issue 3 — implementation and evidence report

**Date:** 2026-11-20. **Source:** `13-implementation-plan.md` Issue 3.1–3.10 and the twelve GildedIn specifications. **Release:** NO-GO; no provider, billing account, production data or deployment was accessed. Implementation files and `issue-3-status.json` map each sub-issue to tests, threats and blockers.

## Executed local proofs

- `npm run verify:issue3` — **PASS**, **92 synthetic tests, 0 failures** (Issue 1/2 regressions included); requirements/ADR inventory, import boundaries, secret scanner, lockfile/supply chain/license inventory, and static CI policy checks pass; pure-domain TypeScript check passes.
- `tsc --noEmit -p tsconfig.persistence.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/node_modules/@types` — **PASS** with temporary access to a globally installed `@types/node`. This validates new Mongo persistence contracts but is **not** equivalent to the full Next.js build.
- `node --experimental-strip-types scripts/prove-mongodb-local.mjs` — **BLOCKED (exit 2)** *before any DB connection*, as the official MongoDB Node driver is absent. No production network connection or real MongoDB operation was attempted.
- `npm run check:ci` — PASS on the restored fork-safe `.github/workflows/verify.yml` (the uploaded ZIP lacked this Issue 2 workflow; now restored).

## Tested failure and authorization behavior

Two synthetic tenants: owner-only draft/portfolio/media/release reads; impossible cross-owner writes; missing/forged host proof; unique provider subject and historic slug constraint; a conflicting draft write and replay of a lost acknowledgment; unsupported stored schema version and hostile field names; owner status/security-version CAS; prepared release hidden before pointer activation, idempotent activation, stale/replayed operation; live moderation denial and fail-closed unavailable policy; ten simultaneous upload reservations under a restrictive global physical budget with no overspend; failed journal insert conservatively consuming reserved capacity, then verified-expiry reconciliation; no accidental release of committed media; timing-safe session verifier and current account security version; expired contact denied before Mongo TTL deletion; aggregate analytics scoped to owner; AI context invalidation on policy changes; required audit transaction missing and synthetic audit-write rollback with unauthorized read denial.

**Not falsely claimed:** Fake database methods model Mongo's documented single-document operations, but are not a replica set, Atlas Free cluster, real BSON wire driver, provider proof, CDNs, browser tests or a crash/restart of an actual Mongo daemon.

## Mandatory unverified evidence / remaining issue boundaries

1. **Official driver/lockfile and real Mongo:** the project doesn't install or connect the official `mongodb` driver in this environment. A narrow Db/Collection adapter is implemented; reviewed driver acquisition/lockfile, actual database connection, collection schema/index installation, unique-key race behavior, conditional writes, physical query/index measurements at 100–500 synthetic portfolios, and rollback rehearsal remain **BLOCKED**. Source 05 §21 and source 11 integration gates apply. The Mongo local proof script is provided for this.
2. **Tier features:** availability and practical limits for multi-document transactions, sessions, change streams and storage/headroom on the selected verified *no-card/no-overage* MongoDB tier are **BLOCKED**. Durable security-changing audit operations stay denied if the transaction runner isn't available. No unknown-tier transaction guarantee is presumed.
3. **Owner/host identity:** Google/GitHub OAuth, real revocable sessions, authenticated account/portfolio commands and verified dual-host routing belong to Issues 4–5. Repository calls are **not** exposed to public API routes until those verified server boundaries exist.
4. **Full compiler/media:** typed content projection (Issue 6), safe composition renderer (Issue 7), draft APIs (Issue 11), actual media ingestion and cleanup (Issue 12), publication operation recovery and three-retained-release pruning (Issue 13), and HTTP public delivery/SEO (Issue 14) are not complete. Prepared orphan reconciliation is deliberately conservative and may block a new publish; it never makes an orphan public. Media cleanup requires verified object deletion before releasing quota. No live storage provider is selected.
5. **Build/browser:** npm registry inaccessible; `npm ci`, full `npm run typecheck`, lint, `npm run build`, real browser/axe/Lighthouse and actual CI fork execution are **BLOCKED/NOT RUN**. The local typecheck used globally available Node types only for the new persistence layer. This is not a release-quality verification of Next.js runtime compatibility.
6. **Infrastructure and release:** external eligibility, DNS/TLS, CDN revocation, zero charge, source/asset/font licensing ADR-031, backups, rate limits and privacy legal review are unresolved; production status remains **NO-GO** (Issues 19–20).

## Important implementation choices and limitations

- New v1 records, no implicit prototype migration; future/old records rejected/quarantined. Additive-migration and release compatibility plan under `engineering/persistence/migration-and-proofs.md`.
- No BSON document exposes a Mongo collection/selector injection surface to callers. `src/infrastructure/mongodb/manifest.ts` is fixed source code, not based on user schemas.
- Contact TTL and audit TTL use BSON Date; unresolved upload reservations do **not** TTL immediately on `expiresAt`; terminal `purgeAfter` applies only after reconciliation. Read-time expiry stays mandatory.
- `quotaBuckets` is deliberately one bounded global admission aggregate with per-portfolio subcounts; single-document CAS avoids falsely claiming atomic multi-document reservations on an unknown free tier. Full provider physical admission/normalization integration belongs to Issue 12.
- Prepared releases are write-once. `lastActivatedOperationId` and pointer CAS support recovery, but a full orphan-journal reconciliation and successful-release retention GC belong to Issue 13. A stranded prepared sequence can block safe progress until reviewed reconciliation; never bypass it by reassigning a release.
- The official v6.x Mongo Node driver documents that `findOneAndUpdate(...,{returnDocument:'after'})` returns the modified document by default without result metadata; this implementation uses that contract. Mongo TTL deletion is asynchronous, so a TTL index is not a privacy access check. Reference: official MongoDB Node driver compound operations and MongoDB TTL docs.

## Verification statuses

See `engineering/evidence/issue-3-status.json` for exact 3.1–3.10 local PASS and blocked real-world outcomes. Every affected P0 requirement or source-11 test that requires actual server/host/provider data remains **BLOCKED or NOT RUN**, not PASS. `SPEC-CONFLICT-001` (draft domain `409` versus HTTP `If-Match` `412`) remains unresolved as already recorded in Issue 1; the repository deliberately does not decide wire status codes.
