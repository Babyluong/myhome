import React, { useState } from 'react'
import {
  ShieldCheck,
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
  Printer,
  Bookmark,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { NAGInfectionGuideline } from '../types/formulariTypes'

interface NAGClinicalMonographProps {
  guideline: NAGInfectionGuideline | null
  onOpenCalculator?: (drugHint?: string) => void
}

export const NAGClinicalMonograph: React.FC<NAGClinicalMonographProps> = ({
  guideline,
  onOpenCalculator
}) => {
  const [copied, setCopied] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  if (!guideline) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-surface rounded-3xl border border-border-default text-center text-slate-400 space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-subtle/50 flex items-center justify-center text-slate-400 border border-border-subtle shadow-inner">
          <Layers className="w-8 h-8 opacity-60" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-secondary">Select Clinical Guideline</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Please select an organ system category or search in the menu on the left to view detailed treatment plans.
          </p>
        </div>
      </div>
    )
  }

  const isPaediatric = guideline.targetPopulation === 'Paediatric' || guideline.targetPopulation === 'Neonatal'

  const handleCopyPrescription = () => {
    const textToCopy = `[NAG 2024 KKM] ${guideline.conditionName}
- First-Line: ${guideline.firstLineTherapy.regimen}
- Dosage & Route: ${guideline.firstLineTherapy.routeAndDose}
- Treatment Duration: ${guideline.firstLineTherapy.durationDays}
- Penicillin Allergy Option: ${guideline.penicillinAllergyOption?.regimen || 'Refer to Physician / ID Specialist'}
- Oral Step-Down: ${guideline.oralStepDownOption?.regimen || 'Subject to clinical stability'}
(Rujukan: National Antimicrobial Guideline Malaysia 4th Edition 2024)`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="bg-surface rounded-3xl border border-border-default shadow-sm overflow-hidden space-y-6">
      {/* 1. OFFICIAL MONOGRAPH HEADER */}
      <div
        className={`p-6 sm:p-8 text-white relative overflow-hidden ${
          isPaediatric
            ? 'bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-950'
            : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Code */}
            {guideline.categoryCode && (
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono shadow-xs">
                {guideline.categoryCode}
              </span>
            )}

            {/* Population Badge */}
            {isPaediatric ? (
              <span className="text-[11px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5" />
                <span>Paediatric &amp; Neonatal</span>
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Adult</span>
              </span>
            )}

            {/* System Name */}
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-lg border border-white/10">
              {guideline.bodySystem}
            </span>

            {/* Setting */}
            <span className="text-[11px] font-bold bg-black/40 px-3 py-1 rounded-lg text-slate-200">
              {guideline.setting}
            </span>

            {/* Evidence Level */}
            <span className="text-[11px] font-bold bg-white/10 text-emerald-200 px-3 py-1 rounded-lg border border-white/15 ml-auto">
              Evidence Level: <strong className="text-white">{guideline.evidenceLevel}</strong>
            </span>
          </div>

          {/* Condition Title */}
          <div>
            {guideline.topic && (
              <div className="text-xs font-bold text-emerald-300/90 uppercase tracking-wider mb-1">
                {guideline.topic}
              </div>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
              {guideline.conditionName}
            </h2>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {/* Copy Regimen Button */}
            <button
              type="button"
              onClick={handleCopyPrescription}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-2 shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-surface text-text-primary hover:bg-subtle'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Regimen Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-text-muted" />
                  <span>Copy Prescription</span>
                </>
              )}
            </button>

            {/* Paeds Dose Calculator */}
            {isPaediatric && onOpenCalculator && (
              <button
                type="button"
                onClick={() => onOpenCalculator(guideline.firstLineDrugs?.[0])}
                className="px-4 py-2 bg-cyan-600/90 hover:bg-cyan-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-2 border border-cyan-400/40 shadow-xs"
              >
                <Calculator className="w-4 h-4 text-cyan-200" />
                <span>Calculate Dose (mg/kg)</span>
              </button>
            )}

            {/* Print Monograph */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white/10 hover:bg-surface/20 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-white/15"
            >
              <Printer className="w-4 h-4 opacity-80" />
              <span>Cetak</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isBookmarked
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                  : 'bg-white/10 hover:bg-surface/20 text-slate-200 border-white/15'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT MONOGRAPH */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Paediatric Weight Formula Callout */}
        {guideline.pediatricWeightDoseHint && (
          <div className="p-4 bg-surface border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3 text-cyan-950">
              <div className="p-2.5 rounded-xl bg-cyan-200/70 text-cyan-900 flex-shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-cyan-950 uppercase tracking-wider text-[11px] block">
                  MOH Paediatric Weight-Based Dosage Formula (mg/kg):
                </span>
                <span className="font-bold text-cyan-900 text-xs sm:text-sm">
                  {guideline.pediatricWeightDoseHint}
                </span>
              </div>
            </div>
            {onOpenCalculator && (
              <button
                type="button"
                onClick={() => onOpenCalculator(guideline.firstLineDrugs?.[0])}
                className="px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground rounded-xl font-bold text-xs shadow-xs self-start sm:self-auto cursor-pointer flex items-center gap-1.5 flex-shrink-0"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Open Dose Calculator</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Pathogens Bar */}
        <div className="text-xs text-text-secondary bg-subtle/50 p-4 rounded-2xl border border-border-default flex flex-wrap items-center gap-2">
          <span className="font-black text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Primary Microorganisms / Pathogens:</span>
          </span>
          {guideline.primaryPathogens.map((p, idx) => (
            <span
              key={idx}
              className="italic text-text-primary bg-surface px-3 py-1 rounded-lg border border-border-default font-semibold shadow-elevation-1"
            >
              {p}
            </span>
          ))}
        </div>

        {/* 3. THERAPY REGIMENS MATRIX */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
            <span>Antimicrobial Treatment Plan Matrix (NAG 2024)</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* CARD 1: First Line */}
            <div className="p-5 rounded-2xl bg-surface border border-emerald-500/30 dark:bg-slate-900/60 dark:border-emerald-500/30 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      First-Line Treatment
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    1st-Line
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                  {guideline.firstLineTherapy.regimen}
                </div>

                <div className="text-xs leading-relaxed bg-subtle dark:bg-slate-950/60 p-3.5 rounded-xl border border-border-default font-medium space-y-1">
                  <strong className="text-text-primary block text-[11px] uppercase tracking-wider font-semibold">
                    Dosage &amp; Route:
                  </strong>
                  <span className="text-text-secondary">{guideline.firstLineTherapy.routeAndDose}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Treatment Duration: {guideline.firstLineTherapy.durationDays}</span>
                </div>
                {guideline.firstLineTherapy.remarks && (
                  <p className="text-[11px] text-text-muted italic leading-relaxed">
                    * {guideline.firstLineTherapy.remarks}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 2: Second Line */}
            <div className="p-5 rounded-2xl bg-surface border border-sky-500/30 dark:bg-slate-900/60 dark:border-sky-500/30 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Second-Line Treatment
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Alternative
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                  {guideline.secondLineTherapy.regimen}
                </div>

                <div className="text-xs leading-relaxed bg-subtle dark:bg-slate-950/60 p-3.5 rounded-xl border border-border-default font-medium space-y-1">
                  <strong className="text-text-primary block text-[11px] uppercase tracking-wider font-semibold">
                    Dosage &amp; Route:
                  </strong>
                  <span className="text-text-secondary">{guideline.secondLineTherapy.routeAndDose}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Treatment Duration: {guideline.secondLineTherapy.durationDays}</span>
                </div>
                {guideline.secondLineTherapy.remarks && (
                  <p className="text-[11px] text-text-muted italic leading-relaxed">
                    * {guideline.secondLineTherapy.remarks}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 3: Penicillin Allergy Option */}
            {guideline.penicillinAllergyOption ? (
              <div className="p-5 rounded-2xl bg-surface border border-amber-500/30 dark:bg-slate-900/60 dark:border-amber-500/30 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        If Penicillin Allergy
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Safety Warning
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                    {guideline.penicillinAllergyOption.regimen}
                  </div>

                  <div className="text-xs leading-relaxed bg-subtle dark:bg-slate-950/60 p-3.5 rounded-xl border border-border-default font-medium space-y-1">
                    <strong className="text-text-primary block text-[11px] uppercase tracking-wider font-semibold">
                      Dosage &amp; Route:
                    </strong>
                    <span className="text-text-secondary">{guideline.penicillinAllergyOption.routeAndDose}</span>
                  </div>
                </div>

                {guideline.penicillinAllergyOption.remarks && (
                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-[11px] text-text-muted italic leading-relaxed">
                      * {guideline.penicillinAllergyOption.remarks}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-subtle/50 border-2 border-border-default text-xs text-text-muted flex flex-col items-center justify-center text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="font-bold text-text-primary">No Specific Allergy Data</p>
                  <p className="text-[11px] text-text-muted mt-1 max-w-xs">
                    Refer to Physician / Infectious Disease (ID) Specialist for severe penicillin allergy cases.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. ORAL STEP-DOWN PROTOCOL BANNER */}
        {guideline.oralStepDownOption && (
          <div className="p-5 bg-surface border border-border-default rounded-2xl text-xs space-y-2.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-text-primary flex items-center gap-2 text-xs sm:text-sm">
                <ArrowRightLeft className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>MOH Oral Step-Down Protocol:</span>
              </span>
              <span className="text-[10px] bg-indigo-200 text-indigo-400 dark:text-indigo-300 font-bold px-3 py-1 rounded-full font-black self-start sm:self-auto">
                Clinically Stable &amp; Afebrile &gt;24-48 Hours
              </span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-indigo-100 space-y-1.5">
              <p className="text-indigo-400 dark:text-indigo-300 font-bold font-black text-xs sm:text-sm">
                {guideline.oralStepDownOption.regimen}
              </p>
              <p className="text-indigo-400 dark:text-indigo-300 font-bold text-[11px] leading-relaxed">
                <strong className="text-indigo-400 dark:text-indigo-300 font-bold">Switch Criteria: </strong>
                {guideline.oralStepDownOption.criteria}
              </p>
            </div>
          </div>
        )}

        {/* 5. AMS STEWARDSHIP & RESTRICTIONS POLICY */}
        {guideline.amsNotes && guideline.amsNotes.length > 0 && (
          <div className="bg-subtle/50 p-5 sm:p-6 rounded-3xl border border-border-default text-xs text-text-secondary space-y-2.5">
            <h5 className="font-black text-text-primary uppercase tracking-wider flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Antimicrobial Stewardship Notes (MOH AMS Policy):</span>
            </h5>
            <ul className="space-y-1.5 list-disc list-inside text-text-secondary">
              {guideline.amsNotes.map((note, idx) => (
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
}

export default NAGClinicalMonograph
