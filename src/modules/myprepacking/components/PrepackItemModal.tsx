import React, { useState, useEffect } from 'react'
import {
  Save,
  AlertCircle,
  Sparkles,
  Search,
  X,
  Loader2,
  CheckCircle2,
  Pill,
  RefreshCw,
  Package,
  Beaker
} from 'lucide-react'
import { Modal } from '@/components/ui'
import type { PrepackItem, PackType, DosageForm, PackageType, CatalogCategory } from '../types/prepack'
import {
  createPrepackItem,
  updatePrepackItem,
  normalizeDosageForm,
  mapPackageAndPackType,
  extractDrugStrength,
  calculateAdjustedStrength,
  parseUnitQuantity,
  formatUnitQuantityDisplay,
  FacilityCatalogDrugOption
} from '../services/prepackService'
import { PrepackDrugPickerModal } from './PrepackDrugPickerModal'
import { useToast } from '@/stores/toastStore'

interface PrepackItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (item: PrepackItem) => void
  itemToEdit?: PrepackItem | null
  defaultPackType?: PackType
  defaultCategory?: CatalogCategory
}

export const PrepackItemModal: React.FC<PrepackItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
  defaultPackType,
  defaultCategory
}) => {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    drug_id: null as string | null,
    item_code: '',
    item_name: '',
    generic_name: '',
    pack_type: (defaultPackType || (defaultCategory === 'prepack' ? 'prepack_tablet' : defaultCategory === 'internal' ? 'internal' : defaultCategory === 'external' ? 'external' : 'uod')) as PackType,
    dosage_form: 'tablet' as DosageForm,
    strength: '',
    units_per_pack: defaultCategory === 'prepack' ? 30 : 1,
    package_type: (defaultCategory === 'prepack' ? 'plastic_envelope' : 'sachet') as PackageType,
    min_buffer_level: defaultCategory === 'prepack' ? 30 : 50,
    optimal_batch_size: defaultCategory === 'prepack' ? 100 : 200,
    shelf_life_months: 6,
    storage_instructions: 'Store in a cool, dry place below 25°C.',
    label_instructions: 'KEEP OUT OF REACH OF CHILDREN'
  })

  // Mode indicators derived from formData
  const isUod = formData.pack_type === 'uod'
  const isInternal = formData.pack_type === 'internal'
  const isExternal = formData.pack_type === 'external'
  const isPrepack = !isUod && !isInternal && !isExternal

  const isPrepackTablet = isPrepack && (formData.dosage_form === 'tablet' || formData.dosage_form === 'capsule')
  const isPrepackLiquid = isPrepack && (formData.dosage_form === 'syrup' || formData.dosage_form === 'suspension' || formData.dosage_form === 'solution' || formData.dosage_form === 'drops')
  const isPrepackCream = isPrepack && (formData.dosage_form === 'cream' || formData.dosage_form === 'ointment')

  // Base dosage unscaled by unit quantity (e.g. "10 mg" or "500 mg")
  const [baseStrength, setBaseStrength] = useState<string>('')
  // Unit quantity display string (supports "1/2", "1/4", "1", "10", "20", "30")
  const [unitQuantityDisplay, setUnitQuantityDisplay] = useState<string>(defaultCategory === 'prepack' ? '30' : '1')

  // Selected drug from MyInventory catalog
  const [selectedFacilityDrug, setSelectedFacilityDrug] = useState<FacilityCatalogDrugOption | null>(null)

  useEffect(() => {
    if (itemToEdit) {
      const rawUnits = Number(itemToEdit.units_per_pack) || 1
      const rawStrength = itemToEdit.strength || ''
      const isItemUod = itemToEdit.pack_type === 'uod'

      // In UOD mode, infer base unscaled strength if fractional
      let inferredBase = rawStrength
      if (isItemUod && rawUnits !== 1 && rawStrength) {
        const backFactor = rawUnits > 0 ? (1 / rawUnits) : 1
        inferredBase = calculateAdjustedStrength(rawStrength, backFactor) || rawStrength
      }

      setBaseStrength(inferredBase || rawStrength)
      setUnitQuantityDisplay(isItemUod ? formatUnitQuantityDisplay(rawUnits) : String(rawUnits))

      setFormData({
        drug_id: itemToEdit.drug_id || null,
        item_code: itemToEdit.item_code || '',
        item_name: itemToEdit.item_name || '',
        generic_name: itemToEdit.generic_name || '',
        pack_type: itemToEdit.pack_type || 'prepack_tablet',
        dosage_form: (itemToEdit.dosage_form as DosageForm) || 'tablet',
        strength: rawStrength,
        units_per_pack: rawUnits,
        package_type: (itemToEdit.package_type as PackageType) || 'plastic_envelope',
        min_buffer_level: itemToEdit.min_buffer_level || 30,
        optimal_batch_size: itemToEdit.optimal_batch_size || 100,
        shelf_life_months: itemToEdit.shelf_life_months || 6,
        storage_instructions: itemToEdit.storage_instructions || 'Store in a cool, dry place below 25°C.',
        label_instructions: itemToEdit.label_instructions || 'KEEP OUT OF REACH OF CHILDREN'
      })
      setSelectedFacilityDrug(null)
    } else {
      let initialType: PackType = defaultPackType || 'prepack_tablet'
      if (defaultCategory === 'internal') initialType = 'internal'
      else if (defaultCategory === 'external') initialType = 'external'
      else if (defaultCategory === 'uod') initialType = 'uod'
      else if (defaultCategory === 'prepack') initialType = 'prepack_tablet'

      let pkg: PackageType = 'plastic_envelope'
      let units = 30
      let dosage: DosageForm = 'tablet'
      let buffer = 30
      let batchSize = 100
      let storage = 'Store in a cool, dry place below 25°C.'
      let label = 'KEEP OUT OF REACH OF CHILDREN'
      let shelfLife = 6

      if (initialType === 'uod') {
        pkg = 'sachet'
        units = 1
        dosage = 'tablet'
        buffer = 50
        batchSize = 200
      } else if (initialType === 'internal') {
        pkg = 'amber_bottle'
        units = 60
        dosage = 'syrup'
        buffer = 20
        batchSize = 50
        shelfLife = 3
        storage = 'Store in a cool, dry place below 25°C. Protect from light.'
        label = 'FOR INTERNAL USE ONLY. SHAKE WELL BEFORE USE.'
      } else if (initialType === 'external') {
        pkg = 'ointment_jar'
        units = 15
        dosage = 'cream'
        buffer = 20
        batchSize = 50
        shelfLife = 6
        storage = 'Store below 25°C. Avoid direct heat.'
        label = 'FOR EXTERNAL USE ONLY / NOT TO BE TAKEN.'
      } else if (initialType === 'prepack_liquid') {
        pkg = 'amber_bottle'
        units = 60
        dosage = 'syrup'
        buffer = 20
        batchSize = 50
      } else if (initialType === 'prepack_tablet') {
        pkg = 'plastic_envelope'
        units = 30
        dosage = 'tablet'
        buffer = 30
        batchSize = 100
      } else if (initialType === 'prepack_cream') {
        pkg = 'ointment_jar'
        units = 15
        dosage = 'cream'
        buffer = 20
        batchSize = 50
      } else if (initialType === 'extemporaneous') {
        pkg = 'amber_bottle'
        units = 1
        dosage = 'solution'
        buffer = 10
        batchSize = 20
      }

      setBaseStrength('')
      setUnitQuantityDisplay(initialType === 'uod' ? formatUnitQuantityDisplay(units) : String(units))
      setFormData({
        drug_id: null,
        item_code: '',
        item_name: '',
        generic_name: '',
        pack_type: initialType,
        dosage_form: dosage,
        strength: '',
        units_per_pack: units,
        package_type: pkg,
        min_buffer_level: buffer,
        optimal_batch_size: batchSize,
        shelf_life_months: shelfLife,
        storage_instructions: storage,
        label_instructions: label
      })
      setSelectedFacilityDrug(null)
    }
  }, [itemToEdit, isOpen, defaultPackType, defaultCategory])

  // Handle selecting a drug from MyInventory catalog modal
  const handleSelectDrug = (drug: FacilityCatalogDrugOption) => {
    setSelectedFacilityDrug(drug)

    const normDosage = normalizeDosageForm(drug.dosage_form)
    const isTargetUod = formData.pack_type === 'uod' || defaultCategory === 'uod'
    const isTargetInternal = formData.pack_type === 'internal' || defaultCategory === 'internal'
    const isTargetExternal = formData.pack_type === 'external' || defaultCategory === 'external'
    const isTargetPrepack = !isTargetUod && !isTargetInternal && !isTargetExternal

    const mapped = mapPackageAndPackType(normDosage, isTargetUod ? 'uod' : isTargetInternal ? 'internal' : isTargetExternal ? 'external' : 'prepack')

    // 1. Maintain EXACT original item code from catalog / MyInventory without altering
    const originalDrugCode = drug.drug_code?.trim() || ''

    // 2. Format display item name
    let formattedName = drug.drug_name
    let currentUnits = formData.units_per_pack || (isTargetPrepack ? 30 : 1)
    if (isTargetPrepack && currentUnits < 1) currentUnits = 30

    if (isTargetUod) {
      if (!formattedName.toLowerCase().includes('uod')) {
        formattedName = `${formattedName} (UOD)`
      }
    } else if (isTargetPrepack && (normDosage === 'tablet' || normDosage === 'capsule')) {
      // Suggest standard pack of (Pack 10s / 30s) if not already indicated
      if (!formattedName.toLowerCase().includes('pack ') && !formattedName.toLowerCase().includes('pek ')) {
        formattedName = `${formattedName} (Pack ${currentUnits}s)`
      }
    }

    // 3. Auto-detect original base dose
    const detectedBaseDose = (drug.strength?.trim()) || extractDrugStrength(drug.drug_name || drug.generic_name) || ''
    setBaseStrength(detectedBaseDose)

    // In UOD: adjust strength by fraction (e.g. 10 mg * 0.5 = 5 mg)
    // In Prepack: strength remains the tablet's active dose (e.g. 500 mg), NOT multiplied by pack size!
    const activeStrength = isTargetUod
      ? (detectedBaseDose ? calculateAdjustedStrength(detectedBaseDose, currentUnits) : (formData.strength || ''))
      : (detectedBaseDose || formData.strength || '')

    // 4. Strict category isolation: lock strictly to current category menu
    let targetPackType = formData.pack_type
    let targetPackageType = formData.package_type
    if (isTargetUod) {
      targetPackType = 'uod'
      targetPackageType = 'sachet'
    } else if (isTargetInternal) {
      targetPackType = 'internal'
      targetPackageType = 'amber_bottle'
    } else if (isTargetExternal) {
      targetPackType = 'external'
      targetPackageType = (normDosage === 'cream' || normDosage === 'ointment') ? 'ointment_jar' : 'clear_bottle'
    } else {
      targetPackType = mapped.pack_type
      targetPackageType = mapped.package_type
    }

    // Auto-detect cold chain for background state
    let labelWarn = formData.label_instructions || 'KEEP OUT OF REACH OF CHILDREN'
    const storageText = drug.storage_conditions || 'Store in a cool, dry place below 25°C.'
    if (
      storageText.toLowerCase().includes('2-8') ||
      storageText.toLowerCase().includes('chiller') ||
      storageText.toLowerCase().includes('sejuk') ||
      storageText.toLowerCase().includes('cold') ||
      storageText.toLowerCase().includes('refrigerat')
    ) {
      if (!labelWarn.includes('REFRIGERAT') && !labelWarn.includes('PETI SEJUK')) {
        labelWarn = `${labelWarn} • STORE IN REFRIGERATOR (2-8°C)`
      }
    }

    setFormData(prev => ({
      ...prev,
      drug_id: drug.id,
      item_name: formattedName,
      item_code: originalDrugCode || prev.item_code,
      generic_name: drug.generic_name || prev.generic_name,
      strength: activeStrength,
      dosage_form: normDosage,
      pack_type: targetPackType,
      package_type: targetPackageType,
      units_per_pack: currentUnits,
      min_buffer_level: drug.min_buffer_level || prev.min_buffer_level,
      optimal_batch_size: isTargetUod ? 200 : (targetPackType === 'prepack_liquid' ? 50 : 100),
      storage_instructions: storageText,
      label_instructions: labelWarn
    }))

    setUnitQuantityDisplay(isTargetUod ? formatUnitQuantityDisplay(currentUnits) : String(currentUnits))
    toast.success(`Medication "${drug.drug_name}" linked from catalog successfully!`)
  }

  const handleClearSelectedDrug = () => {
    setSelectedFacilityDrug(null)
    setFormData(prev => ({ ...prev, drug_id: null }))
  }

  // Prepack Solid Oral Pack Size Selection (Pack 10s, 20s, 30s, 40s, 50s, 60s, 100s)
  const handlePrepackPackSizeSelect = (packSize: number) => {
    setUnitQuantityDisplay(String(packSize))
    setFormData(prev => {
      let nextName = prev.item_name
      // If item_name already ends with (Pack Xs) or (Pek Xs), update it seamlessly
      if (/\((?:Pack|Pek) \d+s\)/i.test(nextName)) {
        nextName = nextName.replace(/\((?:Pack|Pek) \d+s\)/i, `(Pack ${packSize}s)`)
      }
      return {
        ...prev,
        units_per_pack: packSize,
        item_name: nextName
        // Note: strength does NOT change in Prepack mode! Tablet strength is preserved!
      }
    })
  }

  // Prepack manual input for custom pack size (e.g. 14s, 28s, 84s)
  const handlePrepackPackSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    setUnitQuantityDisplay(rawVal)
    const num = parseInt(rawVal, 10)
    if (!isNaN(num) && num > 0) {
      setFormData(prev => {
        let nextName = prev.item_name
        if (/\((?:Pack|Pek) \d+s\)/i.test(nextName)) {
          nextName = nextName.replace(/\((?:Pack|Pek) \d+s\)/i, `(Pack ${num}s)`)
        }
        return {
          ...prev,
          units_per_pack: num,
          item_name: nextName
        }
      })
    }
  }

  // Prepack Liquid (ml) or Cream (g) volume/weight selection
  const handlePrepackVolumeOrWeightSelect = (val: number) => {
    setUnitQuantityDisplay(String(val))
    setFormData(prev => ({
      ...prev,
      units_per_pack: val
    }))
  }

  // UOD fraction selection (1/4, 1/2, 1, 2)
  const handleUodUnitQuantitySelect = (fractionDisplay: string, numericVal: number) => {
    setUnitQuantityDisplay(fractionDisplay)
    setFormData(prev => {
      const activeBase = baseStrength || prev.strength
      const nextStrength = activeBase ? calculateAdjustedStrength(activeBase, numericVal) : prev.strength
      return {
        ...prev,
        units_per_pack: numericVal,
        strength: nextStrength
      }
    })
  }

  // UOD manual input for unit quantity fraction
  const handleUodUnitQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawStr = e.target.value
    setUnitQuantityDisplay(rawStr)
    const numericVal = parseUnitQuantity(rawStr)
    setFormData(prev => {
      const activeBase = baseStrength || prev.strength
      const nextStrength = activeBase ? calculateAdjustedStrength(activeBase, numericVal) : prev.strength
      return {
        ...prev,
        units_per_pack: numericVal,
        strength: nextStrength
      }
    })
  }

  // Handle manual input in strength field
  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, strength: val }))
    if (isUod) {
      if (formData.units_per_pack === 1 || !formData.units_per_pack) {
        setBaseStrength(val)
      } else {
        const backFactor = 1 / formData.units_per_pack
        setBaseStrength(calculateAdjustedStrength(val, backFactor) || val)
      }
    } else {
      setBaseStrength(val)
    }
  }

  // Handle dosage form change with automatic pack_type and package_type synchronization
  const handleDosageFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextForm = e.target.value as DosageForm
    let nextPackType = formData.pack_type
    let nextPkgType = formData.package_type
    let nextUnits = formData.units_per_pack

    if (isPrepack) {
      if (nextForm === 'syrup' || nextForm === 'suspension' || nextForm === 'solution' || nextForm === 'drops') {
        nextPackType = 'prepack_liquid'
        nextPkgType = 'amber_bottle'
        if (nextUnits < 30) nextUnits = 60
      } else if (nextForm === 'cream' || nextForm === 'ointment') {
        nextPackType = 'prepack_cream'
        nextPkgType = 'ointment_jar'
        if (nextUnits > 50 || nextUnits < 10) nextUnits = 15
      } else if (nextForm === 'tablet' || nextForm === 'capsule') {
        nextPackType = 'prepack_tablet'
        nextPkgType = 'plastic_envelope'
        if (nextUnits < 10) nextUnits = 30
      }
    }

    setFormData(prev => ({
      ...prev,
      dosage_form: nextForm,
      pack_type: nextPackType,
      package_type: nextPkgType,
      units_per_pack: nextUnits
    }))
    setUnitQuantityDisplay(String(nextUnits))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item_name.trim()) {
      toast.error('Please enter a medication / item name')
      return
    }

    // Preserve exact code; fallback only if completely empty
    let code = formData.item_code.trim()
    if (!code) {
      if (selectedFacilityDrug?.drug_code) {
        code = selectedFacilityDrug.drug_code.trim()
      } else {
        let prefix = 'PPK'
        if (formData.pack_type === 'uod') prefix = 'UOD'
        else if (formData.pack_type === 'internal') prefix = 'INT'
        else if (formData.pack_type === 'external') prefix = 'EXT'
        const cleanName = formData.item_name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()
        code = `${prefix}-${cleanName || 'MED'}-${Math.floor(100 + Math.random() * 900)}`
      }
    }

    setLoading(true)
    try {
      const typeLabel = 
        formData.pack_type === 'uod' ? 'UOD formulation'
        : formData.pack_type === 'internal' ? 'Internal preparation'
        : formData.pack_type === 'external' ? 'External preparation'
        : 'Prepack item'

      const payload = {
        ...formData,
        item_code: code,
        units_per_pack: Number(formData.units_per_pack) || 1
      }

      if (itemToEdit) {
        const { data, error } = await updatePrepackItem(itemToEdit.id, payload)
        if (error) throw error
        toast.success(`${typeLabel} updated successfully`)
        if (data) onSuccess(data)
      } else {
        const { data, error } = await createPrepackItem(payload)
        if (error) throw error
        toast.success(`New ${typeLabel} registered successfully`)
        if (data) onSuccess(data)
      }
      onClose()
    } catch (err: any) {
      console.error('Error saving item:', err)
      toast.error(err.message || 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = itemToEdit
    ? `Update Formulation: ${itemToEdit.item_name}`
    : isUod
    ? 'Register Unit of Dose (UOD) Formulation'
    : isInternal
    ? 'Register Internal Oral Preparation'
    : isExternal
    ? 'Register External Topical Preparation'
    : 'Register Bulk Prepack Item'

  const submitButtonLabel = itemToEdit
    ? 'Save Changes'
    : isUod
    ? 'Register UOD Formulation'
    : isInternal
    ? 'Register Internal Preparation'
    : isExternal
    ? 'Register External Preparation'
    : 'Register Prepack Item'

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Active Category Context Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-border-default">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isUod
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30'
                  : isInternal
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isExternal
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isUod ? 'bg-teal-600' : isInternal ? 'bg-emerald-400' : isExternal ? 'bg-rose-400' : 'bg-indigo-400'
                }`} />
                {isUod ? 'Category: Unit of Dose (UOD)'
                 : isInternal ? 'Category: Internal Preparation (Oral)'
                 : isExternal ? 'Category: External Preparation (Topical)'
                 : 'Category: Bulk Prepack'}
              </span>
              <span className="text-xs text-text-muted">
                {isUod ? 'Single-dose sachet / ward unit-dose dispensing'
                 : isInternal ? 'Oral liquid, syrup & extemporaneous preparation'
                 : isExternal ? 'Topical cream, ointment & external application'
                 : 'Bulk packaging for outpatient pharmacy dispensing'}
              </span>
            </div>
          </div>

          {/* Catalog Drug Selector Card */}
          <div className="space-y-2">
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
              /* Selected Drug Card (High-Craft Verified State) */
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/25">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                        {selectedFacilityDrug.drug_code}
                      </span>
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {selectedFacilityDrug.drug_name}
                      </h4>
                    </div>
                    <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {selectedFacilityDrug.generic_name && (
                        <span>Generic: <strong className="text-text-primary">{selectedFacilityDrug.generic_name}</strong></span>
                      )}
                      {baseStrength && (
                        <span>• Baseline Dose: <strong className="font-mono text-text-primary">{baseStrength}</strong></span>
                      )}
                      {selectedFacilityDrug.dosage_form && (
                        <span className="capitalize">• Form: {selectedFacilityDrug.dosage_form}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface text-teal-600 dark:text-teal-400 hover:bg-subtle dark:hover:bg-subtle border border-border-default transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Change Drug</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelectedDrug}
                    title="Unlink this medication"
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Prompt to Open Catalog Modal (Clean, High-Tier Shell) */
              <div className="p-3.5 rounded-xl border border-border-default bg-subtle hover:border-border-strong transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">
                      Link Medication from MyInventory Catalog
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Select a master drug to auto-populate item code, generic name, baseline dose, and dosage form.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Browse Medication Catalog</span>
                </button>
              </div>
            )}
          </div>

          {/* Core Identification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Item Code (Strictly Preserves Original Drug Code) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary">
                  Item Code
                </label>
                {selectedFacilityDrug && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Master Catalog Code
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.item_code}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                placeholder="e.g. D02.0011.02"
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
              />
              <p className="text-[10px] text-text-muted mt-1">
                Item code preserved from MyInventory master catalog.
              </p>
            </div>

            {/* Formulation Item Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary">
                  {isUod ? 'Medication & Dosage Name (UOD)' : 'Prepack Formulation Name'} <span className="text-red-500">*</span>
                </label>
                {isPrepack && isPrepackTablet && formData.item_name.trim() && !formData.item_name.includes(`(Pack ${formData.units_per_pack}s)`) && !formData.item_name.includes(`(Pek ${formData.units_per_pack}s)`) && (
                  <button
                    type="button"
                    onClick={() => {
                      const clean = formData.item_name.replace(/\s*\((?:Pack|Pek) \d+s\)/i, '').trim()
                      setFormData(prev => ({
                        ...prev,
                        item_name: `${clean} (Pack ${formData.units_per_pack}s)`
                      }))
                    }}
                    className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Format: +(Pack {formData.units_per_pack}s)</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={e => {
                  const val = e.target.value
                  setFormData(prev => ({ ...prev, item_name: val }))
                  if (isUod && !selectedFacilityDrug) {
                    const detected = extractDrugStrength(val)
                    if (detected && detected !== baseStrength) {
                      setBaseStrength(detected)
                      const nextStrength = calculateAdjustedStrength(detected, formData.units_per_pack)
                      setFormData(prev => ({ ...prev, item_name: val, strength: nextStrength }))
                    }
                  }
                }}
                placeholder={isUod ? 'e.g. Amlodipine 10 mg Tablet (UOD)' : 'e.g. Paracetamol 500 mg Tablet (Pack 30s)'}
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Generic Name
              </label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={e => setFormData({ ...formData, generic_name: e.target.value })}
                placeholder="e.g. Amlodipine"
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Dosage Form */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Dosage Form
              </label>
              <select
                value={formData.dosage_form}
                onChange={handleDosageFormChange}
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
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

          {/* Differentiated Packaging & Formulation Engine */}
          {isPrepack ? (
            /* PREPACK PACKAGING SPECIFICATION */
            <div className="p-3.5 rounded-xl bg-subtle/40 border border-border-default/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Package className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Prepack Packaging Specification</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  {isPrepackLiquid 
                    ? `${formData.units_per_pack} mL / bottle` 
                    : isPrepackCream 
                    ? `${formData.units_per_pack} g / jar` 
                    : `Pack of ${formData.units_per_pack}s (${formData.units_per_pack} units/pack)`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Pack Size / Volume / Weight */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    {isPrepackLiquid ? 'Volume per Bottle' : isPrepackCream ? 'Container Weight' : 'Pack Size (Quantity per Pack)'} <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Number input with unit suffix */}
                  <div className="relative mb-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={unitQuantityDisplay}
                      onChange={handlePrepackPackSizeInputChange}
                      placeholder={isPrepackLiquid ? 'e.g. 60' : isPrepackCream ? 'e.g. 15' : 'e.g. 30'}
                      className="w-full pl-3 pr-24 py-2 text-sm font-semibold font-mono bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted pointer-events-none">
                      {isPrepackLiquid ? 'mL / bottle' : isPrepackCream ? 'g / jar' : 'units / pack'}
                    </span>
                  </div>

                  {/* Compact quick-select presets */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-text-muted mr-1 font-medium">Common sizes:</span>
                    {(isPrepackLiquid 
                      ? [60, 90, 100, 120, 250] 
                      : isPrepackCream 
                      ? [15, 30, 50, 100] 
                      : [10, 20, 30, 40, 50, 60, 100]
                    ).map(val => {
                      const isSelected = formData.units_per_pack === val
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            if (isPrepackLiquid || isPrepackCream) {
                              handlePrepackVolumeOrWeightSelect(val)
                            } else {
                              handlePrepackPackSizeSelect(val)
                            }
                          }}
                          className={`px-2 py-0.5 text-xs font-mono rounded transition-all active:scale-[0.98] cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 text-white font-bold shadow-xs'
                              : 'bg-surface text-text-secondary border border-border-default hover:bg-subtle dark:hover:bg-subtle'
                          }`}
                        >
                          {isPrepackLiquid ? `${val}mL` : isPrepackCream ? `${val}g` : `${val}s`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Packaging Container Type */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Packaging Container <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.package_type}
                    onChange={e => setFormData(prev => ({ ...prev, package_type: e.target.value as PackageType }))}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
                  >
                    <option value="plastic_envelope">Resealable Zip Bag</option>
                    <option value="blister_strip">Blister Strip</option>
                    <option value="clear_bottle">Clear Plastic Bottle</option>
                    <option value="amber_bottle">Amber Glass Bottle (Light-Resistant)</option>
                    <option value="ointment_jar">Ointment Jar</option>
                    <option value="sachet">Sachet</option>
                    <option value="other">Other Container</option>
                  </select>
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Ready-to-use dispensing containers complying with hospital pharmacy standards.
                  </p>
                </div>
              </div>
            </div>
          ) : isUod ? (
            /* UOD: SINGLE DOSE / FRACTIONAL UNIT OF DOSE SECTION */
            <div className="rounded-xl border border-border-default bg-subtle p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border-default">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Unit Quantity & Dosage Strength Specification
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Active sachet formulation for ward unit-dose dispensing
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {baseStrength ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-subtle border border-border-default text-text-secondary">
                      <span className="font-semibold text-text-primary">{baseStrength}</span>
                      <span className="text-text-muted font-normal">×</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{unitQuantityDisplay} dose</span>
                      <span className="text-text-muted font-normal">=</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.strength || '-'}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-text-muted italic">
                      1 sachet = 1 patient unit dose
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Unit Quantity Selector (Fraction / Decimal Units) */}
                <div className="p-3.5 rounded-xl bg-surface border border-border-default flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        1. Unit Dose Fraction
                      </label>
                      <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {unitQuantityDisplay} dose
                      </span>
                    </div>

                    {/* Segmented Quick Fractions */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-subtle rounded-lg mb-2.5">
                      {[
                        { label: '¼', fraction: '1/4', value: 0.25, tip: 'Quarter dose (0.25)' },
                        { label: '½', fraction: '1/2', value: 0.5, tip: 'Half dose (0.50)' },
                        { label: '1', fraction: '1', value: 1, tip: 'Single dose (1.00)' },
                        { label: '2', fraction: '2', value: 2, tip: 'Double dose (2.00)' }
                      ].map((opt) => {
                        const isCurrent = Math.abs(formData.units_per_pack - opt.value) < 0.001
                        return (
                          <button
                            key={opt.fraction}
                            type="button"
                            title={opt.tip}
                            onClick={() => handleUodUnitQuantitySelect(opt.fraction, opt.value)}
                            className={`py-1.5 text-xs font-bold font-mono rounded transition-all active:scale-[0.98] cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'text-text-muted hover:text-text-primary hover:bg-subtle'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Custom input */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted shrink-0 font-medium">Custom:</span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={unitQuantityDisplay}
                          onChange={handleUodUnitQuantityInputChange}
                          placeholder="e.g. 1/2 or 0.5"
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary bg-subtle border border-border-default rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                        />
                      </div>
                      <span className="text-xs text-text-muted shrink-0">dose / sachet</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted mt-2.5">
                    Select standard clinical fraction or enter custom decimal value.
                  </p>
                </div>

                {/* 2. Resulting Formulated Strength */}
                <div className="p-3.5 rounded-xl bg-cyan-500/[0.04] dark:bg-cyan-950/20 border border-cyan-500/25 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
                        2. Sachet Dose Strength
                      </label>
                      <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/25">
                        Formulated Output
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={formData.strength}
                        onChange={handleStrengthChange}
                        placeholder="e.g. 5 mg"
                        className="w-full px-3.5 py-2 text-sm font-mono font-bold text-text-primary bg-surface border border-border-default rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted mt-2.5 truncate">
                    {baseStrength
                      ? `Auto-calculated active dose (${baseStrength} × ${unitQuantityDisplay})`
                      : 'Active unit strength per sachet (directly editable)'}
                  </p>
                </div>
              </div>

              {/* Formula Guidance Box */}
              <div className="p-3 rounded-xl bg-subtle border border-border-default/80 dark:border-border-default flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">UOD Formulation Logic: </span>
                  The system computes the active sachet strength based on the original tablet dosage. For example: If the master tablet is <strong className="font-mono text-teal-600 dark:text-teal-400">10 mg</strong>, selecting <strong className="text-teal-600 dark:text-teal-400">½ dose</strong> produces a <strong className="font-mono text-teal-600 dark:text-teal-400">5 mg</strong> sachet, while <strong className="text-teal-600 dark:text-teal-400">2 doses</strong> produce <strong className="font-mono text-teal-600 dark:text-teal-400">20 mg</strong>. Sachet strength can also be customized directly if required.
                </div>
              </div>
            </div>
          ) : (
            /* GALENICAL (Internal / External Compounding) */
            <div className="rounded-xl border border-border-default/80 bg-subtle p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Beaker className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Compounding Formulation & Container Specification
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {formData.units_per_pack} {isInternal ? 'mL / bottle' : 'g / jar'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Concentration / Strength */}
                <div className="bg-surface border border-border-default rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Formula Concentration / Strength
                    </label>
                    <input
                      type="text"
                      value={formData.strength}
                      onChange={handleStrengthChange}
                      placeholder={isInternal ? 'e.g. 10 mg / 5 mL' : 'e.g. 10% w/w'}
                      className="w-full text-sm font-bold font-mono text-text-primary bg-transparent border-b border-border-default focus:border-emerald-500 pb-1 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">
                    Active concentration of galenical compounding.
                  </p>
                </div>

                {/* 2. Container Volume or Weight */}
                <div className="bg-surface border border-border-default rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {isInternal ? 'Volume per Bottle (mL)' : 'Weight per Jar (g)'}
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formData.units_per_pack} {isInternal ? 'mL' : 'g'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {(isInternal ? [60, 90, 100, 120] : [15, 30, 50, 100]).map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handlePrepackVolumeOrWeightSelect(val)}
                        className={`py-1 text-xs font-bold rounded transition-all active:scale-[0.98] cursor-pointer ${
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
                      onChange={handlePrepackPackSizeInputChange}
                      className="w-full text-xs font-mono font-bold bg-subtle border border-border-default rounded-lg px-2.5 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-text-muted shrink-0 font-medium">{isInternal ? 'mL' : 'g'}</span>
                  </div>
                </div>

                {/* 3. Container Type */}
                <div className="bg-surface border border-border-default rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Compounding Container
                    </label>
                    <select
                      value={formData.package_type}
                      onChange={e => setFormData(prev => ({ ...prev, package_type: e.target.value as PackageType }))}
                      className="w-full text-xs font-semibold bg-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="amber_bottle">Amber Glass Bottle (Light-Resistant)</option>
                      <option value="clear_bottle">Clear Plastic Bottle</option>
                      <option value="ointment_jar">Ointment Jar</option>
                      <option value="other">Other Container</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">
                    Hospital extemporaneous compounding packaging standard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Buffer Level & Optimum Batch Size */}
          <div className="p-3.5 rounded-xl bg-subtle/40 border border-border-default/70 space-y-3">
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
                  onChange={e => setFormData({ ...formData, min_buffer_level: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Triggers a &ldquo;Prepack Required&rdquo; alert when ready stock falls below this level.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Optimal Batch Run Size
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.optimal_batch_size}
                  onChange={e => setFormData({ ...formData, optimal_batch_size: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-2xs"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Target packaging quantity recommended per production session.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary bg-transparent hover:bg-subtle dark:hover:bg-subtle rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] active:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{submitButtonLabel}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Dedicated Catalog Search Dialog (No awkward floating popovers) */}
      <PrepackDrugPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectDrug={handleSelectDrug}
        selectedDrugId={selectedFacilityDrug?.id}
      />
    </>
  )
}

export default PrepackItemModal
