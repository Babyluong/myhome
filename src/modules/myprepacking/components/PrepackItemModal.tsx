import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui'
import type {
  PrepackItem,
  PackType,
  DosageForm,
  PackageType,
  CatalogCategory,
  PrepackFormulationIngredient
} from '../types/prepack'
import {
  createPrepackItem,
  updatePrepackItem,
  normalizeDosageForm,
  mapPackageAndPackType,
  extractDrugStrength,
  calculateAdjustedStrength,
  parseUnitQuantity,
  formatUnitQuantityDisplay,
  getPrepackItemAuditLogs,
  FacilityCatalogDrugOption
} from '../services/prepackService'
import { getGalenicalMonograph } from '../data/kkmGalenicalMasterDatabase'
import { PrepackDrugPickerModal } from './PrepackDrugPickerModal'
import { useToast } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import {
  FormulationEditorTabs,
  FormulationTabKey
} from './formulationEditor/FormulationEditorTabs'
import { FormulationGeneralTab } from './formulationEditor/FormulationGeneralTab'
import { FormulationIngredientsTab } from './formulationEditor/FormulationIngredientsTab'
import { FormulationProcedureTab } from './formulationEditor/FormulationProcedureTab'
import { FormulationLabellingTab } from './formulationEditor/FormulationLabellingTab'
import { FormulationAuditHistoryTab } from './formulationEditor/FormulationAuditHistoryTab'

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
  const loggedUser = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FormulationTabKey>('general')
  const [auditCount, setAuditCount] = useState<number>(0)

  // 1. General Form State
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
    shelf_life_months: 6
  })

  // 2. Compounding & Monograph State
  const [ingredientsFormula, setIngredientsFormula] = useState('')
  const [indications, setIndications] = useState('')
  const [ingredientsList, setIngredientsList] = useState<PrepackFormulationIngredient[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [qcChecks, setQcChecks] = useState<string[]>([])
  const [cautions, setCautions] = useState<string[]>([])
  const [beyondUseDateDays, setBeyondUseDateDays] = useState<number>(90)
  const [storageInstructions, setStorageInstructions] = useState('Store in a cool, dry place below 25°C.')
  const [labelInstructions, setLabelInstructions] = useState('KEEP OUT OF REACH OF CHILDREN')
  const [containerSpecs, setContainerSpecs] = useState('')

  // Mode helpers
  const isUod = formData.pack_type === 'uod'
  const isInternal = formData.pack_type === 'internal'
  const isExternal = formData.pack_type === 'external'
  const isPrepack = !isUod && !isInternal && !isExternal
  const isCompounding = isInternal || isExternal

  const isPrepackTablet = isPrepack && (formData.dosage_form === 'tablet' || formData.dosage_form === 'capsule')
  const isPrepackLiquid = isPrepack && (formData.dosage_form === 'syrup' || formData.dosage_form === 'suspension' || formData.dosage_form === 'solution' || formData.dosage_form === 'drops')
  const isPrepackCream = isPrepack && (formData.dosage_form === 'cream' || formData.dosage_form === 'ointment')

  const [baseStrength, setBaseStrength] = useState<string>('')
  const [unitQuantityDisplay, setUnitQuantityDisplay] = useState<string>(defaultCategory === 'prepack' ? '30' : '1')
  const [selectedFacilityDrug, setSelectedFacilityDrug] = useState<FacilityCatalogDrugOption | null>(null)

  // Populate data when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      const rawUnits = Number(itemToEdit.units_per_pack) || 1
      const rawStrength = itemToEdit.strength || ''
      const isItemUod = itemToEdit.pack_type === 'uod'

      let inferredBase = rawStrength
      if (isItemUod && rawUnits !== 1 && rawStrength) {
        const backFactor = rawUnits > 0 ? 1 / rawUnits : 1
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
        shelf_life_months: itemToEdit.shelf_life_months || 6
      })

      // Resolve monograph baseline for fallback
      const baselineMonograph = getGalenicalMonograph(itemToEdit)

      setIngredientsFormula(itemToEdit.ingredients_formula || baselineMonograph.ingredients_formula || '')
      setIndications(itemToEdit.indications || baselineMonograph.indications || '')

      const initialIngredients = (Array.isArray(itemToEdit.standard_formula_breakdown) && itemToEdit.standard_formula_breakdown.length > 0)
        ? itemToEdit.standard_formula_breakdown
        : baselineMonograph.standard_formula_breakdown || []
      setIngredientsList(initialIngredients)

      const initialSteps = (Array.isArray(itemToEdit.preparation_steps) && itemToEdit.preparation_steps.length > 0)
        ? itemToEdit.preparation_steps
        : baselineMonograph.preparation_steps || []
      setSteps(initialSteps)

      const initialEq = (Array.isArray(itemToEdit.equipment_required) && itemToEdit.equipment_required.length > 0)
        ? itemToEdit.equipment_required
        : baselineMonograph.equipment_required || []
      setEquipment(initialEq)

      const initialQc = (Array.isArray(itemToEdit.in_process_qc) && itemToEdit.in_process_qc.length > 0)
        ? itemToEdit.in_process_qc
        : baselineMonograph.in_process_qc || []
      setQcChecks(initialQc)

      const initialCautions = (Array.isArray(itemToEdit.cautions_and_warnings) && itemToEdit.cautions_and_warnings.length > 0)
        ? itemToEdit.cautions_and_warnings
        : baselineMonograph.cautions_and_warnings || []
      setCautions(initialCautions)

      setBeyondUseDateDays(itemToEdit.beyond_use_date_days ?? baselineMonograph.beyond_use_date_days ?? 90)
      setStorageInstructions(itemToEdit.storage_instructions || baselineMonograph.storage_instructions || 'Store below 25°C.')
      setLabelInstructions(itemToEdit.label_instructions || baselineMonograph.label_instructions || 'KEEP OUT OF REACH OF CHILDREN')
      setContainerSpecs(itemToEdit.container_specs || baselineMonograph.container_specs || '')

      setSelectedFacilityDrug(null)

      // Fetch audit count for badge
      getPrepackItemAuditLogs(itemToEdit.id).then(({ data }) => {
        setAuditCount(data?.length || 0)
      })
    } else {
      // Create mode defaults
      setAuditCount(0)
      let initialType: PackType = defaultPackType || 'prepack_tablet'
      if (defaultCategory === 'internal') initialType = 'internal'
      else if (defaultCategory === 'external') initialType = 'external'
      else if (defaultCategory === 'uod') initialType = 'uod'
      else if (defaultCategory === 'prepack') initialType = 'prepack_tablet'

      setFormData({
        drug_id: null,
        item_code: '',
        item_name: '',
        generic_name: '',
        pack_type: initialType,
        dosage_form: 'tablet',
        strength: '',
        units_per_pack: initialType === 'prepack_tablet' ? 30 : 1,
        package_type: initialType === 'uod' ? 'sachet' : 'plastic_envelope',
        min_buffer_level: 30,
        optimal_batch_size: 100,
        shelf_life_months: 6
      })
      setIngredientsFormula('')
      setIndications('')
      setIngredientsList([])
      setSteps([])
      setEquipment([])
      setQcChecks([])
      setCautions([])
      setBeyondUseDateDays(90)
      setStorageInstructions('Store below 25°C in a cool, dry place.')
      setLabelInstructions('KEEP OUT OF REACH OF CHILDREN')
      setContainerSpecs('')
    }
  }, [itemToEdit, defaultPackType, defaultCategory, isOpen])

  const handleResetToBaseline = () => {
    if (!itemToEdit) return
    const baseline = getGalenicalMonograph(itemToEdit)
    setIngredientsList(baseline.standard_formula_breakdown || [])
    setIngredientsFormula(baseline.ingredients_formula || '')
    setIndications(baseline.indications || '')
    toast.success('Formula reset to official MOH baseline.')
  }

  const handleResetToBaselineSteps = () => {
    if (!itemToEdit) return
    const baseline = getGalenicalMonograph(itemToEdit)
    setSteps(baseline.preparation_steps || [])
    setEquipment(baseline.equipment_required || [])
    setQcChecks(baseline.in_process_qc || [])
    setCautions(baseline.cautions_and_warnings || [])
    toast.success('Compounding SOP steps reset to official MOH baseline.')
  }

  const handleSelectDrug = (drug: FacilityCatalogDrugOption) => {
    setSelectedFacilityDrug(drug)
    const normalizedForm = normalizeDosageForm(drug.dosage_form)
    const baseDose = drug.strength || extractDrugStrength(drug.drug_name) || ''
    setBaseStrength(baseDose)

    const targetCat = defaultCategory === 'all' ? 'prepack' : defaultCategory
    const mapped = mapPackageAndPackType(normalizedForm, targetCat as any)
    let calculatedUnits = isUod ? 1 : formData.units_per_pack
    let calculatedStrength = baseDose

    if (isUod) {
      const parsedFrac = parseUnitQuantity(unitQuantityDisplay)
      calculatedUnits = parsedFrac > 0 ? parsedFrac : 1
      calculatedStrength = calculateAdjustedStrength(baseDose, calculatedUnits) || baseDose
    }

    setFormData((prev) => ({
      ...prev,
      drug_id: drug.id,
      item_code: drug.drug_code,
      item_name: drug.drug_name,
      generic_name: drug.generic_name || '',
      pack_type: mapped.pack_type,
      dosage_form: normalizedForm,
      package_type: mapped.package_type,
      units_per_pack: calculatedUnits,
      strength: calculatedStrength
    }))
    setIsPickerOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item_code.trim()) {
      toast.error('Item code is required')
      return
    }
    if (!formData.item_name.trim()) {
      toast.error('Formulation name is required')
      return
    }

    setLoading(true)
    try {
      const payload: Partial<PrepackItem> = {
        ...formData,
        ingredients_formula: ingredientsFormula || null,
        indications: indications || null,
        standard_formula_breakdown: ingredientsList.length > 0 ? ingredientsList : null,
        preparation_steps: steps.length > 0 ? steps : null,
        equipment_required: equipment.length > 0 ? equipment : null,
        in_process_qc: qcChecks.length > 0 ? qcChecks : null,
        cautions_and_warnings: cautions.length > 0 ? cautions : null,
        beyond_use_date_days: beyondUseDateDays,
        storage_instructions: storageInstructions,
        label_instructions: labelInstructions,
        container_specs: containerSpecs || null
      }

      if (itemToEdit) {
        const editorInfo = {
          userId: loggedUser?.id || null,
          userName: (loggedUser as any)?.full_name || (loggedUser as any)?.name || (loggedUser as any)?.username || 'Hospital Pharmacist',
          userRole: typeof (loggedUser as any)?.role === 'string' 
            ? (loggedUser as any).role 
            : (loggedUser as any)?.role?.name || 'Pharmacist'
        }

        const { data, error } = await updatePrepackItem(itemToEdit.id, payload, editorInfo)
        if (error) throw error
        toast.success(`Formulation "${data?.item_name}" updated successfully.`)
        if (data) onSuccess(data)
      } else {
        const { data, error } = await createPrepackItem(payload)
        if (error) throw error
        toast.success(`Formulation "${data?.item_name}" registered successfully.`)
        if (data) onSuccess(data)
      }
      onClose()
    } catch (err: any) {
      console.error('Error saving formulation:', err)
      toast.error(err.message || 'Failed to save formulation')
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = itemToEdit
    ? `Update Formulation: ${itemToEdit.item_name}`
    : 'Register New Formulation'

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="3xl">
        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Tab Navigation */}
          <FormulationEditorTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isCompounding={isCompounding}
            auditCount={auditCount}
          />

          {/* Active Tab Panel */}
          {activeTab === 'general' && (
            <FormulationGeneralTab
              formData={formData}
              isUod={isUod}
              isInternal={isInternal}
              isExternal={isExternal}
              isPrepack={isPrepack}
              isPrepackTablet={isPrepackTablet}
              isPrepackLiquid={isPrepackLiquid}
              isPrepackCream={isPrepackCream}
              baseStrength={baseStrength}
              unitQuantityDisplay={unitQuantityDisplay}
              selectedFacilityDrug={selectedFacilityDrug}
              onOpenPicker={() => setIsPickerOpen(true)}
              onClearSelectedDrug={() => setSelectedFacilityDrug(null)}
              onDosageFormChange={(e) =>
                setFormData((prev) => ({ ...prev, dosage_form: e.target.value as DosageForm }))
              }
              onFormDataChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
              onUnitQuantityDisplayChange={(val) => {
                setUnitQuantityDisplay(val)
                const parsed = parseInt(val) || 1
                setFormData((prev) => ({ ...prev, units_per_pack: parsed }))
              }}
              onPrepackPackSizeSelect={(size) => {
                setUnitQuantityDisplay(String(size))
                setFormData((prev) => ({ ...prev, units_per_pack: size }))
              }}
              onPrepackVolumeOrWeightSelect={(val) => {
                setUnitQuantityDisplay(String(val))
                setFormData((prev) => ({ ...prev, units_per_pack: val }))
              }}
              onUodUnitQuantitySelect={(fraction, val) => {
                setUnitQuantityDisplay(fraction)
                setFormData((prev) => ({
                  ...prev,
                  units_per_pack: val,
                  strength: calculateAdjustedStrength(baseStrength, val) || prev.strength
                }))
              }}
              onUodUnitQuantityInputChange={(e) => {
                const val = e.target.value
                setUnitQuantityDisplay(val)
                const frac = parseUnitQuantity(val)
                if (frac > 0) {
                  setFormData((prev) => ({
                    ...prev,
                    units_per_pack: frac,
                    strength: calculateAdjustedStrength(baseStrength, frac) || prev.strength
                  }))
                }
              }}
              onStrengthChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
            />
          )}

          {activeTab === 'ingredients' && (
            <FormulationIngredientsTab
              ingredientsFormula={ingredientsFormula}
              indications={indications}
              ingredientsList={ingredientsList}
              onChangeFormula={setIngredientsFormula}
              onChangeIndications={setIndications}
              onUpdateIngredientsList={setIngredientsList}
              onResetToBaseline={itemToEdit ? handleResetToBaseline : undefined}
            />
          )}

          {activeTab === 'procedure' && (
            <FormulationProcedureTab
              steps={steps}
              equipment={equipment}
              qcChecks={qcChecks}
              cautions={cautions}
              onUpdateSteps={setSteps}
              onUpdateEquipment={setEquipment}
              onUpdateQcChecks={setQcChecks}
              onUpdateCautions={setCautions}
              onResetToBaselineSteps={itemToEdit ? handleResetToBaselineSteps : undefined}
            />
          )}

          {activeTab === 'labelling' && (
            <FormulationLabellingTab
              labelInstructions={labelInstructions}
              storageInstructions={storageInstructions}
              beyondUseDateDays={beyondUseDateDays}
              containerSpecs={containerSpecs}
              itemName={formData.item_name}
              strength={formData.strength}
              packType={formData.pack_type}
              onChangeLabelInstructions={setLabelInstructions}
              onChangeStorageInstructions={setStorageInstructions}
              onChangeBudDays={setBeyondUseDateDays}
              onChangeContainerSpecs={setContainerSpecs}
            />
          )}

          {activeTab === 'audit' && (
            <FormulationAuditHistoryTab prepackItemId={itemToEdit?.id} />
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border-default">
            <div className="text-[11px] text-text-muted">
              {itemToEdit && (
                <span>
                  Editing <strong className="text-text-primary">{itemToEdit.item_code}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary bg-transparent hover:bg-subtle rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

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
