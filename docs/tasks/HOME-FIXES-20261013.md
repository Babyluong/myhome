# HOME-FIXES-20261013 correction plan

Babybun planning handoff to Amri. Status: PASS (plan prepared; implementation and acceptance pending). User approval already covers these audit corrections; no renewed approval or visual redesign is required. Only Amri dispatches, resolves ownership and accepts work.

Baseline: `f1d4918084f4b9da515d055471f21acc1525e243`; v2 manifest `docs/audits/home-fixes-20261013.manifest.json`; snapshot SHA-256 `ccec66f87a9c229c5cad9e28cb1d3767fbc405a63dfedd864a6ecfb6aaa5cd3d`. Preserve all task-start dirty content. The planner owns only this document. Proposed implementation paths below become writable assignments only after Amri records them in the manifest, including exact overrides where semantic responsibility differs from routing.

Evidence: `docs/audits/home-health-20261013.md`, `.backend.md`, `.frontend.md`, `docs/test-reports/2026-10-13-home-health.md`, and its lint/rules/build logs. Parent Graph Verify: project `C-Users-60113-Downloads-My-Home-hospital-operation-management-ecosystem`, ready generation `2026-10-13T04:28:46Z`; four exact Function matches (`createAuthUser`, `offlineSafeFetch`, `searchFacilityCatalogDrugs`, `getStoreLocationsWithOccupancy`), no further result pages. Fourteen evidence paths had metadata changes; StoreLocationManagementPage parse unusable 1–2737 and facility JSX partially covered. This planner used supplied graph evidence and focused current source fallback; no new graph coverage claim.

## Phase 0 — ownership and safe execution (Amri)

Exact paths: `docs/AGENT_OWNERSHIP.json`, `docs/audits/home-fixes-20261013.manifest.json`, `docs/audits/home-fixes-20261013.md`; preserve the pinned snapshot. Confirm the currently present `next.config.ts` exact owner addresses the prior audit's unassigned deleted-file failure; rerun discovery rather than removing deleted paths from checks. Add any further genuinely missing owners exposed by validation. Record sole owner of every path, including appendix paths, before edits; routing rules grant no task permission. Amri cannot self-approve a material governance policy change; escalate that concrete change if needed. Mere routing of the already approved corrections carries existing approval forward.

## Phase 1 — privileged Auth and tenant policies (BabyHien)

Exact paths: `supabase/functions/admin-user-ops/index.ts`, `src/modules/auth/services/authUserService.ts`, `src/modules/auth/services/authService.ts`, `src/modules/hospital-admin/services/hospitalAdminService.ts`, `src/modules/admin/services/userAccountFixService.ts`, `src/modules/admin/services/systemAdminFixService.ts`, new `supabase/migrations/089_secure_store_locations_rls.sql`. Check migration-number availability before assignment; a collision requires an exact replacement path recorded by Amri.

B1/B3/B4/B5 contract: authenticate bearer identity server-side, load active actor/role/hospital from trusted public records, enforce system-admin or same-hospital hospital-admin operation scope, and validate typed action bodies before any admin call. Resolve an existing target from trusted records, never caller metadata; new-account scope must carry a validated target hospital and a trusted provisioning association so rollback of a newly created but unprofiled Auth UUID can be authorized. Creation returns the actual Auth UUID; cleanup uses that UUID, checks failure, and reports reconciliation-required rather than concealing an orphan. Paginate existence lookup fully under the same privilege rules; distinguish found/absent/error and halt recovery on error. Never fall through to shared-client signup or fabricated success when configuration is missing.

Keep ordinary own-password updates on the existing authenticated `auth.updateUser` path (`authService.ts` / `passwordService.ts`); privileged reset remains an administrative action. Unauthenticated failed-login diagnostics must not enumerate Auth users or gain recovery authority; return the existing generic recovery instruction. Account recovery requiring administrator powers needs an authenticated authorized actor. Preserve actor audit events using migration 012's real schema, exclude credentials, and surface audit persistence failure/partial operations so privileged success cannot silently lose its governed record.

B2: add forward-only replacement policies using the real hospital helper from migration 067 and established active role contracts (migration 030), remove anonymous/unscoped write permissions, and restrict reads to authorized tenant scope. Do not modify historical migration 068 or invent a role policy. Existing repository role rules determine location-management authority; any unresolved role choice goes to Amri before implementation. Grants and policies must be verified together in an isolated database; no production call/deploy is authorized by this plan.

Acceptance: anonymous/ordinary/inactive/cross-hospital actors denied with zero privileged calls; valid scoped admin allowed; malformed bodies denied; page-two existence found; failed lookup stops provisioning; profile-insert failure cleans actual UUID or exposes cleanup failure; admin session unchanged on all provisioning errors; own-password flow retained; audit actor/target persisted with no passwords. SQL tests cover anonymous/ordinary/authorized/same-tenant/cross-tenant SELECT/INSERT/UPDATE/DELETE and both USING/WITH CHECK.

## Phase 2 — truthful offline transport (BabyHien, may proceed alongside Phase 1)

Exact paths: `src/services/offlineFetch.ts`, `src/services/supabase.ts`, `src/services/offlinePreloader.ts`. Logout cleanup is serialized through Phase 1's same-owner `src/modules/auth/services/authService.ts`.

Recommended interface: explicit trusted cache scope `{ actorId, hospitalId, authGeneration }` installed from authenticated session plus resolved tenant; revoke scope synchronously at logout/actor/tenant switch and cancel/drop old in-flight cache writes. Prefer exact-response cache entries keyed by project endpoint, scope, complete URL query and relevant Accept/Range/Prefer headers over reimplementing arbitrary PostgREST queries. Preserve projection, filters, ordering, count, pagination and single-object status/body exactly. Cache only authorized successful responses; exclude Auth/RPC/storage traffic and unsupported/unproven scopes. Anonymous client must not share authenticated entries. Never use legacy table-only, module or cylinder caches as universal fallback; invalidate old universal caches and remove/rework preloader's unscoped merges. Direct module cache stores are outside fallback trust unless explicit scope/semantics are proved; expand exact ownership through Amri if needed.

Return explicit unavailable/error when no matching response exists; a proven cached empty response may remain empty. Mark cached provenance/age through a typed contract/headers instead of asserting current data. PATCH/DELETE/POST network failure must fail; do not synthesize `offline_queued` or change existing durable queue contracts. Durable queuing is unnecessary to fix the defect and would need separately verified acknowledgement semantics.

Acceptance: H1/H2 and actor A/B never share reads; exact query projection/filter/order/HEAD count/single/range preserved or unavailable; logout, failed signout, tenant switch, token refresh and old request completion cannot repopulate revoked scope; successful empty cache distinguished from uncached absence; offline mutations have no false success; no credentials in cache keys/logs. No ordinary denied server response becomes a successful cache fallback.

## Phase 3 — inventory scope contracts (BabyHien)

Exact paths: `src/modules/myprepacking/services/prepackService.ts`, `src/services/pharmacy/storeLocationService.ts`, `src/services/pharmacy/facilityDrugInventoryService.ts`, `src/services/pharmacy/facilityNonDrugInventoryService.ts`.

B6/B7/B8 interface: resolve inventory store IDs from actual hospital's `pharmacy_stock_locations` and existing department/location mapping, with explicit not-found/query-error outcomes; validate caller-supplied store belongs to tenant. Keep physical `store_locations` IDs distinct from inventory-store IDs. Remove Lawas UUID fallback; include each managed department/store pool rather than assuming LOG/IPD cover all departments. Search returns typed `{ data, error }` with optional explicit stale provenance, never `error:null` after concealed database failure. Detail/export/occupancy all consume the same hospital+store service load contract for both drugs and non-drugs; scoped non-drug cache keys match writes, with no unscoped stale substitution. Missing/error store resolution cannot masquerade as zero occupancy.

Acceptance: fixture hospitals H1/H2 with distinct LOG/IPD/OPD/ETU IDs; resolver/catalog errors remain visible; absent IPD explicit; invalid override rejected; occupancy counts correct for all managed stores; scoped-only non-drug fixtures match detail/export/count even when old hospital-wide cache is absent or stale. Specialist communicates final signatures/errors to Amri for frontend dependency handoff.

## Phase 4 — inventory and accessible UI (Babyluong; depends on Phase 3 contract)

Exact paths: `src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx`, `src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage.tsx`, `src/modules/inventory/components/FacilityDrugMobileCard.tsx`, `src/modules/inventory/components/FacilityNonDrugMobileCard.tsx`, `src/modules/myprepacking/components/PrepackDrugPickerModal.tsx`, `src/modules/inventory/pages/inventory/DrugInventoryPage.tsx`, `src/modules/inventory/pages/inventory/NonDrugInventoryPage.tsx`, `src/modules/inventory/pages/inventory/StoreLocationManagementPage.tsx`.

F1: retain selected catalog objects across search/scheme responses; clear/reconcile only on tenant/store context change, make count equal submitted items, and retain/report failed additions. F2: add named native edit control beside separate delete action, visible focus, logical tab order and drawer focus return. F3: one initial/debounced fetch lifecycle, request generation invalidation on search/open/context/unmount, with only newest request updating data/error/loading. F4: unconditional hooks or an authorized-child component boundary; preserve existing authorization decision, refer changes in authority to BabyHien. B8 page: consume scoped service loads for detail/export, remove direct unscoped cache reads and Lawas mapping; respect typed error/provenance. Fix all four `transition-all` BLOCKs using affected-property transitions at 150–250ms and reduced-motion support. Review 172 warnings contextually, including print templates; do not mass-replace clinical print colors or alter approved visual identity.

Acceptance: A→B cross-search/scheme Add submits both exactly once; failed/empty selection truthful; keyboard Enter/Space opens mobile edit and focus returns; reversed requests cannot overwrite current search/loading; role transition does not violate hook order; detail/export uses chosen tenant/store; affected browser evidence captures revision, light/dark theme, mobile/desktop viewport and normal/reduced motion. Backend owns auth semantics, frontend owns presentation.

## Phase 5 — release safety and measured bundle repair (BabyHien; frontend dependency via Amri)

Exact release paths: `package.json`, `vite.config.ts`, `scripts/generate_system_releases.cjs`, `scripts/sync-english-releases.cjs`, `src/config/generatedReleases.json`, `src/config/systemReleases.ts`, `public/version.json`. Generated artifacts remain BabyHien-owned with exact Amri overrides when default routing requires them. Preserve current generated content until intentional local generation is verified.

Separate pure local release generation from explicit publishing; normal dev/prebuild/Vite hooks must make zero database/network publication calls and load no service credentials. Publishing requires an explicit command/mode, validates configuration, previews intended changes, scopes update/delete to managed release records and fails visibly; eliminate broad `Lawas` deletion. Prepare publication locally with stub clients and fixtures before any external approval/action. No remote publication or production calls in this task.

Exact bundle paths: `src/modules/myformulari/services/formulariService.ts`, `src/modules/myformulari/data/formulariDatabase.ts`, `src/modules/myformulari/data/lasaDatabase.ts`, new `scripts/generate-formulari-assets.cjs`, new `public/formulari/formulari-data.json`; configuration stays same-owner `vite.config.ts`. Recommended first step: serialize existing static formulary data to a versioned static asset through a pure local generator, preserve synchronous service callers using an explicitly awaited module preload/hydration contract, then permit async loader usage only in exact consumer paths already assigned through the lint appendix. Amri records each affected consumer before edits. Do not invent/trim clinical records or raise `chunkSizeWarningLimit` to silence evidence. If an asset split cannot preserve existing synchronous contracts, report exact async consumers for a revised slice before editing them.

Acceptance: ordinary dev/build succeeds with publication stubs proving zero writes; explicit local publication simulation has accurate preview, narrow mutation set and nonzero failure exit. Build measures formulary chunk below the existing 2,500kB limit, initial/offline payload and asset strategy; compare cold/warm/offline formulary correctness against original records. Static asset must have a deliberate PWA offline availability strategy, measured cache size, visible missing-data/loading error and identical search/detail results. Splitting a chunk alone does not prove lower total payload.

### Formulary bundle implementation addendum — unresolved follow-on within Phase 5

The audited baseline was a 11.75 MB emitted JavaScript chunk (1.286 MB gzip) backed by `officialFukkmData.json` at about 13.6 MB. The service API is synchronous and has ten exact UI consumers, so defer/removal of the full catalogue is a coordinated API migration, not a chunk-only change. Preserve every official source row, field, text, ordering and monograph; do not curate, normalize destructively, or trim records to hit a size target.

**Slice A — asset contract and service migration (BabyHien; depends on Amri recording/confirming the exact assignment before edits).** Exact paths: `src/modules/myformulari/services/formulariService.ts`, `src/modules/myformulari/data/formulariDatabase.ts`, `src/modules/myformulari/data/officialFukkmData.json`, `src/modules/myformulari/services/formulariAssetService.ts`, `public/formulari/formulari-data.json`, `scripts/generate-formulari-assets.cjs`, and the already assigned `vite.config.ts` / `public/sw-capabilities-v2.js` only if needed for asset delivery and offline caching. Build a deterministic local generator and a typed Promise-based loader; make asset version/cache identity derive from source content or an explicit generated version. Migrate the service away from eager full-data imports and expose async load/search/detail/interaction/summary-stat operations with explicit loading and typed failure behavior. The manifest currently lists all six formulary paths under BabyHien and the ten consumer paths below under Babyluong; Amri should preserve those exact sole-owner assignments (and add no wildcard paths). If any path is absent or ownership changes, update the manifest before edits and maintain its pinned baseline snapshot.

**Slice B — all synchronous consumers (Babyluong; depends on Slice A's agreed async API contract).** Exact paths: `src/modules/myformulari/pages/DrugAlternativesPage.tsx`, `src/modules/myformulari/pages/DrugDetailPage.tsx`, `src/modules/myformulari/pages/FormulariDashboardPage.tsx`, `src/modules/myformulari/pages/HamListPage.tsx`, `src/modules/myformulari/pages/HospitalLawasFormulariPage.tsx`, `src/modules/myformulari/pages/LasaListPage.tsx`, `src/modules/myformulari/pages/PaediatricCataloguePage.tsx`, `src/modules/myformulari/components/AddQuotaDrugModal.tsx`, `src/modules/myformulari/components/DrugInteractionModal.tsx`, and `src/modules/hub/pages/modules/FormulariSubMenu.tsx`. Replace each synchronous read with the agreed async contract, preserve its current search/filter/detail semantics, show a visible loading state, and provide a recoverable error/retry state. Migrate `checkDrugInteractions()` to async evaluation with visible pending and recoverable error behavior in the interaction modal; migrate `getFormulariSummaryStats()` to async loading in the submenu and retain appropriate loading/error feedback there. Do not retain a hidden eager import or synchronous facade that pulls the full JSON into the initial application bundle.

**Acceptance and evidence for both slices:** (1) Before/after data-integrity check compares canonical source and generated records by row count, stable IDs, order, and all source fields; the generator is deterministic across two runs and no official row is lost or altered. (2) Regression coverage exercises search, filter, detail, alternative, drug-interaction result, LASA, HAM, paediatric, quota-modal and submenu summary-stat consumers against the same representative records and confirms prior results. (3) Cold online load fetches and renders the asset; warm load reuses the verified version; warm offline load works from the declared PWA/runtime cache; cold offline load fails visibly with retry guidance and never fabricates an empty catalogue. Test cache-version invalidation and quantify the asset's stored, transferred, and compressed bytes. (4) Build evidence records baseline and resulting initial-route JavaScript, lazy formulary JavaScript, asset size (raw and gzip), and initial network payload; demonstrate the official catalogue is absent from initial JavaScript and the initial route stays below the existing 2,500 kB chunk gate. Report the changed total transfer cost honestly: deferring a 13.6 MB source asset can reduce startup cost without reducing the eventual catalogue download. (5) Run typecheck, focused formulary tests, offline cold/warm tests, production build and the existing unchanged lint/rules gates; report failures as blockers rather than raising thresholds or suppressing diagnostics. BabyAaralyn owns exact regression-test/report paths already recorded in the manifest and verifies both slices after handoff; Amri accepts the result.

## Phase 6 — lint backlog, sole owners listed in appendix

Baseline: 5,122 errors + 232 warnings across the current audit log. Rule counts: 2,610 explicit-any, 1,991 unused-vars, 282 ban-ts-comment, 200 exhaustive-deps, 69 rules-of-hooks (two master inventory pages), 65 no-empty, 59 prefer-const, 32 only-export-components; remaining rules retain their diagnostics. Goal is zero errors/warnings under unchanged `npm run lint --max-warnings 0`, not a baseline exemption. Amri expands exact paths from appendix in owner batches; feature repair precedes lint repair on the same file, with one sole owner throughout.

Use actual service/schema types, typed UI props, small reusable interfaces and validated narrowing of JSON/external values. Do not globally replace `any` with `unknown`, inject suppressions, remove checked files, reduce rule severity, raise warning thresholds or weaken tests. Use AST-aware fixes only for provably safe unused bindings and prefer-const cases, inspect diffs and retain import/function side effects; replace ts-nocheck after restoring real types; resolve empty catches with deliberate error handling; inspect effects for stable dependencies and stale-closure semantics rather than blanket dependency insertion. Separate non-component exports only with exact new paths assigned by Amri. `eslint.config.mjs` rule changes are unnecessary. Process coherent modules, typecheck changed dependencies and verify behavior after each batch; full lint at final gate. New shared type/component files require exact added assignments, not wildcard permission.

History check: HEAD's lint config still extends Next core-web-vitals/typescript, from the initial Create Next App commit; current dirty config instead uses React/Vite-compatible recommended rules. This explains why legacy coverage needs scrutiny but does not establish that current diagnostics are false positives or authorize easing the gate. Treat 553-file typing as a substantial follow-on set of approved correction batches, not a quick automatic cleanup or completed fix. Frontend: 391 files, 3,466 errors + 226 warnings; backend: 162 files, 1,656 errors + 6 warnings (Amri's parsed inventory). Recommend retaining current rules and honest incomplete status until all batches pass. A proposal to change rollout/gate behavior would be a consequential scope decision for Amri/user, with exact old/new diagnostics and tradeoffs first; it is not part of this plan.

## Phase 7 — QA and acceptance (BabyAaralyn → Amri)

Proposed exact QA paths: `tests/home-auth-security.test.cjs`, `tests/home-offline-fetch.test.cjs`, `tests/home-inventory-contracts.test.cjs`, `tests/home-release-safety.test.cjs`, `tests/home-ui-regressions.spec.ts`, `tests/home-store-locations-rls.sql`, `tests/home-formulari-assets.test.cjs`, `docs/test-reports/2026-10-13-home-fixes.md`, `docs/test-reports/2026-10-13-home-fixes-lint.log`, `docs/test-reports/2026-10-13-home-fixes-rules.log`, `docs/test-reports/2026-10-13-home-fixes-typecheck.log`, `docs/test-reports/2026-10-13-home-fixes-tests.log`, `docs/test-reports/2026-10-13-home-fixes-build.log`, `docs/test-reports/2026-10-13-home-fixes-agents.log`, `docs/test-reports/2026-10-13-home-fixes-browser.json`. Browser screenshots are task-local artifacts with exact paths assigned before repository writes. Test filenames are proposals; QA may refine framework/fixture arrangement through Amri.

QA owns isolated fixtures and regressions listed above; local Supabase/RLS verification must preserve real schema/helpers/grants. Test Auth audit failures, denied actors, pagination/rollback/session; offline actor/tenant/projection/count/mutation/logout races; inventory scope and reversed search; keyboard/hooks; release zero-publication; formulary data equivalence. Existing `test:agent-system` 47 fixture failures require a supported writable Git fixture environment, not assertion edits/skips. Record unavailable local DB/browser/runtime evidence as BLOCKED/unverified and immediately report to Amri; never infer live RLS/deployment from static checks.

Final gates: `npm.cmd run lint`, `node scripts/check-rules.cjs`, TypeScript noEmit, safe ordinary build after release repair, `npm.cmd run test:agent-system`, `npm.cmd run agents:validate` with real tomllib runtime, every focused regression and `node scripts/check-agent-boundaries.cjs --task docs/audits/home-fixes-20261013.manifest.json`. QA retains exits/full logs and browser context; each specialist reports task/slice, PASS/FAIL/BLOCKED/NOT APPLICABLE, exact changed paths, evidence, dependencies and next action to Amri. Passing unchanged gates need no repeated runs without cause. Amri permits at most two correction cycles and alone decides acceptance.

Open dependencies: local database availability, blocked Git fixture write permissions and browser fixture/auth harness; deployed gateway/grants/audit persistence remain unverified because production calls are excluded. No consequential product choice is unresolved from the approved audit scope. Soft effort: security/offline first, inventory/UI next, lint in bounded module batches; correctness and required checks override time targets. Planning handoff boundary command exited 0: `PASS status=VALID changed_count=4 attribution=NOT_ESTABLISHED`; this is manifest scope evidence, not certification of another agent's edits or product acceptance. New migration path availability checked; proposed 089 filename was absent. Rework cycles: 0.

## Exact lint-path appendix

Generated from the current audit's full lint log, retaining current routing precedence (exact owner, tests, primary, fallback). Counts and exact paths follow. This appendix proposes ownership; Amri must pin these exact paths before implementation. Additional files are never implicitly authorized.

Lint diagnostic file headers: 553. This is the exact audit file set; diagnostic counts remain the audit totals, not a fresh lint execution.

### babyluong — 391 exact paths

- `src/components/AppShell.tsx`
- `src/components/AuthWrapper.tsx`
- `src/components/BorrowingReviewModal.tsx`
- `src/components/BufferLevelTable.tsx`
- `src/components/ClientOnly.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/InventorySearchFilter.tsx`
- `src/components/InventoryTable.tsx`
- `src/components/ItemAnalyticsModal.tsx`
- `src/components/LoanReviewModal.tsx`
- `src/components/ManualIssuanceModal.tsx`
- `src/components/MedicalOxygenSearchFilter.tsx`
- `src/components/MedicalOxygenTable.tsx`
- `src/components/Nav.tsx`
- `src/components/PhysicalIssuanceModal.tsx`
- `src/components/ReviewModal.tsx`
- `src/components/SearchAndFilter.tsx`
- `src/components/SidebarNav.tsx`
- `src/components/TransactionDetailsModal.tsx`
- `src/components/UnitItemModal.tsx`
- `src/components/charts/index.ts`
- `src/components/forms/AccessRequestForm.tsx`
- `src/components/forms/ChangePasswordForm.tsx`
- `src/components/forms/DepartmentForm.tsx`
- `src/components/forms/HospitalAdminForm.tsx`
- `src/components/forms/HospitalForm.tsx`
- `src/components/forms/InquiryForm.tsx`
- `src/components/forms/LoginForm.tsx`
- `src/components/forms/ResetPasswordForm.tsx`
- `src/components/forms/UserForm.tsx`
- `src/components/forms/index.ts`
- `src/components/index.ts`
- `src/components/kunci/ScanKunciMovementModal.tsx`
- `src/components/layout/index.ts`
- `src/components/oxygen/AuditReconciliationSummaryModal.tsx`
- `src/components/oxygen/CreateReceiveDocumentModal.tsx`
- `src/components/oxygen/CreateRequestDocumentModal.tsx`
- `src/components/oxygen/CreateReturnDocumentModal.tsx`
- `src/components/oxygen/CylinderDispatchPrintView.tsx`
- `src/components/oxygen/CylinderDispatchTable.tsx`
- `src/components/oxygen/CylinderKpiCards.tsx`
- `src/components/oxygen/CylinderOfflineBanner.tsx`
- `src/components/oxygen/CylinderStockReconciliationModal.tsx`
- `src/components/oxygen/DeleteCylinderModal.tsx`
- `src/components/oxygen/DeleteDispatchConfirmModal.tsx`
- `src/components/oxygen/DispatchRequestDetailModal.tsx`
- `src/components/oxygen/EditCylinderModal.tsx`
- `src/components/oxygen/EmptyCylinderListModal.tsx`
- `src/components/oxygen/ManualIssueModal.tsx`
- `src/components/oxygen/ReceiveDocumentPrintView.tsx`
- `src/components/oxygen/ReceiveInterFacilityModal.tsx`
- `src/components/oxygen/RegisterAvailableCylindersModal.tsx`
- `src/components/oxygen/RequestDocumentPrintView.tsx`
- `src/components/oxygen/ReturnDocumentPrintView.tsx`
- `src/components/oxygen/ReturnInterFacilityModal.tsx`
- `src/components/oxygen/ScanEmptyCylinderModal.tsx`
- `src/components/oxygen/ScanReconciliationModal.tsx`
- `src/components/oxygen/StoreBalanceGrid.tsx`
- `src/components/oxygen/StoreUsageBalanceTable.tsx`
- `src/components/oxygen/SupplierCylinderTrackingSection.tsx`
- `src/components/oxygen/SupplierReturnsSection.tsx`
- `src/components/oxygen/UnitDistributionTable.tsx`
- `src/components/oxygen/UnitRequestModal.tsx`
- `src/components/pharmacy/ExcelImport.tsx`
- `src/components/shared/ContactModal.tsx`
- `src/components/shared/JataNegara.tsx`
- `src/components/shared/PDFViewer.tsx`
- `src/components/shared/PdfPreviewModal.tsx`
- `src/components/shared/index.ts`
- `src/components/ui/Icons.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/PDFUpload.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/data-table.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/skeleton.tsx`
- `src/modules/admin/pages/accessRequests/AccessRequestDetailPage.tsx`
- `src/modules/admin/pages/accessRequests/AccessRequestListPage.tsx`
- `src/modules/admin/pages/accessRequests/index.ts`
- `src/modules/admin/pages/alerts/AlertCenterPage.tsx`
- `src/modules/admin/pages/alerts/index.ts`
- `src/modules/admin/pages/auditLogs/AuditLogPage.tsx`
- `src/modules/admin/pages/auditLogs/index.ts`
- `src/modules/admin/pages/backups/BackupManagementPage.tsx`
- `src/modules/admin/pages/backups/index.ts`
- `src/modules/admin/pages/clinics/ClinicDetailPage.tsx`
- `src/modules/admin/pages/clinics/ClinicListPage.tsx`
- `src/modules/admin/pages/departments/DepartmentDetailPage.tsx`
- `src/modules/admin/pages/departments/DepartmentListPage.tsx`
- `src/modules/admin/pages/departments/index.ts`
- `src/modules/admin/pages/hospitals/HospitalDetailPage.tsx`
- `src/modules/admin/pages/hospitals/HospitalListPage.tsx`
- `src/modules/admin/pages/hospitals/index.ts`
- `src/modules/admin/pages/modules/ModuleAccessControlPage.tsx`
- `src/modules/admin/pages/modules/index.ts`
- `src/modules/admin/pages/monitoring/SystemMonitoringPage.tsx`
- `src/modules/admin/pages/monitoring/index.ts`
- `src/modules/admin/pages/roles/RoleListPage.tsx`
- `src/modules/admin/pages/roles/RolePermissionPage.tsx`
- `src/modules/admin/pages/roles/index.ts`
- `src/modules/admin/pages/settings/SystemSettingsPage.tsx`
- `src/modules/admin/pages/settings/index.ts`
- `src/modules/admin/pages/systemLogs/SystemLogsPage.tsx`
- `src/modules/admin/pages/systemLogs/index.ts`
- `src/modules/admin/pages/users/UserDetailPage.tsx`
- `src/modules/admin/pages/users/UserListPage.tsx`
- `src/modules/admin/pages/users/index.ts`
- `src/modules/auth/pages/LoginPage.tsx`
- `src/modules/catalog/pages/catalog/ContractCatalogPage.tsx`
- `src/modules/catalog/pages/catalog/DrugCatalogPage.tsx`
- `src/modules/catalog/pages/catalog/FacilityCatalogPage.tsx`
- `src/modules/catalog/pages/catalog/NonDrugCatalogPage.tsx`
- `src/modules/catalog/pages/catalog/SupplierCatalogPage.tsx`
- `src/modules/distribution/components/IndentIssuePrintView.tsx`
- `src/modules/distribution/pages/distribution/IndentEntitlementPage.tsx`
- `src/modules/distribution/pages/distribution/IndentRequestDetailPage.tsx`
- `src/modules/distribution/pages/distribution/IndentRequestFormPage.tsx`
- `src/modules/distribution/pages/distribution/IndentRequestListPage.tsx`
- `src/modules/distribution/pages/distribution/IssueCounterPage.tsx`
- `src/modules/distribution/pages/distribution/TransferRequestListPage.tsx`
- `src/modules/distribution/pages/distribution/index.ts`
- `src/modules/financial/pages/financial/APPLAllocationPage.tsx`
- `src/modules/financial/pages/financial/BudgetOverviewPage.tsx`
- `src/modules/financial/pages/financial/CCAllocationPage.tsx`
- `src/modules/financial/pages/financial/HospitalBudgetForecastPage.tsx`
- `src/modules/financial/pages/financial/LPAllocationPage.tsx`
- `src/modules/financial/pages/financial/WarrantPage.tsx`
- `src/modules/financial/pages/financial/index.ts`
- `src/modules/hospital-admin/pages/memos/MemoListPage.tsx`
- `src/modules/hospital-admin/pages/sensitiveData/SensitiveDataRequestDetailPage.tsx`
- `src/modules/hospital-admin/pages/sensitiveData/SensitiveDataRequestListPage.tsx`
- `src/modules/hub/components/AdminBroadcastModal.tsx`
- `src/modules/hub/components/SystemBroadcastBanner.tsx`
- `src/modules/hub/components/SystemUpdateLogModal.tsx`
- `src/modules/hub/pages/ModuleHubPage.tsx`
- `src/modules/hub/pages/gallery/AlbumDetailPage.tsx`
- `src/modules/hub/pages/gallery/MyGalleryPage.tsx`
- `src/modules/hub/pages/index.ts`
- `src/modules/hub/pages/modules/AdminSubMenu.tsx`
- `src/modules/hub/pages/modules/BorangSubMenu.tsx`
- `src/modules/hub/pages/modules/CutiSubMenu.tsx`
- `src/modules/hub/pages/modules/CylinderSubMenu.tsx`
- `src/modules/hub/pages/modules/FileSubMenu.tsx`
- `src/modules/hub/pages/modules/FormulariSubMenu.tsx`
- `src/modules/hub/pages/modules/InventorySubMenu.tsx`
- `src/modules/hub/pages/modules/KunciSubMenu.tsx`
- `src/modules/hub/pages/modules/PorterSubMenu.tsx`
- `src/modules/hub/pages/modules/StaffSubMenu.tsx`
- `src/modules/hub/pages/modules/SuhuSubMenu.tsx`
- `src/modules/hub/pages/modules/SuratSubMenu.tsx`
- `src/modules/hub/pages/modules/TempahanSubMenu.tsx`
- `src/modules/hub/pages/modules/TimeOffSubMenu.tsx`
- `src/modules/hub/pages/modules/TransporterSubMenu.tsx`
- `src/modules/hub/pages/modules/WarrantSubMenu.tsx`
- `src/modules/hub/pages/modules/admin/AdminApprovalsTab.tsx`
- `src/modules/hub/pages/modules/admin/AdminDepartmentsTab.tsx`
- `src/modules/hub/pages/modules/admin/AdminRbacTab.tsx`
- `src/modules/hub/pages/modules/admin/AdminSystemLogsTab.tsx`
- `src/modules/hub/pages/modules/admin/AdminUsersTab.tsx`
- `src/modules/inventory/components/FacilityDrugMobileCard.tsx`
- `src/modules/inventory/components/FacilityNonDrugMobileCard.tsx`
- `src/modules/inventory/components/StoreLocationSelector.tsx`
- `src/modules/inventory/pages/inventory/APPLInventoryPage.tsx`
- `src/modules/inventory/pages/inventory/DrugInventoryPage.tsx`
- `src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx`
- `src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage.tsx`
- `src/modules/inventory/pages/inventory/InventoryOverviewPage.tsx`
- `src/modules/inventory/pages/inventory/InventoryReportPage.tsx`
- `src/modules/inventory/pages/inventory/KewPs4LedgerPage.tsx`
- `src/modules/inventory/pages/inventory/NearExpiryPage.tsx`
- `src/modules/inventory/pages/inventory/NonDrugInventoryPage.tsx`
- `src/modules/inventory/pages/inventory/SlowMovingPage.tsx`
- `src/modules/inventory/pages/inventory/StockMovementScannerPage.tsx`
- `src/modules/inventory/pages/inventory/StoreLocationManagementPage.tsx`
- `src/modules/inventory/pages/inventory/index.ts`
- `src/modules/maintenance/pages/maintenance/StockLocationPage.tsx`
- `src/modules/maintenance/pages/maintenance/StockVerificationPage.tsx`
- `src/modules/maintenance/pages/maintenance/UnitCatalogPage.tsx`
- `src/modules/maintenance/pages/maintenance/index.ts`
- `src/modules/mycrossborder/pages/CrossborderCreatePage.tsx`
- `src/modules/mycrossborder/pages/CrossborderDashboardPage.tsx`
- `src/modules/mycrossborder/pages/CrossborderDetailPage.tsx`
- `src/modules/mycrossborder/pages/CrossborderLogPage.tsx`
- `src/modules/mycylinder/components/CylinderQrTag.tsx`
- `src/modules/mycylinder/pages/oxygen/CylinderKewPs4LedgerPage.tsx`
- `src/modules/mycylinder/pages/oxygen/CylinderMaintenancePage.tsx`
- `src/modules/mycylinder/pages/oxygen/CylinderReportPage.tsx`
- `src/modules/mycylinder/pages/oxygen/OxygenAnalytics.tsx`
- `src/modules/mycylinder/pages/oxygen/OxygenDashboardPage.tsx`
- `src/modules/mycylinder/pages/oxygen/index.ts`
- `src/modules/myformulari/components/AddEditPaediatricProtocolModal.tsx`
- `src/modules/myformulari/components/AddPatientQuotaModal.tsx`
- `src/modules/myformulari/components/AddQuotaDrugModal.tsx`
- `src/modules/myformulari/components/AddStockDisruptionModal.tsx`
- `src/modules/myformulari/components/AntidoteDetailModal.tsx`
- `src/modules/myformulari/components/AntimicrobialTable.tsx`
- `src/modules/myformulari/components/ArtemetherScheduleCalculator.tsx`
- `src/modules/myformulari/components/DilutionCard.tsx`
- `src/modules/myformulari/components/DrugBadge.tsx`
- `src/modules/myformulari/components/DrugCard.tsx`
- `src/modules/myformulari/components/DrugInteractionModal.tsx`
- `src/modules/myformulari/components/EditQuotaDrugModal.tsx`
- `src/modules/myformulari/components/InventoryDrugPickerModal.tsx`
- `src/modules/myformulari/components/NAGCategoryDirectory.tsx`
- `src/modules/myformulari/components/NAGClinicalMonograph.tsx`
- `src/modules/myformulari/components/NAGMasterSidebar.tsx`
- `src/modules/myformulari/components/NAGSyncManagerModal.tsx`
- `src/modules/myformulari/components/PRNHotlineCard.tsx`
- `src/modules/myformulari/components/PaediatricDoseCalculatorModal.tsx`
- `src/modules/myformulari/components/PatientQuotaDrawer.tsx`
- `src/modules/myformulari/components/QuotaDispenseHistoryModal.tsx`
- `src/modules/myformulari/components/RecordQuotaDispenseModal.tsx`
- `src/modules/myformulari/components/ShelfLifeWidget.tsx`
- `src/modules/myformulari/pages/AntidoteProtocolPage.tsx`
- `src/modules/myformulari/pages/AntimicrobialGuidelinePage.tsx`
- `src/modules/myformulari/pages/DilutionProtocolPage.tsx`
- `src/modules/myformulari/pages/DrugAlternativesPage.tsx`
- `src/modules/myformulari/pages/DrugDetailPage.tsx`
- `src/modules/myformulari/pages/DrugQuotaPage.tsx`
- `src/modules/myformulari/pages/FormulariDashboardPage.tsx`
- `src/modules/myformulari/pages/HamListPage.tsx`
- `src/modules/myformulari/pages/HospitalLawasFormulariPage.tsx`
- `src/modules/myformulari/pages/LasaListPage.tsx`
- `src/modules/myformulari/pages/PaediatricCataloguePage.tsx`
- `src/modules/mykunci/pages/KunciAuditPage.tsx`
- `src/modules/mykunci/pages/KunciDashboardPage.tsx`
- `src/modules/mykunci/pages/KunciLogPage.tsx`
- `src/modules/mykunci/pages/KunciPolicyPage.tsx`
- `src/modules/mykunci/pages/KunciRegistryPage.tsx`
- `src/modules/mymsds/components/GhsPictogram.tsx`
- `src/modules/mymsds/components/MsdsChemicalCard.tsx`
- `src/modules/mymsds/components/MsdsDetailModal.tsx`
- `src/modules/mymsds/pages/MyMsdsDashboardPage.tsx`
- `src/modules/myperolehan/components/AddOrEditPerihalItemModal.tsx`
- `src/modules/myperolehan/components/AddWarrantModal.tsx`
- `src/modules/myperolehan/components/BudgetSummaryCards.tsx`
- `src/modules/myperolehan/components/CreateAdminPOModal.tsx`
- `src/modules/myperolehan/components/RecordPaymentModal.tsx`
- `src/modules/myperolehan/pages/MyPerolehanDashboard.tsx`
- `src/modules/myperolehan/pages/tabs/PengurusanBudgetTab.tsx`
- `src/modules/myperolehan/pages/tabs/PerihalSuppliersTab.tsx`
- `src/modules/myperolehan/pages/tabs/PerolehanOverviewTab.tsx`
- `src/modules/myperolehan/pages/tabs/PurchaseOrdersTab.tsx`
- `src/modules/myperolehan/pages/tabs/ReceivingPaymentsTab.tsx`
- `src/modules/myphis/pages/MyPhisDashboardPage.tsx`
- `src/modules/myporter/components/HandoverVerificationModal.tsx`
- `src/modules/myporter/components/PorterAudioAlert.ts`
- `src/modules/myporter/components/PorterRadarAlertModal.tsx`
- `src/modules/myporter/pages/PorterDashboardPage.tsx`
- `src/modules/myporter/pages/PorterDriverPanelPage.tsx`
- `src/modules/myporter/pages/PorterManagerDispatchPage.tsx`
- `src/modules/myporter/pages/PorterMyRequestsPage.tsx`
- `src/modules/myporter/pages/PorterReceiverPanelPage.tsx`
- `src/modules/myporter/pages/PorterReportsPage.tsx`
- `src/modules/myporter/pages/PorterRequestWizardPage.tsx`
- `src/modules/myporter/pages/PorterRoleAssignmentPage.tsx`
- `src/modules/myporter/pages/PorterRosterPage.tsx`
- `src/modules/myprepacking/components/GalenicalPreparationMonographModal.tsx`
- `src/modules/myprepacking/components/PrepackBatchCreateModal.tsx`
- `src/modules/myprepacking/components/PrepackBringForwardModal.tsx`
- `src/modules/myprepacking/components/PrepackCheckFoundModal.tsx`
- `src/modules/myprepacking/components/PrepackDrugPickerModal.tsx`
- `src/modules/myprepacking/components/PrepackItemModal.tsx`
- `src/modules/myprepacking/components/PrepackLabelPrintModal.tsx`
- `src/modules/myprepacking/components/PrepackStoreVerificationModal.tsx`
- `src/modules/myprepacking/components/PrepackUsageModal.tsx`
- `src/modules/myprepacking/components/RecentBatchesPanel.tsx`
- `src/modules/myprepacking/components/StoreToCounterTransferModal.tsx`
- `src/modules/myprepacking/components/formulationEditor/FormulationAuditHistoryTab.tsx`
- `src/modules/myprepacking/components/formulationEditor/FormulationGeneralTab.tsx`
- `src/modules/myprepacking/components/formulationEditor/FormulationIngredientsTab.tsx`
- `src/modules/myprepacking/components/formulationEditor/FormulationProcedureTab.tsx`
- `src/modules/myprepacking/pages/PrepackBatchListPage.tsx`
- `src/modules/myprepacking/pages/PrepackDashboardPage.tsx`
- `src/modules/myprepacking/pages/PrepackItemListPage.tsx`
- `src/modules/myprepacking/pages/PrepackKewPs4LedgerPage.tsx`
- `src/modules/myprepacking/pages/PrepackLabelStudioPage.tsx`
- `src/modules/myprepacking/pages/PrepackReportsPage.tsx`
- `src/modules/myprepacking/pages/PrepackStockMovementPage.tsx`
- `src/modules/myprepacking/pages/PrepackUsageHistoryPage.tsx`
- `src/modules/mypriviledging/components/CredentialingCriteriaView.tsx`
- `src/modules/mypriviledging/components/PriviledgingCertificatePrint.tsx`
- `src/modules/mypriviledging/components/PriviledgingHeader.tsx`
- `src/modules/mypriviledging/components/ProcedureCatalogExplorer.tsx`
- `src/modules/mypriviledging/components/StaffCompetencyMatrix.tsx`
- `src/modules/mypriviledging/components/SubmissionsTable.tsx`
- `src/modules/mypriviledging/components/SubmitProcedureModal.tsx`
- `src/modules/mypriviledging/pages/AdminReviewQueuePage.tsx`
- `src/modules/mypriviledging/pages/CredentialingCriteriaPage.tsx`
- `src/modules/mypriviledging/pages/MySubmissionsPage.tsx`
- `src/modules/mypriviledging/pages/PriviledgingDashboardPage.tsx`
- `src/modules/mypriviledging/pages/ProcedureCatalogPage.tsx`
- `src/modules/mystaff/components/AuditLogDrawer.tsx`
- `src/modules/mystaff/components/AuditReasonModal.tsx`
- `src/modules/mystaff/pages/StaffCalendarPage.tsx`
- `src/modules/mystaff/pages/StaffDashboardPage.tsx`
- `src/modules/mystaff/pages/StaffDeadlinePage.tsx`
- `src/modules/mystaff/pages/StaffHodPage.tsx`
- `src/modules/mystaff/pages/StaffLeaveApplyPage.tsx`
- `src/modules/mystaff/pages/StaffLeavePage.tsx`
- `src/modules/mystaff/pages/StaffMovementPage.tsx`
- `src/modules/mystaff/pages/StaffOrgChartPage.tsx`
- `src/modules/mystaff/pages/StaffReminderPage.tsx`
- `src/modules/mysuhu/pages/AdminSetupPage.tsx`
- `src/modules/mysuhu/pages/BreachLogPage.tsx`
- `src/modules/mysuhu/pages/DepartmentSuhuPage.tsx`
- `src/modules/mysuhu/pages/SuhuDashboardPage.tsx`
- `src/modules/mysuhu/pages/UnitDetailPage.tsx`
- `src/modules/mytempahan/components/BookingDetailDrawer.tsx`
- `src/modules/mytempahan/pages/TempahanApprovalQueuePage.tsx`
- `src/modules/mytempahan/pages/TempahanCalendarPage.tsx`
- `src/modules/mytempahan/pages/TempahanDashboardPage.tsx`
- `src/modules/mytempahan/pages/TempahanMyBookingsPage.tsx`
- `src/modules/mytempahan/pages/TempahanReportsPage.tsx`
- `src/modules/mytempahan/pages/TempahanRequestFormPage.tsx`
- `src/modules/mytempahan/pages/TempahanRoomRegistryPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffClaimPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffDashboardPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffHistoryPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffHodPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffMyClaimsPage.tsx`
- `src/modules/mytimeoff/pages/TimeOffRedeemPage.tsx`
- `src/modules/mytransporter/pages/TransporterAdminApprovalPage.tsx`
- `src/modules/mytransporter/pages/TransporterAvailabilityPage.tsx`
- `src/modules/mytransporter/pages/TransporterDashboardPage.tsx`
- `src/modules/mytransporter/pages/TransporterDriverMonitorPage.tsx`
- `src/modules/mytransporter/pages/TransporterDriverPanelPage.tsx`
- `src/modules/mytransporter/pages/TransporterMyRequestsPage.tsx`
- `src/modules/mytransporter/pages/TransporterReportsPage.tsx`
- `src/modules/mytransporter/pages/TransporterRequestFormPage.tsx`
- `src/modules/mytransporter/pages/TransporterRoleAssignmentPage.tsx`
- `src/modules/mytransporter/pages/TransporterVehicleIssuesPage.tsx`
- `src/modules/mytransporter/pages/TransporterVehicleMovementPage.tsx`
- `src/modules/mytransporter/pages/TransporterVehicleRegistryPage.tsx`
- `src/modules/mywarrant/pages/dashboard/PharmacyLogisticsDashboard.tsx`
- `src/modules/mywarrant/pages/dashboard/index.ts`
- `src/modules/mywarrant/pages/mywarrant/MyWarrantDashboard.tsx`
- `src/modules/procurement/pages/procurement/APPLPenaltyDetailPage.tsx`
- `src/modules/procurement/pages/procurement/CCPenaltyDetailPage.tsx`
- `src/modules/procurement/pages/procurement/CreditNoteAuditPage.tsx`
- `src/modules/procurement/pages/procurement/ExcelUploadModal.tsx`
- `src/modules/procurement/pages/procurement/GoodsReceivingForm.tsx`
- `src/modules/procurement/pages/procurement/LPOListPage.tsx`
- `src/modules/procurement/pages/procurement/OrderTrackingPage.tsx`
- `src/modules/procurement/pages/procurement/PaymentPage.tsx`
- `src/modules/procurement/pages/procurement/PenaltyDetailPage.tsx`
- `src/modules/procurement/pages/procurement/PenaltyPage.tsx`
- `src/modules/procurement/pages/procurement/PurchaseOrderCreatePage.tsx`
- `src/modules/procurement/pages/procurement/PurchaseOrderDetailPage.tsx`
- `src/modules/procurement/pages/procurement/PurchaseOrderDetailView.tsx`
- `src/modules/procurement/pages/procurement/PurchaseOrderListPage.tsx`
- `src/modules/procurement/pages/procurement/ReceivingPage.tsx`
- `src/modules/procurement/pages/procurement/SupplierPerformancePage.tsx`
- `src/modules/procurement/pages/procurement/index.ts`
- `src/modules/profile/components/EditProfileModal.tsx`
- `src/modules/profile/components/ProfileChangeLogCard.tsx`
- `src/modules/profile/components/ProfilePhotoModal.tsx`
- `src/modules/profile/pages/profile/ProfilePage.tsx`
- `src/modules/reports/pages/reports/FinancialReportPage.tsx`
- `src/modules/reports/pages/reports/ProcurementReportPage.tsx`
- `src/modules/reports/pages/reports/ReportsPage.tsx`
- `src/modules/reports/pages/reports/index.ts`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/dashboard/HospitalAdminDashboard.tsx`
- `src/pages/dashboard/SystemAdminDashboard.tsx`
- `src/pages/error/UnauthorizedPage.tsx`
- `src/pages/pharmacy/index.ts`
- `src/routes/routes.tsx`
- `src/shared/components/forms/AccessRequestForm.tsx`
- `src/shared/components/forms/ChangePasswordForm.tsx`
- `src/shared/components/forms/DepartmentForm.tsx`
- `src/shared/components/forms/HospitalAdminForm.tsx`
- `src/shared/components/forms/LoginForm.tsx`
- `src/shared/components/forms/UserForm.tsx`
- `src/shared/components/layout/Header.tsx`
- `src/shared/components/layout/MainLayout.tsx`
- `src/shared/components/layout/Sidebar.tsx`
- `src/shared/components/mobile/MobileModuleNavList.tsx`
- `src/shared/components/mobile/MoreSheet.tsx`
- `src/shared/components/mobile/TabBar.tsx`
- `src/shared/components/ui/ConfirmationDialog.tsx`
- `src/shared/components/ui/DataTable.tsx`
- `src/shared/components/ui/OfflineSyncDrawer.tsx`
- `src/shared/components/ui/PDFUpload.tsx`
- `src/shared/components/ui/button.tsx`
- `src/shared/components/ui/dialog.tsx`
- `src/shared/components/ui/select.tsx`
- `src/shared/components/ui/skeleton.tsx`
- `src/shared/components/ui/table.tsx`
- `src/shared/components/ui/tabs.tsx`

### babyhien — 162 exact paths

- `src/config/systemReleases.ts`
- `src/hooks/usePWAInstall.ts`
- `src/lib/drugCategorizer.ts`
- `src/middleware.ts`
- `src/modules/admin/services/accessRequestManagementService.ts`
- `src/modules/admin/services/accessRequestService.ts`
- `src/modules/admin/services/alertService.ts`
- `src/modules/admin/services/auditLogService.ts`
- `src/modules/admin/services/backupService.ts`
- `src/modules/admin/services/departmentService.ts`
- `src/modules/admin/services/hospitalService.ts`
- `src/modules/admin/services/index.ts`
- `src/modules/admin/services/moduleService.ts`
- `src/modules/admin/services/monitoringService.ts`
- `src/modules/admin/services/roleService.ts`
- `src/modules/admin/services/systemAdminFixService.ts`
- `src/modules/admin/services/systemAdminService.ts`
- `src/modules/admin/services/systemLogService.ts`
- `src/modules/admin/services/systemSettingsService.ts`
- `src/modules/admin/services/userAccountFixService.ts`
- `src/modules/admin/services/userService.ts`
- `src/modules/auth/index.ts`
- `src/modules/auth/services/authService.ts`
- `src/modules/auth/services/index.ts`
- `src/modules/catalog/services/catalogService.ts`
- `src/modules/catalog/services/drugCatalogService.ts`
- `src/modules/catalog/services/nonDrugCatalogService.ts`
- `src/modules/distribution/services/distributionService.ts`
- `src/modules/distribution/services/indentService.ts`
- `src/modules/financial/services/applAllocationService.ts`
- `src/modules/financial/services/applExportService.ts`
- `src/modules/financial/services/budgetEngine.ts`
- `src/modules/financial/services/budgetService.ts`
- `src/modules/financial/services/ccAllocationService.ts`
- `src/modules/financial/services/ccExportService.ts`
- `src/modules/financial/services/hospitalBudgetService.ts`
- `src/modules/financial/services/lpAllocationService.ts`
- `src/modules/financial/services/warrantExportService.ts`
- `src/modules/financial/services/warrantService.ts`
- `src/modules/hospital-admin/services/hospitalAdminService.ts`
- `src/modules/hospital-admin/services/hospitalBackupService.ts`
- `src/modules/hospital-admin/services/hospitalHealthService.ts`
- `src/modules/hospital-admin/services/hospitalLogService.ts`
- `src/modules/hospital-admin/services/memoService.ts`
- `src/modules/hospital-admin/services/patientDatabaseMonitorService.ts`
- `src/modules/hospital-admin/services/sensitiveDataRequestService.ts`
- `src/modules/inventory/context/InventoryStoreContext.tsx`
- `src/modules/inventory/services/inventoryService.ts`
- `src/modules/maintenance/services/maintenanceService.ts`
- `src/modules/maintenance/services/unitCatalogItemService.ts`
- `src/modules/maintenance/services/unitCatalogService.ts`
- `src/modules/mycrossborder/services/crossborderPdfService.ts`
- `src/modules/mycrossborder/services/crossborderService.ts`
- `src/modules/mycylinder/hooks/useCylinderOffline.ts`
- `src/modules/mycylinder/services/cylinderDispatchPdfService.ts`
- `src/modules/mycylinder/services/cylinderDispatchService.ts`
- `src/modules/mycylinder/services/cylinderKewPs4Service.ts`
- `src/modules/mycylinder/services/cylinderMaintenanceService.ts`
- `src/modules/mycylinder/services/cylinderOfflineDB.ts`
- `src/modules/mycylinder/services/cylinderOfflineService.ts`
- `src/modules/mycylinder/services/cylinderReportService.ts`
- `src/modules/mycylinder/services/cylinderSyncEngine.ts`
- `src/modules/mycylinder/services/oxygenPdfService.ts`
- `src/modules/mycylinder/services/oxygenService.ts`
- `src/modules/myformulari/data/antimicrobialData.ts`
- `src/modules/myformulari/data/formulariDatabase.ts`
- `src/modules/myformulari/services/drugQuotaService.ts`
- `src/modules/myformulari/services/formulariService.ts`
- `src/modules/myformulari/services/fukkmMatcher.ts`
- `src/modules/myformulari/services/nagService.ts`
- `src/modules/myformulari/services/paediatricCataloguePdfService.ts`
- `src/modules/myformulari/services/paediatricCatalogueService.ts`
- `src/modules/myformulari/services/paediatricDoseService.ts`
- `src/modules/myformulari/services/patientQuotaService.ts`
- `src/modules/myformulari/services/stockDisruptionService.ts`
- `src/modules/mykunci/services/kunciService.ts`
- `src/modules/myperolehan/services/perolehanAdminService.ts`
- `src/modules/myphis/services/myphisService.ts`
- `src/modules/myporter/services/porterRosterPdfService.ts`
- `src/modules/myporter/services/porterService.ts`
- `src/modules/myprepacking/data/kkmGalenicalMonographs.ts`
- `src/modules/myprepacking/services/prepackKewPs4Service.ts`
- `src/modules/myprepacking/services/prepackService.ts`
- `src/modules/myprepacking/types/prepack.ts`
- `src/modules/mypriviledging/data/defaultPriviledgingData.ts`
- `src/modules/mypriviledging/services/priviledgingService.ts`
- `src/modules/mystaff/services/staffOrgChartService.ts`
- `src/modules/mystaff/services/staffService.ts`
- `src/modules/mysuhu/services/suhuReportService.ts`
- `src/modules/mysuhu/services/suhuService.ts`
- `src/modules/mytempahan/services/tempahanExportService.ts`
- `src/modules/mytempahan/services/tempahanPdfService.ts`
- `src/modules/mytempahan/services/tempahanService.ts`
- `src/modules/mytempahan/services/tempahanValidation.ts`
- `src/modules/mytimeoff/services/toilService.ts`
- `src/modules/mytransporter/services/transporterCrossborderPdf.ts`
- `src/modules/mytransporter/services/transporterService.ts`
- `src/modules/mywarrant/services/pharmacyDashboardService.ts`
- `src/modules/procurement/services/applPenaltyPdfService.ts`
- `src/modules/procurement/services/ccPenaltyPdfService.ts`
- `src/modules/procurement/services/creditNoteService.ts`
- `src/modules/procurement/services/excelUploadService.ts`
- `src/modules/procurement/services/grPdfService.ts`
- `src/modules/procurement/services/lpoService.ts`
- `src/modules/procurement/services/orderTrackingReportPdfService.ts`
- `src/modules/procurement/services/orderTrackingService.ts`
- `src/modules/procurement/services/paymentExcelParser.ts`
- `src/modules/procurement/services/penaltyService.ts`
- `src/modules/procurement/services/poPdfService.ts`
- `src/modules/procurement/services/procurementService.ts`
- `src/modules/procurement/services/receivingService.ts`
- `src/modules/profile/services/profileService.ts`
- `src/modules/reports/services/financialReportPdfService.ts`
- `src/modules/reports/services/financialReportService.ts`
- `src/modules/reports/services/pdfMergeService.ts`
- `src/modules/reports/services/procurementReportPdfService.ts`
- `src/modules/reports/services/procurementReportService.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/services/aiService.ts`
- `src/services/baseService.ts`
- `src/services/emailService.ts`
- `src/services/facilityService.ts`
- `src/services/offlineAdapter.ts`
- `src/services/offlineFetch.ts`
- `src/services/offlinePreloader.ts`
- `src/services/offlineQueue.ts`
- `src/services/offlineSyncService.ts`
- `src/services/pharmacy/facilityDrugInventoryService.ts`
- `src/services/pharmacy/facilityInventoryExcelService.ts`
- `src/services/pharmacy/facilityNonDrugInventoryService.ts`
- `src/services/pharmacy/formulariPdfService.ts`
- `src/services/pharmacy/googleSheetsService.ts`
- `src/services/pharmacy/index.ts`
- `src/services/pharmacy/mockData.ts`
- `src/services/pharmacy/pharmacySettingsService.ts`
- `src/services/pharmacy/storeLocationPdfService.ts`
- `src/services/pharmacy/storeLocationService.ts`
- `src/services/pharmacy/storeSubLocationService.ts`
- `src/services/pharmacy/uploadService.ts`
- `src/services/rbacService.ts`
- `src/services/supabase.ts`
- `src/services/systemAnnouncementService.ts`
- `src/services/webSearchService.ts`
- `src/shared/config/mobileTabs.ts`
- `src/shared/config/navigationConfig.ts`
- `src/shared/contexts/LanguageContext.tsx`
- `src/shared/hooks/usePermission.ts`
- `src/shared/lib/passwordUtils.ts`
- `src/shared/lib/pdfParser.ts`
- `src/shared/lib/utils.ts`
- `src/shared/lib/validation.ts`
- `src/shared/lib/validators.ts`
- `src/shared/stores/toastStore.ts`
- `src/shared/types/hospital-admin.ts`
- `src/shared/types/mystaff.ts`
- `src/shared/types/mytimeoff.ts`
- `src/shared/utils/cacheBuster.ts`
- `src/shared/utils/cylinderRbac.ts`
- `src/shared/utils/inventoryRbac.ts`
- `src/shared/utils/itemCodeUtils.ts`
- `src/stores/rbacStore.ts`
- `src/types/pharmacy/index.ts`
