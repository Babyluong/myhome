-- Migration 078: Ensure cascading delete on foreign keys referencing pharmacy_oxygen_cylinder_inventory
-- Ensures seamless deletion of cylinders from inventory without constraint violation

ALTER TABLE IF EXISTS pharmacy_oxygen_stock_adjustments
  DROP CONSTRAINT IF EXISTS pharmacy_oxygen_stock_adjustments_cylinder_id_fkey,
  ADD CONSTRAINT pharmacy_oxygen_stock_adjustments_cylinder_id_fkey
    FOREIGN KEY (cylinder_id) REFERENCES pharmacy_oxygen_cylinder_inventory(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS pharmacy_oxygen_reception_items
  DROP CONSTRAINT IF EXISTS pharmacy_oxygen_reception_items_cylinder_id_fkey,
  ADD CONSTRAINT pharmacy_oxygen_reception_items_cylinder_id_fkey
    FOREIGN KEY (cylinder_id) REFERENCES pharmacy_oxygen_cylinder_inventory(id) ON DELETE CASCADE;
