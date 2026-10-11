import React, { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  User,
  Shield,
  LayoutGrid,
} from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { MobileModuleNavList } from './MobileModuleNavList'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/shared/stores/uiStore'
import {
  getCurrentModuleInfo,
  getLastActiveModule,
  normalizeSidebarModuleCode,
} from '@/shared/utils/moduleNavigation'
import { useHaptic } from '@/shared/hooks/useHaptic'

interface MoreSheetProps {
  isOpen: boolean
  onClose: () => void
  onOpenSyncDrawer?: () => void
}

export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  onOpenSyncDrawer,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const { triggerHaptic } = useHaptic()

  const currentModule = useMemo(() => {
    return getCurrentModuleInfo(location.pathname) || getLastActiveModule()
  }, [location.pathname])

  const normalizedModuleCode = useMemo(() => {
    return currentModule ? normalizeSidebarModuleCode(currentModule.code) : null
  }, [currentModule])

  const userRole = (
    user?.role?.role_code ||
    (user as any)?.role_code ||
    (typeof user?.role === 'string' ? user?.role : '') ||
    user?.jawatan ||
    ''
  ).toLowerCase()

  const handleNavigate = (path: string) => {
    triggerHaptic('light')
    onClose()
    navigate(path)
  }

  const handleLogout = async () => {
    triggerHaptic('warning')
    onClose()
    logout()
    navigate('/login')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Navigation & Settings" maxHeight="max-h-[90vh]">
      <div className="space-y-4">
        {/* User Card */}
        <div className="p-3 bg-subtle rounded-xl border border-border-default flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface border border-border-default flex items-center justify-center font-bold text-accent-base flex-shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs sm:text-sm text-text-primary truncate">
              {user?.full_name || 'Staff User'}
            </div>
            <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-accent-base flex-shrink-0" />
              <span className="truncate">
                {user?.role?.role_name?.toUpperCase() ||
                  user?.role?.role_code?.toUpperCase() ||
                  'STAFF'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNavigate('/profile')}
            className="px-2.5 py-1 text-xs font-semibold bg-surface border border-border-default rounded-lg hover:border-border-strong text-text-primary flex-shrink-0"
          >
            Profile
          </button>
        </div>

        {/* Current Module Context Card */}
        {currentModule && (
          <div className="p-3 bg-surface border border-border-default rounded-xl">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Active Module
            </div>
            <div className="text-sm font-semibold text-text-primary flex items-center justify-between">
              <span className="text-accent-base">{currentModule.name}</span>
              <button
                type="button"
                onClick={() => handleNavigate('/hub')}
                className="text-xs text-text-muted hover:text-accent-base font-medium flex items-center gap-1 bg-subtle px-2 py-1 rounded-md border border-border-default transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Hub
              </button>
            </div>
          </div>
        )}

        {/* Complete Module Menus (Accessible on Mobile) */}
        <MobileModuleNavList
          moduleCode={normalizedModuleCode}
          currentModuleTitle={currentModule?.name}
          userRole={userRole}
          user={user}
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />

        {/* Quick Actions List */}
        <div className="space-y-1 pt-1 border-t border-border-default/60">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
            System Tools
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light')
              toggleTheme()
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-subtle flex items-center justify-between text-xs text-text-primary transition-colors text-left border border-transparent hover:border-border-default"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-accent-base" />
              ) : (
                <Sun className="w-4 h-4 text-accent-base" />
              )}
              Appearance Theme
            </span>
            <span className="text-[11px] text-text-muted capitalize">{theme}</span>
          </button>

          {onOpenSyncDrawer && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light')
                onClose()
                onOpenSyncDrawer()
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-subtle flex items-center justify-between text-xs text-text-primary transition-colors text-left border border-transparent hover:border-border-default"
            >
              <span className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-accent-base" />
                Offline Data & Sync
              </span>
              <span className="text-[11px] text-text-muted">Manage</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavigate('/hub')}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-subtle flex items-center justify-between text-xs text-text-primary transition-colors text-left border border-transparent hover:border-border-default"
          >
            <span className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-accent-base" />
              Module Hub Directory
            </span>
            <span className="text-[11px] text-text-muted">All Modules</span>
          </button>
        </div>

        {/* Logout */}
        <div className="pt-2 border-t border-border-default">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 text-xs font-semibold transition-colors border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
