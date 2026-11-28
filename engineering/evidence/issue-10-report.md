# Issue 10 — verified source evidence and unresolved gates

**Date:** 2026-11-29. **Source of truth:** unchanged 12 specifications and `13-implementation-plan.md` Issue 10.1–10.10. **Decision:** **SOURCE IMPLEMENTED LOCALLY / NOT PRODUCTION CLOSED / NO-GO**. Test outcomes refer only to the currently runnable local suites.

## Observed checks

| Suite or artifact | Result | What it proves |
|---|---|---|
| Uploaded Issue 9 baseline (before edits) | PASS 320/320 | Regression baseline for Issues 1–9 |
| Issue 10 unit tests | PASS **46/46** | Closed typed editor commands, limits, geometry, grouping, order, responsive overrides, binding and draft merger |
| Issue 10 synthetic Mongo integration | PASS **9/9** | Fake transaction owner checks, stale CAS, replay, denied approvals, foreign account, session revocation, no public release/pointer |
| Issue 10 static/security source tests | PASS **6/6** | Owner route/ingress and CSP/cache source patterns, no raw HTML eval, no leaked public read path (not browser proof) |
| `npm run verify:issue10:offline` | PASS **381/381**, zero failures | Combined regression, requirements, boundaries, security inventory, CI/source checks and domain types |
| `tsc` domain/content/tenancy/identity/persistence with preinstalled Node types | PASS for all five | Isolated TS module types, **not React/Next typecheck** |
| Global TS AST syntax parse of `src`, `tests`, `scripts` | PASS **197 files, zero parse errors** | Syntax only, not correct JSX types or runtime behavior |
| Actual Next build, native React typecheck, browser, `npm ci`, OAuth, real MongoDB and GPU | **BLOCKED / NOT RUN** | No provider/browser acceptance claimed |

## Per-subissue evidence and honest boundaries

| ID | Implemented local source | Remaining proof/known limitation |
|---|---|---|
| 10.1 | Owner-acl route, responsive 3-panel editor, private initial Hero and section canvas, safe block catalog/inspector, revision display | Real SSR/hydration/mobile panel usability |
| 10.2 | Node-ID selection, checkbox multi-select, locks, nested groups, duplicate/delete, reparent, visual z-order separate from semantic reading order, keyboard layer controls | Keyboard/screen-reader and overlapping-controls browser proof |
| 10.3 | Normalized typed pointer move/resize, grid/edge/center/sibling snapping, Alt bypass, cancellation and bounds tests | Moveable not installed; modifier/touch ergonomics, equal-gap guides and real pointer/browser behavior not proven |
| 10.4 | Typed section and item reordering, native desktop DnD fallback plus explicit keyboard/touch arrows, cross-section reparent and Hero invariant | dnd-kit not installed; native touch DnD and browser sensor behavior not proven |
| 10.5 | Plain React inline text/heading editing; typed property forms for panels/table/contact/link/repeater; bounded lossless subset Markdown AST editing for existing item fields | Full WYSIWYG, IME/paste and rich media/table/diagram editors remain conditional; complex AST preserved unchanged |
| 10.6 | Desktop/tablet/mobile modes, adjustable 320–1440 CSS px viewport and zoom, one source with explicit override controls and local geometry | Actual between-breakpoint CSS/hydration, 200% and 400% zoom and device proof |
| 10.7 | Positive allowlisted stable profile/item/collection bindings, privacy-denied choice filtering, eligible repeater preview without new authored nodes | Actual compiler/public release and real media approval; only private owner stage functional |
| 10.8 | Numeric/no-drag relative X/Y/size, layout modes, heading/order controls, static overlap/touch-target/text-clipping diagnostics | Browser focus order, NVDA/VoiceOver/touch high-zoom verification blocked |
| 10.9 | Bounded 50-snapshot local undo/redo, explicit manual save and retry token, temporary CSS animation preview/off editing | Issue 11 autosave and protected preview, browser change interruptions, shared cinematic parity not proven |
| 10.10 | 61 focused tests plus 320 regression, two synthetic tenants, fake transactional denial and public absence checks | Canonical source-11 real browser/hardware/host/OAuth/DB end-to-end pending |

## Data/publication safety

Source writes are derived from a revocation-checked owned draft, not from browser-provided `ownerAccountId`. `workspace` disallows mutation of protected section permissions/ownership, owner visibility/public/AI field approvals, collection identity/count, theme, SEO, security policy or release pointer; validates existing media and node graph; enforces a single Hero visible and first; and persists approved fields through one repository revision CAS. New sections default private/unapproved. The local stage is an **owner-only** composition view; it is not a public page. No feature writes a release or activates its pointer.

The client clearly labels unsaved vs server-acknowledged revision and retains changes on failure. It never claims that local undo is durable restoration or that private in-page preview is Issue 11's protected preview. The source 06 HTTP 409-versus-412 mismatch remains a documented inherited `SPEC-CONFLICT` for review.

**Blocked production gates**: npm dependency lock/install and full Next/React build; actual browser/keyboard/IME/touch/zoom and axe screen-reader acceptance; verified package suitability and license for React Moveable/dnd-kit; real Mongo transactions/Origin/CSRF/cookie behavior; account/portfolio route E2E; CSP/Next and public/cache behavior; font/WebGL/third-party feasibility; zero-charge host and legal/notice review. None are counted as PASS by these synthetic tests.
