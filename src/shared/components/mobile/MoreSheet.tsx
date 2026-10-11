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
  ChevronRight,
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
        {/* Unified Profile & Active Module Header */}
        <div className="rounded-2xl border border-border-default bg-surface shadow-xs overflow-hidden">
          {/* User Row */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-accent-subtle border border-accent-base/20 flex items-center justify-center font-bold text-accent-base text-sm select-none">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-text-primary truncate leading-tight">
                {user?.full_name || 'Staff User'}
              </div>
              <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-accent-base flex-shrink-0" />
                <span className="truncate font-medium uppercase tracking-wide">
                  {user?.role?.role_name ||
                    user?.role?.role_code?.toUpperCase() ||
                    'STAFF'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="px-2.5 py-1.5 text-xs font-semibold bg-subtle hover:bg-subtle/80 border border-border-default rounded-lg text-text-primary hover:text-accent-base flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
            >
              <User className="w-3 h-3 text-text-muted" />
              <span>Profile</span>
            </button>
          </div>

          {/* Active Module Sub-strip (Seamless Context) */}
          {currentModule && (
            <div className="px-3.5 py-2 bg-subtle/40 border-t border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Active:
                </span>
                <span className="font-semibold text-text-primary truncate">
                  {currentModule.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/hub')}
                className="text-[11px] font-medium text-text-muted hover:text-accent-base flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-surface border border-transparent hover:border-border-default transition-all active:scale-95 flex-shrink-0"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>
          )}
        </div>

        {/* Complete Module Menus */}
        <MobileModuleNavList
          moduleCode={normalizedModuleCode}
          currentModuleTitle={currentModule?.name}
          userRole={userRole}
          user={user}
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />

        {/* System Tools Group */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-0.5">
            System Tools
          </div>
          <div className="rounded-xl border border-border-default bg-surface divide-y divide-border-subtle overflow-hidden">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light')
                toggleTheme()
              }}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-text-primary hover:bg-subtle active:bg-subtle transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-subtle flex items-center justify-center text-accent-base flex-shrink-0">
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="font-medium">Appearance Theme</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-subtle text-text-muted border border-border-subtle capitalize">
                {theme}
              </span>
            </button>

            {onOpenSyncDrawer && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light')
                  onClose()
                  onOpenSyncDrawer()
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-text-primary hover:bg-subtle active:bg-subtle transition-colors text-left"
              >
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-subtle flex items-center justify-center text-accent-base flex-shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Offline Data & Sync</span>
                </span>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigate('/hub')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-text-primary hover:bg-subtle active:bg-subtle transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-subtle flex items-center justify-center text-accent-base flex-shrink-0">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Module Hub Directory</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] text-text-muted">
                <span>All Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Dignified Sign Out Action */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/8 hover:bg-red-500/12 active:bg-red-500/16 border border-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
