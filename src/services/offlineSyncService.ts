import { supabase } from './supabase'
import { offlineQueue, QueuedMutation } from './offlineQueue'
import { getOfflineIdentity } from './offlineSession'

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
      const { error } = await supabase.from('users').select('id').limit(1).setHeader('x-home-require-online', 'true').abortSignal(AbortSignal.timeout(4000))
      return !error
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
        const { data: auth, error: authError } = await supabase.auth.getUser()
        const identity = getOfflineIdentity()
        if (authError || auth.user?.id !== mutation.actorId || identity?.actorId !== mutation.actorId || identity.hospitalId !== mutation.hospitalId) break
        const { data: profile, error: profileError } = await supabase.from('users').select('hospital_id,status').eq('id', auth.user.id).setHeader('x-home-require-online', 'true').maybeSingle()
        if (profileError || profile?.status !== 'active' || profile.hospital_id !== mutation.hospitalId) break
        await offlineQueue.updateStatus(mutation.id, 'syncing')
        this.notify()

        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user.id !== mutation.actorId) break
        const success = await this.executeMutationOnServer(mutation, sessionData.session.access_token)

        if (success) {
          // R3 Compliance: Automatic audit logging upon replaying offline mutation
          {
            const effectiveUserId = mutation.actorId
            const isValidUuid = typeof effectiveUserId === 'string' &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)

            const { error: auditError } = await supabase.from('audit_logs').insert({
              user_id: isValidUuid ? effectiveUserId : null,
              action: `OFFLINE_SYNC_${mutation.action}`,
              module: mutation.module || 'offline_sync',
              entity_type: mutation.table,
              entity_id: mutation.payload.id || mutation.matchCriteria?.id || null,
              new_values: {
                table: mutation.table,
                action: mutation.action,
                mutation_id: mutation.id,
                offline_timestamp: new Date(mutation.timestamp).toISOString(),
                synced_at: new Date().toISOString()
              }
            }).setHeader('Authorization', `Bearer ${sessionData.session.access_token}`)
            if (auditError) throw new Error('Replay audit unavailable; reconciliation required')
          }
          await offlineQueue.remove(mutation.id)
          successCount++
        } else {
          failureCount++
          await offlineQueue.updateStatus(mutation.id, 'failed', 'Server rejected mutation')
        }
      } catch (err) {
        failureCount++
        const errorMsg = err instanceof Error ? err.message : 'Queued operation failed'
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
  private async executeMutationOnServer(mutation: QueuedMutation, accessToken: string): Promise<boolean> {
    const assertIdentity = () => {
      const identity = getOfflineIdentity()
      if (!identity || mutation.actorId !== identity.actorId || mutation.hospitalId !== identity.hospitalId) throw new Error('Queued mutation belongs to another session')
    }
    assertIdentity()
    const { table, action, payload, matchCriteria, conflictPolicy } = mutation
    const cleanPayload = { ...payload }
    delete cleanPayload.__isOptimistic
    delete cleanPayload.__tempId
    delete cleanPayload.__offlinePending
    const poItems = table === 'pharmacy_purchase_orders' && Array.isArray(cleanPayload.items) ? cleanPayload.items : null
    if (poItems) delete cleanPayload.items
    if (action === 'INSERT') {
      let exists = false
      if (cleanPayload.id) {
        const { data, error } = await supabase.from(table).select('id').eq('id', cleanPayload.id).setHeader('Authorization', `Bearer ${accessToken}`).setHeader('x-home-require-online', 'true').maybeSingle()
        if (error) throw error
        exists = !!data
      }
      assertIdentity()
      if (!exists) {
        const { error } = await supabase.from(table).insert([cleanPayload]).setHeader('Authorization', `Bearer ${accessToken}`)
        if (error) throw error
      }
      if (poItems?.length) {
        assertIdentity()
        const items = poItems.map((item: unknown) => {
          if (!item || typeof item !== 'object') throw new Error('Invalid purchase order item')
          return { ...item, po_id: cleanPayload.id }
        })
        const { error } = await supabase.from('pharmacy_purchase_order_items').upsert(items, { onConflict: 'id', ignoreDuplicates: true }).setHeader('Authorization', `Bearer ${accessToken}`)
        if (error) throw error
      }
      return true
    }
    if (action === 'UPSERT') {
      const { error } = await supabase.from(table).upsert([cleanPayload]).setHeader('Authorization', `Bearer ${accessToken}`)
      if (error) throw error
      return true
    }
    if (!matchCriteria || !Object.keys(matchCriteria).length) throw new Error('Mutation match criteria required')
    if (action === 'UPDATE' && conflictPolicy === 'server-wins' && matchCriteria.id) {
      const { data, error } = await supabase.from(table).select('updated_at').eq('id', matchCriteria.id).setHeader('Authorization', `Bearer ${accessToken}`).setHeader('x-home-require-online', 'true').maybeSingle()
      if (error) throw error
      if (data?.updated_at && new Date(data.updated_at).getTime() > mutation.timestamp) throw new Error('Server record changed; conflict requires review')
    }
    assertIdentity()
    let query = action === 'UPDATE' ? supabase.from(table).update(cleanPayload) : supabase.from(table).delete()
    for (const [key, value] of Object.entries(matchCriteria)) query = query.eq(key, value)
    const { data, error } = await query.select('id').setHeader('Authorization', `Bearer ${accessToken}`)
    if (error) throw error
    if (!data?.length) throw new Error('No affected record confirmed; reconciliation required')
    return true
  }
}

export const offlineSyncService = new OfflineSyncService()
