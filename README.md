# GildedIn — Issue 10 source implementation

This ZIP contains the **complete updated GildedIn source project through Issues 1–10**, all **12 normative source specifications** and the unchanged `13-implementation-plan.md` under `docs/specifications/`. It implements a private, authenticated free-positioned visual canvas editor with deterministic typed commands and explicit revision-controlled manual saving. **Production status: NO-GO.**

## New in Issue 10

The owner editor at `/dashboard/portfolios/{portfolioId}/editor` has three responsive panels: sections/layers/blocks/content, central section canvas, and contextual content/layout/responsive/accessibility/actions inspector. New blocks use Auto layout; 17 closed registry types can be inserted where valid. Owners can select, multi-select, group, duplicate, lock, reparent, reorder semantic versus visual layers, edit simple text inline, edit bounded typed collection fields and a safe round-trippable Markdown subset, and bind approved public-candidate fields without changing their approval state. Pointer drag/resize uses bounded normalized geometry, snapping guides and responsive overrides; every transform has a numeric/keyboard alternative. Desktop native drag/drop and up/down controls reorder sections and content items. One canonical content tree is used across desktop/tablet/mobile, with no arbitrary CSS/JS or public data leak.

Local undo/redo keeps 50 snapshots and a static animation preview is optional. **Save draft** uses current apex session, CSRF, owned portfolio, `If-Match` revision and idempotent replay, updating the private draft only. No autosave, protected preview URL, public publishing or public release is enabled; these belong to Issues 11–14. The old Hero profile editor is still present separately and can advance the revision; reload canvas after changing Hero profile to avoid staleness.

### Verification

```bash
npm run verify:issue10:offline
```

Observed **381/381 local tests passed**: 320 regression tests from Issues 1–9 and 61 focused Issue 10 tests (46 unit, 9 fake-Mongo integration, 6 static/security). Requirements, boundaries, secret/supply-chain/license/CI inventories, source visual/editor checks and isolated domain TS pass; 5 isolated TypeScript projects passed with externally preinstalled Node types; 197 TS/TSX files passed syntax parsing. All source specifications and prior issue artifacts are retained.

**Outstanding release blockers:** real React/Next typecheck/build, actual React Moveable/dnd-kit installation and license/sensor verification (the current normalized pointer/native DnD implementation is a provisional fallback), real MongoDB and OAuth integration, browser zoom/touch/keyboard/screen reader/IME tests, CSP, legal/privacy and zero-spend host validation. Do not claim the editor is fully production-verified. See [Issue 10 setup](engineering/issue-10-setup.md), [editor contracts](engineering/editor/contracts.md), [evidence](engineering/evidence/issue-10-report.md), [status ledger](engineering/evidence/issue-10-status.json).

The deliverable excludes private `.env` values, personal/prototype media binaries, `node_modules`, build caches and Git internals. Existing Issues 1–9 source code and tests are preserved.

---

## Prior Issue 9 README (retained historical context)

# GildedIn — Issue 9 source implementation

This ZIP contains the **complete updated GildedIn source project through Issues 1–9**, all **12 normative source specifications**, and the unchanged `13-implementation-plan.md` under `docs/specifications/`. This is a **source implementation and synthetic-test handoff, not a production-ready SaaS claim**. **Production status: NO-GO.**

## New in Issue 9 — onboarding, dashboard, owner settings

The branded platform homepage now explains the product, links to a working owner-only onboarding route, and displays only **eligible published** directory entries. An unavailable directory shows an honest empty state—not a fictional example or a private draft. The Google/GitHub-only sign-in interface supports bounded failure messages and a validated same-site dashboard return path; no new password mechanism or email-based identity merge is introduced.

An authenticated owner can see the no-portfolio dashboard, create a first draft through a five-step guided wizard, choose a safe appearance preset, optionally include one private project (or deliberately opt in to clearly marked editable sample text) and skip employment/projects entirely. Creation uses the already-owned portfolio, slug-claim and audit APIs with idempotency. The project is inserted as `draft_only` into the same transaction as the first Hero: it cannot be published by onboarding. Recovery between steps uses short-lived, account-scoped browser-local data that is explicitly **not a backup**; the user can clear it.

After a confirmed create, the owner reaches a **private Hero text editor** with manual typed revision-controlled save (not the future visual canvas). The private dashboard shows **server-acknowledged** draft revisions, published/unlisted/owner-disabled status, live quota counters and links to identity/visibility settings. The account page uses existing profile and provider link/unlink/revoke APIs; portfolio settings use purpose-specific rename/visibility/disable/enable APIs, with live security-version checks. The sidebar exposes honest unavailable states for future publication/media/AI/analytics/export features. A pre-launch privacy notice and no-guaranteed-backup disclosure are included.

### Verification

```bash
npm run verify:issue9:offline
```

Observed **320/320 local tests passed**: 288 earlier regression checks plus 32 new Issue 9 tests (13 unit, 10 fake-Mongo transactional integration, 9 static/security), zero failures. Requirements/ADR inventory, architecture boundaries, secrets, locked dependency/license inventory, CI and static visual-contract checks pass. Global TypeScript syntax parse passed for **182 TS/TSX** files; isolated domain/content/identity/tenancy/persistence configurations passed with preinstalled Node types. See [Issue 9 setup](engineering/issue-9-setup.md), [owner journey contracts](engineering/onboarding/contracts.md), [verification evidence](engineering/evidence/issue-9-report.md), and [all subissue statuses](engineering/evidence/issue-9-status.json).

**Outstanding hard gates:** real Auth.js/MongoDB library installation and full Next build, Google/GitHub provider callbacks, actual MongoDB transactions and cross-tenant smoke, cookie/CSRF and browser accessibility/zoom/journey tests, Lighthouse and transfer budgets, legally reviewed privacy notice, active-release publication, DNS/TLS, font licensing and zero-charge provider eligibility. Pending functionality is not represented as live. The `verify:issue9:full` script is a checklist and will not be green until these dependencies and real tests have been proved.

The delivered source ZIP excludes the uploaded private `.env`, any personal/prototype media, `node_modules`, build output and Git caches. Existing Issues 1–8 source code, specifications, engineering notes and evidence are preserved.
