# HOME-HEALTH-20261013 — BabyHien backend audit

Status: **FAIL** — concrete source defects found. Report to: Amri. Owner of corrections: BabyHien; QA verification: BabyAaralyn. This report does not accept or close the task.

Baseline: `f1d4918084f4b9da515d055471f21acc1525e243`; snapshot SHA-256 `22cdb0a62af358076e355f7213a665bc0e004f17647f2b84a0af155d80f1e1bc`. Reviewed the dirty working-tree versions, not only HEAD. Only changed path: `docs/audits/home-health-20261013.backend.md`, under the approved exact owner override. No application, presentation, test, schema or production changes.

## Findings

### B1 — P1: administrative Auth endpoint has no caller authorization

Location: `supabase/functions/admin-user-ops/index.ts:26`, `:35`, `:87`, `:107`.

The handler creates a service-role client and executes actions selected entirely by the request body. It never verifies caller identity, active status, role, target hospital, or whether the actor may reset/delete that target. A regular user's accepted request containing `update_password` and another Auth UUID reaches `updateUserById`; `delete_user` reaches `deleteUser`. This enables account takeover/deletion across hospitals if the function is deployed. Any gateway JWT verification cannot substitute for role and tenant authorization. Anonymous gateway access is unverified: no repository `supabase/config.toml` was present.

Verification: read entire handler and compare migration `030_add_hospital_admin_insert_users_policy.sql:18` and `:37`, which explicitly require active system-admin or same-hospital hospital-admin authority. Handler has no equivalent checks, and its service role bypasses table RLS. Existing HOME audit contract is `audit_logs(user_id, action, module, entity_type, entity_id, old_values, new_values)` in migration 012; the endpoint also writes no HOME actor audit event for these privileged operations. Supabase platform Auth logs were not inspected.

Correction: verify the bearer identity on the server, resolve authority from trusted public users/roles, enforce operation-specific target scope, return 401/403 before admin calls, validate body types, and preserve governed HOME audit events without passwords. Add QA cases for ordinary users, inactive administrators and cross-hospital targets. Owner: BabyHien. Deployment/exposure remains unverified; do not deploy this endpoint unchanged.

### B2 — P1: store-location SQL permits anonymous cross-hospital writes

Location: `supabase/migrations/068_create_store_locations_table.sql:35`, `:39`, `:43`.

INSERT/UPDATE/DELETE policies accept `auth.role() = 'authenticated' OR auth.role() = 'anon'` without any hospital predicate or role restriction. SELECT uses `true`. With the usual granted table privileges and these migrations applied, an anonymous or ordinary authenticated API caller can change/delete another hospital's physical locations. Client `.eq('hospital_id', hospitalId)` clauses do not establish authorization.

Verification: complete read of migration 068 and scoped source search across repository migrations for `store_locations` policy changes; only 068 and the new seed migration 088 reference that table. There is no later repository policy replacement in that scope. Live policy/grant deployment was not queried. The real tenant helper in migration `067_fix_rls_hospital_id_lookup.sql:10` resolves hospital from public users via `auth.uid()`, not a JWT hospital claim.

Correction: restrict reads/writes to actual authorized actors and their hospital using the established helper and approved location-management role policy; add a migration and isolated anonymous/cross-hospital QA cases. Owner: BabyHien; live RLS verification required before claiming security PASS.

### B3 — P2: failed hospital-admin creation rolls back the wrong Auth UUID

Location: `src/modules/hospital-admin/services/hospitalAdminService.ts:170`–`:171`; dependency `supabase/functions/admin-user-ops/index.ts:65`–`:70`.

The new Edge creation path supplies the requested UUID only as `user_metadata.user_id`, so Auth generates its own ID. Hospital-admin creation correctly stores the returned ID as `actualAuthUserId` at line 134 and inserts the public profile with it at line 148. If profile insertion fails, cleanup calls `delete_user` with the earlier random `newUserId`, leaving the created Auth account behind. The invoke result's returned `error` is ignored, so failed cleanup can be silent.

Verification: direct source/data-flow comparison of requested, returned, inserted and deleted IDs; no production account was created. Correction: delete `actualAuthUserId`, inspect the cleanup result, and report/reconcile orphaned accounts when rollback fails. Owner: BabyHien. QA: simulate returned ID different from requested ID and a profile-insert error.

### B4 — P2: Auth existence lookup treats failures and later pages as absence

Location: `src/modules/auth/services/authUserService.ts:124`–`:134`; `supabase/functions/admin-user-ops/index.ts:45`–`:52`.

Any Edge invocation error or thrown network failure becomes `{ exists: false }` without `error`. `fixMissingAuthAccount` at lines 154–159 then attempts creation instead of reporting an unknown lookup state. Failed login diagnostics in `authService.ts:269`–`:280` incorrectly conclude that account provisioning failed. Separately, the endpoint calls paginated `listUsers()` once and searches only that page; an existing account on a later page is also reported absent. Subsequent recovery attempts can create conflict errors or report success without repairing credentials.

Verification: complete source reads and graph inbound trace (four direct callers); local installed `@supabase/auth-js/src/GoTrueAdminApi.ts:214` documents page/perPage and returns pagination metadata. Exact deployed page size is not assumed. Correction: propagate typed lookup errors, require callers to stop recovery on unknown state, and use a supported complete server-side lookup/pagination with proper authorization. Owner: BabyHien. QA: failed invoke and a target on page two.

### B5 — P2: staff-creation fallback can replace the administrator's session

Location: `src/modules/auth/services/authUserService.ts:38`–`:58`.

Every failed administrative Edge call falls through to `supabase.auth.signUp` on the shared persistent application client. With email confirmation disabled and a returned signup session, Supabase saves the new staff member's session and emits `SIGNED_IN`. The administrator becomes the new user midway through provisioning; subsequent public users insertion/admin actions may fail authorization. The fallback also suppresses the original server denial/error.

Verification: `src/services/supabase.ts:12` enables persistent sessions; installed `@supabase/auth-js/src/GoTrueClient.ts:648`–`:650` saves a returned signup session and notifies subscribers. This impact is conditional on Auth signup configuration, which was not queried. Correction: keep privileged provisioning on the authorized server path and surface its failure. If an approved public signup flow is retained, use the existing separate nonpersistent anonymous-client pattern and make confirmation semantics explicit. Owner: BabyHien. QA: Edge denial plus signup response containing a session.

### B6 — P2: prepack inventory lookup conceals database failure

Location: `src/modules/myprepacking/services/prepackService.ts:1314`–`:1325`, `:1412`–`:1424`, `:1449`; dependency `src/services/pharmacy/facilityDrugInventoryService.ts:311`–`:314`.

The inpatient resolver destructures only `data`, discarding the Supabase `error`, then returns the fixed Lawas store UUID on either missing data or query failure. Catalog query errors subsequently enter a service fallback whose own failure is converted to cached rows or an empty array. `searchFacilityCatalogDrugs` reports those rows with `error: null`, making failed/unverified inventory look like a successful search. This hides the outage/schema/access cause from callers; cached stock can look current.

Verification: source control-flow trace through both error branches; migration 087 ties the fallback store UUID to Lawas, not to every hospital. No database call was made. Correction: preserve lookup and catalog errors, resolve store IDs only within the actual hospital, and explicitly distinguish any permitted stale cache from current inventory. Owner: BabyHien. QA: resolver error, catalog error, and absent inpatient store for another hospital.

### B7 — P2: occupancy calculation hardcodes one hospital's inventory stores

Location: `src/services/pharmacy/storeLocationService.ts:490`–`:492`.

`getStoreLocationsWithOccupancy(hospitalId)` accepts any hospital but loads only two fixed LOG/IPD store IDs. Migration `087_create_multistore_inventory_scoping.sql:15`–`:16` and `:34`–`:35` binds those IDs to Lawas. For another hospital with valid different store IDs, the inventory query filters out its items, yielding false zero occupancy. Even for Lawas, other store inventories are excluded from the pool used by non-LOG/IPD locations at line 525. False empty counts can mislead physical-store management.

Verification: query parameters compared to migration location/hospital contracts and the occupancy match loop. This is a conditional multi-hospital/store defect, not a claim that Lawas IDs are themselves invalid. Correction: resolve stores from the actual hospital and include each managed department's corresponding inventory. Owner: BabyHien. QA: a second hospital with distinct stores and an OPD/ETU location.

## Contracts and security checks

Additional dependency finding B8 — **P2**, requested by Amri: `StoreLocationManagementPage.tsx:376`, `:602`, `:768` and backend occupancy `storeLocationService.ts:498` read only `facility_nondrug_items_${hospitalId}`. Actual service contract in `facilityNonDrugInventoryService.ts:65`–`:66`, `:138`–`:160` writes scoped loads under `facility_nondrug_items_${hospitalId}_${storeLocationId}`. When inventory is loaded/added through a scoped store, location detail/export/occupancy can therefore omit those non-drug items or consume stale hospital-wide entries. Verified with direct source excerpts and literal searches; no runtime fixture. Correction owner: Babyluong for page reads through the service, BabyHien for backend occupancy reads; coordinate shared scope interface through Amri. QA: populate only a scoped cache, leave the unscoped key absent/stale, then verify location detail and export against that store. No UI or service was edited.

- Authentication/role/tenant enforcement: **FAIL** — B1/B2.
- Trusted input validation: **FAIL** — Edge accepts truthy arbitrary request values without a typed action/body contract; B1.
- Governed HOME audit preservation: **FAIL** for direct privileged Edge operations — B1; no server actor event in this handler. Live platform logs unverified.
- Secret handling in affected dirty code: **PASS, bounded source check** — client service-role environment reads and temporary-password logging were removed from reviewed files; new service-role key stays in Deno server environment. No secret values were read. This does not certify prior bundles or credential rotation.
- Error semantics and source-of-truth behavior: **FAIL** — B3/B4/B6. Existing location/sub-location caches also supply default records on empty/error responses; root's broader cache investigation owns session/filter exposure evidence.
- Upload/SQL changes: **NOT APPLICABLE** — no implementation in this read-only slice.
- Dynamic authentication/RLS/audit acceptance: **BLOCKED / unverified** — production calls prohibited by assignment; isolated QA cases requested, not run or claimed PASS by this specialist.

## Evidence and limits

Read the assigned six service diffs, full new Edge handler, selected caller/dependency source, relevant schema/RLS/audit migrations and installed Auth SDK implementation. Scoped literal searches were used for policy replacement and secret-reference evidence. No tests or feature files were edited, no specialist dispatched, no production data accessed, and no deployment performed. QA owns build/lint/test checks and dynamic reproductions.

Graph Verify: project `C-Users-60113-Downloads-My-Home-hospital-operation-management-ecosystem`, ready generation `2026-10-13T03:59:34Z`; focused Auth symbol search returned four symbols, `has_more: false`; existence-check inbound trace returned four direct callers. Coverage check included 13 evidence paths: all metadata changed; SQL paths partially parsed. Current source reads and scoped migration grep were therefore used. Migration scope diagnostics were truncated (10/58), so graph coverage is not claimed exhaustive; the specific store-policy absence claim uses source grep across that scope. Live migration state, gateway configuration and Auth email-confirmation configuration remain unverified.

Next action: Amri prioritize B1/B2, assign authorized backend corrections and QA fixtures, then validate live deployment contracts through an authorized nonproduction environment before acceptance. No correction was implemented during this audit.

Required handoff check: `node scripts/check-agent-boundaries.cjs --task docs/audits/home-health-20261013.manifest.json` exited **1**, `UNASSIGNED_POLICY_PATH path=next.config.ts`. This path is a task-start deleted file in the manifest; this specialist did not alter it. Boundary status is **FAIL**, not PASS; Amri must resolve checker routing without silently adopting or reverting baseline changes.
