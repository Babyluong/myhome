-- Migration: 086_expand_prepack_categories.sql
-- Description: Expand pack_type check constraint in prepack_items to support internal and external preparations

ALTER TABLE prepack_items DROP CONSTRAINT IF EXISTS prepack_items_pack_type_check;
ALTER TABLE prepack_items ADD CONSTRAINT prepack_items_pack_type_check 
  CHECK (pack_type IN (
    'uod', 
    'prepack', 
    'prepack_tablet', 
    'prepack_liquid', 
    'prepack_cream', 
    'internal', 
    'external', 
    'extemporaneous', 
    'other'
  ));

CREATE INDEX IF NOT EXISTS idx_prepack_items_pack_type_hosp 
  ON prepack_items(hospital_id, pack_type);
