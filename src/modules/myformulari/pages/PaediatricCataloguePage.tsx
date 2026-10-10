// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Baby,
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Calculator,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  Layers,
  LayoutGrid,
  AlignJustify,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  X,
  Building2,
  Package,
  Activity,
  Filter,
  Save,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import {
  loadPaediatricCatalogue,
  updatePaediatricCatalogueItem,
  removePaediatricCatalogueItem,
  PaediatricCatalogueItem,
  PaediatricCatalogHeader,
} from '../services/paediatricCatalogueService'
import { InventoryDrugPickerModal } from '../components/InventoryDrugPickerModal'
import { PaediatricDoseCalculatorModal } from '../components/PaediatricDoseCalculatorModal'
import { getAllFormulariDrugs } from '../services/formulariService'
import { findBestFukkmMatch, synthesizeDrugEntryFromFacility } from '../services/fukkmMatcher'
import { exportFacilityDrugInventoryToExcel } from '@/services/pharmacy/facilityInventoryExcelService'
import { generatePaediatricCataloguePdf } from '../services/paediatricCataloguePdfService'

export const PaediatricCataloguePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { language } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToastStore()

  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  // Data states
  const [catalogHeader, setCatalogHeader] = useState<PaediatricCatalogHeader | null>(null)
  const [items, setItems] = useState<PaediatricCatalogueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date>(new Date())

  // View & Filter states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClinicalGroup, setSelectedClinicalGroup] = useState<string>('all')
  const [formulationFilter, setFormulationFilter] = useState<string>('all')
  const [prescriberFilter, setPrescriberFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'nil'>('all')

  // Modals state
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false)
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false)
  const [calcInitialDrugName, setCalcInitialDrugName] = useState<string>('')

  // Edit Limit Modal state
  const [editingItem, setEditingItem] = useState<PaediatricCatalogueItem | null>(null)
  const [editMin, setEditMin] = useState<number>(5)
  const [editMax, setEditMax] = useState<number>(30)
  const [editReorder, setEditReorder] = useState<number>(10)
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false)

  // Item deletion state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const fukkmCatalog = useMemo(() => getAllFormulariDrugs(), [])

  // ─── Fetch Catalogue ────────────────────────────────────────────────────────
  const fetchCatalogueData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await loadPaediatricCatalogue(hospitalId)
      setCatalogHeader(res.catalog)
      setItems(res.items)
      setLastSynced(new Date())
      if (showToast) {
        toastSuccess('Paediatric Catalogue synchronized successfully with MyInventory.')
      }
    } catch (err: any) {
      toastError('Failed to load catalogue: ' + (err.message || 'Database error'))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [hospitalId, toastSuccess, toastError])

  useEffect(() => {
    fetchCatalogueData()
  }, [fetchCatalogueData])

  // ─── KPI Calculations ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = items.length
    const liquid = items.filter(i => {
      const f = (i.drug.dosage_form || '').toLowerCase()
      const n = (i.drug.drug_name || '').toLowerCase()
      return f.includes('syrup') || f.includes('suspension') || f.includes('drop') || n.includes('syrup') || n.includes('suspension') || n.includes('drop')
    }).length
    const highAlertOrRescue = items.filter(i => {
      const n = (i.drug.drug_name || '').toLowerCase()
      const g = (i.clinical_group || '').toLowerCase()
      return (
        g.includes('kecemasan') ||
        g.includes('emergency') ||
        g.includes('resus') ||
        i.drug.is_controlled ||
        n.includes('salbutamol') ||
        n.includes('adrenaline') ||
        n.includes('diazepam')
      )
    }).length
    const lowStock = items.filter(i => (i.facility_stock ?? 0) < i.min_limit).length

    return { total, liquid, highAlertOrRescue, lowStock }
  }, [items])

  // ─── Filtered Items ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    const list = items.filter(item => {
      // Search
      if (q) {
        const hay = [
          item.drug.drug_name,
          item.drug.generic_name,
          item.drug.brand_name,
          item.drug.drug_code,
          item.drug.dosage_form,
          item.store_location,
        ].map(s => (s || '').toLowerCase()).join(' ')
        if (!hay.includes(q)) return false
      }

      // Clinical Group
      if (selectedClinicalGroup !== 'all') {
        const itemGroup = item.clinical_group || ''
        const matches =
          itemGroup === selectedClinicalGroup ||
          (selectedClinicalGroup.startsWith('Antibiot') && itemGroup.startsWith('Antibiot')) ||
          (selectedClinicalGroup.startsWith('Analges') && itemGroup.startsWith('Analges')) ||
          (selectedClinicalGroup.startsWith('Respir') && itemGroup.startsWith('Respir')) ||
          (selectedClinicalGroup.includes('Resus') && itemGroup.includes('Resus')) ||
          (selectedClinicalGroup.startsWith('Fluid') && (itemGroup.startsWith('Fluid') || itemGroup.startsWith('Cecair'))) ||
          (selectedClinicalGroup.startsWith('Gastro') && itemGroup.startsWith('Gastro')) ||
          (selectedClinicalGroup.includes('Oph') && (itemGroup.includes('Oph') || itemGroup.includes('Oftal'))) ||
          (selectedClinicalGroup.startsWith('General') && (itemGroup.startsWith('General') || itemGroup.startsWith('Umum')))
        if (!matches) return false
      }

      // Formulation
      if (formulationFilter !== 'all') {
        const form = (item.drug.dosage_form || '').toLowerCase()
        const name = (item.drug.drug_name || '').toLowerCase()

        if (formulationFilter === 'syrup' && !form.includes('syrup') && !form.includes('suspension') && !name.includes('syrup') && !name.includes('suspension')) {
          return false
        }
        if (formulationFilter === 'drops' && !form.includes('drop') && !name.includes('drop')) {
          return false
        }
        if (formulationFilter === 'inhaler' && !form.includes('inhaler') && !name.includes('inhaler') && !name.includes('puff')) {
          return false
        }
        if (formulationFilter === 'injection' && !form.includes('injection') && !form.includes('vial') && !name.includes('injection')) {
          return false
        }
        if (formulationFilter === 'tablet' && !form.includes('tablet') && !form.includes('capsule')) {
          return false
        }
      }

      // Prescriber Category
      if (prescriberFilter !== 'all' && item.prescriber_category !== prescriberFilter) {
        return false
      }

      // Stock Status
      if (stockFilter !== 'all') {
        const s = item.facility_stock ?? 0
        if (stockFilter === 'nil' && s > 0) return false
        if (stockFilter === 'low_stock' && (s <= 0 || s >= item.min_limit)) return false
        if (stockFilter === 'in_stock' && s < item.min_limit) return false
      }

      return true
    })

    return list.sort((a, b) => {
      const nameA = (a.drug?.drug_name || '').trim().toLowerCase()
      const nameB = (b.drug?.drug_name || '').trim().toLowerCase()
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
    })
  }, [items, searchTerm, selectedClinicalGroup, formulationFilter, prescriberFilter, stockFilter])

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleOpenMonograph = (item: PaediatricCatalogueItem) => {
    const facilityDrugShim: any = {
      ...item.drug,
      facility_stock: item.facility_stock,
      min_buffer_level: item.min_limit,
      location: item.store_location,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
    }
    const matched = findBestFukkmMatch(facilityDrugShim, fukkmCatalog)
    const targetDrug = matched || synthesizeDrugEntryFromFacility(facilityDrugShim)

    navigate(`/formulari/drug/${targetDrug.id}`, {
      state: {
        fromLawasFormulary: true,
        facilityDrug: facilityDrugShim,
        fukkmMatch: targetDrug,
        backLabel: 'Paediatric Catalogue',
        backPath: '/formulari/paediatric-catalogue',
      },
    })
  }

  const handleOpenCalculator = (drugName: string) => {
    setCalcInitialDrugName(drugName)
    setIsCalcModalOpen(true)
  }

  const handleOpenEditLimits = (item: PaediatricCatalogueItem) => {
    setEditingItem(item)
    setEditMin(item.min_limit)
    setEditMax(item.max_limit || 30)
    setEditReorder(item.reorder_level)
  }

  const handleSaveLimits = async () => {
    if (!editingItem) return
    setIsUpdatingLimit(true)
    try {
      await updatePaediatricCatalogueItem(editingItem.id, {
        min_limit: Number(editMin) || 5,
        max_limit: Number(editMax) || 30,
        reorder_level: Number(editReorder) || 10,
      })
      toastSuccess(`Quota limits for ${editingItem.drug.drug_name} updated successfully.`)
      setEditingItem(null)
      fetchCatalogueData()
    } catch (err: any) {
      toastError('Failed to update quota limits: ' + (err.message || 'Server error'))
    } finally {
      setIsUpdatingLimit(false)
    }
  }

  const handleDeleteItem = async (item: PaediatricCatalogueItem) => {
    if (!catalogHeader) return
    const confirmed = window.confirm(
      `Are you sure you want to remove "${item.drug.drug_name}" from the Paediatric Catalogue?`
    )
    if (!confirmed) return

    setDeletingItemId(item.id)
    try {
      await removePaediatricCatalogueItem(item.id, catalogHeader.id)
      toastSuccess(`Medication ${item.drug.drug_name} removed from ward catalogue.`)
      fetchCatalogueData()
    } catch (err: any) {
      toastError('Failed to remove medication: ' + (err.message || 'Server error'))
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleExportExcel = () => {
    try {
      const sourceItems = filteredItems.length > 0 ? filteredItems : items
      const sortedSource = [...sourceItems].sort((a, b) => {
        const nameA = (a.drug?.drug_name || '').trim().toLowerCase()
        const nameB = (b.drug?.drug_name || '').trim().toLowerCase()
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
      })

      const exportItems = sortedSource.map(i => ({
        ...i.drug,
        facility_stock: i.facility_stock,
        min_buffer_level: i.min_limit,
        location: i.store_location,
        notes: `Paediatric Ward Catalogue (Min: ${i.min_limit}, Reorder: ${i.reorder_level}, Max: ${i.max_limit || '-'})`,
      }))

      exportFacilityDrugInventoryToExcel(exportItems as any, {
        hospitalName: 'Hospital Lawas',
        departmentName: 'Paediatric Ward (Wad Pediatrik)',
        generatedBy: user?.name || 'Pharmacist',
        generatedByTitle: user?.role || 'Pharmacist',
        filename: `Paediatric_Catalogue_Hospital_Lawas_${new Date().getFullYear()}.xlsx`,
      })
      toastSuccess('Paediatric Catalogue Excel file exported successfully.')
    } catch (err: any) {
      toastError('Failed to export Excel file.')
    }
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      const itemsToExport = filteredItems.length > 0 ? filteredItems : items
      await generatePaediatricCataloguePdf(itemsToExport, {
        hospitalName: 'Hospital Lawas',
        departmentName: 'Paediatric Ward & Pharmacy Department',
        generatedBy: user?.name || user?.full_name || 'Pharmacist',
        generatedByTitle: user?.role || user?.jawatan || 'Pharmacist',
      })
      toastSuccess('Official Paediatric Catalogue PDF document generated & downloaded successfully.')
    } catch (err: any) {
      console.error('Error generating PDF:', err)
      toastError('Failed to generate PDF: ' + (err.message || 'Unknown error'))
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Official Government Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/40 shrink-0">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Paediatric Drug Catalogue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Paediatric Ward
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                Synced with MyInventory
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Approved paediatric medication formulary and floor stock for Hospital Lawas Paediatric Ward. Directly synchronized with MyInventory facility stock.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchCatalogueData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all disabled:opacity-50"
            title="Sync list from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => handleOpenCalculator('')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm shadow-indigo-950/20"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dose Calculator</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all shadow-sm shadow-rose-950/20 disabled:opacity-50"
            title="Download official Paediatric Catalogue PDF (5 Columns: Code, Name, Prescriber, Packaging, Price)"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsPickerModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Select From MyInventory</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">TOTAL PAEDIATRIC MEDICATIONS</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stats.total}</span>
            <span className="text-xs text-slate-400 font-medium">items in ward</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">SYRUPS & DROPS</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-cyan-300 tracking-tight">{stats.liquid}</span>
            <span className="text-xs text-slate-400 font-medium">liquid formulations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">EMERGENCY / RESUSCITATION</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-300 tracking-tight">{stats.highAlertOrRescue}</span>
            <span className="text-xs text-slate-400 font-medium">critical medications</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">RESTOCK REQUIRED</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-300 tracking-tight">{stats.lowStock}</span>
            <span className="text-xs text-slate-400 font-medium">below min limit</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search paediatric medication name, generic (INN), dosage or item code..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-white/[0.1] rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Select Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Prescriber Category */}
            <select
              value={prescriberFilter}
              onChange={e => setPrescriberFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900/90 border border-white/[0.1] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Prescriber Categories</option>
              <option value="A*">Category A*</option>
              <option value="A">Category A</option>
              <option value="A/KK">Category A/KK</option>
              <option value="B">Category B</option>
              <option value="C">Category C</option>
            </select>

            {/* Stock Status */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-900/90 border border-white/[0.1] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (Sufficient)</option>
              <option value="low_stock">Low Stock (&lt; Min)</option>
              <option value="nil">Out of Stock (NIL)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-white/[0.08] rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Compact Table View"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.04]">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Clinical Class:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'Antibiotics / Antimicrobials', label: 'Antibiotics' },
            { id: 'Analgesics & Antipyretics', label: 'Analgesics / Fever' },
            { id: 'Respiratory & Allergy', label: 'Respiratory' },
            { id: 'Emergency, CNS & Resuscitation', label: 'Emergency / Resus' },
            { id: 'Fluids & Electrolytes', label: 'Fluids & IV' },
            { id: 'Gastrointestinal', label: 'Gastro' },
            { id: 'Ophthalmic, Otic & Topical', label: 'Eye / Ear / Skin' },
            { id: 'General & Supplements', label: 'General' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedClinicalGroup(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedClinicalGroup === tab.id
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm shadow-teal-500/30'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] border border-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Formulation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Dosage Form:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'syrup', label: '🥄 Syrup / Suspension' },
            { id: 'drops', label: '💧 Drops' },
            { id: 'inhaler', label: '💨 Inhaler / Nebulizer' },
            { id: 'injection', label: '💉 Injection / IV' },
            { id: 'tablet', label: '💊 Tablet / Capsule' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFormulationFilter(f.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                formulationFilter === f.id
                  ? 'bg-white/20 text-white font-semibold border border-white/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-sm font-medium">Loading Paediatric Ward drug catalogue from Supabase...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
            <Baby className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-white">No Medications Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchTerm || selectedClinicalGroup !== 'all' || formulationFilter !== 'all'
                ? 'No medications match your search or filter criteria. Please adjust your search keywords.'
                : 'No medications currently registered in the Paediatric Ward Catalogue. Use the button below to add drugs from MyInventory.'}
            </p>
          </div>
          <button
            onClick={() => setIsPickerModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Select Drugs From MyInventory</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const isDeleting = deletingItemId === item.id
            const stock = item.facility_stock ?? 0
            const isNil = stock <= 0
            const isLow = stock > 0 && stock < item.min_limit

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-teal-500/40 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-teal-950/20"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/25">
                      {item.clinical_group}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        Cat {item.prescriber_category}
                      </span>
                      {item.drug.procurement_vote && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          {item.drug.procurement_vote}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Drug Title */}
                  <div>
                    <h3
                      onClick={() => handleOpenMonograph(item)}
                      className="font-bold text-sm text-slate-100 group-hover:text-teal-300 transition-colors cursor-pointer leading-snug"
                    >
                      {item.drug.drug_name}
                    </h3>
                    {item.drug.generic_name && (
                      <p className="text-xs text-slate-400 mt-0.5 italic">
                        {item.drug.generic_name}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
                    {item.drug.dosage_form && (
                      <span>Form: <strong className="text-slate-300 font-medium">{item.drug.dosage_form}</strong></span>
                    )}
                    {item.drug.drug_code && (
                      <span>Code: <code className="text-teal-400 font-mono text-[11px]">{item.drug.drug_code}</code></span>
                    )}
                    {item.drug.storage_conditions && (
                      <span>🌡️ {item.drug.storage_conditions}</span>
                    )}
                  </div>

                  {/* Quota & Physical Stock Tile */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Facility Stock Balance:</span>
                      {isNil ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          NIL (Out of Stock)
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {stock} units (Low)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {stock} units
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05] text-[11px] text-center">
                      <div>
                        <span className="block text-slate-500 text-[10px]">Ward Min</span>
                        <strong className="text-slate-200 font-mono">{item.min_limit}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px]">Reorder</span>
                        <strong className="text-amber-400 font-mono">{item.reorder_level}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px]">Ward Max</span>
                        <strong className="text-slate-200 font-mono">{item.max_limit || '-'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenCalculator(item.drug.drug_name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                      title="Calculate paediatric dosage by weight"
                    >
                      <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Calculator</span>
                    </button>

                    <button
                      onClick={() => handleOpenMonograph(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="View FUKKM Clinical Monograph"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                      <span>Monograph</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditLimits(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit Ward Quota Limits"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                      title="Remove from Paediatric Ward"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Paediatric Medication Name</th>
                  <th className="py-3 px-3">Clinical Class</th>
                  <th className="py-3 px-3">Dosage Form</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Ward Quota Limits</th>
                  <th className="py-3 px-3">Store Stock Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-slate-300">
                {filteredItems.map(item => {
                  const stock = item.facility_stock ?? 0
                  const isNil = stock <= 0
                  const isLow = stock > 0 && stock < item.min_limit

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span
                            onClick={() => handleOpenMonograph(item)}
                            className="font-bold text-slate-100 hover:text-teal-300 cursor-pointer transition-colors"
                          >
                            {item.drug.drug_name}
                          </span>
                          {item.drug.generic_name && (
                            <span className="text-[11px] text-slate-400 italic">
                              {item.drug.generic_name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {item.drug.drug_code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/25 whitespace-nowrap">
                          {item.clinical_group}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-medium">
                          {item.drug.dosage_form || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          Cat {item.prescriber_category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-slate-300">Min: {item.min_limit}</span> |{' '}
                        <span className="text-amber-400">Reorder: {item.reorder_level}</span> |{' '}
                        <span className="text-slate-400">Max: {item.max_limit || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        {isNil ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            NIL
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {stock} units (Low)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCalculator(item.drug.drug_name)}
                            className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
                            title="Open Dose Calculator"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenMonograph(item)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06]"
                            title="Clinical Monograph"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                          </button>
                          <button
                            onClick={() => handleOpenEditLimits(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                            title="Edit Quota Limits"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Remove from Ward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Picker Modal to Pick from MyInventory */}
      <InventoryDrugPickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        catalogId={catalogHeader?.id || ''}
        existingDrugIds={items.map(i => i.drug_id)}
        onSuccess={() => fetchCatalogueData(true)}
      />

      {/* MODAL 2: Paediatric Dose Calculator Modal */}
      <PaediatricDoseCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        initialDrugName={calcInitialDrugName}
      />

      {/* MODAL 3: Edit Ward Quota Limits Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Update Ward Quota Limits</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{editingItem.drug.drug_name}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Minimum Stock Level (Min Limit):</label>
                <input
                  type="number"
                  min="1"
                  value={editMin}
                  onChange={e => setEditMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.1] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reorder Point (Reorder Level):</label>
                <input
                  type="number"
                  min="1"
                  value={editReorder}
                  onChange={e => setEditReorder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.1] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Maximum Stock Level (Max Limit):</label>
                <input
                  type="number"
                  min="1"
                  value={editMax}
                  onChange={e => setEditMax(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.1] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.06] border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingLimit}
                onClick={handleSaveLimits}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all disabled:opacity-50"
              >
                {isUpdatingLimit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaediatricCataloguePage
