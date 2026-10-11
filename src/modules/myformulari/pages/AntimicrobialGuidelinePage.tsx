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
import { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'
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
      {/* Standard Clinical Header */}
      <ModulePageHeader
        icon={ShieldCheck}
        title="National Antimicrobial Guidelines (NAG 2024)"
        description="National Antimicrobial Guideline 4th Edition (MOH) & Antimicrobial Stewardship (AMS) Portal Lawas Hospital"
        badges={[
          { label: syncMeta.edition, variant: 'neutral' },
          { label: '17 Adult (A1–A17) • 14 Paediatric (B1–B14)', variant: 'accent' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-border-default shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-text-muted" />
              <span>{showGuide ? 'Tutup Panduan' : 'Panduan Pengguna'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCalculator()}
              className="px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator Dos</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
              <span>Penyegerakan</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-text-muted" />
              <span>Cetak</span>
            </button>
          </div>
        }
      />

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
      <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  Polisi Antimicrobial Stewardship (AMS) Hospital Lawas
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                72-Hour Timeout mandatori bagi semua antibiotik spektrum luas (Broad-Spectrum). Rujuk pakar bagi antibiotik 'Access, Watch, Reserve (AWaRe)'.
              </p>
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
              className="lg:hidden px-4 py-2 bg-subtle hover:bg-subtle text-text-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-elevation-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Category List</span>
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
