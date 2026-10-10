// @ts-nocheck
/**
 * Cylinder Offline Service Layer
 * Transparent wrapper around online services with zero-latency offline fallbacks,
 * IndexedDB queries, and optimistic local state updates.
 */

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { ApiResponse } from '@/types'
import type {
  OxygenCylinderWithRelations,
  OxygenReceiveDocumentWithRelations,
  OxygenReturnDocument,
} from '@/types/pharmacy'
import {
  searchCylindersInDatabase,
  getCylinderByQrOrSerial,
  createReceiveDocument,
  createReturnDocument,
  updateOxygenCylinderStatus,
  markCylinderAsEmpty,
  markMultipleCylindersAsEmpty,
  updateCylinderValveType,
  getEmptyCylindersInStore,
} from './oxygenService'
import { cylinderOfflineDB, CachedCylinder } from './cylinderOfflineDB'
import { cylinderSyncEngine } from './cylinderSyncEngine'

/**
 * Executes a promise with a hard timeout to prevent slow/stalled networks from blocking UI.
 */
export function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms: number, timeoutMsg: string = 'Network operation timed out'): Promise<T> {
  let timer: any
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMsg))
    }, ms)
  })
  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
    clearTimeout(timer)
  })
}

/**
 * Checks if browser has live network connectivity
 */
export function isNetworkAvailable(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

// ---------------------------------------------------------------------------
// OFFLINE-AWARE READ OPERATIONS (SEARCH & LOOKUP)
// ---------------------------------------------------------------------------

/**
 * Searches cylinders by Serial Number or QR code.
 * If online -> queries Supabase and primes cache.
 * If offline or network fails -> queries IndexedDB instantly.
 */
export async function offlineAwareSearchCylinders(
  hospitalId: string,
  query: string,
  filterStatus?: string
): Promise<ApiResponse<OxygenCylinderWithRelations[]> & { isOffline?: boolean }> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        searchCylindersInDatabase(hospitalId, query, filterStatus),
        1800,
        'Supabase search timed out (poor network)'
      )
      if (res.data !== undefined) {
        if (res.data && res.data.length > 0) {
          // Silently update local cache
          void cylinderOfflineDB.upsertCylinders(res.data)
        }
        return { ...res, isOffline: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Supabase search slow or failed. Falling back to local cache.', netErr)
    }
  }

  // Offline / Network Failure Fallback
  try {
    const cached = await cylinderOfflineDB.searchCylinders(hospitalId, query, filterStatus)
    return {
      data: cached as unknown as OxygenCylinderWithRelations[],
      error: null,
      isOffline: true,
    }
  } catch (err: any) {
    console.error('[OfflineService] Cache search error:', err)
    return {
      data: [],
      error: err?.message || 'Gagal mencari silinder dalam mod luar talian.',
      isOffline: true,
    }
  }
}

/**
 * Looks up cylinder by exact QR or serial number with fuzzy & variant support
 * Protected with hard timeout race to ensure zero scanner freezing on bad networks.
 */
export async function offlineAwareGetCylinderByCode(
  hospitalId: string,
  code: string,
  options?: {
    expectedSizeCode?: string;
    excludeIds?: string[];
    preferredValve?: 'BN' | 'PI' | string;
  } | string[]
): Promise<ApiResponse<OxygenCylinderWithRelations> & { isOffline?: boolean }> {
  let opts: {
    expectedSizeCode?: string;
    excludeIds?: string[];
    preferredValve?: string;
  } = {}

  if (Array.isArray(options)) {
    opts = { excludeIds: options }
  } else if (options && typeof options === 'object') {
    opts = options
  }

  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        getCylinderByQrOrSerial(hospitalId, code, opts),
        1200,
        'Supabase online QR lookup timed out (poor network)'
      )
      if (res.data) {
        void cylinderOfflineDB.putCylinder(res.data)
        return { ...res, isOffline: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Online QR lookup slow or failed. Falling back to local cache.', netErr)
    }
  }

  // Offline / Network Failure Fallback (0ms instant IndexedDB lookup)
  try {
    const found = await cylinderOfflineDB.findCylinderByCode(hospitalId, code, opts)
    if (found) {
      return {
        data: found as unknown as OxygenCylinderWithRelations,
        error: null,
        isOffline: true,
      }
    }
    return {
      data: null,
      error: 'Silinder tidak dijumpai dalam rekod simpanan peranti.',
      isOffline: true,
    }
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Ralat membaca rekod silinder dari memori peranti.',
      isOffline: true,
    }
  }
}

/**
 * Retrieves supplier list with offline fallback
 */
export async function offlineAwareGetSuppliers(): Promise<{ id: string; company_name: string }[]> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const { data: sups, error } = await supabase
        .from('suppliers')
        .select('id, company_name')
        .eq('status', 'active')

      if (!error && sups && sups.length > 0) {
        const filtered = sups.filter(s => {
          const n = (s.company_name || '').toLowerCase()
          return n.includes('linde') || n.includes('borneo')
        })
        const list = filtered.length > 0 ? filtered : sups
        void cylinderOfflineDB.setStaticTable('suppliers', list)
        return list
      }
    } catch (err) {
      console.warn('[OfflineService] Failed to fetch suppliers online. Falling back to cache.', err)
    }
  }

  const cached = await cylinderOfflineDB.getStaticTable('suppliers')
  return cached || [
    { id: 'sup-default-linde', company_name: 'LINDE EOX SDN BHD (CAW. MIRI)' },
    { id: 'sup-default-borneo', company_name: 'BORNEO INDAH SDN BHD' },
  ]
}

/**
 * Retrieves cylinder combos with offline fallback
 */
export async function offlineAwareGetCombos(): Promise<any[]> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const { data: comboData, error } = await supabase
        .from('pharmacy_oxygen_size_type_combos')
        .select('id, size_id, type_id, display_name')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (!error && comboData && comboData.length > 0) {
        void cylinderOfflineDB.setStaticTable('combos', comboData)
        return comboData
      }
    } catch (err) {
      console.warn('[OfflineService] Failed to fetch combos online. Falling back to cache.', err)
    }
  }

  const cached = await cylinderOfflineDB.getStaticTable('combos')
  return cached || []
}

// ---------------------------------------------------------------------------
// OFFLINE-AWARE WRITE OPERATIONS (STAGING & AUTO-SYNC QUEUE)
// ---------------------------------------------------------------------------

/**
 * Offline-aware Receive Document Creator.
 * Directly receives cylinders into Available stock at Central Store.
 * In offline mode: saves to local sync queue, marks cylinders as 'available' in IndexedDB,
 * and creates a provisional offline document.
 */
export async function offlineAwareReceiveDocument(
  hospitalId: string,
  supplierId: string,
  receivedDate: string,
  deliveryOrderNo: string,
  cylinderIds: string[],
  remarks: string,
  createdBy: string,
  newCylinders?: { serialNumber: string; qrCode?: string; comboId?: string; sizeId?: string; typeId?: string }[]
): Promise<ApiResponse<OxygenReceiveDocumentWithRelations> & { isOfflinePending?: boolean }> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await createReceiveDocument(
        hospitalId,
        supplierId,
        receivedDate,
        deliveryOrderNo,
        cylinderIds,
        remarks,
        createdBy,
        newCylinders
      )

      if (res.data) {
        // Optimistically update local cache to match
        const now = new Date().toISOString()
        for (const cid of cylinderIds) {
          const cached = await cylinderOfflineDB.getCylinderById(cid)
          if (cached) {
            cached.status = 'available'
            cached.current_location = 'Store'
            cached.scanned_location = 'Store'
            cached.updated_at = now
            await cylinderOfflineDB.putCylinder(cached)
          }
        }
        return { ...res, isOfflinePending: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] createReceiveDocument network failure. Queuing offline mutation.', netErr)
    }
  }

  // -------------------------------------------------------------------------
  // OFFLINE PATH: Stash into Sync Queue + Optimistic Local State Update
  // -------------------------------------------------------------------------
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const provisionalDocNumber = `O2-RCV-OFFLINE-${todayStr}-${randomSuffix}`
    const nowIso = today.toISOString()

    const stagedCylinderIds = [...cylinderIds]

    // If new cylinders were registered during offline scan, insert into local cache
    if (newCylinders && newCylinders.length > 0) {
      for (const newCyl of newCylinders) {
        const localNewId = `offline_cyl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const serial = newCyl.serialNumber.trim().toUpperCase()

        const newCachedCylinder: CachedCylinder = {
          id: localNewId,
          hospital_id: hospitalId,
          serial_number: serial,
          qr_code: (newCyl.qrCode || serial).trim().toUpperCase(),
          qr_code_value: (newCyl.qrCode || serial).trim().toUpperCase(),
          cylinder_size_id: newCyl.sizeId || null,
          cylinder_type_id: newCyl.typeId || null,
          status: 'available',
          current_location: 'Store',
          scanned_location: 'Store',
          is_active: true,
          supplier_tagged: serial.startsWith('101-') || serial.startsWith('101N'),
          created_at: nowIso,
          updated_at: nowIso,
        }

        await cylinderOfflineDB.putCylinder(newCachedCylinder)
        stagedCylinderIds.push(localNewId)
      }
    }

    // Optimistically update existing cylinders in IndexedDB
    for (const cid of cylinderIds) {
      const existing = await cylinderOfflineDB.getCylinderById(cid)
      if (existing) {
        existing.status = 'available'
        existing.current_location = 'Store'
        existing.scanned_location = 'Store'
        existing.updated_at = nowIso
        await cylinderOfflineDB.putCylinder(existing)
      }
    }

    // Enqueue mutation for Supabase replay
    await cylinderOfflineDB.enqueueMutation('receive_document', hospitalId, {
      supplierId,
      receivedDate,
      deliveryOrderNo,
      cylinderIds,
      remarks: remarks ? `${remarks} (Imbasan Luar Talian / Offline Scan)` : 'Imbasan Luar Talian / Offline Scan',
      createdBy,
      newCylinders,
    })

    // Refresh pending count
    await cylinderSyncEngine.refreshPendingCount()

    const provisionalDoc: any = {
      id: `rcv-provisional-${Date.now()}`,
      hospital_id: hospitalId,
      document_number: provisionalDocNumber,
      supplier_id: supplierId,
      delivery_order_no: deliveryOrderNo,
      status: 'pending_sync',
      received_date: receivedDate,
      remarks: remarks || 'Menunggu penyegerakan automatik ke pelayan...',
      created_by: createdBy,
      created_at: nowIso,
      is_offline: true,
    }

    return {
      data: provisionalDoc as OxygenReceiveDocumentWithRelations,
      error: null,
      isOfflinePending: true,
    }
  } catch (err: any) {
    console.error('[OfflineService] Failed to process offline reception:', err)
    return {
      data: null,
      error: err?.message || 'Ralat menyimpan transaksi penerimaan luar talian.',
      isOfflinePending: false,
    }
  }
}

/**
 * Offline-aware Return Document Creator
 */
export async function offlineAwareReturnDocument(
  hospitalId: string,
  supplierId: string,
  returnDate: string,
  cylinderIds: string[],
  remarks: string,
  createdBy: string,
  manualLoans?: any[]
): Promise<ApiResponse<OxygenReturnDocument> & { isOfflinePending?: boolean }> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await createReturnDocument(
        hospitalId,
        supplierId,
        returnDate,
        cylinderIds,
        remarks,
        createdBy,
        manualLoans
      )
      if (res.data) {
        // Update local cache
        const now = new Date().toISOString()
        for (const cid of cylinderIds) {
          const cached = await cylinderOfflineDB.getCylinderById(cid)
          if (cached) {
            cached.status = 'returned_to_supplier'
            cached.current_location = 'Supplier'
            cached.updated_at = now
            await cylinderOfflineDB.putCylinder(cached)
          }
        }
        return { ...res, isOfflinePending: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] createReturnDocument network failure. Queuing offline mutation.', netErr)
    }
  }

  // Offline Path
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const provisionalDocNumber = `O2-RET-OFFLINE-${todayStr}-${randomSuffix}`
    const nowIso = today.toISOString()

    // Optimistically update status in local cache
    for (const cid of cylinderIds) {
      const cached = await cylinderOfflineDB.getCylinderById(cid)
      if (cached) {
        cached.status = 'returned_to_supplier'
        cached.current_location = 'Supplier'
        cached.updated_at = nowIso
        await cylinderOfflineDB.putCylinder(cached)
      }
    }

    await cylinderOfflineDB.enqueueMutation('return_document', hospitalId, {
      supplierId,
      returnDate,
      cylinderIds,
      remarks,
      createdBy,
      manualLoans,
    })

    await cylinderSyncEngine.refreshPendingCount()

    const provisionalDoc: any = {
      id: `ret-provisional-${Date.now()}`,
      hospital_id: hospitalId,
      document_number: provisionalDocNumber,
      supplier_id: supplierId,
      status: 'pending_sync',
      returned_date: returnDate,
      remarks: remarks || 'Menunggu penyegerakan automatik...',
      created_by: createdBy,
      created_at: nowIso,
    }

    return {
      data: provisionalDoc as OxygenReturnDocument,
      error: null,
      isOfflinePending: true,
    }
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Ralat menyimpan dokumen pemulangan luar talian.',
      isOfflinePending: false,
    }
  }
}

/**
 * Offline-aware single cylinder depletion.
 * If online -> attempts Supabase update within 1500ms and updates IndexedDB.
 * If offline or bad network/timeout -> optimistically updates IndexedDB, enqueues mutation, and returns immediately.
 */
export async function offlineAwareMarkCylinderAsEmpty(
  hospitalId: string,
  cylinderId: string,
  userId: string
): Promise<ApiResponse<OxygenCylinderWithRelations> & { isOfflinePending?: boolean }> {
  const online = isNetworkAvailable()
  const now = new Date().toISOString()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        markCylinderAsEmpty(hospitalId, cylinderId, userId),
        1500,
        'Supabase markCylinderAsEmpty timed out'
      )
      if (res.data) {
        const cached = await cylinderOfflineDB.getCylinderById(cylinderId)
        if (cached) {
          cached.status = 'empty'
          cached.current_location = 'Pharmacy Store'
          cached.scanned_location = 'Pharmacy Store'
          cached.department_id = null
          cached.updated_at = now
          await cylinderOfflineDB.putCylinder(cached)
        }
        return { ...res, isOfflinePending: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Online markCylinderAsEmpty slow or failed. Switching to offline queue.', netErr)
    }
  }

  // Offline / Bad Network Fallback
  try {
    const cached = await cylinderOfflineDB.getCylinderById(cylinderId)
    let optimisticCyl: any = cached
    if (cached) {
      cached.status = 'empty'
      cached.current_location = 'Pharmacy Store'
      cached.scanned_location = 'Pharmacy Store'
      cached.department_id = null
      cached.updated_at = now
      await cylinderOfflineDB.putCylinder(cached)
      optimisticCyl = cached
    } else {
      optimisticCyl = {
        id: cylinderId,
        hospital_id: hospitalId,
        status: 'empty',
        current_location: 'Pharmacy Store',
        department_id: null,
        updated_at: now
      }
    }

    await cylinderOfflineDB.enqueueMutation('mark_empty', hospitalId, {
      cylinderId,
      userId,
      timestamp: now,
    })

    await cylinderSyncEngine.refreshPendingCount()

    return {
      data: optimisticCyl as OxygenCylinderWithRelations,
      error: null,
      isOfflinePending: true,
    }
  } catch (err: any) {
    console.error('[OfflineService] Failed to mark cylinder empty offline:', err)
    return {
      data: null,
      error: err?.message || 'Gagal menandakan silinder kosong dalam mod luar talian.',
      isOfflinePending: false,
    }
  }
}

/**
 * Offline-aware batch cylinder depletion.
 */
export async function offlineAwareMarkMultipleCylindersAsEmpty(
  hospitalId: string,
  cylinderIds: string[],
  userId: string
): Promise<ApiResponse<number> & { isOfflinePending?: boolean }> {
  if (!cylinderIds || cylinderIds.length === 0) {
    return { data: 0, error: null }
  }

  const online = isNetworkAvailable()
  const now = new Date().toISOString()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        markMultipleCylindersAsEmpty(hospitalId, cylinderIds, userId),
        2500,
        'Supabase markMultipleCylindersAsEmpty timed out'
      )
      if (res.data !== null && !res.error) {
        for (const cid of cylinderIds) {
          const cached = await cylinderOfflineDB.getCylinderById(cid)
          if (cached) {
            cached.status = 'empty'
            cached.current_location = 'Pharmacy Store'
            cached.scanned_location = 'Pharmacy Store'
            cached.department_id = null
            cached.updated_at = now
            await cylinderOfflineDB.putCylinder(cached)
          }
        }
        return { ...res, isOfflinePending: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Online batch mark empty slow or failed. Switching to offline queue.', netErr)
    }
  }

  // Offline / Bad Network Fallback
  try {
    for (const cid of cylinderIds) {
      const cached = await cylinderOfflineDB.getCylinderById(cid)
      if (cached) {
        cached.status = 'empty'
        cached.current_location = 'Pharmacy Store'
        cached.scanned_location = 'Pharmacy Store'
        cached.department_id = null
        cached.updated_at = now
        await cylinderOfflineDB.putCylinder(cached)
      }
    }

    await cylinderOfflineDB.enqueueMutation('batch_mark_empty', hospitalId, {
      cylinderIds,
      userId,
      timestamp: now,
    })

    await cylinderSyncEngine.refreshPendingCount()

    return {
      data: cylinderIds.length,
      error: null,
      isOfflinePending: true,
    }
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Ralat menandakan kumpulan silinder kosong luar talian.',
      isOfflinePending: false,
    }
  }
}

/**
 * Offline-aware cylinder valve type correction (BN vs PI).
 */
export async function offlineAwareUpdateValveType(
  hospitalId: string,
  cylinderId: string,
  targetTypeCode: 'BN' | 'PI',
  userId?: string
): Promise<ApiResponse<any> & { isOfflinePending?: boolean }> {
  const online = isNetworkAvailable()
  const now = new Date().toISOString()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        updateCylinderValveType(hospitalId, cylinderId, targetTypeCode, userId),
        1500,
        'Supabase updateCylinderValveType timed out'
      )
      if (res.data) {
        const cached = await cylinderOfflineDB.getCylinderById(cylinderId)
        if (cached) {
          cached.type_info = {
            ...(cached.type_info || {}),
            code: targetTypeCode,
            name: targetTypeCode === 'BN' ? 'Bullnose' : 'Pin Index',
          }
          cached.cylinder_type_id = res.data.cylinder_type_id || cached.cylinder_type_id
          cached.updated_at = now
          await cylinderOfflineDB.putCylinder(cached)
        }
        return { ...res, isOfflinePending: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Online valve type update slow or failed. Switching to offline queue.', netErr)
    }
  }

  // Offline / Bad Network Fallback
  try {
    const cached = await cylinderOfflineDB.getCylinderById(cylinderId)
    if (cached) {
      cached.type_info = {
        ...(cached.type_info || {}),
        code: targetTypeCode,
        name: targetTypeCode === 'BN' ? 'Bullnose' : 'Pin Index',
      }
      cached.updated_at = now
      await cylinderOfflineDB.putCylinder(cached)
    }

    await cylinderOfflineDB.enqueueMutation('correct_valve', hospitalId, {
      cylinderId,
      targetTypeCode,
      userId: userId || 'SYSTEM',
      timestamp: now,
    })

    await cylinderSyncEngine.refreshPendingCount()

    return {
      data: cached || { id: cylinderId, valve_type: targetTypeCode },
      error: null,
      isOfflinePending: true,
    }
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Ralat mengemas kini jenis injap luar talian.',
      isOfflinePending: false,
    }
  }
}

/**
 * Retrieves empty cylinders in store with zero-latency offline fallback
 */
export async function offlineAwareGetEmptyCylindersInStore(
  hospitalId: string
): Promise<ApiResponse<OxygenCylinderWithRelations[]> & { isOffline?: boolean }> {
  const online = isNetworkAvailable()

  if (online && isSupabaseConfigured()) {
    try {
      const res = await withTimeout(
        getEmptyCylindersInStore(hospitalId),
        2000,
        'Supabase getEmptyCylindersInStore timed out'
      )
      if (res.data) {
        return { ...res, isOffline: false }
      }
    } catch (netErr) {
      console.warn('[OfflineService] Online getEmptyCylindersInStore failed/timed out. Falling back to cache.', netErr)
    }
  }

  // Offline fallback
  try {
    const cached = await cylinderOfflineDB.getEmptyCylinders(hospitalId)
    return {
      data: (cached || []) as unknown as OxygenCylinderWithRelations[],
      error: null,
      isOffline: true,
    }
  } catch (err: any) {
    return {
      data: [],
      error: err?.message || 'Ralat membaca rekod silinder kosong luar talian.',
      isOffline: true,
    }
  }
}
