import React, { useState, useEffect } from 'react'
import {
  X,
  Edit3,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  DollarSign,
  Users,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { DrugQuotaItem, QuotaCategory } from '../types/drugQuotaTypes'
import { updateDrugQuota, deleteDrugQuota } from '../services/drugQuotaService'
import { PrescriberCategory, PoisonCategory, SkimPerolehan } from '../types/formulariTypes'

interface EditQuotaDrugModalProps {
  isOpen: boolean
  onClose: () => void
  quotaItem: DrugQuotaItem | null
  onSuccess: (updated: DrugQuotaItem) => void
  onDeleteSuccess?: (deletedId: string) => void
}

export const EditQuotaDrugModal: React.FC<EditQuotaDrugModalProps> = ({
  isOpen,
  onClose,
  quotaItem,
  onSuccess,
  onDeleteSuccess
}) => {
  const [genericName, setGenericName] = useState('')
  const [brandNames, setBrandNames] = useState('')
  const [category, setCategory] = useState<QuotaCategory>('KATEGORI_A_STAR')
  const [prescriberCategory, setPrescriberCategory] = useState<PrescriberCategory>('A*')
  const [poisonCategory, setPoisonCategory] = useState<PoisonCategory>('Group B')
  const [skimPerolehan, setSkimPerolehan] = useState<SkimPerolehan>('LP')
  
  const [dosageForm, setDosageForm] = useState('Tablet')
  const [strength, setStrength] = useState('')
  
  const [hospitalName, setHospitalName] = useState('')
  const [department, setDepartment] = useState('')
  const [allocationPeriod, setAllocationPeriod] = useState('')
  
  const [monthlyQuota, setMonthlyQuota] = useState<number | ''>(1000)
  const [quotaUsed, setQuotaUsed] = useState<number | ''>(0)
  const [unit, setUnit] = useState('Tablets')
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(200)
  const [bufferStockLevel, setBufferStockLevel] = useState<number | ''>(100)
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(0)
  
  const [specialApprovalRef, setSpecialApprovalRef] = useState('')
  const [approvedPatientCount, setApprovedPatientCount] = useState<number | ''>(0)
  const [indicationsText, setIndicationsText] = useState('')
  const [notes, setNotes] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (quotaItem) {
      setGenericName(quotaItem.genericName)
      setBrandNames(quotaItem.brandNames?.join(', ') || '')
      setCategory(quotaItem.category)
      setPrescriberCategory(quotaItem.prescriberCategory)
      setPoisonCategory(quotaItem.poisonCategory)
      setSkimPerolehan(quotaItem.skimPerolehan)
      setDosageForm(quotaItem.dosageForm)
      setStrength(quotaItem.strength)
      setHospitalName(quotaItem.hospitalName)
      setDepartment(quotaItem.department)
      setAllocationPeriod(quotaItem.allocationPeriod)
      setMonthlyQuota(quotaItem.monthlyQuota)
      setQuotaUsed(quotaItem.quotaUsed)
      setUnit(quotaItem.unit)
      setLowStockThreshold(quotaItem.lowStockThreshold)
      setBufferStockLevel(quotaItem.bufferStockLevel)
      setCostPerUnit(quotaItem.costPerUnit)
      setSpecialApprovalRef(quotaItem.specialApprovalRef || '')
      setApprovedPatientCount(quotaItem.approvedPatientCount || 0)
      setIndicationsText(quotaItem.approvedIndications?.join('\n') || '')
      setNotes(quotaItem.notes || '')
      setShowDeleteConfirm(false)
      setErrorMsg('')
    }
  }, [quotaItem])

  if (!isOpen || !quotaItem) return null

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!genericName.trim()) {
      setErrorMsg('Nama generik ubat diperlukan.')
      return
    }

    if (monthlyQuota === '' || Number(monthlyQuota) <= 0) {
      setErrorMsg('Siling kuota mestilah lebih besar daripada 0.')
      return
    }

    const brandArray = brandNames.split(',').map(b => b.trim()).filter(Boolean)
    const indicationsArray = indicationsText.split('\n').map(i => i.trim()).filter(Boolean)

    const updated = updateDrugQuota(quotaItem.id, {
      genericName: genericName.trim(),
      brandNames: brandArray.length > 0 ? brandArray : [genericName.trim()],
      category,
      prescriberCategory,
      poisonCategory,
      skimPerolehan,
      dosageForm: dosageForm.trim(),
      strength: strength.trim(),
      hospitalName: hospitalName.trim(),
      department: department.trim(),
      allocationPeriod: allocationPeriod.trim(),
      monthlyQuota: Number(monthlyQuota),
      quotaUsed: Number(quotaUsed) || 0,
      unit: unit.trim(),
      lowStockThreshold: Number(lowStockThreshold),
      bufferStockLevel: Number(bufferStockLevel),
      costPerUnit: Number(costPerUnit) || 0,
      specialApprovalRef: specialApprovalRef.trim() || undefined,
      approvedPatientCount: Number(approvedPatientCount) || 0,
      approvedIndications: indicationsArray,
      notes: notes.trim() || undefined
    })

    if (updated) {
      onSuccess(updated)
      onClose()
    }
  }

  const handleDelete = () => {
    if (deleteDrugQuota(quotaItem.id)) {
      if (onDeleteSuccess) onDeleteSuccess(quotaItem.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Edit3 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Kemaskini Had Kuota Ubat</h2>
              <p className="text-xs text-indigo-200 font-medium">
                {quotaItem.genericName} • {quotaItem.hospitalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1 */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              1. Maklumat Ubat & Klasifikasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Generik Ubat *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Dagang / Jenama</label>
                <input
                  type="text"
                  value={brandNames}
                  onChange={e => setBrandNames(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kategori Kawalan Kuota</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as QuotaCategory)}
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary"
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
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary"
                >
                  <option value="A*">A* - Pakar Subkepakaran</option>
                  <option value="A">A - Pakar Perubatan Am</option>
                  <option value="A/KK">A/KK - Pakar Klinik Kesihatan</option>
                  <option value="B">B - Pegawai Perubatan (MO)</option>
                  <option value="C">C - Paramedik</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kategori Racun</label>
                <select
                  value={poisonCategory}
                  onChange={e => setPoisonCategory(e.target.value as PoisonCategory)}
                  className="w-full px-3 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary"
                >
                  <option value="Group B">Group B (Prescription Only)</option>
                  <option value="Group C">Group C (Pharmacy Only)</option>
                  <option value="Dangerous Drug (DD)">Dangerous Drug (DD)</option>
                  <option value="Psychotropic (PS)">Psychotropic (PS)</option>
                  <option value="Over-the-Counter (OTC)">Over-the-Counter (OTC)</option>
                  <option value="Exempt">Exempt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Bentuk Dos</label>
                <input
                  type="text"
                  value={dosageForm}
                  onChange={e => setDosageForm(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kekuatan</label>
                <input
                  type="text"
                  value={strength}
                  onChange={e => setStrength(e.target.value)}
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
                  <option value="LP">LP - Local Purchase</option>
                  <option value="APPL">APPL - Approved Product List</option>
                  <option value="CCDP">CCDP - Central Contract</option>
                  <option value="Khas">Khas - Peruntukan Khas</option>
                  <option value="Derma/Sumbangan">Derma / Sumbangan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Had Kuota & Fasiliti */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              2. Siling Kuota, Penggunaan & Kos Fasiliti
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Hospital / Fasiliti *</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Jabatan / Klinik Pengguna *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Tempoh Peruntukan Kuota</label>
                <input
                  type="text"
                  value={allocationPeriod}
                  onChange={e => setAllocationPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Siling Kuota Bulanan *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={monthlyQuota}
                  onChange={e => setMonthlyQuota(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-indigo-500/10 border border-indigo-300 rounded-xl text-xs text-indigo-400 dark:text-indigo-300 font-bold font-black text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kuantiti Telah Digunakan</label>
                <input
                  type="number"
                  min="0"
                  value={quotaUsed}
                  onChange={e => setQuotaUsed(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-bold text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Unit Ukuran</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Vials">Vials</option>
                  <option value="PFS">PFS (Picagari Pra-Isi)</option>
                  <option value="Pens">Pens</option>
                  <option value="Ampoules">Ampoules</option>
                  <option value="Bottles">Bottles</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Kos Seunit (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPerUnit}
                  onChange={e => setCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary font-semibold text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">Paras Ambang Stok Rendah</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-amber-500/10 border border-amber-300 rounded-xl text-xs text-amber-400 dark:text-amber-300 font-bold font-bold text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-rose-400 block mb-1">Paras Stok Penampan (Buffer)</label>
                <input
                  type="number"
                  min="0"
                  value={bufferStockLevel}
                  onChange={e => setBufferStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-rose-500/10 border border-rose-300 rounded-xl text-xs text-rose-400 dark:text-rose-300 font-bold font-bold text-right"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rujukan Kelulusan & Pesakit */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border-default pb-2">
              3. Maklumat Kelulusan Khas & Pesakit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">No. Rujukan Kelulusan KPK / JKUT</label>
                <input
                  type="text"
                  value={specialApprovalRef}
                  onChange={e => setSpecialApprovalRef(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Bilangan Pesakit Aktif Berdaftar</label>
                <input
                  type="number"
                  min="0"
                  value={approvedPatientCount}
                  onChange={e => setApprovedPatientCount(e.target.value === '' ? '' : Number(e.target.value))}
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
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Catatan / Justifikasi</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Adakah anda pasti mahu memadamkan kuota ubat ini daripada senarai hospital?</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Ya, Padam Kuota Ini
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-surface border border-border-default text-text-secondary rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-100 text-rose-700 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Padam Rekod Kuota</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-surface border border-border-default hover:bg-subtle/50 rounded-xl text-xs font-bold text-text-secondary cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
