// @ts-nocheck
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2,
  Search,
  Eye,
  Volume2,
  Activity,
  Wind,
  ShieldAlert,
  Pill,
  ShieldCheck,
  Heart,
  Flame,
  Brain,
  Layers,
  Droplets,
  Package,
  FileSpreadsheet,
  RefreshCw,
  Warehouse,
  ChevronDown,
  ChevronRight,
  X,
  Stethoscope,
  ArrowRight,
  LayoutGrid,
  AlignJustify,
  Clock,
  Printer,
  FlaskConical,
  CircleDot,
  Crosshair,
  Sparkles,
  Shield,
  Syringe,
  PlusCircle,
  FileText,
  CheckCircle2,
  Dna,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { loadFacilityDrugInventory } from '@/services/pharmacy/facilityDrugInventoryService'
import type { FacilityDrugItem } from '@/services/pharmacy/facilityDrugInventoryService'
import { exportFacilityDrugInventoryToExcel } from '@/services/pharmacy/facilityInventoryExcelService'
import { getDrugPrescriberCategory } from '@/lib/drugCategorizer'
import { getAllFormulariDrugs } from '../services/formulariService'
import type { DrugEntry } from '../types/formulariTypes'
import { findBestFukkmMatch, synthesizeDrugEntryFromFacility } from '../services/fukkmMatcher'
import {
  LAWAS_FORMULARY_GROUPS,
  LawasFormularyGroupId,
  classifyLawasDrug,
  groupLawasDrugs,
} from '../services/lawasFormularyCategorizer'

// ─── Icon map ────────────────────────────────────────────────────────────────
const GROUP_ICONS: Record<string, React.ElementType> = {
  Eye,
  Volume2,
  Activity,
  Wind,
  ShieldAlert,
  Pill,
  ShieldCheck,
  Heart,
  Flame,
  Brain,
  Layers,
  Droplets,
  Package,
  FlaskConical,
  CircleDot,
  Crosshair,
  Sparkles,
  Shield,
  Syringe,
  PlusCircle,
  Dna,
}

// ─── Prescriber badge ─────────────────────────────────────────────────────────
function PrescriberChip({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    'A*':   'bg-purple-500/15 text-purple-300 border-purple-500/25',
    'A':    'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    'A/KK': 'bg-blue-500/15   text-blue-300   border-blue-500/25',
    'B':    'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    'C':    'bg-slate-500/15  text-slate-300  border-slate-500/25',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border tracking-wide whitespace-nowrap ${map[cat] ?? map['C']}`}>
      Kat {cat}
    </span>
  )
}

// ─── Stock status pill (Official Government "NIL" Standard) ───────────────────
function StockPill({ stock, min, compact = false }: { stock: number; min: number; compact?: boolean }) {
  if (stock <= 0)
    return (
      <span className={`inline-flex items-center gap-1.5 rounded text-[10.5px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 tracking-wider whitespace-nowrap ${compact ? 'px-2 py-0.5' : 'px-2.5 py-0.5'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
        NIL
      </span>
    )
  if (stock < min)
    return (
      <span className={`inline-flex items-center gap-1.5 rounded text-[10.5px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 tabular-nums whitespace-nowrap ${compact ? 'px-2 py-0.5' : 'px-2.5 py-0.5'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        {stock} <span className="text-[9px] opacity-75 font-normal">(Rendah)</span>
      </span>
    )
  return (
    <span className={`inline-flex items-center gap-1.5 rounded text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums whitespace-nowrap ${compact ? 'px-2 py-0.5' : 'px-2.5 py-0.5'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      {stock} unit
    </span>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-14 rounded bg-white/10" />
        <div className="h-3 w-10 rounded bg-white/10" />
      </div>
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-white/10" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded bg-white/10" />
        <div className="h-5 w-12 rounded bg-white/10" />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export const HospitalLawasFormulariPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { language } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToastStore()

  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  const [items, setItems] = useState<FacilityDrugItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date>(new Date())

  const [selectedGroup, setSelectedGroup] = useState<LawasFormularyGroupId>(
    (searchParams.get('group') as LawasFormularyGroupId) || 'all'
  )
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [prescriberFilter, setPrescriberFilter] = useState('ALL')
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL')
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped')
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const fukkmCatalog = useMemo(() => getAllFormulariDrugs(), [])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const data = await loadFacilityDrugInventory(hospitalId)
      setItems(data)
      setLastSynced(new Date())
      if (showToast) toastSuccess('Formulari Hospital Lawas berjaya dimuat semula.')
    } catch {
      toastError('Gagal memuatkan formulari hospital. Sila cuba semula.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [hospitalId, toastSuccess, toastError])

  useEffect(() => { fetchData() }, [fetchData])

  const handleGroupSelect = (grp: LawasFormularyGroupId) => {
    setSelectedGroup(grp)
    const next = new URLSearchParams(searchParams)
    grp === 'all' ? next.delete('group') : next.set('group', grp)
    setSearchParams(next, { replace: true })
  }

  // ── Filtered items ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return items.filter(item => {
      if (selectedGroup !== 'all' && classifyLawasDrug(item) !== selectedGroup) return false
      if (q) {
        const hay = [
          item.drug_name, item.generic_name, item.brand_name,
          item.drug_code, (item as any).item_code, item.dosage_form, item.location,
        ].map(s => (s || '').toLowerCase()).join(' ')
        if (!hay.includes(q)) return false
      }
      if (prescriberFilter !== 'ALL' && getDrugPrescriberCategory(item) !== prescriberFilter) return false
      if (stockFilter !== 'ALL') {
        const s = item.facility_stock ?? 0
        const b = item.min_buffer_level ?? 20
        if (stockFilter === 'OUT_OF_STOCK' && s > 0) return false
        if (stockFilter === 'LOW_STOCK' && (s <= 0 || s >= b)) return false
        if (stockFilter === 'IN_STOCK' && s < b) return false
      }
      return true
    })
  }, [items, selectedGroup, searchTerm, prescriberFilter, stockFilter])

  const groupedResults = useMemo(() => groupLawasDrugs(filteredItems), [filteredItems])

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach(i => { const g = classifyLawasDrug(i); c[g] = (c[g] || 0) + 1 })
    return c
  }, [items])

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter(i => (i.facility_stock ?? 0) >= (i.min_buffer_level ?? 20)).length,
    lowStock: items.filter(i => (i.facility_stock ?? 0) > 0 && (i.facility_stock ?? 0) < (i.min_buffer_level ?? 20)).length,
    zeroStock: items.filter(i => (i.facility_stock ?? 0) <= 0).length,
  }), [items])

  const toggleGroup = (id: string) =>
    setCollapsedGroups(p => ({ ...p, [id]: !p[id] }))

  const handleOpenDetail = (drug: FacilityDrugItem) => {
    // 1. Find matching official FUKKM monograph entry, or synthesize clinical monograph
    const matched = findBestFukkmMatch(drug, fukkmCatalog)
    const targetDrug = matched || synthesizeDrugEntryFromFacility(drug)

    // 2. Always navigate to the rich tabbed monograph page (like the second photo)
    navigate(`/formulari/drug/${targetDrug.id}`, {
      state: {
        fromLawasFormulary: true,
        facilityDrug: drug,
        fukkmMatch: targetDrug,
        backLabel: 'Formulari Hospital Lawas',
        backPath: '/formulari/hospital-lawas',
      },
    })
  }

  const handleExportExcel = () => {
    exportFacilityDrugInventoryToExcel(items, {
      hospitalName: 'Hospital Lawas',
      departmentName: 'Jabatan Farmasi',
      generatedBy: user?.name || 'Pegawai Farmasi',
      generatedByTitle: user?.role || 'Pegawai Farmasi',
      filename: `Formulari_Hospital_Lawas_${new Date().getFullYear()}.xlsx`,
    })
    toastSuccess('Fail Excel Formulari Hospital Lawas berjaya dimuat turun.')
  }

  const hasActiveFilters = !!(searchTerm || prescriberFilter !== 'ALL' || stockFilter !== 'ALL' || selectedGroup !== 'all')

  const resetFilters = () => {
    setSelectedGroup('all')
    setSearchTerm('')
    setPrescriberFilter('ALL')
    setStockFilter('ALL')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#0d0d0d] text-white flex flex-col">

      {/* ══ TOP HEADER ═══════════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.08] bg-[#111111]">

        {/* Title row */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-[18px] h-[18px] text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[15px] font-semibold text-white tracking-tight">
                  {language === 'ms' ? 'Formulari Hospital Lawas' : 'Hospital Lawas Formulary'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                  Khas
                </span>
              </div>
              <p className="text-[12px] text-white/35 mt-0.5">
                {language === 'ms'
                  ? 'Inventori ubat sah Hospital Lawas — diselaraskan dari MyInventory Fasiliti'
                  : 'Authenticated drug inventory — synced live from MyInventory Facility Stock'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-white/25 hidden lg:block tabular-nums">
              Segerak: {lastSynced.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
            </span>

            <button
              onClick={() => navigate('/pharmacy/inventory/facility-drugs')}
              className="h-8 px-3 rounded-md text-[12px] font-medium text-white/55 hover:text-white/90 border border-white/[0.09] hover:border-white/20 bg-transparent hover:bg-white/[0.05] transition-all duration-150 flex items-center gap-1.5"
            >
              <Warehouse className="w-3.5 h-3.5" />
              MyInventory
            </button>

            <button
              onClick={handleExportExcel}
              disabled={isLoading || items.length === 0}
              className="h-8 px-3 rounded-md text-[12px] font-medium text-white/55 hover:text-white/90 border border-white/[0.09] hover:border-white/20 bg-transparent hover:bg-white/[0.05] transition-all duration-150 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={() => window.print()}
              className="h-8 px-3 rounded-md text-[12px] font-medium text-white/55 hover:text-white/90 border border-white/[0.09] hover:border-white/20 bg-transparent hover:bg-white/[0.05] transition-all duration-150 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak
            </button>

            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="h-8 px-3.5 rounded-md text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-500/30 transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memuat...' : 'Muat Semula'}
            </button>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.07]">
          {[
            { label: language === 'ms' ? 'Jumlah Ubat' : 'Total Drugs', value: isLoading ? '—' : stats.total, sub: 'Hospital Lawas', accent: 'text-white' },
            { label: language === 'ms' ? 'Stok Mencukupi' : 'In Stock', value: isLoading ? '—' : stats.inStock, sub: `${isLoading ? '—' : Math.round((stats.inStock / Math.max(stats.total, 1)) * 100)}% daripada jumlah`, accent: 'text-emerald-400' },
            { label: language === 'ms' ? 'Stok Rendah' : 'Low Stock', value: isLoading ? '—' : stats.lowStock, sub: 'Di bawah paras buffer', accent: 'text-amber-400' },
            { label: language === 'ms' ? 'Stok NIL' : 'NIL Stock', value: isLoading ? '—' : stats.zeroStock, sub: language === 'ms' ? 'Tiada baki di fasiliti' : 'No balance in facility', accent: 'text-rose-400' },
          ].map(({ label, value, sub, accent }, i) => (
            <div key={i} className={`px-6 py-4 bg-[#111111] ${i < 3 ? 'border-r border-white/[0.06]' : ''}`}>
              <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
              <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left Sidebar: Group Nav ──────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#0f0f0f]">
          <div className="px-3 pt-5 pb-4 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
              {language === 'ms' ? 'Kumpulan Ubat' : 'Drug Groups'}
            </p>

            {/* All */}
            <button
              onClick={() => handleGroupSelect('all')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] mb-1 transition-colors duration-100 ${
                selectedGroup === 'all'
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                {language === 'ms' ? 'Semua Kategori' : 'All Categories'}
              </span>
              <span className="text-[10.5px] font-mono tabular-nums text-white/35">{items.length}</span>
            </button>

            {/* Per-group */}
            {Object.values(LAWAS_FORMULARY_GROUPS).map(meta => {
              const count = groupCounts[meta.id] || 0
              if (count === 0) return null
              const Icon = GROUP_ICONS[meta.iconName] || Package
              const isActive = selectedGroup === meta.id
              return (
                <button
                  key={meta.id}
                  onClick={() => handleGroupSelect(meta.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12px] mb-0.5 transition-colors duration-100 ${
                    isActive
                      ? 'bg-white/[0.09] text-white font-semibold border border-white/[0.12]'
                      : 'text-white/45 hover:text-white/75 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-white/40" />
                    <span className="truncate">{language === 'ms' ? meta.nameMs : meta.nameEn}</span>
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-white/25 flex-shrink-0">{count}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* Search & filters toolbar */}
          <div className="border-b border-white/[0.07] bg-[#111111] px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={language === 'ms' ? 'Cari ubat, generik, bentuk dos (sirap, pesari, supositori)...' : 'Search drug, generic, dosage form (syrup, pessary, suppository)...'}
                className="w-full pl-9 pr-8 py-2 bg-white/[0.04] border border-white/[0.08] rounded-md text-[12.5px] text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={prescriberFilter}
                onChange={e => setPrescriberFilter(e.target.value)}
                className="h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[12px] text-white/60 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Preskriber</option>
                <option value="A*">Kat A* — Pakar Khusus</option>
                <option value="A">Kat A — Pakar</option>
                <option value="A/KK">Kat A/KK — FMS</option>
                <option value="B">Kat B — Pegawai Perubatan</option>
                <option value="C">Kat C — Paramedik</option>
              </select>

              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as any)}
                className="h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[12px] text-white/60 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status Stok</option>
                <option value="IN_STOCK">Stok Mencukupi</option>
                <option value="LOW_STOCK">Stok Rendah (&lt; Buffer)</option>
                <option value="OUT_OF_STOCK">Stok NIL</option>
              </select>

              {/* View mode toggle */}
              <div className="flex items-center border border-white/[0.09] rounded-md bg-white/[0.03] p-0.5">
                <button
                  onClick={() => setViewMode('grouped')}
                  title="Paparan Daftar Berkumpulan (Piawaian Kerajaan)"
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all duration-100 ${viewMode === 'grouped' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/65'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Daftar Kumpulan</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Paparan Daftar Induk Lengkap"
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all duration-100 ${viewMode === 'table' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/65'}`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span>Daftar Induk</span>
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="h-8 px-2.5 rounded-md text-[12px] text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  Reset Penapis
                </button>
              )}
            </div>

            <span className="text-[11px] text-white/30 whitespace-nowrap tabular-nums">
              {filteredItems.length} {language === 'ms' ? 'ubat berdaftar' : 'registered drugs'}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* Loading */}
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 space-y-3 animate-pulse">
                    <div className="h-4 w-48 rounded bg-white/10" />
                    <div className="h-10 w-full rounded bg-white/[0.05]" />
                    <div className="h-10 w-full rounded bg-white/[0.05]" />
                    <div className="h-10 w-full rounded bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Package className="w-5 h-5 text-white/25" />
                </div>
                <h3 className="text-[15px] font-medium text-white/60 mb-1">
                  {language === 'ms' ? 'Tiada Rekod Dijumpai' : 'No Records Found'}
                </h3>
                <p className="text-[12px] text-white/30 max-w-xs mb-5">
                  {language === 'ms'
                    ? 'Tiada ubat padan dengan kriteria carian atau penapis status.'
                    : 'No drugs matched your search criteria or status filter.'}
                </p>
                <button
                  onClick={resetFilters}
                  className="h-8 px-4 rounded-md text-[12px] font-medium text-white/60 border border-white/15 hover:bg-white/[0.05] hover:text-white transition-all"
                >
                  Reset Penapis
                </button>
              </div>
            )}

            {/* ── Grouped Clinical Register View (Government List Standard) ─── */}
            {!isLoading && filteredItems.length > 0 && viewMode === 'grouped' && (
              <div className="space-y-6">
                {groupedResults.map(({ groupMeta, items: groupItems }) => {
                  const isCollapsed = collapsedGroups[groupMeta.id]
                  const Icon = GROUP_ICONS[groupMeta.iconName] || Package
                  return (
                    <section key={groupMeta.id} className="rounded-lg border border-white/[0.08] bg-[#121212] overflow-hidden shadow-sm">
                      {/* Group Header Banner */}
                      <button
                        onClick={() => toggleGroup(groupMeta.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.025] hover:bg-white/[0.045] border-b border-white/[0.06] transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.09] flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/30 transition-colors">
                            <Icon className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13.5px] font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                {language === 'ms' ? groupMeta.nameMs : groupMeta.nameEn}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-white/50 border border-white/[0.08]">
                                {groupItems.length} {language === 'ms' ? 'ubat' : 'drugs'}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/35 truncate mt-0.5">
                              {language === 'ms' ? groupMeta.descriptionMs : groupMeta.descriptionEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className="text-[11px] text-white/30 hidden sm:inline">
                            {isCollapsed ? (language === 'ms' ? 'Buka Senarai' : 'Expand') : (language === 'ms' ? 'Tutup' : 'Collapse')}
                          </span>
                          <span className="p-1 rounded text-white/25 group-hover:text-white/60 transition-colors">
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </button>

                      {/* List Table Content */}
                      {!isCollapsed && (
                        <div>
                          {/* Table Header (Desktop) */}
                          <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-white/[0.015] border-b border-white/[0.05] text-[10.5px] font-semibold text-white/35 uppercase tracking-wider">
                            <div className="col-span-1">Bil / Kod</div>
                            <div className="col-span-5">Nama Ubat & Spesifikasi (INN)</div>
                            <div className="col-span-2 text-center">Preskriber (FUKKM)</div>
                            <div className="col-span-2 text-center">Baki Fasiliti</div>
                            <div className="col-span-2 text-right">Lokasi / Tindakan</div>
                          </div>

                          {/* Rows */}
                          <div className="divide-y divide-white/[0.04]">
                            {groupItems.map((drug, idx) => {
                              const prescriber = getDrugPrescriberCategory(drug)
                              const stock = drug.facility_stock ?? 0
                              const min = drug.min_buffer_level ?? 20
                              const code = drug.drug_code || (drug as any).item_code || ''

                              return (
                                <div
                                  key={drug.id || drug.facility_inventory_id || idx}
                                  onClick={() => handleOpenDetail(drug)}
                                  className="px-4 py-3 hover:bg-white/[0.035] cursor-pointer transition-colors duration-100 group"
                                >
                                  {/* Desktop Grid Layout */}
                                  <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                                    {/* Col 1: Index & Code */}
                                    <div className="col-span-1 flex flex-col justify-center">
                                      <span className="text-[11px] font-mono text-white/25 tabular-nums">
                                        #{String(idx + 1).padStart(2, '0')}
                                      </span>
                                      {code && (
                                        <span className="text-[9.5px] font-mono text-white/35 truncate max-w-[85px]" title={code}>
                                          {code}
                                        </span>
                                      )}
                                    </div>

                                    {/* Col 2: Drug Name & Generic & Tags */}
                                    <div className="col-span-5 pr-2">
                                      <p className="text-[13px] font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                                        {drug.drug_name}
                                      </p>
                                      {drug.generic_name && drug.generic_name !== drug.drug_name && (
                                        <p className="text-[11px] text-white/40 italic mt-0.5 line-clamp-1">
                                          {drug.generic_name}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        {drug.dosage_form && (
                                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-medium text-white/45 bg-white/[0.04] border border-white/[0.07] capitalize">
                                            {drug.dosage_form}
                                          </span>
                                        )}
                                        {drug.strength && (
                                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-medium text-white/45 bg-white/[0.04] border border-white/[0.07]">
                                            {drug.strength}
                                          </span>
                                        )}
                                        {drug.procurement_vote && (
                                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 uppercase">
                                            {drug.procurement_vote}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Col 3: Prescriber */}
                                    <div className="col-span-2 flex justify-center">
                                      <PrescriberChip cat={prescriber} />
                                    </div>

                                    {/* Col 4: Stock Pill (with NIL standard) */}
                                    <div className="col-span-2 flex justify-center">
                                      <StockPill stock={stock} min={min} />
                                    </div>

                                    {/* Col 5: Location & Monograph trigger */}
                                    <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                                      <span className="text-[11px] text-white/35 flex items-center gap-1.5 truncate max-w-[130px]" title={drug.location || 'Stor Utama Farmasi'}>
                                        <Warehouse className="w-3 h-3 text-white/20 flex-shrink-0" />
                                        <span className="truncate">{drug.location || 'Stor Utama'}</span>
                                      </span>
                                      <div className="p-1 rounded text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mobile Stacked Layout */}
                                  <div className="lg:hidden flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-mono text-white/25 mr-1.5">#{idx + 1}</span>
                                        <span className="text-[13px] font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                          {drug.drug_name}
                                        </span>
                                        {drug.generic_name && drug.generic_name !== drug.drug_name && (
                                          <p className="text-[11px] text-white/40 italic mt-0.5">{drug.generic_name}</p>
                                        )}
                                      </div>
                                      <StockPill stock={stock} min={min} compact />
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <PrescriberChip cat={prescriber} />
                                        {drug.dosage_form && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 border border-white/[0.07] capitalize">
                                            {drug.dosage_form}
                                          </span>
                                        )}
                                        {drug.strength && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 border border-white/[0.07]">
                                            {drug.strength}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10.5px] text-white/30 flex items-center gap-1 truncate max-w-[130px]">
                                        <Warehouse className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{drug.location || 'Stor Utama'}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            )}

            {/* ── Master Tabular Register View ──────────────────────────────── */}
            {!isLoading && filteredItems.length > 0 && viewMode === 'table' && (
              <div className="rounded-lg border border-white/[0.08] bg-[#121212] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.025] border-b border-white/[0.07]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider">Nama Ubat & Spesifikasi</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider">Kategori Formulari</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider text-center">Preskriber</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider text-center">Baki Stok</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider">Lokasi Stor</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-wider text-right">Monograf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredItems.map((drug, idx) => {
                      const grpId = classifyLawasDrug(drug)
                      const meta = LAWAS_FORMULARY_GROUPS[grpId]
                      const prescriber = getDrugPrescriberCategory(drug)
                      const stock = drug.facility_stock ?? 0
                      const min = drug.min_buffer_level ?? 20
                      const code = drug.drug_code || (drug as any).item_code || ''

                      return (
                        <tr
                          key={drug.id || drug.facility_inventory_id || idx}
                          onClick={() => handleOpenDetail(drug)}
                          className="hover:bg-white/[0.035] cursor-pointer transition-colors duration-100 group"
                        >
                          <td className="px-4 py-3 text-[11px] font-mono text-white/25 tabular-nums">{idx + 1}</td>
                          <td className="px-4 py-3 max-w-[320px]">
                            <p className="text-[13px] font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{drug.drug_name}</p>
                            {drug.generic_name && drug.generic_name !== drug.drug_name && (
                              <p className="text-[11px] text-white/40 italic mt-0.5 line-clamp-1">{drug.generic_name}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {code && (
                                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-white/35 border border-white/[0.06]">{code}</span>
                              )}
                              {drug.dosage_form && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white/[0.04] text-white/40 border border-white/[0.06] capitalize">{drug.dosage_form}</span>
                              )}
                              {drug.strength && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white/[0.04] text-white/40 border border-white/[0.06]">{drug.strength}</span>
                              )}
                              {drug.procurement_vote && (
                                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 uppercase">{drug.procurement_vote}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] text-white/60 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                              {language === 'ms' ? meta?.nameMs : meta?.nameEn}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center"><PrescriberChip cat={prescriber} /></td>
                          <td className="px-4 py-3 text-center"><StockPill stock={stock} min={min} /></td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-white/35 flex items-center gap-1.5 truncate max-w-[180px]">
                              <Warehouse className="w-3 h-3 text-white/20 flex-shrink-0" />
                              <span className="truncate">{drug.location || 'Stor Utama Farmasi'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center text-[11px] font-medium text-emerald-400/80 group-hover:text-emerald-300 gap-1">
                              <span>Perincian</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default HospitalLawasFormulariPage
