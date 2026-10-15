# H.O.M.E. health review — 13 October 2026

Task: HOME-HEALTH-20261013. Supervisor: Amri. Verdict: **Resolve the priority security and data-integrity findings before feature expansion.** This is a bounded review of the current dirty workspace, not a certification of every module or the deployed system.

Revision: `f1d4918084f4b9da515d055471f21acc1525e243`. The pinned content snapshot in the task manifest includes pre-existing tracked and non-ignored untracked content. Application source, configuration and production data were not changed by this review.

## Priority findings

| Priority | Finding and concrete trigger | Evidence / correction owner |
| --- | --- | --- |
| P1 | The new account administration handler has no caller identity, administrator-role or target-hospital checks. An isolated password-change request without Authorization returned 200 and invoked the privileged stub. If deployed and reachable, a caller accepted by the gateway can reset/delete other accounts. Deployed gateway exposure is unverified. | `supabase/functions/admin-user-ops/index.ts:35`, `:87`, `:107`; BabyHien. Verify actor and operation-specific target scope before privileged calls; preserve actor audit events. |
| P1 | Store-location migration policies explicitly permit anonymous INSERT/UPDATE/DELETE and impose no hospital restriction. Actual deployed policies and table grants were not inspected. | `supabase/migrations/068_create_store_locations_table.sql:35`; BabyHien. Replace policies with trusted role and tenant checks; verify in an isolated database. |
| P1 | Offline table fallback ignores query filters and field selection. A fixture request for H1 with `select=id` returned full H1 and H2 rows. Cache keys are table-only and logout does not clear these caches. This also makes single-item lookups and inventory counts unreliable. | `src/services/offlineFetch.ts:57`, `:177`, `:224`, `:256`; global client wiring in `src/services/supabase.ts:21`; logout at `src/modules/auth/services/authService.ts:512`. BabyHien. Scope cache by authenticated actor/tenant and query semantics; return unavailable when scope cannot be proved. |
| P1 | Offline PATCH/DELETE failures return HTTP 200 with `offline_queued:true`, although this fetch layer persists no queue entry. Isolated reproductions observed zero storage writes. Direct Supabase mutations can therefore appear successful while being lost. Uncached reads also return successful empty results. | `src/services/offlineFetch.ts:270`, `:300`, `:314`; BabyHien. Preserve failure or delegate explicitly to a durable queue with verified acknowledgement. |
| P1 | Ordinary development/build commands run the release generator, which loads local configuration and deletes/updates/inserts announcements in the configured database. Deletion includes content matching `Lawas`. Local configuration contains a server service-key variable, whose value was not displayed. No remote operation was executed in this audit. | `package.json:10`, `vite.config.ts:11`, `scripts/generate_system_releases.cjs:25`, `:548`, `:568`, `:658`; BabyHien. Separate local generation from explicit authorized publishing and make publishing failures visible. |
| P2 | Batch Add keeps selected IDs across catalog searches, but submits only selected objects in the latest response. Selecting A, searching for B, then adding two selections can add only B and clear both. | `src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx:235` and `FacilityNonDrugInventoryPage.tsx:477`; Babyluong. Keep selected objects or reconcile selection when search scope changes. Isolated expression verified; browser unverified. |

## Additional source-supported findings

- Hospital-admin provisioning rolls back the requested UUID rather than the actual created Auth UUID, leaving an orphan account after profile insertion failure. Existence checks hide errors and search only one Auth-user page. The shared-client signup fallback can replace the administrator's session when signup returns a session. See backend B3–B5.
- Prepacking masks lookup failures; inventory occupancy uses fixed Lawas store IDs for every hospital. Non-drug location detail/export/occupancy reads a hospital-wide cache while scoped inventory writes a store-specific cache. See backend B6–B8. These need isolated inventory fixtures and explicit service contracts.
- Mobile facility cards expose editing through a click-only div; keyboard users cannot reach edit at the mobile breakpoint. Prepacking search lacks protection against late older responses. See frontend F2–F3; rendered verification remains outstanding.

Detailed reports: [backend](home-health-20261013.backend.md), [frontend](home-health-20261013.frontend.md), [QA](../test-reports/2026-10-13-home-health.md).

## Verification

- Lint: **FAIL**, 5,122 errors and 232 warnings. This is an existing workspace-wide backlog, not proof that all errors were introduced by recent changes. Full diagnostics are in the QA log.
- Changed-file rules: **FAIL**, four blocking `transition-all` uses in the two facility inventory pages and 172 warnings. Many warnings concern print-template colors and need contextual review.
- Agent validation and required boundary gate: **FAIL**, `UNASSIGNED_POLICY_PATH path=next.config.ts`, a task-start deleted configuration file still included by the checker. This is a governance blocker, not a reported runtime application crash.
- Governance suite: **BLOCKED by runtime permissions**, 16 passing cases and 47 fixture-setup failures out of 63. Git could not write temporary fixture `.git/config`. These failures do not establish failing product assertions.
- Five isolated security/data checks reproduced defects with stub clients/storage and no network calls. Reproduction execution succeeded; the tested behavior failed expectations.
- Typecheck: **PASS**, compiler exited 0. Safe bundler build: **PASS**, exited 0 after 4m 43s. One roughly 11.75 MB uncompressed formulary chunk produced a bundle-size warning. The normal build was not executed because it publishes database changes; the isolated bundler check removes that hook and uses temporary output. This verifies compilation and bundling, not release publishing or product behavior.
- Browser rendering, authenticated workflows, live RLS/grants, deployment status, audit persistence and production exploitability: **UNVERIFIED**. No production records or credentials were read or changed.

## Scope and next action

Specialists wrote only their assigned reports. A supplemental baseline hash comparison found no unexpected source changes; it does not replace the failed required boundary gate. No feature correction is accepted by this audit. Amri recommends prioritizing the P1 backend findings, then inventory correctness, then frontend/accessibility and check backlog. A correction task needs explicit paths, isolated regression cases, and trusted role/tenant policy verification before release.
