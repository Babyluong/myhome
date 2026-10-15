# HOME-FIXES-20261013 backend handoff

Status: **PASS for backend security/data corrections.** The backend-owned Auth, offline, inventory, release, and SQL suites pass. Formulary transfer reduction remains an open cross-lane task because the current exported catalogue API is synchronous. No production database, Auth tenant, release publication or deployment was used.

## Contracts and changes

- `admin-user-ops` derives the actor from the verified bearer token and active `users`/`roles` rows, validates target role and hospital scope, pages Auth lookups, and records trusted-actor audit events. Creation accepts a pre-existing profile UUID only when its email and hospital match the request. The Auth account is created with that exact UUID; the returned ID is checked and a mismatch is deleted or reported with an explicit reconciliation ID. Existing-profile promotion can use a different approved role after target-role authorization.
- The installed `@supabase/auth-js` version is **2.89.0**. Its `AdminUserAttributes` declares `id?: string`, and `GoTrueAdminApi.createUser` sends the supplied attributes in the Admin API request body. This disproves the previous handler comment that the SDK cannot create an Auth user with a requested UUID.
- Migration `089_secure_store_locations.sql` protects store-location and facility inventory access using active actor, role, hospital and permission contracts; adds authority guards for profile mutations and role-permission writes; preserves audit triggers; and adds nullable per-store threshold/lot fields. The facility catalog tables expose stock bounds and IDs, but do not have `hospital_id`; the bounds trigger now checks the catalog ID and uses the inventory row/store hospital scope instead of querying a nonexistent catalog tenant column.
- The service-worker capability script replies only to `HOME_SAFE_OFFLINE_CACHE_V2` through the supplied `MessagePort` with version `20261013-v2`. Vite includes that script in the generated worker imports. The handshake contains no authentication or tenant state.
- The lazy formulary asset backend work is recorded in Phase 5 Slice A below: the service API now loads the generated asset asynchronously, while UI consumer migration and task-wide acceptance remain with their assigned owners.

## Checks and evidence

- `node --test tests/home-auth-security.test.cjs`: **11/11 PASS**, including same-UUID mapped-profile recovery and mismatched-UUID compensating cleanup/reconciliation.
- `node --test tests/home-auth-security.test.cjs tests/home-offline-fetch.test.cjs tests/home-inventory-contracts.test.cjs tests/home-release-safety.test.cjs`: **35/35 PASS**, including the corrected startup cleanup regressions.
- First PGlite run of `tests/home-store-locations-rls.test.cjs`: **6/8 PASS**. It exposed the migration's nonexistent `drugs.hospital_id` / `non_drugs.hospital_id` references. Those references were removed.
- Corrected PGlite run after adding `department_id` and naming the store columns: **8/8 PASS**. Earlier runs exposed the nonexistent catalog hospital columns and two fixture issues; the corrected migration and corrected fixture now pass the full isolated SQL suite.
- `node scripts/check-agent-boundaries.cjs --task docs/audits/home-fixes-20261013.manifest.json`: **PASS**, `changed_count=328`, attribution not established.
- Build, lint and typecheck were not run by this backend continuation; the task-wide QA agent owns the final gates.

## Changed backend paths

This handoff changed `supabase/functions/admin-user-ops/handler.ts` and `supabase/migrations/089_secure_store_locations.sql`. Earlier backend-slice changes remain in the manifest-owned files, including the offline session/cache services, store-scoped inventory services, Auth services, release scripts/configuration, and service-worker capability script. The boundary checker remains the authority for the full task path set.

## Remaining work

1. Babyluong/QA should finish the assigned consumer migration, test, and build checks before Amri assesses task-wide acceptance.
2. Task-wide lint, typecheck, build, and browser acceptance remain with their assigned owners; this backend continuation did not run those final gates.

## Phase 5 Slice A — lazy formulary asset

Status: **PASS for Slice A only.** This is a backend handoff, not task-wide acceptance. UI migration and downstream QA/build checks are owned by their assigned owners and remain in progress. The official source JSON was not edited; no clinical values or records were synthesized.

### Contract

The existing catalogue exports retain their names and now return Promises: `getAllFormulariDrugs(): Promise<DrugEntry[]>`, `getDrugById(id): Promise<DrugEntry | undefined>`, `searchDrugs(query, filters?): Promise<DrugEntry[]>`, `checkDrugInteractions(ids): Promise<...[]>`, and `getFormulariSummaryStats(): Promise<FormulariSummaryStats>`. `getLasaMasterRegistry()` remains synchronous because it reads a separate small registry. Catalog requests share one in-flight load and successful in-memory result. Failures reject with `FormulariAssetError` (`unavailable`, `invalid_asset`, or `version_mismatch`, with `retryable`); failed loads clear the in-flight promise to permit retry. No full catalog is written to localStorage.

### Changes and evidence

- `src/modules/myformulari/data/formulariDatabase.ts` now exports a pure `buildFormulariDatabase(records)` enrichment builder instead of eagerly importing the large JSON.
- `src/modules/myformulari/services/formulariAssetService.ts` fetches the generated envelope at the app base path with the source SHA-256 as a version query, validates its envelope/version and each record's required runtime shape, and returns typed failures.
- `src/modules/myformulari/services/formulariService.ts` loads/coalesces the asset and applies the existing enrichment before exposing async service results.
- `scripts/generate-formulari-assets.cjs` deterministically hashes the raw source bytes, emits minified `{ sourceHash, records }` JSON, and updates the matching service version constant only when content changes.
- `public/formulari/formulari-data.json` is the generated asset. It contains **1,686** records. A deep equality check against the source confirmed all fields, values, and array order are preserved; the source hash is `18b05ee3fa4a506180a08f82fe8ddd3de13cf6c8d4d9d423ff213cc91c72c717`. Running the generator again left both generated files byte-identical (idempotence check passed).
- `vite.config.ts` adds a Workbox `CacheFirst` route matching `/formulari/formulari-data.json` with optional query parameters, exact route anchoring, `cacheName: formulari-assets`, `maxEntries: 1`, one-year max age, and status-200-only caching. This keeps the dataset out of eager source imports and makes it available offline after a successful fetch.
- Generated JSON is **11,584,761 bytes** (about **1,243,076 gzip**); original source is **13,609,538 bytes** (about **1,338,339 gzip**). The total data payload remains substantial; this slice defers it from initial JS loading and caches it after fetch rather than claiming the catalog itself is smaller.
- Focused ESLint over `formulariService.ts`, `formulariAssetService.ts`, and `formulariDatabase.ts`: **PASS** after removing unused eager-data imports.

### Exact changed paths

- `src/modules/myformulari/data/formulariDatabase.ts`
- `src/modules/myformulari/services/formulariService.ts`
- `src/modules/myformulari/services/formulariAssetService.ts` (new)
- `public/formulari/formulari-data.json` (generated)
- `scripts/generate-formulari-assets.cjs` (new)
- `vite.config.ts`

`src/modules/myformulari/data/officialFukkmData.json` is assigned for inspection only and was not modified. The service-worker capability script was not changed for this slice. Full application build and consumer migration checks are not claimed here because Babyluong/QA own those downstream checks.
