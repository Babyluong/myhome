-- Isolated supporting contracts. Location/audit schemas and final policies are
-- loaded unchanged from repository migrations 068, 012 and 089 by the runner.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true),'')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role',true),''); $$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
CREATE TABLE hospitals(id uuid PRIMARY KEY);
CREATE TABLE roles(id uuid PRIMARY KEY,role_code text NOT NULL,hospital_id uuid REFERENCES hospitals);
CREATE TABLE users(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,role_id uuid REFERENCES roles,status text NOT NULL,full_name text);
CREATE TABLE permissions(id uuid PRIMARY KEY,permission_code text NOT NULL);
CREATE TABLE role_permissions(role_id uuid REFERENCES roles,permission_id uuid REFERENCES permissions);
CREATE FUNCTION update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now();RETURN NEW;END; $$;
-- Inventory trigger fixtures preserve the real id/hospital/location column contracts;
-- they are not used to claim full facility-inventory schema migration coverage.
CREATE TABLE departments(id uuid PRIMARY KEY);
CREATE TABLE pharmacy_stock_locations(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,is_active boolean,location_type text);
CREATE TABLE drugs(id uuid PRIMARY KEY,min_stock_level integer,max_stock_level integer);
CREATE TABLE non_drugs(id uuid PRIMARY KEY,min_stock_level integer,max_stock_level integer);
INSERT INTO drugs VALUES('12121212-1212-4212-8212-121212121212',1,20);
INSERT INTO non_drugs VALUES('13131313-1313-4313-8313-131313131313',1,20);
-- Fixed defaults only shorten fixture INSERTs; these are isolated catalog IDs,
-- never application defaults or production migration claims.
CREATE TABLE facility_drug_inventory(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,store_location_id uuid REFERENCES pharmacy_stock_locations,drug_id uuid NOT NULL DEFAULT '12121212-1212-4212-8212-121212121212' REFERENCES drugs,location text);
CREATE TABLE facility_nondrug_inventory(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,store_location_id uuid REFERENCES pharmacy_stock_locations,nondrug_id uuid NOT NULL DEFAULT '13131313-1313-4313-8313-131313131313' REFERENCES non_drugs,location text);
-- No historical CREATE TABLE for sub-locations exists. This contract comes from
-- migration 088 and storeSubLocationService; that repository limitation is reported.
CREATE TABLE store_sub_locations(id text PRIMARY KEY,hospital_id uuid REFERENCES hospitals,store_id text NOT NULL,store_code text NOT NULL,type text NOT NULL,name text NOT NULL,code text,parent_name text,notes text);
