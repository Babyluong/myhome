import React, { useState, useMemo, useEffect } from 'react'
import {
  ShieldCheck,
  Printer,
  FileCheck,
  Activity,
  Baby,
  User,
  Calculator,
  Clock,
  RefreshCw,
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import {
  NAGInfectionGuideline,
  NAGPopulation,
  NAGSyncMetadata
} from '../types/formulariTypes'
import { NAGMasterSidebar } from '../components/NAGMasterSidebar'
import { NAGClinicalMonograph } from '../components/NAGClinicalMonograph'
import { NAGUserGuideBanner } from '../components/NAGUserGuideBanner'
import { PaediatricDoseCalculatorModal } from '../components/PaediatricDoseCalculatorModal'
import { NAGSyncManagerModal } from '../components/NAGSyncManagerModal'
import {
  getAllNAGGuidelines,
  getNAGSyncMetadata
} from '../services/nagService'

export const AntimicrobialGuidelinePage: React.FC = () => {
  const [guidelines, setGuidelines] = useState<NAGInfectionGuideline[]>(() => getAllNAGGuidelines())
  const [syncMeta, setSyncMeta] = useState<NAGSyncMetadata>(() => getNAGSyncMetadata())

  // Master-Detail State
  const [selectedPopulation, setSelectedPopulation] = useState<NAGPopulation>('All')
  const [selectedSetting, setSelectedSetting] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Active selected guideline
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string | null>(() => {
    const list = getAllNAGGuidelines()
    // Default to CAP or first guideline
    const cap = list.find(g => g.conditionName.toLowerCase().includes('community acquired pneumonia') || g.conditionName.toLowerCase().includes('cap'))
    return cap ? cap.id : (list[0]?.id || null)
  })

  // Mobile detail view active state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [calculatorDrugHint, setCalculatorDrugHint] = useState<string | undefined>()
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  // Listen to guidelines update event for live reactivity
  useEffect(() => {
    const handleUpdated = () => {
      const updatedList = getAllNAGGuidelines()
      setGuidelines(updatedList)
      setSyncMeta(getNAGSyncMetadata())
      if (!selectedGuidelineId && updatedList.length > 0) {
        setSelectedGuidelineId(updatedList[0].id)
      }
    }
    window.addEventListener('nag_guidelines_updated', handleUpdated)
    return () => window.removeEventListener('nag_guidelines_updated', handleUpdated)
  }, [selectedGuidelineId])

  // Active selected guideline object
  const activeGuideline = useMemo(() => {
    if (!selectedGuidelineId) return guidelines[0] || null
    return guidelines.find(g => g.id === selectedGuidelineId) || guidelines[0] || null
  }, [guidelines, selectedGuidelineId])

  const handleSelectGuideline = (item: NAGInfectionGuideline) => {
    setSelectedGuidelineId(item.id)
    setIsMobileDetailOpen(true)
  }

  const handleOpenCalculator = (drugHint?: string) => {
    setCalculatorDrugHint(drugHint)
    setIsCalculatorOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 animate-fade-in">
      {/* 1. TOP OFFICIAL KKM PORTAL HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />

        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-200" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                National Antimicrobial Guidelines (NAG 2024)
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {syncMeta.edition}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                17 Dewasa (A1–A17) • 14 Pediatrik (B1–B14)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              Portal Garis Panduan Antimikrobial Kebangsaan Edisi Ke-4 (KKM) &amp; Kawalan Rintangan Antimikrob (AMS) Lawas Hospital
            </p>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200/80"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showGuide ? 'Tutup Panduan' : 'Panduan Pengguna'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCalculator()}
            className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-200" />
            <span>Kalkulator Dos</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Penyegerakan</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 2. FIRST-TIME USER GUIDE BANNER (TOGGLEABLE) */}
      {showGuide && (
        <NAGUserGuideBanner
          onQuickFilter={q => {
            setSearchTerm(q)
            setShowGuide(false)
          }}
        />
      )}

      {/* 3. AMS PROTOCOL HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Polisi Antimicrobial Stewardship (AMS) Hospital Lawas:
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Prinsip wajib penggunaan antimikrobial rasional bagi membasmi rintangan kuman (AMR).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Semakan Wajib 48–72 Jam</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Tukar IV ke Oral Pantas</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Sekatan Ubat Tier-R</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MASTER-DETAIL TWO-PANE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT MASTER NAVIGATION PANE (Col 4) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 sticky top-6 ${
            isMobileDetailOpen ? 'hidden lg:block' : 'block'
          }`}
        >
          <NAGMasterSidebar
            guidelines={guidelines}
            selectedGuidelineId={selectedGuidelineId}
            onSelectGuideline={handleSelectGuideline}
            selectedPopulation={selectedPopulation}
            onSelectPopulation={setSelectedPopulation}
            selectedSetting={selectedSetting}
            onSelectSetting={setSelectedSetting}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* RIGHT DETAIL MONOGRAPH PANE (Col 8) */}
        <div
          className={`lg:col-span-7 xl:col-span-8 space-y-4 ${
            isMobileDetailOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Mobile Back Button */}
          {isMobileDetailOpen && (
            <button
              type="button"
              onClick={() => setIsMobileDetailOpen(false)}
              className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Senarai Kategori</span>
            </button>
          )}

          <NAGClinicalMonograph
            guideline={activeGuideline}
            onOpenCalculator={handleOpenCalculator}
          />
        </div>
      </div>

      {/* 5. MODALS */}
      <PaediatricDoseCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        initialDrugName={calculatorDrugHint}
      />

      <NAGSyncManagerModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncCompleted={() => {
          setGuidelines(getAllNAGGuidelines())
          setSyncMeta(getNAGSyncMetadata())
        }}
      />
    </div>
  )
}

export default AntimicrobialGuidelinePage
