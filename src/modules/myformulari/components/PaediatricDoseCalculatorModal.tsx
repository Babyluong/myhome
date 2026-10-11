import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Calculator,
  X,
  Baby,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Scale,
  Info,
  Layers,
  Clock,
  Pill,
  Plus,
  Edit3,
  Trash2,
  Building2,
  Download,
  Upload,
  RotateCcw,
  Search,
  Zap,
  BookmarkPlus,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react'
import {
  PaediatricDrugPreset,
  PaediatricIndication,
  PaediatricFormulation,
  PaediatricDoseCalculationMode
} from '../types/paediatricDoseTypes'
import {
  getAllPaediatricPresets,
  deleteCustomHospitalPreset,
  resetCustomHospitalPresets,
  exportHospitalProtocolsJson,
  importHospitalProtocolsJson
} from '../services/paediatricDoseService'
import { AddEditPaediatricProtocolModal } from './AddEditPaediatricProtocolModal'

interface PaediatricDoseCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  initialDrugName?: string
}

type TabMode = 'preset' | 'manual'
type PresetFilterSource = 'ALL' | 'KKM' | 'HOSPITAL'

const MANUAL_FREQUENCY_OPTIONS = [
  { key: 'OD', label: 'OD (Sekali Sehari / Q24H)', dividedTimes: 1, hours: '24 Jam' },
  { key: 'BD', label: 'BD (2 Kali Sehari / Q12H)', dividedTimes: 2, hours: '12 Jam' },
  { key: 'TDS', label: 'TDS (3 Kali Sehari / Q8H)', dividedTimes: 3, hours: '8 Jam' },
  { key: 'QID', label: 'QID (4 Kali Sehari / Q6H)', dividedTimes: 4, hours: '6 Jam' },
  { key: 'Q4H', label: 'Q4H (6 Kali Sehari / Setiap 4 Jam)', dividedTimes: 6, hours: '4 Jam' },
  { key: 'STAT', label: 'Stat (Satu Dos Sahaja)', dividedTimes: 1, hours: 'Sekali' },
  { key: 'PRN', label: 'PRN (Bila Perlu / Selang ≥4 Jam)', dividedTimes: 4, hours: 'PRN' }
]

const QUICK_STRENGTH_PRESETS = [
  { label: 'Sirap/Suspensi 125mg / 5mL (25mg/mL)', mg: 125, ml: 5, mgPerMl: 25 },
  { label: 'Sirap Forte 250mg / 5mL (50mg/mL)', mg: 250, ml: 5, mgPerMl: 50 },
  { label: 'Suspensi BID 228.5mg / 5mL (40mg/mL)', mg: 200, ml: 5, mgPerMl: 40 },
  { label: 'Suspensi BID Forte 457mg / 5mL (80mg/mL)', mg: 400, ml: 5, mgPerMl: 80 },
  { label: 'Suspensi 200mg / 5mL (40mg/mL)', mg: 200, ml: 5, mgPerMl: 40 },
  { label: 'Sirap 120mg / 5mL (24mg/mL)', mg: 120, ml: 5, mgPerMl: 24 },
  { label: 'Sirap 100mg / 5mL (20mg/mL)', mg: 100, ml: 5, mgPerMl: 20 },
  { label: 'Sirap 15mg / 5mL (3mg/mL)', mg: 15, ml: 5, mgPerMl: 3 },
  { label: 'Sirap 5mg / 5mL (1mg/mL)', mg: 5, ml: 5, mgPerMl: 1 },
  { label: 'Sirap 2mg / 5mL (0.4mg/mL)', mg: 2, ml: 5, mgPerMl: 0.4 },
  { label: 'Injeksi IV 10mg / 1mL (10mg/mL)', mg: 10, ml: 1, mgPerMl: 10 },
  { label: 'Injeksi IV 50mg / 1mL (50mg/mL)', mg: 50, ml: 1, mgPerMl: 50 },
  { label: 'Injeksi IV 100mg / 1mL (100mg/mL)', mg: 100, ml: 1, mgPerMl: 100 }
]

export const PaediatricDoseCalculatorModal: React.FC<PaediatricDoseCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialDrugName
}) => {
  // Main Tab mode: 'preset' = KKM/Hospital Preset Dosing; 'manual' = Quick Ad-hoc Calculator
  const [activeTab, setActiveTab] = useState<TabMode>('preset')

  // Presets State
  const [presets, setPresets] = useState<PaediatricDrugPreset[]>([])
  const [sourceFilter, setSourceFilter] = useState<PresetFilterSource>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDrugId, setSelectedDrugId] = useState<string>('')
  const [selectedIndicationIndex, setSelectedIndicationIndex] = useState<number>(0)
  const [selectedFormulationIndex, setSelectedFormulationIndex] = useState<number>(0)

  // Weight State (shared across tabs)
  const [weightKg, setWeightKg] = useState<number | ''>(10)

  // Manual Mode State
  const [manualDrugName, setManualDrugName] = useState<string>('Ubat Amalan Hospital')
  const [manualCalcMode, setManualCalcMode] = useState<PaediatricDoseCalculationMode>('daily_divided')
  const [manualDoseMgPerKg, setManualDoseMgPerKg] = useState<number | ''>(40)
  const [manualFrequencyKey, setManualFrequencyKey] = useState<string>('TDS')
  const [manualFormulationType, setManualFormulationType] = useState<'preset' | 'custom' | 'none'>('preset')
  const [manualPresetStrengthIdx, setManualPresetStrengthIdx] = useState<number>(0)
  const [manualCustomStrengthMg, setManualCustomStrengthMg] = useState<number | ''>(125)
  const [manualCustomStrengthMl, setManualCustomStrengthMl] = useState<number | ''>(5)
  const [manualMaxSingleDoseMg, setManualMaxSingleDoseMg] = useState<number | ''>(500)
  const [manualMaxDailyDoseMg, setManualMaxDailyDoseMg] = useState<number | ''>(1500)
  const [manualNotes, setManualNotes] = useState<string>('')

  // Add / Edit Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false)
  const [editingPreset, setEditingPreset] = useState<PaediatricDrugPreset | null>(null)
  const [initialPresetValues, setInitialPresetValues] = useState<Partial<PaediatricDrugPreset> | null>(null)

  // Notification / Feedback banner
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load Presets from service
  const loadPresets = () => {
    const all = getAllPaediatricPresets()
    setPresets(all)
    return all
  }

  useEffect(() => {
    if (isOpen) {
      const all = loadPresets()
      // If initialDrugName is provided, find best match
      if (initialDrugName && all.length > 0) {
        const found = all.find(
          p =>
            p.drugName.toLowerCase().includes(initialDrugName.toLowerCase()) ||
            p.id.toLowerCase().includes(initialDrugName.toLowerCase())
        )
        if (found) {
          setSelectedDrugId(found.id)
        } else if (!selectedDrugId) {
          setSelectedDrugId(all[0].id)
        }
      } else if (!selectedDrugId && all.length > 0) {
        setSelectedDrugId(all[0].id)
      }
    }
  }, [isOpen, initialDrugName])

  // Listen to preset updates across windows / components
  useEffect(() => {
    const handleUpdated = () => {
      loadPresets()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('paediatric_presets_updated', handleUpdated)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('paediatric_presets_updated', handleUpdated)
      }
    }
  }, [])

  // Show temporary toast message
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => {
      setToastMsg(null)
    }, 4000)
  }

  // Filtered Presets for preset tab
  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      // Source filter
      if (sourceFilter === 'KKM' && preset.source !== 'KKM_STANDARD') return false
      if (sourceFilter === 'HOSPITAL' && preset.source !== 'HOSPITAL_CUSTOM') return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = preset.drugName.toLowerCase().includes(q)
        const matchCategory = preset.category.toLowerCase().includes(q)
        const matchHospital = (preset.hospitalName || '').toLowerCase().includes(q)
        const matchIndication = preset.indications.some(ind =>
          ind.name.toLowerCase().includes(q) || ind.doseFormula.toLowerCase().includes(q)
        )
        if (!matchName && !matchCategory && !matchHospital && !matchIndication) {
          return false
        }
      }
      return true
    })
  }, [presets, sourceFilter, searchQuery])

  // Active Drug Preset
  const activeDrug = useMemo(() => {
    if (filteredPresets.length === 0) {
      return presets.find(p => p.id === selectedDrugId) || presets[0] || null
    }
    return (
      filteredPresets.find(p => p.id === selectedDrugId) ||
      filteredPresets[0]
    )
  }, [filteredPresets, presets, selectedDrugId])

  // Active Indication
  const activeIndication: PaediatricIndication | null = useMemo(() => {
    if (!activeDrug || !activeDrug.indications || activeDrug.indications.length === 0) {
      return null
    }
    return activeDrug.indications[selectedIndicationIndex] || activeDrug.indications[0]
  }, [activeDrug, selectedIndicationIndex])

  // Active Formulation
  const activeFormulation: PaediatricFormulation | null = useMemo(() => {
    if (
      !activeIndication ||
      !activeIndication.standardFormulations ||
      activeIndication.standardFormulations.length === 0
    ) {
      return null
    }
    return (
      activeIndication.standardFormulations[selectedFormulationIndex] ||
      activeIndication.standardFormulations[0]
    )
  }, [activeIndication, selectedFormulationIndex])

  // Preset Mode Calculation
  const presetCalculationResults = useMemo(() => {
    const wt = typeof weightKg === 'number' && weightKg > 0 ? weightKg : 0
    if (wt === 0 || !activeIndication) return null

    const mode = activeIndication.calculationMode || 'daily_divided'
    const doseMgKg = activeIndication.doseMgPerKg || 0
    const timesPerDay = activeIndication.dividedTimesPerDay || 1
    const maxSingleCap = activeIndication.maxSingleDoseMg || 999999
    const maxDailyCap = activeIndication.maxDailyDoseMg || 999999

    let rawDailyMg: number
    let rawSingleDoseMg: number

    if (mode === 'per_dose') {
      // Dose given is per single administration
      rawSingleDoseMg = wt * doseMgKg
      rawDailyMg = rawSingleDoseMg * timesPerDay
    } else {
      // Dose given is total daily mg/kg divided into timesPerDay
      rawDailyMg = wt * doseMgKg
      rawSingleDoseMg = rawDailyMg / timesPerDay
    }

    let isDailyCapped = false
    let isSingleCapped = false

    // Apply caps
    let finalDailyMg = rawDailyMg
    let finalSingleDoseMg = rawSingleDoseMg

    if (finalDailyMg > maxDailyCap) {
      finalDailyMg = maxDailyCap
      isDailyCapped = true
    }

    if (finalSingleDoseMg > maxSingleCap) {
      finalSingleDoseMg = maxSingleCap
      isSingleCapped = true
    }

    // Recalculate based on caps
    if (mode === 'per_dose') {
      finalDailyMg = Math.min(finalDailyMg, finalSingleDoseMg * timesPerDay)
    }

    // Liquid mL Calculation
    let singleDoseMl: number | null = null
    if (activeFormulation && activeFormulation.mgPerMl > 0) {
      singleDoseMl = finalSingleDoseMg / activeFormulation.mgPerMl
    }

    return {
      weight: wt,
      mode,
      dailyMg: Math.round(finalDailyMg * 10) / 10,
      singleDoseMg: Math.round(finalSingleDoseMg * 10) / 10,
      singleDoseMl: singleDoseMl ? Math.round(singleDoseMl * 10) / 10 : null,
      dividedTimesPerDay: timesPerDay,
      frequencyLabel: activeIndication.frequencyLabel,
      isDailyCapped,
      isSingleCapped,
      maxSingleCap,
      maxDailyCap
    }
  }, [weightKg, activeIndication, activeFormulation])

  // Manual Mode Calculation
  const manualCalculationResults = useMemo(() => {
    const wt = typeof weightKg === 'number' && weightKg > 0 ? weightKg : 0
    const doseVal = typeof manualDoseMgPerKg === 'number' && manualDoseMgPerKg > 0 ? manualDoseMgPerKg : 0
    if (wt === 0 || doseVal === 0) return null

    const freqOption =
      MANUAL_FREQUENCY_OPTIONS.find(f => f.key === manualFrequencyKey) ||
      MANUAL_FREQUENCY_OPTIONS[2]
    const timesPerDay = freqOption.dividedTimes

    let rawDailyMg: number
    let rawSingleDoseMg: number

    if (manualCalcMode === 'per_dose') {
      rawSingleDoseMg = wt * doseVal
      rawDailyMg = rawSingleDoseMg * timesPerDay
    } else {
      rawDailyMg = wt * doseVal
      rawSingleDoseMg = rawDailyMg / timesPerDay
    }

    const singleCap =
      typeof manualMaxSingleDoseMg === 'number' && manualMaxSingleDoseMg > 0
        ? manualMaxSingleDoseMg
        : null
    const dailyCap =
      typeof manualMaxDailyDoseMg === 'number' && manualMaxDailyDoseMg > 0
        ? manualMaxDailyDoseMg
        : null

    let isSingleCapped = false
    let isDailyCapped = false

    let finalSingleMg = rawSingleDoseMg
    let finalDailyMg = rawDailyMg

    if (singleCap && finalSingleMg > singleCap) {
      finalSingleMg = singleCap
      isSingleCapped = true
    }

    if (dailyCap && finalDailyMg > dailyCap) {
      finalDailyMg = dailyCap
      isDailyCapped = true
    }

    if (manualCalcMode === 'per_dose') {
      finalDailyMg = Math.min(finalDailyMg, finalSingleMg * timesPerDay)
    }

    // Liquid mL conversion
    let mgPerMl: number | null = null
    if (manualFormulationType === 'preset') {
      const pStrength = QUICK_STRENGTH_PRESETS[manualPresetStrengthIdx]
      if (pStrength) mgPerMl = pStrength.mgPerMl
    } else if (manualFormulationType === 'custom') {
      const cMg = typeof manualCustomStrengthMg === 'number' ? manualCustomStrengthMg : 0
      const cMl = typeof manualCustomStrengthMl === 'number' ? manualCustomStrengthMl : 0
      if (cMg > 0 && cMl > 0) {
        mgPerMl = cMg / cMl
      }
    }

    let singleDoseMl: number | null = null
    if (mgPerMl && mgPerMl > 0) {
      singleDoseMl = finalSingleMg / mgPerMl
    }

    return {
      weight: wt,
      mode: manualCalcMode,
      singleDoseMg: Math.round(finalSingleMg * 10) / 10,
      dailyMg: Math.round(finalDailyMg * 10) / 10,
      singleDoseMl: singleDoseMl ? Math.round(singleDoseMl * 10) / 10 : null,
      dividedTimesPerDay: timesPerDay,
      frequencyLabel: freqOption.label,
      mgPerMl,
      isSingleCapped,
      isDailyCapped,
      singleCap,
      dailyCap
    }
  }, [
    weightKg,
    manualDoseMgPerKg,
    manualCalcMode,
    manualFrequencyKey,
    manualMaxSingleDoseMg,
    manualMaxDailyDoseMg,
    manualFormulationType,
    manualPresetStrengthIdx,
    manualCustomStrengthMg,
    manualCustomStrengthMl
  ])

  // Delete Hospital Custom Preset
  const handleDeleteCustomPreset = (presetId: string, drugName: string) => {
    if (window.confirm(`Adakah anda pasti ingin memadam protokol hospital untuk "${drugName}"?`)) {
      try {
        deleteCustomHospitalPreset(presetId)
        const updated = loadPresets()
        if (updated.length > 0) {
          setSelectedDrugId(updated[0].id)
          setSelectedIndicationIndex(0)
          setSelectedFormulationIndex(0)
        }
        showToast('success', `Protokol "${drugName}" berjaya dipadam.`)
      } catch (err: any) {
        showToast('error', err.message || 'Gagal memadam protokol.')
      }
    }
  }

  // Open Edit Preset Modal
  const handleOpenEditPreset = (preset: PaediatricDrugPreset) => {
    setEditingPreset(preset)
    setInitialPresetValues(null)
    setIsAddEditModalOpen(true)
  }

  // Transfer Manual Form state into Add Hospital Protocol Modal
  const handleSaveManualAsProtocol = () => {
    const freqOpt =
      MANUAL_FREQUENCY_OPTIONS.find(f => f.key === manualFrequencyKey) ||
      MANUAL_FREQUENCY_OPTIONS[2]

    let formulations: PaediatricFormulation[] = []
    if (manualFormulationType === 'preset') {
      const p = QUICK_STRENGTH_PRESETS[manualPresetStrengthIdx]
      if (p) formulations = [{ label: p.label, mgPerMl: p.mgPerMl }]
    } else if (manualFormulationType === 'custom') {
      const cMg = typeof manualCustomStrengthMg === 'number' ? manualCustomStrengthMg : 0
      const cMl = typeof manualCustomStrengthMl === 'number' ? manualCustomStrengthMl : 0
      if (cMg > 0 && cMl > 0) {
        formulations = [
          {
            label: `Sirap / Suspensi ${cMg}mg / ${cMl}mL (${Math.round((cMg / cMl) * 10) / 10}mg/mL)`,
            mgPerMl: cMg / cMl
          }
        ]
      }
    }

    const initialData: Partial<PaediatricDrugPreset> = {
      drugName: manualDrugName || 'Ubat Pediatrik Baru',
      hospitalName: 'Hospital / Unit Pediatrik',
      category: 'Antimikrobial / Pediatrik',
      route: 'Oral/IV',
      indications: [
        {
          id: `ind-${Date.now()}`,
          name: 'Indikasi Standard',
          doseFormula: `${manualDoseMgPerKg || 40} ${
            manualCalcMode === 'per_dose' ? 'mg/kg/dos' : 'mg/kg/hari'
          } (${freqOpt.key})`,
          calculationMode: manualCalcMode,
          doseMgPerKg: typeof manualDoseMgPerKg === 'number' ? manualDoseMgPerKg : 40,
          doseRangeLabel: `${manualDoseMgPerKg || 40} ${
            manualCalcMode === 'per_dose' ? 'mg/kg/dos' : 'mg/kg/hari'
          }`,
          dividedTimesPerDay: freqOpt.dividedTimes,
          frequencyLabel: freqOpt.label,
          maxSingleDoseMg: typeof manualMaxSingleDoseMg === 'number' ? manualMaxSingleDoseMg : 1000,
          maxDailyDoseMg: typeof manualMaxDailyDoseMg === 'number' ? manualMaxDailyDoseMg : 3000,
          standardFormulations: formulations,
          clinicalAdvice: manualNotes || 'Ambil mengikut arahan doktor/ahli farmasi hospital.'
        }
      ]
    }

    setEditingPreset(null)
    setInitialPresetValues(initialData)
    setIsAddEditModalOpen(true)
  }

  // Export JSON
  const handleExportJson = () => {
    try {
      const json = exportHospitalProtocolsJson()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `home_hospital_paediatric_protocols_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('success', 'Fail JSON protokol hospital berjaya dimuat turun.')
    } catch (err: any) {
      showToast('error', 'Gagal mengeksport fail protokol.')
    }
  }

  // Import JSON File Trigger
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const content = evt.target?.result as string
        const res = importHospitalProtocolsJson(content)
        loadPresets()
        showToast('success', `Berjaya mengimport ${res.count} protokol hospital!`)
      } catch (err: any) {
        showToast('error', err.message || 'Gagal mengimport protokol.')
      }
    }
    reader.readAsText(file)
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Reset to KKM Defaults
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Adakah anda pasti ingin menetapkan semula semua protokol kepada Standard KKM NAG 2024? Semua protokol amalan hospital tempatan akan dipadam.'
      )
    ) {
      resetCustomHospitalPresets()
      const all = loadPresets()
      if (all.length > 0) {
        setSelectedDrugId(all[0].id)
        setSelectedIndicationIndex(0)
        setSelectedFormulationIndex(0)
      }
      showToast('success', 'Protokol berjaya ditetapkan semula kepada Standard KKM asal.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl max-w-4xl w-full shadow-2xl border border-border-subtle overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-cyan-900 p-5 sm:p-6 text-white flex-shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md shadow-inner">
                <Calculator className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    H.O.M.E. Paediatric Dose Calculator
                  </h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300/30">
                    NAG 2024 &amp; Amalan Hospital
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Weight-based dose calculation (mg/kg) according to MOH Standards &amp; local hospital practice
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Add Custom Protocol Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingPreset(null)
                  setInitialPresetValues(null)
                  setIsAddEditModalOpen(true)
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Protokol Hospital</span>
                <span className="sm:hidden">Tambah</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-surface/10 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-surface text-emerald-400 dark:text-emerald-300 font-bold shadow-md scale-102'
                  : 'bg-white/10 text-emerald-100 hover:bg-surface/20'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Protokol Preset &amp; KKM ({presets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-surface text-emerald-400 dark:text-emerald-300 font-bold shadow-md scale-102'
                  : 'bg-white/10 text-emerald-100 hover:bg-surface/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Manual Calculation (Custom Ad-Hoc)</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {toastMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
              toastMsg.type === 'success'
                ? 'bg-emerald-100 text-emerald-400 dark:text-emerald-300 font-bold border-b border-emerald-500/20'
                : 'bg-rose-100 text-rose-400 dark:text-rose-300 font-bold border-b border-rose-500/20'
            }`}
          >
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-subtle/50">
          {/* Universal Weight Input Row */}
          <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-border-default shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>1. Enter Paediatric Patient Body Weight:</span>
              </label>
              <p className="text-[11px] text-text-muted">
                Gunakan berat sebenar pesakit (kg) untuk pengiraan dos selamat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-36 sm:w-44">
                <input
                  type="number"
                  min="0.2"
                  max="120"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Contoh: 12.5"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-xl text-lg font-black text-text-primary focus:outline-hidden focus:border-emerald-600 focus:bg-surface transition-colors text-right"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: PRESET & NAG KKM / HOSPITAL PRESETS */}
          {activeTab === 'preset' && (
            <div className="space-y-6">
              {/* Presets Controls & Source Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Source Filter Chips */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSourceFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        sourceFilter === 'ALL'
                          ? 'bg-surface text-text-primary shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Semua ({presets.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceFilter('KKM')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        sourceFilter === 'KKM'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      KKM Standard ({presets.filter(p => p.source === 'KKM_STANDARD').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceFilter('HOSPITAL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        sourceFilter === 'HOSPITAL'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Amalan Hospital ({presets.filter(p => p.source === 'HOSPITAL_CUSTOM').length})
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari ubat, indikasi, atau hospital..."
                      className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border-default rounded-xl text-xs text-text-primary placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Drug Preset Selector */}
                <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-border-default shadow-xs space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-text-primary flex items-center justify-between">
                      <span className="flex items-center gap-1.5 uppercase tracking-wide">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <span>2. Pilih Ubat &amp; Protokol:</span>
                      </span>
                      {activeDrug && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${
                            activeDrug.source === 'HOSPITAL_CUSTOM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-300'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {activeDrug.source === 'HOSPITAL_CUSTOM'
                            ? `🏥 ${activeDrug.hospitalName || 'Amalan Hospital'}`
                            : '🏛️ KKM Standard (NAG 2024)'}
                        </span>
                      )}
                    </label>

                    {filteredPresets.length > 0 ? (
                      <select
                        value={selectedDrugId}
                        onChange={e => {
                          setSelectedDrugId(e.target.value)
                          setSelectedIndicationIndex(0)
                          setSelectedFormulationIndex(0)
                        }}
                        className="w-full px-3.5 py-3 bg-subtle/50 border-2 border-border-default rounded-2xl text-xs sm:text-sm font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface cursor-pointer"
                      >
                        {filteredPresets.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.source === 'HOSPITAL_CUSTOM' ? '⭐ [HOSPITAL] ' : '[KKM] '}
                            {d.drugName} — {d.category} ({d.route})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 text-center bg-subtle/50 rounded-xl border border-border-default text-xs text-text-muted">
                        Tiada ubat dijumpai untuk carian ini.{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setSourceFilter('ALL')
                          }}
                          className="text-emerald-700 font-bold underline ml-1 cursor-pointer"
                        >
                          Reset Carian
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active Drug Meta & Custom Actions */}
                  {activeDrug && (
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-subtle text-text-secondary rounded-lg font-bold text-[11px]">
                          Laluan: {activeDrug.route}
                        </span>
                        <span className="px-2.5 py-0.5 bg-subtle text-text-secondary rounded-lg font-bold text-[11px]">
                          Kategori: {activeDrug.category}
                        </span>
                      </div>

                      {activeDrug.source === 'HOSPITAL_CUSTOM' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPreset(activeDrug)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-100 text-amber-400 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/20"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Kemaskini</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomPreset(activeDrug.id, activeDrug.drugName)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Padam</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Indication Selection */}
              {activeDrug && activeDrug.indications && activeDrug.indications.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>3. Pilih Indikasi Klinikal &amp; Tahap Keterukan:</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeDrug.indications.map((ind, idx) => (
                      <button
                        key={ind.id || idx}
                        type="button"
                        onClick={() => {
                          setSelectedIndicationIndex(idx)
                          setSelectedFormulationIndex(0)
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                          selectedIndicationIndex === idx
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 dark:text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-500'
                            : 'bg-surface border-border-default text-text-secondary hover:border-border-default'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm font-black text-text-primary">
                            {ind.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                            <span className="bg-subtle px-2 py-0.5 rounded-md font-bold text-emerald-400">
                              Formula: {ind.doseFormula}
                            </span>
                            <span className="bg-subtle px-2 py-0.5 rounded-md font-medium text-text-muted">
                              Kekerapan: {ind.frequencyLabel}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Mod: {ind.calculationMode === 'per_dose' ? 'mg/kg/dos' : 'mg/kg/hari'}
                            </span>
                          </div>
                        </div>
                        {selectedIndicationIndex === idx && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulation Selection (if liquid) */}
              {activeIndication &&
                activeIndication.standardFormulations &&
                activeIndication.standardFormulations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>4. Pilih Kepekatan Sirap / Suspensi:</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeIndication.standardFormulations.map((form, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => setSelectedFormulationIndex(fIdx)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedFormulationIndex === fIdx
                              ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500'
                              : 'bg-surface border border-border-default text-text-secondary hover:bg-subtle'
                          }`}
                        >
                          {form.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Preset Calculation Results Card */}
              {presetCalculationResults ? (
                <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between border-b border-white/15 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Baby className="w-5 h-5 text-emerald-300" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                        Hasil Pengiraan Dos ({presetCalculationResults.weight} kg)
                      </span>
                    </div>
                    <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-bold text-emerald-200 border border-white/10">
                      {presetCalculationResults.frequencyLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Single Dose Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wide">
                        Dos Setiap Kali Pemberian (Single Dose):
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                        <span>{presetCalculationResults.singleDoseMg}</span>
                        <span className="text-sm font-semibold text-emerald-300">mg</span>
                      </div>
                      {presetCalculationResults.singleDoseMl !== null && (
                        <div className="pt-1.5 text-sm font-black text-emerald-300 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-500/20 rounded-md border border-emerald-400/30">
                            = {presetCalculationResults.singleDoseMl} mL
                          </span>
                          <span className="text-xs font-normal text-emerald-100/80">
                            sirap / suspensi cecair
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total Daily Dose Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wide">
                        Total Daily Dose:
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                        <span>{presetCalculationResults.dailyMg}</span>
                        <span className="text-sm font-semibold text-emerald-300">mg / hari</span>
                      </div>
                      <div className="pt-1.5 text-xs text-emerald-100/90">
                        Diberikan <strong>{presetCalculationResults.dividedTimesPerDay} kali sehari</strong> ({presetCalculationResults.frequencyLabel})
                      </div>
                    </div>
                  </div>

                  {/* Safety Cap Alert */}
                  {(presetCalculationResults.isDailyCapped ||
                    presetCalculationResults.isSingleCapped) && (
                    <div className="p-3.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>Peringatan Had Dos Maksimum:</strong> Dos telah diselaraskan kepada had selamat tertinggi (Had Sekali: {activeIndication?.maxSingleDoseMg}mg | Had Harian: {activeIndication?.maxDailyDoseMg}mg).
                      </span>
                    </div>
                  )}

                  {/* Clinical Advice */}
                  {activeIndication?.clinicalAdvice && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs text-emerald-100/90 leading-relaxed flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Nasihat Klinikal &amp; Amalan Hospital: </strong>
                        {activeIndication.clinicalAdvice}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-surface rounded-2xl border border-border-default text-text-muted text-xs">
                  Please enter paediatric patient body weight above to display dose calculations.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUICK AD-HOC MANUAL CALCULATOR */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-400 dark:text-amber-300 font-bold">
                <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black">Quick Manual Calculation Mode (Custom Hospital Practice)</span>
                  <p className="text-amber-400 text-[11px]">
                    Gunakan borang pantas ini untuk memasukkan formula dos (mg/kg/dos atau mg/kg/hari) mengikut amalan wad atau panduan hospital anda secara langsung tanpa perlu simpan terlebih dahulu. Anda juga boleh klik &apos;Simpan Sebagai Protokol&apos; untuk kegunaan semula.
                  </p>
                </div>
              </div>

              {/* Manual Form Inputs */}
              <div className="bg-surface rounded-2xl p-5 border border-border-default shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Drug Label */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-xs font-bold text-text-secondary">
                      Nama Ubat / Label:
                    </label>
                    <input
                      type="text"
                      value={manualDrugName}
                      onChange={e => setManualDrugName(e.target.value)}
                      placeholder="Contoh: Meropenem IV / Ampicillin"
                      className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                    />
                  </div>

                  {/* Calculation Mode */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-xs font-bold text-text-secondary">
                      Mod Pengiraan Dos:
                    </label>
                    <select
                      value={manualCalcMode}
                      onChange={e => setManualCalcMode(e.target.value as PaediatricDoseCalculationMode)}
                      className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                    >
                      <option value="daily_divided">
                        Total Daily Dose (mg/kg/day) divided by frequency
                      </option>
                      <option value="per_dose">
                        Dos Sekali Pemberian (mg/kg/dos) setiap selang masa
                      </option>
                    </select>
                  </div>

                  {/* Target Dose */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-xs font-bold text-text-secondary flex items-center justify-between">
                      <span>
                        {manualCalcMode === 'per_dose' ? 'Dos Setiap Kali (mg/kg/dos):' : 'Jumlah Dos Harian (mg/kg/hari):'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={manualDoseMgPerKg}
                        onChange={e =>
                          setManualDoseMgPerKg(e.target.value === '' ? '' : parseFloat(e.target.value))
                        }
                        placeholder="Contoh: 15"
                        className="w-full px-3 pr-24 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-sm font-black text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                        {manualCalcMode === 'per_dose' ? 'mg/kg/dos' : 'mg/kg/hari'}
                      </span>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-xs font-bold text-text-secondary">
                      Kekerapan Pemberian (Frequency):
                    </label>
                    <select
                      value={manualFrequencyKey}
                      onChange={e => setManualFrequencyKey(e.target.value)}
                      className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                    >
                      {MANUAL_FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Formulation Strength Selector */}
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary">
                      Liquid / Syrup Volume Calculation (mL):
                    </label>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setManualFormulationType('preset')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          manualFormulationType === 'preset'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-subtle text-text-muted'
                        }`}
                      >
                        Kekuatan Lazim
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualFormulationType('custom')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          manualFormulationType === 'custom'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-subtle text-text-muted'
                        }`}
                      >
                        Manual (mg/mL)
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualFormulationType('none')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          manualFormulationType === 'none'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-subtle text-text-muted'
                        }`}
                      >
                        Tiada Cecair (mg sahaja)
                      </button>
                    </div>
                  </div>

                  {manualFormulationType === 'preset' && (
                    <select
                      value={manualPresetStrengthIdx}
                      onChange={e => setManualPresetStrengthIdx(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500"
                    >
                      {QUICK_STRENGTH_PRESETS.map((str, idx) => (
                        <option key={idx} value={idx}>
                          {str.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {manualFormulationType === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-text-muted">Jumlah mg:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={manualCustomStrengthMg}
                          onChange={e =>
                            setManualCustomStrengthMg(
                              e.target.value === '' ? '' : parseFloat(e.target.value)
                            )
                          }
                          placeholder="Contoh: 125"
                          className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-text-muted">Dalam Isipadu (mL):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={manualCustomStrengthMl}
                          onChange={e =>
                            setManualCustomStrengthMl(
                              e.target.value === '' ? '' : parseFloat(e.target.value)
                            )
                          }
                          placeholder="Contoh: 5"
                          className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Safety Caps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Had Maksimum Sekali Pemberian (mg):</span>
                    </label>
                    <input
                      type="number"
                      value={manualMaxSingleDoseMg}
                      onChange={e =>
                        setManualMaxSingleDoseMg(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      placeholder="Contoh: 500"
                      className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Had Maksimum Harian (mg/hari):</span>
                    </label>
                    <input
                      type="number"
                      value={manualMaxDailyDoseMg}
                      onChange={e =>
                        setManualMaxDailyDoseMg(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      placeholder="Contoh: 1500"
                      className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1 pt-2 border-t border-border-subtle">
                  <label className="text-[11px] font-bold text-text-secondary">
                    Nota Tambahan / Amalan Wad:
                  </label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={e => setManualNotes(e.target.value)}
                    placeholder="Contoh: Ambil selepas makan. Elakkan pemberian serentak dengan kalsium."
                    className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                  />
                </div>
              </div>

              {/* Manual Results Card */}
              {manualCalculationResults ? (
                <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between border-b border-white/15 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                        Manual Calculation Result ({manualCalculationResults.weight} kg)
                      </span>
                    </div>
                    <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-bold text-emerald-200 border border-white/10">
                      {manualCalculationResults.frequencyLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Single Dose Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wide">
                        Dos Setiap Kali Pemberian (Single Dose):
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                        <span>{manualCalculationResults.singleDoseMg}</span>
                        <span className="text-sm font-semibold text-amber-300">mg</span>
                      </div>
                      {manualCalculationResults.singleDoseMl !== null && (
                        <div className="pt-1.5 text-sm font-black text-emerald-300 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-500/20 rounded-md border border-emerald-400/30">
                            = {manualCalculationResults.singleDoseMl} mL
                          </span>
                          <span className="text-xs font-normal text-emerald-100/80">
                            sirap / suspensi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total Daily Dose Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wide">
                        Total Daily Dose:
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                        <span>{manualCalculationResults.dailyMg}</span>
                        <span className="text-sm font-semibold text-amber-300">mg / hari</span>
                      </div>
                      <div className="pt-1.5 text-xs text-emerald-100/90">
                        Dibahagi kepada <strong>{manualCalculationResults.dividedTimesPerDay} kali sehari</strong>
                      </div>
                    </div>
                  </div>

                  {/* Safety Cap Alert */}
                  {(manualCalculationResults.isDailyCapped ||
                    manualCalculationResults.isSingleCapped) && (
                    <div className="p-3.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>Peringatan Had Dos Maksimum:</strong> Dos telah dihadkan kepada nilai selamat tertinggi (Had Sekali: {manualCalculationResults.singleCap}mg | Had Harian: {manualCalculationResults.dailyCap}mg).
                      </span>
                    </div>
                  )}

                  {/* Save to Protocol Button */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-200/80">
                      Ingin menggunakan formula ini semula di wad anda?
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveManualAsProtocol}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Simpan Sebagai Protokol Hospital</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-surface rounded-2xl border border-border-default text-text-muted text-xs">
                  Sila masukkan berat pesakit dan nilai dos mg/kg untuk melihat hasil pengiraan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-surface border-t border-border-default flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
          {/* Left: Inter-hospital Export / Import / Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 bg-subtle hover:bg-subtle text-text-secondary rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Muat turun salinan fail JSON protokol hospital anda"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" />
              <span>Eksport Protokol (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-subtle hover:bg-subtle text-text-secondary rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Muat naik fail protokol hospital daripada wad/hospital lain"
            >
              <Upload className="w-3.5 h-3.5 text-text-muted" />
              <span>Import Protokol</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-2.5 py-1.5 bg-subtle hover:bg-rose-500/10 text-text-muted hover:text-rose-700 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset kepada senarai KKM asal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Standard KKM</span>
            </button>
          </div>

          {/* Right: Close Button */}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer self-end sm:self-auto"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Add / Edit Custom Hospital Protocol Modal */}
      <AddEditPaediatricProtocolModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setEditingPreset(null)
          setInitialPresetValues(null)
        }}
        editingPreset={editingPreset}
        initialValues={initialPresetValues}
        onSaved={saved => {
          loadPresets()
          setSelectedDrugId(saved.id)
          setSelectedIndicationIndex(0)
          setSelectedFormulationIndex(0)
          setActiveTab('preset')
          showToast('success', `Protokol "${saved.drugName}" berjaya disimpan.`)
        }}
      />
    </div>
  )
}

export default PaediatricDoseCalculatorModal
