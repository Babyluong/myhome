import React, { useState } from 'react'
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  FileText,
  CheckCircle2,
  Baby,
  User,
  Calculator,
  Copy,
  Check,
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { NAGInfectionGuideline } from '../types/formulariTypes'

interface AntimicrobialTableProps {
  guidelines: NAGInfectionGuideline[]
  filterPopulation?: string
  filterSystem?: string
  filterTopic?: string
  filterSetting?: string
  onOpenCalculator?: (drugHint?: string) => void
}

export const AntimicrobialTable: React.FC<AntimicrobialTableProps> = ({
  guidelines,
  filterPopulation,
  filterSystem,
  filterTopic,
  filterSetting,
  onOpenCalculator
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return guidelines.filter(g => {
      if (filterPopulation && filterPopulation !== 'ALL' && filterPopulation !== 'All') {
        if (filterPopulation === 'Adult' && g.targetPopulation !== 'Adult' && g.targetPopulation !== 'All') return false
        if (filterPopulation === 'Paediatric' && g.targetPopulation !== 'Paediatric' && g.targetPopulation !== 'Neonatal' && g.targetPopulation !== 'All') return false
        if (filterPopulation === 'Neonatal' && g.targetPopulation !== 'Neonatal' && g.targetPopulation !== 'All') return false
      }
      if (filterSystem && filterSystem !== 'ALL') {
        const matchSys = g.bodySystem === filterSystem || g.categoryCode === filterSystem || (g.categoryTitle && g.categoryTitle.includes(filterSystem))
        if (!matchSys) return false
      }
      if (filterTopic && filterTopic !== 'ALL') {
        const stripChars = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
        const itemTopic = g.topic || ''
        const matchExact = itemTopic === filterTopic
        const matchNormalized = stripChars(itemTopic).includes(stripChars(filterTopic)) || stripChars(filterTopic).includes(stripChars(itemTopic))
        if (!matchExact && !matchNormalized) return false
      }
      if (filterSetting && filterSetting !== 'ALL' && g.setting !== filterSetting) return false
      return true
    })
  }, [guidelines, filterPopulation, filterSystem, filterTopic, filterSetting])

  const handleCopyPrescription = (item: NAGInfectionGuideline) => {
    const textToCopy = `[NAG 2024 KKM] ${item.conditionName}\n- First-Line: ${item.firstLineTherapy.regimen}\n- Dose: ${item.firstLineTherapy.routeAndDose}\n- Duration: ${item.firstLineTherapy.durationDays}\n- Penicillin Allergy: ${item.penicillinAllergyOption?.regimen || 'Refer to ID Specialist'}\n(Rujukan: National Antimicrobial Guideline Malaysia 4th Ed.)`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  if (filtered.length === 0) {
    return (
      <div className="p-12 text-center bg-surface rounded-3xl border border-border-default text-text-muted shadow-xs space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-base text-text-primary">Tiada Garis Panduan Ditemui</h4>
          <p className="text-xs text-text-muted mt-1 max-w-md mx-auto leading-relaxed">
            Please check your search keywords, or select another organ system category from the directory above.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {filtered.map(item => {
        const isPaediatric = item.targetPopulation === 'Paediatric' || item.targetPopulation === 'Neonatal'
        const isCopied = copiedId === item.id

        return (
          <div
            key={item.id}
            id={item.id}
            className="bg-surface rounded-3xl border border-border-default shadow-sm overflow-hidden hover:border-emerald-500/60 hover:shadow-md transition-colors duration-150"
          >
            {/* Top Clinical Header */}
            <div
              className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white ${
                isPaediatric
                  ? 'bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-950'
                  : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950'
              }`}
            >
              <div className="space-y-2">
                {/* Badges Ribbon */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Official Code */}
                  {item.categoryCode && (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono shadow-xs">
                      {item.categoryCode}
                    </span>
                  )}

                  {/* Population Badge */}
                  {isPaediatric ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      <span>Paediatric &amp; Neonatal</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Adult</span>
                    </span>
                  )}

                  {/* Body System */}
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-md border border-white/10">
                    {item.bodySystem}
                  </span>

                  {/* Topic Badge if exists */}
                  {item.topic && (
                    <span className="text-[10px] font-black bg-teal-300/20 text-teal-200 border border-teal-300/30 px-2.5 py-0.5 rounded-md">
                      {item.topic}
                    </span>
                  )}

                  {/* Setting */}
                  <span className="text-[10px] font-bold bg-black/40 px-2.5 py-0.5 rounded-md text-slate-200">
                    {item.setting}
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-black text-white leading-snug tracking-tight">
                  {item.conditionName}
                </h3>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center flex-shrink-0">
                {/* Copy Prescription */}
                <button
                  type="button"
                  onClick={() => handleCopyPrescription(item)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 hover:bg-surface/20 text-slate-100 border border-white/15'
                  }`}
                  title="Salin ringkasan preskripsi ke papan keratan"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 opacity-80" />
                      <span>Salin Rejimen</span>
                    </>
                  )}
                </button>

                {/* Paeds Dose Calc */}
                {isPaediatric && onOpenCalculator && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstDrug = item.firstLineDrugs?.[0] || 'amoxicillin'
                      onOpenCalculator(firstDrug)
                    }}
                    className="px-3 py-2 bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/40 text-cyan-100 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Kira Dos (mg/kg)</span>
                  </button>
                )}

                {/* Evidence Level Badge */}
                <span className="text-xs bg-white/15 text-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-white/20 flex items-center gap-1">
                  <span className="text-[10px] text-emerald-300 font-mono">Tahap Bukti:</span>
                  <span>{item.evidenceLevel}</span>
                </span>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-5 sm:p-7 space-y-5">
              {/* Paediatric Weight Dose Formula Highlight */}
              {item.pediatricWeightDoseHint && (
                <div className="p-4 bg-cyan-50/90 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-cyan-950">
                    <div className="p-2 rounded-xl bg-cyan-200/60 text-cyan-900 flex-shrink-0">
                      <Baby className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-cyan-950 uppercase tracking-wider text-[11px] block">
                        MOH Paediatric Weight-Based Dosage Formula:
                      </span>
                      <span className="font-bold text-cyan-900 text-xs">
                        {item.pediatricWeightDoseHint}
                      </span>
                    </div>
                  </div>
                  {onOpenCalculator && (
                    <button
                      type="button"
                      onClick={() => onOpenCalculator(item.firstLineDrugs?.[0])}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black text-xs shadow-elevation-1 self-start sm:self-auto cursor-pointer"
                    >
                      Buka Pengira Dos &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Primary Pathogens Bar */}
              <div className="text-xs text-text-secondary bg-subtle/50 p-3.5 rounded-2xl border border-border-default flex flex-wrap items-center gap-2">
                <span className="font-black text-text-primary uppercase tracking-wider text-[11px]">
                  Mikroorganisma / Patogen Utama:
                </span>
                {item.primaryPathogens.map((p, idx) => (
                  <span
                    key={idx}
                    className="italic text-text-primary bg-surface px-2.5 py-1 rounded-lg border border-border-default font-semibold shadow-elevation-1"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Clinical Regimens Grid (3 Cards) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. First Line Therapy */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-300/80 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-[11px] font-black text-emerald-400 dark:text-emerald-300 font-bold uppercase tracking-wider">
                          First-Line Treatment (1st-Line)
                        </h4>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-400 dark:text-emerald-300 font-bold">
                        Primary Choice
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-black text-emerald-400 dark:text-emerald-300 font-bold leading-snug">
                      {item.firstLineTherapy.regimen}
                    </div>

                    <div className="text-xs text-emerald-400 dark:text-emerald-300 font-bold leading-relaxed bg-surface p-3 rounded-xl border border-emerald-500/20 font-medium space-y-1">
                      <strong className="text-emerald-400 dark:text-emerald-300 font-bold block text-[11px] uppercase tracking-wider">
                        Dosage &amp; Route:
                      </strong>
                      <span className="text-text-primary">{item.firstLineTherapy.routeAndDose}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 dark:text-emerald-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span>Treatment Duration: {item.firstLineTherapy.durationDays}</span>
                    </div>
                    {item.firstLineTherapy.remarks && (
                      <p className="text-[11px] text-emerald-400 italic leading-relaxed">
                        * {item.firstLineTherapy.remarks}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Second Line Therapy */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border-2 border-blue-300/80 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <h4 className="text-[11px] font-black text-blue-400 dark:text-blue-300 font-bold uppercase tracking-wider">
                          Second-Line Treatment (Alternative)
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-400 dark:text-blue-300 font-bold">
                        Alternatif
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-black text-blue-400 dark:text-blue-300 font-bold leading-snug">
                      {item.secondLineTherapy.regimen}
                    </div>

                    <div className="text-xs text-blue-400 dark:text-blue-300 font-bold leading-relaxed bg-surface p-3 rounded-xl border border-blue-500/20 font-medium space-y-1">
                      <strong className="text-blue-400 dark:text-blue-300 font-bold block text-[11px] uppercase tracking-wider">
                        Dosage &amp; Route:
                      </strong>
                      <span className="text-text-primary">{item.secondLineTherapy.routeAndDose}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-blue-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 dark:text-blue-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                      <span>Treatment Duration: {item.secondLineTherapy.durationDays}</span>
                    </div>
                    {item.secondLineTherapy.remarks && (
                      <p className="text-[11px] text-blue-400 italic leading-relaxed">
                        * {item.secondLineTherapy.remarks}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Penicillin Allergy Safety Block */}
                {item.penicillinAllergyOption ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-300/80 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <h4 className="text-[11px] font-black text-amber-400 dark:text-amber-300 font-bold uppercase tracking-wider">
                            If Penicillin Allergy
                          </h4>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-400 dark:text-amber-300 font-bold">
                          Safety Warning
                        </span>
                      </div>

                      <div className="text-sm sm:text-base font-black text-amber-400 dark:text-amber-300 font-bold leading-snug">
                        {item.penicillinAllergyOption.regimen}
                      </div>

                      <div className="text-xs text-amber-400 dark:text-amber-300 font-bold leading-relaxed bg-surface p-3 rounded-xl border border-amber-500/20 font-medium space-y-1">
                        <strong className="text-amber-400 dark:text-amber-300 font-bold block text-[11px] uppercase tracking-wider">
                          Dosage &amp; Route:
                        </strong>
                        <span className="text-text-primary">{item.penicillinAllergyOption.routeAndDose}</span>
                      </div>
                    </div>

                    {item.penicillinAllergyOption.remarks && (
                      <div className="pt-2 border-t border-amber-500/20">
                        <p className="text-[11px] text-amber-400 dark:text-amber-300 font-bold italic leading-relaxed">
                          * {item.penicillinAllergyOption.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-2xl bg-subtle/50 border-2 border-border-default text-xs text-text-muted flex flex-col items-center justify-center text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                    <div>
                      <p className="font-bold text-text-primary">No Specific Allergy Data</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Refer to Physician / Infectious Disease (ID) Specialist for severe penicillin allergy cases.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Oral Step-Down Protocol Banner */}
              {item.oralStepDownOption && (
                <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border-2 border-indigo-500/20 rounded-2xl text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-black text-indigo-400 dark:text-indigo-300 font-bold flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                      <span>MOH Oral Step-Down Protocol:</span>
                    </span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-400 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full font-extrabold self-start sm:self-auto">
                      Clinically Stable &amp; Afebrile &gt;24-48 Hours
                    </span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-indigo-100">
                    <p className="text-indigo-400 dark:text-indigo-300 font-bold font-black text-xs sm:text-sm">
                      {item.oralStepDownOption.regimen}
                    </p>
                    <p className="text-indigo-400 dark:text-indigo-300 font-bold text-[11px] leading-relaxed mt-1">
                      <strong className="text-indigo-400 dark:text-indigo-300 font-bold">Switch Criteria: </strong>
                      {item.oralStepDownOption.criteria}
                    </p>
                  </div>
                </div>
              )}

              {/* AMS Antimicrobial Stewardship Notes */}
              {item.amsNotes && item.amsNotes.length > 0 && (
                <div className="bg-subtle/50 p-4 sm:p-5 rounded-2xl border border-border-default text-xs text-text-secondary space-y-2">
                  <h5 className="font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Antimicrobial Stewardship Notes (MOH AMS Policy):</span>
                  </h5>
                  <ul className="space-y-1.5 list-disc list-inside text-text-secondary">
                    {item.amsNotes.map((note, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AntimicrobialTable
