# H.O.M.E. system rules, agents, skills, plugins and tools audit

Task: SYSTEM-RULES-20261013  
Date: 13 October 2026 (Asia/Kuala_Lumpur)  
Supervisor: Amri  
Audit status: Complete; corrections proposed for review  
System verdict: Corrections required before relying on the present guidance and acceptance gates

## Decision and scope

The weak login result has verified presentation defects and conflicting design guidance. The surrounding agent system also has real routing, discovery and enforcement gaps. The available tools are sufficient to investigate and implement a reviewed direction, but their presence does not establish design quality or correct use.

This was an audit of the current session capabilities, global and repository guidance/configuration, all 26 repository skills, four specialist role files, 15 cached plugin bundles, governance scripts, routing references, and the current login/form/hero/style sources. It was not an exhaustive application-security, database, dependency-vulnerability or production-rendering assessment.

Only the three Amri-owned audit records were added. Existing feature code, policy, agent configuration, plugin installations, permissions, credentials and release files were preserved. HEAD at dispatch was `f1d4918084f4b9da515d055471f21acc1525e243`; the manifest records 74 distinct pre-existing changed/untracked paths.

## What is active

| Layer | Observed state | Meaning |
| --- | --- | --- |
| Current session | Workspace write sandbox, restricted shell network, automatic approval review, four concurrent agent slots | These runtime controls govern actual actions; repository text cannot expand them. |
| Global guidance | User-level AGENTS.md directs structural exploration through codebase-memory | Global and repository graph skills are text-identical. |
| Global configuration | Default model gpt-6.1-sol, reasoning effort ultra; repository marked trusted | This records defaults, rather than proving a model caused the design result. |
| Repository guidance | Root AGENTS.md, compatibility pointer, ownership policy and task manifest | Clear declared responsibilities; mechanical enforcement has gaps below. |
| Roles | Babybun, Babyluong, BabyHien and BabyAaralyn exposed in the runtime; three audit specialists successfully dispatched | Registration is functioning. None of the four TOMLs supplies an additional sandbox override. |
| Skills | 26 repository skill files; 25 appear in the session catalog; all 19 configured role-skill directories exist | On-disk existence, initial catalog visibility and actual loading are distinct checks. |
| MCP configuration | Global node REPL and codebase-memory server; repository 21st endpoint with environment-based header mapping | Executable references exist. Graph reads and 21st metadata search succeeded. |
| Hooks | Global SessionStart/SubagentStart graph-context hooks reference an existing executable | This verifies configuration and executable existence, not every hook invocation. No repository boundary hook was discovered. |

Current official documentation supports `agents.enabled`, environment-based HTTP headers, inline lifecycle hooks and the Windows command alias; these are not obsolete simply because earlier documentation used another shape. [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)

Amri is the main-agent coordination charter. The runtime also exposes default, explorer, worker, codebase-memory, codebase-memory-auditor and codebase-memory-scout roles alongside the four H.O.M.E. specialists. Their availability does not override repository responsibility and file-ownership rules.

The 26 inspected repository skills are: agent-monitor, amri, antislop-copywriting, antislop-human, babyaaralyn, babybun, babyhien, babyluong, brainstorming, caveman, codebase-memory, compact-code, emil-kowalski, error-guard, frontend-architecture, grill-me, impeccable, plan-first, security-gate, session-compactor, supabase-postgres-best-practices, system-design-pro, task-slicer, tasteskill, test-gate and zero-scan-router. Global system skills exposed here include imagegen, openai-docs, skill-creator and skill-installer, plus the duplicate global graph skill. Plugin workflow availability is recorded below; unrelated artifact workflows were inventoried rather than executed.

Omitted custom-agent sandbox settings inherit from the parent; a supported read-only override is available. An instruction naming allowed paths does not itself create filesystem isolation. [Subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents)

## Prioritized findings

### 1. P1 — Current login styles do not compile as intended

[Semantic color mapping](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/tailwind.config.js:20>) maps complete CSS variable values. Two independent in-memory compilations using installed Tailwind 3.4.19 and PostCSS 8.5.6 emitted base semantic colors and built-in alpha-color controls, but omitted the inspected semantic alpha forms.

Examples include `bg-surface/90`, `dark:bg-surface/80`, `bg-subtle/50`, `bg-accent-base/10`, `before:via-accent-base/60`, `border-border-default/60` and `focus:ring-accent-base/20`. The [login panel](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/src/modules/auth/pages/LoginPage.tsx:237>) and [form controls](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/src/shared/components/forms/LoginForm.tsx:149>) use these forms.

Several elevation utilities also reference shadow variables absent from the inspected stylesheet. This is a verified source/compile defect. It does not prove the exact appearance of a currently deployed build. A global focus-ring rule still compiles, so missing ring-color utilities do not establish invisible keyboard focus.

Owner: Babyluong after Amri assigns the currently unowned Tailwind configuration. Verification: BabyAaralyn. Remedy: repair the semantic color/shadow contract and verify generated styles plus rendered light/dark screens.

### 2. P1 — Design guidance and actual theme are inconsistent

The [active design system](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/docs/DESIGN_SYSTEM.md:14>) expressly permits lazy-loaded 3D on login and hub, with reduced-motion/WebGL fallback. Its palette and surface contract describe navy/slate, cyan/teal and elevation tokens. Current [stylesheet tokens](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/src/index.css:20>) use gray/black and System Blue instead.

A historical Apple-style decision exists, followed by a navy/slate hybrid-depth task brief. The active design document and actual tokens therefore need reconciliation. TasteSkill assumes a dense operational dashboard for every view; Impeccable prohibits resting shadows that the design system explicitly specifies.

Verified: conflicting text and token values. Inference: applying operational density and styling restrictions universally can constrain the login direction. The previous claim that a 28px ceiling flattened the current hero is not established: the login actually declares a 36–60px heading.

Owner: Amri for the authoritative design contract; Babybun for an approved composition brief; Babyluong for later implementation. Remedy: scope operational defaults to workflow screens and establish explicit login/hub guidance.

### 3. P1 — Historical visual acceptance cannot be reproduced from its listed evidence

The [modern-depth report](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/docs/test-reports/2026-10-11-modern-depth-redesign-report.md:35>) claims visual verification and production readiness, but all six screenshot paths it lists are absent today. This proves missing retained evidence, not that screenshots were never captured.

The earlier flat proposal and the later premium prototype are separate artifacts. Source inspection found SVG presentation in the former and actual Three.js rendering/material/environment-lighting code in the latter. Calling every later proposal flat would be incorrect.

No current browser login tab or preview listener on ports 3000/4173 was available during this audit. There is no present rendered-screen verdict.

Owners: Amri and BabyAaralyn. Remedy: retain screenshots and browser observations tied to the reviewed revision, viewport, theme and motion setting. User approval of a visual direction must precede substantial implementation.

### 4. P1 — Boundary checking ignores changes to already dirty files

[Baseline filtering](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/scripts/check-agent-boundaries.cjs:115>) excludes every path changed at dispatch before checking assignment boundaries. In-memory execution of the actual checker source showed a later out-of-scope edit to a baseline path returning `PASS changed_count=0`.

The current audit has 74 such baseline paths. The checker also has no evidence of which agent performed an edit: it validates declared path ownership, not actor attribution. Four role configurations inherit the shared parent sandbox without additional role restrictions.

Owners: Amri for the baseline/attribution contract; BabyHien for persistent enforcement; BabyAaralyn for regression fixtures. Remedy: record content/status snapshots and compare subsequent changes, including dirty files; describe the remaining attribution limits accurately.

### 5. P1 — Default rule scanning skips modified tracked files

[Porcelain parsing](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/scripts/check-rules.cjs:48>) trims each status line before slicing away its status prefix. A leading-space modified-tracked record consequently loses the first character of its source path and fails the source-directory filter.

An in-memory reproduction skipped a tracked file containing forbidden host-specific logic and exited successfully against a clean last-commit fallback. The equivalent untracked-file control failed correctly.

Owner: BabyHien; regression verification: BabyAaralyn. Remedy: parse NUL-delimited Git status without destroying its fixed prefix.

### 6. P1 — The lint gate cannot execute

The exact [lint command](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/package.json:13>) fails with exit 2 because its `--ext` flag is unsupported with the active flat configuration. A focused diagnostic invocation without that flag also fails with exit 2: [ESLint configuration](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/eslint.config.mjs:13>) extends missing Next.js configurations in the Vite/React application.

Owner: Amri must first assign these currently unowned configuration paths, then route implementation appropriately. Remedy: restore a configuration matching the actual application and verify the exact package command.

### 7. P1 — Several skills contradict supervision and safe testing

- [security-gate](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/security-gate/SKILL.md:20>) routes results/failures to Babybun and says all-pass permits shipping. Root rules reserve acceptance and routing for Amri.
- [zero-scan-router](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/zero-scan-router/SKILL.md:56>) bans all synthetic data and directs real Supabase queries, while root policy requires isolated test fixtures.
- [session-compactor](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/session-compactor/SKILL.md:18>) imposes hard turn stops, asks for staging/committing and a shared handoff file, and makes unmeasured token/quota claims. The repository requires soft budgets, path ownership and evidence.
- The router's three-call cap can prevent required graph coverage/pagination checks. The compactor's script mandate for small multi-file changes can cross BabyHien's script ownership.

Owner: Amri. Remedy: retain production-data integrity, explicitly allow isolated fixtures, route all acceptance evidence through Amri, and make budgets advisory.

### 8. P1 — Accessibility guidance can falsely pass text contrast

[Contrast instructions](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/antislop-human/SKILL.md:26>) treat all 18px text as large; line 65 directs rounding before comparison. Both are wrong for the stated WCAG check.

The applicable large-text distinction is 18pt regular or 14pt bold, approximately 24px or 18.5px bold, and threshold comparisons must use the unrounded ratio. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Owner: Amri; verification: BabyAaralyn. Remedy: correct the thresholds and numerical procedure. This finding concerns the guidance, not a completed contrast assessment of the login.

### 9. P1 — A decision record contains a plaintext privileged password

[Historical access-control decision](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/docs/DECISIONS.md:8>) presents a plaintext password as enforced for privileged store selection, without a demo/test label. The value is omitted from this audit. Its current validity and implementation were not investigated.

Owners: BabyHien to assess current credential/control status; Babybun for the decision record; Amri to coordinate. Remedy: remove secret values from documentation and rotate the credential if it remains valid, through an authorized security change.

### 10. P2 — Path ownership conflicts with responsibility and omits common files

The [ownership policy](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/docs/AGENT_OWNERSHIP.json:20>) assigns all screen/routes to frontend and all scripts to backend. In-memory checks reject BabyHien owning an auth change inside a route file and BabyAaralyn owning the existing test script, contrary to root responsibility rules.

451 existing source paths have no owner under the current policy, including application entry points, shared configuration/types and release configuration. Package/Tailwind configuration and the design-system document also need explicit ownership. A task allowlist alone cannot overcome the global-owner requirement.

Owner: Amri. Remedy: provide semantic task overrides and test/configuration path coverage, with one owner per file before dispatch.

### 11. P2 — Manifest PASS and rename handling overstate enforcement

The checker accepts a nonexistent all-zero revision, missing criteria/dependencies/report fields and wildcard task paths. Overlapping assignments can pass when no changed file touches them; conflicting policy patterns can pass when no existing file matches both.

[Rename parsing](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/scripts/check-agent-boundaries.cjs:79>) checks the destination while skipping source ownership. A backend-to-frontend rename passed in memory. The [manifest template](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.codex/task-manifest.template.json:1>) lacks several fields required by the written assignment policy.

Owners: Amri for the contract/template; BabyHien for validation; BabyAaralyn for fixtures. Remedy: resolve the baseline revision, validate complete dispatch records and both rename endpoints, and detect conflicts before editing.

### 12. P2 — Router coordinates are stale

The [router](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/CODEBASE_ROUTER.json:7>) parses successfully, but 20 of 143 declared root/page/service paths across 21 modules do not exist. Missing examples include cylinder, inventory, admin and profile paths.

Owners: Babybun for the router; Amri for mandatory routing guidance. Remedy: refresh the coordinates from verified source and allow bounded fallback when a route is stale.

### 13. P2 — Skill metadata and dependency discovery need repair

Standard YAML parsing fails for the unquoted colon-space descriptions in [BabyHien skill](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/babyhien/SKILL.md:3>) and [Babyluong skill](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/.agents/skills/babyluong/SKILL.md:3>). Both nevertheless appear in this runtime catalog: this is a portability defect, not proven absence.

Security-gate is the only repository skill with a UTF-8 BOM. Its directory exists and BabyHien enables it, but it is absent from this session's initial catalog. The cause is unconfirmed. Encoding, catalog budget, configuration or refresh could explain it. Current documentation says the initial skill list may omit entries under its metadata budget. [Skill discovery](https://learn.chatgpt.com/docs/build-skills)

Antislop skills require an absent core and refer to absent layout/contrast resources. The human skill permits a formula fallback, so the missing script alone should not stop work.

Owner: Amri. Remedy: normalize encoding, quote metadata, make dependencies available or self-contained, then verify discovery/loading in a fresh session.

### 14. P2 — Quality gates remain mostly procedural

No test/browser/visual/boundary/rule-check package command, repository CI directory or active Git hook was found. The generic rule checker claims broader rule compliance than its checks establish; it does not prove authorization, RLS or audit behavior.

The existing inventory test script exits successfully without credentials while doing no checks; its credentialed path reads live data and was not executed. This contradicts isolated-test expectations.

Owners: Amri for gate definitions, BabyHien for checking infrastructure, BabyAaralyn for isolated tests. Remedy: define applicable checks by behavior and require retained observed evidence, without treating static rule scans as security certification.

### 15. P2/P3 — Additional guidance is rigid, incomplete or stale

Impeccable and the active design system disagree about resting shadows and spinner loading. Motion limits conflict between the active system and supporting skills. Plan-first can tell a planner to implement, contradicting Babybun's role. Fixed state/type/radius requirements are imposed even where they do not apply.

Several skills name tools absent from this runtime. The graph skill lists 15 methods while the live server exposes 17. Impeccable's description advertises 61 deterministic rules, while its local numbered list has seven. Source provenance coverage is incomplete. No license violation was established.

Owner: Amri. Remedy: make supporting guidance subordinate to the product contract, scope requirements by page/behavior, name current capabilities and remove unsupported numerical claims.

## Login-specific source findings

At a 16px root size, current desktop padding leaves approximately 330px-wide controls at 1024–1279px and 298px from 1280px upward. At 3439px, the allocated form region is about 1444px wide while the visible card is about 364px wide. The layout is flex, correcting the earlier audit's “grid” description. Whether those proportions are desirable requires an approved visual composition.

The hero wrapper uses 20% opacity in light and 30% in dark. Its materials use 35% body and 20% wire opacity: nominal products are 7%/4% light and 10.5%/6% dark, rather than measurements of final pixel brightness. The scene uses simple geometry, fixed colors, continuous movement and ambient/point lights; pointer interaction is disabled. These source choices explain a faint, restrained hero but do not establish the exact currently served image.

Preserve the existing lazy scene loading, error/fallback branches, credential validation, lockout/loading behavior and redirects in any later presentation change. Obtain an agreed visual reference and measurable composition before implementing another redesign. The historical premium 3D brief is evidence of a past direction, not a substitute for current approval.

## Plugins and tools inventory

The [complete tool snapshot](<C:/Users/60113/Downloads/My Home/hospital-operation-management-ecosystem/docs/audits/system-rules-20261013.tools.json>) lists all 180 nested methods exposed at inspection, plus 13 direct orchestration/browser/wait interfaces. This is an availability snapshot, not a health test of every operation.

| Capability | Available methods / state | Verified limit |
| --- | --- | --- |
| 21st | 51 methods; free login metadata search succeeded | Hosted AI generation is disabled; generate/iterate tools are absent. Two free code retrievals remain today; no paid/code retrieval was used. |
| Codebase memory | 17 methods; project list, symbol search and coverage succeeded | Six cited source paths had metadata_changed freshness; specialists read current source instead of relying on graph freshness. |
| Codex app tools | 43 methods for files, chats, worktrees, automation and other app tasks | Capability does not authorize unrelated writes or messages. |
| Browser/computer interfaces | CUA browser inventory succeeded; node REPL methods exposed | Only empty in-app/MCP Apps tab lists were observed on this path. Separate Windows computer-use skill exists; native functionality was not independently exercised. |
| Sites | 25 connector methods; installed/enabled state and dependencies confirmed | No project creation, deployment or permission change tested. |
| Plugin Management | Six methods; dependency/permission reads succeeded | Public-directory lookup does not resolve bundled spreadsheets by its local bundle reference. |
| Other app surfaces | Pets 11, document control 3, safety settings 5, hotline 1, search service 1 | Unrelated to login acceptance; no personal records or write operations tested. |
| Code review | One PR-check diagnostic method exposed | PR diagnostics do not establish visual quality or a local design review. |
| Built-in work tools | Shell, patching, image viewing/generation, web, resources, clock and goal tools | Shell documentation fetch failed DNS; official web retrieval succeeded. No images or goals created. |

All 15 cached plugin manifests parsed and all 20 declared skills/MCP/app resource paths existed. The bundles were: codex-app-tools, browser, visualize, documents, pdf, spreadsheets, presentations, template-creator, unified-computer-use, code-review, computer-use, plugin-management, sites, work-pets and openai-templates.

Eleven bundles are explicitly enabled in global configuration. Sites, Plugin Management and Pets were independently confirmed installed/enabled through dependency metadata. Openai-templates is cached but is not exposed as a skill in this session; cache presence alone cannot establish enablement. Figma search returned installed=false. Recommended or cached plugins must not be described as connected without separate evidence.

Sites, Plugin Management and Pets use the default “Allow low-risk actions” app permission setting. A Pets alias initially returned not-installed, while its canonical connector identifier returned the expected permissions; this was resolved through the returned identifier. No permission or installation was changed.

## Checks and specialist handoffs

| Owner/slice | Result | Evidence |
| --- | --- | --- |
| Babybun / rules-skills | Audit PASS; consistency FAIL | All 26 skills inspected, 24/26 standard YAML parses after BOM normalization, four TOMLs parsed, 19 skill references exist, router path checks and identical graph-skill copies. |
| Babyluong / login-design | Audit PASS; no design acceptance | Two in-memory style compiles with positive controls, current source inspection, geometry/opacity arithmetic, historical artifact checks. |
| BabyAaralyn / governance-qa | Audit PASS; enforcement FAIL | Actual-source in-memory adversarial checks and negative controls; syntax/JSON/TOML checks; observed lint failures; preview/evidence limitations. |
| Amri / system-tools | Audit PASS; system corrections required | Global guidance/configuration, 15 bundle/resource checks, tool inventory, read-only connection/entitlement/permission probes, official documentation verification and source review of material findings. |

Final artifact gate: PASS. Both JSON records parse; 180 unique nested tool names match the observed registry. The 13 direct interfaces are the root agent's exposed surface; a child had only 12, so this inventory is explicitly root-session scoped. Git shows 77 changed/untracked paths: the 74 baseline paths plus exactly three assigned audit records. All 22 local report links and line anchors validate. A secret-shape scan of the new records found no candidate secret assignment. The final task boundary check returned `PASS status=VALID changed_count=3`; its known enforcement blind spots remain unresolved. Required audit criteria are satisfied, while feature/design/security acceptance is not being granted.

No authentication, production database, privileged credential, deployment or destructive tool operation was exercised. Build/release workflows were not required for this documentation-only audit; the package prebuild generates release files. The development pre-hook can stop processes on port 3000, so launching it would have side effects beyond reading the login.

## Concrete correction sequence for approval

1. Amri consolidates precedence, safe fixture policy, acceptance routing, advisory budgets, contrast rules and login-specific design guidance; repairs skill metadata/resources and establishes file ownership.
2. BabyHien repairs boundary/status parsing and manifest validation; BabyAaralyn supplies isolated regression fixtures. Restore runnable lint and define applicable verification gates under explicit ownership.
3. Babybun refreshes routing and prepares a short login brief containing a visual reference, theme direction, desktop form proportions and hero/motion requirements.
4. Babyluong repairs the confirmed styling contract and implements only the approved login direction, preserving authentication behavior. BabyAaralyn verifies rendered light/dark, responsive, focus, reduced-motion and fallback states at agreed widths.

These are proposed corrections. This audit does not authorize changing governance, credentials, plugins or the login. The audit can close with unresolved defects documented; the system cannot be represented as fully validated.

