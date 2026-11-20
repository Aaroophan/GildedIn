# Specification alignment and source-quality ledger

This file records potential inconsistencies **without silently editing the authoritative source documents**. Each entry lists concrete sources, a proposal, ownership and evidence. Issue 1 contains no draft-save endpoint, so the open HTTP case does not affect the deny-by-default shell.

## SPEC-CONFLICT-001 — 409 domain conflict versus 412 failed `If-Match`

- **Status:** OPEN FOR OWNER/ARCHITECT APPROVAL, blocked for draft write API implementation in Issue 11.
- **Source A:** [02 §3 `EDT-009` and §16.2](../../docs/specifications/02-requirements-and-scope.md) requires a recoverable stale draft domain conflict and identifies HTTP `409`.
- **Source B:** [06 §4.4, §11.2–11.3, §34.1](../../docs/specifications/06-api-design.md) records RFC 9110 conditional `If-Match` failure as `412`; [08 §1.2 and §8.6](../../docs/specifications/08-storage-and-sync-strategy.md) explicitly tracks the choice.
- **Source C:** [12 ADR-032 and §1.2](../../docs/specifications/12-architecture-decision-record.md) requires deliberate reconciliation and OpenAPI/test updates.
- **Proposed (NOT final approval):** `409 DRAFT_CONFLICT` for a domain revision conflict; `412 PRECONDITION_FAILED` for a literal failed HTTP `If-Match` precondition; `428` only where precondition is mandatory and absent. Retain separate stable codes and recovery paths. The pure `DRAFT_CONCURRENCY_STATES` *documents* this provisional distinction; no HTTP draft endpoint is enabled.
- **Approval/evidence owner:** product owner + API maintainer. Update 02/06/08/09/11 acceptance contracts and tests before implementation, or record an approved exception.

## SPEC-QUALITY-002 — Unescaped pipe in source requirements table

- **Status:** DOCUMENTATION QUALITY, non-blocking for current machine register.
- **Source:** [02 §3 `PUB-007`](../../docs/specifications/02-requirements-and-scope.md) uses a literal `|` inside the Markdown requirement cell (`public | unlisted`), creating five apparent columns.
- **Treatment:** The reader script combines the split cells into one preserved requirement, and checks all 97 IDs against the unchanged canonical document. Future documentation edit should escape the pipe and keep requirement text unchanged.
- **Evidence owner:** specification maintainer; see `npm run check:requirements`.

## SPEC-QUALITY-003 — UI cross-reference anchor mismatch

- **Status:** DOCUMENTATION QUALITY, non-blocking, not silently rewritten.
- **Source:** [03 UI/UX](../../docs/specifications/03-ui-ux.md) includes two links to `05-data-model.md#52-composition-model`, which do not match the document's headings.
- **Treatment:** Track for correction through document review; code uses source § references without relying on the broken anchors.
- **Evidence owner:** specification maintainer.

## Clarification — Release payload is exactly 102,400 bytes

- **Status:** SETTLED by higher-authority specification.
- **Source:** [02 §1.1–1.2](../../docs/specifications/02-requirements-and-scope.md) explicitly defines **100 KiB = 102,400 UTF-8 bytes**, resolving older informal decimal `100 KB` terminology.
- **Implementation:** `PRODUCT_LIMITS.publishedReleaseBytes = 102400` and registered `publishedReleaseUtf8Bytes = 102400`. Changing it requires an explicit product-owner-approved ADR. There is no invented unresolved byte-unit decision in this implementation.
