import React, { useState, useMemo } from 'react'
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Baby,
  Sparkles,
  Layers,
  CheckCircle2,
  Filter,
  Zap,
  Bookmark
} from 'lucide-react'
import {
  NAGInfectionGuideline,
  NAGPopulation,
  NAGCategoryMetadata
} from '../types/formulariTypes'
import {
  NAG_ADULT_CATEGORIES_METADATA,
  NAG_PAED_CATEGORIES_METADATA
} from '../data/nagCategoriesData'

interface NAGMasterSidebarProps {
  guidelines: NAGInfectionGuideline[]
  selectedGuidelineId: string | null
  onSelectGuideline: (guideline: NAGInfectionGuideline) => void
  selectedPopulation: NAGPopulation
  onSelectPopulation: (pop: NAGPopulation) => void
  selectedSetting: string
  onSelectSetting: (setting: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export const NAGMasterSidebar: React.FC<NAGMasterSidebarProps> = ({
  guidelines,
  selectedGuidelineId,
  onSelectGuideline,
  selectedPopulation,
  onSelectPopulation,
  selectedSetting,
  onSelectSetting,
  searchTerm,
  onSearchChange
}) => {
  // Expanded category codes in tree view
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    A11: true,
    A12: true,
    A17: true,
    B1: true,
    B2: true
  })

  const toggleExpandCategory = (code: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [code]: !prev[code]
    }))
  }

  // Active Category Metadata list based on population
  const activeCategoryMetaList = useMemo(() => {
    if (selectedPopulation === 'Adult') return NAG_ADULT_CATEGORIES_METADATA
    if (selectedPopulation === 'Paediatric' || selectedPopulation === 'Neonatal') return NAG_PAED_CATEGORIES_METADATA
    return [...NAG_ADULT_CATEGORIES_METADATA, ...NAG_PAED_CATEGORIES_METADATA]
  }, [selectedPopulation])

  // Filtered Guidelines for Search Mode
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return []

    const q = searchTerm.toLowerCase().trim()
    return guidelines.filter(item => {
      // Population filter
      if (selectedPopulation === 'Adult' && item.targetPopulation !== 'Adult' && item.targetPopulation !== 'All') return false
      if (selectedPopulation === 'Paediatric' && item.targetPopulation !== 'Paediatric' && item.targetPopulation !== 'Neonatal' && item.targetPopulation !== 'All') return false

      // Setting filter
      if (selectedSetting !== 'ALL' && item.setting !== selectedSetting) return false

      // Search match
      const matchCond = item.conditionName.toLowerCase().includes(q)
      const matchSys = item.bodySystem.toLowerCase().includes(q)
      const matchCode = (item.categoryCode || '').toLowerCase().includes(q)
      const matchTopic = (item.topic || '').toLowerCase().includes(q)
      const matchPath = item.primaryPathogens.some(p => p.toLowerCase().includes(q))
      const matchReg1 = item.firstLineTherapy.regimen.toLowerCase().includes(q)
      const matchReg2 = item.secondLineTherapy.regimen.toLowerCase().includes(q)
      const matchAllergy = item.penicillinAllergyOption?.regimen.toLowerCase().includes(q) || false
      const matchDrugs = item.firstLineDrugs.some(d => d.toLowerCase().includes(q))

      return matchCond || matchSys || matchCode || matchTopic || matchPath || matchReg1 || matchReg2 || matchAllergy || matchDrugs
    })
  }, [guidelines, searchTerm, selectedPopulation, selectedSetting])

  // Helper to find guidelines under a specific category
  const getGuidelinesForCategory = (catCode: string, catTitle: string) => {
    return guidelines.filter(g => {
      // Population check
      if (selectedPopulation === 'Adult' && g.targetPopulation !== 'Adult' && g.targetPopulation !== 'All') return false
      if (selectedPopulation === 'Paediatric' && g.targetPopulation !== 'Paediatric' && g.targetPopulation !== 'Neonatal' && g.targetPopulation !== 'All') return false
      // Setting check
      if (selectedSetting !== 'ALL' && g.setting !== selectedSetting) return false

      return g.categoryCode === catCode || g.bodySystem === catTitle || (g.categoryTitle && g.categoryTitle.includes(catCode))
    })
  }

  const quickChips = [
    { label: '⚡ Sepsis', q: 'sepsis' },
    { label: '🫁 CAP', q: 'pneumonia' },
    { label: '💧 UTI', q: 'urinary' },
    { label: '🩹 Selulitis', q: 'cellulitis' },
    { label: '🛡️ SAP', q: 'prophylaxis' },
    { label: '👶 Meningitis', q: 'meningitis' }
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px] overflow-hidden">
      {/* 1. STICKY TOP SEARCH & FILTERS HEADER */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/50">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari indikasi, ubat, patogen..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSearchChange(chip.q)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                searchTerm.toLowerCase() === chip.q.toLowerCase()
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 border-slate-200/80 shadow-2xs'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Population Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-200/70 rounded-2xl border border-slate-200 text-xs font-black">
          <button
            type="button"
            onClick={() => onSelectPopulation('All')}
            className={`py-1.5 rounded-xl transition-all text-center cursor-pointer ${
              selectedPopulation === 'All'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onSelectPopulation('Adult')}
            className={`py-1.5 rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
              selectedPopulation === 'Adult'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Adult</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectPopulation('Paediatric')}
            className={`py-1.5 rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
              selectedPopulation === 'Paediatric'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-3 h-3" />
            <span>Paediatric</span>
          </button>
        </div>

        {/* Setting Selector */}
        <select
          value={selectedSetting}
          onChange={e => onSelectSetting(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
        >
          <option value="ALL">All Clinical Settings</option>
          <option value="Community-Acquired">Komuniti (Community-Acquired)</option>
          <option value="Hospital-Acquired (HAP/VAP)">Hospital (Nosocomial/HAP)</option>
          <option value="ICU / Severe">ICU / Sepsis Kritikal</option>
          <option value="Surgical Prophylaxis">Profilaksis Pembedahan (SAP)</option>
          <option value="Outpatient (OPD/KK)">Pesakit Luar (OPD / Klinik Kesihatan)</option>
        </select>
      </div>

      {/* 2. SCROLLABLE NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-100">
        {/* CASE A: SEARCH MODE ACTIVE */}
        {searchTerm.trim() ? (
          <div className="space-y-2 pt-1">
            <div className="px-2 py-1 flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Smart Search Results</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {searchResults.length} ditemui
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-bold text-slate-600">Tiada padanan ditemui</p>
                <p className="text-[11px] text-slate-400">
                  Try different keywords or select &apos;All&apos; on the population filter.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {searchResults.map(item => {
                  const isSelected = selectedGuidelineId === item.id
                  const isPaed = item.targetPopulation === 'Paediatric' || item.targetPopulation === 'Neonatal'

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectGuideline(item)}
                      className={`p-3 rounded-2xl text-left cursor-pointer transition-all border ${
                        isSelected
                          ? isPaed
                            ? 'bg-cyan-50/90 border-cyan-500 shadow-xs ring-1 ring-cyan-500/30'
                            : 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          {item.categoryCode && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono">
                              {item.categoryCode}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[140px]">
                            {item.bodySystem}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                            isPaed ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isPaed ? 'Pediatrik' : 'Dewasa'}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {item.conditionName}
                      </h4>

                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        1st-line: <strong className="text-slate-700">{item.firstLineTherapy.regimen}</strong>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* CASE B: HIERARCHICAL ORGAN SYSTEM TREE */
          <div className="space-y-1 pt-1">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Direktori Sistem Organ ({activeCategoryMetaList.length})</span>
            </div>

            {activeCategoryMetaList.map(cat => {
              const isExpanded = !!expandedCategories[cat.code]
              const catGuidelines = getGuidelinesForCategory(cat.code, cat.title)
              const hasActiveChild = catGuidelines.some(g => g.id === selectedGuidelineId)

              return (
                <div key={cat.code} className="space-y-1">
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleExpandCategory(cat.code)}
                    className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      hasActiveChild
                        ? 'bg-slate-100/90 text-slate-900 font-black'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono">
                            {cat.code}
                          </span>
                          <span className="text-xs font-bold truncate">
                            {cat.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded-md bg-slate-100">
                        {catGuidelines.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Subtopics / Child Guidelines List */}
                  {isExpanded && catGuidelines.length > 0 && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200/80 ml-4 animate-fade-in">
                      {catGuidelines.map(g => {
                        const isSelected = selectedGuidelineId === g.id
                        const isPaed = g.targetPopulation === 'Paediatric' || g.targetPopulation === 'Neonatal'

                        return (
                          <div
                            key={g.id}
                            onClick={() => onSelectGuideline(g)}
                            className={`p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                              isSelected
                                ? isPaed
                                  ? 'bg-cyan-700 text-white shadow-xs font-black'
                                  : 'bg-emerald-700 text-white shadow-xs font-black'
                                : 'hover:bg-slate-100 text-slate-700 text-xs font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs leading-snug line-clamp-2">
                                {g.conditionName}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 opacity-90" />
                              )}
                            </div>
                            <div
                              className={`text-[10px] mt-0.5 truncate ${
                                isSelected ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              {g.setting} • {g.evidenceLevel}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NAGMasterSidebar
