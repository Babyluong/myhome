# HOME health QA — 2026-10-13

Task: `HOME-HEALTH-20261013`; slice: BabyAaralyn; report to: Amri.
Status: **FAIL**. Compilation succeeds; lint, static motion rules, governance discovery/boundary checks and isolated security expectations fail. The Git-dependent governance tests remain **BLOCKED** by sandbox fixture permissions. Amri owns acceptance and rework routing.

Baseline revision: `f1d4918084f4b9da515d055471f21acc1525e243`.
Manifest: `docs/audits/home-health-20261013.manifest.json` (v2).
Baseline snapshot SHA-256: `22cdb0a62af358076e355f7213a665bc0e004f17647f2b84a0af155d80f1e1bc` (verified against disk).
The working tree already contained application changes and deletions. Results describe that task-start content, rather than a clean checkout of the revision alone.

## Actual checks

| Check | Result | Evidence and limits |
| --- | --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false` | PASS, exit 0 | `2026-10-13-home-health-typecheck.log`; no emitted application files. |
| `npm.cmd run lint` | FAIL, exit 1 | `2026-10-13-home-health-lint.log`: 5,354 problems, 5,122 errors, 232 warnings. No automatic fixes. |
| `npm.cmd run test:agent-system` | BLOCKED, exit 1 | `2026-10-13-home-health-tests.log`: 63 tests, 16 pass, 47 fail during Git fixture setup, zero skipped/cancelled. Git could not write temporary fixture `.git/config` (`Permission denied`, exit 128). These 47 results do not prove product or assertion failures. |
| `npm.cmd run agents:validate` with bundled Python/tomllib | FAIL, exit 1 | `2026-10-13-home-health-agents.log`: `UNASSIGNED_POLICY_PATH path=next.config.ts`. |
| `node scripts/check-rules.cjs` | FAIL, exit 1 | `2026-10-13-home-health-rules.log`: 28 changed files, four BLOCK findings, 172 warnings. Static pattern scope only. |
| Isolated Vite build with release hook removed | PASS, exit 0 | `2026-10-13-home-health-build.log`: 4,436 modules transformed; built in 4m 43s; PWA generated 345 precache entries, 26,100.23 KiB. This proves bundling with the safety substitution, not the normal release-sync lifecycle. |
| `node scripts/check-agent-boundaries.cjs --task docs/audits/home-health-20261013.manifest.json` | FAIL, exit 1 | Appended to agents log with `BOUNDARY_EXIT_CODE=1`; blocked at the same unassigned `next.config.ts` policy path. No claim that the scope gate passed. |
| Isolated admin/offline behavior checks | FAIL expectations; harness exit 0 | Appendix in tests log. Five observed expectation failures; zero network requests sent. |

Full command output and exit markers are retained in the six assigned logs. The tests log distinguishes the suite exit 1 from the successfully executed reproduction harness, whose scenarios each retain their own FAIL result.

## Findings and owner requests

1. **Privileged password change callback lacks caller authorization — P1, BabyHien.** Transpiled `supabase/functions/admin-user-ops/index.ts` in a temporary VM after removing only its two imports; injected `serve`, `createClient`, and fixture `Deno.env`. Sent a fixture POST `update_password` for `fixture-other-user` with no Authorization header. Expected 401/403 and zero privileged calls; observed HTTP 200 `{success:true}` and one `auth.admin.updateUserById` stub call. Service-role client construction is at line 28, request parsing at 35, password operation at 79–87. No production key was read and no real account changed. Hosted gateway/JWT configuration and deployment exposure were not verified; this confirms the callback defect, not a successful production attack.

2. **Offline fallback ignores hospital filter and projection — P1, BabyHien.** Transpiled `src/services/offlineFetch.ts` in a temporary VM with navigator offline, an empty `window` without CacheStorage, stub IndexedDB `get/set`, and a throwing fetch stub. `table_cache_users` held only isolated rows `[{id:'a',hospital_id:'H1'},{id:'b',hospital_id:'H2'}]`. GET `https://fixture.supabase.co/rest/v1/users?hospital_id=eq.H1&select=id` returned HTTP 200 with both rows and their hospital fields. Expected H1-only projected rows or an explicit unavailable result. The cache is table-keyed at lines 25/57, fallback reads without hospital context at 177, parses only pagination at 210–214, and returns sliced complete objects at 255. Both Supabase clients use this interceptor (`src/services/supabase.ts:18`, `:115`). Cross-session cache persistence and hosted authorization remain separate verification work.

3. **Offline absence and writes are represented as success — P1, BabyHien.** In the same VM, an empty cache yielded HTTP 200 `[]` instead of an unavailable indication (`offlineFetch.ts:300`). Offline PATCH and DELETE each called the throwing local fetch stub, then returned HTTP 200 `{offline_queued:true}` with zero IndexedDB writes (`:317`). No durable queue was called by this interceptor. Caller/module queue integration remains unverified; the synthesized result can mislead direct callers about persistence.

4. **Lint gate fails broadly — BabyHien/Babyluong, route per file.** Counts include 2,610 `no-explicit-any`, 1,991 `no-unused-vars`, 282 `ban-ts-comment`, 200 `exhaustive-deps`, 69 `rules-of-hooks`, 65 `no-empty`, 59 `prefer-const`, and 32 `only-export-components`. These are repository-wide lint findings, not all new regressions. Hook-order findings merit focused owner review; this slice did not reproduce their browser effects.

5. **Changed inventory controls use forbidden broad transitions — Babyluong.** BLOCK findings: `FacilityDrugInventoryPage.tsx:1667`, `:1809`; `FacilityNonDrugInventoryPage.tsx:1899`, `:2041`. All four are `transition-all`. The 172 raw-color warnings include print templates; context matters before changing them. No browser contrast/motion conclusion is inferred from this static scan.

6. **Governance validator cannot cover the current tracked-path set — Amri/BabyHien.** `scripts/check-agent-boundaries.cjs:86–87` includes cached tracked paths, including task-start deletions. `next.config.ts` has no ownership assignment and triggers lines 115–123. The full structure check and task-boundary gate stop there, so later criteria are unverified. A supplemental source-hash comparison performed by Amri can document preserved content but does not replace the failing mandatory gate.

7. **Normal build/development entry points synchronize releases — Amri/BabyHien.** `package.json:10` runs release generation in prebuild, and `vite.config.ts:9–29` runs it in the Vite buildStart hook. These entry points were deliberately not executed during this read-only audit. The safe build used a temporary transpiled copy of the current Vite configuration, removed the `systemReleasesPlugin()` invocation, kept React/PWA and bundler options, resolved plugin imports to installed absolute paths, and directed cache/output into a system temporary directory. The local CLI used `build --config <temporary .mjs> --configLoader native --outDir <temporary dist> --emptyOutDir`; no npm lifecycle ran. Application configuration was never edited.

8. **Large offline payload — Babyluong/BabyHien.** Safe build warns that `formulariService` is 11,753.03 kB minified (1,286.60 kB gzip), above the configured 2,500 kB chunk warning threshold. PWA precache totals about 25.5 MiB. This is measured bundle evidence; user-perceived load performance was not measured.

## Evidence limits and handoff

- No browser acceptance was performed in this slice. Viewport, theme and motion settings: NOT APPLICABLE to the CLI/VM checks. Rendered UI, responsive behavior, focus, reduced motion and contrast remain unverified here.
- No production requests, deployment, release synchronization, Supabase live inventory checks, data mutations, or feature fixes were performed. Existing inventory tests inject fixture clients; the credential-absence CLI case uses a fresh temporary directory and explicitly blank credentials.
- The 16 passing tests cover isolated inventory smoke-helper controls, porcelain parsing and generated design-token assertions. This is limited governance/token coverage; it does not certify current auth, inventory workflows, tenant boundaries, RLS, audits or production readiness.
- System Python was an unavailable WindowsApps alias. `agents:validate` used `C:\Users\60113\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe` with `HOME_AGENT_PYTHON`; no parser scope was silently downgraded.
- Test fixtures safely verify their resolved temporary-root prefixes before deletion. Git fixture creation was blocked by runtime permissions. No assertions or tests were changed; no passing suites were repeated. Separate process enumeration sees only that command's sandbox processes; CIM inspection was denied. Actual typecheck/build exits were awaited rather than treating empty output as failure.
- Reproduction source SHA-256: offlineFetch `81dac1d2c7146e5ff87f8cdcf8917e6152e338f2eda297a5fb4d50660bf6a62a`; admin-user-ops `6907f681b8660662a99a419c1a6f634c4ec23a593021abe014edf0c7d7983af2`; Vite config `615bced52ae2294dd38145f97e44fe2494c01ebd7ba5ff4b7db660e0954045f6`.

Changed paths owned by this slice: this report and `2026-10-13-home-health-{typecheck,lint,tests,rules,agents,build}.log` under `docs/test-reports/`. Transient configuration/output and VM fixtures used system temporary storage. No application source was changed.

Next action: Amri routes security/offline rework to BabyHien, transition/hook presentation rework to the relevant owner, and governance policy resolution to its owner. Re-run blocked Git fixture checks in a supported environment and failed criteria only after relevant corrections. Final acceptance remains with Amri.
