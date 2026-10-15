const assert = require('node:assert/strict')
const { test } = require('node:test')
const { loadSource } = require('./home-health-regressions.test.cjs')

const H1 = '11111111-1111-4111-8111-111111111111'
const H2 = '22222222-2222-4222-8222-222222222222'
const ITEM_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const ITEM_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

function fixtureRows() {
  return {
    pharmacy_stock_transactions: [
      { id: 'tx-h1-a', hospital_id: H1, item_id: ITEM_A },
      { id: 'tx-h1-b', hospital_id: H1, item_id: ITEM_B },
      { id: 'tx-h2-a', hospital_id: H2, item_id: ITEM_A },
    ],
    pharmacy_stock_batches: [
      { id: 'batch-h1-a', hospital_id: H1, item_id: ITEM_A },
      { id: 'batch-h1-b', hospital_id: H1, item_id: ITEM_B },
      { id: 'batch-h2-a', hospital_id: H2, item_id: ITEM_A },
    ],
    facility_drug_inventory: [
      { id: 'drug-row-h1-a', hospital_id: H1, drug_id: ITEM_A, facility_stock: 9 },
      { id: 'drug-row-h1-b', hospital_id: H1, drug_id: ITEM_B, facility_stock: 7 },
      { id: 'drug-row-h2-a', hospital_id: H2, drug_id: ITEM_A, facility_stock: 5 },
    ],
    facility_nondrug_inventory: [
      { id: 'nondrug-row-h1-a', hospital_id: H1, nondrug_id: ITEM_A, facility_stock: 8 },
      { id: 'nondrug-row-h1-b', hospital_id: H1, nondrug_id: ITEM_B, facility_stock: 6 },
      { id: 'nondrug-row-h2-a', hospital_id: H2, nondrug_id: ITEM_A, facility_stock: 4 },
    ],
  }
}

function createClient({ rows = fixtureRows(), configured = true, failAt = null, rpcData = null } = {}) {
  const calls = []
  const client = {
    calls,
    rows,
    async rpc(name, args) {
      const call = { name, args: structuredClone(args) }
      calls.push(call)
      if (failAt?.rpc) return { data: null, error: { message: failAt.message || 'isolated RPC failure' } }

      const { p_hospital_id: hospitalId, p_item_id: itemId } = args
      const matches = row => row.hospital_id === hospitalId && (itemId == null || (row.item_id ?? row.drug_id ?? row.nondrug_id) === itemId)
      const transactionRows = rows.pharmacy_stock_transactions.filter(matches)
      const batchRows = rows.pharmacy_stock_batches.filter(matches)
      const drugRows = rows.facility_drug_inventory.filter(matches)
      const nondrugRows = rows.facility_nondrug_inventory.filter(matches)
      for (const table of ['pharmacy_stock_transactions', 'pharmacy_stock_batches']) {
        rows[table] = rows[table].filter(row => !matches(row))
      }
      for (const row of [...drugRows, ...nondrugRows]) row.facility_stock = 0
      return {
        data: rpcData ?? {
          deletedTransactionsCount: transactionRows.length,
          deletedBatchesCount: batchRows.length,
          resetDrugInventoryRows: drugRows.length,
          resetNonDrugInventoryRows: nondrugRows.length,
        },
        error: null,
      }
    },
  }

  return { client, configured: () => configured, calls, rows }
}

function loadClearService(fixture) {
  const empty = []
  const dependencies = {
    '@/services/supabase': { supabase: fixture.client, isSupabaseConfigured: fixture.configured },
    '@/services/offlineAdapter': { offlineAdapter: {} },
    '@/lib/utils': { parseAndNormalizeDate: value => value },
    '@/shared/utils/itemCodeUtils': { normalizeRealMdcCode: value => value, isSyntheticMockCode: () => false },
    '@/services/pharmacy/mockData': {
      mockDrugs: empty, mockDrugCategories: empty, mockNonDrugs: empty, mockNonDrugCategories: empty,
      mockSuppliers: empty, mockStockBatches: empty, mockStockLocations: empty, mockExpiryItems: empty, mockSlowMovingItems: empty,
    },
    '@/services/pharmacy/facilityDrugInventoryService': { loadFacilityDrugInventory: async () => [] },
    '@/services/pharmacy/facilityNonDrugInventoryService': { loadFacilityNonDrugInventory: async () => [] },
  }
  return loadSource('src/modules/inventory/services/inventoryService.ts', dependencies)
}

test('clearStockTransactions calls the atomic RPC for all items in the requested hospital', async () => {
  const fixture = createClient()
  const service = loadClearService(fixture)
  const result = await service.clearStockTransactions(H1)

  assert.equal(result.error, null)
  assert.deepEqual({ ...result.data }, {
    deletedTransactionsCount: 2,
    deletedBatchesCount: 2,
    resetDrugInventoryRows: 2,
    resetNonDrugInventoryRows: 2,
  })

  assert.deepEqual(fixture.calls, [{
    name: 'clear_stock_history_and_reset_inventory',
    args: { p_hospital_id: H1, p_item_id: null },
  }])

  assert.deepEqual(fixture.rows.pharmacy_stock_transactions.map(row => row.id), ['tx-h2-a'])
  assert.deepEqual(fixture.rows.pharmacy_stock_batches.map(row => row.id), ['batch-h2-a'])
  assert.deepEqual(fixture.rows.facility_drug_inventory.map(row => [row.id, row.facility_stock]), [['drug-row-h1-a', 0], ['drug-row-h1-b', 0], ['drug-row-h2-a', 5]])
  assert.deepEqual(fixture.rows.facility_nondrug_inventory.map(row => [row.id, row.facility_stock]), [['nondrug-row-h1-a', 0], ['nondrug-row-h1-b', 0], ['nondrug-row-h2-a', 4]])
})

test('item-specific clear passes the exact hospital and item to the atomic RPC', async () => {
  const fixture = createClient()
  const service = loadClearService(fixture)
  const result = await service.clearStockTransactions(H1, ITEM_A)

  assert.equal(result.error, null)
  assert.deepEqual({ ...result.data }, {
    deletedTransactionsCount: 1,
    deletedBatchesCount: 1,
    resetDrugInventoryRows: 1,
    resetNonDrugInventoryRows: 1,
  })
  assert.deepEqual(fixture.calls, [{
    name: 'clear_stock_history_and_reset_inventory',
    args: { p_hospital_id: H1, p_item_id: ITEM_A },
  }])
  assert.deepEqual(fixture.rows.pharmacy_stock_transactions.map(row => row.id), ['tx-h1-b', 'tx-h2-a'])
  assert.deepEqual(fixture.rows.pharmacy_stock_batches.map(row => row.id), ['batch-h1-b', 'batch-h2-a'])
  assert.deepEqual(fixture.rows.facility_drug_inventory.map(row => [row.id, row.facility_stock]), [['drug-row-h1-a', 0], ['drug-row-h1-b', 7], ['drug-row-h2-a', 5]])
  assert.deepEqual(fixture.rows.facility_nondrug_inventory.map(row => [row.id, row.facility_stock]), [['nondrug-row-h1-a', 0], ['nondrug-row-h1-b', 6], ['nondrug-row-h2-a', 4]])
})

test('unconfigured Supabase returns explicit failure and performs no writes', async () => {
  const fixture = createClient({ configured: false })
  const before = structuredClone(fixture.rows)
  const service = loadClearService(fixture)
  const result = await service.clearStockTransactions(H1)
  assert.equal(result.data, null)
  assert.match(result.error, /must be configured/i)
  assert.equal(fixture.calls.length, 0)
  assert.deepEqual(fixture.rows, before)
})

test('invalid hospital or item IDs fail before querying or mutating isolated rows', async () => {
  const fixture = createClient()
  const before = structuredClone(fixture.rows)
  const service = loadClearService(fixture)
  const invalidHospital = await service.clearStockTransactions('not-a-hospital')
  assert.equal(invalidHospital.data, null)
  assert.match(invalidHospital.error, /valid hospital/i)
  const invalidItem = await service.clearStockTransactions(H1, 'not-an-item')
  assert.equal(invalidItem.data, null)
  assert.match(invalidItem.error, /valid inventory item/i)
  assert.equal(fixture.calls.length, 0)
  assert.deepEqual(fixture.rows, before)
})

test('RPC failure returns an error rather than false success and leaves isolated fixture unchanged', async () => {
  const fixture = createClient({ failAt: { rpc: true, message: 'permission denied' } })
  const before = structuredClone(fixture.rows)
  const service = loadClearService(fixture)
  const result = await service.clearStockTransactions(H1)

  assert.equal(result.data, null)
  assert.match(result.error, /Inventory reset RPC failed: permission denied/i)
  assert.deepEqual(fixture.rows, before)
  assert.deepEqual(fixture.calls, [{
    name: 'clear_stock_history_and_reset_inventory',
    args: { p_hospital_id: H1, p_item_id: null },
  }])
})

test('malformed RPC count result fails closed instead of claiming an inventory reset', async () => {
  const fixture = createClient({ rpcData: { deletedTransactionsCount: '2', deletedBatchesCount: 2, resetDrugInventoryRows: 2, resetNonDrugInventoryRows: 2 } })
  const service = loadClearService(fixture)
  const result = await service.clearStockTransactions(H1)
  assert.equal(result.data, null)
  assert.match(result.error, /invalid deletedTransactionsCount count\./i)
})
