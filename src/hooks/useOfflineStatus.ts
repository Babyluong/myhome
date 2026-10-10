import { useState, useEffect, useCallback } from 'react'
import { offlineSyncService, SyncStatus } from '@/services/offlineSyncService'

export function useOfflineStatus() {
  const [status, setStatus] = useState<SyncStatus>(() => offlineSyncService.getStatus())

  useEffect(() => {
    offlineSyncService.init()
    const unsubscribe = offlineSyncService.subscribe((newStatus) => {
      setStatus(newStatus)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const syncNow = useCallback(async () => {
    await offlineSyncService.triggerSync()
  }, [])

  return {
    ...status,
    syncNow,
  }
}
