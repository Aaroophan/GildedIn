# Issue 3 — concurrency, policy and bounded failure protocol

**Sources:** `05-data-model.md` §§8–9, 13–15, 21, 23; `07-security-design.md` §§8, 16–17; `08-storage-and-sync-strategy.md` §§5–9, 16, 22; `12-architecture-decision-record.md` ADR-003, -005, -029, -032. This document describes the code that exists, not future successful cloud evidence.

## 1. Domain and schema versions

Stored version `schemaVersion:1` is the first new GildedIn implementation format. Legacy/prototype documents are **not** silently migrated. Unsupported versions or unexpected control-plane keys fail with `PERSISTED_RECORD_REJECTED`; no `eval`, Mongo operators or externally supplied collection names are accepted. Mongo `$jsonSchema` validators are installed by a separately approved migration command; runtime parsers enforce additional business limits and output allowlists. User-authored section/field schemas are *not* elevated to Mongo collection definitions.

## 2. Draft compare-and-swap and replay

The draft is one owned document, not a collection of unrelated content writes. `compareAndSave` validates the full bounded snapshot and expected revision; a single Mongo `findOneAndUpdate({portfolioId,revision:expected}, {$set:next}, {returnDocument:'after'})` commits it. The account's portfolio ownership is checked before the read/write and owner IDs are server-derived. Two writers using revision 0 cannot both commit. A retry with the last matching `draftMutationId` and content fingerprint returns the acknowledged revision, without incrementing again. A reused mutation ID with different content conflicts. If a newer write already displaced the previous mutation ID, a retry reports conflict rather than claiming an unprovable prior success. The API must resolve ADR-032's 409 domain-versus-412 `If-Match` contract before exposing this as an endpoint.

## 3. Immutable publication

A release is inserted only by the prepared-release repository, never `updateOne`-patched. Its SHA-256 of canonical serialized public payload and exact UTF-8 byte count are checked before storing or returning. The release is **not public** until `portfolios.activeReleaseId` is atomically updated with predicates on owner, active status, prior pointer, security version and publish sequence. `lastActivatedOperationId` makes a lost-ACK retry recoverable without another activation. Journal repairs after the pointer commit cannot revoke the successful pointer. The unique `(portfolioId, sequence)` index makes competing preparations for the same sequence conservative conflicts. A stranded prepared release may temporarily BLOCK an unrelated publish until an explicit, reviewed reconciler resolves it; no silent overwrite or public exposure is authorized. Full journal lifecycle/recovery/3-retained-releases GC belongs to Issue 13.

## 4. Current policy wins over caches

Every public release read reloads the live portfolio control and current moderator restrictions, then fetches the exact active release by `(portfolioId,releaseId)`. No draft fallback, cache-as-permission, moderation-stale success, or subdomain-supplied authorization is permitted. Unlisted is link-accessible; owner-disabled, suspended, deleting and unpublished are denied. Until the Issue 14 renderer can apply item-level suppression to every dependent artifact, the reader conservatively denies the whole release when a matching live public restriction exists. AI context storage is independently release+approval-version keyed and is not activated by releasing a portfolio.

## 5. No-overage original media admissions

**Explicit design refinement:** use `quotaBuckets` with *one* authoritative `global:media` document holding global physical bytes, per-portfolio original bytes/counts and active per-upload leases. Its single-document revision CAS is the **only** admission decision; there is no unsafe second independent admission counter. This serializes admission for the initial 100–500-portfolio planning scale and may require profiling/change review before increased scale. Both global physical (including anticipated variants) and owner quotas must have room; the global hard stop wins. `uploadReservations` is a secondary journal, never authority to issue capabilities by itself.

A crash after quota CAS but before journal insert **retains** capacity and blocks new uploads until the same reservation ID repairs its journal or an expiry reconciliation proves staged-object cleanup. No verification of cleanup means no release of capacity. Original upload finalization must receive verified physical/original bytes from the later media processor, never simply trust the visitor's declared size. Finalize is idempotent with a persisted terminal journal, and committed originals cannot be released through an abandoned-upload path. The terminal journal gets `purgeAfter` only after resolution, unlike dangerous TTL on `expiresAt`. Thus TTL cannot silently free capacity for an object still in storage. No actual object store exists in this issue; Issue 12 must prove normalization, cleanup and capacity overhead against a real no-overage provider.

## 6. Audit and transactions

A durable `MongoDurableAuditStore` is provided through the Issue 2 port. It **refuses to execute audited mutations** without a transaction runner. Business code and the audit insert must use the **same Mongo driver session** in an all-or-nothing transaction. A synthetic rollback probe covers audit-insert failures, but **MongoDB Free tier transaction support and the real driver session wiring remain unverified**. Do not pass a commit callback that performs external effects or writes outside the transaction; that would void the guarantee. If the approved tier does not provide needed transactions, implement a reviewed, domain-specific journal/reconciliation strategy before enabling security-changing operations. Ordinary runtime logging does not substitute for this audit.

## 7. Time-based privacy

Session, contact and audit TTL fields are BSON Dates. Every read checks current expiry in the query **and again after decoding**. Contact expires within 30 days; its private body is never part of analytics, public releases, AI contexts or logs. Analytics records are fixed low-cardinality daily buckets. TTL deletion is explicitly eventual; `expiresAt <= now` denies regardless of whether MongoDB's background TTL thread has run.
