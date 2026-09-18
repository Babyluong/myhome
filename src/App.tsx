import React, { useEffect } from 'react'
import { AppRouter } from '@/routes'
import { ToastContainer } from '@/components/ui'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/stores/authStore'
import { useRbacStore } from '@/stores/rbacStore'
import { LanguageProvider } from '@/shared/contexts/LanguageContext'

function App() {
  const { setLoading, checkSession, logout } = useAuthStore()

  useEffect(() => {
    // 1. Initialize RBAC store and realtime sync across tabs/devices
    const cleanupRbac = useRbacStore.getState().init()

    // 2. Check if there's an existing session
    const initAuth = async () => {
      try {
        const isValid = checkSession()
        if (!isValid) {
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      cleanupRbac()
    }
  }, [checkSession, setLoading, logout])

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppRouter />
        <ToastContainer />
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App
