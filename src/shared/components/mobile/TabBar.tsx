import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Activity,
  FileText,
  Boxes,
  Thermometer,
  Key,
  Users,
  Truck,
  Pill,
  DollarSign,
  Calendar,
  Sliders,
  Clock,
  PersonStanding,
  ShieldCheck,
  ShoppingCart,
  Building2,
  Package,
  MoreHorizontal,
  WifiOff,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getCurrentModuleInfo } from '@/shared/utils/moduleNavigation'
import { getMobileTabsForModule, MobileTabItem } from '@/shared/config/mobileTabs'
import { useAuthStore } from '@/stores/authStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useHaptic } from '@/shared/hooks/useHaptic'

interface TabBarProps {
  onOpenMore: () => void
  isMoreOpen?: boolean
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutGrid,
  Activity,
  FileText,
  Boxes,
  Thermometer,
  Key,
  Users,
  Truck,
  Pill,
  DollarSign,
  Calendar,
  Sliders,
  Clock,
  PersonStanding,
  ShieldCheck,
  ShoppingCart,
  Building2,
  Package,
}

export const TabBar: React.FC<TabBarProps> = ({ onOpenMore, isMoreOpen = false }) => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { isOnline } = useOfflineStatus()
  const { triggerHaptic } = useHaptic()

  const currentModule = useMemo(() => {
    return getCurrentModuleInfo(location.pathname)
  }, [location.pathname])

  const contextTabs = useMemo(() => {
    return getMobileTabsForModule(currentModule?.code, user?.role?.role_code)
  }, [currentModule?.code, user?.role?.role_code])

  const isHubActive = location.pathname === '/hub' || location.pathname === '/'

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40",
        "bg-surface/95 backdrop-blur-md border-t border-border-default",
        "transition-colors duration-150"
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="h-14 px-2 flex items-center justify-around max-w-lg mx-auto relative">
        {/* Hub Tab */}
        <NavLink
          to="/hub"
          onClick={() => triggerHaptic('light')}
          className="flex-1 max-w-[80px] h-12 flex items-center justify-center relative touch-manipulation group"
        >
          {({ isActive }) => {
            const active = isActive || isHubActive
            return (
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center rounded-xl relative transition-colors",
                  active ? "text-accent-base font-semibold" : "text-text-muted hover:text-text-primary"
                )}
              >
                <div className={cn("relative p-1 rounded-lg transition-colors", active && "bg-accent-subtle")}>
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">Hub</span>
              </motion.div>
            )
          }}
        </NavLink>

        {/* Dynamic Context Tabs for Active Module */}
        {contextTabs.map((tab: MobileTabItem) => {
          const IconComp = ICON_MAP[tab.icon] || FileText
          const isTabActive = tab.exact 
            ? location.pathname === tab.to 
            : location.pathname.startsWith(tab.to)

          return (
            <NavLink
              key={tab.id}
              to={tab.to}
              onClick={() => triggerHaptic('light')}
              className="flex-1 max-w-[80px] h-12 flex items-center justify-center relative touch-manipulation group"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center rounded-xl relative transition-colors",
                  isTabActive ? "text-accent-base font-semibold" : "text-text-muted hover:text-text-primary"
                )}
              >
                <div className={cn("relative p-1 rounded-lg transition-colors", isTabActive && "bg-accent-subtle")}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{tab.label}</span>
              </motion.div>
            </NavLink>
          )
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light')
            onOpenMore()
          }}
          className="flex-1 max-w-[80px] h-12 flex items-center justify-center relative touch-manipulation group"
          aria-label="Open More Menu"
        >
          <motion.div
            whileTap={{ scale: 0.92 }}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center rounded-xl relative transition-colors",
              isMoreOpen ? "text-accent-base font-semibold" : "text-text-muted hover:text-text-primary"
            )}
          >
            <div className={cn("relative p-1 rounded-lg transition-colors", isMoreOpen && "bg-accent-subtle")}>
              <MoreHorizontal className="w-5 h-5" />
              {!isOnline && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </motion.div>
        </button>
      </div>
    </nav>
  )
}
