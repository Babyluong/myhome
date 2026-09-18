import { supabase, isSupabaseConfigured } from './supabase'
import { SYSTEM_MODULE_REGISTRY, ActionType } from '@/shared/constants/moduleRegistry'
import { useRbacStore } from '@/stores/rbacStore'

export interface RoleModuleMatrix {
  view?: boolean
  create?: boolean
  edit?: boolean
  approve?: boolean
  delete?: boolean
  export?: boolean
  admin?: boolean
  features?: {
    [featureCode: string]: {
      [action in ActionType]?: boolean
    }
  }
}

export interface MatrixState {
  [roleKey: string]: {
    [moduleCode: string]: RoleModuleMatrix
  }
}

const STORAGE_KEY_GLOBAL_RBAC = 'home_system_rbac_matrix_v2'

/**
 * Generate default baseline matrix for a given role based on SYSTEM_MODULE_REGISTRY
 */
export function buildDefaultMatrixForRole(roleCode: string): Record<string, RoleModuleMatrix> {
  const normalizedRole = (roleCode || '').toLowerCase().trim()
  const roleMatrix: Record<string, RoleModuleMatrix> = {}

  const isPharmacyRole =
    normalizedRole === 'pharmacist' ||
    normalizedRole === 'assistant_pharmacist' ||
    normalizedRole === 'pharmacy_assistant' ||
    normalizedRole === 'pharmacy_manager' ||
    normalizedRole === 'pharmacy_director' ||
    normalizedRole === 'penolong_pegawai_farmasi' ||
    normalizedRole === 'ppf' ||
    normalizedRole === 'pharmacy_storekeeper'

  const isDirectorOrAdmin =
    normalizedRole.includes('director') ||
    normalizedRole.includes('admin') ||
    normalizedRole === 'hospital_admin' ||
    normalizedRole === 'hospital_administrator'

  const isManagerOrSupervisor =
    isDirectorOrAdmin ||
    normalizedRole.includes('manager') ||
    normalizedRole.includes('sister') ||
    normalizedRole.includes('matron') ||
    normalizedRole.includes('head') ||
    normalizedRole.includes('supervisor')

  SYSTEM_MODULE_REGISTRY.forEach((mod) => {
    const modCode = mod.code.toLowerCase()
    const isDefaultAssigned = mod.defaultRoles.some((r) => {
      const nr = r.toLowerCase().trim()
      return (
        nr === normalizedRole ||
        (normalizedRole === 'assistant_pharmacist' && nr === 'pharmacy_assistant') ||
        (normalizedRole === 'pharmacy_assistant' && nr === 'assistant_pharmacist') ||
        (normalizedRole === 'hospital_admin' && nr === 'hospital_administrator') ||
        (normalizedRole === 'hospital_administrator' && nr === 'hospital_admin')
      )
    })

    // Special strict rule for cylinder: Only Pegawai Farmasi and Penolong Pegawai Farmasi can issue & approve
    const isCylinderAuthorized = isDirectorOrAdmin || isPharmacyRole

    const updatedFeatures: Record<string, any> = {}
    mod.features.forEach((feat) => {
      if (modCode === 'cylinder') {
        const canApproveFeat = isCylinderAuthorized && feat.supportedActions.includes('approve')
        const canEditFeat = isCylinderAuthorized && feat.supportedActions.includes('edit')
        const canCreateFeat = isDefaultAssigned && feat.supportedActions.includes('create')
        updatedFeatures[feat.code] = {
          view: isDefaultAssigned,
          create: canCreateFeat,
          edit: canEditFeat,
          approve: canApproveFeat,
          delete: isDirectorOrAdmin && feat.supportedActions.includes('delete'),
          export: isCylinderAuthorized && feat.supportedActions.includes('export'),
          admin: isDirectorOrAdmin && feat.supportedActions.includes('admin'),
        }
      } else {
        updatedFeatures[feat.code] = {
          view: isDefaultAssigned,
          create: isDefaultAssigned && feat.supportedActions.includes('create'),
          edit: isDefaultAssigned && feat.supportedActions.includes('edit'),
          approve: isDefaultAssigned && isManagerOrSupervisor && feat.supportedActions.includes('approve'),
          delete: isDefaultAssigned && isDirectorOrAdmin && feat.supportedActions.includes('delete'),
          export: isDefaultAssigned && feat.supportedActions.includes('export'),
          admin: isDefaultAssigned && isDirectorOrAdmin && feat.supportedActions.includes('admin'),
        }
      }
    })

    if (modCode === 'cylinder') {
      roleMatrix[modCode] = {
        view: isDefaultAssigned,
        create: isDefaultAssigned, // All assigned ward roles can request
        edit: isCylinderAuthorized, // Only pharmacy can issue / edit
        approve: isCylinderAuthorized, // Only pharmacy can approve
        delete: isDirectorOrAdmin,
        export: isCylinderAuthorized,
        admin: isDirectorOrAdmin,
        features: updatedFeatures,
      }
    } else {
      roleMatrix[modCode] = {
        view: isDefaultAssigned,
        create: isDefaultAssigned,
        edit: isDefaultAssigned,
        approve: isDefaultAssigned && isManagerOrSupervisor,
        delete: isDefaultAssigned && isDirectorOrAdmin,
        export: isDefaultAssigned,
        admin: isDefaultAssigned && isDirectorOrAdmin && (modCode === 'admin' || modCode === 'hospital_admin'),
        features: updatedFeatures,
      }
    }
  })

  return roleMatrix
}

/**
 * Fetch the master RBAC matrix from Supabase system_settings
 */
export async function fetchRbacMatrix(force = false): Promise<MatrixState> {
  return await useRbacStore.getState().fetchMatrix(force)
}

/**
 * Save master RBAC matrix directly to Supabase system_settings, reactive store, and local storage
 */
export async function saveRbacMatrix(matrix: MatrixState): Promise<void> {
  // 1. Update reactive Zustand store and local cache immediately
  useRbacStore.getState().setMatrix(matrix)

  // 2. Save to Supabase system_settings
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('system_settings')
      .update({
        rbac_matrix: matrix,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'system-settings')

    if (error) {
      console.error('Error persisting rbac_matrix to Supabase:', error)
      throw new Error(`Gagal menyimpan ke pangkalan data: ${error.message}`)
    }
  }
}

/**
 * Get permission matrix for a specific role
 */
export function getRoleMatrixFromMemoryOrCache(roleCode: string): Record<string, RoleModuleMatrix> | null {
  return useRbacStore.getState().getRoleMatrix(roleCode)
}
