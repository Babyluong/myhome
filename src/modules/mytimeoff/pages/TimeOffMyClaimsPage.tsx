// Staff Time Off Claims History & Management Page

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, ArrowLeft, Clock, CheckCircle2, AlertCircle, ExternalLink, Search, Eye, Trash2, FileCheck, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilClaims,
  cancelToilClaim
} from '@/modules/mytimeoff/services/toilService'
import type { ToilClaim } from '@/shared/types/mytimeoff'
import { Button } from '@/components/ui'

export const TimeOffMyClaimsPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [claims, setClaims] = useState<ToilClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // Details Modal
  const [activeModalClaim, setActiveModalClaim] = useState<ToilClaim | null>(null)

  const loadClaims = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const res = await getToilClaims({
        userId: user.id,
        year: selectedYear,
      })
      if (res.data) setClaims(res.data)
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat memuatkan senarai tuntutan' : 'Error loading claims list')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [user?.id, selectedYear])

  const handleCancelClaim = async (claimId: string) => {
    if (!user?.id) return
    const confirmed = window.confirm(
      isMs
        ? 'Adakah anda pasti untuk membatalkan tuntutan ini?'
        : 'Are you sure you want to cancel this claim?'
    )
    if (!confirmed) return

    try {
      const res = await cancelToilClaim(claimId, user.id)
      if (res.data) {
        toast.success(isMs ? 'Tuntutan berjaya dibatalkan' : 'Claim cancelled successfully')
        loadClaims()
      } else {
        toast.error(res.error || (isMs ? 'Gagal membatalkan tuntutan' : 'Failed to cancel claim'))
      }
    } catch (err) {
      console.error(err)
      toast.error(isMs ? 'Ralat membatalkan tuntutan' : 'Error cancelling claim')
    }
  }

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (statusFilter !== 'all' && claim.status !== statusFilter) return false
      if (typeFilter !== 'all' && claim.work_type !== typeFilter) return false
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchesRef = claim.claim_no?.toLowerCase().includes(term)
        const matchesLoc = claim.location?.toLowerCase().includes(term)
        const matchesDesc = claim.work_description?.toLowerCase().includes(term)
        if (!matchesRef && !matchesLoc && !matchesDesc) return false
      }
      return true
    })
  }, [claims, statusFilter, typeFilter, searchTerm])

  return (
    <div className="p-6 md:p-8 w-full space-y-8 text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-surface border border-border-default" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-subtle/50 border border-border-subtle rounded-2xl text-slate-400 hover:text-text-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2">
              {isMs ? 'Senarai Tuntutan Cuti Gantian Saya' : 'My Time Off Claims'}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              {isMs
                ? 'Semakan status permohonan waktu kerja tambahan dan kelulusan penyelia'
                : 'Review overtime submission records and supervisor approval progress'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md font-bold flex items-center gap-2 px-5 py-2.5 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Tuntut Cuti Gantian' : 'New Claim'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-surface border border-border-subtle shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={isMs ? 'Cari no. rujukan, lokasi, tugasan...' : 'Search ref no, location, task...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-default text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-border-default text-sm bg-surface text-text-secondary font-medium"
          >
            <option value="all">{isMs ? 'Semua Status' : 'All Status'}</option>
            <option value="pending">{isMs ? 'Menunggu Kelulusan' : 'Pending'}</option>
            <option value="approved">{isMs ? 'Diluluskan' : 'Approved'}</option>
            <option value="rejected">{isMs ? 'Ditolak' : 'Rejected'}</option>
            <option value="cancelled">{isMs ? 'Dibatalkan' : 'Cancelled'}</option>
          </select>

          {/* Work type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-border-default text-sm bg-surface text-text-secondary font-medium"
          >
            <option value="all">{isMs ? 'Semua Jenis Kerja' : 'All Work Types'}</option>
            <option value="rest_day">{isMs ? 'Hari Rehat' : 'Rest Day'}</option>
            <option value="public_holiday">{isMs ? 'Cuti Umum' : 'Public Holiday'}</option>
            <option value="overtime">{isMs ? 'Kerja Lebih Masa' : 'Overtime'}</option>
          </select>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">{isMs ? 'Tahun:' : 'Year:'}</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-border-default text-sm font-mono font-bold bg-surface text-text-secondary"
          >
            {[2026, 2025, 2024].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-subtle/50 border-b border-border-subtle text-xs uppercase font-black text-text-muted">
              <tr>
                <th className="px-6 py-4">{isMs ? 'No. Rujukan' : 'Reference'}</th>
                <th className="px-6 py-4">{isMs ? 'Tarikh & Masa Bertugas' : 'Date & Time'}</th>
                <th className="px-6 py-4">{isMs ? 'Jenis Kerja' : 'Work Type'}</th>
                <th className="px-6 py-4">{isMs ? 'Jam Dituntut' : 'Hours'}</th>
                <th className="px-6 py-4">{isMs ? 'Lokasi & Keterangan' : 'Location & Tasks'}</th>
                <th className="px-6 py-4">{isMs ? 'Bukti Bertugas' : 'Proof Document'}</th>
                <th className="px-6 py-4">{isMs ? 'Status' : 'Status'}</th>
                <th className="px-6 py-4 text-center">{isMs ? 'Tindakan' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-muted font-medium">
                    <div className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-blue-600" />
                      <span>{isMs ? 'Memuatkan data...' : 'Loading data...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-muted font-medium">
                    <div className="space-y-2">
                      <p className="font-semibold text-text-muted">
                        {isMs ? 'Tiada Rekod Tuntutan Dijumpai' : 'No Claims Found'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isMs
                          ? 'Tiada tuntutan cuti gantian yang sepadan dengan tapisan yang dipilih.'
                          : 'No claims matched the selected filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const isApproved = claim.status === 'approved'
                  const isPending = claim.status === 'pending'
                  const isRejected = claim.status === 'rejected'
                  const isCancelled = claim.status === 'cancelled'

                  const workTypeLabel =
                    claim.work_type === 'rest_day'
                      ? isMs ? 'Hari Rehat' : 'Rest Day'
                      : claim.work_type === 'public_holiday'
                      ? isMs ? 'Cuti Umum' : 'Public Holiday'
                      : isMs ? 'Kerja Lebih Masa' : 'Overtime'

                  return (
                    <tr key={claim.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-text-primary text-xs">
                          {claim.claim_no || 'REF-TIMEOFF'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(claim.created_at).toLocaleDateString(
                            isMs ? 'ms-MY' : 'en-US'
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="font-bold text-text-primary">{claim.work_date}</div>
                        <div className="text-slate-400">
                          {claim.time_start} — {claim.time_end}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-subtle text-text-secondary">
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
                        <div className="font-bold text-text-primary">{claim.location}</div>
                        <div className="text-slate-400 max-w-xs truncate">
                          {claim.work_description}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {claim.attachment_url ? (
                          <a
                            href={claim.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-400 font-bold hover:underline"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span className="truncate max-w-[120px]">
                              {claim.attachment_name || (isMs ? 'Buka Bukti' : 'View Proof')}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">
                            {isMs ? 'Tiada fail' : 'No file'}
                          </span>
                        )}
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
                            {isMs ? 'Menunggu' : 'Pending'}
                          </span>
                        )}
                        {isRejected && (
                          <span
                            title={claim.rejection_reason || ''}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20 cursor-help"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {isMs ? 'Ditolak' : 'Rejected'}
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-subtle text-text-muted border border-border-default">
                            {isMs ? 'Dibatalkan' : 'Cancelled'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveModalClaim(claim)}
                            title={isMs ? 'Perincian' : 'Details'}
                            className="p-1.5 hover:bg-subtle rounded-lg text-text-muted hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleCancelClaim(claim.id)}
                              title={isMs ? 'Batalkan' : 'Cancel'}
                              className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {activeModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-primary">
                    {activeModalClaim.claim_no || 'Time Off Claim'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeModalClaim.work_date} • {activeModalClaim.hours_worked}{' '}
                    {isMs ? 'Jam' : 'Hours'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalClaim(null)}
                className="p-2 hover:bg-subtle rounded-xl text-slate-400 hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-text-secondary font-bold uppercase tracking-wider block mb-1">
                  {isMs ? 'Lokasi Bertugas' : 'Location'}
                </span>
                <p className="font-semibold text-text-primary text-sm">
                  {activeModalClaim.location}
                </p>
              </div>

              <div>
                <span className="font-bold text-text-secondary font-bold uppercase tracking-wider block mb-1">
                  {isMs ? 'Keterangan Tugas' : 'Work Description'}
                </span>
                <p className="text-text-secondary bg-subtle/50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {activeModalClaim.work_description}
                </p>
              </div>

              {activeModalClaim.status === 'rejected' && activeModalClaim.rejection_reason && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>{isMs ? 'Sebab Penolakan:' : 'Rejection Reason:'}</span>
                  </div>
                  <p className="text-xs">{activeModalClaim.rejection_reason}</p>
                </div>
              )}

              {activeModalClaim.approved_by && (
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-text-muted font-mono">
                  <span>{isMs ? 'Tindakan Pegawai:' : 'Officer Action:'}</span>
                  <span className="font-bold text-text-primary">
                    {activeModalClaim.approver?.full_name || (isMs ? 'Penyelia Jabatan' : 'Supervisor')}
                  </span>
                </div>
              )}

              {activeModalClaim.attachment_url && (
                <div className="pt-2">
                  <a
                    href={activeModalClaim.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-700 hover:bg-blue-100 font-bold transition-colors text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isMs ? 'Papar Dokumen Bukti Kehadiran' : 'Open Attendance Proof Document'}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <Button
                variant="outline"
                onClick={() => setActiveModalClaim(null)}
                className="px-6 rounded-xl text-xs font-bold"
              >
                {isMs ? 'Tutup' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeOffMyClaimsPage
