import React, { useState, useMemo, useEffect } from 'react'
import { X, Users, CheckCircle2, Clock, AlertTriangle, UserPlus, Search, Building2, FileCheck, Stethoscope, Calendar, Package, Trash2, History, Check } from 'lucide-react'
import { DrugQuotaItem, PatientQuotaRecord, PatientDispenseStatus } from '../types/drugQuotaTypes'
import {
  getPatientsForDrugQuota,
  recordPatientRefill,
  deletePatientQuota,
  getDrugPatientStats
} from '../services/patientQuotaService'
import { AddPatientQuotaModal } from './AddPatientQuotaModal'

interface PatientQuotaDrawerProps {
  isOpen: boolean
  onClose: () => void
  quotaItem: DrugQuotaItem | null
  onQuotaUpdated?: () => void
}

export const PatientQuotaDrawer: React.FC<PatientQuotaDrawerProps> = ({
  isOpen,
  onClose,
  quotaItem,
  onQuotaUpdated
}) => {
  const [patients, setPatients] = useState<PatientQuotaRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<'ALL' | PatientDispenseStatus>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [refillConfirmPatient, setRefillConfirmPatient] = useState<PatientQuotaRecord | null>(null)
  const [dispenseQtyInput, setDispenseQtyInput] = useState<number>(60)
  const [historyViewPatient, setHistoryViewPatient] = useState<PatientQuotaRecord | null>(null)
  const [actionToast, setActionToast] = useState<string | null>(null)

  const loadPatients = () => {
    if (quotaItem) {
      const list = getPatientsForDrugQuota(quotaItem.id)
      setPatients(list)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [quotaItem])

  const stats = useMemo(() => {
    if (!quotaItem) return null
    return getDrugPatientStats(quotaItem.id)
  }, [patients, quotaItem])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (statusFilter !== 'ALL' && p.currentMonthStatus !== statusFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchName = p.patientName.toLowerCase().includes(q)
        const matchRn = p.patientRn.toLowerCase().includes(q)
        const matchIc = p.patientMyKad.toLowerCase().includes(q)
        const matchIndication = p.clinicalIndication.toLowerCase().includes(q)
        const matchDoctor = p.prescriberName.toLowerCase().includes(q)
        if (!matchName && !matchRn && !matchIc && !matchIndication && !matchDoctor) {
          return false
        }
      }
      return true
    })
  }, [patients, statusFilter, searchTerm])

  if (!isOpen || !quotaItem) return null

  const showToast = (msg: string) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  const handleExecuteRefill = (patient: PatientQuotaRecord) => {
    const qty = Number(dispenseQtyInput) || patient.monthlyDoseUnits || 30
    const result = recordPatientRefill(
      patient.id,
      qty,
      'Pegawai Farmasi Bertugas (F44/F48)',
      `Pengisian kuota bulanan ${qty} ${quotaItem.unit} bagi pesakit RN ${patient.patientRn}.`
    )

    if (result) {
      loadPatients()
      if (onQuotaUpdated) onQuotaUpdated()
      setRefillConfirmPatient(null)
      showToast(`Pengisian ${qty} ${quotaItem.unit} untuk "${patient.patientName}" (RN ${patient.patientRn}) berjaya direkodkan.`)
    }
  }

  const handleDeletePatient = (patientId: string, name: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadamkan rekod pesakit "${name}" daripada pendaftaran kuota?`)) {
      if (deletePatientQuota(patientId)) {
        loadPatients()
        if (onQuotaUpdated) onQuotaUpdated()
        showToast(`Pesakit "${name}" telah dipadamkan.`)
      }
    }
  }

  const getStatusBadge = (status: PatientDispenseStatus) => {
    switch (status) {
      case 'TELAH_DIISI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telah Diisi</span>
          </span>
        )
      case 'BELUM_DIISI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Refill</span>
          </span>
        )
      case 'TERLEPAS_TEMUJANJI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Terlepas Janji Temu</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-subtle text-text-secondary border border-border-default">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Right Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-4xl bg-surface shadow-2xl flex flex-col border-l border-border-default animate-in slide-in-from-right duration-300 ease-out">
          
          {/* Toast Notification */}
          {actionToast && (
            <div className="absolute top-4 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-top-4 duration-150">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionToast}</span>
            </div>
          )}

          {/* Drawer Header (KKM Professional Navy Theme) */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 text-slate-300">
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Daftar Pesakit Kuota & Pengisian Bulanan
                </h2>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px] font-mono">
                  MyPhIS KKM
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {quotaItem.genericName} ({quotaItem.strength}) • {quotaItem.hospitalName} • {quotaItem.department}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddPatientOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-elevation-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Daftar Pesakit Baru</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tutup Laci (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Hospital Quota & Physical Stock Comparison Bar */}
          <div className="px-6 py-3 bg-subtle/50 border-b border-border-default flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border-default text-text-secondary">
                <Package className="w-3.5 h-3.5 text-text-muted" />
                <span>Siling Kuota: <strong className="text-text-primary font-semibold">{quotaItem.monthlyQuota.toLocaleString()} {quotaItem.unit}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border-default text-text-secondary">
                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                <span>Stok Fizikal MyInventory: <strong className="text-text-primary font-semibold">{(quotaItem.physicalStockOnHand ?? quotaItem.quotaRemaining).toLocaleString()} {quotaItem.unit}</strong></span>
                {quotaItem.storeLocation && <span className="text-[11px] text-text-muted font-mono">({quotaItem.storeLocation})</span>}
              </div>

              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border-default text-text-secondary">
                <FileCheck className="w-3.5 h-3.5 text-text-muted" />
                <span>Komitmen Bulanan: <strong className="text-text-primary font-semibold">{stats?.totalMonthlyCommittedDose.toLocaleString()} {quotaItem.unit}/bln</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-text-muted">
              Kitaran: <span className="font-medium text-text-primary">{quotaItem.allocationPeriod}</span>
            </div>
          </div>

          {/* 4-Stat Metric Summary Strip */}
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface border-b border-border-default">
            {/* Card 1: Telah Diisi */}
            <div className="p-3 bg-subtle/50 rounded-xl border border-border-default space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                <span>Telah Diisi</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {stats?.fillPercentage}%
                </span>
              </div>
              <div className="text-xl font-bold text-text-primary font-mono tabular-nums">
                {stats?.filledCount} <span className="text-xs font-normal text-text-muted">Pesakit</span>
              </div>
              <p className="text-[11px] text-text-muted">
                {stats?.totalFilledDoseThisMonth.toLocaleString()} {quotaItem.unit} dibekalkan
              </p>
            </div>

            {/* Card 2: Menunggu Refill */}
            <div className="p-3 bg-subtle/50 rounded-xl border border-border-default space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                <span>Menunggu Refill</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Janji Temu
                </span>
              </div>
              <div className="text-xl font-bold text-text-primary font-mono tabular-nums">
                {stats?.pendingCount} <span className="text-xs font-normal text-text-muted">Pesakit</span>
              </div>
              <p className="text-[11px] text-text-muted">
                {stats?.totalPendingDoseThisMonth.toLocaleString()} {quotaItem.unit} belum dituntut
              </p>
            </div>

            {/* Card 3: Terlepas Janji Temu */}
            <div className="p-3 bg-subtle/50 rounded-xl border border-border-default space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                <span>Terlepas Janji Temu</span>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                  Defaulter
                </span>
              </div>
              <div className="text-xl font-bold text-text-primary font-mono tabular-nums">
                {stats?.defaulterCount} <span className="text-xs font-normal text-text-muted">Pesakit</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Tindakan susulan farmasi
              </p>
            </div>

            {/* Card 4: Jumlah Pendaftaran */}
            <div className="p-3 bg-subtle/50 rounded-xl border border-border-default space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                <span>Jumlah Pendaftaran</span>
                <span className="text-[11px] font-medium text-text-muted bg-slate-200/70 px-1.5 py-0.2 rounded">
                  Aktif
                </span>
              </div>
              <div className="text-xl font-bold text-text-primary font-mono tabular-nums">
                {stats?.totalPatients} <span className="text-xs font-normal text-text-muted">Pesakit</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Penggunaan: {stats?.totalMonthlyCommittedDose.toLocaleString()} {quotaItem.unit}/bln
              </p>
            </div>
          </div>

          {/* Filter Bar & Search Input */}
          <div className="px-6 py-3 bg-surface border-b border-border-default flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Segmented Filter Control */}
            <div className="flex items-center p-1 bg-subtle rounded-lg border border-border-default w-full sm:w-auto overflow-x-auto">
              {[
                { key: 'ALL', label: 'Semua', count: patients.length },
                { key: 'TELAH_DIISI', label: 'Telah Diisi', count: stats?.filledCount || 0 },
                { key: 'BELUM_DIISI', label: 'Menunggu Refill', count: stats?.pendingCount || 0 },
                { key: 'TERLEPAS_TEMUJANJI', label: 'Terlepas Temujanji', count: stats?.defaulterCount || 0 }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.key
                      ? 'bg-surface text-text-primary shadow-elevation-1 font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    statusFilter === tab.key ? 'bg-subtle text-text-primary font-bold' : 'bg-slate-200/60 text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pesakit, No. RN, MyKad, pakar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-subtle/50 border border-border-default rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>
          </div>

          {/* Patients Registry List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-subtle/50">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-text-secondary">Tiada rekod pesakit yang sepadan.</p>
                <p className="text-[11px] text-slate-400">
                  Gunakan butang "+ Daftar Pesakit Baru" untuk mendaftar pesakit kuota kelulusan khas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-4 bg-surface rounded-xl border border-border-default hover:border-border-default transition-colors shadow-elevation-1 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Patient Primary Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(patient.currentMonthStatus)}
                          <span className="px-2 py-0.5 bg-subtle text-text-primary font-mono font-bold text-xs rounded border border-border-default">
                            RN: {patient.patientRn}
                          </span>
                          <span className="px-2 py-0.5 bg-subtle text-text-muted font-mono text-xs rounded">
                            IC: {patient.patientMyKad}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({patient.age} Thn • {patient.gender})
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-text-primary">
                          {patient.patientName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                            <span>Pakar: <strong className="text-text-primary">{patient.prescriberName}</strong> ({patient.clinicDepartment})</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Kelulusan: <strong className="font-mono text-text-primary">{patient.approvalRef}</strong></span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Dosage, DNS Date & Actions */}
                      <div className="flex flex-row sm:flex-row sm:items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                        <div className="text-left sm:text-right space-y-0.5">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            Dos Bulanan
                          </div>
                          <div className="text-sm font-bold text-text-primary font-mono">
                            {patient.monthlyDoseUnits} {quotaItem.unit} / Bulan
                          </div>
                          <div className="text-[11px] text-text-muted flex items-center sm:justify-end gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>DNS: <strong className="text-text-primary">{patient.nextRefillDueDate}</strong></span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {patient.currentMonthStatus !== 'TELAH_DIISI' ? (
                            <button
                              onClick={() => {
                                setRefillConfirmPatient(patient)
                                setDispenseQtyInput(patient.monthlyDoseUnits || 30)
                              }}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-elevation-1 flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Isi Refill</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1.5 bg-subtle/50 text-text-muted border border-border-default rounded-lg text-xs font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Selesai</span>
                            </span>
                          )}

                          <button
                            onClick={() => setHistoryViewPatient(patient)}
                            title="Sejarah Refill Pesakit"
                            className="p-1.5 bg-subtle/50 hover:bg-subtle text-text-muted rounded-lg border border-border-default cursor-pointer transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePatient(patient.id, patient.patientName)}
                            title="Padam Rekod Pesakit"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-500/20 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Indication Summary */}
                    <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
                      <div>
                        <span className="font-semibold text-text-secondary">Indikasi: </span>
                        <span>{patient.clinicalIndication}</span>
                      </div>
                      {patient.remarks && (
                        <div className="text-text-muted bg-subtle/50 px-2 py-0.5 rounded border border-border-default">
                          {patient.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-surface border-t border-border-default flex items-center justify-between text-xs text-text-muted shrink-0">
            <span>
              Memaparkan <strong className="text-text-primary font-semibold">{filteredPatients.length}</strong> daripada <strong className="text-text-primary font-semibold">{patients.length}</strong> pesakit berdaftar
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-subtle hover:bg-subtle text-text-primary rounded-lg font-medium cursor-pointer transition-colors text-xs"
            >
              Tutup Laci
            </button>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <AddPatientQuotaModal
          isOpen={isAddPatientOpen}
          quotaItem={quotaItem}
          onClose={() => setIsAddPatientOpen(false)}
          onSuccess={newPatient => {
            loadPatients()
            if (onQuotaUpdated) onQuotaUpdated()
            showToast(`Pesakit "${newPatient.patientName}" (RN ${newPatient.patientRn}) berjaya didaftarkan.`)
          }}
        />
      )}

      {/* Refill Confirmation Dialog */}
      {refillConfirmPatient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border-default p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-700 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Sahkan Pengeluaran Refill Kuota</h3>
                <p className="text-xs text-text-muted">{refillConfirmPatient.patientName} (RN: {refillConfirmPatient.patientRn})</p>
              </div>
            </div>

            <div className="p-3 bg-subtle/50 rounded-xl border border-border-default space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Ubat:</span>
                <strong className="text-text-primary font-semibold">{quotaItem.genericName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Klinik:</span>
                <strong className="text-text-primary font-medium">{refillConfirmPatient.clinicDepartment}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pakar:</span>
                <strong className="text-text-primary font-medium">{refillConfirmPatient.prescriberName}</strong>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Kuantiti Dikeluarkan ({quotaItem.unit}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={dispenseQtyInput}
                onChange={e => setDispenseQtyInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-lg text-sm font-bold text-text-primary text-right focus:border-indigo-600 focus:outline-hidden"
              />
              <span className="text-[11px] text-text-muted block">
                Status akan dikemaskini kepada <strong>Telah Diisi</strong> dan tarikh bekalan seterusnya (DNS) dijana secara automatik (+30 hari).
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefillConfirmPatient(null)}
                className="px-3.5 py-1.5 bg-surface border border-border-default text-text-secondary hover:bg-subtle/50 rounded-lg text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleExecuteRefill(refillConfirmPatient)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Sahkan Refill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {historyViewPatient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border-default p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-bold text-text-primary">Sejarah Refill Pesakit</h3>
              </div>
              <button onClick={() => setHistoryViewPatient(null)} className="p-1 hover:bg-subtle rounded-lg text-slate-400 hover:text-text-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-text-muted space-y-0.5">
              <p>Pesakit: <strong className="text-text-primary">{historyViewPatient.patientName}</strong> (RN: {historyViewPatient.patientRn})</p>
              <p>Indikasi: <span className="text-text-secondary">{historyViewPatient.clinicalIndication}</span></p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyViewPatient.refillHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Tiada rekod pengisian lampau bagi kitaran ini.
                </div>
              ) : (
                historyViewPatient.refillHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-subtle/50 rounded-lg border border-border-default text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-text-primary">
                      <span>Tarikh: {item.date} {item.timestamp && `(${item.timestamp})`}</span>
                      <span className="text-emerald-700">+{item.quantity} {quotaItem.unit}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">Dikeluarkan oleh: {item.dispensedBy}</p>
                    <p className="text-[11px] text-text-secondary font-mono">Tarikh DNS: {item.nextDueDate}</p>
                    {item.remarks && <p className="text-[11px] text-text-muted italic">{item.remarks}</p>}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border-subtle">
              <button
                onClick={() => setHistoryViewPatient(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
