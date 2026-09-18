import React from 'react'
import {
  X,
  History,
  Calendar,
  User,
  Stethoscope,
  Building2,
  FileText,
  Clock,
  ArrowDownRight,
  Package,
  ShieldCheck,
  Edit,
  CheckCircle2
} from 'lucide-react'
import { DrugQuotaItem } from '../types/drugQuotaTypes'

interface QuotaDispenseHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  quotaItem: DrugQuotaItem | null
}

export const QuotaDispenseHistoryModal: React.FC<QuotaDispenseHistoryModalProps> = ({
  isOpen,
  onClose,
  quotaItem
}) => {
  if (!isOpen || !quotaItem) return null

  const logs = quotaItem.dispenseLogs || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <History className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Log Audit & Sejarah Ubat Kuota</h2>
              <p className="text-xs text-indigo-200 font-medium">
                {quotaItem.genericName} • {quotaItem.hospitalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Drug Creation & Edit Audit Card */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-black text-indigo-950 text-sm border-b border-indigo-200/60 pb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <span>Maklumat Pendaftaran & Pengubahsuaian Kuota</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Didaftarkan / Ditambah Oleh</p>
                  <p className="font-bold text-slate-900">{quotaItem.verifiedBy || 'Pegawai Farmasi Fasiliti'}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Tarikh Daftar: {quotaItem.createdDate || '2026-01-01'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Edit className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Kemaskini Terakhir</p>
                  <p className="font-bold text-slate-900">{quotaItem.lastUpdated || quotaItem.createdDate || '2026-08-25'}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Status: Aktif & Disahkan</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Jabatan & Fasiliti</p>
                  <p className="font-semibold text-slate-800">{quotaItem.department || 'Klinik Pakar / Farmasi'}</p>
                  <p className="text-[11px] text-slate-500">{quotaItem.hospitalName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Rujukan Kelulusan Khas / Kuota</p>
                  <p className="font-mono font-bold text-indigo-900">
                    {quotaItem.specialApprovalRef || 'JKUT/HLWS/2026/08-01'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispense Logs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Rekod Transaksi Pengeluaran & Refill ({logs.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Baki Kuota: <strong className="text-slate-900">{quotaItem.quotaRemaining} {quotaItem.unit}</strong>
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 space-y-1.5">
                <Package className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-600">Tiada rekod transaksi pengeluaran setakat ini.</p>
                <p className="text-[11px] text-slate-400">
                  Pengeluaran boleh direkodkan melalui tindakan Refill pesakit pada laci pesakit kuota.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-lg font-mono text-[11px]">
                          {log.date} {log.timestamp && `• ${log.timestamp}`}
                        </span>
                        {log.patientRn && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-md font-mono text-[11px]">
                            RN: {log.patientRn}
                          </span>
                        )}
                        {log.patientName && (
                          <span className="font-bold text-slate-900">{log.patientName}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px]">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>-{log.quantity} {quotaItem.unit}</span>
                        </span>
                        <span className="text-slate-500 font-normal text-[11px]">
                          Baki: <strong className="text-slate-800">{log.balanceAfter} {quotaItem.unit}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                      {log.prescriberName && (
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Pakar/Preskriber: <strong className="text-slate-800">{log.prescriberName}</strong></span>
                        </div>
                      )}
                      {log.wardOrClinic && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Klinik/Wad: <strong className="text-slate-800">{log.wardOrClinic}</strong></span>
                        </div>
                      )}
                      {log.reasonOrIndication && (
                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Indikasi/Catatan: <span className="text-slate-700 italic">{log.reasonOrIndication}</span></span>
                        </div>
                      )}
                      {log.dispensedBy && (
                        <div className="sm:col-span-2 text-slate-400 text-[10px]">
                          Dikeluarkan / Diproses oleh: <strong className="text-slate-600">{log.dispensedBy}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
