// @ts-nocheck
/**
 * Cylinder Sync Engine
 * Autonomous background daemon that orchestrates offline caching,
 * network status monitoring, and automatic two-way synchronization with Supabase.
 */

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import {
  cylinderOfflineDB,
  PendingMutation,
  CachedCylinder,
} from './cylinderOfflineDB'
import {
  createReceiveDocument,
  createReturnDocument,
  updateOxygenCylinderStatus,
  assignCylinderQrTag,
  markCylinderAsEmpty,
  markMultipleCylindersAsEmpty,
  updateCylinderValveType,
} from './oxygenService'

export interface SyncEngineState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  cachedCount: number
  lastSyncAt: Date | null
  lastCacheWarmupAt: Date | null
  lastError: string | null
}

type SyncStateListener = (state: SyncEngineState) => void

class CylinderSyncEngine {
  private listeners: Set<SyncStateListener> = new Set()
  private isInitialized = false
  private activeHospitalId: string | null = null
  private syncInProgress = false

  private state: SyncEngineState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    cachedCount: 0,
    lastSyncAt: null,
    lastCacheWarmupAt: null,
    lastError: null,
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkOnline)
      window.addEventListener('offline', this.handleNetworkOffline)
    }
  }

  // -------------------------------------------------------------
  // SUBSCRIPTION & STATE
  // -------------------------------------------------------------

  subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener)
    listener({ ...this.state })
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const copy = { ...this.state }
    for (const listener of this.listeners) {
      try {
        listener(copy)
      } catch (err) {
        console.error('Error in sync engine listener:', err)
      }
    }
  }

  getState(): SyncEngineState {
    return { ...this.state }
  }

  private handleNetworkOnline = () => {
    console.info('[CylinderSyncEngine] Network connection restored (ONLINE). Triggering automatic sync...')
    this.state.isOnline = true
    this.notify()
    void this.syncNow()
  }

  private handleNetworkOffline = () => {
    console.warn('[CylinderSyncEngine] Network connection lost (OFFLINE). Operating in local offline mode.')
    this.state.isOnline = false
    this.notify()
  }

  // -------------------------------------------------------------
  // INITIALIZATION & CACHE WARM-UP
  // -------------------------------------------------------------

  /**
   * Initializes sync engine for the current active hospital session
   */
  async initialize(hospitalId: string): Promise<void> {
    this.activeHospitalId = hospitalId

    try {
      const pendingCount = await cylinderOfflineDB.getPendingCount()
      const cachedCount = await cylinderOfflineDB.getCylinderCount(hospitalId)
      const lastSync = await cylinderOfflineDB.getMeta<string>('last_sync_timestamp')
      const lastWarmup = await cylinderOfflineDB.getMeta<string>('last_cache_warmup')

      this.state.pendingCount = pendingCount
      this.state.cachedCount = cachedCount
      this.state.lastSyncAt = lastSync ? new Date(lastSync) : null
      this.state.lastCacheWarmupAt = lastWarmup ? new Date(lastWarmup) : null
      this.state.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
      this.notify()

      // Check for count mismatch against live database to ensure immediate sync on changes
      let countMismatch = false
      if (this.state.isOnline && isSupabaseConfigured()) {
        try {
          const { count: liveCount } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select('id', { count: 'exact', head: true })
            .eq('hospital_id', hospitalId)
            .neq('status', 'deactivated')
            .eq('is_active', true)

          if (liveCount !== null && liveCount !== cachedCount) {
            console.info(`[CylinderSyncEngine] Cache count mismatch detected (cached: ${cachedCount}, live: ${liveCount}). Refreshing cache...`)
            countMismatch = true
          }
        } catch (headErr) {
          console.warn('[CylinderSyncEngine] Could not check live cylinder count:', headErr)
        }
      }

      // If online and (count mismatch, empty cache, or older than 10 minutes), trigger cache warmup
      const shouldWarmup =
        this.state.isOnline &&
        (countMismatch || !lastWarmup || Date.now() - new Date(lastWarmup).getTime() > 10 * 60 * 1000 || cachedCount === 0)

      if (shouldWarmup) {
        void this.warmUpCylinderCache(hospitalId, countMismatch)
      }

      // If online and there are pending items from a previous session, drain queue
      if (this.state.isOnline && pendingCount > 0) {
        void this.syncNow()
      }

      this.isInitialized = true
    } catch (err) {
      console.error('[CylinderSyncEngine] Initialization error:', err)
    }
  }

  /**
   * Warms up local IndexedDB cache with all hospital inventory and static lookup tables.
   * Enables 100% offline QR scanning and lookups even in Faraday-cage basement gas stores.
   */
  async warmUpCylinderCache(hospitalId: string, force: boolean = false): Promise<void> {
    if (!isSupabaseConfigured() || !hospitalId) return

    try {
      console.info(`[CylinderSyncEngine] Warming up offline cache for hospital: ${hospitalId}... (force: ${force})`)

      // Safe atomic upsert: we do not clear the cache so existing cylinders remain available offline

      // 1. Fetch Combos
      const { data: combos } = await supabase
        .from('pharmacy_oxygen_size_type_combos')
        .select(`
          id,
          size_id,
          type_id,
          display_name,
          size_info:pharmacy_oxygen_cylinder_sizes(*),
          type_info:pharmacy_oxygen_cylinder_types(*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (combos) {
        await cylinderOfflineDB.setStaticTable('combos', combos)
      }

      // 2. Fetch Suppliers
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, company_name, supplier_code, contact_person, phone, contact_person_phone, status')
        .eq('status', 'active')

      if (suppliers) {
        await cylinderOfflineDB.setStaticTable('suppliers', suppliers)
      }

      // 3. Fetch Departments
      const { data: departments } = await supabase
        .from('departments')
        .select('id, department_name, department_code')
        .eq('hospital_id', hospitalId)

      if (departments) {
        await cylinderOfflineDB.setStaticTable('departments', departments)
      }

      // 4. Fetch Sizes & Types
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('*')
      const { data: types } = await supabase.from('pharmacy_oxygen_cylinder_types').select('*')
      if (sizes) await cylinderOfflineDB.setStaticTable('sizes', sizes)
      if (types) await cylinderOfflineDB.setStaticTable('types', types)

      // Combo map for quick display_name association
      const comboMap = new Map<string, string>()
      ;(combos || []).forEach((c: any) => {
        comboMap.set(`${c.size_id}_${c.type_id}`, c.display_name)
      })

      // 5. Fetch All Active Cylinders in batch chunks (Supabase max 1000 per request)
      let offset = 0
      const limit = 1000
      let hasMore = true
      let totalFetched = 0

      while (hasMore) {
        const { data: batch, error } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            id,
            hospital_id,
            serial_number,
            qr_code,
            qr_code_value,
            cylinder_size_id,
            cylinder_type_id,
            status,
            current_location,
            scanned_location,
            department_id,
            is_active,
            supplier_tagged,
            updated_at,
            last_reconciled_at,
            size_info:pharmacy_oxygen_cylinder_sizes(*),
            type_info:pharmacy_oxygen_cylinder_types(*),
            department:departments(id, department_name)
          `)
          .eq('hospital_id', hospitalId)
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .range(offset, offset + limit - 1)

        if (error) {
          console.warn('[CylinderSyncEngine] Error fetching cylinder batch:', error)
          break
        }

        if (!batch || batch.length === 0) {
          hasMore = false
        } else {
          totalFetched += batch.length

          // Enrich with combo display names
          const enrichedBatch: CachedCylinder[] = batch.map((cyl: any) => {
            const displayName = comboMap.get(`${cyl.cylinder_size_id}_${cyl.cylinder_type_id}`) || 'Standard Cylinder'
            return {
              ...cyl,
              is_loan: cyl.size_info?.is_loan ?? false,
              combo: { display_name: displayName },
              type_info: {
                ...(cyl.type_info || {}),
                type_name: displayName,
              },
            }
          })

          await cylinderOfflineDB.upsertCylinders(enrichedBatch)
          offset += batch.length
          if (batch.length < limit) hasMore = false
        }
      }

      const nowIso = new Date().toISOString()
      await cylinderOfflineDB.setMeta('last_cache_warmup', nowIso)
      this.state.lastCacheWarmupAt = new Date(nowIso)
      this.state.cachedCount = await cylinderOfflineDB.getCylinderCount(hospitalId)
      this.notify()

      console.info(
        `[CylinderSyncEngine] Warm-up complete! ${this.state.cachedCount} cylinders available in offline storage.`
      )
    } catch (err: any) {
      console.error('[CylinderSyncEngine] Error during cache warm-up:', err)
    }
  }

  // -------------------------------------------------------------
  // SYNCHRONIZATION RUNNER (REPLAY ENGINE)
  // -------------------------------------------------------------

  /**
   * Triggers an immediate synchronization cycle. Drains pending mutations in FIFO sequence.
   */
  async syncNow(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress) {
      console.warn('[CylinderSyncEngine] Sync cycle already running. Skipping concurrent trigger.')
      return { synced: 0, failed: 0 }
    }

    if (!isSupabaseConfigured()) {
      return { synced: 0, failed: 0 }
    }

    // Verify online connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('[CylinderSyncEngine] Cannot sync while offline.')
      this.state.isOnline = false
      this.notify()
      return { synced: 0, failed: 0 }
    }

    this.syncInProgress = true
    this.state.isSyncing = true
    this.state.lastError = null
    this.notify()

    let synced = 0
    let failed = 0

    try {
      const queue = await cylinderOfflineDB.getPendingMutations()
      this.state.pendingCount = queue.length
      this.notify()

      for (const mutation of queue) {
        try {
          await cylinderOfflineDB.updateMutationStatus(mutation.localId, 'syncing')

          const success = await this.executeMutation(mutation)

          if (success) {
            await cylinderOfflineDB.removeMutation(mutation.localId)
            synced++
          } else {
            failed++
          }
        } catch (itemErr: any) {
          console.error(`[CylinderSyncEngine] Failed to replay mutation ${mutation.localId}:`, itemErr)
          const errMsg = itemErr?.message || 'Replay error'
          await cylinderOfflineDB.updateMutationStatus(mutation.localId, 'failed', errMsg)
          failed++
        }
      }

      const remainingPending = await cylinderOfflineDB.getPendingCount()
      this.state.pendingCount = remainingPending

      const now = new Date()
      this.state.lastSyncAt = now
      await cylinderOfflineDB.setMeta('last_sync_timestamp', now.toISOString())

      // Refresh cached count after sync
      if (this.activeHospitalId) {
        this.state.cachedCount = await cylinderOfflineDB.getCylinderCount(this.activeHospitalId)
      }
    } catch (err: any) {
      console.error('[CylinderSyncEngine] Sync cycle exception:', err)
      this.state.lastError = err?.message || 'Sync failed'
    } finally {
      this.syncInProgress = false
      this.state.isSyncing = false
      this.notify()
    }

    return { synced, failed }
  }

  /**
   * Dispatches and replays an individual mutation against Supabase
   */
  private async executeMutation(mutation: PendingMutation): Promise<boolean> {
    const { type, hospitalId, payload } = mutation

    switch (type) {
      case 'receive_document': {
        const {
          supplierId,
          receivedDate,
          deliveryOrderNo,
          cylinderIds,
          remarks,
          createdBy,
          newCylinders,
        } = payload

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

        if (res.error) {
          // If already exists or 409, consider it synced
          if (res.error.includes('duplicate') || res.error.includes('already exists')) {
            console.warn('[CylinderSyncEngine] Receive doc already exists on server. Resolving gracefully.')
            return true
          }
          throw new Error(res.error)
        }
        return true
      }

      case 'return_document': {
        const { supplierId, returnDate, cylinderIds, remarks, createdBy, manualLoans } = payload

        const res = await createReturnDocument(
          hospitalId,
          supplierId,
          returnDate,
          cylinderIds,
          remarks,
          createdBy,
          manualLoans
        )

        if (res.error) {
          if (res.error.includes('duplicate') || res.error.includes('already exists')) {
            return true
          }
          throw new Error(res.error)
        }
        return true
      }

      case 'status_update': {
        const { cylinderId, status, locationId, assignedWardId } = payload
        const res = await updateOxygenCylinderStatus(cylinderId, status, locationId, assignedWardId)
        if (res.error) throw new Error(res.error)
        return true
      }

      case 'qr_assign': {
        const { cylinderId, qrTag, assignedBy } = payload
        const res = await assignCylinderQrTag(hospitalId, cylinderId, qrTag, assignedBy)
        if (res.error) throw new Error(res.error)
        return true
      }

      case 'mark_empty': {
        const { cylinderId, userId } = payload
        const res = await markCylinderAsEmpty(hospitalId, cylinderId, userId)
        if (res.error) throw new Error(res.error)
        return true
      }

      case 'batch_mark_empty': {
        const { cylinderIds, userId } = payload
        const res = await markMultipleCylindersAsEmpty(hospitalId, cylinderIds, userId)
        if (res.error) throw new Error(res.error)
        return true
      }

      case 'correct_valve': {
        const { cylinderId, targetTypeCode, userId } = payload
        const res = await updateCylinderValveType(hospitalId, cylinderId, targetTypeCode, userId)
        if (res.error) throw new Error(res.error)
        return true
      }

      default:
        console.warn(`[CylinderSyncEngine] Unhandled mutation type: ${type}`)
        return true
    }
  }

  /**
   * Helper to manually increment pending counter in real-time
   */
  async refreshPendingCount(): Promise<number> {
    const count = await cylinderOfflineDB.getPendingCount()
    this.state.pendingCount = count
    this.notify()
    return count
  }
}

export const cylinderSyncEngine = new CylinderSyncEngine()
