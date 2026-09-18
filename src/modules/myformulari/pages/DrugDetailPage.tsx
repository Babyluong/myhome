import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Flame,
  AlertTriangle,
  Droplets,
  Clock,
  ShieldCheck,
  TrendingDown,
  Layers,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Pill,
  Printer,
  Sparkles,
  ExternalLink,
  Lock,
  BookmarkCheck,
  Thermometer,
  Info,
  ChevronRight,
  AlertOctagon,
  Stethoscope,
  Building2,
  Syringe,
  Package,
  BookOpen,
  Calculator,
  Baby,
  Scale,
  RotateCcw,
  HeartPulse
} from 'lucide-react'
import { getDrugById, getAllFormulariDrugs } from '../services/formulariService'
import { getGuidelinesForDrug, getDrugRolesInGuideline, NAG_GUIDELINES } from '../data/antimicrobialData'
import { PrescriberBadge, HAMBadge, LASABadge, PoisonBadge, NAGBadge, PregnancyBadge, LactationBadge } from '../components/DrugBadge'
import { TallManLettering } from '../components/TallManLettering'
import { HamPrecautionsPanel } from '../components/HamPrecautionsPanel'
import { DilutionCard } from '../components/DilutionCard'
import { ShelfLifeWidget } from '../components/ShelfLifeWidget'
import { QuotaProgressBar } from '../components/QuotaProgressBar'
import { DrugInteractionModal } from '../components/DrugInteractionModal'
import { PaediatricDoseCalculatorModal } from '../components/PaediatricDoseCalculatorModal'
import { ArtemetherScheduleCalculator } from '../components/ArtemetherScheduleCalculator'
import { getKkmDilutionProtocol } from '../data/kkmDilutionMasterDatabase'

import { findBestFukkmMatch, synthesizeDrugEntryFromFacility } from '../services/fukkmMatcher'

export const DrugDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as {
    fromLawasFormulary?: boolean
    facilityDrug?: any
    fukkmMatch?: any
    backLabel?: string
    backPath?: string
  } | null
  const [activeTab, setActiveTab] = useState<'overview' | 'dosing' | 'pregnancy' | 'safety' | 'dilution' | 'shelflife' | 'antimicrobial' | 'alternatives'>('overview')
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [isPaediatricModalOpen, setIsPaediatricModalOpen] = useState(false)

  // Cockcroft-Gault CrCl Calculator State
  const [calcAge, setCalcAge] = useState<string>('')
  const [calcGender, setCalcGender] = useState<'MALE' | 'FEMALE'>('MALE')
  const [calcWeight, setCalcWeight] = useState<string>('')
  const [calcSerumCr, setCalcSerumCr] = useState<string>('')
  const [showCrClCalculator, setShowCrClCalculator] = useState(false)

  // Paediatric Quick Weight Estimator State
  const [paedWeight, setPaedWeight] = useState<string>('12')
  const [showPaedCalculator, setShowPaedCalculator] = useState(true)

  const allDrugs = getAllFormulariDrugs()

  // Resolve drug: 1. By ID in database, 2. From fukkmMatch state, 3. Matched from facilityDrug, 4. Synthesized
  let drug = id ? getDrugById(id) : undefined
  if (!drug && navState?.fukkmMatch) {
    drug = navState.fukkmMatch
  }
  if (!drug && navState?.facilityDrug) {
    drug = findBestFukkmMatch(navState.facilityDrug, allDrugs) || synthesizeDrugEntryFromFacility(navState.facilityDrug)
  }
  if (!drug && id) {
    const q = id.toLowerCase()
    drug = allDrugs.find(d => d.genericName.toLowerCase().includes(q) || (d.mohDrugCode && d.mohDrugCode.toLowerCase() === q))
  }

  // Calculate Cockcroft-Gault CrCl
  const calculateCrCl = (): { crcl: number; bracket: string; color: string } | null => {
    const age = parseFloat(calcAge)
    const weight = parseFloat(calcWeight)
    const scr = parseFloat(calcSerumCr)
    if (!age || !weight || !scr || age <= 0 || weight <= 0 || scr <= 0) return null

    // CrCl (mL/min) = [((140 - Age) * Weight_kg) / (0.814 * SerumCr_umol_L)] * (0.85 if Female)
    const raw = ((140 - age) * weight) / (0.814 * scr)
    const crcl = Math.round((calcGender === 'FEMALE' ? raw * 0.85 : raw) * 10) / 10

    let bracket = 'Normal Renal Function / Mild Impairment (CrCl > 50 mL/min)'
    let color = 'bg-emerald-50 text-emerald-800 border-emerald-200'
    if (crcl < 10) {
      bracket = 'End-Stage Renal Disease / ESRD (CrCl < 10 mL/min)'
      color = 'bg-rose-50 text-rose-900 border-rose-200'
    } else if (crcl < 30) {
      bracket = 'Severe Renal Impairment (CrCl 10 - 30 mL/min)'
      color = 'bg-orange-50 text-orange-900 border-orange-200'
    } else if (crcl <= 50) {
      bracket = 'Moderate Renal Impairment (CrCl 30 - 50 mL/min)'
      color = 'bg-amber-50 text-amber-900 border-amber-200'
    }

    return { crcl, bracket, color }
  }

  const crclResult = calculateCrCl()

  // Evaluate Paediatric Quick Dose & Weight Brackets
  const evaluatePaediatricDose = (weightStr: string, text: string) => {
    const wt = parseFloat(weightStr)
    if (!wt || wt <= 0 || !text) return null

    // Check weight bracket for Artemether/Lumefantrine & other antimalarials
    if (text.includes('5 hingga < 15 kg') || text.includes('15 hingga < 25 kg')) {
      if (wt < 5) {
        return {
          type: 'warning',
          title: 'KONTRAINDIKASI / Tidak Disyorkan (Berat < 5 kg)',
          detail: 'Keselamatan dan keberkesanan klinikal belum dibuktikan pada bayi bawah 5 kg.',
          badge: 'Berat < 5 kg',
          isWarning: true
        }
      } else if (wt < 15) {
        return {
          type: 'bracket',
          title: 'Dos Padanan: 1 Tablet Per Dos (Jumlah: 6 Tablet)',
          detail: 'Jadual 6-dos dalam 60 jam: Berikan pada jam 0, 8, 24, 36, 48, dan 60 bersama susu/makanan berlemak.',
          badge: '5 hingga < 15 kg',
          isWarning: false
        }
      } else if (wt < 25) {
        return {
          type: 'bracket',
          title: 'Dos Padanan: 2 Tablet Per Dos (Jumlah: 12 Tablet)',
          detail: 'Jadual 6-dos dalam 60 jam: Berikan pada jam 0, 8, 24, 36, 48, dan 60 bersama susu/makanan berlemak.',
          badge: '15 hingga < 25 kg',
          isWarning: false
        }
      } else if (wt < 35) {
        return {
          type: 'bracket',
          title: 'Dos Padanan: 3 Tablet Per Dos (Jumlah: 18 Tablet)',
          detail: 'Jadual 6-dos dalam 60 jam: Berikan pada jam 0, 8, 24, 36, 48, dan 60 bersama susu/makanan berlemak.',
          badge: '25 hingga < 35 kg',
          isWarning: false
        }
      } else {
        return {
          type: 'bracket',
          title: 'Dos Padanan: 4 Tablet Per Dos (Jumlah: 24 Tablet - Dos Dewasa Penuh)',
          detail: 'Jadual 6-dos dalam 60 jam: Berikan pada jam 0, 8, 24, 36, 48, dan 60 bersama susu/makanan berlemak.',
          badge: '≥ 35 kg / Dewasa',
          isWarning: false
        }
      }
    }

    // Check for mg/kg pattern
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:-|hingga|\s+to\s+)?\s*(\d+(?:\.\d+)?)?\s*mg\/kg/i)
    if (match) {
      const low = parseFloat(match[1])
      const high = match[2] ? parseFloat(match[2]) : low
      const isDaily = text.toLowerCase().includes('/hari') || text.toLowerCase().includes('/day')
      
      const calcLow = Math.round(wt * low * 10) / 10
      const calcHigh = Math.round(wt * high * 10) / 10
      
      return {
        type: 'mgPerKg',
        title: low === high ? `Dos Anggaran: ${calcLow} mg` : `Dos Anggaran: ${calcLow} - ${calcHigh} mg`,
        detail: isDaily ? `Berdasarkan formula ${low === high ? low : `${low}-${high}`} mg/kg/hari (Jumlah dos sehari dibahagikan mengikut kekerapan).` : `Berdasarkan formula ${low === high ? low : `${low}-${high}`} mg/kg/dos.`,
        badge: `${wt} kg x ${low === high ? low : `${low}-${high}`} mg/kg`,
        isWarning: false
      }
    }

    return {
      type: 'general',
      title: `Pesakit Pediatrik (${wt} kg)`,
      detail: 'Sila semak perincian protokol dos mg/kg atau peringkat umur di bawah.',
      badge: `${wt} kg`,
      isWarning: false
    }
  }

  if (!drug) {
    return (
      <div className="p-8 w-full max-w-2xl mx-auto text-center space-y-5 bg-white rounded-3xl border border-slate-200 shadow-sm mt-10">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Drug Not Found</h2>
          <p className="text-sm text-slate-500">
            Drug record ID <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">{id}</code> does not exist in the Hospital Formulary database.
          </p>
        </div>
        <button
          onClick={() => navigate('/formulari/dashboard')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          Back to Formulary List
        </button>
      </div>
    )
  }

  const kkmDilutionMono = drug ? (getKkmDilutionProtocol(drug.genericName) || (drug.brandNames?.length ? getKkmDilutionProtocol(drug.brandNames[0]) : undefined)) : undefined
  const hasDilutionTab = Boolean(kkmDilutionMono || drug?.dilution?.isApplicable || drug?.reconstitution?.isApplicable)

  const tabs = [
    { id: 'overview', label: 'Summary & Indications', icon: BookOpen },
    { id: 'dosing', label: 'Dosing & Administration', icon: Activity },
    { id: 'pregnancy', label: 'Pregnancy & Lactation', icon: HeartPulse, badge: drug.pregnancyAndLactation?.fdaCategory ? `Cat ${drug.pregnancyAndLactation.fdaCategory}` : undefined },
    { id: 'safety', label: 'Safety & Warnings', icon: ShieldCheck, badge: drug.isHAM ? 'HAM' : drug.isLASA ? 'LASA' : undefined },
    { id: 'dilution', label: 'IV Dilution & Reconstitution', icon: Droplets, disabled: !hasDilutionTab },
    { id: 'shelflife', label: 'Shelf Life & Storage', icon: Clock },
    { id: 'antimicrobial', label: 'NAG Guidelines (Antimicrobial)', icon: Stethoscope, disabled: !drug.antimicrobial?.isAntimicrobial },
    { id: 'alternatives', label: 'Alternative Drugs', icon: Layers, count: drug.alternativeDrugs?.length }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 max-w-full">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(navState?.backPath || '/formulari/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-violet-700 transition-colors text-xs font-bold w-fit group"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-violet-300 group-hover:bg-violet-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-violet-700" />
            </div>
            <span>{navState?.backLabel || 'Back to Formulary List (FUKKM)'}</span>
          </button>
          {navState?.fromLawasFormulary && navState.facilityDrug && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              (navState.facilityDrug.facility_stock ?? 0) <= 0
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : (navState.facilityDrug.facility_stock ?? 0) < 20
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Stok Fasiliti: {(navState.facilityDrug.facility_stock ?? 0) <= 0 ? 'NIL' : `${navState.facilityDrug.facility_stock} unit`}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://myformulary.pharmacy.gov.my/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open Official MOH MyFormulary Portal"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>MOH Portal</span>
          </a>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Monograph</span>
          </button>
          
          <button
            onClick={() => setIsInteractionModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Check Drug Interactions</span>
          </button>
        </div>
      </div>

      {/* Main Clinical Drug Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 absolute top-0 left-0"></div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Category & Governance Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <PrescriberBadge category={drug.prescriberCategory} size="md" />
              <PoisonBadge poison={drug.poisonCategory} />
              
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold border border-slate-200">
                Scheme: {drug.skimPerolehan}
              </span>

              {drug.pregnancyAndLactation && (
                <>
                  <PregnancyBadge
                    category={drug.pregnancyAndLactation.fdaCategory}
                    isContraindicated={drug.pregnancyAndLactation.isContraindicatedInPregnancy}
                  />
                  <LactationBadge
                    isContraindicated={drug.pregnancyAndLactation.isContraindicatedInLactation}
                  />
                </>
              )}

              {drug.neml === 'Y' && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>NEML (Essential Medicine)</span>
                </span>
              )}

              {drug.isHAM && (
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg font-bold border border-rose-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>High Alert ({drug.hamRiskLevel})</span>
                </span>
              )}

              {drug.isLASA && (
                <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>LASA (Sound-Alike/Look-Alike)</span>
                </span>
              )}

              {drug.antimicrobial?.isAntimicrobial && (
                <span className="text-xs bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg font-bold border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>NAG {drug.antimicrobial.nagRestrictionTier}</span>
                </span>
              )}
            </div>

            {/* Drug Title & Brands */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {drug.genericName}
              </h1>
              
              {drug.isLASA && drug.tallManName && (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-xs font-bold">
                  <span>MOH TALL-MAN Standard:</span>
                  <TallManLettering name={drug.tallManName} />
                </div>
              )}
              
              {drug.brandNames && drug.brandNames.length > 0 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                  <Pill className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>Brand / Trade Names: <strong className="text-slate-700 font-semibold">{drug.brandNames.join(' • ')}</strong></span>
                </div>
              )}
            </div>

            {/* Metadata Inset Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ATC Code</span>
                <span className="text-xs font-mono font-bold text-slate-800">{drug.atcCode}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MOH Drug Code (MDC)</span>
                <span className="text-xs font-mono font-bold text-slate-800 truncate block" title={drug.mohDrugCode}>
                  {drug.mohDrugCode || 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Therapeutic Class</span>
                <span className="text-xs font-semibold text-slate-800 truncate block" title={drug.therapeuticClass}>
                  {drug.therapeuticClass}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialist Prescriber Restriction Alert (If applicable) */}
        {drug.psxRestrictions && (
          <div className="mt-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <strong className="font-bold text-amber-950 block uppercase tracking-wider text-[11px]">
                Prescription Restrictions & Special Criteria (MOH FUKKM):
              </strong>
              <p className="leading-relaxed whitespace-pre-line font-medium text-amber-900">
                {drug.psxRestrictions}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto border border-slate-200 shadow-2xs">
        {tabs.map(tab => {
          if (tab.disabled) return null
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-md font-black">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW & INDICATIONS ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Approved Indications & Contraindications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approved Indications Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Approved Clinical Indications (FUKKM Ed. 4)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Registered therapeutic uses by Ministry of Health Malaysia</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                {drug.indications.map((ind, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800">{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraindications Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Contraindications
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Clinical conditions where this medication is strictly contraindicated</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {drug.contraindications.map((con, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 leading-relaxed font-medium text-rose-950">
                    <span className="w-5 h-5 rounded-lg bg-rose-200 text-rose-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✕
                    </span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulations & Strengths in Facility */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Dosage Forms & Strengths in Hospital / MOH Clinics
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Pharmaceutical preparation specifications</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Dosage Form</span>
                <strong className="text-sm text-slate-800 block">{drug.dosageForms.join(', ')}</strong>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Strengths</span>
                <strong className="text-sm text-slate-800 block">{drug.strengths.join(', ')}</strong>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Routes of Administration</span>
                <strong className="text-sm text-slate-800 block">{drug.administrationRoutes.join(', ')}</strong>
              </div>
            </div>
          </div>

          {/* Precautions & Adverse Drug Reactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Precautions & Warnings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Precautions & Warnings
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Clinical monitoring and patient safety alerts</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {drug.cautionsAndWarnings.map((warn, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-amber-900 leading-relaxed font-medium">
                    • {warn}
                  </div>
                ))}
              </div>
            </div>

            {/* Adverse Reactions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Adverse Drug Reactions
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Potential side effects and drug reactions</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {drug.sideEffects.map((side, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                    • {side}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DOSING & ADMINISTRATION ================= */}
      {activeTab === 'dosing' && (() => {
        const isArtemetherLumefantrine =
          (drug.genericName?.toLowerCase().includes('artemether') && drug.genericName?.toLowerCase().includes('lumefantrine')) ||
          drug.mohDrugCode?.includes('P01BE52') ||
          drug.atcCode === 'P01BE52' ||
          drug.id === 'DRUG-KKM-0115'

        const elderlyOrRenalVal = drug.standardDosage?.elderlyOrRenal || ''
        const hasSplitRenalElderly = elderlyOrRenalVal.includes('[PELARASAN GANGGUAN BUAH PINGGANG')
        let renalText = ''
        let elderlyText = ''
        if (hasSplitRenalElderly) {
          const parts = elderlyOrRenalVal.split('[WARGA EMAS & GANGGUAN HATI (GERIATRIC & HEPATIC)]:')
          renalText = parts[0].replace('[PELARASAN GANGGUAN BUAH PINGGANG (RENAL DOSING)]:', '').trim()
          elderlyText = (parts[1] || '').trim()
        } else {
          renalText = elderlyOrRenalVal
        }

        return (
          <div className="space-y-6">
            {/* Adult Dosing Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Adult Clinical Regimen
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Standard therapeutic regimen approved by MOH Drug Formulary</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-violet-50 text-violet-700 px-3 py-1 rounded-xl border border-violet-200/60 hidden sm:inline-block">
                  Route: {drug.administrationRoutes.join(', ') || 'Oral'}
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-violet-50/50 rounded-2xl border border-violet-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                {drug.standardDosage.adult}
              </div>
            </div>

            {/* Administration & Patient Intake Instructions Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Administration Guide & Patient Intake Instructions</span>
                      {isArtemetherLumefantrine && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-md font-bold uppercase">
                          Khas: Jadual 6-Dos STAT/8H/BD
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isArtemetherLumefantrine
                        ? 'Panduan penyerapan lemak/susu, protokol muntah, dan kalkulator interaktif selang masa dos (60 Jam)'
                        : 'Practical guidance for intake method, dosing times, and administration routes'}
                    </span>
                  </div>
                </div>

                {isArtemetherLumefantrine && (
                  <span className="text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80 px-3 py-1 rounded-xl">
                    6 Dos / 60 Jam (MOH Malaria Regimen)
                  </span>
                )}
              </div>

              {/* Special Artemether + Lumefantrine 6-Dose Scheduler & Administration Calculator */}
              {isArtemetherLumefantrine ? (
                <ArtemetherScheduleCalculator drugName={drug.genericName} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-900 block">Administration Method & Route:</span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {drug.administrationRoutes?.some(r => r.includes('Oral'))
                        ? 'Take with a full glass of water. May be taken with or after food to minimize stomach upset/nausea. Swallow whole without crushing if film-coated or modified release.'
                        : drug.administrationRoutes?.some(r => r.includes('Sublingual'))
                        ? 'Place under the tongue and allow to dissolve completely. Do not chew or swallow tablet.'
                        : drug.administrationRoutes?.some(r => r.includes('Topical'))
                        ? 'Apply a thin layer to affected skin areas after cleaning and drying. Wash hands before and after application.'
                        : drug.administrationRoutes?.some(r => r.includes('Ophthalmic'))
                        ? 'Instill into the conjunctival sac of the affected eye. Press the inner corner of the eye (nasolacrimal duct) for 1-2 minutes to reduce systemic absorption.'
                        : drug.administrationRoutes?.some(r => r.includes('Otic'))
                        ? 'Instill into the ear canal with the head tilted. Maintain position for 2-3 minutes.'
                        : drug.administrationRoutes?.some(r => r.includes('Nasal'))
                        ? 'Blow nose gently before use. Spray into nostril while breathing in gently according to proper nasal spray technique.'
                        : drug.administrationRoutes?.some(r => r.includes('Inhalation'))
                        ? 'Use according to proper inhaler device technique (MDI / DPI). Rinse mouth with water after inhaling corticosteroid medication.'
                        : drug.administrationRoutes?.some(r => r.includes('Transdermal'))
                        ? 'Apply to clean, dry, hairless skin. Rotate application sites periodically to prevent skin irritation.'
                        : drug.administrationRoutes?.some(r => r.includes('Rectal'))
                        ? 'Insert into rectum as directed. Lie on side for several minutes after insertion.'
                        : drug.administrationRoutes?.some(r => r.includes('Vaginal'))
                        ? 'Insert into vagina preferably at bedtime using a clean applicator or clean fingers.'
                        : drug.administrationRoutes?.some(r => r.includes('Intradermal') || r.includes('ID'))
                        ? 'Administer via strict Intradermal (ID) injection (0.1 mL per site into bilateral deltoid) using a 1 mL tuberculin/insulin syringe with 27G-30G needle, raising a visible wheal (peau d\'orange). NEVER inject into gluteal tissue.'
                        : drug.administrationRoutes?.some(r => r.includes('Subcutaneous'))
                        ? 'Inject subcutaneously (SC) at a 45-90 degree angle into abdomen, thigh, or upper arm. Rotate injection sites.'
                        : drug.administrationRoutes?.some(r => r.includes('Intramuscular'))
                        ? (drug.genericName?.toLowerCase().includes('rabies')
                            ? 'Inject deep intramuscularly (deep IM) into deltoid muscle (adults/children) or anterolateral thigh (infants). STRICTLY PROHIBITED IN GLUTEAL REGION (buttock) as gluteal adipose tissue severely reduces antibody seroconversion.'
                            : 'Inject deep intramuscularly (deep IM) into deltoid or anterolateral thigh muscle by trained healthcare personnel.')
                        : drug.administrationRoutes?.some(r => r.includes('IV') || r.includes('Intravenous') || r.includes('Infusion'))
                        ? 'Administer via slow IV bolus injection or continuous infusion. Refer to IV Dilution & Reconstitution tab for complete protocol.'
                        : 'Use in accordance with clinical administration techniques recommended by pharmacist / medical specialist.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-900 block">Dosing Schedule & Regularity:</span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Maintain evenly spaced intervals between doses (e.g. every 12 hours for twice-daily / BD dosing; every 8 hours for three-times-daily / TDS dosing). Do not double up doses if missed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Paediatric Dosing Card */}
            {drug.standardDosage.pediatric && (() => {
              const evaluated = evaluatePaediatricDose(paedWeight, drug.standardDosage.pediatric)
              const weightPresets = [
                { label: '3 bln', wt: '6' },
                { label: '6 bln', wt: '7.5' },
                { label: '1 thn', wt: '10' },
                { label: '2 thn', wt: '12' },
                { label: '5 thn', wt: '18' },
                { label: '7 thn', wt: '23' },
                { label: '10 thn', wt: '32' },
                { label: '12 thn', wt: '40' }
              ]

              return (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-200/80 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Baby className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span>Paediatric, Infant & Child Dosing</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                            MOH Protocols (Ed. 5)
                          </span>
                        </h3>
                        <span className="text-[11px] text-blue-600 font-medium">Standard Regimens, Weight Bands & Safety Protocols</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPaedCalculator(!showPaedCalculator)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{showPaedCalculator ? 'Tutup Pengira Berat' : 'Kira Dos Berat (mg/kg)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPaediatricModalOpen(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Kalkulator Sirap/Suspensi (mL)</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Quick Weight Dose Estimator */}
                  {showPaedCalculator && (
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                          <Scale className="w-4 h-4 text-blue-600" />
                          <span>Pengira Pantas Dos Berasaskan Berat Pesakit Kanak-kanak:</span>
                        </div>
                        <span className="text-[11px] text-blue-700 font-semibold">
                          Formula APLS: Weight = (Age + 4) x 2
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-4 flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Berat (kg):</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="0.5"
                            value={paedWeight}
                            onChange={e => setPaedWeight(e.target.value)}
                            placeholder="Contoh: 12"
                            className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Quick Age Weight Presets */}
                        <div className="sm:col-span-8 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Pilihan Cepat:</span>
                          {weightPresets.map(p => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setPaedWeight(p.wt)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                paedWeight === p.wt
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-white border border-blue-200 text-slate-700 hover:bg-blue-100/60'
                              }`}
                            >
                              {p.label} ({p.wt}kg)
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Evaluated Live Result Banner */}
                      {evaluated && (
                        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          evaluated.isWarning
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-white border-blue-200 text-slate-900 shadow-2xs'
                        }`}>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                {evaluated.badge}
                              </span>
                              <strong className="text-sm font-extrabold block text-blue-950">
                                {evaluated.title}
                              </strong>
                            </div>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                              {evaluated.detail}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsPaediatricModalOpen(true)}
                            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all shadow-2xs cursor-pointer"
                          >
                            Kira Isipadu Cecair (mL)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Monograph Text Display */}
                  <div className="p-4 sm:p-5 bg-blue-50/40 rounded-2xl border border-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {drug.standardDosage.pediatric}
                  </div>
                </div>
              )
            })()}

            {/* Renal Clearance & Dose Adjustment Card */}
            {renalText && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Renal Clearance & Dose Adjustment (Renal Dosing Tiers)
                      </h3>
                      <span className="text-[11px] text-amber-700 font-medium">Based on Creatinine Clearance (CrCl / eGFR mL/min) & Dialysis</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCrClCalculator(!showCrClCalculator)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs w-fit"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showCrClCalculator ? 'Close CrCl Calculator' : 'Cockcroft-Gault CrCl Calculator'}</span>
                  </button>
                </div>

                {/* Built-in Interactive Cockcroft-Gault CrCl Calculator */}
                {showCrClCalculator && (
                  <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-700" />
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                          Creatinine Clearance Calculator (Cockcroft-Gault Equation)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCalcAge('')
                          setCalcWeight('')
                          setCalcSerumCr('')
                        }}
                        className="text-[11px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 65"
                          value={calcAge}
                          onChange={e => setCalcAge(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Gender
                        </label>
                        <select
                          value={calcGender}
                          onChange={e => setCalcGender(e.target.value as 'MALE' | 'FEMALE')}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="MALE">Male (x 1.0)</option>
                          <option value="FEMALE">Female (x 0.85)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Body Weight (kg)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 60"
                          value={calcWeight}
                          onChange={e => setCalcWeight(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Serum Creatinine (µmol/L)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 150"
                          value={calcSerumCr}
                          onChange={e => setCalcSerumCr(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {crclResult && (
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${crclResult.color}`}>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                            Estimated Creatinine Clearance (eCrCl):
                          </span>
                          <span className="text-lg sm:text-xl font-extrabold block">
                            {crclResult.crcl} <span className="text-xs font-semibold">mL/min</span>
                          </span>
                        </div>
                        <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/80 border border-current">
                          {crclResult.bracket}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 sm:p-5 bg-amber-50/40 rounded-2xl border border-amber-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                  {renalText}
                </div>
              </div>
            )}

            {/* Geriatric & Hepatic Impairment Card */}
            {elderlyText && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Geriatric & Hepatic Impairment Guidelines
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Beers Criteria safety precautions & Child-Pugh Classification</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-orange-50/40 rounded-2xl border border-orange-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                  {elderlyText}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* ================= TAB 3: PREGNANCY & LACTATION ================= */}
      {activeTab === 'pregnancy' && (
        <div className="space-y-6">
          {/* Main Pregnancy & Lactation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pregnancy Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Pregnancy Safety
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">MOH Classification & Clinical Guidelines</span>
                  </div>
                </div>

                {drug.pregnancyAndLactation?.fdaCategory && (
                  <PregnancyBadge
                    category={drug.pregnancyAndLactation.fdaCategory}
                    isContraindicated={drug.pregnancyAndLactation.isContraindicatedInPregnancy}
                  />
                )}
              </div>

              {/* Definitive Verdict Banner */}
              {(() => {
                const status = drug.pregnancyAndLactation?.pregnancyStatus || (drug.pregnancyAndLactation?.isContraindicatedInPregnancy ? 'DILARANG' : 'WASPADA')
                const verdict = drug.pregnancyAndLactation?.pregnancyVerdict || (status === 'BOLEH' ? 'SAFE TO USE DURING PREGNANCY' : status === 'DILARANG' ? 'PROHIBITED / CONTRAINDICATED' : 'CONDITIONAL USE (BENEFITS > RISKS)')
                
                if (status === 'BOLEH') {
                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3 text-emerald-950">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-emerald-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-emerald-800 leading-relaxed">
                          Status: Safe to use according to recommended clinical dosing.
                        </p>
                      </div>
                    </div>
                  )
                } else if (status === 'DILARANG') {
                  return (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3 text-rose-950">
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-rose-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-rose-800 leading-relaxed">
                          Status: Hazardous / Teratogenic risk. Avoid use and prescribe safe alternatives.
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3 text-amber-950">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-amber-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-amber-800 leading-relaxed">
                          Status: Use only when no safer alternatives exist and clinical benefit outweighs risk.
                        </p>
                      </div>
                    </div>
                  )
                }
              })()}

              {/* Exact Clinical Reason */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Clinical Rationale for Use in Pregnancy:
                </span>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  {drug.pregnancyAndLactation?.pregnancyReason || drug.pregnancyAndLactation?.pregnancySummary}
                </p>
              </div>

              {/* Trimester 1 vs Trimester 2 & 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-1">
                  <span className="text-[10px] text-pink-700 font-bold uppercase tracking-wider block">
                    First Trimester (Weeks 1 - 12)
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {drug.pregnancyAndLactation?.trimester1}
                  </p>
                </div>

                <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-1">
                  <span className="text-[10px] text-pink-700 font-bold uppercase tracking-wider block">
                    2nd & 3rd Trimester (Weeks 13 - 40)
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {drug.pregnancyAndLactation?.trimester2_3}
                  </p>
                </div>
              </div>

              {/* Concrete Safe Alternatives */}
              {drug.pregnancyAndLactation?.safeAlternativesInPregnancy && drug.pregnancyAndLactation.safeAlternativesInPregnancy.length > 0 && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Safe Alternative Drugs in Pregnancy:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {drug.pregnancyAndLactation.safeAlternativesInPregnancy.map((alt, idx) => (
                      <span key={idx} className="text-xs font-bold bg-white text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lactation & Breastfeeding Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Lactation & Breastfeeding
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Milk Excretion & Infant Safety</span>
                  </div>
                </div>

                <LactationBadge
                  isContraindicated={drug.pregnancyAndLactation?.isContraindicatedInLactation}
                />
              </div>

              {/* Definitive Lactation Verdict Banner */}
              {(() => {
                const status = drug.pregnancyAndLactation?.lactationStatus || (drug.pregnancyAndLactation?.isContraindicatedInLactation ? 'DILARANG' : 'BOLEH')
                const verdict = drug.pregnancyAndLactation?.lactationVerdict || (status === 'BOLEH' ? 'SAFE IN BREASTFEEDING (COMPATIBLE)' : status === 'DILARANG' ? 'PROHIBITED IN BREASTFEEDING' : 'CAUTION & MONITOR INFANT')
                
                if (status === 'BOLEH') {
                  return (
                    <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-start gap-3 text-teal-950">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-teal-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-teal-800 leading-relaxed">
                          Status: Compatible with maternal breastfeeding.
                        </p>
                      </div>
                    </div>
                  )
                } else if (status === 'DILARANG') {
                  return (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3 text-rose-950">
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-rose-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-rose-800 leading-relaxed">
                          Status: Breastfeeding contraindicated. Use alternative feeding options per MOH guidelines.
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3 text-amber-950">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="text-sm font-black uppercase tracking-wide block text-amber-900">
                          {verdict}
                        </strong>
                        <p className="font-semibold text-amber-800 leading-relaxed">
                          Status: Administer dose immediately following breastfeeding and monitor infant closely.
                        </p>
                      </div>
                    </div>
                  )
                }
              })()}

              {/* Exact Lactation Reason */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Clinical Rationale for Breastfeeding:
                </span>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  {drug.pregnancyAndLactation?.lactationReason || drug.pregnancyAndLactation?.lactationSummary}
                </p>
              </div>

              {/* Infant Monitoring Advice */}
              <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-100 space-y-2 text-xs">
                <strong className="font-bold text-teal-950 block uppercase tracking-wider text-[10px]">
                  Infant Monitoring Guidance:
                </strong>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {drug.pregnancyAndLactation?.infantMonitoringAdvice || 'Monitor for signs of sedation, feeding pattern alterations, or difficulty waking.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SAFETY & INTERACTIONS ================= */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          {/* HAM Precautions Panel */}
          {drug.isHAM && drug.hamCategory && drug.hamRiskLevel && (
            <HamPrecautionsPanel
              hamCategory={drug.hamCategory}
              riskLevel={drug.hamRiskLevel}
              precautions={drug.hamPrecautions}
              drugName={drug.genericName}
            />
          )}

          {/* LASA Information */}
          {drug.isLASA && drug.lasaPairs && drug.lasaPairs.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Look-Alike Sound-Alike (LASA) Pairs at Risk of Confusion:
                </h3>
              </div>

              <div className="space-y-3">
                {drug.lasaPairs.map((pair, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-bold">This Drug: <TallManLettering name={pair.tallManThis} /></span>
                      <span className="text-slate-400 font-bold">CONFUSED WITH</span>
                      <span className="font-bold">Other Drug: <TallManLettering name={pair.tallManOther} /></span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Clinical Risk: </strong>{pair.clinicalRiskWarning}
                    </p>

                    <div className="text-xs text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <strong>Ward Separation Strategy: </strong>{pair.separationStrategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug-Drug Interactions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Key Drug Interactions ({drug.interactions.length}):
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Pharmacodynamic & pharmacokinetic interaction alerts</span>
              </div>
              <button
                onClick={() => setIsInteractionModalOpen(true)}
                className="px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                <span>+ Open Interaction Checker</span>
              </button>
            </div>

            <div className="space-y-3">
              {drug.interactions.map((inter, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-slate-900">Interaction with: {inter.interactingDrug}</strong>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      inter.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : inter.severity === 'MAJOR' ? 'bg-amber-600 text-white' : 'bg-slate-600 text-white'
                    }`}>
                      {inter.severity}
                    </span>
                  </div>
                  <p className="text-slate-700"><strong>Effect: </strong>{inter.effect}</p>
                  <p className="text-violet-900 bg-violet-50 p-2.5 rounded-xl border border-violet-100">
                    <strong>Management Action: </strong>{inter.management}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DILUTION PROTOCOL ================= */}
      {activeTab === 'dilution' && (
        <DilutionCard
          reconstitution={drug.reconstitution}
          dilution={drug.dilution}
          drugName={drug.genericName}
          monograph={kkmDilutionMono}
        />
      )}

      {/* ================= TAB 5: SHELF LIFE & STABILITY ================= */}
      {activeTab === 'shelflife' && (
        <ShelfLifeWidget shelfLife={drug.shelfLife} dosageForms={drug.dosageForms} />
      )}

      {/* ================= TAB 6: ANTIMICROBIAL (NAG 2024) ================= */}
      {activeTab === 'antimicrobial' && drug.antimicrobial && (() => {
        const relevantGuidelines = getGuidelinesForDrug(drug.genericName, drug.antimicrobial.antimicrobialClass)

        return (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    National Antimicrobial Guidelines (NAG 2024 4th Edition)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pharmacological Class: <strong className="text-slate-800">{drug.antimicrobial.antimicrobialClass}</strong>
                </p>
              </div>
              <NAGBadge tier={drug.antimicrobial.nagRestrictionTier} size="md" />
            </div>

            {/* CLINICAL INDICATION TREATMENT PLANS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>Clinical Treatment Plans by NAG 2024 Indication</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {relevantGuidelines.length} Recommended Indications
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Precise dosage regimens, duration of therapy, and evidence-based MOH oral step-down criteria
                  </p>
                </div>
              </div>

              {relevantGuidelines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      No Specific Syndromic Empiric Regimen in NAG 2024
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                      This medication (<strong className="text-slate-800">{drug.genericName}</strong>) is not listed as a routine syndromic empiric regimen in the National Antimicrobial Guidelines (NAG 2024 4th Edition). Use is subject to targeted therapy based on culture &amp; sensitivity (C&amp;S) results, specialized departmental protocols, or designated therapeutic reserves.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/formulari/nag-guidelines')}
                    className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Full MOH NAG 2024 Directory</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {relevantGuidelines.map((gl) => {
                    const rolesInGuideline = getDrugRolesInGuideline(drug.genericName, gl)

                    return (
                      <div key={gl.id} className="bg-slate-50/80 rounded-2xl border-2 border-slate-200/80 p-5 space-y-4 shadow-2xs">
                        {/* Header: Body system, Condition Name and Specific Drug Role Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {gl.targetPopulation && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  gl.targetPopulation === 'Paediatric' || gl.targetPopulation === 'Neonatal'
                                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {gl.targetPopulation === 'Paediatric' || gl.targetPopulation === 'Neonatal' ? '👶 Paediatric' : '👤 Adult'}
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                                {gl.bodySystem}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {gl.setting}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {gl.evidenceLevel}
                              </span>
                            </div>
                            <h5 className="text-sm sm:text-base font-black text-slate-900">
                              {gl.conditionName}
                            </h5>
                          </div>

                          {/* Drug Role Badges for this condition */}
                          {rolesInGuideline.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                              {rolesInGuideline.map((r, rIdx) => (
                                <span
                                  key={rIdx}
                                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-2xs ${r.badgeColor}`}
                                >
                                  {r.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* First Line & Second Line Regimens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs">
                          {/* First-line therapy */}
                          <div className="bg-emerald-50/70 border-2 border-emerald-200/80 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                ★ 1st-Line Therapy
                              </span>
                              <span className="font-bold text-emerald-900 text-[11px]">
                                Duration: {gl.firstLineTherapy.durationDays}
                              </span>
                            </div>
                            <div className="text-sm font-black text-emerald-950">
                              {gl.firstLineTherapy.regimen}
                            </div>
                            <p className="text-emerald-900 font-medium leading-relaxed bg-white/70 p-2 rounded border border-emerald-100">
                              <strong>Dose &amp; Administration: </strong>{gl.firstLineTherapy.routeAndDose}
                            </p>
                            {gl.firstLineTherapy.remarks && (
                              <p className="text-[11px] text-emerald-800 italic">
                                * {gl.firstLineTherapy.remarks}
                              </p>
                            )}
                          </div>

                          {/* Second-line */}
                          {gl.secondLineTherapy && (
                            <div className="bg-amber-50/60 border-2 border-amber-200/80 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-amber-600 text-white">
                                  2nd-Line Therapy
                                </span>
                                <span className="font-bold text-amber-900 text-[11px]">
                                  Duration: {gl.secondLineTherapy.durationDays}
                                </span>
                              </div>
                              <div className="text-sm font-black text-amber-950">
                                {gl.secondLineTherapy.regimen}
                              </div>
                              <p className="text-amber-900 font-medium leading-relaxed bg-white/70 p-2 rounded border border-amber-100">
                                <strong>Dose &amp; Administration: </strong>{gl.secondLineTherapy.routeAndDose}
                              </p>
                              {gl.secondLineTherapy.remarks && (
                                <p className="text-[11px] text-amber-800 italic">
                                * {gl.secondLineTherapy.remarks}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Penicillin Allergy Option if present */}
                        {gl.penicillinAllergyOption && (
                          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Penicillin Allergy Alternative:</span>
                            </div>
                            <p className="text-rose-950 font-bold">{gl.penicillinAllergyOption.regimen}</p>
                            <p className="text-rose-800 text-[11px]">{gl.penicillinAllergyOption.routeAndDose}</p>
                          </div>
                        )}

                        {/* Oral Step-Down Option (MOH AMS Step-down Protocol) */}
                        {gl.oralStepDownOption && (
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-950 flex items-center gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                MOH Oral Step-Down Protocol:
                              </span>
                              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                                Clinically Stable &amp; Afebrile
                              </span>
                            </div>
                            <p className="text-blue-950 font-black text-xs">
                              {gl.oralStepDownOption.regimen}
                            </p>
                            <p className="text-blue-800 text-[11px] leading-relaxed">
                              <strong>Step-Down Criteria: </strong>{gl.oralStepDownOption.criteria}
                            </p>
                          </div>
                        )}

                        {/* Pathogens & AMS Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                              Target Primary Pathogens:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {gl.primaryPathogens.map((pathogen, pIdx) => (
                                <span key={pIdx} className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                                  {pathogen}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                              Antimicrobial Stewardship (AMS) Notes:
                            </span>
                            <ul className="space-y-1 text-[11px] text-slate-600 font-medium">
                              {gl.amsNotes.map((note, nIdx) => (
                                <li key={nIdx}>• {note}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SPECTRUM & STEP-DOWN CRITERIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                  Main Spectrum of Activity:
                </h4>
                <ul className="space-y-1 text-xs text-emerald-800 font-medium">
                  {drug.antimicrobial.spectrumOfActivity?.map((sp, idx) => (
                    <li key={idx}>• {sp}</li>
                  )) || <li>• Appropriate according to culture sensitivity (C&S) testing</li>}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  IV to Oral Switch Criteria:
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 font-medium">
                  {drug.antimicrobial.ivToOralSwitchCriteria?.map((sw, idx) => (
                    <li key={idx}>• {sw}</li>
                  )) || <li>• Patient afebrile &gt; 24 hours & tolerating oral intake</li>}
                </ul>
              </div>
            </div>

            {/* Renal Dose Adjustment Table */}
            {drug.antimicrobial.renalDoseAdjustment && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Renal Dose Adjustment Schedule:
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Normal CrCl (&gt;50 mL/min)</th>
                        <th className="p-3">CrCl 30-50 mL/min</th>
                        <th className="p-3">CrCl 10-30 mL/min</th>
                        <th className="p-3">CrCl &lt; 10 mL/min</th>
                        <th className="p-3">Hemodialysis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{drug.antimicrobial.renalDoseAdjustment.normalCrCl}</td>
                        <td className="p-3 text-slate-700">{drug.antimicrobial.renalDoseAdjustment.crCl30_50}</td>
                        <td className="p-3 text-slate-700">{drug.antimicrobial.renalDoseAdjustment.crCl10_30}</td>
                        <td className="p-3 text-slate-700">{drug.antimicrobial.renalDoseAdjustment.crClLess10}</td>
                        <td className="p-3 text-indigo-700 font-semibold">{drug.antimicrobial.renalDoseAdjustment.hemodialysis}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {drug.antimicrobial.specialistApprovalRequired && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <strong>Specialist Approval Requirement: </strong>{drug.antimicrobial.specialistApprovalRequired}
              </div>
            )}
          </div>
        )
      })()}

      {/* ================= TAB 7: ALTERNATIVE THERAPIES ================= */}
      {activeTab === 'alternatives' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Therapeutic Alternatives & MOH Substitution Options ({drug.alternativeDrugs.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Secondary substitution choices during out-of-stock events, supply chain issues, or clinical resistance
              </p>
            </div>
            <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full">
              MOH Therapeutic Standard
            </span>
          </div>

          {drug.alternativeDrugs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No specific alternative drugs registered for this medication. Please consult a Clinical Pharmacist or Specialist.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drug.alternativeDrugs.map((alt, idx) => {
                const target = allDrugs.find(d => d.id === alt.drugId) || allDrugs.find(d => alt.drugName.toLowerCase().includes(d.genericName.toLowerCase()))
                
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (target) {
                        navigate(`/formulari/drug/${target.id}`)
                      }
                    }}
                    className="p-5 bg-slate-50/90 hover:bg-violet-50/50 rounded-2xl border border-slate-200/90 hover:border-violet-300 transition-all cursor-pointer space-y-3 group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors block">
                          {alt.drugName}
                        </strong>
                        <span className="inline-block mt-1 text-[11px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                          {alt.therapeuticEquivalence}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold shrink-0">
                        Cat {alt.prescriberCategory}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-medium">
                      <strong className="text-slate-900 font-semibold block mb-0.5">Clinical Rationale & Matching:</strong>
                      {alt.reasonForChoice}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Status: {alt.stockStatus}</span>
                      </div>
                      <span className="text-violet-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                        Open Monograph <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Interaction Modal */}
      <DrugInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        allDrugs={allDrugs}
        initialDrug={drug}
      />

      {/* Paediatric Full Dose Calculator Modal */}
      <PaediatricDoseCalculatorModal
        isOpen={isPaediatricModalOpen}
        onClose={() => setIsPaediatricModalOpen(false)}
        initialDrugName={drug.genericName}
      />
    </div>
  )
}

export default DrugDetailPage

