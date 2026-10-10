// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  AirVent, 
  Activity, 
  Database, 
  ShoppingCart, 
  QrCode, 
  ScrollText, 
  FileText, 
  BarChart3, 
  Wrench,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getOxygenCylinders } from '@/modules/mycylinder/services/oxygenService'

export const CylinderSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || 'hosp-1'

  const [stats, setStats] = useState({
    totalCylinders: 0,
    fullCylinders: 0,
    inUseCylinders: 0,
    emptyCylinders: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getOxygenCylinders(hospitalId, {}, 1, 1000)
        const list = res.data?.data || []
        const total = list.length
        const full = list.filter((c: any) => c.status === 'full').length
        const inUse = list.filter((c: any) => c.status === 'in_use').length
        const empty = list.filter((c: any) => c.status === 'empty' || c.status === 'maintenance').length

        setStats({
          totalCylinders: total,
          fullCylinders: full,
          inUseCylinders: inUse,
          emptyCylinders: empty,
          loading: false
        })
      } catch (err) {
        console.error('Failed to load MyCylinder submenu stats', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [hospitalId])

  const subModules = [
    {
      title: 'Oxygen Dashboard',
      description: 'Overview of live oxygen cylinder capacity, utilization, and supplier delivery logs.',
      href: ROUTES.PHARMACY_OXYGEN,
      icon: Activity,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'Main',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      title: 'Cylinder Inventory',
      description: 'Full cylinder fleet registry, loan status tracking, and physical store balance.',
      href: ROUTES.PHARMACY_OXYGEN_CYLINDERS,
      icon: Database,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.totalCylinders > 0 ? (
        `${stats.totalCylinders} Units`
      ) : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      title: 'Cylinder Request',
      description: 'Department oxygen request workflow, clinical approvals, and cylinder dispatch.',
      href: ROUTES.PHARMACY_OXYGEN_CONSUMPTION,
      icon: ShoppingCart,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: null
    },
    {
      title: 'QR Generator',
      description: 'Generate and print physical QR code tags for instant cylinder scanning and audits.',
      href: '/pharmacy/oxygen/qr',
      icon: QrCode,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'QR Code',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      title: 'KEW.PS-4 Cylinder Ledger',
      description: 'Official government treasury stock ledger, supplier DO records, ward dispatches, and store verifications.',
      href: ROUTES.PHARMACY_OXYGEN_LEDGER,
      icon: ScrollText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Treasury Standard',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Stock Reconciliation',
      description: 'Physical cylinder audit reconciliations and variance adjustments.',
      href: '/pharmacy/oxygen/reconciliation',
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: null
    },
    {
      title: 'Cylinder Report',
      description: 'Executive analytics, warrant expenditure, ward consumption breakdown, and forecasting.',
      href: ROUTES.PHARMACY_OXYGEN_REPORTS,
      icon: BarChart3,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Analytics',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      title: 'Cylinder Maintenance',
      description: 'Hydrostatic pressure test logs, safety valve inspections, and maintenance tracking.',
      href: '/pharmacy/oxygen/maintenance',
      icon: Wrench,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: null
    }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* Back navigation */}
      <div className="mb-6 sm:mb-8">
        <button 
          onClick={() => navigate(ROUTES.HUB)}
          className="min-h-[44px] flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 sm:mb-6 group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Main Hub</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-3 sm:p-3.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <AirVent className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyCylinder</h1>
                <Badge className="border-teal-500/30 text-teal-400 bg-teal-500/5">
                  Medical Oxygen Hub
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Medical Oxygen & Cylinder Management Ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Cylinders</span>
            <AirVent className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalCylinders}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Facility inventory</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Full (Available)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.fullCylinders}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Ready for issue</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">In Use</span>
            <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.inUseCylinders}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">In ward / unit</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Empty / Servicing</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.emptyCylinders}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Requires refilling</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYCYLINDER MODULES & OPERATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {subModules.map((mod, idx) => {
            const Icon = mod.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(mod.href)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:bg-slate-800/40 hover:border-teal-500/40 active:scale-[0.98] transition-all duration-200 shadow-xl rounded-2xl p-4 sm:p-6 flex flex-col justify-between min-h-[170px] cursor-pointer relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${mod.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {mod.badge && (
                      typeof mod.badge === 'string' ? (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${mod.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'}`}>
                          {mod.badge}
                        </span>
                      ) : (
                        mod.badge
                      )
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-400 transition-colors mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 mt-auto flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                  <span>Open Module</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CylinderSubMenu
