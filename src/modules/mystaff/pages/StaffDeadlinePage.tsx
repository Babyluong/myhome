// src/modules/mystaff/pages/StaffDeadlinePage.tsx
// Standardized Department Deadline & Report Submission Countdown Tracker

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Plus,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Shield,
  TrendingDown,
  Search,
  Filter
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getStaffDeadlines,
  createStaffDeadline,
  updateDeadlineStatus
} from '@/modules/mystaff/services/staffService'
import type { StaffDeadline, DeadlineCategory, DeadlinePriority } from '@/shared/types/mystaff'
import { Button, Modal, Badge } from '@/components/ui'

export const StaffDeadlinePage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore(state => state.user)

  const [deadlines, setDeadlines] = useState<StaffDeadline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('ACTIVE')

  // Form State
  const [formCategory, setFormCategory] = useState<DeadlineCategory>('laporan')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formPriority, setFormPriority] = useState<DeadlinePriority>('high')

  const loadDeadlines = async () => {
    try {
      setIsLoading(true)
      const res = await getStaffDeadlines({
        hospitalId: user?.hospital_id,
        departmentId: user?.department_id
      })
      if (res.data) setDeadlines(res.data)
    } catch (e) {
      console.error(e)
      toast.error(isMs ? 'Error loading submission deadlines' : 'Error loading deadlines list')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDeadlines()
  }, [user?.hospital_id, user?.department_id])

  const getDaysLeft = (targetDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(d => {
      const isDone = d.status === 'submitted'
      if (selectedFilter === 'ACTIVE') return !isDone
      if (selectedFilter === 'COMPLETED') return isDone
      return true
    })
  }, [deadlines, selectedFilter])

  const handleToggleComplete = async (dl: StaffDeadline) => {
    try {
      const newStatus = dl.status === 'submitted' ? 'pending' : 'submitted'
      await updateDeadlineStatus(dl.id, newStatus)
      toast.success(
        dl.status === 'submitted' 
          ? (isMs ? 'Status ditukar ke belum selesai' : 'Status reverted to pending') 
          : (isMs ? 'Deadline marked as completed!' : 'Deadline marked as completed!')
      )
      await loadDeadlines()
    } catch (e: any) {
      toast.error(e.message || (isMs ? 'Gagal mengemaskini status' : 'Failed to update status'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDate) {
      toast.error(isMs ? 'Please enter the title and deadline date.' : 'Please complete the title and deadline date.')
      return
    }

    try {
      setSubmitting(true)
      const res = await createStaffDeadline({
        created_by: user?.id || 'demo-user',
        hospital_id: user?.hospital_id || 'hosp-1',
        department_id: user?.department_id || 'dept-1',
        tajuk: formTitle,
        penerangan: formDesc,
        kategori: formCategory,
        tarikh_akhir: formDate,
        keutamaan: formPriority,
        status: 'pending',
        is_shared_dept: true
      })

      if (res.error) throw new Error(res.error)

      toast.success(isMs ? 'Submission deadline successfully created!' : 'Deadline record successfully created!')
      setIsModalOpen(false)
      // Reset
      setFormTitle('')
      setFormDesc('')
      setFormDate('')
      await loadDeadlines()
    } catch (err: any) {
      toast.error(err.message || (isMs ? 'Failed to save submission deadline' : 'Failed to save deadline'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-6 text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.STAFF_DASHBOARD)}
            className="p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              {isMs ? 'Log Laporan & Serahan Tugasan' : 'Deadlines & Report Submissions'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {isMs
                ? 'Pemantauan Serahan Laporan Bulanan, Anggaran Belanja Mengurus (ABM), Unjuran APPL & Audit'
                : 'Monthly Report Submissions, Budget Estimates (ABM), APPL Forecasting & Audit Deadlines'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-md font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Tambah Log Laporan' : 'Add New Deadline'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => setSelectedFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'ACTIVE'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMs ? 'Masih Aktif' : 'Active'} ({deadlines.filter(d => d.status !== 'submitted').length})
        </button>
        <button
          onClick={() => setSelectedFilter('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMs ? 'Telah Selesai' : 'Completed'} ({deadlines.filter(d => d.status === 'submitted').length})
        </button>
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMs ? 'Semua' : 'All'} ({deadlines.length})
        </button>
      </div>

      {/* Deadlines List Cards */}
      <div className="space-y-3">
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md text-slate-400">
            {isMs ? 'Tiada rekod tarikh akhir dalam senarai ini.' : 'No deadline records found in this list.'}
          </div>
        ) : (
          filteredDeadlines.map(dl => {
            const isDone = dl.status === 'submitted'
            const daysLeft = getDaysLeft(dl.tarikh_akhir)
            const isPast = daysLeft < 0
            const isUrgent = daysLeft <= 3 && !isPast && !isDone

            return (
              <div
                key={dl.id}
                className={`p-5 rounded-3xl bg-white border transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-slate-200 opacity-60'
                    : isPast
                    ? 'border-rose-200 bg-rose-50/20'
                    : isUrgent
                    ? 'border-amber-300 shadow-amber-500/5'
                    : 'border-slate-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(dl)}
                    className={`p-2.5 rounded-2xl border transition-all mt-0.5 ${
                      isDone
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-300 hover:text-emerald-500'
                    }`}
                    title={isDone ? (isMs ? 'Tanda belum selesai' : 'Mark as pending') : (isMs ? 'Tanda telah selesai' : 'Mark as completed')}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-base font-extrabold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {dl.tajuk}
                      </h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {dl.kategori}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium leading-relaxed">
                      {dl.penerangan}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                      <span>{isMs ? 'Tarikh Serahan:' : 'Deadline:'} <strong className="text-slate-700">{dl.tarikh_akhir}</strong></span>
                      {dl.creator?.full_name && (
                        <span>{isMs ? 'Pegawai:' : 'Officer:'} <strong className="text-slate-700">{dl.creator.full_name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {!isDone && (
                    <div
                      className={`text-center px-4 py-2 rounded-2xl border font-mono font-bold text-xs ${
                        isPast
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isUrgent
                          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-lg font-black">{Math.abs(daysLeft)}</div>
                      <div className="text-[9px] uppercase tracking-wider">
                        {isPast ? (isMs ? 'Hari Lewat' : 'Days Overdue') : daysLeft === 0 ? (isMs ? 'Hari Ini' : 'Today') : (isMs ? 'Hari Lagi' : 'Days Left')}
                      </div>
                    </div>
                  )}

                  {isDone && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {isMs ? 'Selesai' : 'Completed'}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New Deadline Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isMs ? "Daftar Log Laporan / Serahan Baharu" : "New Deadline / Report Tracker"}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMs ? 'Kategori Laporan' : 'Report Category'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as DeadlineCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
              >
                <option value="laporan">{isMs ? 'Laporan Bulanan Jabatan' : 'Monthly Department Report'}</option>
                <option value="anggaran">{isMs ? 'Unjuran & Pesanan APPL' : 'APPL Forecast & Order'}</option>
                <option value="penyerahan">{isMs ? 'Anggaran Belanja Mengurus (ABM / Bajet)' : 'Budget Estimates (ABM)'}</option>
                <option value="audit">{isMs ? 'Audit & Pematuhan KKM' : 'MOH Audit & Compliance'}</option>
                <option value="lain">{isMs ? 'Lain-lain' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMs ? 'Tajuk Laporan / Serahan' : 'Report / Deadline Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={isMs ? "cth. Penyerahan Laporan Penggunaan Oksigen & Stok Q3" : "e.g. Q3 Oxygen Consumption & Stock Report"}
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMs ? 'Tarikh Akhir (Deadline)' : 'Deadline Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMs ? 'Tahap Keutamaan' : 'Priority Level'}
              </label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as DeadlinePriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
              >
                <option value="critical">{isMs ? 'Kritikal (Hukuman/Kesan Peruntukan)' : 'Critical (Funding Impact)'}</option>
                <option value="high">{isMs ? 'Tinggi (Kewangan / KKM Deadline)' : 'High (Finance / MOH Deadline)'}</option>
                <option value="medium">{isMs ? 'Sederhana' : 'Medium'}</option>
                <option value="low">{isMs ? 'Rendah' : 'Low'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMs ? 'Keterangan / Panduan Serahan' : 'Description / Guidelines'}
            </label>
            <textarea
              rows={3}
              placeholder={isMs ? "Format fail, pautan borang, atau arahan khusus HOD..." : "File format, form link, or specific instructions..."}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
            >
              {isMs ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 shadow-md"
            >
              {submitting ? (isMs ? 'Menyimpan...' : 'Saving...') : (isMs ? 'Daftar Tarikh Akhir' : 'Create Deadline')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StaffDeadlinePage
