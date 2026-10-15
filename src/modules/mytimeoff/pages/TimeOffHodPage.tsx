// src/modules/mytimeoff/pages/TimeOffHodPage.tsx
// Supervisor / HOD Approval Queue for MyTimeOff
// Auto-credits balance on claim approval, auto-deducts on redemption approval.

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, FileText, Calendar, ExternalLink, AlertCircle, Users, Check, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilClaims,
  getToilRedemptions,
  updateToilClaimStatus,
  updateToilRedemptionStatus,
  getDepartmentToilBalances
} from '@/modules/mytimeoff/services/toilService'
import type { ToilClaim, ToilRedemption, ToilBalance } from '@/shared/types/mytimeoff'
import { Button } from '@/components/ui'

export const TimeOffHodPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [activeTab, setActiveTab] = useState<'claims' | 'redemptions' | 'staff_balances'>('claims')
  const [pendingClaims, setPendingClaims] = useState<ToilClaim[]>([])
  const [pendingRedemptions, setPendingRedemptions] = useState<ToilRedemption[]>([])
  const [staffBalances, setStaffBalances] = useState<ToilBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<{
    type: 'claim' | 'redemption'
    id: string
    title: string
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const loadData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const deptId = user.department_id || undefined

      const [claimsRes, redRes, balRes] = await Promise.all([
        getToilClaims({ departmentId: deptId, status: 'pending' }),
        getToilRedemptions({ departmentId: deptId, status: 'pending' }),
        deptId ? getDepartmentToilBalances(deptId) : Promise.resolve({ data: [], error: null }),
      ])

      if (claimsRes.data) setPendingClaims(claimsRes.data)
      if (redRes.data) setPendingRedemptions(redRes.data)
      if (balRes.data) setStaffBalances(balRes.data)
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memuatkan senarai kelulusan' : 'Error loading approval queue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id, user?.department_id])

  // Approve Claim
  const handleApproveClaim = async (claim: ToilClaim) => {
    if (!user?.id) return
    const confirmed = window.confirm(
      isMs
        ? `Luluskan tuntutan ${claim.hours_worked} jam cuti gantian untuk ${claim.user?.full_name || 'staf'}? Baki akan dimasukkan secara automatik.`
        : `Approve ${claim.hours_worked} hours claim for ${claim.user?.full_name || 'staff'}? Hours will be auto-credited to balance.`
    )
    if (!confirmed) return

    try {
      setIsProcessing(true)
      const res = await updateToilClaimStatus(
        claim.id,
        'approved',
        user.id,
        undefined,
        user.full_name
      )
      if (res.data) {
        toast.success(
          isMs
            ? `Tuntutan ${claim.hours_worked} jam telah diluluskan! Baki staf telah dikemaskini.`
            : `Claim approved! Staff balance auto-credited.`
        )
        loadData()
      } else {
        toast.error(res.error || (isMs ? 'Gagal meluluskan tuntutan' : 'Failed to approve claim'))
      }
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memproses kelulusan' : 'Error processing approval')
    } finally {
      setIsProcessing(false)
    }
  }

  // Approve Redemption (Auto-deducts!)
  const handleApproveRedemption = async (redemption: ToilRedemption) => {
    if (!user?.id) return
    const confirmed = window.confirm(
      isMs
        ? `Luluskan permohonan cuti ${redemption.redeem_hours} jam untuk ${redemption.user?.full_name || 'staf'}? Baki cuti akan ditolak secara automatik.`
        : `Approve ${redemption.redeem_hours} hours leave redemption for ${redemption.user?.full_name || 'staff'}? Balance will be auto-deducted.`
    )
    if (!confirmed) return

    try {
      setIsProcessing(true)
      const res = await updateToilRedemptionStatus(
        redemption.id,
        'approved',
        user.id,
        undefined,
        user.full_name
      )
      if (res.data) {
        toast.success(
          isMs
            ? `Permohonan cuti diluluskan! ${redemption.redeem_hours} jam telah ditolak daripada baki staf.`
            : `Leave request approved! Hours auto-deducted from staff balance.`
        )
        loadData()
      } else {
        toast.error(res.error || (isMs ? 'Gagal meluluskan permohonan' : 'Failed to approve request'))
      }
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memproses kelulusan' : 'Error processing approval')
    } finally {
      setIsProcessing(false)
    }
  }

  // Confirm rejection
  const handleConfirmReject = async () => {
    if (!rejectingItem || !user?.id) return
    if (!rejectionReason.trim()) {
      toast.error(isMs ? 'Sila masukkan sebab penolakan' : 'Please enter rejection reason')
      return
    }

    try {
      setIsProcessing(true)
      if (rejectingItem.type === 'claim') {
        const res = await updateToilClaimStatus(
          rejectingItem.id,
          'rejected',
          user.id,
          rejectionReason.trim(),
          user.full_name
        )
        if (res.data) {
          toast.success(isMs ? 'Tuntutan telah ditolak' : 'Claim has been rejected')
          setRejectingItem(null)
          setRejectionReason('')
          loadData()
        } else {
          toast.error(res.error || (isMs ? 'Gagal menolak tuntutan' : 'Failed to reject'))
        }
      } else {
        const res = await updateToilRedemptionStatus(
          rejectingItem.id,
          'rejected',
          user.id,
          rejectionReason.trim(),
          user.full_name
        )
        if (res.data) {
          toast.success(isMs ? 'Permohonan cuti telah ditolak' : 'Leave request rejected')
          setRejectingItem(null)
          setRejectionReason('')
          loadData()
        } else {
          toast.error(res.error || (isMs ? 'Gagal menolak permohonan' : 'Failed to reject'))
        }
      }
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat semasa menolak' : 'Error rejecting')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-8 text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-subtle/50 border border-border-subtle rounded-2xl text-slate-400 hover:text-text-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-text-primary">
                {isMs ? 'Peti Kelulusan Penyelia (HOD)' : 'Supervisor Approval Queue'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                {pendingClaims.length + pendingRedemptions.length} {isMs ? 'Menunggu' : 'Pending'}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              {isMs
                ? 'Semakan bukti kad perakam waktu & pengesahan kredit / pemotongan automatik cuti gantian staf'
                : 'Inspect attendance proof, approve credits and auto-deduct leave redemptions'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-text-muted hover:bg-subtle'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isMs ? 'Tuntutan Jam Kerja Lebih Masa' : 'Overtime Claims'}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
            {pendingClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'redemptions'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-text-muted hover:bg-subtle'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isMs ? 'Permohonan Penebusan Cuti' : 'Leave Redemptions'}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
            {pendingRedemptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff_balances')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'staff_balances'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-text-muted hover:bg-subtle'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isMs ? 'Ringkasan Baki Staf Jabatan' : 'Staff Balances Overview'}</span>
        </button>
      </div>

      {/* Tab 1: Claims Approval Queue */}
      {activeTab === 'claims' && (
        <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-text-primary">
                {isMs ? 'Senarai Tuntutan Menunggu Kelulusan' : 'Pending Claims Queue'}
              </h3>
              <p className="text-xs text-slate-400">
                {isMs
                  ? 'Sila semak bukti kad perakam waktu sebelum mengesahkan kemasukan jam'
                  : 'Please inspect attendance proof before crediting hours'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600">
              {pendingClaims.length} {isMs ? 'Rekod Menunggu' : 'Pending'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-subtle/50 border-b border-border-subtle text-xs uppercase font-black text-text-muted">
                <tr>
                  <th className="px-6 py-4">{isMs ? 'Pemohon / Staf' : 'Staff Member'}</th>
                  <th className="px-6 py-4">{isMs ? 'Tarikh & Masa' : 'Date & Time'}</th>
                  <th className="px-6 py-4">{isMs ? 'Jam Dituntut' : 'Hours'}</th>
                  <th className="px-6 py-4">{isMs ? 'Lokasi & Perincian Kerja' : 'Location & Work Done'}</th>
                  <th className="px-6 py-4">{isMs ? 'Bukti Kad Kehadiran' : 'Attendance Proof'}</th>
                  <th className="px-6 py-4 text-center">{isMs ? 'Tindakan Kelulusan' : 'Decision'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted font-medium">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin text-blue-600" />
                        <span>{isMs ? 'Memuatkan senarai...' : 'Loading list...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : pendingClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted font-medium">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-text-muted">
                        {isMs ? 'Semua Tuntutan Selesai Diproses' : 'Approval Queue is Empty'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isMs
                          ? 'Tiada sebarang tuntutan kerja lebih masa yang menunggu kelulusan anda pada masa ini.'
                          : 'There are no pending claims awaiting your approval at this time.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  pendingClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary">
                          {claim.user?.full_name || 'Staf Hospital'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {claim.user?.jawatan || (isMs ? 'Pegawai Hospital' : 'Staff Officer')}
                        </div>
                        <div className="text-[11px] font-mono text-blue-600">
                          {claim.claim_no}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="font-bold text-text-primary">{claim.work_date}</div>
                        <div className="text-slate-400">
                          {claim.time_start} — {claim.time_end}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-lg font-black font-mono text-blue-600">
                          +{claim.hours_worked}
                        </span>{' '}
                        <span className="text-xs text-slate-400">{isMs ? 'Jam' : 'Hrs'}</span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-text-primary">{claim.location}</div>
                        <div className="text-text-muted max-w-xs mt-0.5 leading-relaxed">
                          {claim.work_description}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {claim.attachment_url ? (
                          <a
                            href={claim.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 hover:bg-blue-100 font-bold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isMs ? 'Lihat Bukti' : 'View Proof'}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">
                            {isMs ? 'Tiada bukti' : 'No attachment'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleApproveClaim(claim)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-3.5 py-1.5 flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isMs ? 'Luluskan' : 'Approve'}</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() =>
                              setRejectingItem({
                                type: 'claim',
                                id: claim.id,
                                title: `${claim.user?.full_name || 'Staf'} (${claim.hours_worked} Jam)`,
                              })
                            }
                            className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10 text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{isMs ? 'Tolak' : 'Reject'}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Redemptions Queue */}
      {activeTab === 'redemptions' && (
        <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-text-primary">
                {isMs ? 'Senarai Permohonan Cuti Gantian Menunggu' : 'Pending Redemptions Queue'}
              </h3>
              <p className="text-xs text-slate-400">
                {isMs
                  ? 'Kelulusan akan memotong baki jam staf secara automatik'
                  : 'Approval will automatically deduct requested hours from staff balance'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600">
              {pendingRedemptions.length} {isMs ? 'Menunggu' : 'Pending'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-subtle/50 border-b border-border-subtle text-xs uppercase font-black text-text-muted">
                <tr>
                  <th className="px-6 py-4">{isMs ? 'Pemohon / Staf' : 'Staff Member'}</th>
                  <th className="px-6 py-4">{isMs ? 'Tarikh Cuti Dipohon' : 'Leave Date'}</th>
                  <th className="px-6 py-4">{isMs ? 'Jam Hendak Ditebus' : 'Hours Requested'}</th>
                  <th className="px-6 py-4">{isMs ? 'Sebab Penebusan' : 'Reason'}</th>
                  <th className="px-6 py-4 text-center">{isMs ? 'Tindakan Kelulusan' : 'Decision'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-muted font-medium">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin text-blue-600" />
                        <span>{isMs ? 'Memuatkan...' : 'Loading...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : pendingRedemptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-muted font-medium">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-text-muted">
                        {isMs ? 'Tiada Permohonan Cuti Menunggu' : 'No Pending Leave Requests'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isMs
                          ? 'Semua permohonan penebusan cuti telah diproses.'
                          : 'All redemption requests have been processed.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  pendingRedemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary">
                          {r.user?.full_name || 'Staf'}
                        </div>
                        <div className="text-xs text-slate-400">{r.user?.jawatan}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {r.redemption_no}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono font-bold text-text-primary">
                        {r.redeem_date}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-lg font-black font-mono text-rose-600">
                          -{r.redeem_hours}
                        </span>{' '}
                        <span className="text-xs text-slate-400">{isMs ? 'Jam' : 'Hrs'}</span>
                      </td>

                      <td className="px-6 py-4 text-xs text-text-muted max-w-xs">
                        {r.reason || '-'}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleApproveRedemption(r)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-3.5 py-1.5 flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isMs ? 'Lulus & Tolak Baki' : 'Approve & Deduct'}</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() =>
                              setRejectingItem({
                                type: 'redemption',
                                id: r.id,
                                title: `${r.user?.full_name || 'Staf'} (${r.redeem_hours} Jam)`,
                              })
                            }
                            className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10 text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{isMs ? 'Tolak' : 'Reject'}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Department Staff Balances Overview */}
      {activeTab === 'staff_balances' && (
        <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="text-base font-black text-text-primary">
              {isMs ? 'Senarai Baki Cuti Gantian Staf Jabatan' : 'Department Staff Time Off Balances'}
            </h3>
            <p className="text-xs text-slate-400">
              {isMs
                ? 'Pemantauan kuota dan baki jam cuti gantian bagi seluruh kakitangan unit'
                : 'Quota and hour balance monitoring for all unit personnel'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-subtle/50 border-b border-border-subtle text-xs uppercase font-black text-text-muted">
                <tr>
                  <th className="px-6 py-4">{isMs ? 'Nama Staf' : 'Staff Name'}</th>
                  <th className="px-6 py-4">{isMs ? 'Jawatan' : 'Position'}</th>
                  <th className="px-6 py-4">{isMs ? 'Terkumpul (+)' : 'Total Earned (+)'}</th>
                  <th className="px-6 py-4">{isMs ? 'Ditebus (-)' : 'Total Redeemed (-)'}</th>
                  <th className="px-6 py-4">{isMs ? 'Baki Bersih Semasa' : 'Net Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium">
                {staffBalances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-muted font-medium">
                      {isMs
                        ? 'Tiada rekod baki staf jabatan dijumpai.'
                        : 'No department staff balance records found.'}
                    </td>
                  </tr>
                ) : (
                  staffBalances.map((b) => (
                    <tr key={b.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {b.user?.full_name || 'Staf'}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {b.user?.jawatan || '-'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                        +{b.total_hours_earned} Jam
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-600">
                        -{b.total_hours_used} Jam
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-black font-mono text-blue-700">
                          {b.balance_hours}
                        </span>{' '}
                        <span className="text-xs text-slate-400">{isMs ? 'Jam' : 'Hrs'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600 border-b border-border-subtle pb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-text-primary">
                {isMs ? 'Sebab Penolakan Permohonan' : 'Rejection Reason'}
              </h3>
            </div>

            <p className="text-xs text-text-muted">
              {isMs
                ? `Sila nyatakan sebab penolakan permohonan bagi ${rejectingItem.title}:`
                : `Please provide a reason for rejecting the application for ${rejectingItem.title}:`}
            </p>

            <textarea
              rows={3}
              placeholder={
                isMs
                  ? 'cth. Bukti kehadiran tidak jelas / tidak memenuhi syarat Perintah Am...'
                  : 'e.g. Inconclusive proof of attendance / does not meet General Orders criteria...'
              }
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border-default text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button
                variant="outline"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold"
              >
                {isMs ? 'Batal' : 'Cancel'}
              </Button>

              <Button
                disabled={isProcessing || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                {isMs ? 'Sahkan Penolakan' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeOffHodPage
