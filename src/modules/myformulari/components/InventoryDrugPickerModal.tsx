// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X, Package, Check, CheckCircle2, Plus, Filter, Loader2, ChevronLeft, ChevronRight, Baby } from 'lucide-react'
import { getDrugPrescriberCategory } from '@/lib/drugCategorizer'
import {
  searchMyInventoryDrugsForPicker,
  addDrugsToPaediatricCatalogue,
  PaediatricCatalogueDrugInfo,
} from '../services/paediatricCatalogueService'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

interface InventoryDrugPickerModalProps {
  isOpen: boolean
  onClose: () => void
  catalogId: string
  existingDrugIds: string[]
  onSuccess: () => void
}

export const InventoryDrugPickerModal: React.FC<InventoryDrugPickerModalProps> = ({
  isOpen,
  onClose,
  catalogId,
  existingDrugIds,
  onSuccess,
}) => {
  const { user } = useAuthStore()
  const { success: toastSuccess, error: toastError } = useToastStore()
  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'
  const userId = user?.id || '88dc2fa7-e943-45ba-a889-8756c0265b48'

  const [searchTerm, setSearchTerm] = useState('')
  const [voteFilter, setVoteFilter] = useState('all')
  const [formulationFilter, setFormulationFilter] = useState('all') // all, liquid, drops, inhaler, injection, tablet
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [drugs, setDrugs] = useState<PaediatricCatalogueDrugInfo[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Selection
  const [selectedDrugIds, setSelectedDrugIds] = useState<Set<string>>(new Set())

  // Default limit inputs
  const [defaultMinLimit, setDefaultMinLimit] = useState(5)
  const [defaultMaxLimit, setDefaultMaxLimit] = useState(30)
  const [defaultReorderLevel, setDefaultReorderLevel] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const existingSet = useMemo(() => new Set(existingDrugIds), [existingDrugIds])

  // Fetch drugs from MyInventory master table
  const fetchDrugs = useCallback(async () => {
    if (!isOpen) return
    setIsLoading(true)
    try {
      const res = await searchMyInventoryDrugsForPicker(
        hospitalId,
        searchTerm,
        voteFilter,
        existingDrugIds,
        page,
        pageSize
      )
      setDrugs(res.drugs)
      setTotalCount(res.total)
    } catch (err: any) {
      toastError('Gagal memuat katalog MyInventory: ' + (err.message || 'Ralat pelayan'))
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, hospitalId, searchTerm, voteFilter, existingDrugIds, page, pageSize, toastError])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrugs()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchDrugs])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [searchTerm, voteFilter, formulationFilter])

  // Client-side quick filter for formulation if requested
  const filteredDrugs = useMemo(() => {
    if (formulationFilter === 'all') return drugs

    return drugs.filter(d => {
      const form = (d.dosage_form || '').toLowerCase()
      const name = (d.drug_name || '').toLowerCase()

      if (formulationFilter === 'liquid') {
        return form.includes('syrup') || form.includes('suspension') || name.includes('syrup') || name.includes('suspension')
      }
      if (formulationFilter === 'drops') {
        return form.includes('drop') || name.includes('drop')
      }
      if (formulationFilter === 'inhaler') {
        return form.includes('inhaler') || form.includes('resp') || name.includes('inhaler') || name.includes('puff')
      }
      if (formulationFilter === 'injection') {
        return form.includes('injection') || form.includes('vial') || form.includes('amp') || name.includes('injection')
      }
      if (formulationFilter === 'tablet') {
        return form.includes('tablet') || form.includes('capsule') || form.includes('tab') || form.includes('cap')
      }
      return true
    })
  }, [drugs, formulationFilter])

  const toggleSelectDrug = (id: string) => {
    if (existingSet.has(id)) return // Already in ward
    setSelectedDrugIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAllVisible = () => {
    const selectable = filteredDrugs.filter(d => !existingSet.has(d.id)).map(d => d.id)
    const allSelected = selectable.every(id => selectedDrugIds.has(id))

    setSelectedDrugIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        selectable.forEach(id => next.delete(id))
      } else {
        selectable.forEach(id => next.add(id))
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (selectedDrugIds.size === 0) {
      toastError('Sila pilih sekurang-kurangnya satu ubat.')
      return
    }

    setIsSubmitting(true)
    try {
      const itemsToAdd = Array.from(selectedDrugIds).map(id => {
        const drugObj = drugs.find(d => d.id === id)
        return {
          drug_id: id,
          min_limit: Number(defaultMinLimit) || 5,
          max_limit: Number(defaultMaxLimit) || 30,
          reorder_level: Number(defaultReorderLevel) || 10,
          vote: drugObj?.procurement_vote || null,
        }
      })

      const res = await addDrugsToPaediatricCatalogue(catalogId, hospitalId, userId, itemsToAdd)
      toastSuccess(`${res.addedCount} ubat berjaya dimasukkan ke dalam Katalog Pediatrik!`)
      setSelectedDrugIds(new Set())
      onSuccess()
      onClose()
    } catch (err: any) {
      toastError('Gagal menambah ubat: ' + (err.message || 'Ralat database'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/20 shadow-2xl shadow-teal-950/40 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Pilih Ubat Dari Katalog MyInventory
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  Stor Farmasi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih ubat berdaftar di fasiliti untuk dimasukkan ke dalam daftar ubat rasmi Wad Pediatrik.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-white/[0.06] bg-slate-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari mengikut nama ubat, generik, atau kod item MDC..."
                className="w-full pl-9 pr-9 py-2 bg-slate-950/80 border border-white/[0.1] rounded-xl text-sm text-slate-100 placeholder:text-text-muted focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Vote Filter */}
            <select
              value={voteFilter}
              onChange={e => setVoteFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-white/[0.1] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Semua Skim Perolehan</option>
              <option value="appl">APPL (Konsesi Pusat)</option>
              <option value="cc">Kontrak Pusat (CC)</option>
              <option value="lp">Pembelian Tempatan (LP)</option>
            </select>
          </div>

          {/* Quick Formulation Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Formulasi:
            </span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'liquid', label: '🥄 Sirap / Suspensi' },
              { id: 'drops', label: '💧 Titisan (Drops)' },
              { id: 'inhaler', label: '💨 Inhaler / Nebul' },
              { id: 'injection', label: '💉 Suntikan / IV' },
              { id: 'tablet', label: '💊 Tablet / Kapsul' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormulationFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  formulationFilter === f.id
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm shadow-teal-500/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-surface/[0.08] border border-white/[0.06]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drug List Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
              <p className="text-sm">Menyemak inventori MyInventory Hospital Lawas...</p>
            </div>
          ) : filteredDrugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
              <Package className="w-10 h-10 text-text-muted mb-1" />
              <p className="text-sm font-medium text-slate-300">Tiada ubat dijumpai</p>
              <p className="text-xs text-text-muted">Cuba ubah carian kata kunci atau tetapan penapis skim.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Select All Row */}
              <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 border-b border-white/[0.05]">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="flex items-center gap-2 hover:text-slate-200 transition-colors"
                >
                  <span className="font-medium text-teal-400">Pilih / Nyahpilih Semua Pada Halaman Ini</span>
                </button>
                <span>Dijumpai: {totalCount} ubat</span>
              </div>

              {filteredDrugs.map(drug => {
                const isAlreadyInWard = existingSet.has(drug.id)
                const isSelected = selectedDrugIds.has(drug.id)
                const prescriberCat = getDrugPrescriberCategory(drug)

                return (
                  <div
                    key={drug.id}
                    onClick={() => !isAlreadyInWard && toggleSelectDrug(drug.id)}
                    className={`flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      isAlreadyInWard
                        ? 'bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-teal-500/10 border-teal-500/40 shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-surface/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isAlreadyInWard
                              ? 'bg-slate-800 border-slate-700 text-text-muted'
                              : isSelected
                              ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold'
                              : 'border-white/20 bg-slate-900/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          {isAlreadyInWard && <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="font-semibold text-sm text-slate-100 hover:text-teal-300 transition-colors">
                            {drug.drug_name}
                          </span>
                          {drug.dosage_form && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {drug.dosage_form}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Kat {prescriberCat}
                          </span>
                          {drug.procurement_vote && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {drug.procurement_vote}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          {drug.generic_name && (
                            <span>INN: <strong className="text-slate-300 font-normal">{drug.generic_name}</strong></span>
                          )}
                          {drug.drug_code && (
                            <span>Kod: <code className="text-teal-400/90 font-mono text-[11px]">{drug.drug_code}</code></span>
                          )}
                          {drug.storage_conditions && (
                            <span className="text-slate-400">🌡️ {drug.storage_conditions}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isAlreadyInWard ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sudah Ada
                        </span>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-teal-500 text-slate-950 shadow-sm'
                              : 'bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          {isSelected ? 'Dipilih' : '+ Pilih'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-2 border-t border-white/[0.06] bg-slate-950/60 text-xs text-slate-400">
            <span>
              Halaman {page} dari {totalPages} ({totalCount} ubat)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-surface/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-surface/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer & Default Ward Quotas */}
        <div className="p-4 border-t border-white/[0.08] bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-300">Tetapan Kuota Wad Pediatrik:</span>
            <div className="flex items-center gap-1">
              <label className="text-slate-400">Min:</label>
              <input
                type="number"
                min="1"
                value={defaultMinLimit}
                onChange={e => setDefaultMinLimit(Number(e.target.value))}
                className="w-14 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-slate-100 text-center font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-slate-400">Reorder:</label>
              <input
                type="number"
                min="1"
                value={defaultReorderLevel}
                onChange={e => setDefaultReorderLevel(Number(e.target.value))}
                className="w-14 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-slate-100 text-center font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-slate-400">Maks:</label>
              <input
                type="number"
                min="1"
                value={defaultMaxLimit}
                onChange={e => setDefaultMaxLimit(Number(e.target.value))}
                className="w-14 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-slate-100 text-center font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-surface/[0.06] border border-white/[0.08] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={selectedDrugIds.size === 0 || isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan ke Wad...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Tambah {selectedDrugIds.size > 0 ? `(${selectedDrugIds.size})` : ''} ke Katalog Pediatrik
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
