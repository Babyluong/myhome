import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Search, Printer, Sparkles, AlertTriangle, Clock, CheckCircle2, Calendar, Building2, TrendingDown, ShieldAlert, ArrowRight, Plus, Info, Truck, Flame, Pill, Package, Trash2, Check, ShieldCheck } from 'lucide-react'
import { getAllFormulariDrugs, FormulariAssetError } from '../services/formulariService'
import type { DrugEntry } from '../types/formulariTypes'
import { PrescriberBadge, PoisonBadge } from '../components/DrugBadge'
import { StockDisruptionRecord, DisruptionSeverity } from '../types/stockDisruptionTypes'
import {
  getAllStockDisruptions,
  calculateDisruptionStats,
  deleteStockDisruption,
  updateStockDisruption
} from '../services/stockDisruptionService'
import { AddStockDisruptionModal } from '../components/AddStockDisruptionModal'
import { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'

export const DrugAlternativesPage: React.FC = () => {
  const navigate = useNavigate()

  // Tab State: 'lawas-disruptions' (Tab 1) | 'directory' (Tab 2)
  const [activeTab, setActiveTab] = useState<'lawas-disruptions' | 'directory'>('lawas-disruptions')

  // Search & Filters for Tab 1 (Hospital Lawas Disruption)
  const [lawasSearch, setLawasSearch] = useState('')
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'DRUG' | 'NON_DRUG'>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [deptFilter, setDeptFilter] = useState<string>('ALL')

  // Search for Tab 2 (Directory)
  const [directorySearch, setDirectorySearch] = useState('')
  const [allDrugs, setAllDrugs] = useState<DrugEntry[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [canRetryCatalog, setCanRetryCatalog] = useState(true)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)

  // Disruption Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadCatalog = useCallback(async () => {
    setIsCatalogLoading(true)
    setCatalogError(null)
    try {
      setAllDrugs(await getAllFormulariDrugs())
      setHasLoadedCatalog(true)
    } catch (error) {
      setCatalogError(error instanceof FormulariAssetError ? error.message : 'Formulary data is unavailable. Please try again.')
      setCanRetryCatalog(!(error instanceof FormulariAssetError) || error.retryable)
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'directory' && !hasLoadedCatalog && !catalogError) void loadCatalog()
  }, [activeTab, hasLoadedCatalog, catalogError, loadCatalog])

  // Data Loading
  const [disruptions, setDisruptions] = useState<StockDisruptionRecord[]>(() => getAllStockDisruptions())

  const refreshDisruptions = () => {
    setDisruptions(getAllStockDisruptions())
  }

  // Handle Delete Disruption
  const handleDeleteDisruption = (id: string, name: string) => {
    if (window.confirm(`Adakah anda pasti ingin memadamkan rekod gangguan untuk "${name}"?`)) {
      deleteStockDisruption(id)
      refreshDisruptions()
    }
  }

  // Handle Mark Resolved
  const handleResolveDisruption = (id: string, name: string) => {
    if (window.confirm(`Tandakan rekod gangguan bagi "${name}" sebagai telah pulih / selesai?`)) {
      updateStockDisruption(id, {
        isActiveDisruption: false,
        stabilizationStage: 'STAGE_4_RESTOCKED_STABLE'
      })
      refreshDisruptions()
    }
  }

  // Stats for Tab 1
  const disruptionStats = useMemo(() => {
    return calculateDisruptionStats(disruptions)
  }, [disruptions])

  // Filtered Tab 1 Disruptions
  const filteredDisruptions = useMemo(() => {
    return disruptions.filter(record => {
      if (itemTypeFilter !== 'ALL') {
        const rType = record.itemType || 'DRUG'
        if (rType !== itemTypeFilter) return false
      }

      if (lawasSearch) {
        const q = lawasSearch.toLowerCase()
        const matchMain = record.genericName.toLowerCase().includes(q) ||
          record.brandNames.some(b => b.toLowerCase().includes(q)) ||
          record.departmentAffected.toLowerCase().includes(q) ||
          record.disruptionReason.toLowerCase().includes(q) ||
          (record.itemSpecification || '').toLowerCase().includes(q) ||
          (record.nonDrugCategory || '').toLowerCase().includes(q)
        const matchAlt = record.alternatives.some(a =>
          a.genericName.toLowerCase().includes(q) ||
          (a.brandName || '').toLowerCase().includes(q) ||
          a.clinicalDosingProtocol.toLowerCase().includes(q)
        )
        if (!matchMain && !matchAlt) return false
      }

      if (severityFilter !== 'ALL' && record.severity !== severityFilter) {
        return false
      }

      if (deptFilter !== 'ALL' && !record.departmentAffected.toLowerCase().includes(deptFilter.toLowerCase())) {
        return false
      }

      return true
    })
  }, [disruptions, itemTypeFilter, lawasSearch, severityFilter, deptFilter])

  // Tab 2: Directory Drugs with Alternatives
  const drugsWithAlternatives = useMemo(() => {
    return allDrugs.filter(d => d.alternativeDrugs && d.alternativeDrugs.length > 0)
  }, [allDrugs])

  const filteredDirectoryDrugs = useMemo(() => {
    return drugsWithAlternatives.filter(drug => {
      if (directorySearch) {
        const q = directorySearch.toLowerCase()
        const matchMain = drug.genericName.toLowerCase().includes(q) ||
          drug.brandNames.some(b => b.toLowerCase().includes(q)) ||
          drug.therapeuticClass.toLowerCase().includes(q)
        const matchAlt = drug.alternativeDrugs.some(a =>
          a.drugName.toLowerCase().includes(q) || a.reasonForChoice.toLowerCase().includes(q)
        )
        if (!matchMain && !matchAlt) return false
      }
      return true
    })
  }, [drugsWithAlternatives, directorySearch])

  // Severity display badge helper
  const getSeverityBadge = (sev: DisruptionSeverity) => {
    switch (sev) {
      case 'CRITICAL_OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            PUTUS BEKALAN KRITIKAL (0 BAKI)
          </span>
        )
      case 'LOW_STOCK_BUFFER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            STOK PENAMPAN KRITIKAL (&lt;3-5 HARI)
          </span>
        )
      case 'TRANSIT_DELAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 border border-sky-200 text-sky-800 rounded-full text-xs font-bold">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            TERTANGGUH TRANSIT SEMPADAN
          </span>
        )
      case 'QUOTA_DEPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold">
            <TrendingDown className="w-3.5 h-3.5 text-purple-600" />
            KUOTA SUKU TAHUN HABIS
          </span>
        )
      case 'MANUFACTURER_BACKORDER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-orange-800 rounded-full text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-orange-600" />
            GANGGUAN PENGELUAR APPL
          </span>
        )
      default:
        return null
    }
  }

  // Stabilization Stage Helper
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'STAGE_1_BUFFER_ACTIVATED':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 font-semibold">
            Tahap 1: Buffer Darurat / Pinjaman Diaktifkan
          </span>
        )
      case 'STAGE_2_IN_TRANSIT':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 border border-blue-500/20 font-semibold">
            Tahap 2: Konsainan Dalam Perjalanan (In-Transit)
          </span>
        )
      case 'STAGE_3_RECEIVING_VERIFY':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 font-semibold">
            Tahap 3: Penerimaan &amp; Kuarantin Farmasi/Stor
          </span>
        )
      case 'STAGE_4_RESTOCKED_STABLE':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold">
            Tahap 4: Bekalan Pulih &amp; Stabil Sepenuhnya
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Standard Clinical Header */}
      <ModulePageHeader
        icon={Layers}
        title="Alternative Drugs & Therapeutic Substitutions"
        description="Hospital Lawas Supply Disruption Tracking, ETA Stabilization & MOH Approved Alternative Protocols (Drugs & Non-Drugs)"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'lawas-disruptions' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lapor Gangguan Stok Lawas</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Buletin Alternatif</span>
            </button>
          </div>
        }
      />

      {/* Tabs Switcher Navigation */}
      <div className="flex items-center border-b border-border-default gap-2 pb-2">
        <button
          onClick={() => setActiveTab('lawas-disruptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'lawas-disruptions'
              ? 'bg-slate-900 text-white dark:bg-subtle dark:text-text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-subtle'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Isu Bekalan &amp; Alternatif (Hospital Lawas)</span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-subtle text-text-secondary border border-border-default">
            {disruptions.filter(d => d.isActiveDisruption).length} Isu
          </span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-slate-900 text-white dark:bg-subtle dark:text-text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-subtle'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Direktori Ubat Alternatif KKM</span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-subtle text-text-secondary border border-border-default">
            {drugsWithAlternatives.length} Ubat
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOSPITAL LAWAS SUPPLY DISRUPTIONS & CLINICAL ALTERNATIVES          */}
      {/* ========================================================================= */}
      {activeTab === 'lawas-disruptions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-subtle text-text-secondary border border-border-default rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-text-primary">{disruptionStats.totalActiveDisruptions}</div>
                <div className="text-xs text-text-muted font-medium">
                  Isu Aktif di Lawas ({disruptionStats.drugDisruptionsCount} Ubat / {disruptionStats.nonDrugDisruptionsCount} Bukan Ubat)
                </div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-subtle text-text-secondary border border-border-default rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-rose-600">{disruptionStats.criticalOutOfStockCount}</div>
                <div className="text-xs text-text-muted font-medium">Putus Bekalan (0 Baki)</div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-subtle text-text-secondary border border-border-default rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-700">
                  {disruptionStats.totalActiveDisruptions > 0 ? `~${disruptionStats.averageDaysToStable} Hari` : '0 Hari'}
                </div>
                <div className="text-xs text-text-muted font-medium">Purata Masa Pulih (ETA)</div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-subtle text-text-secondary border border-border-default rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">
                  {disruptionStats.totalActiveDisruptions > 0 ? `${disruptionStats.alternativesCoveragePercent}%` : '100%'}
                </div>
                <div className="text-xs text-text-muted font-medium">Liputan Alternatif Sedia Ada</div>
              </div>
            </div>
          </div>

          {/* Lawas Supply Disruption Notice Banner */}
          <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Pusat Pemantauan Logistik &amp; Gangguan Bekalan Hospital Lawas</span>
                </span>
              </div>
              <span className="text-[10px] text-text-muted bg-subtle px-2.5 py-0.5 rounded-full border border-border-default self-start sm:self-auto font-medium">
                Hospital Lawas &bull; Ubat &amp; Bukan Ubat
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
                Daftar Gangguan Bekalan Semasa &amp; Protokol Penukaran Item Alternatif
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-4xl">
                Modul ini digunakan oleh Pegawai Farmasi dan Pengurusan Stor Hospital Lawas untuk memantau sebarang gangguan bekalan aktif (ubat farmaseutikal mahupun bahan pakai buang/bukan ubat), tarikh anggaran bekalan kembali stabil (ETA), serta mengesyorkan alternatif terapeutik atau fungsi setaraf yang sedia ada di fasiliti.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-surface rounded-3xl border border-border-default shadow-sm p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ubat/bukan ubat terjejas, item alternatif, wad, atau punca gangguan..."
                  value={lawasSearch}
                  onChange={e => setLawasSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-primary placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-surface"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={itemTypeFilter}
                  onChange={e => {
                    const selected = (['ALL', 'DRUG', 'NON_DRUG'] as const).find(value => value === e.currentTarget.value)
                    if (selected) setItemTypeFilter(selected)
                  }}
                  className="p-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-secondary font-semibold focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Jenis (Ubat &amp; Bukan Ubat)</option>
                  <option value="DRUG">Ubat Sahaja (Drugs)</option>
                  <option value="NON_DRUG">Bukan Ubat Sahaja (Non-Drugs)</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value)}
                  className="p-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-secondary font-semibold focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Tahap Gangguan</option>
                  <option value="CRITICAL_OUT_OF_STOCK">Putus Bekalan (0 Baki)</option>
                  <option value="LOW_STOCK_BUFFER">Stok Penampan Rendah</option>
                  <option value="TRANSIT_DELAY">Tertangguh Sempadan / Transit</option>
                  <option value="QUOTA_DEPLETED">Kuota / Kontrak Habis</option>
                  <option value="MANUFACTURER_BACKORDER">Gangguan Pengeluar APPL</option>
                </select>

                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="p-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-secondary font-semibold focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Wad / Unit</option>
                  <option value="ETD">Kecemasan &amp; Trauma (ETD)</option>
                  <option value="HDU">Wad Rawatan Rapi (HDU/ICU)</option>
                  <option value="Perubatan">Wad Perubatan</option>
                  <option value="Pembedahan">Wad Pembedahan &amp; OT</option>
                  <option value="Makmal">Makmal Patologi</option>
                  <option value="Pesakit Luar">Farmasi Pesakit Luar (OPD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Hospital Lawas Stock Disruptions */}
          <div className="space-y-6">
            {filteredDisruptions.map(record => (
              <div
                key={record.id}
                className="bg-surface rounded-3xl border border-border-default shadow-sm p-6 sm:p-8 space-y-6 hover:border-purple-300 transition-colors"
              >
                {/* Header: Disrupted Item Info & Severity */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-border-subtle pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Item Type Badge */}
                      {record.itemType === 'NON_DRUG' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-md border border-accent-base/20">
                          <Package className="w-3.5 h-3.5" /> BUKAN UBAT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-purple-100 text-indigo-400 rounded-md border border-indigo-500/20">
                          <Pill className="w-3.5 h-3.5" /> UBAT
                        </span>
                      )}

                      {record.prescriberCategory && <PrescriberBadge category={record.prescriberCategory} size="sm" />}
                      {record.poisonCategory && <PoisonBadge poison={record.poisonCategory} size="sm" />}
                      {record.isHAM && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-600 text-white rounded-md font-black flex items-center gap-1">
                          <Flame className="w-3 h-3" /> HAM CRITICAL
                        </span>
                      )}
                      {record.nonDrugCategory && (
                        <span className="text-[10px] px-2 py-0.5 bg-subtle text-text-secondary rounded-md font-bold">
                          {record.nonDrugCategory}
                        </span>
                      )}
                      <span className="text-xs text-text-muted font-medium">
                        Unit Terjejas: <strong className="text-text-secondary">{record.departmentAffected}</strong>
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
                      <span>{record.genericName}</span>
                      {record.strength && <span className="text-sm font-semibold text-purple-700">({record.strength})</span>}
                      {record.itemSpecification && <span className="text-sm font-semibold text-teal-700">[{record.itemSpecification}]</span>}
                    </h3>

                    <p className="text-xs text-text-muted">
                      {record.brandNames.length > 0 ? record.brandNames.join(' • ') : 'Tiada jenama khusus'}
                      {record.dosageForm && <> &bull; Bentuk Dos: <span className="font-semibold text-text-secondary">{record.dosageForm}</span></>}
                      {record.packagingUnit && <> &bull; Pembungkusan: <span className="font-semibold text-text-secondary">{record.packagingUnit}</span></>}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    {getSeverityBadge(record.severity)}
                    <div className="text-xs font-bold text-text-muted bg-subtle px-3 py-1 rounded-xl">
                      Baki Semasa di Lawas: <span className="text-rose-700 font-black">{record.currentBalanceText}</span>
                    </div>
                  </div>
                </div>

                {/* Reason & Resupply ETA Box */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-subtle/50 p-5 rounded-2xl border border-border-default text-xs">
                  {/* Column 1: Root Cause / Reason */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Sebab Gangguan Bekalan
                    </div>
                    <p className="text-text-secondary font-medium leading-relaxed">
                      {record.disruptionReason}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Dilapor pada: {record.reportedDate}
                    </div>
                  </div>

                  {/* Column 2: ETA Stabilization Date & Countdown */}
                  <div className="space-y-1.5 bg-surface p-4 rounded-xl border border-border-default shadow-elevation-1">
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-indigo-700">
                        <Calendar className="w-3.5 h-3.5" />
                        Jangkaan Pulih (ETA)
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-400 rounded-md font-black text-[10px]">
                        {record.estimatedDaysToStable} Hari Lagi
                      </span>
                    </div>

                    <div className="text-base font-black text-text-primary pt-0.5">
                      {new Date(record.targetEtaDate).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>

                    <div className="pt-1">
                      {getStageBadge(record.stabilizationStage)}
                    </div>
                  </div>

                  {/* Column 3: Resupply Source & Plan */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      Pelan &amp; Sumber Pembekalan Semula
                    </div>
                    <p className="text-text-secondary font-medium leading-relaxed">
                      {record.resupplySource}
                    </p>
                    <div className="text-[11px] text-emerald-700 font-bold pt-1">
                      Bekalan Dijangka: {record.expectedRestockedQuantity}
                    </div>
                  </div>
                </div>

                {/* Section: Clinical / Functional Alternative Items */}
                {record.alternatives && record.alternatives.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-400 dark:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        Item Alternatif Disyorkan Sedia Ada di Farmasi / Stor Lawas ({record.alternatives.length}):
                      </h4>
                      <span className="text-[11px] text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                        {record.itemType === 'NON_DRUG' ? 'Fungsi Setaraf Disahkan' : 'Terapeutik Setara Diluluskan KKM'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-5 bg-surface hover:bg-subtle/50 rounded-2xl border border-border-default shadow-xs space-y-3 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2.5">
                            <div>
                              <span className="text-[10px] uppercase font-black tracking-wider text-text-muted block">
                                {alt.therapeuticHierarchy}
                              </span>
                              <h5 className="text-sm font-bold text-text-primary">{alt.genericName}</h5>
                              {alt.brandName && (
                                <p className="text-[11px] text-text-muted font-medium">{alt.brandName}</p>
                              )}
                            </div>

                            {alt.prescriberCategory && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-black bg-subtle text-text-secondary border border-border-default shrink-0">
                                Cat {alt.prescriberCategory}
                              </span>
                            )}
                          </div>

                          {/* Local Availability Status */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {alt.lawasAvailabilityStatus}
                            </span>
                            {alt.currentLawasBalance && (
                              <span className="text-text-muted font-semibold text-[11px]">
                                {alt.currentLawasBalance}
                              </span>
                            )}
                          </div>

                          {/* Dosing Conversion / Usage Protocol */}
                          <div className="bg-surface p-3 rounded-xl border border-purple-100 text-xs space-y-1">
                            <strong className="text-indigo-400 dark:text-indigo-300 font-bold font-bold block text-[11px]">
                              {record.itemType === 'NON_DRUG' ? 'Arahan Penggunaan Klinikal & Spesifikasi:' : 'Protokol Penukaran & Dosing:'}
                            </strong>
                            <p className="text-text-secondary leading-relaxed text-[11px]">
                              {alt.clinicalDosingProtocol}
                            </p>
                          </div>

                          {/* Specialist Consult Note */}
                          {alt.specialistConsultNote && (
                            <div className="text-[11px] text-text-muted leading-relaxed">
                              <strong className="text-text-primary">Nota Klinikal / Pengendalian: </strong>
                              {alt.specialistConsultNote}
                            </div>
                          )}

                          {/* Monitoring Requirements */}
                          {alt.monitoringRequirements && alt.monitoringRequirements.length > 0 && (
                            <div className="text-[11px] text-text-muted pt-1 flex items-center gap-1 flex-wrap">
                              <span className="font-semibold text-text-secondary">Pemantauan:</span>
                              {alt.monitoringRequirements.map((req, rIdx) => (
                                <span key={rIdx} className="bg-subtle text-text-secondary border border-border-default px-2 py-0.5 rounded text-[10px] font-medium">
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: Clinical Action Plan & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border-subtle text-xs text-text-muted">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-text-secondary">Pelan Tindakan:</span>
                    <span>{record.clinicalActionPlan}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-400">{record.verifiedByPharmacist}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveDisruption(record.id, record.genericName)}
                      className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tandakan Selesai</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDisruption(record.id, record.genericName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Padam Rekod"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Zero State: No Active Supply Disruptions */}
            {filteredDisruptions.length === 0 && (
              <div className="p-12 text-center bg-surface rounded-3xl border border-border-default shadow-sm space-y-5">
                <div className="w-14 h-14 bg-subtle border border-border-default text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text-primary">
                    Tiada Gangguan Bekalan Aktif di Hospital Lawas
                  </h3>
                  <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed">
                    Semua stok ubat farmaseutikal dan item bukan ubat (consumables / reagen) di Hospital Lawas berada pada paras penampan optimum dan stabil (100% Ketersediaan).
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lapor Gangguan Baharu (Ubat / Bukan Ubat)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPREHENSIVE ALTERNATIVE DRUG DIRECTORY (CURRENT VIEW)            */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Guidance Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Clinical Pharmacy Therapeutic Substitution Protocols</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold leading-snug">
              Therapeutic Substitution Hierarchy:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <strong className="block text-purple-200 mb-1 font-bold">1. Exact Substitute</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Same generic molecule in different strengths or formulations (e.g. 500mg vial x 2 vs 1g).
                </p>
              </div>
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <strong className="block text-purple-200 mb-1 font-bold">2. Class Equivalent</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Medication within the same pharmacological class with equivalent spectrum &amp; efficacy profile.
                </p>
              </div>
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <strong className="block text-purple-200 mb-1 font-bold">3. Alternative Second-Line</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Second-line choices guided by clinical practice guidelines (CPG / NAG 2024).
                </p>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="bg-surface rounded-3xl border border-border-default shadow-sm p-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search primary drug or substitute (e.g. Dobutamine, Morphine, Meropenem)..."
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-primary placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-surface"
              />
            </div>
          </div>

          {/* Alternatives Directory List */}
          <div className="space-y-6">
            {isCatalogLoading ? (
              <p className="rounded-xl border border-border-default bg-surface p-5 text-sm text-text-secondary" role="status" aria-live="polite">
                Loading formulary data…
              </p>
            ) : catalogError ? (
              <div className="rounded-xl border border-border-default bg-surface p-5 text-text-primary" role="alert">
                <p className="text-sm">{catalogError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void loadCatalog()} className="rounded-lg bg-accent-base px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">
                    Try again
                  </button>
                  {!canRetryCatalog && (
                    <button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">
                      Reload app
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
            {filteredDirectoryDrugs.map(drug => (
              <div
                key={drug.id}
                className="bg-surface rounded-3xl border border-border-default p-6 sm:p-8 shadow-sm space-y-5"
              >
                {/* Primary Drug Info (Current stock text removed as requested) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-subtle pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <PrescriberBadge category={drug.prescriberCategory} size="sm" />
                      <PoisonBadge poison={drug.poisonCategory} size="sm" />
                      <span className="text-xs text-text-muted font-mono">ATC: {drug.atcCode}</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{drug.genericName}</h3>
                    <p className="text-xs text-text-muted">{drug.brandNames.join(' • ')} — Class: {drug.therapeuticClass}</p>
                  </div>
                </div>

                {/* Alternatives Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Therapeutic Substitution Options ({drug.alternativeDrugs.length}):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drug.alternativeDrugs.map((alt, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const target = allDrugs.find(d => d.id === alt.drugId)
                          if (target) navigate(`/formulari/drug/${target.id}`)
                        }}
                        className="p-4 bg-indigo-500/10 hover:bg-indigo-500/10 rounded-2xl border border-indigo-500/20 hover:border-purple-400 transition-colors cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-text-primary">{alt.drugName}</strong>
                          <span className="text-[10px] bg-purple-200 text-indigo-400 dark:text-indigo-300 font-bold px-2 py-0.5 rounded font-bold">
                            Cat {alt.prescriberCategory}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-purple-700 block">
                          {alt.therapeuticEquivalence}
                        </span>

                        <p className="text-xs text-text-muted leading-relaxed">
                          <strong>Clinical Rationale: </strong>{alt.reasonForChoice}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                          <span className="text-emerald-700 font-bold">Status: {alt.stockStatus}</span>
                          <span className="text-purple-700 font-semibold flex items-center gap-1">
                            Open Drug Monograph <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredDirectoryDrugs.length === 0 && (
              <div className="p-12 text-center bg-surface rounded-3xl border border-dashed border-border-default text-text-muted text-xs">
                No alternative drugs found matching the search criteria.
              </div>
            )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Stock Disruption Modal */}
      <AddStockDisruptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshDisruptions()
        }}
      />
    </div>
  )
}

export default DrugAlternativesPage
