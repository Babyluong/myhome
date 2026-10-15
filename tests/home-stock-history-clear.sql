-- Isolated PGlite fixture for migrations 068, 012, 089 and 090.
-- No remote database or production records are used.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true),'')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.role',true),'');
$$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
CREATE TABLE hospitals(id uuid PRIMARY KEY);
CREATE TABLE roles(id uuid PRIMARY KEY,role_code text NOT NULL,hospital_id uuid REFERENCES hospitals);
CREATE TABLE users(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,role_id uuid REFERENCES roles,status text NOT NULL,full_name text);
CREATE TABLE permissions(id uuid PRIMARY KEY,permission_code text NOT NULL);
CREATE TABLE role_permissions(role_id uuid REFERENCES roles,permission_id uuid REFERENCES permissions);
CREATE FUNCTION update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now();RETURN NEW;END; $$;
CREATE TABLE departments(id uuid PRIMARY KEY);
CREATE TABLE pharmacy_stock_locations(id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,is_active boolean,location_type text);
CREATE TABLE store_sub_locations(id text PRIMARY KEY,hospital_id uuid REFERENCES hospitals,store_id text NOT NULL,store_code text NOT NULL,type text NOT NULL,name text NOT NULL,code text,parent_name text,notes text);
CREATE TABLE drugs(id uuid PRIMARY KEY,min_stock_level integer,max_stock_level integer);
CREATE TABLE non_drugs(id uuid PRIMARY KEY,min_stock_level integer,max_stock_level integer);
CREATE TABLE facility_drug_inventory(
 id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,
 store_location_id uuid REFERENCES pharmacy_stock_locations,drug_id uuid NOT NULL REFERENCES drugs,
 location text,facility_stock integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE facility_nondrug_inventory(
 id uuid PRIMARY KEY,hospital_id uuid REFERENCES hospitals,department_id uuid REFERENCES departments,
 store_location_id uuid REFERENCES pharmacy_stock_locations,nondrug_id uuid NOT NULL REFERENCES non_drugs,
 location text,facility_stock integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE pharmacy_stock_transactions(id uuid PRIMARY KEY,hospital_id uuid NOT NULL REFERENCES hospitals,item_id uuid NOT NULL,transaction_type text);
CREATE TABLE pharmacy_stock_batches(id uuid PRIMARY KEY,hospital_id uuid NOT NULL REFERENCES hospitals,item_id uuid NOT NULL,batch_number text);
INSERT INTO hospitals VALUES
 ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
INSERT INTO roles VALUES
 ('33333333-3333-4333-8333-333333333333','staff','11111111-1111-4111-8111-111111111111'),
 ('44444444-4444-4444-8444-444444444444','hospital_admin','11111111-1111-4111-8111-111111111111'),
 ('55555555-5555-4555-8555-555555555555','storekeeper','11111111-1111-4111-8111-111111111111'),
 ('66666666-6666-4666-8666-666666666666','hospital_admin','22222222-2222-4222-8222-222222222222');
INSERT INTO users(id,hospital_id,role_id,status) VALUES
 ('77777777-7777-4777-8777-777777777777','11111111-1111-4111-8111-111111111111','44444444-4444-4444-8444-444444444444','active'),
 ('88888888-8888-4888-8888-888888888888','11111111-1111-4111-8111-111111111111','55555555-5555-4555-8555-555555555555','active'),
 ('99999999-9999-4999-8999-999999999999','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','active'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','44444444-4444-4444-8444-444444444444','inactive'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666666','active');
INSERT INTO permissions VALUES
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','pharmacy_logistics.inventory.delete'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','pharmacy_logistics.inventory.edit');
INSERT INTO role_permissions VALUES
 ('55555555-5555-4555-8555-555555555555','cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
 ('55555555-5555-4555-8555-555555555555','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
INSERT INTO drugs VALUES
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1,20),('ffffffff-ffff-4fff-8fff-ffffffffffff',1,20);
INSERT INTO non_drugs VALUES
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1,20),('ffffffff-ffff-4fff-8fff-ffffffffffff',1,20);
INSERT INTO facility_drug_inventory(id,hospital_id,drug_id,facility_stock) VALUES
 ('14141414-1414-4414-8414-141414141414','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',9),
 ('15151515-1515-4515-8515-151515151515','11111111-1111-4111-8111-111111111111','ffffffff-ffff-4fff-8fff-ffffffffffff',7),
 ('16161616-1616-4616-8616-161616161616','22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',5);
INSERT INTO facility_nondrug_inventory(id,hospital_id,nondrug_id,facility_stock) VALUES
 ('17171717-1717-4717-8717-171717171717','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',8),
 ('18181818-1818-4818-8818-181818181818','11111111-1111-4111-8111-111111111111','ffffffff-ffff-4fff-8fff-ffffffffffff',6),
 ('19191919-1919-4919-8919-191919191919','22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',4);
INSERT INTO pharmacy_stock_transactions VALUES
 ('20202020-2020-4020-8020-202020202020','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','receipt'),
 ('21212121-2121-4121-8121-212121212121','11111111-1111-4111-8111-111111111111','ffffffff-ffff-4fff-8fff-ffffffffffff','issue'),
 ('22222222-2222-4222-8222-222222222220','22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','receipt');
INSERT INTO pharmacy_stock_batches VALUES
 ('23232323-2323-4323-8323-232323232323','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','LOT-A'),
 ('24242424-2424-4424-8424-242424242424','11111111-1111-4111-8111-111111111111','ffffffff-ffff-4fff-8fff-ffffffffffff','LOT-B'),
 ('25252525-2525-4525-8525-252525252525','22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','LOT-C');
