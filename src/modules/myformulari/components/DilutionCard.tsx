import React, { useState } from 'react'
import { Droplets, CheckCircle2, AlertTriangle, Clock, Activity, ShieldCheck, BookOpen, Syringe, AlertOctagon, ChevronDown, ChevronUp, Thermometer, Layers, Copy, Check } from 'lucide-react'
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
        current.title = 'Standard Administration Guidelines & Protocols'
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
        <span key={i} className="font-semibold text-accent-base bg-accent-subtle/30 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5">
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
      <div className="p-8 bg-subtle/50 rounded-3xl border border-border-default text-center text-text-muted space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-subtle flex items-center justify-center mx-auto text-slate-400">
          <Droplets className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-text-primary text-sm">No Specific IV Dilution Protocol</h4>
          <p className="text-xs text-text-muted max-w-md mx-auto mt-1 leading-relaxed">
            This drug is ready to use in its original dosage form or does not require special dilution. Please refer to the manufacturer's Product Insert.
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
      <div className="w-full bg-surface rounded-2xl border border-border-default shadow-xs hover:border-white/20 transition-[transform,opacity,box-shadow,border-color] duration-150 overflow-hidden text-text-primary">
        {/* Top Accent Gradient Bar */}
        {/* Card Header Section */}
        <div className="p-5 sm:p-6 border-b border-border-default bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                {kkmMonograph.id}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Official MOH Reference 2024/2025</span>
              </span>
              {isLiquid ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Liquid Preparation / Ready-to-Use</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-400 dark:text-amber-300 font-bold bg-amber-500/10 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Syringe className="w-3 h-3 text-amber-600" />
                  <span>Powder Reconstitution Required</span>
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <span>IV Dilution &amp; Reconstitution Protocol:</span>
                <strong className="text-text-primary font-semibold">{drugName}</strong>
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                {kkmMonograph.rawTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted font-medium">
              <span>MOH Registered Brand: <strong className="text-text-primary font-bold">{kkmMonograph.brandText}</strong></span>
              {kkmMonograph.pageNumber && (
                <span className="text-slate-400">• Document Page: {kkmMonograph.pageNumber}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleCopyProtocol}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-subtle/50 border border-border-default text-text-secondary transition-colors flex items-center gap-1.5 shadow-elevation-1 cursor-pointer active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-text-muted" />}
              <span>{isCopied ? 'Copied!' : 'Copy Protocol'}</span>
            </button>
          </div>
        </div>

        {/* 4 Hero Clinical Metric Badges */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-subtle/30 border-b border-border-default">
          {/* Metric 1: Reconstitution */}
          <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              <Syringe className="w-3.5 h-3.5 text-teal-600" />
              <span>1. Reconstitution</span>
            </div>
            <p className="text-xs font-extrabold text-text-primary leading-snug">
              {kkmMonograph.isReconstitutionRequired ? kkmMonograph.reconstitutionText : 'Not required (Ready-to-use liquid ampoule)'}
            </p>
          </div>

          {/* Metric 2: Compatible Diluents */}
          <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>2. Compatible Diluent</span>
            </div>
            <p className="text-xs font-semibold text-text-primary leading-snug">
              {kkmMonograph.diluentText}
            </p>
          </div>

          {/* Metric 3: Minimum Volume / Concentration */}
          <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Minimum Dilution Volume</span>
            </div>
            <p className="text-xs font-extrabold text-text-primary leading-snug line-clamp-2" title={kkmMonograph.suggestedMinimumDilutions}>
              {kkmMonograph.suggestedMinimumDilutions}
            </p>
          </div>

          {/* Metric 4: Stability */}
          <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>4. Room Temperature Stability</span>
            </div>
            <p className="text-xs font-black text-text-primary leading-snug">
              {kkmMonograph.stabilityRows && kkmMonograph.stabilityRows.length > 0
                ? `${kkmMonograph.stabilityRows[0].roomTemp} (Room Temperature)`
                : kkmMonograph.stabilityRaw}
            </p>
          </div>
        </div>

        {/* Body Content Sections */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Section A: Suggested Minimum Dilutions & Fluid Restriction Comparison */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-text-primary">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Suggested Minimum Dilutions &amp; Fluid Restrictions:</span>
            </div>

            <div className="p-4.5 rounded-2xl bg-subtle/50 border border-border-default space-y-2">
              <p className="text-xs font-semibold text-text-primary leading-relaxed whitespace-pre-line">
                {kkmMonograph.suggestedMinimumDilutions}
              </p>

              {/* Incompatibility Alerts if present */}
              {kkmMonograph.incompatibleDiluents && kkmMonograph.incompatibleDiluents.some(i => !i.startsWith('Jangan campur')) && (
                <div className="mt-3 p-3.5 bg-rose-500/5 border border-rose-500/15 rounded-xl text-[11px] text-rose-300 font-medium space-y-1">
                  <span className="font-semibold text-rose-400 uppercase tracking-wide block flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Incompatible Diluents & Fluid Restrictions:</span>
                  </span>
                  {kkmMonograph.incompatibleDiluents.filter(i => !i.startsWith('Jangan campur')).map((inc, i) => (
                    <p key={i} className="flex items-start gap-1.5 text-rose-400">
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
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-text-primary">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Administration Protocols &amp; Infusion Regimens:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regimens.map((reg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-subtle/40 border border-border-default/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent-base/20 text-accent-base flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-text-primary leading-snug">
                        {reg.title}
                      </h4>
                    </div>

                    {reg.items.length > 0 && (
                      <div className="space-y-1.5 pl-7 text-xs text-text-secondary leading-relaxed font-medium">
                        {reg.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-1.5">
                            <span className="text-cyan-600 font-bold mt-0.5">•</span>
                            <p className="text-text-primary">{formatHighlightedText(item)}</p>
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
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-text-primary">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Stability &amp; Storage Schedule:</span>
            </div>

            {kkmMonograph.stabilityRows && kkmMonograph.stabilityRows.length > 0 ? (
              <div className="border border-border-default rounded-2xl overflow-hidden shadow-elevation-1 bg-surface">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-subtle border-b border-border-default text-text-primary">
                      <th className="p-3.5 font-extrabold w-2/5 border-r border-border-default">Preparation Stage (Phase)</th>
                      <th className="p-3.5 font-extrabold w-3/10 border-r border-border-default">
                        <div className="flex items-center gap-1.5">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                          <span>Refrigerator (Fridge 2 – 8°C)</span>
                        </div>
                      </th>
                      <th className="p-3.5 font-extrabold w-3/10">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-600" />
                          <span>Room Temperature (RT &lt; 25°C)</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kkmMonograph.stabilityRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-border-subtle last:border-b-0 hover:bg-subtle/50 transition-colors">
                        <td className="p-3.5 font-bold text-text-primary border-r border-border-subtle bg-subtle/50">
                          {row.phase}
                        </td>
                        <td className="p-3.5 text-text-secondary border-r border-border-subtle font-mono font-semibold">
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
              <div className="p-3.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary">
                {kkmMonograph.stabilityRaw}
              </div>
            )}
          </div>

          {/* Section D: Clinical Comments & Precaution Warnings */}
          {kkmMonograph.comments && kkmMonograph.comments.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 dark:text-amber-300 font-bold space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-400 dark:text-amber-300 font-bold uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Clinical Comments &amp; Precautions:</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-amber-400 dark:text-amber-300 font-bold font-medium">
                {kkmMonograph.comments.map((comment, i) => (
                  <li key={i} className="leading-relaxed">
                    {comment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section E: Collapsible References Footer */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Official MOH References ({kkmMonograph.references?.length || 0})</span>
              {showReferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showReferences && (
              <div className="mt-3 p-4 rounded-2xl bg-subtle/50 border border-border-default text-[11px] text-text-muted space-y-1 font-medium">
                <p className="font-bold text-text-secondary uppercase tracking-wider text-[10px] mb-1">
                  Official Source &amp; Reference Documents:
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

  // Fallback for custom specialist protocols (when no KKM monograph is matched, but drug has dilution or reconstitution)
  return (
    <div className="w-full bg-surface rounded-3xl border border-border-default shadow-sm overflow-hidden text-text-primary">
      <div className="p-6 sm:p-7 border-b border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100/90 text-teal-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Hospital / Product Dilution Protocol</span>
            </span>
            {reconstitution?.isApplicable && (
              <span className="text-[10px] font-bold text-amber-400 dark:text-amber-300 font-bold bg-amber-500/10 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Syringe className="w-3 h-3 text-amber-600" />
                <span>Reconstitution Required</span>
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
            {drugName}
          </h3>
          <p className="text-xs text-text-muted font-medium">
            Source: <strong className="text-text-primary">{dilution?.sourceGuideline || 'Product Insert / MOH Drug Formulary'}</strong>
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-subtle/50 border-b border-border-subtle">
        {/* Reconstitution */}
        <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            <Syringe className="w-3.5 h-3.5 text-teal-600" />
            <span>1. Reconstitution</span>
          </div>
          <p className="text-xs font-extrabold text-text-primary leading-snug">
            {reconstitution?.isApplicable
              ? `${reconstitution.preferredSolvent || 'WFI'} (${reconstitution.solventVolume || 'Ikut label'})`
              : 'Reconstitution not required'}
          </p>
        </div>

        {/* Diluents */}
        <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>2. Compatible Diluents</span>
          </div>
          <p className="text-xs font-black text-teal-900 leading-snug">
            {dilution?.compatibleDiluents?.join(', ') || 'Ready to use / Per package insert'}
          </p>
        </div>

        {/* Standard Volume */}
        <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. Volume &amp; Dosage Limits</span>
          </div>
          <p className="text-xs font-extrabold text-text-primary leading-snug">
            {dilution?.standardDilution?.volume || dilution?.standardDilution?.finalConcentration || 'No further dilution required'}
          </p>
        </div>

        {/* Route & Duration */}
        <div className="p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Route &amp; Duration</span>
          </div>
          <p className="text-xs font-black text-text-primary leading-snug">
            {dilution?.standardDilution?.route || 'IV'} {dilution?.standardDilution?.infusionDuration ? `• ${dilution.standardDilution.infusionDuration}` : ''}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {reconstitution?.stepByStepInstructions && reconstitution.stepByStepInstructions.length > 0 && (
          <div className="p-4.5 rounded-2xl bg-subtle/50 border border-border-default space-y-2">
            <span className="text-xs font-extrabold text-text-primary uppercase tracking-wider block">
              Reconstitution Instructions:
            </span>
            <ul className="space-y-1 pl-5 list-disc text-xs text-text-secondary font-medium">
              {reconstitution.stepByStepInstructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {dilution?.clinicalRemarks && dilution.clinicalRemarks.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 dark:text-amber-300 font-bold space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400 dark:text-amber-300 font-bold uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Clinical Comments:</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc font-medium">
              {dilution.clinicalRemarks.map((rem, i) => (
                <li key={i}>{rem}</li>
              ))}
            </ul>
          </div>
        )}

        {dilution?.monitoringParameters && dilution.monitoringParameters.length > 0 && (
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-xs text-cyan-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-900 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-cyan-700" />
              <span>Clinical Monitoring Parameters:</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc font-medium">
              {dilution.monitoringParameters.map((param, i) => (
                <li key={i}>{param}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default DilutionCard
