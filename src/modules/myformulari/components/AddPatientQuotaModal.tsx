import React, { useState } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'
import { DrugQuotaItem, PatientQuotaRecord, ApprovalAuthorityType } from '../types/drugQuotaTypes'
import { addPatientQuota } from '../services/patientQuotaService'

interface AddPatientQuotaModalProps {
  isOpen: boolean
  onClose: () => void
  quotaItem: DrugQuotaItem
  onSuccess: (newPatient: PatientQuotaRecord) => void
}

export const AddPatientQuotaModal: React.FC<AddPatientQuotaModalProps> = ({
  isOpen,
  onClose,
  quotaItem,
  onSuccess
}) => {
  const [patientName, setPatientName] = useState('')
  const [patientRn, setPatientRn] = useState('')
  const [patientMyKad, setPatientMyKad] = useState('')
  const [age, setAge] = useState<number | ''>(60)
  const [gender, setGender] = useState<'Lelaki' | 'Perempuan'>('Lelaki')
  const [contactNumber, ] = useState('')
  
  const [prescriberName, setPrescriberName] = useState('Dr. Pakar Perunding')
  const [prescriberMmc, ] = useState('MMC-')
  const [clinicDepartment, setClinicDepartment] = useState(quotaItem.department || 'Klinik Pakar')
  const [clinicalIndication, setClinicalIndication] = useState(quotaItem.approvedIndications?.[0] || '')
  
  const [approvalAuthority, setApprovalAuthority] = useState<ApprovalAuthorityType>(
    quotaItem.category === 'KELULUSAN_KHAS_KPK' ? 'KPK_HQ' : 'JKUT_HOSPITAL'
  )
  const [approvalRef, setApprovalRef] = useState(quotaItem.specialApprovalRef || '')
  const [approvalStartDate, setApprovalStartDate] = useState(new Date().toISOString().split('T')[0])
  
  // Default expiry date = +1 year
  const defaultExp = new Date()
  defaultExp.setFullYear(defaultExp.getFullYear() + 1)
  const [approvalExpiryDate, setApprovalExpiryDate] = useState(defaultExp.toISOString().split('T')[0])
  
  const [monthlyDoseUnits, setMonthlyDoseUnits] = useState<number | ''>(quotaItem.monthlyQuota > 100 ? 60 : 2)
  const [remarks, setRemarks] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!patientName.trim()) {
      setErrorMsg('Sila masukkan Nama Penuh Pesakit.')
      return
    }
    if (!patientRn.trim()) {
      setErrorMsg('Sila masukkan No. RN (Hospital Registration Number).')
      return
    }
    if (!patientMyKad.trim()) {
      setErrorMsg('Sila masukkan No. MyKad / Kad Pengenalan.')
      return
    }
    if (monthlyDoseUnits === '' || Number(monthlyDoseUnits) <= 0) {
      setErrorMsg('Sila tetapkan kuota dos bulanan yang sah (> 0).')
      return
    }

    const defaultNextDue = new Date()
    defaultNextDue.setDate(defaultNextDue.getDate() + 30)

    const created = addPatientQuota({
      quotaDrugId: quotaItem.id,
      hospitalName: quotaItem.hospitalName,
      patientName: patientName.trim(),
      patientRn: patientRn.trim(),
      patientMyKad: patientMyKad.trim(),
      age: Number(age) || 0,
      gender,
      contactNumber: contactNumber.trim() || undefined,
      prescriberName: prescriberName.trim(),
      prescriberMmc: prescriberMmc.trim() || undefined,
      clinicDepartment: clinicDepartment.trim(),
      clinicalIndication: clinicalIndication.trim() || quotaItem.genericName,
      approvalAuthority,
      approvalRef: approvalRef.trim() || 'JKUT/2026/APPROVED',
      approvalStartDate,
      approvalExpiryDate,
      isApprovalActive: true,
      monthlyDoseUnits: Number(monthlyDoseUnits),
      currentMonthStatus: 'BELUM_DIISI',
      nextRefillDueDate: defaultNextDue.toISOString().split('T')[0],
      remarks: remarks.trim() || undefined
    })

    onSuccess(created)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border-default shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded-lg text-slate-300">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Daftar Pesakit Kuota Khas Baharu</h2>
              <p className="text-xs text-slate-400 font-normal">
                {quotaItem.genericName} • {quotaItem.hospitalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Maklumat Pesakit */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-1">
              1. Maklumat Pesakit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Nama Penuh Pesakit *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Nama Pesakit"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">No. RN (Registration Number) *</label>
                <input
                  type="text"
                  required
                  value={patientRn}
                  onChange={e => setPatientRn(e.target.value)}
                  placeholder="Contoh: RN-884210-26"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs font-mono text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">No. MyKad *</label>
                <input
                  type="text"
                  required
                  value={patientMyKad}
                  onChange={e => setPatientMyKad(e.target.value)}
                  placeholder="700101-13-5001"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs font-mono text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Umur (Tahun)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary text-right focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Jantina</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Lelaki">Lelaki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Preskripsi & Kelulusan */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-1">
              2. Pakar Preskriber & Kelulusan Khas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Nama Pakar / Perunding *</label>
                <input
                  type="text"
                  required
                  value={prescriberName}
                  onChange={e => setPrescriberName(e.target.value)}
                  placeholder="Dr. Noraini Hashim"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Klinik / Jabatan *</label>
                <input
                  type="text"
                  required
                  value={clinicDepartment}
                  onChange={e => setClinicDepartment(e.target.value)}
                  placeholder="Klinik Kardiologi"
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Pihak Berkuasa Kelulusan</label>
                <select
                  value={approvalAuthority}
                  onChange={e => setApprovalAuthority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="JKUT_HOSPITAL">JKUT Hospital (Jawatankuasa Ubat Tempatan)</option>
                  <option value="KPK_HQ">Kelulusan Khas KPK (Ketua Pengarah Kesihatan)</option>
                  <option value="JKUT_NEGERI">JKUT Negeri (JKN)</option>
                  <option value="PAKAR_PERUNDING">Kelulusan Terus Pakar Perunding Terlibat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">No. Rujukan Kelulusan *</label>
                <input
                  type="text"
                  required
                  value={approvalRef}
                  onChange={e => setApprovalRef(e.target.value)}
                  placeholder="KKM/BFP/600-4/..."
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs font-mono text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Indikasi Klinikal Pesakit *</label>
              <input
                type="text"
                required
                value={clinicalIndication}
                onChange={e => setClinicalIndication(e.target.value)}
                placeholder="Indikasi klinikal yang diluluskan..."
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Section 3: Kuota Dos Bulanan */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-1">
              3. Peruntukan Dos Bulanan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Dos Bulanan ({quotaItem.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={monthlyDoseUnits}
                  onChange={e => setMonthlyDoseUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs font-bold text-text-primary text-right focus:bg-surface focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Tarikh Mula Kelulusan</label>
                <input
                  type="date"
                  value={approvalStartDate}
                  onChange={e => setApprovalStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Tarikh Tamat Kelulusan</label>
                <input
                  type="date"
                  value={approvalExpiryDate}
                  onChange={e => setApprovalExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Catatan kepatuhan atau protokol rawatan..."
                className="w-full px-3 py-2 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary focus:bg-surface focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface border border-border-default text-text-secondary hover:bg-subtle/50 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              Simpan & Daftar Pesakit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
