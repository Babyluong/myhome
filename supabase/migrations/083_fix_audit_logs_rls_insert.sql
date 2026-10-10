-- ==============================================================================
-- Migration 083: Fix audit_logs RLS policy to allow anon and authenticated insert
-- ==============================================================================
-- Description:
-- Previously, only role 'authenticated' was allowed to insert into audit_logs.
-- However, system navigation logs, login/logout events, and unauthenticated/guest
-- sessions make insert attempts which returned HTTP 401 (Unauthorized) from PostgREST.
-- This migration updates the INSERT policy to permit both 'anon' and 'authenticated'.

DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "allow_insert_audit_logs" ON audit_logs;

CREATE POLICY "allow_insert_audit_logs"
  ON audit_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
