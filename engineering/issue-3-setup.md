# Issue 3 — development and debugging guide

**Prerequisites:** Issue 1 contracts and Issue 2 isolated tests. The 12 specifications and plan remain under `docs/specifications`.

**Offline checks (Node.js >=22.16):**

```sh
npm test
npm run check:requirements
npm run check:boundaries
npm run check:secrets
npm run check:ci
npm run typecheck:domain
```

**With installed project dependencies:**

```sh
npm ci --ignore-scripts
npm run verify:issue3
npm run typecheck:persistence
npm run typecheck
npm run build
```

**Optional real local Mongo proof:** install an approved official `mongodb` npm driver, update and review the npm lockfile, start a disposable localhost `mongod`, then `npm run db:prove-local` (100 synthetic accounts) or `npm run db:prove-local -- --samples=500`. Do not set `APP_ENV`, `MONGODB_URI`, `MONGODB_DB`, OAuth/provider secrets or production flags when running this script; it explicitly refuses unsafe environments. The proof script creates and deletes **only its own random local test DB**. Running `db:prove-local` in this offline artifact returns `BLOCKED` because the driver and mongod are unavailable. The application is not wired to a production database or OAuth flow; those belong to Issue 4 onward.

Source folders:

- `src/domain/persistence/models.ts`, `ports.ts`: versioned records and actor-scoped contracts.
- `src/infrastructure/mongodb/manifest.ts`: fixed schema/index migration declarations.
- `src/infrastructure/mongodb/validation.ts`: strict BSON/runtime parsers and release hash/size checks.
- `src/infrastructure/mongodb/repositories.ts`: tenant draft/media, public gate, publication, private inbox and analytics readers.
- `src/infrastructure/mongodb/quota.ts`: one-document global/owner quota reservations and cleanup fencing.
- `src/infrastructure/mongodb/identity.ts`: stable provider subject, session verifier and slug claim primitives.
- `src/infrastructure/mongodb/audit.ts`: transaction-required durable audit adapter.
- `src/infrastructure/mongodb/ai-context.ts`: active release and current approval policy matching only.
- `src/testing/mongo-fake.ts`: strict synthetic offline testing, **never production data storage**.

`engineering/persistence/` records collection owners, failure semantics and migration criteria. Test output/blocked states: `engineering/evidence/issue-3-report.md`, `issue-3-status.json`.

**Safety:** All existing Next.js HTTP routes continue to deny protected operations until authentication/host routing exists. A green fake Mongo test is not evidence of actual BSON wire behavior, transactions, AWS IP rules, DNS/TLS, guaranteed backups, or a secure live deployment.
