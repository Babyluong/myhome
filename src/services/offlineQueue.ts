import { get, set } from 'idb-keyval'
import { getOfflineIdentity, getOfflineGeneration } from './offlineSession'

export type MutationAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT'
export type ConflictPolicy = 'server-wins' | 'client-wins'
export type MutationStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface QueuedMutation {
  actorId?: string
  hospitalId?: string
  id: string
  module: string
  table: string
  action: MutationAction
  payload: Record<string, unknown>
  matchCriteria?: Record<string, unknown>
  conflictPolicy: ConflictPolicy
  timestamp: number
  retryCount: number
  status: MutationStatus
  lastError?: string
  clientEntityId?: string
}

const QUEUE_STORAGE_KEY = 'home_offline_mutation_queue_v1'
type QueueListener = (queue: QueuedMutation[]) => void

class OfflineQueueManager {
  private queue: QueuedMutation[] = []
  private initialized = false
  private persistenceTail: Promise<void> = Promise.resolve()
  private listeners: Set<QueueListener> = new Set()

  /**
   * Initialize queue from IndexedDB
   */
  async init(): Promise<QueuedMutation[]> {
    if (this.initialized) return this.queue.filter(m => this.belongsToCurrentActor(m))

    try {
      const stored = await get<QueuedMutation[]>(QUEUE_STORAGE_KEY)
      if (Array.isArray(stored)) {
        this.queue = stored.map(item => ({ ...item, status: item.status === 'syncing' ? 'pending' : item.status }))
      } else {
        this.queue = []
      }
    } catch (err) {
      console.warn('[OfflineQueue] IndexedDB unavailable, falling back to localStorage:', err)
      try {
        const local = localStorage.getItem(QUEUE_STORAGE_KEY)
        this.queue = local ? JSON.parse(local) : []
      } catch {
        this.queue = []
      }
    }

    this.initialized = true
    this.notify()
    return this.queue.filter(m => this.belongsToCurrentActor(m))
  }

  private async persist(): Promise<void> {
    const operation = this.persistenceTail.catch(() => undefined).then(() => this.persistSnapshot())
    this.persistenceTail = operation
    return operation
  }

  private async persistSnapshot(): Promise<void> {
    try {
      await set(QUEUE_STORAGE_KEY, this.queue)
    } catch (err) {
      try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
      } catch (storageErr) {
        throw new Error('Offline queue storage unavailable')
      }
    }
    this.notify()
  }

  private notify(): void {
    const snapshot = this.queue.filter(m => this.belongsToCurrentActor(m))
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot)
      } catch (e) {
        console.error('[OfflineQueue] Listener error:', e)
      }
    })
  }

  subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener)
    listener(this.queue.filter(m => this.belongsToCurrentActor(m)))
    return () => {
      this.listeners.delete(listener)
    }
  }

  async enqueue(item: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status' | 'payload'> & { payload: unknown }): Promise<QueuedMutation> {
    const generation = getOfflineGeneration()
    const identity = getOfflineIdentity()
    await this.init()
    if (generation !== getOfflineGeneration()) throw new Error('Session changed during queue initialization')
    if (!identity?.hospitalId) throw new Error('Verified account and hospital required for offline writes')
    const payload = item.payload && typeof item.payload === 'object' && !Array.isArray(item.payload) ? item.payload as Record<string, unknown> : {}
    if (item.action !== 'DELETE' && Object.keys(payload).length === 0) throw new Error('Mutation payload must be a record')
    if (payload.hospital_id && payload.hospital_id !== identity.hospitalId) throw new Error('Mutation outside current hospital')
    if (item.matchCriteria?.hospital_id && item.matchCriteria.hospital_id !== identity.hospitalId) throw new Error('Mutation outside current hospital')
    if (item.table === 'pharmacy_purchase_orders' && Array.isArray(payload.items) && payload.items.some((row: unknown) => !row || typeof row !== 'object' || !('id' in row) || !row.id)) throw new Error('Stable purchase-order item IDs required for replay')
    if ((item.action === 'INSERT' || item.action === 'UPSERT') && !payload.id) throw new Error('Stable record ID required for replayable offline insertion')

    const newMutation: QueuedMutation = {
      ...item,
      payload,
      actorId: identity.actorId,
      hospitalId: identity.hospitalId,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    }

    this.queue.push(newMutation)
    try { await this.persist() } catch (error) {
      this.queue = this.queue.filter(entry => entry.id !== newMutation.id)
      throw error
    }
    console.info(`[OfflineQueue] Enqueued mutation (${newMutation.action} ${newMutation.table}) in module ${newMutation.module}. ID: ${newMutation.id}`)
    return newMutation
  }

  async getPending(): Promise<QueuedMutation[]> {
    await this.init()
    return this.queue.filter((m) => this.belongsToCurrentActor(m) && (m.status === 'pending' || m.status === 'failed'))
  }

  async getAll(): Promise<QueuedMutation[]> {
    await this.init()
    return this.queue.filter(m => this.belongsToCurrentActor(m))
  }

  async updateStatus(id: string, status: MutationStatus, lastError?: string): Promise<void> {
    await this.init()
    const index = this.queue.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.queue[index].status = status
      if (lastError !== undefined) {
        this.queue[index].lastError = lastError
      }
      if (status === 'syncing') {
        this.queue[index].retryCount += 1
      }
      await this.persist()
    }
  }

  async remove(id: string): Promise<void> {
    await this.init()
    this.queue = this.queue.filter((m) => m.id !== id)
    await this.persist()
  }

  async clearAll(): Promise<void> {
    await this.init()
    this.queue = this.queue.filter(mutation => !this.belongsToCurrentActor(mutation))
    await this.persist()
  }

  getPendingCount(): number {
    return this.queue.filter((m) => this.belongsToCurrentActor(m) && (m.status === 'pending' || m.status === 'syncing' || m.status === 'failed')).length
  }

  getPendingByModule(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const m of this.queue) {
      if (this.belongsToCurrentActor(m) && m.status !== 'synced') {
        counts[m.module] = (counts[m.module] || 0) + 1
      }
    }
    return counts
  }

  private belongsToCurrentActor(mutation: QueuedMutation): boolean {
    const identity = getOfflineIdentity()
    return !!identity?.hospitalId && mutation.actorId === identity.actorId && mutation.hospitalId === identity.hospitalId
  }
}

export const offlineQueue = new OfflineQueueManager()
