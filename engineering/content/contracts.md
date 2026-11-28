# Issue 6 — bounded content contracts and privacy boundary

**Authority:** `docs/specifications/01`–`12`, especially 02 §§14, 05 content model, 06 §5.3/§9, 07, 08, and 11 T-CNT. The implementation plan is `docs/specifications/13-implementation-plan.md` §§6.1–6.10. **Issue 6 does not authorize public delivery.**

## Source of truth

- Content is part of the existing **one owner-scoped `drafts` document**, alongside future composition `nodes`. Content: `profile`, ordered `sections`, `collectionDefinitions`, `contentCollections`. Layout is not stored in content items; an authored node may bind to an existing item by stable `contentId`.
- Exactly one **first** Hero is required in every draft. Publication readiness additionally requires nonempty owner display name, professional label and introduction; Projects and Experience are optional. Newly created Issue 5 portfolios now receive this versioned Hero shape. A narrowly recognizable old single-Hero shape is normalized in memory on first content edit; no automatic publication or live unreviewed data migration occurs.
- Supported sections are `hero`, `about`, `projects`, `experience`, `education`, `skills`, `blog`, `references`, `contact`, `certifications`, `achievements`, `services`, `testimonials`, `publications`, `resume`, and `custom`. Other than Hero, section instances can repeat with stable `sectionId` and consecutive order.
- Fields are `text`, `richText`, `url`, `email`, `date`, `number`, `boolean`, `image`, `pdf`, `select`, `list`, `object`, and `relation`. No arbitrary functions, formulas, executable imports, expression evaluators, CSS, HTML or Mongo selectors. All imports, commands and stored content undergo strict runtime checks. Nested lists/objects are limited to **three levels**, 20 schema fields/section, 20 items/collection and 20 authored visual nodes/portfolio. Release limit **102,400 UTF-8 bytes is NOT the draft size** and will be enforced at compilation in Issue 13.
- JSON Schema import supports **only** a closed subset of Draft 2020-12 object properties, required lists, scalar types, date/email/HTTPS URI, bounded lists/objects, enums, explicit defaults and a small set of validation keywords. `$ref`, recursive/dynamic references, remote fetching, schemas with open objects, Mongo operators and arbitrary keywords are denied. Preview/import never saves automatically.
- A collection item has one stable `contentId` under its owned `collectionId`. Categories have stable IDs; item ordering is explicit, unique and bounded. Reordering or editing does not regenerate content IDs. A project can be featured, categorized and bound in multiple places without authoring copies. Project case studies have typed problem, architecture, implementation, challenges, results and lessons; links are HTTPS only.
- `relation` fields use stable content IDs within a specified existing collection and the same portfolio. Targets, reference cycles and longest relationship paths (max three hops) are checked after full candidate parsing. Deletion reports referring item/section/node IDs and fails with `CONTENT_IN_USE` until explicitly detached. No cascading unpublished layout deletion occurs.
- Rich text is a **plain-data AST** covering headings H2–H4, paragraphs, lists, quotes, tables, links, code, images and **inert** Mermaid text. Supported Markdown import/export is deliberately a small subset, not an arbitrary MDX engine or complete WYSIWYG serializer. Generated HTML fallback escapes every untrusted text/attribute. There is no live diagram execution, external fetch, iframe or remote embed. A vetted WYSIWYG editor and full accessibility/browser XSS verification belong to later issues and are **not claimed delivered** here.
- Derived dates/months/counts use fixed UTC-only deterministic helpers. No arbitrary owner formulas.

## Privacy/approval model

A content item is `draft_only` by default. A field is `private` or `owner_choice`, with independent `searchable` and `aiVisibility`. `publicFieldIds` is an **explicit per-item allowlist**. `aiApprovedFieldIds` is a **separate explicit per-item allowlist**; it can never exceed the public allowlist. Section `visible`, `searchEligible`, and `aiSectionApproved` are independent gates. A new field is never automatically approved because the surrounding section or object was approved earlier.

Nested approvals require each fully qualified path and all intermediate ancestors. For example, making `testimonial.quote` available requires `publicFieldIds: ['testimonial','testimonial.quote']`; optional AI also requires `aiApprovedFieldIds: ['testimonial','testimonial.quote']`, and the relevant schema field policy and section approval. Arrays use the configured item field ID, e.g. `photos.image` or `entries.entry.note`. A private nested email is rejected even if an owner submits its path. Image/PDF nodes require an allowlisted **ready** asset. Unsupported/missing foreign relation targets and empty filtered objects are omitted.

`projectEligibleContent` creates **candidate** public/search/AI projections inside the pure domain. **Never use it directly from an HTTP public endpoint or an external AI request.** Issues 7/13 must compile a validated immutable release, enforce the 102,400-byte size cap and resolve media, and Issue 5's public resolver must re-check live account/portfolio/moderation/active-release policy on *each* public delivery. Search, AI, feeds, OG and sitemap read approved active releases only (later issues).

## Edits, consistency, error shape

The owner APIs are apex-only and require live hashed server session, exact Origin and session-bound CSRF. The persistence adapter checks owner portfolio, live account security version and still-valid session **again** inside the same injected database transaction. `PATCH` accepts a finite allowlisted set of typed commands (not unrestricted JSON Patch), builds a fully validated in-memory candidate, then attempts **one** MongoDB draft revision compare-and-swap. `PUT` accepts only content field changes while preserving all protected layout/control-plane fields. Both use `clientMutationId` idempotency and one winning revision; returns no success until the authoritative write completes. Missing transaction capability causes an immediate denial, not an unguarded fallback. **Real driver/transaction proof remains blocked.**

Schema changes are previewed against the latest revision; impact lists lost fields, affected item paths and dependent node IDs. Incompatible edits require a revision- and schema-scoped confirmation hash before one CAS write. Removed/incompatible data is dropped only in the confirmed draft candidate, never a prior immutable release. Safe changes retain existing IDs and eligible approvals, while revoked/private parent policies clear nested approvals. A stale preview fails after the next draft revision.

The exact `If-Match: "rev-N"` vs `409`/`412` behavior is an **existing documented specification reconciliation issue** in 06 §34.1 and the Issue 1 decision register. Current full PUT follows the product draft-conflict `409`, not a newly asserted generic HTTP semantic; the pending `409`/`412` contract must be reviewed before shipping the editor. PATCH uses typed `expectedRevision` and returns `409` for a domain revision conflict.

## API surfaces

All are under `/api/v1/portfolios/{portfolioId}/draft`, apex-session owner-only, no-store:

- `GET /draft` — bounded **allowlisted owner DTO**, revision/ETag. Never publish/return another tenant's draft.
- `PATCH /draft` — typed batch, max 20 ops, `expectedRevision` and `clientMutationId`.
- `PUT /draft` — whole snapshot content update; exact `If-Match` plus `X-Client-Mutation-Id`; layout and control fields remain protected.
- `POST /draft/validate` — **nonpublishing** readiness report; `{}` request body, CSRF required, reports Hero/required-field blockers only. Future compiler/renderer validation is not implied.
- `POST /draft/schema-import` — preview safe JSON Schema/native schema translation, never auto-saves.
- `POST /draft/schema-impact` — preview a native schema change and revision-scoped confirmation.
- `GET /draft/items/{contentId}/deletion-impact` — owner-only dependent stable IDs; never deletes.

## Known gates

External npm packages `next-auth`/`mongodb` are not in the uploaded lockfile; full Next build, actual MongoDB collections/transactions/indexes, real OAuth/browser/cookie/CSRF, WYSIWYG integration, publication compiler, active-release search feed and XSS browser tests are **BLOCKED/NOT RUN**. Do not re-label source-level fake transaction PASS as real service proof.
