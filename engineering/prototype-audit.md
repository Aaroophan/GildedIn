# Issue 1.2 — Historical prototype inventory and safe baseline

**Source inspected:** original user-provided `GildedIn.zip`, read-only. This document records *historical findings*, not part of the new running product. The original archive is NOT included in the deliverable.

## Baseline inventory

| Property | Observation |
| --- | --- |
| Prototype package | `gilded-in-aaroophan` / version `1.1.0` |
| Package manager | npm; `package-lock.json` lockfile version 3 |
| Framework / runtime choices | Next.js 16.2.4 (declared with caret), React 19.2.0, TypeScript 5, Node-based Next.js App Router |
| Existing scripts | `npm run dev`, `npm run build`, `npm start`, `npm run lint`; no test or typecheck script |
| Repository structure | `src/app` legacy dynamic pages/API, `src/components` UI, `src/models/Services` data fetch and mock auth, `src/lib` Mongo helpers, `auth.ts` |
| Original archive | 182 file entries; 62 files under `public/images`; source-only accounting in `registers/prototype-inventory.json` |
| Legacy credential-bearing file | `.env` present in original archive; **never extracted to this deliverable or copied as source** |
| Automated tests | No runnable test suite in archive; old `tests` and `docs` were empty/non-runtime |
| Original license | No explicit verified source license file in original archive |

## Classification and decision

| Prototype area | Future GildedIn owner | Treatment |
| --- | --- | --- |
| `src/app/[username]/**` and legacy detail pages | Host resolver + secure public read/renderer | **Replace.** Per-user hardcoded metadata and live section reads cannot establish tenant-safe publication. |
| `src/app/api/{hero,about,...}/route.ts` | Narrow authorized `/api/v1` commands and read models | **Replace.** Generic `POST {Name}` section fetches do not carry stable release/policy gates. |
| `src/app/api/dashboard/[section]/route.ts` | Draft application use case and repository | **Replace.** Direct mutable section updates and non-atomic slug checks violate draft/release and tenure invariants. |
| `src/app/api/chat/**` | Gilden policy/knowledge/quota service | **Replace.** Legacy whole-section context and fail-open quota handling cannot be reused. |
| `src/models/Services/Auth.ts` | Provider-bound server-issued sessions | **Remove.** Client-side mock login is not authentication. No mock credentials are copied. |
| `auth.ts` | Identity provider + subject-linked account boundary | **Replace.** Identity cannot use email as ownership principal or include a special owner email. |
| `src/lib/ServerHelpers.ts`, `src/lib/mongodb.ts` | Typed tenant-scoped repositories | **Replace.** Generic/per-call Mongo access is not the application contract. |
| `src/app/dashboard/DashboardEditor.tsx` | Content/composition editors | **Reference concept only.** Old form editor is not a free-positioned canvas or CAS autosave. |
| `src/components/sections/**` | Branded content blocks | **Visual reference only.** Reuse requires a newly designed safe block registry and accessibility review. |
| `src/components/ui/{TechCorners,GridBackground,...}` | Accessible visual design system | **Visual reference only.** Rebuild shared geometry and motion with reduced-motion/performance gates in Issue 8. |
| Public media and videos | Media pipeline and owner-rights ledger | **Do not distribute.** Ownership/redistribution, embedded personal data, file size and provider capacity require audit. |
| Third-party fonts and branding | Typography design tokens | **Conditional.** Oswald/Roboto licensing to be verified; Ink Free/Mistral web embedding rights unproven. |

**Do not migrate:** old prototype source code directly into a production tenant, real credentials, session-storage login, hardcoded account exceptions, direct draft-to-public updates, accidental `NEXT_PUBLIC` secrets, personal CVs/images, or unrestricted provider calls. No asset is inherently reusable merely because it was included in the historical ZIP.

## Safe baseline commands and observed results

The historical source was copied to `/tmp` **without the `.env`**, generated TS metadata, or personal media, for a local-only install feasibility check. `npm ci --offline --ignore-scripts --no-audit --no-fund` failed with `ENOTCACHED` because the npm registry tarballs were unavailable in the isolated environment. No prototype `lint`, `tsc` or `next build` could run without installing its declared packages. This is **BLOCKED**, not a code failure or a successful build.

For the new GildedIn, a minimal reviewed dependency manifest and matching lockfile were produced offline. The domain layer is type-checkable with global TypeScript and tests use Node's built-in runner; the complete Next.js build still requires `npm ci` with registry access. See [`evidence/issue-1-report.md`](evidence/issue-1-report.md).

## Sensitive material / rights handling

The original `.env` is excluded from this ZIP, and no original media or font binary is redistributed. Treat any secrets within an earlier shared archive as potentially exposed and rotate them before production use. **Do not** copy an existing private media library into open source until the owner, subjects, asset licenses and metadata are reviewed. ADR-031 (MIT) remains `Pending` and this repository does not assert licensing rights over the original prototype.
