import { useState, useCallback, useMemo } from 'react'
import type { StockLocation } from '@/types/pharmacy'

const STORAGE_KEY = 'home_inventory_cross_store_unlocked'
const DEFAULT_STORE_PASSWORD = 'F@rmasi.2016'

export interface UseStoreAccessLockResult {
  isUnlocked: boolean
  unlock: (password: string) => boolean
  lock: () => void
  isStoreRestricted: (targetStoreId: string | 'all') => boolean
  userHomeStore: StockLocation | null
}

export function useStoreAccessLock(
  availableStores: StockLocation[],
  userDeptId?: string,
  userDeptName?: string
): UseStoreAccessLockResult {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  })

  // Determine user's home department store
  const userHomeStore = useMemo<StockLocation | null>(() => {
    if (!availableStores || availableStores.length === 0) return null

    // 1. Direct department ID match
    if (userDeptId) {
      const matched = availableStores.find(s => s.department_id === userDeptId)
      if (matched) return matched
    }

    // 2. Fuzzy match based on department name
    const normalizedName = (userDeptName || '').toLowerCase()
    if (normalizedName) {
      if (normalizedName.includes('inpatient') || normalizedName.includes('pesakit dalam')) {
        const matched = availableStores.find(s =>
          s.location_code === 'LOC-IPD-01' ||
          s.location_name.toLowerCase().includes('pesakit dalam') ||
          s.location_name.toLowerCase().includes('inpatient')
        )
        if (matched) return matched
      } else if (normalizedName.includes('logistic') || normalizedName.includes('logistik')) {
        const matched = availableStores.find(s =>
          s.location_code === 'LOC-LOG-01' ||
          s.location_name.toLowerCase().includes('logistik')
        )
        if (matched) return matched
      }
    }

    // 3. Fallback to LOC-IPD-01 or LOC-LOG-01 if available
    return availableStores.find(s => s.location_code === 'LOC-IPD-01') || availableStores[0] || null
  }, [availableStores, userDeptId, userDeptName])

  const unlock = useCallback((password: string): boolean => {
    if (password === DEFAULT_STORE_PASSWORD) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, 'true')
      }
      setIsUnlocked(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setIsUnlocked(false)
  }, [])

  const isStoreRestricted = useCallback(
    (targetStoreId: string | 'all'): boolean => {
      // If already unlocked in current session, not restricted
      if (isUnlocked) return false

      // 'all' (Consolidated view) is considered an other/cross-store view
      if (targetStoreId === 'all') return true

      // If user has a determined home store and target is that home store, allow freely
      if (userHomeStore && targetStoreId === userHomeStore.id) {
        return false
      }

      // If store belongs to user's registered department ID, allow freely
      if (userDeptId) {
        const targetStore = availableStores.find(s => s.id === targetStoreId)
        if (targetStore && targetStore.department_id === userDeptId) {
          return false
        }
      }

      // Any other store is restricted
      return true
    },
    [isUnlocked, userHomeStore, userDeptId, availableStores]
  )

  return {
    isUnlocked,
    unlock,
    lock,
    isStoreRestricted,
    userHomeStore,
  }
}
