import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useRbacStore } from '@/stores/rbacStore'
import { SYSTEM_MODULE_REGISTRY, ActionType } from '@/shared/constants/moduleRegistry'
import { SYSTEM_ROLES } from '@/shared/constants/roles'
import { isCylinderAuthorizedOfficer } from '@/shared/utils/cylinderRbac'

export interface UserPermissionContext {
  isSuperAdmin: boolean
  isHospitalAdmin: boolean
  userRoleCode: string
  userDepartmentId?: string
  isRbacLoading: boolean
  isRbacLoaded: boolean
  canAccessModule: (moduleCode: string) => boolean
  hasPermission: (moduleCode: string, action: ActionType, featureCode?: string) => boolean
  getAccessibleModules: () => string[]
  canApproveCylinder: boolean
  canIssueCylinder: boolean
}

/**
 * Hook for fine-grained Role-Based and Action-Based Access Control (RBAC & PBAC)
 * Reactively subscribes to useRbacStore for live database sync across devices.
 */
export function usePermission(): UserPermissionContext {
  const { user } = useAuthStore()
  const rbacMatrix = useRbacStore((state) => state.matrix)
  const isRbacLoading = useRbacStore((state) => state.isLoading)
  const isRbacLoaded = useRbacStore((state) => state.isLoaded)
  const getRoleMatrix = useRbacStore((state) => state.getRoleMatrix)

  const userRoleCode = useMemo(() => {
    return (user?.role?.role_code || (user as any)?.role_code || 'staff').toLowerCase().trim()
  }, [user])

  const isSuperAdmin = useMemo(() => {
    if (!user) return false
    const role = userRoleCode
    const name = (user.role?.role_name || '').toLowerCase()
    return (
      role === SYSTEM_ROLES.SYSTEM_ADMIN ||
      role === 'superadmin' ||
      role === 'super_admin' ||
      name.includes('system admin') ||
      name.includes('superadmin') ||
      name.includes('super admin')
    )
  }, [user, userRoleCode])

  const isHospitalAdmin = useMemo(() => {
    if (!user) return false
    const role = userRoleCode
    return (
      isSuperAdmin ||
      role === SYSTEM_ROLES.HOSPITAL_ADMIN ||
      role === SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR ||
      role === 'hospital_admin' ||
      role === 'hospital_administrator'
    )
  }, [user, userRoleCode, isSuperAdmin])

  /**
   * Check whether the user's role can access a specific module
   */
  const canAccessModule = useMemo(() => {
    return (moduleCode: string): boolean => {
      if (!user) return false
      if (isSuperAdmin) return true

      const normalizedCode = (moduleCode || '').toLowerCase().trim().replace(/\/$/, '')
      const moduleDef = SYSTEM_MODULE_REGISTRY.find((m) => {
        const mCode = m.code.toLowerCase()
        const mName = m.name.toLowerCase()
        const mPath = (m.routePath || '').toLowerCase().replace(/\/$/, '')
        return (
          mCode === normalizedCode ||
          mName === normalizedCode ||
          mPath === normalizedCode ||
          (mPath && (normalizedCode.startsWith(mPath + '/') || normalizedCode === mPath))
        )
      })

      if (!moduleDef) {
        // Fallback for dynamic future routes
        return true
      }

      const modKey = moduleDef.code.toLowerCase()

      // 1. Check stored custom permissions from Supabase database / local cache via rbacStore
      const roleMatrix = getRoleMatrix(userRoleCode) || (user?.role_id ? getRoleMatrix(user.role_id) : null)
      if (roleMatrix && roleMatrix[modKey]) {
        const modSetting = roleMatrix[modKey]
        if (typeof modSetting.view === 'boolean') {
          return modSetting.view
        }
      }

      // 2. Check default assigned roles from SYSTEM_MODULE_REGISTRY (with alias tolerance)
      const hasDefaultRole = moduleDef.defaultRoles.some((r) => {
        const nr = r.toLowerCase().trim()
        return (
          nr === userRoleCode ||
          (userRoleCode === 'assistant_pharmacist' && nr === 'pharmacy_assistant') ||
          (userRoleCode === 'pharmacy_assistant' && nr === 'assistant_pharmacist') ||
          (userRoleCode === 'hospital_admin' && nr === 'hospital_administrator') ||
          (userRoleCode === 'hospital_administrator' && nr === 'hospital_admin')
        )
      })

      if (hasDefaultRole) return true

      return false
    }
  }, [user, isSuperAdmin, userRoleCode, rbacMatrix, getRoleMatrix])

  /**
   * Check whether the user has a specific granular capability (e.g. approve, edit, export, delete)
   */
  const hasPermission = useMemo(() => {
    return (moduleCode: string, action: ActionType, featureCode?: string): boolean => {
      if (!user) return false
      if (isSuperAdmin) return true

      const normalizedModule = moduleCode.toLowerCase().trim()

      // First check if user can access the module at all
      if (!canAccessModule(normalizedModule)) {
        return false
      }

      // System Admins and Hospital Admins have high privileges in administrative modules
      if (isHospitalAdmin && (normalizedModule === 'admin' || action === 'view')) {
        return true
      }

      // Pharmacy Director and Pharmacy Manager have full approval privileges in pharmacy modules
      const isPharmacyLead =
        userRoleCode === SYSTEM_ROLES.PHARMACY_DIRECTOR ||
        userRoleCode === SYSTEM_ROLES.PHARMACY_MANAGER

      if (isPharmacyLead && ['pharmacy_logistics', 'inventory', 'cylinder', 'mysuhu', 'myformulari'].includes(normalizedModule)) {
        return true
      }

      // Transport Admin has approval privileges in transport
      if (userRoleCode === SYSTEM_ROLES.TRANSPORT_ADMIN && normalizedModule === 'mytransporter') {
        return true
      }

      // Strict RBAC Mandate: Only Pegawai Farmasi and Penolong Pegawai Farmasi can approve or issue/edit cylinders
      if (normalizedModule === 'cylinder') {
        const isAuthorizedCylinderOfficer = isCylinderAuthorizedOfficer(user)
        if (action === 'approve' || action === 'edit') {
          return isAuthorizedCylinderOfficer
        }
        if (action === 'delete') {
          return isHospitalAdmin || (isAuthorizedCylinderOfficer && userRoleCode.includes('director'))
        }
        if (action === 'create' || action === 'view') {
          return true
        }
      }

      // Check custom role matrix from database cache / local overrides
      const roleMatrix = getRoleMatrix(userRoleCode) || (user?.role_id ? getRoleMatrix(user.role_id) : null)
      if (roleMatrix && roleMatrix[normalizedModule]) {
        if (featureCode && roleMatrix[normalizedModule].features?.[featureCode]) {
          const featAction = roleMatrix[normalizedModule].features?.[featureCode]?.[action]
          if (typeof featAction === 'boolean') return featAction
        }
        const modAction = roleMatrix[normalizedModule][action]
        if (typeof modAction === 'boolean') return modAction
      }

      // Default baseline capabilities per action
      switch (action) {
        case 'view':
          return true
        case 'create':
        case 'edit':
          // Standard staff and above can create/edit within their assigned modules
          return true
        case 'approve':
          // Approvals are strictly reserved for lead/manager/admin roles
          return isHospitalAdmin || isPharmacyLead || userRoleCode.includes('manager') || userRoleCode.includes('director') || userRoleCode.includes('admin')
        case 'delete':
          return isHospitalAdmin || isPharmacyLead || userRoleCode.includes('admin')
        case 'export':
          return true
        case 'admin':
          return isSuperAdmin || (isHospitalAdmin && normalizedModule === 'admin')
        default:
          return false
      }
    }
  }, [user, isSuperAdmin, isHospitalAdmin, userRoleCode, canAccessModule, rbacMatrix, getRoleMatrix])

  const canCylinderOfficer = useMemo(() => {
    return isCylinderAuthorizedOfficer(user)
  }, [user])

  const getAccessibleModules = useMemo(() => {
    return (): string[] => {
      return SYSTEM_MODULE_REGISTRY.filter((m) => canAccessModule(m.code)).map((m) => m.code)
    }
  }, [canAccessModule])

  return {
    isSuperAdmin,
    isHospitalAdmin,
    userRoleCode,
    userDepartmentId: user?.department_id,
    isRbacLoading,
    isRbacLoaded,
    canAccessModule,
    hasPermission,
    getAccessibleModules,
    canApproveCylinder: canCylinderOfficer,
    canIssueCylinder: canCylinderOfficer,
  }
}

export default usePermission
