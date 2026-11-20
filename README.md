# GildedIn

GildedIn is a new, specification-led, free, open-source portfolio creation and publishing product. The earlier GildedIn application is a **prototype reference only**, not the runtime source or a set of trusted services.

This ZIP implements **Issue 1: Establish the specification baseline and executable architecture boundaries**. It is **not** a working multi-tenant SaaS, and does not enable authentication, media, drafts, publishing, Gilden or external-provider access. The application shell intentionally returns no owner or portfolio records.

## Local setup

Requires Node.js 22.16+ for the dependency-free TypeScript test runner (Next.js itself supports additional Node versions) and npm, with access to the npm registry for the first install. This environment could not reach the registry, so dependency-dependent build/lint checks remain `BLOCKED`, not `PASS`.

```bash
npm ci
npm run check:requirements
npm run check:boundaries
npm run test:domain
npm run typecheck:domain
npm run typecheck
npm run lint
npm run build
npm run dev
```

Open `http://localhost:3000` for the static foundation screen. `/login` explains that OAuth is not enabled; `/dashboard`, `/dashboard/preview`, all portfolio slugs and tenant subdomains deny access. No `.env` is required and you must **not** supply production credentials for Issue 1.

## Source of truth

All twelve normative documents and the entire implementation plan are included unchanged under [`docs/specifications`](docs/specifications/). A source-controlled register contains all 97 requirements exactly as extracted from the canonical requirement tables (including the source's `PUB-007` malformed Markdown row, reported in the conflict ledger), alongside the 36 existing ADRs, product limits, dependency rules, and 18 deployment gates.

- [`engineering/issue-1-walkthrough.md`](engineering/issue-1-walkthrough.md): ten sub-issue deliverables.
- [`engineering/architecture.md`](engineering/architecture.md): import graph, trust zones and forbidden edges.
- [`engineering/prototype-audit.md`](engineering/prototype-audit.md): read-only prototype inventory and excluded dangerous patterns.
- [`engineering/decisions/spec-conflicts.md`](engineering/decisions/spec-conflicts.md): intentionally unresolved compatibility/specification decisions.
- [`engineering/evidence/issue-1-report.md`](engineering/evidence/issue-1-report.md): local checks, blocked checks and exact reproduction commands.
- [`engineering/registers`](engineering/registers/): machine-readable requirements, constraints, ADRs and launch gates.

## Intended architecture

One Next.js/React/TypeScript **modular monolith**. `src/shared/domain/` contains safe, pure values and limits. `src/domain/` defines separate Content, Composition and Publishing engines and supporting domain-owned ports. `src/application/` will own authorized use cases, `src/infrastructure/` will implement replaceable providers in later issues, and `src/app/` exposes thin web surfaces. Public SSR never imports draft repositories; browsers never import persistence or keys.

## Project restrictions

No testing against live customer data, automatic paid overflow, optional-service auto-activation, fake password account, arbitrary owner scripts, unlicensed prototype media, or claim of independent backups. The intended public URL models and provider choices remain **conditional** until verified on actual infrastructure. No MIT license file has been added because ADR-031 requires an ownership/license audit.
