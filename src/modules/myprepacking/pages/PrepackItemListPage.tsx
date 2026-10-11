// src/modules/myprepacking/pages/PrepackItemListPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Boxes,
  Package,
  Pill,
  Plus,
  Search,
  CheckCircle2,
  PackageCheck,
  Edit2,
  RefreshCw,
  TrendingDown,
  FileText,
  Beaker,
  ShieldAlert,
  AlertTriangle,
  Check,
  Power,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { 
  getPrepackItems, 
  togglePrepackItemActiveStatus, 
  bulkSetPrepackActiveStatus, 
  syncHospitalGalenicalCatalog,
  formatUnitQuantityDisplay
} from '../services/prepackService'
import type { PrepackItem, PackType, CatalogCategory } from '../types/prepack'
import { PrepackItemModal } from '../components/PrepackItemModal'
import { PrepackItemCard } from '../components/PrepackItemCard'
import { PrepackBatchCreateModal } from '../components/PrepackBatchCreateModal'
import { PrepackUsageModal } from '../components/PrepackUsageModal'
import { GalenicalPreparationMonographModal } from '../components/GalenicalPreparationMonographModal'
import { useToast } from '@/stores/toastStore'

export type CatalogCategoryFilter = 'all' | 'uod' | 'prepack' | 'internal' | 'external'
export type FacilityStatusFilter = 'all' | 'active' | 'inactive'

interface PrepackItemListPageProps {
  mode?: 'uod' | 'prepack' | 'all' | 'internal' | 'external'
}

export const PrepackItemListPage: React.FC<PrepackItemListPageProps> = ({ mode: propMode }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Determine active category from query params, prop, or pathname
  const activeCategory = useMemo<CatalogCategoryFilter>(() => {
    const urlCategory = searchParams.get('category') || searchParams.get('tab')
    if (urlCategory && ['all', 'uod', 'prepack', 'internal', 'external'].includes(urlCategory)) {
      return urlCategory as CatalogCategoryFilter
    }
    if (propMode) return propMode

    const path = location.pathname.replace(/\/+$/, '')
    if (path.endsWith('/catalog') || /(?:^|\/)catalog(?:\/|$)/.test(path)) return 'all'
    if (path.endsWith('/uod') || /(?:^|\/)uod(?:\/|$)/.test(path)) return 'uod'
    if (path.endsWith('/internal') || /(?:^|\/)internal(?:\/|$)/.test(path)) return 'internal'
    if (path.endsWith('/external') || /(?:^|\/)external(?:\/|$)/.test(path)) return 'external'
    if (path.endsWith('/prepack') || /(?:^|\/)prepack(?:\/|$)/.test(path)) return 'prepack'

    return 'all'
  }, [searchParams, propMode, location.pathname])

  const [loading, setLoading] = useState(true)
  const [syncingCatalog, setSyncingCatalog] = useState(false)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)
  const [items, setItems] = useState<PrepackItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityStatusFilter>('all')
  const [selectedPackType, setSelectedPackType] = useState<string>('all')
  const [selectedDosageForm, setSelectedDosageForm] = useState<string>('all')
  const [showOnlyRepackNeeded, setShowOnlyRepackNeeded] = useState<boolean>(() => {
    return searchParams.get('filter') === 'repack'
  })

  // Modal states
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<PrepackItem | null>(null)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [selectedItemIdForBatch, setSelectedItemIdForBatch] = useState<string | undefined>()
  const [galenicalModalOpen, setGalenicalModalOpen] = useState(false)
  const [selectedGalenicalItem, setSelectedGalenicalItem] = useState<PrepackItem | null>(null)

  const loadItems = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await getPrepackItems()
      if (error) throw error

      const currentList = data || []
      // Strict zero-mock auto-seeding check:
      // If hospital currently has no internal or external items, automatically sync official KKM monographs
      const hasInternal = currentList.some(i => i.pack_type === 'internal')
      const hasExternal = currentList.some(i => i.pack_type === 'external')

      if (!hasInternal || !hasExternal) {
        setSyncingCatalog(true)
        await syncHospitalGalenicalCatalog()
        const refreshed = await getPrepackItems()
        setItems(refreshed.data || [])
      } else {
        setItems(currentList)
      }
    } catch (err: any) {
      console.error('Error loading prepack items:', err)
      toast.error('Failed to load formulation catalog')
    } finally {
      setLoading(false)
      setSyncingCatalog(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  // Switch category tab & synchronize route
  const handleSelectCategory = (cat: CatalogCategoryFilter) => {
    setSelectedPackType('all')
    setSelectedDosageForm('all')
    setStatusFilter('all')

    const targetPath = cat === 'all' ? '/prepacking/catalog' : `/prepacking/${cat}`
    navigate(targetPath)
  }

  // When loading into internal or external categories initially, maintain URL status or default to all
  useEffect(() => {
    if (items.length > 0 && (activeCategory === 'internal' || activeCategory === 'external')) {
      const urlStatus = searchParams.get('status')
      if (urlStatus && ['all', 'active', 'inactive'].includes(urlStatus)) {
        setStatusFilter(urlStatus as FacilityStatusFilter)
      } else {
        setStatusFilter('all')
      }
    }
  }, [activeCategory, items.length, searchParams])

  // Items scoped to the active category tab
  const categoryScopedItems = useMemo(() => {
    if (activeCategory === 'uod') {
      return items.filter(i => i.pack_type === 'uod')
    }
    if (activeCategory === 'prepack') {
      return items.filter(i => 
        i.pack_type === 'prepack' || 
        i.pack_type === 'prepack_tablet' || 
        i.pack_type === 'prepack_liquid' || 
        i.pack_type === 'prepack_cream' || 
        i.pack_type === 'extemporaneous'
      )
    }
    if (activeCategory === 'internal') {
      return items.filter(i => i.pack_type === 'internal')
    }
    if (activeCategory === 'external') {
      return items.filter(i => i.pack_type === 'external')
    }
    // 'all' category: strictly active formulations only as mandated
    return items.filter(i => i.status === 'active')
  }, [items, activeCategory])

  // Count summaries per category for tab pills & alerts
  const counts = useMemo(() => {
    const uodItems = items.filter(i => i.pack_type === 'uod')
    const prepackItems = items.filter(i => 
      i.pack_type === 'prepack' || 
      i.pack_type === 'prepack_tablet' || 
      i.pack_type === 'prepack_liquid' || 
      i.pack_type === 'prepack_cream' || 
      i.pack_type === 'extemporaneous'
    )
    const internalItems = items.filter(i => i.pack_type === 'internal')
    const externalItems = items.filter(i => i.pack_type === 'external')

    const allActive = items.filter(i => i.status === 'active').length

    const scopeActive = categoryScopedItems.filter(i => i.status === 'active').length
    const scopeInactive = categoryScopedItems.filter(i => i.status === 'inactive').length

    return {
      all: allActive,
      allTotal: items.length,
      uod: uodItems.length,
      prepack: prepackItems.length,
      internal: internalItems.length,
      internalActive: internalItems.filter(i => i.status === 'active').length,
      external: externalItems.length,
      externalActive: externalItems.filter(i => i.status === 'active').length,
      repackNeeded: categoryScopedItems.filter(i => i.needs_repack).length,
      scopeTotal: categoryScopedItems.length,
      scopeActive,
      scopeInactive
    }
  }, [items, categoryScopedItems])

  // Filtered items based on search, status filter, and reorder status
  const filteredItems = useMemo(() => {
    const list = categoryScopedItems.filter(item => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (
        item.item_name.toLowerCase().includes(q) ||
        item.item_code.toLowerCase().includes(q) ||
        (item.generic_name || '').toLowerCase().includes(q) ||
        (item.ingredients_formula || '').toLowerCase().includes(q)
      )

      let matchesCategory = true
      if (activeCategory === 'all') {
        if (selectedPackType !== 'all') {
          if (selectedPackType === 'uod') matchesCategory = item.pack_type === 'uod'
          else if (selectedPackType === 'internal') matchesCategory = item.pack_type === 'internal'
          else if (selectedPackType === 'external') matchesCategory = item.pack_type === 'external'
          else if (selectedPackType === 'prepack') {
            matchesCategory = (
              item.pack_type === 'prepack' || 
              item.pack_type === 'prepack_tablet' || 
              item.pack_type === 'prepack_liquid' || 
              item.pack_type === 'prepack_cream' || 
              item.pack_type === 'extemporaneous'
            )
          }
        }
      } else if (activeCategory === 'prepack') {
        if (selectedPackType !== 'all') {
          matchesCategory = item.pack_type === selectedPackType
        }
      } else {
        if (selectedDosageForm !== 'all') {
          matchesCategory = item.dosage_form === selectedDosageForm
        }
      }

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesRepack = !showOnlyRepackNeeded || item.needs_repack

      return matchesSearch && matchesCategory && matchesStatus && matchesRepack
    })

    // Sort items: always show active facility items first (at top of list), followed by inactive items
    return list.sort((a, b) => {
      const aActive = a.status === 'active' ? 1 : 0
      const bActive = b.status === 'active' ? 1 : 0
      if (aActive !== bActive) {
        return bActive - aActive
      }
      return a.item_name.localeCompare(b.item_name)
    })
  }, [categoryScopedItems, activeCategory, searchQuery, selectedPackType, selectedDosageForm, statusFilter, showOnlyRepackNeeded])

  // Interactive toggle handler with optimistic update
  const handleToggleItemStatus = async (item: PrepackItem) => {
    const newStatus: 'active' | 'inactive' = item.status === 'active' ? 'inactive' : 'active'
    setTogglingItemId(item.id)

    // 1. Optimistic UI update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))

    try {
      const { error } = await togglePrepackItemActiveStatus(item.id, newStatus)
      if (error) throw error

      toast.success(
        newStatus === 'active'
          ? `"${item.item_name}" has been activated for facility use.`
          : `"${item.item_name}" has been deactivated.`
      )
    } catch (err: any) {
      console.error('Failed to toggle item status:', err)
      // Revert optimistic update
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: item.status } : i))
      toast.error('Failed to update item status. Please try again.')
    } finally {
      setTogglingItemId(null)
    }
  }

  // Bulk status update for active tab (e.g. Internal or External preparations)
  const handleBulkStatusChange = async (targetPackType: 'internal' | 'external', newStatus: 'active' | 'inactive') => {
    const label = targetPackType === 'internal' ? 'Internal Preparation' : 'External Preparation'
    const actionLabel = newStatus === 'active' ? 'ACTIVATE ALL' : 'DEACTIVATE ALL'
    
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${label} monographs?`)) {
      return
    }

    setLoading(true)
    try {
      const { success, count, error } = await bulkSetPrepackActiveStatus(targetPackType, newStatus)
      if (error || !success) throw error || new Error('Bulk update failed')

      setItems(prev => prev.map(i => i.pack_type === targetPackType ? { ...i, status: newStatus } : i))
      toast.success(`${count} ${label} monographs have been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`)
    } catch (err: any) {
      console.error('Bulk status update failed:', err)
      toast.error('Bulk status update failed.')
    } finally {
      setLoading(false)
    }
  }

  // Sync official MOH Monographs
  const handleSyncCatalog = async () => {
    setSyncingCatalog(true)
    try {
      const res = await syncHospitalGalenicalCatalog()
      if (res.error) throw res.error

      if (res.syncedCount > 0) {
        toast.success(`${res.syncedCount} standard MOH monographs synchronized successfully.`)
      } else {
        toast.success('Catalog database is synchronized with standard MOH Monographs.')
      }
      await loadItems(true)
    } catch (err: any) {
      console.error('Error syncing catalog:', err)
      toast.error('Failed to synchronize MOH monograph catalog.')
    } finally {
      setSyncingCatalog(false)
    }
  }

  const handleEditItem = (item: PrepackItem) => {
    setItemToEdit(item)
    setItemModalOpen(true)
  }

  const handleItemNameClick = (item: PrepackItem) => {
    if (item.pack_type === 'internal' || item.pack_type === 'external') {
      setSelectedGalenicalItem(item)
      setGalenicalModalOpen(true)
    } else {
      handleEditItem(item)
    }
  }

  const handleCreateBatchForItem = (item: PrepackItem) => {
    setSelectedItemIdForBatch(item.id)
    setBatchModalOpen(true)
  }

  // Page titles, subtitles, and icons by active category
  const categoryMeta = useMemo(() => {
    switch (activeCategory) {
      case 'uod':
        return {
          title: 'Unit of Dose (UOD) Catalog',
          subtitle: 'Single unit-dose ward formulations, buffer thresholds, and repackaging triggers.',
          createLabel: 'Register UOD Formulation',
          icon: Boxes,
          searchPlaceholder: 'Search UOD medication, formulation code, generic...',
          emptyTitle: 'No UOD Formulations Found',
          emptyDesc: 'No Unit of Dose formulations registered in this facility database yet.'
        }
      case 'prepack':
        return {
          title: 'Bulk Prepacking Catalog',
          subtitle: 'Bulk oral tablets, liquids, and topical preparations repacked into ready-to-dispense units.',
          createLabel: 'Register Prepack Item',
          icon: Package,
          searchPlaceholder: 'Search prepack medication, code, generic...',
          emptyTitle: 'No Bulk Prepack Items Found',
          emptyDesc: 'No bulk prepack formulations registered in this facility database yet.'
        }
      case 'internal':
        return {
          title: 'Internal Preparations (Oral)',
          subtitle: 'Oral galenicals & extemporaneous mixtures (syrups, solutions, suspensions) labeled "FOR INTERNAL USE".',
          createLabel: 'Register New Preparation',
          icon: Beaker,
          searchPlaceholder: 'Search oral preparations, syrup formula, monograph code...',
          emptyTitle: 'No Internal Preparations Found',
          emptyDesc: 'No internal oral formulations registered in this facility database yet.'
        }
      case 'external':
        return {
          title: 'External Preparations (Topical)',
          subtitle: 'Lotions, creams, ointments, and disinfectant washes with mandatory red label "FOR EXTERNAL USE ONLY".',
          createLabel: 'Register New Preparation',
          icon: ShieldAlert,
          searchPlaceholder: 'Search antiseptic preparations, creams, ointments, codes...',
          emptyTitle: 'No External Preparations Found',
          emptyDesc: 'No external formulations registered in this facility database yet.'
        }
      default:
        return {
          title: 'Central Pharmacy Formulation Catalog',
          subtitle: 'Active formulations authorized for facility compounding and dispensing across all preparation domains.',
          createLabel: 'Register New Formulation',
          icon: Boxes,
          searchPlaceholder: 'Search active medication formulations, item codes, generic active ingredients...',
          emptyTitle: 'No Active Formulations Found',
          emptyDesc: 'No active formulations currently registered or enabled in this facility.'
        }
    }
  }, [activeCategory])

  const PageIcon = categoryMeta.icon
  const defaultModalCategory: CatalogCategory = activeCategory === 'all' ? 'prepack' : activeCategory

  const renderCategoryBadge = (item: PrepackItem) => {
    if (item.pack_type === 'uod') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          UOD (1 DOSE)
        </span>
      )
    }
    if (item.pack_type === 'internal') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <Beaker className="w-3 h-3 text-emerald-400" />
          INTERNAL (ORAL)
        </span>
      )
    }
    if (item.pack_type === 'external') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          EXTERNAL (RED LABEL)
        </span>
      )
    }
    if (item.pack_type === 'prepack_liquid') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
          PREPACK LIQUID
        </span>
      )
    }
    if (item.pack_type === 'prepack_cream') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          PREPACK CREAM
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
        {item.pack_type.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <PageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                {categoryMeta.title}
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                {categoryMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setItemToEdit(null)
                setItemModalOpen(true)
              }}
              className="min-h-[36px] px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>{categoryMeta.createLabel}</span>
            </button>

            <button
              onClick={() => loadItems()}
              disabled={loading || syncingCatalog}
              title="Reload catalog list"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading || syncingCatalog ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Authoritative MOH Galenical Management Bar for Internal / External Tabs */}
      {(activeCategory === 'internal' || activeCategory === 'external') && (
        <div className="bg-surface border border-border-default rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-text-primary shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              activeCategory === 'internal' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {activeCategory === 'internal' ? <Beaker className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-text-primary tracking-wide">
                  {activeCategory === 'internal' ? 'Internal Preparation Monographs (Oral & Syrup)' : 'External Preparation Monographs (Topical & Antiseptic)'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 uppercase">
                  MOH Pharmacopoeia Standard
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {activeCategory === 'internal'
                  ? 'MOH Pharmacy GAEX (PhIS Ref: A-GU-107/5, Updated 25 Feb 2026) & GPP. Compounded at Lawas Hospital.'
                  : 'MOH Pharmacy GAEX (PhIS Ref: A-GU-107/5, Updated 25 Feb 2026) & GPP. Formulated at Lawas Hospital.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle">
            <button
              onClick={() => handleBulkStatusChange(activeCategory, 'active')}
              disabled={loading}
              title="Activate all formulations in this tab for facility use"
              className="px-3 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Activate All</span>
            </button>

            <button
              onClick={() => handleBulkStatusChange(activeCategory, 'inactive')}
              disabled={loading}
              title="Deactivate all formulations in this tab"
              className="px-3 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary border border-border-default hover:border-border-strong rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Deactivate All</span>
            </button>

            <button
              onClick={handleSyncCatalog}
              disabled={syncingCatalog || loading}
              title="Resynchronize with MOH standards database"
              className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 active:scale-[0.98] text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCatalog ? 'animate-spin' : ''}`} />
              <span>Sync MOH Catalog</span>
            </button>
          </div>
        </div>
      )}

      {/* Segmented Category Tabs with Active Count Visibility */}
      <div className="bg-subtle/80 p-1 rounded-xl border border-border-subtle flex flex-wrap gap-1 items-center">
        {[
          { id: 'all', label: 'All Formulations', shortLabel: 'All', countDisplay: String(counts.all), icon: Boxes },
          { id: 'uod', label: 'Unit of Dose (UOD)', shortLabel: 'UOD', countDisplay: String(counts.uod), icon: Boxes },
          { id: 'prepack', label: 'Bulk Prepack', shortLabel: 'Bulk Prepack', countDisplay: String(counts.prepack), icon: Package },
          { 
            id: 'internal', 
            label: 'Internal Preparations', 
            shortLabel: 'Internal',
            countDisplay: `${counts.internalActive}/${counts.internal} Active`, 
            icon: Beaker 
          },
          { 
            id: 'external', 
            label: 'External Preparations', 
            shortLabel: 'External',
            countDisplay: `${counts.externalActive}/${counts.external} Active`, 
            icon: ShieldAlert 
          },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeCategory === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectCategory(tab.id as CatalogCategoryFilter)}
              className={`flex-1 min-w-[135px] sm:min-w-[155px] px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-surface text-teal-700 dark:text-teal-300 shadow-xs border border-border-default'
                  : 'text-text-muted hover:text-text-primary hover:bg-subtle border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-text-muted'}`} />
              <span className="truncate hidden sm:inline">{tab.label}</span>
              <span className="truncate sm:hidden">{tab.shortLabel}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                isActive
                  ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold'
                  : 'bg-subtle text-text-muted'
              }`}>
                {tab.countDisplay}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters, Search & Status Pills */}
      <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder={categoryMeta.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary placeholder:text-text-muted outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Status Filter Pills */}
          {activeCategory === 'all' ? (
            <div className="flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Active Formulations ({counts.all})</span>
            </div>
          ) : (
            <div className="flex items-center p-0.5 bg-subtle rounded-lg border border-border-subtle">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                All ({counts.scopeTotal})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'active'
                    ? 'bg-surface text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-text-muted hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Active ({counts.scopeActive})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'inactive'
                    ? 'bg-surface text-text-secondary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                <span>Inactive ({counts.scopeInactive})</span>
              </button>
            </div>
          )}

          {/* Dynamic Dosage Form / Sub-domain Select */}
          {activeCategory === 'all' ? (
            <select
              value={selectedPackType}
              onChange={e => setSelectedPackType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
            >
              <option value="all">All Domains ({counts.all})</option>
              <option value="uod">Unit of Dose ({counts.uod})</option>
              <option value="prepack">Bulk Prepack ({counts.prepack})</option>
              <option value="internal">Internal Preparations ({counts.internalActive})</option>
              <option value="external">External Preparations ({counts.externalActive})</option>
            </select>
          ) : activeCategory === 'prepack' ? (
            <select
              value={selectedPackType}
              onChange={e => setSelectedPackType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
            >
              <option value="all">All Prepack Categories</option>
              <option value="prepack_tablet">Prepack Tablet / Capsule</option>
              <option value="prepack_liquid">Syrup / Liquid</option>
              <option value="prepack_cream">Cream / Ointment</option>
              <option value="extemporaneous">Bulk Extemporaneous</option>
            </select>
          ) : activeCategory === 'internal' ? (
            <select
              value={selectedDosageForm}
              onChange={e => setSelectedDosageForm(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
            >
              <option value="all">All Oral Dosage Forms</option>
              <option value="syrup">Syrup</option>
              <option value="suspension">Suspension</option>
              <option value="solution">Solution</option>
              <option value="drops">Oral Drops</option>
              <option value="powder">Oral Powder</option>
            </select>
          ) : activeCategory === 'external' ? (
            <select
              value={selectedDosageForm}
              onChange={e => setSelectedDosageForm(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
            >
              <option value="all">All External Dosage Forms</option>
              <option value="cream">Cream</option>
              <option value="ointment">Ointment</option>
              <option value="solution">Lotion / Wash</option>
              <option value="drops">Ear / Eye Drops</option>
              <option value="other">Disinfectant / Antiseptic</option>
            </select>
          ) : (
            <select
              value={selectedDosageForm}
              onChange={e => setSelectedDosageForm(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
            >
              <option value="all">All UOD Dosage Forms</option>
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
            </select>
          )}

          {/* Low Stock Filter */}
          <button
            onClick={() => setShowOnlyRepackNeeded(!showOnlyRepackNeeded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer active:scale-[0.98] ${
              showOnlyRepackNeeded
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-surface hover:bg-subtle border-border-default hover:border-border-strong text-text-muted hover:text-text-primary'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Repack Needed ({counts.repackNeeded})</span>
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3.5 text-text-muted">
              <PageIcon className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              {categoryMeta.emptyTitle}
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedPackType !== 'all' || selectedDosageForm !== 'all' || statusFilter !== 'all' || showOnlyRepackNeeded
                ? 'No formulations match your search or filter criteria.'
                : categoryMeta.emptyDesc}
            </p>
            {statusFilter === 'active' && counts.scopeTotal > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 active:scale-[0.98] transition-colors cursor-pointer shadow-xs"
                >
                  View All ({counts.scopeTotal}) Monographs to Activate
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Zero Horizontal Scrolling) */}
            <div className="block md:hidden divide-y divide-border-subtle">
              {filteredItems.map(item => (
                <PrepackItemCard
                  key={item.id}
                  item={item}
                  isActive={item.status === 'active'}
                  isToggling={togglingItemId === item.id}
                  onToggleStatus={handleToggleItemStatus}
                  onItemClick={handleItemNameClick}
                  onStartBatch={handleCreateBatchForItem}
                  onEditItem={handleEditItem}
                  renderCategoryBadge={renderCategoryBadge}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider border-b border-border-default">
                <tr>
                  <th className="py-3 px-4">Code &amp; Formulation Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Form &amp; Container</th>
                  <th className="py-3 px-3 text-right">Current Balance</th>
                  <th className="py-3 px-3 text-right">Buffer Level</th>
                  <th className="py-3 px-3 text-center">Facility Status</th>
                  <th className="py-3 px-3 text-center">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {filteredItems.map(item => {
                  const balance = item.total_balance ?? 0
                  const buffer = item.min_buffer_level
                  const isLow = balance <= buffer
                  const isCritical = balance === 0
                  const isActive = item.status === 'active'
                  const isToggling = togglingItemId === item.id

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        !isActive 
                          ? 'bg-subtle/30 opacity-70 hover:opacity-100 hover:bg-subtle/60' 
                          : 'hover:bg-subtle/50'
                      }`}
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <button
                          type="button"
                          onClick={() => handleItemNameClick(item)}
                          className="text-left font-bold text-text-primary text-sm hover:text-teal-600 dark:hover:text-teal-400 focus:outline-none focus-visible:underline transition-colors group flex items-start gap-1.5 cursor-pointer"
                          title={
                            item.pack_type === 'internal' || item.pack_type === 'external'
                              ? 'Click to view MOH Monograph & Preparation Protocol'
                              : 'Click to edit this formulation'
                          }
                        >
                          <span className="group-hover:underline">
                            {item.item_name}
                          </span>
                          {item.pack_type === 'internal' || item.pack_type === 'external' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-accent-base/10 dark:bg-teal-950/60 border border-accent-base/20 dark:border-teal-800 px-1.5 py-0.2 rounded shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <BookOpen className="w-2.5 h-2.5" />
                              <span>SOP</span>
                            </span>
                          ) : (
                            <Edit2 className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          )}
                        </button>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20 font-semibold">
                            {item.item_code}
                          </span>
                          {item.generic_name && (
                            <span className="text-[11px] text-text-muted truncate max-w-[220px]">
                              Gen: {item.generic_name}
                            </span>
                          )}
                        </div>
                        {item.ingredients_formula && (
                          <div className="text-[10px] text-text-muted mt-1 line-clamp-1 italic" title={item.ingredients_formula}>
                            <span className="font-semibold text-text-secondary not-italic">Formula:</span> {item.ingredients_formula}
                          </div>
                        )}
                        {item.indications && (
                          <div className="text-[10px] text-text-muted mt-0.5 line-clamp-1" title={item.indications}>
                            <span className="font-medium text-text-muted">Indication:</span> {item.indications}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {renderCategoryBadge(item)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-text-primary capitalize">
                          {item.dosage_form} {item.strength ? `(${item.strength})` : ''}
                        </div>
                        {item.pack_type === 'uod' ? (
                          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium capitalize">
                            {(item.package_type || 'sachet').replace('_', ' ')} • {formatUnitQuantityDisplay(item.units_per_pack || 1)} dose (UOD)
                          </div>
                        ) : item.pack_type === 'prepack_liquid' || item.dosage_form === 'syrup' || item.dosage_form === 'suspension' ? (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium capitalize">
                            {(item.package_type || 'bottle').replace('_', ' ')} • {item.units_per_pack} ml/bottle
                          </div>
                        ) : item.pack_type === 'prepack_cream' || item.dosage_form === 'cream' || item.dosage_form === 'ointment' ? (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium capitalize">
                            {(item.package_type || 'container').replace('_', ' ')} • {item.units_per_pack} g/container
                          </div>
                        ) : (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium capitalize">
                            {(item.package_type || 'sachet').replace('_', ' ')} • Pack of {item.units_per_pack} ({item.units_per_pack} units/pack)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className={`font-mono text-base font-black ${
                          !isActive ? 'text-text-muted' : isCritical ? 'text-red-500' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {balance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {item.active_batches_count || 0} active batches
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-semibold text-text-secondary">
                          {buffer} units
                        </div>
                        <div className="text-[10px] text-text-muted">
                          Opt: {item.optimal_batch_size}
                        </div>
                      </td>

                      {/* Facility Activation Toggle */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            disabled={isToggling}
                            onClick={() => handleToggleItemStatus(item)}
                            title={isActive ? 'Click to deactivate for facility' : 'Click to activate for facility'}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                              isActive 
                                ? 'bg-teal-700 hover:bg-teal-600' 
                                : 'bg-subtle border border-border-default'
                            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-xs ring-0 transition duration-200 ease-in-out ${
                                isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold uppercase tracking-wider w-16 text-left ${
                            isActive 
                              ? 'text-teal-600 dark:text-teal-400' 
                              : 'text-text-muted'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {!isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-subtle text-text-muted border border-border-subtle">
                            Inactive
                          </span>
                        ) : isCritical ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                            Needs Repack
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* Modals */}
      <PrepackItemModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false)
          setItemToEdit(null)
        }}
        onSuccess={() => loadItems(true)}
        itemToEdit={itemToEdit}
        defaultCategory={defaultModalCategory}
      />

      <GalenicalPreparationMonographModal
        isOpen={galenicalModalOpen}
        onClose={() => {
          setGalenicalModalOpen(false)
          setSelectedGalenicalItem(null)
        }}
        item={selectedGalenicalItem}
        onEditItem={(item) => {
          setGalenicalModalOpen(false)
          handleEditItem(item)
        }}
        onStartBatch={(item) => {
          setGalenicalModalOpen(false)
          handleCreateBatchForItem(item)
        }}
      />

      <PrepackBatchCreateModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={() => loadItems(true)}
        items={categoryScopedItems}
        preselectedItemId={selectedItemIdForBatch}
      />

      <PrepackUsageModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        onSuccess={() => loadItems(true)}
        items={categoryScopedItems}
      />
    </div>
  )
}

export default PrepackItemListPage
