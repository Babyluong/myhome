// src/modules/myprepacking/components/PrepackDrugPickerModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  X,
  Pill,
  Loader2,
  Check,
  Package,
  ArrowRight
} from 'lucide-react'
import { Modal } from '@/components/ui'
import {
  searchFacilityCatalogDrugs,
  FacilityCatalogDrugOption
} from '../services/prepackService'

interface PrepackDrugPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectDrug: (drug: FacilityCatalogDrugOption) => void
  selectedDrugId?: string | null
}

export const PrepackDrugPickerModal: React.FC<PrepackDrugPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectDrug,
  selectedDrugId
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'tablet' | 'liquid' | 'cream' | 'other'>('all')
  const [drugs, setDrugs] = useState<FacilityCatalogDrugOption[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDrugs = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const { data } = await searchFacilityCatalogDrugs(query)
      setDrugs(data || [])
    } catch (err) {
      console.error('Error fetching catalog drugs for picker:', err)
      setDrugs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchDrugs(searchTerm)
    }
  }, [isOpen, fetchDrugs])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      fetchDrugs(searchTerm)
    }, 200)
    return () => clearTimeout(timer)
  }, [searchTerm, isOpen, fetchDrugs])

  // Filter by dosage form category
  const filteredDrugs = useMemo(() => {
    if (categoryFilter === 'all') return drugs
    return drugs.filter((drug) => {
      const form = (drug.dosage_form || '').toLowerCase()
      if (categoryFilter === 'tablet') {
        return form.includes('tab') || form.includes('cap')
      }
      if (categoryFilter === 'liquid') {
        return form.includes('syrup') || form.includes('sirap') || form.includes('susp') || form.includes('sol') || form.includes('drop')
      }
      if (categoryFilter === 'cream') {
        return form.includes('cream') || form.includes('krim') || form.includes('oint') || form.includes('salap') || form.includes('gel')
      }
      return !form.includes('tab') && !form.includes('cap') && !form.includes('syrup') && !form.includes('sirap') && !form.includes('cream') && !form.includes('salap')
    })
  }, [drugs, categoryFilter])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MyInventory Medication Catalog"
      size="3xl"
    >
      <div className="space-y-4 py-1">
        {/* Subtitle & Explainer */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <p className="text-xs text-text-muted">
              Select a master medication from official hospital stock. Item code, baseline dosage, and form link automatically.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-subtle text-text-secondary border border-border-subtle shrink-0">
            {filteredDrugs.length} Drugs Available
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medication name, item code, or strength (e.g. Amlodipine, Paracetamol, D02...)"
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-surface border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500/50 font-medium shadow-xs"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted pointer-events-none" />
          {loading ? (
            <Loader2 className="w-4 h-4 absolute right-3.5 top-3 text-teal-600 dark:text-teal-400 animate-spin" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Dosage Form Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Forms' },
            { id: 'tablet', label: 'Tablets & Capsules' },
            { id: 'liquid', label: 'Oral Liquids & Syrups' },
            { id: 'cream', label: 'Creams & Ointments' },
            { id: 'other', label: 'Other Forms' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-subtle text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drugs List / Table */}
        <div className="border border-border-default rounded-xl overflow-hidden bg-surface">
          <div className="max-h-96 overflow-y-auto divide-y divide-border-subtle">
            {loading && filteredDrugs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin mb-2" />
                <span className="text-xs text-text-muted">Searching MyInventory catalog records...</span>
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Package className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <div className="text-xs font-semibold text-text-secondary">
                  No medications found
                </div>
                <div className="text-[11px] text-text-muted mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, or manually enter the formulation details directly in the form.
                </div>
              </div>
            ) : (
              filteredDrugs.map((drug) => {
                const isSelected = selectedDrugId === drug.id
                return (
                  <div
                    key={drug.id}
                    onClick={() => {
                      onSelectDrug(drug)
                      onClose()
                    }}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-teal-500/10 dark:bg-teal-500/15 border-l-4 border-l-teal-600'
                        : 'hover:bg-subtle/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-subtle text-text-primary border border-border-default shrink-0">
                          {drug.drug_code}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                          {drug.drug_name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                        {drug.generic_name && (
                          <span>
                            Generic: <strong className="text-text-secondary">{drug.generic_name}</strong>
                          </span>
                        )}
                        {drug.strength && (
                          <span className="text-teal-600 dark:text-teal-400 font-semibold font-mono">
                            • Strength: {drug.strength}
                          </span>
                        )}
                        {drug.dosage_form && (
                          <span className="capitalize">
                            • Form: {drug.dosage_form}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      {drug.facility_stock !== null && drug.facility_stock !== undefined && (
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] uppercase font-bold text-text-muted block">Store Stock</span>
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {drug.facility_stock.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-subtle group-hover:bg-teal-700 group-hover:text-white text-text-secondary border border-border-subtle'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <span>Select</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs">
          <span className="text-[11px] text-text-muted">
            Click any medication to populate the formulation editor automatically.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors active:scale-[0.98] cursor-pointer border border-border-default"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PrepackDrugPickerModal
