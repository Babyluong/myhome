import React from 'react'
import { ShieldAlert, Clock, Sparkles, Tag } from 'lucide-react'

interface FormulationLabellingTabProps {
  labelInstructions: string
  storageInstructions: string
  beyondUseDateDays: number
  containerSpecs: string
  itemName: string
  strength: string
  packType: string
  onChangeLabelInstructions: (val: string) => void
  onChangeStorageInstructions: (val: string) => void
  onChangeBudDays: (val: number) => void
  onChangeContainerSpecs: (val: string) => void
}

export const FormulationLabellingTab: React.FC<FormulationLabellingTabProps> = ({
  labelInstructions,
  storageInstructions,
  beyondUseDateDays,
  containerSpecs,
  itemName,
  strength,
  packType,
  onChangeLabelInstructions,
  onChangeStorageInstructions,
  onChangeBudDays,
  onChangeContainerSpecs
}) => {
  const isExternal = packType === 'external'
  const isInternal = packType === 'internal'

  const budPresets = [14, 30, 60, 90, 180]

  return (
    <div className="space-y-4 py-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input Form */}
        <div className="space-y-3.5">
          {/* Label Instructions */}
          <div>
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Label Instructions & Auxiliary Warnings</span>
            </label>
            <textarea
              rows={3}
              value={labelInstructions}
              onChange={(e) => onChangeLabelInstructions(e.target.value)}
              placeholder="e.g. FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN."
              className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors font-medium shadow-2xs resize-none"
            />
          </div>

          {/* Beyond-Use-Date (BUD) Days */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Beyond-Use-Date (BUD)</span>
              </label>
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                {beyondUseDateDays} Days
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                value={beyondUseDateDays}
                onChange={(e) => onChangeBudDays(parseInt(e.target.value) || 30)}
                className="w-28 px-3 py-1.5 text-xs font-mono font-bold bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
              <span className="text-xs text-text-muted">Days from compounding date</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-muted mr-1 font-medium">Quick presets:</span>
              {budPresets.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onChangeBudDays(days)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-all cursor-pointer active:scale-[0.98] ${
                    beyondUseDateDays === days
                      ? 'bg-teal-700 text-white font-bold shadow-2xs'
                      : 'bg-surface text-text-secondary border border-border-default hover:bg-subtle'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Storage Instructions */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1 block">
              Storage Condition Instructions
            </label>
            <input
              type="text"
              value={storageInstructions}
              onChange={(e) => onChangeStorageInstructions(e.target.value)}
              placeholder="e.g. Store below 25°C in a cool, dry place. Protect from light."
              className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
            />
          </div>

          {/* Container Specs */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1 block">
              Dispensing Container Specification
            </label>
            <input
              type="text"
              value={containerSpecs}
              onChange={(e) => onChangeContainerSpecs(e.target.value)}
              placeholder="e.g. Fluted Amber Glass Bottle or HDPE Dispensing Bottle"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Live Official MOH Dispensing Label Preview */}
        <div className="rounded-xl border border-border-default bg-subtle p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Hospital Label Studio Preview
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live Preview
              </span>
            </div>

            {/* Official Label Card */}
            <div className="p-3.5 rounded-lg border-2 border-dashed border-border-default bg-white text-neutral-900 shadow-sm font-sans space-y-2">
              <div className="text-center pb-2 border-b border-neutral-300">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                  HOSPITAL LAWAS
                </div>
                <div className="text-[9px] font-semibold text-neutral-600 uppercase">
                  JABATAN FARMASI & BEKALAN
                </div>
              </div>

              {/* Auxiliary Warning Header */}
              {isExternal ? (
                <div className="p-1 rounded bg-rose-600 text-white text-[10px] font-black uppercase text-center tracking-wider">
                  UBAT KEGUNAAN LUAR / FOR EXTERNAL USE ONLY
                </div>
              ) : isInternal ? (
                <div className="p-1 rounded bg-emerald-700 text-white text-[10px] font-black uppercase text-center tracking-wider">
                  UBAT MINUM / FOR ORAL USE ONLY
                </div>
              ) : null}

              {/* Drug Identification */}
              <div className="py-1 text-center">
                <div className="text-sm font-black text-neutral-950 leading-tight">
                  {itemName || 'Medication Name'}
                </div>
                {strength && (
                  <div className="text-xs font-mono font-bold text-neutral-800 mt-0.5">
                    {strength}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-[10px] font-semibold text-neutral-800 text-center leading-snug bg-neutral-100 p-1.5 rounded">
                {labelInstructions || 'STORE AS DIRECTED. KEEP OUT OF REACH OF CHILDREN.'}
              </div>

              {/* Production Metadata Footer */}
              <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 gap-1 text-[9px] text-neutral-600 font-mono">
                <div>
                  <span className="font-semibold text-neutral-800">TARIKH:</span> [AUTO DATE]
                </div>
                <div className="text-right">
                  <span className="font-semibold text-neutral-800">BUD:</span> {beyondUseDateDays} Hari
                </div>
                <div className="col-span-2 text-neutral-500 italic text-[8px] mt-0.5">
                  {storageInstructions || 'Simpan di bawah 25°C.'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              Complies with Ministry of Health Malaysia GPP Pharmacy Labelling Standards.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
