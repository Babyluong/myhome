/**
 * Universal Offline Safe Fetch Interceptor for Supabase Client
 * 
 * Intercepts all REST calls from @supabase/supabase-js:
 * 1. When online: executes fetch, automatically populates CacheStorage, and merges real database
 *    rows into local IndexedDB table-caches ('table_cache_<table_name>').
 * 2. When offline or on network failure: serves responses from CacheStorage or table-level IndexedDB cache
 *    (including cylinderOfflineDB and offlineAdapter storage), providing real cached database records with
 *    proper PostgREST pagination ranges rather than returning empty arrays that trick client UI into
 *    thinking the hospital database is empty.
 * 3. Handles both GET and HEAD requests (e.g. count queries) and PostgREST single object / array shapes.
 */

import { get, set } from 'idb-keyval'
import { cylinderOfflineDB } from '@/modules/mycylinder/services/cylinderOfflineDB'

const SUPABASE_CACHE_NAME = 'supabase-api-cache'

/**
 * Merges newly fetched database rows into local persistent table cache
 */
export async function mergeTableRecords(tableName: string, newRows: any[]): Promise<void> {
  if (!newRows || !Array.isArray(newRows) || newRows.length === 0) return
  try {
    const key = `table_cache_${tableName}`
    const existing = (await get<any[]>(key)) || []
    const map = new Map<string, any>()

    for (const r of existing) {
      if (!r) continue
      const id = r.id || r.serial_number || r.kod_kunci || r.kod_lokasi || JSON.stringify(r)
      map.set(String(id), r)
    }

    for (const r of newRows) {
      if (!r) continue
      const id = r.id || r.serial_number || r.kod_kunci || r.kod_lokasi || JSON.stringify(r)
      const prev = map.get(String(id)) || {}
      map.set(String(id), { ...prev, ...r })
    }

    const merged = Array.from(map.values())
    // Keep up to 2000 most recently updated records per table
    const trimmed = merged.slice(-2000)
    await set(key, trimmed)
  } catch (err) {
    console.warn(`[OfflineFetch] Failed to merge table cache for ${tableName}:`, err)
  }
}

/**
 * Retrieves cached records for a given Supabase table across all local storage backends
 */
export async function getCachedTableRows(tableName: string, hospitalId?: string): Promise<any[] | null> {
  try {
    // 1. Direct table cache populated by online queries and preloader
    const tableCache = await get<any[]>(`table_cache_${tableName}`)
    if (tableCache && Array.isArray(tableCache) && tableCache.length > 0) {
      return tableCache
    }

    // 2. Universal offlineAdapter collection cache
    const homeCache = await get<{ timestamp: number; data: any[] }>(`home_offline_cache_${tableName}`)
    if (homeCache && Array.isArray(homeCache.data) && homeCache.data.length > 0) {
      return homeCache.data
    }

    // 3. Module-scoped offlineAdapter cache
    const procCache = await get<{ timestamp: number; data: any[] }>(`home_offline_cache_procurement_${tableName}`)
    if (procCache && Array.isArray(procCache.data) && procCache.data.length > 0) {
      return procCache.data
    }

    // 4. Cylinder specific database
    if (tableName === 'pharmacy_oxygen_cylinder_inventory') {
      const cylinders = await cylinderOfflineDB.getAllCylinders(hospitalId)
      if (cylinders && cylinders.length > 0) return cylinders
    }
    if (['pharmacy_oxygen_size_type_combos', 'pharmacy_oxygen_cylinder_sizes', 'pharmacy_oxygen_cylinder_types', 'suppliers', 'departments'].includes(tableName)) {
      const staticKey = tableName === 'pharmacy_oxygen_size_type_combos' ? 'combos'
        : tableName === 'pharmacy_oxygen_cylinder_sizes' ? 'sizes'
        : tableName === 'pharmacy_oxygen_cylinder_types' ? 'types'
        : tableName
      const staticData = await cylinderOfflineDB.getStaticTable(staticKey)
      if (staticData && staticData.length > 0) return staticData
    }

    return null
  } catch (err) {
    console.warn(`[OfflineFetch] Error fetching cached rows for ${tableName}:`, err)
    return null
  }
}

export async function offlineSafeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url

  // Extract table name from PostgREST path: /rest/v1/<table_name>
  const tableMatch = url.match(/\/rest\/v1\/([a-zA-Z0-9_-]+)/)
  const tableName = tableMatch ? tableMatch[1] : null

  // Read queries: GET and HEAD
  if (method === 'GET' || method === 'HEAD') {
    if (isOnline) {
      try {
        const response = await fetch(input, init)
        
        // If response is successful, update CacheStorage and table-level IndexedDB cache
        if (response.ok && method === 'GET') {
          // CacheStorage only supports full 200 responses (206 Partial Content throws TypeError per Cache API spec)
          if (response.status === 200 && 'caches' in window) {
            const responseClone = response.clone()
            void window.caches.open(SUPABASE_CACHE_NAME).then((cache) => {
              cache.put(url, responseClone).catch((err) => {
                if (!String(err).includes('206')) {
                  console.warn('[OfflineFetch] Cache put failed:', err)
                }
              })
            }).catch(() => {})
          }

          // Asynchronously merge table data into local IndexedDB
          if (tableName) {
            response.clone().json().then((bodyData) => {
              if (Array.isArray(bodyData) && bodyData.length > 0) {
                void mergeTableRecords(tableName, bodyData)
              } else if (bodyData && typeof bodyData === 'object' && (bodyData as any).id) {
                void mergeTableRecords(tableName, [bodyData])
              }
            }).catch(() => {})
          }
        }
        
        return response
      } catch (networkError) {
        console.warn(`[OfflineFetch] Network fetch failed for ${url}. Switching to offline cache fallback...`, networkError)
      }
    }

    // OFFLINE OR NETWORK ERROR FALLBACK:
    // 1. Try matching against CacheStorage for exact URL
    if ('caches' in window) {
      try {
        const cache = await window.caches.open(SUPABASE_CACHE_NAME)
        const cachedResponse = (await cache.match(url)) || (await window.caches.match(input))
        if (cachedResponse) {
          console.info(`[OfflineFetch] Serving from CacheStorage: ${url}`)
          
          if (method === 'HEAD') {
            return new Response(null, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: cachedResponse.headers,
            })
          }

          const headers = new Headers(cachedResponse.headers)
          headers.set('X-From-Offline-Cache', 'true')
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers,
          })
        }
      } catch (cacheErr) {
        console.warn('[OfflineFetch] CacheStorage match failed:', cacheErr)
      }
    }

    // 2. Try serving from IndexedDB table cache
    if (tableName) {
      const cachedRows = await getCachedTableRows(tableName)
      if (cachedRows && cachedRows.length > 0) {
        let offset = 0
        let limit = cachedRows.length

        // Parse Range header if present (PostgREST range queries)
        let rangeHeader: string | null = null
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            rangeHeader = init.headers.get('range') || init.headers.get('Range')
          } else if (Array.isArray(init.headers)) {
            const found = init.headers.find(([k]) => k.toLowerCase() === 'range')
            if (found) rangeHeader = found[1]
          } else if (typeof init.headers === 'object') {
            rangeHeader = (init.headers as any)['range'] || (init.headers as any)['Range']
          }
        }
        if (!rangeHeader && input instanceof Request) {
          rangeHeader = input.headers.get('range')
        }

        if (rangeHeader) {
          const match = rangeHeader.match(/(\d+)-(\d+)/)
          if (match) {
            offset = parseInt(match[1], 10)
            const end = parseInt(match[2], 10)
            limit = (end - offset) + 1
          }
        }

        // Also check URL query params for offset and limit
        try {
          const parsedUrl = new URL(url, 'https://localhost')
          if (parsedUrl.searchParams.has('offset')) {
            offset = parseInt(parsedUrl.searchParams.get('offset')!, 10) || 0
          }
          if (parsedUrl.searchParams.has('limit')) {
            limit = parseInt(parsedUrl.searchParams.get('limit')!, 10) || limit
          }
        } catch (_) {}

        const total = cachedRows.length
        const endRange = Math.min(offset + limit - 1, total - 1)
        const contentRange = total > 0 ? `${offset}-${Math.max(offset, endRange)}/${total}` : '0-0/0'
        const sliced = cachedRows.slice(offset, offset + limit)

        console.info(`[OfflineFetch] Serving ${sliced.length}/${total} cached rows for table '${tableName}' (${contentRange})`)

        if (method === 'HEAD') {
          return new Response(null, {
            status: 200,
            statusText: 'OK (Offline Table Cache)',
            headers: {
              'Content-Type': 'application/json',
              'Content-Range': contentRange,
              'Range-Unit': 'items',
              'X-From-Offline-Cache': 'true',
            },
          })
        }

        // Determine if single object requested
        let accept = ''
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            accept = init.headers.get('accept') || ''
          } else if (Array.isArray(init.headers)) {
            const found = init.headers.find(([k]) => k.toLowerCase() === 'accept')
            if (found) accept = found[1]
          } else if (typeof init.headers === 'object') {
            accept = (init.headers as Record<string, string>)['accept'] || (init.headers as Record<string, string>)['Accept'] || ''
          }
        }
        if (!accept && input instanceof Request) {
          accept = input.headers.get('accept') || ''
        }
        const isSingleObject = accept.includes('application/vnd.pgrst.object+json')

        return new Response(JSON.stringify(isSingleObject ? (sliced[0] || {}) : sliced), {
          status: 200,
          statusText: 'OK (Offline Table Cache)',
          headers: {
            'Content-Type': isSingleObject ? 'application/vnd.pgrst.object+json' : 'application/json',
            'Content-Range': contentRange,
            'Range-Unit': 'items',
            'X-From-Offline-Cache': 'true',
          },
        })
      }
    }

    // 3. Fallback for completely uncached endpoints
    if (method === 'HEAD') {
      console.info(`[OfflineFetch] Synthesizing offline HEAD response for ${url}`)
      return new Response(null, {
        status: 200,
        statusText: 'OK (Offline Fallback)',
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': '0-0/0',
          'X-Offline-Graceful-Fallback': 'true',
        },
      })
    }

    let accept = ''
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        accept = init.headers.get('accept') || ''
      } else if (Array.isArray(init.headers)) {
        const found = init.headers.find(([k]) => k.toLowerCase() === 'accept')
        if (found) accept = found[1]
      } else if (typeof init.headers === 'object') {
        accept = (init.headers as Record<string, string>)['accept'] || (init.headers as Record<string, string>)['Accept'] || ''
      }
    }
    if (!accept && input instanceof Request) {
      accept = input.headers.get('accept') || ''
    }

    const isSingleObject = accept.includes('application/vnd.pgrst.object+json')
    console.info(`[OfflineFetch] Synthesizing offline GET fallback (${isSingleObject ? 'object' : 'array'}) for ${url}`)

    return new Response(JSON.stringify(isSingleObject ? {} : []), {
      status: 200,
      statusText: 'OK (Offline Fallback)',
      headers: {
        'Content-Type': isSingleObject ? 'application/vnd.pgrst.object+json' : 'application/json',
        'Content-Range': '0-0/0',
        'X-Offline-Graceful-Fallback': 'true',
      },
    })
  }

  // Non-GET requests (mutations: POST, PATCH, DELETE, PUT)
  try {
    return await fetch(input, init)
  } catch (mutationErr) {
    if (!isOnline) {
      console.info(`[OfflineFetch] Offline mutation caught for ${url}. Serving synthetic 200 for adapter handling.`)
      return new Response(JSON.stringify({ offline_queued: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    throw mutationErr
  }
}
