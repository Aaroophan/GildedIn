# GildedIn — Issue 6 implementation candidate

This is the **complete GildedIn source project** with Issues 1–5 carried forward and the **Issue 6 typed content engine** implemented in the existing modular Next.js/TypeScript architecture. The 12 normative project specifications and current `13-implementation-plan.md` remain in `docs/specifications`.

**Release status: NO-GO.** Local code and synthetic tests pass, but no genuine production users, OAuth providers, external MongoDB, browser routing, public publishing, WYSIWYG interface or working deployed SaaS are claimed. The uploaded ZIP does not lock the official `next-auth`/`mongodb` packages; no fictitious npm dependencies were added. Provider, DNS/TLS, cost and full Next.js checks remain open.

## Issue 6 — what is implemented

- **Typed sections and content:** One mandatory first Hero; reusable optional About, Projects, Experience, Education, Skills, Blog, References, Contact, certifications, achievements, services, testimonials, publications, résumé and custom sections. A minimum display name/role/introduction is validated before publication, without forcing a project or employment history.
- **Field schemas:** Text, rich text, email, HTTPS URL, date, number, boolean, image, PDF, select, object, list and owned relation, including strict per-field validation. **Three-level** schema depth; **20** custom fields/section; **20** items/collection; 20 authored visual blocks/portfolio. Imports accept only a closed safe JSON Schema subset, not executable `$ref`, remote validation, raw HTML, CSS or JavaScript.
- **Reusable owner data:** Stable content IDs, linked collections, categories, project case-study records, deterministic project slugs, featured flags, order, update, delete and explicit reference-detachment. Every content item is embedded in the one private, revisioned draft. Editing it updates draft bindings only; a published release remains unchanged.
- **Privacy-safe projections:** Field-level public/search/AI approvals, restrictive defaults and **independent approvals down each nested object/list path**. Hidden reference emails and unapproved media never appear in positive-list candidate projections. These are **not** public/AI endpoints: future publication must compile an immutable eligible release and check live policy.
- **Inert rich text:** Small, versioned AST, safe HTML-escaped text fallback, bounded Markdown import/export, restricted inert Mermaid text, code, lists, quotes and tables. No owner-written JavaScript or live diagram execution. Full WYSIWYG and browser XSS evidence remain later gates.
- **Derived values and migration:** UTC calendar duration/date formatting, safe-compatible schema changes, explicit preview and revision-scoped confirmation for destructive changes; no active release edited by schema migration.
- **Secure draft operations:** `GET`, `PATCH`, `PUT`, validate, schema import/impact and deletion-impact under authenticated apex-only `/api/v1/portfolios/{portfolioId}/draft`. Read responses use allowlisted owner fields; writes require exact Origin/CSRF, rechecked session and ownership, typed operations, a **single draft CAS** and client-mutation replay protection. Missing transaction support fails closed.

### Verification (synthetic, offline)

```bash
npm run verify:issue6:offline
```

As tested on the preparation environment: **204 / 204 tests PASS** with no failures, including 50 focused Issue 6 tests. Domain, tenancy, identity and persistence TypeScript checks plus requirement, dependency, secret and CI inventory checks passed using locally available compiler/types. This is **not** real database, browser, OAuth, App Router, WYSIWYG or public release proof.

For exact implementation and limitations see [Issue 6 setup](engineering/issue-6-setup.md), [content and privacy contracts](engineering/content/contracts.md), [test evidence](engineering/evidence/issue-6-report.md), and [subissue statuses](engineering/evidence/issue-6-status.json). The preliminary `npm run verify:issue6:full` remains **BLOCKED** until required dependencies and isolated real Mongo/Next/browser prerequisites are available.

Earlier issue documentation and security foundation remain in `engineering/`. The uploaded private `.env` and personal media files are deliberately not included in this source ZIP. No live production deployment, provider charges, token sharing or customer-data tests were performed.
