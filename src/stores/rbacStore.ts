import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { RoleModuleMatrix, MatrixState } from '@/services/rbacService'

const STORAGE_KEY_GLOBAL_RBAC = 'home_system_rbac_matrix_v2'

// Role code alias mapping for backward compatibility and database parity
const ROLE_ALIASES: Record<string, string[]> = {
  assistant_pharmacist: ['pharmacy_assistant', 'penolong_pegawai_farmasi', 'ppf'],
  pharmacy_assistant: ['assistant_pharmacist', 'penolong_pegawai_farmasi', 'ppf'],
  hospital_admin: ['hospital_administrator', 'admin_hospital'],
  hospital_administrator: ['hospital_admin', 'admin_hospital'],
  transport_admin: ['transport_supervisor', 'admin_transport'],
  system_admin: ['superadmin', 'super_admin'],
}

interface RbacStoreState {
  matrix: MatrixState
  isLoading: boolean
  isLoaded: boolean
  error: string | null

  // Actions
  setMatrix: (matrix: MatrixState) => void
  fetchMatrix: (force?: boolean) => Promise<MatrixState>
  getRoleMatrix: (roleCodeOrId: string) => Record<string, RoleModuleMatrix> | null
  init: () => () => void
}

/**
 * Load initial matrix from localStorage for immediate synchronous UI render
 */
function getInitialMatrix(): MatrixState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GLOBAL_RBAC)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return {}
}

export const useRbacStore = create<RbacStoreState>((set, get) => ({
  matrix: getInitialMatrix(),
  isLoading: false,
  isLoaded: Object.keys(getInitialMatrix()).length > 0,
  error: null,

  setMatrix: (matrix: MatrixState) => {
    set({ matrix, isLoaded: true, error: null })
    try {
      localStorage.setItem(STORAGE_KEY_GLOBAL_RBAC, JSON.stringify(matrix))
      Object.entries(matrix).forEach(([roleKey, roleConfig]) => {
        localStorage.setItem(`home_rbac_overrides_${roleKey.toLowerCase()}`, JSON.stringify(roleConfig))
      })
    } catch (e) {
      // Ignore quota error
    }
  },

  fetchMatrix: async (force = false) => {
    const { isLoaded, matrix } = get()
    if (isLoaded && !force && Object.keys(matrix).length > 0) {
      // Background re-fetch without setting isLoading true
    } else {
      set({ isLoading: true })
    }

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('system_settings')
          .select('rbac_matrix')
          .eq('id', 'system-settings')
          .maybeSingle()

        if (!error && data?.rbac_matrix && typeof data.rbac_matrix === 'object') {
          const dbMatrix = data.rbac_matrix as MatrixState
          if (Object.keys(dbMatrix).length > 0) {
            get().setMatrix(dbMatrix)
            set({ isLoading: false, isLoaded: true, error: null })
            return dbMatrix
          }
        }
      }

      // If Supabase has no data or is not configured, fall back to initial local matrix
      set({ isLoading: false, isLoaded: true })
      return get().matrix
    } catch (err: any) {
      console.warn('Could not fetch rbac_matrix from Supabase:', err)
      set({ isLoading: false, isLoaded: true, error: err?.message || 'Gagal memuat tetapan RBAC' })
      return get().matrix
    }
  },

  getRoleMatrix: (roleCodeOrId: string) => {
    const { matrix } = get()
    if (!roleCodeOrId || Object.keys(matrix).length === 0) return null

    const normalized = roleCodeOrId.toLowerCase().trim()

    // 1. Direct match by role code or UUID
    if (matrix[normalized]) return matrix[normalized]
    if (matrix[roleCodeOrId]) return matrix[roleCodeOrId]

    // 2. Case-insensitive key match
    const matchKey = Object.keys(matrix).find((k) => k.toLowerCase() === normalized)
    if (matchKey && matrix[matchKey]) return matrix[matchKey]

    // 3. Check role aliases (e.g. assistant_pharmacist <-> pharmacy_assistant)
    const aliases = ROLE_ALIASES[normalized] || []
    for (const alias of aliases) {
      if (matrix[alias]) return matrix[alias]
      const aliasMatch = Object.keys(matrix).find((k) => k.toLowerCase() === alias)
      if (aliasMatch && matrix[aliasMatch]) return matrix[aliasMatch]
    }

    return null
  },

  init: () => {
    // 1. Fetch immediately
    get().fetchMatrix(true)

    // 2. Set up Supabase Realtime listener on system_settings table for cross-device instant sync
    let unsubscribe = () => {}
    if (isSupabaseConfigured()) {
      try {
        const channel = supabase
          .channel('system_settings_rbac_realtime')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'system_settings',
              filter: 'id=eq.system-settings',
            },
            (payload: any) => {
              if (payload.new?.rbac_matrix && typeof payload.new.rbac_matrix === 'object') {
                get().setMatrix(payload.new.rbac_matrix as MatrixState)
              }
            }
          )
          .subscribe()

        unsubscribe = () => {
          supabase.removeChannel(channel)
        }
      } catch (e) {
        console.warn('Failed to subscribe to realtime RBAC updates:', e)
      }
    }

    return unsubscribe
  },
}))
