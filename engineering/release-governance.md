# Issue 2 release governance - **NOT** authorization to deploy

Branch `main` is the intended integration/protected branch. A maintainer must enable required status check `security-and-build`, pull-request reviews, prevention of direct pushes and mandatory verified status via the actual GitHub settings. This ZIP is not a GitHub repository management API result: branch protection was NOT applied or verified. Keep security / release jobs under a reviewed, protected production environment only; no production deployment workflow is included.

## Release evidence checklist

Every release recommendation cites the actual source-11 gates **G-01** through **G-16** and source-10 provider/deployment gates. If any relevant P0 negative test, required browser/manual test, current-provider eligibility, no-charge enforcement, wildcard TLS, license or security revocation proof is FAIL/BLOCKED/NOT RUN/INCONCLUSIVE, the release decision is **NO-GO**.

Do not equate green CI with real OAuth, server-to-provider privacy, data deletion, CDN policy, TLS, accessibility, actual paid-service restrictions or backup guarantees. GitHub Actions jobs may be blocked by free CI minutes; never auto-upgrade to a paid plan. See `engineering/registers/feasibility-gates.json` and source-11 chapter 31.

## Synthetic dry runs

- *Malicious PR workflow*: `tests/security/ci-and-secrets.test.ts` provides an intentionally insecure fork workflow fixture. `auditWorkflow()` rejects privileged trigger, floating action ref and a secret expression, without ever creating a privileged workflow.
- *Secret canary*: `tests/security/ci-and-secrets.test.ts` injects a fake local key and a synthetic private-key header into the in-memory scanner; the repository is never contaminated.
- *Security denial*: `tests/integration/guarded-operation.test.ts` sends an attacker sibling-Origin into server ingress and observes no synthetic state mutation or audit record.
- *Failed audit*: the in-memory transactional port is unavailable; the protected synthetic mutation is not called.
- *Rollback-only review*: application rollback and immutable portfolio release restoration are separate operations (source 10 §8.6). No actual deployment or Mongo release exists to roll back; this scenario is review-only **NOT RUN** until Issues 13 and 19.
- *Fork PR permission enforcement*: workflow is statically verified read-only. An actual fork run and GitHub branch-protection check are **BLOCKED** until repository setup/permissions are available.

No test process should be given real OAuth/Mongo/AI/storage credentials. Evidence must be scrubbed before attaching PR traces, and browser auth state must never be published. Any newly introduced script/test runner must call `assertIsolatedTestEnvironment()` before connecting providers.

## Credential rotation outline

1. Freeze affected administrative operations; document incident/reason code without raw secret.
2. Rotate provider credentials through the provider console using least privilege, reconfigure server runtime (not source or CI), invalidate compromised sessions/token hashes, then deploy a reviewed change.
3. Verify synthetic access denial for old sessions, provider callbacks and current keys using restricted channels. Restricted security audit events use the atomic audit port (persistence implemented in Issue 3), with no token, subject email, contact body or AI prompt.
4. Review incident side effects and revoke if access cannot be proved. Do not announce a completed rotation merely because a new env var is saved.

## Pending practical evidence

- Actual provider sandbox callback and cookie scope: Issues 4 / 19
- Real Mongo atomic audit persistence, duplicate event and TTL/race behavior: Issue 3
- Browser CSP enforcement across Next production scripts/styles (Chromium/Firefox/Safari), axe, Lighthouse and high zoom: Issues 2.3 / 8 / 20, blocked until toolchain install
- True host-generated preview protection, DNS/TLS, HSTS scope and cache revocation: Issue 19
- Source/asset ownership, license selection ADR-031, Vercel commercial use, zero-charge service limits: Issue 19
