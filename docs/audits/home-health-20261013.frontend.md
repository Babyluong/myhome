# HOME-HEALTH-20261013 — Babyluong frontend review

Status: **FAIL — concrete frontend defects identified; source review completed.** Report to: Amri. Acceptance and task closure remain Amri-owned.

Baseline revision: `f1d4918084f4b9da515d055471f21acc1525e243`. Content snapshot: `docs/audits/home-health-20261013.baseline.json`; pinned SHA-256: `22cdb0a62af358076e355f7213a665bc0e004f17647f2b84a0af155d80f1e1bc`. Findings describe the existing dirty workspace, not only committed HEAD. No feature, service, auth, or test files were edited.

## Findings

### F1 — P2: Batch Add silently drops selections outside the latest catalog response

Owner for correction: Babyluong. Evidence: `src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx:235`, `:307`, `:329`, `:1573`, `:1590`, `:1812`; corresponding non-drug flow at `src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage.tsx:477`, `:549`, `:571`, `:1794`, `:1811`, `:2044`.

Trigger: select item A, change search or scheme so the server returns a different catalog subset, then select B and click “Tambah 2 Item”. The selected-ID array retains A and B, but Add filters only the current `catalogDrugs`/`catalogItems` array. It submits B only, then clears all selection and closes the drawer. If none of the selected IDs remains in the latest response, Add silently returns while the enabled button still advertises selected items.

Check: source tracing through the filter setters, debounced response replacement, selection toggle and Add handler. A read-only Node reproduction of the exact selection expression returned `{"displayedSelected":2,"submitted":["cc-b"],"omitted":["appl-a"]}`. This is an isolated expression check, not a browser or database test. The selection defect exists in the current flow; the drawer redesign makes batch Add the sole footer action but is not asserted to have originally introduced the expression.

Correction: retain selected item objects across responses or deliberately reconcile/clear selections when scope changes; ensure the displayed selected count equals the complete submission. QA should verify cross-search and cross-scheme selection with isolated fixtures.

### F2 — P2: Mobile inventory cards cannot open their edit action from the keyboard

Owner for correction: Babyluong. Evidence: `src/modules/inventory/components/FacilityDrugMobileCard.tsx:29`, `:30`, `:54`; `src/modules/inventory/components/FacilityNonDrugMobileCard.tsx:26`, `:27`, `:48`. Mobile rendering replaces the table at `src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx:1331`, `:1352`, `:1363` and `src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage.tsx:1559`, `:1580`, `:1591`.

Trigger: use keyboard navigation below the `md` breakpoint with at least one facility item. The edit action is a click-only outer `div` without `tabIndex`, keyboard handler, or a separate edit button. The sole tabbable card control deletes the item; the desktop table is hidden. The visible “Kemas kini stok & lokasi” hint is a span, so keyboard users cannot reach that action through the card.

Check: complete card source and responsive page branch inspection. Rendered keyboard evidence is **unverified**; the missing interactive control is source-supported. Correction: provide a named native edit button/link and keep delete as a separate sibling action; preserve visible focus and logical tab order. QA should verify Enter/Space, focus visibility and drawer focus at a mobile viewport.

### F3 — P2: Prepacking search can replace newer results with an older response

Owner for correction: Babyluong (request lifecycle and displayed state); retain BabyHien's search contract. Evidence: `src/modules/myprepacking/components/PrepackDrugPickerModal.tsx:41-51`, `:54-67`. Existing caller: `src/modules/myprepacking/components/PrepackItemModal.tsx:479`.

Trigger: open the picker, type search A, then search B while A is still pending; let B complete before A. Every completion unconditionally calls `setDrugs` and `setLoading(false)`. Effect cleanup cancels only a not-yet-fired debounce timer, not already-started requests. A's late response therefore displays records for A beneath the visible B search term. Opening also starts both the immediate and debounced fetch. This is an existing search race, not claimed as newly introduced by the store prop addition. The current caller supplies no store override, so a live store-switch scenario is not claimed.

Check: source control-flow inspection; no network request or production read. Browser reproduction remains unverified. Correction: associate results/loading with the current request generation and ignore stale completions; use one initial/search fetch path. QA should verify reversed response ordering with isolated fixtures.

### F4 — P2: Master inventory components violate hook order; current route crash remains unproven

Owner for correction: Babyluong for component hook order; BabyHien retains authorization decisions. First lint instance: `docs/test-reports/2026-10-13-home-health-lint.log:1756`. Source: `src/modules/inventory/pages/inventory/DrugInventoryPage.tsx:47-48` returns Navigate before `useToastStore` at `:52`, `useLanguage` at `:53` and subsequent state/effect hooks. `src/modules/inventory/pages/inventory/NonDrugInventoryPage.tsx:44-45` has the same pattern. Parsing the full lint log's rules-of-hooks file headers identified those two components as the owners of all such diagnostics; no additional component is claimed.

Conditional runtime trigger: keep the component mounted while its `user` changes between a logistics/null state and a non-logistics state. That changes the number of hooks called, causing React's hook-order invariant to fail rather than completing the redirect. The lint failure and conditional control flow are verified; a normal routed auth/loading transition producing that crash is **not verified**. `src/routes/routes.tsx:2380` supplies the same department predicate to ProtectedRoute; `src/routes/ProtectedRoute.tsx:31` blocks initial loading and `:107` checks that predicate before rendering children. This ordinarily prevents/unmounts the affected component on the transition. Thus this review does not assert a reproduced current-route crash or inflate severity based only on lint counts.

Correction: maintain unconditional hook order in the presentation component, coordinating any guard placement with BabyHien. QA should reproduce predicate transitions in an isolated render before characterizing runtime severity. No test or feature fix was made.

## Dependency requests to Amri

- BabyHien should validate `src/modules/inventory/pages/inventory/StoreLocationManagementPage.tsx:107-112`: IPD/LOG selection maps to two hardcoded store UUIDs. New uses at `:327`, `:366`, `:593`, `:760` affect detail, reload, PDF and item listing. This is a source-supported contract concern; tenant/configuration consequences require BabyHien evidence and are not certified by this frontend report.
- BabyHien should assess the non-drug listing/PDF paths at `StoreLocationManagementPage.tsx:375`, `:601`, `:768`, which read the unscoped `facility_nondrug_items_${hospitalId}` localStorage key instead of loading the selected store's inventory. The service's scoped cache key is defined at `src/services/pharmacy/facilityNonDrugInventoryService.ts:66`. Source inspection establishes the mismatch; real tenant data completeness remains unverified.

## Evidence and limitations

- Navigation source/diff review covered the recent route redirect and inventory mobile tab changes. No concrete broken target was established in those changes. This is not exhaustive navigation or authorization acceptance.
- Applied the Babyluong charter, token-efficiency discipline and active design system. No new visual design was selected; the review concerns existing operational interactions.
- Codebase-memory Verify metadata: project `C-Users-60113-Downloads-My-Home-hospital-operation-management-ecosystem`, generation `2026-10-13T03:59:34Z`, ready. Focused symbol search returned all 17 results without pagination. Coverage checked 11 presentation/routing evidence paths; all reported `metadata_changed`, facility pages/cards partial, StoreLocationManagementPage unusable. Findings therefore use current source reads/grep and relevant diffs, not graph absence claims. Only bounded source ranges were reviewed; no exhaustive codebase claim is made.
- Rendered evidence: **NOT AVAILABLE / browser-unverified**. No application session was opened, no production requests issued, and no theme/viewport/motion acceptance recorded. Build/lint/test execution belongs to BabyAaralyn's separate slice and is not claimed here.
- Changed path owned by this slice: `docs/audits/home-health-20261013.frontend.md` only. No feature fixes, tests, stage, commit, deployment or access-policy changes.
- Required boundary check: **FAIL**, command `node scripts/check-agent-boundaries.cjs --task docs/audits/home-health-20261013.manifest.json`, exit 1: `UNASSIGNED_POLICY_PATH path=next.config.ts`. That deletion is recorded in the task-start baselinePaths. The failure was reported immediately to Amri; this specialist neither repairs governance nor adopts that path. Handoff boundary acceptance remains blocked pending Amri routing.
- Rework cycles: 0. Token counters unavailable; no quota savings claimed.

Next action: Amri triages these findings, resolves the BabyHien contract requests, and assigns any authorized corrections and isolated QA reproductions. This report does not accept its own work or authorize further implementation.
