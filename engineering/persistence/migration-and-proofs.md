# Issue 3 — migration, local proof and rollback gates

## Installation and local verification

Run `npm ci --ignore-scripts` after package installation is available, then `npm run verify:issue3` and `npm run typecheck:persistence`. A full `npm run build` remains required. These commands exercise pure/domain and deterministic synthetic repository contracts without any Mongo socket. `npm run db:prove-local` **requires** a separately reviewed official MongoDB Node driver (`mongodb`), installed with its exact version frozen into `package-lock.json`, and a loopback local MongoDB instance. The official driver was not downloadable in this execution environment; the script exits `BLOCKED` before connecting if absent. The runtime adapter is the structural `MongoDatabase` interface compatible with the official driver's Db/Collection semantics; no custom wire client or unreviewed HTTP database proxy was invented.

`db:prove-local` first validates a randomly generated `gildedin_test_<random>` database name and loopback-only URI with no credentials or provider feature flags. It then connects, installs collection schemas and indexes, checks unique account/slug ownership, single-document CAS, simulated tenant lookup, and populates 100 (or `--samples=500`) synthetic accounts for a **local-only** size and indexed-query measurement. It attempts a Mongo multi-document transaction and marks lack of capability BLOCKED rather than assuming Free tier support. Its cleanup may remove **only** the uniquely generated local synthetic database. Do not point it at an Atlas project, preview host or real user data.

## Additive schema migration rehearsal

1. Review and checksum the current 19-collection manifest, exact unique/TTL index names, and owner/tenant predicates against source 05.
2. In a disposable local DB, run the explicit migration command, never automatic production startup migrations. Verify that `collMod` and index additions are supported and inspect failures without `bypassDocumentValidation`.
3. Test older **supported** `schemaVersion`s against registered decoders; this new code has only v1, therefore v0/legacy and future schema versions are intentionally quarantined/blocked. Do not silently default permission fields or reinterpret prototype documents.
4. Migrate additively first: new optional fields/indexes, dual-read support, then one validated backfill of disposable data. Breaking changes require ADR and compatibility fixtures. Retained immutable releases must remain byte-identical and renderable through a previously compatible compiler, or require explicit restore into new draft + publish.
5. Rehearse rollback using an older compatible runtime against the new schema and last three synthetic releases. Index rollback must preserve current and historical slug uniqueness. Never delete `activeReleaseId`, overwrite release payloads, or drop collections as an emergency schema rollback.
6. Before any production use: prove Atlas tier support, exact database privilege/network posture, transaction behavior if auditing relies on it, query/index storage, and zero-charge provider eligibility under Issues 19–20. **NO-GO** while any mandatory proof is BLOCKED.

No independent disaster recovery or paid database infrastructure is assumed. Any rollback claim applies only to the local rehearsal, not a guarantee of recoverability during a real provider outage.
