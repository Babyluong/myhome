import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Info,
  BookOpen,
  Filter,
  X,
  Flame,
  FileText,
  AlertOctagon,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { getAllFormulariDrugs } from '../services/formulariService'
import { KKM_LASA_MASTER_REGISTRY, KkmLasaEntry, getLasaCategories } from '../data/lasaDatabase'
import { TallManLettering } from '../components/TallManLettering'
import { LASABadge, HAMBadge } from '../components/DrugBadge'

export const LasaListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories')
  const [confusionFilter, setConfusionFilter] = useState<'ALL' | 'look-alike' | 'sound-alike' | 'both' | 'packaging'>('ALL')
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL')
  const [hamOnlyFilter, setHamOnlyFilter] = useState<boolean>(false)
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState<boolean>(false)

  const allDrugs = useMemo(() => getAllFormulariDrugs(), [])
  const rawCategories = useMemo(() => getLasaCategories(), [])
  const categories = useMemo(() => rawCategories.map(c => c === 'Semua Kategori' ? 'All Categories' : c), [rawCategories])

  // Map each LASA entry with corresponding drug monograph IDs if available
  const enrichedEntries = useMemo(() => {
    return KKM_LASA_MASTER_REGISTRY.map(item => {
      // Find matching drug for drugThis
      const matchThis = allDrugs.find(d => 
        (item.keywordsThis && item.keywordsThis.some(k => d.genericName.toLowerCase().includes(k.toLowerCase()))) ||
        d.genericName.toLowerCase().includes(item.drugThis.toLowerCase()) ||
        item.drugThis.toLowerCase().includes(d.genericName.toLowerCase())
      )

      // Find matching drug for drugOther
      const matchOther = allDrugs.find(d => 
        (item.keywordsOther && item.keywordsOther.some(k => d.genericName.toLowerCase().includes(k.toLowerCase()))) ||
        d.genericName.toLowerCase().includes(item.drugOther.toLowerCase()) ||
        item.drugOther.toLowerCase().includes(d.genericName.toLowerCase())
      )

      return {
        ...item,
        drugThisId: matchThis?.id,
        drugOtherId: matchOther?.id,
        drugThisFukkmName: matchThis?.genericName,
        drugOtherFukkmName: matchOther?.genericName
      }
    })
  }, [allDrugs])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return enrichedEntries.filter(item => {
      // Search Term
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim()
        const matchThis = item.drugThis.toLowerCase().includes(q)
        const matchOther = item.drugOther.toLowerCase().includes(q)
        const matchTallThis = item.tallManThis.toLowerCase().includes(q)
        const matchTallOther = item.tallManOther.toLowerCase().includes(q)
        const matchWarning = item.clinicalRiskWarning.toLowerCase().includes(q)
        const matchStrategy = item.separationStrategy.toLowerCase().includes(q)
        const matchCat = item.category.toLowerCase().includes(q)

        if (!matchThis && !matchOther && !matchTallThis && !matchTallOther && !matchWarning && !matchStrategy && !matchCat) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'All Categories' && selectedCategory !== 'Semua Kategori' && item.category !== selectedCategory) {
        return false
      }

      // Confusion filter
      if (confusionFilter !== 'ALL' && item.confusionType !== confusionFilter) {
        return false
      }

      // Risk filter
      if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) {
        return false
      }

      // HAM filter
      if (hamOnlyFilter && !item.isHAM) {
        return false
      }

      return true
    })
  }, [enrichedEntries, searchTerm, selectedCategory, confusionFilter, riskFilter, hamOnlyFilter])

  // Summary counts
  const stats = useMemo(() => {
    const total = KKM_LASA_MASTER_REGISTRY.length
    const critical = KKM_LASA_MASTER_REGISTRY.filter(i => i.riskLevel === 'CRITICAL').length
    const hamCount = KKM_LASA_MASTER_REGISTRY.filter(i => i.isHAM).length
    const categoriesCount = categories.length - 1
    return { total, critical, hamCount, categoriesCount }
  }, [categories])

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600" />
        
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg flex-shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                MOH LASA Drug Registry & TALL-Man Guidelines
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase rounded-full">
                Official FUKKM
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
              Prevention of Look-Alike, Sound-Alike (LASA) Medication Errors in accordance with MOH Pharmacy Services Programme & ISMP Medication Safety Guidelines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsGuidelineModalOpen(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>MOH TALL-Man Methodology</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Ward Poster</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total LASA Pairs</span>
            <span className="text-2xl font-black text-slate-900">{stats.total} Pairs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Fatal / Critical Risk</span>
            <span className="text-2xl font-black text-rose-700">{stats.critical} Pairs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider block">High Alert Meds (HAM)</span>
            <span className="text-2xl font-black text-purple-700">{stats.hamCount} Items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">MOH Clinical Domains</span>
            <span className="text-2xl font-black text-blue-700">{stats.categoriesCount} Domains</span>
          </div>
        </div>
      </div>

      {/* Educational Banner on TALL-Man */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>MOH & ISMP Medication Safety Standards</span>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
            Reduces Medication Errors by up to 70%
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold leading-snug">
          TALL-Man Lettering Principles & Ward Segregation SOPs
        </h2>

        <p className="text-xs sm:text-sm text-amber-50 leading-relaxed max-w-5xl">
          TALL-Man Lettering utilizes capitalized lettering to emphasize spelling differences between medications with confusable look-alike or sound-alike names (e.g. <strong>DOBUTamine</strong> vs <strong>DOPAmine</strong>, <strong>cefOTAXime</strong> vs <strong>cefTRIAXone</strong>, <strong>CARBOplatin</strong> vs <strong>CISplatin</strong>). Medications in this registry mandate physical segregation protocols across hospital wards and pharmacy storage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
            <span className="text-xs font-black block mb-1 text-amber-200 uppercase">1. Medication Labels & Bins</span>
            <span className="text-xs text-amber-50">Must be printed with TALL-Man on shelf bin tags, emergency crash carts, and ward unit-dose labels.</span>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
            <span className="text-xs font-black block mb-1 text-amber-200 uppercase">2. Strict Physical Segregation</span>
            <span className="text-xs text-amber-50">LASA pairs must never be stored side-by-side. Utilize physical dividers and yellow LASA auxiliary labels.</span>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
            <span className="text-xs font-black block mb-1 text-amber-200 uppercase">3. Independent Double-Check (IDC)</span>
            <span className="text-xs text-amber-50">Two healthcare personnel (nurses/pharmacists) must verify the full drug name, strength, and patient prior to administration.</span>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Hospital Clinical Domain:
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredEntries.length} of {stats.total} pairs
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat, idx) => {
            const count = (cat === 'All Categories' || cat === 'Semua Kategori')
              ? KKM_LASA_MASTER_REGISTRY.length 
              : KKM_LASA_MASTER_REGISTRY.filter(i => i.category === cat).length

            const isSelected = selectedCategory === cat || (selectedCategory === 'All Categories' && cat === 'Semua Kategori')

            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drug names (generic/TALL-Man), clinical risk, or storage strategy..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Confusion Type Filter */}
          <select
            value={confusionFilter}
            onChange={e => setConfusionFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:bg-white"
          >
            <option value="ALL">All Confusion Types</option>
            <option value="both">Look & Sound-Alike (Both)</option>
            <option value="look-alike">Look-Alike Only (Spelling / Shape)</option>
            <option value="sound-alike">Sound-Alike Only (Phonetic)</option>
            <option value="packaging">Packaging Appearance (Look-Alike)</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:bg-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Fatal / Critical Risk (CRITICAL)</option>
            <option value="HIGH">High Risk (HIGH)</option>
            <option value="MODERATE">Moderate Risk (MODERATE)</option>
          </select>
        </div>

        {/* Toggle HAM Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={hamOnlyFilter}
              onChange={e => setHamOnlyFilter(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-purple-600" />
              <span>Filter High Alert Medications (HAM) Only</span>
            </span>
          </label>

          {(searchTerm || (selectedCategory !== 'All Categories' && selectedCategory !== 'Semua Kategori') || confusionFilter !== 'ALL' || riskFilter !== 'ALL' || hamOnlyFilter) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All Categories')
                setConfusionFilter('ALL')
                setRiskFilter('ALL')
                setHamOnlyFilter(false)
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* LASA Pairs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredEntries.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 transition-all p-6 shadow-xs hover:shadow-lg space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                  {item.category}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.isHAM && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-lg flex items-center gap-1">
                      <Flame className="w-3 h-3 text-purple-600" />
                      HAM
                    </span>
                  )}

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${
                    item.riskLevel === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : item.riskLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {item.riskLevel}
                  </span>
                </div>
              </div>

              {/* Pair Comparison Display */}
              <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Type: {item.confusionType}</span>
                  <span>ID: {item.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  {/* Drug 1 */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300/80 shadow-xs text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Primary Drug:</span>
                    <div className="text-base font-extrabold text-slate-900 break-words">
                      <TallManLettering name={item.tallManThis} />
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1 block" title={item.drugThis}>
                      {item.drugThis}
                    </span>
                  </div>

                  {/* Drug 2 */}
                  <div className="p-3.5 bg-white rounded-2xl border border-rose-300/80 shadow-xs text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Confused With:</span>
                    <div className="text-base font-extrabold text-slate-900 break-words">
                      <TallManLettering name={item.tallManOther} />
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1 block" title={item.drugOther}>
                      {item.drugOther}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Risk Warning */}
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Clinical Risk & Hazards:</span>
                </div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                  {item.clinicalRiskWarning}
                </p>
              </div>

              {/* Separation Strategy */}
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                  <span>Ward / Pharmacy Storage SOP:</span>
                </div>
                <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200 leading-relaxed font-medium text-xs">
                  {item.separationStrategy}
                </p>
              </div>

              {/* Packaging Note if present */}
              {item.packagingNotes && (
                <div className="text-[11px] text-slate-500 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Packaging Appearance:</strong> {item.packagingNotes}</span>
                </div>
              )}
            </div>

            {/* Bottom Links to Drug Monograph */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-slate-400 font-semibold">MOH Safety Database</span>
              
              <div className="flex items-center gap-2">
                {item.drugThisId && (
                  <button
                    onClick={() => navigate(`/formulari/drug/${item.drugThisId}`)}
                    className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title={`Open monograph for ${item.tallManThis}`}
                  >
                    <span>{item.tallManThis.split(' ')[0]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {item.drugOtherId && (
                  <button
                    onClick={() => navigate(`/formulari/drug/${item.drugOtherId}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title={`Open monograph for ${item.tallManOther}`}
                  >
                    <span>{item.tallManOther.split(' ')[0]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No LASA pairs found matching the selected criteria.</p>
            <p className="text-slate-400 max-w-md mx-auto">
              Please try changing search keywords or resetting the category and risk level filters.
            </p>
          </div>
        )}
      </div>

      {/* Educational Guide Modal */}
      {isGuidelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-white rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    MOH TALL-Man Lettering & LASA Safety Guidelines
                  </h3>
                  <p className="text-xs text-slate-500">
                    Based on MOH Pharmacy Services Programme & ISMP Standards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGuidelineModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <strong className="text-amber-950 block font-bold text-sm">What is TALL-Man Lettering?</strong>
                <p>
                  TALL-Man Lettering is a typography practice that uses selective capitalization to emphasize the disparate parts of drug names that look or sound alike, helping prevent dispensing and administration errors.
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-900 block font-bold text-sm">Capitalization Rules:</strong>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Prefix Capitalization:</strong> Used when differences lie in the initial part of the drug name (e.g. <strong>DOBUT</strong>amine vs <strong>DOP</strong>amine, <strong>CARBO</strong>platin vs <strong>CIS</strong>platin).</li>
                  <li><strong>Middle Capitalization:</strong> Used when differences lie in the middle part of cephalosporin class names (e.g. cef<strong>AZOL</strong>in vs cef<strong>OTAX</strong>ime vs cef<strong>TRIAX</strong>one vs cef<strong>TAZID</strong>ime).</li>
                  <li><strong>Suffix Capitalization:</strong> Used when differences lie in the suffix part of the name (e.g. sal<strong>BUT</strong>amol vs sal<strong>METER</strong>ol, predni<strong>SONE</strong> vs predniso<strong>LONE</strong>).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-900 block font-bold text-sm">Hospital Ward & Pharmacy Safety SOPs:</strong>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li><strong>Yellow / Orange LASA Stickers:</strong> Mandatory on LASA medication bins and packaging boxes.</li>
                  <li><strong>Physical Segregation:</strong> Never place LASA drug pairs in adjacent shelf bins.</li>
                  <li><strong>Prescription Writing:</strong> Must write full generic names along with dose strength and dosage form. Abbreviations prohibited.</li>
                  <li><strong>Two-Person Verification (IDC):</strong> Mandatory Independent Double-Check prior to any LASA administration, especially high-alert categories.</li>
                </ol>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsGuidelineModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LasaListPage
