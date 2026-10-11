import { useState, useEffect, useRef } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TabBar } from '@/shared/components/mobile/TabBar'
import { MoreSheet } from '@/shared/components/mobile/MoreSheet'
import { ToastContainer } from '@/components/ui'
import { OfflineBanner } from '@/shared/components/ui/OfflineBanner'
import { OfflineSyncDrawer } from '@/shared/components/ui/OfflineSyncDrawer'
import { useAuthStore } from '@/stores/authStore'
import { useSidebar } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { recordAuditLog } from '@/services/auditLogService'
import { getCurrentModuleInfo, saveLastActiveModule } from '@/shared/utils/moduleNavigation'
import { offlinePreloader } from '@/services/offlinePreloader'

const getModuleCodeFromPath = (pathname: string): { code: string; name: string } => {
  if (pathname.startsWith('/admin') || pathname.startsWith('/hub/admin')) return { code: 'myadmin', name: 'MyAdmin' }
  if (pathname.startsWith('/staff') || pathname.startsWith('/hub/staff')) return { code: 'mystaff', name: 'MyStaff' }
  if (pathname.startsWith('/formulari') || pathname.startsWith('/hub/formulari')) return { code: 'myformulari', name: 'MyFormulari' }
  if (pathname.startsWith('/kunci') || pathname.startsWith('/hub/kunci')) return { code: 'mykunci', name: 'MyKunci' }
  if (pathname.startsWith('/suhu') || pathname.startsWith('/hub/suhu')) return { code: 'mysuhu', name: 'MySuhu' }
  if (pathname.startsWith('/pharmacy/oxygen')) return { code: 'cylinder', name: 'MyCylinder' }
  if (pathname.startsWith('/perolehan') || pathname.startsWith('/hub/perolehan')) return { code: 'myperolehan', name: 'MyPerolehan' }
  if (pathname.startsWith('/transporter') || pathname.startsWith('/hub/transporter')) return { code: 'mytransporter', name: 'MyTransporter' }
  if (pathname.startsWith('/tempahan') || pathname.startsWith('/hub/tempahan')) return { code: 'mytempahan', name: 'MyTempahan' }
  if (pathname.startsWith('/priviledging') || pathname.startsWith('/hub/priviledging')) return { code: 'mypriviledging', name: 'MyPriviledging' }
  if (pathname.startsWith('/crossborder')) return { code: 'crossborder', name: 'MyCrossBorder' }
  if (pathname.startsWith('/pharmacy/inventory')) return { code: 'inventory', name: 'MyInventory' }
  if (pathname.startsWith('/pharmacy')) return { code: 'pharmacy', name: 'MyWarrant' }
  if (pathname === '/hub') return { code: 'hub', name: 'Module Hub' }
  return { code: 'system', name: 'H.O.M.E. Ecosystem' }
}

export const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { sidebarCollapsed } = useSidebar()
  const location = useLocation()
  const lastLoggedPathRef = useRef<string>('')
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Background hospital data preloading for offline operational readiness
  useEffect(() => {
    if (isAuthenticated && user?.hospital_id) {
      void offlinePreloader.startPreload(user.hospital_id)
    }
  }, [isAuthenticated, user?.hospital_id])

  // Automatic Audit Navigation Tracker
  useEffect(() => {
    if (!isAuthenticated || !user || !location.pathname) return
    // Persist active module whenever browsing a module route
    const activeMod = getCurrentModuleInfo(location.pathname)
    if (activeMod) {
      saveLastActiveModule(activeMod)
    }

    if (lastLoggedPathRef.current === location.pathname) return

    lastLoggedPathRef.current = location.pathname
    const mod = getModuleCodeFromPath(location.pathname)

    // Debounce / record navigation log
    const timer = setTimeout(() => {
      recordAuditLog({
        userId: user.id,
        action: 'NAVIGATE_PAGE',
        module: mod.code,
        entityType: 'page_route',
        entityId: location.pathname,
        details: `Staff ${user.full_name} (${user.employee_id || 'ID'}) accessed module ${mod.name} at ${location.pathname}.`,
      }).catch((err) => {
        console.warn('Navigation audit log skipped:', err)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [location.pathname, isAuthenticated, user])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-base/20 border-t-accent-base rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-text-muted tracking-wide uppercase">Loading H.O.M.E. Ecosystem...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col antialiased selection:bg-accent-base/20 selection:text-accent-base w-full max-w-full overflow-x-hidden transition-colors duration-150">
      {/* Header - Fixed Full width at top */}
      <Header onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)} />

      {/* Sidebar - Below header */}
      <Sidebar />

      {/* Main Content - Padded to the left on desktop for the static sidebar, synchronized with header safe area */}
      <div className="flex-1 flex flex-col lg:pl-[280px] main-content-offset min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
        {/* Offline & Sync Status Banner */}
        <OfflineBanner onOpenDrawer={() => setIsSyncDrawerOpen(true)} />

        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-5 md:p-6 pb-[calc(var(--tabbar-total-height)+1.5rem)] lg:pb-8 bg-canvas text-primary transition-colors duration-150">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Contextual Thumb Zone) */}
      <TabBar onOpenMore={() => setIsMoreOpen(true)} isMoreOpen={isMoreOpen} />

      {/* Mobile More Sheet */}
      <MoreSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)}
      />

      {/* Offline Sync Detailed Drawer */}
      <OfflineSyncDrawer isOpen={isSyncDrawerOpen} onClose={() => setIsSyncDrawerOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default MainLayout


