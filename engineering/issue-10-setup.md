# Issue 10 — free-positioned visual canvas editor (local source implementation)

**Authority:** exact twelve `docs/specifications/01…12` documents and `13-implementation-plan.md`, Issue 10.1–10.10. User-supplied plan and twelve specs are retained unchanged. **State:** source implemented for the private editor's core affordances, but selected library and live accessibility/production verification gaps remain; **NOT FULLY CLOSED** and **PRODUCTION NO-GO**.

## Where to begin

Authenticated user: `/dashboard`, open **Editor** for the owned `portfolioId` at `/dashboard/portfolios/{portfolioId}/editor`. The server loads the current owner-only draft through the existing account/session/portfolio checks and projects it to one canonical versioned model. There is no route to obtain a foreign or public draft and no migration of Issue 6 reference-only stub nodes without an explicit future owner action.

The workspace is a three-column dark/light GildedIn interface: left sections/layers/safe blocks/collections, central responsive canvas and toolbar, right property inspector; 930px and 540px stack panels instead. Beginners can start with an empty Hero scaffold and add one Auto-layout text/heading. Expert controls permit 17 registry components, section/layer order, multi-selection and grouping, free relative positioning, constraints, snapping guides, visual/semantic order, responsive overrides, approved content bindings and finite actions.

Source files: `src/domain/editor/{commands,geometry,history,diagnostics,workspace}.ts`; `src/ui/owner/canvas/*`; `src/server/editor/http.ts`; `src/app/api/v1/portfolios/[portfolioId]/draft/workspace/route.ts`; authenticated owner editor page; scoped styles in `src/app/globals.css`; repository `putEditorWorkspace()` reusing transactional CAS.

## Offline reproducibility

```bash
npm run verify:issue10:offline
```

Observed **381/381 tests passed**: 320 prior issue regressions + 46 pure Issue 10 unit tests + 9 synthetic Mongo integration tests + 6 source-security tests. Checks include requirements/ADRs, module boundaries, secret scan, locked supply-chain and license inventory, CI static review, visual/editor source constraints and domain TypeScript. The tests do **not** connect to real accounts, providers, MongoDB or production data. Five isolated TypeScript configs (`domain`, `content`, `tenancy`, `identity`, `persistence`) were additionally checked with an existing external Node types folder. Source TS/TSX AST parse: **197 files, zero errors**. Neither pure domain typecheck nor AST parsing verifies React/Next compilation.

To attempt full checks on a trusted workstation with verified local configuration (after reviewing the prior exact-version candidate scripts and regenerating a correct lockfile):

```bash
npm ci
npm run typecheck
npm run build
npm run db:prove-issue5-local
npm run test:browser
npm run test:accessibility
npm run test:performance
```

These full commands are **NOT RUN/BLOCKED** in this artifact environment because required application dependencies, real MongoDB and actual browser/assistive testing were unavailable. The current test:browser/accessibility/performance scripts are prerequisite guards, not actual completed browser tests. Do not treat `npm ci`, Moveable/dnd-kit, Auth.js, MongoDB, Three.js or licensing as proven installed.

## Manual editor QA and denial matrix

On an actual verified local Next build, log in to two synthetic accounts, create private portfolios, open the first owner's editor, choose a section and add safe blocks. Test a nested group and moving between sections, select locked/overlapping nodes via layer tree, duplicate under/over the 20 block limit, move and resize at 320/390/767/768/820/1023/1024/1200px, use Alt to disable snapping, inspect 200%/400% text zoom and touch-only/numeric geometry. Check mobile/tablet overrides do not mutate shared content or semantic order. Reorder sections and items by desktop pointer and by keyboard/touch arrows. Validate safe Markdown AST editing with IME/paste, native field labels and direct links; attempt malicious `javascript:` URLs, HTML attributes, out-of-parent geometry, unknown components, raw CSS, and foreign content IDs.

Save draft; verify an authoritative increment and that the public URL is still 404. Test stale `If-Match`, lost acknowledgement retry with identical token, simultaneous tabs and revoked account sessions; confirm a second account cannot GET/PUT the first owner's draft. Compare fake DB state and full driver side effects, including no `releases` or active pointer writes. Confirm missing React dependencies, inaccessible browser conditions or ambiguous provider errors produce **BLOCKED**, not a fabricated passing test.

## Pending gates

- Real validated React Moveable and dnd-kit installation/lockfile/licensing and their pointer/touch/keyboard sensors; provisional typed pointer + native DnD fallback is not equivalent proof of these candidate libraries (ADR-025).
- Full React/Next build and SSR/hydration, run-time route security, CSP/nonce, private cache behavior, real Mongo transaction and revision/idempotency behavior; live OAuth and host-only cookie/CSRF.
- Browser Playwright/axe, NVDA/VoiceOver, no-JS, touch/pointer capture, IME, high zoom, forced colors and focus order, supported mobile devices, layout collision (static diagnostics alone cannot prove accessibility).
- Issue 11 auto-save, protected draft preview and multi-tab recovery; Issue 12 approved upload; Issue 13 immutable publication; Issue 14 actual public render. Publication remains disabled in Issue 10.
- Existing inherited spec concern: conditional-header 412 vs draft CAS 409 needs reviewed `SPEC-CONFLICT` resolution, not a changed expected result.

See [editor contracts](editor/contracts.md), [Issue 10 report](evidence/issue-10-report.md), and [per-subissue ledger](evidence/issue-10-status.json). No external credentials, personal media, actual font binaries or production DB are present in the deliverable ZIP.
