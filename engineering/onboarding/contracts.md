# Issue 9 — owner journey and trust-boundary contracts

Authoritative: `docs/specifications/01`–`12`, particularly 02, 03, 05, 06, 07, 08, 09 and 11; implementation sequence: `13-implementation-plan.md` Issue 9. The saved draft, public active release, account, portfolio policy, identity session and login-provider identity **remain separate records and authorization concepts**. This is a source implementation, not a production acceptance certificate.

## Route and navigation contracts

| Surface | Kind | Data source / gate | Behavior |
| --- | --- | --- | --- |
| `/` | public SSR platform | eligible `directory` read model only; fail-closed to empty examples | product explanation, actual Create Portfolio CTA, real published examples only |
| `/privacy` | public SSR information | static, no account or draft reads | pre-launch privacy, backup, data retention and publication transparency; legal review pending |
| `/login` | canonical apex sign-in | server Action exact host, exact Origin, no sibling host, vetted provider | Google/GitHub only; sanitize `returnTo`, no passwords, no open redirect |
| `/login/complete` | canonical apex OAuth finish | existing session exchange | vetted `/dashboard` destination only, live server session must be created |
| `/dashboard` | authenticated private SSR | `requireOwnerPage()` with current session+account+owner lookup | no-portfolio state or authoritative status+quota+draft revision, no public draft |
| `/dashboard/onboarding` | authenticated private SSR plus client wizard | scoped actor; portfolio absence required | steps: identity → professional → appearance → optional project → review; POST only after explicit confirmation |
| `/dashboard/portfolios/{id}/editor` | private SSR+client editor | actor-scoped `getOwnedDraft`, stable-ID equality | bounded Hero fields via existing typed draft operations/revision compare-and-swap |
| `/dashboard/account` | authenticated private SSR+client controls | `readPrivateAccount` allowlist | display name, limited verified-email status, provider linking/unlinking, session revocation |
| `/dashboard/portfolio` | authenticated private SSR+client controls | `listOwned` authenticated owner, live status | rename/visibility/disable/enable through separate, named APIs |
| `/dashboard/tools/{tool}` | authenticated private SSR | same owner context, strict named tool routing | accurate upcoming-feature explanation, **not** an unprotected/inert editor operation |

Every private response is forced dynamic and noindex; the existing private API handlers return `Cache-Control: private, no-store`. Layout auth does **not** replace page-level auth. The trusted canonical apex `Host` is required, and forwarded-host/protocol claims are checked. Public tenant routes never import owner repositories and never read mutable draft data. All authorization lives in the server handlers and repositories, not in menu visibility.

## Onboarding and local retry contract

- `WizardData` is a bounded pure domain object: `displayName`, `slug`, `identityLabel`, `introduction`, `templatePreset` (`signature|minimal|studio`), optional `firstProjectTitle` and `firstProjectSummary`. A project or previous employer is never required. Marketing copy is not persisted; the wizard also offers an explicit **Use editable example text** action that fills a clearly marked SAMPLE ONLY project, saved as owner-private data only if the user chooses it.
- Client validation gives accessible step-specific messages; the actual POST `/api/v1/portfolios` calls the stricter **server** `parseCreationCommand`, and the unique DB slug claim is the final judge. Availability is advisory only and contains no account identities.
- A valid first project is one private typed `projects` collection item inside the **same** MongoDB creation transaction as portfolio, canonical slug claim, Hero draft and audit event. It defaults to `draft_only`, with public/search/AI approval lists empty. It cannot produce an active release or public page. A missing/failed transaction denies before commit and rolled-back writes leave no partial project.
- Each submission has an idempotency key; a retry with identical content returns the same owned portfolio rather than creating a duplicate. The key changes when the user changes data. A conflicting request under one key is rejected.
- Temporary browser recovery uses `gi:onboarding:v1:{sha256(accountId+scope)}` (no raw account ID or credential), strict shape validation and a time-limited read of at most 24 hours. The user can clear it, and session sign-out clears matching keys. **Browser localStorage is not secure storage, does not have reliable physical expiration in an unopened browser, and must not contain passwords, provider tokens or secrets.** Expired copies are removed when the wizard next opens. The browser is not an independent backup.
- Server confirmation creates an **owner-only draft** and returns an editor link. No onboarding action publishes or activates any release. Public search and Gilden remain off until their separate issue gates.

## Account, visibility and quota contract

- Owner account `displayName` uses the established allowlisted `/api/v1/accounts/me` PATCH. Provider identities are stable issuer/subject mappings, never email matching; private provider credentials are absent from DTOs. Link/unlink and revoke-all call existing authenticated, recent-auth and audit-enforced APIs, with UI warning for last-provider restriction and irreversible session effects.
- Portfolio settings call the established POST rename endpoint with unique idempotency key, POST visibility/disable/enable with `If-Match: "{securityVersion}"` and current authoritative policy read. **No** UI input sets `activeReleaseId`, `ownerAccountId`, role or private DB record. Restricted portfolios are visible to their owner but forbidden to mutate; foreign accounts always receive denial.
- A `public` portfolio is index-eligible **only when it has an active release and live eligible policy**; `unlisted` is link-accessible, not private. `owner_disabled`, `suspended` and `deleting` deny public eligibility. Draft revision is displayed as server-acknowledged only. User-entered inputs remain unsaved until API success.
- Quotas shown come from shared product constants and live owner-scoped `quotaSummary` (`usedBytes`, `reservedBytes`, `originalFileCount`). Client cannot raise caps. Global availability is unverified. The product has **no guaranteed independent backups, disaster recovery or uptime** and never requires a payment card/overage purchase.
- `ownerRequest()` sends same-origin `credentials`, no-store, CSRF proof, bounded named API paths and structured safe error messages; the server must revalidate every operation including cross-subdomain origin/CSRF/session/actor status.

## Implemented now versus future gates

- Implemented source: branded platform marketing, safe provider login UI, private owner guard+dashboard, five-step wizard with atomic optional project, Hero typed editor, purpose-scoped settings, accurate unavailable-tool messaging, responsive CSS and privacy copy.
- Future Issues 10–11: full visual canvas, autosaved edit commands, conflict resolution and authenticated protected preview. Current Hero editor is intentionally basic manual-save.
- Future Issues 12–18: uploads, publication and restoration, public delivery, feeds, Gilden, contact/analytics, account export/deletion and administrator controls. Settings do not invent these capabilities.
- Actual OAuth callbacks, Auth.js/MongoDB installation, real DB transaction/cookie/CSRF/browser security, screenshots, accessibility/performance and legally reviewed privacy language are **BLOCKED** until they run against vetted local/production infrastructure. No placeholders are represented as verified live functionality.
