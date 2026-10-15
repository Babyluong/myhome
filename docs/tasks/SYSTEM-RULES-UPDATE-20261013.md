# Approved agent-system corrections

Canonical task: `SYSTEM-RULES-UPDATE-20261013`. User approved the audit corrections on 13 October 2026. Status: implementation assigned; acceptance belongs to Amri.

Goal: repair the audited governance, routing, enforcement and shared style contracts, then prepare a reviewable premium 3D login brief.
Scope excludes credential rotation, authentication changes, production database writes and another login feature redesign. The current global palette stays intact; a future login palette belongs to its separately approved visual direction.

Assignment and baseline source: `docs/audits/system-rules-update-20261013.manifest.json`, revision `f1d4918084f4b9da515d055471f21acc1525e243`, dirty paths and full file-hash snapshot recorded by Amri. Each owner's exact allowed paths are the manifest's slice list; preserve pre-existing edits.

| Owner | Deliverable and interface | Dependency | Acceptance evidence |
|---|---|---|---|
| Amri | Correct root policy, role configurations and skills; publish the v2 manifest/checker contract and retain user approval | Approved audit scope | Parsable skills, maintained references, supported tool instructions, applicable checks and truthful authority/isolation claims |
| Babybun | This plan, login brief, decision credential redaction and current router coordinates | Approved scope; graph candidates verified against current source | Existing router paths or explicit capability gaps; targeted credential redaction; measurable brief without feature code |
| BabyHien | Persistent boundary/baseline/discovery checkers and lint configuration | Amri's v2 contract | Detect mutations of dirty baseline files, reject both endpoints of invalid renames, validate assignments/overrides, parse tracked status correctly, execute lint and avoid credential-dependent false PASS |
| Babyluong | Semantic opacity and shadow contracts in Tailwind/CSS; design guidance scoped by page purpose | Amri policy; Babybun brief | Alpha utilities compile, referenced shadow tokens resolve in both themes, current palette/auth behavior preserved; login/hub heroes distinct from operational density defaults |
| BabyAaralyn | Isolated adversarial tests and dated QA report | Verified checker, style and governance handoffs | Failure fixtures fail; valid fixtures pass; parsing/routing/style compilation checks reproduce; limits stated; no live data or feature fixes |

Sequence: Amri publishes the contract; Babybun supplies the scope/brief; Amri alone dispatches backend and frontend work; their handoffs feed QA; Amri evaluates evidence and assigns any rework.
Checker interface: `node scripts/check-agent-boundaries.cjs --task <manifest>` remains the documented entry point. The v2 manifest declares baseline snapshot, owners, dependencies, criteria, reporting and approved ownership overrides; BabyHien validates the exact Amri-owned contract.
Router interface: `root`, `pages` and `services` contain current repository-relative coordinates. An unavailable legacy coordinate is removed and documented as a capability gap rather than replaced with a guessed endpoint. Database names remain lookup hints requiring schema confirmation.
Style interface: existing semantic utility names and palette remain compatible; alpha-capable channel tokens and resolved surface/elevated/modal shadows must work in dark and light themes.

Final criteria: no unauthorized path changes; preserved unrelated baseline edits; corrected authority/security/fixture/budget rules; parsable discovery metadata; validated router; credential removed from the document with validity unverified; reproducible adversarial and style checks; useful login brief.
Applicable verification: scoped diff review, manifest/baseline ownership checks, skill/config parsing and reference checks, router existence checks, isolated checker regressions, Tailwind token compilation, lint and build where required by the affected contracts.
Evidence must report task/slice, PASS/FAIL/BLOCKED/NOT APPLICABLE, changed paths, checks, dependencies and next action to Amri. A read-only check does not prove production safety, runtime isolation or visual perfection.
No fresh approval question is required for this already approved scope. Material scope expansion returns to Amri for the user's decision.
