-- Migration: 087_create_prepack_formulation_audit_and_fields.sql
-- Description: Add clinical compounding formulation fields to prepack_items and create prepack_formulation_audit_logs table

-- 1. Extend prepack_items with compounding formulation specification fields
ALTER TABLE prepack_items 
  ADD COLUMN IF NOT EXISTS standard_formula_breakdown JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preparation_steps JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS equipment_required JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS in_process_qc JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cautions_and_warnings JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS beyond_use_date_days INTEGER DEFAULT 90,
  ADD COLUMN IF NOT EXISTS container_specs TEXT;

-- 2. Create prepack_formulation_audit_logs table
CREATE TABLE IF NOT EXISTS prepack_formulation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT,
  action TEXT NOT NULL DEFAULT 'UPDATE',
  changed_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  change_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_prepack_formulation_audit_item 
  ON prepack_formulation_audit_logs(prepack_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prepack_formulation_audit_hospital 
  ON prepack_formulation_audit_logs(hospital_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE prepack_formulation_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access for prepack_formulation_audit_logs" ON prepack_formulation_audit_logs;
CREATE POLICY "Allow read access for prepack_formulation_audit_logs"
  ON prepack_formulation_audit_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for prepack_formulation_audit_logs" ON prepack_formulation_audit_logs;
CREATE POLICY "Allow insert for prepack_formulation_audit_logs"
  ON prepack_formulation_audit_logs FOR INSERT
  WITH CHECK (true);
