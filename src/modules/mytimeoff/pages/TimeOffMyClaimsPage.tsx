// Staff Time Off Claims History & Management Page

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Trash2,
  FileCheck,
  ShieldAlert
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilClaims,
  cancelToilClaim
} from '@/modules/mytimeoff/services/toilService'
import type { ToilClaim, ToilStatus, ToilWorkType } from '@/shared/types/mytimeoff'
import { Button, Badge } from '@/components/ui'

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
    <div className="p-6 md:p-8 w-full space-y-8 text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              {isMs ? 'Senarai Tuntutan Cuti Gantian Saya' : 'My Time Off Claims'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {isMs
                ? 'Semakan status permohonan waktu kerja tambahan dan kelulusan penyelia'
                : 'Review overtime submission records and supervisor approval progress'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Tuntut Cuti Gantian' : 'New Claim'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={isMs ? 'Cari no. rujukan, lokasi, tugasan...' : 'Search ref no, location, task...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 font-medium"
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
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 font-medium"
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-mono font-bold bg-white text-slate-700"
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
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-black text-slate-500">
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-blue-600" />
                      <span>{isMs ? 'Memuatkan data...' : 'Loading data...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-600">
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
                    <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {claim.claim_no || 'REF-TIMEOFF'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(claim.created_at).toLocaleDateString(
                            isMs ? 'ms-MY' : 'en-US'
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="font-bold text-slate-800">{claim.work_date}</div>
                        <div className="text-slate-400">
                          {claim.time_start} — {claim.time_end}
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

                      <td className="px-6 py-4 text-xs">
                        {claim.attachment_url ? (
                          <a
                            href={claim.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline"
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
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isMs ? 'Diluluskan' : 'Approved'}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            {isMs ? 'Menunggu' : 'Pending'}
                          </span>
                        )}
                        {isRejected && (
                          <span
                            title={claim.rejection_reason || ''}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                          >
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

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveModalClaim(claim)}
                            title={isMs ? 'Perincian' : 'Details'}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleCancelClaim(claim.id)}
                              title={isMs ? 'Batalkan' : 'Cancel'}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
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
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isMs ? 'Lokasi Bertugas' : 'Location'}
                </span>
                <p className="font-semibold text-slate-800 text-sm">
                  {activeModalClaim.location}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isMs ? 'Keterangan Tugas' : 'Work Description'}
                </span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {activeModalClaim.work_description}
                </p>
              </div>

              {activeModalClaim.status === 'rejected' && activeModalClaim.rejection_reason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>{isMs ? 'Sebab Penolakan:' : 'Rejection Reason:'}</span>
                  </div>
                  <p className="text-xs">{activeModalClaim.rejection_reason}</p>
                </div>
              )}

              {activeModalClaim.approved_by && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 font-mono">
                  <span>{isMs ? 'Tindakan Pegawai:' : 'Officer Action:'}</span>
                  <span className="font-bold text-slate-800">
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
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-all text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isMs ? 'Papar Dokumen Bukti Kehadiran' : 'Open Attendance Proof Document'}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
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
