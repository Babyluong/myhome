import { get, set } from 'idb-keyval'
import { supabase } from './supabase'
import { offlineQueue, MutationAction, ConflictPolicy } from './offlineQueue'
import { offlineSyncService } from './offlineSyncService'
import { getOfflineGeneration, offlineScope } from './offlineSession'

export interface MutationOptions<P = Record<string, unknown>> {
  module: string
  table: string
  action: MutationAction
  payload: P
  matchCriteria?: Record<string, unknown>
  conflictPolicy?: ConflictPolicy
}

export interface MutationResult<T = Record<string, unknown>> {
  data: T | null
  error: Error | null
  isOffline: boolean
  queued: boolean
}

function recordId(value: object): unknown { return 'id' in value ? value.id : undefined }
const CACHE_PREFIX = 'home_offline_cache_'

export class OfflineAdapter {
  /**
   * Universal mutation execution with automatic offline fallback and queueing
   */
  async executeMutation<T = Record<string, unknown>, P = unknown>(options: MutationOptions<P>): Promise<MutationResult<T>> {
    const generation = getOfflineGeneration()
    const { module, table, action, payload, matchCriteria } = options
    if ((action === 'UPDATE' || action === 'DELETE') && (!matchCriteria || !Object.keys(matchCriteria).length)) return { data: null, error: new Error('Mutation match criteria required'), isOffline: false, queued: false }
    if (typeof navigator === 'undefined' || navigator.onLine) {
      try {
        let query = action === 'INSERT' ? supabase.from(table).insert([payload])
          : action === 'UPSERT' ? supabase.from(table).upsert([payload])
          : action === 'UPDATE' ? supabase.from(table).update(payload)
          : supabase.from(table).delete()
        if (matchCriteria && (action === 'UPDATE' || action === 'DELETE')) for (const [key, value] of Object.entries(matchCriteria)) query = query.eq(key, value)
        const { data, error } = await query.select().maybeSingle()
        if (generation !== getOfflineGeneration()) return { data: null, error: new Error('Session changed during mutation; refresh to reconcile'), isOffline: false, queued: false }
        if (!error) {
          if (!data && action !== 'DELETE') return { data: null, error: new Error('Mutation did not confirm an affected record'), isOffline: false, queued: false }
          await this.updateCachedCollection(module, table, action, data, matchCriteria)
          return { data: data as T | null, error: null, isOffline: false, queued: false }
        }
        if (error.code || !/Failed to fetch|NetworkError|fetch failed/i.test(error.message)) return { data: null, error: new Error('Server rejected mutation'), isOffline: false, queued: false }
      } catch (error) {
        if (!(error instanceof Error) || !/Failed to fetch|NetworkError|fetch failed/i.test(error.message)) return { data: null, error: error instanceof Error ? error : new Error('Mutation failed'), isOffline: false, queued: false }
      }
    }
    if (generation !== getOfflineGeneration()) return { data: null, error: new Error('Session changed'), isOffline: true, queued: false }
    const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const clientEntityId = typeof record.id === 'string' ? record.id : undefined
    const optimisticRecord = { ...record, __isOptimistic: true, __offlinePending: true }
    try {
      await offlineQueue.enqueue({ module, table, action, payload, matchCriteria, conflictPolicy: options.conflictPolicy || 'server-wins', clientEntityId })
    } catch (error) { return { data: null, error: error instanceof Error ? error : new Error('Queue persistence failed'), isOffline: true, queued: false } }
    if (generation !== getOfflineGeneration()) return { data: null, error: new Error('Session changed; queued operation remains with originating account'), isOffline: true, queued: true }
    await this.updateCachedCollection(module, table, action, optimisticRecord, matchCriteria)
    void offlineSyncService.verifyConnection()
    return { data: optimisticRecord as T, error: null, isOffline: true, queued: true }
  }

  /**
   * Save collection snapshot to local IndexedDB cache
   */
  async setCache<T>(cacheKey: string, data: T[]): Promise<void> {
    const scope = offlineScope()
    if (!scope) return
    try {
      await set(`${CACHE_PREFIX}${scope}:${cacheKey}`, {
        timestamp: Date.now(),
        data,
      })
    } catch (e) {
      console.warn('[OfflineAdapter] Cache write failed:', e)
    }
  }

  /**
   * Get collection snapshot from cache, merged with any pending optimistic mutations
   */
  async getCache<T extends object>(cacheKey: string, module?: string, table?: string): Promise<T[] | null> {
    const scope = offlineScope()
    const generation = getOfflineGeneration()
    if (!scope) return null
    try {
      const cached = await get<{ timestamp: number; data: T[] }>(`${CACHE_PREFIX}${scope}:${cacheKey}`)
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
            const existingIndex = result.findIndex((item) => recordId(item) === mut.payload?.id)
            if (existingIndex === -1) {
              result.unshift({ ...mut.payload, __offlinePending: true } as unknown as T)
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

      return generation === getOfflineGeneration() ? result : null
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
    record: Record<string, unknown> | null,
    matchCriteria?: Record<string, unknown>
  ): Promise<void> {
    const cacheKey = `${module}_${table}`
    const existing = (await this.getCache<Record<string, unknown>>(cacheKey)) || []

    let updated = [...existing]
    if ((action === 'INSERT' || action === 'UPSERT') && record) {
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
