-- Migration 082: Add type_id to pharmacy_oxygen_kewps4_transactions and pharmacy_oxygen_store_verifications
-- Enables strict multi-combo isolation (e.g. separating P101-F Pin Index from P101-F Bullnose)

ALTER TABLE pharmacy_oxygen_kewps4_transactions 
ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES pharmacy_oxygen_cylinder_types(id) ON DELETE SET NULL;

ALTER TABLE pharmacy_oxygen_store_verifications 
ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES pharmacy_oxygen_cylinder_types(id) ON DELETE SET NULL;

-- Backfill existing rows with their respective cylinder types based on size combos
UPDATE pharmacy_oxygen_kewps4_transactions 
SET type_id = '3edfc0fe-98fb-4592-9ce1-4229718871a2' 
WHERE size_id IN ('0b3d30f9-d4fc-4d94-b624-d993d1f8098d', '332911a0-9e8c-4c0e-980a-9df3d0197dce');

UPDATE pharmacy_oxygen_kewps4_transactions 
SET type_id = '1874961b-a46d-4cf6-8a47-90b18a1e0fb7' 
WHERE size_id IN ('f5a38d74-4d0d-49c4-af20-1dab5f5cb852', '16207ded-639a-4240-92ad-a2a06d95a0a5');

-- CF-2026/6425 (physical audit count 56) is specifically for P101-F Bullnose (BN)
UPDATE pharmacy_oxygen_kewps4_transactions 
SET type_id = '3edfc0fe-98fb-4592-9ce1-4229718871a2',
    transaction_date = created_at
WHERE id = '13d9f2bb-8121-4d81-99a3-ec1b7bf46070';
