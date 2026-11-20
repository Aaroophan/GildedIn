# Issue 3 — 19 fixed MongoDB collection boundaries

Source: `docs/specifications/05-data-model.md` §§6, 7, 8, 9, 13–19, 21; `07-security-design.md` §§8, 17. Names below are fixed, never built from a visitor's JSON or a custom schema name. **No collection or API creates user-defined MongoDB namespaces.**

| Namespace | Owner/authority | Allowed reader (after verified policy) | Writer | Notes |
|---|---|---|---|---|
| `accounts` | IAM | self and scoped admin | IAM | unique account ID; no email-as-primary-key |
| `providerIdentities` | IAM | IAM only | verified OAuth linking | unique provider+subject; email collision must not merge |
| `sessions` | IAM | IAM only | IAM | hashed verifier and BSON Date expiry/revocation |
| `portfolios` | tenant control | owner, live public gate, admin | protected control service | unique owner; publication pointer and moderation status live |
| `slugClaims` | tenant routing | host resolver | verified create/rename | globally unique current and historical alias names |
| `drafts` | content/editor | owner only | revision CAS | one embedded bounded draft per portfolio; never public |
| `releases` | publisher | owner; public reader after current policy | write-once release preparation | cannot be public merely because inserted |
| `publishOperations` | publisher | owner/operations | publication journal | scoped hashed idempotency key |
| `mediaAssets` | media | owner; approved public media gate | media service | staging and storage keys never public DTOs |
| `uploadReservations` | media | media worker and owner service | reservation/finalize service | no TTL on expiresAt before physical cleanup reconciliation |
| `quotaBuckets` | quota | internal quota/admission | single-document global admission CAS | physical plus per-portfolio capacity; no cost overrun assumption |
| `aiContexts` | Gilden | AI after active-release+approval+moderation match | context compiler | no visitor prompts or conversations |
| `contactMessages` | inbox | owner/admin scoped | validated submission and owner state | private 30-day TTL and read-time expiration |
| `analyticsDaily` | analytics | owner; approved aggregate public output | bounded event counter | fixed metric keys; no per-visitor tracking |
| `moderationPolicies` | admin | live public/AI gate, admin | verified admin | separate from immutable releases |
| `abuseReports` | moderation | admin, limited reporter receipt | guarded report/admin | no unrestricted reporting query |
| `auditEvents` | security audit | restricted admin/authorized owner | transaction-bound audit writer | required audit must not be best effort |
| `externalFeeds` | integrations | owner, approved release compiler | bounded feed reader | previews not trusted arbitrary user HTML |
| `deletionOperations` | privacy lifecycle | owner/admin operations | deletion service | idempotent account deletion stages |

## Projection and DB permissions

`src/infrastructure/mongodb/repositories.ts` accepts an authenticated actor from the future IAM boundary and constructs every predicate from trusted `accountId` and stable `portfolioId`. It does not accept a raw Mongo filter, update or projection. The public reader accepts only a verified tenant host resolution, checks the current `portfolios` control record and live moderation, and reads only the `activeReleaseId` matching the same portfolio. Owner drafts never enter that path. If moderation cannot be read, it denies. The future public compiler must validate positive public field allowlists; *this issue does not expose portfolio data in an HTTP route*.

`src/infrastructure/mongodb/manifest.ts` declares the collection schemas and uniqueness/TTL/index specs. The schema allows nested bounded draft structures for forward-compatible content authoring, but those structures still require the Issue 6 positive typed-content validation before saving or publishing. No generic database browser/CRUD API is added. Index sizes and free-tier behavior need live, isolated measurements, not statements about a hypothetical provider.
