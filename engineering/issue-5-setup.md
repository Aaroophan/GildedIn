# Issue 5 — developer setup and operational handoff

**Authority:** `docs/specifications/02`, `04`, `05`, `06`, `07`, `08`, `10`, `11`, `12`; implementation plan §5.1–5.10. **Status:** implemented source and isolated synthetic checks; live completion BLOCKED. No production credentials, customer data, paid services or provider permissions used.

## Dependencies and safe local mode

The ZIP contains `next@16.2.4` and the earlier source-only Auth.js/Mongo integrations, but `next-auth` and `mongodb` are not installed or present in `package-lock.json`. Offline tests work through injected fake collections and transaction runner. Do not bypass this by adding raw Mongo network calls or treating a mock as provider verification. On an explicitly trusted, connected machine install reviewed versions with `npm run deps:identity`, then `npm ci --ignore-scripts`, `npm run typecheck`, `npm run build`. Review candidate `next-auth@5.0.0-beta.32` and `mongodb@6.22.0` for compatibility/security before enabling them. Do not place live `.env` files in Git or ZIP artifacts.

For deterministic local checks use `npm run verify:issue5:offline`. Additional `tsconfig.tenancy.json` and `npm run typecheck:tenancy` typecheck the domain/Mongo logic with locally installed TypeScript and `@types/node`. In the artifact container the installed global Node definitions were provided explicitly through `--typeRoots`; that is not a substitute for an ordinary fresh `npm ci` test.

## Public API shape and ownership

| Endpoint | Purpose | Gate |
| --- | --- | --- |
| `GET /api/v1/portfolios` | Own singleton summary, empty when none | Apex, verified active opaque session |
| `POST /api/v1/portfolios` | Private first-portfolio + Hero draft and claim | Apex, exact Origin, CSRF, UUID `Idempotency-Key`, audited transaction |
| `GET /api/v1/portfolios/slug-availability?slug=...` | Advisory normalized slug availability only | Apex, verified session; never leaks owner or alias kind |
| `GET /api/v1/portfolios/{portfolioId}` | Own current control, draft revision and alias summary | Apex, verified session and owner filter |
| `POST /api/v1/portfolios/{id}/rename` | Claim new slug and retain old aliases | Apex, CSRF, UUID idempotency, audited transaction |
| `POST /api/v1/portfolios/{id}/visibility` | Set `public` or `unlisted` | Apex, CSRF, quoted `If-Match` security version, audited transaction |
| `POST /api/v1/portfolios/{id}/disable` | Disable even without first release | Apex, CSRF, versioned audited transaction |
| `POST /api/v1/portfolios/{id}/enable` | Re-enable without overriding admin suppression | Apex, CSRF, versioned audited transaction and fresh moderation |
| `GET /api/v1/public/directory` | Filtered, no-store metadata from active eligible releases | Trusted apex; authoritative live policy for each candidate |

The body is an **allowlisted typed command**, never `ownerAccountId`/`$set` or an arbitrary Mongo filter. If the stored account/session is revoked or expired the repository denies access even after the HTTP guard. No alias removal or public-owner transfer route exists. Current alias + canonical slug share a unique global namespace; renames never allow a second owner to claim a previous name. This is intentionally one portfolio **per owner in beta** (a unique owner index; do not silently change it to a partial active index).

## Double-host and public read proof

`classifyRequestHost` rejects forwarded-host disagreement, port tricks, Unicode host lookalikes, reserved names, deeper subdomains and unverified wildcard routes. The `proxy.ts` layer denies account/admin/API routes on tenant hosts, rewrites approved tenants only after both explicit wildcard flags **and** production environment are set, and noindexes all provisional public pages. Server components repeat host verification. Apex `/{slug}` and subdomain root/details call one `resolvePublic` service. Old aliases redirect 308 to an internally constructed canonical `https://aaroophan.dev/{currentSlug}{safeSuffix}`. Direct `/_tenant` apex access remains denied; Next internal folder uses `%5Ftenant` per App Router private-folders rule. Do not call this fully verified until a Next build and real edge/browser tests have passed.

Before *any* public release is returned, read current owner status, authoritative portfolio policy, moderation rules, active release and approved route manifest. Recheck the current claim, account and policy generation immediately before producing the response. The immutable release payload is never its own permission grant, and a warm CDN cache cannot satisfy the live gate. Unknown or unavailable policy returns an unavailable/not-found result; it does not fall back to a stale cached copy. The current public page deliberately shows only safely compiled title and placeholder text; full content, media, SEO and public editing follow future issues. Unlisted is accessible by direct link once published but omitted from directory and explicitly `noindex`.

## Real MongoDB proof gate

`npm run db:prove-issue5-local` generates **its own random** loopback `gildedin_test_` database, rejects preexisting environment/provider credentials, applies validators and indexes and tests transaction-backed creation, idempotent rename and claimed alias history, concurrent creation attempts, owner scoping and conditional policy changes. It *must* exit BLOCKED when official driver, local Mongo or transaction support is missing. It always attempts cleanup of **only its generated database**. Re-run on a disposable local Mongo replica set and inspect each PASS before evaluating an actual eligible no-charge tier; **never point it to a user-provided database**.

For real dual-host tests, configure verified DNS/HTTPS, then test both URL forms on the selected edge including legitimate `www` redirects, alias 308 details, mixed-case slug normalization, malicious sibling subdomain CSRF, the host-only `__Host-` cookie, forged `X-Forwarded-Host`, unknown host denial, warm-cache disable/suspend, and no leak from owner APIs or static artifacts. Keep `APP_WILDCARD_ENABLED=false` until *every* host/TLS/security proof is accepted in Issue 19. Real Google/GitHub sign-in and browser tests remain prerequisites from Issue 4.

## Acceptance and rollback

The evidence file records source-11 `T-TEN-01`–`T-TEN-09`, relevant `T-SEC-02/03/04`, `T-IAM-05`, `T-PUB-07/08`, `T-ADM-01` as synthetic / blocked. Retain the source `13` roadmap as unchanged authority. A rollback must preserve `slugClaims` (old aliases), `renameOperations` and `portfolios` control versions and keep the current/release lookup compatible. Removing an alias to make a rollback 'work' would allow username hijack. Treat all host/edge and database tier assumptions as NO-GO until actual measurements and provider checks pass. No deployment or service purchase authorized.
