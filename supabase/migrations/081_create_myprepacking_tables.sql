-- Migration: 081_create_myprepacking_tables.sql
-- Description: Create tables for MyPrepacking Module (UOD & Bulk Prepacking Management)
-- Tables: prepack_items, prepack_batches, prepack_usage_logs

-- ============================================
-- 1. Create prepack_items Table
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE SET NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  generic_name TEXT,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('uod', 'prepack_liquid', 'prepack_tablet', 'prepack_cream', 'extemporaneous', 'other')),
  dosage_form TEXT NOT NULL,
  strength TEXT,
  units_per_pack INTEGER NOT NULL DEFAULT 1,
  package_type TEXT NOT NULL DEFAULT 'sachet',
  min_buffer_level INTEGER NOT NULL DEFAULT 50,
  optimal_batch_size INTEGER NOT NULL DEFAULT 200,
  shelf_life_months INTEGER NOT NULL DEFAULT 6,
  storage_instructions TEXT DEFAULT 'Simpan di tempat kering dan sejuk di bawah 25°C.',
  label_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hospital_id, item_code)
);

CREATE INDEX IF NOT EXISTS idx_prepack_items_hospital ON prepack_items(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_items_drug ON prepack_items(drug_id);
CREATE INDEX IF NOT EXISTS idx_prepack_items_pack_type ON prepack_items(pack_type);
CREATE INDEX IF NOT EXISTS idx_prepack_items_status ON prepack_items(status);

-- ============================================
-- 2. Create prepack_batches Table
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  mfg_batch_number TEXT NOT NULL,
  mfg_expiry_date DATE NOT NULL,
  pack_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prepack_expiry_date DATE NOT NULL,
  quantity_packed INTEGER NOT NULL CHECK (quantity_packed > 0),
  current_balance INTEGER NOT NULL CHECK (current_balance >= 0),
  wastage_quantity INTEGER NOT NULL DEFAULT 0,
  packed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  packed_by_name TEXT,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_by_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  qr_code_data TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quarantined', 'depleted', 'expired', 'recalled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hospital_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_prepack_batches_hospital ON prepack_batches(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_batches_item ON prepack_batches(prepack_item_id);
CREATE INDEX IF NOT EXISTS idx_prepack_batches_status ON prepack_batches(status);
CREATE INDEX IF NOT EXISTS idx_prepack_batches_expiry ON prepack_batches(prepack_expiry_date);
CREATE INDEX IF NOT EXISTS idx_prepack_batches_batch_num ON prepack_batches(batch_number);

-- ============================================
-- 3. Create prepack_usage_logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES prepack_batches(id) ON DELETE CASCADE,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ward_supply', 'outpatient_dispense', 'inpatient_trolley', 'wastage_disposal', 'stock_adjustment', 'return_to_stock')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  ward_name TEXT,
  recipient_name TEXT,
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_by_name TEXT,
  reference_no TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepack_usage_hospital ON prepack_usage_logs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_usage_batch ON prepack_usage_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_prepack_usage_item ON prepack_usage_logs(prepack_item_id);
CREATE INDEX IF NOT EXISTS idx_prepack_usage_created ON prepack_usage_logs(created_at DESC);

-- ============================================
-- 4. Triggers for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_prepack_items_updated_at ON prepack_items;
CREATE TRIGGER update_prepack_items_updated_at
  BEFORE UPDATE ON prepack_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prepack_batches_updated_at ON prepack_batches;
CREATE TRIGGER update_prepack_batches_updated_at
  BEFORE UPDATE ON prepack_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE prepack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepack_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepack_usage_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 prepack_items Policies
CREATE POLICY "prepack_items_select"
  ON prepack_items FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true -- fallback permissive for hospital authenticated staff
  );

CREATE POLICY "prepack_items_insert"
  ON prepack_items FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_items_update"
  ON prepack_items FOR UPDATE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  )
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_items_delete"
  ON prepack_items FOR DELETE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

-- 5.2 prepack_batches Policies
CREATE POLICY "prepack_batches_select"
  ON prepack_batches FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_batches_insert"
  ON prepack_batches FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_batches_update"
  ON prepack_batches FOR UPDATE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  )
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_batches_delete"
  ON prepack_batches FOR DELETE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

-- 5.3 prepack_usage_logs Policies
CREATE POLICY "prepack_usage_logs_select"
  ON prepack_usage_logs FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_usage_logs_insert"
  ON prepack_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_usage_logs_update"
  ON prepack_usage_logs FOR UPDATE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  )
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );
