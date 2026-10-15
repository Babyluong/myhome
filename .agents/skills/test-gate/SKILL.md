---
name: test-gate
description: Verify the acceptance criteria assigned to BabyAaralyn and prepare an evidence-based H.O.M.E. QA report. Use when feature behavior changes or the task specifically requests testing.
---

# Test gate

Select the narrowest check that proves each criterion. Use Playwright for changed browser behavior, not documentation-only work.

1. Map each applicable criterion to a test or manual observation before running it.
2. Run focused relevant checks. Add loading, empty, error, role/access, keyboard/mobile, or interaction cases only when the slice affects those behaviors.
3. Do not require all HTTP requests to be 200; assess their documented, expected status and resulting behavior. Do not claim production readiness from a smoke suite.
4. Preserve test failures. Reproduce them and send expected, actual, steps/evidence, and likely owner to Amri. Do not repair feature code or weaken assertions.
5. Rerun a failed check only after a relevant change, a flaky result, or a concrete diagnosis requires it. Never repeat an unchanged passing suite by default.

## Report

Record task/date and each criterion's result (`PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`), test/evidence, bugs and owner requests, and remaining coverage limits. A skipped check is never PASS. Save reports and screenshots in exact assigned QA paths; include revision, viewport, theme and motion settings. Missing or unavailable artifacts remain unverified. Static scans and successful builds do not establish rendered quality, authorization, RLS or production readiness.

## Upstream

Playwright's [test agent definitions](https://github.com/microsoft/playwright/tree/main/packages/playwright/src/agents) inform bounded planning and diagnosis. Adapt to tools available in this session; do not use failure suppression or automatic `fixme` as a product fix.
