const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test}=require('node:test');
const runtime=process.env.HOME_TEST_PGLITE_DIR || 'C:/Users/60113/AppData/Local/Temp/home-fixes-postgres-0f97fd1a6a684e39b4652d0c841c1d32/node_modules/@electric-sql/pglite';
const {PGlite}=require(runtime);
const root=path.resolve(__dirname,'..');
const H1='11111111-1111-4111-8111-111111111111',H2='22222222-2222-4222-8222-222222222222';
const actor={ordinary:'33333333-3333-4333-8333-333333333333',admin:'44444444-4444-4444-8444-444444444444',system:'55555555-5555-4555-8555-555555555555',inactive:'66666666-6666-4666-8666-666666666666',permission:'77777777-7777-4777-8777-777777777777',mismatch:'88888888-8888-4888-8888-888888888888'};
async function fixture(t){
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(fs.readFileSync(path.join(__dirname,'home-store-locations-rls.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/068_create_store_locations_table.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/012_create_audit_logs_table.sql'),'utf8'));
 await db.exec(`GRANT SELECT,INSERT,UPDATE,DELETE ON store_locations,store_sub_locations TO authenticated,anon;
 GRANT SELECT ON users,roles,permissions,role_permissions TO authenticated;
 INSERT INTO hospitals VALUES ('${H1}'),('${H2}');
 INSERT INTO roles VALUES ('${actor.ordinary}','staff',null),('${actor.admin}','hospital_admin','${H1}'),('${actor.system}','system_admin',null),('${actor.permission}','storekeeper','${H1}'),('${actor.mismatch}','hospital_admin','${H2}');
 INSERT INTO users(id,hospital_id,role_id,status) VALUES ('${actor.ordinary}','${H1}','${actor.ordinary}','active'),('${actor.admin}','${H1}','${actor.admin}','active'),('${actor.system}',null,'${actor.system}','active'),('${actor.inactive}','${H1}','${actor.admin}','inactive'),('${actor.permission}','${H1}','${actor.permission}','active'),('${actor.mismatch}','${H1}','${actor.mismatch}','active');
 INSERT INTO permissions SELECT gen_random_uuid(),'pharmacy_logistics.inventory.'||v FROM unnest(ARRAY['create','edit','delete'])v;
 INSERT INTO role_permissions SELECT '${actor.permission}',id FROM permissions;
 INSERT INTO store_locations(id,hospital_id,store_name,cabinet_rack,shelf_level,location_code) VALUES ('h1-location','${H1}','Fixture shelf','-','-','LOG-FIX-01'),('h2-location','${H2}','Fixture shelf','-','-','LOG-FIX-02');
 INSERT INTO store_sub_locations VALUES('original','${H1}','h1-location','LOG-FIX-01','rack','Original','R1',null,null);`);
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/089_secure_store_locations.sql'),'utf8'));
 const as=async(id,role='authenticated')=>{await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[id||'',role]);await db.exec(`SET ROLE ${role}`);};
 return {db,as};
}
test('actual location RLS and grants deny anon; same tenant ordinary read permits no write; inactive and inconsistent roles see no rows',async t=>{
 const {db,as}=await fixture(t);await as(null,'anon');await assert.rejects(db.query('SELECT * FROM store_locations'),/permission denied/i);
 for(const id of [actor.ordinary,actor.inactive,actor.mismatch]){await as(id);const rows=await db.query('SELECT id FROM store_locations');assert.equal(rows.rows.length,id===actor.ordinary?1:0);
 await assert.rejects(db.query(`INSERT INTO store_locations(id,hospital_id,store_name,cabinet_rack,shelf_level,location_code) VALUES ('forbidden','${H1}','Forbidden','-','-','FORBIDDEN')`),/row-level security/i);
 assert.equal((await db.query("UPDATE store_locations SET store_name='Forbidden' WHERE id='h1-location' RETURNING id")).rows.length,0);
 assert.equal((await db.query("DELETE FROM store_locations WHERE id='h1-location' RETURNING id")).rows.length,0);}
});
test('actual offline identity RPC returns only trusted current actor and anon cannot invoke',async t=>{
 const {db,as}=await fixture(t);await as(actor.ordinary);const identity=await db.query('SELECT * FROM get_my_offline_identity()');assert.equal(identity.rows.length,1);assert.equal(identity.rows[0].actor_id,actor.ordinary);assert.equal(identity.rows[0].hospital_id,H1);assert.equal(identity.rows[0].status,'active');
 await as(actor.inactive);const inactive=await db.query('SELECT * FROM get_my_offline_identity()');assert.equal(inactive.rows.length,1);assert.equal(inactive.rows[0].actor_id,actor.inactive);assert.equal(inactive.rows[0].status,'inactive');await as(null,'anon');await assert.rejects(db.query('SELECT * FROM get_my_offline_identity()'),/permission denied/i);
});
test('actual trusted-profile guard blocks self elevation, hospital/status change and unauthorized inserts while permitting ordinary safe profile edits',async t=>{
 const {db,as}=await fixture(t);await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON users TO authenticated,service_role;GRANT USAGE ON SCHEMA public,auth TO service_role;GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;');
 // Challenge the actual trigger with a deliberately permissive policy. It must
 // remain safe even when a legacy permissive policy would admit the row.
 await db.exec('ALTER TABLE users ENABLE ROW LEVEL SECURITY;CREATE POLICY isolated_legacy_permissive ON users FOR ALL TO authenticated USING(true) WITH CHECK(true);');
 await as(actor.ordinary);
 for(const update of [`role_id='${actor.admin}'`,`hospital_id='${H2}'`,`status='inactive'`])await assert.rejects(db.query(`UPDATE users SET ${update} WHERE id='${actor.ordinary}'`),/not authorized|outside target/i);
 assert.equal((await db.query(`UPDATE users SET full_name='Safe fixture edit' WHERE id='${actor.ordinary}' RETURNING full_name`)).rows[0].full_name,'Safe fixture edit');
 const newId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';await assert.rejects(db.query(`INSERT INTO users(id,hospital_id,role_id,status) VALUES('${newId}','${H1}','${actor.admin}','active')`),/not authorized/i);
 await as(actor.admin);await db.query(`INSERT INTO users(id,hospital_id,role_id,status) VALUES('${newId}','${H1}','${actor.ordinary}','active')`);
 await assert.rejects(db.query(`UPDATE users SET hospital_id='${H2}' WHERE id='${newId}'`),/not authorized/i);
 await as(actor.inactive);await assert.rejects(db.query(`UPDATE users SET full_name='Forbidden' WHERE id='${actor.inactive}'`),/Active actor/i);
 await as(actor.system);await db.query(`UPDATE users SET hospital_id='${H2}' WHERE id='${newId}'`);
 await as(null,'service_role');await db.query(`INSERT INTO users(id,hospital_id,role_id,status) VALUES('cccccccc-cccc-4ccc-8ccc-cccccccccccc','${H2}','${actor.ordinary}','active')`);
 await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");await db.query(`INSERT INTO users(id,hospital_id,role_id,status) VALUES('dddddddd-dddd-4ddd-8ddd-dddddddddddd','${H2}','${actor.ordinary}','active')`);
});
test('facility inventory actual policies deny ordinary writes, foreign/inactive/null stores and cross-tenant WITH CHECK',async t=>{
 const {db,as}=await fixture(t);const S1='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',S2='ffffffff-ffff-4fff-8fff-ffffffffffff',inactive='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 await db.exec(`GRANT SELECT,INSERT,UPDATE,DELETE ON facility_drug_inventory,facility_nondrug_inventory TO authenticated,anon;INSERT INTO pharmacy_stock_locations(id,hospital_id,is_active,location_type) VALUES('${S1}','${H1}',true,'store'),('${S2}','${H2}',true,'store'),('${inactive}','${H1}',false,'store');`);
 for(const table of ['facility_drug_inventory','facility_nondrug_inventory']){
 const id=table==='facility_drug_inventory'?'99999999-9999-4999-8999-999999999999':'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';await as(actor.ordinary);await assert.rejects(db.query(`INSERT INTO ${table}(id,hospital_id,store_location_id)VALUES($1,$2,$3)`,[id,H1,S1]),/row-level security/i);
 await as(actor.admin);for(const [store,expectedError] of [[S2,/Store outside facility hospital or inactive/],[inactive,/Store outside facility hospital or inactive/],[null,/row-level security/i]])await assert.rejects(db.query(`INSERT INTO ${table}(id,hospital_id,store_location_id)VALUES($1,$2,$3)`,[id,H1,store]),expectedError);
 await db.query(`INSERT INTO ${table}(id,hospital_id,store_location_id)VALUES($1,$2,$3)`,[id,H1,S1]);await assert.rejects(db.query(`UPDATE ${table} SET hospital_id=$1,store_location_id=$2 WHERE id=$3`,[H2,S2,id]),/row-level security/i);
 await as(actor.ordinary);assert.equal((await db.query(`UPDATE ${table} SET location='Forbidden' WHERE id=$1 RETURNING id`,[id])).rows.length,0);await as(actor.admin);assert.equal((await db.query(`DELETE FROM ${table} WHERE id=$1 RETURNING id`,[id])).rows.length,1);
 }
});
test('actual USING and WITH CHECK allow scoped admin/permission actor and prevent cross-tenant move, insert, update and delete',async t=>{
 const {db,as}=await fixture(t);
 for(const id of [actor.admin,actor.permission]){await as(id);assert.equal((await db.query('SELECT id FROM store_locations')).rows.length,1);
 assert.equal((await db.query("UPDATE store_locations SET store_name='Allowed' WHERE id='h1-location' RETURNING id")).rows.length,1);
 assert.equal((await db.query("UPDATE store_locations SET store_name='Forbidden' WHERE id='h2-location' RETURNING id")).rows.length,0);
 assert.equal((await db.query("DELETE FROM store_locations WHERE id='h2-location' RETURNING id")).rows.length,0);
 await assert.rejects(db.query(`UPDATE store_locations SET hospital_id='${H2}' WHERE id='h1-location'`),/row-level security/i);
 await assert.rejects(db.query(`INSERT INTO store_locations(id,hospital_id,store_name,cabinet_rack,shelf_level,location_code) VALUES ('cross','${H2}','Forbidden','-','-','CROSS')`),/row-level security/i);}
 await as(actor.system);assert.equal((await db.query('SELECT id FROM store_locations')).rows.length,2);
 await db.query(`INSERT INTO store_locations(id,hospital_id,store_name,cabinet_rack,shelf_level,location_code) VALUES ('system-created','${H2}','Allowed','-','-','SYSTEM')`);
 assert.equal((await db.query("DELETE FROM store_locations WHERE id='system-created' RETURNING id")).rows.length,1);
});
test('actual audit trigger persists trusted actor and old/new data, fails transaction when audit persistence fails',async t=>{
 const {db,as}=await fixture(t);await as(actor.admin);await db.exec("UPDATE store_locations SET store_name='Changed' WHERE id='h1-location'");
 await db.exec('RESET ROLE');const audits=await db.query("SELECT user_id,action,entity_type,entity_id,old_values,new_values FROM audit_logs WHERE entity_id='h1-location'");assert.equal(audits.rows.length,1);assert.equal(audits.rows[0].user_id,actor.admin);assert.equal(audits.rows[0].old_values.store_name,'Fixture shelf');assert.equal(audits.rows[0].new_values.store_name,'Changed');
 await db.exec("ALTER TABLE audit_logs ADD CONSTRAINT isolated_audit_failure CHECK (action <> 'DELETE')");await as(actor.admin);
 await assert.rejects(db.query("DELETE FROM store_locations WHERE id='h1-location'"),/isolated_audit_failure/);assert.equal((await db.query("SELECT id FROM store_locations WHERE id='h1-location'")).rows.length,1);
});
test('atomic sub-location RPC enforces actor/store/tenant and rolls back old rows on invalid unit insertion',async t=>{
 const {db,as}=await fixture(t);await as(actor.ordinary);await assert.rejects(db.query('SELECT replace_store_sub_locations($1,$2,$3,$4)',[H1,'h1-location','LOG-FIX-01','[]']),/not authorized/i);
 await as(actor.admin);await assert.rejects(db.query('SELECT replace_store_sub_locations($1,$2,$3,$4)',[H2,'h2-location','LOG-FIX-02','[]']),/not authorized/i);
 await assert.rejects(db.query('SELECT replace_store_sub_locations($1,$2,$3,$4)',[H1,'h1-location','WRONG','[]']),/Invalid store/i);
 await assert.rejects(db.query('SELECT replace_store_sub_locations($1,$2,$3,$4)',[H1,'h1-location','LOG-FIX-01',JSON.stringify([{id:'broken',type:'rack'}])]),/not-null|null value/i);
 assert.equal((await db.query('SELECT id FROM store_sub_locations')).rows[0].id,'original');
 await db.query('SELECT replace_store_sub_locations($1,$2,$3,$4)',[H1,'h1-location','LOG-FIX-01',JSON.stringify([{id:'replacement',type:'rack',name:'Replacement',code:'R2'}])]);
 assert.equal((await db.query('SELECT id FROM store_sub_locations')).rows[0].id,'replacement');
 await db.exec('RESET ROLE');assert.equal((await db.query("SELECT * FROM audit_logs WHERE entity_type='store_sub_locations'")).rows.length,2);
});
test('nullable store stock thresholds preserve defaults; negative or reversed bounds rejected and valid changes audited',async t=>{
 const {db,as}=await fixture(t);await db.exec('RESET ROLE');
 for(const table of ['facility_drug_inventory','facility_nondrug_inventory']){
 const id=table==='facility_drug_inventory'?'99999999-9999-4999-8999-999999999999':'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 await db.query(`INSERT INTO ${table}(id,hospital_id,location) VALUES ($1,$2,'Isolated')`,[id,H1]);const defaults=(await db.query(`SELECT min_stock_level,max_stock_level FROM ${table} WHERE id=$1`,[id])).rows[0];assert.equal(defaults.min_stock_level,null);assert.equal(defaults.max_stock_level,null);
 await assert.rejects(db.query(`UPDATE ${table} SET min_stock_level=-1 WHERE id=$1`,[id]),/check constraint/i);
 await assert.rejects(db.query(`UPDATE ${table} SET min_stock_level=10,max_stock_level=2 WHERE id=$1`,[id]),/stock_bounds|Minimum stock exceeds/i);
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[actor.admin]);await db.query(`UPDATE ${table} SET min_stock_level=2,max_stock_level=10 WHERE id=$1`,[id]);
 const audit=(await db.query('SELECT new_values FROM audit_logs WHERE entity_id=$1 AND action=\'UPDATE\'',[id])).rows[0];assert.equal(audit.new_values.min_stock_level,2);assert.equal(audit.new_values.max_stock_level,10);
 }
});
