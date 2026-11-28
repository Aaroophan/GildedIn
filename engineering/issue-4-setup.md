# Issue 4 — local setup, manual validation and developer handoff

These instructions implement Issue 4.1–4.10 *without* bypassing Issues 1–3. Keep the twelve source documents and `13-implementation-plan.md` as authority. **No production deployment is permitted by this issue.**

## 1. Environment and dependencies

Node.js >= 22.16, npm 10.9.x. Do not run tests with a real database or OAuth credentials. The sandbox in which this ZIP was assembled could not access npm, so `next-auth` and the official MongoDB driver **are not yet in package.json dependencies, package-lock.json, or node_modules**. They are deliberately not represented as locked when they are not. On an internet-connected *trusted local workstation*:

```sh
npm run deps:identity
npm ci --ignore-scripts
npm run check:supply-chain
npm run typecheck
npm run build
npm run verify:issue4:offline
```

The first command is explicitly review-gated: it obtains the reviewed candidate versions of `next-auth` and `mongodb`, updates both the manifest and lockfile, and must be followed by a dependency/advisory/license review. At this stage **do not enable public registration**. If a candidate fails Next.js 16 compatibility, hold the issue as BLOCKED and record a decision before changing versions.

The isolated no-credential checks run independently of Google/GitHub/MongoDB:

```sh
npm test
npm run check:requirements
npm run check:boundaries
npm run check:secrets
npm run check:ci
npm run check:supply-chain
npm run check:licenses
```

`npm run typecheck:persistence`, `npm run typecheck:identity` and `npm run typecheck:domain` require local TypeScript and Node types. Do not use an empty/fake type stub as evidence that a real Auth.js/MongoDB integration compiles.

## 2. Approved local provider configuration

Use `.env.local` **only on a private machine**; never copy credentials into the ZIP, Git, test artifacts, browser code or a PR. The example `.env.example` is placeholder-only. No payment card, billable provider or production credentials. For the OAuth-capable local profile set:

- `APP_ENV=local`, `APP_CANONICAL_ORIGIN=http://localhost:3000`, `AUTH_URL=http://localhost:3000`, `APP_DOMAIN=localhost`
- `MONGODB_DB=gildedin_local` and `MONGODB_URI=mongodb://127.0.0.1:27017/gildedin_local` **only** when a separately approved local replica set is running; a standalone Mongo daemon does not prove required transactions
- `AUTH_SECRET` — a random, operator-injected secret of at least 43 characters, not a checked-in example
- `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` and `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` — complete pairs only, with limited scopes and local callback URLs; no third-party repository access
- `FEATURE_REGISTRATION=off` until real provider+DB tests and explicit local registration review. Production is hard-coded fail-closed until the separate host and cost gates are resolved.

Register only exact local callbacks: Google `http://localhost:3000/api/auth/callback/google` and GitHub `http://localhost:3000/api/auth/callback/github`. Production equivalents must be reviewed and verified only after Issue 19's canonical host/DNS/TLS gates. Verify issuer/audience/nonce/state/PKCE behavior **using the installed Auth.js version**, not these instructions as a substitute. Use a dedicated synthetic local account with no personal source data.

## 3. Install indices and prove actual MongoDB behavior safely

Existing `npm run db:prove-local` creates its **own random `gildedin_test_*` database**, refuses pre-existing database credentials, applies the index/validator manifest including the two new auth journals, checks uniqueness and basic CAS and probes transaction support. It destroys **only its own disposable database**. On a local Mongo replica set that permits a majority-committed transaction, extend this proof with the same synthetic authorization scenarios as `tests/integration/issue4-auth.test.ts`: two provider-subject registrations, unique OAuth exchange, audit rollback, link/unlink race and a rejected last unlink. Record live write-side counts and audit results before closing 4.x.

The actual MongoDB tier's transaction/session support remains conditional; do not replace transactions with independent writes simply to get a passing demo. Do not connect this proof to Atlas or any existing tenant database. An unsupported-tier result is BLOCKED, not PASS.

## 4. API and page surface (apex host only)

| Route | Purpose and protection |
| --- | --- |
| `GET/POST /api/auth/*` | Auth.js OAuth/OIDC handler; reviewed Host, exact Origin on POST, no owner API permissions from Auth.js JWT |
| `/login` | Google/GitHub provider actions, disabled when unconfigured |
| `/login/complete` | One-time, same-origin OAuth handshake exchange; browser obtains its own CSRF HMAC first |
| `GET /api/auth/ready` | HMAC exchange proof only when Auth.js session is verified |
| `POST /api/v1/accounts/me/sessions/complete` | Issues host-only application session, unique exchange digest, and audit atomically |
| `GET/PATCH /api/v1/accounts/me` | Session-scoped profile/no-portfolio DTO; PATCH only allows displayName plus CSRF |
| `GET /api/v1/accounts/me/csrf` | Session-bound opaque CSRF proof, never public cached |
| `GET /api/v1/accounts/me/providers` | Verified provider labels and identity IDs only |
| `POST /api/v1/accounts/me/providers/link-intent` | Fresh auth, exact Origin, CSRF; sets five-minute HttpOnly intent cookie |
| `/login/link?provider=google\|github` | Rechecks same actor/intent, verifies second provider via Auth.js before atomic link |
| `DELETE /api/v1/accounts/me/providers/{identityId}` | Fresh authentication through provider that remains, last-provider guard and audit |
| `POST /api/v1/accounts/me/sessions/revoke` | Current session revocation, CSRF and durable audit |
| `POST /api/v1/accounts/me/sessions/revoke-all` | Fresh auth, all-session security-version revocation and audit |
| `/dashboard` | Session-protected minimal account state and security controls; full dashboard is Issue 9 |

The other private owner/preview routes and API namespaces remain default-deny until later issues; the public editor and publishing features have **not** been opened.

## 5. Acceptance and provider test checklist

For each real Google and GitHub local flow capture PASS/FAIL/BLOCKED for verified callback and account association (including missing GitHub email), exact origin and correct callback, aborted/expired/replayed OAuth, CSRF on state-changing endpoints, login cookie host-only scope, no cookie on sibling tenant domain, full session revocation, reauthentication age, two simultaneous link/unlink requests, mass assignment denial, unauthorized admin bootstrap and absent upstream tokens in client/log/report/HTTP. Inspect DB records *and* audit writes; never count a green browser redirect alone as proof. Run test suite IDs `T-IAM-01` through `T-IAM-09` as defined in source 11.

Do not close Issue 4 until all required test statuses are truly PASS and the actual chosen Mongo tier's consistency, the official providers and the Next.js build/browser integration are proven. For current status see `engineering/evidence/issue-4-report.md` and `issue-4-status.json`.
