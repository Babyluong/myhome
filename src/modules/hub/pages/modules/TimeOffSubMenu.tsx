// src/modules/hub/pages/modules/TimeOffSubMenu.tsx
// Luxury sub-menu hub for MyTimeOff module

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  LayoutDashboard,
  Plus,
  CalendarDays,
  FileText,
  Layers,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Badge } from '@/components/ui'
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
      title: isMs ? 'Papan Pemuka MyTimeOff' : 'MyTimeOff Main Dashboard',
      description: isMs
        ? 'Paparan baki jam cuti gantian semasa, penukaran hari setara, statistik kredit/debit, dan tindakan pantas.'
        : 'Overview of current Time Off balance, day-equivalent conversion, and recent transaction activities.',
      icon: LayoutDashboard,
      path: ROUTES.TIMEOFF_DASHBOARD,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: isMs ? `${balanceHours} Jam Baki` : `${balanceHours} Hours Left`,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      title: isMs ? 'Tuntut Cuti Gantian (Borang Baharu)' : 'Submit Time Off Claim (New Form)',
      description: isMs
        ? 'Borang rasmi memohon kredit jam cuti gantian: nyatakan tarikh, masa, lokasi, tugasan serta lampiran kad perakam waktu.'
        : 'Official submission form: declare overtime date, duration, location, tasks, and attendance card proof.',
      icon: Plus,
      path: ROUTES.TIMEOFF_CLAIM_NEW,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: isMs ? 'Permohonan Baharu' : 'New Claim',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    },
    {
      title: isMs ? 'Senarai Tuntutan Saya' : 'My Time Off Claims',
      description: isMs
        ? 'Semakan rekod semua tuntutan kerja lebih masa yang telah dihantar beserta status kelulusan penyelia.'
        : 'Track all submitted overtime claims, supervisor review status, and proof verification.',
      icon: FileText,
      path: ROUTES.TIMEOFF_MY_CLAIMS,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: pendingClaimsCount > 0 ? (isMs ? `${pendingClaimsCount} Menunggu` : `${pendingClaimsCount} Pending`) : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      title: isMs ? 'Penebusan Cuti Gantian' : 'Redeem Time Off',
      description: isMs
        ? 'Penebusan baki cuti gantian terkumpul untuk cuti rehat atau urusan kecemasan dengan pemotongan automatik.'
        : 'Request time off utilizing accumulated hours, with automatic balance deduction on approval.',
      icon: CalendarDays,
      path: ROUTES.TIMEOFF_REDEEM,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: isMs ? 'Potong Baki Auto' : 'Auto Deduct',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      title: isMs ? 'Sejarah Transaksi & Penyata Lejar' : 'History & Transaction Ledger',
      description: isMs
        ? 'Penyata lengkap aliran kredit dan debit jam cuti gantian mengikut tahun bertaraf rekod kewangan.'
        : 'Complete audit-ready ledger tracking earned credit hours and debited redemption leave.',
      icon: Layers,
      path: ROUTES.TIMEOFF_HISTORY,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: null,
      badgeColor: '',
    },
    {
      title: isMs ? 'Peti Kelulusan Penyelia (HOD)' : 'Supervisor Approval Queue',
      description: isMs
        ? 'Antaramuka pengesahan bagi penyelia dan ketua jabatan untuk mengesahkan bukti kad dan meluluskan baki cuti.'
        : 'Supervisor management interface to verify punch card evidence and approve hour credits/deductions.',
      icon: UserCheck,
      path: ROUTES.TIMEOFF_HOD,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: isMs ? 'Penyelia / HOD' : 'Supervisor / HOD',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* Back navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate(ROUTES.HUB)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>{isMs ? 'Kembali ke Hub Utama' : 'Back to Main Hub'}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl shadow-inner">
              <Clock className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">MyTimeOff</h1>
                <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">
                  {isMs ? 'Sistem Cuti Gantian' : 'Time Off System'}
                </Badge>
              </div>
              <p className="text-slate-400 mt-1">
                {isMs
                  ? 'Pengurusan Tuntutan Kerja Luar Waktu, Penebusan Cuti & Lejar Baki Jam'
                  : 'Compensatory Leave Claims, Auto-Deduction Redemptions & Hour Balances'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{isMs ? 'Baki Bersih Semasa' : 'Current Net Balance'}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-blue-400">
            {loading ? '...' : `${balanceHours} Jam`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isMs ? 'Boleh ditebus bila-bila masa' : 'Available for leave'}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{isMs ? 'Tuntutan Diluluskan' : 'Approved Claims'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-emerald-400">
            {loading ? '...' : approvedClaimsCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isMs ? 'Telah dikreditkan' : 'Hours credited'}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{isMs ? 'Menunggu Kelulusan' : 'Pending Claims'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-amber-400">
            {loading ? '...' : pendingClaimsCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isMs ? 'Tuntutan dalam semakan' : 'Awaiting HOD action'}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{isMs ? 'Permohonan Cuti' : 'Pending Redemptions'}</span>
            <CalendarDays className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-cyan-400">
            {loading ? '...' : pendingRedemptionsCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isMs ? 'Penebusan cuti aktif' : 'Active leave requests'}
          </p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">
          {isMs ? 'PILIHAN SUB-MODUL MYTIMEOFF' : 'MYTIMEOFF MODULES & OPERATIONS'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          item.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400/80 group-hover:text-blue-300 transition-colors mt-auto">
                  <span>{isMs ? 'Masuk Menu' : 'Open Module'}</span>
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
