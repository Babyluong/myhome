import React, { useState } from 'react'
import {
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Info,
  Syringe,
  FileText,
  AlertOctagon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Layers,
  Zap,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Stethoscope,
  HeartPulse
} from 'lucide-react'
import { ReconstitutionProtocol, DilutionProtocol } from '../types/formulariTypes'
import { getKkmDilutionProtocol, KkmDilutionMonograph } from '../data/kkmDilutionMasterDatabase'

interface DilutionCardProps {
  reconstitution?: ReconstitutionProtocol
  dilution?: DilutionProtocol
  drugName: string
  monograph?: KkmDilutionMonograph
}

interface ParsedRegimen {
  title: string
  items: string[]
  isSpecial?: boolean
}

function parseAdministrationRegimens(text: string): ParsedRegimen[] {
  if (!text) return []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const regimens: ParsedRegimen[] = []
  let current: ParsedRegimen = { title: '', items: [] }

  for (const line of lines) {
    const isHeading = /^(I\.|II\.|III\.|IV\.|V\.|Loading dose|Maintenance dose|Test dose|Total dose|IV bolus|IV infusion|Continuous infusion|Deep IM|IM|SC|Intermittent infusion)/i.test(line)

    if (isHeading) {
      if (current.title || current.items.length > 0) {
        regimens.push(current)
      }
      current = { title: line, items: [] }
    } else {
      if (!current.title) {
        current.title = 'Panduan & Tatacara Pemberian (Standard Administration)'
      }
      current.items.push(line)
    }
  }

  if (current.title || current.items.length > 0) {
    regimens.push(current)
  }

  return regimens
}

function formatHighlightedText(text: string): React.ReactNode {
  // Highlight common dosage units, rates, and durations
  const parts = text.split(/(\b\d+(?:\.\d+)?\s*(?:mg\/kg(?:\/hr)?|mg\/ml|mcg\/kg\/min|mg\/min|mmol\/L|mmol\/hr|mg|g|mcg|ml|l|hours?|mins?|minutes?|seconds?|days?)\b)/gi)
  
  return parts.map((part, i) => {
    if (/^\d+(?:\.\d+)?\s*(?:mg\/kg|mg\/ml|mcg\/kg|mg\/min|mmol|mg|g|mcg|ml|l|hours?|mins?|minutes?|seconds?|days?)/i.test(part.trim())) {
      return (
        <span key={i} className="font-extrabold text-teal-900 bg-teal-100/60 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5">
          {part}
        </span>
      )
    }
    return part
  })
}

export const DilutionCard: React.FC<DilutionCardProps> = ({
  reconstitution,
  dilution,
  drugName,
  monograph: propMonograph
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const [showReferences, setShowReferences] = useState(false)

  // Look up official KKM monograph
  const kkmMonograph = propMonograph || getKkmDilutionProtocol(drugName)

  const handleCopyProtocol = () => {
    if (!kkmMonograph) return
    const text = `[KKM IV DILUTION PROTOCOL] ${kkmMonograph.rawTitle}
Jenama KKM: ${kkmMonograph.brandText}
Rekonstitusi: ${kkmMonograph.reconstitutionText}
Pelarut (Diluent): ${kkmMonograph.diluentText}
Had Pelarutan: ${kkmMonograph.suggestedMinimumDilutions}
Arahan Pemberian:
${kkmMonograph.administrationText}
Kestabilan: ${kkmMonograph.stabilityRaw}
Peringatan: ${kkmMonograph.comments.join('; ')}`
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (!kkmMonograph && !reconstitution?.isApplicable && !dilution?.isApplicable) {
    return (
      <div className="p-8 bg-slate-50/80 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Droplets className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Tiada Protokol Pelarutan IV Khusus</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Ubat ini sedia untuk digunakan dalam bentuk dos asal atau tidak memerlukan pelarutan khas. Sila rujuk Risalah Sisipan Produk (Product Insert) pengeluar.
          </p>
        </div>
      </div>
    )
  }

  if (kkmMonograph) {
    const isLiquid = !kkmMonograph.isReconstitutionRequired
    const regimens = parseAdministrationRegimens(kkmMonograph.administrationText)

    // Check if suggested dilutions has peripheral vs central line distinctions
    const suggested = kkmMonograph.suggestedMinimumDilutions
    const hasCentral = /central/i.test(suggested)
    const hasPeripheral = /peripheral/i.test(suggested)

    return (
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden text-slate-900">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600" />

        {/* Card Header Section */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-black text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                {kkmMonograph.id}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900 bg-teal-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Rujukan Rasmi KKM 2024/2025</span>
              </span>
              {isLiquid ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Sediaan Cecair / Sedia Guna</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Syringe className="w-3 h-3 text-amber-600" />
                  <span>Rekonstitusi Serbuk Diperlukan</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {kkmMonograph.rawTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
              <span>Jenama Berdaftar KKM: <strong className="text-slate-800 font-bold">{kkmMonograph.brandText}</strong></span>
              {kkmMonograph.pageNumber && (
                <span className="text-slate-400">• Muka Surat Dokumen: {kkmMonograph.pageNumber}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleCopyProtocol}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Protokol'}</span>
            </button>
          </div>
        </div>

        {/* 4 Hero Clinical Metric Badges */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 border-b border-slate-100">
          {/* Metric 1: Reconstitution */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Syringe className="w-3.5 h-3.5 text-teal-600" />
              <span>1. Rekonstitusi</span>
            </div>
            <p className="text-xs font-extrabold text-slate-900 leading-snug">
              {kkmMonograph.isReconstitutionRequired ? kkmMonograph.reconstitutionText : 'Not required (Cecair Ampul Sedia Guna)'}
            </p>
          </div>

          {/* Metric 2: Compatible Diluents */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>2. Pelarut (Diluent)</span>
            </div>
            <p className="text-xs font-black text-teal-900 leading-snug">
              {kkmMonograph.diluentText}
            </p>
          </div>

          {/* Metric 3: Minimum Volume / Concentration */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Had Pelarutan Minimum</span>
            </div>
            <p className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2" title={kkmMonograph.suggestedMinimumDilutions}>
              {kkmMonograph.suggestedMinimumDilutions}
            </p>
          </div>

          {/* Metric 4: Stability */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>4. Kestabilan Suhu Bilik</span>
            </div>
            <p className="text-xs font-black text-slate-900 leading-snug">
              {kkmMonograph.stabilityRows && kkmMonograph.stabilityRows.length > 0
                ? `${kkmMonograph.stabilityRows[0].roomTemp} (Suhu Bilik)`
                : kkmMonograph.stabilityRaw}
            </p>
          </div>
        </div>

        {/* Body Content Sections */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Section A: Suggested Minimum Dilutions & Fluid Restriction Comparison */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Cadangan Pelarutan Minimum &amp; Sekatan Cecair (Suggested Minimum Dilutions):</span>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                {kkmMonograph.suggestedMinimumDilutions}
              </p>

              {/* Incompatibility Alerts if present */}
              {kkmMonograph.incompatibleDiluents && kkmMonograph.incompatibleDiluents.some(i => !i.startsWith('Jangan campur')) && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 font-medium space-y-1">
                  <span className="font-extrabold text-rose-950 uppercase tracking-wide block flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Larangan Keserasian Cecair (Incompatible Diluents):</span>
                  </span>
                  {kkmMonograph.incompatibleDiluents.filter(i => !i.startsWith('Jangan campur')).map((inc, i) => (
                    <p key={i} className="flex items-start gap-1.5 text-rose-800">
                      <span className="font-bold text-rose-600">✕</span>
                      <span>{inc}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section B: Structured Administration Regimens */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Tatacara &amp; Rejimen Pemberian Infusi (Administration Protocols):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regimens.map((reg, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-cyan-50/40 border border-cyan-200/80 shadow-2xs space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-extrabold text-cyan-950 leading-snug">
                        {reg.title}
                      </h4>
                    </div>

                    {reg.items.length > 0 && (
                      <div className="space-y-1.5 pl-7 text-xs text-slate-700 leading-relaxed font-medium">
                        {reg.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-1.5">
                            <span className="text-cyan-600 font-bold mt-0.5">•</span>
                            <p className="text-slate-800">{formatHighlightedText(item)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Stability Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Jadual Kestabilan &amp; Penyimpanan (Stability Table):</span>
            </div>

            {kkmMonograph.stabilityRows && kkmMonograph.stabilityRows.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-800">
                      <th className="p-3.5 font-extrabold w-2/5 border-r border-slate-200">Peringkat Penyediaan (Phase)</th>
                      <th className="p-3.5 font-extrabold w-3/10 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                          <span>Peti Sejuk (Fridge 2 – 8°C)</span>
                        </div>
                      </th>
                      <th className="p-3.5 font-extrabold w-3/10">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-600" />
                          <span>Suhu Bilik (RT &lt; 25°C)</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kkmMonograph.stabilityRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 border-r border-slate-100 bg-slate-50/50">
                          {row.phase}
                        </td>
                        <td className="p-3.5 text-slate-700 border-r border-slate-100 font-mono font-semibold">
                          {row.fridge}
                        </td>
                        <td className="p-3.5 text-slate-950 font-mono font-black">
                          {row.roomTemp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                {kkmMonograph.stabilityRaw}
              </div>
            )}
          </div>

          {/* Section D: Clinical Comments & Precaution Warnings */}
          {kkmMonograph.comments && kkmMonograph.comments.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Peringatan Klinikal &amp; Langkah Berjaga-jaga (Clinical Comments):</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-amber-950 font-medium">
                {kkmMonograph.comments.map((comment, i) => (
                  <li key={i} className="leading-relaxed">
                    {comment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section E: Collapsible References Footer */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Rujukan Rasmi KKM ({kkmMonograph.references?.length || 0})</span>
              {showReferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showReferences && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 font-medium">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Sumber &amp; Dokumen Rujukan Rasmi:
                </p>
                {kkmMonograph.references.map((ref, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {ref}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback for custom specialist protocols
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 text-xs">
      <div className="flex items-center gap-2 text-teal-800 font-bold">
        <Activity className="w-4 h-4 text-teal-600" />
        <span>Protokol Pelarutan Klinikal: {drugName}</span>
      </div>
      {dilution?.standardDilution && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <p><strong>Laluan:</strong> {dilution.standardDilution.route}</p>
          <p><strong>Pelarut:</strong> {dilution.compatibleDiluents.join(', ')}</p>
          <p><strong>Tempoh:</strong> {dilution.standardDilution.infusionDuration}</p>
        </div>
      )}
    </div>
  )
}

export default DilutionCard
