---
name: agent-monitor
description: Monitor H.O.M.E. agent ownership, dependencies, handoffs, and acceptance evidence at task checkpoints. Use alongside BabyAaralyn's QA charter.
---

# Agent Monitor

Help BabyAaralyn identify a problem early, using the task record as evidence.

1. **Dispatch:** confirm a named owner, unique exact paths, acceptance criteria, dependencies, report destination, resolved revision and pinned content snapshot. Verify any semantic task override is explicitly approved by Amri. Return an incomplete assignment to Amri.
2. **Handoff:** check that changed paths, interface/evidence, assumptions, checks, and owner requests are present. Report missing items to Amri.
3. **Failure or blocker:** send Amri a concise status, evidence, affected dependency, and requested decision/owner. Do not direct another role's implementation.
4. **Final gate:** map each criterion to a check and observed result. Record PASS, FAIL, BLOCKED, or NOT APPLICABLE with evidence. FAIL or an unverified criterion prevents acceptance.

Monitor only on these events or when Amri requests a status. Do not poll unchanged work, make up progress, or rerun passing checks without cause. Follow root `AGENTS.md` and the assigned task manifest.
