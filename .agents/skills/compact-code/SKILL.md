---
name: compact-code
description: Keep H.O.M.E. changes focused, typed, readable, and consistent with the surrounding module. Use when implementing or refactoring code.
---

# Maintainable code

- Make the smallest cohesive change that satisfies the acceptance criteria.
- Preserve established project patterns and public interfaces. Search nearby callers before changing a contract.
- Keep responsibilities clear between UI, hooks, services, and database changes; their owners follow the root lane map.
- Prefer precise TypeScript types; avoid new `any`, unsafe assertions, or blanket error suppression.
- Select only needed database columns. Validate untrusted input at the appropriate boundary. Keep secrets and private data out of logs.
- Split a file when doing so improves cohesion or reuse; a fixed line count alone is not a reason to expand the diff.
- Do not add React Query, Zod, or any other dependency unless it is present or approved for the task. Follow this repository's actual state and forms stack.
- Verify the changed behavior with acceptance-relevant checks. Avoid formatting, renaming, and module-wide cleanup outside scope.
