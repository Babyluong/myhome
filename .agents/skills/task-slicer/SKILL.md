---
name: task-slicer
description: Break an approved H.O.M.E. plan into independently verifiable slices with explicit owners, paths, interfaces, and dependencies. Use when a task has multiple responsibilities or agents.
---

# Task slicing

Used by Babybun to propose slices to Amri. Each slice contains:

- Goal and testable completion condition.
- One named owner and the exact allowed paths; each file belongs to one owner per task.
- Required inputs, dependency contract, and downstream owner.
- Relevant acceptance criteria, security checks, and test evidence.
- A short soft effort/context target, with room for justified work.

Order work by dependency. A migration goes first only when a later slice requires it. Plan a verification slice when product behavior changes; documentation-only work gets applicable checks. Do not impose file-count limits, a fixed six-test suite, framework dependencies, or a particular sequence when the architecture does not need them. Amri approves the slices and alone dispatches the specialists.
