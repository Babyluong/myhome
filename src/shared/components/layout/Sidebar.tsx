import React, { useMemo, useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useSidebar } from '@/stores/uiStore'
import { Avatar } from '@/components/ui'
import { PendingSyncBadge } from '@/shared/components/ui/PendingSyncBadge'
import { APP_NAME, ROUTES, SYSTEM_ROLES } from '@/lib/constants'
import { logout } from '@/services/authService'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import {
  getCurrentModuleInfo,
  normalizeSidebarModuleCode,
  getLastActiveModule,
  type SidebarModuleCode,
} from '@/shared/utils/moduleNavigation'
import {
  type NavItem,
  getModuleNavItems,
  PHARMACY_ROLES,
} from '@/shared/config/navigationConfig'
const getActiveModule = (pathname: string, userRole?: string, locationState?: any): SidebarModuleCode => {
  // 1. Direct path matching
  const routeModule = getCurrentModuleInfo(pathname)
  if (routeModule) {
    const normalized = normalizeSidebarModuleCode(routeModule.code)
    if (normalized) return normalized
  }

  // 2. Navigation state fallback (passed from Profile / shared nav on desktop or mobile)
  if (locationState && typeof locationState === 'object' && locationState.fromModule?.code) {
    const normalized = normalizeSidebarModuleCode(locationState.fromModule.code)
    if (normalized) return normalized
  }

  // 3. Stored last active module (persisted in session/local storage)
  const lastActive = getLastActiveModule()
  if (lastActive?.code) {
    const normalized = normalizeSidebarModuleCode(lastActive.code)
    if (normalized) return normalized
  }

  // 4. Role-based fallback
  const cleanRole = (userRole || '').toLowerCase()
  if ([
    SYSTEM_ROLES.SYSTEM_ADMIN,
    SYSTEM_ROLES.HOSPITAL_ADMIN,
    SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR,
  ].some((r) => cleanRole.includes(r.toLowerCase()))) {
    return 'admin'
  }

  if (PHARMACY_ROLES.some((r) => cleanRole.includes(r.toLowerCase()))) {
    return 'pharmacy'
  }

  return 'staff'
}


export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { user, logout: storeLogout } = useAuthStore()
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useSidebar()
  const { language, t } = useLanguage()
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false))

  const userRole = (
    user?.role?.role_code ||
    (user as any)?.role_code ||
    (typeof user?.role === 'string' ? user?.role : '') ||
    user?.jawatan ||
    ''
  ).toLowerCase()

  const [transporterCounts, setTransporterCounts] = useState({
    myRequests: 0,
    driverPanel: 0,
    adminApproval: 0
  })

  const [porterCounts, setPorterCounts] = useState({
    myRequests: 0,
    driverPanel: 0,
    receiver: 0,
    manager: 0
  })

  const [priviledgingCounts, setPriviledgingCounts] = useState({
    pendingReviews: 0,
    changesRequested: 0
  })

  const [tempahanPendingCount, setTempahanPendingCount] = useState(0)

  const [priviledgingMode, setPriviledgingMode] = useState<'staff' | 'admin'>(() => {
    try {
      const mode = localStorage.getItem('home_mypriviledging_role_mode')
      if (mode === 'admin') return 'admin'
      if (mode === 'staff') return 'staff'
    } catch {}
    if (userRole && [
      SYSTEM_ROLES.SYSTEM_ADMIN,
      SYSTEM_ROLES.HOSPITAL_ADMIN,
      SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR,
      'admin',
      'superadmin'
    ].includes(userRole as any)) {
      return 'admin'
    }
    return 'staff'
  })

  useEffect(() => {
    const handlePriviledgingModeChange = (e: any) => {
      if (e.detail === 'admin' || e.detail === 'staff') {
        setPriviledgingMode(e.detail)
      }
    }
    window.addEventListener('priviledging_mode_change', handlePriviledgingModeChange)
    return () => window.removeEventListener('priviledging_mode_change', handlePriviledgingModeChange)
  }, [])

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchCounts = async () => {
      try {
        const { getRequests } = await import('@/modules/mytransporter/services/transporterService')
        const res = await getRequests()
        if (res.data && isMounted) {
          const list = res.data
          const myRequestsCount = list.filter(r => r.pemohon_id === user.id && r.status_semasa === 'draft').length
          const driverPanelCount = list.filter(r => r.status_semasa === 'submitted' || r.status_semasa === 'driver_rejected').length
          const adminApprovalCount = list.filter(r => r.status_semasa === 'driver_accepted').length

          setTransporterCounts({
            myRequests: myRequestsCount,
            driverPanel: driverPanelCount,
            adminApproval: adminApprovalCount
          })
        }

        const { getPorterJobs } = await import('@/modules/myporter/services/porterService')
        const porterRes = await getPorterJobs()
        if (porterRes.data && isMounted) {
          const pList = porterRes.data
          const myActive = pList.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length
          const poolCount = pList.filter(j => j.status === 'broadcasting').length
          const receiverCount = pList.filter(j => j.status === 'pending_receiver_confirmation' || j.status === 'at_destination').length
          const statCount = pList.filter(j => j.urgency === 'stat' && j.status !== 'completed' && j.status !== 'cancelled').length

          setPorterCounts({
            myRequests: myActive,
            driverPanel: poolCount,
            receiver: receiverCount,
            manager: statCount
          })
        }

        const { priviledgingService } = await import('@/modules/mypriviledging/services/priviledgingService')
        if (isMounted) {
          const kpis = priviledgingService.getKpis()
          setPriviledgingCounts({
            pendingReviews: kpis.pendingSubmissions,
            changesRequested: kpis.changesRequestedSubmissions
          })
        }

        const { getBookings } = await import('@/modules/mytempahan/services/tempahanService')
        const tempahanRes = await getBookings()
        if (tempahanRes.data && isMounted) {
          const pending = tempahanRes.data.filter(b => b.status === 'pending').length
          setTempahanPendingCount(pending)
        }
      } catch (err) {
        console.error('Error fetching sidebar counts:', err)
      }
    }

    fetchCounts()

    const interval = setInterval(fetchCounts, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user, location.pathname])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const prevPathnameRef = useRef(location.pathname)

  // Auto-close sidebar on mobile ONLY when navigating to a new route
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname
      if (isMobile) {
        setSidebarOpen(false)
      }
    }
  }, [location.pathname, isMobile, setSidebarOpen])
  
  // Memoize filtered navigation to prevent unnecessary recalculations
  const filteredNavigation = useMemo(() => {
    const activeModule = getActiveModule(location.pathname, userRole, location.state)
    return getModuleNavItems(activeModule, userRole, user, priviledgingMode)
  }, [userRole, user, location.pathname, location.state, priviledgingMode])

  const currentModuleInfo = useMemo(() => {
    return getCurrentModuleInfo(location.pathname) || getLastActiveModule()
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    storeLogout()
  }

  // Memoize current pathname to prevent unnecessary recalculations
  const currentPath = useMemo(() => location.pathname, [location.pathname])
  
  // State to track expanded menu items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const fullPath = useMemo(() => location.pathname + location.search, [location.pathname, location.search])

  // Helper function to check if any child or nested child is active
  const hasActiveChild = React.useCallback((item: NavItem): boolean => {
    if (!item.children) return false
    return item.children.some((child) => {
      const childIsActive = child.href.includes('?')
        ? fullPath === child.href
        : currentPath === child.href || currentPath.startsWith(child.href + '/')
      return childIsActive || hasActiveChild(child)
    })
  }, [currentPath, fullPath])

  // Auto-expand only items whose children contain the active route (on mount / path change).
  // We track the last path we acted on so that manual toggles are preserved between navigations.
  const lastAutoExpandPath = React.useRef<string | null>(null)
  useEffect(() => {
    if (lastAutoExpandPath.current === currentPath) return
    lastAutoExpandPath.current = currentPath

    setExpandedItems((prev) => {
      const newExpanded = new Set<string>(prev)

      const checkAndExpand = (items: NavItem[]) => {
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            if (hasActiveChild(item)) {
              newExpanded.add(item.href)
            }
            checkAndExpand(item.children)
          }
        })
      }

      checkAndExpand(filteredNavigation)
      return newExpanded
    })
  }, [currentPath, filteredNavigation, hasActiveChild])

  const toggleExpanded = React.useCallback((href: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(href)) {
        newSet.delete(href)
      } else {
        newSet.add(href)
      }
      return newSet
    })
  }, [])

  const isExpanded = React.useCallback((href: string) => expandedItems.has(href), [expandedItems])
  
  const isActiveLink = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/')
  }

  const renderNavItem = React.useCallback((item: NavItem, depth = 0) => {
    const Icon = item.icon
    const isActive = item.href.includes('?')
      ? fullPath === item.href
      : currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href + '/'))
    const hasChildren = item.children && item.children.length > 0
    const expanded = hasChildren && isExpanded(item.href)
    const hasActive = hasActiveChild(item)

    const activeState = isActive || hasActive

    let badgeCount = 0
    if (item.href === '/transporter/requests/my') {
      badgeCount = transporterCounts.myRequests
    } else if (item.href === '/transporter/driver/panel') {
      badgeCount = transporterCounts.driverPanel
    } else if (item.href === '/transporter/admin/approval') {
      badgeCount = transporterCounts.adminApproval
    } else if (item.href === '/porter/requests/my') {
      badgeCount = porterCounts.myRequests
    } else if (item.href === '/porter/panel') {
      badgeCount = porterCounts.driverPanel
    } else if (item.href === '/porter/receiver') {
      badgeCount = porterCounts.receiver
    } else if (item.href === '/porter/manager') {
      badgeCount = porterCounts.manager
    } else if (item.href === '/priviledging/review-queue') {
      badgeCount = priviledgingCounts.pendingReviews
    } else if (item.href === '/priviledging/my-submissions') {
      badgeCount = priviledgingCounts.changesRequested
    } else if (item.href === '/tempahan/kelulusan') {
      badgeCount = tempahanPendingCount
    }

    let totalChildBadgeCount = 0
    if (item.module === 'transporter') {
      totalChildBadgeCount = transporterCounts.myRequests + transporterCounts.driverPanel + transporterCounts.adminApproval
    } else if (item.module === 'porter') {
      totalChildBadgeCount = porterCounts.myRequests + porterCounts.driverPanel + porterCounts.receiver + porterCounts.manager
    } else if (item.module === 'priviledging') {
      totalChildBadgeCount = priviledgingMode === 'admin'
        ? priviledgingCounts.pendingReviews
        : priviledgingCounts.changesRequested
    } else if (item.module === 'tempahan') {
      totalChildBadgeCount = tempahanPendingCount
    }

    const itemLabel = item.label

    if (depth > 0) {
      // Sub-item rendering with sleek tree dots & micro styling
      return (
        <motion.div
          key={`${item.href}-${item.label}`}
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <NavLink
            to={item.href}
            onClick={() => {
              if (isMobile) {
                setSidebarOpen(false)
              }
            }}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2.5 min-h-[42px] rounded-xl text-xs font-medium transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] duration-150 group relative',
                isActive
                  ? 'text-accent-base font-semibold bg-accent-subtle border border-accent-base/30 shadow-elevation-1'
                  : 'text-text-secondary hover:text-text-primary hover:bg-subtle border border-transparent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-150 flex-shrink-0",
                  isActive 
                    ? "bg-accent-base scale-125" 
                    : "bg-text-muted/60 group-hover:bg-text-secondary"
                )} />
                <span className="flex-1 truncate">{itemLabel}</span>
                {badgeCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold">
                    {badgeCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </motion.div>
      )
    }

    if (hasChildren) {
      return (
        <div key={`${item.href}-${item.label}`} className="space-y-0.5">
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 min-h-[46px] rounded-xl text-xs font-semibold tracking-wide transition-colors duration-150 group relative',
              activeState
                ? 'text-accent-base bg-accent-subtle/50 border border-accent-base/30 shadow-elevation-1'
                : 'text-text-secondary hover:text-text-primary hover:bg-subtle border border-transparent'
            )}
          >
            {activeState && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent-base rounded-r-full" />
            )}
            
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 flex-shrink-0",
              activeState 
                ? "bg-accent-subtle text-accent-base border border-accent-base/30 shadow-xs" 
                : "bg-subtle text-text-muted group-hover:bg-muted-surface group-hover:text-text-primary"
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
            </div>
            
            <span className={cn("flex-1 text-left tracking-tight flex items-center justify-between", sidebarCollapsed && "lg:hidden")}>
              <span className="font-semibold">{itemLabel}</span>
              {totalChildBadgeCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold mr-2">
                  {totalChildBadgeCount}
                </span>
              )}
            </span>
            
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-text-muted group-hover:text-text-primary" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="ml-5 mt-1 space-y-1 border-l border-border-default pl-3">
                  {item.children?.map((child) => renderNavItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <motion.div
        key={`${item.href}-${item.label}`}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <NavLink
          to={item.href}
          onClick={() => {
            if (isMobile) {
              setSidebarOpen(false)
            }
          }}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-lg text-xs font-medium tracking-wide transition-colors duration-150 group relative select-none',
              isActive
                ? 'text-accent-base font-semibold bg-accent-subtle border border-accent-base/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-subtle border border-transparent'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent-base rounded-r-full" />
              )}
              
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150 flex-shrink-0",
                isActive 
                  ? "bg-accent-subtle text-accent-base border border-accent-base/30" 
                  : "bg-subtle text-text-muted group-hover:bg-muted-surface group-hover:text-text-primary"
              )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
              </div>
              <span className="flex-1 flex justify-between items-center">
                <span>{itemLabel}</span>
                <span className="flex items-center gap-1.5">
                  {item.module && <PendingSyncBadge module={item.module} />}
                  {badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-md text-[10px] font-semibold">
                      {badgeCount}
                    </span>
                  )}
                </span>
              </span>
            </>
          )}
        </NavLink>
      </motion.div>
    )
  }, [currentPath, sidebarCollapsed, expandedItems, hasActiveChild, toggleExpanded, isExpanded, setSidebarOpen, isMobile, transporterCounts])

  const renderSidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-5 px-3.5 pb-24 lg:pb-4 space-y-1.5 custom-scrollbar overscroll-contain touch-pan-y">
        <div className="flex items-center justify-between mb-3.5 px-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] truncate max-w-[190px]">
              {currentModuleInfo?.name ? `MENU: ${currentModuleInfo.name}` : 'NAVIGATION MENU'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-subtle active:scale-95 rounded-lg transition-colors"
            aria-label="Close Navigation Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {filteredNavigation.length === 0 ? (
          <div className="text-center py-8 px-3">
            <p className="text-xs text-text-muted mb-3">No submenu available for current view.</p>
            <NavLink
              to="/hub"
              onClick={() => {
                if (isMobile) setSidebarOpen(false)
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-subtle text-accent-base border border-accent-base/30 text-xs font-semibold hover:bg-accent-subtle/80 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Open Module Hub
            </NavLink>
          </div>
        ) : (
          filteredNavigation.map((item) => renderNavItem(item))
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border-default bg-surface/50">
        <div
          className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border-default shadow-elevation-1 group hover:border-border-strong transition-colors duration-150'
          )}
        >
          <div className="relative">
            <Avatar
              src={user?.profile_photo_url}
              name={user?.full_name}
              size="sm"
              className="ring-2 ring-accent-base/30 group-hover:ring-accent-base/60 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 border-surface" />
          </div>
          
          <div className={cn("flex-1 min-w-0")}>
            <p className="text-xs font-semibold text-text-primary truncate group-hover:text-accent-base transition-colors">
              {user?.full_name}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {user?.role?.role_name}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            title="Sign out"
            className={cn(
              "p-2 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors duration-200"
            )}
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'fixed top-0 bottom-0 left-0 bg-surface/90 backdrop-blur-xl border-r border-border-default',
              'flex flex-col z-[50] transition-colors duration-150',
              'w-[290px] max-w-[85vw] shadow-2xl lg:hidden'
            )}
          >
            {renderSidebarContent()}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Static Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 bg-surface/80 backdrop-blur-xl border-r border-border-default',
          'flex-col z-[35] transition-colors duration-150',
          'sidebar-top-offset',
          'w-[280px]'
        )}
      >
        {renderSidebarContent()}
      </aside>
    </>
  )
}

export default Sidebar

