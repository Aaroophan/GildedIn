# GildedIn - Issue 8 implementation candidate

This archive includes the **complete updated GildedIn source project** through Issues 1-8, with all **12 normative specifications** and the unchanged `13-implementation-plan.md` under `docs/specifications/`. **Release status: NO-GO.** This is a source implementation and synthetic-testing handoff, not a running or deployable SaaS claim.

## Issue 8 - branded responsive design and progressive cinematic layer

- Versioned, validated dark/light design tokens and CSS-scoped portfolio themes; exact contrast checks and no user-authored CSS/scripts.
- Font roles for Oswald (headings) and Roboto (body) with readable system fallbacks. Ink Free and Mistral selectors are disabled until their web-embedding rights are verified; font binaries are **not shipped**.
- Accessible reusable buttons, links, labelled fields, select controls, notices, native dialogs and keyboard tabs with JavaScript-free text fallback.
- GildedIn technical-corner ornaments and semantic individual-letter introduction; original heading is always SSR-readable, animation is decorative only.
- Off, Subtle, Standard and Cinematic visual modes with browser-local preference, system reduced-motion override and no visitor tracking.
- Optional lazy Three.js scene with always-visible static CSS fallback, bounded scene graph, responsive quality, offscreen/hidden pause and context-loss cleanup. No GPU, editor DOM or third-party shader is a prerequisite to reading a page.
- Strict public-release projection contract for scene content (explicit public **and** scene approval, stable IDs, no private labels) and owner-authenticated theme draft changes using the existing revision CAS. Anonymous draft delivery remains denied.
- Responsive Issue 8 branded platform **implementation preview**. Full marketing/onboarding, visual editor, active-release publishing and public portfolio delivery are later planned issues and are not claimed complete.

### Repeat local checks

```bash
npm run verify:issue8:offline
```

This command runs the pre-existing 256 tests plus 32 new Issue 8 tests and foundational checks; it does not run a full installed Next.js build or browser. See [Issue 8 setup](engineering/issue-8-setup.md), [design contract](engineering/design/contracts.md), [test evidence](engineering/evidence/issue-8-report.md), and [per-subissue statuses](engineering/evidence/issue-8-status.json).

On a trusted internet-connected machine, review and install the exact **candidate** Three.js/Anime.js packages with `npm run deps:visual`, and the outstanding Auth.js/MongoDB packages from earlier work with `npm run deps:identity`, then review the regenerated lockfile and run the full React/Next/browser tests. No new packages were silently added to the original lockfile in this offline environment.

**Still unverified and release-blocking:** full Next.js/React/3D dependency build, true browser keyboard/zoom/screen-reader, Lighthouse and bundle budgets, actual font loading and licenses, WebGL/reduced-motion behavior on devices, real MongoDB/OAuth, immutable public releases, authoritative tenant policies, DNS/TLS, CSP, and provider zero-spend eligibility. These may not be counted as passed because synthetic tests succeed.

The delivered source ZIP excludes the private uploaded `.env`, personal/prototype media assets, any `node_modules` and build caches. Prior Issue 1-7 source and engineering evidence remain available in `engineering/`.
