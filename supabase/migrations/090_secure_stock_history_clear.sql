-- Protect and make atomic the inventory history clear/reset operation.
-- Apply through the reviewed migration workflow; this file does not change a remote database.
BEGIN;

-- The transaction and batch tables are not created by checked-in migrations.
-- Validate the observed backup schema before installing policies or triggers.
DO $$
DECLARE
  required_table text;
  required_column text;
BEGIN
  FOR required_table, required_column IN
    SELECT schema_contract.table_name, schema_contract.column_name
    FROM (VALUES
      ('pharmacy_stock_transactions','id'),
      ('pharmacy_stock_transactions','hospital_id'),
      ('pharmacy_stock_transactions','item_id'),
      ('pharmacy_stock_batches','id'),
      ('pharmacy_stock_batches','hospital_id'),
      ('pharmacy_stock_batches','item_id'),
      ('facility_drug_inventory','id'),
      ('facility_drug_inventory','hospital_id'),
      ('facility_drug_inventory','drug_id'),
      ('facility_drug_inventory','facility_stock'),
      ('facility_drug_inventory','updated_at'),
      ('facility_nondrug_inventory','id'),
      ('facility_nondrug_inventory','hospital_id'),
      ('facility_nondrug_inventory','nondrug_id'),
      ('facility_nondrug_inventory','facility_stock'),
      ('facility_nondrug_inventory','updated_at')
    ) AS schema_contract(table_name, column_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = required_table
        AND c.column_name = required_column
    ) THEN
      RAISE EXCEPTION 'Required inventory schema is missing public.%.%', required_table, required_column
        USING ERRCODE = '42703';
    END IF;
  END LOOP;
  IF to_regprocedure('public.can_access_store_locations(uuid,text)') IS NULL
     OR to_regprocedure('public.audit_store_inventory_change()') IS NULL
     OR to_regclass('public.audit_logs') IS NULL THEN
    RAISE EXCEPTION 'Migration 089 store authorization/audit contract and public.audit_logs must be installed first'
      USING ERRCODE = '55000';
  END IF;
END;
$$;

-- Apply the same active-user, tenant, role-permission rules used for store writes.
-- A clear both deletes history and edits facility stock, so both grants are required.
CREATE OR REPLACE FUNCTION public.clear_stock_history_and_reset_inventory(
  p_hospital_id uuid,
  p_item_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_transactions bigint := 0;
  v_batches bigint := 0;
  v_drug_rows bigint := 0;
  v_nondrug_rows bigint := 0;
BEGIN
  IF v_actor_id IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authenticated actor required' USING ERRCODE = '42501';
  END IF;
  IF p_hospital_id IS NULL THEN
    RAISE EXCEPTION 'Hospital is required' USING ERRCODE = '22023';
  END IF;
  IF NOT public.can_access_store_locations(p_hospital_id, 'delete')
     OR NOT public.can_access_store_locations(p_hospital_id, 'edit') THEN
    RAISE EXCEPTION 'Inventory clear is not authorized for this hospital' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.pharmacy_stock_transactions
  WHERE hospital_id = p_hospital_id
    AND (p_item_id IS NULL OR item_id = p_item_id);
  GET DIAGNOSTICS v_transactions = ROW_COUNT;

  DELETE FROM public.pharmacy_stock_batches
  WHERE hospital_id = p_hospital_id
    AND (p_item_id IS NULL OR item_id = p_item_id);
  GET DIAGNOSTICS v_batches = ROW_COUNT;

  UPDATE public.facility_drug_inventory
  SET facility_stock = 0, updated_at = now()
  WHERE hospital_id = p_hospital_id
    AND (p_item_id IS NULL OR drug_id = p_item_id)
    AND facility_stock IS DISTINCT FROM 0;
  GET DIAGNOSTICS v_drug_rows = ROW_COUNT;

  UPDATE public.facility_nondrug_inventory
  SET facility_stock = 0, updated_at = now()
  WHERE hospital_id = p_hospital_id
    AND (p_item_id IS NULL OR nondrug_id = p_item_id)
    AND facility_stock IS DISTINCT FROM 0;
  GET DIAGNOSTICS v_nondrug_rows = ROW_COUNT;

  RETURN jsonb_build_object(
    'deletedTransactionsCount', v_transactions,
    'deletedBatchesCount', v_batches,
    'resetDrugInventoryRows', v_drug_rows,
    'resetNonDrugInventoryRows', v_nondrug_rows
  );
END;
$$;
REVOKE ALL ON FUNCTION public.clear_stock_history_and_reset_inventory(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_stock_history_and_reset_inventory(uuid, uuid) TO authenticated;

-- RLS prevents clients from bypassing tenant/permission checks through direct CRUD.
-- Keep table grants unchanged so the existing CRUD paths continue under these policies.
DO $$
DECLARE
  target_table text;
  existing_policy record;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['pharmacy_stock_transactions','pharmacy_stock_batches'] LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', target_table);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
    FOR existing_policy IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname, target_table);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY stock_history_select ON public.%I FOR SELECT TO authenticated USING (public.can_access_store_locations(hospital_id, ''view''))',
      target_table
    );
    EXECUTE format(
      'CREATE POLICY stock_history_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_access_store_locations(hospital_id, ''create''))',
      target_table
    );
    EXECUTE format(
      'CREATE POLICY stock_history_update ON public.%I FOR UPDATE TO authenticated USING (public.can_access_store_locations(hospital_id, ''edit'')) WITH CHECK (public.can_access_store_locations(hospital_id, ''edit''))',
      target_table
    );
    -- The clear service must use the atomic RPC below; direct DELETE would split
    -- transaction, batch, and facility-stock changes across separate requests.
    EXECUTE format(
      'CREATE POLICY stock_history_delete ON public.%I FOR DELETE TO authenticated USING (false)',
      target_table
    );
  END LOOP;
END;
$$;

-- Row-level audit records are inserted in the same transaction as every delete/update.
-- Any audit failure aborts and rolls back the complete clear operation.
DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.pharmacy_stock_transactions;
CREATE TRIGGER audit_store_inventory_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pharmacy_stock_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();

DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.pharmacy_stock_batches;
CREATE TRIGGER audit_store_inventory_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pharmacy_stock_batches
  FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();

COMMIT;
