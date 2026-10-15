import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby, Search, Plus, RefreshCw, FileSpreadsheet, Printer, Calculator, AlertTriangle, Flame, Droplets, LayoutGrid, AlignJustify, Trash2, Edit, ExternalLink, X, Filter, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
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
import type { DrugEntry } from '../types/formulariTypes'
import { FormulariAssetError } from '../services/formulariAssetService'
import { findBestFukkmMatch, synthesizeDrugEntryFromFacility } from '../services/fukkmMatcher'
import { exportFacilityDrugInventoryToExcel } from '@/services/pharmacy/facilityInventoryExcelService'
import type { FacilityDrugItem } from '@/services/pharmacy/facilityDrugInventoryService'
import { loadFacilityDrugInventory } from '@/services/pharmacy/facilityDrugInventoryService'
import { generatePaediatricCataloguePdf } from '../services/paediatricCataloguePdfService'

export const PaediatricCataloguePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { success: toastSuccess, error: toastError } = useToastStore()

  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  // Data states
  const [catalogHeader, setCatalogHeader] = useState<PaediatricCatalogHeader | null>(null)
  const [items, setItems] = useState<PaediatricCatalogueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
  const [openingMonographId, setOpeningMonographId] = useState<string | null>(null)

  const [fukkmCatalog, setFukkmCatalog] = useState<DrugEntry[]>([])
  const [isFukkmLoading, setIsFukkmLoading] = useState(true)
  const [fukkmError, setFukkmError] = useState<FormulariAssetError | null>(null)
  const loadFukkmCatalog = useCallback(async () => {
    setIsFukkmLoading(true)
    setFukkmError(null)
    try {
      setFukkmCatalog(await getAllFormulariDrugs())
    } catch (error) {
      setFukkmError(error instanceof FormulariAssetError ? error : new FormulariAssetError('The formulary data could not be loaded.', 'unavailable', true))
    } finally {
      setIsFukkmLoading(false)
    }
  }, [])

  useEffect(() => { void loadFukkmCatalog() }, [loadFukkmCatalog])

  // ─── Fetch Catalogue ────────────────────────────────────────────────────────
  const fetchCatalogueData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await loadPaediatricCatalogue(hospitalId)
      setCatalogHeader(res.catalog)
      setItems(res.items)
      if (showToast) {
        toastSuccess('Paediatric Catalogue synchronized successfully with MyInventory.')
      }
    } catch (error: unknown) {
      toastError('Failed to load catalogue: ' + (error instanceof Error ? error.message : 'Database error'))
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
  const handleOpenMonograph = async (item: PaediatricCatalogueItem) => {
    if (isFukkmLoading || fukkmError) {
      toastError(isFukkmLoading ? 'Formulary data is still loading.' : 'Formulary data is unavailable. Retry loading before opening a monograph.')
      return
    }
    setOpeningMonographId(item.id)
    try {
      const inventory = await loadFacilityDrugInventory(hospitalId)
      const facilityDrug = inventory.find(drug => drug.id === item.drug_id || drug.drug_code === item.drug.drug_code)
      if (!facilityDrug) {
        toastError('This catalogue item is not available in facility inventory. Refresh the catalogue and try again.')
        return
      }
      const matched = findBestFukkmMatch(facilityDrug, fukkmCatalog)
      const targetDrug = matched || synthesizeDrugEntryFromFacility(facilityDrug)

      navigate(`/formulari/drug/${targetDrug.id}`, {
        state: {
          fromLawasFormulary: true,
          facilityDrug,
          fukkmMatch: targetDrug,
          backLabel: 'Paediatric Catalogue',
          backPath: '/formulari/paediatric-catalogue',
        },
      })
    } catch {
      toastError('Facility inventory could not be loaded. Try again before opening this monograph.')
    } finally {
      setOpeningMonographId(null)
    }
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
    } catch (error: unknown) {
      toastError('Failed to update quota limits: ' + (error instanceof Error ? error.message : 'Server error'))
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
    } catch (error: unknown) {
      toastError('Failed to remove medication: ' + (error instanceof Error ? error.message : 'Server error'))
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleExportExcel = async () => {
    try {
      const sourceItems = filteredItems.length > 0 ? filteredItems : items
      const sortedSource = [...sourceItems].sort((a, b) => {
        const nameA = (a.drug?.drug_name || '').trim().toLowerCase()
        const nameB = (b.drug?.drug_name || '').trim().toLowerCase()
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
      })

      const inventory = await loadFacilityDrugInventory(hospitalId)
      const exportItems: FacilityDrugItem[] = sortedSource.map(item => {
        const facilityDrug = inventory.find(drug => drug.id === item.drug_id || drug.drug_code === item.drug.drug_code)
        if (!facilityDrug) throw new Error(`Inventory record unavailable for ${item.drug.drug_name}`)
        return {
          ...facilityDrug,
          facility_stock: item.facility_stock,
          min_buffer_level: item.min_limit,
          location: item.store_location,
          notes: `Paediatric Ward Catalogue (Min: ${item.min_limit}, Reorder: ${item.reorder_level}, Max: ${item.max_limit || '-'})`,
        }
      })

      exportFacilityDrugInventoryToExcel(exportItems, {
        hospitalName: 'Hospital Lawas',
        departmentName: 'Paediatric Ward (Wad Pediatrik)',
        generatedBy: user?.full_name || 'Pharmacist',
        generatedByTitle: user?.role ? String(user.role) : 'Pharmacist',
        filename: `Paediatric_Catalogue_Hospital_Lawas_${new Date().getFullYear()}.xlsx`,
      })
      toastSuccess('Paediatric Catalogue Excel file exported successfully.')
    } catch {
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
        generatedBy: user?.full_name || 'Pharmacist',
        generatedByTitle: user?.role ? String(user.role) : 'Pharmacist',
      })
      toastSuccess('Official Paediatric Catalogue PDF document generated & downloaded successfully.')
    } catch (error: unknown) {
      console.error('Error generating PDF:', error)
      toastError('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="w-full min-h-screen text-text-primary p-4 md:p-6 lg:p-8 space-y-6">
      {isFukkmLoading && <p className="rounded-lg border border-border-default bg-subtle px-4 py-3 text-sm text-text-muted" role="status">Loading FUKKM monographs…</p>}
      {openingMonographId && <p className="rounded-lg border border-border-default bg-subtle px-4 py-3 text-sm text-text-muted" role="status">Loading facility record for {items.find(item => item.id === openingMonographId)?.drug.drug_name || 'selected medicine'}…</p>}
      {fukkmError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3" role="alert"><p className="text-sm text-text-primary">{fukkmError.message}</p><button type="button" onClick={() => fukkmError.retryable ? void loadFukkmCatalog() : window.location.reload()} className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">{fukkmError.retryable ? 'Retry' : 'Reload formulary'}</button></div>}
      {/* Official Government Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-default">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-subtle border border-border-default flex items-center justify-center text-accent-base shadow-elevation-1 shrink-0">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
                Paediatric Drug Catalogue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-base/10 text-accent-base border border-accent-base/20">
                Paediatric Ward
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-subtle text-text-muted border border-border-default">
                Synced with MyInventory
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-muted max-w-3xl leading-relaxed">
              Approved paediatric medication formulary and floor stock for Hospital Lawas Paediatric Ward. Directly synchronized with MyInventory facility stock.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchCatalogueData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-surface hover:bg-subtle text-text-secondary border border-border-default transition-colors shadow-elevation-1 disabled:opacity-50"
            title="Sync list from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent-base' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => handleOpenCalculator('')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface hover:bg-subtle text-text-primary border border-border-default transition-colors shadow-elevation-1"
          >
            <Calculator className="w-3.5 h-3.5 text-accent-base" />
            <span>Dose Calculator</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface hover:bg-subtle text-text-secondary border border-border-default transition-colors shadow-elevation-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface hover:bg-subtle text-text-secondary border border-border-default transition-colors shadow-elevation-1 disabled:opacity-50"
            title="Download official Paediatric Catalogue PDF"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsPickerModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent-base hover:bg-accent-hover text-white transition-colors shadow-elevation-1"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Select From MyInventory</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border-default shadow-elevation-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">TOTAL PAEDIATRIC MEDICATIONS</span>
            <div className="w-7 h-7 rounded-lg bg-subtle text-text-muted flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-text-primary tabular-nums">{stats.total}</span>
            <span className="text-xs text-text-muted font-medium">items in ward</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-default shadow-elevation-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">SYRUPS & DROPS</span>
            <div className="w-7 h-7 rounded-lg bg-subtle text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">{stats.liquid}</span>
            <span className="text-xs text-text-muted font-medium">liquid formulations</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-default shadow-elevation-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">EMERGENCY / RESUSCITATION</span>
            <div className="w-7 h-7 rounded-lg bg-subtle text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">{stats.highAlertOrRescue}</span>
            <span className="text-xs text-text-muted font-medium">critical medications</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-default shadow-elevation-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">RESTOCK REQUIRED</span>
            <div className="w-7 h-7 rounded-lg bg-subtle text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-500 tabular-nums">{stats.lowStock}</span>
            <span className="text-xs text-text-muted font-medium">below min limit</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface border border-border-default space-y-3 shadow-elevation-1">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search paediatric medication name, generic (INN), dosage or item code..."
              className="w-full pl-10 pr-9 py-2 bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base/20 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
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
              className="px-3 py-2 bg-surface border border-border-default rounded-lg text-xs text-text-secondary focus:outline-none focus:border-accent-base"
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
              onChange={e => setStockFilter((['all', 'in_stock', 'low_stock', 'nil'] as const).find(filter => filter === e.currentTarget.value) ?? 'all')}
              className="px-3 py-2 bg-surface border border-border-default rounded-lg text-xs text-text-secondary focus:outline-none focus:border-accent-base"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (Sufficient)</option>
              <option value="low_stock">Low Stock (&lt; Min)</option>
              <option value="nil">Out of Stock (NIL)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-subtle border border-border-default rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-surface text-text-primary shadow-elevation-1 font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-surface text-text-primary shadow-elevation-1 font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Compact Table View"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-default">
          <span className="text-[11px] font-medium text-text-muted mr-1 flex items-center gap-1">
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedClinicalGroup === tab.id
                  ? 'bg-accent-base text-white font-semibold shadow-elevation-1'
                  : 'bg-surface text-text-secondary hover:bg-subtle border border-border-default'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Formulation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-text-muted mr-1">Dosage Form:</span>
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
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                formulationFilter === f.id
                  ? 'bg-subtle text-text-primary font-semibold border border-border-default'
                  : 'text-text-muted hover:text-text-primary'
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 transition-colors"
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
                className="group relative flex flex-col justify-between rounded-xl bg-surface border border-border-default hover:border-accent-base/40 p-4 transition-colors duration-150 shadow-elevation-1 hover:shadow-xs"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-subtle text-text-secondary border border-border-default">
                      {item.clinical_group}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-accent-base/10 text-accent-base border border-accent-base/20">
                        Cat {item.prescriber_category}
                      </span>
                      {item.drug.procurement_vote && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-subtle text-text-muted border border-border-default">
                          {item.drug.procurement_vote}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Drug Title */}
                  <div>
                    <h3
                      onClick={() => handleOpenMonograph(item)}
                      className="font-bold text-sm text-text-primary group-hover:text-accent-base transition-colors cursor-pointer leading-snug"
                    >
                      {item.drug.drug_name}
                    </h3>
                    {item.drug.generic_name && (
                      <p className="text-xs text-text-muted mt-0.5 italic">
                        {item.drug.generic_name}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted pt-1 border-t border-border-default">
                    {item.drug.dosage_form && (
                      <span>Form: <strong className="text-text-primary font-medium">{item.drug.dosage_form}</strong></span>
                    )}
                    {item.drug.drug_code && (
                      <span>Code: <code className="text-accent-base font-mono text-[11px]">{item.drug.drug_code}</code></span>
                    )}
                    {item.drug.storage_conditions && (
                      <span>🌡️ {item.drug.storage_conditions}</span>
                    )}
                  </div>

                  {/* Quota & Physical Stock Tile */}
                  <div className="p-3 rounded-lg bg-subtle/50 border border-border-default space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted font-medium">Facility Stock Balance:</span>
                      {isNil ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          NIL (Out of Stock)
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {stock} units (Low)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {stock} units
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-default text-[11px] text-center">
                      <div>
                        <span className="block text-text-muted text-[10px] uppercase font-medium">Ward Min</span>
                        <strong className="text-text-primary font-mono text-xs">{item.min_limit}</strong>
                      </div>
                      <div>
                        <span className="block text-text-muted text-[10px] uppercase font-medium">Reorder</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs">{item.reorder_level}</strong>
                      </div>
                      <div>
                        <span className="block text-text-muted text-[10px] uppercase font-medium">Ward Max</span>
                        <strong className="text-text-primary font-mono text-xs">{item.max_limit || '-'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-default">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenCalculator(item.drug.drug_name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-subtle text-text-primary border border-border-default transition-colors shadow-elevation-1"
                      title="Calculate paediatric dosage by weight"
                    >
                      <Calculator className="w-3.5 h-3.5 text-accent-base" />
                      <span>Calculator</span>
                    </button>

                    <button
                      onClick={() => handleOpenMonograph(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                      title="View FUKKM Clinical Monograph"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-accent-base" />
                      <span>Monograph</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditLimits(item)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                      title="Edit Ward Quota Limits"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                      title="Remove from Paediatric Ward"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
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
        <div className="rounded-xl border border-border-default bg-surface overflow-hidden shadow-elevation-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-default bg-subtle/50 text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Paediatric Medication Name</th>
                  <th className="py-3 px-3">Clinical Class</th>
                  <th className="py-3 px-3">Dosage Form</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Ward Quota Limits</th>
                  <th className="py-3 px-3">Store Stock Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default text-text-secondary">
                {filteredItems.map(item => {
                  const stock = item.facility_stock ?? 0
                  const isNil = stock <= 0
                  const isLow = stock > 0 && stock < item.min_limit

                  return (
                    <tr key={item.id} className="hover:bg-subtle/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span
                            onClick={() => handleOpenMonograph(item)}
                            className="font-bold text-text-primary hover:text-accent-base cursor-pointer transition-colors"
                          >
                            {item.drug.drug_name}
                          </span>
                          {item.drug.generic_name && (
                            <span className="text-[11px] text-text-muted italic">
                              {item.drug.generic_name}
                            </span>
                          )}
                          <span className="text-[10px] text-text-muted font-mono mt-0.5">
                            {item.drug.drug_code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-subtle text-text-secondary border border-border-default whitespace-nowrap">
                          {item.clinical_group}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-text-primary font-medium">
                          {item.drug.dosage_form || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-base/10 text-accent-base border border-accent-base/20">
                          Cat {item.prescriber_category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-text-primary">Min: {item.min_limit}</span> |{' '}
                        <span className="text-amber-600 dark:text-amber-400">Reorder: {item.reorder_level}</span> |{' '}
                        <span className="text-text-muted">Max: {item.max_limit || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        {isNil ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            NIL
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {stock} units (Low)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCalculator(item.drug.drug_name)}
                            className="p-1.5 rounded-lg bg-surface hover:bg-subtle text-text-primary border border-border-default transition-colors shadow-elevation-1"
                            title="Open Dose Calculator"
                          >
                            <Calculator className="w-3.5 h-3.5 text-accent-base" />
                          </button>
                          <button
                            onClick={() => handleOpenMonograph(item)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                            title="Clinical Monograph"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-accent-base" />
                          </button>
                          <button
                            onClick={() => handleOpenEditLimits(item)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                            title="Edit Quota Limits"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-surface/[0.06] border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingLimit}
                onClick={handleSaveLimits}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-50"
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
