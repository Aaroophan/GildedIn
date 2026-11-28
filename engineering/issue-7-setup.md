# GildedIn — Issue 7 implementation setup

The current source package contains complete previous Issue 1–6 source, twelve normative documents and the current implementation plan. Issue 7 adds the declarative composition model, owned draft mutation API, compiler and safe semantic React renderer. **The public placeholder still cannot publish or read owner drafts; that requires the Issue 13 immutable release and Issue 14 live-policy-attached public renderer.**

## Local isolated checks

```bash
npm run verify:issue7:offline
npm run typecheck:composition
# Additional checks when npm packages can actually be installed and reviewed:
npm ci --ignore-scripts
npm run typecheck:content
npm run typecheck
npm run build
npm run db:prove-issue5-local
npm run test:browser
```

`verify:issue7:offline` uses the Node 22 native TypeScript-stripping test runner, synthetic isolated MongoDB adapters, requirements/boundary/secrets/licenses/CI checkers, and standalone TypeScript domain checks. The `verify:issue7:full` script includes dependent provider/Next/browser proofs and must not be reported as successful unless they really run. No production env or payment card should be used.

## Authoring API

All endpoints are on the trusted apex only, using the existing authenticated session, exact Origin and CSRF request guards. Owner-scoped repository methods revalidate live actor/portfolio inside a transaction and write one private draft using revision CAS and idempotent client-mutation token.

| Method and path | Behavior |
|---|---|
| `GET /api/v1/portfolios/{portfolioId}/draft/composition` | Owner-only version tuple, current revision and canonical authored nodes; private no-store |
| `PUT /api/v1/portfolios/{portfolioId}/draft/composition` | Closed `{schemaVersion:1,nodes:[]}` payload; exact `If-Match: "rev-N"`, `X-Client-Mutation-Id`, session CSRF token; one single-draft CAS |
| `POST /api/v1/portfolios/{portfolioId}/draft/composition/validate` | Authenticated `{}` request; returns status/diagnostics, not a public render plan or raw private content |

Invalid nodes, foreign bindings/assets, unsupported component versions, destructive drift and stale revisions are denied with the existing bounded Issue 6 problem response; private draft state remains unchanged. This does **not** activate any release.

## Implementation navigation

- `src/domain/composition/types.ts`: stable schema, registry/compiler/serializer version tuple, safe plan types
- `src/domain/composition/layout.ts`: bounded geometry, breakpoint policy, controlled CSS generation
- `src/domain/composition/registry.ts`: safe block vocabulary, property schemas and native semantics
- `src/domain/composition/validation.ts`: graph, depth, Hero semantics, actions, property and reference checks
- `src/domain/composition/compiler.ts`: pure validated public-candidate compiler, privacy projections, blockers
- `src/domain/composition/versions.ts`: strict compatibility preflight and legacy-stub handling
- `src/infrastructure/mongodb/content-repository.ts`: authenticated private draft/CAS persistence and owned media validation
- `src/server/composition/http.ts`: request guards, bounded JSON, conditional headers and private no-store responses
- `src/server/composition/semantic-renderer.tsx`: server-first semantic React; trusted nonce, tenant base path and approved media gateway
- `src/ui/composition/client-islands.tsx`: accessible progressive-enhancement tabs/carousel/panel/modal controls
- `tests/unit/issue7-composition.test.ts`, `tests/integration/issue7-composition.test.ts`: deterministic synthetic negative matrix

The user-facing canvas handles/moveable editor belong to **Issue 10**, owner preview/autosave to **Issue 11**, approved asset delivery to **Issue 12**, immutable releases to **Issue 13**, actual public rendering to **Issue 14**, and contact submission to **Issue 17**. Do not silently substitute this private draft API for any of those gates.

## Recorded unresolved contracts

- Prior Issue 6 HTTP `If-Match` draft conflict still returns product **409**; the 409-vs-412 standard-conditional choice requires review under `engineering/decisions/change-control.md` (carried forward).
- Actual `next-auth`/MongoDB official packages are absent from the checked-in dependency lock; a complete Next.js build, React hydration, real MongoDB transactions and OAuth provider paths could not be proven in this offline container.
- Full human accessibility, 320px/400% zoom, browser stored-XSS, actual domain DNS/TLS and release-only authorizations remain **BLOCKED/NOT RUN**, not passed.

Evidence: [Issue 7 report](evidence/issue-7-report.md), [status](evidence/issue-7-status.json), [composition contract](composition/contracts.md).
