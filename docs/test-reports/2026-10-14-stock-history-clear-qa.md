# Stock-history clear QA — 2026-10-14

Task: `HOME-FIXES-20261013`, Phase 6q. Repository revision: `f1d4918084f4b9da515d055471f21acc1525e243`.

Migration SHA-256: `5ec4f850a2d4bb441d693cd82ae1434e64600cd82ceef3b903e2d70f8b89a203`. Initial service-test SHA-256: `3f9085187e6485e27e32d058164b459041b3a405f0c4d7d5e8b0dd329e8b7ab4`.

The focused integration suite used Node v24.20.0 and the pre-existing local PGlite runtime under the isolated temporary test cache. It loaded fixture schema plus repository migrations 068, 012, 089 and 090 in an in-memory database. No remote database, production data, external requests or product-source edits were involved.

| Acceptance criterion | Status | Evidence |
| --- | --- | --- |
| Hospital admin can clear only the selected hospital/item | **PASS** | PGlite integration: returned counts were 1 transaction, 1 batch, 1 drug row and 1 non-drug row; the other item and hospital remained unchanged. |
| Active inventory permission actor can clear its own hospital | **PASS** | PGlite integration: actor with both inventory `delete` and `edit` grants cleared its item; foreign hospital rows and stock stayed intact. |
| Ordinary, inactive, cross-tenant, anonymous and missing actors are denied | **PASS** | PGlite integration: ordinary and inactive H1 users plus an H2 hospital admin were rejected for clearing H1; missing identity raised `Authenticated actor required`; anon could not execute the RPC. |
| Direct history deletion is denied | **PASS** | PGlite integration: authenticated admin direct `DELETE ... RETURNING` against transactions and batches returned zero rows; both history sets remained. |
| Transaction, batch and facility changes produce audit rows | **PASS** | PGlite integration: successful clear wrote four rows across transaction, batch, drug-facility and non-drug-facility entities, with two `DELETE` and two `UPDATE` actions. |
| Failure rolls back all mutations and audit rows | **PASS** | PGlite integration: injected audit-table `CHECK` failure rejected the RPC; transaction/batch counts, both facility stock tables and audit count matched pre-call values. |
| Isolated service calls use the atomic RPC contract and propagate errors | **PASS** | `node --test tests/home-inventory-clear-scope.test.cjs`: 6 passed, 0 failed, 0 skipped. Checks all-items/null and item-scoped arguments, returned counts, invalid inputs, unconfigured client, RPC error, and malformed count response. |

Migration integration command: `node --test tests/home-stock-history-clear.test.cjs` — 5 passed, 0 failed, 0 skipped (25.68 s).

Current-source service rerun reported by Amri: `node --test tests/home-inventory-clear-scope.test.cjs` — **6 passed, 0 failed, 0 skipped**. `inventoryService.ts` SHA-256 `4e88517ba51402524970dc7277060611737039f4d1fe0fbf4f1eba8d32ff58cb` was stable before and after that run. The earlier 6/6 service run at SHA-256 `3f9085187e6485e27e32d058164b459041b3a405f0c4d7d5e8b0dd329e8b7ab4` remains recorded above as the initial run; no duration was provided for Amri's rerun.

Scanner follow-up: `node --test --test-timeout=30000 tests/home-oxygen-scanner.spec.cjs` — 4 passed, 0 failed, 0 skipped. Browser Chromium 155.0.8059.40; viewport 1280×900; light theme; motion `no-preference`; no external requests. Current scanner-source SHA-256: `c1816c1970748e7a4a306e83953288810853319548374bbe2313820e61e66c95`. Detailed behavior evidence is in [the scanner QA report](2026-10-14-oxygen-scanner-qa.md).

The first fixture run caught a missing isolated `store_sub_locations` prerequisite, then assertion mismatches in fixture item IDs and role visibility; these were corrected in QA fixture/assertions only. The final focused runs pass. The migration scenario is an isolated PGlite verification, not a remote deployment or production database check.
