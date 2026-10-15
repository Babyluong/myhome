---
name: session-compactor
description: Prepare compact, resumable checkpoints for long H.O.M.E. tasks and bulk refactors.
---

# Resumable context

- When a task becomes long or compaction is approaching, checkpoint its objective, constraints, baseline/manifest, owners, completed work, changed paths, unresolved checks, and next action. Reuse the task record; Babybun owns `docs/SESSION_HANDOFF.md` when that file needs updating.
- After compaction, continue from the checkpoint and inspect only missing or changed evidence. Preserve earlier authorization and the original objective.
- Turn counts and context targets are soft signals. Never stop at an arbitrary turn count, force a fresh chat, or stage/commit the user's work for token savings.
- For repetitive transformations, use a deterministic script when it improves reliability. Preview its scope and verify the resulting diff and applicable checks. Script generation and output still consume context; scripts are not inherently free.
- Delegate independently useful slices with concise briefs, following [token-efficiency](../token-efficiency/SKILL.md). Do not assume children receive a small context when they inherit the whole conversation.

Do not estimate token totals or quota consumption from turn counts.
