// src/modules/myperolehan/components/AddWarrantModal.tsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Wallet, Building, HardHat } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import {
  getAdminHierarchy,
  addWarrantInflow,
  addPembangunanInflow
} from '../services/perolehanAdminService'
import type { AdminProgram, AdminObjek, AdminKategori, BudgetType } from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface AddWarrantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialType?: BudgetType
}

export const AddWarrantModal: React.FC<AddWarrantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'warrant'
}) => {
  const { user } = useAuthStore()
  const toast = useToast()

  const [budgetType, setBudgetType] = useState<BudgetType>(initialType)
  const [documentNo, setDocumentNo] = useState('')
  const [warrantDate, setWarrantDate] = useState(new Date().toISOString().split('T')[0])
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')

  const [programs, setPrograms] = useState<AdminProgram[]>([])
  const [objeks, setObjeks] = useState<AdminObjek[]>([])
  const [kategoris, setKategoris] = useState<AdminKategori[]>([])

  const [selectedProgramCode, setSelectedProgramCode] = useState('020200')
  const [selectedObjekCode, setSelectedObjekCode] = useState('')
  const [selectedKategoriCode, setSelectedKategoriCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const loadHierarchy = async () => {
      const res = await getAdminHierarchy()
      setPrograms(res.programs)
      setObjeks(res.objeks)
      setKategoris(res.kategoris)
    }
    loadHierarchy()
  }, [isOpen])

  const filteredPrograms = programs.filter((p) => p.budget_type === budgetType)
  const activeProgram = programs.find((p) => p.code === selectedProgramCode)
  const filteredObjeks = activeProgram ? objeks.filter((o) => o.program_id === activeProgram.id) : []
  const activeObjek = filteredObjeks.find((o) => o.code === selectedObjekCode)
  const filteredKategoris = activeObjek ? kategoris.filter((k) => k.objek_id === activeObjek.id) : []

  useEffect(() => {
    if (filteredPrograms.length > 0 && !filteredPrograms.some(p => p.code === selectedProgramCode)) {
      setSelectedProgramCode(filteredPrograms[0].code)
    }
  }, [budgetType, filteredPrograms])

  useEffect(() => {
    if (filteredObjeks.length > 0 && !filteredObjeks.some(o => o.code === selectedObjekCode)) {
      setSelectedObjekCode(filteredObjeks[0].code)
    }
  }, [filteredObjeks])

  useEffect(() => {
    if (filteredKategoris.length > 0 && !filteredKategoris.some(k => k.code === selectedKategoriCode)) {
      setSelectedKategoriCode(filteredKategoris[0].code)
    }
  }, [filteredKategoris])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentNo.trim() || amount <= 0) {
      toast.error('Please enter a valid Warrant Document No. and Allocation Amount.')
      return
    }

    setIsSubmitting(true)
    try {
      if (budgetType === 'warrant') {
        const { error } = await addWarrantInflow({
          document_no: documentNo,
          warrant_date: warrantDate,
          fiscal_year: Number(fiscalYear),
          vote_code: selectedObjekCode,
          vote_activity: selectedProgramCode,
          category: selectedKategoriCode,
          program_code: selectedProgramCode,
          objek_code: selectedObjekCode,
          kategori_code: selectedKategoriCode,
          amount: Number(amount),
          description: description || undefined,
          created_by: user?.id
        })
        if (error) throw error
      } else {
        const { error } = await addPembangunanInflow({
          document_no: documentNo,
          pembangunan_date: warrantDate,
          fiscal_year: Number(fiscalYear),
          program_code: 'P42',
          objek_code: selectedObjekCode,
          kategori_code: selectedKategoriCode,
          amount: Number(amount),
          description: description || undefined,
          created_by: user?.id
        })
        if (error) throw error
      }

      toast.success('Warrant Allocation Inflow Successfully Recorded!')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error adding warrant inflow:', err)
      toast.error('Failed to record warrant', err.message || 'System error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-surface border border-border-default rounded-[2rem] p-6 sm:p-8 text-text-primary shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-primary">Add Inflow Warrant Allocation</h3>
              <p className="text-xs text-text-muted">Record official warrant allocations from MOH / State Health Department</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-text-secondary hover:bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBudgetType('warrant')}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-colors ${
                budgetType === 'warrant'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400 dark:text-blue-300 font-bold'
                  : 'bg-surface border-border-default text-text-muted'
              }`}
            >
              <Building className="w-4 h-4 text-blue-600" />
              <span>Operating (020200/022300)</span>
            </button>

            <button
              type="button"
              onClick={() => setBudgetType('pembangunan')}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-colors ${
                budgetType === 'pembangunan'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 dark:text-amber-300 font-bold'
                  : 'bg-surface border-border-default text-text-muted'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Development (P42)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Warrant Document No.</label>
              <input
                type="text"
                placeholder="e.g. WA/2026/FNB/002 or 91000914"
                value={documentNo}
                onChange={(e) => setDocumentNo(e.target.value)}
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:bg-surface focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Warrant Date</label>
              <input
                type="date"
                value={warrantDate}
                onChange={(e) => setWarrantDate(e.target.value)}
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:bg-surface focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Program, Objek, Kategori */}
          <div className="space-y-3 bg-subtle/50 p-3.5 rounded-2xl border border-border-default">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1">Program</label>
              <select
                value={selectedProgramCode}
                onChange={(e) => setSelectedProgramCode(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary focus:border-indigo-500 focus:outline-none"
              >
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} - {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-muted mb-1">Object Code</label>
                <select
                  value={selectedObjekCode}
                  onChange={(e) => setSelectedObjekCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary focus:border-indigo-500 focus:outline-none"
                >
                  {filteredObjeks.map((o) => (
                    <option key={o.id} value={o.code}>
                      {o.code} - {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-muted mb-1">Category</label>
                <select
                  value={selectedKategoriCode}
                  onChange={(e) => setSelectedKategoriCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary focus:border-indigo-500 focus:outline-none"
                >
                  {filteredKategoris.map((k) => (
                    <option key={k.id} value={k.code}>
                      {k.code} - {k.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Allocation Amount (RM)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-mono font-bold focus:bg-surface focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Fiscal Year</label>
              <input
                type="number"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-mono focus:bg-surface focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Description / Warrant Details</label>
            <textarea
              rows={2}
              placeholder="e.g. MOH First Distribution Warrant for Food Services..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:bg-surface focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border-default hover:bg-subtle/50 text-text-secondary rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Warrant'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
