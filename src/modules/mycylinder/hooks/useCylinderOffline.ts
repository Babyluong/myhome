// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { cylinderSyncEngine, SyncEngineState } from '../services/cylinderSyncEngine'

export function useCylinderOffline(hospitalId?: string) {
  const [syncState, setSyncState] = useState<SyncEngineState>(() => cylinderSyncEngine.getState())

  useEffect(() => {
    if (hospitalId) {
      void cylinderSyncEngine.initialize(hospitalId)
    }

    const unsubscribe = cylinderSyncEngine.subscribe((latestState) => {
      setSyncState(latestState)
    })

    return () => {
      unsubscribe()
    }
  }, [hospitalId])

  const triggerSync = useCallback(async () => {
    return await cylinderSyncEngine.syncNow()
  }, [])

  const triggerWarmup = useCallback(async () => {
    if (hospitalId) {
      await cylinderSyncEngine.warmUpCylinderCache(hospitalId, true)
    }
  }, [hospitalId])

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingCount: syncState.pendingCount,
    cachedCount: syncState.cachedCount,
    lastSyncAt: syncState.lastSyncAt,
    lastCacheWarmupAt: syncState.lastCacheWarmupAt,
    lastError: syncState.lastError,
    syncNow: triggerSync,
    warmUpCache: triggerWarmup,
  }
}
