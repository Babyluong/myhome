import React, { useState } from 'react'
import { X, MinusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { DrugQuotaItem, QuotaDispenseLog } from '../types/drugQuotaTypes'
import { recordDrugQuotaDispense } from '../services/drugQuotaService'

interface RecordQuotaDispenseModalProps {
  isOpen: boolean
  onClose: () => void
  quotaItem: DrugQuotaItem | null
  onSuccess: (updated: DrugQuotaItem, log: QuotaDispenseLog) => void
}

export const RecordQuotaDispenseModal: React.FC<RecordQuotaDispenseModalProps> = ({
  isOpen,
  onClose,
  quotaItem,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState<number | ''>(30)
  const [patientRn, setPatientRn] = useState('')
  const [patientName, setPatientName] = useState('')
  const [prescriberName, setPrescriberName] = useState('')
  const [prescriberRole, ] = useState('Pakar Perunding Kardiologi / Perubatan')
  const [wardOrClinic, setWardOrClinic] = useState('')
  const [reasonOrIndication, setReasonOrIndication] = useState('')
  const [dispensedBy, setDispensedBy] = useState('Pegawai Farmasi Bertugas (F44/F48)')
  const [dispenseDate, setDispenseDate] = useState(new Date().toISOString().split('T')[0])
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen || !quotaItem) return null

  const currentRemaining = quotaItem.quotaRemaining
  const qtyToDispense = Number(quantity) || 0
  const balanceAfter = Math.max(0, currentRemaining - qtyToDispense)
  const isOverQuota = qtyToDispense > currentRemaining

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (qtyToDispense <= 0) {
      setErrorMsg('Sila masukkan kuantiti pengeluaran yang sah (> 0).')
      return
    }

    if (!patientRn.trim()) {
      setErrorMsg('No. RN (Registration Number) Pesakit diperlukan untuk ubat kuota/kelulusan khas.')
      return
    }

    const result = recordDrugQuotaDispense(quotaItem.id, {
      quantity: qtyToDispense,
      patientRn: patientRn.trim(),
      patientName: patientName.trim(),
      prescriberName: prescriberName.trim(),
      prescriberRole: prescriberRole.trim(),
      wardOrClinic: wardOrClinic.trim() || quotaItem.department,
      reasonOrIndication: reasonOrIndication.trim() || quotaItem.approvedIndications?.[0],
      dispensedBy: dispensedBy.trim(),
      date: dispenseDate
    })

    if (result) {
      onSuccess(result.item, result.log)
      onClose()
    } else {
      setErrorMsg('Gagal merekodkan pengeluaran kuota.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <MinusCircle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Rekod Pengeluaran Kuota Ubat</h2>
              <p className="text-xs text-emerald-100 font-medium">
                {quotaItem.genericName} • Baki Semasa: {currentRemaining} {quotaItem.unit}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Balance Calculation Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-subtle/50 border border-border-default rounded-2xl text-center">
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase block">Baki Kuota Sedia Ada</span>
              <span className="text-xl font-black text-text-primary">{currentRemaining.toLocaleString()} {quotaItem.unit}</span>
            </div>
            <div className="border-x border-border-default">
              <span className="text-[11px] font-bold text-indigo-600 uppercase block">Dikeluarkan Sekarang</span>
              <span className="text-xl font-black text-indigo-700">-{qtyToDispense.toLocaleString()} {quotaItem.unit}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase block">Baki Selepas Pengeluaran</span>
              <span className={`text-xl font-black ${balanceAfter <= quotaItem.lowStockThreshold ? 'text-rose-600' : 'text-emerald-700'}`}>
                {balanceAfter.toLocaleString()} {quotaItem.unit}
              </span>
            </div>
          </div>

          {isOverQuota && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-300 rounded-2xl text-xs text-amber-400 dark:text-amber-300 font-bold font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AMARAN: Kuantiti pengeluaran melebihi baki kuota bulanan fasiliti. Pengesyoran kelulusan luar jangka JKUT diperlukan.</span>
            </div>
          )}

          {/* Quantity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                Kuantiti Dikeluarkan ({quotaItem.unit}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="30"
                className="w-full px-3.5 py-2.5 bg-surface border border-indigo-300 rounded-xl text-sm font-black text-indigo-400 dark:text-indigo-300 font-bold focus:outline-hidden focus:border-indigo-600 text-right shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Tarikh Pengeluaran *</label>
              <input
                type="date"
                required
                value={dispenseDate}
                onChange={e => setDispenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-3 pt-2 border-t border-border-default">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">
              Maklumat Pesakit & Preskripsi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">No. RN Pesakit *</label>
                <input
                  type="text"
                  required
                  value={patientRn}
                  onChange={e => setPatientRn(e.target.value)}
                  placeholder="Contoh: RN-884210-26"
                  className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs font-mono font-bold text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Penuh Pesakit</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Nama Pesakit"
                  className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nama Pakar / Preskriber</label>
                <input
                  type="text"
                  value={prescriberName}
                  onChange={e => setPrescriberName(e.target.value)}
                  placeholder="Contoh: Dr. Tan Siew Ling (Pakar Kardiologi)"
                  className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Lokasi Wad / Klinik</label>
                <input
                  type="text"
                  value={wardOrClinic}
                  onChange={e => setWardOrClinic(e.target.value)}
                  placeholder={quotaItem.department || 'Klinik Pakar'}
                  className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Indikasi Klinikal / Catatan Rawatan</label>
              <input
                type="text"
                value={reasonOrIndication}
                onChange={e => setReasonOrIndication(e.target.value)}
                placeholder="Contoh: NVAF dengan risiko tinggi strok / HFrEF NYHA III"
                className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Pegawai Farmasi Mengeluarkan</label>
              <input
                type="text"
                value={dispensedBy}
                onChange={e => setDispensedBy(e.target.value)}
                className="w-full px-3.5 py-2 bg-subtle/50 border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 bg-surface border border-border-default hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sahkan Pengeluaran Ubat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
