// src/modules/myformulari/pages/AntidoteProtocolPage.tsx
import React, { useState, useMemo } from 'react'
import { ShieldAlert, Search, Filter, Flame, Clock, Building2, Printer, ChevronRight, ChevronDown, ChevronUp, Layers, HeartPulse, Activity, Syringe, Info, List, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, ExternalLink } from 'lucide-react'
import { KKM_ANTIDOTE_DATABASE, TOXIDROME_CATEGORIES } from '../data/antidoteDatabase'
import { AntidoteEntry, KKMStockTier } from '../types/antidoteTypes'
import { AntidoteStockBadge } from '../components/AntidoteStockBadge'
import { PRNHotlineCard } from '../components/PRNHotlineCard'
import { AntidoteDetailModal } from '../components/AntidoteDetailModal'
import { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'

type ViewMode = 'list' | 'grid'
type SortField = 'toxicAgent' | 'primaryAntidote' | 'stockTier' | 'toxicAgentCategory'
type SortDirection = 'asc' | 'desc'

export const AntidoteProtocolPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStockTier, setSelectedStockTier] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedAntidote, setSelectedAntidote] = useState<AntidoteEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<SortField>('stockTier')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Stats
  const stats = useMemo(() => {
    const listA = KKM_ANTIDOTE_DATABASE.filter(a => a.stockTier === 'List A').length
    const listB = KKM_ANTIDOTE_DATABASE.filter(a => a.stockTier === 'List B').length
    const listC = KKM_ANTIDOTE_DATABASE.filter(a => a.stockTier === 'List C').length
    return {
      total: KKM_ANTIDOTE_DATABASE.length,
      listA,
      listB,
      listC
    }
  }, [])

  // Filtered & Sorted dataset
  const filteredAntidotes = useMemo(() => {
    const result = KKM_ANTIDOTE_DATABASE.filter(item => {
      // Stock tier filter
      if (selectedStockTier !== 'ALL' && item.stockTier !== selectedStockTier) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'All' && item.toxicAgentCategory !== selectedCategory) {
        return false
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase()
        const matchToxic = item.toxicAgent.toLowerCase().includes(q)
        const matchAntidote = item.primaryAntidote.toLowerCase().includes(q)
        const matchBrands = item.brandNames.some(b => b.toLowerCase().includes(q))
        const matchExposures = item.commonExposureExamples.some(ex => ex.toLowerCase().includes(q))
        const matchMOA = item.mechanismOfReversal.toLowerCase().includes(q)
        const matchCategory = item.toxicAgentCategory.toLowerCase().includes(q)

        if (!matchToxic && !matchAntidote && !matchBrands && !matchExposures && !matchMOA && !matchCategory) {
          return false
        }
      }

      return true
    })

    // Sorting
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'stockTier') {
        const tierWeight: Record<KKMStockTier, number> = { 'List A': 1, 'List B': 2, 'List C': 3 }
        comparison = (tierWeight[a.stockTier] || 99) - (tierWeight[b.stockTier] || 99)
      } else if (sortField === 'toxicAgent') {
        comparison = a.toxicAgent.localeCompare(b.toxicAgent)
      } else if (sortField === 'primaryAntidote') {
        comparison = a.primaryAntidote.localeCompare(b.primaryAntidote)
      } else if (sortField === 'toxicAgentCategory') {
        comparison = a.toxicAgentCategory.localeCompare(b.toxicAgentCategory)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [searchTerm, selectedStockTier, selectedCategory, sortField, sortDirection])

  const handleOpenDetail = (antidote: AntidoteEntry) => {
    setSelectedAntidote(antidote)
    setIsModalOpen(true)
  }

  const toggleRowExpansion = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleCopyDose = (antidote: AntidoteEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    const textToCopy = `[MOH ANTIDOTE] ${antidote.toxicAgent}\nAntidote: ${antidote.primaryAntidote}\nStock Tier: ${antidote.stockTier} (${antidote.urgencyLevel})\nInitial Dose (Adult): ${antidote.dosingProtocol.adultInitial}\nRoute & Diluent: ${antidote.dosingProtocol.dilutionAndRoute}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(antidote.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 text-text-primary">
      {/* Standard Clinical Header */}
      <ModulePageHeader
        icon={ShieldAlert}
        title="MOH Antidote Directory & Clinical Protocols"
        description="Antidote Protocols Hub, Toxicological Dosing Guidelines & National Poison Centre (PRN USM) Reference"
        badges={[
          { label: 'PRN & FUKKM 2025', variant: 'neutral' },
          { label: 'MOH Standards', variant: 'accent' }
        ]}
        actions={
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-surface hover:bg-hover border border-border-default text-text-primary text-xs font-semibold rounded-lg shadow-elevation-1 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Antidote Directory</span>
          </button>
        }
      />

      {/* PRN USM Emergency Hotline Master Card */}
      <PRNHotlineCard />

      {/* Quick Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Antidotes */}
        <div
          onClick={() => setSelectedStockTier('ALL')}
          className={`p-4 bg-surface rounded-xl border shadow-elevation-1 cursor-pointer transition-colors ${
            selectedStockTier === 'ALL'
              ? 'border-border-strong ring-1 ring-border-strong bg-subtle/30'
              : 'border-border-default hover:border-border-strong hover:bg-subtle/20'
          }`}
        >
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Monographs</span>
            <Layers className="w-4 h-4 text-accent-base" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-text-primary tabular-nums">
            {stats.total}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">MOH Registered Drugs & Toxins</p>
        </div>

        {/* List A */}
        <div
          onClick={() => setSelectedStockTier('List A')}
          className={`p-4 bg-surface rounded-xl border shadow-elevation-1 cursor-pointer transition-colors ${
            selectedStockTier === 'List A'
              ? 'border-rose-500/60 bg-rose-500/10 ring-1 ring-rose-500/20'
              : 'border-border-default hover:border-rose-500/40 hover:bg-subtle/20'
          }`}
        >
          <div className="flex justify-between items-start text-rose-600 dark:text-rose-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">List A: Immediate</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400 tabular-nums">
            {stats.listA}
          </p>
          <p className="text-[10px] text-rose-500/80 mt-0.5">&le; 15-30 min (ED Resus / ICU)</p>
        </div>

        {/* List B */}
        <div
          onClick={() => setSelectedStockTier('List B')}
          className={`p-4 bg-surface rounded-xl border shadow-elevation-1 cursor-pointer transition-colors ${
            selectedStockTier === 'List B'
              ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/20'
              : 'border-border-default hover:border-amber-500/40 hover:bg-subtle/20'
          }`}
        >
          <div className="flex justify-between items-start text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">List B: Urgent</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.listB}
          </p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">&le; 2 hrs (24-Hour Central Pharmacy)</p>
        </div>

        {/* List C */}
        <div
          onClick={() => setSelectedStockTier('List C')}
          className={`p-4 bg-surface rounded-xl border shadow-elevation-1 cursor-pointer transition-colors ${
            selectedStockTier === 'List C'
              ? 'border-accent-base/60 bg-accent-base/10 ring-1 ring-accent-base/20'
              : 'border-border-default hover:border-accent-base/40 hover:bg-subtle/20'
          }`}
        >
          <div className="flex justify-between items-start text-accent-base">
            <span className="text-[11px] font-semibold uppercase tracking-wider">List C: State Depot</span>
            <Building2 className="w-4 h-4 text-accent-base" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-accent-base tabular-nums">
            {stats.listC}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">&le; 4-6 hrs (Tertiary Hospital)</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border-default shadow-elevation-1 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search toxic agent (e.g. warfarin, paracetamol, malathion) or antidote (e.g. vitamin K, NAC, atropine, intralipid, beriplex)..."
            className="w-full pl-12 pr-4 py-2.5 bg-subtle border border-border-default rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent-base focus:bg-surface focus:ring-2 focus:ring-accent-base/15 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 bg-subtle hover:bg-hover rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tier Tabs, Categories & View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          {/* Tier Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-text-muted text-[11px] uppercase tracking-wider mr-1">Stock Tier:</span>
            {[
              { key: 'ALL', label: 'All Tiers' },
              { key: 'List A', label: 'List A (ED Resus)' },
              { key: 'List B', label: 'List B (24H Pharmacy)' },
              { key: 'List C', label: 'List C (State Depot)' }
            ].map(tab => {
              const isSelected = selectedStockTier === tab.key
              let activeClass = 'bg-surface text-accent-base border border-border-default shadow-elevation-1 font-semibold'
              if (tab.key === 'List A') activeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold'
              if (tab.key === 'List B') activeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold'
              if (tab.key === 'List C') activeClass = 'bg-accent-base/10 text-accent-base border border-accent-base/30 font-semibold'

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStockTier(tab.key)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? activeClass
                      : 'bg-subtle text-text-secondary border-border-default hover:bg-hover hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-subtle border border-border-default rounded-xl text-xs font-semibold text-text-secondary focus:outline-hidden focus:border-accent-base focus:bg-surface cursor-pointer"
              >
                {TOXIDROME_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat === 'All' ? 'All Toxidrome Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-subtle p-1 rounded-xl border border-border-default shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-surface text-accent-base shadow-elevation-1 border border-border-default font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Official Government MOH Standard Tabular View"
              >
                <List className="w-3.5 h-3.5" />
                <span>MOH List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-surface text-accent-base shadow-elevation-1 border border-border-default font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Protocol Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-text-muted font-medium">
            Showing <strong className="text-text-primary font-bold">{filteredAntidotes.length}</strong> official MOH antidote protocols
          </p>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs text-text-muted font-medium">
            Sorted by: <strong className="text-text-secondary font-semibold">{sortField === 'stockTier' ? 'MOH Stock Tier' : sortField === 'toxicAgent' ? 'Toxic Agent Name' : sortField === 'primaryAntidote' ? 'Antidote Name' : 'Toxidrome Category'}</strong> ({sortDirection === 'asc' ? 'Ascending / A-Z' : 'Descending / Z-A'})
          </span>
        </div>

        {(searchTerm || selectedStockTier !== 'ALL' || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStockTier('ALL')
              setSelectedCategory('All')
            }}
            className="text-xs text-accent-base font-semibold hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* VIEW MODE 1: Official Government Standard Tabular List (Default) */}
      {viewMode === 'list' && (
        <div className="bg-surface rounded-2xl border border-border-default shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-subtle border-b border-border-default text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th
                    onClick={() => handleSort('toxicAgent')}
                    className="py-4 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Toxin / Agent & Exposure</span>
                      {sortField === 'toxicAgent' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-accent-base" /> : <ArrowDown className="w-3.5 h-3.5 text-accent-base" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('toxicAgentCategory')}
                    className="py-4 px-4 cursor-pointer hover:text-text-primary transition-colors hidden md:table-cell"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Toxidrome Category</span>
                      {sortField === 'toxicAgentCategory' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-accent-base" /> : <ArrowDown className="w-3.5 h-3.5 text-accent-base" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('primaryAntidote')}
                    className="py-4 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>MOH Standard Antidote & Brands</span>
                      {sortField === 'primaryAntidote' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-accent-base" /> : <ArrowDown className="w-3.5 h-3.5 text-accent-base" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('stockTier')}
                    className="py-4 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Stock Tier & Timeline</span>
                      {sortField === 'stockTier' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-accent-base" /> : <ArrowDown className="w-3.5 h-3.5 text-accent-base" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden lg:table-cell">Initial Dose Regimen (Adult)</th>
                  <th className="py-4 px-4 hidden xl:table-cell">Hospital Stock Location</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-border-subtle text-xs">
                {filteredAntidotes.map((item, index) => {
                  const isExpanded = !!expandedRows[item.id]
                  const isListA = item.stockTier === 'List A'
                  const isListB = item.stockTier === 'List B'

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => handleOpenDetail(item)}
                        className={`group hover:bg-hover/50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-subtle/40' : ''
                        }`}
                      >
                        {/* Index & Indicator */}
                        <td className="py-4 px-4 text-center font-mono text-[11px] text-text-muted relative">
                          <span
                            className={`absolute left-0 top-0 bottom-0 w-1 ${
                              isListA ? 'bg-rose-500' : isListB ? 'bg-amber-500' : 'bg-accent-base'
                            }`}
                          />
                          {index + 1}
                        </td>

                        {/* Toxic Agent & Exposure */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-text-primary  group-hover:text-accent-base transition-colors">
                                {item.toxicAgent}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-subtle text-text-secondary rounded border border-border-default">
                                Cat {item.fukkmPrescriberCategory}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted line-clamp-1">
                              Examples: {item.commonExposureExamples.join(', ')}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className="text-[11px] font-medium text-text-secondary bg-subtle px-2.5 py-1 rounded-lg border border-border-subtle">
                            {item.toxicAgentCategory}
                          </span>
                        </td>

                        {/* Antidote & Brands */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-accent-base">
                              <Syringe className="w-3.5 h-3.5 text-accent-base flex-shrink-0" />
                              <span>{item.primaryAntidote}</span>
                            </div>
                            {item.brandNames && item.brandNames.length > 0 && (
                              <p className="text-[11px] text-text-muted pl-5">
                                Brands: {item.brandNames.join(', ')}
                              </p>
                            )}
                            {item.secondaryOrAdjunctAntidotes && item.secondaryOrAdjunctAntidotes.length > 0 && (
                              <p className="text-[10px] text-text-muted italic pl-5 line-clamp-1">
                                Adjunct: {item.secondaryOrAdjunctAntidotes.join(', ')}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stock Tier & Urgency */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <AntidoteStockBadge tier={item.stockTier} size="sm" />
                            <div className="text-[10px] text-text-muted font-medium pl-1">
                              {item.urgencyLevel}
                            </div>
                          </div>
                        </td>

                        {/* Quick Dosing */}
                        <td className="py-4 px-4 hidden lg:table-cell max-w-xs">
                          <div className="bg-subtle/50 p-2.5 rounded-xl border border-border-default text-[11px] text-text-secondary space-y-1">
                            <p className="line-clamp-2 leading-relaxed">
                              {item.dosingProtocol.adultInitial}
                            </p>
                            <div className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                              <Activity className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span className="line-clamp-1">Route: {item.dosingProtocol.dilutionAndRoute}</span>
                            </div>
                          </div>
                        </td>

                        {/* Stock Location */}
                        <td className="py-4 px-4 hidden xl:table-cell">
                          <div className="text-[11px] text-text-muted space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-text-muted flex-shrink-0" />
                              <span>{item.stockLocations[0]}</span>
                            </div>
                            {item.stockLocations.length > 1 && (
                              <span className="text-[10px] text-text-muted pl-4 block">
                                +{item.stockLocations.length - 1} other locations
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            {/* Copy Dose Shortcut */}
                            <button
                              type="button"
                              onClick={e => handleCopyDose(item, e)}
                              className="p-1.5 rounded-lg bg-surface hover:bg-hover text-text-muted hover:text-text-primary border border-border-default transition-colors cursor-pointer"
                              title="Copy Dose Summary"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Inline Expand Accordion */}
                            <button
                              type="button"
                              onClick={e => toggleRowExpansion(item.id, e)}
                              className="p-1.5 rounded-lg bg-surface hover:bg-hover text-text-muted hover:text-text-primary border border-border-default transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse Summary' : 'Expand Detailed Summary'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Full Protocol Modal Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              className="px-2.5 py-1.5 bg-surface hover:bg-hover text-text-primary border border-border-default rounded-lg text-[11px] font-semibold shadow-elevation-1 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Protocol</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Quick Decision Support Drawer */}
                      {isExpanded && (
                        <tr className="bg-subtle/30 border-b border-border-default">
                          <td colSpan={8} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              {/* Dosing & Administration Details */}
                              <div className="bg-surface p-4 rounded-xl border border-border-default space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-accent-base text-xs uppercase tracking-wider">
                                  <Syringe className="w-3.5 h-3.5" />
                                  <span>Infusion Guide & Full Regimen</span>
                                </div>
                                <div className="space-y-1.5 text-text-secondary">
                                  <div>
                                    <strong className="text-text-primary font-semibold">Initial Dose (Adult):</strong>
                                    <p className="text-[11px] text-text-muted mt-0.5">{item.dosingProtocol.adultInitial}</p>
                                  </div>
                                  {item.dosingProtocol.adultMaintenance && (
                                    <div>
                                      <strong className="text-text-primary font-semibold">Maintenance Dose:</strong>
                                      <p className="text-[11px] text-text-muted mt-0.5">{item.dosingProtocol.adultMaintenance}</p>
                                    </div>
                                  )}
                                  {item.dosingProtocol.pediatricInitial && (
                                    <div>
                                      <strong className="text-accent-base font-semibold">Paediatric Dose:</strong>
                                      <p className="text-[11px] text-text-muted mt-0.5">{item.dosingProtocol.pediatricInitial}</p>
                                    </div>
                                  )}
                                  {item.dosingProtocol.administrationRate && (
                                    <div>
                                      <strong className="text-amber-600 dark:text-amber-400 font-semibold">Infusion Rate:</strong>
                                      <p className="text-[11px] text-text-muted mt-0.5">{item.dosingProtocol.administrationRate}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Monitoring & Endpoints */}
                              <div className="bg-surface p-4 rounded-xl border border-border-default space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">
                                  <HeartPulse className="w-3.5 h-3.5" />
                                  <span>Monitoring & Clinical Targets</span>
                                </div>
                                <div className="space-y-1.5 text-text-secondary text-[11px]">
                                  <div>
                                    <strong className="text-text-primary font-semibold">Target Endpoints:</strong>
                                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                      {item.monitoringAndEndpoints.targetEndpoints.map((ep, idx) => (
                                        <li key={idx}>{ep}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-text-primary font-semibold">Key Parameters:</strong>
                                    <p className="mt-0.5">{item.monitoringAndEndpoints.parameters.join(', ')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Mechanism & Storage Conditions */}
                              <div className="bg-surface p-4 rounded-xl border border-border-default space-y-2 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Mechanism & Storage Conditions</span>
                                  </div>
                                  <p className="text-[11px] text-text-muted dark:text-text-secondary mt-1 line-clamp-3">
                                    {item.mechanismOfReversal}
                                  </p>
                                  <p className="text-[11px] text-text-muted dark:text-text-muted mt-2">
                                    <strong>Storage Temp:</strong> {item.storageCondition}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                                  <span className="text-[10px] text-text-muted">
                                    {item.mohReferenceGuide || 'MOH FUKKM Reference'}
                                  </span>
                                  <button
                                    onClick={() => handleOpenDetail(item)}
                                    className="text-xs text-accent-base font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Open Full Monograph</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Antidote Protocol Cards Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAntidotes.map(item => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="bg-surface rounded-2xl border border-border-default p-6 shadow-elevation-1 hover:border-border-strong hover:-translate-y-0.5 transition-[transform,opacity,border-color,box-shadow] duration-150 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  item.stockTier === 'List A'
                    ? 'bg-rose-500'
                    : item.stockTier === 'List B'
                    ? 'bg-amber-500'
                    : 'bg-accent-base'
                }`}
              />

              <div className="space-y-4">
                {/* Header: Badges & Poison Category */}
                <div className="flex items-start justify-between gap-3">
                  <AntidoteStockBadge tier={item.stockTier} size="sm" />
                  <span className="text-[11px] font-medium text-text-secondary bg-subtle px-2 py-0.5 rounded-md border border-border-subtle">
                    {item.toxicAgentCategory}
                  </span>
                </div>

                {/* Toxic Agent & Main Exposure Title */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary  group-hover:text-accent-base transition-colors">
                    {item.toxicAgent}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 font-normal line-clamp-1">
                    Examples: {item.commonExposureExamples.join(', ')}
                  </p>
                </div>

                {/* Antidote Primary Highlight Box */}
                <div className="p-3.5 bg-subtle border border-border-default rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-base">
                    <Syringe className="w-3.5 h-3.5" />
                    <span>MOH Standard Antidote:</span>
                  </div>
                  <div className="text-sm font-bold text-text-primary">
                    {item.primaryAntidote}
                  </div>
                  {item.brandNames.length > 0 && (
                    <div className="text-[11px] text-text-muted font-medium">
                      Brands: {item.brandNames.join(', ')}
                    </div>
                  )}
                </div>

                {/* Quick Dosing Snippet */}
                <div className="space-y-1 text-xs text-text-muted bg-subtle/50 p-3 rounded-xl border border-border-subtle">
                  <div className="font-semibold text-text-primary">
                    Initial Dose Regimen (Adult):
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {item.dosingProtocol.adultInitial}
                  </p>
                </div>

                {/* Clinical Trigger Snippet */}
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">
                    <strong>Target:</strong> {item.monitoringAndEndpoints.targetEndpoints[0]}
                  </span>
                </div>
              </div>

              {/* Footer Card Action Button */}
              <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-muted transition-colors">
                  Cat {item.fukkmPrescriberCategory} • {item.stockLocations[0]}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-accent-base group-hover:translate-x-0.5 transition-transform">
                  <span>View Complete Protocol</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAntidotes.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border-default p-12 text-center space-y-4 shadow-elevation-1">
          <div className="p-4 bg-subtle rounded-full w-16 h-16 mx-auto flex items-center justify-center text-text-muted">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            No Antidote Protocols Found
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            No records match the search query &quot;{searchTerm}&quot; or the selected filters. Please verify drug spelling or contact the National Poison Centre directly at 1-800-88-8099.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStockTier('ALL')
              setSelectedCategory('All')
            }}
            className="px-4 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground text-xs font-semibold rounded-xl shadow-elevation-1 transition-colors cursor-pointer"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* Clinical Guidance Footnote Banner */}
      <div className="bg-surface border border-border-default text-text-primary rounded-2xl p-6 shadow-elevation-1 space-y-3">
        <div className="flex items-center gap-2 text-accent-base text-xs font-semibold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>MOH Hospital Antidote Utilization Guidelines</span>
        </div>
        <h4 className="text-base font-bold text-text-primary">
          Core Principles of Acute Poisoning Management:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-text-secondary pt-1">
          <div className="p-3.5 bg-subtle rounded-xl border border-border-default">
            <strong className="block text-text-primary font-semibold mb-1">1. Basic Resuscitation (ABCDE)</strong>
            <p className="text-[11px]">Ensure airway stability, oxygenation, and hemodynamics prior to administering specific antidotes.</p>
          </div>
          <div className="p-3.5 bg-subtle rounded-xl border border-border-default">
            <strong className="block text-rose-600 dark:text-rose-400 font-semibold mb-1">2. Stock Tier Adherence (List A/B/C)</strong>
            <p className="text-[11px]">List A antidotes must be administered immediately in the red zone; List B from 24-hr pharmacy; List C mobilized from the state depot.</p>
          </div>
          <div className="p-3.5 bg-subtle rounded-xl border border-border-default">
            <strong className="block text-emerald-600 dark:text-emerald-400 font-semibold mb-1">3. National Poison Centre Notification</strong>
            <p className="text-[11px]">Report every poisoning incident to PRN USM (1-800-88-8099) for national toxicovigilance documentation.</p>
          </div>
        </div>
      </div>

      {/* Antidote Detail Modal */}
      <AntidoteDetailModal
        antidote={selectedAntidote}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAntidote(null)
        }}
      />
    </div>
  )
}

export default AntidoteProtocolPage

