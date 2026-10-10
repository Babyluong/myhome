// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Percent,
  PieChart,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Calendar,
  Layers,
  Wallet
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getWarrants } from '@/modules/financial/services/warrantService'

export const WarrantSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  const [stats, setStats] = useState({
    totalWarrants: 0,
    totalAllocation: 0,
    totalSpent: 0,
    remainingBalance: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getWarrants(hospitalId)
        const warrants = res.data || []
        
        let alloc = 0
        let spent = 0

        warrants.forEach((w: any) => {
          alloc += Number(w.allocation_amount || w.amount || 0)
          spent += Number(w.spent_amount || 0)
        })

        const balance = alloc - spent

        setStats({
          totalWarrants: warrants.length,
          totalAllocation: alloc,
          totalSpent: spent,
          remainingBalance: balance,
          loading: false
        })
      } catch (err) {
        console.error('Failed to load MyWarrant submenu stats', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [hospitalId])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const menuItems = [
    {
      title: 'Financial & Warrant Dashboard',
      description: 'Holistic hospital financial overview, live remaining balances, and multi-vote fund utilization analytics.',
      icon: LayoutDashboard,
      path: ROUTES.PHARMACY_FINANCIAL,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.totalWarrants > 0 ? (
        `${stats.totalWarrants} Warrants`
      ) : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      title: 'Warrant Allocation Register',
      description: 'Official government treasury warrant registry, vote code assignments (APPL, CC, LP), and top-up trails.',
      icon: FileText,
      path: ROUTES.PHARMACY_WARRANT,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'Treasury Vote',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40'
    },
    {
      title: 'APPL Allocation Management',
      description: 'National APPL concession ceiling controls, PO commitments, and real-time available ceiling balance.',
      icon: DollarSign,
      path: ROUTES.PHARMACY_APPL_ALLOCATION,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: null
    },
    {
      title: 'Central Contract (CC) Allocation',
      description: 'Centralized MOH procurement contract fund tracking, order commitments, and allocation limits.',
      icon: Layers,
      path: ROUTES.PHARMACY_CC_ALLOCATION,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: null
    },
    {
      title: 'Local Purchase (LP) Allocation',
      description: 'Local market purchase allocations, emergency orders, local purchase orders (LPO), and vendor disbursements.',
      icon: Wallet,
      path: ROUTES.PHARMACY_LP_ALLOCATION,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: null
    },
    {
      title: 'Budget Forecasting & Liabilities',
      description: 'Year-end financial burn-rate forecasting, pending order liabilities, and vote virements recommendations.',
      icon: TrendingUp,
      path: ROUTES.PHARMACY_FORECAST,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Forecast',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      title: 'Financial Reports & Audit Trails',
      description: 'Official government financial expenditure statements, audit logs, and monthly reconciliation summaries.',
      icon: BarChart3,
      path: ROUTES.PHARMACY_REPORTS_FINANCIAL,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: 'Audit Ready',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
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
            <div className="p-3 sm:p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <FileText className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyWarrant</h1>
                <Badge className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                  Financial Warrant Management
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Treasury Warrant Allocation Controls, PO Commitments & Hospital Budget Forecasting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Warrants</span>
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalWarrants}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Received this year</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Allocation</span>
            <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-24 bg-slate-800/80 rounded-lg inline-block" /> : formatCurrency(stats.totalAllocation)}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Approved ceiling funds</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Committed / Spent</span>
            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-24 bg-slate-800/80 rounded-lg inline-block" /> : formatCurrency(stats.totalSpent)}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Orders & paid</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Net Remaining</span>
            <Wallet className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-24 bg-slate-800/80 rounded-lg inline-block" /> : formatCurrency(stats.remainingBalance)}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Available for orders</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYWARRANT MODULES & OPERATIONS
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500/80 group-hover:text-emerald-400 transition-colors mt-auto pt-2">
                  <span>Open Module</span>
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

export default WarrantSubMenu
