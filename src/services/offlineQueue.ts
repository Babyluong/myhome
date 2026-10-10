import { get, set, del } from 'idb-keyval'

export type MutationAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT'
export type ConflictPolicy = 'server-wins' | 'client-wins'
export type MutationStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface QueuedMutation {
  id: string
  module: string
  table: string
  action: MutationAction
  payload: any
  matchCriteria?: Record<string, any>
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
  private listeners: Set<QueueListener> = new Set()

  /**
   * Initialize queue from IndexedDB
   */
  async init(): Promise<QueuedMutation[]> {
    if (this.initialized) return this.queue

    try {
      const stored = await get<QueuedMutation[]>(QUEUE_STORAGE_KEY)
      if (Array.isArray(stored)) {
        this.queue = stored
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
    return this.queue
  }

  private async persist(): Promise<void> {
    try {
      await set(QUEUE_STORAGE_KEY, this.queue)
    } catch (err) {
      try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
      } catch (storageErr) {
        console.error('[OfflineQueue] Failed to persist queue:', storageErr)
      }
    }
    this.notify()
  }

  private notify(): void {
    const snapshot = [...this.queue]
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
    listener([...this.queue])
    return () => {
      this.listeners.delete(listener)
    }
  }

  async enqueue(item: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<QueuedMutation> {
    await this.init()

    const newMutation: QueuedMutation = {
      ...item,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    }

    this.queue.push(newMutation)
    await this.persist()
    console.info(`[OfflineQueue] Enqueued mutation (${newMutation.action} ${newMutation.table}) in module ${newMutation.module}. ID: ${newMutation.id}`)
    return newMutation
  }

  async getPending(): Promise<QueuedMutation[]> {
    await this.init()
    return this.queue.filter((m) => m.status === 'pending' || m.status === 'failed')
  }

  async getAll(): Promise<QueuedMutation[]> {
    await this.init()
    return [...this.queue]
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
    this.queue = []
    try {
      await del(QUEUE_STORAGE_KEY)
      localStorage.removeItem(QUEUE_STORAGE_KEY)
    } catch {
      // ignore
    }
    this.notify()
  }

  getPendingCount(): number {
    return this.queue.filter((m) => m.status === 'pending' || m.status === 'syncing' || m.status === 'failed').length
  }

  getPendingByModule(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const m of this.queue) {
      if (m.status !== 'synced') {
        counts[m.module] = (counts[m.module] || 0) + 1
      }
    }
    return counts
  }
}

export const offlineQueue = new OfflineQueueManager()
