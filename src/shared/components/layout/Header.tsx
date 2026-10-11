import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, Settings, Home, Wifi, WifiOff, RefreshCw, Sun, Moon, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Avatar, Badge } from '@/components/ui'
import { SYSTEM_ROLES, MODULE_DEFINITIONS, ROLE_DISPLAY_NAMES, ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { LanguageSelector } from '@/shared/components/LanguageSelector'
import { getCurrentModuleInfo, getLastActiveModule } from '@/shared/utils/moduleNavigation'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

/**
 * Get module name from user role
 */
const getModuleFromRole = (roleCode?: string): string | null => {
  if (!roleCode) return null

  // Pharmacy roles
  if ([
    SYSTEM_ROLES.PHARMACY_DIRECTOR,
    SYSTEM_ROLES.PHARMACY_MANAGER,
    SYSTEM_ROLES.PHARMACIST,
    SYSTEM_ROLES.PHARMACY_ASSISTANT,
    SYSTEM_ROLES.ASSISTANT_PHARMACIST,
    SYSTEM_ROLES.PHARMACY_STOREKEEPER,
    SYSTEM_ROLES.PHARMACY_STAFF,
  ].includes(roleCode as any)) {
    return 'MyWarrant'
  }

  // System Admin
  if (roleCode === SYSTEM_ROLES.SYSTEM_ADMIN) {
    return 'System Administration'
  }

  // Hospital Admin
  if (roleCode === SYSTEM_ROLES.HOSPITAL_ADMIN) {
    return 'Hospital Administration'
  }

  return null
}

interface HeaderProps {
  onOpenSyncDrawer?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenSyncDrawer }) => {
  const { isOnline, isSyncing, pendingCount } = useOfflineStatus()
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Determine current module
  const currentModule = useMemo(() => {
    if (location.pathname === '/hub' || location.pathname === '/') {
      return { name: 'Module Hub', code: 'hub' }
    }
    const routeModule = getCurrentModuleInfo(location.pathname)
    if (routeModule) return routeModule

    // Check if we came from a specific module via navigation state (e.g. from profile click)
    const state = location.state as any
    if (state && typeof state === 'object' && state.fromModule) {
      return state.fromModule
    }

    // Check stored last active module fallback
    const lastActive = getLastActiveModule()
    if (lastActive) {
      return lastActive
    }

    return { name: getModuleFromRole(user?.role?.role_code) || 'HOME System', code: undefined }
  }, [location.pathname, location.state, user?.role?.role_code])

  // Get role display name
  const roleDisplayName = useMemo(() => {
    const roleCode = user?.role?.role_code
    if (!roleCode) return 'User'

    return ROLE_DISPLAY_NAMES[roleCode] || user?.role?.role_name || 'User'
  }, [user?.role])

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-b border-border-default text-text-primary z-30 transition-colors duration-150 header-safe-pt">
      <div className="h-14 sm:h-20 lg:h-24 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side - Official Government Branding */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
          {/* Jata Negara & Branding - Clickable to return home */}
          <div 
            className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 cursor-pointer group min-w-0"
            onClick={() => navigate('/')}
            title="Return to Main Hub"
          >
            <div className="relative flex-shrink-0 flex items-center">
              <img
                src="/512px-Jata_MalaysiaV2.svg.png"
                alt="Jata Negara Malaysia"
                className="w-8 h-8 sm:w-11 sm:h-11 lg:w-14 lg:h-14 object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold tracking-tight text-text-primary group-hover:text-accent-base transition-colors whitespace-nowrap leading-tight">
                  H.O.M.E.
                </h1>
                {/* Tablet / Small Laptop Active Module Indicator */}
                <span className="hidden sm:inline-flex xl:hidden items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-subtle text-accent-base border border-accent-base/25 truncate max-w-[180px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-base animate-pulse mr-1.5 flex-shrink-0" />
                  {currentModule.name}
                </span>
              </div>

              {/* Mobile Active Module Display (Dedicated line on mobile: clear, un-squeezed, prominent) */}
              <div className="sm:hidden flex items-center min-w-0 mt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent-subtle text-accent-base border border-accent-base/30 max-w-[170px] xs:max-w-[210px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-base animate-pulse flex-shrink-0" />
                  <span className="truncate">{currentModule.name}</span>
                </span>
              </div>

              <p className="hidden md:block text-[11px] lg:text-xs text-text-secondary font-medium leading-tight tracking-wide group-hover:text-text-primary transition-colors truncate">
                Hospital Operation &amp; Management Ecosystem
              </p>
              <p className="hidden md:block text-[9px] lg:text-[10px] text-accent-base font-semibold leading-tight mt-0.5 uppercase tracking-[0.15em] truncate">
                {t('system.ministry', 'MINISTRY OF HEALTH MALAYSIA')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden xl:block w-px h-10 bg-border-default mx-1 flex-shrink-0" />

          {/* Module & Role Info */}
          <div className="hidden xl:flex flex-col gap-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">MODULE:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-subtle text-accent-base border border-accent-base/25">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-base animate-pulse mr-1.5" />
                {currentModule.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">ROLE:</span>
              <span className="text-xs font-medium text-text-secondary bg-subtle px-2.5 py-0.5 rounded-md border border-border-default truncate max-w-[180px]">
                {roleDisplayName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Home / Landing Page - Desktop & Tablet */}
          <button 
            onClick={() => navigate('/')}
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center text-text-muted hover:text-text-primary hover:bg-subtle active:bg-muted-surface border border-transparent hover:border-border-default rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex-shrink-0 min-h-[44px] min-w-[44px]"
            title="Return to Main Hub"
            aria-label="Return to Main Hub"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Theme Switcher Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-subtle active:bg-muted-surface border border-transparent hover:border-border-default rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex-shrink-0 min-h-[44px] min-w-[44px]"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 hover:rotate-45 transition-transform duration-200" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary hover:-rotate-12 transition-transform duration-200" />
            )}
          </button>

          {/* Search - Hidden on small mobile */}
          <button 
            onClick={() => navigate(ROUTES.HUB)}
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center text-text-muted hover:text-text-primary hover:bg-subtle active:bg-muted-surface border border-transparent hover:border-border-default rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex-shrink-0 min-h-[44px] min-w-[44px]"
            title="Search modules"
            aria-label="Search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Network & Offline Sync Status Indicator */}
          <button
            onClick={onOpenSyncDrawer}
            className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg transition-colors duration-150 active:scale-95 flex-shrink-0 min-h-[44px] min-w-[44px] border ${
              !isOnline
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : isSyncing
                ? 'bg-accent-subtle text-accent-base border-accent-base/30 hover:bg-accent-subtle/80'
                : 'text-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-subtle border-transparent hover:border-border-default'
            }`}
            title={
              !isOnline
                ? `Offline Mode: ${pendingCount} pending records waiting to sync`
                : isSyncing
                ? 'Syncing records to database...'
                : 'Connected to database'
            }
            aria-label="Network Sync Status"
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : isSyncing ? (
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 border border-surface shadow-xs">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button 
            className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-subtle active:bg-muted-surface border border-transparent hover:border-border-default rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex-shrink-0 min-h-[44px] min-w-[44px]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          </button>

          {/* Language Selector */}
          <div className="hidden xs:block bg-subtle border border-border-default rounded-lg p-0.5 flex-shrink-0">
            <LanguageSelector variant="header" />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border-default flex-shrink-0" />

          {/* User Profile Trigger */}
          <button
            onClick={() => navigate(ROUTES.PROFILE, { state: { fromModule: currentModule } })}
            className="flex items-center gap-2 sm:gap-3 hover:bg-subtle active:bg-muted-surface border border-transparent hover:border-border-default rounded-lg px-1.5 sm:px-2.5 py-1.5 transition-colors duration-150 group flex-shrink-0 min-h-[44px]"
            aria-label="User Profile"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-text-primary group-hover:text-accent-base transition-colors">
                {user?.full_name}
              </p>
              <p className="text-[11px] text-text-muted">
                {user?.hospital?.hospital_name || 'Hospital'}
              </p>
            </div>
            <Avatar
              src={user?.profile_photo_url}
              name={user?.full_name}
              size="sm"
              className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-accent-base/20 group-hover:ring-accent-base/40 transition-colors duration-150 flex-shrink-0"
            />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

