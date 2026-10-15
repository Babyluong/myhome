---
name: security-gate
description: "Verify affected authentication, authorization, tenant boundaries, sensitive data, uploads and governed writes against the actual H.O.M.E. contracts. Report evidence to Amri."
---

# Security gate

BabyHien owns security decisions. Apply root AGENTS.md and the approved task; select checks for the changed behavior. Mark each applicable check PASS, FAIL or BLOCKED with evidence; use NOT APPLICABLE with a reason for unrelated checks. Send every result and blocker to Amri. A passing checklist is evidence for Amri's acceptance, not permission to ship.

## Affected checks

- Validate untrusted inputs at the trusted service/server boundary using the established schema and installed validation tools. UI validation is useful feedback and cannot establish authorization.
- Verify authenticated identity, actual role policy and tenant scope for sensitive reads and writes. Enforce access in the trusted backend/RLS; do not rely on UI visibility. Treat cached session state as an input, not independent proof of identity.
- Inspect the affected tables, functions, services and policies before changing contracts. Preserve their RLS and governed audit events. Use actual audit field names and retention/delete policy; do not invent columns, roles or universal soft-delete rules.
- Prevent SQL injection, unsafe HTML and unintended sensitive-data logging/storage. Return only fields needed by the authorized workflow. Upload limits and accepted types come from the actual feature contract, not a generic hardcoded cap.
- Keep service-role keys, passwords and private tokens server-side. Vite client environment values are public after bundling; import.meta.env is not a secret store. Public Supabase client configuration may be bundled only when intended and protected by backend authorization.
- Apply the existing rate-limit, replay/idempotency and destructive-action controls where relevant. A UI debounce is not a server rate limit.
- Use isolated fixtures and non-production test resources. Read production records only when specifically needed and authorized; never fabricate production records or mask query failures.

## Handoff

Report affected behavior, policy/schema evidence, checks and observed results, unresolved risks, changed paths and requested owner to Amri. BabyAaralyn verifies assigned cases; only Amri accepts the task. Credential rotation, deployment and access changes require the authorization appropriate to that action.
