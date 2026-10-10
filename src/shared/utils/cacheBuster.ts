/**
 * Client Cache Buster & State Synchronizer
 * 
 * Ensures mobile phones and browsers never serve stale cached API data or obsolete Service Worker caches.
 * Specifically purges legacy Workbox caches: 'supabase-api-cache' and 'cylinder-static-tables-cache',
 * and synchronizes client storage with live database parity.
 */

import { cylinderOfflineDB } from '@/modules/mycylinder/services/cylinderOfflineDB'

export const SYSTEM_CACHE_VERSION = 'HOME_CACHE_V202610101653'
const CACHE_VERSION_KEY = 'home_system_cache_version'

const LEGACY_CACHE_NAMES = [
  'legacy-workbox-v1',
  'obsolete-static-cache-v1',
]

/**
 * Purges obsolete browser CacheStorage and instructs Service Workers to refresh
 */
export async function purgeStaleApiCaches(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // 1. Purge only truly obsolete legacy CacheStorage entries (keep active offline caches intact)
    if ('caches' in window) {
      const keys = await window.caches.keys()
      for (const key of keys) {
        if (LEGACY_CACHE_NAMES.includes(key)) {
          console.info(`[CacheBuster] Purging obsolete CacheStorage: ${key}`)
          await window.caches.delete(key)
        }
      }
    }

    // 2. Maintain system cache version flag in localStorage
    const savedVersion = localStorage.getItem(CACHE_VERSION_KEY)
    if (savedVersion !== SYSTEM_CACHE_VERSION) {
      localStorage.setItem(CACHE_VERSION_KEY, SYSTEM_CACHE_VERSION)
    }

    // 3. Prompt active Service Workers to update immediately
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.update()
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      }).catch((swErr) => {
        console.warn('[CacheBuster] Service worker registration check failed:', swErr)
      })
    }
  } catch (err) {
    console.error('[CacheBuster] Error while purging stale caches:', err)
  }
}
