import { get, set } from 'idb-keyval'
import { supabase } from './supabase'
import { offlineQueue, MutationAction, ConflictPolicy, QueuedMutation } from './offlineQueue'
import { offlineSyncService } from './offlineSyncService'
import { mergeTableRecords } from './offlineFetch'

export interface MutationOptions<T = any, P = any> {
  module: string
  table: string
  action: MutationAction
  payload: P
  matchCriteria?: Record<string, any>
  conflictPolicy?: ConflictPolicy
}

export interface MutationResult<T = any> {
  data: T | null
  error: Error | null
  isOffline: boolean
  queued: boolean
}

const CACHE_PREFIX = 'home_offline_cache_'

export class OfflineAdapter {
  /**
   * Universal mutation execution with automatic offline fallback and queueing
   */
  async executeMutation<T = any, P = any>(options: MutationOptions<T, P>): Promise<MutationResult<T>> {
    const { module, table, action, payload, matchCriteria } = options
    const conflictPolicy: ConflictPolicy = options.conflictPolicy || (
      // Personal logs default to client-wins; shared assets default to server-wins
      ['suhu_log', 'suhu_records', 'user_notes', 'audit_logs'].includes(table)
        ? 'client-wins'
        : 'server-wins'
    )

    const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    // If online, attempt direct execution first
    if (isCurrentlyOnline) {
      try {
        if (action === 'INSERT') {
          const { data, error } = await supabase.from(table).insert([payload]).select().single()
          if (!error) {
            await this.updateCachedCollection(module, table, action, data || payload)
            return { data: (data || payload) as T, error: null, isOffline: false, queued: false }
          }
          // If non-network error (e.g. database validation error), throw it
          if (error.code && error.code !== 'PGRST301' && !error.message.includes('Failed to fetch')) {
            return { data: null, error: new Error(error.message), isOffline: false, queued: false }
          }
        } else if (action === 'UPDATE') {
          let query = supabase.from(table).update(payload)
          if (matchCriteria) {
            for (const [k, v] of Object.entries(matchCriteria)) {
              query = query.eq(k, v)
            }
          }
          const { data, error } = await query.select().maybeSingle()
          if (!error) {
            await this.updateCachedCollection(module, table, action, data || payload, matchCriteria)
            return { data: (data || payload) as T, error: null, isOffline: false, queued: false }
          }
          if (error.code && error.code !== 'PGRST301' && !error.message.includes('Failed to fetch')) {
            return { data: null, error: new Error(error.message), isOffline: false, queued: false }
          }
        } else if (action === 'DELETE') {
          let query = supabase.from(table).delete()
          if (matchCriteria) {
            for (const [k, v] of Object.entries(matchCriteria)) {
              query = query.eq(k, v)
            }
          }
          const { error } = await query
          if (!error) {
            await this.updateCachedCollection(module, table, action, null, matchCriteria)
            return { data: null, error: null, isOffline: false, queued: false }
          }
          if (error.code && error.code !== 'PGRST301' && !error.message.includes('Failed to fetch')) {
            return { data: null, error: new Error(error.message), isOffline: false, queued: false }
          }
        }
      } catch (networkError: any) {
        console.warn(`[OfflineAdapter] Network failure during ${action} on ${table}. Switching to offline queue:`, networkError)
      }
    }

    // OFFLINE FALLBACK:
    // Generate optimistic record and enqueue to background sync
    const clientEntityId = (payload as any)?.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const optimisticRecord = {
      ...(payload as any),
      id: clientEntityId,
      __isOptimistic: true,
      __offlinePending: true,
      created_at: (payload as any)?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Enqueue mutation
    await offlineQueue.enqueue({
      module,
      table,
      action,
      payload: optimisticRecord,
      matchCriteria,
      conflictPolicy,
      clientEntityId,
    })

    // Update optimistic cache
    await this.updateCachedCollection(module, table, action, optimisticRecord, matchCriteria)

    // Trigger sync service notification so UI updates pending badge
    void offlineSyncService.verifyConnection()

    return {
      data: optimisticRecord as T,
      error: null,
      isOffline: true,
      queued: true,
    }
  }

  /**
   * Save collection snapshot to local IndexedDB cache
   */
  async setCache<T>(cacheKey: string, data: T[]): Promise<void> {
    try {
      await set(`${CACHE_PREFIX}${cacheKey}`, {
        timestamp: Date.now(),
        data,
      })
      if (Array.isArray(data) && data.length > 0) {
        void mergeTableRecords(cacheKey, data)
        const pureTable = cacheKey.replace(/^(procurement_|pharmacy_|suhu_|kunci_)/, '')
        if (pureTable !== cacheKey) {
          void mergeTableRecords(pureTable, data)
        }
      }
    } catch (e) {
      console.warn('[OfflineAdapter] Cache write failed:', e)
    }
  }

  /**
   * Get collection snapshot from cache, merged with any pending optimistic mutations
   */
  async getCache<T>(cacheKey: string, module?: string, table?: string): Promise<T[] | null> {
    try {
      const cached = await get<{ timestamp: number; data: T[] }>(`${CACHE_PREFIX}${cacheKey}`)
      if (!cached || !Array.isArray(cached.data)) {
        return null
      }

      let result = [...cached.data]

      // If module and table specified, merge pending offline mutations
      if (module && table) {
        const pending = await offlineQueue.getPending()
        const relevantPending = pending.filter((m) => m.module === module && m.table === table)

        for (const mut of relevantPending) {
          if (mut.action === 'INSERT') {
            // Avoid duplicate if already in cached list
            const existingIndex = result.findIndex((item: any) => item.id === mut.payload?.id)
            if (existingIndex === -1) {
              result.unshift({ ...mut.payload, __offlinePending: true })
            }
          } else if (mut.action === 'UPDATE' && mut.matchCriteria?.id) {
            const index = result.findIndex((item: any) => item.id === mut.matchCriteria?.id)
            if (index !== -1) {
              result[index] = { ...result[index], ...mut.payload, __offlinePending: true }
            }
          } else if (mut.action === 'DELETE' && mut.matchCriteria?.id) {
            result = result.filter((item: any) => item.id !== mut.matchCriteria?.id)
          }
        }
      }

      return result
    } catch (e) {
      console.warn('[OfflineAdapter] Cache read failed:', e)
      return null
    }
  }

  /**
   * Internal cache collection updater
   */
  private async updateCachedCollection(
    module: string,
    table: string,
    action: MutationAction,
    record: any,
    matchCriteria?: Record<string, any>
  ): Promise<void> {
    const cacheKey = `${module}_${table}`
    const existing = (await this.getCache<any>(cacheKey)) || []

    let updated = [...existing]
    if (action === 'INSERT' && record) {
      const exists = updated.some((item) => item.id === record.id)
      if (!exists) {
        updated.unshift(record)
      }
    } else if (action === 'UPDATE' && record && matchCriteria?.id) {
      updated = updated.map((item) => (item.id === matchCriteria.id ? { ...item, ...record } : item))
    } else if (action === 'DELETE' && matchCriteria?.id) {
      updated = updated.filter((item) => item.id !== matchCriteria.id)
    }

    await this.setCache(cacheKey, updated)
  }
}

export const offlineAdapter = new OfflineAdapter()
