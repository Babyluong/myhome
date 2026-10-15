// src/modules/hub/pages/modules/TimeOffSubMenu.tsx
// Luxury sub-menu hub for MyTimeOff module

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, LayoutDashboard, Plus, CalendarDays, FileText, Layers, UserCheck, CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Badge, Skeleton } from '@/components/ui'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { useAuthStore } from '@/stores/authStore'
import {
  getToilBalance,
  getToilClaims,
  getToilRedemptions
} from '@/modules/mytimeoff/services/toilService'

export const TimeOffSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const user = useAuthStore((state) => state.user)

  const [balanceHours, setBalanceHours] = useState(0)
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0)
  const [approvedClaimsCount, setApprovedClaimsCount] = useState(0)
  const [pendingRedemptionsCount, setPendingRedemptionsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return
      try {
        setLoading(true)
        const [balRes, claimsRes, redRes] = await Promise.all([
          getToilBalance(user.id),
          getToilClaims({ userId: user.id }),
          getToilRedemptions({ userId: user.id }),
        ])

        if (balRes.data) setBalanceHours(balRes.data.balance_hours || 0)
        if (claimsRes.data) {
          setPendingClaimsCount(claimsRes.data.filter((c) => c.status === 'pending').length)
          setApprovedClaimsCount(claimsRes.data.filter((c) => c.status === 'approved').length)
        }
        if (redRes.data) {
          setPendingRedemptionsCount(redRes.data.filter((r) => r.status === 'pending').length)
        }
      } catch (e) {
        console.error('Failed to load MyTimeOff submenu stats', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user?.id])

  const menuItems = [
    {
      title: 'MyTimeOff Main Dashboard',
      description: 'Overview of current Time Off balance, day-equivalent conversion, and recent transaction activities.',
      icon: LayoutDashboard,
      path: ROUTES.TIMEOFF_DASHBOARD,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-20 rounded-full" />
      ) : (
        `${balanceHours} Hours Left`
      ),
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      title: 'Submit Time Off Claim (New Form)',
      description: 'Official submission form: declare overtime date, duration, location, tasks, and attendance card proof.',
      icon: Plus,
      path: ROUTES.TIMEOFF_CLAIM_NEW,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'New Claim',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    },
    {
      title: 'My Time Off Claims',
      description: 'Track all submitted overtime claims, supervisor review status, and proof verification.',
      icon: FileText,
      path: ROUTES.TIMEOFF_MY_CLAIMS,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : pendingClaimsCount > 0 ? (
        `${pendingClaimsCount} Pending`
      ) : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      title: 'Redeem Time Off',
      description: 'Request time off utilizing accumulated hours, with automatic balance deduction on approval.',
      icon: CalendarDays,
      path: ROUTES.TIMEOFF_REDEEM,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Auto Deduct',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      title: 'History & Transaction Ledger',
      description: 'Complete audit-ready ledger tracking earned credit hours and debited redemption leave.',
      icon: Layers,
      path: ROUTES.TIMEOFF_HISTORY,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: null,
      badgeColor: '',
    },
    {
      title: 'Supervisor Approval Queue',
      description: 'Supervisor management interface to verify punch card evidence and approve hour credits/deductions.',
      icon: UserCheck,
      path: ROUTES.TIMEOFF_HOD,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'Supervisor / HOD',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
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
            <div className="p-3 sm:p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Clock className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyTimeOff</h1>
                <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">
                  Time Off System
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Compensatory Leave Claims, Auto-Deduction Redemptions & Hour Balances
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Current Net Balance</span>
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-blue-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-20 bg-slate-800/80 rounded-lg inline-block" /> : `${balanceHours} Hours`}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">
            Available for leave
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Approved Claims</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : approvedClaimsCount}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">
            Hours credited
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : pendingClaimsCount}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">
            Awaiting HOD action
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Pending Redemptions</span>
            <CalendarDays className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : pendingRedemptionsCount}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">
            Active leave requests
          </p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYTIMEOFF MODULES & OPERATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/40 hover:border-slate-700/80 active:scale-[0.98] transition-colors duration-150 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] cursor-pointer"
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400/80 group-hover:text-blue-300 transition-colors mt-auto pt-2">
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

export default TimeOffSubMenu
