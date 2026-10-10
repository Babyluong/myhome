import { supabase } from './supabase'
import { offlineQueue, QueuedMutation } from './offlineQueue'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  pendingByModule: Record<string, number>
  lastSyncTime: Date | null
  lastSyncError: string | null
}

type SyncStatusListener = (status: SyncStatus) => void

class OfflineSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  private isSyncing: boolean = false
  private lastSyncTime: Date | null = null
  private lastSyncError: string | null = null
  private listeners: Set<SyncStatusListener> = new Set()
  private syncTimeout: any = null
  private initialized = false

  init() {
    if (this.initialized) return
    this.initialized = true

    // Initialize offline queue
    void offlineQueue.init().then(() => {
      this.notify()
      if (this.isOnline) {
        void this.triggerSync()
      }
    })

    // Listen to queue changes
    offlineQueue.subscribe(() => {
      this.notify()
    })

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      window.addEventListener('focus', this.handleWindowFocus)
      document.addEventListener('visibilitychange', this.handleVisibilityChange)

      // Periodic health & background sync heartbeat (every 30 seconds when online)
      setInterval(() => {
        if (this.isOnline && !this.isSyncing && offlineQueue.getPendingCount() > 0) {
          void this.triggerSync()
        }
      }, 30000)
    }
  }

  private handleOnline = async () => {
    console.info('[OfflineSync] Network status: ONLINE. Verifying connection...')
    const verified = await this.verifyConnection()
    this.isOnline = verified
    this.notify()
    if (verified) {
      void this.triggerSync()
    }
  }

  private handleOffline = () => {
    console.info('[OfflineSync] Network status: OFFLINE.')
    this.isOnline = false
    this.notify()
  }

  private handleWindowFocus = () => {
    if (this.isOnline && offlineQueue.getPendingCount() > 0) {
      void this.triggerSync()
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.isOnline && offlineQueue.getPendingCount() > 0) {
      void this.triggerSync()
    }
  }

  /**
   * Ping Supabase to verify genuine internet access
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Light query to verify database reachability
      const { error } = await supabase.from('users').select('id').limit(1).abortSignal(AbortSignal.timeout(4000))
      return !error || error.code !== 'PGRST301' // Connected if no transport error
    } catch {
      return false
    }
  }

  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: offlineQueue.getPendingCount(),
      pendingByModule: offlineQueue.getPendingByModule(),
      lastSyncTime: this.lastSyncTime,
      lastSyncError: this.lastSyncError,
    }
  }

  subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener)
    listener(this.getStatus())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const status = this.getStatus()
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (err) {
        console.error('[OfflineSync] Listener error:', err)
      }
    })
  }

  /**
   * Trigger synchronization process for all pending mutations
   */
  async triggerSync(): Promise<void> {
    if (this.isSyncing) return
    if (!this.isOnline) {
      console.info('[OfflineSync] Cannot sync while offline.')
      return
    }

    const pending = await offlineQueue.getPending()
    if (pending.length === 0) {
      return
    }

    this.isSyncing = true
    this.lastSyncError = null
    this.notify()

    console.info(`[OfflineSync] Starting sync of ${pending.length} pending operations...`)

    let successCount = 0
    let failureCount = 0

    for (const mutation of pending) {
      try {
        await offlineQueue.updateStatus(mutation.id, 'syncing')
        this.notify()

        const success = await this.executeMutationOnServer(mutation)

        if (success) {
          await offlineQueue.remove(mutation.id)
          successCount++
        } else {
          failureCount++
          await offlineQueue.updateStatus(mutation.id, 'failed', 'Server rejected mutation')
        }
      } catch (err: any) {
        failureCount++
        const errorMsg = err?.message || String(err)
        console.error(`[OfflineSync] Error syncing mutation ${mutation.id}:`, err)
        await offlineQueue.updateStatus(mutation.id, 'failed', errorMsg)

        // If network failed completely during loop, halt loop
        if (!navigator.onLine || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          this.isOnline = false
          this.lastSyncError = 'Sambungan terputus semasa penyegerakan.'
          break
        }
      }
    }

    this.isSyncing = false
    this.lastSyncTime = new Date()
    this.notify()

    console.info(`[OfflineSync] Sync finished. ${successCount} synced, ${failureCount} failed. Remaining: ${offlineQueue.getPendingCount()}`)
  }

  /**
   * Execute single mutation on Supabase with conflict resolution & deduplication
   */
  private async executeMutationOnServer(mutation: QueuedMutation): Promise<boolean> {
    const { table, action, payload, matchCriteria, conflictPolicy } = mutation

    // Clean payload of any client-only metadata
    const cleanPayload = { ...payload }
    delete cleanPayload.__isOptimistic
    delete cleanPayload.__tempId
    delete cleanPayload.__offlinePending

    // If table is pharmacy_purchase_orders and contains embedded items array
    let poItems: any[] | null = null
    if (table === 'pharmacy_purchase_orders' && Array.isArray(cleanPayload.items)) {
      poItems = cleanPayload.items
      delete cleanPayload.items
    }

    if (action === 'INSERT') {
      // Check for deduplication: if record has an id, check if already exists
      if (cleanPayload.id) {
        const { data: existing } = await supabase
          .from(table)
          .select('id')
          .eq('id', cleanPayload.id)
          .maybeSingle()

        if (existing) {
          console.info(`[OfflineSync] Record ${cleanPayload.id} already exists in ${table}, skipping duplicate insert.`)
          return true
        }
      }

      const { error } = await supabase.from(table).insert([cleanPayload])
      if (error) {
        // If unique constraint violation or duplicate key, treat as resolved
        if (error.code === '23505') {
          console.info(`[OfflineSync] Unique constraint caught for ${table}, considering synced.`)
          return true
        }
        console.error(`[OfflineSync] Insert error on ${table}:`, error)
        throw error
      }

      // If this was a purchase order with items, insert items as well
      if (table === 'pharmacy_purchase_orders' && poItems && poItems.length > 0) {
        const itemsToInsert = poItems.map((item) => {
          const cleanItem = { ...item, po_id: cleanPayload.id }
          delete cleanItem.__offlinePending
          delete cleanItem.__isOptimistic
          return cleanItem
        })
        await supabase.from('pharmacy_purchase_order_items').insert(itemsToInsert)
      }

      return true
    }

    if (action === 'UPSERT') {
      const { error } = await supabase.from(table).upsert([cleanPayload])
      if (error) throw error
      return true
    }

    if (action === 'UPDATE') {
      if (!matchCriteria || Object.keys(matchCriteria).length === 0) {
        console.error('[OfflineSync] Missing match criteria for UPDATE:', mutation)
        return false
      }

      // Conflict policy: server-wins
      if (conflictPolicy === 'server-wins' && matchCriteria.id) {
        const { data: serverRecord } = await supabase
          .from(table)
          .select('updated_at')
          .eq('id', matchCriteria.id)
          .maybeSingle()

        if (serverRecord?.updated_at) {
          const serverUpdatedTime = new Date(serverRecord.updated_at).getTime()
          if (serverUpdatedTime > mutation.timestamp) {
            console.warn(`[OfflineSync] Server record in ${table} was updated more recently. Applying server-wins policy.`)
            return true // Resolve conflict cleanly without overwriting newer server data
          }
        }
      }

      let query = supabase.from(table).update(cleanPayload)
      for (const [key, val] of Object.entries(matchCriteria)) {
        query = query.eq(key, val)
      }

      const { error } = await query
      if (error) throw error
      return true
    }

    if (action === 'DELETE') {
      if (!matchCriteria || Object.keys(matchCriteria).length === 0) {
        console.error('[OfflineSync] Missing match criteria for DELETE:', mutation)
        return false
      }

      let query = supabase.from(table).delete()
      for (const [key, val] of Object.entries(matchCriteria)) {
        query = query.eq(key, val)
      }

      const { error } = await query
      if (error) throw error
      return true
    }

    return false
  }
}

export const offlineSyncService = new OfflineSyncService()
