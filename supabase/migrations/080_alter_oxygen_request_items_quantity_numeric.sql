-- 080_alter_oxygen_request_items_quantity_numeric.sql
-- Allow decimal/numeric quantities for Liquid Medical Oxygen (VIE Tank in M3)

ALTER TABLE IF EXISTS pharmacy_oxygen_request_document_items
  ALTER COLUMN quantity TYPE NUMERIC;
