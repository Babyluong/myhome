// src/modules/mystaff/pages/StaffLeavePage.tsx
// Standardized Staff Leave Quota & Application History Page

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  UserCheck
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import { getLeaveQuotas, getLeaveApplications } from '@/modules/mystaff/services/staffService'
import type { StaffLeaveQuota, StaffLeaveApplication } from '@/shared/types/mystaff'
import { Button, Badge } from '@/components/ui'
import { Fab } from '@/shared/components/mobile'

export const StaffLeavePage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore(state => state.user)

  const [quotas, setQuotas] = useState<StaffLeaveQuota[]>([])
  const [applications, setApplications] = useState<StaffLeaveApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [quotaRes, appRes] = await Promise.all([
        getLeaveQuotas(user?.id || 'demo-user-id', new Date().getFullYear()),
        getLeaveApplications({ userId: user?.id || 'demo-user-id' })
      ])
      if (quotaRes.data) setQuotas(quotaRes.data)
      if (appRes.data) setApplications(appRes.data)
    } catch (e) {
      console.error(e)
      toast.error(isMs ? 'Ralat memuatkan data cuti' : 'Error loading leave data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8 text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.STAFF_DASHBOARD)}
            className="p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              {isMs ? 'Pengurusan & Rekod Cuti Staf' : 'Staff Leave & Quota Management'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {isMs
                ? 'General Orders Chapter C Leave Entitlement Balance & Application History'
                : 'Leave Entitlement Balance under General Orders Chapter C & Application History'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate(ROUTES.STAFF_LEAVE_APPLY)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-md font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Mohon Cuti Baharu' : 'Apply New Leave'}</span>
          </Button>
        </div>
      </div>

      {/* Quota Balance KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800">
            {isMs ? `Annual Leave Entitlement Balance ${new Date().getFullYear()}` : `${new Date().getFullYear()} Leave Entitlement Balance`}
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400">
            {isMs ? 'Perintah Am Bab C (Cuti)' : 'General Orders Chapter C (Leave)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quotas.map(q => {
            const pct = q.hak_hari > 0 ? (q.baki_hari / q.hak_hari) * 100 : 100
            const isLow = pct < 20

            return (
              <div
                key={q.id}
                className="p-5 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {q.leave_type?.kod_cuti || 'LEAVE'}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {isMs ? `Tahun ${q.tahun}` : `Year ${q.tahun}`}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1">{q.leave_type?.nama_cuti}</h3>
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black font-mono text-emerald-600">{q.baki_hari}</span>
                  <span className="text-xs text-slate-400 font-bold">
                    {isMs ? `/ ${q.hak_hari} Hari Baki` : `/ ${q.hak_hari} Days Left`}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isLow ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>{isMs ? `Digunakan: ${q.digunakan_hari} hari` : `Used: ${q.digunakan_hari} days`}</span>
                  <span>{isMs ? `Kelayakan: ${q.hak_hari} hari` : `Entitlement: ${q.hak_hari} days`}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-800">
              {isMs ? 'Leave Application History' : 'Leave Application History'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {applications.length} {isMs ? 'Rekod' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">{isMs ? 'Jenis Cuti' : 'Leave Type'}</th>
                <th className="px-6 py-4">{isMs ? 'Duration & Total Days' : 'Duration & Total Days'}</th>
                <th className="px-6 py-4">{isMs ? 'Sebab & Catatan' : 'Reason & Notes'}</th>
                <th className="px-6 py-4">{isMs ? 'Pegawai Pengambil Alih Tugas' : 'Relief / Covering Officer'}</th>
                <th className="px-6 py-4">{isMs ? 'Tarikh Mohon' : 'Application Date'}</th>
                <th className="px-6 py-4">{isMs ? 'Status' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    {isMs ? 'Tiada permohonan cuti direkodkan.' : 'No leave applications recorded.'}
                  </td>
                </tr>
              ) : (
                applications.map(app => {
                  const isApproved = app.status === 'approved'
                  const isPending = app.status === 'pending'
                  const isRejected = app.status === 'rejected'

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{app.leave_type?.nama_cuti || (isMs ? 'Cuti Rehat' : 'Annual Leave')}</div>
                        <div className="text-xs font-mono text-slate-400">{app.leave_type?.kod_cuti}</div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="text-slate-800 font-bold">
                          {app.tarikh_mula} — {app.tarikh_tamat}
                        </div>
                        <div className="text-emerald-700 font-bold mt-0.5">
                          {app.jumlah_hari} {isMs ? 'Hari' : 'Days'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-700 text-xs max-w-xs line-clamp-2 leading-relaxed">{app.sebab}</div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-slate-800">{app.replacement_user?.full_name || 'Nurul Huda'}</div>
                        <div className="text-slate-400">{app.replacement_user?.jawatan || (isMs ? 'Pegawai Farmasi U44' : 'Pharmacy Officer')}</div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString(isMs ? 'ms-MY' : 'en-US') : '-'}
                      </td>

                      <td className="px-6 py-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {isMs ? 'Diluluskan' : 'Approved'}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            {isMs ? 'Menunggu Kelulusan HOD' : 'Pending HOD Approval'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" />
                            {isMs ? 'Ditolak' : 'Rejected'}
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

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => navigate(ROUTES.STAFF_LEAVE_APPLY)} 
        aria-label="Apply New Leave" 
      />
    </div>
  )
}

export default StaffLeavePage
