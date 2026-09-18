// Standardized MyTimeOff (Cuti Gantian) Dashboard Page

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CalendarDays,
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilBalance,
  getToilClaims,
  getToilRedemptions,
  getToilDashboardStats
} from '@/modules/mytimeoff/services/toilService'
import type { ToilClaim, ToilBalance, ToilDashboardStats } from '@/shared/types/mytimeoff'
import { Button, Badge } from '@/components/ui'

export const TimeOffDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [stats, setStats] = useState<ToilDashboardStats>({
    balanceHours: 0,
    totalEarnedHours: 0,
    totalUsedHours: 0,
    pendingClaimsCount: 0,
    pendingRedemptionsCount: 0,
    approvedClaimsCount: 0,
  })
  const [balance, setBalance] = useState<ToilBalance | null>(null)
  const [recentClaims, setRecentClaims] = useState<ToilClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentYear = new Date().getFullYear()

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const [statsRes, balRes, claimsRes] = await Promise.all([
        getToilDashboardStats(user.id, currentYear),
        getToilBalance(user.id, currentYear),
        getToilClaims({ userId: user.id, year: currentYear }),
      ])

      if (statsRes.data) setStats(statsRes.data)
      if (balRes.data) setBalance(balRes.data)
      if (claimsRes.data) setRecentClaims(claimsRes.data.slice(0, 5))
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memuatkan papan pemuka MyTimeOff' : 'Error loading MyTimeOff dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user?.id])

  // Conversion of hours to standard 8-hour work days
  const equivalentDays = useMemo(() => {
    const hours = stats.balanceHours || 0
    const days = Math.floor(hours / 8)
    const remHours = hours % 8
    return { days, remHours }
  }, [stats.balanceHours])

  return (
    <div className="p-6 md:p-8 w-full space-y-8 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800">
                {isMs ? 'MyTimeOff (Cuti Gantian)' : 'MyTimeOff'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {isMs ? `Tahun ${currentYear}` : `Year ${currentYear}`}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {isMs
                ? 'Sistem Tuntutan & Penebusan Cuti Gantian Mengikut Perintah Am Bab C & Arahan Perbendaharaan'
                : 'Time Off Claims & Leave Redemption System under General Orders Chapter C'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(ROUTES.TIMEOFF_REDEEM)}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>{isMs ? 'Tebus Cuti' : 'Redeem Time Off'}</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-md font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Mohon Cuti Gantian' : 'Submit Time Off Claim'}</span>
          </Button>
        </div>
      </div>

      {/* Main Balance Hero & KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Large Balance Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-6 opacity-15">
            <Sparkles className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20">
                {isMs ? 'Baki Bersih Semasa' : 'Current Net Balance'}
              </span>
              <span className="text-xs text-blue-100 font-mono font-bold">
                {isMs ? 'Kadar 1 Hari = 8 Jam' : 'Rate 1 Day = 8 Hours'}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                {stats.balanceHours}
              </span>
              <span className="text-lg font-bold text-blue-100">{isMs ? 'Jam' : 'Hours'}</span>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white/90 border border-white/15">
              <Award className="w-4 h-4 text-cyan-300" />
              <span>
                {isMs
                  ? `Setara dengan: ${equivalentDays.days} Hari ${equivalentDays.remHours > 0 ? `${equivalentDays.remHours} Jam` : ''}`
                  : `Equivalent: ${equivalentDays.days} Days ${equivalentDays.remHours > 0 ? `${equivalentDays.remHours} Hours` : ''}`}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-blue-200 font-medium block">
                {isMs ? 'Jumlah Terkumpul' : 'Total Earned'}
              </span>
              <span className="text-xl font-mono font-black text-white">
                {stats.totalEarnedHours} {isMs ? 'jam' : 'hrs'}
              </span>
            </div>
            <div>
              <span className="text-xs text-blue-200 font-medium block">
                {isMs ? 'Telah Ditebus' : 'Total Redeemed'}
              </span>
              <span className="text-xl font-mono font-black text-white">
                {stats.totalUsedHours} {isMs ? 'jam' : 'hrs'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Stat Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Pending Claims */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="p-6 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {isMs ? 'Menunggu Kelulusan HOD' : 'Pending HOD Approval'}
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-slate-800">
                {stats.pendingClaimsCount}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isMs ? 'Permohonan kerja lebih masa' : 'Overtime claims awaiting approval'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>{isMs ? 'Lihat Tuntutan' : 'View Claims'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Approved Claims */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="p-6 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {isMs ? 'Tuntutan Diluluskan' : 'Approved Claims'}
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-emerald-600">
                {stats.approvedClaimsCount}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isMs ? 'Baki masa telah dimasukkan' : 'Hours credited to balance'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>{isMs ? 'Sejarah Tuntutan' : 'Claim History'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Pending Redemptions */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_HISTORY)}
            className="p-6 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {isMs ? 'Penebusan Menunggu' : 'Pending Redemptions'}
              </span>
              <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-slate-800">
                {stats.pendingRedemptionsCount}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isMs ? 'Permohonan cuti gantian' : 'Time Off leave requests'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>{isMs ? 'Status Penebusan' : 'Redemption Status'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Quick Policy Reference */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isMs ? 'Panduan Perintah Am' : 'General Orders Guideline'}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 mt-3 leading-relaxed">
              <p>
                <strong>{isMs ? 'Perintah Am Bab C (Cuti):' : 'General Orders Chapter C:'}</strong>{' '}
                {isMs
                  ? 'Cuti Gantian boleh dipohon bagi kerja pada Hari Rehat Mingguan, Cuti Umum atau kerja lebih masa melebihi 8 jam.'
                  : 'Time Off is granted for work performed on rest days, public holidays, or overtime.'}
              </p>
              <p className="text-slate-500">
                {isMs
                  ? 'Kad perakam waktu / surat tugas wajib dimuat naik sebagai bukti rasmi.'
                  : 'Attendance card / duty letter must be uploaded as proof.'}
              </p>
            </div>
            <div className="mt-4 pt-2 text-[11px] font-mono text-slate-400">
              Hospital Lawas • Sistem HOMES
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
          className="p-5 rounded-2xl bg-white border border-slate-100 shadow-md hover:border-blue-400 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {isMs ? 'Tuntut Cuti Gantian' : 'Submit Claim'}
            </div>
            <div className="text-xs text-slate-400">
              {isMs ? 'Hantar bukti kerja lebih masa' : 'Submit overtime proof'}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_REDEEM)}
          className="p-5 rounded-2xl bg-white border border-slate-100 shadow-md hover:border-blue-400 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {isMs ? 'Penebusan Cuti' : 'Redeem Time Off'}
            </div>
            <div className="text-xs text-slate-400">
              {isMs ? 'Gunakan baki jam bercuti' : 'Use hours for holiday'}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
          className="p-5 rounded-2xl bg-white border border-slate-100 shadow-md hover:border-blue-400 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {isMs ? 'Senarai Tuntutan' : 'My Claims'}
            </div>
            <div className="text-xs text-slate-400">
              {isMs ? 'Semak status kelulusan' : 'Check approval status'}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_HISTORY)}
          className="p-5 rounded-2xl bg-white border border-slate-100 shadow-md hover:border-blue-400 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {isMs ? 'Penyata & Sejarah' : 'Ledger & History'}
            </div>
            <div className="text-xs text-slate-400">
              {isMs ? 'Rekod keluar/masuk jam' : 'Hours in/out transactions'}
            </div>
          </div>
        </button>
      </div>

      {/* Recent Claims Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                {isMs ? 'Tuntutan Cuti Gantian Terkini' : 'Recent Time Off Claims'}
              </h3>
              <p className="text-xs text-slate-400">
                {isMs ? '5 rekod terkini yang dihantar' : 'Latest 5 submitted claims'}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-bold"
          >
            <span>{isMs ? 'Lihat Semua' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">{isMs ? 'No. Tuntutan' : 'Claim No'}</th>
                <th className="px-6 py-4">{isMs ? 'Tarikh & Masa' : 'Date & Time'}</th>
                <th className="px-6 py-4">{isMs ? 'Jenis Kerja' : 'Work Type'}</th>
                <th className="px-6 py-4">{isMs ? 'Jam Dituntut' : 'Hours Claimed'}</th>
                <th className="px-6 py-4">{isMs ? 'Lokasi & Perincian' : 'Location & Details'}</th>
                <th className="px-6 py-4">{isMs ? 'Status' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-blue-600" />
                      <span>{isMs ? 'Memuatkan data...' : 'Loading data...'}</span>
                    </div>
                  </td>
                </tr>
              ) : recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-600">
                        {isMs ? 'Tiada Rekod Tuntutan Dijumpai' : 'No Claim Records Found'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isMs
                          ? 'Anda belum menghantar sebarang tuntutan cuti gantian untuk tahun ini.'
                          : 'You have not submitted any claims for this year.'}
                      </p>
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
                          className="bg-blue-600 text-white rounded-xl text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          {isMs ? 'Hantar Tuntutan Baharu' : 'Submit New Claim'}
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentClaims.map((claim) => {
                  const isApproved = claim.status === 'approved'
                  const isPending = claim.status === 'pending'
                  const isRejected = claim.status === 'rejected'
                  const isCancelled = claim.status === 'cancelled'

                  const workTypeLabel =
                    claim.work_type === 'rest_day'
                      ? isMs ? 'Hari Rehat' : 'Rest Day'
                      : claim.work_type === 'public_holiday'
                      ? isMs ? 'Cuti Umum' : 'Public Holiday'
                      : isMs ? 'Kerja Lebih Masa (OT)' : 'Overtime'

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        {claim.claim_no || 'REF-TIMEOFF'}
                      </td>

                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="font-bold text-slate-800">{claim.work_date}</div>
                        <div className="text-slate-400">
                          {claim.time_start} - {claim.time_end}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {workTypeLabel}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-base font-black font-mono text-blue-600">
                          {claim.hours_worked}
                        </span>{' '}
                        <span className="text-xs text-slate-400">{isMs ? 'Jam' : 'Hrs'}</span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-slate-800">{claim.location}</div>
                        <div className="text-slate-400 max-w-xs truncate">
                          {claim.work_description}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isMs ? 'Diluluskan' : 'Approved'}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            {isMs ? 'Menunggu Kelulusan' : 'Pending'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {isMs ? 'Ditolak' : 'Rejected'}
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {isMs ? 'Dibatalkan' : 'Cancelled'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TimeOffDashboardPage
