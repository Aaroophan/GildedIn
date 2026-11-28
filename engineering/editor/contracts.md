# Issue 10 editor contracts — authoritative owner-only canvas

## Trust boundary and data ownership

- The canvas is `/dashboard/portfolios/{portfolioId}/editor` on the verified **apex** only. The server checks `requireOwnerPage()`, current account/session and exact owned portfolio ID **before** reading a private draft.
- `CanvasEditor` receives a small, owner-only projection (Hero profile, embedded sections/nodes, typed collection definitions/items, media IDs), not Mongo query filters, roles, audit trails, provider credentials, operation hashes, current security policy or publication permissions. It does not render on tenant-owned subdomains, public pages or cached anonymous endpoints.
- `VisualNode` and `ContentDraftShape` remain the persistent schema. The editor adds **no** executable content, runtime-generated component definitions, HTML/CSS, custom shaders, user code, editor-DOM snapshots or drag-library serialization.
- Every local command in `src/domain/editor/commands.ts` copies the current document, validates the proposal with existing Issue 6 and 7 parsers, and returns a fresh candidate or a structured denial. The prior local document remains untouched if invalid.
- The server additionally accepts only `schemaVersion`, `sections`, `nodes` and `contentCollections`. `mergeEditorWorkspace` compares original/updated sections and items against an exhaustive protected-field allowlist. It forbids altering the Hero visibility, ownership, collection identities, publication/AI/search approval, schema definitions, item privacy or any unknown top-level field. All existing media references are revalidated against the owner in the same transaction.

## Write contract (Issue 10, not Issue 11 autosave)

`PUT /api/v1/portfolios/{portfolioId}/draft/workspace`

Authenticated apex + exact Origin, Fetch Metadata and CSRF, `Content-Type: application/json`, bounded body (`350,000` bytes), mandatory `If-Match: "rev-N"` and opaque `X-Client-Mutation-Id`; `schemaVersion:1` with current sections/nodes/collections. The repository performs one owned, revocation-aware transaction, authoritative revision CAS and same-token fingerprint replay. Only a successful server acknowledgement advances the displayed saved revision. Revision races return the existing domain 409 conflict (409-vs-412 specification review remains open). Private/no-store/noindex responses and safe error vocabulary inherited from Issues 2–9.

The editor never creates a release, mutates `activeReleaseId`, reads a public address, or uses owner draft data in the public render path. If saving fails, local state remains, retry uses the same mutation token for the same snapshot, and the owner can reload the authorized revision after reviewing conflicts. No auto-merge or offline persistence is claimed. Server requirements remain final: UI restrictions are explanatory only. Profile changes in the separate Hero editor use their existing purpose-specific API and may advance the revision; a canvas refresh is necessary after those edits.

## Typed operations

- `insert`, `setProps`, `setLayout`, `clearOverride`, `setVisible`, `lock`, `duplicate`, `delete`, `group`, `ungroup`, `reparent`, `moveLayer` (visual vs reading), `setBinding`, `setInteraction`.
- Section add/remove/update/reorder; collection item edit/reorder and safe native desktop drag/drop fallback, with keyboard/touch button parity; no new arbitrary collection or unreviewed schema.
- Components: the **17** closed registry variants, new Auto layout by default, max 20 authored blocks including nested blocks, max depth 3, max 20 collection entries, constrained parent/section and per-breakpoint overrides (mobile below 768, tablet 768–1023, desktop 1024+). Repeater output is generated and does not add authored blocks.
- Relative geometry is finite, parent-bound 0–1 fractions; pointer drag and resize use normalized geometry and snapping (2.5% grid, edge/center, sibling guide), modifier to bypass; inspector always offers numeric/no-drag controls. No arbitrary CSS transform is persisted. React Moveable is **not installed or verified**; the current pointer layer is an owned provisional adapter awaiting ADR-025 evaluation.
- Every selected node can be reached by layer list and keyboard, including overlapping blocks. Reading order is separate from z-order. Group/reparent and content IDs are validated and exact UUIDs survive save. Locking prevents changes to nested children. Selection, viewport, zoom, temporary layout gesture and 50-entry undo/redo history stay within the current browser session; none are persisted in a public release or across accounts.
- Text and headings use plain, escaped React text; no `contentEditable.innerHTML`. Typed panel titles, table captions, links, rich Markdown AST fields and collection references use closed validators. The Markdown inspector edits only AST documents that losslessly round-trip the safe subset, preserving complex documents unchanged rather than destroying images or tables. Media references must already be owned and ready; media ingestion remains Issue 12.
- Owner-only in-page **layout draft preview** and bounded CSS motion replay cannot publish or share the draft. Protected preview URLs, autosave and conflict reconciliation are Issue 11; immutable publishing is Issue 13; public server-rendering is Issue 14.

## Verification and limitations

Tests: `tests/unit/issue10-editor.test.ts`, `tests/integration/issue10-editor.test.ts` (fake transactions and two synthetic tenants), `tests/security/issue10-editor-boundaries.test.ts` (static source checks), plus prior Issue 1–9 regression tests. Reproduce with `npm run verify:issue10:offline`; full provider/browser checks are enumerated in `engineering/issue-10-setup.md` and the per-subissue status report.

A native HTML5 desktop drag/drop fallback and arrow controls are implemented; **the specified dnd-kit keyboard sensor/touch behavior has not been validated or installed**. Actual React/Next hydration, browser zoom 200%/400%, VoiceOver/NVDA, pointer/touch, IME, high contrast, code bundle, CSS/layout and runtime CSP checks are **BLOCKED**, not claimed PASS. The current in-page preview is not an authoritative future public release preview.
