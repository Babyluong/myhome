import React, { useState, useMemo } from 'react'
import {
  Beaker,
  FileText,
  Printer,
  Edit2,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
  X,
  Thermometer,
  Layers,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Scale,
  Sparkles
} from 'lucide-react'
import type { PrepackItem } from '../types/prepack'
import { getGalenicalMonograph } from '../data/kkmGalenicalMasterDatabase'

interface GalenicalPreparationMonographModalProps {
  isOpen: boolean
  onClose: () => void
  item: PrepackItem | null
  onEditItem?: (item: PrepackItem) => void
  onStartBatch?: (item: PrepackItem) => void
}

type TabKey = 'all' | 'formula' | 'steps' | 'qc'

export const GalenicalPreparationMonographModal: React.FC<GalenicalPreparationMonographModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditItem,
  onStartBatch
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const monograph = useMemo(() => {
    if (!item) return null
    return getGalenicalMonograph(item)
  }, [item])

  if (!isOpen || !item || !monograph) return null

  const isInternal = monograph.pack_type === 'internal'
  const isDda = monograph.cautions_and_warnings.some(c => c.toLowerCase().includes('dda') || c.toLowerCase().includes('dadah berbahaya'))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      <div 
        className="relative w-full max-w-4xl bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monograph-title"
      >
        {/* Top Official Header Bar */}
        <div className="bg-canvas text-text-primary p-4 sm:p-5 border-b border-border-default print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 print:border-black print:text-black">
                  KKM GPP MONOGRAPH
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 print:text-black">
                  {monograph.item_code}
                </span>
                {isDda && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 print:border-black print:text-black">
                    DDA 1952 CONTROL
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  isInternal
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                } print:border-black print:text-black`}>
                  {isInternal ? 'Internal Preparation (Oral)' : 'External Preparation (Topical)'}
                </span>
              </div>

              <h2 id="monograph-title" className="text-lg sm:text-xl font-bold tracking-tight text-text-primary print:text-black">
                {monograph.item_name}
              </h2>

              <p className="text-xs text-text-muted print:text-neutral-700 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-text-secondary print:text-black">Generic:</span>
                <span>{monograph.generic_name}</span>
                <span className="text-text-muted print:hidden">•</span>
                <span className="italic text-text-muted print:text-neutral-600">Ref: {monograph.pharmacopoeia_ref}</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                title="Print Monograph / SOP"
                className="p-2 text-text-muted hover:text-text-primary bg-subtle hover:bg-surface rounded-lg border border-border-default transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="p-2 text-text-muted hover:text-text-primary bg-subtle hover:bg-surface rounded-lg border border-border-default transition-colors cursor-pointer active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Tab Navigation (Hidden in Print) */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border-subtle print:hidden overflow-x-auto">
            {[
              { id: 'all', label: 'All Information', icon: Layers },
              { id: 'formula', label: 'Formula & Ingredients', icon: FlaskConical },
              { id: 'steps', label: 'Compounding SOP Steps', icon: BookOpen },
              { id: 'qc', label: 'Quality Control & Labelling', icon: ShieldAlert }
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-[0.98] ${
                    active
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'text-text-muted hover:text-text-primary hover:bg-subtle'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-text-secondary print:overflow-visible print:p-0 print:space-y-4">
          
          {/* Section: Overview & Clinical Indicators */}
          {(activeTab === 'all' || activeTab === 'formula') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: Clinical Indications */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-subtle border border-border-default print:border-neutral-300">
                <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Hospital Clinical Indications</span>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {monograph.indications}
                </p>
                {monograph.ingredients_formula && (
                  <div className="mt-2 text-xs text-text-muted">
                    <span className="font-semibold text-text-secondary">Formula Summary:</span> {monograph.ingredients_formula}
                  </div>
                )}
              </div>

              {/* Card 2: BUD & Storage */}
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 print:border-neutral-300">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Stability & Beyond-Use Date (BUD)</span>
                </div>
                <div className="text-sm font-bold text-teal-800 dark:text-teal-200">
                  {monograph.beyond_use_date_days} Days (Beyond-Use Date)
                </div>
                <div className="mt-1 text-xs text-text-muted leading-relaxed">
                  {monograph.storage_instructions}
                </div>
              </div>
            </div>
          )}

          {/* Section: Master Formula Breakdown */}
          {(activeTab === 'all' || activeTab === 'formula') && (
            <div className="rounded-xl border border-border-default overflow-hidden bg-surface shadow-xs print:border-neutral-400">
              <div className="bg-subtle px-4 py-2.5 border-b border-border-default flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Official Master Formula Breakdown (KKM GPP)
                  </h3>
                </div>
                <span className="text-[11px] text-text-muted font-medium">
                  Standard Quantity / Per Batch
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-subtle/80 text-text-muted border-b border-border-default font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">No</th>
                      <th className="py-2.5 px-4">Pharmaceutical Ingredient (BP/USP Grade)</th>
                      <th className="py-2.5 px-4 w-36 font-mono text-right">Formula Quantity</th>
                      <th className="py-2.5 px-4 w-56">Role / Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-medium text-text-secondary">
                    {monograph.standard_formula_breakdown.map((ingredient, idx) => (
                      <tr key={idx} className="hover:bg-subtle/50 transition-colors">
                        <td className="py-2.5 px-4 text-center font-mono text-text-muted">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-text-primary">
                          {ingredient.name}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                          {ingredient.quantity}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-[11px]">
                          {ingredient.function || 'Pharmaceutical Excipient'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Equipment & Apparatus Required */}
          {(activeTab === 'all' || activeTab === 'steps') && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2.5">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Required Galenical Apparatus & Equipment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                {monograph.equipment_required.map((eq, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-surface p-2 rounded-lg border border-border-default">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Preparation Steps (SOP Pembancuhan) */}
          {(activeTab === 'all' || activeTab === 'steps') && (
            <div className="rounded-xl border border-border-default overflow-hidden bg-surface shadow-xs">
              <div className="bg-subtle px-4 py-2.5 border-b border-border-default flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Compounding Procedure (Official SOP)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  {monograph.preparation_steps.length} Step Procedure
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {monograph.preparation_steps.map((step, idx) => {
                  const stepText = step.replace(/^\d+\.\s*/, '')
                  return (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-xl bg-subtle border border-border-subtle text-xs text-text-secondary leading-relaxed"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 font-bold shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <div className="flex-1 font-medium">
                        {stepText}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section: In-Process Quality Control (IPC) & Safety Precautions */}
          {(activeTab === 'all' || activeTab === 'qc') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* IPC Tests */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>In-Process Quality Control (IPC)</span>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary">
                  {monograph.in_process_qc.map((qc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{qc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety & Warnings */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Safety Precautions & Special Warnings</span>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary">
                  {monograph.cautions_and_warnings.map((warn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Section: Packaging & Official Label Instructions */}
          {(activeTab === 'all' || activeTab === 'qc') && (
            <div className="p-4 rounded-xl bg-subtle border border-border-default space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Packaging & Official Label Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border-default">
                  <div className="text-[11px] font-semibold text-text-muted mb-1">
                    Primary Container Specification:
                  </div>
                  <div className="font-bold text-text-primary">
                    {monograph.container_specs}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border-default">
                  <div className="text-[11px] font-semibold text-text-muted mb-1">
                    Mandatory Label Advisory Text:
                  </div>
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {monograph.label_instructions}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Sign-off Box (Visible when printing) */}
          <div className="hidden print:block pt-6 border-t border-border-default text-xs">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="h-14 border-b border-black"></div>
                <div className="mt-1 font-bold">Compounded By (Assistant)</div>
                <div className="text-[10px]">Name, Designation & Date</div>
              </div>
              <div>
                <div className="h-14 border-b border-black"></div>
                <div className="mt-1 font-bold">Checked / Second Witness</div>
                <div className="text-[10px]">Name, Designation & Date</div>
              </div>
              <div>
                <div className="h-14 border-b border-black"></div>
                <div className="mt-1 font-bold">Approved by Pharmacist</div>
                <div className="text-[10px]">Official Stamp & Reg No.</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Hidden in Print) */}
        <div className="p-4 bg-canvas border-t border-border-default flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface text-text-secondary border border-border-default hover:bg-subtle transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Monograph / SOP</span>
            </button>

            {onEditItem && (
              <button
                type="button"
                onClick={() => onEditItem(item)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface text-text-secondary border border-border-default hover:bg-subtle transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Edit Formulation</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onStartBatch && (
              <button
                type="button"
                disabled={item.status !== 'active'}
                onClick={() => onStartBatch(item)}
                className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
                  item.status !== 'active'
                    ? 'bg-subtle text-text-muted cursor-not-allowed border border-border-default'
                    : 'bg-teal-700 hover:bg-teal-600 text-white shadow-xs'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Start Compounding Batch</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface hover:bg-subtle text-text-secondary border border-border-default transition-colors cursor-pointer active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalenicalPreparationMonographModal
