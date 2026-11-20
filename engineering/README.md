# GildedIn engineering handoff

Start with the canonical twelve docs and `docs/specifications/13-implementation-plan.md`, followed by the [Issue 1 walkthrough](issue-1-walkthrough.md) and [Issue 2 setup](issue-2-setup.md). For the current work, read [Issue 3 setup](issue-3-setup.md) and the three records under [persistence](persistence/): `collection-ownership.md`, `consistency.md`, and `migration-and-proofs.md`.

The original [architecture](architecture.md), [prototype audit](prototype-audit.md), [verification matrix](verification-matrix.md), [decision/change control](decisions/change-control.md), [spec conflicts](decisions/spec-conflicts.md) and [feasibility gates](registers/feasibility-gates.json) remain authoritative. Issue 3's exact evidence is [issue-3-report.md](evidence/issue-3-report.md) and [issue-3-status.json](evidence/issue-3-status.json).

`PASS` for synthetic/local checks **is not** `PASS` for an external MongoDB tier, host, credentials, TLS, or publishing safety. A required `BLOCKED` or `NOT RUN` gate remains a NO-GO. No production environment or deployment is authorized by this package.
