# Formulary alternatives browser diagnostic — 2026-10-14

Task: `HOME-FIXES-20261013`, Phase 6s. Revision: `f1d4918084f4b9da515d055471f21acc1525e243`; working tree was dirty. The isolated test compiled the real `DrugAlternativesPage` with its existing fixture modules and mocked service. The focused run was:

```powershell
$env:HOME_QA_FORMULARI_KINDS='alternatives'
node --test --test-name-pattern='Slice B consumers' tests/home-formulari-assets.test.cjs
```

Result: **1 test passed, 0 failed, 0 skipped**; the focused `alternatives/pending` and `alternatives/retry` scenarios both passed. The previously reported tab click timeout did not reproduce.

Browser: Chromium 155.0.8059.40; viewport 1280×900; light theme; motion `no-preference`. `DrugAlternativesPage.tsx` SHA-256: `8441e2c714f2223fc373b8efbbcfdb059a1130e68e0f04891b56a871abe8ab42`. Bundle SHA-256: `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b`. All ten consumer source hashes and full diagnostics are retained in `formulariFocusedRerun` in [browser evidence JSON](2026-10-13-home-fixes-browser.json); `sourceStableDuringBundle` was true. External request count: 0. No page error, page crash, or browser disconnect was observed.

| Scenario | Status | DOM and event evidence |
| --- | --- | --- |
| Alternatives tab activation during pending load | **PASS** | Visible, enabled (`disabled=false`), `pointer-events:auto`; rect x=317.73, y=8, width=248.95, height=33; hit target was the tab label `<span>`. Click completed with `pointerdown → mousedown → pointerup → mouseup → click`. Loading and successful render assertions passed. |
| Alternatives tab activation during retry | **PASS** | Same visible/enabled hit target and rect; all five pointer/mouse/click events observed. Retry recovery assertion passed. |

The focused controlled fixture established successful tab activation and recovery, but the full-file run below reproduced the timeout with the same relevant source and bundle hashes. No assertion was weakened, and no product source was changed.

## Full current-file rerun

Command: `node --test --test-timeout=300000 tests/home-formulari-assets.test.cjs` — **FAIL**, 5 passed, 1 failed, 0 skipped. The failure occurred at `tests/home-formulari-assets.test.cjs:378` in `alternatives/pending`: `locator.click: Timeout 2500ms exceeded`, after Playwright resolved the button and reported waiting for it to be visible, enabled and stable. The test file exited normally after recording this failure; the earlier attempt without the test-runner timeout did not produce a summary and was interrupted, so it is not counted as a completed run.

In the failing run the target snapshot was visible, enabled (`disabled=false`, `aria-disabled=null`), had `pointer-events:auto`, and measured x=317.73, y=8, width=248.95, height=33 both before and after the timeout. `elementFromPoint` returned the target label span. No pointerdown, mousedown, pointerup, mouseup or click events were observed. The page remained connected, with no page errors and zero external requests. This narrows the failure to Playwright's stability/actionability phase; the snapshots do not establish whether an unobserved transient layout/renderer condition caused it.

`DrugAlternativesPage.tsx` SHA-256 remained `8441e2c714f2223fc373b8efbbcfdb059a1130e68e0f04891b56a871abe8ab42`; the built fixture bundle was `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b`, and all consumer sources remained stable during bundling. Machine-readable diagnostics for the full-file failure are in `formulariSliceB` in the [browser evidence JSON](2026-10-13-home-fixes-browser.json). The focused run's pending/retry tab activations passed with the same hashes. Current full-file status is therefore **FAIL/intermittent**, with a successful focused run and a reproduced full-suite actionability failure.

Scanner follow-up after frontend cleanup: `node --test --test-timeout=30000 tests/home-oxygen-scanner.spec.cjs` passed 4/4 with 0 skips. `StockMovementScannerPage.tsx` SHA-256 was `e21e03906ae0d813161eaca6f47c67b450accc64348fececcd0a77fe56657149` before and after the run; browser metadata and criterion evidence are in [scanner QA report](2026-10-14-oxygen-scanner-qa.md).

## Second full-file rerun

Command: `node --test --test-timeout=300000 tests/home-formulari-assets.test.cjs` (unchanged suite and assertions). The run passed the first five non-browser tests, then progressed through alternatives, detail, dashboard, HAM, Lawas, LASA, and paediatric pending/retry setup. At `paediatric/retry`, the same browser click timeout path was reported and the harness began its keyboard check. It then produced no output or final Node test summary for over 60 seconds. Per Amri's instruction, the stalled process was interrupted; the interruption exit code is not a test result. This run is **STALLED / UNVERIFIED**, not counted as a pass or a completed test failure.

The alternatives source SHA-256 before this run was `8441e2c714f2223fc373b8efbbcfdb059a1130e68e0f04891b56a871abe8ab42`; an after-interruption check returned the same hash. No current-run bundle evidence was persisted before the stall. The previous completed full run's bundle hash `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b` and stable-source result remain in the preceding section. No source or test edits were made between the full-file runs.

## Phase 6v actionability timeout adjustment and full-suite rerun — 2026-10-15

The prior traces supported increasing only the alternatives tab locator's actionability timeout from 2500ms to 8000ms: Playwright resolved a visible, enabled button but timed out before dispatching any pointer events, while the focused pending/retry run clicked it successfully. No behavior assertions, retry-button timeout, or product code were changed. The full-file command remained `node --test --test-timeout=300000 tests/home-formulari-assets.test.cjs`.

In this rerun, both alternatives tab clicks completed, all five pointer/mouse/click phases were observed for each, and the pending loading/success and retry recovery assertions passed. The run then recorded a separate paediatric retry-action failure at its existing 3000ms click timeout. It subsequently failed to create the quota/pending page because Playwright reported `browserContext.newPage: Target page, context or browser has been closed`; `browserConnectedAtFailure` was false. The test runner emitted no final summary while cleanup stalled, so the full file is **FAIL / INCOMPLETE**; it is not a pass. Before the browser failure, five non-browser tests had printed as passed, and the persisted browser evidence contained 23 PASS, 1 FAIL and 1 NOT APPLICABLE check record. No external requests were made.

The test's persisted full-run evidence records all consumer sources stable during bundle creation and bundle SHA-256 `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b`; `DrugAlternativesPage.tsx` was `8441e2c714f2223fc373b8efbbcfdb059a1130e68e0f04891b56a871abe8ab42` before and after the run. The two alternatives tab scenarios are **PASS** on the extended timeout. The suite remains blocked by the later paediatric retry timeout/browser disconnection, which needs separate runtime or product-owner investigation.

## Phase 6v isolated consumer runs — 2026-10-15

To distinguish browser resource exhaustion in the full-file run from individual consumer behavior, I ran the existing `Slice B consumers` test in one Node process per consumer using `HOME_QA_FORMULARI_KINDS=<kind>`. The test assertions were unchanged. `HOME_QA_FORMULARI_EVIDENCE_PATH` routed per-process JSON to the OS temporary directory so these reruns did not replace the shared full-run evidence. Commands used `node --test --test-timeout=90000 --test-name-pattern='Slice B consumers' tests/home-formulari-assets.test.cjs`.

| Consumer | Process result | Retry evidence |
| --- | --- | --- |
| alternatives | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| detail | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| dashboard | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| ham | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| lawas | FAIL — 1 test, 1 failed, 0 skipped | The retry mouse action promise timed out after 1500ms; the fixture reported `calls=unavailable`, so recovery was not proven. Available output does not establish whether a click event had dispatched before timeout. |
| lasa | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| paediatric | INCOMPLETE — top-level test timed out at 90s, 0 pass/fail, 1 cancelled, 0 skipped | Loading and successful-render checks passed. The existing 3000ms retry click timed out after Playwright logged the button visible, enabled and stable and entered `performing click action`; the alert then cleared during the timed-out click, so recovery occurred after the action began. The process stalled in teardown and produced no passing top-level result. Keyboard retry was not sent. |
| quota | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| interaction | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |
| hub | PASS — 1 test, 0 failed/skipped | Pending and retry scenarios completed, recovery assertions passed. |

Eight consumers passed as isolated processes; Lawas failed its retry-action assertion; paediatric remains incomplete with a captured retry failure and teardown timeout. No timeout increase was made to the paediatric retry click: its trace progressed into the click action and recovery began, unlike the alternatives tab's pre-dispatch actionability timeout. The 8000ms alternatives tab adjustment and all behavior assertions remain unchanged. No product source was edited. Browser metadata was Chromium 155.0.8059.40, 1280×900, light theme, `no-preference` motion; fixture routes were blocked and successful process assertions included stable-source and zero-external-request checks. The previously recorded bundle SHA-256 remains `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b` and `DrugAlternativesPage.tsx` SHA-256 is `8441e2c714f2223fc373b8efbbcfdb059a1130e68e0f04891b56a871abe8ab42`; I did not capture a persistent per-process JSON artifact because the isolated OS temporary output is ephemeral to each command sandbox.

**Overall Phase 6v status: FAIL / INCOMPLETE.** Next action: send the Lawas retry failure and paediatric post-dispatch retry/teardown issue to the corresponding frontend/runtime owner for investigation; do not accept the Formulary retry criterion based on the eight passing consumer kinds.

## Phase 6w retry and lifecycle diagnosis — 2026-10-15

Amri assigned only `tests/home-formulari-assets.test.cjs` and this report under `HOME-FIXES-20261013-PHASE6W`; the pinned baseline snapshot SHA-256 was `5b04dbc2a81d5894cdb89d491b028273e6fcb7f747fe6534ef9c0b2560329272`. I added test-only capture of retry pointer/mouse/click phases and fixture request logs, bounded post-click renderer queries, and bounded page/context/browser close checks. The Lawas diagnostic mouse action is bounded at 8000ms to allow a conclusive dispatch observation. Assertions for request/recovery and the paediatric monograph lookup remain required. The browser evidence path can be directed to OS temp; I summarized the per-run evidence below because this managed shell’s temp root is ephemeral per command.

**Lawas isolated rerun: PASS**, 1 test passed, 0 failed, 0 skipped (`HOME_QA_FORMULARI_KINDS=lawas`). The click promise completed. The capture observed `pointerdown → mousedown → pointerup → mouseup → click` on the Retry button. Fixture calls advanced from 1 to 2 with `retryArmed=true`; subsequent state showed `alertVisible=false` and `loadingVisible=false`. Both page and context closed, and `browser.close` completed. Lawas source SHA-256 was `6e7223b656be596667fd22f49ea528cb4f02c0eca35fac3eb16b85af8458c499`.

**Paediatric isolated rerun: FAIL**, 1 test failed, 0 skipped, no cancellation, duration 16.05s. Playwright’s 3000ms locator click timed out after it resolved the visible/enabled/stable Retry button, scrolled it into view, and entered the click action. The event capture nevertheless observed all five pointer/mouse/click events on the button, and the fixture console logged requestCalls 1→2 with `retryArmed=true`. Playwright’s subsequent `waitForFunction` timed out after 2200ms; a bounded direct renderer read also timed out, so the post-click alert/loading state and catalogue recovery could not be verified. No keyboard retry was sent because the renderer did not answer the alert-state query. The retained meaningful recovery assertion therefore failed; this is not accepted as a retry pass. All page/context/browser close checks completed. Paediatric source SHA-256 was `5864bbeef9a335198ecbdfab028c7e58bafe354b13bc27c76e37257a6ba37ba9`.

**Full Formulary file: FAIL, completed without a hang.** Command: `node --test --test-timeout=180000 tests/home-formulari-assets.test.cjs`. Node reported 6 tests, 5 passed, 1 failed, 0 cancelled, 0 skipped. The browser fixture recorded 34 checks: 32 PASS, 1 FAIL (paediatric retry recovery), 1 NOT APPLICABLE (keyboard retry withheld because renderer state was unobservable). The remaining consumer scenarios completed. Every page, context and browser close completed under the bounded lifecycle. Browser metadata: Chromium 155.0.8059.40, viewport 1280×900, light theme, `no-preference` motion. Bundle SHA-256 `ae5a4ad4971ed931af05e339afc73e7dce75b674fb0bb00e2781249bb2d3281b`; source stability was true and external requests were empty.

The evidence ruled out the previous theory that Lawas failed because no click event dispatched: its retry was demonstrated end to end. Paediatric also received a click and started its fixture request, but the browser renderer stopped answering state observations before recovery could be confirmed. Bounded teardown eliminated the former 90-second cleanup stall, but it did not resolve paediatric recovery. **Phase 6w status at this checkpoint: FAIL.** The follow-up below records the fixture correction and rerun.

## Phase 6w fixture identity correction and final rerun — 2026-10-15

The frontend review identified the harness mismatch: the fixture returned new `success` and `error` callback functions on every `useToastStore()` call, while the actual Zustand store creates stable action functions once. `PaediatricCataloguePage` depends on those callbacks in its catalogue-loading `useCallback`, and its effect depends on that callback; the unstable fixture identities could therefore re-trigger loading after render. I changed only the owned test fixture so the toast actions are module-scoped and stable. Error capture still appends messages to `window.__qa.toastErrors`. Product source and behavior assertions were not changed.

**Paediatric isolated rerun: PASS**, 1 test passed, 0 failed, 0 skipped, 11.31s. Retry event/request trace, retry recovery, and `facility-lookup-before-monograph` all passed. The trace showed the click dispatched and fixture requestCalls advanced 1→2; the monograph interaction made one facility lookup. The page, context and browser closed. Source remained stable; external requests were empty. `PaediatricCataloguePage.tsx` SHA-256: `5864bbeef9a335198ecbdfab028c7e58bafe354b13bc27c76e37257a6ba37ba9`.

**Lawas isolated rerun remains PASS**, 1 test passed, 0 failed, 0 skipped. It captured pointerdown, mousedown, pointerup, mouseup and click on Retry, a fixture request count increase 1→2, and cleared alert/loading state.

**Full Formulary file: PASS.** Command: `node --test --test-timeout=180000 tests/home-formulari-assets.test.cjs` — 6 tests passed, 0 failed, 0 cancelled, 0 skipped. Browser evidence recorded 35/35 PASS checks, including both alternatives tab activations, Lawas retry, paediatric retry and its monograph lookup. Every page/context/browser close completed. Browser metadata: Chromium 155.0.8059.40, viewport 1280×900, light theme, `no-preference` motion. Bundle SHA-256: `5e9512ebc60e3f75064c7d4204d016b6842c2c75f4ec4322ffa0d2e271e4ed2f`; source stability was true and external requests were empty.

Validation: `node --check tests/home-formulari-assets.test.cjs` passed; `node scripts/check-agent-boundaries.cjs --task docs/audits/home-fixes-phase6w.manifest.json` returned `PASS status=VALID`. Only the assigned QA test and report paths were edited; no product source changed. **Final Phase 6w status: PASS.**
