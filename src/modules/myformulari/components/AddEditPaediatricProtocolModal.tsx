import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Building2,
  Pill,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldAlert,
  FileText,
  Save,
  Check
} from 'lucide-react'
import {
  PaediatricDrugPreset,
  PaediatricIndication,
  PaediatricFormulation,
  PaediatricRoute,
  PaediatricDoseCalculationMode
} from '../types/paediatricDoseTypes'
import { saveCustomHospitalPreset } from '../services/paediatricDoseService'

interface AddEditPaediatricProtocolModalProps {
  isOpen: boolean
  onClose: () => void
  editingPreset?: PaediatricDrugPreset | null
  initialValues?: Partial<PaediatricDrugPreset> | null
  onSaved?: (savedPreset: PaediatricDrugPreset) => void
}

const FREQUENCY_OPTIONS = [
  { key: 'OD', label: 'OD (Sekali Sehari / Q24H)', dividedTimes: 1 },
  { key: 'BD', label: 'BD (2 Kali Sehari / Q12H)', dividedTimes: 2 },
  { key: 'TDS', label: 'TDS (3 Kali Sehari / Q8H)', dividedTimes: 3 },
  { key: 'QID', label: 'QID (4 Kali Sehari / Q6H)', dividedTimes: 4 },
  { key: 'Q4H', label: 'Q4H (6 Kali Sehari / Setiap 4 Jam)', dividedTimes: 6 },
  { key: 'STAT', label: 'Stat (Satu Dos Tunggal)', dividedTimes: 1 },
  { key: 'PRN', label: 'PRN (Bila Perlu / Maks 4x)', dividedTimes: 4 }
]

const QUICK_FORMULATIONS = [
  { label: 'Suspensi 125mg / 5mL (25mg/mL)', mgPerMl: 25 },
  { label: 'Suspensi 250mg / 5mL (50mg/mL)', mgPerMl: 50 },
  { label: 'Suspensi 200mg / 5mL (40mg/mL)', mgPerMl: 40 },
  { label: 'Suspensi 100mg / 5mL (20mg/mL)', mgPerMl: 20 },
  { label: 'Syrup 156.25mg / 5mL (Amox 125mg)', mgPerMl: 25 },
  { label: 'Syrup Forte 312.5mg / 5mL (Amox 250mg)', mgPerMl: 50 },
  { label: 'Suspensi Forte BID 457mg / 5mL (80mg/mL)', mgPerMl: 80 },
  { label: 'Sirap 120mg / 5mL (24mg/mL)', mgPerMl: 24 },
  { label: 'Sirap 5mg / 5mL (1mg/mL)', mgPerMl: 1 },
  { label: 'Sirap 2mg / 5mL (0.4mg/mL)', mgPerMl: 0.4 },
  { label: 'Sirap 15mg / 5mL (3mg/mL)', mgPerMl: 3 },
  { label: 'Injeksi IV 10mg / 1mL (10mg/mL)', mgPerMl: 10 },
  { label: 'Injeksi IV 50mg / 1mL (50mg/mL)', mgPerMl: 50 },
  { label: 'Injeksi IV 100mg / 1mL (100mg/mL)', mgPerMl: 100 }
]

export const AddEditPaediatricProtocolModal: React.FC<AddEditPaediatricProtocolModalProps> = ({
  isOpen,
  onClose,
  editingPreset,
  initialValues,
  onSaved
}) => {
  const [hospitalName, setHospitalName] = useState<string>('')
  const [drugName, setDrugName] = useState<string>('')
  const [category, setCategory] = useState<string>('Antimikrobial')
  const [route, setRoute] = useState<PaediatricRoute>('Oral/IV')
  const [indications, setIndications] = useState<PaediatricIndication[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null)
      setIsSuccess(false)
      return
    }

    if (editingPreset) {
      setHospitalName(editingPreset.hospitalName || 'Amalan Hospital Tempatan')
      setDrugName(editingPreset.drugName || '')
      setCategory(editingPreset.category || 'Antimikrobial')
      setRoute(editingPreset.route || 'Oral/IV')
      setIndications(
        editingPreset.indications && editingPreset.indications.length > 0
          ? JSON.parse(JSON.stringify(editingPreset.indications))
          : [createEmptyIndication()]
      )
    } else if (initialValues) {
      setHospitalName(initialValues.hospitalName || 'Amalan Hospital Tempatan')
      setDrugName(initialValues.drugName || '')
      setCategory(initialValues.category || 'Antimikrobial')
      setRoute(initialValues.route || 'Oral/IV')
      setIndications(
        initialValues.indications && initialValues.indications.length > 0
          ? JSON.parse(JSON.stringify(initialValues.indications))
          : [createEmptyIndication()]
      )
    } else {
      setHospitalName('Hospital / Jabatan Pediatrik')
      setDrugName('')
      setCategory('Antimikrobial')
      setRoute('Oral/IV')
      setIndications([createEmptyIndication()])
    }
  }, [isOpen, editingPreset, initialValues])

  function createEmptyIndication(): PaediatricIndication {
    return {
      id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: 'Jangkitan Standard / Indikasi Utama',
      doseFormula: '30 - 50 mg/kg/hari dibahagi TDS',
      calculationMode: 'daily_divided',
      doseMgPerKg: 40,
      doseRangeLabel: '30 - 50 mg/kg/hari',
      dividedTimesPerDay: 3,
      frequencyLabel: 'TDS (Setiap 8 Jam)',
      maxDailyDoseMg: 2000,
      maxSingleDoseMg: 500,
      standardFormulations: [
        { label: 'Suspensi 125mg / 5mL (25mg/mL)', mgPerMl: 25 },
        { label: 'Suspensi Forte 250mg / 5mL (50mg/mL)', mgPerMl: 50 }
      ],
      clinicalAdvice: 'Beri mengikut amalan protokol hospital. Pantau tindak balas klinikal pesakit.'
    }
  }

  const handleAddIndication = () => {
    setIndications(prev => [...prev, createEmptyIndication()])
  }

  const handleRemoveIndication = (index: number) => {
    if (indications.length <= 1) {
      setErrorMsg('Protokol mesti mengandungi sekurang-kurangnya satu indikasi klinikal.')
      return
    }
    setIndications(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleUpdateIndication = (index: number, fields: Partial<PaediatricIndication>) => {
    setIndications(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...fields }
      return updated
    })
  }

  const handleAddFormulationToIndication = (indIndex: number, form: PaediatricFormulation) => {
    setIndications(prev => {
      const updated = [...prev]
      const currentForms = updated[indIndex].standardFormulations || []
      // Check if already exists
      if (!currentForms.some(f => f.label === form.label)) {
        updated[indIndex] = {
          ...updated[indIndex],
          standardFormulations: [...currentForms, form]
        }
      }
      return updated
    })
  }

  const handleRemoveFormulationFromIndication = (indIndex: number, formIndex: number) => {
    setIndications(prev => {
      const updated = [...prev]
      const currentForms = updated[indIndex].standardFormulations || []
      updated[indIndex] = {
        ...updated[indIndex],
        standardFormulations: currentForms.filter((_, idx) => idx !== formIndex)
      }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!drugName.trim()) {
      setErrorMsg('Sila masukkan Nama Ubat.')
      return
    }

    if (!hospitalName.trim()) {
      setErrorMsg('Sila nyatakan Nama Hospital / Jabatan amalan protokol ini.')
      return
    }

    if (indications.length === 0) {
      setErrorMsg('Sila tambah sekurang-kurangnya satu indikasi.')
      return
    }

    for (let i = 0; i < indications.length; i++) {
      const ind = indications[i]
      if (!ind.name.trim()) {
        setErrorMsg(`Indikasi #${i + 1}: Sila isi nama indikasi.`)
        return
      }
      if (!ind.doseMgPerKg || ind.doseMgPerKg <= 0) {
        setErrorMsg(`Indikasi #${i + 1}: Sila masukkan nilai dos mg/kg yang sah.`)
        return
      }
    }

    const presetToSave: PaediatricDrugPreset = {
      id: editingPreset?.id || `custom-hosp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      drugName: drugName.trim(),
      category: category.trim() || 'Antimikrobial',
      route,
      isCustom: true,
      hospitalName: hospitalName.trim(),
      source: 'HOSPITAL_CUSTOM',
      indications
    }

    try {
      saveCustomHospitalPreset(presetToSave)
      setIsSuccess(true)
      if (onSaved) onSaved(presetToSave)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan protokol hospital.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl max-w-3xl w-full shadow-2xl border border-border-subtle overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md">
                <Building2 className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {editingPreset ? 'Kemaskini Protokol Hospital' : 'Tambah Protokol Dos Pediatrik Hospital'}
                  </h3>
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full font-bold border border-amber-300/30">
                    Amalan Tempatan
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Daftar formula &amp; dos pediatrik mengikut amalan klinikal khusus hospital anda
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-surface/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Protokol hospital berjaya disimpan!</span>
            </div>
          )}

          {/* Section 1: Hospital & Drug Info */}
          <div className="bg-subtle/50 rounded-2xl p-4 border border-border-default space-y-4">
            <div className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Maklumat Hospital &amp; Ubat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Hospital Name */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  Nama Hospital / Wad / Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="Contoh: Hospital Selayang / PICU"
                  className="w-full px-3 py-2.5 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Drug Name */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  Nama Ubat Pediatrik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={drugName}
                  onChange={e => setDrugName(e.target.value)}
                  placeholder="Contoh: Meropenem IV / Ampicillin Syrup"
                  className="w-full px-3 py-2.5 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  Kategori Farmakologi
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Contoh: Carbapenem, Cephalosporin, Penicillin"
                  className="w-full px-3 py-2.5 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Route */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  Laluan Pemberian (Route)
                </label>
                <select
                  value={route}
                  onChange={e => setRoute(e.target.value as PaediatricRoute)}
                  className="w-full px-3 py-2.5 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Oral">Oral (Sirap / Tablet)</option>
                  <option value="IV">IV (Intravenous Parenteral)</option>
                  <option value="Oral/IV">Oral / IV</option>
                  <option value="IM">IM (Intramuscular)</option>
                  <option value="Inhalation">Inhalasi (MDI / Nebulizer)</option>
                  <option value="Rectal">Rektal (Suppositori)</option>
                  <option value="Topical">Topikal</option>
                  <option value="SC">SC (Subcutaneous)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Indications & Dosing Regimens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Indikasi Klinikal &amp; Formula Pengiraan Dos ({indications.length})</span>
              </div>
              <button
                type="button"
                onClick={handleAddIndication}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Indikasi</span>
              </button>
            </div>

            <div className="space-y-4">
              {indications.map((ind, indIdx) => (
                <div
                  key={ind.id || indIdx}
                  className="bg-surface rounded-2xl p-4 sm:p-5 border-2 border-emerald-100 shadow-xs space-y-4 relative"
                >
                  {/* Indication Header */}
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                        {indIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-text-primary">
                        Indikasi Klinikal #{indIdx + 1}
                      </span>
                    </div>

                    {indications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIndication(indIdx)}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam</span>
                      </button>
                    )}
                  </div>

                  {/* Indication Name & Formula Label */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-text-secondary">
                        Nama Indikasi / Diagnosis <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ind.name}
                        onChange={e => handleUpdateIndication(indIdx, { name: e.target.value })}
                        placeholder="Contoh: Sepsis Teruk / Meningitis / CAP"
                        className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                        required
                      />
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-text-secondary">
                        Formula Teks Paparan
                      </label>
                      <input
                        type="text"
                        value={ind.doseFormula}
                        onChange={e => handleUpdateIndication(indIdx, { doseFormula: e.target.value })}
                        placeholder="Contoh: 40 mg/kg/dos IV Q8H"
                        className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                      />
                    </div>
                  </div>

                  {/* Calculation Mode & Dose Values */}
                  <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Calculation Mode */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-emerald-400 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <span>Mod Pengiraan Dos:</span>
                        </label>
                        <select
                          value={ind.calculationMode || 'daily_divided'}
                          onChange={e => {
                            const newMode = e.target.value as PaediatricDoseCalculationMode
                            handleUpdateIndication(indIdx, { calculationMode: newMode })
                          }}
                          className="w-full px-3 py-2 bg-surface border border-emerald-500/20 rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500"
                        >
                          <option value="daily_divided">
                            Jumlah Dos Harian (mg/kg/hari) dibahagi N kali
                          </option>
                          <option value="per_dose">
                            Dos Sekali Pemberian (mg/kg/dos) terus setiap selang masa
                          </option>
                        </select>
                      </div>

                      {/* Dose Value */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-emerald-400 dark:text-emerald-300 font-bold">
                          {ind.calculationMode === 'per_dose'
                            ? 'Nilai Dos (mg/kg/dos):'
                            : 'Nilai Dos Harian (mg/kg/hari):'}{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={ind.doseMgPerKg || ''}
                            onChange={e =>
                              handleUpdateIndication(indIdx, {
                                doseMgPerKg: e.target.value === '' ? 0 : parseFloat(e.target.value)
                              })
                            }
                            placeholder="Contoh: 40"
                            className="w-full px-3 pr-20 py-2 bg-surface border border-emerald-500/20 rounded-xl text-xs font-black text-text-primary focus:outline-hidden focus:border-emerald-500"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted">
                            {ind.calculationMode === 'per_dose' ? 'mg/kg/dos' : 'mg/kg/hari'}
                          </span>
                        </div>
                      </div>

                      {/* Frequency Selection */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-text-secondary">
                          Kekerapan Pemberian (Frequency):
                        </label>
                        <select
                          value={
                            FREQUENCY_OPTIONS.find(f => f.dividedTimes === ind.dividedTimesPerDay)?.key ||
                            'TDS'
                          }
                          onChange={e => {
                            const opt = FREQUENCY_OPTIONS.find(f => f.key === e.target.value)
                            if (opt) {
                              handleUpdateIndication(indIdx, {
                                dividedTimesPerDay: opt.dividedTimes,
                                frequencyLabel: opt.label
                              })
                            }
                          }}
                          className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500"
                        >
                          {FREQUENCY_OPTIONS.map(opt => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Frequency Label Custom text */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-text-secondary">
                          Label Kekerapan Paparan:
                        </label>
                        <input
                          type="text"
                          value={ind.frequencyLabel}
                          onChange={e =>
                            handleUpdateIndication(indIdx, { frequencyLabel: e.target.value })
                          }
                          placeholder="Contoh: TDS (Setiap 8 Jam)"
                          className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dose Limits (Caps) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Had Maksimum Sekali Pemberian (Single Cap mg):</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={ind.maxSingleDoseMg || ''}
                        onChange={e =>
                          handleUpdateIndication(indIdx, {
                            maxSingleDoseMg: e.target.value === '' ? 0 : parseFloat(e.target.value)
                          })
                        }
                        placeholder="Contoh: 1000 mg"
                        className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                      />
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Had Maksimum Harian (Daily Cap mg):</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={ind.maxDailyDoseMg || ''}
                        onChange={e =>
                          handleUpdateIndication(indIdx, {
                            maxDailyDoseMg: e.target.value === '' ? 0 : parseFloat(e.target.value)
                          })
                        }
                        placeholder="Contoh: 3000 mg"
                        className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                      />
                    </div>
                  </div>

                  {/* Formulations & Liquid Strengths */}
                  <div className="space-y-2 pt-1 border-t border-border-subtle">
                    <label className="text-[11px] font-bold text-text-secondary flex items-center justify-between">
                      <span>Kekuatan Formulasi Cecair / Suspensi (mg/mL):</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Pilih atau tambah kepekatan cecair
                      </span>
                    </label>

                    {/* Active Formulations List */}
                    {ind.standardFormulations && ind.standardFormulations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ind.standardFormulations.map((form, fIdx) => (
                          <div
                            key={fIdx}
                            className="bg-accent-base/10 border border-accent-base/20 text-teal-900 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            <span>{form.label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFormulationFromIndication(indIdx, fIdx)}
                              className="text-teal-600 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Tiada formulasi cecair dipilih (kiraan mg sahaja).
                      </p>
                    )}

                    {/* Quick Add Formulations dropdown / buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 self-center mr-1">
                        + Tambah Pantas:
                      </span>
                      {QUICK_FORMULATIONS.slice(0, 6).map((qf, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleAddFormulationToIndication(indIdx, qf)}
                          className="px-2 py-0.5 bg-subtle hover:bg-emerald-100 hover:text-emerald-400 text-text-muted rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          {qf.label.split('(')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Advice Note */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nasihat Klinikal &amp; Amalan Hospital:</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ind.clinicalAdvice}
                      onChange={e =>
                        handleUpdateIndication(indIdx, { clinicalAdvice: e.target.value })
                      }
                      placeholder="Contoh: Beri selepas makan. Goncang botol dengan baik. Pantau paras TDM."
                      className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-emerald-500 focus:bg-surface"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-subtle hover:bg-subtle text-text-secondary rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-accent-base hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingPreset ? 'Simpan Perubahan' : 'Daftar Protokol Hospital'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditPaediatricProtocolModal
