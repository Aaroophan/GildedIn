# Issue 1 - Establish the specification baseline and executable architecture boundaries

> **GildedIn — Full implementation plan**
> **Document:** `13-implementation-plan.md` · **Status:** implementation roadmap, not evidence that code has been written or deployed · **Source authority:** the twelve GildedIn specifications · **Version:** 1.0.0 · **Prepared:** 2026-11-19.
> **Structure:** exactly **20 main issues**, each with **10 sub-issues**, for **200 sub-issues** in dependency order. Start with Issue 1. Follow the prerequisites and do not close a sub-issue without its stated acceptance evidence.

**Source-of-truth order.** The normative requirements and fixed limits are owned by [02](02-requirements-and-scope.md); security/privacy interpretation by [07](07-security-design.md); data contracts by [05](05-data-model.md); API contracts by [06](06-api-design.md); lifecycle and sync by [08](08-storage-and-sync-strategy.md); UI behavior by [03](03-ui-ux.md); system/container boundaries by [01](01-system-overview.md) and [04](04-c4-diagrams.md); failures/audits by [09](09-error-handling-and-logging.md); provider/deployment gates by [10](10-deployment-strategy.md); test evidence by [11](11-testing-strategy.md); and choice status by [12](12-architecture-decision-record.md). Place this plan beside the twelve documents under their canonical filenames so its relative links resolve.

**Status and exception rule.** `MUST` means a release gate; `SHOULD` requires a documented reviewed exception; `MAY` is optional. Every task starts as **NOT STARTED**. The relevant checks from [11](11-testing-strategy.md) must be recorded as PASS, FAIL, BLOCKED, NOT RUN or INCONCLUSIVE with evidence. Use a `SPEC-CONFLICT` record when sources disagree; never change an expected result merely to match a patch. A provider-dependent feature remains conditional until actual eligibility, privacy, DNS/TLS, billing and runtime tests pass. No issue authorizes a production deployment or paid service by itself.

**Non-negotiable product boundaries.** One Next.js/TypeScript modular monolith; MongoDB with tenant-owned accounts/portfolios, Google OIDC and GitHub OAuth; path-based canonical and subdomain tenant URLs once DNS/TLS proven; free-positioned accessible composition using bounded safe blocks; explicit draft/preview/publish and three immutable revisions; optional release-approved Gilden; no required WebGL; zero new spending, no payment card, no usage overages, no guaranteed backup/uptime, and no production data in tests. Hard limits: 20 authored blocks per portfolio (nested authored nodes included, generated repeater items excluded); depth 3; 20 custom fields/section; 20 items/collection; 102,400 UTF-8 release bytes; 15 MiB original media/portfolio; 30 original files; 1 MiB image and 2 MiB PDF inputs; images at most 4096 × 4096. Only approved content may become public/AI-visible. See [02 §1](02-requirements-and-scope.md).

**Not introduced by this plan.** No native full blogging CMS, payment system, owner-written executable code or shaders, broad OAuth repository permissions, general user scripts, WebSockets/CRDT collaboration, independent AI microservice, vector search cluster, Kafka/RabbitMQ, Kubernetes, mandatory cloud staging environment, paid WAF, guarantee of backups or disaster recovery. Candidate libraries are evaluated behind owned interfaces; this plan does not freeze unverified package versions or service providers.

**Issue execution and evidence contract.** For each sub-issue: (1) inspect its cited sources and predecessor artifacts; (2) implement exactly the specified domain behavior behind typed boundaries; (3) add deterministic positive, negative, authorization and failure tests appropriate to the risk; (4) inspect side effects, not only HTTP or UI status; (5) record code changes, test commands/results, affected requirement/ADR/threat IDs and any provider/manual evidence. A failed, blocked, unknown or untested security invariant cannot be marked complete. Keep source and tests in the same change where practical. No fabricated test or provider evidence.

**Logical phase map (strict issue numbering):**

| Main issue | Implementation milestone                                                             | Primary prerequisites      |
| ---------- | ------------------------------------------------------------------------------------ | -------------------------- |
| **1**      | Establish the specification baseline and executable architecture boundaries          | none                       |
| **2**      | Build isolated development, secure configuration, CI and test foundations            | Issue 1                    |
| **3**      | Implement the MongoDB persistence model and tenant-safe domain repositories          | Issues 1 and 2             |
| **4**      | Implement Google/GitHub authentication, session security and account controls        | Issues 2 and 3             |
| **5**      | Implement portfolio ownership, slug claims and dual-host routing                     | Issues 3 and 4             |
| **6**      | Implement typed content, custom schemas and reusable owner data                      | Issues 3 and 5             |
| **7**      | Implement the declarative composition model and safe responsive renderer             | Issue 6                    |
| **8**      | Build the branded responsive design system and progressive cinematic layer           | Issues 1 and 7             |
| **9**      | Implement public onboarding, account dashboard and owner settings                    | Issues 4–8                 |
| **10**     | Implement the free-positioned visual canvas editor                                   | Issues 6–9                 |
| **11**     | Implement autosaved drafts, optimistic concurrency and protected preview             | Issues 3, 4, 6, 7 and 10   |
| **12**     | Implement secure image/PDF media ingestion, storage quotas and lifecycle             | Issues 3, 4, 6, 11         |
| **13**     | Implement validated immutable publication, cache propagation and restoration         | Issues 6, 7, 11 and 12     |
| **14**     | Implement server-rendered public portfolios, SEO, search and detail pages            | Issues 5, 7, 8 and 13      |
| **15**     | Implement bounded external publishing feeds and public metadata integrations         | Issues 6, 13 and 14        |
| **16**     | Implement Gilden AI as an opt-in release-bound and privacy-safe assistant            | Issues 6, 13–15            |
| **17**     | Implement consent-based contact, privacy-conscious analytics and public discovery    | Issues 5, 9, 13 and 14     |
| **18**     | Implement administration, moderation, privacy rights and account deletion            | Issues 4, 5, 13, 16 and 17 |
| **19**     | Configure portable zero-charge production hosting, protected releases and operations | Issues 1–18                |
| **20**     | Complete cross-cutting assurance, threat regression and production launch handoff    | Issues 1–19                |

**Purpose and architectural rationale.** Establish a reproducible implementation starting point governed by the twelve specifications. Before implementing product capabilities, prove which decisions are fixed, which vendor/library choices remain conditional, and what never enters the codebase. Treat architecture diagrams and test IDs as change-control inputs rather than aspirational illustrations.

**Entry criteria and dependency boundary.** The twelve source documents are accessible and the maintainer can create a working branch in the existing GildedIn repository. **Dependencies:** none. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** A developer can clone, install, navigate bounded modules, identify every binding limit and launch gate, and explain how a proposed change is checked against requirement and threat IDs. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [01 — System Overview](01-system-overview.md), [02 — Requirements And Scope](02-requirements-and-scope.md), [04 — C4 Diagrams](04-c4-diagrams.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.1 - Create a canonical requirements and constraints register

**Objective and implementation boundary.** Translate source 02's MUST, SHOULD, and MAY semantics and fixed product constraints into a source-controlled engineering checklist without silently promoting recommendations into settled decisions.

**Prerequisites.** none. This task establishes a new foundation; do not assume a production environment or previously written module is safe.

**Step-by-step implementation instructions**

1. Extract the 97 canonical requirement IDs with priority and acceptance IDs from source 02 and preserve their original wording.
2. Capture absolute no-spend, one active portfolio, dual URL forms, 20 authored blocks, 20 collection items, three schema levels, 100 KiB release and three retained releases as named constraints.
3. Mark conditional provider, font, license and deployment facts with a status and evidence owner rather than assigning an arbitrary completed state.
4. Cross-link each item to the owning specification and use source 11's PASS, FAIL, BLOCKED and NOT RUN vocabulary.

**Security, privacy and adverse-case handling.** Prevent a scope spreadsheet from turning an unresolved Vercel, storage or OAuth capability into a guarantee. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The register contains all requirement IDs and clearly exposes every unresolved launch prerequisite; an automated inventory diff fails if IDs disappear. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-002`, `OPS-007`, `SEC-001`. Canonical verification: `T-OPS-01`, `T-OPS-02`, `T-OPS-07`, `T-SEC-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.2 - Inventory the existing repository and define a safe working baseline

**Objective and implementation boundary.** Prepare the existing application repository for rebuilding without assuming previously written UI, database methods or runtime behavior are trusted or reusable.

**Prerequisites.** 1.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Record the package manager, lockfile, Next.js and TypeScript constraints, current build commands and workspace layout after inspecting the actual repository.
2. Classify source areas by domain engine, UI, external adapters, assets and experimental/dead code; record what will be retained, replaced or removed without making behavior changes yet.
3. Check all tracked files for credentials, environment files, personal information, proprietary assets and unlicensed fonts before publishing or refactoring.
4. Run any currently working install, lint, typecheck and build commands in a local-only context; record baseline failures instead of assuming they are caused by the new plan.

**Security, privacy and adverse-case handling.** Never deploy or connect the baseline to production data merely to validate its build. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A baseline inventory and reproducible install/build log exist, with known issues and secret/asset exposure addressed or blocked. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-006`, `SEC-011`, `OPS-003`. Canonical verification: `T-SEC-06`, `T-SEC-11`, `T-OPS-03`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 1.3 - Define the modular-monolith dependency map

**Objective and implementation boundary.** Make the three domain engines and supporting services explicit code boundaries inside one Next.js TypeScript application, not three deployments.

**Prerequisites.** 1.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Draw the import/dependency graph from source 04 and identify content, composition, publication, identity/tenancy, public delivery, AI, media, integrations and operations responsibilities.
2. Create domain-facing types and port definitions before wiring infrastructure libraries; keep database drivers and provider SDKs behind adapters.
3. Set module boundary checks so route handlers cannot directly bypass policy by importing unrestricted collection access and public renderers cannot import editor interaction dependencies.
4. Document forbidden imports, server-only modules, shared pure contract modules and a safe folder convention consistent with the existing repository.

**Security, privacy and adverse-case handling.** Reject circular domain imports and a generic data service that accepts arbitrary collection names or owner-supplied Mongo filters. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A dependency check detects representative forbidden imports and the architecture map matches source 04's Level 3 components. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-002`, `SEC-004`, `OPS-002`. Canonical verification: `T-SEC-02`, `T-SEC-04`, `T-OPS-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-001`, `ADR-030`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.4 - Create stable domain identifiers and shared validation primitives

**Objective and implementation boundary.** Implement only framework-neutral identity and validation utilities that every later module can reuse without confusing an account, portfolio, content item or public slug.

**Prerequisites.** 1.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define opaque nominal types or validated constructors for accountId, portfolioId, contentId, nodeId, releaseId, mediaId, operationId and relevant security version values.
2. Centralize canonical slug parsing, UUID/opaque ID parsing, timestamp handling, bounded strings and safe URL classifications without importing Next.js into the domain package.
3. Make all fields entering application commands explicit and reject unknown or dangerous keys, prototypes and Mongo-style operators in untrusted input.
4. Add unit/property tests for invalid IDs, mixed-case slugs, dangerous values and serialization compatibility between server and client.

**Security, privacy and adverse-case handling.** Do not use an email, changeable username or guessable storage path as an owner or permission principal. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Consumers cannot accidentally interchange identifier types; parsers produce typed failures and malicious payload fixtures are rejected. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-001`, `TEN-004`, `SEC-004`. Canonical verification: `T-TEN-01`, `T-TEN-04`, `T-SEC-04`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md).

## Issue 1.5 - Centralize limit units and counting semantics

**Objective and implementation boundary.** Ensure the editor, APIs, compiler and tests share one definition for product caps while the server remains authoritative.

**Prerequisites.** 1.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Encode 3 nested schema levels, 20 custom fields per section, 20 authored visual nodes portfolio-wide, 20 entries per collection, 102400 UTF-8 release bytes and 3 retained releases.
2. Define that nested authored groups count, repeater-generated instances do not, and platform-generated structural wrappers are excluded according to source 02.
3. Encode original-media limits: 15 MiB, 30 files, image input 1 MiB, PDF input 2 MiB, maximum image dimensions 4096 by 4096.
4. Provide pure validators and property-based boundary tests for one-below, exactly-at and one-over conditions, including bulk imports, cloning and concurrent actions.

**Security, privacy and adverse-case handling.** Client counters are explanatory only; never let a user edit configuration to raise server limits. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every counting fixture agrees across validation, owner UI and publication compiler, and violations return stable bounded errors. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `CNT-007`, `EDT-006`, `PUB-001`, `MED-003`. Canonical verification: `T-CNT-02`, `T-CNT-07`, `T-EDT-06`, `T-PUB-01`, `T-MED-03`.

**Security/architecture ownership.** Architectural decisions: `ADR-008`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.6 - Adopt the normative API/error and audit vocabulary

**Objective and implementation boundary.** Create a small contract foundation so later endpoints produce consistent, privacy-safe responses and do not invent incompatible HTTP semantics.

**Prerequisites.** 1.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Extract source 06's /api/v1 namespace, ownership projection rules, operation identifiers, pagination limits and RFC 9457-inspired problem response contract.
2. Define typed domain result/error unions with stable machine codes, correlation IDs and safe end-user messages, keeping raw exceptions on the server and out of logging fields.
3. Document the recorded distinction between 409 draft-domain revision conflicts and RFC-style 412 conditional-header failures; do not silently rewrite either contract.
4. Set mandatory redaction and correlation policies for identity, publication, upload, AI and moderation operations to be implemented by later modules.

**Security, privacy and adverse-case handling.** Never return internal Mongo document payloads, OAuth tokens, stack traces or another tenant's record in error details. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A contract example round-trips through validation, 409/412 behavior is documented for implementation, and redaction checks pass. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-009`, `SEC-004`, `OPS-004`. Canonical verification: `T-EDT-09`, `T-SEC-04`, `T-OPS-04`.

**Security/architecture ownership.** Architectural decisions: `ADR-032`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.7 - Establish architectural decision and exception control

**Objective and implementation boundary.** Make implementation decisions reviewable without requiring organizational overhead or permitting a library choice to override a product invariant.

**Prerequisites.** 1.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Preserve ADR-001 through ADR-036 status and rationale with direct links to their canonical source sections.
2. Add a lightweight decision-change record for conditional vendor selection, release-byte ambiguity, 409 versus 412 handling, and changes affecting security, privacy or stored schema.
3. Require a SPEC-CONFLICT item with two concrete source locations if normative documents disagree, and pause affected implementation rather than choosing whichever is easiest.
4. Define who may approve technical substitutions, who must accept product scope changes, and record ADR-031 MIT licensing as pending until source/asset ownership and license compatibility are audited.

**Security, privacy and adverse-case handling.** A maintainer's preference cannot silently waive a high-risk tenant, privacy or publication requirement. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A sample incompatible provider choice is correctly blocked and a sample harmless dependency update can proceed without an unnecessary new ADR. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-002`, `SEC-001`. Canonical verification: `T-OPS-02`, `T-SEC-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 1.8 - Create initial application shell and route zoning

**Objective and implementation boundary.** Prepare one Next.js App Router application with nonfunctional placeholders for platform, account, dashboard, owner preview and public portfolio surfaces.

**Prerequisites.** 1.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Establish route groups and server components for marketing, sign-in, dashboard, public slug paths and verified subdomain dispatch as described in sources 03 and 06.
2. Keep the critical public content path server-first; isolate interactive client boundaries for the future editor and Three.js enhancements.
3. Reserve server-only policy, configuration and persistence entry points while leaving all protected routes denied or placeholder-only until identity exists.
4. Add smoke checks that unknown paths, draft URLs and unknown hostnames cannot accidentally fall through to public tenant content.

**Security, privacy and adverse-case handling.** Do not treat route-group naming or middleware rewrites as authentication or authorization. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The project builds and serves bounded placeholders, with no protected data path and with route groups mapped to their documented surface class. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-007`, `EDT-010`, `SEO-001`, `OPS-002`. Canonical verification: `T-TEN-07`, `T-EDT-10`, `T-SEO-01`, `T-OPS-02`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [03 — Ui Ux](03-ui-ux.md), [04 — C4 Diagrams](04-c4-diagrams.md), [06 — Api Design](06-api-design.md), [10 — Deployment Strategy](10-deployment-strategy.md).

## Issue 1.9 - Define synthetic reference portfolios and privacy sentinels

**Objective and implementation boundary.** Build predictable examples for testing the future content, editor, rendering, SEO and AI pipeline without importing real user records.

**Prerequisites.** 1.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Design synthetic novice, developer, designer and freelancer portfolios with short and long content, empty optional sections, varied images and category structures.
2. Use consistent fake account/portfolio IDs, cross-tenant pairs and deliberately private sentinel values in draft, reference, inbox and AI-denied fields.
3. Create fixtures for long headings, RTL-like text strings as stress content only, reduced motion, difficult aspect ratios, high zoom and keyboard traversal without promising multilingual support.
4. Version the fixtures and document expected visibility/AI approval for each field; make generation deterministic for tests.

**Security, privacy and adverse-case handling.** Do not include real OAuth accounts, personal CV references, private correspondence, chat bodies or production DB exports. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Fixtures are reproducible and a test can detect whether a private sentinel is ever emitted into a public projection. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-001`, `CNT-006`, `EDT-003`, `SEC-008`. Canonical verification: `T-CNT-01`, `T-CNT-06`, `T-EDT-03`, `T-SEC-08`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 1.10 - Create a feasibility and release-blocker ledger

**Objective and implementation boundary.** Make zero-spend/provider eligibility, wildcard routing, training-use opt-out, library licensing and database atomicity explicit risks early in development.

**Prerequisites.** 1.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Extract all conditional feasibility gates from sources 10 and 12, including Vercel Hobby terms, tenant-data training opt-out, DNS nameservers/certificates, MongoDB tier capabilities and object storage hard-stop billing.
2. For each gate, record the evidence needed, affected features, fallback/provider-neutral boundary and last responsible decision point.
3. Research only through official current provider terms or live isolated proofs when needed; avoid activating paid services or submitting production customer data for experiments.
4. Add a go/no-go column so a later issue cannot label a capability implemented merely because a mock passed.

**Security, privacy and adverse-case handling.** Never connect a payment card or select an implicitly billable storage or AI provider to meet a target. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every conditional gate has a named verification procedure and a blocked-state fallback; no deployment eligibility is claimed without real evidence. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-002`, `OPS-007`, `SEC-012`. Canonical verification: `T-OPS-01`, `T-OPS-02`, `T-OPS-07`, `T-SEC-12`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

# Issue 2 - Build isolated development, secure configuration, CI and test foundations

**Purpose and architectural rationale.** Create the zero-production-data development and verification environment. A test process must fail before connection when given production settings, and untrusted pull-request code must never see deployment credentials. Establish the secure HTTP, configuration, secret and audit conventions that later functionality can use.

**Entry criteria and dependency boundary.** Issue 1 establishes accepted contracts, skeleton and constraints; no remote production credentials are needed. **Dependencies:** Issue 1. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Typed local configuration, isolated synthetic tests, protected CI checks, redacted diagnostics, baseline browser security and actionable pipeline failure reports exist. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 2.1 - Define typed application environment configuration

**Objective and implementation boundary.** Validate environment values at process startup so missing secrets, ambiguous hostnames and unsafe feature flags cannot yield permissive defaults.

**Prerequisites.** 1.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create a Zod-backed server configuration contract for local/test/production modes, canonical origin, domain/wildcard flag, database, storage, OAuth, Redis, Groq and feature switches specified in source 10.
2. Use safe placeholder-only .env.example files and separate server secrets from public build-time values; reject credentials in NEXT_PUBLIC variables.
3. Validate absolute zero-charge configuration flags and ensure optional provider integration starts disabled until eligibility checks pass.
4. Test malformed URLs, missing secrets, cross-host callback mismatches, undefined environment variables and an accidental production database URI in test mode.

**Security, privacy and adverse-case handling.** Do not log parsed secret values or continue with insecure defaults when an authoritative dependency is missing. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A startup validation test fails closed on unsafe environments and a redacted configuration report is usable by reviewers. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-003`, `SEC-006`, `SEC-011`. Canonical verification: `T-OPS-01`, `T-OPS-03`, `T-SEC-06`, `T-SEC-11`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.2 - Build a production-connection denylist for tests

**Objective and implementation boundary.** Make it technically difficult for unit, integration or browser tests to modify real tenant data.

**Prerequisites.** 2.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create local disposable MongoDB identities or isolated synthetic database fixtures; implement a test bootstrap guard checking APP_ENV, database URI/name, network hostname and recognized production indicators.
2. Prevent production object-store, OAuth, Redis and Groq credentials from loading in the test process; provide controllable adapters and fake clock for deterministic cases.
3. Require test-generated IDs and unique namespaces, with cleanup that can operate only inside validated test scope.
4. Add an adversarial test that injects a production-style URI and proves the test process exits before any socket or write attempt.

**Security, privacy and adverse-case handling.** Do not create a separate hosted testing environment or disguise a production connection as development. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All test commands are safe by construction and fail immediately on suspect configuration, including in CI forks. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-003`, `SEC-011`. Canonical verification: `T-OPS-03`, `T-SEC-11`.

**Security/architecture ownership.** Architectural decisions: `ADR-029`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 2.3 - Bootstrap unit, integration and browser test runners

**Objective and implementation boundary.** Install only the test stack warranted by source 11 and give junior developers repeatable local commands.

**Prerequisites.** 2.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Configure Vitest for pure-domain tests and isolated database/API integration suites, and Playwright for critical browser and authenticated editor journeys.
2. Add axe-based automated accessibility probes and Lighthouse CI with controlled representative public fixtures and performance budgets.
3. Set a common fixture factory, deterministic clock/network responses and structured PASS/FAIL/BLOCKED evidence output for each suite.
4. Separate quick pull-request checks from manual-device and periodic broader performance runs to respect free CI limits.

**Security, privacy and adverse-case handling.** Do not use mocks as proof of real DNS, CDN, TLS, OAuth-provider or media-provider behavior. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A fresh clone runs smoke suites with synthetic data and intentionally failing security tests block the check. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-001`, `OPS-003`, `PRF-001`. Canonical verification: `T-SEC-01`, `T-OPS-03`, `T-PRF-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.4 - Implement base request validation and origin controls

**Objective and implementation boundary.** Protect the server ingress before adding state-changing endpoints, while explicitly accounting for hostile tenant subdomains.

**Prerequisites.** 2.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create shared helpers for method, body-size, content-type, exact Origin, Fetch Metadata and CSRF validation appropriate to authenticated apex mutations.
2. Define default-deny credentialed CORS and trust only host information from the reviewed deployment edge; reject arbitrary forwarded-host claims.
3. Limit request/query sizes and validate supported content types before constructing rich domain commands; ensure response headers use route-specific cache policies.
4. Write test requests from a malicious sibling subdomain, forged host, invalid preflight and missing CSRF proof and assert denial before persistence calls.

**Security, privacy and adverse-case handling.** A host-only cookie does not prevent same-site cross-subdomain CSRF, and CORS is not an authorization boundary. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Server request adapters return the documented errors and adversarial cross-origin calls cause no durable effects. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-003`, `SEC-004`, `TEN-007`. Canonical verification: `T-SEC-03`, `T-SEC-04`, `T-TEN-07`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.5 - Establish server-only secret and crypto primitives

**Objective and implementation boundary.** Define safe handling for OAuth/session secrets, provider keys, token hashes and key rotation without choosing unsupported paid key-management infrastructure.

**Prerequisites.** 2.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use runtime secret injection from the selected host and narrowly scoped database/provider credentials; keep actual secrets out of source, CI artifacts and test reports.
2. Create approved cryptographic helpers for opaque session verifier hashes, random one-time values and timing-safe comparisons using maintained platform APIs.
3. Define rotation behavior for session signing, provider credentials and compromised tokens, with a documented invalidate/revoke path.
4. Add secret-canary tests verifying no credentials appear in client bundles, error responses, logs, source maps or user-visible configuration.

**Security, privacy and adverse-case handling.** Do not invent custom encryption schemes, expose raw session tokens to analytics or claim at-rest encryption solves tenant authorization. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A key-rotation exercise is documented and test probes find no canary value in public/client surfaces. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-006`, `SEC-011`, `IAM-005`. Canonical verification: `T-SEC-06`, `T-SEC-11`, `T-IAM-05`.

**Security/architecture ownership.** Threats: `TH-27`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.6 - Create privacy-safe structured logging and request correlation

**Objective and implementation boundary.** Enable future diagnosis without recording portfolio body content, visitor conversations or secrets.

**Prerequisites.** 1.6 2.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define request/correlation IDs, operation IDs, trusted timestamp, route class, redacted error code, actor-category and bounded outcome fields.
2. Implement one allowlisted logging adapter for routes and domain services that neutralizes control characters and drops request bodies, cookies, OAuth tokens, private contact text and AI prompts.
3. Set severity levels and privacy-safe fallback behavior when the runtime sink is unavailable; distinguish runtime logs from durable restricted security audit records.
4. Test malicious log newlines, long values, private sentinel strings, unexpected exception objects and unavailable log sinks.

**Security, privacy and adverse-case handling.** Log persistence cannot become a prerequisite that accidentally causes security checks to fail open. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Synthetic failure logs remain useful for correlation and contain no disallowed sensitive fields. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-004`, `SEC-010`, `AI-008`. Canonical verification: `T-OPS-04`, `T-SEC-10`, `T-AI-08`.

**Security/architecture ownership.** Threats: `TH-31`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.7 - Implement the durable security audit event port

**Objective and implementation boundary.** Prepare a bounded, restricted audit sink for actions that must be attributable and reviewable.

**Prerequisites.** 2.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define event taxonomy for provider link/unlink, session revocation, account deletion, publication, AI approval changes, moderation and administrator access.
2. Store only necessary actor, tenant, operation, timestamp, result and reason code fields with least-privilege retrieval; no raw chat, contact bodies or secrets.
3. Specify which security-changing operations cannot claim success if required audit persistence fails, and make retry behavior idempotent.
4. Test event write failure, unauthorized audit reads, duplicate event keys and retention constraints.

**Security, privacy and adverse-case handling.** The admin UI must not become an unfiltered window into private tenant records. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Audit records are bounded, owner/admin accessible only by policy and linked to the corresponding operation ID. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-010`, `OPS-004`, `ADM-003`. Canonical verification: `T-SEC-10`, `T-OPS-04`, `T-ADM-03`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.8 - Add dependency, secret and license checking to CI

**Objective and implementation boundary.** Protect the open-source supply chain before allowing outside contributions or enabling privileged releases.

**Prerequisites.** 2.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add lockfile fidelity checks, TypeScript compile, lint, dependency advisories, license inventory and repository secret detection to pull-request CI.
2. Pin reviewed GitHub Actions by full immutable commit SHA, set least-privilege permissions and disable credential persistence on checkout where applicable.
3. Run untrusted PR builds without deployment/provider secrets and require explicit approval for privileged release jobs.
4. Classify critical/high exploitable dependency issues as blockers; record review of false positives and noncritical warnings rather than blindly failing every informational result.

**Security, privacy and adverse-case handling.** Never let a fork PR workflow run reviewed production tokens or upload secret-bearing build artifacts. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** An intentionally vulnerable fixture or fake secret produces a blocking report and a fork PR cannot read protected configuration. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-006`, `SEC-011`, `OPS-003`. Canonical verification: `T-SEC-06`, `T-SEC-11`, `T-OPS-03`.

**Security/architecture ownership.** Threats: `TH-28`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 2.9 - Specify security response headers and private cache defaults

**Objective and implementation boundary.** Create reusable route policy profiles for public pages, private dashboard, owner preview, API responses, media and approved external embeds.

**Prerequisites.** 2.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Document CSP directives and nonce/hash strategy compatible with server rendering, allowed fonts/images and restricted iframe origins from source 07.
2. Set no-store for authentication, draft, preview, inbox, audit and owner APIs; make private data ineligible for public edge caching.
3. Apply safe MIME-sniffing, framing/referrer and TLS transport headers as applicable; do not apply HSTS includeSubDomains before wildcard host readiness is proven.
4. Test that public UGC cannot inject scripts and that sensitive responses are never served as shared cache hits.

**Security, privacy and adverse-case handling.** Broad CSP exceptions such as unsafe-eval or arbitrary third-party scripts are not approved merely to make animation libraries work. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Header snapshots and browser checks cover every route class, with unresolved CSP library requirements recorded as blockers. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-003`, `SEC-007`, `TEN-009`. Canonical verification: `T-SEC-03`, `T-SEC-07`, `T-TEN-09`.

**Security/architecture ownership.** Architectural decisions: `ADR-026`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 2.10 - Establish protected branches and an evidence-driven release workflow

**Objective and implementation boundary.** Make every later issue mergeable only after relevant tests while avoiding unnecessary enterprise process overhead.

**Prerequisites.** 2.3 2.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define main integration/protected branch conventions, pull request template fields for requirements, threats, tests, screenshots and migration or rollback impact.
2. Attach fast CI jobs from earlier subtasks and document which verification classes remain manual or must be run against actual production configuration.
3. Set reviewed-only production environment permissions; create release checklist entries tied to source 10 deployment gates and source 11 G-01 through G-16.
4. Dry-run an intentionally failing PR, a credential-free fork contribution and a rollback-only review to ensure enforcement behaves as intended.

**Security, privacy and adverse-case handling.** A green GitHub build is not proof that the application is eligible for the host or secure behind wildcard DNS. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** CI and branch protection prevent obvious unreviewed promotion, while the operator retains a documented manual go/no-go gate. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-003`, `SEC-011`, `OPS-007`. Canonical verification: `T-OPS-03`, `T-SEC-11`, `T-OPS-07`.

**Consult before implementation:** [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

# Issue 3 - Implement the MongoDB persistence model and tenant-safe domain repositories

**Purpose and architectural rationale.** Create the typed persistence layer before authentication routes and owner CRUD are wired. Enforce uniqueness, owner-scoping and live policy state where the data originates. Treat MongoDB single-document atomicity separately from multi-record workflows and do not assume free-tier transactions or change streams without testing.

**Entry criteria and dependency boundary.** Issues 1 and 2 provide contract types, test isolation and configuration; a local disposable database is available. **Dependencies:** Issues 1 and 2. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** All required persistent aggregates, validators, indexes, repository interfaces and concurrency tests work in isolation with two synthetic tenants and fail closed when assumptions are violated. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 3.1 - Define physical collection inventory and access ownership

**Objective and implementation boundary.** Translate the logical ER model into persistence records without turning embedded content nodes into arbitrary globally writable collections.

**Prerequisites.** 1.3 2.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement the source 05 inventory including accounts, providerIdentities, sessions, portfolios, slugClaims, drafts, releases, publishOperations, mediaAssets and uploadReservations.
2. Include aiContexts, moderationPolicies, contactMessages, analyticsDaily, externalFeeds, abuseReports, auditEvents and deletionOperations where their specified features require them.
3. Keep sections, collection items and visual nodes embedded in owned drafts and compiled releases, as the source model prescribes.
4. Document who can read/write each collection and which operations require server-enforced owner, policy and status predicates.

**Security, privacy and adverse-case handling.** Do not expose generic JSON CRUD endpoints or permit caller-controlled collection names. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Collection schemas and ownership descriptions match source 05, with no unscoped data-access path in domain modules. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-001`, `TEN-002`, `SEC-002`. Canonical verification: `T-TEN-01`, `T-TEN-02`, `T-SEC-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-003`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md).

## Issue 3.2 - Implement stable MongoDB identity, session and slug indexes

**Objective and implementation boundary.** Make database uniqueness a final backstop for identity collision, double portfolio creation and username hijacking.

**Prerequisites.** 3.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add unique compound index on provider plus stable subject, and appropriate indexes for sessions and account state per source 05.
2. Enforce unique normalized slugClaim including current and historical aliases and one active first-release owner portfolio using the documented database predicates.
3. Add tenant plus status and publication lookup indexes based on measured queries, keeping Atlas free-tier index storage in mind.
4. Test concurrent inserts and deliberately conflicting case variants; ensure duplicate-key errors become safe typed conflicts.

**Security, privacy and adverse-case handling.** Indexes do not authorize access and should never substitute for actor scoping in repository methods. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One writer wins each collision; historical slug claims cannot be stolen; index inventory is reproducible. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-002`, `TEN-003`, `TEN-004`, `TEN-005`. Canonical verification: `T-IAM-02`, `T-TEN-03`, `T-TEN-04`, `T-TEN-05`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.3 - Build strict persistence validators and serialized document versions

**Objective and implementation boundary.** Prevent malformed or future-version data from silently bypassing app validation or crashing the public compiler.

**Prerequisites.** 3.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define runtime parsers for persisted account, portfolio, draft, release and policy documents with explicit schemaVersion and appropriate defaults only for safe optional fields.
2. Add MongoDB collection validators where supported, matching the application schema and immutable-only fields.
3. Reject unknown top-level security fields and dangerous keys; bound nested arrays and strings in accordance with the product caps.
4. Provide versioned read/migration handling for supported previous schema versions and a quarantine/error path for incompatible records.

**Security, privacy and adverse-case handling.** Never automatically interpret unknown stored executable fields or silently strip authorization metadata during migration. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Malformed fixtures produce controlled errors, and known good versions round-trip through parser/serializer tests. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `SEC-004`, `PUB-001`. Canonical verification: `T-CNT-02`, `T-SEC-04`, `T-PUB-01`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.4 - Create actor-scoped repository interfaces

**Objective and implementation boundary.** Centralize all tenant-private queries behind methods requiring an authenticated actor and stable portfolio identity.

**Prerequisites.** 3.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement typed methods such as getOwnedPortfolio, getOwnedDraft, compareAndSave, listOwnedMedia and getOwnedRelease using server-constructed predicates.
2. Keep session/role resolution in the identity boundary and require explicit ownership policy before each sensitive record access.
3. Provide separate public-release readers that take a verified portfolio resolution plus live policy, never owner draft repositories.
4. Write two-tenant mutation/read tests for every method including forbidden nested-field and projection access.

**Security, privacy and adverse-case handling.** Never accept raw Mongo filters, caller-defined projection, arbitrary update operators or a client-supplied ownerAccountId. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** No repository exposes a foreign tenant record, even with guessed matching IDs or malicious filters. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-002`, `SEC-002`, `SEC-004`. Canonical verification: `T-TEN-02`, `T-SEC-02`, `T-SEC-04`.

**Security/architecture ownership.** Threats: `TH-05`.

**Consult before implementation:** [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.5 - Implement authoritative portfolio control and current-policy storage

**Objective and implementation boundary.** Define exactly where a public URL's current visibility, moderation, active release and security generation are checked.

**Prerequisites.** 3.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create portfolio control record with stable owner, canonical slug mirror, activeReleaseId, visibility and current security/policy version as described in source 05.
2. Separate moderator-imposed suppression and owner disable from immutable release payload; define deny-on-unknown live policy behavior.
3. Implement atomic conditional policy updates and document projected fields required for public, AI and admin checks.
4. Add tests with cached older release fixtures and missing/unavailable policy to ensure no allow-by-staleness path.

**Security, privacy and adverse-case handling.** A cache cannot be used as an authorization store and unlisted does not become private. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The policy service returns current decisions or denies safely, independent of content caching. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-009`, `PUB-007`, `AI-004`, `ADM-001`. Canonical verification: `T-TEN-09`, `T-PUB-07`, `T-AI-04`, `T-ADM-01`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 3.6 - Implement draft aggregate with atomic revision comparison

**Objective and implementation boundary.** Provide a source-of-truth editable snapshot and a compare-and-swap write primitive for later autosaving.

**Prerequisites.** 3.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Store a full owned draft containing embedded typed content, composition, revision, schema/renderer versions and nonpublic design configuration.
2. Implement conditional update against expected revision and owner/portfolio constraints; increment revision in one atomic document write.
3. Record or detect clientMutationId retries without duplicating a successful logical edit and return the authoritative revision.
4. Test two simultaneous writers, stale expected revisions, lost acknowledgments and the exact one-write-wins outcome.

**Security, privacy and adverse-case handling.** Do not use updatedAt timestamps as revision tokens or allow a write to activeReleaseId through a draft API. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Concurrent updates never silently overwrite; revision and mutation identity are reflected in typed results. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `PUB-002`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-PUB-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-005`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.7 - Define immutable release and publication-operation repositories

**Objective and implementation boundary.** Support prepared releases and idempotent publishing without allowing public readers to observe unactivated objects.

**Prerequisites.** 3.5 3.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create write-once release records keyed by portfolioId/releaseId and versioned compiler/serializer metadata.
2. Create publishOperations unique by owner/portfolio/idempotency key hash, with snapshot revision, operation stage, created release and propagation status.
3. Implement protected create-if-absent, status retrieval and atomic active-pointer compare/update operations; do not yet wire full publication logic.
4. Test duplicate operation keys, immutable update rejection and a crash between inserting a release and activating its pointer.

**Security, privacy and adverse-case handling.** A prepared release is not public because it exists in the database; only the active pointer plus live policy authorizes delivery. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Repositories support an idempotent prepare/activate protocol with no mixed or prematurely visible release. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `PUB-002`, `PUB-003`. Canonical verification: `T-PUB-01`, `T-PUB-02`, `T-PUB-03`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.8 - Define media records and atomic quota reservation storage

**Objective and implementation boundary.** Prepare physical metadata and global capacity accounting for future storage without trusting a browser-provided file size.

**Prerequisites.** 3.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Model mediaAssets, uploadReservations, state transitions, scoped storage keys, verified bytes, original/variant references and ownership.
2. Create bounded per-portfolio and global quota counters/reservations with conditional admission and expiry semantics.
3. Model reference scanning across draft and three retained releases; ensure variants consume physical provider allowance without multiplying original file counts.
4. Simulate parallel reservation bursts at cap and failed uploads, and show no overshoot or permanently stuck reservation.

**Security, privacy and adverse-case handling.** No public object URL is issued while an asset is staged, rejected or not approved for publication. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Atomic reservation operations and reference queries behave safely under concurrency and error replay. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-003`, `MED-004`. Canonical verification: `T-MED-01`, `T-MED-03`, `T-MED-04`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.9 - Define TTL/read-time privacy and low-cardinality aggregate records

**Objective and implementation boundary.** Provide persistence for expiring contact data, audit metadata, feed previews, AI usage and analytics without creating visitor profiles.

**Prerequisites.** 3.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define expiresAt and read-time checks for contact messages, temporary upload reservations and limited audit/security retention according to source 05.
2. Model aggregate daily counters by portfolio/metric/day, not long-lived visitor identifiers or per-user browsing logs.
3. Store feed preview metadata and aiContexts with explicit release/policy provenance; never store visitor chat transcripts or provider prompts in these collections.
4. Test overdue TTL documents that still physically exist and verify owner API and public projections suppress them.

**Security, privacy and adverse-case handling.** Mongo TTL cleanup timing is best effort, not immediate privacy protection; read-time filtering is mandatory. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Expired/suppressed records are inaccessible before physical deletion and all aggregate schemas exclude raw visitor message bodies. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CON-001`, `ANA-001`, `AI-008`, `OPS-004`. Canonical verification: `T-CON-01`, `T-ANA-01`, `T-AI-08`, `T-OPS-04`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 3.10 - Prove selected MongoDB tier consistency and migration behavior

**Objective and implementation boundary.** Resolve the storage assumptions that could otherwise undermine publication or slug claims in production.

**Prerequisites.** 3.1 3.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Execute targeted local tests for atomic single-document writes, unique-index races, conditionally updated control fields and partial multi-record operation recovery.
2. Check transaction/session/change-stream availability of the actual eligible free tier before relying on any of those features; retain an idempotent recovery protocol when unsupported.
3. Document reversible, additive schema migrations and compatibility with an already published release across application deploy/rollback.
4. Record measured query/index sizes against 100–500 active portfolio planning fixtures without promising that the free tier guarantees capacity.

**Security, privacy and adverse-case handling.** Do not introduce a message broker or require a paid database tier to make the design appear scalable. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Persistence proof records and migration rehearsal show safe semantics independent of optimistic vendor assumptions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-002`, `PUB-003`, `OPS-001`, `OPS-005`. Canonical verification: `T-PUB-02`, `T-PUB-03`, `T-OPS-01`, `T-OPS-05`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

# Issue 4 - Implement Google/GitHub authentication, session security and account controls

**Purpose and architectural rationale.** Build real account identity only after the persistence and request-security boundaries exist. OAuth must bind to stable provider subjects; email cannot silently merge identities. All owner and administrator actions use revocable host-only sessions on the apex hostname with explicit checks for sensitive mutations.

**Entry criteria and dependency boundary.** Issues 2 and 3 provide guarded configuration, request policies, identity indexes and audit records. **Dependencies:** Issues 2 and 3. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** A user can register/sign in, link/unlink safely, revoke sessions and complete protected account actions without exposing tokens or enabling cross-subdomain cookie/CSRF attacks. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 4.1 - Configure Google OIDC with validated callback and account mapping

**Objective and implementation boundary.** Implement Google login through the established Auth.js/OIDC integration and stable issuer/subject mapping.

**Prerequisites.** 3.2 2.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Register exact approved callback/redirect URLs for local and eligible production hosts, with provider credentials stored only on the server.
2. Validate state, PKCE/nonce/issuer as appropriate for the selected library flow and reject unapproved redirect targets.
3. Persist the stable provider subject in providerIdentities and create the account only under unique-index protection.
4. Test tampered state, expired code, reused callback, alternate issuer and a new account with the same email as another provider.

**Security, privacy and adverse-case handling.** Never use email text alone to authorize ownership or to determine that two provider identities are the same person. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Realistic mock/provider flows produce one stable account and all expected callback attacks are rejected. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-002`, `SEC-003`. Canonical verification: `T-IAM-01`, `T-IAM-02`, `T-SEC-03`.

**Security/architecture ownership.** Threats: `TH-02`; Architectural decisions: `ADR-004`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.2 - Configure GitHub OAuth and email-minimizing signup

**Objective and implementation boundary.** Support GitHub login without presuming a public or verified email and without demanding repository-wide access.

**Prerequisites.** 4.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Configure GitHub OAuth scopes only for identity and verified email when genuinely needed; persist provider ID from authenticated response.
2. Allow a verified GitHub identity without public email, while disabling operations that actually require a verified address until the owner provides one through approved verification.
3. Handle denied scopes, missing primary email, callback failure and duplicate-subject collision with controlled non-disclosing errors.
4. Test GitHub identity reuse and email collision with independently registered Google accounts.

**Security, privacy and adverse-case handling.** Authentication is not permission to access private repositories, and unverified email must never merge accounts. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** GitHub sign-in yields stable account mapping without broad scopes or silent email-based linking. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-002`, `IAM-009`. Canonical verification: `T-IAM-01`, `T-IAM-02`, `T-IAM-09`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.3 - Implement revocable apex-only authenticated sessions

**Objective and implementation boundary.** Protect owner/admin requests from session theft, fixation and sibling-subdomain cookie exposure.

**Prerequisites.** 4.1 3.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use opaque server-verifiable session records with expiry, rotation and revocation behavior specified by source 07.
2. Set Secure, HttpOnly, host-only SameSite cookies with \_\_Host- semantics where compatible, never Domain=.aaroophan.dev.
3. Implement sign-out, session invalidation after account security changes and protected resource checks on every server entry.
4. Capture browser cookie headers on both apex and actual tenant subdomains in tests, including session renewal and logout.

**Security, privacy and adverse-case handling.** A session cookie existing in a request is not proof of portfolio ownership or current account eligibility. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Cookies never reach tenant subdomains; revoked/expired sessions cannot call protected APIs or actions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-005`, `SEC-003`, `TEN-002`. Canonical verification: `T-IAM-05`, `T-SEC-03`, `T-TEN-02`.

**Security/architecture ownership.** Threats: `TH-03`; Architectural decisions: `ADR-010`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.4 - Implement cross-subdomain CSRF and origin hardening

**Objective and implementation boundary.** Ensure tenant-controlled sibling subdomains cannot exploit same-site cookies to mutate apex account or portfolio state.

**Prerequisites.** 2.4 4.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Apply exact allowed Origin validation, appropriate CSRF tokens, Fetch Metadata and default-deny credentialed CORS to apex state-changing endpoints.
2. Do not assume SameSite alone blocks a form post from alex.aaroophan.dev to aaroophan.dev.
3. Make callback-specific exceptions narrow, documented and tested without opening wildcard origins.
4. Test POST/form/fetch from a malicious tenant subdomain, unknown hosts, spoofed Origin and CORS preflight variations.

**Security, privacy and adverse-case handling.** Authorization must run again inside Server Actions even when route middleware or the UI already checked the request. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Cross-subdomain attempts are denied before side effects and ordinary login flows remain functional. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-005`, `SEC-003`, `SEC-002`. Canonical verification: `T-IAM-05`, `T-SEC-03`, `T-SEC-02`.

**Security/architecture ownership.** Threats: `TH-04`, `TH-41`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.5 - Implement explicit authenticated provider linking

**Objective and implementation boundary.** Allow a signed-in owner to link Google/GitHub identities only after proving control of the additional provider subject.

**Prerequisites.** 4.1 4.2 4.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement link-intent creation bound to current account, session, provider, nonce and short expiry per source 06.
2. Require current-session verification and fresh OAuth proof of the target provider before linking, with replay protection and audit events.
3. Reject attempts to link a subject already owned by another account unless a separate deliberate control-of-both reconciliation path is correctly approved.
4. Test two accounts with same email, two tabs linking concurrently, expired intent, callback switching and replay.

**Security, privacy and adverse-case handling.** Do not automatically merge an existing account simply because the provider returned a matching email address. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One provider subject maps to one verified account and link operations are auditable, idempotent and race safe. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-003`, `IAM-002`, `SEC-010`. Canonical verification: `T-IAM-03`, `T-IAM-02`, `T-SEC-10`.

**Security/architecture ownership.** Threats: `TH-01`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.6 - Implement unlink, last-provider protection and reauthentication

**Objective and implementation boundary.** Prevent owners from accidentally locking themselves out or losing control through an unsafe provider unlink action.

**Prerequisites.** 4.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Expose owned provider summary without tokens and require recent provider-confirmed authentication for unlink operations.
2. Within the same consistency boundary, verify another functional verified login provider remains attached before unlinking.
3. Revoke or rotate affected session/security generation and audit the action after successful unlink.
4. Test simultaneous removal from two tabs, last identity removal, stolen/replayed unlink intent and unavailable provider proof.

**Security, privacy and adverse-case handling.** Never allow an HTTP race that removes both login methods or trust a client-provided last-provider count. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Last-provider removal returns a safe conflict and the account always retains a verified sign-in route. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-004`, `IAM-008`, `SEC-010`. Canonical verification: `T-IAM-04`, `T-IAM-08`, `T-SEC-10`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.7 - Add recent-auth checks for sensitive owner operations

**Objective and implementation boundary.** Require proof of recent identity before high-impact account or security actions without making ordinary editing onerous.

**Prerequisites.** 4.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement a reusable requireRecentAuthentication guard for account deletion, provider unlink, ownership-sensitive actions and administrator changes.
2. Bind proof to the correct session/account and recent-auth time; reject replay, stale proof or a proof from another browser session.
3. Ensure protected API and Server Action entrypoints call the guard rather than hiding critical buttons only in the UI.
4. Test forced account deletion with stale session and an alternate session's recent-auth token.

**Security, privacy and adverse-case handling.** Do not interpret local UI state or an outdated signed cookie as equivalent to a fresh provider proof. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Sensitive endpoints fail without recent-auth evidence and success is recorded without logging credentials. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-008`, `SEC-003`, `ACC-002`. Canonical verification: `T-IAM-08`, `T-SEC-03`, `T-ACC-02`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.8 - Implement account profile and no-portfolio state

**Objective and implementation boundary.** Support legitimate accounts with no portfolio and safe self-service profile reads/updates.

**Prerequisites.** 4.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement GET/PATCH /api/v1/accounts/me with explicit editable field allowlist and safe private projection.
2. Keep platform role, provider identity, verified email, session secrets and created timestamps server controlled.
3. Return a clear no-portfolio state so onboarding can begin in Issue 9 without assuming an existing draft.
4. Test mass assignment of platformRoles and unauthorized profile reads by a different session.

**Security, privacy and adverse-case handling.** Never serialize all database fields as the profile DTO. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Signed-in users can view their own metadata and safely transition to onboarding even with no portfolio. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-007`, `SEC-002`, `SEC-004`. Canonical verification: `T-IAM-07`, `T-SEC-02`, `T-SEC-04`.

**Security/architecture ownership.** Threats: `TH-06`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.9 - Provision platform administrator with trusted audited bootstrap

**Objective and implementation boundary.** Create the initial administrator intentionally rather than elevating the first public registrant.

**Prerequisites.** 4.5 2.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement a controlled, repeatable administrator assignment procedure tied to a verified internal account identity and verified operator access.
2. Require recent authentication for admin changes and record privileged role mutations in restricted audit events.
3. Ensure public signup and account profile DTOs cannot specify, return as privileged permission, or modify platform role claims.
4. Test two simultaneous public signups, forged admin field, unauthorized route access and bootstrap replay.

**Security, privacy and adverse-case handling.** Do not place a permanent bootstrap password or admin account secret in Git history. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Exactly the intended identity gains admin authority; all other accounts remain owners/visitors by policy. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-006`, `SEC-002`, `SEC-010`. Canonical verification: `T-IAM-06`, `T-SEC-02`, `T-SEC-10`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 4.10 - Verify identity, session and account negative matrix

**Objective and implementation boundary.** Close the identity phase with end-to-end proofs before any user content can be written in production.

**Prerequisites.** 4.1 4.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-IAM-01 through T-IAM-09 against local mocks and, where safe, real provider sandbox configuration.
2. Test OAuth redirect mistakes, cookie scope, CSRF, provider collision, stale reauth, logout, no-portfolio state and simultaneous linking/unlinking.
3. Inspect response bodies, cookies, database identities and audit events for hidden side effects and leaked secrets.
4. Mark provider-configuration-specific cases BLOCKED until real callback/DNS evidence exists rather than treating mocks as production pass.

**Security, privacy and adverse-case handling.** Any exploitable authentication or cross-origin failure blocks later public user registration. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All identity acceptance IDs have evidence and the remaining external proof requirements are explicitly tracked for Issue 19. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-002`, `IAM-003`, `IAM-004`, `IAM-005`, `IAM-006`, `IAM-007`, `IAM-008`, `IAM-009`. Canonical verification: `T-IAM-01`, `T-IAM-02`, `T-IAM-03`, `T-IAM-04`, `T-IAM-05`, `T-IAM-06`, `T-IAM-07`, `T-IAM-08`, `T-IAM-09`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 5 - Implement portfolio ownership, slug claims and dual-host routing

**Purpose and architectural rationale.** Establish a stable portfolio identity independent of the public username and implement both apex path and wildcard-subdomain viewing under one authorization and live-policy contract. Do not enable public content before the tenant resolver, hostname trust and current-policy decisions have been tested with forged inputs.

**Entry criteria and dependency boundary.** Identity/session repositories and portfolio control records from Issues 3 and 4 exist; source 10 marks wildcard TLS as a real-host launch gate. **Dependencies:** Issues 3 and 4. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** A verified owner can create and rename one portfolio; correct aliases resolve to one portfolio ID, while suspended, disabled and unknown tenants never leak content from a stale cache. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.1 - Implement normalized slug grammar and reserved namespaces

**Objective and implementation boundary.** Make the same case-insensitive name validation apply to paths, subdomains, creation, rename, search and public metadata.

**Prerequisites.** 1.4 3.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build one canonical ASCII parser with lowercased lookup slugs, allowed letters/numbers/hyphens, 3–30-character limit and display capitalization stored separately.
2. Maintain a reviewed reserved-name set for platform routes and infrastructure hosts including api, dashboard, login, admin, www, app, help and settings.
3. Reject encoded slashes, Unicode lookalikes, trailing dots, empty labels, oversized strings and double-decoding attempts before lookup.
4. Test collision equivalence between Alex and alex, invalid host labels and ambiguous route names.

**Security, privacy and adverse-case handling.** Do not create owner-specific special cases or trust a browser-provided slug as an account identifier. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only canonical names can be reserved, and every invalid name returns an explicit non-revealing validation outcome. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-004`, `TEN-007`, `SEC-004`. Canonical verification: `T-TEN-04`, `T-TEN-07`, `T-SEC-04`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md).

## Issue 5.2 - Implement concurrency-safe portfolio creation and initial draft

**Objective and implementation boundary.** Create the first owned portfolio through a command that checks session eligibility and atomically claims its public identity.

**Prerequisites.** 4.8 5.1 3.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement POST /api/v1/portfolios with allowed onboarding fields, authenticated accountId, new opaque portfolioId and claimed canonical slug.
2. Create an initial private draft with exactly one required Hero and safe defaults without publishing any content.
3. Coordinate unique owner/slug claims using the verified database atomicity protocol and reconcile partial multi-record success after failures.
4. Test two simultaneous create requests, duplicate slugs and a lost response followed by client retry.

**Security, privacy and adverse-case handling.** A successful account signup does not automatically publish a portfolio or allow a second active one. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One portfolio and its draft/claim exist per authorized request; retries cannot create another owner's portfolio. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-001`, `TEN-003`, `TEN-004`, `CNT-001`. Canonical verification: `T-TEN-01`, `T-TEN-03`, `T-TEN-04`, `T-CNT-01`.

**Security/architecture ownership.** Architectural decisions: `ADR-020`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.3 - Implement a single trusted host/route resolver

**Objective and implementation boundary.** Ensure a request on a valid host and path maps to one canonical portfolioId and not to a loosely matched username.

**Prerequisites.** 5.1 5.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Parse the trusted deployment-host value, reject forged Host and untrusted forwarded-host variations, and identify apex, www, explicit infrastructure subdomains or valid portfolio subdomain.
2. For apex public paths, take the first validated slug segment; for a subdomain, resolve the normalized host label through slugClaims.
3. Return a verified portfolio context containing ID, current slug, requested host form and policy lookup handle for downstream server renderers/API adapters.
4. Test unknown, malformed, mixed-case, reserved and spoofed hosts across detail paths and API routes.

**Security, privacy and adverse-case handling.** Never let a tenant subdomain become an authenticated account origin or override /dashboard path ownership. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Both URL patterns select the same stable portfolio and unknown hosts produce branded 404/appropriate denial. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-006`, `TEN-007`, `TEN-008`, `SEC-003`. Canonical verification: `T-TEN-06`, `T-TEN-07`, `T-TEN-08`, `T-SEC-03`.

**Security/architecture ownership.** Threats: `TH-07`; Architectural decisions: `ADR-011`.

**Consult before implementation:** [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md).

## Issue 5.4 - Implement persistent slug history and safe rename

**Objective and implementation boundary.** Keep old professional URLs attached to their original portfolio without allowing another registrant to claim them.

**Prerequisites.** 5.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement the owner-authorized rename command and unique slug reservation against normalized current and historical claims.
2. Preserve prior claims as permanent aliases while a portfolio exists and update the canonical mirror through a crash-recoverable operation.
3. Define redirects for old apex paths and old subdomains including project detail URLs, preserving a safe route suffix only after validation.
4. Test a failed rename midway, simultaneous rename attempts, reserved target claims and a stale owner request.

**Security, privacy and adverse-case handling.** Redirect resolution must not build attacker-controlled target hosts or allow a deleted alias to identify a foreign tenant. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Old URLs redirect to the new path canonical, collision attempts fail, and all claims remain owned by one portfolio. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-004`, `TEN-005`, `TEN-006`. Canonical verification: `T-TEN-04`, `T-TEN-05`, `T-TEN-06`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.5 - Implement public visibility state separate from publication

**Objective and implementation boundary.** Enable owners to control discovery without modifying historical release bytes or conflating unlisted with private access.

**Prerequisites.** 3.5 5.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Store owner public/unlisted selection and enable/disable status as current portfolio policy, not as a mutable field inside release content.
2. Implement documented owner endpoints for visibility, disable and enable with authenticated ownership, conditional policy update and audit record.
3. Ensure unlisted remains viewable to anyone with a direct URL but is excluded from directory, sitemap and indexing, while unpublished stays 404.
4. Test transitions both before and after a release exists and verify response eligibility from both host forms.

**Security, privacy and adverse-case handling.** Never use robots noindex as permission or allow an owner to reactivate an administrator-suspended portfolio. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Policy state changes take effect without republishing, and private drafts remain invisible. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-007`, `PUB-008`, `SEO-002`, `TEN-009`. Canonical verification: `T-PUB-07`, `T-PUB-08`, `T-SEO-02`, `T-TEN-09`.

**Security/architecture ownership.** Architectural decisions: `ADR-036`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.6 - Implement live read gate for all public entrypoints

**Objective and implementation boundary.** Make the authoritative portfolio/moderation decision a mandatory precondition for rendering released data and derivative artifacts.

**Prerequisites.** 3.5 5.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide one server service that checks portfolio status, live security generation, active release and content-level suppression before any public page or API projection.
2. Use its output in apex and subdomain route handlers, OG/search/sitemap endpoints, media delivery and later Gilden calls as applicable.
3. Deny safely when current policy cannot be established; segregate immutable content caches from live authorization decisions.
4. Write a warm-cache test that first loads a portfolio, suspends it and then requests all public entrypaths.

**Security, privacy and adverse-case handling.** A static CDN file or earlier successful host lookup is not equivalent to current authorization. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Revoked or unpublished content is not served via stale policy, old aliases or direct artifact URLs. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-009`, `ADM-001`, `PUB-007`, `SEC-002`. Canonical verification: `T-TEN-09`, `T-ADM-01`, `T-PUB-07`, `T-SEC-02`.

**Security/architecture ownership.** Threats: `TH-17`, `TH-29`; Architectural decisions: `ADR-012`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.7 - Implement equivalent detail-route resolution and canonical mapping

**Objective and implementation boundary.** Support identical public portfolio content under path and subdomain forms without introducing duplicate tenant records.

**Prerequisites.** 5.3 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define route resolution for portfolio root, projects, project case study slugs, experience and references detail routes described by source 03.
2. Maintain current host form in user navigation while deriving a canonical apex URL for each eligible resource.
3. Check each public resource slug is scoped to the verified portfolio/release and reject traversal, wrong tenant IDs and unpublished items.
4. Test public resource link generation, rename redirects, unknown projects and no duplicate canonical for the same published item.

**Security, privacy and adverse-case handling.** A request for alex.aaroophan.dev must never fallback to a public project belonging to another slug. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Apex and subdomain URLs resolve equivalent detail content and share correct canonical metadata inputs. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-006`, `TEN-008`, `SEO-001`, `CNT-009`. Canonical verification: `T-TEN-06`, `T-TEN-08`, `T-SEO-01`, `T-CNT-09`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.8 - Implement reserved /dashboard and account-origin isolation

**Objective and implementation boundary.** Prevent platform account routes and credentials from being exposed through a portfolio-owned hostname.

**Prerequisites.** 4.3 5.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Restrict authentication, account APIs, dashboard and administrator surfaces to verified apex hostnames with explicit checks inside each server handler.
2. Configure non-credentialed tenant subdomain responses and reject account cookies where not relevant; do not proxy protected APIs to tenant origins.
3. Add a negative routing test for /dashboard, /api/v1/accounts/me and /api/v1/admin/status on alex.aaroophan.dev.
4. Check actual cookie scope and CORS behavior again when wildcard DNS becomes available in Issue 19.

**Security, privacy and adverse-case handling.** A route rewrite is not an authorization grant and cannot safely recover account data by host alias. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Tenant subdomains cannot load or mutate apex account state, even when a user is signed in at the apex. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-005`, `TEN-007`, `SEC-003`. Canonical verification: `T-IAM-05`, `T-TEN-07`, `T-SEC-03`.

**Consult before implementation:** [04 — C4 Diagrams](04-c4-diagrams.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 5.9 - Implement portfolio discovery eligibility projection

**Objective and implementation boundary.** Prepare a safe reusable projection for marketing examples and the initial lightweight directory.

**Prerequisites.** 5.5 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define fields allowed for public directory cards: published owner display, validated public link, optional approved thumbnail and project/skill preview metadata.
2. Filter by active release, public visibility, absence of disable/suspension and any directory opt-out condition specified by the UI contract.
3. Serve only bounded query/filter fields from the read model and enforce current policy again when entries are returned.
4. Test unlisted, unpublished, deleted, moderated, alias and stale-index cases with synthetic tenants.

**Security, privacy and adverse-case handling.** Directory visibility is never inferred from a slug existing or an owner having an account. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Projection provides only eligible entries and safe metadata, ready for the public UI in Issue 17. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-002`, `TEN-009`, `ADM-001`. Canonical verification: `T-SEO-02`, `T-TEN-09`, `T-ADM-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md).

## Issue 5.10 - Close host, ownership and policy boundary tests

**Objective and implementation boundary.** Run the full route/tenant negative matrix before exposing the visual editor or public portfolio to real accounts.

**Prerequisites.** 5.1 5.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Execute T-TEN-01 through T-TEN-09 and relevant source 11 tenant/CORS/security cases using at least two owners and multiple host aliases.
2. Probe object ID substitution, spoofed headers, stale caches, case-normalized slugs, rename aliases, account-host isolation and policy failure.
3. Produce evidence for route suffixes, redirects and private cache headers in locally simulated hosts; separate real TLS proofs for Issue 19.
4. Keep the feature BLOCKED if browser cookie or wildcard TLS behavior has not been verified on the actual chosen host.

**Security, privacy and adverse-case handling.** Never mark fake local hostname tests as proof that Vercel configured DNS and wildcard certificates. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Tenant-scoped operations and host routing have reproducible test reports with explicit pending live-provider prerequisites. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-001`, `TEN-002`, `TEN-003`, `TEN-004`, `TEN-005`, `TEN-006`, `TEN-007`, `TEN-008`, `TEN-009`. Canonical verification: `T-TEN-01`, `T-TEN-02`, `T-TEN-03`, `T-TEN-04`, `T-TEN-05`, `T-TEN-06`, `T-TEN-07`, `T-TEN-08`, `T-TEN-09`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 6 - Implement typed content, custom schemas and reusable owner data

**Purpose and architectural rationale.** Build the content engine without embedding presentation coordinates or database operations in reusable content. A portfolio's sections, fields, collections and relations are versioned, tenant-scoped records, and a hostile JSON import must never become executable code or a foreign-tenant data reference.

**Entry criteria and dependency boundary.** Stable portfolio ownership, draft persistence and server validation are implemented in Issues 3–5. **Dependencies:** Issues 3 and 5. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** The domain can create, validate, update and reference reusable typed content within fixed limits; hidden/private fields remain excluded from published and AI projections. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 6.1 - Define built-in section types and mandatory Hero invariant

**Objective and implementation boundary.** Create the portfolio-specific content catalog with the minimum required identity data and optional professional sections.

**Prerequisites.** 5.2 3.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Model Hero, About, Projects, Experience, Education, Skills, Blog, References and Contact, plus supported certifications, achievements, services, testimonials, publications and resume types.
2. Require exactly one first-position Hero and permit repeated instances of eligible other section types with stable sectionId and order.
3. Validate minimum publishable username, display name, professional role/label and short introduction, without requiring a project or employment history.
4. Test empty optional sections, repeated Projects sections, missing Hero, duplicate Hero and invalid first position.

**Security, privacy and adverse-case handling.** Do not hardcode an owner's name, employer or preferred section order into the registry. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The section catalog is typed and publisher validation rejects only actual contract violations. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-001`, `CNT-004`. Canonical verification: `T-CNT-01`, `T-CNT-04`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.2 - Implement versioned primitive field types and validators

**Objective and implementation boundary.** Give owners the approved field types while preventing arbitrary code or malformed nested content.

**Prerequisites.** 6.1 1.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Support text, rich text, URL, email, date, number, boolean, image, PDF, list, object, relation/reference and selectable option.
2. Represent field validation, required/optional status, default, label, description, visibility, search eligibility and AI approval metadata explicitly.
3. Create canonical parsing and normalization rules and enforce fields, depth, list and byte limits before saving or importing.
4. Test invalid dates, unsafe protocols, NaN, excessive strings, unexpected field types and cross-type defaults.

**Security, privacy and adverse-case handling.** Never eval formulas, execute JSX/MDX or interpret a field value as an arbitrary Mongo query. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All supported types round-trip deterministically and invalid data has field-path-specific errors. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `CNT-007`, `SEC-004`. Canonical verification: `T-CNT-02`, `T-CNT-07`, `T-SEC-04`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.3 - Implement custom schema authoring and safe import

**Objective and implementation boundary.** Enable unique owner-created content structures while keeping schemas bounded and migratable.

**Prerequisites.** 6.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Model owner-defined reusable fields and section-specific schemas with declared versions, types, defaults and approved validation operators.
2. Create a safe JSON Schema subset parser that rejects unsupported recursive/remote references, dangerous property names and executable directives.
3. Enforce maximum nesting depth three, custom fields twenty per section and defined collection item limits in the shared validator.
4. Provide a migration impact report for incompatible schema edits and require explicit confirmation before potentially destructive transformation.

**Security, privacy and adverse-case handling.** Imported JSON cannot bypass validation, overwrite the active release or create private data visible by default. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Compatible schemas persist and unsupported imports fail with no changes to the owner's current draft. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `CNT-004`, `CNT-007`, `SEC-004`. Canonical verification: `T-CNT-02`, `T-CNT-04`, `T-CNT-07`, `T-SEC-04`.

**Security/architecture ownership.** Threats: `TH-08`; Architectural decisions: `ADR-009`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.4 - Implement collection and content-item ID lifecycle

**Objective and implementation boundary.** Store reusable typed data once and bind it across sections without duplicating content.

**Prerequisites.** 6.3 3.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create stable contentId for each collection item and enforce portfolio ownership and collection type integrity.
2. Support up to twenty items per collection, owner-defined categories, item order and explicit feature labels where relevant.
3. Implement create, update, reorder, hide and delete commands using source 06's typed draft-operation boundary.
4. Test duplicate IDs, cross-tenant item injection, stale draft revision and item cap bypass via bulk operations.

**Security, privacy and adverse-case handling.** A renderer should not manufacture a new content object merely because the same project appears in two blocks. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Updating one shared item changes all references in the draft while leaving the active release unchanged. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-003`, `CNT-005`, `CNT-009`. Canonical verification: `T-CNT-03`, `T-CNT-05`, `T-CNT-09`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.5 - Implement owner-scoped relationships and deletion impact analysis

**Objective and implementation boundary.** Support reusable knowledge links without letting content graphs cross tenants or become cyclic/unbounded.

**Prerequisites.** 6.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Model bounded one-to-one, one-to-many and many-to-many references by stable content IDs within one portfolio.
2. Validate each target exists, type compatibility, maximum traversal depth and current owner scope before saving a binding.
3. Before deleting referenced content, return a list of dependent sections/blocks and offer explicit detach or remove actions.
4. Test missing targets, cycles if prohibited by the specific relationship contract, cross-tenant IDs and deleted item references.

**Security, privacy and adverse-case handling.** Do not silently cascade-delete custom visual compositions or trust relationships supplied by user JSON. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Deletion cannot leave a dangling published binding, and the owner receives a clear impact summary. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-003`, `CNT-005`, `SEC-002`. Canonical verification: `T-CNT-03`, `T-CNT-05`, `T-SEC-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.6 - Implement content visibility and AI/search permissions

**Objective and implementation boundary.** Attach data classification decisions to fields rather than assuming everything in a section has equal visibility.

**Prerequisites.** 6.2 6.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Represent draft-private, published/hidden, search-eligible, owner-private and AI-approved signals with safe restrictive defaults.
2. Make newly added fields AI-denied even inside a section previously approved for assistant use.
3. Write positive allowlist projection helpers used by future public release, search and knowledge compilers.
4. Test a private reference email nested inside a public testimonial and verify that no public projection includes it.

**Security, privacy and adverse-case handling.** Hiding a section must preserve editable draft content, not automatically authorize another reused reference. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public and AI projection helpers include only intended, approved data for a given release/policy. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-006`, `AI-002`, `AI-003`, `SEO-002`, `SEC-008`. Canonical verification: `T-CNT-06`, `T-AI-02`, `T-AI-03`, `T-SEO-02`, `T-SEC-08`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.7 - Implement rich-text AST, safe links and diagrams

**Objective and implementation boundary.** Support technical writing without admitting executable user-authored markup.

**Prerequisites.** 6.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use the selected vetted WYSIWYG editor format with deterministic Markdown import/export and a safe parsed AST for headings, lists, links, code, tables and images.
2. Permit only approved embed providers and sanitize/strictly interpret Mermaid-style diagrams without passing untrusted HTML through to the browser.
3. Validate link schemes, target handling, sanitization after imports and output encoding at render boundaries.
4. Test XSS payloads in syntax-highlighted code, diagram labels, SVG, URL attributes and copied HTML.

**Security, privacy and adverse-case handling.** Do not enable raw MDX, arbitrary iframe HTML, event handler attributes or owner scripts. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Stored/rendered content remains readable and browser tests cannot execute injected script or load prohibited origins. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `SEC-004`, `SEC-007`. Canonical verification: `T-CNT-02`, `T-SEC-04`, `T-SEC-07`.

**Security/architecture ownership.** Threats: `TH-09`, `TH-10`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.8 - Implement structured project case study and category content

**Objective and implementation boundary.** Provide professional developer-focused data structures without creating a bespoke page per owner.

**Prerequisites.** 6.4 6.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Represent project name, category, role, technologies, dates, gallery references, approved links and featured status as typed reusable content.
2. Allow bounded rich content blocks for problem, architecture, implementation, challenges, results and lessons while counting authored visual nodes separately.
3. Generate project route slug suggestions from explicit public content, with uniqueness scoped to the portfolio.
4. Test duplicate category labels, invalid link data, long case studies and missing optional outcomes.

**Security, privacy and adverse-case handling.** Project case studies cannot escape the 100 KiB compiled release or overwrite another tenant's project route. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A project can be featured, filtered and linked to a stable detail resource from one content ID. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-009`, `CNT-003`, `SEO-001`. Canonical verification: `T-CNT-09`, `T-CNT-03`, `T-SEO-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.9 - Implement built-in derived values and schema migration checks

**Objective and implementation boundary.** Provide limited formatting conveniences without introducing a formula execution engine.

**Prerequisites.** 6.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement deterministic derived date ranges and project/experience duration calculations from validated source dates.
2. Separate derived display values from source records and recompute them using the same versioned helpers in editor and publisher.
3. For schema changes, automatically convert compatible values and flag destructive changes with a before/after impact preview.
4. Test timezone/calendar boundaries, invalid date intervals, nullable fields and migration reversibility.

**Security, privacy and adverse-case handling.** Do not execute user-authored formulas or change a published release in place during a migration. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Derived fields are predictable, and migration leaves active published content unchanged until explicit publication. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-008`, `CNT-002`, `PUB-002`. Canonical verification: `T-CNT-08`, `T-CNT-02`, `T-PUB-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 6.10 - Verify content projection and schema adversarial suite

**Objective and implementation boundary.** Prove that arbitrary owner data can be stored and reused without script execution, reference leakage or limit bypass.

**Prerequisites.** 6.1 6.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run T-CNT-01 through T-CNT-11 and relevant security renderer/validation tests from sources 07 and 11.
2. Create two-tenant fixtures with nested public/private values and attempt malicious schema import, dangling relationships and oversized collection data.
3. Inspect serialized draft versus eligible public/AI projections and confirm private sentinel absence.
4. Record exact component/schema version and false rejection cases for legitimate technical content.

**Security, privacy and adverse-case handling.** Do not consider a WYSIWYG preview proof of safe server rendering or published access policy. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All content tests have evidence; any missing private-data or unsafe-reference test blocks the downstream compiler. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-001`, `CNT-002`, `CNT-003`, `CNT-004`, `CNT-005`, `CNT-006`, `CNT-007`, `CNT-008`, `CNT-009`, `CNT-010`, `CNT-011`. Canonical verification: `T-CNT-01`, `T-CNT-02`, `T-CNT-03`, `T-CNT-04`, `T-CNT-05`, `T-CNT-06`, `T-CNT-07`, `T-CNT-08`, `T-CNT-09`, `T-CNT-10`, `T-CNT-11`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 7 - Implement the declarative composition model and safe responsive renderer

**Purpose and architectural rationale.** Create the permanent representation of a visual composition before building its drag handles. The editor may later use React Moveable/dnd-kit, but stored documents and public rendering must remain independent of those libraries. Preserve semantic focus order, safe layout modes, block limits and predictable mobile output.

**Entry criteria and dependency boundary.** The typed content engine can resolve bindings and the shared validator knows product limits. **Dependencies:** Issue 6. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** A versioned composition tree compiles through one safe component registry into semantic HTML/CSS with tested mobile and keyboard behavior and no arbitrary user code execution. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 7.1 - Define versioned visual-node schema and parent rules

**Objective and implementation boundary.** Specify the smallest immutable contract a future drag-and-drop editor can manipulate and a public page can render.

**Prerequisites.** 6.4 6.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Model nodeId, sectionId, parentNodeId, approved component type, props, content binding, layout constraints, layer order, semantic reading order and responsive overrides.
2. Validate parent-child tree integrity, allowed nesting, stable IDs, section bounds and component-specific allowed children.
3. Separate authored node count from generated repeater DOM output and from platform-generated structural wrappers.
4. Test cyclic parent trees, unknown type, duplicate IDs, deep nesting and a node bound to a foreign content ID.

**Security, privacy and adverse-case handling.** Never store arbitrary HTML, JS, shader source or third-party editor-native DOM snapshots as the public contract. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Valid trees serialize canonically and reject unknown or dangerous node structures without partial persistence. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-002`, `EDT-004`, `CNT-004`, `CNT-005`. Canonical verification: `T-EDT-02`, `T-EDT-04`, `T-CNT-04`, `T-CNT-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.2 - Implement Auto, Absolute and Hybrid layout semantics

**Objective and implementation boundary.** Define the meaning of positioning data independently from pixels used by a particular editing viewport.

**Prerequisites.** 7.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Support auto layout with flow/flex/grid, intrinsic sizing, gaps/alignment; absolute bounded parent-relative positioning; hybrid repositionable groups with internal auto-flow children.
2. Validate min/max widths, anchors, aspect ratios, parent bounds, allowed overflow and stacking ranges by block type.
3. Give newly inserted nodes Auto layout by default; allow explicit conversion to Absolute or Hybrid when valid.
4. Test long/zoomed text in fixed-size blocks, controlled decorative overflow and nested resizing.

**Security, privacy and adverse-case handling.** Absolute positioning must not silently clip meaningful text or hide a required interactive element. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A public compiler can reproduce each layout mode without editor overlays and retains accessible natural content flow. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-002`, `EDT-003`, `EDT-004`. Canonical verification: `T-EDT-02`, `T-EDT-03`, `T-EDT-04`.

**Security/architecture ownership.** Architectural decisions: `ADR-007`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.3 - Implement three breakpoints and derived responsive overrides

**Objective and implementation boundary.** Support desktop/tablet/mobile editing modes while handling widths between named breakpoints fluidly.

**Prerequisites.** 7.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define source 03's suggested Mobile below 768, Tablet 768–1023 and Desktop 1024+ CSS px as editing modes and keep internal flow responsive.
2. Derive smaller-mode layouts from constrained desktop rules; store only explicit per-breakpoint overrides, not duplicate trees.
3. Validate independent visibility, bounded positioning, font scaling and intrinsic content at intermediary widths and high text zoom.
4. Test 320 CSS px, typical mobile/tablet widths, in-between widths and zoom at 200%/400% where applicable.

**Security, privacy and adverse-case handling.** Do not create three independently authoritative content copies for one visual component. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The same content ID renders once per viewport with correct semantic order and no unintended horizontal scroll. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-003`, `EDT-004`, `PRF-003`. Canonical verification: `T-EDT-03`, `T-EDT-04`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.4 - Implement semantic reading order and accessibility compiler

**Objective and implementation boundary.** Ensure freely arranged visual blocks still generate valid reading and interaction order.

**Prerequisites.** 7.1 7.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Store an explicit logical order separate from geometric order and bounded z-index, with platform-maintained minimum semantic structure.
2. Compile to native heading, article, navigation, list, button, link and form elements as appropriate to the block.
3. Validate one primary H1, coherent heading relationships, focus order, link purpose, visible focus and hidden-element inertness.
4. Test a visually reversed layout with keyboard-only and screen-reader traversal; compare DOM order and focus sequence.

**Security, privacy and adverse-case handling.** Do not use visual CSS order to hide essential content or rely on ARIA to repair incorrect native semantics. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Published HTML preserves meaningful order and keyboard access across all supported viewport modes. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-004`, `SEO-001`, `SEC-007`, `UX-001`. Canonical verification: `T-EDT-04`, `T-SEO-01`, `T-SEC-07`, `T-UX-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.5 - Implement safe versioned block registry

**Objective and implementation boundary.** Provide the approved visual building blocks and their behavior without allowing owners to execute new code.

**Prerequisites.** 7.1 6.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Register heading, text, button, link, image, container/group, grid, card, repeater, gallery, tabs, accordion, carousel, timeline, contact form and comparison-table variants from source 03.
2. Define per-block accepted props, content-binding types, semantic markup, interactions, focus behavior, design tokens and fallback output.
3. Reject unknown block identifiers and prohibit raw CSS, inline event handlers, custom scripts and unreviewed iframe origins.
4. Write per-component rendering tests for malformed props, user-controlled labels, denied URLs and fallback states.

**Security, privacy and adverse-case handling.** Registry definitions are owned by GildedIn, not persisted as arbitrary React components. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every accepted component has a typed schema and a safe semantic renderer; unknown types cannot render publicly. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-004`, `EDT-007`, `SEC-007`. Canonical verification: `T-CNT-04`, `T-EDT-07`, `T-SEC-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.6 - Implement bounded repeater and collection binding

**Objective and implementation boundary.** Allow one authored component to render many typed collection items while respecting 20-block portfolio cap.

**Prerequisites.** 7.5 6.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Bind a repeatable card, timeline or grid component to an owned collection ID with allowed filter/sort settings and stable item keys.
2. Use a safe item template and server-filtered public fields to generate children without creating additional authored block records.
3. Support featured-item variation only through approved props/bindings, not per-item custom executable components.
4. Test twenty collection items, missing references, collection item reorder and deliberate internal item hiding.

**Security, privacy and adverse-case handling.** A hidden/private collection item or field must never be injected by a repeater because the source collection exists. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One repeater counts once and renders accessible eligible items with deterministic order and stable links. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-006`, `CNT-003`, `CNT-005`, `CNT-006`. Canonical verification: `T-EDT-06`, `T-CNT-03`, `T-CNT-05`, `T-CNT-06`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.7 - Implement finite safe no-code interactions

**Objective and implementation boundary.** Support declarative behavior without inventing a general application-building language.

**Prerequisites.** 7.5 7.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define allowed actions: show/hide panel, modal open/close, tab switch, carousel advance, approved navigation, section scroll and validated contact-form submit.
2. Validate target node IDs, permitted targets, event/trigger context and focus-return behavior when actions open or hide controls.
3. Generate interactive client islands only for affected components, preserving server-rendered text and link content.
4. Test keyboard parity, missing targets, event loops, inaccessible hidden focus and owner-supplied URL attacks.

**Security, privacy and adverse-case handling.** Do not accept arbitrary JS expressions, network calls, conditional execution graphs or dynamic evaluation. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Each allowed interaction is reachable through touch and keyboard and cannot escape its declarative action set. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-007`, `SEC-004`, `SEC-007`. Canonical verification: `T-EDT-07`, `T-SEC-04`, `T-SEC-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.8 - Implement component and serializer version compatibility

**Objective and implementation boundary.** Let a published document remain renderable after a safe application update or a draft schema migration.

**Prerequisites.** 7.1 7.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Assign version identifiers to registry entries, layout/compiler grammar and canonical serializer as described in sources 05 and 08.
2. Build explicit compatibility mapping and migration preflight for known older node/schema versions, preserving stored owner layout intent.
3. Reject unsupported future versions with a safe unavailable/validation state instead of interpreting unknown properties.
4. Test an older release with a newer runtime and an application rollback with the last three retained releases.

**Security, privacy and adverse-case handling.** Do not auto-delete unsupported layouts or silently reset a user's composition. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Version compatibility tests demonstrate safe render or explicit denial, with migration paths recorded before schema changes. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-002`, `EDT-002`, `PUB-002`. Canonical verification: `T-CNT-02`, `T-EDT-02`, `T-PUB-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 7.9 - Implement pure composition compiler and validation reports

**Objective and implementation boundary.** Translate the canonical tree and eligible typed content into server-first render instructions with transparent blockers.

**Prerequisites.** 7.2 7.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement pure functions that resolve owner-approved bindings, layout constraints, responsive rules, semantics and safe block props.
2. Return structured errors with node/section locations for clipped text, invalid overlap, orphan bindings, missing headings and unsafe URLs.
3. Generate deterministic semantic output and canonical serialization inputs without mutating the owner draft.
4. Test repeated compile, adversarial metadata and in-between width fixtures and assert stable output and no private fields.

**Security, privacy and adverse-case handling.** Compilation must not read the current browser DOM, editor selection state or remote provider side effects. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Compiling the same validated source yields the same supported public representation or a reproducible blocker report. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-004`, `EDT-003`, `EDT-004`, `PUB-001`. Canonical verification: `T-CNT-04`, `T-EDT-03`, `T-EDT-04`, `T-PUB-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 7.10 - Verify composition accessibility and security boundaries

**Objective and implementation boundary.** Prove that a free-positioned composition publishes as actual accessible HTML rather than a screenshot.

**Prerequisites.** 7.3 7.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run relevant T-EDT-02 through T-EDT-07, T-SEO-01 and source 11 renderer security cases using synthetic deep layouts.
2. Compare no-JavaScript public reading with JavaScript-enhanced interactions and verify semantic content exists in initial HTML.
3. Test overlap of controls, heading misuse, visual reordering, malicious URLs and responsive text expansion.
4. Document the implementation limitations of browser-dependent collision checks and manual focus/assistive technology review pending Issue 20.

**Security, privacy and adverse-case handling.** A screenshot match is not evidence of semantic or security correctness. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The registry/compiler can accept rich layouts without violating published content safety and accessibility gates. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-002`, `EDT-003`, `EDT-004`, `EDT-005`, `EDT-006`, `EDT-007`, `SEO-001`. Canonical verification: `T-EDT-02`, `T-EDT-03`, `T-EDT-04`, `T-EDT-05`, `T-EDT-06`, `T-EDT-07`, `T-SEO-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 8 - Build the branded responsive design system and progressive cinematic layer

**Purpose and architectural rationale.** Turn the agreed dark-blue technical design into reusable UI primitives for platform, dashboard, editor and public portfolio. Keep semantic content independent of animation and put expensive Three.js rendering behind a measured progressive-enhancement boundary rather than loading it in the critical path.

**Entry criteria and dependency boundary.** Composition/semantic renderer interfaces and route shell exist; final library versions and font rights remain conditional. **Dependencies:** Issues 1 and 7. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Public and owner surfaces share a consistent accessible design language with supported dark/light themes, technical-corner signature and static/WebGL-fallback visual system. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [01 — System Overview](01-system-overview.md), [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 8.1 - Define dark/light theme and safe design tokens

**Objective and implementation boundary.** Create one coherent blue/navy design system without giving portfolio owners arbitrary CSS execution rights.

**Prerequisites.** 7.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement source 03's palette, typography, spacing, border, radius, surface, elevation and focus tokens in scoped design variables.
2. Provide complete dark-first and intentionally designed light variants, and validated owner controls for palette, theme and component presets.
3. Validate text/background and interactive focus contrast under allowed token combinations, including owner custom colors.
4. Test active, hover, pressed, disabled, error, loading and high-contrast states rather than a static hero alone.

**Security, privacy and adverse-case handling.** Do not allow unbounded style strings, url() injection or owner-defined CSS selectors. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Token contracts render across public and dashboard surfaces and invalid combinations are rejected with actionable UI feedback. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-007`, `EDT-002`, `PRF-001`, `UX-003`. Canonical verification: `T-SEC-07`, `T-EDT-02`, `T-PRF-01`, `T-UX-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.2 - Establish the four-font typography roles and licensing gate

**Objective and implementation boundary.** Preserve the required typographic identity without distributing fonts the product is not licensed to serve.

**Prerequisites.** 8.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Configure Oswald for display headings and Roboto for body/editor/form text with properly licensed web fonts and sensible fallbacks.
2. Reserve Ink Free for handwritten highlights and Mistral for occasional signatures, using originals only after web-embedding rights are verified.
3. Choose font loading/subsetting and font-display behavior to minimize layout shifts; implement fallback metrics where feasible.
4. Check headings, long text, missing-font conditions and different language glyphs as layout stress without claiming multilingual product support.

**Security, privacy and adverse-case handling.** Do not extract Windows font files or commit unlicensed binaries to the public repo. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Font provenance is documented and the hero remains legible with zero font downloads or when optional handwriting fonts are unavailable. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-003`, `SEC-011`. Canonical verification: `T-PRF-03`, `T-SEC-11`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [03 — Ui Ux](03-ui-ux.md), [10 — Deployment Strategy](10-deployment-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 8.3 - Build accessible shared navigation and form primitives

**Objective and implementation boundary.** Make core site interaction reliable before constructing complex page flows.

**Prerequisites.** 8.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement button, link, field, error text, dialog, dropdown, tab and notification primitives with semantic HTML and visible focus.
2. Support input labels, required indicators, error association, status announcements, Escape behavior and return focus after dialogs.
3. Integrate theme tokens and states with keyboard and touch controls; avoid purely decorative controls and dead navigation targets.
4. Test small touch targets, screen-reader labels, disabled conditions and form-level error recovery.

**Security, privacy and adverse-case handling.** Do not rely only on drag gestures, hover states or animation to explain essential actions. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Common UI primitives pass automated accessibility checks and targeted keyboard/manual verification. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-007`, `SEC-003`, `PRF-001`. Canonical verification: `T-EDT-07`, `T-SEC-03`, `T-PRF-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.4 - Recreate signature technical-corner motion as reusable decoration

**Objective and implementation boundary.** Define GildedIn's precise animated corner language without re-implementing expensive loops in every card.

**Prerequisites.** 8.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build CSS/SVG corner primitives with configurable geometry, stroke, interaction trigger and restrained luminance.
2. Support entry, hover, focus, section transition and touch equivalents, with shared motion tokens and consistent accessible static state.
3. Make ornamentation noninteractive/nonessential and remove it under the visitor's reduced-motion or Off setting.
4. Test repeated cards for performance and missing focus cues with CSS/JS animation disabled.

**Security, privacy and adverse-case handling.** Do not use literal evidence-board red strings or overlay decorative corners over actionable text. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One stable primitive works in hero/cards/editor selections without layout shift or screen-reader noise. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-005`, `PRF-003`. Canonical verification: `T-EDT-05`, `T-PRF-03`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [03 — Ui Ux](03-ui-ux.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 8.5 - Implement accessible individual-letter introduction animation

**Objective and implementation boundary.** Preserve the individual-letter typewriter effect while keeping meaningful headings available immediately to assistive technology and search crawlers.

**Prerequisites.** 8.2 8.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Render actual Hero heading text server-side once and separate aria-hidden decorative split-character animation from its semantic source.
2. Use approved Anime.js timeline behavior with one full play per tab session, shortened return reveal and an optional replay control.
3. Respect reduced motion and visitor intensity overrides, and avoid constantly retyping long paragraphs.
4. Test with JavaScript disabled, screen reader enabled, slow font load and interrupted animation.

**Security, privacy and adverse-case handling.** Do not duplicate heading announcements or require animation to reveal meaningful information. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Hero text is present in HTML and remains usable when the animation is skipped, canceled or fails. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-003`, `SEO-001`. Canonical verification: `T-PRF-03`, `T-SEO-01`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [03 — Ui Ux](03-ui-ux.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.6 - Define coordinated motion tokens and library responsibilities

**Objective and implementation boundary.** Prevent conflicting animation systems and preserve UI responsiveness in complex editor/public interfaces.

**Prerequisites.** 8.4 8.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Specify duration, easing, stagger, transform, perspective and interruption tokens for public and editor components.
2. Assign Anime.js to choreographed letters/Three.js timelines, Motion to React presence transitions where justified and CSS to simple borders/hover states.
3. Avoid driving the same property simultaneously from two animation libraries and stop offscreen continuous work.
4. Test mode changes, reduced motion and rapid navigation while animation is active.

**Security, privacy and adverse-case handling.** An animation should never capture focus, displace reading position or block form submission. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Documented motion ownership and integration tests show stable UI states under interrupted transitions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-003`, `EDT-005`. Canonical verification: `T-PRF-03`, `T-EDT-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 8.7 - Build shared Three.js scene host with static fallback

**Objective and implementation boundary.** Provide full-viewport cinematic depth as an enhancement behind actual semantic content, not as the site navigation engine.

**Prerequisites.** 7.9 8.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement a lazily loaded shared Three.js/React Three Fiber scene boundary and one managed render loop where appropriate.
2. Create safe controls for wireframe geometry, technical grid, holographic nodes, particle density and owner-approved palette presets.
3. Provide CSS/SVG or static backgrounds when WebGL fails, is disabled, or the visitor chooses Off/reduced motion.
4. Test renderer mount/unmount, context loss, no-WebGL browser and slow mobile conditions.

**Security, privacy and adverse-case handling.** Do not place critical headings, navigation or contact actions inside the canvas alone. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A published portfolio remains fully readable with the scene unmounted and cannot be blanked by GPU errors. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-003`, `SEO-001`, `UX-002`. Canonical verification: `T-PRF-03`, `T-SEO-01`, `T-UX-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-024`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.8 - Implement content-driven spatial visuals with privacy filtering

**Objective and implementation boundary.** Make linked projects, skills and technical relationships visually meaningful without exposing hidden content through graphics.

**Prerequisites.** 8.7 6.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use only the public compiled release projection approved for 3D nodes, never raw draft collections or owner account data.
2. Build bounded scene graph inputs with stable public source IDs and connect eligible skills/projects/experience items when owner selects content-driven preset.
3. Cap node/line counts within performance limits and provide a decorative fallback for empty or unsuitable portfolios.
4. Test with hidden/private skill nodes and moderated content, checking scene payload and accessible fallback.

**Security, privacy and adverse-case handling.** An AI-denied field is not automatically scene-approved, and an absent source must not be guessed or fetched from private draft. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only approved current public content affects spatial nodes and hidden sentinel data is absent from rendered scene inputs. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-006`, `TEN-009`, `SEC-008`, `PRF-003`. Canonical verification: `T-CNT-06`, `T-TEN-09`, `T-SEC-08`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.9 - Implement adaptive scene-quality and visitor intensity controls

**Objective and implementation boundary.** Protect low-end devices and reduced-motion users while preserving the recognizable design language.

**Prerequisites.** 8.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide Off, Subtle, Standard and Cinematic selection, defaulting to Standard unless user preference/system reduced motion specifies otherwise.
2. Monitor meaningful frame-time/capability signals and reduce pixel ratio, particles, shadows and update frequency when measured performance suffers.
3. Persist visitor choice locally without creating a tracking profile, and pause rendering on hidden tabs/offscreen scenes.
4. Test device pixel ratios, battery-sensitive behavior, hidden tabs and changed preferences during active motion.

**Security, privacy and adverse-case handling.** Do not infer sensitive device identity or keep a GPU loop running on an invisible page. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Visitors can reduce effects instantly, and mobile performance degrades gracefully without losing text or interactions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-003`, `OPS-005`, `UX-004`. Canonical verification: `T-PRF-03`, `T-OPS-05`, `T-UX-04`.

**Security/architecture ownership.** Threats: `TH-40`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 8.10 - Verify visual identity, accessibility and bundle budgets

**Objective and implementation boundary.** Prove the design system and cinematic layer meet objective quality constraints before integrating every public page.

**Prerequisites.** 8.1 8.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 03 design-system scenarios plus Lighthouse and bundle transfer checks on representative synthetic hero/long-form layouts.
2. Inspect actual compressed critical JavaScript, deferred scene code, media weight, visual stability and keyboard behavior against the provisional budgets in source 02/03.
3. Document verified font licenses, reduced-motion fallback, WebGL failure results and remaining subjective design review items.
4. Use manual device observation for cinematic motion; automated lab numbers alone do not prove motion comfort.

**Security, privacy and adverse-case handling.** A beautiful animation may not override a known accessibility or critical-page loading failure. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The design system has reproducible visual evidence and clear optimization actions for any budget miss. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-001`, `PRF-002`, `PRF-003`, `SEC-007`. Canonical verification: `T-PRF-01`, `T-PRF-02`, `T-PRF-03`, `T-SEC-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 9 - Implement public onboarding, account dashboard and owner settings

**Purpose and architectural rationale.** Build the primary account journey on top of verified authentication and portfolio ownership. Guide a new user from account-without-portfolio to editable unpublished draft without creating published data or assuming the user has employment history. Make private/published status, resource limits and accepted no-backup risk visible.

**Entry criteria and dependency boundary.** Identity, tenant commands, content catalog and shared UI controls are operational through Issues 4–8. **Dependencies:** Issues 4–8. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Google/GitHub users can sign in, start guided onboarding, open an owner-only dashboard and manage safe portfolio settings without leaking account data to public pages. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.1 - Build GildedIn marketing homepage and primary navigation

**Objective and implementation boundary.** Give first-time visitors a clear platform identity, trustworthy examples and direct entry into portfolio creation.

**Prerequisites.** 5.9 8.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Compose the public platform homepage with product explanation, editor experience, signature design demonstration, Create Portfolio action and link to the owner's flagship portfolio as an ordinary tenant.
2. Use semantic headings, descriptive links and responsive layout with full text present before Three.js initialization.
3. Provide curated featured portfolio cards using only allowed published directory projections, with empty states if none are eligible.
4. Test SEO, no-JavaScript reading, slow network and keyboard navigation, and never fabricate testimonials or usage statistics.

**Security, privacy and adverse-case handling.** Do not embed a special hardcoded owner record or expose unlisted portfolios to fill the homepage. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Homepage communicates the product and links correctly to onboarding and verified published example portfolios. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-001`, `SEO-002`, `PRF-001`. Canonical verification: `T-SEO-01`, `T-SEO-02`, `T-PRF-01`.

**Consult before implementation:** [01 — System Overview](01-system-overview.md), [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.2 - Implement safe sign-in screens and OAuth provider outcomes

**Objective and implementation boundary.** Make authentication affordances clear without creating a custom password system.

**Prerequisites.** 4.1 4.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build sign-in screen with Google and GitHub provider actions, loading/redirect handling and state-preserving return-to behavior using exact approved destinations.
2. Display bounded errors for denied consent, canceled login, expired callback and unavailable provider without echoing sensitive query parameters.
3. Provide privacy notice access and explain why linking differs from signing in before offering link flows.
4. Test keyboard and mobile navigation and avoid confusing provider profile email with verified account identity.

**Security, privacy and adverse-case handling.** No email/password, manual password-reset or account recovery override is permitted at launch. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A user can authenticate through each provider or recover from a known failure without insecure shortcuts. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-003`, `SEC-003`, `SEC-012`. Canonical verification: `T-IAM-01`, `T-IAM-03`, `T-SEC-03`, `T-SEC-12`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.3 - Build first portfolio guided wizard

**Objective and implementation boundary.** Collect only the minimum information required to create an editable portfolio while helping beginners start quickly.

**Prerequisites.** 9.2 5.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create wizard steps for display name, username, professional label, short introduction, optional template preset and optional first project.
2. Query advisory slug availability but treat server-side atomic claim as final, explaining collisions without revealing account details.
3. Create a clearly labeled sample portfolio draft with user-reviewable example content, and allow users to skip professional projects.
4. Test return/back behavior, autosaving across steps, invalid slug and network failure before initial create acknowledgment.

**Security, privacy and adverse-case handling.** Sample information must never be presented as actual accomplishments or published automatically. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A new account can complete or resume onboarding and land in an owner-only draft with no forced project. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-007`, `TEN-003`, `TEN-004`, `CNT-001`. Canonical verification: `T-IAM-07`, `T-TEN-03`, `T-TEN-04`, `T-CNT-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.4 - Implement no-portfolio and unpublished dashboard states

**Objective and implementation boundary.** Make the dashboard useful for accounts with no public site and distinguish saved draft from active publication.

**Prerequisites.** 9.3 3.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide empty-state Create Portfolio CTA for accounts without a portfolio and first-edit guidance for accounts with an unpublished draft.
2. Show current owner portfolio status, last acknowledged draft revision, live release state, visibility and AI enabled status from authorized projections.
3. Use clear labels such as Draft, Saved, Unsaved, Published and Propagation pending without claiming an operation succeeded before server acknowledgment.
4. Test refresh, a missing draft, disabled portfolio and stale API response while keeping client state honest.

**Security, privacy and adverse-case handling.** Do not infer publication from the presence of content or call a draft private because the owner sees it. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Dashboard always reflects documented authoritative state or an explicit loading/error condition. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-007`, `EDT-008`, `PUB-004`. Canonical verification: `T-IAM-07`, `T-EDT-08`, `T-PUB-04`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.5 - Implement owner dashboard navigation and progressive disclosure

**Objective and implementation boundary.** Provide content-first administration without overwhelming new users with low-level canvas controls.

**Prerequisites.** 9.4 8.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create navigation to editor, sections/collections, media, publications, AI settings, inbox, analytics, SEO and account settings using authenticated routes.
2. Use progressive disclosure for advanced constraints, revisions and security settings; preserve the user’s location during page navigation.
3. Add responsive drawer/toolbar and touch-friendly controls for core mobile tasks.
4. Test routes with keyboard, screen reader, 320 CSS px layout and missing optional service data.

**Security, privacy and adverse-case handling.** Hiding inaccessible menu items is not authorization; every route must enforce session and ownership on the server. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owners can reach essential tasks on desktop and mobile, while unavailable options display accurate reasons. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-001`, `EDT-003`, `SEC-002`. Canonical verification: `T-EDT-01`, `T-EDT-03`, `T-SEC-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.6 - Implement owner profile and linked-login settings UI

**Objective and implementation boundary.** Let users manage account details without exposing private provider tokens or accidentally unlinking their last method.

**Prerequisites.** 4.5 4.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Display owned profile, verified-email availability and safe provider labels from GET /api/v1/accounts/me and linked-provider API.
2. Implement explicit Link, Unlink and Revoke Sessions actions with recent-auth prompts and clear permanent/temporary consequences.
3. Handle already-linked external account, sole remaining provider, expired confirmation and session revocation gracefully.
4. Test stale sessions and unauthorized direct API attempts behind every apparent UI state.

**Security, privacy and adverse-case handling.** Do not show OAuth access/refresh tokens or offer an unverified email-only ownership override. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All account controls reflect authoritative provider state and blocked unlink attempts cannot lock out the user. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-003`, `IAM-004`, `IAM-005`, `IAM-008`. Canonical verification: `T-IAM-03`, `T-IAM-04`, `T-IAM-05`, `T-IAM-08`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.7 - Implement safe portfolio settings and rename UX

**Objective and implementation boundary.** Provide owner-level control over public identity without exposing database internals or breaking links.

**Prerequisites.** 5.4 5.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build editable display name/profile settings and username rename UI with an explanatory old-link redirect preview.
2. Show public/unlisted, disable/enable and SEO indexing settings as separate concepts with clear warnings about link-accessible unlisted content.
3. Call the purpose-specific authorized commands and display conflict/retry states rather than directly changing persisted owner/slug fields.
4. Test invalid rename, concurrent rename, suspended portfolio and cached public routes.

**Security, privacy and adverse-case handling.** Do not promise that noindex prevents access or that renamed domains are immediately verified. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A successful rename shows the new canonical address and previous aliases remain bound to the portfolio. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-005`, `PUB-007`, `PUB-008`, `SEO-002`. Canonical verification: `T-TEN-05`, `T-PUB-07`, `T-PUB-08`, `T-SEO-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.8 - Implement truthful data/backup and quota disclosures

**Objective and implementation boundary.** Set correct user expectations for free service limits and the explicitly accepted lack of disaster recovery.

**Prerequisites.** 1.5 9.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Explain during onboarding/settings that the platform has no guaranteed independent backups or uninterrupted availability and revisions are not backups.
2. Display current editable limits and media usage with accurate counting definitions, distinguishing per-owner allowance from global availability.
3. Show transparent error states when storage or AI is temporarily exhausted and avoid ambiguous capacity or payment prompts.
4. Review disclosure wording for applicable privacy/legal obligations before accepting account data.

**Security, privacy and adverse-case handling.** Never ask for a payment card, suggest an automatic upgrade or claim unlimited storage/recoverability. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Users can understand their data-loss risk and know whether an action failed or was accepted. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-005`, `OPS-006`, `SEC-012`. Canonical verification: `T-OPS-01`, `T-OPS-05`, `T-OPS-06`, `T-SEC-12`.

**Security/architecture ownership.** Threats: `TH-30`; Architectural decisions: `ADR-021`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.9 - Implement responsive onboarding and dashboard error states

**Objective and implementation boundary.** Remove silent dead ends from first-run and returning-owner journeys.

**Prerequisites.** 9.4 9.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add missing permission, expired session, missing OAuth email, unpublished content, no assets and empty collection states using source 03 microcopy guidance.
2. Keep user-entered wizard data locally during recoverable errors without storing secrets or copying another account's draft.
3. Provide accessible status announcements for save, validation, session expiry and actions that require recent reauthentication.
4. Test back navigation, interrupted network, form input zoom and touch-only operation.

**Security, privacy and adverse-case handling.** Do not display stack traces or generic all-purpose errors when recovery choices differ. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Each critical user journey has a meaningful loading, empty, success, conflict and failure state. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-007`, `EDT-008`, `SEC-012`. Canonical verification: `T-IAM-07`, `T-EDT-08`, `T-SEC-12`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 9.10 - Verify complete account-to-first-draft journey

**Objective and implementation boundary.** Demonstrate a novice can create a safe private portfolio with no coding or hidden security assumptions.

**Prerequisites.** 9.1 9.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 onboarding E2E flows for Google/GitHub, no portfolio, slug claim, minimum publishable content and draft-only state.
2. Test a second synthetic account probing the first owner's wizard, dashboard and settings APIs.
3. Verify no direct URL to an unactivated portfolio is publicly visible and screen-reader/touch tests remain functional.
4. Record real-provider callback and privacy notice as separate deployment gates if not proven yet.

**Security, privacy and adverse-case handling.** A successful screenshot cannot substitute for an authorized database state and private data-leak check. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A registered user reaches an editable unpublished portfolio, and all negative cross-account cases are denied. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-007`, `TEN-002`, `TEN-003`, `CNT-001`, `SEC-012`. Canonical verification: `T-IAM-01`, `T-IAM-07`, `T-TEN-02`, `T-TEN-03`, `T-CNT-01`, `T-SEC-12`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 10 - Implement the free-positioned visual canvas editor

**Purpose and architectural rationale.** Build the browser authoring experience on top of the versioned composition model instead of letting selection/drag libraries become persisted schema. Users must be able to position, resize, group, layer and bind components while retaining keyboard, touch, mobile and responsive semantics. This issue handles local authoring; server autosaving and owner preview follow in Issue 11.

**Entry criteria and dependency boundary.** The domain content/composition contracts and shared design primitives exist; dashboard routes provide an authorized editing shell. **Dependencies:** Issues 6–9. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Users can edit text directly, configure complex blocks in an inspector and compose distinct section layouts across desktop, tablet and mobile without creating unsafe or inaccessible published markup. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 10.1 - Build canvas editor shell, sections tree and inspector

**Objective and implementation boundary.** Make the editing surface resemble the public composition while exposing structured authoring affordances.

**Prerequisites.** 9.5 7.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement top bar with portfolio, undo/redo, breakpoint controls, save status, Play Preview and Publish entry points.
2. Place sections/layers/blocks/collections panel beside a central section canvas and a contextual inspector for content, layout, responsive, accessibility and interactions.
3. Bind selection to node IDs and active draft revision rather than DOM position or public URL.
4. Test multiple section selection, hidden blocks, deleted layers and mobile drawer presentation.

**Security, privacy and adverse-case handling.** Do not mount Gilden or full cinematic backgrounds continuously during normal editing. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Editor navigation is stable and selection/inspector shows precisely the selected versioned node. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-001`, `EDT-002`, `EDT-003`. Canonical verification: `T-EDT-01`, `T-EDT-02`, `T-EDT-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.2 - Implement selection, multi-select and layer navigation

**Objective and implementation boundary.** Let owners understand and control overlapping elements without needing precise pointer targeting.

**Prerequisites.** 10.1 7.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add click selection, Ctrl/Shift multi-select as appropriate, layer tree navigation, lock/hide toggles and visible bounding outlines.
2. Support grouping/ungrouping, duplicate, arrange-forward/back, logical reading-order tools and explicit reparenting across section boundaries.
3. Ensure keyboard selection and accessible actions exist for every structural transformation, including touch alternatives.
4. Test locked layer selection, nested groups and overlapping interactive controls.

**Security, privacy and adverse-case handling.** Layer z-order does not implicitly change semantic focus order or owner data permissions. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All transformations produce valid composition commands with deterministic undo operations. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-005`, `EDT-004`. Canonical verification: `T-EDT-05`, `T-EDT-04`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.3 - Implement Moveable-backed dragging, resizing and snapping

**Objective and implementation boundary.** Provide Figma-like manipulation while storing stable constraints rather than raw transform-library objects.

**Prerequisites.** 10.2 7.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Evaluate React Moveable under the conditional ADR and wrap it in an adapter that emits typed move/resize/rotate-if-allowed commands.
2. Add grid/edge/center snapping, equal-gap guides and modifier/touch toggle for temporary snapping disable.
3. Translate the resulting geometry into bounded parent-relative coordinates, anchors and responsive rule updates.
4. Test drag cancellation, lost pointer capture, locked blocks, nested group resize and parent-boundary enforcement.

**Security, privacy and adverse-case handling.** Do not store DOM matrix strings or unchecked negative/offscreen dimensions in the persisted tree. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Pointer editing preserves valid constraints and library replacement would not require a stored-data migration. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-002`, `EDT-005`. Canonical verification: `T-EDT-02`, `T-EDT-05`.

**Security/architecture ownership.** Architectural decisions: `ADR-025`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 10.4 - Implement drag-and-drop section and collection ordering

**Objective and implementation boundary.** Support ordering and reparenting without rebuilding an inaccessible custom drag system.

**Prerequisites.** 10.2 6.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use dnd-kit or another vetted adapter for section reorder, list/collection order and compatible cross-section moves.
2. Provide keyboard sensor and explicit move-up/down actions for sections, projects, gallery items and content lists.
3. Validate allowed parent/container changes, collection item identities, Hero-first invariant and 20-block cap after each proposed move.
4. Test dragging between categories, switching viewport mid-drag and attempted move into an incompatible nested group.

**Security, privacy and adverse-case handling.** Drag failure must leave the previous valid draft intact and never silently delete content. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Section and item order persists as schema operations and is reproducible through non-drag controls. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-005`, `CNT-001`, `CNT-003`. Canonical verification: `T-EDT-05`, `T-CNT-01`, `T-CNT-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.5 - Implement direct inline text editing and complex inspector forms

**Objective and implementation boundary.** Give beginners convenient editing without sacrificing validation of rich nested data.

**Prerequisites.** 10.1 6.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Allow click-to-edit for simple text/headings with local immediate preview, caret management and suitable keyboard shortcuts.
2. Route rich text, nested collections, media settings, relationships and advanced layout properties through typed inspector controls.
3. Use the safe rich-text AST and field-level validation from Issue 6 and preserve pending changes before selection transitions.
4. Test IME composition, paste of unsafe HTML, rapidly switching nodes and long-form content expansion.

**Security, privacy and adverse-case handling.** Never write untrusted HTML from contentEditable directly to the public DOM. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Content edits are visible immediately locally, validate consistently and remain associated with the correct content ID. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-001`, `CNT-002`, `SEC-004`. Canonical verification: `T-EDT-01`, `T-CNT-02`, `T-SEC-04`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.6 - Implement responsive viewport modes and override editor

**Objective and implementation boundary.** Let owners inspect and edit real desktop/tablet/mobile layouts without creating separate authoritative portfolios.

**Prerequisites.** 10.3 7.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide named Desktop, Tablet and Mobile preview widths plus a responsive-width control for intermediate testing.
2. Expose derived layout values versus intentional overrides and allow clearing an override to fall back to shared constraints.
3. Keep one shared content binding and semantic order while adjusting visual properties, permitted visibility and grouping by breakpoint.
4. Test clipping/overlap at 320 px, 768/1024 transitions and high text zoom as owner content changes.

**Security, privacy and adverse-case handling.** Do not save a second copy of a project's content for each viewport. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Viewport switching preserves edits and clearly distinguishes common constraints from breakpoint overrides. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-003`, `EDT-004`, `PRF-003`. Canonical verification: `T-EDT-03`, `T-EDT-04`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.7 - Implement binding controls and collection repeaters in canvas

**Objective and implementation boundary.** Make the distinction between content data and presentation understandable to owners.

**Prerequisites.** 10.5 7.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add inspector actions to connect a block/repeater to a typed collection or content item by stable ID.
2. Expose actual eligible field choices, current binding status, category filtering and item order without permitting foreign content IDs.
3. Show reference impact before removing an item, and display a safe placeholder for missing/hidden content in draft editing only.
4. Test a featured project appearing in multiple locations and a collection updated during active editor selection.

**Security, privacy and adverse-case handling.** Do not duplicate underlying data or include private/hidden values in the public binding list. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Changing one content item updates every local draft reference and future publication uses the same IDs. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-003`, `CNT-005`, `EDT-006`. Canonical verification: `T-CNT-03`, `T-CNT-05`, `T-EDT-06`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.8 - Implement keyboard/touch geometry and accessibility inspector

**Objective and implementation boundary.** Guarantee alternatives to dragging for precision work and protect published reading order.

**Prerequisites.** 10.6 10.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add numeric/stepper controls for x/y, size, anchoring, alignment, order, group membership and zoom when those properties are valid.
2. Expose heading level, accessible name, informative/decorative image designation, interaction focus order and link behavior in context.
3. Show validation notices for covered focusable elements, clipped meaningful text and inaccessible touch targets.
4. Test entire authoring tasks using keyboard only, touch only and VoiceOver/NVDA representative flows.

**Security, privacy and adverse-case handling.** Visual overlap cannot excuse an unreachable button or meaningless keyboard reading sequence. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All essential geometry/actions can be performed without dragging and severe accessibility failures are actionable in editor UI. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-004`, `EDT-005`, `SEC-007`. Canonical verification: `T-EDT-04`, `T-EDT-05`, `T-SEC-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.9 - Implement session-scoped undo/redo and safe animation preview toggle

**Objective and implementation boundary.** Allow reversible editing without inventing an event-sourced backend or applying changes directly to published releases.

**Prerequisites.** 10.5 10.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Record typed reversible local operations with bounded undo/redo stacks for the active editor session.
2. Preserve content IDs and relationship integrity across undo, redo, grouping, deletion and responsive overrides.
3. Pause expensive animation during ordinary editing and provide a bounded Play Animation Preview that temporarily renders public motion behavior.
4. Test undo after autosave acknowledgment, selection changes, stale server conflicts and page navigation within editor.

**Security, privacy and adverse-case handling.** Undo is not a substitute for version restoration and must not cross a session/account boundary. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The owner can reverse local edits coherently and preview motion without compromising save state. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-005`, `EDT-010`, `PRF-003`. Canonical verification: `T-EDT-05`, `T-EDT-10`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 10.10 - Verify complex canvas authoring with accessibility and limits

**Objective and implementation boundary.** Prove the editor can produce distinct layouts while remaining bound to safe typed composition rules.

**Prerequisites.** 10.1 10.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 visual editor suite against grouping, overlapping blocks, resizing, reparenting, generated repeater items and 20-node cap.
2. Test screen-reader/keyboard alternatives, responsive override persistence and semantic order independently of visual screenshots.
3. Use malicious props and foreign content IDs to assert editor/server rejection once draft API exists.
4. Record expected validation and user-visible recovery for an invalid composition rather than deleting work.

**Security, privacy and adverse-case handling.** No unsupported raw CSS/JS workaround is acceptable to fix a failed visual case. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A complex synthetic portfolio can be authored by pointer and keyboard paths, with no unhandled invalid state. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-001`, `EDT-002`, `EDT-003`, `EDT-004`, `EDT-005`, `EDT-006`, `EDT-007`. Canonical verification: `T-EDT-01`, `T-EDT-02`, `T-EDT-03`, `T-EDT-04`, `T-EDT-05`, `T-EDT-06`, `T-EDT-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 11 - Implement autosaved drafts, optimistic concurrency and protected preview

**Purpose and architectural rationale.** Connect local editor state to the one authoritative owned draft with explicit save feedback, revision comparison and crash-safe retry. Protect unsaved work during network failure or multi-tab editing, and provide an owner-only preview of exactly the draft the owner is inspecting. This issue must never affect the active published release.

**Entry criteria and dependency boundary.** Draft repositories, owner identity, content validation and editor local operations exist. **Dependencies:** Issues 3, 4, 6, 7 and 10. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Autosave is honest and safe under lost response, tab collision and reload; owner preview is never publicly cached or guessed by another tenant. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.1 - Implement draft read and typed mutation API contracts

**Objective and implementation boundary.** Bind the editor to protected GET, PUT and PATCH owner draft endpoints from source 06.

**Prerequisites.** 3.6 10.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Require a verified session, explicit owned portfolio, matching draft revision and validated full replacement or bounded typed operation.
2. Return authoritative draft revision, mutation ID, validation outcomes and safe ETag/precondition data with no other tenant fields.
3. Apply server-side limits again after every operation, including schema import, duplication and moving nested blocks.
4. Test cross-tenant ID, malformed patch operation, unknown field and read/modify race.

**Security, privacy and adverse-case handling.** Never accept arbitrary JSON Patch or Mongo update operators as a general draft write interface. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Each API operation has stable DTO/HTTP behavior and a failed validation produces no partial draft mutation. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `SEC-002`, `SEC-004`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-SEC-02`, `T-SEC-04`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.2 - Implement debounced autosave with mutation ledger

**Objective and implementation boundary.** Make frequent edits efficient without sending every keystroke and without misreporting what the server saved.

**Prerequisites.** 11.1 10.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Buffer local changes in an editor-owned state machine and debounce saves, retaining stable mutation IDs and the known expected revision.
2. Send one bounded whole-draft or typed-operation payload with an explicit revision precondition and keep a snapshot of what was submitted.
3. On acknowledgment, advance saved revision only for the matching submitted snapshot; later unsent edits stay Unsaved.
4. Test high typing rate, reordering during in-flight save and acknowledgment arrival after a newer local edit.

**Security, privacy and adverse-case handling.** Do not display Saved because a timer ran or a fetch promise was created. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Saved status corresponds to the most recent server-acknowledged local state, never a stale response. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`. Canonical verification: `T-EDT-08`, `T-EDT-09`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.3 - Implement retry-safe lost acknowledgments and offline failure UI

**Objective and implementation boundary.** Ensure short network disruptions do not silently lose edits or create duplicate logical saves.

**Prerequisites.** 11.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Detect aborted/timeout responses as uncertain outcomes and query the authoritative revision/mutation ledger before blindly retrying.
2. Preserve local dirty changes during disconnection and show clear Saving, Retry and Unsaved indicators with keyboard-accessible feedback.
3. Use bounded exponential retry with backoff only when safe; otherwise require explicit owner reconciliation.
4. Test server committed/save acknowledgment lost, server rejected before commit and reconnect while another tab has saved.

**Security, privacy and adverse-case handling.** No generic retry loop may overwrite a newer revision or create an unbounded provider bill. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** An interrupted editor preserves work and reconciles unknown outcomes before claiming successful persistence. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `OPS-005`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-OPS-05`.

**Consult before implementation:** [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.4 - Implement two-tab optimistic conflict handling

**Objective and implementation boundary.** Protect against silent lost updates when the same owner edits a portfolio in multiple browser tabs.

**Prerequisites.** 11.1 11.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use revision-aware conditional writes so only the expected server revision wins a competing save.
2. On 409 domain conflict, preserve the losing tab's local edits and show server revision, conflict summary and choices to reload, compare or recover.
3. Where If-Match headers are used, retain source 06's HTTP 409/412 interoperability distinction rather than inventing a third protocol.
4. Test concurrent patch, multi-tab reorder and a publish while an older tab remains open.

**Security, privacy and adverse-case handling.** Do not silently force last-write-wins, merge incompatible nested layout graphs or discard conflicting local edits. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Two tabs cannot overwrite newer data unnoticed and owner recovery is explicit. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-009`, `PUB-001`. Canonical verification: `T-EDT-09`, `T-PUB-01`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 11.5 - Implement scoped browser-local unsaved recovery

**Objective and implementation boundary.** Reduce accidental loss after crash/reload without making localStorage authoritative for secure data.

**Prerequisites.** 11.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Persist only bounded recoverable draft deltas when practical, partitioned by accountId/portfolioId and constrained by expiry.
2. Exclude OAuth/session tokens, private connection strings and unneeded sensitive information; warn that shared devices can expose local drafts.
3. Clear or quarantine local recovery on logout, provider-account switching, successful reconciliation or explicit discard.
4. Test opening the editor under a different account and ensure old local content is not accessible or suggested.

**Security, privacy and adverse-case handling.** Never restore a local draft over a newer authoritative server revision without owner review. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A crashed tab can offer valid recovery only to the matching account and correctly handles expired or conflicting data. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `SEC-012`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-SEC-12`.

**Security/architecture ownership.** Threats: `TH-34`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.6 - Implement owner-only draft preview route and isolation

**Objective and implementation boundary.** Provide exact preview of the current draft without making it part of the public URL or cache namespace.

**Prerequisites.** 7.9 11.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement GET /api/v1/portfolios/{portfolioId}/preview and the protected preview UI using the canonical composition/content compiler.
2. Bind preview to authenticated owner and requested server-acknowledged revision or clearly marked local unsaved state.
3. Return no-store and prohibit search indexing, public sitemap links and shared caching; restrict preview iframe messaging to validated exact origins if used.
4. Test guessed preview URL, another owner's release/draft ID, copied URL without session and a sibling-subdomain attempt.

**Security, privacy and adverse-case handling.** No shareable bearer preview link or visitor-authenticated private portfolio is in initial scope. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only the authorized owner sees draft content and preview markup remains isolated from public artifacts. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-010`, `TEN-002`, `SEC-002`. Canonical verification: `T-EDT-10`, `T-TEN-02`, `T-SEC-02`.

**Security/architecture ownership.** Threats: `TH-35`, `TH-42`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.7 - Implement preview device modes and Play Animation Preview

**Objective and implementation boundary.** Let owners verify how responsive constraints and motion behave before publishing without changing public state.

**Prerequisites.** 11.6 8.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Render desktop/tablet/mobile preview modes from one draft tree and content graph; allow optional side-by-side on large screens.
2. Use a distinct Play Preview control to enable full motion temporarily, otherwise keep heavy Three.js and continuous effects paused.
3. Show draft revision and current unsaved status and label that this preview is not publicly accessible.
4. Test stale preview after save, local unsaved content differences and WebGL-unavailable behavior.

**Security, privacy and adverse-case handling.** A preview must not silently use the active release or become publicly accessible when an iframe URL is copied. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The owner can compare intended responsive output and motion under a protected, non-cacheable context. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-003`, `EDT-010`, `PRF-003`. Canonical verification: `T-EDT-03`, `T-EDT-10`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.8 - Implement prepublication validation report and issue navigation

**Objective and implementation boundary.** Let an owner correct actual validation blockers rather than discovering unsafe public rendering after Publish.

**Prerequisites.** 11.6 7.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement source 06 draft/validate endpoint to run content, reference, layout, semantic, media and release-byte checks without changing draft state.
2. Return blockers/warnings keyed to sectionId/nodeId/field path and display them in an accessible structured panel.
3. Allow clicking an issue to focus the relevant inspector component and provide explanation/remediation.
4. Test missing Hero, unsafe link, covered control, private binding, oversized release and unavailable image.

**Security, privacy and adverse-case handling.** Do not replace server validation with client-only warnings or allow a severe failure to become an advisory. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Validation reports are deterministic and can guide correction without publishing anything. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `EDT-010`, `CNT-005`. Canonical verification: `T-PUB-01`, `T-EDT-10`, `T-CNT-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.9 - Implement draft recovery across owner navigation and sensitive state changes

**Objective and implementation boundary.** Preserve user work while honoring session expiry and live portfolio disable/deletion policies.

**Prerequisites.** 11.5 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Warn before leaving with unacknowledged work; permit safe editor navigation and preserve session undo where practical.
2. On session expiry, stop writes, preserve bounded local unsaved state and require reauthentication without exposing protected preview.
3. If the portfolio was disabled, suspended or deleted, clear access and prevent stale tabs from saving or publishing after the policy change.
4. Test logout in one tab, account switch, administrator suspension and deletion in another tab.

**Security, privacy and adverse-case handling.** A previously valid browser snapshot cannot override current security or resurrect a deleting account. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Editor state transitions stay truthful across auth/policy changes and no write crosses an invalid ownership boundary. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `TEN-009`, `ACC-002`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-TEN-09`, `T-ACC-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 11.10 - Verify autosave, conflict and preview acceptance suite

**Objective and implementation boundary.** Demonstrate the complete authoring-to-saved-draft lifecycle under hostile inputs and realistic network faults.

**Prerequisites.** 11.1 11.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-EDT-08, T-EDT-09, T-EDT-10 and detailed TV cases using two tabs, two tenants and controlled response loss.
2. Inspect server drafts, revision increments, client mutation IDs, cache headers and public release pointer to ensure no draft leakage.
3. Run responsive and keyboard preview checks with long/overlapping layout fixtures.
4. Record ambiguous data outcomes as a failing or blocked case until reconciled, not as a green save.

**Security, privacy and adverse-case handling.** No successful user-visible Draft Saved state is valid without matching server state. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owner editing and preview are demonstrably safe, recoverable and private, with tests ready to protect publishing work. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-008`, `EDT-009`, `EDT-010`, `PUB-001`. Canonical verification: `T-EDT-08`, `T-EDT-09`, `T-EDT-10`, `T-PUB-01`.

**Consult before implementation:** [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 12 - Implement secure image/PDF media ingestion, storage quotas and lifecycle

**Purpose and architectural rationale.** Make media a separately secured trust boundary with zero-charge storage constraints. Only verified normalized images and approved PDFs can become referenced by public releases. Enforce both per-portfolio limits and real provider-global allowance before accepting bytes, and preserve media used by any retained release unless a justified privacy erasure overrides that convenience.

**Entry criteria and dependency boundary.** Owner identity, quota records, media ports, editor and source 10 provider-feasibility ledger are available. **Dependencies:** Issues 3, 4, 6, 11. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** The owner can safely upload/crop/manage images and PDFs; no unverified file becomes public, quotas cannot race past hard limits and revisions remain reference-safe. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 12.1 - Select and verify a genuinely zero-charge managed object store

**Objective and implementation boundary.** Make storage provider selection evidence-driven before any real owner media is accepted.

**Prerequisites.** 1.10 3.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Evaluate managed storage candidates against no mandatory payment card, no metered charges, hard stop at allowance, private staging and signed/narrow upload capabilities.
2. Measure effective physical storage/egress quotas including variant overhead, rather than assuming 15 MiB per 500 owners is free.
3. Document provider privacy terms, data locality, allowed content types, URL/cache semantics and object-deletion behavior.
4. Test inability to exceed a configured global safe allocation in provider-sandbox or local adapter as the provider permits.

**Security, privacy and adverse-case handling.** Do not activate R2 or any billing-capable service without an enforceable zero-charge mechanism and explicit approval. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A provider due-diligence record and test results justify activation or keep uploads disabled. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-005`, `MED-003`. Canonical verification: `T-OPS-01`, `T-OPS-05`, `T-MED-03`.

**Security/architecture ownership.** Architectural decisions: `ADR-017`.

**Consult before implementation:** [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 12.2 - Implement private upload intent and bounded quota admission

**Objective and implementation boundary.** Prevent a hostile browser from uploading arbitrarily large or cross-tenant bytes before server admission.

**Prerequisites.** 12.1 3.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement POST /api/v1/portfolios/{portfolioId}/media/intents with owner check, file-type proposal, expected bounds and idempotent reservation.
2. Atomically reserve remaining per-owner file/byte capacity and global physical safe capacity before issuing narrow short-lived staging upload capability.
3. Generate opaque server-owned storage keys and limit the upload intent to exactly the expected object/bucket/type/size where supported.
4. Test two owners, replayed intents, concurrent near-cap reservations and unknown storage target substitution.

**Security, privacy and adverse-case handling.** A client-declared MIME, file path or size cannot be treated as verified or used as public authorization. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Invalid/over-budget requests receive stable denial without exposing a usable storage capability or increasing committed usage. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-003`, `TEN-002`. Canonical verification: `T-MED-01`, `T-MED-03`, `T-TEN-02`.

**Security/architecture ownership.** Threats: `TH-43`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.3 - Implement safe staged image parsing and normalization

**Objective and implementation boundary.** Treat uploaded images as untrusted binary inputs and create public variants only after independent verification.

**Prerequisites.** 12.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Read staged bytes through controlled decoders with signature/size/dimension checks, time/memory ceilings and rejection of decompression bombs/polyglots.
2. Re-encode approved images to safe formats and strip GPS/EXIF and unnecessary identifying metadata by default.
3. Generate bounded responsive variants if the provider processing budget permits, recording verified byte counts and provenance.
4. Test malformed headers, extreme dimensions, corrupt stream, SVG/script payload disguised as image and metadata leakage.

**Security, privacy and adverse-case handling.** No original unprocessed image is delivered as public content solely because upload succeeded. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only validated normalized assets are marked ready and metadata/variant outputs contain no GPS or script payload. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-002`, `SEC-007`. Canonical verification: `T-MED-01`, `T-MED-02`, `T-SEC-07`.

**Security/architecture ownership.** Threats: `TH-13`, `TH-14`; Architectural decisions: `ADR-018`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.4 - Implement restrictive PDF résumé validation and delivery

**Objective and implementation boundary.** Support safe View and Download actions without pretending MIME checking alone is malware scanning.

**Prerequisites.** 12.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Verify PDF signatures and structural parsing with bounded size/time before release; reject malformed, suspicious and unsupported active content when safe sanitization is unavailable.
2. Serve approved résumé through controlled routing with no content sniffing, appropriate attachment/inline disposition and restrictive embedding policy.
3. Keep private original staging inaccessible and ensure the public link is tied to the current release/visibility policy.
4. Test polyglot PDF, malicious filename, cross-tenant mediaId, revoked resume and unsupported scanner/failure mode.

**Security, privacy and adverse-case handling.** Do not claim complete malware safety or activate a paid scanning product to meet launch scope. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Valid PDFs can be viewed/downloaded safely and rejected documents never gain a public route. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-005`, `SEC-007`. Canonical verification: `T-MED-01`, `T-MED-05`, `T-SEC-07`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.5 - Implement media finalize, ownership and ready state machine

**Objective and implementation boundary.** Separate bytes arriving in object storage from acceptance as a usable portfolio asset.

**Prerequisites.** 12.3 12.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement finalize endpoint that verifies reservation, owner, exact object key, actual bytes, decoder results and normalized output before committing a mediaAsset.
2. Model staged, processing, ready, rejected and deleting states with replay-safe transitions and authenticated status endpoint.
3. Release quota reservation on rejection/cancellation and charge verified actual bytes against correct owner/global accounting on commit.
4. Test finalize twice, upload terminated halfway, object absent, virus-like unsupported format and quota state race.

**Security, privacy and adverse-case handling.** No failed finalize may leave a public object or permanently consume quota. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Finalize is idempotent and only ready assets with valid ownership and references can enter draft/public data. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-002`, `MED-003`. Canonical verification: `T-MED-01`, `T-MED-02`, `T-MED-03`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.6 - Build owner media library, crop/focal and alt-text UX

**Objective and implementation boundary.** Make asset management useful while explaining privacy, accessibility and quota effects.

**Prerequisites.** 12.5 10.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. List owned images/PDFs with verified status, size, reference count, allowed dimensions and remaining capacity.
2. Add safe crop/focal-point presets, alt-text fields and decorative-asset marking with preview before use in a composition.
3. Support replace, retry of rejected upload and deletion request with clear references/retention information.
4. Test a missing variant, blocked image decoder and a failed upload after the browser displayed a thumbnail.

**Security, privacy and adverse-case handling.** Alt text validation happens during publication; deleting a library thumbnail cannot erase media used by retained releases. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owner can manage assets safely on mobile and desktop with accurate status and accessibility metadata. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-002`, `MED-004`, `MED-005`. Canonical verification: `T-MED-02`, `T-MED-04`, `T-MED-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.7 - Implement reference-aware deletion and three-release retention

**Objective and implementation boundary.** Avoid deleting files that are still needed by a current draft or a restorable publication.

**Prerequisites.** 12.5 3.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build server-side media reference scan across active draft, active release and all three retained successful releases.
2. Refuse ordinary deletion when referenced and offer an actionable impact summary; safely reclaim orphan variants/originals after a fresh reference check.
3. Make delete idempotent and reconcile provider DELETE uncertainty or cached old URL availability honestly.
4. Test replace-then-restore, concurrent publish-then-GC and duplicate deletion calls.

**Security, privacy and adverse-case handling.** Never trust a client-supplied reference count or delete by filename prefix. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** No valid retained publication is broken by routine garbage collection and orphan cleanup is safe to repeat. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-004`, `PUB-006`. Canonical verification: `T-MED-04`, `T-PUB-06`.

**Security/architecture ownership.** Threats: `TH-25`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.8 - Implement privacy-erasure override for sensitive media

**Objective and implementation boundary.** Handle the conflict between revision retention and an owner's legitimate need to remove exposed personal material.

**Prerequisites.** 12.7 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define privacy deletion as an authoritative tombstone/access denial, followed by best-effort physical object deletion and cache invalidation.
2. Mark affected historical releases as unrestorable or requiring repair rather than keeping erased sensitive bytes indefinitely.
3. Require recent authentication where necessary and record a minimal audit trail without duplicating deleted file contents.
4. Test old release links, direct media URLs, cached preview and concurrent in-progress processing after an erasure request.

**Security, privacy and adverse-case handling.** Do not promise instantaneous removal from third-party caches or later backup stores beyond verified capability. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Erased content is not served by GildedIn even when an old release still references its mediaId. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-004`, `ACC-002`, `SEC-012`, `TEN-009`. Canonical verification: `T-MED-04`, `T-ACC-02`, `T-SEC-12`, `T-TEN-09`.

**Security/architecture ownership.** Threats: `TH-15`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.9 - Implement media delivery authorization and cache policies

**Objective and implementation boundary.** Ensure public media access derives from a validated published record and live policy rather than possession of a guessed key.

**Prerequisites.** 12.5 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build public media response lookup through verified portfolio context, active release, media reference and current moderation/visibility gate.
2. Use immutable optimized asset caching only where revocation behavior can be proven, with private/no-store for staged and owner-only media.
3. Serve safe content type, disposition and anti-sniffing headers for images/PDF; do not expose provider credentials or predictable storage internals.
4. Test suspended portfolio, unlisted direct link, removed project and old leaked storage URL after deletion.

**Security, privacy and adverse-case handling.** A raw public bucket URL that bypasses the application security gate is not an acceptable default for revocable media. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Media is reachable only when its approved release and current policy permit it, across both URL models. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-004`, `PUB-007`, `TEN-009`. Canonical verification: `T-MED-01`, `T-MED-04`, `T-PUB-07`, `T-TEN-09`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 12.10 - Verify upload adversarial matrix and physical capacity behavior

**Objective and implementation boundary.** Prove that media processing, quotas and reference safety hold under adversarial concurrency and provider failure.

**Prerequisites.** 12.1 12.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-MED-01 through T-MED-05 plus malformed/PDF/EXIF, upload replay and global-cap race tests.
2. Inject storage downtime during intent, upload, normalize, finalize, purge and media delivery, then inspect reservation and object states.
3. Measure actual variant bytes and egress against selected provider's hard zero-charge limits and preserve proof in the release ledger.
4. Keep uploads disabled in production if storage billing, private staging or revocation cannot be demonstrated.

**Security, privacy and adverse-case handling.** No valid test shall create a paid provider request or use a real customer's media. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Accepted files remain safely accessible; rejected and deleted files do not leak; global accounting stays consistent. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `MED-001`, `MED-002`, `MED-003`, `MED-004`, `MED-005`. Canonical verification: `T-MED-01`, `T-MED-02`, `T-MED-03`, `T-MED-04`, `T-MED-05`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 13 - Implement validated immutable publication, cache propagation and restoration

**Purpose and architectural rationale.** Establish the only transition from private editable draft to a public site. Compile a coherent frozen revision, validate every release artifact, write immutable data and switch one authoritative active pointer. Handle retries, uncertain commits, propagation failures, revision restoration and media/AI side effects as distinct states.

**Entry criteria and dependency boundary.** Content and composition compilers, versioned drafts, media readiness and live portfolio policy exist. **Dependencies:** Issues 6, 7, 11 and 12. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** An owner can Publish once, observe truthful stages, recover from an interrupted response, inspect three retained releases and restore to draft without contaminating active public content. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 13.1 - Define complete publication validation and report contract

**Objective and implementation boundary.** Make publication admission a security/data-integrity operation, not a button that copies draft records.

**Prerequisites.** 11.8 12.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Freeze the intended acknowledged draft revision and validate minimum identity, required Hero, allowed fields, full relationship graph, component registry and responsive constraints.
2. Check semantic H1, reachable interactive controls, informative image alt, safe links/embeds, reference-ready media and section/AI disclosure rules.
3. Compute exact canonical UTF-8 release payload size 102400 bytes maximum excluding binary media, with accepted warnings distinguished from blockers.
4. Return error locations keyed to field/node/section and test bypass via direct publish API with invalid content.

**Security, privacy and adverse-case handling.** Do not permit Publish to skip severe accessibility, security or integrity errors because the editor preview appears fine. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A failing invariant blocks activation with no partial public change; valid content produces a deterministic validation report. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `CNT-001`, `CNT-005`, `EDT-004`, `MED-001`. Canonical verification: `T-PUB-01`, `T-CNT-01`, `T-CNT-05`, `T-EDT-04`, `T-MED-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.2 - Implement deterministic release compilation from fixed draft revision

**Objective and implementation boundary.** Prepare one complete immutable logical release that cannot mix content from different autosave moments.

**Prerequisites.** 13.1 7.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Load the authorized saved draft at the requested revision and obtain validated content, layout, theme, SEO input, search and public media references.
2. Use pure versioned compiler/serializer functions to project only public permitted fields, respecting hidden sections and field visibility.
3. Generate stable section anchors, detail-route identities, content source IDs and search/SEO artifact provenance for one releaseId.
4. Test a concurrent save during compilation and compare canonical serialization of repeated runs.

**Security, privacy and adverse-case handling.** Never query mutable draft values to fill gaps after release insertion or use unapproved private data in derived artifacts. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The same fixed draft revision yields deterministic complete public artifacts or an explicit rejected operation. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `PUB-002`, `CNT-006`, `SEO-002`. Canonical verification: `T-PUB-01`, `T-PUB-02`, `T-CNT-06`, `T-SEO-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.3 - Implement publish operation creation, idempotency and status

**Objective and implementation boundary.** Make a repeated Publish click and an unknown HTTP outcome safe without adding duplicate releases.

**Prerequisites.** 13.2 3.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement owner-scoped publish endpoint accepting expected draft revision and a validated Idempotency-Key, stored as a hash unique to actor/portfolio/intent.
2. Record operationId, requested revision, stable input fingerprint, stage, prepared release and eventual active/propagation state.
3. Return existing operation result for an exact retry and a conflict for reuse of the key with incompatible inputs.
4. Test duplicate click, concurrent requests, lost HTTP reply after insertion and replay from a different account.

**Security, privacy and adverse-case handling.** Do not create a second release because the frontend timed out or the idempotency lookup returned slowly. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One logical owner intent has one operation identity and eventually one observable outcome. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-003`, `PUB-004`, `SEC-002`. Canonical verification: `T-PUB-03`, `T-PUB-04`, `T-SEC-02`.

**Security/architecture ownership.** Threats: `TH-24`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.4 - Implement safe prepare-insert-active pointer protocol

**Objective and implementation boundary.** Make release activation atomic at its documented consistency boundary while accommodating crash-prone multi-record preparation.

**Prerequisites.** 13.3 3.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Prepare the full release and required derived artifacts first, then insert one immutable release record before activating it.
2. Recheck current owner, portfolio state, draft revision/precondition and operation generation before a conditional pointer update.
3. Implement compare-and-activate using one atomic portfolio control update or verified transaction protocol, with fencing against a competing publisher.
4. Test crash after compile, after insert, during pointer switch and after pointer success but before operation status update.

**Security, privacy and adverse-case handling.** An inserted release is not public unless selected by activeReleaseId; an old writer must not resurrect a deleted portfolio. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public readers always see one complete active release and concurrent publishing cannot produce mixed old/new sections. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-002`, `PUB-003`, `TEN-009`. Canonical verification: `T-PUB-02`, `T-PUB-03`, `T-TEN-09`.

**Security/architecture ownership.** Threats: `TH-16`; Architectural decisions: `ADR-006`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.5 - Implement publication status, propagation and recheck command

**Objective and implementation boundary.** Distinguish durable active release from caches that may temporarily serve older eligible bytes.

**Prerequisites.** 13.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Expose operation status including rejected, preparing, activated, propagation_pending and complete outcomes from the source 06 contract.
2. Trigger targeted safe revalidation after activation and record failures separately without reverting or duplicating the successful publish.
3. Provide idempotent Recheck Publication endpoint and owner UI action, with bounded best-effort retry rather than mandatory always-on worker.
4. Test CDN invalidation failure, unavailable host cache API and delayed request arrival after operation completes.

**Security, privacy and adverse-case handling.** Never say publish failed merely because a revalidation call failed after the pointer committed. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The owner sees Published — propagation pending when appropriate and can reconcile safely. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-004`, `OPS-005`. Canonical verification: `T-PUB-04`, `T-OPS-05`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.6 - Implement three-release retention and safe cleanup

**Objective and implementation boundary.** Retain exactly the configured three successful publication versions without deleting shared media needed by those versions.

**Prerequisites.** 13.4 12.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Track publishSequence and retain active plus two most recent completed successful releases, excluding failed preparation artifacts.
2. Reclaim older release records and derived search/AI artifacts only after verifying no active operation or media reference needs them.
3. Make pruning idempotent and safe during concurrent restore, new publication and account deletion.
4. Test four successful publications, a failed fifth, referenced old PDF and cleanup retry after provider error.

**Security, privacy and adverse-case handling.** Never count a prepared but unactivated artifact as a successful release or silently erase historical restore data. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** After reconciliation, at most three successful releases remain and all their valid media is usable. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-006`, `MED-004`. Canonical verification: `T-PUB-06`, `T-MED-04`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.7 - Implement restore historical release as a new draft

**Objective and implementation boundary.** Let owners undo a bad publication while preserving the explicit publish boundary.

**Prerequisites.** 13.6 11.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Expose authorized release listing/detail summary and restore-draft command for one retained releaseId.
2. Before restoring, warn about overwriting the current working draft, resolve pending autosaves and require revision-aware confirmation.
3. Convert the selected release through versioned content/composition compatibility checks into a new private draft revision; do not alter activeReleaseId.
4. Test restore while another editor tab is saving, unsupported renderer version, missing erased media and foreign release ID.

**Security, privacy and adverse-case handling.** Do not immediately publish the old revision or treat three-release history as independent backup. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Restore produces an editable owner-only revision and new public content appears only after a separate Publish. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-005`, `PUB-006`, `EDT-009`. Canonical verification: `T-PUB-05`, `T-PUB-06`, `T-EDT-09`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.8 - Implement publishing UI with honest blockers and progress

**Objective and implementation boundary.** Make the lifecycle understandable for owners without misleading completion or risking accidental publication.

**Prerequisites.** 13.3 13.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Connect dashboard Publish to preflight validation, clear human-readable blockers and a deliberate confirmation step.
2. Display preparing, active, propagation pending and completed states from server operationId; support safe retry/recheck for uncertain outcomes.
3. Show three-release history with preview, restore-as-draft and media-unavailable warnings.
4. Test double-click, browser reload during publish, canceled UI after commit and stale draft revision.

**Security, privacy and adverse-case handling.** A client-only spinner reaching 100% is not publication proof. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owners can explain what version is live, whether propagation remains pending and what action is safe next. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `PUB-004`, `PUB-005`. Canonical verification: `T-PUB-01`, `T-PUB-04`, `T-PUB-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.9 - Implement post-publication derived-artifact orchestration

**Objective and implementation boundary.** Synchronize public search/SEO artifacts and Gilden knowledge without making optional external AI availability block publication.

**Prerequisites.** 13.4 6.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Generate required deterministic public search/SEO metadata during release preparation and bind them to the releaseId.
2. After activation, schedule/reconcile nonblocking AI knowledge preparation using source 08's bounded operation journal; mark Gilden unavailable until matching context is ready.
3. Recheck active release, current policy and deletion generation before committing delayed artifact results.
4. Test the model provider down, AI context generation delayed, a new publish overtaking an old job and account deletion while a task is pending.

**Security, privacy and adverse-case handling.** Never let stale AI context answer on a newer active release or delay valid publication for a Groq outage. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Search and SEO match the active release and AI is either matched/approved or explicitly unavailable. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-002`, `AI-003`, `AI-004`, `SEO-001`. Canonical verification: `T-PUB-02`, `T-AI-03`, `T-AI-04`, `T-SEO-01`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 13.10 - Verify crash-safe publish and source of truth under concurrency

**Objective and implementation boundary.** Exercise the exact consistency boundaries under controlled failures before constructing the public site around them.

**Prerequisites.** 13.1 13.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run T-PUB-01 through T-PUB-08 and source 11’s lost-response, competing-writer, active-pointer, restore and media-reference cases.
2. Inject failures at every prepare/insert/activate/revalidate stage and inspect operation ledger, active pointer, release count and derived artifacts.
3. Use two tenants and both public route forms to ensure no cross-publish identity or private fields leak.
4. Document any free-tier transaction limitations and the proven fallback reconciliation method rather than leaving races to chance.

**Security, privacy and adverse-case handling.** A method returning 200 in a mocked happy path does not prove atomic publication. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All publication tests show one active complete release, stable retries, truthful status and safe restoration. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-001`, `PUB-002`, `PUB-003`, `PUB-004`, `PUB-005`, `PUB-006`, `PUB-007`, `PUB-008`. Canonical verification: `T-PUB-01`, `T-PUB-02`, `T-PUB-03`, `T-PUB-04`, `T-PUB-05`, `T-PUB-06`, `T-PUB-07`, `T-PUB-08`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 14 - Implement server-rendered public portfolios, SEO, search and detail pages

**Purpose and architectural rationale.** Deliver actual portfolio websites from activated immutable releases, with live security policy before content and no requirement for editor code, WebGL or AI. Every public route must be responsive, semantically readable and shareable. Path and subdomain forms must identify the same release while the path-based address remains canonical for search indexing.

**Entry criteria and dependency boundary.** A fully validated release can be activated and the safe component registry can compile its output. **Dependencies:** Issues 5, 7, 8 and 13. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Visitors can browse home, project details and supported public sections, search their content, follow accessible navigation and share correct SEO metadata without seeing private drafts or moderated material. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.1 - Build server-first portfolio homepage from one active release

**Objective and implementation boundary.** Render the owner’s Hero and visible sections using one verified portfolio context and one immutable active release.

**Prerequisites.** 13.4 7.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Resolve trusted slug/host and live policy, select activeReleaseId and fetch the compiled released representation directly through the domain repository.
2. Render semantic HTML headings, sections, links and media references without calling nine internal HTTP APIs from the server or importing the editor canvas bundle.
3. Apply owner theme/layout tokens and only lazy-load optional client interactions/Three.js after essential content is visible.
4. Test no-JavaScript reading, missing active release, hidden sections and an unavailable AI provider.

**Security, privacy and adverse-case handling.** Never fall back to an owner draft when public release lookup fails. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** One response uses one releaseId, contains meaningful semantic content and respects current policy. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-002`, `CNT-006`, `SEO-001`, `PRF-003`. Canonical verification: `T-PUB-02`, `T-CNT-06`, `T-SEO-01`, `T-PRF-03`.

**Security/architecture ownership.** Architectural decisions: `ADR-002`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.2 - Implement public section navigation and custom section rendering

**Objective and implementation boundary.** Expose owner-composed sections while preserving accessible navigation and safe custom block behavior.

**Prerequisites.** 14.1 7.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Render mandatory first Hero and any eligible optional/repeated/custom sections according to published visual order and semantic reading sequence.
2. Build navigation labels and anchors from published sections, with owner-defined names validated and collisions resolved deterministically.
3. Use safe component registry to render repeaters, galleries, tabs, accordions, timelines, carousels and forms with expected keyboard behavior.
4. Test hidden section navigation, repeated section types, nonunique labels and client-side interaction errors.

**Security, privacy and adverse-case handling.** Do not create arbitrary owner-authored React components or leave hidden focus targets reachable. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All published sections can be reached through navigation and rendered without script or layout injection. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-001`, `CNT-004`, `EDT-007`. Canonical verification: `T-CNT-01`, `T-CNT-04`, `T-EDT-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.3 - Implement dedicated project case-study pages and galleries

**Objective and implementation boundary.** Make projects shareable technical evidence rather than only modal cards on a single homepage.

**Prerequisites.** 14.2 12.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Render source 06 project detail routes from one released content item and its validated references/categories.
2. Show structured metadata and case-study blocks for problem, architecture, implementation, challenges, results and media, with readable line lengths and safe code/diagram rendering.
3. Add approved image gallery and modal preview affordances with keyboard controls, while keeping canonical detail page available without JavaScript.
4. Test project removed by republish, renamed slug, inaccessible image and long technical article layout.

**Security, privacy and adverse-case handling.** Do not redirect deleted project details to an unrelated portfolio or surface private linked items. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A valid published project has a stable route and independently readable, accessible page. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-009`, `SEO-001`, `MED-001`. Canonical verification: `T-CNT-09`, `T-SEO-01`, `T-MED-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.4 - Implement experience, references and content-specific public pages

**Objective and implementation boundary.** Serve the supported portfolio detail experiences without exposing private reference contact data.

**Prerequisites.** 14.1 6.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Render experiences/timelines, education, skills, certifications, publications, services and approved testimonials through released typed components.
2. Use the same owner-scoped public item resolution and visibility filtering for dedicated experience or references pages as homepage cards.
3. Ensure References is optional/private by default and expose consented public testimonials only; never reveal hidden phone/email fields.
4. Test direct deep link to a hidden reference, unlisted portfolio and cross-tenant content ID.

**Security, privacy and adverse-case handling.** A field being present inside the public release's internal structure is not an unconditional display or AI permit. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Detail views present only eligible content and maintain consistent host navigation/canonical behavior. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-006`, `CNT-003`, `SEC-008`. Canonical verification: `T-CNT-06`, `T-CNT-03`, `T-SEC-08`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.5 - Generate per-portfolio and per-project canonical metadata

**Objective and implementation boundary.** Make SEO a deterministic output of the matching active release and verified public URL mapping.

**Prerequisites.** 14.3 5.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Generate title, meta description, canonical path, robots directive, appropriate JSON-LD and social metadata from validated release fields.
2. Generate default Open Graph preview assets at publication and accept a validated owner override when available.
3. Give every project detail page its own title/description/image and use the apex path canonical even when navigated through a tenant subdomain.
4. Test aliases, owner rename, ambiguous host, project removed and in-flight publish cache delay.

**Security, privacy and adverse-case handling.** Do not leak draft or private reference fields through metadata, JSON-LD or OG images. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every indexable public URL has correct same-tenant canonical and release-matched social output. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-001`, `SEO-002`, `PUB-002`. Canonical verification: `T-SEO-01`, `T-SEO-02`, `T-PUB-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.6 - Implement robots and XML sitemaps per verified host

**Objective and implementation boundary.** Prevent index discovery of nonpublic or suppressed content while supporting crawlable public portfolios.

**Prerequisites.** 14.5 5.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build sitemap entries from active public releases only and exclude unpublished, disabled, suspended, unlisted and moderated projects.
2. Implement robots responses for apex and wildcard hosts with correct hostname-aware URLs and noindex behavior for unlisted direct content.
3. Ensure sitemap and robots generation execute behind live security policy or equivalent current-eligibility projection, not a stale cached directory dump.
4. Test changed visibility and suspension with prewarmed site caches and search engine request user agents.

**Security, privacy and adverse-case handling.** Noindex is not a privacy boundary; unlisted pages still require valid direct-link public policy. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Sitemaps contain only eligible public resources and respond correctly on both URL models. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-001`, `SEO-002`, `TEN-009`. Canonical verification: `T-SEO-01`, `T-SEO-02`, `T-TEN-09`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.7 - Implement compact release-generated portfolio search

**Objective and implementation boundary.** Let visitors find actual projects, skills, experiences and publications without a separate search cluster.

**Prerequisites.** 13.9 14.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Compile eligible searchable text into a compact bounded index tied to releaseId and source IDs at publication time.
2. Expose client-side search over the immutable index or a bounded public query endpoint, with safe filtering and no arbitrary MongoDB regex access.
3. Respect field search exclusion, hidden content, individual moderation suppression and unlisted discovery semantics.
4. Test private sentinel, stale search index after revocation and long/hostile search terms.

**Security, privacy and adverse-case handling.** Search cannot return data simply because it exists in the current working draft or earlier release. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Visitors receive relevant links to permitted released content and no private results. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-011`, `SEO-002`, `SEC-008`. Canonical verification: `T-CNT-11`, `T-SEO-02`, `T-SEC-08`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.8 - Implement public visibility, 404, 410 and redirect behaviors

**Objective and implementation boundary.** Make absent, retired and disabled resources behave honestly and avoid unsafe content fallback.

**Prerequisites.** 14.1 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use branded 404 for unpublished/owner-disabled/unknown portfolios and neutral unavailable for suspended content according to current policy.
2. Return 404 for removed projects after propagation, optionally 410 for permanently deleted portfolio resources where feasible.
3. Preserve configured slug rename redirects with validated targets and reject unknown or malformed tenant hostnames.
4. Test direct access to suppressed old release URL, missing policy and deleted content while caches are warm.

**Security, privacy and adverse-case handling.** Do not promise 410 globally if the host cannot provide it, and do not serve a stale release to hide an unavailable policy decision. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public status codes follow the lifecycle/visibility contract and do not leak sensitive moderation details. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PUB-007`, `PUB-008`, `TEN-009`, `SEO-002`. Canonical verification: `T-PUB-07`, `T-PUB-08`, `T-TEN-09`, `T-SEO-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.9 - Implement public performance and accessibility progressive enhancement

**Objective and implementation boundary.** Protect meaningful first paint and interaction even with cinematic 3D, image galleries and long-form content.

**Prerequisites.** 14.2 8.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Keep critical semantic HTML and CSS server rendered; lazy-load optional Three.js, Gilden and specialized interactive blocks as narrow client islands.
2. Optimize image variants/font loading and prevent unexpected layout shift from delayed assets.
3. Measure representative mobile/desktop transfer sizes, script execution, LCP, INP and CLS, including low-end devices, WebGL-off and reduced motion.
4. Do not claim Lighthouse 90+ before deployed measurements under representative conditions.

**Security, privacy and adverse-case handling.** A cinematic effect is optional; failure must not blank navigation, contact or critical content. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public pages remain usable on supported browsers and meet agreed quality gates or document blocking regressions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-001`, `PRF-002`, `PRF-003`. Canonical verification: `T-PRF-01`, `T-PRF-02`, `T-PRF-03`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 14.10 - Verify public delivery security and SEO matrix

**Objective and implementation boundary.** Prove release-only public HTML and current authorization across every destination and metadata format.

**Prerequisites.** 14.1 14.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-SEO-01/T-SEO-02, publication cache tests and tenant denial cases with published, unlisted, disabled and suspended fixtures.
2. Scan HTML, JSON-LD, OG, sitemap, search, client bundles and 3D scene payloads for unpublished/private sentinel values.
3. Verify both URL patterns, alias redirects, project detail canonicals and browser behavior without JavaScript.
4. Record any unverified actual CDN revocation behavior as deployment blocker, not a passed local mock.

**Security, privacy and adverse-case handling.** A correct homepage cannot compensate for leaked draft data in social image or site search. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All public artifacts are release-matched, search-safe and independently reachable without the editor client. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-001`, `SEO-002`, `PUB-002`, `TEN-009`, `CNT-011`. Canonical verification: `T-SEO-01`, `T-SEO-02`, `T-PUB-02`, `T-TEN-09`, `T-CNT-11`.

**Security/architecture ownership.** Threats: `TH-18`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 15 - Implement bounded external publishing feeds and public metadata integrations

**Purpose and architectural rationale.** Support external writing and repository references without launching a native blog CMS or exposing internal networks to owner-controlled URLs. Treat Medium/RSS/GitHub information as optional preview metadata; an external outage must not fail public pages or overwrite a valid active release.

**Entry criteria and dependency boundary.** Typed content collections, owner API, SSRF policy utilities and the published read model are available. **Dependencies:** Issues 6, 13 and 14. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Owners can add one RSS/Medium feed and manual article links, request safe preview refresh and show cached released previews; unsafe endpoints are refused without a network connection. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 15.1 - Implement feed configuration for one primary RSS or Medium source

**Objective and implementation boundary.** Allow one reviewed publishing identity per owner without introducing a full remote-content ingestion engine.

**Prerequisites.** 6.4 14.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add owner settings for Medium username, approved RSS URL or manually maintained article links through typed authenticated API commands.
2. Normalize input and persist one primary externalFeeds record with refresh status and last valid preview snapshot.
3. Use safe limits for returned article count, title/excerpt length and feed metadata rather than importing complete article bodies.
4. Test empty feed, invalid username, duplicate feed configuration and untrusted source fields.

**Security, privacy and adverse-case handling.** Never convert an RSS URL into a general server-side proxy or ingest private credentials by default. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owners can configure one primary feed and see accurate status without breaking public Blog sections. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `SEC-005`. Canonical verification: `T-CNT-10`, `T-SEC-05`.

**Security/architecture ownership.** Architectural decisions: `ADR-033`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.2 - Implement SSRF-safe URL validation before outbound requests

**Objective and implementation boundary.** Protect the server network when it fetches owner-entered feeds or link-preview metadata.

**Prerequisites.** 2.4 15.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Allow only approved HTTPS or documented safe schemes/ports and reject localhost, private, loopback, link-local, metadata and unsupported IP literal destinations.
2. Resolve DNS with connect-time public-IP restrictions or disable automatic fetching on a host that cannot enforce those protections.
3. Apply bounded redirects and revalidate every hop and actual network connection; impose tight response size/time limits.
4. Test 127.0.0.1, 169.254.169.254, IPv6 private ranges, encoded hosts, redirects and DNS rebinding.

**Security, privacy and adverse-case handling.** Hostname regex alone is not sufficient to prevent SSRF on redirect or late DNS resolution. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** No forbidden network connection is attempted by malicious metadata input. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-005`, `SEC-004`. Canonical verification: `T-SEC-05`, `T-SEC-04`.

**Security/architecture ownership.** Threats: `TH-12`; Architectural decisions: `ADR-019`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.3 - Implement safe feed response parsing and preview extraction

**Objective and implementation boundary.** Extract only display-safe public article metadata and avoid loading executable remote content into owner pages.

**Prerequisites.** 15.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Parse bounded RSS/Atom content with hardened XML processing and no external entity/network resolution.
2. Extract title, excerpt, publication date, optional thumbnail and canonical article link using validated field types.
3. Sanitize remote description text and validate each thumbnail/canonical URL; discard or mark unsupported records rather than rendering raw feed HTML.
4. Test huge feeds, malformed XML, entity expansion, invalid dates and script-bearing excerpts.

**Security, privacy and adverse-case handling.** A remote feed item is untrusted even when delivered by a popular publishing platform. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only sanitized bounded preview records are eligible for owner review and publication. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `SEC-004`, `SEC-005`. Canonical verification: `T-CNT-10`, `T-SEC-04`, `T-SEC-05`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.4 - Implement owner-reviewed manual article links and metadata fallback

**Objective and implementation boundary.** Make technical writing links resilient when automatic preview fetching is unsafe or unavailable.

**Prerequisites.** 15.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Allow manually supplied canonical article URL, title, excerpt, date and thumbnail where safe from owned media or validated external metadata.
2. Provide an optional safe preview fetch command but always allow manual completion if it cannot be performed securely.
3. Display whether an article comes from feed sync or manual owner input and preserve a stable content ID.
4. Test unreachable URL, unsupported redirect and duplicate manual article link.

**Security, privacy and adverse-case handling.** Do not force owner data to depend on successful third-party metadata requests at page render time. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Article cards can be published with manually authored safe previews and clear canonical destination. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `SEC-005`. Canonical verification: `T-CNT-10`, `T-SEC-05`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.5 - Implement bounded refresh and cached feed fallback

**Objective and implementation boundary.** Avoid background infrastructure and prevent public page outages caused by external feed failures.

**Prerequisites.** 15.3 3.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement authenticated POST /api/v1/portfolios/{portfolioId}/feeds/sync as bounded idempotent on-demand work or reconciled operation.
2. Save a new validated preview snapshot only after parsing completes; retain the previous safe snapshot when the remote source fails.
3. Record last successful fetch, safe error code and owner review flag without exposing internal network diagnostic details.
4. Test timeout, 404, unavailable DNS, rate limit and a long-running request overtaken by owner deletion.

**Security, privacy and adverse-case handling.** Never fetch remote metadata on every anonymous public page view or spawn unbounded retries. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Feed outages affect only preview freshness and do not change active released content unexpectedly. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `OPS-005`. Canonical verification: `T-CNT-10`, `T-OPS-05`.

**Security/architecture ownership.** Architectural decisions: `ADR-034`.

**Consult before implementation:** [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.6 - Implement removed/stale article review flow

**Objective and implementation boundary.** Avoid silently advertising inaccessible external articles or deleting manual owner endorsements.

**Prerequisites.** 15.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Flag confirmed removed/unreachable feed items for owner review with safe status and reason.
2. Permit hiding a failed feed preview after verification while preserving owner-managed manual links until explicitly changed.
3. Require draft edit and Publish before the public page changes its authored article selections; honor current moderation separately.
4. Test an article removed and later reappearing, a feed URL change and an in-flight refresh during publication.

**Security, privacy and adverse-case handling.** Do not replace owner-curated article order with remote feed order without an explicit decision. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The owner can review stale links and the last valid publication remains available throughout an outage. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `PUB-002`. Canonical verification: `T-CNT-10`, `T-PUB-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.7 - Implement public GitHub metadata without broad repository access

**Objective and implementation boundary.** Provide optional developer-friendly repository information using only the public data the project actually requires.

**Prerequisites.** 15.2 6.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use owner-supplied repository URLs or publicly accessible GitHub metadata endpoints through a bounded server adapter, not the login provider's private scopes.
2. Select safe fields such as repository name, description, language and public link; cache validated results and limit fetch frequency.
3. Provide manual fallback when metadata is unavailable, restricted or rate-limited.
4. Test private repository URL, removed repository, API quota exhaustion and escaped markdown in descriptions.

**Security, privacy and adverse-case handling.** OAuth sign-in alone must not grant GildedIn permission to read private source code. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Valid public project cards can enrich metadata without exposing private GitHub data or breaking author content. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-009`, `SEC-005`, `OPS-005`. Canonical verification: `T-CNT-09`, `T-SEC-05`, `T-OPS-05`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.8 - Integrate feed preview content into the release pipeline

**Objective and implementation boundary.** Ensure Blog cards are stable published metadata rather than mutable live remote responses.

**Prerequisites.** 15.5 13.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Link selected approved external article previews to owner content IDs and include only validated summary metadata in the compiled release.
2. Generate the public Blog section from the active release, not the live RSS service or latest unsaved sync cache.
3. Keep one primary feed limit and bounded search/SEO metadata, using validated canonical external links.
4. Test a feed refresh during compilation and verify release consistency and canonical link safety.

**Security, privacy and adverse-case handling.** External article previews may not include entire scraped article text in Gilden context automatically. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Published blog previews render consistently despite feed or GitHub outages. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `PUB-002`, `SEO-001`. Canonical verification: `T-CNT-10`, `T-PUB-02`, `T-SEO-01`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.9 - Implement external embed allowlist and rights-safe previews

**Objective and implementation boundary.** Allow supported video/image previews without turning owner portfolios into arbitrary third-party script hosts.

**Prerequisites.** 15.2 7.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Expose only approved iframe/embed providers such as YouTube where compatible with CSP and privacy requirements.
2. Validate provider host, embed identifier, sandbox/allow attributes and safe fallback link; avoid arbitrary HTML pasted from embed pages.
3. Review media rights and attribution for third-party thumbnails or externally provided images before publication.
4. Test lookalike domains, iframe redirect trick, full HTML embed snippets and blocked third-party content.

**Security, privacy and adverse-case handling.** No external owner-chosen script, unreviewed iframe or unrestricted remote media fetch can run on the platform origin. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Allowed embeds work accessibly or degrade to links without expanding browser/network trust. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-005`, `SEC-007`. Canonical verification: `T-SEC-05`, `T-SEC-07`.

**Security/architecture ownership.** Threats: `TH-11`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 15.10 - Verify remote-integration security and independent degradation

**Objective and implementation boundary.** Demonstrate that untrusted network data cannot compromise tenancy, private state or the core public site.

**Prerequisites.** 15.1 15.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-CNT-10, T-SEC-05 and threat cases TH-12/TH-19 as applicable, including DNS rebinding and redirect chains.
2. Confirm all feed writes are owner scoped and remote markup is sanitized before draft inclusion or public publication.
3. Simulate Groq/Redis/feed/GitHub failures together and show core public portfolio remains readable.
4. Document host-specific egress feasibility and keep automatic remote fetching disabled if connect-time protection cannot be proven.

**Security, privacy and adverse-case handling.** An unverified third-party preview is never a reason to weaken SSRF policy. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** External previews are safe when enabled, independently degradable and supported by negative-test evidence. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CNT-010`, `SEC-005`, `OPS-005`. Canonical verification: `T-CNT-10`, `T-SEC-05`, `T-OPS-05`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 16 - Implement Gilden AI as an opt-in release-bound and privacy-safe assistant

**Purpose and architectural rationale.** Add the optional per-portfolio Gilden assistant only after published releases and live access policy exist. It receives selected approved English-language public facts through a filtered provider adapter, applies independent visitor/portfolio/global quotas, streams when supported, and does not persist chat transcripts or visitor identity. Core site functions remain available when AI is disabled.

**Entry criteria and dependency boundary.** Published release IDs, content approval, rate-counter adapters, public host routing and secure logging are implemented. **Dependencies:** Issues 6, 13–15. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** An owner can preview/approve exact knowledge and enable Gilden; anonymous visitors receive cited bounded answers without private data, with safe unavailability when context or quota cannot be proved. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 16.1 - Implement owner AI configuration, default-off state and safe persona

**Objective and implementation boundary.** Give owners control over Gilden without exposing unrestricted system prompt instructions.

**Prerequisites.** 6.6 13.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Store enabled state, display name, greeting, tone preset, suggested questions, placement and limited theme from owner-authorized settings.
2. Require an active eligible release with meaningful Hero/About content and explicit AI usage agreement before enablement.
3. Offer immediate Pause/Disable and validate settings updates with policy version concurrency checks.
4. Test attempted system-prompt override, enabled-by-default import and suspend/delete during configuration.

**Security, privacy and adverse-case handling.** New portfolios must never silently enable public AI by publishing a Hero. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Gilden is opt-in, branded as an AI assistant and cannot alter server safety instructions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-001`, `AI-009`, `SEC-008`. Canonical verification: `T-AI-01`, `T-AI-09`, `T-SEC-08`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.2 - Implement explicit section, field and document AI approvals

**Objective and implementation boundary.** Make the model's input boundary a server-enforced allowlist, not an instruction asking it to ignore secrets.

**Prerequisites.** 16.1 6.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Support owner approval for published sections, specific fields, curated FAQs and separately approved public PDF extracted text.
2. Default newly created fields to AI-denied even when their parent section is approved; retain sensitive private reference/contact fields as denied.
3. Expose exactly what will be sent through the owner-only AI knowledge preview, with per-field/source IDs and redacted sample.
4. Test a newly added nested sensitive field, a revoked source and an uploaded PDF containing private contact data.

**Security, privacy and adverse-case handling.** The existence of a record in MongoDB or a public section does not imply permission to transmit it to Groq. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Approval configuration cannot cause drafts or nonapproved fields to enter compiled AI context. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-002`, `AI-010`, `SEC-008`. Canonical verification: `T-AI-02`, `T-AI-10`, `T-SEC-08`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.3 - Compile release-matched Gilden knowledge snapshots

**Objective and implementation boundary.** Create a bounded deterministic knowledge representation rather than serializing entire portfolio documents into prompts.

**Prerequisites.** 16.2 13.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. After activation, project only approved public fields, facts and validated source IDs of the exact active release into a separate aiContexts artifact.
2. Include approved curated FAQ, optional document excerpts and selected external article preview metadata only; exclude raw contacts, account records and unapproved PDF content.
3. Record portfolioId, releaseId, policyVersion, compiler version and checksum so mismatched or stale contexts are refused.
4. Test two rapid publications and a knowledge compilation error after a successful public release activation.

**Security, privacy and adverse-case handling.** Do not call the model with stale previous-release knowledge simply to keep chat available. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Each AI context is explicitly bound to the current active release and policy or Gilden remains unavailable. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-002`, `AI-003`, `AI-004`. Canonical verification: `T-AI-02`, `T-AI-03`, `T-AI-04`.

**Security/architecture ownership.** Architectural decisions: `ADR-014`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.4 - Implement immediate AI approval revocation and pause gate

**Objective and implementation boundary.** Enforce live owner or moderator AI denial even when older context bytes are cached or a response is streaming.

**Prerequisites.** 16.3 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Create an authoritative policy generation check at request admission and throughout long-running generation as far as the application controls it.
2. Implement revoke endpoint that increments policy version immediately and invalidates old contexts before acknowledging success.
3. Abort generation and stop further server output when approval is removed; reject future access if current policy cannot be loaded.
4. Test revocation during streamed answer, deletion, suspended portfolio, policy store outage and stale browser tab.

**Security, privacy and adverse-case handling.** Already delivered text or provider-processed bytes cannot be retracted; the UI/privacy policy must not promise otherwise. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** After revocation, no new or continuing model context beyond the app's control is served and calls fail closed. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-004`, `SEC-008`, `TEN-009`. Canonical verification: `T-AI-04`, `T-SEC-08`, `T-TEN-09`.

**Security/architecture ownership.** Threats: `TH-20`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.5 - Implement atomic visitor, portfolio and platform AI budgets

**Objective and implementation boundary.** Protect a shared free inference allowance against anonymous abuse without building a persistent visitor profile.

**Prerequisites.** 16.1 2.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use short-lived anonymous rate session tokens, coarse IP abuse safeguards and atomic Redis-like counters for 15 visitor messages/day initially.
2. Apply separate portfolio monthly and platform-wide quotas plus bounded prompt size, output length and concurrency admission before calling Groq.
3. Charge started generation even if interrupted and do not refund canceled streams by default.
4. Test simultaneous requests across browser sessions, counter outage, replayed quota tokens and provider 429/503.

**Security, privacy and adverse-case handling.** No counter-store failure may become unlimited admission and no usage can spill into paid provider billing. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every request consumes the correct budget once or fails safely without inference call. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-007`, `SEC-009`, `OPS-005`. Canonical verification: `T-AI-07`, `T-SEC-09`, `T-OPS-05`.

**Security/architecture ownership.** Threats: `TH-22`; Architectural decisions: `ADR-016`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.6 - Implement Groq provider adapter and privacy-safe prompt boundary

**Objective and implementation boundary.** Keep inference provider replaceable and transmit only authorized information for one bounded visitor question.

**Prerequisites.** 16.3 16.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add server-only Groq adapter with model/config validation, provider eligibility check, request cancellation and safe timeout limits.
2. Build structured system/application/content/question roles from selected knowledge without trusting owner or visitor prompt text as instructions to bypass policy.
3. Strip unnecessary metadata and ensure no tokens, raw contact inbox messages or account IDs are sent beyond what inference needs.
4. Test captured outbound payload with private sentinel, malicious portfolio FAQ and model prompt injection attempts.

**Security, privacy and adverse-case handling.** The model response is untrusted; it cannot authorize actions, fetch URLs or provide raw internal provider errors. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Adapter calls are auditable through aggregate counts but contain no persisted raw visitor prompts. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-003`, `AI-008`, `SEC-008`. Canonical verification: `T-AI-03`, `T-AI-08`, `T-SEC-08`.

**Security/architecture ownership.** Threats: `TH-19`; Architectural decisions: `ADR-015`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.7 - Implement citation mapping and unknown-answer behavior

**Objective and implementation boundary.** Ensure factual claims point to real published evidence instead of hallucinated links or private fields.

**Prerequisites.** 16.6 14.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Give the model only approved source identifiers and bounded public summaries; resolve citations on the server against active release/source map.
2. For a fact without a detail page, generate the real section anchor; for published projects, use verified canonical detail routes.
3. Reject or omit arbitrary URLs generated by the model and provide a truthful unavailable-information response when grounding is absent.
4. Test fabricated source ID, removed project, alias rename and unsupported employment claim.

**Security, privacy and adverse-case handling.** Never invent achievements, outcomes, contact details or a source URL solely because the model output contains them. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Displayed citations open actual permitted published content or the assistant explicitly declines unknown facts. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-005`, `SEC-008`, `SEO-001`. Canonical verification: `T-AI-05`, `T-SEC-08`, `T-SEO-01`.

**Security/architecture ownership.** Threats: `TH-21`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.8 - Implement streaming/SSE chat route and cancellation semantics

**Objective and implementation boundary.** Provide responsive chat without storing visitor identity or transcript history.

**Prerequisites.** 16.5 16.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement apex path and subdomain public Gilden POST variants with verified tenant context and required live policy/quota admission.
2. Stream bounded tokens via the source 06 event format, with controlled non-streaming fallback, cancellation and terminal statuses.
3. Keep conversation history in the current browser session only; clear it on refresh/session end and redact it from error/logging middleware.
4. Test interrupted stream, provider timeout after partial output, malformed event, browser disconnect and retry during quota exhaustion.

**Security, privacy and adverse-case handling.** An interrupted response cannot be mistaken for a successful complete answer or trigger a free duplicate request. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Visitors see partial output marked Interrupted or a safe unavailability message; no durable chat text is stored. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-006`, `AI-008`, `AI-007`. Canonical verification: `T-AI-06`, `T-AI-08`, `T-AI-07`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.9 - Build accessible floating Gilden widget and owner usage UI

**Objective and implementation boundary.** Integrate the assistant into public portfolios as a nonblocking optional enhancement.

**Prerequisites.** 16.8 8.3. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide safe owner-chosen placement presets, accessible floating trigger, desktop dialog and appropriately sized mobile overlay.
2. Show AI identity, greeting, example prompts, streaming state, cancel/retry, cited sources and links to relevant portfolio sections.
3. Display owner-only aggregate usage, current allowance, availability and failure counts without raw visitor messages.
4. Test focus trap/return, zoom, mobile viewports, reduced motion and an unavailable Groq provider.

**Security, privacy and adverse-case handling.** Gilden must not cover essential navigation or automatically collect lead/contact details. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Chat is opt-in, keyboard/touch accessible and can disappear without affecting the published portfolio. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-001`, `AI-006`, `AI-009`, `AI-008`. Canonical verification: `T-AI-01`, `T-AI-06`, `T-AI-09`, `T-AI-08`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 16.10 - Verify Gilden privacy, revocation and quota adversarial matrix

**Objective and implementation boundary.** Prove security and graceful degradation through outbound payload inspection and live policy transitions.

**Prerequisites.** 16.1 16.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run source 11 T-AI-01 through T-AI-10, prompt-injection, disabled AI, stale context, cancellation and missing knowledge tests.
2. Inspect captured provider requests for private sentinel, contact data, drafts, sessions and unapproved PDF text rather than relying only on model refusal.
3. Simulate Redis failure, Groq limits and simultaneous requests across two tenants; confirm public pages and contact links work.
4. Document Groq current free-plan/data-use eligibility as a release gate and keep AI disabled until verified.

**Security, privacy and adverse-case handling.** No chat feature passes if its refusal message hides an earlier unauthorized outbound data transfer. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Gilden exposes only release-matched approved knowledge, never stores transcripts and fails safely under every tested quota/policy loss. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-001`, `AI-002`, `AI-003`, `AI-004`, `AI-005`, `AI-006`, `AI-007`, `AI-008`, `AI-009`, `AI-010`. Canonical verification: `T-AI-01`, `T-AI-02`, `T-AI-03`, `T-AI-04`, `T-AI-05`, `T-AI-06`, `T-AI-07`, `T-AI-08`, `T-AI-09`, `T-AI-10`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 17 - Implement consent-based contact, privacy-conscious analytics and public discovery

**Purpose and architectural rationale.** Provide useful interactions beyond the portfolio itself while protecting anonymous visitors from hidden tracking and excessive data capture. Keep contact submissions separate from Gilden, keep aggregate analytics private by default and make the initial directory small, searchable and based on currently eligible published portfolios.

**Entry criteria and dependency boundary.** Public renderer, owner dashboard, live tenant policy, basic abuse infrastructure and bounded storage exist. **Dependencies:** Issues 5, 9, 13 and 14. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** Visitors can voluntarily submit text contact messages and browse eligible portfolios; owners can manage a short-lived inbox and aggregate statistics without chat-based lead collection or visitor profiling. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.1 - Implement consent-based public text-only contact endpoint

**Objective and implementation boundary.** Enable legitimate direct communication without exposing an owner email or collecting data inside Gilden chat.

**Prerequisites.** 14.2 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement the documented public POST contact routes for path/subdomain portfolios, deriving tenant from verified host/slug and active release/policy.
2. Validate a bounded name, email, subject/message and optional organization, plus explicit visitor submission intent and any required privacy acknowledgement.
3. Write one owner-scoped inbox record with expiry and return a neutral success response only after persistence acknowledgment.
4. Test nonexistent portfolio, unlisted direct link, disabled owner and attempted form submission with unexpected attachments.

**Security, privacy and adverse-case handling.** Do not include contact details in a public response, Gilden prompt or analytic payload. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A visitor can voluntarily send text to an eligible owner and receives reliable success/failure feedback. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CON-001`, `SEC-004`, `SEC-009`. Canonical verification: `T-CON-01`, `T-SEC-04`, `T-SEC-09`.

**Security/architecture ownership.** Architectural decisions: `ADR-028`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.2 - Implement anonymous spam protection and bounded contact submissions

**Objective and implementation boundary.** Protect the free inbox from abuse without forcing a challenge on ordinary portfolio views.

**Prerequisites.** 17.1 2.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Apply request-size bounds, per-action rate limits and short-lived anti-abuse counters using trusted request attributes.
2. Evaluate Cloudflare Turnstile only for protected submissions/suspicious actions after confirming its free hostname configuration and server verification compatibility.
3. Verify any challenge token on the server against expected action/hostname and do not confuse it with account authentication.
4. Test replayed token, burst requests, oversized body and a malicious sibling-subdomain POST.

**Security, privacy and adverse-case handling.** Do not install a paid WAF or share a single unverified challenge secret across uncontrolled hosts. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Spam is bounded and a normal keyboard-accessible visitor can submit with explicit consent. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-009`, `CON-001`, `OPS-001`. Canonical verification: `T-SEC-09`, `T-CON-01`, `T-OPS-01`.

**Security/architecture ownership.** Threats: `TH-23`, `TH-38`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.3 - Implement owner-only inbox read, status and deletion

**Objective and implementation boundary.** Give owners a small, secure contact-message inbox without sending private messages through email services by default.

**Prerequisites.** 17.1 9.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement GET /api/v1/portfolios/{portfolioId}/inbox with owned scope, bounded pagination and read-time expiry filtering.
2. Add owner UI for list/detail, safe status and idempotent DELETE /inbox/{messageId}; do not expose private emails as public links.
3. Ensure HTML escaping and neutralized links prevent an attacker-written message from executing code in the dashboard.
4. Test guessed message IDs, malicious body HTML, expired records and cross-tenant inbox access.

**Security, privacy and adverse-case handling.** Administrator operational status must not automatically grant unrestricted access to inbox message bodies. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only authorized owners can view unexpired messages and delete them without affecting unrelated tenants. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CON-001`, `TEN-002`, `SEC-002`. Canonical verification: `T-CON-01`, `T-TEN-02`, `T-SEC-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.4 - Implement 30-day inbox retention with read-time enforcement

**Objective and implementation boundary.** Prevent stale private contact information from remaining accessible while best-effort TTL cleanup catches up.

**Prerequisites.** 17.3 3.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Set contact expiresAt on write and Mongo TTL/purge scheduling where supported, without relying on exact physical deletion time.
2. Apply expiry filtering on every owner inbox read and export inclusion according to source 08's retention contract.
3. Provide a bounded idempotent cleanup/reconciliation operation for records and related indexes; record sanitized deletion outcome.
4. Test a record exactly at expiry, stalled TTL sweeper, expired message ID query and process restart.

**Security, privacy and adverse-case handling.** Do not offer indefinite in-platform retention that defeats the stated 30-day policy. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Expired submissions are never returned even when the database still physically contains them temporarily. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CON-001`, `ACC-002`, `SEC-012`. Canonical verification: `T-CON-01`, `T-ACC-02`, `T-SEC-12`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.5 - Implement privacy-safe aggregate pageview and click ingestion

**Objective and implementation boundary.** Collect only low-detail site-use signals needed for owner statistics, not durable browsing identities.

**Prerequisites.** 14.1 3.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define aggregate counters for published page views, project clicks and outbound links per portfolio and coarse time bucket.
2. Use bounded anonymous event validation, bot filtering and low-trust input accounting; avoid per-visitor raw event history, fingerprinting and detailed location collection.
3. Increment aggregates safely under concurrency and reject fields such as visitor email, raw IP history or chat text.
4. Test duplicate/burst events, forged counters and suspended/unlisted visibility conditions.

**Security, privacy and adverse-case handling.** Do not present anonymous counts as guaranteed exact or identify individual viewers from small buckets. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Aggregate metrics can be computed without a visitor profile, and bogus events are bounded by admission rules. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ANA-001`, `SEC-009`, `SEC-012`. Canonical verification: `T-ANA-01`, `T-SEC-09`, `T-SEC-12`.

**Security/architecture ownership.** Threats: `TH-39`; Architectural decisions: `ADR-027`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.6 - Implement owner analytics dashboard and empty/unavailable states

**Objective and implementation boundary.** Give owners an honest small statistics summary with predictable performance and privacy boundaries.

**Prerequisites.** 17.5 9.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Expose bounded owner-only analytics queries grouped by date and metric with no raw visitor attributes.
2. Show total views, project clicks, outbound interactions and optional simple recent activity graph in dashboard.
3. Provide states for no traffic, unavailable aggregate store, delayed updates and suspected bot abuse without inventing metrics.
4. Test query isolation, invalid time range, huge requested intervals and a different owner's portfolioId.

**Security, privacy and adverse-case handling.** The dashboard must not offer session replay, detailed geolocation or individual visitor timelines. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owners see useful aggregate trend data and cannot query another tenant's analytics. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ANA-001`, `TEN-002`. Canonical verification: `T-ANA-01`, `T-TEN-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.7 - Implement explicit owner opt-in for published statistics

**Objective and implementation boundary.** Make any public statistics an intentional projection rather than an accidental consequence of analytics being collected.

**Prerequisites.** 17.6 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add an owner setting and approved stats block that selects broad aggregate metrics and optional trend graph to publish.
2. Keep public display disabled by default; validate minimum aggregation thresholds where needed to reduce inference about individual visits.
3. Bind displayed values to allowed aggregate projection behind live portfolio and moderation eligibility checks.
4. Test enabling/disabling without exposing operational identifiers, and false public statistics injection.

**Security, privacy and adverse-case handling.** Never publish individual visit records or the owner's full private dashboard analytics by copying its response. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Owner-approved stats can appear in public portfolio and disappear when revoked without leaking raw events. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ANA-001`, `SEC-012`, `TEN-009`. Canonical verification: `T-ANA-01`, `T-SEC-12`, `T-TEN-09`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.8 - Implement lightweight searchable public portfolio directory

**Objective and implementation boundary.** Make discoverability useful without creating a ranking or recommendation service.

**Prerequisites.** 5.9 14.5. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build small homepage-facing directory and optional browse page driven by approved public portfolio directory projection from Issue 5.
2. Support bounded keyword/category filtering and basic pagination using release-derived public labels and thumbnails.
3. Exclude unlisted, unpublished, disabled, suspended and moderated content under current policy; keep featured examples explicitly curated.
4. Test a previously indexed portfolio moved to unlisted and search during moderation propagation.

**Security, privacy and adverse-case handling.** Do not collect visitor accounts, implement popularity rankings or infer user eligibility from mere registration. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Directory returns only currently eligible published portfolios and works without a dedicated search cluster. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEO-002`, `TEN-009`, `PRF-001`. Canonical verification: `T-SEO-02`, `T-TEN-09`, `T-PRF-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.9 - Implement contact and Gilden separation in public UI

**Objective and implementation boundary.** Make visitor contact a deliberate independent interaction instead of hidden chatbot lead capture.

**Prerequisites.** 16.9 17.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Place the Contact action on eligible public pages with clear privacy and consent text; use a normal link or explicit form trigger independent of Gilden.
2. Allow Gilden only to suggest opening a separate contact form and optionally drafting a message locally after explicit visitor request.
3. Ensure the chat request does not include contact-form fields, submit them or persist message history to the inbox.
4. Test navigation from interrupted/unavailable Gilden to Contact and verify no chat data is silently prefilled or submitted.

**Security, privacy and adverse-case handling.** No visitor personal data can be harvested by the chatbot as a substitute for voluntary form submission. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A visitor can deliberately choose a separate contact interaction with no automatic data transfer from chat. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-008`, `CON-001`. Canonical verification: `T-AI-08`, `T-CON-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 17.10 - Verify contact, analytics and directory privacy boundaries

**Objective and implementation boundary.** Demonstrate that public interactions remain tenant-safe, privacy-minimized and independent of optional provider failures.

**Prerequisites.** 17.1 17.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run T-CON-01, T-ANA-01 and source 11 public directory/analytics/contact cases with two owners.
2. Inspect outgoing requests and stored records to verify no AI transcript, session cookie or raw visitor identity is included in aggregates.
3. Test expiry, rate-limit exhaustion, malicious message markup, unlisted directory exclusion and a disabled portfolio.
4. Treat manual bot-protection provider hostname proof as a pending deployment gate until actual integration is configured.

**Security, privacy and adverse-case handling.** A dashboard chart rendering successfully does not prove source data is authorized or anonymized. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** All anonymous submission and analytics paths are bounded, correctly scoped and absent from unrelated tenants. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `CON-001`, `ANA-001`, `SEC-009`, `SEO-002`. Canonical verification: `T-CON-01`, `T-ANA-01`, `T-SEC-09`, `T-SEO-02`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 18 - Implement administration, moderation, privacy rights and account deletion

**Purpose and architectural rationale.** Provide the minimum safe administrative controls for a public user-generated-content service and the privacy lifecycle promised to owners and visitors. Moderation is an authoritative live overlay, not a mutation of immutable author content. Export and deletion must be owner-scoped and safe to retry; permanent erasure can override historical restore convenience.

**Entry criteria and dependency boundary.** Verified admin identity, live policy, owner data repositories, public delivery and safe audit records exist. **Dependencies:** Issues 4, 5, 13, 16 and 17. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** An administrator can respond to abuse reports and suppress harmful material; owners can export portable data and delete accounts, with immediate visibility revocation and documented cleanup limitations. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 18.1 - Implement apex-only administrator route authorization

**Objective and implementation boundary.** Give platform administration explicit privileges without treating admin status as unlimited data access.

**Prerequisites.** 4.9 2.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Restrict /api/v1/admin endpoints and admin UI to verified apex host, current server session, explicit administrator role and recent authentication for mutations.
2. Use allowlisted admin DTOs and command-specific permissions for reports, moderation, audit and compact status.
3. Record access attempts and changes in restricted audit events while avoiding unrestricted private draft/inbox reads.
4. Test forged role claim, altered account profile, tenant subdomain access and stale admin session.

**Security, privacy and adverse-case handling.** No public account can obtain admin by being first registrant, and an admin action cannot bypass owner-content safety rules. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only provisioned administrators reach specific controls and every denied action has no side effect. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-006`, `SEC-002`, `SEC-010`, `ADM-003`. Canonical verification: `T-IAM-06`, `T-SEC-02`, `T-SEC-10`, `T-ADM-03`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.2 - Implement public portfolio abuse reporting and restricted queue

**Objective and implementation boundary.** Allow anonymous visitors to report dangerous content while limiting report spam and unnecessary personal data.

**Prerequisites.** 17.9 18.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement public report endpoint and an accessible Report Portfolio action on eligible pages, accepting bounded reason code, verified portfolio/resource URL and optional descriptive text.
2. Provide authenticated admin queue/detail APIs with per-report status and safe context, plus rate/bot controls.
3. Record original verified URL/source ID, timestamps and minimal reporter-supplied information rather than full visitor tracking.
4. Test fake foreign portfolio URLs, malicious report content, duplicate burst reports and unlisted portfolio reports.

**Security, privacy and adverse-case handling.** A report cannot directly change another tenant's draft or grant the reporter moderator privileges. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Valid reports appear in the restricted queue without leaking complainant content publicly. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-002`, `SEC-009`. Canonical verification: `T-ADM-02`, `T-SEC-09`.

**Security/architecture ownership.** Threats: `TH-32`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.3 - Implement live whole-portfolio moderation and suspension

**Objective and implementation boundary.** Enable rapid security containment without editing the owner's immutable authored releases.

**Prerequisites.** 18.1 5.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Add administrator commands for active suspension, restoration/review, reason codes and affected portfolio securityVersion changes.
2. Make suppression apply to apex paths, subdomains, public APIs, AI, directory, search/OG and media delivery as proven by live policy gate.
3. Require recent authentication and durable redacted audit event for decisions; return a neutral unavailable page to visitors.
4. Test already-warm CDN output, suspended owner attempting Publish and a stale admin request.

**Security, privacy and adverse-case handling.** Do not rely solely on cache purge or let owner visibility settings override moderator suspension. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Suspended portfolio is unavailable through all relevant paths even while old release bytes remain stored. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-001`, `TEN-009`, `AI-004`, `SEC-010`. Canonical verification: `T-ADM-01`, `T-TEN-09`, `T-AI-04`, `T-SEC-10`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.4 - Implement per-content-item moderation overlay

**Objective and implementation boundary.** Suppress a dangerous project or item without deleting an entire portfolio or silently rewriting historic data.

**Prerequisites.** 18.3 7.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provide administrator item-specific decision against stable contentId/sourceId with expected policy generation.
2. Apply current denial to public lists/detail pages, search, OG where applicable, Gilden sources and exported public directory views.
3. Preserve immutable original release but redact/suppress derived access and mark a relevant revision as requiring repair if necessary.
4. Test a project displayed by multiple repeaters, cached direct project URL and stale AI context citing the item.

**Security, privacy and adverse-case handling.** A forbidden item must not be rediscovered through older public search artifacts or media references. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Moderation removes the item from current permitted public surfaces without mutating its original authoring snapshot. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-001`, `AI-004`, `SEO-002`. Canonical verification: `T-ADM-01`, `T-AI-04`, `T-SEO-02`.

**Security/architecture ownership.** Threats: `TH-36`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.5 - Implement report resolution, review requests and audit trail

**Objective and implementation boundary.** Offer an accountable but lightweight process for contested suspensions and prohibited content.

**Prerequisites.** 18.2 18.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Build admin report resolution states, reason selections, closure notes and safe owner-facing status/appeal mechanism.
2. Require reviewer identity, current privilege and fresh authentication for high-impact decisions.
3. Record event ID, action, target portfolio/item, policy version and minimal reason metadata without copying private report body into long-lived audit logs.
4. Test conflicting reviewers, repeated resolution and unauthorized owner requests to lift suspension.

**Security, privacy and adverse-case handling.** Do not build an unnecessary case-management SaaS or use AI moderation as sole decision-maker. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A report can be resolved/reviewed with traceable actions, and current policy remains authoritative. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-002`, `SEC-010`, `SEC-012`. Canonical verification: `T-ADM-02`, `T-SEC-10`, `T-SEC-12`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.6 - Implement compact administration service status page

**Objective and implementation boundary.** Give the solo maintainer safe information needed to diagnose outages without opening provider consoles to other users.

**Prerequisites.** 18.1 2.6. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement GET /api/v1/admin/status with redacted connectivity and recent error state for DB, AI, media, publishing and authentication.
2. Display aggregate quota/capacity and pending propagation/cleanup without exposing raw credentials, owner inboxes or visitor chat transcripts.
3. Use bounded queries, safe timeouts and clear unknown state when a provider's health cannot be determined.
4. Test logging/provider outage and a viewer trying to access internal error messages.

**Security, privacy and adverse-case handling.** Admin visibility is not permission to dump raw MongoDB documents or provider response bodies. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Authorized admin sees useful limited status while unknown/failed dependencies remain explicit. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-003`, `OPS-004`. Canonical verification: `T-ADM-03`, `T-OPS-04`.

**Consult before implementation:** [06 — Api Design](06-api-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.7 - Implement privacy notice, consent controls and disclosure surfaces

**Objective and implementation boundary.** Explain actual personal-data processing and limits before the platform begins collecting it at scale.

**Prerequisites.** 9.8 16.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Publish accurate notice for OAuth identities, portfolio public/unlisted behavior, media processing, contact inbox retention, minimal analytics and Groq transmission.
2. Explain the accepted no-guaranteed-backup/data-loss risk, provider processing where applicable and what Gilden does not store locally.
3. Provide owner controls for per-field public/AI approval, analytics public opt-in and portfolio disabling that reflect server policy.
4. Review applicable legal obligations, provider terms and font/media rights without inventing compliance certification.

**Security, privacy and adverse-case handling.** A generic banner cannot substitute for legally required processing disclosures or a verified host data-use setting. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public disclosures match observed data flows and all privacy-related settings have demonstrable enforcement. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-012`, `OPS-006`, `OPS-007`, `AI-002`. Canonical verification: `T-SEC-12`, `T-OPS-06`, `T-OPS-07`, `T-AI-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-031`, `ADR-035`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.8 - Implement portable owner export with private archive access

**Objective and implementation boundary.** Allow owners to leave with reusable data independently of the GildedIn renderer while preserving cross-tenant privacy.

**Prerequisites.** 18.7 12.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Implement recent-auth owner export command including structured content, schemas, layouts, design tokens, SEO settings and available original media manifest.
2. Assemble bounded export from owner-scoped repositories and validate every media reference before including data or bytes.
3. Return a nonpublic, short-lived download or controlled response with a format manifest/version and clear missing-media entries.
4. Test guessed export operationId, foreign content reference, a large portfolio and an expired archive URL.

**Security, privacy and adverse-case handling.** No export artifact may be publicly indexed, cached/shared or include another tenant's material. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A valid owner can reconstruct understandable portfolio data offline; unauthorized exports are denied and audited. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ACC-001`, `TEN-002`, `SEC-012`. Canonical verification: `T-ACC-01`, `T-TEN-02`, `T-SEC-12`.

**Security/architecture ownership.** Threats: `TH-26`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.9 - Implement immediate disable and idempotent account deletion cleanup

**Objective and implementation boundary.** Honor permanent deletion without reviving sensitive data through delayed jobs or historical releases.

**Prerequisites.** 18.7 18.8 13.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Require recent authentication and initiate durable deletionOperations state with immediate session revocation and live public/AI suppression.
2. Queue or opportunistically reconcile deletion of owned drafts, releases, slug claims, media, contexts, contact, aggregates and provider identities with bounded retries.
3. Recheck deletion generation before late publish/media/AI work commits; handle physical backup/cache retention honestly.
4. Test repeated delete requests, crash between suppression and cleanup, concurrent publish and owner export race.

**Security, privacy and adverse-case handling.** Never permit an old operation to recreate a deleted account or promise instantaneous third-party cache/backup erasure. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Public routes stop serving immediately and repeatable cleanup reaches verifiable end state within provider capabilities. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ACC-002`, `PUB-008`, `TEN-009`, `SEC-012`. Canonical verification: `T-ACC-02`, `T-PUB-08`, `T-TEN-09`, `T-SEC-12`.

**Security/architecture ownership.** Threats: `TH-37`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 18.10 - Verify moderation, export, deletion and privacy regression suite

**Objective and implementation boundary.** Close the high-risk administrative/privacy flows with genuine negative and crash tests.

**Prerequisites.** 18.1 18.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run T-ADM-01..03, T-ACC-01..02, privacy/security cases and source 11 threat crosswalk.
2. Verify cached apex/subdomain/media/OG/search/AI responses after moderation, archive ownership, retention expiry and deletion during background work.
3. Audit admin role provisioning, recent authentication, privilege changes and logs for secret/PII leaks.
4. Record blocked external legal/provider gates rather than claiming formal compliance.

**Security, privacy and adverse-case handling.** Neither a user-visible 404 nor a successful delete status alone proves bytes/policies are safely handled. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every admin/privacy capability has evidence for access denial, current-policy suppression and idempotent lifecycle behavior. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `ADM-001`, `ADM-002`, `ADM-003`, `ACC-001`, `ACC-002`, `SEC-010`, `SEC-012`. Canonical verification: `T-ADM-01`, `T-ADM-02`, `T-ADM-03`, `T-ACC-01`, `T-ACC-02`, `T-SEC-10`, `T-SEC-12`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

# Issue 19 - Configure portable zero-charge production hosting, protected releases and operations

**Purpose and architectural rationale.** Implement the production deployment contract only after the application security, data and content pipelines are sufficiently testable. Confirm current provider eligibility and data-use terms, the exact no-payment-card/no-overage behavior, DNS/wildcard TLS, OAuth callbacks, database/storage isolation and verified CDN revocation before admitting real users. A successful build alone is insufficient.

**Entry criteria and dependency boundary.** Core functionality and tests from Issues 2–18 exist; no production credentials are needed for untrusted tests. **Dependencies:** Issues 1–18. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** The chosen host is proven contractually and technically eligible, release workflows are controlled, all data processing is appropriately configured and every critical deployment gate has evidence or blocks launch. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [04 — C4 Diagrams](04-c4-diagrams.md), [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 19.1 - Verify host eligibility, provider privacy and absolute zero-spend

**Objective and implementation boundary.** Make a documented real-account provider decision rather than assuming Vercel Hobby automatically fits public user-generated SaaS.

**Prerequisites.** 1.10 12.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Confirm current Vercel Hobby terms permit the specific free nonmonetized multi-user workload; if not, evaluate a compatible host preserving Next.js architecture.
2. Inspect and record effective provider content/model-training opt-out and tenant-data retention/processing settings before real personal data is accepted.
3. Verify each DB, media, Redis, Groq, bot-protection and hosting account requires no payment card and cannot silently charge overages.
4. Record terms version, account settings evidence and safe exhaustion behavior; keep incompatible integrations off.

**Security, privacy and adverse-case handling.** Do not silently purchase a paid backup add-on, host tier or usage credits to meet requirements. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** A signed deployment-feasibility ledger proves no new charges or unapproved provider processing is possible. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-002`, `OPS-005`, `OPS-007`. Canonical verification: `T-OPS-01`, `T-OPS-02`, `T-OPS-05`, `T-OPS-07`.

**Security/architecture ownership.** Threats: `TH-33`; Architectural decisions: `ADR-022`, `ADR-023`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 19.2 - Configure production environments, secrets and privileged service access

**Objective and implementation boundary.** Isolate real users, deployment tokens and DB credentials from source and untrusted build/test execution.

**Prerequisites.** 19.1 2.1. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Define server-only production env schema, canonical domain, verified network endpoints, secret rotation and optional-service enable flags.
2. Create least-privilege DB/storage/provider credentials, narrow source IP/network restrictions where feasible and ensure no secret is in NEXT_PUBLIC or client output.
3. Require operator approval for production secret changes and prohibit test builds from loading live resources.
4. Test accidental production URI in CI test job, leaked token in build output and rejected missing-secret startup.

**Security, privacy and adverse-case handling.** A secret appearing in a managed dashboard is not evidence the app is authorized to use it safely. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Production server starts with verified safe configuration, while local/test jobs cannot reach production writes. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-006`, `SEC-011`, `OPS-003`. Canonical verification: `T-SEC-06`, `T-SEC-11`, `T-OPS-03`.

**Security/architecture ownership.** Threats: `TH-44`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.3 - Prove apex, www and wildcard DNS/TLS on actual chosen host

**Objective and implementation boundary.** Deliver both required public URL forms without jeopardizing existing domain services or account sessions.

**Prerequisites.** 19.1 5.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Inspect existing DNS zone records relevant to www, mail, TXT verification, CAA and explicit infrastructure subdomains before changes.
2. Configure authoritative nameservers/DNS, wildcard certificate and apex redirects as supported by the chosen provider and preserve existing nonportfolio subdomain precedence.
3. Test HTTPS for apex, www, a valid tenant wildcard, old slug aliases and an unknown tenant hostname, including URL/navigation/canonical behavior.
4. Capture actual browser cookie scope and reject forged Host/X-Forwarded-Host in the deployed network path.

**Security, privacy and adverse-case handling.** Provider marketing pages cannot replace proof that wildcard certificates and routing work for aaroophan.dev. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Both URL models have real TLS and correct host-scoped routing, with no unexpected DNS loss. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-006`, `TEN-007`, `TEN-008`, `IAM-005`. Canonical verification: `T-TEN-06`, `T-TEN-07`, `T-TEN-08`, `T-IAM-05`.

**Consult before implementation:** [04 — C4 Diagrams](04-c4-diagrams.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.4 - Configure OAuth callback origins and deployed browser security

**Objective and implementation boundary.** Confirm login and protected APIs are secure on the actual public origin and not only in local mocks.

**Prerequisites.** 19.3 4.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Register exact Google/GitHub provider callback URLs and approved return targets for the chosen host; avoid wildcard OAuth callback rules.
2. Verify Secure, HttpOnly, \_\_Host- host-only cookie behavior and CSRF/Origin/Fetch Metadata checks on apex versus tenant subdomain.
3. Apply tested CSP, HSTS where safe, X-Content-Type-Options, frame restrictions and route-specific no-store cache headers.
4. Test OAuth state/replay, direct tenant-subdomain account route, invalid forwarded host and credentialed CORS attacks.

**Security, privacy and adverse-case handling.** Do not enable HSTS includeSubDomains before all required subdomains are ready, or allow unsafe-inline to silence a CSP failure. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Real deployed browser evidence proves protected sessions and public portfolio hosts remain separated. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-005`, `SEC-003`, `TEN-007`. Canonical verification: `T-IAM-01`, `T-IAM-05`, `T-SEC-03`, `T-TEN-07`.

**Security/architecture ownership.** Threats: `TH-45`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.5 - Configure MongoDB, object store, Redis and Groq operational safeguards

**Objective and implementation boundary.** Make external providers obey the same tenant, privacy and zero-charge boundaries as the application's own code.

**Prerequisites.** 19.1 12.10 16.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Provision eligible database with least-privilege roles, verified connection security, indexes and plan constraints; prohibit paid backup upgrade under zero budget.
2. Configure private media staging/delivery, absolute hard global storage admission, bounded Redis counters and Groq rate/usage limits.
3. Validate health failures, connection timeouts, credential rotation and data-use settings with sanitized tests.
4. Test provider storage quota exhausted, AI 429 and Redis outage without unauthorized fallback or billable overflow.

**Security, privacy and adverse-case handling.** Managed encryption and HTTPS do not substitute for application owner authorization. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Production provider configuration satisfies hard cost and security gates or affected feature remains disabled. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-005`, `MED-003`, `AI-007`, `SEC-006`. Canonical verification: `T-OPS-01`, `T-OPS-05`, `T-MED-03`, `T-AI-07`, `T-SEC-06`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.6 - Implement protected production CI deployment and promotion

**Objective and implementation boundary.** Deploy reviewed artifacts rather than allowing every branch or fork to trigger an authorized release.

**Prerequisites.** 2.10 19.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Use the source 10 protected Git integration or staged Vercel CLI release path, with reviewed exact CLI/action versions and environment approval.
2. Run required typecheck, security scans, isolated tests, API contract and targeted performance checks before promotion.
3. Stage a production-target build without domain assignment when supported, run safe smoke tests against synthetic/read-only data and promote the tested artifact.
4. Record commit SHA, deployment URL/ID, approved environment and gate evidence without exposing build secrets.

**Security, privacy and adverse-case handling.** A preview deployment must not be promoted as if it were the same production build when the host rebuilds with different environment settings. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Only reviewed, tested and explicitly authorized versions can serve the real domain. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-011`, `OPS-003`, `PRF-001`. Canonical verification: `T-SEC-11`, `T-OPS-03`, `T-PRF-01`.

**Consult before implementation:** [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 19.7 - Implement safe runtime headers, cache routing and policy revocation

**Objective and implementation boundary.** Prove revocable public content cannot bypass authoritative live controls at the actual CDN/edge boundary.

**Prerequisites.** 19.3 18.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Configure public immutable release caching with release IDs, targeted revalidation and route-specific policy-aware reads, independent of private no-store responses.
2. Test owner disable, admin suspension, individual project suppression, unlisted transition and AI revoke after all relevant pages/artifacts have been cached.
3. Inspect direct public media, OG/social image and search endpoints in addition to the visible HTML homepage.
4. Document exact propagation delay and fallback 503/404 behavior when policy is unavailable.

**Security, privacy and adverse-case handling.** A successful revalidateTag call cannot be treated as proof that already-public CDN objects have been revoked. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every content-serving path enforces current policy, and critical revocation passes actual deployed cache tests. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-009`, `ADM-001`, `PUB-004`, `AI-004`, `SEO-002`. Canonical verification: `T-TEN-09`, `T-ADM-01`, `T-PUB-04`, `T-AI-04`, `T-SEO-02`.

**Security/architecture ownership.** Architectural decisions: `ADR-013`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.8 - Implement additive migrations, release rollback and emergency kill switches

**Objective and implementation boundary.** Keep application deployment reversible without rolling back tenant content, live policy or data ownership.

**Prerequisites.** 19.6 7.8. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run versioned additive database migration preflight and compatibility checks before changing production renderer/schema expectations.
2. Document two-phase deploy, operator approval and production artifact rollback using the chosen host's supported commands.
3. Provide narrow feature-disable switches for AI, uploads, remote fetch and unsafe cinematic effects, while preserving authoritative access controls.
4. Rehearse reverting application code while latest published release and policy remain active, and handle incompatible old code explicitly.

**Security, privacy and adverse-case handling.** An app rollback must never restore a deleted account, old moderation permission or a stale AI approval. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Rollback is repeatable and does not mutate active tenant releases or bypass current policy. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-002`, `PUB-002`, `TEN-009`. Canonical verification: `T-OPS-02`, `T-PUB-02`, `T-TEN-09`.

**Consult before implementation:** [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 19.9 - Implement production-safe observability and incident runbooks

**Objective and implementation boundary.** Give the solo maintainer enough evidence to respond to major failures without assuming enterprise monitoring or log retention.

**Prerequisites.** 18.6 19.7. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Configure redacted runtime logs, restricted audit events, aggregate error/performance metrics and admin status consistent with source 09.
2. Record actual host log retention (which may be shorter than the proposed 30 days), and ensure claims about forensic history reflect reality.
3. Document operator runbooks for OAuth/DNS outages, publish ambiguity, cross-tenant exposure, unsafe media, AI privacy and free-tier exhaustion.
4. Document operator runbooks for OAuth/DNS outages, ambiguous publication, cross-tenant exposure, unsafe media, AI privacy and quota exhaustion; include safe project decommissioning with account export, access revocation, provider data cleanup and DNS removal when the service is retired.

**Security, privacy and adverse-case handling.** Do not publish raw chat transcripts, contact messages, tokens or full request bodies to telemetry providers. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The operator can classify a major incident, contain affected feature and find redacted correlation evidence where available. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-004`, `SEC-010`, `ADM-003`, `OPS-006`. Canonical verification: `T-OPS-04`, `T-SEC-10`, `T-ADM-03`, `T-OPS-06`.

**Consult before implementation:** [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 19.10 - Verify all production deployment gates with real-world evidence

**Objective and implementation boundary.** Decide objectively whether the runtime is eligible and safe for public launch rather than treating deployment success as final approval.

**Prerequisites.** 19.1 19.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Execute source 10's DEP-01 through DEP-18 (and the wider applicable DEP-I safeguards), capturing no-spend, privacy, DNS/TLS and session evidence.
2. Test deployed host routing, provider quotas, account isolation, protected CI, cached revocation, secured uploads and rollback using synthetic/read-only records.
3. Record PASS, FAIL, BLOCKED or NOT RUN with proof links and prohibit launch when any mandatory gate is unresolved.
4. Confirm no independent backup or uptime SLA is promised in user-facing disclosures.

**Security, privacy and adverse-case handling.** No developer should mark a conditional service security claim verified without evidence from the actual configured account. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Production release checklist clearly identifies all passed gates and any unfulfilled blocking prerequisite. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-002`, `OPS-003`, `OPS-004`, `OPS-005`, `OPS-006`, `OPS-007`. Canonical verification: `T-OPS-01`, `T-OPS-02`, `T-OPS-03`, `T-OPS-04`, `T-OPS-05`, `T-OPS-06`, `T-OPS-07`.

**Consult before implementation:** [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

# Issue 20 - Complete cross-cutting assurance, threat regression and production launch handoff

**Purpose and architectural rationale.** Finish the implementation with rigorous verification of the _whole system_, not just success of individual modules. This issue consolidates the requirement-to-test mapping, threats, real user journeys, WebGL/accessibility/performance evidence, security review, release governance and solo-maintainer runbooks. It must not weaken unresolved product requirements to make the launch checklist green.

**Entry criteria and dependency boundary.** Functional components and conditional provider configuration are complete or explicitly blocked; there is no fixed launch date. **Dependencies:** Issues 1–19. Sub-issues must be implemented in the listed order except where their explicit prerequisites permit parallel, independent work; do not bypass a prerequisite required for access-control or publication safety.

**Main-issue completion gate.** All 97 canonical requirements, 45 threats and mandatory source 11/source 10 gates have verifiable coverage, and the operator makes an evidence-backed launch or no-go decision. All related source-11 canonical tests, cross-tenant negative checks and applicable live-host/provider gates must have a recorded outcome. A `BLOCKED` external proof is not a pass.

**Primary source documents:** [02 — Requirements And Scope](02-requirements-and-scope.md), [03 — Ui Ux](03-ui-ux.md), [04 — C4 Diagrams](04-c4-diagrams.md), [07 — Security Design](07-security-design.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 20.1 - Build exact requirement, threat, test and ADR coverage crosswalk

**Objective and implementation boundary.** Confirm no baseline requirement or threat disappeared during issue decomposition or was silently relaxed.

**Prerequisites.** 19.10 18.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. List all 97 source 02 requirement IDs, their implemented sub-issues, canonical T-\* checks and current PASS/FAIL/BLOCKED status.
2. List TH-01 through TH-45 from source 07 and map each to protective code boundary, attack fixture and relevant source 11 TV/ST cases.
3. Cross-reference ADR-001 through ADR-036 and distinguish conditional, pending, baseline and accepted-risk decisions from deployment facts.
4. Automatically validate required IDs and documentation links to prevent a green release with missing coverage.

**Security, privacy and adverse-case handling.** A test not run is never equivalent to implemented security, and an unreviewed high-severity flaw is not accepted risk. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Each ID has an owner, code/evidence location and explicit outcome; missing mappings block release readiness. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `SEC-001`, `SEC-010`, `OPS-007`. Canonical verification: `T-SEC-01`, `T-SEC-10`, `T-OPS-07`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

**Canonical requirement coverage map.** The _primary issue owner_ is the earliest explicitly mapped sub-issue; other issues may also implement or test that requirement. `T-*` IDs are copied from the normative requirements, not newly invented.

| Requirement | Priority | Primary implementation issue | Other implementing issues                                                                                                                                                                                                                              | Canonical acceptance ID |
| ----------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `ACC-001`   | P1       | Issue 18.8                   | Issue 18.10, Issue 20.5                                                                                                                                                                                                                                | `T-ACC-01`              |
| `ACC-002`   | P0       | Issue 4.7                    | Issue 11.9, Issue 12.8, Issue 17.4, Issue 18.9, Issue 18.10, Issue 20.3, Issue 20.5                                                                                                                                                                    | `T-ACC-02`              |
| `ADM-001`   | P0       | Issue 3.5                    | Issue 5.6, Issue 5.9, Issue 18.3, Issue 18.4, Issue 18.10, Issue 19.7                                                                                                                                                                                  | `T-ADM-01`              |
| `ADM-002`   | P1       | Issue 18.2                   | Issue 18.5, Issue 18.10                                                                                                                                                                                                                                | `T-ADM-02`              |
| `ADM-003`   | P1       | Issue 2.7                    | Issue 18.1, Issue 18.6, Issue 18.10, Issue 19.9                                                                                                                                                                                                        | `T-ADM-03`              |
| `AI-001`    | P0       | Issue 16.1                   | Issue 16.9, Issue 16.10, Issue 20.5                                                                                                                                                                                                                    | `T-AI-01`               |
| `AI-002`    | P0       | Issue 6.6                    | Issue 16.2, Issue 16.3, Issue 16.10, Issue 18.7, Issue 20.7                                                                                                                                                                                            | `T-AI-02`               |
| `AI-003`    | P0       | Issue 6.6                    | Issue 13.9, Issue 16.3, Issue 16.6, Issue 16.10                                                                                                                                                                                                        | `T-AI-03`               |
| `AI-004`    | P0       | Issue 3.5                    | Issue 13.9, Issue 16.3, Issue 16.4, Issue 16.10, Issue 18.3, Issue 18.4, Issue 19.7, Issue 20.7                                                                                                                                                        | `T-AI-04`               |
| `AI-005`    | P0       | Issue 16.7                   | Issue 16.10                                                                                                                                                                                                                                            | `T-AI-05`               |
| `AI-006`    | P1       | Issue 16.8                   | Issue 16.9, Issue 16.10                                                                                                                                                                                                                                | `T-AI-06`               |
| `AI-007`    | P0       | Issue 16.5                   | Issue 16.8, Issue 16.10, Issue 19.5, Issue 20.7                                                                                                                                                                                                        | `T-AI-07`               |
| `AI-008`    | P0       | Issue 2.6                    | Issue 3.9, Issue 16.6, Issue 16.8, Issue 16.9, Issue 16.10, Issue 17.9                                                                                                                                                                                 | `T-AI-08`               |
| `AI-009`    | P1       | Issue 16.1                   | Issue 16.9, Issue 16.10                                                                                                                                                                                                                                | `T-AI-09`               |
| `AI-010`    | P1       | Issue 16.2                   | Issue 16.10                                                                                                                                                                                                                                            | `T-AI-10`               |
| `ANA-001`   | P1       | Issue 3.9                    | Issue 17.5, Issue 17.6, Issue 17.7, Issue 17.10                                                                                                                                                                                                        | `T-ANA-01`              |
| `CNT-001`   | P0       | Issue 1.9                    | Issue 5.2, Issue 6.1, Issue 6.10, Issue 9.3, Issue 9.10, Issue 10.4, Issue 13.1, Issue 14.2                                                                                                                                                            | `T-CNT-01`              |
| `CNT-002`   | P0       | Issue 1.5                    | Issue 3.3, Issue 6.2, Issue 6.3, Issue 6.7, Issue 6.9, Issue 6.10, Issue 7.8, Issue 10.5                                                                                                                                                               | `T-CNT-02`              |
| `CNT-003`   | P0       | Issue 6.4                    | Issue 6.5, Issue 6.8, Issue 6.10, Issue 7.6, Issue 10.4, Issue 10.7, Issue 14.4                                                                                                                                                                        | `T-CNT-03`              |
| `CNT-004`   | P1       | Issue 6.1                    | Issue 6.3, Issue 6.10, Issue 7.1, Issue 7.5, Issue 7.9, Issue 14.2, Issue 20.5                                                                                                                                                                         | `T-CNT-04`              |
| `CNT-005`   | P0       | Issue 6.4                    | Issue 6.5, Issue 6.10, Issue 7.1, Issue 7.6, Issue 10.7, Issue 11.8, Issue 13.1                                                                                                                                                                        | `T-CNT-05`              |
| `CNT-006`   | P1       | Issue 1.9                    | Issue 6.6, Issue 6.10, Issue 7.6, Issue 8.8, Issue 13.2, Issue 14.1, Issue 14.4                                                                                                                                                                        | `T-CNT-06`              |
| `CNT-007`   | P1       | Issue 1.5                    | Issue 6.2, Issue 6.3, Issue 6.10                                                                                                                                                                                                                       | `T-CNT-07`              |
| `CNT-008`   | P1       | Issue 6.9                    | Issue 6.10                                                                                                                                                                                                                                             | `T-CNT-08`              |
| `CNT-009`   | P1       | Issue 5.7                    | Issue 6.4, Issue 6.8, Issue 6.10, Issue 14.3, Issue 15.7                                                                                                                                                                                               | `T-CNT-09`              |
| `CNT-010`   | P1       | Issue 6.10                   | Issue 15.1, Issue 15.3, Issue 15.4, Issue 15.5, Issue 15.6, Issue 15.8, Issue 15.10                                                                                                                                                                    | `T-CNT-10`              |
| `CNT-011`   | P1       | Issue 6.10                   | Issue 14.7, Issue 14.10                                                                                                                                                                                                                                | `T-CNT-11`              |
| `CON-001`   | P1       | Issue 3.9                    | Issue 17.1, Issue 17.2, Issue 17.3, Issue 17.4, Issue 17.9, Issue 17.10                                                                                                                                                                                | `T-CON-01`              |
| `EDT-001`   | P0       | Issue 9.5                    | Issue 10.1, Issue 10.5, Issue 10.10, Issue 20.4                                                                                                                                                                                                        | `T-EDT-01`              |
| `EDT-002`   | P0       | Issue 7.1                    | Issue 7.2, Issue 7.8, Issue 7.10, Issue 8.1, Issue 10.1, Issue 10.3, Issue 10.10, Issue 20.4                                                                                                                                                           | `T-EDT-02`              |
| `EDT-003`   | P0       | Issue 1.9                    | Issue 7.2, Issue 7.3, Issue 7.9, Issue 7.10, Issue 9.5, Issue 10.1, Issue 10.6, Issue 10.10, Issue 11.7, Issue 20.4                                                                                                                                    | `T-EDT-03`              |
| `EDT-004`   | P0       | Issue 7.1                    | Issue 7.2, Issue 7.3, Issue 7.4, Issue 7.9, Issue 7.10, Issue 10.2, Issue 10.6, Issue 10.8, Issue 10.10, Issue 13.1, Issue 20.4                                                                                                                        | `T-EDT-04`              |
| `EDT-005`   | P1       | Issue 7.10                   | Issue 8.4, Issue 8.6, Issue 10.2, Issue 10.3, Issue 10.4, Issue 10.8, Issue 10.9, Issue 10.10, Issue 20.4                                                                                                                                              | `T-EDT-05`              |
| `EDT-006`   | P1       | Issue 1.5                    | Issue 7.6, Issue 7.10, Issue 10.7, Issue 10.10, Issue 20.4                                                                                                                                                                                             | `T-EDT-06`              |
| `EDT-007`   | P1       | Issue 7.5                    | Issue 7.7, Issue 7.10, Issue 8.3, Issue 10.10, Issue 14.2, Issue 20.4                                                                                                                                                                                  | `T-EDT-07`              |
| `EDT-008`   | P0       | Issue 3.6                    | Issue 9.4, Issue 9.9, Issue 11.1, Issue 11.2, Issue 11.3, Issue 11.5, Issue 11.9, Issue 11.10, Issue 20.5                                                                                                                                              | `T-EDT-08`              |
| `EDT-009`   | P0       | Issue 1.6                    | Issue 3.6, Issue 11.1, Issue 11.2, Issue 11.3, Issue 11.4, Issue 11.5, Issue 11.9, Issue 11.10, Issue 13.7, Issue 20.3                                                                                                                                 | `T-EDT-09`              |
| `EDT-010`   | P0       | Issue 1.8                    | Issue 10.9, Issue 11.6, Issue 11.7, Issue 11.8, Issue 11.10                                                                                                                                                                                            | `T-EDT-10`              |
| `IAM-001`   | P0       | Issue 4.1                    | Issue 4.2, Issue 4.10, Issue 9.2, Issue 9.10, Issue 19.4, Issue 20.2, Issue 20.5                                                                                                                                                                       | `T-IAM-01`              |
| `IAM-002`   | P0       | Issue 3.2                    | Issue 4.1, Issue 4.2, Issue 4.5, Issue 4.10, Issue 20.2                                                                                                                                                                                                | `T-IAM-02`              |
| `IAM-003`   | P0       | Issue 4.5                    | Issue 4.10, Issue 9.2, Issue 9.6, Issue 20.2                                                                                                                                                                                                           | `T-IAM-03`              |
| `IAM-004`   | P0       | Issue 4.6                    | Issue 4.10, Issue 9.6                                                                                                                                                                                                                                  | `T-IAM-04`              |
| `IAM-005`   | P0       | Issue 2.5                    | Issue 4.3, Issue 4.4, Issue 4.10, Issue 5.8, Issue 9.6, Issue 19.3, Issue 19.4, Issue 20.2                                                                                                                                                             | `T-IAM-05`              |
| `IAM-006`   | P0       | Issue 4.9                    | Issue 4.10, Issue 18.1                                                                                                                                                                                                                                 | `T-IAM-06`              |
| `IAM-007`   | P1       | Issue 4.8                    | Issue 4.10, Issue 9.3, Issue 9.4, Issue 9.9, Issue 9.10                                                                                                                                                                                                | `T-IAM-07`              |
| `IAM-008`   | P0       | Issue 4.6                    | Issue 4.7, Issue 4.10, Issue 9.6                                                                                                                                                                                                                       | `T-IAM-08`              |
| `IAM-009`   | P1       | Issue 4.2                    | Issue 4.10                                                                                                                                                                                                                                             | `T-IAM-09`              |
| `MED-001`   | P0       | Issue 3.8                    | Issue 12.2, Issue 12.3, Issue 12.4, Issue 12.5, Issue 12.9, Issue 12.10, Issue 13.1, Issue 14.3, Issue 20.7                                                                                                                                            | `T-MED-01`              |
| `MED-002`   | P0       | Issue 12.3                   | Issue 12.5, Issue 12.6, Issue 12.10                                                                                                                                                                                                                    | `T-MED-02`              |
| `MED-003`   | P0       | Issue 1.5                    | Issue 3.8, Issue 12.1, Issue 12.2, Issue 12.5, Issue 12.10, Issue 19.5, Issue 20.7                                                                                                                                                                     | `T-MED-03`              |
| `MED-004`   | P0       | Issue 3.8                    | Issue 12.6, Issue 12.7, Issue 12.8, Issue 12.9, Issue 12.10, Issue 13.6, Issue 20.3                                                                                                                                                                    | `T-MED-04`              |
| `MED-005`   | P1       | Issue 12.4                   | Issue 12.6, Issue 12.10                                                                                                                                                                                                                                | `T-MED-05`              |
| `OPS-001`   | P0       | Issue 1.1                    | Issue 1.10, Issue 2.1, Issue 3.10, Issue 9.8, Issue 12.1, Issue 17.2, Issue 19.1, Issue 19.5, Issue 19.10, Issue 20.8, Issue 20.10                                                                                                                     | `T-OPS-01`              |
| `OPS-002`   | P0       | Issue 1.1                    | Issue 1.3, Issue 1.7, Issue 1.8, Issue 1.10, Issue 19.1, Issue 19.8, Issue 19.10, Issue 20.10                                                                                                                                                          | `T-OPS-02`              |
| `OPS-003`   | P0       | Issue 1.2                    | Issue 2.1, Issue 2.2, Issue 2.3, Issue 2.8, Issue 2.10, Issue 19.2, Issue 19.6, Issue 19.10, Issue 20.10                                                                                                                                               | `T-OPS-03`              |
| `OPS-004`   | P1       | Issue 1.6                    | Issue 2.6, Issue 2.7, Issue 3.9, Issue 18.6, Issue 19.9, Issue 19.10, Issue 20.9, Issue 20.10                                                                                                                                                          | `T-OPS-04`              |
| `OPS-005`   | P0       | Issue 3.10                   | Issue 8.9, Issue 9.8, Issue 11.3, Issue 12.1, Issue 13.5, Issue 15.5, Issue 15.7, Issue 15.10, Issue 16.5, Issue 19.1, Issue 19.5, Issue 19.10, Issue 20.8, Issue 20.10                                                                                | `T-OPS-05`              |
| `OPS-006`   | P0       | Issue 9.8                    | Issue 18.7, Issue 19.9, Issue 19.10, Issue 20.9, Issue 20.10                                                                                                                                                                                           | `T-OPS-06`              |
| `OPS-007`   | P0       | Issue 1.1                    | Issue 1.10, Issue 2.10, Issue 18.7, Issue 19.1, Issue 19.10, Issue 20.1, Issue 20.8, Issue 20.10                                                                                                                                                       | `T-OPS-07`              |
| `PRF-001`   | P1       | Issue 2.3                    | Issue 8.1, Issue 8.3, Issue 8.10, Issue 9.1, Issue 14.9, Issue 17.8, Issue 19.6, Issue 20.6                                                                                                                                                            | `T-PRF-01`              |
| `PRF-002`   | P1       | Issue 8.10                   | Issue 14.9, Issue 20.6                                                                                                                                                                                                                                 | `T-PRF-02`              |
| `PRF-003`   | P1       | Issue 7.3                    | Issue 8.2, Issue 8.4, Issue 8.5, Issue 8.6, Issue 8.7, Issue 8.8, Issue 8.9, Issue 8.10, Issue 10.6, Issue 10.9, Issue 11.7, Issue 14.1, Issue 14.9, Issue 20.6                                                                                        | `T-PRF-03`              |
| `PUB-001`   | P0       | Issue 1.5                    | Issue 3.3, Issue 3.7, Issue 7.9, Issue 11.4, Issue 11.8, Issue 11.10, Issue 13.1, Issue 13.2, Issue 13.8, Issue 13.10                                                                                                                                  | `T-PUB-01`              |
| `PUB-002`   | P0       | Issue 3.6                    | Issue 3.7, Issue 3.10, Issue 6.9, Issue 7.8, Issue 13.2, Issue 13.4, Issue 13.9, Issue 13.10, Issue 14.1, Issue 14.5, Issue 14.10, Issue 15.6, Issue 15.8, Issue 19.8, Issue 20.3                                                                      | `T-PUB-02`              |
| `PUB-003`   | P0       | Issue 3.7                    | Issue 3.10, Issue 13.3, Issue 13.4, Issue 13.10, Issue 20.3                                                                                                                                                                                            | `T-PUB-03`              |
| `PUB-004`   | P1       | Issue 9.4                    | Issue 13.3, Issue 13.5, Issue 13.8, Issue 13.10, Issue 19.7                                                                                                                                                                                            | `T-PUB-04`              |
| `PUB-005`   | P0       | Issue 13.7                   | Issue 13.8, Issue 13.10, Issue 20.3, Issue 20.5                                                                                                                                                                                                        | `T-PUB-05`              |
| `PUB-006`   | P1       | Issue 12.7                   | Issue 13.6, Issue 13.7, Issue 13.10                                                                                                                                                                                                                    | `T-PUB-06`              |
| `PUB-007`   | P0       | Issue 3.5                    | Issue 5.5, Issue 5.6, Issue 9.7, Issue 12.9, Issue 13.10, Issue 14.8                                                                                                                                                                                   | `T-PUB-07`              |
| `PUB-008`   | P1       | Issue 5.5                    | Issue 9.7, Issue 13.10, Issue 14.8, Issue 18.9                                                                                                                                                                                                         | `T-PUB-08`              |
| `SEC-001`   | P0       | Issue 1.1                    | Issue 1.7, Issue 2.3, Issue 20.1, Issue 20.10                                                                                                                                                                                                          | `T-SEC-01`              |
| `SEC-002`   | P0       | Issue 1.3                    | Issue 3.1, Issue 3.4, Issue 4.4, Issue 4.8, Issue 4.9, Issue 5.6, Issue 6.5, Issue 9.5, Issue 11.1, Issue 11.6, Issue 13.3, Issue 17.3, Issue 18.1, Issue 20.2                                                                                         | `T-SEC-02`              |
| `SEC-003`   | P0       | Issue 2.4                    | Issue 2.9, Issue 4.1, Issue 4.3, Issue 4.4, Issue 4.7, Issue 5.3, Issue 5.8, Issue 8.3, Issue 9.2, Issue 19.4, Issue 20.2                                                                                                                              | `T-SEC-03`              |
| `SEC-004`   | P0       | Issue 1.3                    | Issue 1.4, Issue 1.6, Issue 2.4, Issue 3.3, Issue 3.4, Issue 4.8, Issue 5.1, Issue 6.2, Issue 6.3, Issue 6.7, Issue 7.7, Issue 10.5, Issue 11.1, Issue 15.2, Issue 15.3, Issue 17.1, Issue 20.2                                                        | `T-SEC-04`              |
| `SEC-005`   | P0       | Issue 15.1                   | Issue 15.2, Issue 15.3, Issue 15.4, Issue 15.7, Issue 15.9, Issue 15.10, Issue 20.7                                                                                                                                                                    | `T-SEC-05`              |
| `SEC-006`   | P0       | Issue 1.2                    | Issue 2.1, Issue 2.5, Issue 2.8, Issue 19.2, Issue 19.5                                                                                                                                                                                                | `T-SEC-06`              |
| `SEC-007`   | P0       | Issue 2.9                    | Issue 6.7, Issue 7.4, Issue 7.5, Issue 7.7, Issue 8.1, Issue 8.10, Issue 10.8, Issue 12.3, Issue 12.4, Issue 15.9, Issue 20.2                                                                                                                          | `T-SEC-07`              |
| `SEC-008`   | P0       | Issue 1.9                    | Issue 6.6, Issue 8.8, Issue 14.4, Issue 14.7, Issue 16.1, Issue 16.2, Issue 16.4, Issue 16.6, Issue 16.7, Issue 20.7                                                                                                                                   | `T-SEC-08`              |
| `SEC-009`   | P0       | Issue 16.5                   | Issue 17.1, Issue 17.2, Issue 17.5, Issue 17.10, Issue 18.2                                                                                                                                                                                            | `T-SEC-09`              |
| `SEC-010`   | P0       | Issue 2.6                    | Issue 2.7, Issue 4.5, Issue 4.6, Issue 4.9, Issue 18.1, Issue 18.3, Issue 18.5, Issue 18.10, Issue 19.9, Issue 20.1, Issue 20.9                                                                                                                        | `T-SEC-10`              |
| `SEC-011`   | P0       | Issue 1.2                    | Issue 2.1, Issue 2.2, Issue 2.5, Issue 2.8, Issue 2.10, Issue 8.2, Issue 19.2, Issue 19.6                                                                                                                                                              | `T-SEC-11`              |
| `SEC-012`   | P1       | Issue 1.10                   | Issue 9.2, Issue 9.8, Issue 9.9, Issue 9.10, Issue 11.5, Issue 12.8, Issue 17.4, Issue 17.5, Issue 17.7, Issue 18.5, Issue 18.7, Issue 18.8, Issue 18.9, Issue 18.10, Issue 20.9                                                                       | `T-SEC-12`              |
| `SEO-001`   | P1       | Issue 1.8                    | Issue 5.7, Issue 6.8, Issue 7.4, Issue 7.10, Issue 8.5, Issue 8.7, Issue 9.1, Issue 13.9, Issue 14.1, Issue 14.3, Issue 14.5, Issue 14.6, Issue 14.10, Issue 15.8, Issue 16.7, Issue 20.6                                                              | `T-SEO-01`              |
| `SEO-002`   | P0       | Issue 5.5                    | Issue 5.9, Issue 6.6, Issue 9.1, Issue 9.7, Issue 13.2, Issue 14.5, Issue 14.6, Issue 14.7, Issue 14.8, Issue 14.10, Issue 17.8, Issue 17.10, Issue 18.4, Issue 19.7                                                                                   | `T-SEO-02`              |
| `TEN-001`   | P0       | Issue 1.4                    | Issue 3.1, Issue 5.2, Issue 5.10                                                                                                                                                                                                                       | `T-TEN-01`              |
| `TEN-002`   | P0       | Issue 3.1                    | Issue 3.4, Issue 4.3, Issue 5.10, Issue 9.10, Issue 11.6, Issue 12.2, Issue 17.3, Issue 17.6, Issue 18.8, Issue 20.2                                                                                                                                   | `T-TEN-02`              |
| `TEN-003`   | P0       | Issue 3.2                    | Issue 5.2, Issue 5.10, Issue 9.3, Issue 9.10, Issue 20.3                                                                                                                                                                                               | `T-TEN-03`              |
| `TEN-004`   | P0       | Issue 1.4                    | Issue 3.2, Issue 5.1, Issue 5.2, Issue 5.4, Issue 5.10, Issue 9.3                                                                                                                                                                                      | `T-TEN-04`              |
| `TEN-005`   | P1       | Issue 3.2                    | Issue 5.4, Issue 5.10, Issue 9.7                                                                                                                                                                                                                       | `T-TEN-05`              |
| `TEN-006`   | P0       | Issue 5.3                    | Issue 5.4, Issue 5.7, Issue 5.10, Issue 19.3, Issue 20.8                                                                                                                                                                                               | `T-TEN-06`              |
| `TEN-007`   | P0       | Issue 1.8                    | Issue 2.4, Issue 5.1, Issue 5.3, Issue 5.8, Issue 5.10, Issue 19.3, Issue 19.4                                                                                                                                                                         | `T-TEN-07`              |
| `TEN-008`   | P1       | Issue 5.3                    | Issue 5.7, Issue 5.10, Issue 19.3                                                                                                                                                                                                                      | `T-TEN-08`              |
| `TEN-009`   | P0       | Issue 2.9                    | Issue 3.5, Issue 5.5, Issue 5.6, Issue 5.9, Issue 5.10, Issue 8.8, Issue 11.9, Issue 12.8, Issue 12.9, Issue 13.4, Issue 14.6, Issue 14.8, Issue 14.10, Issue 16.4, Issue 17.7, Issue 17.8, Issue 18.3, Issue 18.9, Issue 19.7, Issue 19.8, Issue 20.8 | `T-TEN-09`              |
| `UX-001`    | P0       | Issue 7.4                    | —                                                                                                                                                                                                                                                      | `T-UX-01`               |
| `UX-002`    | P0       | Issue 8.7                    | —                                                                                                                                                                                                                                                      | `T-UX-02`               |
| `UX-003`    | P1       | Issue 8.1                    | —                                                                                                                                                                                                                                                      | `T-UX-03`               |
| `UX-004`    | P1       | Issue 8.9                    | —                                                                                                                                                                                                                                                      | `T-UX-04`               |

**Threat coverage map.** Threat definitions and severities remain authoritative in [07 §4](07-security-design.md); the owner below must implement and prove the relevant control, not merely document it.

| Threat  | Primary implementation/verification owner | Source-described abuse case                                                             |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `TH-01` | Issue 4.5                                 | Google/GitHub email collision silently links a foreign identity                         |
| `TH-02` | Issue 4.1                                 | OAuth state, code, callback, PKCE or redirect manipulation                              |
| `TH-03` | Issue 4.3                                 | Stolen/fixed session, host-cookie injection from sibling subdomain                      |
| `TH-04` | Issue 4.4                                 | Cross-subdomain form/POST to apex using browser cookies                                 |
| `TH-05` | Issue 3.4                                 | Cross-tenant ID substitution in draft, media, release, export                           |
| `TH-06` | Issue 4.8                                 | Client alters platformRoles, owner, active release or moderation flag                   |
| `TH-07` | Issue 5.3                                 | Host/X-Forwarded-Host spoof routes to wrong tenant                                      |
| `TH-08` | Issue 6.3                                 | Mongo selector/operator or prototype pollution in imported JSON                         |
| `TH-09` | Issue 6.7                                 | Stored XSS in rich text, diagram, embed, metadata or custom block                       |
| `TH-10` | Issue 6.7                                 | CSS/URL injection, javascript:, hidden remote exfiltration                              |
| `TH-11` | Issue 15.9                                | Arbitrary iframe provider or SVG active content                                         |
| `TH-12` | Issue 15.2                                | SSRF to localhost, metadata IP, redirect or DNS rebinding                               |
| `TH-13` | Issue 12.3                                | Polyglot image/PDF, parser exploit, decompression bomb                                  |
| `TH-14` | Issue 12.3                                | EXIF/GPS in uploads or private staging unintentionally public                           |
| `TH-15` | Issue 12.8                                | Deleted/private asset remains reachable by old capability or cache                      |
| `TH-16` | Issue 13.4                                | Mixed old/new draft components served after partial publication                         |
| `TH-17` | Issue 5.6                                 | Cache serves suspended/moderated portfolio after revocation                             |
| `TH-18` | Issue 14.10                               | Draft/private content enters sitemap, OG, preview or search                             |
| `TH-19` | Issue 16.6                                | Prompt injection from visitor, FAQ, PDF or RSS                                          |
| `TH-20` | Issue 16.4                                | AI context leaks newly private/revoked reference detail                                 |
| `TH-21` | Issue 16.7                                | AI hallucinates citations or attacker URLs to phishing site                             |
| `TH-22` | Issue 16.5                                | AI budget/token abuse bypasses per-visitor or global counters                           |
| `TH-23` | Issue 17.2                                | Form, reporting or signup flooded by bots                                               |
| `TH-24` | Issue 13.3                                | Duplicate publication/rollback in race or retry                                         |
| `TH-25` | Issue 12.7                                | Media from another portfolio referenced or deleted                                      |
| `TH-26` | Issue 18.8                                | Export package includes another owner's private data                                    |
| `TH-27` | Issue 2.5                                 | Secrets in public repo, CI output, client bundle or logs                                |
| `TH-28` | Issue 2.8                                 | Malicious package/PR gains code execution or deploy credentials                         |
| `TH-29` | Issue 5.6                                 | Policy provider unavailable, app incorrectly assumes previous allow                     |
| `TH-30` | Issue 9.8                                 | Loss of sole datastore and three revisions, no independent backup                       |
| `TH-31` | Issue 2.6                                 | Chat PII, email or tokens leaked into analytics, errors and logs                        |
| `TH-32` | Issue 18.2                                | Attacker hosts impersonation or phishing portfolio                                      |
| `TH-33` | Issue 19.1                                | Host provider uses submitted project data for AI training contrary to user expectations |
| `TH-34` | Issue 11.5                                | Editor recovery in local storage exposed across accounts                                |
| `TH-35` | Issue 11.6                                | postMessage, iframe preview or shared-origin confusion                                  |
| `TH-36` | Issue 18.4                                | Generated OG/search index or CDN asset survives moderation                              |
| `TH-37` | Issue 18.9                                | Delayed publish, upload or AI job resurrects deleting account                           |
| `TH-38` | Issue 17.2                                | Forged/replayed bot challenge treated as auth                                           |
| `TH-39` | Issue 17.5                                | Anonymous metrics spam falsifies public owner statistics                                |
| `TH-40` | Issue 8.9                                 | Expensive user-defined visual scene or shader freezes client                            |
| `TH-41` | Issue 4.4                                 | CORS misconfiguration permits tenant subdomain to read apex API                         |
| `TH-42` | Issue 11.6                                | Preview, unlisted or draft response cached and shared cross-tenant                      |
| `TH-43` | Issue 12.2                                | Global media quota bypass via parallel upload reservations                              |
| `TH-44` | Issue 19.2                                | Broad DB IP access or overprivileged DB role enables exfiltration after key leak        |
| `TH-45` | Issue 19.4                                | OAuth callback or absolute URLs reflect untrusted Host into redirects                   |

**ADR coverage map.** Status and consequences remain owned by [12](12-architecture-decision-record.md); a conditional ADR is not declared accepted just because its owner issue is scheduled.

| ADR       | Implementation or decision-evidence owner |
| --------- | ----------------------------------------- |
| `ADR-001` | Issue 1.3                                 |
| `ADR-002` | Issue 14.1                                |
| `ADR-003` | Issue 3.1                                 |
| `ADR-004` | Issue 4.1                                 |
| `ADR-005` | Issue 3.6                                 |
| `ADR-006` | Issue 13.4                                |
| `ADR-007` | Issue 7.2                                 |
| `ADR-008` | Issue 1.5                                 |
| `ADR-009` | Issue 6.3                                 |
| `ADR-010` | Issue 4.3                                 |
| `ADR-011` | Issue 5.3                                 |
| `ADR-012` | Issue 5.6                                 |
| `ADR-013` | Issue 19.7                                |
| `ADR-014` | Issue 16.3                                |
| `ADR-015` | Issue 16.6                                |
| `ADR-016` | Issue 16.5                                |
| `ADR-017` | Issue 12.1                                |
| `ADR-018` | Issue 12.3                                |
| `ADR-019` | Issue 15.2                                |
| `ADR-020` | Issue 5.2                                 |
| `ADR-021` | Issue 9.8                                 |
| `ADR-022` | Issue 19.1                                |
| `ADR-023` | Issue 19.1                                |
| `ADR-024` | Issue 8.7                                 |
| `ADR-025` | Issue 10.3                                |
| `ADR-026` | Issue 2.9                                 |
| `ADR-027` | Issue 17.5                                |
| `ADR-028` | Issue 17.1                                |
| `ADR-029` | Issue 2.2                                 |
| `ADR-030` | Issue 1.3                                 |
| `ADR-031` | Issue 18.7                                |
| `ADR-032` | Issue 1.6                                 |
| `ADR-033` | Issue 15.1                                |
| `ADR-034` | Issue 15.5                                |
| `ADR-035` | Issue 18.7                                |
| `ADR-036` | Issue 5.5                                 |

## Issue 20.2 - Execute comprehensive account, tenancy and browser security assessment

**Objective and implementation boundary.** Probe the highest-risk cross-boundary access paths using actual server requests and browser contexts.

**Prerequisites.** 4.10 18.10 19.4. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run Google/GitHub linking, session fixation/revocation, CSRF from sibling subdomains and forged Host/Origin tests.
2. Tamper with actor, portfolio, content, release, media and export IDs plus forbidden server-owned fields across every API and Server Action.
3. Check stored XSS, CSP, embed, safe HTML, nested JSON import and credential leakage in public/client bundles.
4. Inspect durable side effects and outbound requests as well as status codes and screenshots.

**Security, privacy and adverse-case handling.** A single confirmed exploitable account takeover or foreign-tenant disclosure is a P0 launch blocker. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** No privileged action or private record can be accessed without current server-side authorization. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `IAM-002`, `IAM-003`, `IAM-005`, `TEN-002`, `SEC-002`, `SEC-003`, `SEC-004`, `SEC-007`. Canonical verification: `T-IAM-01`, `T-IAM-02`, `T-IAM-03`, `T-IAM-05`, `T-TEN-02`, `T-SEC-02`, `T-SEC-03`, `T-SEC-04`, `T-SEC-07`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.3 - Execute database, API and publication fault-injection suite

**Objective and implementation boundary.** Verify concurrency and idempotence properties using real local database semantics rather than exclusively mocked services.

**Prerequisites.** 13.10 18.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Exercise duplicate slug/account claims, autosave compare-and-swap, publish active pointer races, duplicate operation retries and unknown HTTP outcomes.
2. Crash before/after release insert/activation, suppress a portfolio during delayed work and delete an account while upload/AI jobs remain pending.
3. Inspect current policy, release count, operation ledger, retained media and sanitized audit events at every failure phase.
4. Record any unresolved HTTP 409/412 contract mismatch as SPEC-CONFLICT requiring closure before client release.

**Security, privacy and adverse-case handling.** A passed response test cannot hide a duplicate durable publication or resurrected deleted account. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The data and API lifecycle agrees with source 05/06/08 under racing requests and bounded retries. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `TEN-003`, `EDT-009`, `PUB-002`, `PUB-003`, `PUB-005`, `MED-004`, `ACC-002`. Canonical verification: `T-TEN-03`, `T-EDT-09`, `T-PUB-02`, `T-PUB-03`, `T-PUB-05`, `T-MED-04`, `T-ACC-02`.

**Consult before implementation:** [05 — Data Model](05-data-model.md), [06 — Api Design](06-api-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [09 — Error Handling And Logging](09-error-handling-and-logging.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.4 - Execute comprehensive editor and responsive UX acceptance

**Objective and implementation boundary.** Validate the most differentiating feature with human input paths, not solely visual snapshots.

**Prerequisites.** 10.10 14.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run full canvas workflow with group, move, resize, align, layer, delete, repeat, bind and switch breakpoint actions.
2. Test keyboard-only and touch-only editing, screen-reader reading order, accessible modals/tabs/carousels and return focus.
3. Use long text, 320 CSS px, zoom, screen orientation changes, delayed font load and reduced motion fixtures.
4. Inspect severe layout warnings and confirm invalid inaccessible compositions cannot publish.

**Security, privacy and adverse-case handling.** Editor freedom is not complete if a mobile/keyboard user cannot perform essential operations. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The public result is semantic, responsive and accessible and the editor offers equivalent input routes. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `EDT-001`, `EDT-002`, `EDT-003`, `EDT-004`, `EDT-005`, `EDT-006`, `EDT-007`. Canonical verification: `T-EDT-01`, `T-EDT-02`, `T-EDT-03`, `T-EDT-04`, `T-EDT-05`, `T-EDT-06`, `T-EDT-07`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.5 - Execute critical end-to-end user journeys

**Objective and implementation boundary.** Prove the platform works as an integrated product for real newcomer, owner, visitor and administrator scenarios.

**Prerequisites.** 9.10 13.10 18.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run signup via Google/GitHub, no-portfolio onboarding, create project, edit custom schema, upload media, autosave, preview and publish.
2. Visit both public URL forms, project detail pages, search, contact, optional AI and account settings as anonymous/owner identities.
3. Restore an older release as draft, republish, switch to unlisted, report a dangerous project, suspend it and verify instant public denial.
4. Export data, then delete account and test old URL/AI/media calls while cleanup proceeds.

**Security, privacy and adverse-case handling.** A happy-path marketing demo does not satisfy multi-tenant and privacy requirements. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every required journey has reproducible evidence, expected statuses and a negative cross-tenant counterpart. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `IAM-001`, `CNT-004`, `EDT-008`, `PUB-005`, `AI-001`, `ACC-001`, `ACC-002`. Canonical verification: `T-IAM-01`, `T-CNT-04`, `T-EDT-08`, `T-PUB-05`, `T-AI-01`, `T-ACC-01`, `T-ACC-02`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [06 — Api Design](06-api-design.md), [07 — Security Design](07-security-design.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.6 - Measure performance, browser compatibility and adaptive WebGL

**Objective and implementation boundary.** Verify actual production-like page performance using the documented thresholds and free-tier resource model.

**Prerequisites.** 8.10 14.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Measure Lighthouse target 90+ for applicable public categories and p75 LCP <=2.5s, INP <=200ms, CLS <=0.1 when field data is sufficient.
2. Inspect compressed critical JS target <=200 KiB if source budget units apply, deferred Three.js <=350 KiB, initial 3D assets <=1 MiB and mobile/desktop transfer goals.
3. Test Chrome/Edge/Firefox/Safari, iOS Safari, low-end Android, WebGL-off, hidden tab and system reduced-motion conditions.
4. Attribute regressions to large media/fonts, long tasks or GPU work and adjust scene complexity without removing semantic content.

**Security, privacy and adverse-case handling.** Lab measurements cannot be represented as real-user p75 when insufficient traffic exists. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Representative pages and devices meet approved quality gates or have recorded blocking regression evidence. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `PRF-001`, `PRF-002`, `PRF-003`, `SEO-001`. Canonical verification: `T-PRF-01`, `T-PRF-02`, `T-PRF-03`, `T-SEO-01`.

**Consult before implementation:** [03 — Ui Ux](03-ui-ux.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.7 - Run AI, SSRF, media and privacy-specific adversarial tests

**Objective and implementation boundary.** Target the external trust boundaries most likely to expose sensitive information or generate unexpected cost.

**Prerequisites.** 12.10 15.10 16.10. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Inject malicious FAQ/PDF/project content and visitor prompts; inspect exact Groq outbound context against approval and current release.
2. Probe feed/link-preview URLs for redirects/private IP rebinding; upload malformed images/PDF, near-limit concurrent media and stale cached assets.
3. Verify Redis/Groq outages, global quota exhaustion and streaming cancellation leave portfolio reading functional.
4. Check public HTML, OG, search, AI context, logs and exports for private sentinel leakage.

**Security, privacy and adverse-case handling.** An AI refusal cannot undo an already-sent private prompt and a safe URL parse does not prove SSRF defense. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Threat-specific negative cases demonstrate no unauthorized egress, private disclosure or billed overflow. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `AI-002`, `AI-004`, `AI-007`, `MED-001`, `MED-003`, `SEC-005`, `SEC-008`. Canonical verification: `T-AI-02`, `T-AI-04`, `T-AI-07`, `T-MED-01`, `T-MED-03`, `T-SEC-05`, `T-SEC-08`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [08 — Storage And Sync Strategy](08-storage-and-sync-strategy.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.8 - Run deployed domain, revocation, privacy and zero-cost acceptance

**Objective and implementation boundary.** Verify the exact services and domains where users will interact, independent of local mocks.

**Prerequisites.** 19.10 20.2. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Repeat apex, www, wildcard and old alias routing on real HTTPS with correct canonical paths and host-only cookies.
2. Prewarm public CDN, then disable, unlist, moderate, revoke AI and erase media; probe every direct page, OG, search and API path.
3. Inspect provider account billing states, opt-out/privacy processing and no-card requirement and simulate ordinary quota exhaustion where safe.
4. Document unknown/blocked cases plainly and keep public registration disabled until all launch-critical conditions are proven.

**Security, privacy and adverse-case handling.** A passed CI build is not eligibility proof and a provider free allowance is not a billing hard stop by itself. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Every real-host gate has captured evidence and no unexpected payment, data-processing or stale-access path exists. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-005`, `OPS-007`, `TEN-006`, `TEN-009`. Canonical verification: `T-OPS-01`, `T-OPS-05`, `T-OPS-07`, `T-TEN-06`, `T-TEN-09`.

**Consult before implementation:** [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md).

## Issue 20.9 - Rehearse operational incident response, rollback and accepted risk disclosures

**Objective and implementation boundary.** Make the solo maintainer capable of containment and honest recovery communication without paid infrastructure assumptions.

**Prerequisites.** 19.8 19.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Run tabletop/technical exercises for cross-tenant exposure, compromised token, unsafe user content, lost Publish response, Groq leak and storage outage.
2. Practice disabling AI/uploads/external fetch, suspending an abusive portfolio, revoking sessions and rolling back an app artifact without altering tenant data.
3. Verify restricted audit logs and incident notes remain redacted and accurately state short runtime-log retention and no independent backup guarantee.
4. Ensure owner privacy notice and export instructions explain accepted risks and provider-dependent physical deletion timing.

**Security, privacy and adverse-case handling.** Do not promise a guaranteed RTO/RPO, 24/7 response or automatic recovery from catastrophic database loss. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** Runbooks are executable, operator decisions are recorded and emergency containment does not reopen stale permissions. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-004`, `OPS-006`, `SEC-010`, `SEC-012`. Canonical verification: `T-OPS-04`, `T-OPS-06`, `T-SEC-10`, `T-SEC-12`.

**Consult before implementation:** [09 — Error Handling And Logging](09-error-handling-and-logging.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).

## Issue 20.10 - Produce final launch decision and implementation handoff

**Objective and implementation boundary.** Conclude with a verifiable release decision and maintainable project state rather than declaring completion based on issue count.

**Prerequisites.** 20.1 20.9. Reuse the preceding owned interfaces; do not introduce a new independent service or redefine persistence/security policy for convenience.

**Step-by-step implementation instructions**

1. Compile source 11 gates G-01..G-16, source 10 deployment gates, 97 requirement records, 45 threats and open ADR/provider statuses into a single go/no-go evidence packet.
2. Require closure of all P0 and mandatory P1 first-release behavior, blocking high/critical defects, privacy and DNS/TLS feasibility; record scoped noncritical exceptions only where source rules allow.
3. Document final dependency versions, module boundaries, data migration/rollback procedures, test commands, operator status/runbooks and the supported public release identity.
4. For a failed condition, mark launch NO-GO and state the exact unresolved sub-issue and evidence needed; do not invent a date or deploy anyway.

**Security, privacy and adverse-case handling.** No green checkbox can substitute for actual test output or product-owner approval of a changed requirement. Prove this at the actual server/data trust boundary when applicable, rather than relying only on a disabled button or a frontend guard.

**Definition of done and observable proof.** The result is an evidence-backed production-ready decision when all gates pass, otherwise an actionable blocked release report. Attach the reviewed implementation artifact (code, configuration, design contract or decision record as appropriate), deterministic fixtures and the relevant reproducible positive + denial/failure evidence. If a provider, browser or human accessibility check cannot run locally, record it as `BLOCKED` with the exact later live-evidence gate; never claim it passed.

**Requirements and test traceability.** `OPS-001`, `OPS-002`, `OPS-003`, `OPS-004`, `OPS-005`, `OPS-006`, `OPS-007`, `SEC-001`. Canonical verification: `T-OPS-01`, `T-OPS-02`, `T-OPS-03`, `T-OPS-04`, `T-OPS-05`, `T-OPS-06`, `T-OPS-07`, `T-SEC-01`.

**Consult before implementation:** [02 — Requirements And Scope](02-requirements-and-scope.md), [07 — Security Design](07-security-design.md), [10 — Deployment Strategy](10-deployment-strategy.md), [11 — Testing Strategy](11-testing-strategy.md), [12 — Architecture Decision Record](12-architecture-decision-record.md).
