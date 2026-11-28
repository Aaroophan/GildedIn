# Issue 8 - implementation and verification evidence

**Project:** GildedIn | **Date:** 2026-11-28 | **Scope:** plan 8.1-8.10 and 12 normative specifications | **Decision:** SOURCE IMPLEMENTED / LOCAL SYNTHETIC PASS / **PRODUCTION NO-GO**.

## Execution versus non-execution

| Local check | Result | What the result establishes |
| --- | --- | --- |
| `npm run verify:issue8:offline` | PASS, **288/288 tests**, 0 failures | All Issues 1-7 regressions plus 32 new Issue 8 tests and static checks. It does **not** run a Next build or browser. |
| Issue 8 focused suites | 16 domain unit + 8 synthetic two-owner transaction integration + 8 static source/security = **32 PASS** | Color/shape/contrast bounds, URL/CSS/code rejection, motion/quality budgets, restricted scene release projections, private API replay/CAS, source-level SSR, focus and lazy scene hygiene. |
| Isolated TypeScript domain, content, identity, tenancy and persistence | PASS (content/identity/tenancy/persistence used compatible preinstalled `@types` root) | Pure domain and pre-existing server types. TSX React/Next/Three packages were not installed; these do not prove full app typecheck. |
| Source/type parser | PASS (see `issue-8-status.json` for count) | TS/TSX syntax checked, not true DOM/React hydration. |
| Requirements, boundaries, secrets, locked supply chain, license inventory and unprivileged CI | PASS | Checked prior locked inventory; not third-party visual packages uninstalled here. |
| Static dark/light visual HTML fixture | CREATED, MANUAL REVIEW NOT RUN | Two synthetic HTML/CSS files are supplied for a trusted workstation, but no rendered screenshot is claimed. |
| Real Chromium screenshot attempt | BLOCKED | Environment browser launch timed out; zero real mobile/desktop visual claims. |
| Real Next.js SSR/client, GPU, 320px/400% zoom, axe/keyboard/screen reader, WebGL context recovery, Lighthouse/p75 metrics, font network/licensing, real CSS bundle budget | **BLOCKED / NOT RUN** | The dependencies and browser test environment were unavailable; source-only checks are not release acceptance. |

### Exact Issue 8 subissues

| Subissue | Implementation evidence | Status (source / external acceptance) |
| --- | --- | --- |
| 8.1 | `theme.ts`, `theme-scope.tsx`, scoped CSS, `putTheme` owner-only draft API, contrast checks (4.5:1 functional text, 3:1 focus), dark/light token pairs, hostile CSS/unknown keys rejected. | IMPLEMENTED / browser contrast combinations BLOCKED |
| 8.2 | `fonts.ts`, fallback display/body/handwriting/signature roles; Ink Free/Mistral blocked without verified rights; no binaries or remote font dependencies committed. | PARTIAL: roles and rights gate implemented / actual Oswald/Roboto binaries and font licensing review BLOCKED |
| 8.3 | `primitives.tsx` labelled fields, notices, tab keyboard logic, native dialog, focus ring, 44px control targets; non-JS tab panels preserved. | IMPLEMENTED / browser WCAG+focus/assistive technology BLOCKED |
| 8.4 | `technical-frame.tsx`, `.gi-corners` CSS, inert hidden corners, focus/hover/entry signals, motion Off/system reduced-motion rules. | IMPLEMENTED / real visual/performance observation BLOCKED |
| 8.5 | `intro.tsx`, `letter-reveal.tsx`, SSR full heading once, aria-hidden decorative characters, replay button outside heading, lazy Anime.js and local session replay. | IMPLEMENTED / actual Anime.js animation and screen reader BLOCKED |
| 8.6 | `motion.ts`, CSS timing tokens and declared animation ownership: CSS simple decoration, Anime.js headline, optional Three 3D; Motion library only if future UI transitions justify it. | IMPLEMENTED / interrupted concurrent library behavior BLOCKED |
| 8.7 | `scene-backdrop.tsx`, `scene/three-scene.tsx`, React.lazy + `import('three')`, static CSS fallback, WebGL failure cleanup, bounded RAF, no shader input. | SOURCE IMPLEMENTED / actual Three install+GPU/browser BLOCKED |
| 8.8 | `scene.ts` strict active-release source projection with explicit scene consent; 24 nodes, 36 edges, same-release IDs, no private source text in client graph; decorative fallback. | IMPLEMENTED pure contract / real active-release integration depends on Issues 13-14 |
| 8.9 | `motion-settings.tsx`, pure `effectiveMotion` and `deriveSceneQuality`, Off/Subtle/Standard/Cinematic, OS reduction priority, browser-local preference, capped DPR/FPS, hidden/offscreen stop. | IMPLEMENTED / actual battery/render-loop and preference changes BLOCKED |
| 8.10 | 32 Issue 8 synthetic tests + previous 256 regression tests, `scripts/check-visual-contracts.mjs`, static light/dark fixtures and this evidence ledger. | PARTIAL: local evidence PASS / mandatory Lighthouse, zoom, screenshots, font license, bundle transfer, real devices and subjective review BLOCKED |

### Security and delivery constraints

- No owner-authored executable code, HTML, CSS rule, shader or 3D geometry is admitted into the stored composition. Public renderer remains behind verified immutable-release and live-policy boundaries; anonymous public routes never read a draft.
- Private theme routes use the existing live-session and tenant ownership check, CSRF/Origin, optimistic revision and transactional single-draft update. The synthetic tests validate rollback/replay using fake DB adapters; **real MongoDB transaction isolation remains unverified**.
- Rich-text private fields and AI-denied or scene-denied items cannot be fed into a scene graph without a separately approved release-only projection. Scene output does not contain text labels. **Calling `buildReleasedSceneGraph` with a browser-asserted boolean is forbidden**; only server-verified release data may be passed to this pure function.
- Proprietary Ink Free/Mistral web-embedding rights not established. Oswald/Roboto are specified design roles but not bundled or verified as loading. No font files or personal media are distributed.
- No real production data, external cloud deployment, paid subscription, OAuth login, provider charge, wildcard DNS/TLS or user email was touched.
- `npm run deps:visual` and prior `deps:identity` remain unverified offline candidate install scripts; manifest/lock were intentionally not faked. Full `npm run verify:issue8:full` is **BLOCKED**.
- Pre-existing unresolved `If-Match` draft-domain 409 vs HTTP-standard 412 SPEC-CONFLICT persists; Issue 8 uses the existing draft API conflict convention without silently changing it.

### Release gate and handoff

**NO-GO** until tested full Next/React/Three/Anime installation, genuine browser accessibility and Lighthouse/transfer outcomes, licensed fonts, real database and OAuth, publication/SEO/CSP, eligibility of zero-cost hosting and DNS/TLS gates are independently verified. See `engineering/issue-8-setup.md` for commands. All 12 original specifications, `13-implementation-plan.md`, prior code and previous issue evidence are retained.
