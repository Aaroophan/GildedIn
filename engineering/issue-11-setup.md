# Issue 11 — autosave, optimistic concurrency and protected preview

**Source of truth:** exact twelve `docs/specifications/01…12` and `13-implementation-plan.md` (all retained unchanged). **Implementation:** local source contracts and synthetic regression tests; **PRODUCTION NO-GO**. This document does not promote a preview, local recovery or saved draft to a public release.

## Owner workflow

1. Sign in using an enabled Google/GitHub identity on the verified apex. From `/dashboard`, open `/dashboard/portfolios/{portfolioId}/editor`. The private canvas starts at the server's saved draft revision, and autosaves changes after **850 ms** idle. **Save now** uses the same typed/CSRF/revision-checked mutation.
2. Read the toolbar state. **Saved · revision N** means the server acknowledged that exact snapshot. **Unsaved local changes**, **Saving**, **Save outcome unknown**, **Revision conflict**, and **Editing access changed** are intentionally different; nothing is published by saving.
3. For a lost response, use **Check save outcome**; the client asks the owner-only receipt endpoint before retrying the identical mutation. For a two-tab edit, inspect the area summary; choose **Discard local work and reload** or explicitly type `REPLACE` to attempt a newly revision-checked whole-workspace update. A forced replacement may lose the other tab's changes; there is no automatic merge.
4. On refresh after a recoverable interruption, choose whether to apply the owner/account/portfolio-scoped **24-hour browser recovery**. It can include private text and must not be treated as a secure backup. Closing a shared browser or signing out clears the recovery where possible. Hero profile editing remains a separate purpose-specific CAS form at `/dashboard/portfolios/{portfolioId}/hero`.
5. After the canvas displays Saved, select **Open protected saved preview**. Use Desktop, Tablet and Mobile selectors, then optionally **Play animation preview**. This only renders the acknowledged owner draft (root route), **not unsaved changes**, is not a public address and will not display an earlier published release if the draft fails.
6. Use **Validate saved draft** to request the server's current blockers/warnings and navigate to a relevant section/node. A green static report does not prove media, browser accessibility or publication approval.

## Offline commands

```bash
npm run verify:issue11:offline
npm run typecheck:domain
```

`verify:issue11:offline` runs the complete existing offline chain and the new `check:autosave-contracts` sentinel. Synthetic unit/integration tests use in-process fake Mongo and synthetic account IDs only, never a live provider or production connection.

After verifying a local dependency install and approved provider configuration, separately attempt:

```bash
npm ci
npm run typecheck
npm run build
npm run db:prove-issue5-local
npm run test:browser
npm run test:accessibility
npm run test:performance
```

**Not executed here / BLOCKED:** the full application dependency tree (`next-auth`, `mongodb`, candidate visual packages), real authenticated Next.js runtime, Mongo tier transaction behavior, browser Playwright/axe/NVDA/VoiceOver and actual CSP/iframe behavior. Browser test scripts in this source baseline are prerequisites checks; passing them alone is **not** a browser test. Do not connect production data or purchase paid services to satisfy them.

## Manual adversarial acceptance plan (not falsely marked passed)

With a trusted, working local app and disposable accounts A and B, open two tabs on account A and one authenticated B tab. Rapidly type/reorder on A, drop an HTTP acknowledgment after commit, inspect receipt and ensure only the exact snapshot becomes Saved. Concurrently submit two identical expected revisions and verify one winner, one retained local conflict, one server revision. Refresh an unsaved tab; check scoped recovery and expiry; sign out in another tab and verify no stale mutation or preview succeeds. Switch to B and verify A's recovery is never offered. Disable/suspend/delete A's portfolio and assert editor, receipt, private preview and writes are denied. Copy a preview iframe URL into an unsigned window and a hostile tenant hostname and confirm denial, no shared cache, no indexing, safe CSP. Check 320/390/767/768/820/1023/1024/1200 viewport widths, 200%/400% text zoom, disabled JS, keyboard/assistive semantics, reduced motion and no WebGL. Attempt invalid media, XSS, wrong tenant binding and release-byte overflow; validate actionable blockers with zero change to active release/publish operations. Record actual HTTP headers, DB writes and screenshots only after tests have truly run.

## Traceability and release blockers

- **Canonical IDs:** `EDT-008`, `EDT-009`, `EDT-010`, `PUB-001`, `SEC-002`, `SEC-004`, `SEC-012`, `TEN-002`, `TEN-009`, `OPS-005`; tests `T-EDT-08`, `T-EDT-09`, `T-EDT-10`, `T-SEC-02`, `T-SEC-04`, `T-SEC-12`, `T-TEN-02`, `T-TEN-09`, `T-PUB-01`, `T-OPS-05`; ADR-005; threats TH-34/35/42.
- **SPEC-CONFLICT-001:** domain 409 versus literal If-Match 412 remains OPEN and requires source-owner approval. The existing content mutation route currently uses 409; the client handles both but no 412 compliance is claimed.
- **Deferred/partial:** only root `/` owner preview supported, Hero profile editor retains manual CAS save, cinematic Three.js does not use raw draft sources, media uploads (Issue 12), immutable publishing (Issue 13) and public delivery (Issue 14) are disabled/not introduced.

See [implementation contracts](editor/autosave-and-preview.md), [Issue 11 evidence](evidence/issue-11-report.md), [subissue statuses](evidence/issue-11-status.json), and [the open specification ledger](decisions/spec-conflicts.md).
