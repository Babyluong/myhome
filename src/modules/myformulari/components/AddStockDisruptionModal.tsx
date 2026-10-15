import React, { useState } from 'react'
import { X, AlertTriangle, Layers, Plus, Trash2, CheckCircle2, Pill, Package, Clock } from 'lucide-react'
import {
  StockDisruptionRecord,
  DisruptionSeverity,
  StabilizationStage,
  DisruptionAlternativeOption,
  DisruptionItemType,
  NonDrugCategory
} from '../types/stockDisruptionTypes'
import { PrescriberCategory, PoisonCategory } from '../types/formulariTypes'
import { addStockDisruption } from '../services/stockDisruptionService'

interface AddStockDisruptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newRecord: StockDisruptionRecord) => void
}

const NON_DRUG_CATEGORIES: NonDrugCategory[] = [
  'Pakai Buang Perubatan (Medical Consumables)',
  'Peralatan Pembedahan & OT (Surgical Supplies)',
  'Reagen & Kit Makmal (Lab Reagents)',
  'Peralatan Rawatan Rapi & HDU (ICU Supplies)',
  'Alat Perlindungan Diri (PPE)',
  'Terapi Oksigen & Respiratori (Respiratory/Oxygen Consumables)',
  'Peralatan Ortopedik & Balutan (Wound Care & Ortho)',
  'Peralatan Radiologi & Pengimejan',
  'Lain-lain Bukan Ubat'
]

export const AddStockDisruptionModal: React.FC<AddStockDisruptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [itemType, setItemType] = useState<DisruptionItemType>('DRUG')

  // Common Fields
  const [genericName, setGenericName] = useState('')
  const [brandNames, setBrandNames] = useState('')
  const [departmentAffected, setDepartmentAffected] = useState('Unit Kecemasan & Trauma (ETD)')
  const [severity, setSeverity] = useState<DisruptionSeverity>('CRITICAL_OUT_OF_STOCK')
  const [currentBalanceText, setCurrentBalanceText] = useState('')
  const [disruptionReason, setDisruptionReason] = useState('')
  const [targetEtaDate, setTargetEtaDate] = useState('')
  const [estimatedDaysToStable, setEstimatedDaysToStable] = useState<number>(14)
  const [stabilizationStage, setStabilizationStage] = useState<StabilizationStage>('STAGE_1_BUFFER_ACTIVATED')
  const [resupplySource, setResupplySource] = useState('Pesanan Pindahan Kecemasan (Mutual Aid) dari Hospital Miri')
  const [expectedRestockedQuantity, setExpectedRestockedQuantity] = useState('')
  const [clinicalActionPlan, setClinicalActionPlan] = useState('')
  const [verifiedByPharmacist, setVerifiedByPharmacist] = useState('Pegawai Farmasi / Stor Hospital Lawas')

  // Drug Specific Fields
  const [dosageForm, setDosageForm] = useState('Ampoule')
  const [strength, setStrength] = useState('')
  const [prescriberCategory, setPrescriberCategory] = useState<PrescriberCategory>('A')
  const [poisonCategory, setPoisonCategory] = useState<PoisonCategory>('Group B')
  const [isHAM, setIsHAM] = useState(false)

  // Non-Drug Specific Fields
  const [nonDrugCategory, setNonDrugCategory] = useState<NonDrugCategory>('Pakai Buang Perubatan (Medical Consumables)')
  const [itemSpecification, setItemSpecification] = useState('')
  const [packagingUnit, setPackagingUnit] = useState('Kotak / Pcs')

  // Alternatives
  const [alternatives, setAlternatives] = useState<DisruptionAlternativeOption[]>([
    {
      genericName: '',
      brandName: '',
      dosageForm: '',
      strength: '',
      prescriberCategory: 'A',
      therapeuticHierarchy: '1. Exact Substitute',
      lawasAvailabilityStatus: 'In Stock (Sedia Ada)',
      currentLawasBalance: '',
      clinicalDosingProtocol: '',
      specialistConsultNote: ''
    }
  ])

  if (!isOpen) return null

  const handleAddAlternative = () => {
    setAlternatives(prev => [
      ...prev,
      {
        genericName: '',
        brandName: '',
        dosageForm: itemType === 'DRUG' ? 'Vial' : '',
        strength: '',
        prescriberCategory: 'A',
        therapeuticHierarchy: itemType === 'DRUG' ? '2. Class Equivalent' : '1. Exact Functional Match',
        lawasAvailabilityStatus: 'In Stock (Sedia Ada)',
        currentLawasBalance: '',
        clinicalDosingProtocol: '',
        specialistConsultNote: ''
      }
    ])
  }

  const handleRemoveAlternative = (idx: number) => {
    setAlternatives(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateAlternative = (idx: number, field: keyof DisruptionAlternativeOption, value: any) => {
    setAlternatives(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!genericName.trim() || !targetEtaDate) {
      alert('Sila lengkapkan nama item dan tarikh anggaran bekalan kembali stabil (ETA).')
      return
    }

    const validAlternatives = alternatives.filter(a => a.genericName.trim() !== '')

    const newRecord = addStockDisruption({
      hospitalName: 'Hospital Lawas',
      itemType,
      departmentAffected,
      genericName: genericName.trim(),
      brandNames: brandNames ? brandNames.split(',').map(s => s.trim()) : [],
      
      // Drug specific
      dosageForm: itemType === 'DRUG' ? dosageForm : undefined,
      strength: itemType === 'DRUG' ? strength : undefined,
      prescriberCategory: itemType === 'DRUG' ? prescriberCategory : undefined,
      poisonCategory: itemType === 'DRUG' ? poisonCategory : undefined,
      isHAM: itemType === 'DRUG' ? isHAM : false,

      // Non-drug specific
      nonDrugCategory: itemType === 'NON_DRUG' ? nonDrugCategory : undefined,
      itemSpecification: itemType === 'NON_DRUG' ? itemSpecification : undefined,
      packagingUnit: itemType === 'NON_DRUG' ? packagingUnit : undefined,

      severity,
      currentBalanceText: currentBalanceText || '0 Unit',
      disruptionReason,
      reportedDate: new Date().toISOString().split('T')[0],
      targetEtaDate,
      estimatedDaysToStable: Number(estimatedDaysToStable) || 14,
      stabilizationStage,
      resupplySource,
      expectedRestockedQuantity,
      alternatives: validAlternatives,
      clinicalActionPlan,
      verifiedByPharmacist,
      isActiveDisruption: true
    })

    onSuccess(newRecord)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl shadow-2xl border border-border-default w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Lapor Gangguan Bekalan &amp; Item Alternatif</h3>
              <p className="text-xs text-purple-200 font-medium">Hospital Lawas &bull; Ubat (Drug) &amp; Bukan Ubat (Non-Drug / Consumables)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Type Switcher (Drug vs Non-Drug) */}
        <div className="bg-subtle p-3 border-b border-border-default flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted ml-3 mr-2">Jenis Item Gangguan:</span>
          <button
            type="button"
            onClick={() => setItemType('DRUG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              itemType === 'DRUG'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-surface text-text-secondary hover:bg-subtle border border-border-default'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Ubat (Pharmaceutical Drug)</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('NON_DRUG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              itemType === 'NON_DRUG'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-surface text-text-secondary hover:bg-subtle border border-border-default'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Bukan Ubat (Non-Drug / Consumables / Reagents)</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Item Details */}
          <div className="bg-subtle/50 p-5 rounded-2xl border border-border-default space-y-4">
            <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-2">
              {itemType === 'DRUG' ? <Pill className="w-4 h-4 text-purple-600" /> : <Package className="w-4 h-4 text-teal-600" />}
              1. Maklumat {itemType === 'DRUG' ? 'Ubat' : 'Bukan Ubat'} Terjejas Bekalan (Hospital Lawas)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-text-secondary font-semibold mb-1">
                  {itemType === 'DRUG' ? 'Nama Generik Ubat *' : 'Nama Item Bukan Ubat *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={itemType === 'DRUG' ? 'Contoh: Dobutamine Hydrochloride' : 'Contoh: Syringe 50mL Luer Lock Sterile / Blood Giving Set'}
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Jenama / Pengeluar</label>
                <input
                  type="text"
                  placeholder={itemType === 'DRUG' ? 'Contoh: Dobutrex' : 'Contoh: Terumo / BD / Meditop'}
                  value={brandNames}
                  onChange={e => setBrandNames(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Drug-specific inputs */}
              {itemType === 'DRUG' && (
                <>
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Bentuk Dos (Dosage Form)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ampoule / Vial / Tablet"
                      value={dosageForm}
                      onChange={e => setDosageForm(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Kekuatan (Strength)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 250mg/20mL"
                      value={strength}
                      onChange={e => setStrength(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Kategori Preskripsi</label>
                    <select
                      value={prescriberCategory}
                      onChange={e => setPrescriberCategory(e.target.value as PrescriberCategory)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    >
                      <option value="A*">Kategori A* (Pakar Subkepakaran)</option>
                      <option value="A">Kategori A (Pakar)</option>
                      <option value="A/KK">Kategori A/KK</option>
                      <option value="B">Kategori B (Pegawai Perubatan)</option>
                      <option value="C">Kategori C</option>
                    </select>
                  </div>
                </>
              )}

              {/* Non-Drug specific inputs */}
              {itemType === 'NON_DRUG' && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary font-semibold mb-1">Kategori Bukan Ubat *</label>
                    <select
                      value={nonDrugCategory}
                      onChange={e => setNonDrugCategory(e.target.value as NonDrugCategory)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    >
                      {NON_DRUG_CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Spesifikasi / Saiz / Model</label>
                    <input
                      type="text"
                      placeholder="Contoh: Saiz 7.5 / 50mL Luer-Lock"
                      value={itemSpecification}
                      onChange={e => setItemSpecification(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Unit Pembungkusan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kotak (100 Pcs) / Set"
                      value={packagingUnit}
                      onChange={e => setPackagingUnit(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-text-secondary font-semibold mb-1">Wad / Unit Utama Terjejas di Lawas</label>
                <input
                  type="text"
                  placeholder="Contoh: Unit Kecemasan & Trauma (ETD) / HDU / Bilik Bedah (OT)"
                  value={departmentAffected}
                  onChange={e => setDepartmentAffected(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              {itemType === 'DRUG' && (
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="modal-is-ham"
                    checked={isHAM}
                    onChange={e => setIsHAM(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-sm"
                  />
                  <label htmlFor="modal-is-ham" className="text-text-primary font-bold cursor-pointer">
                    Ubat Berisiko Tinggi (HAM)
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Disruption Status & ETA */}
          <div className="bg-subtle/50 p-5 rounded-2xl border border-border-default space-y-4">
            <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              2. Status Gangguan &amp; Anggaran Masa Pulih (ETA)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">Tahap Gangguan (Severity) *</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as DisruptionSeverity)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary font-medium focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="CRITICAL_OUT_OF_STOCK">Putus Bekalan Kritikal (0 Baki)</option>
                  <option value="LOW_STOCK_BUFFER">Stok Penampan Rendah (&lt; 3-5 Hari)</option>
                  <option value="TRANSIT_DELAY">Tertangguh Sempadan / Transit (Brunei/Limbang)</option>
                  <option value="QUOTA_DEPLETED">Kuota / Kontrak Habis (Menunggu Tambahan)</option>
                  <option value="MANUFACTURER_BACKORDER">Gangguan Pengeluar / APPL Nasional</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Baki Stok Semasa di Lawas</label>
                <input
                  type="text"
                  placeholder="Contoh: 0 Kotak / 5 Pcs / Habis"
                  value={currentBalanceText}
                  onChange={e => setCurrentBalanceText(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Tarikh Anggaran Bekalan Kembali Stabil (ETA) *</label>
                <input
                  type="date"
                  required
                  value={targetEtaDate}
                  onChange={e => setTargetEtaDate(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Anggaran Hari ke Pemulihan</label>
                <input
                  type="number"
                  min={1}
                  value={estimatedDaysToStable}
                  onChange={e => setEstimatedDaysToStable(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Fasa Pemulihan Semasa</label>
                <select
                  value={stabilizationStage}
                  onChange={e => setStabilizationStage(e.target.value as StabilizationStage)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="STAGE_1_BUFFER_ACTIVATED">Tahap 1: Buffer Darurat / Pinjaman Diaktifkan</option>
                  <option value="STAGE_2_IN_TRANSIT">Tahap 2: Konsainan Dalam Perjalanan</option>
                  <option value="STAGE_3_RECEIVING_VERIFY">Tahap 3: Penerimaan &amp; Kuarantin Farmasi/Stor</option>
                  <option value="STAGE_4_RESTOCKED_STABLE">Tahap 4: Bekalan Pulih &amp; Stabil Sepenuhnya</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Kuantiti Bekalan Dijangka</label>
                <input
                  type="text"
                  placeholder="Contoh: 50 Kotak / 200 Unit"
                  value={expectedRestockedQuantity}
                  onChange={e => setExpectedRestockedQuantity(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-text-secondary font-semibold mb-1">Punca / Sebab Gangguan Bekalan</label>
                <input
                  type="text"
                  placeholder="Contoh: Gangguan kilang pengeluar tempatan & kelewatan pelepasan permit transit sempadan."
                  value={disruptionReason}
                  onChange={e => setDisruptionReason(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-text-secondary font-semibold mb-1">Sumber &amp; Pelan Pembekalan Semula (Resupply Source)</label>
                <input
                  type="text"
                  placeholder="Contoh: Pesanan Kecemasan (Mutual Aid Indent) Hospital Miri / Pembekal Kontrak Khas"
                  value={resupplySource}
                  onChange={e => setResupplySource(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Alternative Items */}
          <div className="bg-subtle/50 p-5 rounded-2xl border border-border-default space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                3. Pilihan Item Alternatif Disyorkan Sedia Ada di Lawas ({alternatives.length})
              </h4>
              <button
                type="button"
                onClick={handleAddAlternative}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Alternatif
              </button>
            </div>

            <div className="space-y-4">
              {alternatives.map((alt, idx) => (
                <div key={idx} className="p-4 bg-surface rounded-2xl border border-border-default space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="font-bold text-indigo-700">Alternatif #{idx + 1}</span>
                    {alternatives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAlternative(idx)}
                        className="text-rose-600 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        {itemType === 'DRUG' ? 'Nama Generik Alternatif *' : 'Nama Item Alternatif *'}
                      </label>
                      <input
                        type="text"
                        placeholder={itemType === 'DRUG' ? 'Contoh: Dopamine Hydrochloride' : 'Contoh: Syringe 50mL Catheter Tip / Saiz 8.0'}
                        value={alt.genericName}
                        onChange={e => handleUpdateAlternative(idx, 'genericName', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:bg-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        {itemType === 'DRUG' ? 'Bentuk & Kekuatan' : 'Spesifikasi / Saiz Alternatif'}
                      </label>
                      <input
                        type="text"
                        placeholder={itemType === 'DRUG' ? 'Contoh: Ampul 200mg/5mL' : 'Contoh: Saiz 8.0 / Catheter Tip with Adapter'}
                        value={alt.strength}
                        onChange={e => handleUpdateAlternative(idx, 'strength', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary focus:border-purple-500 focus:bg-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">Hierarki Penggantian</label>
                      <select
                        value={alt.therapeuticHierarchy}
                        onChange={e => handleUpdateAlternative(idx, 'therapeuticHierarchy', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary"
                      >
                        {itemType === 'DRUG' ? (
                          <>
                            <option value="1. Exact Substitute">1. Exact Substitute (Molekul Sama)</option>
                            <option value="2. Class Equivalent">2. Class Equivalent (Setara Kelas)</option>
                            <option value="3. Alternative Second-Line">3. Alternative Second-Line (Garis Kedua)</option>
                          </>
                        ) : (
                          <>
                            <option value="1. Exact Functional Match">1. Exact Functional Match (Fungsi Setaraf Sepenuhnya)</option>
                            <option value="2. Acceptable Clinical Alternative">2. Acceptable Clinical Alternative (Alternatif Boleh Diterima)</option>
                            <option value="3. Temporary Workaround">3. Temporary Workaround (Penggantian Sementara)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">Status Ketersediaan di Lawas</label>
                      <select
                        value={alt.lawasAvailabilityStatus}
                        onChange={e => handleUpdateAlternative(idx, 'lawasAvailabilityStatus', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary font-medium"
                      >
                        <option value="In Stock (Sedia Ada)">In Stock (Sedia Ada)</option>
                        <option value="Buffer Available (Penampan Cukup)">Buffer Available (Penampan Cukup)</option>
                        <option value="Limited Stock (Stok Terhad)">Limited Stock (Stok Terhad)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">Baki Stok di Lawas</label>
                      <input
                        type="text"
                        placeholder="Contoh: 80 Kotak / 20 Set"
                        value={alt.currentLawasBalance || ''}
                        onChange={e => handleUpdateAlternative(idx, 'currentLawasBalance', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-text-secondary font-semibold mb-1">
                        {itemType === 'DRUG' ? 'Protokol Penukaran Dos Klinikal' : 'Arahan Penggunaan / Pelarasan Klinikal Bukan Ubat'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={
                          itemType === 'DRUG'
                            ? 'Contoh: Dos permulaan 5-10 mcg/kg/min IV titrasi. Larutkan 1 ampul dalam 50mL D5W.'
                            : 'Contoh: Gunakan Picagari Catheter Tip bersama adaptor Luer-Slip. Jururawat wad telah diberi taklimat sambungan infusi.'
                        }
                        value={alt.clinicalDosingProtocol}
                        onChange={e => handleUpdateAlternative(idx, 'clinicalDosingProtocol', e.target.value)}
                        className="w-full p-2 bg-subtle/50 border border-border-default rounded-xl text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Clinical Plan & Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Pelan Tindakan Klinikal Hospital Lawas</label>
              <input
                type="text"
                placeholder="Contoh: Gunakan stok alternatif sedia ada, maklumkan ketua wad berkaitan."
                value={clinicalActionPlan}
                onChange={e => setClinicalActionPlan(e.target.value)}
                className="w-full p-2.5 bg-subtle/50 border border-border-default rounded-xl text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary font-semibold mb-1">Disahkan Oleh (Pegawai Bertanggungjawab)</label>
              <input
                type="text"
                value={verifiedByPharmacist}
                onChange={e => setVerifiedByPharmacist(e.target.value)}
                className="w-full p-2.5 bg-subtle/50 border border-border-default rounded-xl text-text-primary"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-default text-text-secondary font-bold hover:bg-subtle transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Rekod Gangguan ({itemType === 'DRUG' ? 'Ubat' : 'Bukan Ubat'})
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
