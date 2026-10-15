const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadSource } = require('./home-health-regressions.test.cjs');
const ids = { actor: '11111111-1111-4111-8111-111111111111', target: '22222222-2222-4222-8222-222222222222', H1: '33333333-3333-4333-8333-333333333333', H2: '44444444-4444-4444-8444-444444444444', role: '55555555-5555-4555-8555-555555555555', staff: '66666666-6666-4666-8666-666666666666' };
function fixture(overrides = {}) {
  const calls = []; const audits = [];
  const actor = { id: ids.actor, hospital_id: ids.H1, role_id: ids.role, status: 'active', ...overrides.actor };
  const roles = { [ids.role]: { id: ids.role, role_code: overrides.role || 'hospital_admin', hospital_id: overrides.roleHospital ?? ids.H1 }, [ids.staff]: { id: ids.staff, role_code: 'staff', hospital_id: null } };
  const target = { id: ids.target, email: 'target@isolated.invalid', hospital_id: overrides.targetHospital || ids.H1, role_id: ids.staff };
  const client = { auth: { getUser: async () => ({ data: { user: { id: ids.actor } }, error: overrides.authError }), admin: {} }, from(table) {
    const filters = {}; let insertion;
    const query = { select() { return this; }, eq(k,v) { filters[k] = v; return this; }, insert(row) { insertion = row; return this; }, async maybeSingle() {
      const data = table === 'roles' ? roles[filters.id] : table === 'hospitals' ? { id: filters.id } : filters.id === ids.actor ? actor : filters.id === ids.target || filters.email === target.email ? target : null;
      return { data, error: null };
    }, then(resolve) { if (table === 'audit_logs') audits.push(insertion); return Promise.resolve({ error: typeof overrides.auditError==='function'?overrides.auditError(audits.length):overrides.auditError }).then(resolve); } };
    return query;
  } };
  for (const operation of ['createUser','deleteUser','updateUserById','getUserById','listUsers']) client.auth.admin[operation] = async (...args) => {
    calls.push({ operation, args });
    if (operation === 'listUsers') return overrides.listUsers ? overrides.listUsers(...args) : { data: { users: [] }, error: null };
    return { data: { user: { id: operation==='createUser'?(overrides.createdUserId||ids.target):ids.target, email: target.email } }, error:operation==='deleteUser'?overrides.deleteError:null };
  };
  const handler = loadSource('supabase/functions/admin-user-ops/handler.ts').createAdminUserOpsHandler(client);
  const send = (body, authorization = 'Bearer isolated-token') => handler(new Request('https://isolated.invalid/admin-user-ops', { method: 'POST', headers: authorization ? { authorization, 'content-type': 'application/json' } : {}, body: JSON.stringify(body) }));
  return { send, calls, audits };
}
test('anonymous, invalid, inactive, ordinary and cross-hospital actors perform zero privileged operations', async () => {
  for (const configuration of [{ noAuth: true }, { authError: new Error('invalid') }, { actor: { status: 'inactive' } }, { role: 'staff' }, { targetHospital: ids.H2 },{roleHospital:ids.H2}]) {
    const f = fixture(configuration); const response = await f.send({ action: 'delete_user', authUserId: ids.target }, configuration.noAuth ? null : undefined);
    assert.ok([401,403].includes(response.status)); assert.equal(f.calls.length, 0);
  }
});
test('failed post-creation audit rolls back actual UUID or returns explicit orphan reconciliation ID',async()=>{
 for(const deleteError of [null,new Error('Isolated cleanup error')]){
 const f=fixture({auditError:count=>count===2?new Error('Completed audit unavailable'):null,deleteError});const response=await f.send({action:'create_user',hospitalId:ids.H1,roleId:ids.staff,email:'new@isolated.invalid',password:'fixture-password'});assert.equal(response.status,503);const body=await response.json();assert.equal(body.success,false);assert.equal(f.calls[0].operation,'createUser');assert.equal(f.calls[1].operation,'deleteUser');assert.equal(f.calls[1].args[0],ids.target);assert.equal(body.reconciliationRequired,!!deleteError);if(deleteError)assert.equal(body.createdAuthUserId,ids.target);
 }
});
test('mapped profile recovery provisions Auth with and preserves the existing public profile UUID',async()=>{
 const f=fixture();const supabase={functions:{invoke:async(_name,{body})=>{const response=await f.send(body);return {data:await response.json(),error:response.ok?null:new Error('Admin operation failed')};}}};
 const api=loadSource('src/modules/auth/services/authUserService.ts',{'../../../services/supabase':{supabase,isSupabaseConfigured:()=>true}});
 const result=await api.createAuthUser('target@isolated.invalid','fixture-password',ids.target,{hospitalId:ids.H1,roleId:ids.staff});
 assert.equal(result.success,true);assert.equal(result.authUserId,ids.target);assert.equal(f.calls[0].operation,'createUser');assert.equal(f.calls[0].args[0].id,ids.target);assert.ok(f.audits.every(entry=>entry.entity_id===ids.target));
});
test('mismatched Auth UUID is deleted by its actual returned ID or exposed for reconciliation',async()=>{
 const mismatchedId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 for(const deleteError of [null,new Error('isolated cleanup failure')]){
  const f=fixture({createdUserId:mismatchedId,deleteError});const response=await f.send({action:'create_user',userId:ids.target,hospitalId:ids.H1,roleId:ids.staff,email:'target@isolated.invalid',password:'fixture-password'});assert.equal(response.status,503);const body=await response.json();
  assert.equal(body.success,false);assert.equal(f.calls[0].args[0].id,ids.target);assert.equal(f.calls[1].operation,'deleteUser');assert.equal(f.calls[1].args[0],mismatchedId);assert.equal(body.reconciliationRequired,!!deleteError);if(deleteError)assert.equal(body.createdAuthUserId,mismatchedId);
 }
});
test('malformed JSON shapes and action fields return 400 without admin calls', async () => {
  for (const body of [null, [], 7, {}, { action: 'delete_user', authUserId: 'invalid' }, { action: 'update_password', authUserId: ids.target, password: {} }]) {
    const f = fixture(); const response = await f.send(body); assert.equal(response.status, 400, `body ${JSON.stringify(body)}`); assert.equal(f.calls.length, 0);
  }
});
test('same hospital admin mutation records trusted actor and target without credentials', async () => {
  const f = fixture(); const response = await f.send({ action: 'update_password', authUserId: ids.target, password: 'isolated-password', actorId: 'spoof' });
  assert.equal(response.status, 200); assert.equal(f.calls.length, 1); assert.equal(f.calls[0].operation, 'updateUserById');
  assert.equal(f.audits.length, 2); assert.ok(f.audits.every(a => a.user_id === ids.actor && a.entity_id === ids.target)); assert.ok(!JSON.stringify(f.audits).includes('isolated-password'));
});
test('audit persistence failure cancels privileged operation', async () => {
  const f = fixture({ auditError: new Error('db unavailable') }); assert.equal((await f.send({ action: 'delete_user', authUserId: ids.target })).status, 503); assert.equal(f.calls.length, 0);
});
test('page-two Auth account is found and failed lookup remains an error', async () => {
  const f = fixture({ role: 'system_admin', listUsers: async ({ page }) => ({ data: { users: page === 1 ? Array.from({ length: 1000 }, (_,i) => ({ id: String(i), email: `unrelated${i}@isolated.invalid` })) : [{ id: ids.target, email: 'later@isolated.invalid' }] }, error: null }) });
  const response = await f.send({ action: 'check_user_exists', email: 'later@isolated.invalid' }); assert.equal(response.status, 200); assert.equal((await response.json()).exists, true); assert.equal(f.calls.length, 2);
  const failed = fixture({ role: 'system_admin', listUsers: async () => ({ data: null, error: new Error('network') }) }); assert.equal((await failed.send({ action: 'check_user_exists', email: 'later@isolated.invalid' })).status, 503);
});
test('Edge failure never calls shared signup and lookup error halts recovery', async () => {
  const calls = []; const supabase = { functions: { invoke: async (_,body) => { calls.push(body); return { error: new Error('denied'), data: null }; } }, auth: { signUp() { throw new Error('Shared signup forbidden'); } } };
  const api = loadSource('src/modules/auth/services/authUserService.ts', { '../../../services/supabase': { supabase, isSupabaseConfigured: () => true } });
  assert.equal((await api.createAuthUser('staff@isolated.invalid', 'password', undefined, { hospitalId: ids.H1, roleId: ids.staff })).success, false);
  const recovery = await api.fixMissingAuthAccount(ids.target, 'staff@isolated.invalid', 'password'); assert.equal(recovery.success, false); assert.ok(recovery.error); assert.equal(calls.length, 2); assert.equal(calls[1].body.action, 'check_user_exists');
});
test('unconfigured provisioning fails without touching shared session', async () => {
  const api = loadSource('src/modules/auth/services/authUserService.ts', { '../../../services/supabase': { supabase: {}, isSupabaseConfigured: () => false } });
  assert.equal((await api.createAuthUser('staff@isolated.invalid', 'password', undefined, { hospitalId: ids.H1, roleId: ids.staff })).success, false);
});
test('failed profile creation deletes returned Auth UUID and exposes failed cleanup', async () => {
  for (const cleanupFails of [false,true]) {
    let inserted; const calls=[];
    const supabase={from(table){let insertion;return {select(){return this;},eq(){return this;},or(){return this;},insert(row){insertion=row;inserted=row;return this;},async maybeSingle(){return table==='roles'?{data:{id:ids.role},error:null}:insertion?{data:null,error:new Error('Isolated profile insertion failure')}:{data:null,error:null};}};},functions:{invoke:async(_name,args)=>{calls.push(args.body);return cleanupFails?{error:new Error('cleanup failed'),data:null}:{data:{success:true},error:null};}}};
    const api=loadSource('src/modules/hospital-admin/services/hospitalAdminService.ts',{'@/services/supabase':{supabase,isSupabaseConfigured:()=>true},'@/services/authUserService':{createAuthUser:async()=>({success:true,authUserId:ids.target})}});
    const result=await api.createHospitalAdmin({hospital_id:ids.H1,email:'admin@isolated.invalid',employee_id:'fixture',full_name:'Isolated administrator',ic_number:'fixture',phone_number:'fixture',password:'fixture-password',jawatan:'fixture'});
    assert.equal(result.success,false);assert.equal(inserted.id,ids.target);assert.equal(calls[0].authUserId,ids.target);
    if(cleanupFails) assert.match(result.error,/reconciliation/i);else assert.match(result.error,/profile insertion failure/i);
  }
});
