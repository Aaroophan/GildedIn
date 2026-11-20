# Issue 1.7 — Decisions, exceptions and controlled change

## Authority order

1. Applicable law and binding provider terms.
2. Product-fixed requirements and limits in [02](../../docs/specifications/02-requirements-and-scope.md).
3. Security/privacy requirements in [07](../../docs/specifications/07-security-design.md).
4. Data, API, storage and UX contracts in [05](../../docs/specifications/05-data-model.md), [06](../../docs/specifications/06-api-design.md), [08](../../docs/specifications/08-storage-and-sync-strategy.md) and [03](../../docs/specifications/03-ui-ux.md).
5. Decisions and accepted risks in [12](../../docs/specifications/12-architecture-decision-record.md).
6. Package versions, repository structure and optional tooling.

The 36 unchanged source ADR statuses are machine-registered in [`../registers/architecture-decisions.json`](../registers/architecture-decisions.json). `Baseline` describes a selected architectural decision, **not** an implemented or verified feature. `Conditional` and `Pending` cannot be silently marked complete. `Accepted risk` is not a high-risk security waiver.

## Decision record template

```text
CHANGE-ID: CHANGE-YYYY-NNN
Affected source sections: precise file/section references
Decision authority: product owner (product limits), maintainer (replaceable tools), legal/rights owner where applicable
Requirement IDs / ADR IDs / threats: ...
Current condition / proposed change: ...
Alternatives and rejected options: ...
Security, privacy, operations and migration consequences: ...
Positive / negative / failure tests: ...
Provider/license evidence: PASS / FAIL / BLOCKED / NOT RUN
Status: proposed / approved / rejected / superseded
Review date + evidence reference (no fabricated sign-off): ...
```

A **SPEC-CONFLICT** record is required when normative documents disagree. Record both concrete source locations, explain the impact, and block implementation of the affected wire behavior until the contract is approved. Changing tests to fit an unapproved implementation is prohibited.

### Negative example (must be blocked)

A proposed deployment that enables usage-billed media overflow or copies unlicensed Windows fonts into the source tree contradicts product-fixed $0 and asset rights restrictions. A successful build or developer preference is **not** sufficient approval. The relevant gate remains `BLOCKED` and the dependent capability remains disabled.

### Harmless example (may proceed under technical review)

Updating a patch release of a pure internal utility without changing serialization, identity, domain import boundaries, security posture, licensing or API behavior does not automatically require a new ADR. It still requires ordinary tests and dependency review. Changes with impact on versioned release formats, tenant ownership, provider eligibility, CDN behavior or stored data require a recorded ADR/exception.

### Open decisions

- `ADR-011`, `ADR-015`, `ADR-017`, `ADR-023`, `ADR-025`, `ADR-035` remain **Conditional**.
- `ADR-031` (MIT source license) is **Pending** until ownership, original media, dependencies and font rights are reviewed. Do not add a misleading license file now.
- `ADR-021` (no independently guaranteed backup) is an **Accepted risk** requiring accurate user disclosure, not a backup implementation.
- Draft HTTP concurrency distinction is tracked in [`spec-conflicts.md`](spec-conflicts.md).
