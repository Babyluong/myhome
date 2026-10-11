const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

console.log('--- Step 1: Updating src/services/offlinePreloader.ts ---');
const preloaderPath = path.join(root, 'src', 'services', 'offlinePreloader.ts');
let preloaderContent = fs.readFileSync(preloaderPath, 'utf8');

// Check if preloader already has prepack_items
if (!preloaderContent.includes('prepack_items')) {
  const targetAnchor = `        // 2g. Budgets & Warrants
        (async () => {
          const [budRes, warRes] = await Promise.all([
            supabase.from('pharmacy_budgets').select('*').eq('hospital_id', hospitalId),
            supabase.from('pharmacy_warrants').select('*').eq('hospital_id', hospitalId)
          ])

          if (budRes.data && budRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_budgets', budRes.data)
            await mergeTableRecords('pharmacy_budgets', budRes.data)
          }
          if (warRes.data && warRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_warrants', warRes.data)
            await mergeTableRecords('pharmacy_warrants', warRes.data)
          }
        })()`;

  const addition = `        // 2g. Budgets & Warrants
        (async () => {
          const [budRes, warRes] = await Promise.all([
            supabase.from('pharmacy_budgets').select('*').eq('hospital_id', hospitalId),
            supabase.from('pharmacy_warrants').select('*').eq('hospital_id', hospitalId)
          ])

          if (budRes.data && budRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_budgets', budRes.data)
            await mergeTableRecords('pharmacy_budgets', budRes.data)
          }
          if (warRes.data && warRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_warrants', warRes.data)
            await mergeTableRecords('pharmacy_warrants', warRes.data)
          }
        })(),

        // 2h. Prepack Module (items, batches, ledger)
        (async () => {
          const [itemsRes, batchesRes, ledgerRes] = await Promise.all([
            supabase.from('prepack_items').select('*').eq('hospital_id', hospitalId).limit(300),
            supabase.from('prepack_batches').select('*, prepack_item:prepack_items(*)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(300),
            supabase.from('prepack_kewps4_ledger').select('*').eq('hospital_id', hospitalId).order('transaction_date', { ascending: false }).limit(200)
          ])

          if (itemsRes.data && itemsRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_items', itemsRes.data)
            await mergeTableRecords('prepack_items', itemsRes.data)
          }
          if (batchesRes.data && batchesRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_batches', batchesRes.data)
            await mergeTableRecords('prepack_batches', batchesRes.data)
          }
          if (ledgerRes.data && ledgerRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_kewps4_ledger', ledgerRes.data)
            await mergeTableRecords('prepack_kewps4_ledger', ledgerRes.data)
          }
        })(),

        // 2i. Transporter & Tempahan (Bookings & Logistics)
        (async () => {
          const [transRes, vehRes, roomRes, bookRes] = await Promise.all([
            supabase.from('transporter_requests').select('*').eq('hospital_id', hospitalId).limit(200),
            supabase.from('transporter_vehicles').select('*').eq('hospital_id', hospitalId).limit(100),
            supabase.from('tempahan_rooms').select('*').eq('hospital_id', hospitalId),
            supabase.from('tempahan_bookings').select('*').eq('hospital_id', hospitalId).limit(200)
          ])

          if (transRes.data && transRes.data.length > 0) {
            await offlineAdapter.setCache('transporter_requests', transRes.data)
            await mergeTableRecords('transporter_requests', transRes.data)
          }
          if (vehRes.data && vehRes.data.length > 0) {
            await offlineAdapter.setCache('transporter_vehicles', vehRes.data)
            await mergeTableRecords('transporter_vehicles', vehRes.data)
          }
          if (roomRes.data && roomRes.data.length > 0) {
            await offlineAdapter.setCache('tempahan_rooms', roomRes.data)
            await mergeTableRecords('tempahan_rooms', roomRes.data)
          }
          if (bookRes.data && bookRes.data.length > 0) {
            await offlineAdapter.setCache('tempahan_bookings', bookRes.data)
            await mergeTableRecords('tempahan_bookings', bookRes.data)
          }
        })(),

        // 2j. MSDS & Crossborder Referrals
        (async () => {
          const [msdsRes, crossRes] = await Promise.all([
            supabase.from('msds_records').select('*').limit(200),
            supabase.from('crossborder_referrals').select('*').eq('hospital_id', hospitalId).limit(150)
          ])

          if (msdsRes.data && msdsRes.data.length > 0) {
            await offlineAdapter.setCache('msds_records', msdsRes.data)
            await mergeTableRecords('msds_records', msdsRes.data)
          }
          if (crossRes.data && crossRes.data.length > 0) {
            await offlineAdapter.setCache('crossborder_referrals', crossRes.data)
            await mergeTableRecords('crossborder_referrals', crossRes.data)
          }
        })()`;

  preloaderContent = preloaderContent.replace(targetAnchor, addition);
  fs.writeFileSync(preloaderPath, preloaderContent, 'utf8');
  console.log('-> offlinePreloader.ts successfully expanded with Tier 1 tables!');
} else {
  console.log('-> offlinePreloader.ts already includes prepack_items.');
}

console.log('--- Step 2: Updating src/services/offlineSyncService.ts for Audit Replay ---');
const syncServicePath = path.join(root, 'src', 'services', 'offlineSyncService.ts');
let syncServiceContent = fs.readFileSync(syncServicePath, 'utf8');

if (!syncServiceContent.includes('OFFLINE_SYNC_')) {
  const syncSuccessAnchor = `        if (success) {
          await offlineQueue.remove(mutation.id)
          successCount++
        } else {`;

  const syncSuccessReplacement = `        if (success) {
          await offlineQueue.remove(mutation.id)
          successCount++

          // R3 Compliance: Automatic audit logging upon replaying offline mutation
          try {
            const effectiveUserId = (mutation.payload as any)?.created_by || 
                                    (mutation.payload as any)?.user_id || 
                                    null
            const isValidUuid = typeof effectiveUserId === 'string' &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)

            await supabase.from('audit_logs').insert({
              user_id: isValidUuid ? effectiveUserId : null,
              action: \`OFFLINE_SYNC_\${mutation.action}\`,
              module: mutation.module || 'offline_sync',
              entity_type: mutation.table,
              entity_id: (mutation.payload as any)?.id || mutation.matchCriteria?.id || null,
              new_values: {
                table: mutation.table,
                action: mutation.action,
                mutation_id: mutation.id,
                offline_timestamp: new Date(mutation.timestamp).toISOString(),
                synced_at: new Date().toISOString()
              }
            })
          } catch (auditErr) {
            console.warn('[OfflineSync] Audit log replay notice (non-blocking):', auditErr)
          }
        } else {`;

  syncServiceContent = syncServiceContent.replace(syncSuccessAnchor, syncSuccessReplacement);
  fs.writeFileSync(syncServicePath, syncServiceContent, 'utf8');
  console.log('-> offlineSyncService.ts updated with audit_logs replay!');
} else {
  console.log('-> offlineSyncService.ts already contains audit_logs replay.');
}

console.log('--- Step 3: Updating src/modules/myprepacking/services/prepackService.ts ---');
const prepackServicePath = path.join(root, 'src', 'modules', 'myprepacking', 'services', 'prepackService.ts');
let prepackServiceContent = fs.readFileSync(prepackServicePath, 'utf8');

// Ensure offlineAdapter import
if (!prepackServiceContent.includes("import { offlineAdapter }")) {
  prepackServiceContent = "import { offlineAdapter } from '@/services/offlineAdapter'\n" + prepackServiceContent;
}

// Enhance getPrepackItems with caching and fallback
const origGetItemsCatch = `    if (itemsError) throw itemsError

    // 2. Fetch all active batches to compute live stock balances
    const { data: batches, error: batchesError } = await supabase
      .from('prepack_batches')
      .select('prepack_item_id, current_balance, status')
      .eq('hospital_id', targetHospId)
      .eq('status', 'active')`;

const enhancedGetItemsCatch = `    if (itemsError) throw itemsError

    if (items && items.length > 0) {
      void offlineAdapter.setCache('prepack_items', items);
    }

    // 2. Fetch all active batches to compute live stock balances
    const { data: batches, error: batchesError } = await supabase
      .from('prepack_batches')
      .select('prepack_item_id, current_balance, status')
      .eq('hospital_id', targetHospId)
      .eq('status', 'active')`;

if (prepackServiceContent.includes(origGetItemsCatch)) {
  prepackServiceContent = prepackServiceContent.replace(origGetItemsCatch, enhancedGetItemsCatch);
}

// Add fallback to getPrepackItems catch
const origGetItemsReturnErr = `    console.error('Error fetching prepack items:', err)
    return { data: null, error: err }
  }`;

const fallbackGetItemsReturnErr = `    console.warn('Error fetching prepack items, checking offline cache:', err)
    const cached = await offlineAdapter.getCache<PrepackItem>('prepack_items', 'myprepacking', 'prepack_items')
    if (cached && cached.length > 0) {
      return { data: cached, error: null }
    }
    return { data: null, error: err }
  }`;

if (prepackServiceContent.includes(origGetItemsReturnErr)) {
  prepackServiceContent = prepackServiceContent.replace(origGetItemsReturnErr, fallbackGetItemsReturnErr);
}

// Enhance createPrepackBatch with offline mutation execution
const origCreateBatchMutation = `    const { data, error } = await supabase
      .from('prepack_batches')
      .insert(payload)
      .select(\`
        *,
        prepack_item:prepack_items (
          id, item_code, item_name, pack_type, dosage_form, strength, package_type, units_per_pack
        )
      \`)
      .single()

    if (error) throw error`;

const enhancedCreateBatchMutation = `    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('prepack_batches')
        .insert(payload)
        .select(\`
          *,
          prepack_item:prepack_items (
            id, item_code, item_name, pack_type, dosage_form, strength, package_type, units_per_pack
          )
        \`)
        .single();
      data = res.data;
      error = res.error;
    } catch (networkErr) {
      error = networkErr;
    }

    // Offline fallback: enqueue mutation and update local optimistic cache
    if (error) {
      const offlineRes = await offlineAdapter.executeMutation<PrepackBatch>({
        module: 'myprepacking',
        table: 'prepack_batches',
        action: 'INSERT',
        payload: { ...payload, id: \`prepack_batch_\${Date.now()}\` } as any,
        conflictPolicy: 'server-wins'
      });
      if (offlineRes.data) {
        return { data: offlineRes.data, error: null };
      }
      throw error;
    }`;

if (prepackServiceContent.includes(origCreateBatchMutation)) {
  prepackServiceContent = prepackServiceContent.replace(origCreateBatchMutation, enhancedCreateBatchMutation);
}

fs.writeFileSync(prepackServicePath, prepackServiceContent, 'utf8');
console.log('-> prepackService.ts updated with offlineAdapter caching and fallback!');

console.log('--- Step 4: Updating src/modules/myporter/services/porterService.ts ---');
const porterServicePath = path.join(root, 'src', 'modules', 'myporter', 'services', 'porterService.ts');
let porterServiceContent = fs.readFileSync(porterServicePath, 'utf8');

// Ensure offlineAdapter import
if (!porterServiceContent.includes("import { offlineAdapter }")) {
  porterServiceContent = "import { offlineAdapter } from '@/services/offlineAdapter'\n" + porterServiceContent;
}

// Wire getPorterJobs to check offlineAdapter cache
const origGetPorterJobs = `export const getPorterJobs = async (filter?: PorterFilter): Promise<ApiResponse<PorterJobRequest[]>> => {
  try {
    initMockData()
    let jobs = getMockData<PorterJobRequest[]>('jobs', [])`;

const enhancedGetPorterJobs = `export const getPorterJobs = async (filter?: PorterFilter): Promise<ApiResponse<PorterJobRequest[]>> => {
  try {
    initMockData()
    let jobs = getMockData<PorterJobRequest[]>('jobs', [])

    // Sync with offlineAdapter cache
    const idbCached = await offlineAdapter.getCache<PorterJobRequest>('porter_tasks', 'myporter', 'porter_tasks')
    if (idbCached && idbCached.length > 0) {
      // Merge unique by id
      const map = new Map<string, PorterJobRequest>()
      idbCached.forEach(j => map.set(j.id, j))
      jobs.forEach(j => { if (!map.has(j.id)) map.set(j.id, j) })
      jobs = Array.from(map.values())
    }`;

if (porterServiceContent.includes(origGetPorterJobs)) {
  porterServiceContent = porterServiceContent.replace(origGetPorterJobs, enhancedGetPorterJobs);
}

// Wire createPorterJob to enqueue to offlineAdapter
const origCreatePorterJob = `    jobs.unshift(newJob)
    setMockData('jobs', jobs)

    // Log activity
    logPorterActivity(
      newJob.id,
      'Permohonan baharu didaftarkan',
      newJob.requester_name,
      'Sistem menerima tugasan dan menunggu tindakan penerimaan porter.'
    )

    return { data: newJob, error: null }`;

const enhancedCreatePorterJob = `    jobs.unshift(newJob)
    setMockData('jobs', jobs)

    // Persist to IndexedDB & enqueue to offline sync engine
    void offlineAdapter.setCache('porter_tasks', jobs)
    void offlineAdapter.executeMutation<PorterJobRequest>({
      module: 'myporter',
      table: 'porter_tasks',
      action: 'INSERT',
      payload: newJob,
      conflictPolicy: 'client-wins'
    })

    // Log activity
    logPorterActivity(
      newJob.id,
      'Permohonan baharu didaftarkan',
      newJob.requester_name,
      'Sistem menerima tugasan dan menunggu tindakan penerimaan porter.'
    )

    return { data: newJob, error: null }`;

if (porterServiceContent.includes(origCreatePorterJob)) {
  porterServiceContent = porterServiceContent.replace(origCreatePorterJob, enhancedCreatePorterJob);
}

// Wire porterUpdateStep to notify offlineAdapter
const origPorterUpdateStep = `    jobs[jobIndex] = job
    setMockData('jobs', jobs)`;

const enhancedPorterUpdateStep = `    jobs[jobIndex] = job
    setMockData('jobs', jobs)
    void offlineAdapter.setCache('porter_tasks', jobs)
    void offlineAdapter.executeMutation<PorterJobRequest>({
      module: 'myporter',
      table: 'porter_tasks',
      action: 'UPDATE',
      payload: job,
      matchCriteria: { id: jobId },
      conflictPolicy: 'client-wins'
    })`;

if (porterServiceContent.includes(origPorterUpdateStep)) {
  porterServiceContent = porterServiceContent.replace(origPorterUpdateStep, enhancedPorterUpdateStep);
}

fs.writeFileSync(porterServicePath, porterServiceContent, 'utf8');
console.log('-> porterService.ts updated with offlineAdapter mutation queue and cache!');

console.log('--- All Tier 1 offline expansion scripts completed successfully! ---');
