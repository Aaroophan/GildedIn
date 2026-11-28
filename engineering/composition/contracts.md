# Issue 7 — declarative composition contract and rendering trust boundary

This is an executable *candidate* design, not permission to serve owner drafts to anonymous visitors. Source authority: GildedIn specifications 02/03/05/06/07/08/11/12 and implementation plan issue 7. All public entrypoints must first satisfy the Issue 5 trusted-host, live-account, portfolio and moderation gates, followed by the Issue 13 active immutable-release pointer. The semantic renderer accepts **only the compiled content in that active approved release**. It must never call owner draft repositories or trust public query data as a component tree. **This active-release integration belongs to Issues 13–14 and is not enabled in Issue 7.**

## Data flow and owned boundaries

```text
Owner browser
  -> exact-apex, session + Origin + CSRF request adapter
  -> authenticated owner ID and portfolio from server
  -> MongoContentRepository.putComposition (same draft, CAS revision + mutation ID)
  -> Issue 6 parseContentDraft + parseCompositionNodes (typed bounded graph)
  -> private draft document (never activeReleaseId)

Issue 13 publisher [later]
  -> owned draft snapshot + typed field/section/content visibility checks
  -> compileComposition(raw, approved-media/policy capability)
  -> immutable approved release only if ZERO blocker diagnostics
  -> bounded, deterministic SemanticRenderPlan + version tuple

Issue 14 public SSR [later]
  -> trusted host + current live policy + immutable active release
  -> assertSupportedRenderPlanVersion
  -> SemanticComposition with trusted server nonce, canonical tenant basePath,
     and a media gateway allowed to return only release-authorized safe URLs
  -> semantic React HTML; finite CSS rules; optional tiny client islands
```

### Serialized graph

- `schemaVersion: 1`; **one** `nodeId` (UUID), `sectionId`, optional `parentNodeId`, `componentType`, `componentVersion: 1`, allowlisted `props`, owner data `contentBinding`, `layout`, `responsiveOverrides`, `visualOrder`, `readingOrder`, `semanticRole`, `visibilityByBreakpoint`, finite `interaction`. Unknown fields and values deny.
- Parent-child graph has no cross-section parents, loops, missing parents or unsupported nesting. **At most three levels** and **20 authored nodes** across the portfolio. Authored nested groups count; platform scaffolds and repeater instances do not.
- Built-in Hero display-name H1 can be supplied by protected platform scaffolding if absent, otherwise exactly one authored Hero H1. The compiler blocks a skipped heading level and an authored H1 placed after a lower-level heading.
- `Auto` layouts use finite flex/grid/flow tokens with intrinsic sizing; `Absolute` uses constrained relative coordinates, width/height fractions, anchors, z-index tokens and limited overflow policy; `Hybrid` positions a parent with auto-flow children. New nodes default to Auto. Geometry and generated CSS contain **only reviewed finite tokens and numbers**; never user CSS or selectors.
- Desktop >=1024 px, tablet 768–1023, mobile <=767. Overrides are explicit on the same node; meaningful absolute content falls back to Auto for smaller viewports unless the owner makes a valid explicit override. Browser zoom and collision still require real tests.
- Reading order is independent of z/visual order; all content is emitted in semantic DOM order, with native `<h1>`/`<h2>`/`<h3>`, `<nav>`, `<article>`, `<a>`, `<ul>`, `<table>`, `<details>` where appropriate. CSS `display:none` hides breakpoint-ineligible elements from the accessibility tree; no opacity-based focus traps.
- Approved block registry v1: heading, text, button, link, image, container, group, grid, card, repeater, gallery, tabs, accordion, carousel, timeline, contactForm, comparisonTable. Unrecognized component versions, dangerous href values, arbitrary HTML/JS/iframe/shader/MDX and unbounded props are denied. Media requires owned, approved asset evidence; contact submission requires the future reviewed admission endpoint. The renderer itself issues no fetch to untrusted storage.
- Repeaters emit only Issue 6 `projectEligibleContent(..., 'public')` fields. Private item/field sentinels are removed before rendering; at most 20 displayed items per repeater, 200 generated items as a candidate budget. Provenance records only actually emitted public item IDs. One generated instance does not consume one authored node.
- Finite client interactions: toggle panel, open/close native dialog, switch tab, advance carousel, navigate approved route, scroll to existing section, and explicitly gated contact-form opening. Actions use existing node IDs, never arbitrary scripts, selectors or HTTP instructions; tabs/carousels show all text without JavaScript, then progressively enhance while preserving keyboard support and focus return.
- The rich-text AST from Issue 6 is rendered as **React text and native elements**, never dangerous HTML injection; Mermaid diagrams remain inert `<pre>` text, approved image references use a server-validated media gateway.

### Version and migration policy

`COMPOSITION_SCHEMA_VERSION`, `COMPONENT_REGISTRY_VERSION`, `COMPOSITION_COMPILER_VERSION`, and `COMPOSITION_SERIALIZER_VERSION` form the reviewed compatibility tuple. Historical Issue 6 reference-only node stubs remain private-editable, but are **not silently converted** into a public component and cannot compile for release; an owner-approved mapping is required. Future/unrecognized versions reject before rendering. Releasing/retaining three immutable historical revisions is a later publication workflow and is not simulated as evidence of actual rollback compatibility.

### Important release proof gaps

A local fake and pure compiler do not establish that Next.js builds, that React 19 SSR/hydration works, that mobile/zoom layout never clips, that a screen reader announces the correct focus order, or that CSP/cookies/TLS and real MongoDB transactions behave on the selected provider. The renderer is intentionally **not wired to the current public placeholder**, because Issue 13 has not delivered live immutable releases. On an installed, isolated development environment, run the complete build, manual keyboard/screen-reader/no-JS/reduced-motion and zoom tests, local replica-set transaction proof, and actual host/cookie tests before publication. See `../evidence/issue-7-report.md`.
