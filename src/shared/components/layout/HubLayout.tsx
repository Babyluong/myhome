import React, { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'
import { TabBar } from '@/shared/components/mobile/TabBar'
import { MoreSheet } from '@/shared/components/mobile/MoreSheet'

export const HubLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isRootHub = location.pathname === '/hub' || location.pathname === '/' || location.pathname === ROUTES.HUB

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
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
    <div className="min-h-screen bg-canvas font-sans antialiased text-primary selection:bg-teal-500/20 selection:text-teal-800 dark:selection:text-teal-300 transition-colors duration-150">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col ${!isRootHub ? 'header-safe-pt' : ''} pb-[calc(var(--tabbar-total-height)+1rem)] lg:pb-0`}>
          <Outlet />
        </main>

        {/* Global Footer for Hub */}
        <footer className="py-5 px-6 text-center text-text-muted text-xs border-t border-border-default bg-surface/50 pb-[calc(var(--tabbar-total-height)+1rem)] lg:pb-5">
          <p>© {new Date().getFullYear()} Ministry of Health Malaysia. Hospital Operation Management Ecosystem.</p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (Contextual Thumb Zone) */}
      <TabBar onOpenMore={() => setIsMoreOpen(true)} isMoreOpen={isMoreOpen} />

      {/* Mobile More Sheet */}
      <MoreSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default HubLayout
