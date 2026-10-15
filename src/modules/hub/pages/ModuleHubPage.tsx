// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AirVent, Package, FileText, Mail, ClipboardList, Thermometer, Shield, ShoppingCart, LogOut, Megaphone, ChevronRight, Image, StickyNote, Files, Search, Car, PersonStanding, UserCheck, Calendar, Users, Clock, Key, Pill, FlaskConical, PackageCheck, LayoutGrid, ListFilter, X, Sparkles, Layers, ArrowUpRight, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { logout } from '@/services/authService'
import { ROUTES } from '@/lib/constants'
import { supabase } from '@/services/supabase'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getActiveAnnouncements, 
  getSystemUpdateLogs, 
  subscribeToAnnouncements, 
  type SystemAnnouncement 
} from '@/services/systemAnnouncementService'
import { SystemBroadcastBanner } from '../components/SystemBroadcastBanner'
import { SystemUpdateLogModal } from '../components/SystemUpdateLogModal'
import { AdminBroadcastModal } from '../components/AdminBroadcastModal'
import '@/config/systemReleases'
import { LazyHero3D } from '@/components/three/LazyHero3D'

type ModuleCategory = 'clinical' | 'logistics' | 'governance'

interface ModuleItem {
  id: string
  name: string
  shortName: string
  description: string
  category: ModuleCategory
  icon: React.ComponentType<{ className?: string }>
  path: string
  accent: 'cyan' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'blue' | 'amber'
  badge?: string
}

// Restrained semantic styles for native superellipse app icons (Anti-Slop compliant)
const ACCENT_STYLES: Record<string, { bg: string; text: string; border: string; hoverBorder: string }> = {
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/25 dark:border-cyan-500/30',
    hoverBorder: 'group-hover:border-cyan-500/50',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/25 dark:border-teal-500/30',
    hoverBorder: 'group-hover:border-teal-500/50',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25 dark:border-rose-500/30',
    hoverBorder: 'group-hover:border-rose-500/50',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/25 dark:border-emerald-500/30',
    hoverBorder: 'group-hover:border-emerald-500/50',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/25 dark:border-indigo-500/30',
    hoverBorder: 'group-hover:border-indigo-500/50',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/25 dark:border-blue-500/30',
    hoverBorder: 'group-hover:border-blue-500/50',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25 dark:border-amber-500/30',
    hoverBorder: 'group-hover:border-amber-500/50',
  },
}

// Complete 23 module catalogue structured into native hospital operational categories
const MODULES: ModuleItem[] = [
  // 1. Clinical & Pharmacy (8)
  {
    id: 'formulari',
    name: 'MyFormulari',
    shortName: 'Formulary',
    description: 'National & Hospital Drug Formulary and Pediatric Dosages',
    category: 'clinical',
    icon: Search,
    path: '/formulari',
    accent: 'teal',
  },
  {
    id: 'suhu',
    name: 'MySuhu',
    shortName: 'Temperature',
    description: 'Cold Chain & Vaccine Chiller Temperature Monitoring',
    category: 'clinical',
    icon: Thermometer,
    path: ROUTES.HUB_SUHU_DASHBOARD,
    accent: 'rose',
  },
  {
    id: 'cylinder',
    name: 'MyCylinder',
    shortName: 'Cylinders',
    description: 'Medical Oxygen & Medical Gas Cylinder Management',
    category: 'clinical',
    icon: AirVent,
    path: ROUTES.PHARMACY_OXYGEN,
    accent: 'cyan',
  },
  {
    id: 'prepacking',
    name: 'MyPrepacking',
    shortName: 'Prepacking',
    description: 'Unit-of-Dose (UOD) Prepacking & Medicine Label Studio',
    category: 'clinical',
    icon: PackageCheck,
    path: '/prepacking',
    accent: 'teal',
  },
  {
    id: 'warrant',
    name: 'MyWarrant',
    shortName: 'Warrant',
    description: 'Pharmacy Financial Warrant & Budget Allocation',
    category: 'clinical',
    icon: FileText,
    path: ROUTES.MYWARRANT_DASHBOARD,
    accent: 'emerald',
  },
  {
    id: 'priviledging',
    name: 'MyPrivileging',
    shortName: 'Privileging',
    description: 'Clinical Privileging Logbook & Credentialing Committee',
    category: 'clinical',
    icon: UserCheck,
    path: '/priviledging',
    accent: 'emerald',
  },
  {
    id: 'myphis',
    name: 'MyPHiS',
    shortName: 'PhIS',
    description: 'Pharmacy Information System Integration & Backup Logs',
    category: 'clinical',
    icon: Pill,
    path: ROUTES.HUB_MYPHIS,
    accent: 'teal',
  },
  {
    id: 'mymsds',
    name: 'MyMSDS',
    shortName: 'MSDS',
    description: 'Material Safety Data Sheets & Chemical Hazmat Directory',
    category: 'clinical',
    icon: FlaskConical,
    path: ROUTES.HUB_MYMSDS,
    accent: 'teal',
  },

  // 2. Logistics & Facilities (6)
  {
    id: 'inventory',
    name: 'MyInventory',
    shortName: 'Inventory',
    description: 'Hospital Store Inventory & KEW.PS-4 Stock Ledger',
    category: 'logistics',
    icon: Package,
    path: ROUTES.PHARMACY_INVENTORY,
    accent: 'indigo',
  },
  {
    id: 'perolehan',
    name: 'MyPerolehan',
    shortName: 'Procurement',
    description: 'Local Purchase Orders (LPO), Quotations & Suppliers',
    category: 'logistics',
    icon: ShoppingCart,
    path: ROUTES.HUB_PEROLEHAN,
    accent: 'blue',
  },
  {
    id: 'transporter',
    name: 'MyTransporter',
    shortName: 'Transport',
    description: 'Vehicle Fleet Management & Inter-Facility Transport',
    category: 'logistics',
    icon: Car,
    path: '/transporter',
    accent: 'indigo',
  },
  {
    id: 'porter',
    name: 'MyPorter',
    shortName: 'Porter',
    description: 'Ward Portering Dispatch & Inpatient Transport',
    category: 'logistics',
    icon: PersonStanding,
    path: '/porter/dashboard',
    accent: 'indigo',
  },
  {
    id: 'tempahan',
    name: 'MyTempahan',
    shortName: 'Bookings',
    description: 'Conference Hall, Meeting Room & Facility Booking',
    category: 'logistics',
    icon: Calendar,
    path: ROUTES.HUB_TEMPAHAN,
    accent: 'blue',
  },
  {
    id: 'kunci',
    name: 'MyKunci',
    shortName: 'Key Custody',
    description: 'Security Key Custody Register & Monthly Audit System',
    category: 'logistics',
    icon: Key,
    path: '/kunci',
    accent: 'amber',
  },

  // 3. Administration & Governance (9)
  {
    id: 'admin',
    name: 'MyAdmin',
    shortName: 'Admin',
    description: 'Access Control, RBAC Roles & System Audit Logs',
    category: 'governance',
    icon: Shield,
    path: ROUTES.ADMIN,
    accent: 'amber',
  },
  {
    id: 'staff',
    name: 'MyStaff',
    shortName: 'Staff',
    description: 'Staff Directory, Movement Logs & Organizational Chart',
    category: 'governance',
    icon: Users,
    path: '/staff',
    accent: 'emerald',
  },
  {
    id: 'timeoff',
    name: 'MyTimeOff',
    shortName: 'Time-Off',
    description: 'Compensatory Time-Off (TOIL) & Movement Claims',
    category: 'governance',
    icon: Clock,
    path: '/timeoff',
    accent: 'blue',
  },
  {
    id: 'surat',
    name: 'MySurat',
    shortName: 'Letters',
    description: 'Official Government Correspondence & Letter Tracking',
    category: 'governance',
    icon: Mail,
    path: ROUTES.HUB_SURAT,
    accent: 'indigo',
  },
  {
    id: 'borang',
    name: 'MyBorang',
    shortName: 'Forms',
    description: 'Hospital Operational Form Templates & Digital Archives',
    category: 'governance',
    icon: ClipboardList,
    path: ROUTES.HUB_BORANG,
    accent: 'amber',
  },
  {
    id: 'memo',
    name: 'MyMemo',
    shortName: 'Memos',
    description: 'Internal Circulars & Official Hospital Broadcasts',
    category: 'governance',
    icon: StickyNote,
    path: ROUTES.HUB_MEMO,
    accent: 'indigo',
  },
  {
    id: 'file',
    name: 'MyFile',
    shortName: 'Files',
    description: 'Departmental File Index & Document Archive',
    category: 'governance',
    icon: Files,
    path: ROUTES.HUB_FILE,
    accent: 'amber',
  },
  {
    id: 'gallery',
    name: 'MyGallery',
    shortName: 'Gallery',
    description: 'Official Hospital Event Photos & Media Archive',
    category: 'governance',
    icon: Image,
    path: ROUTES.HUB_GALLERY,
    accent: 'indigo',
  },
  {
    id: 'perhimpunan',
    name: 'MyPerhimpunan',
    shortName: 'Assembly',
    description: 'Monthly Staff Assembly Attendance & Event Records',
    category: 'governance',
    icon: Users,
    path: ROUTES.HUB_PERHIMPUNAN,
    accent: 'indigo',
  }
]

export const ModuleHubPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout: storeLogout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const { language, t } = useLanguage()
  // System Administrator Authorization Check
  const isSystemAdmin = 
    user?.role?.role_code === 'system_admin' || 
    user?.role?.role_name?.toLowerCase().includes('system admin') ||
    user?.role_code === 'system_admin'

  // State
  const [selectedCategory, setSelectedCategory] = useState<'all' | ModuleCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grouped' | 'grid' | 'list'>('grouped')
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [selectedModuleName, setSelectedModuleName] = useState('')
  const [totalStaffCount, setTotalStaffCount] = useState<number | null>(null)

  // Real Database Announcements & Update Logs (Strict Zero-Mock Mandate)
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([])
  const [updateLogs, setUpdateLogs] = useState<SystemAnnouncement[]>([])
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)
  const [showAdminBroadcastModal, setShowAdminBroadcastModal] = useState(false)
  const [showUpdateLogModal, setShowUpdateLogModal] = useState(false)

  // Fetch real announcements and logs
  const fetchAnnouncementsData = async () => {
    try {
      setIsAnnouncementsLoading(true)
      const [active, logs] = await Promise.all([
        getActiveAnnouncements(),
        getSystemUpdateLogs()
      ])
      setAnnouncements(active)
      setUpdateLogs(logs)
    } catch (err) {
      console.warn('Could not fetch announcements:', err)
    } finally {
      setIsAnnouncementsLoading(false)
    }
  }

  // Real Database Query for Active Staff & Announcements
  useEffect(() => {
    let isMounted = true

    const fetchRealStaffCount = async () => {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        if (!error && count !== null && isMounted) {
          setTotalStaffCount(count)
        }
      } catch (err) {
        console.warn('Real staff count fetch skipped:', err)
      }
    }

    void fetchRealStaffCount()
    void fetchAnnouncementsData()

    // Real-time subscription to database updates
    const unsubscribe = subscribeToAnnouncements(() => {
      if (isMounted) {
        void fetchAnnouncementsData()
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    storeLogout()
  }

  // Filter modules by category and search query
  // High-frequency quick launch modules for instant muscle-memory access
  const quickLaunchModules = useMemo(() => {
    const quickIds = ['formulari', 'suhu', 'prepacking', 'kunci']
    return quickIds
      .map((id) => MODULES.find((m) => m.id === id))
      .filter(Boolean) as ModuleItem[]
  }, [])

  const filteredModules = useMemo(() => {
    return MODULES.filter((module) => {
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory
      if (!matchesCategory) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        module.name.toLowerCase().includes(q) ||
        module.shortName.toLowerCase().includes(q) ||
        module.description.toLowerCase().includes(q)
      )
    })
  }, [selectedCategory, searchQuery])

  // Grouped modules for domain sectioning on desktop
  const clinicalModules = useMemo(() => filteredModules.filter(m => m.category === 'clinical'), [filteredModules])
  const logisticsModules = useMemo(() => filteredModules.filter(m => m.category === 'logistics'), [filteredModules])
  const governanceModules = useMemo(() => filteredModules.filter(m => m.category === 'governance'), [filteredModules])

  // Native category tabs
  const categories: { id: 'all' | ModuleCategory; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All', count: MODULES.length },
      { id: 'clinical', label: 'Clinical', count: MODULES.filter(m => m.category === 'clinical').length },
      { id: 'logistics', label: 'Logistics', count: MODULES.filter(m => m.category === 'logistics').length },
      { id: 'governance', label: 'Admin', count: MODULES.filter(m => m.category === 'governance').length },
    ]
  }, [])

  // Time-aware greeting (local clock)
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const handleCardClick = (module: ModuleItem) => {
    if (module.path) {
      navigate(module.path)
    } else {
      setSelectedModuleName(module.name)
      setShowSurpriseModal(true)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-canvas text-text-primary overflow-x-hidden antialiased selection:bg-accent-base/20 selection:text-accent-base transition-colors duration-150">
      <LazyHero3D />
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* 1. Global Navigation Bar */}
        <nav className="w-full border-b border-border-default bg-surface/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-150 header-safe-pt">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-15 sm:h-20 flex items-center justify-between gap-3">
            {/* Left: Jata Negara & System Title */}
            <div className="flex items-center gap-2.5 sm:gap-4.5 min-w-0">
              <div className="relative shrink-0 flex items-center">
                <img
                  src="/512px-Jata_MalaysiaV2.svg.png"
                  alt="Jata Negara Malaysia"
                  className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
                />
              </div>
              
              <div className="h-7 sm:h-10 w-px border-border-default hidden xs:block shrink-0" />

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-bold text-text-primary tracking-tight leading-none whitespace-nowrap">
                    H.O.M.E.
                  </h1>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-accent-subtle border border-accent-base/30 text-[10px] font-bold text-accent-base uppercase tracking-wider">
                    Ecosystem
                  </span>
                </div>
                <p className="hidden md:block text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-[0.12em] leading-tight mt-0.5 truncate">
                  Hospital Operation Management Ecosystem
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-base shrink-0" />
                  <p className="text-[9px] sm:text-[10px] font-semibold text-accent-base uppercase tracking-[0.15em] leading-none truncate">
                    Ministry of Health Malaysia
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User Profile, Theme Switcher & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Theme Switcher Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-surface hover:bg-subtle active:bg-muted-surface text-text-muted hover:text-text-primary rounded-lg transition-colors duration-150 border border-border-default shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-text-secondary" />
                )}
              </button>

              <button
                onClick={() => navigate(ROUTES.PROFILE, { state: { fromModule: { name: 'Module Hub', code: 'hub' } } })}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-surface hover:bg-subtle active:bg-muted-surface border border-border-default rounded-lg flex items-center gap-2 sm:gap-2.5 transition-colors duration-150 group text-left min-h-[36px] sm:min-h-[40px]"
                title="Open User Profile"
                aria-label="User Profile"
              >
                <div className="relative shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-accent-base/30 p-0.5 flex items-center justify-center overflow-hidden bg-subtle">
                    {user?.profile_photo_url ? (
                      <img 
                        src={user.profile_photo_url} 
                        alt={user.full_name || "Profile"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-subtle flex items-center justify-center text-xs font-semibold text-accent-base">
                        {(user?.full_name || "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-surface rounded-full" />
                </div>

                <div className="hidden xs:flex flex-col min-w-0 max-w-[120px] sm:max-w-[180px]">
                  <p className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent-base transition-colors truncate leading-tight">
                    {user?.full_name || "Staff"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-text-muted truncate leading-tight mt-0.5">
                    {user?.jawatan || user?.role?.role_name || 'System User'}
                  </p>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                className="hidden lg:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center bg-surface hover:bg-rose-500/10 active:bg-rose-500/20 text-text-muted hover:text-rose-600 rounded-lg transition-colors duration-150 border border-border-default shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* 2. Main Executive Operations Center */}
        <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-5 pb-20 sm:pb-16 flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
          
          {/* Unified Executive Operations Bar (High Clinical Density) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border border-border-default rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-elevation-1">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-subtle text-text-secondary border border-border-default text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.hospital?.hospital_name || 'Hospital Lawas'}
              </span>
              <span className="text-xs text-text-muted font-medium hidden xs:inline">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-border-default hidden xs:inline">|</span>
              <h2 className="font-sans text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {greeting}, {user?.full_name || 'there'}
              </h2>
            </div>

            {/* Quick Actions & Staff Count */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {isSystemAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAdminBroadcastModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/25 border border-amber-500/25 text-amber-400 dark:text-amber-300 text-xs font-medium transition-colors duration-150 flex items-center gap-1.5"
                  title="Broadcast system update or maintenance notification"
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Notice</span>
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[9px] font-bold uppercase">
                    Admin
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1.5 bg-subtle border border-border-default rounded-lg px-2.5 py-1 text-xs text-text-secondary">
                <Users className="w-3.5 h-3.5 text-accent-base" />
                <span className="font-bold font-mono text-text-primary">{totalStaffCount !== null ? totalStaffCount : '—'}</span>
                <span className="text-[10px] text-text-muted font-medium uppercase">Staff</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              </div>
            </div>
          </div>

          {/* 3. System Broadcast & Maintenance Banner */}
          <SystemBroadcastBanner
            announcements={announcements}
            isLoading={isAnnouncementsLoading}
            language={language}
            onOpenUpdateLogs={() => setShowUpdateLogModal(true)}
          />

          {/* 4. Streamlined Operations Toolbar: Live Search, Category Tabs & View Switcher */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border border-border-default rounded-xl p-2.5 sm:p-3 shadow-elevation-1">
            {/* Live Module Search Filter */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules... (e.g. Formulary, Temperature, Key, Porter)"
                className="w-full h-9 pl-9 pr-8 bg-subtle border border-border-default rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 bg-subtle border border-border-default rounded-full p-1 overflow-x-auto scrollbar-none bg-subtle/80 backdrop-blur-md">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-[transform,opacity,box-shadow,border-color] duration-150 duration-150 flex items-center gap-1.5 whitespace-nowrap select-none shrink-0 ${
                      isActive
                        ? 'bg-surface text-text-primary font-semibold shadow-elevation-1 border border-border-default'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-accent-subtle text-accent-base font-bold' : 'bg-muted-surface text-text-muted'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-subtle border border-border-default rounded-lg p-0.5 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-surface text-text-primary font-semibold shadow-elevation-1 border border-border-default'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Grouped View"
                aria-label="Grouped View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface text-text-primary font-semibold shadow-elevation-1 border border-border-default'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface text-text-primary font-semibold shadow-elevation-1 border border-border-default'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="List View"
                aria-label="List View"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. Module Display (Grouped Domain View, Compact Grid View, or List View) */}
          {filteredModules.length === 0 ? (
            <div className="text-center py-16 px-4 bg-surface border border-border-default rounded-xl">
              <p className="text-sm font-semibold text-text-primary mb-1">
                No modules found
              </p>
              <p className="text-xs text-text-muted mb-4">
                No active modules found matching your search.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 rounded-lg bg-surface-subtle text-text-primary border border-border-default hover:bg-surface-hover text-xs font-medium transition-colors"
              >
                Show All Modules
              </button>
            </div>
          ) : viewMode === 'grouped' && selectedCategory === 'all' ? (
            /* Domain Grouped Sections (Tailored with Native App Icons for Phone + Operations Cards for Desktop) */
            <div className="space-y-6 sm:space-y-8">
              
              {/* Quick Launch Strip (High Clinical & Operational Frequency) */}
              {!searchQuery.trim() && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-default/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-base" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Quick Launch
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent-subtle text-accent-base">
                        {quickLaunchModules.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                      Frequently accessed clinical &amp; operational tools
                    </span>
                  </div>

                  {/* Mobile: 4-Col App Grid */}
                  <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:hidden">
                    {quickLaunchModules.map((module) => (
                      <ModuleAppIcon key={`quick-${module.id}`} module={module} onClick={() => handleCardClick(module)} />
                    ))}
                  </div>

                  {/* Desktop: Sleek 4-Col Quick Launch Cards */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {quickLaunchModules.map((module) => (
                      <QuickLaunchCard key={`quick-${module.id}`} module={module} onClick={() => handleCardClick(module)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Group 1: Clinical & Pharmacy */}
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                      Clinical &amp; Pharmacy Modules
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-default text-text-secondary text-[11px] font-medium">
                      {clinicalModules.length} Modules
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                    Treatment, Prescriptions &amp; Pharmaceuticals
                  </span>
                </div>

                {/* Mobile: Native 4-Column App Grid */}
                <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:hidden">
                  {clinicalModules.map((module) => (
                    <ModuleAppIcon key={module.id} module={module} onClick={() => handleCardClick(module)} />
                  ))}
                </div>

                {/* Desktop: Structured Operations Cards */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {clinicalModules.map((module) => (
                    <ModuleCard key={module.id} module={module} onClick={() => handleCardClick(module)} language={language} />
                  ))}
                </div>
              </section>

              {/* Group 2: Logistics & Facilities */}
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                      Logistics, Inventory &amp; Facilities
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-default text-text-secondary text-[11px] font-medium">
                      {logisticsModules.length} Modules
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                    Stock, Transport &amp; Facility Management
                  </span>
                </div>

                {/* Mobile: Native 4-Column App Grid */}
                <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:hidden">
                  {logisticsModules.map((module) => (
                    <ModuleAppIcon key={module.id} module={module} onClick={() => handleCardClick(module)} />
                  ))}
                </div>

                {/* Desktop: Structured Operations Cards */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {logisticsModules.map((module) => (
                    <ModuleCard key={module.id} module={module} onClick={() => handleCardClick(module)} language={language} />
                  ))}
                </div>
              </section>

              {/* Group 3: Governance & Administration */}
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                      Governance, Records &amp; Administration
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-default text-text-secondary text-[11px] font-medium">
                      {governanceModules.length} Modules
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                    Access Control, Human Resources &amp; Archives
                  </span>
                </div>

                {/* Mobile: Native 4-Column App Grid */}
                <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:hidden">
                  {governanceModules.map((module) => (
                    <ModuleAppIcon key={module.id} module={module} onClick={() => handleCardClick(module)} />
                  ))}
                </div>

                {/* Desktop: Structured Operations Cards */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {governanceModules.map((module) => (
                    <ModuleCard key={module.id} module={module} onClick={() => handleCardClick(module)} language={language} />
                  ))}
                </div>
              </section>
            </div>
          ) : viewMode === 'list' ? (
            /* Detailed Table / List View (Native on both phone and desktop) */
            <div className="bg-surface border border-border-default rounded-2xl overflow-hidden divide-y divide-border-default shadow-elevation-1">
              {filteredModules.map((module) => {
                const Icon = module.icon
                const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => handleCardClick(module)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-surface-hover active:bg-surface-subtle transition-colors text-left group select-none min-h-[52px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface border ${style.border} ${style.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${style.text}`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent-base transition-colors truncate">
                            {module.name}
                          </h4>
                          <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-subtle text-text-muted border border-border-default uppercase">
                            {module.category === 'clinical' ? 'Clinical' : module.category === 'logistics' ? 'Logistics' : 'Admin'}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-base group-hover:translate-x-0.5 transition-colors" />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Flat Grid Mode (Compact 2-Column Cards on Mobile, 4-Column on Desktop) */
            <div>
              {/* Mobile: Compact 2-column touch cards */}
              <div className="grid grid-cols-2 gap-2 sm:hidden w-full">
                {filteredModules.map((module) => (
                  <ModuleCompactCard key={module.id} module={module} onClick={() => handleCardClick(module)} />
                ))}
              </div>

              {/* Desktop: Operations Cards */}
              <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-3.5 w-full">
                {filteredModules.map((module) => (
                  <ModuleCard key={module.id} module={module} onClick={() => handleCardClick(module)} language={language} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Admin Broadcast Notice Console Modal (Restricted to System Administrator) */}
      <AdminBroadcastModal
        isOpen={showAdminBroadcastModal}
        onClose={() => setShowAdminBroadcastModal(false)}
        announcements={announcements}
        onRefresh={fetchAnnouncementsData}
        language={language}
      />

      {/* System Update Log & Changelog Modal (Available to all users) */}
      <SystemUpdateLogModal
        isOpen={showUpdateLogModal}
        onClose={() => setShowUpdateLogModal(false)}
        logs={updateLogs}
        isLoading={isAnnouncementsLoading}
        language={language}
      />

      {/* Surprise / Under Development Modal */}
      <AnimatePresence>
        {showSurpriseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSurpriseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-surface border border-border-default rounded-xl p-6 text-center shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-12 h-12 bg-accent-subtle border border-accent-base/30 rounded-xl flex items-center justify-center mb-4 text-accent-base">
                <Sparkles className="w-6 h-6" />
              </div>

              <span className="px-2.5 py-0.5 bg-surface-subtle border border-border-default text-text-secondary text-[10px] font-semibold uppercase tracking-wider rounded-md mb-2 inline-block">
                {selectedModuleName}
              </span>

              <h3 className="font-serif text-lg font-medium text-text-primary tracking-tight mb-2">
                Module in Development
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed mb-5">
                This module is currently being finalized in accordance with Ministry of Health Malaysia operational standards.
              </p>

              <button
                type="button"
                onClick={() => setShowSurpriseModal(false)}
                className="w-full py-2.5 px-4 rounded-lg font-medium bg-ink text-ink-text hover:bg-ink-hover text-xs transition-colors shadow-elevation-1"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Mobile Native App Launcher Icon (Ultra-Clean, High Density Phone Ergonomics)
 */
interface ModuleAppIconProps {
  module: ModuleItem
  onClick: () => void
}

const ModuleAppIcon: React.FC<ModuleAppIconProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-start p-1 rounded-xl active:scale-95 transition-colors select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base min-h-[74px] w-full"
    >
      <div className={`relative w-12 h-12 rounded-2xl bg-surface border ${style.border} ${style.bg} flex items-center justify-center shadow-elevation-1 group-active:scale-95 transition-[transform,opacity,box-shadow,border-color]`}>
        <Icon className={`w-5.5 h-5.5 ${style.text}`} />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full" />
      </div>

      <span 
        title={module.name}
        className="text-[10px] font-medium text-text-primary group-hover:text-accent-base text-center leading-tight mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-[84px] px-0.5 tracking-tight transition-colors"
      >
        {module.name}
      </span>
    </button>
  )
}

/**
 * Mobile Compact 2-Column Touch Card
 */
interface ModuleCompactCardProps {
  module: ModuleItem
  onClick: () => void
}

const ModuleCompactCard: React.FC<ModuleCompactCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-surface/95 hover:-translate-y-0.5 active:scale-[0.98] border border-border-default hover:border-sky-500/35 transition-transform duration-200 cursor-pointer text-left select-none min-h-[54px] shadow-elevation-1 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"
    >
      <div className={`w-8 h-8 rounded-lg bg-surface-subtle border ${style.border} ${style.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${style.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent-base transition-colors truncate leading-tight">
          {module.name}
        </h4>
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block truncate mt-0.5">
          {module.category === 'clinical' ? 'Clinical' : module.category === 'logistics' ? 'Logistics' : 'Admin'}
        </span>
      </div>
    </div>
  )
}

/**
 * Desktop Structured Operations Card Component (Anti-Slop Enterprise Design)
 */
interface ModuleCardProps {
  module: ModuleItem
  onClick: () => void
  language?: 'ms' | 'en'
}

/**
 * Compact Quick Launch Card (Clinical Top Tier)
 */
const QuickLaunchCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-surface/95 hover:bg-surface-elevated border border-border-default border-t-white/10 dark:border-t-white/15 hover:border-accent-base/40 shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 active:scale-[0.98] transition-[transform,opacity,background-color,border-color,box-shadow,color] duration-150 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"
    >
      <div className={`w-9 h-9 rounded-lg bg-surface-subtle border ${style.border} ${style.bg} ${style.hoverBorder} flex items-center justify-center shrink-0 transition-colors shadow-sm`}>
        <Icon className={`w-4.5 h-4.5 ${style.text} group-hover:scale-105 transition-transform duration-150`} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-base transition-colors truncate leading-tight">
          {module.name}
        </h4>
        <p className="text-[11px] text-text-muted truncate mt-0.5">
          {module.shortName || module.description}
        </p>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-text-muted/50 group-hover:text-accent-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform,opacity,color] shrink-0" />
    </div>
  )
}

/**
 * Desktop Structured Operations Card (Modern Depth Standard)
 */
const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group relative flex flex-col justify-between p-4 rounded-xl bg-surface/95 hover:bg-surface-elevated backdrop-blur-sm border border-border-default border-t-white/10 dark:border-t-white/15 hover:border-accent-base/40 hover:-translate-y-1 active:scale-[0.98] transition-[transform,opacity,background-color,border-color,box-shadow,color] duration-200 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-elevation-1 hover:shadow-elevation-2 overflow-hidden"
    >
      <div>
        {/* Card Header: Icon & Subtle Launch Cue */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-surface-subtle border ${style.border} ${style.bg} ${style.hoverBorder} flex items-center justify-center shrink-0 transition-[transform,opacity,background-color,border-color,box-shadow,color] duration-200 shadow-sm`}>
            <Icon className={`w-5.5 h-5.5 ${style.text} group-hover:scale-110 transition-transform duration-200`} />
          </div>

          <div className="w-7 h-7 rounded-lg bg-surface-subtle/80 border border-border-default/60 flex items-center justify-center text-text-muted group-hover:text-accent-base group-hover:border-accent-base/40 group-hover:bg-accent-subtle/30 transition-[transform,opacity,background-color,border-color,box-shadow,color] duration-200">
            <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card Body: Module Name & Description */}
        <div>
          <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors tracking-tight leading-snug">
            {module.name}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1.5 min-h-[32px]">
            {module.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModuleHubPage
