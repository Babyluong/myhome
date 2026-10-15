---
name: supabase-postgres-best-practices
description: Apply Supabase and PostgreSQL guidance when changing schemas, SQL, migrations, indexes, database functions, or RLS. Use for database and tenant-data security changes.
---

# Supabase and PostgreSQL

1. Confirm tables, columns, relationships, existing policies, and migration conventions from the repository's schema sources before writing SQL.
2. Check the applicable category in [Supabase's maintained Postgres guidance](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices): query performance, connection management, RLS/security, schema, locking, or data access. Consult individual source rules only when relevant.
3. Verify tenant boundaries and grants as well as policy expressions. Treat client-side filtering as presentation, never access control.
4. Design migrations to follow the project's rollout and rollback conventions. Do not run production database changes.
5. Test the changed policy/query against isolated fixtures or a test database where available. Return the exact tables, columns, policies, risks, and evidence to Amri.

Do not invent SQL APIs or pretend an upstream MCP/database tool is available. If the source guidance cannot be fetched, use repository migrations and official PostgreSQL/Supabase documentation and say what could not be verified.

## Upstream

The source skill is MIT-licensed and maintained by Supabase. This short routing/adaptation document does not copy its full text; record a pinned commit and any future imported reference before distributing copied rule content.
