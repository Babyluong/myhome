---
name: frontend-architecture
description: Choose component boundaries, reusable React composition, and state ownership for H.O.M.E. UI changes. Use for new or substantially changed frontend structure.
---

# Frontend Architecture

Give Babyluong component boundaries that follow the existing application, not a generic rewrite.

1. Locate the current route, page, nearby components, data interface, and design tokens using targeted searches.
2. Keep data access and authorization in BabyHien's backend slice. Treat the handed-off types and callbacks as the UI contract.
3. Compose components around visible responsibilities, state ownership, and reuse. Use explicit variants for meaningful alternatives; do not create abstractions used once without a concrete benefit.
4. Preserve the current React 18, Vite, and React Router stack. Do not apply React 19 or Next.js-only instructions. Check actual package versions before relying on library behavior.
5. Prefer existing design tokens, routes, accessibility patterns, and component conventions. Do not add a dependency or replace the design system as part of a UI slice.
6. Return a brief component/data-boundary summary, affected files, and any contract request to Amri.

## Upstream

Adapted from the composition guidance in [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md), MIT. The upstream React 19 and Next.js examples do not apply to H.O.M.E.; the installed stack and Amri's file manifest govern.
