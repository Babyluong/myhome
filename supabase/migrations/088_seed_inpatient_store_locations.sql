-- ==============================================================================
-- Migration: 088_seed_inpatient_store_locations.sql
-- Description: Seed Standard KKM In-Patient Pharmacy (Farmasi Pesakit Dalam / IPD)
--              physical store locations and sub-locations (racks, shelves, drawers)
--              for Hospital Lawas (85bb6adc-b868-428b-83f4-e5af2f5cf904).
-- ==============================================================================

-- 1. Insert Standard IPD Store Locations into store_locations
INSERT INTO public.store_locations (
  id,
  hospital_id,
  store_name,
  cabinet_rack,
  shelf_level,
  location_code,
  location_type,
  storage_condition,
  description,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'loc-ipd-oral-001',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'Stor Ubat Oral (Pesakit Dalam)',
  '-',
  '-',
  'IPD-ORAL-001',
  'drug',
  'ambient',
  'Stor simpanan ubat tablet, kapsul & formulari oral pesakit dalam',
  true,
  NOW(),
  NOW()
),
(
  'loc-ipd-iv-001',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'Stor Injeksi & Infusi IV',
  '-',
  '-',
  'IPD-IV-001',
  'drug',
  'ambient',
  'Stor simpanan ampul injeksi, vial antibiotik & cecair infusi intravena pesakit dalam',
  true,
  NOW(),
  NOW()
),
(
  'loc-ipd-dda-001',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'Peti Kawalan DDA & Psikotropik',
  '-',
  '-',
  'IPD-DDA-001',
  'drug',
  'controlled',
  'Peti besi berkunci keselamatan dua untuk Dangerous Drugs & Ubat Terkawal pesakit dalam',
  true,
  NOW(),
  NOW()
),
(
  'loc-ipd-chill-001',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'Peti Sejuk Farmasi Pesakit Dalam (2-8°C)',
  '-',
  '-',
  'IPD-CHILL-001',
  'drug',
  'cold_2_8c',
  'Peti sejuk farmasi rangkaian sejuk 2-8°C untuk insulin, vaksin & biologik wad',
  true,
  NOW(),
  NOW()
),
(
  'loc-ipd-emg-001',
  '85bb6adc-b868-428b-83f4-e5af2f5cf904',
  'Troli Kecemasan & Resusitasi Wad',
  '-',
  '-',
  'IPD-EMG-001',
  'drug',
  'ambient',
  'Troli kecemasan & kit resusitasi ACLS untuk kegunaan wad pesakit dalam',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (hospital_id, location_code) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  location_type = EXCLUDED.location_type,
  storage_condition = EXCLUDED.storage_condition,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. Insert Standard Sub-Locations for IPD into store_sub_locations
INSERT INTO public.store_sub_locations (
  id,
  hospital_id,
  store_id,
  store_code,
  type,
  name,
  code,
  parent_name,
  notes,
  created_at,
  updated_at
) VALUES
-- Rak Oral A & Shelves
('sub-ipd-ora', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'rack', 'Rak Oral A', 'RAC-OA', NULL, 'Rak ubat tablet & kapsul huruf A-Z', NOW(), NOW()),
('sub-ipd-ora-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 1 (Tablet A-C)', 'L1', 'Rak Oral A', 'Abacavir, Amlodipine, Captopril', NOW(), NOW()),
('sub-ipd-ora-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 2 (Tablet D-F)', 'L2', 'Rak Oral A', 'Dapagliflozin, Enalapril, Frusemide', NOW(), NOW()),
('sub-ipd-ora-l3', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 3 (Tablet G-L)', 'L3', 'Rak Oral A', 'Gliclazide, Haloperidol, Levothyroxine', NOW(), NOW()),
('sub-ipd-ora-l4', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 4 (Tablet M-P)', 'L4', 'Rak Oral A', 'Metformin, Omeprazole, Paracetamol', NOW(), NOW()),
('sub-ipd-ora-l5', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 5 (Tablet Q-Z)', 'L5', 'Rak Oral A', 'Ramipril, Salbutamol, Warfarin', NOW(), NOW()),

-- Rak Oral B (Cecair) & Shelves
('sub-ipd-orb', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'rack', 'Rak Oral B (Cecair)', 'RAC-OB', NULL, 'Rak persediaan cecair, sirap & suspensi', NOW(), NOW()),
('sub-ipd-orb-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 1 (Sirap & Suspensi)', 'L1', 'Rak Oral B (Cecair)', 'Sirap Paracetamol, Sirap Promethazine', NOW(), NOW()),
('sub-ipd-orb-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-oral-001', 'IPD-ORAL-001', 'level', 'Level 2 (Ubat Titik & Inhaler)', 'L2', 'Rak Oral B (Cecair)', 'MDI Salbutamol, Budesonide Respules', NOW(), NOW()),

-- Rak Injeksi IV
('sub-ipd-iv1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'rack', 'Rak Injeksi IV', 'RAC-IV', NULL, 'Rak ampul dan vial injeksi pesakit dalam', NOW(), NOW()),
('sub-ipd-iv1-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Level 1 (Antibiotik IV)', 'L1', 'Rak Injeksi IV', 'IV Ceftriaxone, IV Ampicillin, IV Cefuroxime', NOW(), NOW()),
('sub-ipd-iv1-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Level 2 (Analgesik & Antipiretik)', 'L2', 'Rak Injeksi IV', 'IV Paracetamol, IV Tramadol, IV Ketorolac', NOW(), NOW()),
('sub-ipd-iv1-l3', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Level 3 (Kardiovaskular & GI)', 'L3', 'Rak Injeksi IV', 'IV Frusemide, IV Pantoprazole, IV Metoclopramide', NOW(), NOW()),
('sub-ipd-iv1-l4', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Level 4 (Elektrolit & Pekat)', 'L4', 'Rak Injeksi IV', 'IV Potassium Chloride (High Alert)', NOW(), NOW()),

-- Palet Larutan Infusi Pukal
('sub-ipd-pal', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'pallet', 'Palet Infusi Pukal', 'PAL-IV', NULL, 'Palet botol/beg larutan infusi intravena 500ml', NOW(), NOW()),
('sub-ipd-pal-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Tingkat 1 (Normal Saline 0.9%)', 'L1', 'Palet Infusi Pukal', 'Sodium Chloride 0.9% 500ml', NOW(), NOW()),
('sub-ipd-pal-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-iv-001', 'IPD-IV-001', 'level', 'Tingkat 2 (Dextrose 5% & Hartmann)', 'L2', 'Palet Infusi Pukal', 'Dextrose 5% 500ml, Hartmann Solution 500ml', NOW(), NOW()),

-- Peti Kawalan DDA
('sub-ipd-dda', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-dda-001', 'IPD-DDA-001', 'cabinet', 'Kabinet Berkunci DDA', 'CAB-DDA', NULL, 'Kabinet berkunci dua rekod buku daftar DDA', NOW(), NOW()),
('sub-ipd-dda-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-dda-001', 'IPD-DDA-001', 'level', 'Tingkat 1 (Dangerous Drugs / Opioid)', 'L1', 'Kabinet Berkunci DDA', 'Inj Morphine 10mg/ml, Inj Fentanyl 50mcg/ml', NOW(), NOW()),
('sub-ipd-dda-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-dda-001', 'IPD-DDA-001', 'level', 'Tingkat 2 (Psikotropik & Sedatif)', 'L2', 'Kabinet Berkunci DDA', 'Inj Midazolam 5mg/ml, Inj Diazepam 10mg/2ml', NOW(), NOW()),

-- Chiller Pesakit Dalam (2-8°C)
('sub-ipd-chl', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-chill-001', 'IPD-CHILL-001', 'rack', 'Chiller Pesakit Dalam (2-8°C)', 'CHILL-01', NULL, 'Peti sejuk farmasi rangkaian sejuk 2-8°C', NOW(), NOW()),
('sub-ipd-chl-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-chill-001', 'IPD-CHILL-001', 'level', 'Shelf 1 (Insulin & Analog)', 'S1', 'Chiller Pesakit Dalam (2-8°C)', 'Insulin Actrapid, Insulatard, Mixtard', NOW(), NOW()),
('sub-ipd-chl-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-chill-001', 'IPD-CHILL-001', 'level', 'Shelf 2 (Vaksin & Biologik)', 'S2', 'Chiller Pesakit Dalam (2-8°C)', 'Hepatitis B Vaccine, ATS, Rabies Vaccine', NOW(), NOW()),
('sub-ipd-chl-l3', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-chill-001', 'IPD-CHILL-001', 'level', 'Shelf 3 (Oksitosin & Produk Sejuk)', 'S3', 'Chiller Pesakit Dalam (2-8°C)', 'Inj Oxytocin 10 IU/ml, Inj Ergometrine', NOW(), NOW()),

-- Crash Cart / Troli Kecemasan
('sub-ipd-crt', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-emg-001', 'IPD-EMG-001', 'rack', 'Troli Resusitasi / Crash Cart', 'CART-01', NULL, 'Troli kecemasan & henti jantung wad', NOW(), NOW()),
('sub-ipd-crt-l1', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-emg-001', 'IPD-EMG-001', 'level', 'Drawer 1 (Airway & Tiub)', 'D1', 'Troli Resusitasi / Crash Cart', 'Endotracheal Tube, Laryngoscope, Stylet', NOW(), NOW()),
('sub-ipd-crt-l2', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-emg-001', 'IPD-EMG-001', 'level', 'Drawer 2 (Ubat Resusitasi ACLS)', 'D2', 'Troli Resusitasi / Crash Cart', 'Inj Adrenaline 1mg/ml, Inj Atropine 1mg/ml, Inj Amiodarone', NOW(), NOW()),
('sub-ipd-crt-l3', '85bb6adc-b868-428b-83f4-e5af2f5cf904', 'loc-ipd-emg-001', 'IPD-EMG-001', 'level', 'Drawer 3 (IV Cannula & Set Infusi)', 'D3', 'Troli Resusitasi / Crash Cart', 'IV Cannula 18G/20G/22G, Blood Admin Set', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  parent_name = EXCLUDED.parent_name,
  notes = EXCLUDED.notes,
  updated_at = NOW();
