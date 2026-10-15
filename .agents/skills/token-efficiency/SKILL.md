---
name: token-efficiency
description: Reduce context overhead in multi-step H.O.M.E. repository tasks and high-token-use investigations through bounded evidence and concise agent handoffs.
---

# Token-efficient work

Reduce repeated context and noisy evidence while completing the authorized task.

- Load the assigned role charter first, then only skills whose triggers match the task. Read each relevant source once per available context; reopen changed content or facts lost after compaction. Do not load whole skill bundles.
- Start with supplied paths. For module routing, inspect the matching entry in `.agents/CODEBASE_ROUTER.json`; verify hints against source. For structural questions follow `codebase-memory`, including coverage checks and source fallback. Use scoped `rg` for literals and uncovered files.
- Start with roughly 100 source lines and 1,500 output tokens per lookup; allow about 3,000 for a scoped diff or diagnostics. These are adjustable starting points. Expand when missing context, pagination, failures, or acceptance criteria require it; never edit just to meet a read budget.
- Capture noisy command output in a task-local temporary log. Preserve the original exit status, report status and relevant diagnostics, and identify omitted output and the log path. Inspect unresolved failures before declaring PASS. A shortened display is not complete evidence.
- Delegate only useful independent work. When the available runtime supports it, prefer `fork_turns="none"` for a self-contained brief: task, owner, allowed paths, baseline/manifest, contracts, verified findings, open questions, checks, report destination. Include graph coverage evidence when relevant. Inherit history when essential context cannot be conveyed reliably.
- Request concise reports with status, changed paths, evidence, blockers, and next action. Keep full logs in artifacts; do not duplicate them in parent and child conversations or poll unchanged work.
- Checkpoint long work with completed work, pending checks, ownership, and the next action. Continue after compaction; do not force a new chat or stage/commit changes solely to reduce tokens.
- Report actual usage only when telemetry or a tokenizer exposes it. Bytes, lines, calls, and instruction size are separate measurements; do not convert them into claimed quota or billing savings.

Efficiency never overrides authorization, tenant security, audit behavior, coverage, ownership, required tests, or task completion.
