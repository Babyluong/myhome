import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Menu, X, User, WifiOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getCurrentModuleInfo, getLastActiveModule } from '@/shared/utils/moduleNavigation'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

interface BottomNavProps {
  onOpenSyncDrawer?: () => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenSyncDrawer }) => {
  const location = useLocation()
  const { toggleSidebar, sidebarOpen, setSidebarOpen } = useSidebar()
  const { isOnline, isSyncing, pendingCount } = useOfflineStatus()
  const { user } = useAuthStore()

  // Track active module so Profile link preserves module context
  const currentModule = useMemo(() => {
    return getCurrentModuleInfo(location.pathname) || getLastActiveModule()
  }, [location.pathname])

  // Is user currently navigating inside a specific module (not Hub and not Profile)
  const isInsideModule = Boolean(
    location.pathname !== '/hub' && 
    location.pathname !== '/' && 
    !location.pathname.startsWith('/profile')
  )

  const isHubActive = location.pathname === '/hub' || location.pathname === '/'
  const isProfileActive = location.pathname.startsWith('/profile')

  return (
    <nav 
      aria-label="Navigasi Mudah Alih"
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40",
        "bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]",
        "transition-all duration-300"
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      {/* Specular hairline top glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent pointer-events-none" />

      <div className="h-16 px-3 flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Hub Tab */}
        <NavLink
          to="/hub"
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false)
          }}
          className="flex-1 max-w-[96px] h-14 flex items-center justify-center relative touch-manipulation group"
        >
          <motion.div
            whileTap={{ scale: 0.90 }}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200",
              isHubActive ? "text-teal-300" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {isHubActive && (
              <motion.div
                layoutId="bottomNavPill"
                className="absolute inset-0 rounded-2xl bg-teal-500/12 border border-teal-500/30 shadow-[0_0_16px_rgba(20,184,166,0.18)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}

            <div className={cn(
              "relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 z-10",
              isHubActive 
                ? "bg-teal-500/20 text-teal-300 scale-105" 
                : "bg-slate-900/60 border border-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-700"
            )}>
              <LayoutGrid className="w-4 h-4" />
              {isHubActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
              )}
            </div>

            <span className={cn(
              "text-[10px] mt-1 tracking-tight z-10 transition-colors",
              isHubActive ? "font-bold text-teal-300" : "font-medium text-slate-400 group-hover:text-slate-200"
            )}>
              Hub
            </span>
          </motion.div>
        </NavLink>

        {/* 2. Menu Modul (Action Center Button) */}
        <div className="flex-1 max-w-[104px] h-14 flex items-center justify-center relative touch-manipulation">
          <motion.button
            type="button"
            onClick={toggleSidebar}
            whileTap={{ scale: 0.90 }}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200 group",
              sidebarOpen ? "text-teal-300" : isInsideModule ? "text-slate-200" : "text-slate-400 hover:text-slate-200"
            )}
            aria-label={sidebarOpen ? "Tutup Menu Modul" : "Buka Menu Modul"}
          >
            {sidebarOpen && (
              <motion.div
                layoutId="bottomNavPill"
                className="absolute inset-0 rounded-2xl bg-teal-500/15 border border-teal-500/40 shadow-[0_0_18px_rgba(20,184,166,0.25)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}

            <div className={cn(
              "relative w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 z-10 shadow-sm",
              sidebarOpen
                ? "bg-teal-500 text-slate-950 font-bold shadow-[0_0_14px_rgba(20,184,166,0.4)] scale-105"
                : isInsideModule
                ? "bg-slate-900 border border-teal-500/35 text-teal-300"
                : "bg-slate-900/80 border border-slate-800 text-slate-300 group-hover:border-slate-700 group-hover:text-white"
            )}>
              <AnimatePresence mode="wait" initial={false}>
                {sidebarOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-4 h-4 stroke-[2.2]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Context indicator if inside a module */}
              {!sidebarOpen && isInsideModule && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950 shadow-[0_0_6px_rgba(45,212,191,0.8)] animate-pulse" />
              )}
            </div>

            <span className={cn(
              "text-[10px] mt-1 tracking-tight z-10 transition-colors flex items-center gap-1",
              sidebarOpen 
                ? "font-bold text-teal-300" 
                : isInsideModule 
                ? "font-semibold text-slate-200" 
                : "font-medium text-slate-400 group-hover:text-slate-200"
            )}>
              {sidebarOpen ? 'Tutup' : 'Menu Modul'}
            </span>
          </motion.button>
        </div>

        {/* 3. Sync / Offline Tab (Only when offline or pending sync) */}
        {((!isOnline || pendingCount > 0 || isSyncing) && onOpenSyncDrawer) && (
          <div className="flex-1 max-w-[96px] h-14 flex items-center justify-center relative touch-manipulation">
            <motion.button
              type="button"
              onClick={onOpenSyncDrawer}
              whileTap={{ scale: 0.90 }}
              className="w-full h-full flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200 group text-amber-400"
              aria-label="Status Penyegerakan"
            >
              <div className="relative w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-xs">
                {!isOnline ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                )}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-[16px] rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-bold text-amber-300 tracking-tight">
                {!isOnline ? 'Luar Talian' : isSyncing ? 'Menyegerak' : 'Sync'}
              </span>
            </motion.button>
          </div>
        )}

        {/* 4. Profil Tab */}
        <NavLink
          to={ROUTES.PROFILE}
          state={currentModule ? { fromModule: currentModule } : undefined}
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false)
          }}
          className="flex-1 max-w-[96px] h-14 flex items-center justify-center relative touch-manipulation group"
        >
          <motion.div
            whileTap={{ scale: 0.90 }}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200",
              isProfileActive ? "text-teal-300" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {isProfileActive && (
              <motion.div
                layoutId="bottomNavPill"
                className="absolute inset-0 rounded-2xl bg-teal-500/12 border border-teal-500/30 shadow-[0_0_16px_rgba(20,184,166,0.18)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}

            <div className={cn(
              "relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 z-10",
              isProfileActive 
                ? "bg-teal-500/20 text-teal-300 scale-105 ring-2 ring-teal-500/40 ring-offset-2 ring-offset-slate-950" 
                : "bg-slate-900/60 border border-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-700"
            )}>
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={user.full_name || "Profile"}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}

              {/* Online indicator dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>

            <span className={cn(
              "text-[10px] mt-1 tracking-tight z-10 transition-colors",
              isProfileActive ? "font-bold text-teal-300" : "font-medium text-slate-400 group-hover:text-slate-200"
            )}>
              Profil
            </span>
          </motion.div>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNav
