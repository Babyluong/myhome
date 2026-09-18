import React, { useEffect, useRef } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { useSidebar } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { recordAuditLog } from '@/services/auditLogService'

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
  if (pathname === '/hub') return { code: 'hub', name: 'Module Hub Utama' }
  return { code: 'system', name: 'H.O.M.E. Ecosystem' }
}

export const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { sidebarCollapsed } = useSidebar()
  const location = useLocation()
  const lastLoggedPathRef = useRef<string>('')

  // Automatic Audit Navigation Tracker
  useEffect(() => {
    if (!isAuthenticated || !user || !location.pathname) return
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
        details: `Kakitangan ${user.full_name} (${user.employee_id || 'ID'}) membuka modul ${mod.name} di ${location.pathname}.`,
      }).catch((err) => {
        console.warn('Navigation audit log skipped:', err)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [location.pathname, isAuthenticated, user])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400 tracking-wide">Memuatkan H.O.M.E. Ecosystem...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-teal-500/20 selection:text-teal-300 w-full max-w-full overflow-x-hidden">
      {/* Header - Fixed Full width at top */}
      <Header />

      {/* Sidebar - Below header */}
      <Sidebar />

      {/* Main Content - Padded to the left on desktop for the static sidebar */}
      <div className="flex-1 flex flex-col lg:pl-[280px] pt-16 sm:pt-20 lg:pt-24 min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-5 md:p-6 pb-24 lg:pb-8 bg-slate-950 text-slate-100">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
      <BottomNav />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default MainLayout


