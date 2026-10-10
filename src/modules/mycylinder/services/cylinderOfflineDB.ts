// @ts-nocheck
/**
 * Cylinder Offline Database (IndexedDB)
 * High-performance, persistent client-side database for offline cylinder operations.
 * Enables scanning, inventory lookups, and transaction staging in zero-signal environments.
 */

export interface CachedCylinder {
  id: string
  hospital_id: string
  serial_number: string
  qr_code?: string | null
  qr_code_value?: string | null
  cylinder_size_id?: string | null
  cylinder_type_id?: string | null
  status: string
  current_location?: any
  scanned_location?: string | null
  assigned_ward?: any
  department_id?: string | null
  is_active?: boolean
  is_loan?: boolean
  supplier_tagged?: boolean
  size_info?: any
  type_info?: any
  combo?: any
  updated_at?: string
  last_reconciled_at?: string
  [key: string]: any
}

export type MutationType =
  | 'receive_document'
  | 'return_document'
  | 'empty_scan'
  | 'reconciliation_scan'
  | 'status_update'
  | 'qr_assign'
  | 'manual_issue'
  | 'mark_empty'
  | 'batch_mark_empty'
  | 'correct_valve'

export interface PendingMutation {
  localId: string
  type: MutationType
  hospitalId: string
  payload: Record<string, any>
  createdAt: string
  status: 'pending' | 'syncing' | 'failed'
  retryCount: number
  lastError?: string
}

export interface OfflineMeta {
  key: string
  value: any
  updatedAt: string
}

const DB_NAME = 'HOME_MYCYLINDER_OFFLINE_DB'
const DB_VERSION = 2

class CylinderOfflineDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not supported in this browser environment.'))
    }

    if (this.dbPromise) {
      return this.dbPromise
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = request.result
        const oldVersion = event.oldVersion

        // Store 1: Cylinder Cache
        if (!db.objectStoreNames.contains('cylinder_cache')) {
          const store = db.createObjectStore('cylinder_cache', { keyPath: 'id' })
          store.createIndex('serial_number', 'serial_number', { unique: false })
          store.createIndex('qr_code', 'qr_code', { unique: false })
          store.createIndex('hospital_id', 'hospital_id', { unique: false })
          store.createIndex('status', 'status', { unique: false })
        }

        // Store 2: Sync Queue (pending mutations)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'localId' })
          queueStore.createIndex('status', 'status', { unique: false })
          queueStore.createIndex('createdAt', 'createdAt', { unique: false })
          queueStore.createIndex('type', 'type', { unique: false })
        }

        // Store 3: Static Lookup Tables (combos, sizes, types, suppliers, departments)
        if (!db.objectStoreNames.contains('static_tables')) {
          db.createObjectStore('static_tables', { keyPath: 'table_name' })
        }

        // Store 4: Metadata (cache stats, last sync timestamps)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        this.dbPromise = null
        reject(request.error || new Error('Failed to open IndexedDB'))
      }
    })

    return this.dbPromise
  }

  // -------------------------------------------------------------
  // CYLINDER CACHE OPERATIONS
  // -------------------------------------------------------------

  /**
   * Bulk upserts cylinders into local IndexedDB cache
   */
  async upsertCylinders(cylinders: CachedCylinder[]): Promise<void> {
    if (!cylinders || cylinders.length === 0) return
    const db = await this.getDB()

    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readwrite')
      const store = tx.objectStore('cylinder_cache')

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)

      for (const cyl of cylinders) {
        if (!cyl.id) continue
        store.put({
          ...cyl,
          // Normalise fields for faster indexing
          serial_number: (cyl.serial_number || '').trim().toUpperCase(),
          qr_code: (cyl.qr_code || cyl.qr_code_value || cyl.serial_number || '').trim().toUpperCase(),
        })
      }
    })
  }

  /**
   * Updates a single cylinder or creates it in local cache
   */
  async putCylinder(cylinder: CachedCylinder): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readwrite')
      const store = tx.objectStore('cylinder_cache')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      store.put({
        ...cylinder,
        serial_number: (cylinder.serial_number || '').trim().toUpperCase(),
        qr_code: (cylinder.qr_code || cylinder.qr_code_value || cylinder.serial_number || '').trim().toUpperCase(),
      })
    })
  }

  /**
   * Gets a cylinder by ID from cache
   */
  async getCylinderById(id: string): Promise<CachedCylinder | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Looks up a cylinder by QR code or Serial Number in local cache (with fuzzy & variant matching)
   */
  async findCylinderByCode(
    hospitalId: string,
    code: string,
    options?: {
      excludeIds?: string[];
      preferredValve?: string;
    }
  ): Promise<CachedCylinder | null> {
    const db = await this.getDB()
    const clean = code.trim().toUpperCase()
    if (!clean) return null

    const excludeIds = options?.excludeIds || []
    let preferredValve = options?.preferredValve?.toUpperCase()

    // Valve suffix extraction
    let baseCode = clean
    const valveSuffixRegex = /^(.*?)(?:[\s_/(]+|-)(PI|PIN\s*INDEX|PIN|BN|BULLNOSE|BULL)[\s_/)]*$/i
    const vMatch = clean.match(valveSuffixRegex)
    if (vMatch && vMatch[1].trim().length >= 3) {
      baseCode = vMatch[1].trim()
      const vRaw = vMatch[2].toUpperCase().trim()
      const vType = (vRaw.startsWith('PI') || vRaw.startsWith('PIN')) ? 'PI' : 'BN'
      if (!preferredValve) {
        preferredValve = vType
      }
    }

    const strippedClean = clean.replace(/^(?:O2-|02-)/i, '')
    const strippedBase = baseCode.replace(/^(?:O2-|02-)/i, '')

    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      const req = store.openCursor()
      const matchedCandidates: CachedCylinder[] = []

      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor) {
          if (matchedCandidates.length === 0) {
            resolve(null)
            return
          }

          // Prioritize non-excluded candidates
          const nonExcluded = matchedCandidates.filter(c => !excludeIds.includes(c.id))
          const pool = nonExcluded.length > 0 ? nonExcluded : matchedCandidates

          // Sort candidates
          const STATUS_PRIORITY: Record<string, number> = {
            available: 0,
            allocated: 1,
            in_use: 2,
            issued: 3,
            returned_to_supplier: 4,
          }

          const sorted = [...pool].sort((a, b) => {
            if (preferredValve) {
              const aValve = (a.type_info?.code || (a as any).valve_type || '').toUpperCase()
              const bValve = (b.type_info?.code || (b as any).valve_type || '').toUpperCase()
              const aIsPref = aValve === preferredValve || (a.serial_number && a.serial_number.toUpperCase().includes(`-${preferredValve}`)) ? 1 : 0
              const bIsPref = bValve === preferredValve || (b.serial_number && b.serial_number.toUpperCase().includes(`-${preferredValve}`)) ? 1 : 0
              if (aIsPref !== bIsPref) return bIsPref - aIsPref
            }

            const aExact = a.serial_number?.toUpperCase() === clean ? 1 : 0
            const bExact = b.serial_number?.toUpperCase() === clean ? 1 : 0
            if (aExact !== bExact) return bExact - aExact

            return (STATUS_PRIORITY[a.status] ?? 5) - (STATUS_PRIORITY[b.status] ?? 5)
          })

          resolve(sorted[0])
          return
        }

        const cyl = cursor.value as CachedCylinder
        if (hospitalId && cyl.hospital_id && cyl.hospital_id !== hospitalId) {
          cursor.continue()
          return
        }

        const sn = (cyl.serial_number || '').toUpperCase()
        const qr = (cyl.qr_code || cyl.qr_code_value || '').toUpperCase()

        // 1. Exact match with clean or baseCode
        const isExact = sn === clean || qr === clean || sn === baseCode || qr === baseCode

        // 2. Hyphen variant (e.g. searching O2-P101-F-0178 matches O2-P101-F-0178-PI)
        const isHyphenVariant = sn.startsWith(`${clean}-`) || qr.startsWith(`${clean}-`) || sn.startsWith(`${baseCode}-`) || qr.startsWith(`${baseCode}-`)

        // 3. Prefix variations (without O2-/02-)
        const strippedSn = sn.replace(/^(?:O2-|02-)/i, '')
        const strippedQr = qr.replace(/^(?:O2-|02-)/i, '')
        const isStrippedMatch = strippedClean && (strippedSn === strippedClean || strippedQr === strippedClean || strippedSn === strippedBase || strippedQr === strippedBase)

        // 4. Match without "P" prefix (e.g., "101-F-0139" matches "P101-F-0139")
        const isBareMatch = strippedBase.startsWith('101-') && (strippedSn === `P${strippedBase}` || strippedSn.startsWith(`P${strippedBase}-`))

        if (isExact || isHyphenVariant || isStrippedMatch || isBareMatch) {
          matchedCandidates.push(cyl)
        }

        cursor.continue()
      }

      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Searches cached cylinders by text query and optional status filter
   */
  async searchCylinders(
    hospitalId: string,
    query: string,
    filterStatus?: string,
    limit: number = 50
  ): Promise<CachedCylinder[]> {
    const db = await this.getDB()
    const cleanQuery = query.trim().toUpperCase()

    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      const req = store.openCursor()
      const results: CachedCylinder[] = []

      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor || results.length >= limit) {
          resolve(results)
          return
        }

        const cyl = cursor.value as CachedCylinder

        // Check hospital_id
        if (hospitalId && cyl.hospital_id && cyl.hospital_id !== hospitalId) {
          cursor.continue()
          return
        }

        // Check status filter
        if (filterStatus && cyl.status !== filterStatus) {
          cursor.continue()
          return
        }

        // Check query matching
        if (!cleanQuery) {
          results.push(cyl)
        } else {
          const sn = (cyl.serial_number || '').toUpperCase()
          const qr = (cyl.qr_code || cyl.qr_code_value || '').toUpperCase()
          const loc = (typeof cyl.current_location === 'string' ? cyl.current_location : cyl.current_location?.location_name || '').toUpperCase()
          const typeName = (cyl.combo?.display_name || cyl.type_info?.name || cyl.type_info?.type_name || '').toUpperCase()

          if (
            sn.includes(cleanQuery) ||
            qr.includes(cleanQuery) ||
            loc.includes(cleanQuery) ||
            typeName.includes(cleanQuery)
          ) {
            results.push(cyl)
          }
        }

        cursor.continue()
      }

      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Returns total count of cached cylinders
   */
  async getCylinderCount(hospitalId?: string): Promise<number> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      if (!hospitalId) {
        const req = store.count()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      } else {
        const index = store.index('hospital_id')
        const req = index.count(IDBKeyRange.only(hospitalId))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }
    })
  }

  /**
   * Returns all active cached cylinders for a hospital (0ms local read)
   */
  async getAllCylinders(hospitalId?: string): Promise<CachedCylinder[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      const req = store.getAll()
      req.onsuccess = () => {
        let list = (req.result || []) as CachedCylinder[]
        if (hospitalId) {
          list = list.filter(c => !c.hospital_id || c.hospital_id === hospitalId)
        }
        list = list.filter(c => c.status !== 'deactivated' && c.is_active !== false)
        resolve(list)
      }
      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Returns empty cylinders currently in store from local cache
   */
  async getEmptyCylinders(hospitalId?: string): Promise<CachedCylinder[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readonly')
      const store = tx.objectStore('cylinder_cache')
      const req = store.getAll()
      req.onsuccess = () => {
        let list = (req.result || []) as CachedCylinder[]
        if (hospitalId) {
          list = list.filter(c => !c.hospital_id || c.hospital_id === hospitalId)
        }
        list = list.filter(c => c.status === 'empty' && c.is_active !== false)
        resolve(list)
      }
      req.onerror = () => reject(req.error)
    })
  }

  // -------------------------------------------------------------
  // SYNC QUEUE OPERATIONS
  // -------------------------------------------------------------

  /**
   * Enqueues a pending mutation to be synced to Supabase when online
   */
  async enqueueMutation(
    type: MutationType,
    hospitalId: string,
    payload: Record<string, any>
  ): Promise<PendingMutation> {
    const db = await this.getDB()
    const localId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const mutation: PendingMutation = {
      localId,
      type,
      hospitalId,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite')
      const store = tx.objectStore('sync_queue')
      const req = store.add(mutation)
      tx.oncomplete = () => resolve(mutation)
      tx.onerror = () => reject(tx.error)
    })
  }

  /**
   * Retrieves all pending mutations ordered by creation time
   */
  async getPendingMutations(): Promise<PendingMutation[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly')
      const store = tx.objectStore('sync_queue')
      const req = store.getAll()
      req.onsuccess = () => {
        const list = (req.result || []) as PendingMutation[]
        // Sort by createdAt ascending (FIFO)
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        resolve(list)
      }
      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Updates status or error of a mutation in queue
   */
  async updateMutationStatus(
    localId: string,
    status: 'pending' | 'syncing' | 'failed',
    lastError?: string
  ): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite')
      const store = tx.objectStore('sync_queue')
      const req = store.get(localId)
      req.onsuccess = () => {
        const item = req.result as PendingMutation
        if (!item) {
          resolve()
          return
        }
        item.status = status
        if (status === 'failed') item.retryCount = (item.retryCount || 0) + 1
        if (lastError) item.lastError = lastError
        store.put(item)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  /**
   * Removes a mutation after successful synchronization
   */
  async removeMutation(localId: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite')
      const store = tx.objectStore('sync_queue')
      store.delete(localId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  /**
   * Count of items waiting in sync queue
   */
  async getPendingCount(): Promise<number> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly')
      const store = tx.objectStore('sync_queue')
      const req = store.count()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // -------------------------------------------------------------
  // STATIC LOOKUP TABLES OPERATIONS
  // -------------------------------------------------------------

  async setStaticTable(tableName: string, data: any[]): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('static_tables', 'readwrite')
      const store = tx.objectStore('static_tables')
      store.put({
        table_name: tableName,
        data,
        updated_at: new Date().toISOString(),
      })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getStaticTable(tableName: string): Promise<any[] | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('static_tables', 'readonly')
      const store = tx.objectStore('static_tables')
      const req = store.get(tableName)
      req.onsuccess = () => resolve(req.result?.data || null)
      req.onerror = () => reject(req.error)
    })
  }

  // -------------------------------------------------------------
  // METADATA OPERATIONS
  // -------------------------------------------------------------

  async setMeta(key: string, value: any): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('meta', 'readwrite')
      const store = tx.objectStore('meta')
      store.put({
        key,
        value,
        updatedAt: new Date().toISOString(),
      })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getMeta<T = any>(key: string): Promise<T | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('meta', 'readonly')
      const store = tx.objectStore('meta')
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result ? req.result.value : null)
      req.onerror = () => reject(req.error)
    })
  }

  /**
   * Clears only the cylinder cache store (retaining sync queue and static tables)
   */
  async clearCylinderCache(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cylinder_cache', 'readwrite')
      tx.objectStore('cylinder_cache').clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  /**
   * Resets and clears the offline cache (useful for cache invalidate/force refresh)
   */
  async clearCache(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['cylinder_cache', 'static_tables', 'meta'], 'readwrite')
      tx.objectStore('cylinder_cache').clear()
      tx.objectStore('static_tables').clear()
      tx.objectStore('meta').clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export const cylinderOfflineDB = new CylinderOfflineDatabase()
