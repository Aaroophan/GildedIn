# Issue 1 — Verification evidence interpretation

Source: [11 Testing Strategy](../docs/specifications/11-testing-strategy.md), [02 Requirements](../docs/specifications/02-requirements-and-scope.md), [07 Security](../docs/specifications/07-security-design.md). The test status vocabulary is `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `INCONCLUSIVE`. These are **evidence states**, not descriptions of implementation completeness.

| Evidence class | Actual observation | Status | Claim boundary |
| --- | --- | --- | --- |
| Inventory of 97 requirement IDs, original normative text and T-* acceptance IDs | Source-based automated comparison, negative tamper tests | PASS | Inventory and source alignment only, NOT 97 acceptance scenarios |
| ADR-001 to ADR-036 statuses, including Conditional/Pending | Source-based comparison, 36 records | PASS | Historical decision alignment, NOT deployed evidence |
| 18 DEP launch gates retained with no accidental PASS | Registered and source-checked | PASS | Ledger integrity only; **each provider gate itself remains BLOCKED** |
| Domain UUID/slug/validation, input restrictions | Global TypeScript domain check and Node test suite | PASS | Pure foundation behavior, NOT session/account authorization |
| Product limits and UTF-8 canonical release serialization | One-below, exact-cap and one-over tests | PASS | Shared helper behavior, NOT atomic DB quota admission or full publish compiler |
| Architecture import boundaries | Static checker, deliberately forbidden import/cycle fixtures | PASS | Representative static imports; compiler and lint integration pending Issue 2 |
| Source secret/asset omission | Non-credential source scanner plus ZIP inventory | PASS | No high-confidence secrets in shipped source, NOT credential rotation/history audit |
| Synthetic four-persona fixtures, privacy sentinels | Deterministic allowlist fixtures and deliberate leakage detection | PASS | Test data only; the real public and Gilden compiler do not exist yet |
| Next.js server-first shell | Next.js page/proxy source created, TS/TSX syntax parsed using global TypeScript | PASS (syntax only) | **Cannot claim runnable Next build** until dependencies installed |
| `npm ci`, `next build`, runtime browser HTTP and Lighthouse | Network package tarballs unavailable | BLOCKED | No Next module install or browser E2E conducted |
| Actual cross-tenant authorization, real OAuth and host-only cookie | Identity and tenant subsystems are not implemented until Issues 3–5 | NOT RUN / future issues | Placeholders intentionally return 404/503, never tested real auth |
| Wildcard DNS/TLS, Vercel Hobby eligibility, Blob capacity and provider privacy | No live accounts/provider proof; official public terms only | BLOCKED | Launch gates remain NO-GO |
| WCAG manual screen reader/keyboard and reduced-motion device | Static HTML/CSS source; no mounted browser | BLOCKED | Accessibility not certified |
| Font/asset license and MIT | Original media/font binaries omitted, ownership audit not performed | BLOCKED | ADR-031 remains Pending, no license asserted |

**Canonical acceptance IDs (`T-*`) are not automatically PASS** when a narrower foundation test passes. The machine register deliberately leaves their `verificationStatus` as `NOT RUN` until the actual source-11 verification procedures can execute.
