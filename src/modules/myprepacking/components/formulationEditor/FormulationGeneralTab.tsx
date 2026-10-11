import React from 'react'
import {
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Pill,
  Package,
  Beaker,
  AlertCircle
} from 'lucide-react'
import type { DosageForm, PackageType, PackType } from '../../types/prepack'
import type { FacilityCatalogDrugOption } from '../../services/prepackService'

interface FormulationGeneralTabProps {
  formData: {
    item_code: string
    item_name: string
    generic_name: string
    pack_type: PackType
    dosage_form: DosageForm
    strength: string
    units_per_pack: number
    package_type: PackageType
    min_buffer_level: number
    optimal_batch_size: number
  }
  isUod: boolean
  isInternal: boolean
  isExternal: boolean
  isPrepack: boolean
  isPrepackTablet: boolean
  isPrepackLiquid: boolean
  isPrepackCream: boolean
  baseStrength: string
  unitQuantityDisplay: string
  selectedFacilityDrug: FacilityCatalogDrugOption | null
  onOpenPicker: () => void
  onClearSelectedDrug: () => void
  onDosageFormChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onFormDataChange: (patch: Record<string, any>) => void
  onUnitQuantityDisplayChange: (val: string) => void
  onPrepackPackSizeSelect: (size: number) => void
  onPrepackVolumeOrWeightSelect: (val: number) => void
  onUodUnitQuantitySelect: (fraction: string, val: number) => void
  onUodUnitQuantityInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStrengthChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormulationGeneralTab: React.FC<FormulationGeneralTabProps> = ({
  formData,
  isUod,
  isInternal,
  isExternal,
  isPrepack,
  isPrepackTablet,
  isPrepackLiquid,
  isPrepackCream,
  baseStrength,
  unitQuantityDisplay,
  selectedFacilityDrug,
  onOpenPicker,
  onClearSelectedDrug,
  onDosageFormChange,
  onFormDataChange,
  onUnitQuantityDisplayChange,
  onPrepackPackSizeSelect,
  onPrepackVolumeOrWeightSelect,
  onUodUnitQuantitySelect,
  onUodUnitQuantityInputChange,
  onStrengthChange
}) => {
  return (
    <div className="space-y-4 py-1">
      {/* Category Context Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-border-default">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isUod
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30'
                : isInternal
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : isExternal
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isUod
                  ? 'bg-teal-600'
                  : isInternal
                  ? 'bg-emerald-400'
                  : isExternal
                  ? 'bg-rose-400'
                  : 'bg-indigo-400'
              }`}
            />
            {isUod
              ? 'Category: Unit of Dose (UOD)'
              : isInternal
              ? 'Category: Internal Preparation (Oral)'
              : isExternal
              ? 'Category: External Preparation (Topical)'
              : 'Category: Bulk Prepack'}
          </span>
          <span className="text-xs text-text-muted">
            {isUod
              ? 'Single-dose sachet / ward unit-dose dispensing'
              : isInternal
              ? 'Oral liquid, syrup & extemporaneous preparation'
              : isExternal
              ? 'Topical cream, ointment & external application'
              : 'Bulk packaging for outpatient pharmacy dispensing'}
          </span>
        </div>
      </div>

      {/* Catalog Medication Source */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            MyInventory Medication Source
          </span>
          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Official Hospital Formulary Database
          </span>
        </div>

        {selectedFacilityDrug ? (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/25">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    {selectedFacilityDrug.drug_code}
                  </span>
                  <h4 className="text-xs font-bold text-text-primary truncate">
                    {selectedFacilityDrug.drug_name}
                  </h4>
                </div>
                <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-x-2">
                  {selectedFacilityDrug.generic_name && (
                    <span>Generic: <strong className="text-text-primary">{selectedFacilityDrug.generic_name}</strong></span>
                  )}
                  {baseStrength && (
                    <span>• Baseline: <strong className="font-mono text-text-primary">{baseStrength}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenPicker}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface text-teal-600 dark:text-teal-400 hover:bg-subtle border border-border-default transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Change Drug</span>
              </button>
              <button
                type="button"
                onClick={onClearSelectedDrug}
                title="Unlink medication"
                className="p-1 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-border-default bg-subtle flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">
                  Link Medication from MyInventory Catalog
                </h4>
                <p className="text-[11px] text-text-muted">
                  Auto-populate master item code, generic name, baseline dose, and dosage form.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPicker}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Medication Catalog</span>
            </button>
          </div>
        )}
      </div>

      {/* Core Identification Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Item Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.item_code}
            onChange={(e) => onFormDataChange({ item_code: e.target.value })}
            placeholder="e.g. EXT-GAEX-008"
            className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary font-mono font-bold placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Prepack Formulation Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.item_name}
            onChange={(e) => onFormDataChange({ item_name: e.target.value })}
            placeholder="e.g. Alcohol 70% Solution"
            className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary font-bold placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Generic Name
          </label>
          <input
            type="text"
            value={formData.generic_name}
            onChange={(e) => onFormDataChange({ generic_name: e.target.value })}
            placeholder="e.g. Ethanol / IMS 70% v/v"
            className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Dosage Form
          </label>
          <select
            value={formData.dosage_form}
            onChange={onDosageFormChange}
            className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
          >
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
            <option value="suspension">Suspension</option>
            <option value="cream">Cream</option>
            <option value="ointment">Ointment</option>
            <option value="drops">Drops</option>
            <option value="solution">Solution</option>
            <option value="powder">Powder</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Compounding Container Specification (Internal / External) */}
      {!isPrepack && !isUod ? (
        <div className="rounded-xl border border-border-default bg-subtle p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Compounding Formulation & Container Specification
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {formData.units_per_pack} {isInternal ? 'mL / bottle' : 'g / jar'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-surface border border-border-default rounded-xl p-3">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Formula Concentration / Strength
              </label>
              <input
                type="text"
                value={formData.strength}
                onChange={onStrengthChange}
                placeholder={isInternal ? 'e.g. 10 mg / 5 mL' : 'e.g. 70% v/v'}
                className="w-full text-xs font-bold font-mono text-text-primary bg-transparent border-b border-border-default focus:border-emerald-500 pb-1 focus:outline-none"
              />
              <p className="text-[10px] text-text-muted mt-2">Active concentration of compounding.</p>
            </div>

            <div className="bg-surface border border-border-default rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {isInternal ? 'Volume per Bottle' : 'Weight per Jar'}
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formData.units_per_pack} {isInternal ? 'mL' : 'g'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {(isInternal ? [60, 90, 100, 120] : [15, 30, 50, 100]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onPrepackVolumeOrWeightSelect(val)}
                    className={`py-1 text-xs font-bold rounded transition-all cursor-pointer active:scale-[0.98] ${
                      formData.units_per_pack === val
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-subtle text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {val}{isInternal ? 'mL' : 'g'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={unitQuantityDisplay}
                  onChange={(e) => onUnitQuantityDisplayChange(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-subtle border border-border-default rounded-lg px-2 py-1 text-text-primary focus:outline-none"
                />
                <span className="text-[10px] text-text-muted shrink-0 font-medium">{isInternal ? 'mL' : 'g'}</span>
              </div>
            </div>

            <div className="bg-surface border border-border-default rounded-xl p-3">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Compounding Container
              </label>
              <select
                value={formData.package_type}
                onChange={(e) => onFormDataChange({ package_type: e.target.value as PackageType })}
                className="w-full text-xs font-semibold bg-subtle border border-border-default rounded-lg px-2 py-1.5 text-text-primary focus:outline-none"
              >
                <option value="amber_bottle">Amber Glass Bottle (Light-Resistant)</option>
                <option value="clear_bottle">Clear Plastic Bottle</option>
                <option value="ointment_jar">Ointment Jar</option>
                <option value="other">Other Container</option>
              </select>
              <p className="text-[10px] text-text-muted mt-2">Hospital compounding packaging standard.</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Buffer Level & Batch Run Size */}
      <div className="p-3.5 rounded-xl bg-subtle/50 border border-border-default space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
          <AlertCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Buffer Stock Thresholds & Production Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Minimum Buffer Threshold (Min Buffer)
            </label>
            <input
              type="number"
              min="0"
              value={formData.min_buffer_level}
              onChange={(e) => onFormDataChange({ min_buffer_level: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Triggers a &ldquo;Prepack Required&rdquo; alert when finished stock falls below this level.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Optimal Batch Run Size
            </label>
            <input
              type="number"
              min="1"
              value={formData.optimal_batch_size}
              onChange={(e) => onFormDataChange({ optimal_batch_size: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Target packaging quantity recommended per production compounding session.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
