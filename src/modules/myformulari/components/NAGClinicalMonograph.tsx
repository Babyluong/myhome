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
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
          <Layers className="w-8 h-8 opacity-60" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-700">Pilih Garis Panduan Klinikal</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Sila pilih salah satu kategori sistem organ atau taip carian di menu sebelah kiri untuk melihat pelan rawatan terperinci.
          </p>
        </div>
      </div>
    )
  }

  const isPaediatric = guideline.targetPopulation === 'Paediatric' || guideline.targetPopulation === 'Neonatal'

  const handleCopyPrescription = () => {
    const textToCopy = `[NAG 2024 KKM] ${guideline.conditionName}
- Lini Pertama: ${guideline.firstLineTherapy.regimen}
- Dos & Cara Pemberian: ${guideline.firstLineTherapy.routeAndDose}
- Tempoh Rawatan: ${guideline.firstLineTherapy.durationDays}
- Pilihan Alahan Penisilin: ${guideline.penicillinAllergyOption?.regimen || 'Rujuk Pakar Perubatan / ID'}
- Pertukaran Oral (Oral Step-Down): ${guideline.oralStepDownOption?.regimen || 'Sesuai dengan kestabilan klinikal'}
(Rujukan: National Antimicrobial Guideline Malaysia 4th Edition 2024)`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6">
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
                <span>Pediatrik &amp; Neonat</span>
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Dewasa (Adult)</span>
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
              Tahap Bukti: <strong className="text-white">{guideline.evidenceLevel}</strong>
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
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Rejimen Disalin ke HIS!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Salin Preskripsi</span>
                </>
              )}
            </button>

            {/* Paeds Dose Calculator */}
            {isPaediatric && onOpenCalculator && (
              <button
                type="button"
                onClick={() => onOpenCalculator(guideline.firstLineDrugs?.[0])}
                className="px-4 py-2 bg-cyan-600/90 hover:bg-cyan-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border border-cyan-400/40 shadow-xs"
              >
                <Calculator className="w-4 h-4 text-cyan-200" />
                <span>Kira Dos (mg/kg)</span>
              </button>
            )}

            {/* Print Monograph */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/15"
            >
              <Printer className="w-4 h-4 opacity-80" />
              <span>Cetak</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                isBookmarked
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isBookmarked ? 'Ditanda Buku' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT MONOGRAPH */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Paediatric Weight Formula Callout */}
        {guideline.pediatricWeightDoseHint && (
          <div className="p-4 bg-cyan-50/90 border-2 border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-cyan-950">
              <div className="p-2.5 rounded-xl bg-cyan-200/70 text-cyan-900 flex-shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-cyan-950 uppercase tracking-wider text-[11px] block">
                  Formula Dos Berat Badan Pediatrik KKM (mg/kg):
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
                className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black text-xs shadow-2xs self-start sm:self-auto cursor-pointer flex items-center gap-1.5 flex-shrink-0"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Buka Kalkulator Dos</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Pathogens Bar */}
        <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center gap-2">
          <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mikroorganisma / Patogen Utama:</span>
          </span>
          {guideline.primaryPathogens.map((p, idx) => (
            <span
              key={idx}
              className="italic text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 font-semibold shadow-2xs"
            >
              {p}
            </span>
          ))}
        </div>

        {/* 3. THERAPY REGIMENS MATRIX */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span>Matriks Pelan Rawatan Antimikrobial (NAG 2024)</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* CARD 1: First Line */}
            <div className="p-5 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-emerald-600 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Rawatan Lini Pertama
                    </h4>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    1st-Line
                  </span>
                </div>

                <div className="text-base font-black text-emerald-950 leading-snug">
                  {guideline.firstLineTherapy.regimen}
                </div>

                <div className="text-xs text-emerald-950 leading-relaxed bg-white/90 p-3.5 rounded-2xl border border-emerald-200 font-medium space-y-1">
                  <strong className="text-emerald-950 block text-[11px] uppercase tracking-wider">
                    Dos &amp; Cara Pemberian:
                  </strong>
                  <span className="text-slate-800">{guideline.firstLineTherapy.routeAndDose}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Tempoh Rawatan: {guideline.firstLineTherapy.durationDays}</span>
                </div>
                {guideline.firstLineTherapy.remarks && (
                  <p className="text-[11px] text-emerald-800 italic leading-relaxed">
                    * {guideline.firstLineTherapy.remarks}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 2: Second Line */}
            <div className="p-5 rounded-3xl bg-blue-50/80 border-2 border-blue-300 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-600 text-white">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      Rawatan Lini Kedua
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-900">
                    Alternatif
                  </span>
                </div>

                <div className="text-base font-black text-blue-950 leading-snug">
                  {guideline.secondLineTherapy.regimen}
                </div>

                <div className="text-xs text-blue-950 leading-relaxed bg-white/90 p-3.5 rounded-2xl border border-blue-200 font-medium space-y-1">
                  <strong className="text-blue-950 block text-[11px] uppercase tracking-wider">
                    Dos &amp; Cara Pemberian:
                  </strong>
                  <span className="text-slate-800">{guideline.secondLineTherapy.routeAndDose}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-blue-200">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                  <Clock className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Tempoh Rawatan: {guideline.secondLineTherapy.durationDays}</span>
                </div>
                {guideline.secondLineTherapy.remarks && (
                  <p className="text-[11px] text-blue-800 italic leading-relaxed">
                    * {guideline.secondLineTherapy.remarks}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 3: Penicillin Allergy Option */}
            {guideline.penicillinAllergyOption ? (
              <div className="p-5 rounded-3xl bg-amber-50/80 border-2 border-amber-300 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-600 text-white">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                        Jika Alahan Penisilin
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      Amaran Keselamatan
                    </span>
                  </div>

                  <div className="text-base font-black text-amber-950 leading-snug">
                    {guideline.penicillinAllergyOption.regimen}
                  </div>

                  <div className="text-xs text-amber-950 leading-relaxed bg-white/90 p-3.5 rounded-2xl border border-amber-200 font-medium space-y-1">
                    <strong className="text-amber-950 block text-[11px] uppercase tracking-wider">
                      Dos &amp; Cara Pemberian:
                    </strong>
                    <span className="text-slate-800">{guideline.penicillinAllergyOption.routeAndDose}</span>
                  </div>
                </div>

                {guideline.penicillinAllergyOption.remarks && (
                  <div className="pt-3 border-t border-amber-200">
                    <p className="text-[11px] text-amber-900 italic leading-relaxed">
                      * {guideline.penicillinAllergyOption.remarks}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-600 flex flex-col items-center justify-center text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-800">Tiada Data Alahan Khusus</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Rujuk Pakar Perubatan / Pakar Penyakit Berjangkit (ID) bagi kes alahan penisilin teruk.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. ORAL STEP-DOWN PROTOCOL BANNER */}
        {guideline.oralStepDownOption && (
          <div className="p-5 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border-2 border-indigo-200 rounded-3xl text-xs space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-indigo-950 flex items-center gap-2 text-xs sm:text-sm">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Protokol Penukaran Rawatan Oral KKM (Oral Step-Down):</span>
              </span>
              <span className="text-[10px] bg-indigo-200 text-indigo-950 px-3 py-1 rounded-full font-black self-start sm:self-auto">
                Klinikal Stabil &amp; Afebrile &gt;24-48 Jam
              </span>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-indigo-100 space-y-1.5">
              <p className="text-indigo-950 font-black text-xs sm:text-sm">
                {guideline.oralStepDownOption.regimen}
              </p>
              <p className="text-indigo-900 text-[11px] leading-relaxed">
                <strong className="text-indigo-950">Kriteria Penukaran: </strong>
                {guideline.oralStepDownOption.criteria}
              </p>
            </div>
          </div>
        )}

        {/* 5. AMS STEWARDSHIP & RESTRICTIONS POLICY */}
        {guideline.amsNotes && guideline.amsNotes.length > 0 && (
          <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 text-xs text-slate-700 space-y-2.5">
            <h5 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Nota Kawalan Rintangan Antimikrob (AMS Policy KKM):</span>
            </h5>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700">
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
