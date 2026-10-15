import { get, set } from 'idb-keyval'
import { offlineScope, getOfflineGeneration, getOfflineIdentity } from './offlineSession'

interface CachedResponse { body: string; status: number; headers: [string, string][]; cachedAt: number }
// Module snapshots never satisfy arbitrary REST requests.
export async function mergeTableRecords(tableName: string, newRows: unknown[]): Promise<void> {
  const scope = offlineScope()
  if (scope) await set(`table_cache_v2:${scope}:${tableName}`, newRows)
}
export async function getCachedTableRows(tableName: string): Promise<unknown[] | null> {
  const scope = offlineScope()
  return scope ? (await get<unknown[]>(`table_cache_v2:${scope}:${tableName}`)) || null : null
}
export async function offlineSafeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init)
  if (request.headers.get('x-home-require-online') === 'true') {
    request.headers.delete('x-home-require-online')
    return fetch(request)
  }
  const scope = offlineScope()
  const generation = getOfflineGeneration()
  const isRead = request.method === 'GET' || request.method === 'HEAD'
  const isRest = /\/rest\/v1\/[^/]+/.test(request.url) && !request.url.includes('/rest/v1/rpc/')
  let key: string | null = null
  let requestActor: string | null = null
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer /i, '')
    const encoded = token?.split('.')[1]
    if (encoded) requestActor = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))).sub || null
  } catch { /* An anonymous or malformed credential never selects an account cache. */ }
  if (scope && isRest && isRead && requestActor === getOfflineIdentity()?.actorId) {
    const entries = Array.from(request.headers.entries()).filter(([name]) => name !== 'authorization').sort(([a], [b]) => a.localeCompare(b))
    const bytes = new TextEncoder().encode(JSON.stringify([scope, request.method, request.url, entries]))
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    key = `rest_cache_v2:${Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')}`
  }
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Offline')
    const response = await fetch(input, init)
    if (key && response.ok && generation === getOfflineGeneration()) {
      const cached: CachedResponse = { body: request.method === 'HEAD' ? '' : await response.clone().text(), status: response.status, headers: Array.from(response.headers.entries()), cachedAt: Date.now() }
      if (generation !== getOfflineGeneration()) throw new Error('Session changed during request')
      try { await set(key, cached) } catch { /* Keep authoritative online response. */ }
    }
    if (scope && generation !== getOfflineGeneration()) throw new Error('Session changed during request')
    return response
  } catch (error) {
    if (!isRead || !isRest) throw error
    if (key && generation === getOfflineGeneration()) {
      const cached = await get<CachedResponse>(key).catch(() => undefined)
      if (cached && generation === getOfflineGeneration()) {
        const headers = new Headers(cached.headers)
        headers.set('X-From-Offline-Cache', 'true')
        headers.set('X-Offline-Cached-At', new Date(cached.cachedAt).toISOString())
        headers.set('Age', String(Math.max(0, Math.floor((Date.now() - cached.cachedAt) / 1000))))
        return new Response(request.method === 'HEAD' ? null : cached.body, { status: cached.status, headers })
      }
    }
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({ code: 'OFFLINE_UNAVAILABLE', message: 'Exact cached query unavailable for this session' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }
}
