import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Grid,
  List,
  Flame,
  AlertTriangle,
  Droplets,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  FileText,
  SlidersHorizontal,
  X,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Pill,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { getAllFormulariDrugs, searchDrugs, getFormulariSummaryStats } from '../services/formulariService'
import { DrugEntry, PrescriberCategory, HAMCategory } from '../types/formulariTypes'
import { DrugCard } from '../components/DrugCard'
import { DrugInteractionModal } from '../components/DrugInteractionModal'
import { TallManLettering } from '../components/TallManLettering'
import { PrescriberBadge, HAMBadge, LASABadge, NAGBadge, PoisonBadge } from '../components/DrugBadge'
import { QuotaProgressBar } from '../components/QuotaProgressBar'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ModulePageHeader } from '@/shared/components/ui'
import { Fab } from '@/shared/components/mobile'

type SortField = 'genericName' | 'prescriberCategory' | 'atcCode'
type SortOrder = 'asc' | 'desc'

export const FormulariDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrescriber, setSelectedPrescriber] = useState<PrescriberCategory | 'ALL'>('ALL')
  const [selectedHamCategory, setSelectedHamCategory] = useState<HAMCategory | 'ALL'>('ALL')
  const [hamOnly, setHamOnly] = useState(false)
  const [lasaOnly, setLasaOnly] = useState(false)
  const [antimicrobialOnly, setAntimicrobialOnly] = useState(false)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)

  // Table sorting
  const [sortField, setSortField] = useState<SortField>('genericName')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const allDrugs = useMemo(() => getAllFormulariDrugs(), [])
  const stats = useMemo(() => getFormulariSummaryStats(), [allDrugs])

  const filteredDrugs = useMemo(() => {
    const results = searchDrugs(searchTerm, {
      prescriberCategory: selectedPrescriber,
      hamOnly,
      hamCategory: selectedHamCategory,
      lasaOnly,
      antimicrobialOnly,
      lowStockOnly
    })

    // Sort results
    return [...results].sort((a, b) => {
      let comparison = 0
      if (sortField === 'genericName') {
        comparison = a.genericName.localeCompare(b.genericName)
      } else if (sortField === 'prescriberCategory') {
        const order: Record<string, number> = { 'A*': 1, 'A': 2, 'A/KK': 3, 'B': 4, 'C': 5, 'C+': 6 }
        comparison = (order[a.prescriberCategory] || 99) - (order[b.prescriberCategory] || 99)
      } else if (sortField === 'atcCode') {
        comparison = a.atcCode.localeCompare(b.atcCode)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [searchTerm, selectedPrescriber, hamOnly, selectedHamCategory, lasaOnly, antimicrobialOnly, lowStockOnly, allDrugs, sortField, sortOrder])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedPrescriber, selectedHamCategory, hamOnly, lasaOnly, antimicrobialOnly, lowStockOnly, sortField, sortOrder, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredDrugs.length / pageSize))
  const paginatedDrugs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDrugs.slice(start, start + pageSize)
  }, [filteredDrugs, currentPage, pageSize])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedPrescriber('ALL')
    setSelectedHamCategory('ALL')
    setHamOnly(false)
    setLasaOnly(false)
    setAntimicrobialOnly(false)
    setLowStockOnly(false)
  }

  const hasActiveFilters = searchTerm || selectedPrescriber !== 'ALL' || selectedHamCategory !== 'ALL' || hamOnly || lasaOnly || antimicrobialOnly || lowStockOnly

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline-block ml-1" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-violet-600 inline-block ml-1" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-violet-600 inline-block ml-1" />
  }

  return (
    <div className="w-full space-y-6">
      {/* Standardized Module Header */}
      <ModulePageHeader
        icon={Search}
        title="Drug Formulary Search & Registry (FUKKM)"
        description="Official MOH Drug Formulary Database (4th Edition) & Lawas Hospital Clinical Guidelines"
        badges={[
          { label: 'MOH Formulary 4th Ed.', variant: 'accent' },
          { label: 'Hospital Lawas Clinical Guidelines', variant: 'neutral' },
        ]}
        actions={
          <>
            <a
              href="https://myformulary.pharmacy.gov.my/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-subtle hover:bg-hover border border-border-default text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
              title="Open Official MOH MyFormulary Portal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
              <span>MOH Portal</span>
            </a>

            <button
              onClick={() => setIsInteractionModalOpen(true)}
              className="px-3.5 py-2 bg-accent-base hover:bg-accent-hover active:bg-accent-active text-accent-foreground text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Check Drug Interactions</span>
            </button>
          </>
        }
      />

      {/* Stats KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => { handleResetFilters(); }}
          className="p-4 bg-surface rounded-xl border border-border-default shadow-2xs cursor-pointer hover:border-border-strong hover:bg-subtle/30 transition-all"
        >
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Total Drugs</span>
          <strong className="text-2xl font-bold text-text-primary tabular-nums block mt-0.5">{stats.totalDrugs}</strong>
          <span className="text-[10px] text-text-muted block mt-0.5">Listed in FUKKM</span>
        </div>

        <div
          onClick={() => { handleResetFilters(); setHamOnly(true); }}
          className={`p-4 bg-surface rounded-xl border shadow-2xs cursor-pointer transition-all ${
            hamOnly ? 'border-rose-500/60 bg-rose-500/10 ring-1 ring-rose-500/20' : 'border-border-default hover:border-rose-500/40 hover:bg-subtle/30'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-500" /> HAM List
          </span>
          <strong className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums block mt-0.5">{stats.hamCount}</strong>
          <span className="text-[10px] text-rose-500/80 block mt-0.5">High Alert Drugs</span>
        </div>

        <div
          onClick={() => { handleResetFilters(); setLasaOnly(true); }}
          className={`p-4 bg-surface rounded-xl border shadow-2xs cursor-pointer transition-all ${
            lasaOnly ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/20' : 'border-border-default hover:border-amber-500/40 hover:bg-subtle/30'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> LASA Pairs
          </span>
          <strong className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums block mt-0.5">{stats.lasaCount}</strong>
          <span className="text-[10px] text-amber-600/80 block mt-0.5">TALL-Man Lettering</span>
        </div>

        <div
          onClick={() => { handleResetFilters(); setAntimicrobialOnly(true); }}
          className={`p-4 bg-surface rounded-xl border shadow-2xs cursor-pointer transition-all ${
            antimicrobialOnly ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'border-border-default hover:border-emerald-500/40 hover:bg-subtle/30'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> NAG 2024
          </span>
          <strong className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block mt-0.5">{stats.antimicrobialCount}</strong>
          <span className="text-[10px] text-emerald-600/80 block mt-0.5">MOH Antimicrobial</span>
        </div>

        <div
          onClick={() => { handleResetFilters(); }}
          className="p-4 bg-surface rounded-xl border border-border-default shadow-2xs cursor-pointer hover:border-border-strong hover:bg-subtle/30 transition-all"
        >
          <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block flex items-center gap-1">
            <Droplets className="w-3 h-3 text-teal-500" /> IV Dilution
          </span>
          <strong className="text-2xl font-bold text-teal-600 dark:text-teal-400 tabular-nums block mt-0.5">{stats.ivDilutionCount}</strong>
          <span className="text-[10px] text-teal-600/80 block mt-0.5">Protocols</span>
        </div>

        <div
          onClick={() => { handleResetFilters(); setLowStockOnly(true); }}
          className={`p-4 bg-surface rounded-xl border shadow-2xs cursor-pointer transition-all ${
            lowStockOnly ? 'border-rose-500/60 bg-rose-500/10 ring-1 ring-rose-500/20' : 'border-border-default hover:border-rose-500/40 hover:bg-subtle/30'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-500" /> Quota Alert
          </span>
          <strong className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums block mt-0.5">{stats.lowStockCount}</strong>
          <span className="text-[10px] text-rose-500/80 block mt-0.5">Low / Critical</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface rounded-xl border border-border-default shadow-2xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Generic Name (INN), Brand Name, ATC Code, Indication, or Therapeutic Class..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-subtle border border-border-default rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent-base focus:bg-surface focus:ring-2 focus:ring-accent-base/15 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Prescriber Dropdown */}
          <select
            value={selectedPrescriber}
            onChange={e => setSelectedPrescriber(e.target.value as PrescriberCategory | 'ALL')}
            className="px-4 py-2.5 bg-subtle border border-border-default rounded-xl text-xs font-semibold text-text-secondary focus:outline-hidden focus:border-accent-base focus:bg-surface"
          >
            <option value="ALL">All Prescriber Categories</option>
            <option value="A*">Category A* (Consultant/Specialist Only)</option>
            <option value="A">Category A (Hospital Medical Officer)</option>
            <option value="A/KK">Category A/KK (Hospital & Health Clinic)</option>
            <option value="B">Category B (All Medical Officers)</option>
            <option value="C">Category C (Community Clinics)</option>
          </select>

          {/* View Mode Toggle: Table List (default) vs Card Grid */}
          <div className="flex items-center bg-subtle p-1 rounded-xl border border-border-default shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-surface text-accent-base shadow-2xs border border-border-default' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-surface text-accent-base shadow-2xs border border-border-default' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Card Grid</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Toggle Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-default text-xs">
          <span className="text-text-muted font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Quick Filters:</span>
          </span>

          <button
            onClick={() => setHamOnly(!hamOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              hamOnly ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-subtle text-text-secondary border-border-default hover:bg-hover'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>High Alert (HAM) Only</span>
          </button>

          <button
            onClick={() => setLasaOnly(!lasaOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              lasaOnly ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-subtle text-text-secondary border-border-default hover:bg-hover'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>LASA Drugs Only</span>
          </button>

          <button
            onClick={() => setAntimicrobialOnly(!antimicrobialOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              antimicrobialOnly ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-subtle text-text-secondary border-border-default hover:bg-hover'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Antimicrobial (NAG)</span>
          </button>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              lowStockOnly ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-subtle text-text-secondary border-border-default hover:bg-hover'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Low / Critical Quota</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg font-semibold text-accent-base hover:bg-accent-subtle/50 transition-colors ml-auto flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Showing <strong className="text-text-primary font-bold">{filteredDrugs.length}</strong> of <strong className="text-text-primary font-bold">{allDrugs.length}</strong> formulary drugs</span>
        {hasActiveFilters && <span className="bg-accent-subtle text-accent-base border border-accent-base/20 px-2 py-0.5 rounded-md font-semibold">Active filters applied</span>}
      </div>

      {/* PRIMARY VIEW: Full-Width Clinical Table List with Rich Columns */}
      {viewMode === 'table' && (
        <div className="bg-surface rounded-xl border border-border-default shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-subtle/80 border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th className="p-3.5 text-center w-12 text-text-muted">No.</th>
                  <th
                    onClick={() => handleSort('genericName')}
                    className="p-3.5 cursor-pointer hover:bg-hover transition-colors min-w-[240px]"
                  >
                    <span>Generic Name (INN) & Brands</span>
                    {renderSortIcon('genericName')}
                  </th>
                  <th
                    onClick={() => handleSort('prescriberCategory')}
                    className="p-3.5 cursor-pointer hover:bg-hover transition-colors min-w-[150px]"
                  >
                    <span>Prescriber & Poison Category</span>
                    {renderSortIcon('prescriberCategory')}
                  </th>
                  <th className="p-3.5 min-w-[170px]">Strength & Dosage Form</th>
                  <th
                    onClick={() => handleSort('atcCode')}
                    className="p-3.5 cursor-pointer hover:bg-hover transition-colors min-w-[200px]"
                  >
                    <span>Therapeutic Class & ATC</span>
                    {renderSortIcon('atcCode')}
                  </th>
                  <th className="p-3.5 min-w-[260px]">Main Clinical Indications (FUKKM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {paginatedDrugs.map((drug, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1
                  return (
                    <tr
                      key={drug.id}
                      onClick={() => navigate(`/formulari/drug/${drug.id}`)}
                      className="hover:bg-subtle/50 cursor-pointer transition-colors group"
                    >
                      {/* 1. Bil */}
                      <td className="p-3.5 text-center font-mono text-text-muted font-semibold">
                        {globalIndex}
                      </td>

                      {/* 2. Generic Name & Brands */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="font-semibold text-text-primary text-sm leading-snug group-hover:text-accent-base transition-colors">
                            {drug.genericName}
                          </div>
                          <div className="text-[11px] text-text-muted font-normal">
                            {drug.brandNames.join(' • ')}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono">
                            Code: {drug.mohDrugCode}
                          </div>
                        </div>
                      </td>

                      {/* 3. Prescriber Category & Poison */}
                      <td className="p-3.5 space-y-1.5">
                        <PrescriberBadge category={drug.prescriberCategory} size="sm" />
                        <div className="text-[11px] text-text-secondary font-medium">
                          {drug.poisonCategory}
                        </div>
                        <span className="text-[10px] bg-subtle text-text-secondary border border-border-default px-1.5 py-0.5 rounded font-mono block w-fit">
                          Scheme: {drug.skimPerolehan}
                        </span>
                      </td>

                      {/* 4. Strengths & Dosage Forms */}
                      <td className="p-3.5 space-y-1">
                        {drug.strengths.map((str, idx) => (
                          <div key={idx} className="font-semibold text-text-primary text-[11px]">
                            {str}
                          </div>
                        ))}
                        <div className="text-[11px] text-text-muted italic">
                          {drug.dosageForms.join(', ')}
                        </div>
                      </td>

                      {/* 5. Therapeutic Class & ATC Code */}
                      <td className="p-3.5 space-y-1">
                        <div className="font-medium text-text-primary leading-snug text-xs">
                          {drug.therapeuticClass}
                        </div>
                        <span className="text-[10px] bg-subtle text-text-secondary border border-border-default px-2 py-0.5 rounded font-mono inline-block font-semibold">
                          ATC: {drug.atcCode}
                        </span>
                      </td>

                      {/* 6. Main Clinical Indications */}
                      <td className="p-3.5">
                        <ul className="space-y-1 text-[11px] text-text-secondary list-disc list-inside leading-snug">
                          {drug.indications.slice(0, 2).map((ind, idx) => (
                            <li key={idx} className="line-clamp-2">{ind}</li>
                          ))}
                          {drug.indications.length > 2 && (
                            <span className="text-[10px] text-accent-base font-semibold pl-3">
                              +{drug.indications.length - 2} more indications...
                            </span>
                          )}
                        </ul>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECONDARY VIEW: Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {paginatedDrugs.map(drug => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {filteredDrugs.length > 0 && (
        <div className="bg-surface rounded-xl border border-border-default p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs select-none">
          <div className="flex items-center gap-3 text-text-secondary">
            <span>
              Showing <strong className="text-text-primary font-bold tabular-nums">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-text-primary font-bold tabular-nums">{Math.min(currentPage * pageSize, filteredDrugs.length)}</strong> of <strong className="text-text-primary font-bold tabular-nums">{filteredDrugs.length.toLocaleString()}</strong> formulary records
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-border-default pl-3">
              <span className="text-text-muted">Show:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="bg-subtle border border-border-default rounded-lg px-2 py-1 text-text-primary font-semibold focus:outline-hidden"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border-default hover:bg-subtle disabled:opacity-30 disabled:cursor-not-allowed text-text-primary transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-2 rounded-lg border border-border-default hover:bg-subtle disabled:opacity-30 disabled:cursor-not-allowed text-text-primary flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="px-3 py-1.5 bg-accent-subtle text-accent-base font-semibold rounded-lg border border-accent-base/20 mx-1">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-2 rounded-lg border border-border-default hover:bg-subtle disabled:opacity-30 disabled:cursor-not-allowed text-text-primary flex items-center gap-1 transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border-default hover:bg-subtle disabled:opacity-30 disabled:cursor-not-allowed text-text-primary transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Zero State */}
      {filteredDrugs.length === 0 && (
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-strong space-y-3">
          <Search className="w-10 h-10 mx-auto text-text-muted opacity-60" />
          <h3 className="text-base font-semibold text-text-primary">No formulary drugs found</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            No drugs match your search "{searchTerm}" or selected filters. Please check your spelling or reset filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-ink hover:bg-ink-hover text-ink-text font-semibold rounded-lg text-xs transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Multi-drug Interaction Modal */}
      <DrugInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        allDrugs={allDrugs}
      />

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => setIsInteractionModalOpen(true)} 
        aria-label="Check Drug Interactions" 
      />
    </div>
  )
}

export default FormulariDashboardPage

