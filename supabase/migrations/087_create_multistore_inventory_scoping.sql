-- ==============================================================================
-- Migration: 087_create_multistore_inventory_scoping.sql
-- Description: Implement Multi-Store & Department-Scoped Pharmacy Inventory Architecture.
--              Registers official store locations for Pharmacy Logistics, Inpatient,
--              Outpatient, and Emergency. Adds store_location_id and department_id
--              to facility_drug_inventory & facility_nondrug_inventory.
--              Backfills Logistics store and seeds genuine Inpatient Pharmacy stock.
-- ==============================================================================

-- 1. Ensure Official Store Locations exist in pharmacy_stock_locations
-- 1.1 Update Main Store / Logistics Location
UPDATE pharmacy_stock_locations
SET 
  location_code = 'LOC-LOG-01',
  location_name = 'Stor Logistik Farmasi (Stor Utama)',
  location_type = 'store',
  department_id = '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880',
  hospital_id = '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  is_active = true
WHERE id = 'a6e4cb7d-6dba-42a1-9cb6-3a7fcc953fbe';

-- 1.2 Insert or Update Farmasi Pesakit Dalam (Inpatient Pharmacy)
INSERT INTO pharmacy_stock_locations (
  id,
  hospital_id,
  location_code,
  location_name,
  location_type,
  department_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  '2d1b7112-9c3a-4e2b-bb43-e8417e349a01',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'LOC-IPD-01',
  'Farmasi Pesakit Dalam (Inpatient)',
  'store',
  'df4ffb0e-aef5-437e-af01-a586b4dc27fe', -- Pharmacy In Patient
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  location_code = EXCLUDED.location_code,
  location_name = EXCLUDED.location_name,
  department_id = EXCLUDED.department_id,
  is_active = true,
  updated_at = NOW();

-- 1.3 Insert or Update Farmasi Pesakit Luar (Outpatient Pharmacy)
INSERT INTO pharmacy_stock_locations (
  id,
  hospital_id,
  location_code,
  location_name,
  location_type,
  department_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  '3d1b7112-9c3a-4e2b-bb43-e8417e349a02',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'LOC-OPD-01',
  'Farmasi Pesakit Luar (Outpatient)',
  'store',
  '37f69fac-00f2-426c-944f-8eeeae25e858', -- Pharmacy Outpatient
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  location_code = EXCLUDED.location_code,
  location_name = EXCLUDED.location_name,
  department_id = EXCLUDED.department_id,
  is_active = true,
  updated_at = NOW();

-- 1.4 Insert or Update Farmasi Kecemasan & Trauma (ETU)
INSERT INTO pharmacy_stock_locations (
  id,
  hospital_id,
  location_code,
  location_name,
  location_type,
  department_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  '4d1b7112-9c3a-4e2b-bb43-e8417e349a03',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'LOC-ETU-01',
  'Farmasi Kecemasan & Trauma (ETU)',
  'store',
  '3689ecc1-8df0-4be5-8099-0aecf5ce7e74', -- Pharmacy Emergency
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  location_code = EXCLUDED.location_code,
  location_name = EXCLUDED.location_name,
  department_id = EXCLUDED.department_id,
  is_active = true,
  updated_at = NOW();

-- 1.5 Insert or Update Farmasi Galenikal & Pembungkusan Semula
INSERT INTO pharmacy_stock_locations (
  id,
  hospital_id,
  location_code,
  location_name,
  location_type,
  department_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  '5d1b7112-9c3a-4e2b-bb43-e8417e349a04',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'LOC-PRE-01',
  'Farmasi Galenikal & Pembungkusan Semula',
  'store',
  '68bead0d-cd9d-426d-85d7-45338b2e8b8d', -- Pharmacy Galenical
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  location_code = EXCLUDED.location_code,
  location_name = EXCLUDED.location_name,
  department_id = EXCLUDED.department_id,
  is_active = true,
  updated_at = NOW();

-- 2. Alter facility_drug_inventory & facility_nondrug_inventory tables
ALTER TABLE facility_drug_inventory
  ADD COLUMN IF NOT EXISTS store_location_id UUID REFERENCES pharmacy_stock_locations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE facility_nondrug_inventory
  ADD COLUMN IF NOT EXISTS store_location_id UUID REFERENCES pharmacy_stock_locations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- 3. Backfill existing records to Stor Logistik Farmasi (LOC-LOG-01)
UPDATE facility_drug_inventory
SET 
  store_location_id = 'a6e4cb7d-6dba-42a1-9cb6-3a7fcc953fbe',
  department_id = '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880'
WHERE store_location_id IS NULL;

UPDATE facility_nondrug_inventory
SET 
  store_location_id = 'a6e4cb7d-6dba-42a1-9cb6-3a7fcc953fbe',
  department_id = '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880'
WHERE store_location_id IS NULL;

-- 4. Create Performance Indexes for Fast Multi-Store Lookups
CREATE INDEX IF NOT EXISTS idx_fdi_store_location ON facility_drug_inventory(hospital_id, store_location_id);
CREATE INDEX IF NOT EXISTS idx_fndi_store_location ON facility_nondrug_inventory(hospital_id, store_location_id);
CREATE INDEX IF NOT EXISTS idx_fdi_department ON facility_drug_inventory(department_id);
CREATE INDEX IF NOT EXISTS idx_fndi_department ON facility_nondrug_inventory(department_id);

-- 5. Seed Real Clinical Inpatient Formulary Items for Farmasi Pesakit Dalam (LOC-IPD-01)
-- Delete any existing records for LOC-IPD-01 to ensure idempotent clean execution
DELETE FROM facility_drug_inventory WHERE store_location_id = '2d1b7112-9c3a-4e2b-bb43-e8417e349a01';
DELETE FROM facility_nondrug_inventory WHERE store_location_id = '2d1b7112-9c3a-4e2b-bb43-e8417e349a01';
DELETE FROM pharmacy_stock_batches WHERE location_id = '2d1b7112-9c3a-4e2b-bb43-e8417e349a01';

-- Insert Inpatient Clinical Drugs
INSERT INTO facility_drug_inventory (
  id, hospital_id, drug_id, facility_stock, min_buffer_level,
  batch_number, expiry_date, location, notes, added_at, updated_at,
  store_location_id, department_id
) VALUES
-- Paracetamol 500mg Tablet
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'bdbe3882-164d-4607-a132-64d198b7553b', 450, 100, 'B260901', '2027-08-31', '[IPD-R1] Rak Ubat Oral > Aras 2', 'Stok harian wad dan dos unit', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Ceftriaxone 1g Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '3b733708-136b-448f-a423-68665ddebfa1', 85, 30, 'B260815', '2027-06-30', '[IPD-IV] Rak Infusi Intravena > Aras 1', 'Antibiotik lini pertama wad perubatan', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Metronidazole 500mg/100ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '113101b0-b224-466b-8e49-ea8651082f2f', 60, 20, 'B260712', '2027-05-31', '[IPD-IV] Rak Infusi Intravena > Aras 2', 'Kegunaan pembedahan & wad am', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Metronidazole 200mg Tablet
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'c210c3b6-a65b-44a2-8bd9-b90cbb12395b', 120, 40, 'B260605', '2027-09-30', '[IPD-R1] Rak Ubat Oral > Aras 3', 'Antibiotik oral', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Omeprazole 20mg Capsule
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '53c6dfa0-9b3d-48fb-a111-95a9af6e63d4', 320, 80, 'B260920', '2027-11-30', '[IPD-R1] Rak Ubat Oral > Aras 1', 'Perlindungan gastrik pesakit dalam', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Esomeprazole 40mg Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '8e610644-a09a-4e62-b066-c7a512613e61', 45, 15, 'B260518', '2027-04-30', '[IPD-IV] Rak Infusi Intravena > Aras 1', 'Pendarahan GI atas', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Ampicillin Sodium 500mg Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'a1a580e8-d423-45be-9329-7b75d8dd5828', 70, 25, 'B260401', '2027-03-31', '[IPD-IV] Rak Infusi Intravena > Aras 3', 'Wad paediatrik & am', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Tramadol Hydrochloride 50mg/ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '6bde82cb-74f8-48c3-ad17-9f697889b7e3', 35, 15, 'B260811', '2027-07-31', '[IPD-DDA] Peti Kawalan Ubat Berjadual', 'Analgesik pasca-pembedahan', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Tramadol HCL 50mg Kapsul/Tablet
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '3a6463ad-73c5-4520-9b4b-a2e5354da0d4', 80, 30, 'B260719', '2027-08-31', '[IPD-DDA] Peti Kawalan Ubat Berjadual', 'Kawalan kesakitan wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Paracetamol 10mg/ml in 100ml IV Infusion
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '97aff768-6587-4515-a1a7-2d2806a5a5e2', 95, 40, 'B260910', '2027-10-31', '[IPD-IV] Rak Infusi Intravena > Aras 2', 'Antipiretik & analgesik IV pesakit dalam', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Paracetamol 250mg/5ml Syrup
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '6d3b9bf2-611e-4fe4-8388-b05d9dbbed4a', 24, 10, 'B260322', '2027-05-31', '[IPD-SYR] Rak Sirap Paediatrik', 'Wad kanak-kanak', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Insulin Aspart 100iu/ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '274d75e9-9e2f-429f-8c45-277066a428f1', 18, 10, 'B260804', '2027-06-30', '[IPD-CH1] Chiller 2-8°C > Petak B-01', 'Kawalan glisemik wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Insulin Premixed 100iu/ml
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '59db8307-344c-4749-a9a9-5366b934be6e', 22, 10, 'B260614', '2027-07-31', '[IPD-CH1] Chiller 2-8°C > Petak B-02', 'Kawalan glisemik wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Morphine Sulphate 10 mg/ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'c4a73aa9-1e55-4202-9c42-00cc578dc4ce', 15, 10, 'B260228', '2027-04-30', '[IPD-DDA] Peti Kawalan Ubat Berjadual (Kunci Berganda)', 'Ubat terkawal DDA wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Potassium Chloride 1 g / 10 ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '775319b6-2745-4bd2-ab1c-d98aa907a774', 50, 20, 'B260505', '2027-05-31', '[IPD-HAM] Kabinet High Alert Medication', 'Elektrolit pekat - High Alert', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Sodium Chloride 0.9% 500mL IV Soln
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '6fb3055a-cbca-4c5f-ae5d-78e953c5022c', 160, 50, 'B260930', '2027-12-31', '[IPD-DRP] Rak Cecair Infusi Pukal', 'Cairan penghidratan wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Dextrose 5% Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'a8705a99-c8f2-46bc-9e52-4f361d99e196', 110, 40, 'B260825', '2027-11-30', '[IPD-DRP] Rak Cecair Infusi Pukal', 'Cairan penghidratan dextrose', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Water For Injection 10ml
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '3a7daabd-5eaa-4bae-a610-32146f348d64', 200, 60, 'B260715', '2027-10-31', '[IPD-IV] Rak Infusi Intravena > Aras 4', 'Pelarut suntikan', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Amoxicillin 250mg Capsule
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '7a618d97-f329-417e-b90e-56002a9a555a', 140, 50, 'B260610', '2027-06-30', '[IPD-R1] Rak Ubat Oral > Aras 2', 'Antibiotik wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Amoxicillin 500mg Capsule
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '2976fa9d-a6f2-4c1c-b65b-66af633bfe53', 210, 60, 'B260905', '2027-08-31', '[IPD-R1] Rak Ubat Oral > Aras 2', 'Antibiotik dos penuh', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Salbutamol 0.5% Inhalation Solution
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'a37a809a-c00d-480f-a4aa-3e8e9d382602', 30, 15, 'B260412', '2027-05-31', '[IPD-NEB] Rak Nebulizer Pesakit Dalam', 'Rawatan asma / respiratori akut wad', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Hydrocortisone Sodium Succinate 100mg Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '40ee3230-de7e-4f80-b92c-00eaf7b3df5d', 40, 15, 'B260721', '2027-07-31', '[IPD-IV] Rak Infusi Intravena > Aras 1', 'Kortikosteroid suntikan kecemasan', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Dexamethasone 0.5 mg Tablet
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'ed02f2a6-e835-450f-a635-ee97ac87e502', 85, 30, 'B260315', '2027-06-30', '[IPD-R1] Rak Ubat Oral > Aras 4', 'Steroid anti-radang', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Ciprofloxacin 500 mg Tablet
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', '34d06bf3-0b82-4ff8-8c1d-66bfb36d5506', 75, 25, 'B260818', '2027-08-31', '[IPD-R1] Rak Ubat Oral > Aras 3', 'Antibiotik quinolone', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe'),
-- Noradrenaline Acid Tartrate 4 mg/4 ml Injection
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'c9f3c219-6bf4-4cb3-a0f6-6b3b06370709', 25, 10, 'B260520', '2027-04-30', '[IPD-HAM] Kabinet High Alert Medication', 'Inotropik / Vasopressor wad rawatan rapi', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe');

-- Seed Inpatient Clinical Non-Drugs
INSERT INTO facility_nondrug_inventory (
  id, hospital_id, nondrug_id, facility_stock, min_buffer_level,
  notes, location, added_at, updated_at, store_location_id, department_id
) VALUES
-- Endotracheal Tube 7.0mm, Uncuffed
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'a516c031-1e3a-4080-98f9-fce4111c15b1', 15, 5, 'Tiub intubasi wad & dewan bedah', '[IPD-ND1] Rak Alat Bukan Ubat Pesakit Dalam > Petak 1', NOW(), NOW(), '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'df4ffb0e-aef5-437e-af01-a586b4dc27fe');

-- Seed Corresponding Active Batches for Inpatient Pharmacy into pharmacy_stock_batches
INSERT INTO pharmacy_stock_batches (
  id, hospital_id, item_type, item_id, batch_number, expiry_date,
  quantity_received, quantity_on_hand, quantity_reserved,
  location_id, status, received_date, created_at, updated_at
) VALUES
-- Paracetamol 500mg Batch for IPD
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'drug', 'bdbe3882-164d-4607-a132-64d198b7553b', 'B260901', '2027-08-31', 500, 450, 0, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'available', '2026-09-01', NOW(), NOW()),
-- Ceftriaxone 1g Batch for IPD
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'drug', '3b733708-136b-448f-a423-68665ddebfa1', 'B260815', '2027-06-30', 100, 85, 0, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'available', '2026-08-15', NOW(), NOW()),
-- Metronidazole 500mg/100ml Batch for IPD
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'drug', '113101b0-b224-466b-8e49-ea8651082f2f', 'B260712', '2027-05-31', 80, 60, 0, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'available', '2026-07-12', NOW(), NOW()),
-- Omeprazole 20mg Capsule Batch for IPD
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'drug', '53c6dfa0-9b3d-48fb-a111-95a9af6e63d4', 'B260920', '2027-11-30', 400, 320, 0, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'available', '2026-09-20', NOW(), NOW()),
-- Sodium Chloride 0.9% 500ml Batch for IPD
(gen_random_uuid(), '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'drug', '6fb3055a-cbca-4c5f-ae5d-78e953c5022c', 'B260930', '2027-12-31', 200, 160, 0, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01', 'available', '2026-09-30', NOW(), NOW());
