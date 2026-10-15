-- Apply only through an authorized migration rollout. No production records are seeded.
BEGIN;
-- Permissive users policies cannot be used to mint the trusted administrator identity.
CREATE OR REPLACE FUNCTION public.guard_user_authority()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE actor public.users%ROWTYPE; actor_role text; target_role text; target_role_hospital uuid;
BEGIN
  IF auth.role() = 'service_role' OR (current_setting('role',true) = 'none' AND session_user IN ('postgres','supabase_admin')) THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  SELECT * INTO actor FROM public.users WHERE id = auth.uid();
  IF NOT FOUND OR actor.status <> 'active' THEN RAISE EXCEPTION 'Active actor required' USING ERRCODE = '42501'; END IF;
  SELECT role_code INTO actor_role FROM public.roles WHERE id = actor.role_id AND (hospital_id IS NULL OR hospital_id = actor.hospital_id);
  IF TG_OP = 'DELETE' THEN
    IF actor_role = 'system_admin' THEN RETURN OLD; END IF;
    IF actor_role = 'hospital_admin' AND actor.hospital_id = OLD.hospital_id AND OLD.id <> actor.id AND NOT EXISTS (SELECT 1 FROM public.roles WHERE id = OLD.role_id AND role_code = 'system_admin') THEN RETURN OLD; END IF;
    IF OLD.id = actor.id AND actor_role NOT IN ('system_admin','hospital_admin') THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Profile deletion is not authorized' USING ERRCODE = '42501';
  END IF;
  SELECT role_code,hospital_id INTO target_role,target_role_hospital FROM public.roles WHERE id = NEW.role_id;
  IF target_role IS NULL OR (target_role_hospital IS NOT NULL AND target_role_hospital IS DISTINCT FROM NEW.hospital_id) THEN RAISE EXCEPTION 'Role outside target hospital' USING ERRCODE = '42501'; END IF;
  IF actor_role = 'system_admin' THEN RETURN NEW; END IF;
  IF actor_role = 'hospital_admin' AND actor.hospital_id IS NOT NULL AND NEW.hospital_id = actor.hospital_id AND target_role <> 'system_admin' THEN
    IF TG_OP = 'INSERT' THEN RETURN NEW; END IF;
    IF OLD.hospital_id = actor.hospital_id AND NOT EXISTS (SELECT 1 FROM public.roles WHERE id = OLD.role_id AND role_code = 'system_admin') AND OLD.id = NEW.id THEN RETURN NEW; END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.id = actor.id AND NEW.id = OLD.id
    AND NEW.role_id = OLD.role_id AND NEW.hospital_id IS NOT DISTINCT FROM OLD.hospital_id AND NEW.status = OLD.status THEN RETURN NEW; END IF;
  RAISE EXCEPTION 'Profile authority change is not authorized' USING ERRCODE = '42501';
END;
$$;
REVOKE ALL ON FUNCTION public.guard_user_authority() FROM PUBLIC;
DROP TRIGGER IF EXISTS guard_user_authority ON public.users;
CREATE TRIGGER guard_user_authority BEFORE INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.guard_user_authority();
CREATE OR REPLACE FUNCTION public.get_my_offline_identity()
RETURNS TABLE(actor_id uuid,hospital_id uuid,status text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT u.id,u.hospital_id,u.status FROM public.users u WHERE u.id = (SELECT auth.uid());
$$;
REVOKE ALL ON FUNCTION public.get_my_offline_identity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_offline_identity() TO authenticated;
CREATE OR REPLACE FUNCTION public.can_manage_role_permissions(target_role uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles actor_role ON actor_role.id = u.role_id
    WHERE u.id = (SELECT auth.uid()) AND u.status = 'active'
      AND (actor_role.hospital_id IS NULL OR actor_role.hospital_id = u.hospital_id)
      AND (actor_role.role_code = 'system_admin' OR (
        actor_role.role_code = 'hospital_admin' AND u.hospital_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.roles r WHERE r.id = target_role AND r.hospital_id = u.hospital_id
        )
      ))
  );
$$;
REVOKE ALL ON FUNCTION public.can_manage_role_permissions(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_role_permissions(uuid) TO authenticated;
REVOKE ALL ON public.permissions,public.role_permissions FROM anon;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE permission_table text; existing_policy record; BEGIN
  FOREACH permission_table IN ARRAY ARRAY['permissions','role_permissions'] LOOP
    FOR existing_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = permission_table LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname,permission_table);
    END LOOP;
  END LOOP;
END $$;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_manage ON public.permissions FOR ALL TO authenticated USING (public.can_manage_role_permissions(NULL)) WITH CHECK (public.can_manage_role_permissions(NULL));
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_manage ON public.role_permissions FOR ALL TO authenticated USING (public.can_manage_role_permissions(role_id)) WITH CHECK (public.can_manage_role_permissions(role_id));
ALTER TABLE public.facility_drug_inventory ADD COLUMN IF NOT EXISTS min_stock_level integer CHECK (min_stock_level >= 0), ADD COLUMN IF NOT EXISTS max_stock_level integer CHECK (max_stock_level >= 0);
ALTER TABLE public.facility_nondrug_inventory ADD COLUMN IF NOT EXISTS min_stock_level integer CHECK (min_stock_level >= 0), ADD COLUMN IF NOT EXISTS max_stock_level integer CHECK (max_stock_level >= 0);
ALTER TABLE public.facility_nondrug_inventory ADD COLUMN IF NOT EXISTS batch_number text, ADD COLUMN IF NOT EXISTS expiry_date date;
ALTER TABLE public.facility_drug_inventory DROP CONSTRAINT IF EXISTS facility_drug_stock_bounds;
ALTER TABLE public.facility_drug_inventory ADD CONSTRAINT facility_drug_stock_bounds CHECK (min_stock_level IS NULL OR max_stock_level IS NULL OR min_stock_level <= max_stock_level);
ALTER TABLE public.facility_nondrug_inventory DROP CONSTRAINT IF EXISTS facility_nondrug_stock_bounds;
ALTER TABLE public.facility_nondrug_inventory ADD CONSTRAINT facility_nondrug_stock_bounds CHECK (min_stock_level IS NULL OR max_stock_level IS NULL OR min_stock_level <= max_stock_level);
CREATE OR REPLACE FUNCTION public.validate_facility_stock_bounds()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE catalog_min integer; catalog_max integer; store_department uuid; store_is_active boolean; store_type text;
BEGIN
  IF TG_TABLE_NAME = 'facility_drug_inventory' THEN
    SELECT min_stock_level,max_stock_level INTO catalog_min,catalog_max FROM public.drugs WHERE id = NEW.drug_id;
  ELSE
    SELECT min_stock_level,max_stock_level INTO catalog_min,catalog_max FROM public.non_drugs WHERE id = NEW.nondrug_id;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Catalog item unavailable' USING ERRCODE = '23503'; END IF;
  IF NEW.store_location_id IS NOT NULL THEN
    SELECT department_id,is_active,location_type INTO store_department,store_is_active,store_type FROM public.pharmacy_stock_locations WHERE id = NEW.store_location_id AND hospital_id = NEW.hospital_id;
    IF NOT FOUND OR store_is_active IS DISTINCT FROM true OR store_type IS DISTINCT FROM 'store' THEN RAISE EXCEPTION 'Store outside facility hospital or inactive' USING ERRCODE = '42501'; END IF;
  END IF;
  IF NEW.department_id IS NOT NULL AND NEW.department_id IS DISTINCT FROM store_department THEN RAISE EXCEPTION 'Department outside selected store' USING ERRCODE = '42501'; END IF;
  IF COALESCE(NEW.min_stock_level,catalog_min) > COALESCE(NEW.max_stock_level,catalog_max) THEN
    RAISE EXCEPTION 'Minimum stock exceeds maximum stock' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_facility_stock_bounds() FROM PUBLIC;
DROP TRIGGER IF EXISTS validate_facility_stock_bounds ON public.facility_drug_inventory;
CREATE TRIGGER validate_facility_stock_bounds BEFORE INSERT OR UPDATE ON public.facility_drug_inventory FOR EACH ROW EXECUTE FUNCTION public.validate_facility_stock_bounds();
DROP TRIGGER IF EXISTS validate_facility_stock_bounds ON public.facility_nondrug_inventory;
CREATE TRIGGER validate_facility_stock_bounds BEFORE INSERT OR UPDATE ON public.facility_nondrug_inventory FOR EACH ROW EXECUTE FUNCTION public.validate_facility_stock_bounds();
CREATE OR REPLACE FUNCTION public.can_access_store_locations(target_hospital uuid, operation text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON r.id = u.role_id
    WHERE u.id = (SELECT auth.uid()) AND u.status = 'active'
      AND (r.hospital_id IS NULL OR r.hospital_id = u.hospital_id)
      AND (r.role_code = 'system_admin' OR (
        u.hospital_id = target_hospital AND (
          operation = 'view' OR r.role_code = 'hospital_admin' OR EXISTS (
            SELECT 1 FROM public.role_permissions rp JOIN public.permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = u.role_id AND p.permission_code = 'pharmacy_logistics.inventory.' || operation
          )
        )
      ))
  );
$$;
REVOKE ALL ON FUNCTION public.can_access_store_locations(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_store_locations(uuid,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.can_access_facility_inventory(target_hospital uuid,target_store uuid,operation text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT public.can_access_store_locations(target_hospital,operation) AND (
    (target_store IS NULL AND operation = 'view') OR EXISTS (
      SELECT 1 FROM public.pharmacy_stock_locations s WHERE s.id = target_store AND s.hospital_id = target_hospital AND s.is_active = true AND s.location_type = 'store'
    )
  );
$$;
REVOKE ALL ON FUNCTION public.can_access_facility_inventory(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_facility_inventory(uuid,uuid,text) TO authenticated;
DO $$ DECLARE inventory_table text; existing_policy record; BEGIN
  FOREACH inventory_table IN ARRAY ARRAY['facility_drug_inventory','facility_nondrug_inventory'] LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', inventory_table);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', inventory_table);
    FOR existing_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = inventory_table LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname,inventory_table);
    END LOOP;
    EXECUTE format('CREATE POLICY secure_facility_select ON public.%I FOR SELECT TO authenticated USING (public.can_access_facility_inventory(hospital_id,store_location_id,''view''))',inventory_table);
    EXECUTE format('CREATE POLICY secure_facility_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_access_facility_inventory(hospital_id,store_location_id,''create''))',inventory_table);
    EXECUTE format('CREATE POLICY secure_facility_update ON public.%I FOR UPDATE TO authenticated USING (public.can_access_facility_inventory(hospital_id,store_location_id,''edit'')) WITH CHECK (public.can_access_facility_inventory(hospital_id,store_location_id,''edit''))',inventory_table);
    EXECUTE format('CREATE POLICY secure_facility_delete ON public.%I FOR DELETE TO authenticated USING (public.can_access_facility_inventory(hospital_id,store_location_id,''delete''))',inventory_table);
  END LOOP;
END $$;
REVOKE ALL ON public.store_locations FROM anon;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for store_locations" ON public.store_locations;
DROP POLICY IF EXISTS "Allow authenticated insert for store_locations" ON public.store_locations;
DROP POLICY IF EXISTS "Allow authenticated update for store_locations" ON public.store_locations;
DROP POLICY IF EXISTS "Allow authenticated delete for store_locations" ON public.store_locations;
CREATE POLICY store_locations_select ON public.store_locations FOR SELECT TO authenticated USING (public.can_access_store_locations(hospital_id,'view'));
CREATE POLICY store_locations_insert ON public.store_locations FOR INSERT TO authenticated WITH CHECK (public.can_access_store_locations(hospital_id,'create'));
CREATE POLICY store_locations_update ON public.store_locations FOR UPDATE TO authenticated USING (public.can_access_store_locations(hospital_id,'edit')) WITH CHECK (public.can_access_store_locations(hospital_id,'edit'));
CREATE POLICY store_locations_delete ON public.store_locations FOR DELETE TO authenticated USING (public.can_access_store_locations(hospital_id,'delete'));

-- Audit persistence is part of each governed inventory/location transaction.
CREATE OR REPLACE FUNCTION public.audit_store_inventory_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.audit_logs(user_id,action,module,entity_type,entity_id,old_values,new_values)
  VALUES (auth.uid(), TG_OP, 'inventory', TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.audit_store_inventory_change() FROM PUBLIC;
DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.store_locations;
CREATE TRIGGER audit_store_inventory_change AFTER INSERT OR UPDATE OR DELETE ON public.store_locations FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();
DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.facility_drug_inventory;
CREATE TRIGGER audit_store_inventory_change AFTER INSERT OR UPDATE OR DELETE ON public.facility_drug_inventory FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();
DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.facility_nondrug_inventory;
CREATE TRIGGER audit_store_inventory_change AFTER INSERT OR UPDATE OR DELETE ON public.facility_nondrug_inventory FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();
-- The sub-location columns are established by migration 088; replacement must be atomic.
REVOKE ALL ON public.store_sub_locations FROM anon;
ALTER TABLE public.store_sub_locations ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE existing_policy record; BEGIN
  FOR existing_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'store_sub_locations' LOOP
    EXECUTE format('DROP POLICY %I ON public.store_sub_locations', existing_policy.policyname);
  END LOOP;
END $$;
CREATE POLICY store_sub_locations_select ON public.store_sub_locations FOR SELECT TO authenticated USING (public.can_access_store_locations(hospital_id,'view'));
CREATE POLICY store_sub_locations_insert ON public.store_sub_locations FOR INSERT TO authenticated WITH CHECK (public.can_access_store_locations(hospital_id,'create'));
CREATE POLICY store_sub_locations_update ON public.store_sub_locations FOR UPDATE TO authenticated USING (public.can_access_store_locations(hospital_id,'edit')) WITH CHECK (public.can_access_store_locations(hospital_id,'edit'));
CREATE POLICY store_sub_locations_delete ON public.store_sub_locations FOR DELETE TO authenticated USING (public.can_access_store_locations(hospital_id,'delete'));
DROP TRIGGER IF EXISTS audit_store_inventory_change ON public.store_sub_locations;
CREATE TRIGGER audit_store_inventory_change AFTER INSERT OR UPDATE OR DELETE ON public.store_sub_locations FOR EACH ROW EXECUTE FUNCTION public.audit_store_inventory_change();
CREATE OR REPLACE FUNCTION public.replace_store_sub_locations(p_hospital_id uuid,p_store_id text,p_store_code text,p_units jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.can_access_store_locations(p_hospital_id,'edit')
    OR NOT public.can_access_store_locations(p_hospital_id,'create')
    OR NOT public.can_access_store_locations(p_hospital_id,'delete') THEN
    RAISE EXCEPTION 'Store replacement is not authorized' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_units) IS DISTINCT FROM 'array' OR NOT EXISTS (
    SELECT 1 FROM public.store_locations WHERE id = p_store_id AND hospital_id = p_hospital_id AND location_code = p_store_code
  ) THEN RAISE EXCEPTION 'Invalid store replacement request' USING ERRCODE = '22023'; END IF;
  DELETE FROM public.store_sub_locations WHERE hospital_id = p_hospital_id AND store_id = p_store_id AND store_code = p_store_code;
  INSERT INTO public.store_sub_locations(id,hospital_id,store_id,store_code,type,name,code,parent_name,notes)
  SELECT unit->>'id',p_hospital_id,p_store_id,p_store_code,unit->>'type',unit->>'name',unit->>'code',unit->>'parent_name',unit->>'notes'
  FROM jsonb_array_elements(p_units) AS unit;
END;
$$;
REVOKE ALL ON FUNCTION public.replace_store_sub_locations(uuid,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_store_sub_locations(uuid,text,text,jsonb) TO authenticated;
COMMIT;
