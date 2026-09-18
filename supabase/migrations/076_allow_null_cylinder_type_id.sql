-- Migration 076: Allow cylinder_type_id to be NULL in pharmacy_oxygen_cylinder_inventory
-- Fixes PostgreSQL error 23502 (null value in column "cylinder_type_id" violates not-null constraint)
-- Barcode scans on Hospital Lawas cylinders encode serial numbers (e.g. P101-F-0114) without valve type.
-- Valve type (Bullnose vs Pin Index) is confirmed and updated subsequently by staff.

ALTER TABLE pharmacy_oxygen_cylinder_inventory 
  ALTER COLUMN cylinder_type_id DROP NOT NULL;
