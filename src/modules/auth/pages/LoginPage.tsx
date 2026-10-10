import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, FileText, Sun, Moon, ShieldCheck, Building2, Users, LayoutGrid } from 'lucide-react'
import { Modal } from '@/components/ui'
import { LoginForm, ResetPasswordForm, AccessRequestForm } from '@/components/forms'
import { ContactModal } from '@/components/shared'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { COPYRIGHT_TEXT, ROUTES } from '@/lib/constants'
import { supabase } from '@/services/supabase'
import { MedicalMesh3D } from '../components/MedicalMesh3D'

type View = 'login' | 'reset' | 'access-request'

interface SystemStats {
  facilitiesCount: number | null
  staffCount: number | null
  modulesCount: number | null
  isLoading: boolean
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const [currentView, setCurrentView] = useState<View>('login')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const hasNavigated = useRef(false)

  // Real Database Query for System Operational Statistics (100% Zero-Mock Compliance)
  const [stats, setStats] = useState<SystemStats>({
    facilitiesCount: null,
    staffCount: null,
    modulesCount: null,
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true
    const loadRealDatabaseCounts = async () => {
      try {
        const [facilitiesRes, staffRes, modulesRes] = await Promise.all([
          supabase.from('hospitals').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('hospital_modules').select('*', { count: 'exact', head: true }),
        ])

        if (isMounted) {
          setStats({
            facilitiesCount: facilitiesRes.count ?? null,
            staffCount: staffRes.count ?? null,
            modulesCount: modulesRes.count ?? null,
            isLoading: false,
          })
        }
      } catch {
        if (isMounted) {
          setStats((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    void loadRealDatabaseCounts()
    return () => {
      isMounted = false
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoading || hasNavigated.current) {
      return
    }

    if (isAuthenticated && location.pathname === ROUTES.LOGIN) {
      hasNavigated.current = true
      const timer = setTimeout(() => {
        navigate(ROUTES.HUB, { replace: true })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname])

  const handleLoginSuccess = () => {
    navigate(ROUTES.HUB, { replace: true })
  }

  const handleAccessRequestSuccess = () => {
    setShowAccessModal(false)
    setCurrentView('login')
  }

  return (
    <div className="min-h-screen flex bg-canvas text-primary relative selection:bg-accent-subtle selection:text-accent-base transition-colors duration-150">
      {/* Theme Switcher in Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border-default text-text-muted hover:text-text-primary hover:border-border-strong transition-all duration-150 shadow-2xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Left Panel - Claude Editorial Identity & 3D Interactive Accent */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[58%] relative overflow-hidden bg-subtle/50 border-r border-border-default flex-col justify-between p-12 xl:p-16 select-none">
        {/* Subtle Canvas 3D Medical Lattice */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60 pointer-events-none">
          <MedicalMesh3D />
        </div>

        {/* Top: Official Government Branding */}
        <div className="relative z-10 flex items-center gap-5">
          <img
            src="/512px-Jata_MalaysiaV2.svg.png"
            alt="Jata Negara Malaysia"
            className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-sm flex-shrink-0"
          />
          <div className="border-l border-border-default pl-5">
            <h1 className="text-sm xl:text-base font-semibold text-text-primary tracking-wide uppercase leading-tight">
              Ministry of Health Malaysia
            </h1>
            <p className="text-xs text-text-muted font-normal tracking-wider uppercase mt-0.5">
              Kementerian Kesihatan Malaysia
            </p>
          </div>
        </div>

        {/* Center: System Architecture Title (Claude Editorial Style) */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-accent-subtle text-accent-base border border-accent-base/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrated Healthcare Operating System</span>
          </div>

          <h2 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl font-normal tracking-tight text-text-primary leading-[1.14]">
            Welcome back to <span className="italic font-normal">MyHome</span> Ecosystem.
          </h2>

          <p className="text-base text-text-secondary leading-relaxed font-normal">
            A unified digital operating system coordinating clinical care, pharmacy supply chains,
            and facility logistics across Malaysian healthcare institutions.
          </p>

          {/* Operational Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-base" />
              <span>Real-Time Forensic Audit Logging</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-base" />
              <span>Offline-First Sync Engine (PWA)</span>
            </div>
          </div>
        </div>

        {/* Bottom: Real Database Statistics (Strict Zero-Mock Mandate) */}
        <div className="relative z-10 pt-8 border-t border-border-default">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Facility</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-mono tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.facilitiesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Official Registry</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Registered Staff</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-mono tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.staffCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Active Accounts</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Core Modules</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-mono tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.modulesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Integrated Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Card Container */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col min-h-screen bg-canvas relative overflow-y-auto justify-between">
        {/* Mobile Official Government Header */}
        <div className="lg:hidden pt-8 pb-4 px-6 text-center header-safe-pt">
          <div className="flex flex-col items-center">
            <img
              src="/512px-Jata_MalaysiaV2.svg.png"
              alt="Jata Negara Malaysia"
              className="h-14 w-auto object-contain mb-3"
            />
            <p className="text-[11px] font-bold tracking-widest text-accent-base uppercase">
              Ministry of Health Malaysia
            </p>
            <h1 className="font-serif text-lg font-normal text-text-primary tracking-tight mt-0.5">
              Hospital Operation Management Ecosystem
            </h1>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-subtle border border-border-default">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-base" />
              <span className="text-[11px] font-medium text-text-secondary">
                Official Staff Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Form Card */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 xl:px-12 py-8 max-w-[460px] w-full mx-auto">
          <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 shadow-xs">
            {/* Form Header */}
            <div className="mb-6">
              <div className="hidden lg:flex items-center gap-2 mb-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-subtle text-accent-base border border-accent-base/20">
                  Official Staff Portal
                </span>
              </div>
              <h2 className="font-serif text-2xl font-normal text-text-primary tracking-tight">
                {currentView === 'login' && 'Sign in to your account'}
                {currentView === 'reset' && 'Reset your password'}
              </h2>
              <p className="text-text-muted text-xs sm:text-sm mt-1.5 leading-relaxed">
                {currentView === 'login' && 'Enter your staff credentials to continue to your workspace.'}
                {currentView === 'reset' && 'Provide your institutional email to receive recovery instructions.'}
              </p>
            </div>

            {/* Main Form Content */}
            <div>
              {currentView === 'login' && (
                <LoginForm
                  onShowResetPassword={() => setCurrentView('reset')}
                  onSuccess={handleLoginSuccess}
                />
              )}

              {currentView === 'reset' && (
                <ResetPasswordForm onBack={() => setCurrentView('login')} />
              )}
            </div>

            {/* Bottom Actions - Request System Access */}
            {currentView === 'login' && (
              <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between text-xs">
                <span className="text-text-muted font-normal">New staff member?</span>
                <button
                  type="button"
                  onClick={() => setShowAccessModal(true)}
                  className="inline-flex items-center gap-1.5 text-accent-base hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base rounded px-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request System Access</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 pb-safe border-t border-border-default bg-surface/50 text-xs">
          <div className="flex flex-col items-center gap-2 max-w-[460px] mx-auto text-center">
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-1 text-text-muted font-normal">
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-accent-base" />
                <span>Support Desk</span>
              </button>
              <Link to={ROUTES.PRIVACY_POLICY} className="hover:text-text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to={ROUTES.TERMS_OF_SERVICE} className="hover:text-text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-text-muted text-[11px] mt-0.5">© 2026 H.O.M.E. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Access Request Modal */}
      <Modal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        size="xl"
      >
        <AccessRequestForm
          onBack={() => setShowAccessModal(false)}
          onSuccess={handleAccessRequestSuccess}
        />
      </Modal>
    </div>
  )
}

export default LoginPage
