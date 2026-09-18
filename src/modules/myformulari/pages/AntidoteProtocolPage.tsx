// src/modules/myformulari/pages/AntidoteProtocolPage.tsx
import React, { useState, useMemo } from 'react'
import {
  ShieldAlert,
  Search,
  Filter,
  Flame,
  Clock,
  Building2,
  PhoneCall,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  HeartPulse,
  Activity,
  AlertTriangle,
  FileText,
  Syringe,
  CheckCircle2,
  Info,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ExternalLink,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react'
import { KKM_ANTIDOTE_DATABASE, TOXIDROME_CATEGORIES } from '../data/antidoteDatabase'
import { AntidoteEntry, KKMStockTier, ToxidromeCategory } from '../types/antidoteTypes'
import { AntidoteStockBadge } from '../components/AntidoteStockBadge'
import { PRNHotlineCard } from '../components/PRNHotlineCard'
import { AntidoteDetailModal } from '../components/AntidoteDetailModal'

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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-indigo-600 to-teal-500" />
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-rose-500 to-indigo-700 text-white rounded-2xl shadow-lg flex-shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                MOH Antidote Directory & Clinical Protocols
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full">
                PRN & FUKKM 2025
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MOH Standards
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Antidote Protocols Hub, Toxicological Dosing Guidelines & National Poison Centre (PRN USM) Reference
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Antidote Directory</span>
        </button>
      </div>

      {/* PRN USM Emergency Hotline Master Card */}
      <PRNHotlineCard />

      {/* Quick Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Antidotes */}
        <div
          onClick={() => setSelectedStockTier('ALL')}
          className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-xs cursor-pointer transition-all ${
            selectedStockTier === 'ALL'
              ? 'border-slate-900 dark:border-slate-100 ring-2 ring-slate-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="flex justify-between items-start text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Monographs</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black font-mono mt-2 text-slate-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">MOH Registered Drugs & Toxins</p>
        </div>

        {/* List A */}
        <div
          onClick={() => setSelectedStockTier('List A')}
          className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-xs cursor-pointer transition-all ${
            selectedStockTier === 'List A'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-start text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">List A: Immediate</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black font-mono mt-2 text-rose-600 dark:text-rose-400">
            {stats.listA}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">&le; 15-30 min (ED Resus / ICU)</p>
        </div>

        {/* List B */}
        <div
          onClick={() => setSelectedStockTier('List B')}
          className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-xs cursor-pointer transition-all ${
            selectedStockTier === 'List B'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-start text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">List B: Urgent</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black font-mono mt-2 text-amber-600 dark:text-amber-400">
            {stats.listB}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">&le; 2 hrs (24-Hour Central Pharmacy)</p>
        </div>

        {/* List C */}
        <div
          onClick={() => setSelectedStockTier('List C')}
          className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-xs cursor-pointer transition-all ${
            selectedStockTier === 'List C'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="flex justify-between items-start text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">List C: State Depot</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black font-mono mt-2 text-indigo-600 dark:text-indigo-400">
            {stats.listC}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">&le; 4-6 hrs (Tertiary Hospital)</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search toxic agent (e.g. warfarin, paracetamol, malathion) or antidote (e.g. vitamin K, NAC, atropine, intralipid, beriplex)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tier Tabs, Categories & View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Tier Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">Stock Tier:</span>
            {[
              { key: 'ALL', label: 'All Tiers' },
              { key: 'List A', label: 'List A (ED Resus)' },
              { key: 'List B', label: 'List B (24H Pharmacy)' },
              { key: 'List C', label: 'List C (State Depot)' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedStockTier(tab.key)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedStockTier === tab.key
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {TOXIDROME_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat === 'All' ? 'All Toxidrome Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Official Government MOH Standard Tabular View"
              >
                <List className="w-3.5 h-3.5" />
                <span>MOH List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredAntidotes.length}</strong> official MOH antidote protocols
          </p>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400 font-medium">
            Sorted by: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{sortField === 'stockTier' ? 'MOH Stock Tier' : sortField === 'toxicAgent' ? 'Toxic Agent Name' : sortField === 'primaryAntidote' ? 'Antidote Name' : 'Toxidrome Category'}</strong> ({sortDirection === 'asc' ? 'Ascending / A-Z' : 'Descending / Z-A'})
          </span>
        </div>

        {(searchTerm || selectedStockTier !== 'ALL' || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStockTier('ALL')
              setSelectedCategory('All')
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* VIEW MODE 1: Official Government Standard Tabular List (Default) */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th
                    onClick={() => handleSort('toxicAgent')}
                    className="py-4 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Toxin / Agent & Exposure</span>
                      {sortField === 'toxicAgent' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('toxicAgentCategory')}
                    className="py-4 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden md:table-cell"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Toxidrome Category</span>
                      {sortField === 'toxicAgentCategory' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('primaryAntidote')}
                    className="py-4 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>MOH Standard Antidote & Brands</span>
                      {sortField === 'primaryAntidote' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('stockTier')}
                    className="py-4 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Stock Tier & Timeline</span>
                      {sortField === 'stockTier' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredAntidotes.map((item, index) => {
                  const isExpanded = !!expandedRows[item.id]
                  const isListA = item.stockTier === 'List A'
                  const isListB = item.stockTier === 'List B'

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => handleOpenDetail(item)}
                        className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        {/* Index & Indicator */}
                        <td className="py-4 px-4 text-center font-mono text-[11px] text-slate-400 relative">
                          <span
                            className={`absolute left-0 top-0 bottom-0 w-1 ${
                              isListA ? 'bg-rose-500' : isListB ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                          />
                          {index + 1}
                        </td>

                        {/* Toxic Agent & Exposure */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.toxicAgent}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800">
                                Cat {item.fukkmPrescriberCategory}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              Examples: {item.commonExposureExamples.join(', ')}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {item.toxicAgentCategory}
                          </span>
                        </td>

                        {/* Antidote & Brands */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                              <Syringe className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                              <span>{item.primaryAntidote}</span>
                            </div>
                            {item.brandNames && item.brandNames.length > 0 && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-5">
                                Brands: {item.brandNames.join(', ')}
                              </p>
                            )}
                            {item.secondaryOrAdjunctAntidotes && item.secondaryOrAdjunctAntidotes.length > 0 && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pl-5 line-clamp-1">
                                Adjunct: {item.secondaryOrAdjunctAntidotes.join(', ')}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stock Tier & Urgency */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <AntidoteStockBadge tier={item.stockTier} size="sm" />
                            <div className="text-[10px] text-slate-400 font-medium pl-1">
                              {item.urgencyLevel}
                            </div>
                          </div>
                        </td>

                        {/* Quick Dosing */}
                        <td className="py-4 px-4 hidden lg:table-cell max-w-xs">
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                            <p className="line-clamp-2 leading-relaxed">
                              {item.dosingProtocol.adultInitial}
                            </p>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                              <Activity className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span className="line-clamp-1">Route: {item.dosingProtocol.dilutionAndRoute}</span>
                            </div>
                          </div>
                        </td>

                        {/* Stock Location */}
                        <td className="py-4 px-4 hidden xl:table-cell">
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>{item.stockLocations[0]}</span>
                            </div>
                            {item.stockLocations.length > 1 && (
                              <span className="text-[10px] text-slate-400 pl-4 block">
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
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Protocol</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Quick Decision Support Drawer */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/20 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40">
                          <td colSpan={8} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              {/* Dosing & Administration Details */}
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-xs uppercase tracking-wider">
                                  <Syringe className="w-3.5 h-3.5" />
                                  <span>Infusion Guide & Full Regimen</span>
                                </div>
                                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                                  <div>
                                    <strong className="text-slate-900 dark:text-white font-semibold">Initial Dose (Adult):</strong>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.dosingProtocol.adultInitial}</p>
                                  </div>
                                  {item.dosingProtocol.adultMaintenance && (
                                    <div>
                                      <strong className="text-slate-900 dark:text-white font-semibold">Maintenance Dose:</strong>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.dosingProtocol.adultMaintenance}</p>
                                    </div>
                                  )}
                                  {item.dosingProtocol.pediatricInitial && (
                                    <div>
                                      <strong className="text-cyan-700 dark:text-cyan-300 font-semibold">Paediatric Dose:</strong>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.dosingProtocol.pediatricInitial}</p>
                                    </div>
                                  )}
                                  {item.dosingProtocol.administrationRate && (
                                    <div>
                                      <strong className="text-amber-700 dark:text-amber-300 font-semibold">Infusion Rate:</strong>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.dosingProtocol.administrationRate}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Monitoring & Endpoints */}
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 text-xs uppercase tracking-wider">
                                  <HeartPulse className="w-3.5 h-3.5" />
                                  <span>Monitoring & Clinical Targets</span>
                                </div>
                                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                                  <div>
                                    <strong className="text-slate-900 dark:text-white font-semibold">Target Endpoints:</strong>
                                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                      {item.monitoringAndEndpoints.targetEndpoints.map((ep, idx) => (
                                        <li key={idx}>{ep}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-slate-900 dark:text-white font-semibold">Key Parameters:</strong>
                                    <p className="mt-0.5">{item.monitoringAndEndpoints.parameters.join(', ')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Mechanism & Storage Conditions */}
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300 text-xs uppercase tracking-wider">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Mechanism & Storage Conditions</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                                    {item.mechanismOfReversal}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                                    <strong>Storage Temp:</strong> {item.storageCondition}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">
                                    {item.mohReferenceGuide || 'MOH FUKKM Reference'}
                                  </span>
                                  <button
                                    onClick={() => handleOpenDetail(item)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  item.stockTier === 'List A'
                    ? 'bg-rose-500'
                    : item.stockTier === 'List B'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              />

              <div className="space-y-4">
                {/* Header: Badges & Poison Category */}
                <div className="flex items-start justify-between gap-3">
                  <AntidoteStockBadge tier={item.stockTier} size="sm" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {item.toxicAgentCategory}
                  </span>
                </div>

                {/* Toxic Agent & Main Exposure Title */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.toxicAgent}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-1">
                    Examples: {item.commonExposureExamples.join(', ')}
                  </p>
                </div>

                {/* Antidote Primary Highlight Box */}
                <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    <Syringe className="w-3.5 h-3.5" />
                    <span>MOH Standard Antidote:</span>
                  </div>
                  <div className="text-sm font-black text-indigo-950 dark:text-white">
                    {item.primaryAntidote}
                  </div>
                  {item.brandNames.length > 0 && (
                    <div className="text-[11px] text-indigo-600/80 dark:text-indigo-300 font-medium">
                      Brands: {item.brandNames.join(', ')}
                    </div>
                  )}
                </div>

                {/* Quick Dosing Snippet */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Initial Dose Regimen (Adult):
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.dosingProtocol.adultInitial}
                  </p>
                </div>

                {/* Clinical Trigger Snippet */}
                <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">
                    <strong>Target:</strong> {item.monitoringAndEndpoints.targetEndpoints[0]}
                  </span>
                </div>
              </div>

              {/* Footer Card Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  Cat {item.fukkmPrescriberCategory} • {item.stockLocations[0]}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No Antidote Protocols Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No records match the search query &quot;{searchTerm}&quot; or the selected filters. Please verify drug spelling or contact the National Poison Centre directly at 1-800-88-8099.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStockTier('ALL')
              setSelectedCategory('All')
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* Clinical Guidance Footnote Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-3 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>MOH Hospital Antidote Utilization Guidelines</span>
        </div>
        <h4 className="text-base font-bold text-white">
          Core Principles of Acute Poisoning Management:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <strong className="block text-indigo-200 mb-1">1. Basic Resuscitation (ABCDE)</strong>
            <p className="text-[11px]">Ensure airway stability, oxygenation, and hemodynamics prior to administering specific antidotes.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <strong className="block text-rose-200 mb-1">2. Stock Tier Adherence (List A/B/C)</strong>
            <p className="text-[11px]">List A antidotes must be administered immediately in the red zone; List B from 24-hr pharmacy; List C mobilized from the state depot.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <strong className="block text-emerald-200 mb-1">3. National Poison Centre Notification</strong>
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

