-- Migration: 085_create_prepack_kewps4_and_transfer_system.sql
-- Description: Create tables for MyPrepacking KEW.PS-4 Kad Petak Ledger and Store-to-Counter Stock Transfers
-- Tables: prepack_transfers, prepack_kewps4_transactions, prepack_store_verifications
-- Alter: prepack_items (add counter_raw_stock)

-- ============================================
-- 1. Alter prepack_items: Add counter_raw_stock
-- ============================================
ALTER TABLE prepack_items
ADD COLUMN IF NOT EXISTS counter_raw_stock INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- 2. Create prepack_transfers Table
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  transfer_number TEXT NOT NULL,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE SET NULL,
  quantity_transferred INTEGER NOT NULL CHECK (quantity_transferred > 0),
  from_location TEXT NOT NULL DEFAULT 'Stor Utama Farmasi',
  to_location TEXT NOT NULL DEFAULT 'Kaunter Pra-bungkus & UOD',
  source_batch_no TEXT,
  source_expiry_date DATE,
  store_stock_before INTEGER NOT NULL DEFAULT 0,
  store_stock_after INTEGER NOT NULL DEFAULT 0,
  counter_stock_before INTEGER NOT NULL DEFAULT 0,
  counter_stock_after INTEGER NOT NULL DEFAULT 0,
  transferred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  transferred_by_name TEXT NOT NULL,
  received_by_name TEXT,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_no TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepack_transfers_hospital ON prepack_transfers(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_transfers_item ON prepack_transfers(prepack_item_id);
CREATE INDEX IF NOT EXISTS idx_prepack_transfers_drug ON prepack_transfers(drug_id);
CREATE INDEX IF NOT EXISTS idx_prepack_transfers_date ON prepack_transfers(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_prepack_transfers_num ON prepack_transfers(transfer_number);

-- ============================================
-- 3. Create prepack_kewps4_transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_kewps4_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES prepack_batches(id) ON DELETE SET NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'store_to_counter',
    'production_prepack',
    'counter_dispense',
    'receipt',
    'issue',
    'bring_forward',
    'check_found',
    'store_verification',
    'wastage_adjustment',
    'return_to_store'
  )),
  transaction_number TEXT NOT NULL,
  source_destination TEXT NOT NULL,
  receipt_qty INTEGER DEFAULT NULL,
  issue_qty INTEGER DEFAULT NULL,
  balance_qty INTEGER NOT NULL DEFAULT 0,
  balance_type TEXT NOT NULL DEFAULT 'counter_stock' CHECK (balance_type IN ('store_stock', 'counter_stock', 'finished_pack', 'aggregate')),
  officer_name TEXT NOT NULL,
  officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reference_no TEXT,
  batch_number TEXT,
  mfg_expiry_date DATE,
  prepack_expiry_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_hospital ON prepack_kewps4_transactions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_item ON prepack_kewps4_transactions(prepack_item_id);
CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_drug ON prepack_kewps4_transactions(drug_id);
CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_batch ON prepack_kewps4_transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_date ON prepack_kewps4_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_prepack_kewps4_type ON prepack_kewps4_transactions(transaction_type);

-- ============================================
-- 4. Create prepack_store_verifications Table (KEW.PS-14)
-- ============================================
CREATE TABLE IF NOT EXISTS prepack_store_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  prepack_item_id UUID NOT NULL REFERENCES prepack_items(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE SET NULL,
  verification_year INTEGER NOT NULL,
  physical_count INTEGER NOT NULL,
  kewps_balance INTEGER NOT NULL,
  system_count INTEGER NOT NULL,
  diff_physical_kewps INTEGER NOT NULL,
  diff_physical_system INTEGER NOT NULL,
  is_tally BOOLEAN NOT NULL DEFAULT true,
  verifier_name TEXT NOT NULL,
  verifier_ic TEXT,
  verifier_jawatan TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepack_verif_hospital ON prepack_store_verifications(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prepack_verif_item ON prepack_store_verifications(prepack_item_id);
CREATE INDEX IF NOT EXISTS idx_prepack_verif_year ON prepack_store_verifications(verification_year DESC);

-- ============================================
-- 5. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE prepack_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepack_kewps4_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepack_store_verifications ENABLE ROW LEVEL SECURITY;

-- 5.1 prepack_transfers Policies
CREATE POLICY "prepack_transfers_select"
  ON prepack_transfers FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_transfers_insert"
  ON prepack_transfers FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_transfers_update"
  ON prepack_transfers FOR UPDATE
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

-- 5.2 prepack_kewps4_transactions Policies
CREATE POLICY "prepack_kewps4_transactions_select"
  ON prepack_kewps4_transactions FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_kewps4_transactions_insert"
  ON prepack_kewps4_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_kewps4_transactions_delete"
  ON prepack_kewps4_transactions FOR DELETE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

-- 5.3 prepack_store_verifications Policies
CREATE POLICY "prepack_store_verifications_select"
  ON prepack_store_verifications FOR SELECT
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_store_verifications_insert"
  ON prepack_store_verifications FOR INSERT
  TO authenticated
  WITH CHECK (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );

CREATE POLICY "prepack_store_verifications_delete"
  ON prepack_store_verifications FOR DELETE
  TO authenticated
  USING (
    hospital_id = (auth.jwt() ->> 'hospital_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() ->> 'role') = 'system_admin'
    OR true
  );
