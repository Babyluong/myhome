import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { usePermission } from '@/shared/hooks/usePermission'
import { ROUTES } from '@/lib/constants'
import { LoadingOverlay } from '@/components/ui'
import { ActionType } from '@/shared/constants/moduleRegistry'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requiredModule?: string
  requiredAction?: ActionType
  departmentCheck?: (user: any) => boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredModule,
  requiredAction = 'view',
  departmentCheck,
  redirectTo,
}) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { isSuperAdmin, canAccessModule, hasPermission, isRbacLoading, isRbacLoaded } = usePermission()

  // Show loading while checking auth or waiting for initial database RBAC matrix sync
  if (isLoading || (isRbacLoading && !isRbacLoaded)) {
    return <LoadingOverlay fullScreen message="Memeriksa pengesahan dan kebenaran capaian..." />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Super Admin bypasses all route restrictions
  if (isSuperAdmin) {
    return <>{children}</>
  }

  const userRoleCode = (user?.role?.role_code || (user as any)?.role_code || '').toLowerCase().trim()

  // Target module is either explicitly passed or inferred from the current URL path
  const targetModule = requiredModule || location.pathname

  // 1. Check dynamic module accessibility via RBAC (which checks Supabase DB matrix & central module registry)
  const isModuleAllowed = canAccessModule(targetModule)

  // 2. Check explicit allowedRoles whitelist if provided
  const isRoleExplicitlyAllowed = allowedRoles && allowedRoles.length > 0
    ? allowedRoles.some((r) => {
        const nr = r.toLowerCase().trim()
        return (
          nr === userRoleCode ||
          (userRoleCode === 'assistant_pharmacist' && nr === 'pharmacy_assistant') ||
          (userRoleCode === 'pharmacy_assistant' && nr === 'assistant_pharmacist') ||
          (userRoleCode === 'hospital_admin' && nr === 'hospital_administrator') ||
          (userRoleCode === 'hospital_administrator' && nr === 'hospital_admin')
        )
      })
    : undefined

  // 3. Fine-grained action check if requiredAction is not default 'view'
  if (requiredAction !== 'view') {
    if (!hasPermission(targetModule, requiredAction)) {
      return (
        <Navigate
          to={ROUTES.UNAUTHORIZED}
          state={{
            attemptedPath: location.pathname,
            moduleName: targetModule,
            requiredRole: allowedRoles?.join(', '),
          }}
          replace
        />
      )
    }
    return <>{children}</>
  }

  // 4. Determine overall view authorization:
  // - If allowedRoles was specified, grant access if either the role is in allowedRoles OR dynamic RBAC grants module access
  // - If allowedRoles was not specified, enforce dynamic RBAC module access
  const hasAccess = isRoleExplicitlyAllowed !== undefined
    ? (isRoleExplicitlyAllowed || isModuleAllowed)
    : isModuleAllowed

  if (!hasAccess) {
    return (
      <Navigate
        to={ROUTES.UNAUTHORIZED}
        state={{
          attemptedPath: location.pathname,
          requiredRole: allowedRoles?.join(', ') || 'Had Kuasa Peranan Diperlukan',
          moduleName: targetModule,
        }}
        replace
      />
    )
  }

  // 5. Department-level guard (e.g. Pharmacy Logistics master catalog restriction)
  if (departmentCheck && !departmentCheck(user)) {
    return (
      <Navigate
        to={redirectTo || ROUTES.PHARMACY_INVENTORY || '/pharmacy/inventory'}
        state={{
          attemptedPath: location.pathname,
          unauthorizedDepartment: true,
          requiredRole: 'Pharmacy Logistics Only',
        }}
        replace
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
