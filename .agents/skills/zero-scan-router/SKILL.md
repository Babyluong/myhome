---
name: zero-scan-router
description: Locate H.O.M.E. module entry points with the existing router and focused source checks before broad exploration.
---

# Focused module routing

- If the task already names exact files, start there. Otherwise, for a module task read only its matching `.agents/CODEBASE_ROUTER.json` entry. Governance and non-module tasks do not require a module lookup.
- Treat router paths and tables as hints. Verify referenced files and actual schema before changing behavior; do not duplicate the router matrix in this skill.
- Use `codebase-memory` for structural questions, with its coverage and source-fallback requirements. Use scoped `rg` for literals and configuration. Expand the scope when evidence requires it.
- Read relevant line ranges rather than entire large files. Mark truncated results and retrieve omitted matches or diagnostic ranges needed for the conclusion. Never turn an output limit into an absence claim.
- Avoid repeated whole-repository listings. There is no hard three-call limit and no requirement to edit before an investigation is complete.

Use [token-efficiency](../token-efficiency/SKILL.md) for output and handoff discipline. Preserve isolated test fixtures and required gates; routing never authorizes querying production data.
