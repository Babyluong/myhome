export interface OfflineIdentity { actorId: string; hospitalId: string | null; expiresAt?: number }
let identity: OfflineIdentity | null = null
let generation = 0
const VERIFIED_SCOPE_KEY = 'home-offline-verified-scope-v2'
const REVOKED_SESSIONS_KEY = 'home-offline-revoked-sessions-v2'
let sessionId: string | null = null
const revokedInMemory = new Set<string>()
export function setOfflineSessionContext(next: string | null): void {
  if (sessionId !== next) { sessionId = next; identity = null; generation++ }
}
export function isOfflineSessionRevoked(id: string): boolean {
  if (revokedInMemory.has(id)) return true
  try { const ids: unknown = JSON.parse(localStorage.getItem(REVOKED_SESSIONS_KEY) || '[]'); return Array.isArray(ids) && ids.includes(id) } catch { return true }
}
export function rememberOfflineIdentity(next: OfflineIdentity, expiresAt: number): void {
  if (sessionId && isOfflineSessionRevoked(sessionId)) return
  setOfflineIdentity({ ...next, expiresAt })
  try { localStorage.setItem(VERIFIED_SCOPE_KEY, JSON.stringify({ ...next, expiresAt, sessionId, verifiedAt: Date.now() })) } catch { /* Cache persistence is optional. */ }
}
export function restoreOfflineIdentity(actorId: string): void {
  try {
    const saved = JSON.parse(localStorage.getItem(VERIFIED_SCOPE_KEY) || 'null')
    if (saved?.actorId === actorId && saved.sessionId === sessionId && (!sessionId || !isOfflineSessionRevoked(sessionId)) && (saved.hospitalId === null || typeof saved.hospitalId === 'string') && saved.expiresAt > Date.now() && saved.verifiedAt <= Date.now()) {
      setOfflineIdentity({ actorId, hospitalId: saved.hospitalId, expiresAt: saved.expiresAt })
    }
  } catch { /* Never restore unknown scope. */ }
}
export function clearOfflineIdentity(): void {
  setOfflineIdentity(null)
  if (sessionId) revokedInMemory.add(sessionId)
  if (sessionId) try {
    const previous: unknown = JSON.parse(localStorage.getItem(REVOKED_SESSIONS_KEY) || '[]')
    const revoked = Array.isArray(previous) ? previous.filter(value => typeof value === 'string') : []
    if (!revoked.includes(sessionId)) localStorage.setItem(REVOKED_SESSIONS_KEY, JSON.stringify([...revoked, sessionId]))
  } catch { /* In-memory identity is already cleared. */ }
  try { localStorage.removeItem(VERIFIED_SCOPE_KEY) } catch { /* In-memory identity is already cleared. */ }
}
export function setOfflineIdentity(next: OfflineIdentity | null): void {
  if (identity?.actorId !== next?.actorId || identity?.hospitalId !== next?.hospitalId) generation++
  identity = next
}
export function getOfflineIdentity(): OfflineIdentity | null {
  if (identity?.expiresAt && identity.expiresAt <= Date.now()) { identity = null; generation++ }
  return identity
}
export function getOfflineGeneration(): number { getOfflineIdentity(); return generation }
export function offlineScope(): string | null {
  getOfflineIdentity()
  return identity ? `${identity.actorId}:${identity.hospitalId || 'none'}` : null
}
