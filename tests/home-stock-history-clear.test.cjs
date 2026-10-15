const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const runtime = process.env.HOME_TEST_PGLITE_DIR || 'C:/Users/60113/AppData/Local/Temp/home-fixes-postgres-0f97fd1a6a684e39b4652d0c841c1d32/node_modules/@electric-sql/pglite'
const { PGlite } = require(runtime)
const root = path.resolve(__dirname, '..')
const H1 = '11111111-1111-4111-8111-111111111111'
const H2 = '22222222-2222-4222-8222-222222222222'
const ITEM_A = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
const ITEM_B = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
const actor = {
  admin: '77777777-7777-4777-8777-777777777777',
  permission: '88888888-8888-4888-8888-888888888888',
  ordinary: '99999999-9999-4999-8999-999999999999',
  inactive: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  foreignAdmin: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
}

async function fixture(t) {
  const db = new PGlite()
  t.after(() => db.close())
  await db.exec(fs.readFileSync(path.join(__dirname, 'home-stock-history-clear.sql'), 'utf8'))
  for (const migration of [
    '068_create_store_locations_table.sql',
    '012_create_audit_logs_table.sql',
    '089_secure_store_locations.sql',
    '090_secure_stock_history_clear.sql',
  ]) {
    await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations', migration), 'utf8'))
  }
  await db.exec(`
    GRANT SELECT, DELETE ON pharmacy_stock_transactions, pharmacy_stock_batches TO authenticated, anon;
    GRANT SELECT, UPDATE ON facility_drug_inventory, facility_nondrug_inventory TO authenticated;
    GRANT SELECT ON users, roles, permissions, role_permissions TO authenticated;
  `)
  const as = async (id, role = 'authenticated') => {
    await db.exec('RESET ROLE')
    await db.query(
      "SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",
      [id || '', role],
    )
    await db.exec(`SET ROLE ${role}`)
  }
  return { db, as }
}

async function clear(db, hospital = H1, item = null) {
  return db.query('SELECT public.clear_stock_history_and_reset_inventory($1,$2) AS result', [hospital, item])
}

test('hospital admin clears only the selected item and all history, facility changes are audited', async t => {
  const { db, as } = await fixture(t)
  await as(actor.admin)
  const { rows } = await clear(db, H1, ITEM_A)
  assert.deepEqual(rows[0].result, {
    deletedTransactionsCount: 1,
    deletedBatchesCount: 1,
    resetDrugInventoryRows: 1,
    resetNonDrugInventoryRows: 1,
  })
  await db.exec('RESET ROLE')

  const tx = await db.query('SELECT id FROM pharmacy_stock_transactions ORDER BY id')
  assert.deepEqual(tx.rows.map(row => row.id), [
    '21212121-2121-4121-8121-212121212121',
    '22222222-2222-4222-8222-222222222220',
  ])
  const stocks = await db.query('SELECT hospital_id,facility_stock FROM facility_drug_inventory ORDER BY id')
  assert.deepEqual(stocks.rows.map(row => [row.hospital_id, row.facility_stock]), [[H1, 0], [H1, 7], [H2, 5]])
  const audits = await db.query(`SELECT action,entity_type,entity_id FROM audit_logs
    WHERE entity_type IN ('pharmacy_stock_transactions','pharmacy_stock_batches','facility_drug_inventory','facility_nondrug_inventory')
    ORDER BY entity_type,action,entity_id`)
  assert.equal(audits.rows.length, 4)
  assert.deepEqual(audits.rows.map(row => row.action).sort(), ['DELETE', 'DELETE', 'UPDATE', 'UPDATE'])
  assert.deepEqual(new Set(audits.rows.map(row => row.entity_type)), new Set([
    'pharmacy_stock_transactions', 'pharmacy_stock_batches', 'facility_drug_inventory', 'facility_nondrug_inventory',
  ]))
  assert.ok(audits.rows.every(row => row.entity_id))
})

test('active inventory permission actor can clear own hospital; foreign hospital stays intact', async t => {
  const { db, as } = await fixture(t)
  await as(actor.permission)
  const { rows } = await clear(db, H1, ITEM_B)
  assert.deepEqual(rows[0].result, {
    deletedTransactionsCount: 1,
    deletedBatchesCount: 1,
    resetDrugInventoryRows: 1,
    resetNonDrugInventoryRows: 1,
  })
  await db.exec('RESET ROLE')
  const foreign = await db.query('SELECT count(*)::int AS n FROM pharmacy_stock_transactions WHERE hospital_id=$1', [H2])
  assert.equal(foreign.rows[0].n, 1)
  const foreignStock = await db.query('SELECT facility_stock FROM facility_drug_inventory WHERE hospital_id=$1', [H2])
  assert.equal(foreignStock.rows[0].facility_stock, 5)
})

test('ordinary, inactive, cross-tenant, anonymous and missing actors are denied', async t => {
  const { db, as } = await fixture(t)
  for (const id of [actor.ordinary, actor.inactive, actor.foreignAdmin]) {
    await as(id)
    await assert.rejects(clear(db, H1), /not authorized/i, `actor ${id} must not clear hospital one`)
  }
  await as(null, 'authenticated')
  await assert.rejects(clear(db, H1), /Authenticated actor required/i)
  await as(null, 'anon')
  await assert.rejects(clear(db, H1), /permission denied/i)
})

test('direct transaction and batch deletes are denied even for an authorized admin', async t => {
  const { db, as } = await fixture(t)
  await as(actor.admin)
  for (const table of ['pharmacy_stock_transactions', 'pharmacy_stock_batches']) {
    const result = await db.query(`DELETE FROM ${table} WHERE hospital_id=$1 RETURNING id`, [H1])
    assert.equal(result.rows.length, 0, `${table} direct delete must be denied by RLS`)
    const remaining = await db.query(`SELECT count(*)::int AS n FROM ${table} WHERE hospital_id=$1`, [H1])
    assert.equal(remaining.rows[0].n, 2)
  }
})

test('audit constraint failure rolls back history deletes, facility resets and audit inserts', async t => {
  const { db, as } = await fixture(t)
  const beforeAudit = await db.query('SELECT count(*)::int AS n FROM audit_logs')
  await db.exec("ALTER TABLE audit_logs ADD CONSTRAINT isolated_stock_clear_audit_failure CHECK (action <> 'UPDATE')")
  await as(actor.admin)
  await assert.rejects(clear(db, H1), /isolated_stock_clear_audit_failure/i)
  await db.exec('RESET ROLE')

  for (const table of ['pharmacy_stock_transactions', 'pharmacy_stock_batches']) {
    const remaining = await db.query(`SELECT count(*)::int AS n FROM ${table} WHERE hospital_id=$1`, [H1])
    assert.equal(remaining.rows[0].n, 2, `${table} delete must roll back`)
  }
  const stocks = await db.query('SELECT facility_stock FROM facility_drug_inventory WHERE hospital_id=$1 ORDER BY id', [H1])
  assert.deepEqual(stocks.rows.map(row => row.facility_stock), [9, 7])
  const nonDrugStocks = await db.query('SELECT facility_stock FROM facility_nondrug_inventory WHERE hospital_id=$1 ORDER BY id', [H1])
  assert.deepEqual(nonDrugStocks.rows.map(row => row.facility_stock), [8, 6])
  const afterAudit = await db.query('SELECT count(*)::int AS n FROM audit_logs')
  assert.equal(afterAudit.rows[0].n, beforeAudit.rows[0].n, 'all audit inserts from failed call must roll back')
})
