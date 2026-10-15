const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')
const { build } = require('esbuild')

const root = path.resolve(__dirname, '..')

function client() {
  return {
    queries: [],
    from(table) {
      const query = { table, calls: [] }
      this.queries.push(query)
      const chain = {}
      for (const method of ['select', 'eq', 'neq', 'in', 'gte', 'lte', 'order', 'range', 'limit', 'not', 'or']) {
        chain[method] = (...args) => { query.calls.push([method, ...args]); return chain }
      }
      chain.single = () => Promise.resolve(globalThis.__qaProcurement.reply(query))
      chain.maybeSingle = chain.single
      chain.then = (resolve, reject) => Promise.resolve(globalThis.__qaProcurement.reply(query)).then(resolve, reject)
      return Object.assign(chain, { query })
    }
  }
}

async function loadService(relativePath) {
  const entry = path.join(root, relativePath)
  const result = await build({
    absWorkingDir: root,
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    plugins: [{ name: 'isolated-procurement-client', setup(builder) {
      builder.onResolve({ filter: /^@\/services\/supabase$/ }, () => ({ path: 'supabase-fixture', namespace: 'qa' }))
      builder.onResolve({ filter: /^@\/services\/offlineAdapter$/ }, () => ({ path: 'offline-adapter-fixture', namespace: 'qa' }))
      builder.onResolve({ filter: /^@\/services\/pharmacy\/uploadService$/ }, () => ({ path: 'upload-service-fixture', namespace: 'qa' }))
      builder.onResolve({ filter: /.*/ }, args => {
        if (args.path === 'pdf-lib') return { path: 'pdf-lib-fixture', namespace: 'qa' }
        if (args.path === './warrantService' || args.path === './procurementService' || args.path === '@/shared/lib/utils' || args.path === './creditNoteService' || args.path === './penaltyService' || args.path === './orderTrackingService') return { path: args.path, namespace: 'qa' }
      })
      builder.onLoad({ filter: /.*/, namespace: 'qa' }, args => {
        if (args.path === 'supabase-fixture') return { contents: 'export const supabase={from:(table)=>globalThis.__qaProcurement.client.from(table)}; export const isSupabaseConfigured=()=>true', loader: 'js' }
        if (args.path === 'offline-adapter-fixture') return { contents: 'export const offlineAdapter={getCache:async()=>globalThis.__qaProcurement.cache,setCache:async()=>{}}', loader: 'js' }
        if (args.path === 'upload-service-fixture') return { contents: 'export const uploadLpoDocument=async()=>({data:null,error:null})', loader: 'js' }
        if (args.path === 'pdf-lib-fixture') return { contents: 'export const PDFDocument={load:async()=>({getPages:()=>[],save:async()=>new Uint8Array()})}', loader: 'js' }
        if (args.path === './orderTrackingService') return { contents: 'export const createOrderTrackingForLPO=async()=>{}; export const recalculateOverdueStatus=async()=>{}', loader: 'js' }
        if (args.path === './warrantService') return { contents: 'export const getSharedDepartments=(value)=>[value]; export const normalize=(value)=>String(value||"").trim().toLowerCase()', loader: 'js' }
        if (args.path === './procurementService') return { contents: 'export const getPurchaseOrderById=async()=>({data:null,error:null})', loader: 'js' }
        if (args.path === '@/shared/lib/utils') return { contents: 'export const isApplOrder=()=>true', loader: 'js' }
        return { contents: 'export const createCreditNoteDraft=async()=>({data:null,error:null}); export const approveCreditNote=async()=>({data:null,error:null}); export const checkAndCreateLatePenalty=async()=>({data:null,error:null}); export const recalculateOverdueStatus=async()=>({data:null,error:null})', loader: 'js' }
      })
    } }]
  })
  const loadedModule = new Module(entry, module)
  loadedModule.filename = entry
  loadedModule.paths = Module._nodeModulePaths(path.dirname(entry))
  loadedModule._compile(result.outputFiles[0].text, entry)
  return loadedModule.exports
}

function installReply(reply, cache = null) {
  const db = client()
  globalThis.__qaProcurement = { client: db, cache, reply: query => reply(query, db.queries) }
  return db
}

test('budget expense list treats all as unfiltered status selection, avoids synthetic approvers, and propagates approval-log errors', async t => {
  const engine = await loadService('src/modules/financial/services/budgetEngine.ts')
  const po = { id: 'isolated-po-1', po_number: 'QA-PO-1', po_type: 'regular', status: 'approved', order_date: '2026-01-04', total_amount: 125, department: 'Pharmacy', approver: null, supplier: { company_name: 'Fixture Supplier' } }
  const db = installReply(query => query.table === 'pharmacy_purchase_orders' ? { data: [po], error: null } : { data: [], error: null })
  const success = await engine.getExpenseList({ hospitalId: 'fixture-hospital', fiscalYear: 2026, status: 'all' })
  assert.equal(success.error, null)
  assert.equal(success.data.length, 1)
  assert.equal(success.data[0].purchase_order.approver, null)
  const poQuery = db.queries.find(query => query.table === 'pharmacy_purchase_orders')
  assert.deepEqual(poQuery.calls.find(call => call[0] === 'in' && call[1] === 'status')?.[2], ['approved', 'sent', 'partial_received', 'completed', 'cancelled', 'pending_approval', 'draft'])
  assert.equal(poQuery.calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'all'), false)
  assert.equal(db.queries.some(query => query.table === 'approval_logs' && query.calls.some(call => call[0] === 'in' && call[1] === 'entity_id' && call[2].includes('PO-2026-0382'))), false)

  installReply(query => query.table === 'pharmacy_purchase_orders'
    ? { data: [po], error: null }
    : { data: null, error: new Error('fixture approval log unavailable') })
  const failed = await engine.getExpenseList({ hospitalId: 'fixture-hospital', fiscalYear: 2026, status: 'all' })
  assert.equal(failed.data, null)
  assert.equal(failed.error, 'fixture approval log unavailable')
})

test('penalty API returns paginated success and a typed error for the same fixture query', async () => {
  const penalties = await loadService('src/modules/procurement/services/penaltyService.ts')
  const row = { id: 'fixture-penalty', penalty_amount: 25, status: 'pending' }
  installReply(() => ({ data: [row], count: 1, error: null }))
  const success = await penalties.getPenalties('fixture-hospital', { penalty_type: 'appl' }, 2, 5)
  assert.deepEqual(success, { data: [row], meta: { total: 1, page: 2, limit: 5, totalPages: 1 }, error: null })

  installReply(() => ({ data: null, count: null, error: new Error('fixture penalty query denied') }))
  const failure = await penalties.getPenalties('fixture-hospital', { penalty_type: 'appl' }, 2, 5)
  assert.equal(failure.data.length, 0)
  assert.equal(failure.error, 'fixture penalty query denied')
})

test('LPO pending and cached paths map object/array relations and omit incomplete cache rows', async () => {
  const lpo = await loadService('src/modules/procurement/services/lpoService.ts')
  const pendingRows = [
    { id: 'pending-object', po_number: 'QA-PO-OBJECT', total_amount: 40, manual_supplier_name: null, order_date: '2026-01-01', supplier: { company_name: 'Object Supplier' }, items: [{ id: 'object-item', item_name: 'Fixture item one', item_code: null, quantity_ordered: 2, unit_price: 20 }] },
    { id: 'pending-array', po_number: 'QA-PO-ARRAY', total_amount: 60, manual_supplier_name: null, order_date: '2026-01-02', supplier: [{ company_name: 'Array Supplier' }], items: [{ id: 'array-item', item_name: 'Fixture item two', item_code: 'QA-ITEM-2', quantity_ordered: 3, unit_price: 20 }] },
  ]
  const db = installReply(query => query.table === 'pharmacy_purchase_orders'
    ? { data: pendingRows, error: null }
    : { data: [], error: null })
  const pending = await lpo.getPendingPOsForLPO('fixture-hospital')
  assert.equal(pending.error, null)
  assert.deepEqual(pending.data.map(row => row.supplier_name), ['Object Supplier', 'Array Supplier'])
  assert.equal(pending.data[0].items[0].item_code, undefined)
  const pendingQuery = db.queries.find(query => query.table === 'pharmacy_purchase_orders')
  assert.ok(pendingQuery.calls.some(call => call[0] === 'eq' && call[1] === 'hospital_id' && call[2] === 'fixture-hospital'))
  assert.ok(pendingQuery.calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'approved'))

  const cachedRows = [
    { id: 'cached-object', po_id: 'po-object', lpo_number: 'QA-LPO-OBJECT', status: 'verified', po: { po_number: 'QA-PO-CACHED-OBJECT', po_type: 'regular', order_date: '2026-02-01', vote_code: '080702', supplier: { company_name: 'Cached Object Supplier' }, items: [{ item_name: 'Cached object item' }] } },
    { id: 'cached-array', po_id: 'po-array', lpo_number: 'QA-LPO-ARRAY', status: 'verified', po: [{ po_number: 'QA-PO-CACHED-ARRAY', po_type: 'regular', order_date: '2026-02-02', vote_code: '080702', supplier: [{ company_name: 'Cached Array Supplier' }], items: [{ item_name: 'Cached array item' }] }] },
    { id: 'incomplete-po-number', po_id: 'po-incomplete-number', lpo_number: 'QA-LPO-INCOMPLETE', po: { po_type: 'regular', order_date: '2026-02-03' } },
    { id: 'incomplete-po-id', lpo_number: 'QA-LPO-NO-PO', po: { po_number: 'QA-PO-NO-ID', po_type: 'regular', order_date: '2026-02-04' } },
    { id: 'incomplete-po-type', po_id: 'po-incomplete-type', lpo_number: 'QA-LPO-NO-TYPE', po: { po_number: 'QA-PO-NO-TYPE', order_date: '2026-02-05' } },
    { id: 'incomplete-order-date', po_id: 'po-incomplete-date', lpo_number: 'QA-LPO-NO-DATE', po: { po_number: 'QA-PO-NO-DATE', po_type: 'regular' } },
  ]
  installReply(() => ({ data: null, error: new Error('fixture online LPO query unavailable') }), cachedRows)
  const cached = await lpo.getLPOList('fixture-hospital', 'approved')
  assert.equal(cached.error, null)
  assert.equal(cached.data.total, 2)
  assert.deepEqual(cached.data.data.map(row => row.po_number), ['QA-PO-CACHED-OBJECT', 'QA-PO-CACHED-ARRAY'])
  assert.deepEqual(cached.data.data.map(row => row.supplier_name), ['Cached Object Supplier', 'Cached Array Supplier'])
  assert.deepEqual(cached.data.data.map(row => row.item_names), [['Cached object item'], ['Cached array item']])
})

test('receiving history merges legacy and newer rows in date order and reports every lookup failure', async () => {
  const receiving = await loadService('src/modules/procurement/services/receivingService.ts')
  const legacy = { id: 'legacy-1', hospital_id: 'fixture-hospital', po_id: 'fixture-po', created_at: '2026-01-01T00:00:00Z', gr_number: 'GR-1', items: [] }
  const modern = { id: 'modern-1', hospital_id: 'fixture-hospital', lpo_id: 'fixture-lpo', do_number: 'DO-2', receiving_date: '2026-01-02', created_at: '2026-01-02T00:00:00Z', status: 'completed', received_by: 'fixture-user', do_document_urls: [], items: [{ id: 'item-1', lpo_item_id: 'po-item-1', received_quantity: 3, po_item: { item_name: 'Fixture medicine', item_code: 'QA-1' } }] }
  installReply(query => query.table === 'pharmacy_goods_receipts' ? { data: [legacy], error: null } : query.table === 'pharmacy_lpo' ? { data: [{ id: 'fixture-lpo' }], error: null } : { data: [modern], error: null })
  const merged = await receiving.getGoodsReceiptHistory('fixture-po')
  assert.equal(merged.error, null)
  assert.deepEqual(merged.data.map(row => row.id), ['modern-1', 'legacy-1'])
  assert.equal(merged.data[0].po_id, 'fixture-po')
  assert.equal(merged.data[0].gr_number, 'DO-2')
  assert.equal(merged.data[0].items[0].quantity_accepted, 3)

  for (const [table, message] of [['pharmacy_goods_receipts', 'fixture receipt lookup failed'], ['pharmacy_lpo', 'fixture LPO lookup failed'], ['pharmacy_receiving', 'fixture receiving lookup failed']]) {
    installReply(query => query.table === table ? { data: null, error: new Error(message) } : query.table === 'pharmacy_goods_receipts' ? { data: [], error: null } : query.table === 'pharmacy_lpo' ? { data: [{ id: 'fixture-lpo' }], error: null } : { data: [], error: null })
    const result = await receiving.getGoodsReceiptHistory('fixture-po')
    assert.equal(result.data, null, `${table} errors must not be hidden as empty history`)
    assert.equal(result.error, message)
  }
})
