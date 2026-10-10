import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getStockLocations } from '@/modules/inventory/services/inventoryService'
import type { StockLocation } from '@/types/pharmacy'

const DEFAULT_HOSPITAL_ID = '85bb6adc-b868-428b-83f4-e5af2f5cf904'
const STORE_STORAGE_KEY = 'myinventory_selected_store_id'

export interface InventoryStoreContextValue {
  activeStore: StockLocation | null
  activeStoreId: string | null // null means consolidated / all stores
  availableStores: StockLocation[]
  isConsolidatedView: boolean
  isLoading: boolean
  setActiveStoreId: (storeId: string | 'all') => void
  refreshStores: () => Promise<void>
}

const InventoryStoreContext = createContext<InventoryStoreContextValue | undefined>(undefined)

export const InventoryStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  const hospitalId = user?.hospital_id || DEFAULT_HOSPITAL_ID

  const [availableStores, setAvailableStores] = useState<StockLocation[]>([])
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch all stock locations
  const loadStores = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getStockLocations(hospitalId)
      if (res.data && res.data.length > 0) {
        // Filter only active locations
        const activeOnly = res.data.filter(s => s.is_active !== false)
        setAvailableStores(activeOnly)
      } else {
        setAvailableStores([])
      }
    } catch (err) {
      console.error('Error loading inventory store locations:', err)
      setAvailableStores([])
    } finally {
      setIsLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  // Resolve initial active store once stores and user are available
  useEffect(() => {
    if (availableStores.length === 0) return

    const savedStoreId = typeof window !== 'undefined' ? localStorage.getItem(STORE_STORAGE_KEY) : null
    const userDeptId = user?.department_id
    const userDeptName = (user as any)?.department?.department_name?.toLowerCase() || ''

    // 1. Try matching store directly by user's department_id
    let deptMatchedStore = userDeptId
      ? availableStores.find(s => s.department_id === userDeptId)
      : null

    // 2. Try fuzzy matching store by department name if direct ID didn't match
    if (!deptMatchedStore && userDeptName) {
      if (userDeptName.includes('inpatient') || userDeptName.includes('pesakit dalam')) {
        deptMatchedStore = availableStores.find(s => 
          s.location_code === 'LOC-IPD-01' || 
          s.location_name.toLowerCase().includes('pesakit dalam') ||
          s.location_name.toLowerCase().includes('inpatient')
        )
      } else if (userDeptName.includes('logistic') || userDeptName.includes('logistik')) {
        deptMatchedStore = availableStores.find(s => 
          s.location_code === 'LOC-LOG-01' || 
          s.location_name.toLowerCase().includes('logistik')
        )
      }
    }

    // Determine initial store selection:
    // If user's department matches a store, prioritize that store (or if savedStoreId equals this dept store)
    // If user previously manually picked a store that is valid, preserve it
    let chosenStoreId: string | null = null

    if (savedStoreId === 'all') {
      chosenStoreId = null
    } else if (savedStoreId && availableStores.some(s => s.id === savedStoreId)) {
      // If user has a department store, and savedStore was for a different department, sync with user department
      if (deptMatchedStore && savedStoreId !== deptMatchedStore.id) {
        // Check if the saved store belonged to an old department
        const savedBelongsToUserDept = availableStores.find(s => s.id === savedStoreId)?.department_id === userDeptId
        chosenStoreId = savedBelongsToUserDept ? savedStoreId : deptMatchedStore.id
      } else {
        chosenStoreId = savedStoreId
      }
    } else if (deptMatchedStore) {
      chosenStoreId = deptMatchedStore.id
    } else {
      // Fallback: pick Logistics Main Store (LOC-LOG-01) or first store
      const logStore = availableStores.find(s => s.location_code === 'LOC-LOG-01')
      chosenStoreId = logStore ? logStore.id : availableStores[0]?.id || null
    }

    setActiveStoreIdState(chosenStoreId)
    if (typeof window !== 'undefined' && chosenStoreId) {
      localStorage.setItem(STORE_STORAGE_KEY, chosenStoreId)
    }
  }, [availableStores, user?.department_id, (user as any)?.department?.department_name])

  const setActiveStoreId = useCallback((storeId: string | 'all') => {
    if (storeId === 'all') {
      setActiveStoreIdState(null)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORE_STORAGE_KEY, 'all')
      }
    } else {
      setActiveStoreIdState(storeId)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORE_STORAGE_KEY, storeId)
      }
    }
  }, [])

  const activeStore = useMemo(() => {
    if (!activeStoreId) return null
    return availableStores.find(s => s.id === activeStoreId) || null
  }, [activeStoreId, availableStores])

  const isConsolidatedView = activeStoreId === null

  const value = useMemo<InventoryStoreContextValue>(() => ({
    activeStore,
    activeStoreId,
    availableStores,
    isConsolidatedView,
    isLoading,
    setActiveStoreId,
    refreshStores: loadStores,
  }), [activeStore, activeStoreId, availableStores, isConsolidatedView, isLoading, setActiveStoreId, loadStores])

  return (
    <InventoryStoreContext.Provider value={value}>
      {children}
    </InventoryStoreContext.Provider>
  )
}

export function useInventoryStore(): InventoryStoreContextValue {
  const context = useContext(InventoryStoreContext)
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      activeStore: null,
      activeStoreId: null,
      availableStores: [],
      isConsolidatedView: true,
      isLoading: false,
      setActiveStoreId: () => {},
      refreshStores: async () => {},
    }
  }
  return context
}
