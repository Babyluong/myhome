// Time Off Redemption History & Account Ledger Timeline

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilRedemptions,
  getToilBalance,
  getToilClaims
} from '@/modules/mytimeoff/services/toilService'
import type { ToilRedemption, ToilBalance, ToilClaim } from '@/shared/types/mytimeoff'
import { Button } from '@/components/ui'

export const TimeOffHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [activeTab, setActiveTab] = useState<'redemptions' | 'timeline'>('redemptions')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const [balance, setBalance] = useState<ToilBalance | null>(null)
  const [redemptions, setRedemptions] = useState<ToilRedemption[]>([])
  const [claims, setClaims] = useState<ToilClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const [balRes, redRes, claimRes] = await Promise.all([
        getToilBalance(user.id, selectedYear),
        getToilRedemptions({ userId: user.id, year: selectedYear }),
        getToilClaims({ userId: user.id, year: selectedYear }),
      ])

      if (balRes.data) setBalance(balRes.data)
      if (redRes.data) setRedemptions(redRes.data)
      if (claimRes.data) setClaims(claimRes.data)
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memuatkan rekod sejarah' : 'Error loading history records')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id, selectedYear])

  // Combined ledger entries sorted chronologically
  const ledgerEntries = useMemo(() => {
    const list: Array<{
      id: string
      date: string
      type: 'credit' | 'debit'
      title: string
      hours: number
      reference: string
      status: string
      notes?: string
    }> = []

    claims
      .filter((c) => c.status === 'approved')
      .forEach((c) => {
        list.push({
          id: c.id,
          date: c.work_date,
          type: 'credit',
          title: isMs ? 'Kerja Lebih Masa (Kredit)' : 'Time Off Credit Earned',
          hours: Number(c.hours_worked),
          reference: c.claim_no || 'REF-CREDIT',
          status: 'approved',
          notes: `${c.location} • ${c.work_description}`,
        })
      })

    redemptions
      .filter((r) => r.status === 'approved')
      .forEach((r) => {
        list.push({
          id: r.id,
          date: r.redeem_date,
          type: 'debit',
          title: isMs ? 'Cuti Ditebus (Debit)' : 'Leave Redeemed',
          hours: Number(r.redeem_hours),
          reference: r.redemption_no || 'REF-DEBIT',
          status: 'approved',
          notes: r.reason || (isMs ? 'Cuti rehat berganti' : 'Compensatory leave'),
        })
      })

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [claims, redemptions, isMs])

  return (
    <div className="p-6 md:p-8 w-full space-y-8 text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-subtle/50 border border-border-subtle rounded-2xl text-slate-400 hover:text-text-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2">
              {isMs ? 'Sejarah & Penyata Cuti Gantian' : 'Time Off Ledger & History'}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              {isMs
                ? 'Rekod transaksi kredit & debit jam cuti gantian serta status permohonan cuti'
                : 'Credit and debit ledger records and leave redemption status'}
            </p>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">{isMs ? 'Tahun:' : 'Year:'}</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-border-default text-sm font-mono font-bold bg-surface text-text-primary"
          >
            {[2026, 2025, 2024].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-surface border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>{isMs ? 'Jumlah Terkumpul (+)' : 'Total Earned (+)'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600">
              {balance?.total_hours_earned || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">{isMs ? 'Jam' : 'Hours'}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>{isMs ? 'Jumlah Ditebus (-)' : 'Total Redeemed (-)'}</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600">
              {balance?.total_hours_used || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">{isMs ? 'Jam' : 'Hours'}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
          <div className="flex items-center justify-between text-xs text-blue-100 font-bold uppercase">
            <span>{isMs ? 'Baki Bersih Semasa' : 'Current Net Balance'}</span>
            <Clock className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {balance?.balance_hours || 0}
            </span>
            <span className="text-xs text-blue-200 font-bold">{isMs ? 'Jam' : 'Hours'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'redemptions'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-text-muted hover:bg-subtle'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>{isMs ? 'Permohonan Penebusan Cuti' : 'Redemption Requests'}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
            {redemptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-text-muted hover:bg-subtle'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isMs ? 'Penyata Transaksi Lejar' : 'Account Transaction Ledger'}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
            {ledgerEntries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Redemptions Table */}
      {activeTab === 'redemptions' && (
        <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-subtle/50 border-b border-border-subtle text-xs uppercase font-black text-text-muted">
                <tr>
                  <th className="px-6 py-4">{isMs ? 'No. Rujukan' : 'Ref No'}</th>
                  <th className="px-6 py-4">{isMs ? 'Tarikh Cuti' : 'Leave Date'}</th>
                  <th className="px-6 py-4">{isMs ? 'Jam Ditebus' : 'Hours'}</th>
                  <th className="px-6 py-4">{isMs ? 'Sebab Penebusan' : 'Reason'}</th>
                  <th className="px-6 py-4">{isMs ? 'Status' : 'Status'}</th>
                  <th className="px-6 py-4">{isMs ? 'Kelulusan Pegawai' : 'Approval Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted font-medium">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin text-blue-600" />
                        <span>{isMs ? 'Memuatkan data...' : 'Loading data...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted font-medium">
                      <div className="space-y-2">
                        <p className="font-semibold text-text-muted">
                          {isMs ? 'Tiada Rekod Penebusan Dijumpai' : 'No Redemptions Recorded'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isMs
                            ? 'Anda belum membuat sebarang permohonan cuti gantian.'
                            : 'You have not submitted any redemption requests.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  redemptions.map((r) => {
                    const isApproved = r.status === 'approved'
                    const isPending = r.status === 'pending'
                    const isRejected = r.status === 'rejected'

                    return (
                      <tr key={r.id} className="hover:bg-subtle/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-text-primary text-xs">
                          {r.redemption_no || 'RDM-REF'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-text-primary">
                          {r.redeem_date}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-black font-mono text-blue-600">
                            {r.redeem_hours}
                          </span>{' '}
                          <span className="text-xs text-slate-400">{isMs ? 'Jam' : 'Hrs'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted max-w-xs truncate">
                          {r.reason || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isMs ? 'Diluluskan' : 'Approved'}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" />
                              {isMs ? 'Menunggu Kelulusan' : 'Pending'}
                            </span>
                          )}
                          {isRejected && (
                            <span
                              title={r.rejection_reason || ''}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {isMs ? 'Ditolak' : 'Rejected'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {r.approved_by ? (
                            <div>
                              <div className="font-bold text-text-primary">
                                {r.approver?.full_name || (isMs ? 'Penyelia' : 'Supervisor')}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {r.approved_at ? new Date(r.approved_at).toLocaleDateString() : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              {isMs ? 'Menunggu tindakan' : 'Awaiting action'}
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
      )}

      {/* Tab 2: Transaction Ledger Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="text-base font-black text-text-primary">
              {isMs ? 'Penyata Aliran Jam Cuti Gantian' : 'Hours Movement Ledger'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {ledgerEntries.length} {isMs ? 'Transaksi Selesai' : 'Transactions'}
            </span>
          </div>

          {ledgerEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-text-muted">
                {isMs ? 'Tiada Transaksi Diluluskan' : 'No Approved Transactions'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isMs
                  ? 'Sebarang tuntutan atau cuti yang telah diluluskan oleh penyelia akan direkodkan di sini.'
                  : 'Approved claims or redemptions will be recorded here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ledgerEntries.map((item) => {
                const isCredit = item.type === 'credit'
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-border-subtle hover:border-border-default transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-3 rounded-2xl ${
                          isCredit
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {isCredit ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary text-sm">{item.title}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-subtle text-text-muted">
                            {item.reference}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{item.notes}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-black font-mono ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isCredit ? `+${item.hours}` : `-${item.hours}`} {isMs ? 'Jam' : 'Hrs'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{item.date}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeOffHistoryPage
