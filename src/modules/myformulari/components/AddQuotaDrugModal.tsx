import React, { useState, useMemo } from 'react'
import {
  X,
  Search,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  DollarSign,
  Users,
  Shield,
  Layers,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react'
import { getAllFormulariDrugs } from '../services/formulariService'
import { DrugEntry, PrescriberCategory, PoisonCategory, SkimPerolehan } from '../types/formulariTypes'
import { DrugQuotaItem, QuotaCategory } from '../types/drugQuotaTypes'
import { addDrugQuota, getUniqueHospitals } from '../services/drugQuotaService'

interface AddQuotaDrugModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: DrugQuotaItem) => void
  defaultHospital?: string
}

export const AddQuotaDrugModal: React.FC<AddQuotaDrugModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultHospital = 'Hospital Lawas'
}) => {
  const [mode, setMode] = useState<'kkm_fukkm' | 'manual'>('kkm_fukkm')
  const [fukkmSearch, setFukkmSearch] = useState('')
  const [selectedDrug, setSelectedDrug] = useState<DrugEntry | null>(null)
  
  // Form fields
  const [genericName, setGenericName] = useState('')
  const [brandNames, setBrandNames] = useState('')
  const [mohDrugCode, setMohDrugCode] = useState('')
  const [atcCode, setAtcCode] = useState('')
  const [therapeuticClass, setTherapeuticClass] = useState('')
  const [category, setCategory] = useState<QuotaCategory>('KATEGORI_A_STAR')
  const [prescriberCategory, setPrescriberCategory] = useState<PrescriberCategory>('A*')
  const [poisonCategory, setPoisonCategory] = useState<PoisonCategory>('Group B')
  const [skimPerolehan, setSkimPerolehan] = useState<SkimPerolehan>('LP')
  
  const [dosageForm, setDosageForm] = useState('Tablet')
  const [strength, setStrength] = useState('')
  
  const [hospitalName, setHospitalName] = useState(defaultHospital)
  const [department, setDepartment] = useState('Klinik Kardiologi & NCD')
  const [allocationPeriod, setAllocationPeriod] = useState(`Bulanan (${new Date().toLocaleString('ms-MY', { month: 'long', year: 'numeric' })})`)
  
  const [monthlyQuota, setMonthlyQuota] = useState<number | ''>(1000)
  const [quotaUsed, setQuotaUsed] = useState<number | ''>(0)
  const [unit, setUnit] = useState('Tablets')
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(200)
  const [bufferStockLevel, setBufferStockLevel] = useState<number | ''>(100)
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(4.50)
  
  const [specialApprovalRef, setSpecialApprovalRef] = useState('')
  const [approvedPatientCount, setApprovedPatientCount] = useState<number | ''>(10)
  const [indicationsText, setIndicationsText] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const allFukkmDrugs = useMemo(() => getAllFormulariDrugs(), [])
  const hospitalList = useMemo(() => getUniqueHospitals(), [])

  // Filtered FUKKM results
  const filteredFukkm = useMemo(() => {
    if (!fukkmSearch.trim()) return allFukkmDrugs.slice(0, 15)
    const q = fukkmSearch.toLowerCase().trim()
    return allFukkmDrugs.filter(d => 
      d.genericName.toLowerCase().includes(q) ||
      d.brandNames.some(b => b.toLowerCase().includes(q)) ||
      (d.mohDrugCode && d.mohDrugCode.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [allFukkmDrugs, fukkmSearch])

  // When drug is selected from FUKKM list
  const handleSelectFukkmDrug = (drug: DrugEntry) => {
    setSelectedDrug(drug)
    setGenericName(drug.genericName)
    setBrandNames(drug.brandNames.join(', '))
    setMohDrugCode(drug.mohDrugCode || '')
    setAtcCode(drug.atcCode || '')
    setTherapeuticClass(drug.therapeuticClass || '')
    setPrescriberCategory(drug.prescriberCategory || 'A*')
    setPoisonCategory(drug.poisonCategory || 'Group B')
    setSkimPerolehan(drug.skimPerolehan || 'LP')
    setDosageForm(drug.dosageForms?.[0] || 'Tablet')
    setStrength(drug.strengths?.[0] || '')
    setIndicationsText(drug.indications?.join('\n') || '')

    // Auto classify category based on Prescriber / Name
    if (drug.prescriberCategory === 'A*') {
      if (drug.genericName.toLowerCase().includes('sacubitril') || 
          drug.genericName.toLowerCase().includes('entresto') ||
          drug.genericName.toLowerCase().includes('tocilizumab') ||
          drug.genericName.toLowerCase().includes('pembrolizumab') ||
          drug.genericName.toLowerCase().includes('somatropin')) {
        setCategory('KELULUSAN_KHAS_KPK')
      } else if (drug.genericName.toLowerCase().includes('adalimumab') || 
                 drug.genericName.toLowerCase().includes('trastuzumab') ||
                 drug.genericName.toLowerCase().includes('infliximab')) {
        setCategory('KOS_TINGGI_BIOLOGIK')
      } else if (drug.genericName.toLowerCase().includes('tacrolimus') || 
                 drug.genericName.toLowerCase().includes('ciclosporin') ||
                 drug.genericName.toLowerCase().includes('epoetin')) {
        setCategory('PROGRAM_KHAS_KKM')
      } else {
        setCategory('KATEGORI_A_STAR')
      }
    } else if (drug.isHAM) {
      setCategory('HIGH_ALERT_MEDICATION')
    } else {
      setCategory('KAWALAN_TERHAD_HOSPITAL')
    }

    if (drug.quota) {
      setMonthlyQuota(drug.quota.monthlyQuota || 1000)
      setQuotaUsed(drug.quota.quotaUsed || 0)
      setUnit(drug.quota.unit || 'Tablets')
      setLowStockThreshold(drug.quota.lowStockThreshold || Math.round((drug.quota.monthlyQuota || 1000) * 0.2))
      setBufferStockLevel(drug.quota.bufferStockLevel || Math.round((drug.quota.monthlyQuota || 1000) * 0.1))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!genericName.trim()) {
      setErrorMsg('Sila masukkan Nama Generik Ubat.')
      return
    }

    if (monthlyQuota === '' || Number(monthlyQuota) <= 0) {
      setErrorMsg('Sila tetapkan Siling Kuota Bulanan yang sah (> 0).')
      return
    }

    const brandArray = brandNames.split(',').map(b => b.trim()).filter(Boolean)
    const indicationsArray = indicationsText.split('\n').map(i => i.trim()).filter(Boolean)

    const newItem = addDrugQuota({
      drugId: selectedDrug?.id,
      genericName: genericName.trim(),
      brandNames: brandArray.length > 0 ? brandArray : [genericName.trim()],
      mohDrugCode: mohDrugCode.trim() || undefined,
      atcCode: atcCode.trim() || undefined,
      therapeuticClass: therapeuticClass.trim() || undefined,
      category,
      prescriberCategory,
      poisonCategory,
      skimPerolehan,
      dosageForm: dosageForm.trim() || 'Tablet',
      strength: strength.trim() || 'Standard',
      hospitalName: hospitalName.trim() || defaultHospital,
      department: department.trim() || 'Farmasi Hospital',
      allocationPeriod: allocationPeriod.trim() || 'Bulanan',
      monthlyQuota: Number(monthlyQuota),
      quotaUsed: Number(quotaUsed) || 0,
      quotaRemaining: Math.max(0, Number(monthlyQuota) - (Number(quotaUsed) || 0)),
      unit: unit.trim() || 'Unit',
      lowStockThreshold: Number(lowStockThreshold) || Math.round(Number(monthlyQuota) * 0.2),
      bufferStockLevel: Number(bufferStockLevel) || Math.round(Number(monthlyQuota) * 0.1),
      isLowStock: false,
      isCriticalShortage: false,
      estimatedRunOutDays: 30,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      costPerUnit: Number(costPerUnit) || 0,
      totalBudgetRM: Math.round(Number(monthlyQuota) * (Number(costPerUnit) || 0) * 100) / 100,
      usedBudgetRM: Math.round((Number(quotaUsed) || 0) * (Number(costPerUnit) || 0) * 100) / 100,
      specialApprovalRef: specialApprovalRef.trim() || undefined,
      approvedPatientCount: Number(approvedPatientCount) || 0,
      approvedIndications: indicationsArray,
      alternativeDrugs: selectedDrug?.alternativeDrugs?.map(a => ({
        drugId: a.drugId,
        drugName: a.drugName,
        therapeuticEquivalence: a.therapeuticEquivalence,
        reasonForChoice: a.reasonForChoice,
        stockStatus: a.stockStatus
      })),
      notes: notes.trim() || undefined,
      verifiedBy: 'Pegawai Farmasi Hospital',
      isManualCustomDrug: mode === 'manual'
    })

    onSuccess(newItem)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Plus className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Tambah Kuota Ubat Hospital Baru</h2>
              <p className="text-xs text-indigo-200 font-medium">
                Penyelarasan Kuota Ubat Kos Tinggi, Kelulusan Khas KPK & Kategori A* FUKKM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface/10 rounded-xl text-white/80 hover:text-white transition-colors relative z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Mode Toggle */}
        <div className="p-4 bg-subtle/50 border-b border-border-default flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('kkm_fukkm')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                mode === 'kkm_fukkm'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-surface text-text-muted border border-border-default hover:bg-subtle'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Pilih dari Pangkalan Data FUKKM KKM (Auto-fill)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('manual')
                setSelectedDrug(null)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                mode === 'manual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-surface text-text-muted border border-border-default hover:bg-subtle'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Entri Manual / Khas Hospital</span>
            </button>
          </div>

          <span className="text-xs font-medium text-text-muted">
            Fasiliti: <strong className="text-indigo-700">{hospitalName}</strong>
          </span>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FUKKM Search Panel */}
          {mode === 'kkm_fukkm' && (
            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100 space-y-3">
              <label className="text-xs font-bold text-indigo-400 dark:text-indigo-300 font-bold flex items-center justify-between">
                <span>Carian Ubat FUKKM Rasmi KKM:</span>
                <span className="text-[11px] font-normal text-indigo-700">Contoh: Apixaban, Empagliflozin, Entresto, Ciclosporin, Tocilizumab</span>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fukkmSearch}
                  onChange={e => setFukkmSearch(e.target.value)}
                  placeholder="Taip nama generik ubat atau jenama dagang..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-indigo-500/20 rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-indigo-500 shadow-xs"
                />
              </div>

              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-text-muted font-semibold self-center">Pilihan Pantas:</span>
                {['Apixaban', 'Empagliflozin', 'Dapagliflozin', 'Entresto', 'Ciclosporin', 'Tacrolimus', 'Tocilizumab', 'Adalimumab', 'Pembrolizumab'].map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFukkmSearch(name)}
                    className="px-2.5 py-1 bg-surface hover:bg-indigo-100 border border-indigo-500/20 rounded-lg text-[11px] font-semibold text-indigo-400 dark:text-indigo-300 font-bold transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Suggestions Dropdown / Grid */}
              <div className="max-h-40 overflow-y-auto bg-surface rounded-xl border border-border-default divide-y divide-border-subtle">
                {filteredFukkm.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectFukkmDrug(d)}
                    className={`p-3 text-xs flex items-center justify-between hover:bg-indigo-500/10 cursor-pointer transition-colors ${
                      selectedDrug?.id === d.id ? 'bg-indigo-100/70 font-bold text-indigo-400 dark:text-indigo-300 font-bold border-l-4 border-indigo-600' : 'text-text-primary'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-text-primary block">{d.genericName}</span>
                      <span className="text-[11px] text-text-muted">
                        {d.brandNames.join(', ')} • Kategori: <strong className="text-indigo-700">{d.prescriberCategory}</strong> • {d.strengths?.join(', ')}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-500/20">
                      {selectedDrug?.id === d.id ? 'Terpilih ✓' : 'Pilih Ubat →'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Maklumat Asas Ubat */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              1. Maklumat Ubat & Klasifikasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Generik Ubat (INN) *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  placeholder="Contoh: Apixaban 2.5mg Film-Coated Tablet"
                  className="w-full px-3.5 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-indigo-500 focus:bg-surface"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Dagang / Jenama (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={brandNames}
                  onChange={e => setBrandNames(e.target.value)}
                  placeholder="Contoh: Eliquis, Apixaban (MOHMF)"
                  className="w-full px-3.5 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-indigo-500 focus:bg-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kategori Kawalan Kuota *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as QuotaCategory)}
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="KELULUSAN_KHAS_KPK">Kelulusan Khas KPK (Ketua Pengarah Kesihatan)</option>
                  <option value="KATEGORI_A_STAR">Ubat Kategori A* (Pakar Subkepakaran)</option>
                  <option value="KOS_TINGGI_BIOLOGIK">Ubat Kos Tinggi & Biologik / Dana Khas</option>
                  <option value="PROGRAM_KHAS_KKM">Program Khas KKM (Transplan/Nefro/Onko)</option>
                  <option value="HIGH_ALERT_MEDICATION">High Alert Medication (HAM)</option>
                  <option value="KAWALAN_TERHAD_HOSPITAL">Kawalan Kuota Terhad Hospital / Wad</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kategori Preskriber FUKKM</label>
                <select
                  value={prescriberCategory}
                  onChange={e => setPrescriberCategory(e.target.value as PrescriberCategory)}
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="A*">A* - Pakar Perunding Subkepakaran</option>
                  <option value="A">A - Pakar Perubatan Am</option>
                  <option value="A/KK">A/KK - Pakar Klinik Kesihatan</option>
                  <option value="B">B - Pegawai Perubatan (MO)</option>
                  <option value="C">C - Paramedik / Penolong Pegawai Perubatan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kategori Racun</label>
                <select
                  value={poisonCategory}
                  onChange={e => setPoisonCategory(e.target.value as PoisonCategory)}
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Group B">Group B (Prescription Only)</option>
                  <option value="Group C">Group C (Pharmacy Only)</option>
                  <option value="Dangerous Drug (DD)">Dangerous Drug (DD / Dadah Berbahaya)</option>
                  <option value="Psychotropic (PS)">Psychotropic (PS / Psikotropik)</option>
                  <option value="Over-the-Counter (OTC)">Over-the-Counter (OTC)</option>
                  <option value="Exempt">Exempt / Dikecualikan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Bentuk Dos (Dosage Form)</label>
                <input
                  type="text"
                  value={dosageForm}
                  onChange={e => setDosageForm(e.target.value)}
                  placeholder="Tablet / Kapsul / Vial / Pen"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kekuatan (Strength)</label>
                <input
                  type="text"
                  value={strength}
                  onChange={e => setStrength(e.target.value)}
                  placeholder="2.5mg / 10mg / 100mg/10mL"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Skim Perolehan</label>
                <select
                  value={skimPerolehan}
                  onChange={e => setSkimPerolehan(e.target.value as SkimPerolehan)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary"
                >
                  <option value="LP">LP - Local Purchase (Perolehan Tempatan)</option>
                  <option value="APPL">APPL - Approved Product Purchase List</option>
                  <option value="CCDP">CCDP - Central Contract</option>
                  <option value="Khas">Khas - Peruntukan Khas / Dana Khas</option>
                  <option value="Derma/Sumbangan">Derma / Sumbangan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Penetapan Kuota & Fasiliti Hospital */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              2. Penetapan Kuota & Lokasi Fasiliti Hospital
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Hospital / Fasiliti *</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="Contoh: Hospital Lawas"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Jabatan / Klinik Pengguna *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Klinik Kardiologi / Nefrologi / Wad"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Tempoh Peruntukan Kuota</label>
                <input
                  type="text"
                  value={allocationPeriod}
                  onChange={e => setAllocationPeriod(e.target.value)}
                  placeholder="Bulanan (Ogos 2026)"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Siling Kuota Diperuntukkan *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={monthlyQuota}
                  onChange={e => setMonthlyQuota(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-indigo-500/10 border border-indigo-300 rounded-xl text-xs text-indigo-400 dark:text-indigo-300 font-bold font-black text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Telah Digunakan (Kuantiti Awal)</label>
                <input
                  type="number"
                  min="0"
                  value={quotaUsed}
                  onChange={e => setQuotaUsed(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-bold text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Unit Ukuran Kuota</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                >
                  <option value="Tablets">Tablets (Biji)</option>
                  <option value="Capsules">Capsules (Kapsul)</option>
                  <option value="Vials">Vials (Vial)</option>
                  <option value="PFS">PFS (Picagari Pra-Isi)</option>
                  <option value="Pens">Pens (Pen Suntikan)</option>
                  <option value="Ampoules">Ampoules (Ampul)</option>
                  <option value="Bottles">Bottles (Botol)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Anggaran Kos Seunit (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPerUnit}
                  onChange={e => setCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-semibold text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">Paras Ambang Stok Rendah (Low Stock Alert)</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="200"
                  className="w-full px-3 py-2 bg-amber-500/10 border border-amber-300 rounded-xl text-xs text-amber-400 dark:text-amber-300 font-bold font-bold text-right"
                />
                <span className="text-[10px] text-amber-700 block mt-0.5">Amaran tercetus apabila baki kuota mencapai paras ini.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-rose-400 block mb-1">Paras Stok Penampan (Buffer Stock Minima)</label>
                <input
                  type="number"
                  min="0"
                  value={bufferStockLevel}
                  onChange={e => setBufferStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-rose-500/10 border border-rose-300 rounded-xl text-xs text-rose-400 dark:text-rose-300 font-bold font-bold text-right"
                />
                <span className="text-[10px] text-rose-700 block mt-0.5">Paras kritikal rizab kecemasan fasiliti.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Maklumat Kelulusan Khas & Pesakit */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              3. Maklumat Kelulusan Khas KPK & Bilangan Pesakit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">No. Rujukan Surat Kelulusan KPK / JKUT</label>
                <input
                  type="text"
                  value={specialApprovalRef}
                  onChange={e => setSpecialApprovalRef(e.target.value)}
                  placeholder="Contoh: KKM/BFP/600-4/1/12 (KPK) atau JKUT/HLWS/2026/08"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Bilangan Pesakit Aktif Berdaftar di Bawah Kuota</label>
                <input
                  type="number"
                  min="0"
                  value={approvedPatientCount}
                  onChange={e => setApprovedPatientCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-bold text-right"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Indikasi Diluluskan (Satu baris setiap indikasi)</label>
              <textarea
                rows={2}
                value={indicationsText}
                onChange={e => setIndicationsText(e.target.value)}
                placeholder="Masukkan indikasi klinikal yang diluluskan bagi kuota ini..."
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Catatan / Justifikasi Kuota</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan tambahan keperluan fasiliti atau syarat semakan klinikal..."
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>
          </div>

          {/* Budget Preview Summary Box */}
          <div className="p-4 bg-subtle rounded-2xl border border-border-default flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-text-muted font-medium block">Baki Kuota Awal:</span>
              <strong className="text-text-primary text-sm">
                {(Number(monthlyQuota) || 0) - (Number(quotaUsed) || 0)} {unit}
              </strong>
            </div>
            <div>
              <span className="text-text-muted font-medium block">Anggaran Peruntukan Nilai (RM):</span>
              <strong className="text-indigo-400 dark:text-indigo-300 font-bold text-sm">
                RM {((Number(monthlyQuota) || 0) * (Number(costPerUnit) || 0)).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span className="text-text-muted font-medium block">Kategori Kawalan:</span>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-400 rounded-full font-bold text-[11px]">
                {category.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface border border-border-default hover:bg-subtle/50 rounded-xl text-xs font-bold text-text-secondary cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-surface border border-border-default hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Daftar Kuota Ubat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
