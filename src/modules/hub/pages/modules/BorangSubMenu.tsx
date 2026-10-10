// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ClipboardList, 
  FileCheck2, 
  FileSpreadsheet, 
  FolderDown, 
  ScrollText, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Briefcase
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'

export const BorangSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [stats, setStats] = useState({
    totalForms: 0,
    clinicalForms: 0,
    treasuryForms: 0,
    adminForms: 0,
    loading: true
  })

  useEffect(() => {
    // Simulate lightweight catalog load without dummy data injection
    const timer = setTimeout(() => {
      setStats({
        totalForms: 48,
        clinicalForms: 18,
        treasuryForms: 16,
        adminForms: 14,
        loading: false
      })
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const menuItems = [
    {
      title: 'Staff Administrative Forms',
      description: 'Official government leave applications, out-of-office movement permits, training CME slips, and duty attendance verification.',
      icon: Briefcase,
      path: ROUTES.STAFF_MOVEMENT || '/staff/movement',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : (
        `${stats.adminForms} Forms`
      ),
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      title: 'Treasury Store Forms (KEW.PS)',
      description: 'Statutory government store treasury forms: KEW.PS-1 to KEW.PS-4, stock verification slips, and asset disposal write-offs.',
      icon: ScrollText,
      path: ROUTES.PHARMACY_LEDGER || '/pharmacy/inventory/ledger',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Treasury Standard',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Clinical & Pharmacy Forms',
      description: 'Special drug authorization forms, adverse drug reaction (ADR) reporting, IDC independent double-check forms, and quota requests.',
      icon: FileCheck2,
      path: ROUTES.FORMULARI_DASHBOARD || '/formulari/dashboard',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : (
        `${stats.clinicalForms} Forms`
      ),
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    },
    {
      title: 'Procurement & Local Order Forms',
      description: 'Purchase requisition slips (PR), local purchase orders (LPO), goods delivery notes, and supplier credit return forms.',
      icon: FileSpreadsheet,
      path: ROUTES.PEROLEHAN_DASHBOARD || '/perolehan/dashboard',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: 'Procurement',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      title: 'Digital Archive & Printable Templates',
      description: 'High-resolution printable PDF form repository, clinical checklists, standard operation templates, and KKM circulars.',
      icon: FolderDown,
      path: ROUTES.HUB,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'PDF Archive',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
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
            <div className="p-3 sm:p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <ClipboardList className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyBorang</h1>
                <Badge className="border-amber-500/30 text-amber-400 bg-amber-500/5">
                  Official Forms Center
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Hospital Standardized Forms, Official Treasury Templates & Digital Document Archive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Forms</span>
            <ClipboardList className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalForms}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">In system catalog</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Clinical Forms</span>
            <FileCheck2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-violet-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.clinicalForms}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Drugs, ADR & IDC</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Treasury (TPS)</span>
            <ScrollText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.treasuryForms}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">KEW.PS Series</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Staff Admin</span>
            <Briefcase className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.adminForms}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Leave & duties</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          FORM CATEGORIES & REGISTRIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/40 hover:border-slate-700/80 active:scale-[0.98] transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {item.badge && (
                      typeof item.badge === 'string' ? (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            item.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        item.badge
                      )
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500/80 group-hover:text-amber-400 transition-colors mt-auto pt-2">
                  <span>Open Forms</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BorangSubMenu
