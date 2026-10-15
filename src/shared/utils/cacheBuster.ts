/**
 * Client Cache Buster & State Synchronizer
 * 
 * Ensures mobile phones and browsers never serve stale cached API data or obsolete Service Worker caches.
 * Specifically purges legacy Workbox caches: 'supabase-api-cache' and 'cylinder-static-tables-cache',
 * and synchronizes client storage with live database parity.
 */

export const SYSTEM_CACHE_VERSION = 'HOME_CACHE_V20261013'
const CACHE_VERSION_KEY = 'home_system_cache_version'

const LEGACY_CACHE_NAMES = [
  'legacy-workbox-v1',
  'obsolete-static-cache-v1',
  'supabase-api-cache',
  'supabase-storage-cache',
]

const SAFE_WORKER_VERSION = '20261013-v2'

function probeSafeWorker(controller: ServiceWorker): Promise<boolean> {
  return new Promise(resolve => {
    const channel = new MessageChannel()
    let complete = false
    const finish = (safe: boolean) => {
      if (complete) return
      complete = true
      clearTimeout(timer)
      channel.port1.close()
      channel.port2.close()
      resolve(safe)
    }
    const timer = setTimeout(() => finish(false), 3000)
    channel.port1.onmessage = event => {
      const data: unknown = event.data
      finish(typeof data === 'object' && data !== null && 'version' in data && data.version === SAFE_WORKER_VERSION)
    }
    channel.port1.onmessageerror = () => finish(false)
    try {
      controller.postMessage({ type: 'HOME_SAFE_OFFLINE_CACHE_V2' }, [channel.port2])
    } catch {
      finish(false)
    }
  })
}

async function prepareServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return
  const controller = navigator.serviceWorker.controller
  if (await probeSafeWorker(controller)) {
    const registration = await navigator.serviceWorker.getRegistration().catch(() => undefined)
    if (registration) {
      void registration.update().catch(error => console.warn('[CacheBuster] Background worker update unavailable:', error))
    }
    return
  }
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) throw new Error('Service worker registration unavailable')

  await new Promise<void>((resolve, reject) => {
    let complete = false
    let probingController: ServiceWorker | null = null
    const watchedWorkers = new Set<ServiceWorker>()
    const finish = (safe: boolean) => {
      if (complete) return
      complete = true
      clearTimeout(timer)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      registration.removeEventListener('updatefound', onUpdateFound)
      for (const worker of watchedWorkers) worker.removeEventListener('statechange', onWorkerStateChange)
      if (safe) resolve()
      else reject(new Error('Safe service worker activation unavailable'))
    }
    const activateWaitingWorker = () => {
      const waiting = registration.waiting
      if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    const checkController = () => {
      const active = navigator.serviceWorker.controller
      if (!active || active === probingController || complete) return
      probingController = active
      void probeSafeWorker(active).then(safe => {
        if (safe) finish(true)
      })
    }
    const onWorkerStateChange = (event: Event) => {
      const worker = event.currentTarget as ServiceWorker
      if (worker.state === 'installed') worker.postMessage({ type: 'SKIP_WAITING' })
      activateWaitingWorker()
      checkController()
    }
    const watchInstallingWorker = () => {
      const installing = registration.installing
      if (!installing || watchedWorkers.has(installing)) return
      watchedWorkers.add(installing)
      installing.addEventListener('statechange', onWorkerStateChange)
      if (installing.state === 'installed') installing.postMessage({ type: 'SKIP_WAITING' })
    }
    const onUpdateFound = () => watchInstallingWorker()
    const onControllerChange = () => checkController()
    const timer = setTimeout(() => finish(false), 20000)
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    registration.addEventListener('updatefound', onUpdateFound)
    watchInstallingWorker()
    activateWaitingWorker()
    checkController()
    void registration.update().then(() => {
      watchInstallingWorker()
      activateWaitingWorker()
      checkController()
    }).catch(() => finish(false))
  })
}

async function deleteLegacyCaches(): Promise<void> {
  if (!('caches' in window)) return
  const keys = await window.caches.keys()
  for (const key of keys) {
    if (LEGACY_CACHE_NAMES.includes(key)) await window.caches.delete(key)
  }
}

/**
 * Purges obsolete browser CacheStorage and instructs Service Workers to refresh
 */
export async function purgeStaleApiCaches(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await deleteLegacyCaches()
    await prepareServiceWorker()
    await deleteLegacyCaches()

    // This marker is informational; unavailable browser storage must not block startup.
    try {
      const savedVersion = localStorage.getItem(CACHE_VERSION_KEY)
      if (savedVersion !== SYSTEM_CACHE_VERSION) {
        localStorage.setItem(CACHE_VERSION_KEY, SYSTEM_CACHE_VERSION)
      }
    } catch (error) {
      console.warn('[CacheBuster] Browser storage unavailable; continuing without the cache version marker:', error)
    }

  } catch (err) {
    console.error('[CacheBuster] Error while purging stale caches:', err)
    throw new Error('HOME startup preparation failed')
  }
}
