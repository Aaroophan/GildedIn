# Issue 6 — local verification, content authoring and release blockers

## Contents

This ZIP is the entire GildedIn project with Issues 1–5 carried forward and Issue 6 implementation. The twelve normative documents and the exact latest `13-implementation-plan.md` remain in `docs/specifications`. The old Issue 5 new-Hero draft was updated to the Issue 6 typed Hero (legacy drafts retain in-memory compatibility until a validated write). No production DB, credentials, provider account or personal uploaded media were included. CI workflow `.github/workflows/verify.yml` was restored from missing uploaded baseline.

## Quick isolated checks (no providers or production data)

```sh
npm run verify:issue6:offline
# includes requirements/ADR checks, boundaries, secrets, lockfile, licenses, CI and ALL isolated tests
```

At this implementation checkpoint: **204 tests passed, 0 failed**, including 50 focused Issue 6 tests and previous Issue 1–5 regressions. No live Mongo server or Google/GitHub calls occur in these tests. Code and test audit details are in `engineering/evidence/issue-6-report.md` and `engineering/evidence/issue-6-status.json`.

`npm run typecheck:domain` covers shared/domain content code. `npm run typecheck:content` covers the content and Mongo persistence adapters, **after** installing local Node type declarations and dependencies. The owner HTTP adapter and Next App Router require the complete dependency installation/build and are not claimed runtime-verified in this environment.

## Inspect the new code

| Concern | Code |
| --- | --- |
| Typed content contract, sections, default Hero, field scopes | `src/domain/content/types.ts`, `model.ts`, `schema.ts` |
| Finite owner commands, explicit migrations | `commands.ts`, `migration.ts` |
| Rich text, project case studies, derived dates | `rich-text.ts`, `projects.ts`, `derived.ts` |
| Safe owner/full public/AI candidate DTOs | `owner-view.ts`, `model.ts` (`projectEligibleContent`) |
| Owned Mongo draft transaction and CAS | `src/infrastructure/mongodb/content-repository.ts` |
| Owner APIs | `src/server/content/http.ts` and `src/app/api/v1/portfolios/[portfolioId]/draft/**` |
| Synthetic tests | `tests/unit/issue6-content.test.ts`, `tests/integration/issue6-content.test.ts` |

## Subsequent workstation / live gates

Use a **trusted machine** with a real npm registry and an isolated disposable test database; **never** use real user data or production credentials. The existing uploaded package files do not install/lock `next-auth` or `mongodb`. First use the already documented Issue 4/5 dependency installation and review, lockfile changes, `npm ci`, followed by `npm run typecheck`, `npm run typecheck:content`, `npm run build`, and controlled local integration/browser checks. **Do not run** any provider test against a production Mongo URI or wildcard host until the prior Issues 3–5 security gates are closed. `npm run verify:issue6:full` is expected to remain BLOCKED until those prerequisites exist.

Before enabling owner registration or public rendering, demonstrate: exact HTTPS Google/GitHub callback and session security; real unique indexes, durable transactions and audited rollback; fresh session check under concurrent suspension; browser host-only cookie/CSRF protection; available rendering/Markdown/diagram-sanitization and accessibility proof; compiled active-release allowlist with actual 102400-byte cap and no private media/field leakage; current moderation and cache revocation; zero-charge eligible provider/DNS/TLS configuration. See the 12 specs, source 11 G-01…G-16 and Issues 7/13/14/19. No production deployment is authorized by Issue 6.
