// src/modules/mykunci/pages/KunciAuditPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { 
  Shield, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Calendar,
  UserCheck,
  ClipboardCheck
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { 
  getKunciDaftar, 
  getKunciAudits, 
  addKunciAudit 
} from '@/modules/mykunci/services/kunciService'
import type { KunciDaftar, KunciAuditBulanan, AuditFizikal } from '@/shared/types/mykunci'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal } from '@/components/ui'
import { useLanguage } from '@/shared/contexts/LanguageContext'

const MOCK_AUDITORS = [
  { id: 'user-1', full_name: 'Muhammad Farhan bin Razali', jawatan: 'Pegawai Farmasi U41' },
  { id: 'user-3', full_name: 'Sarah binti Ahmad', jawatan: 'Penjaga Stor Farmasi U29' }
];

export const KunciAuditPage: React.FC = () => {
  const { language } = useLanguage()
  const loggedUser = useAuthStore((state) => state.user)
  const hospitalId = loggedUser?.hospital_id || 'hosp-1'
  const toast = useToast()
  
  const [keys, setKeys] = useState<KunciDaftar[]>([])
  const [audits, setAudits] = useState<KunciAuditBulanan[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [physicalStatus, setPhysicalStatus] = useState<AuditFizikal>('present')
  const [envelopeIntact, setEnvelopeIntact] = useState(true)
  const [remarks, setRemarks] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [keysRes, auditsRes] = await Promise.all([
        getKunciDaftar(),
        getKunciAudits()
      ])
      setKeys(keysRes.data || [])
      setAudits(auditsRes.data || [])
    } catch (err) {
      console.error('Failed to load audit page data', err)
      toast.error(language === 'ms' ? 'Gagal memuatkan rekod audit' : 'Failed to load audit records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Find if selected key is a duplicate key (requires sealed envelope check)
  const isSelectedKeyDuplicate = useMemo(() => {
    const key = keys.find(k => k.id === selectedKeyId)
    return key && key.status_sampul !== 'not_applicable'
  }, [selectedKeyId, keys])

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKeyId || !physicalStatus) {
      toast.error(language === 'ms' ? 'Sila lengkapkan semua medan wajib!' : 'Please complete all mandatory fields!')
      return
    }

    try {
      const auditPayload = {
        kunci_id: selectedKeyId,
        tarikh_audit: new Date().toISOString().split('T')[0],
        auditor_id: loggedUser?.id || 'user-1',
        status_fizikal: physicalStatus,
        sampul_bermeterai_utuh: isSelectedKeyDuplicate ? envelopeIntact : true,
        catatan: remarks,
        hospital_id: hospitalId
      }

      const res = await addKunciAudit(auditPayload)
      if (res.error) throw new Error(res.error)

      toast.success(language === 'ms' ? 'Pemeriksaan audit bulanan berjaya disimpan' : 'Monthly audit verification saved successfully')
      setModalOpen(false)
      // Reset form
      setSelectedKeyId('')
      setPhysicalStatus('present')
      setEnvelopeIntact(true)
      setRemarks('')

      loadData()
    } catch (err: any) {
      toast.error(language === 'ms' ? `Ralat semasa audit: ${err.message}` : `Error saving audit: ${err.message}`)
    }
  }

  const getFizikalBadge = (status: AuditFizikal) => {
    switch (status) {
      case 'present':
        return <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] font-bold">{language === 'ms' ? 'Wujud (Present)' : 'Present'}</Badge>
      case 'missing':
        return <Badge className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] font-bold animate-pulse">{language === 'ms' ? 'Hilang (Missing)' : 'Missing'}</Badge>
      case 'damaged':
        return <Badge className="border-amber-200 text-amber-700 bg-amber-50 text-[10px] font-bold">{language === 'ms' ? 'Rosak (Damaged)' : 'Damaged'}</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-500" />
            {language === 'ms' ? 'Audit Keselamatan & Verifikasi Bulanan' : 'Monthly Security Audit & Key Verification'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'ms' 
              ? 'Rekod pemeriksaan berkala kedudukan kunci fizikal dan integriti sampul meterai kunci pendua'
              : 'Periodic inspection records of physical master keys and duplicate key sealed envelope integrity'}
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-soft font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ms' ? 'Lakukan Audit Baru' : 'Perform New Audit'}
        </Button>
      </div>

      {/* JKNS Audit Requirements Notice */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 items-start">
        <ClipboardCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold">
            {language === 'ms' ? 'Keperluan Audit Berkala JKNS Sarawak' : 'MOH Sarawak Periodic Key Audit Mandate'}
          </h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            {language === 'ms' 
              ? 'Pegawai Penjaga Kunci diwajibkan melakukan audit inventori fizikal bagi semua anak kunci sekali sebulan. Kunci pendua kecemasan di dalam peti besi pentadbiran mesti diuji keutuhan meterai sampulnya dan direkodkan di sini. Kehilangan anak kunci hendaklah dilaporkan segera.'
              : 'Appointed Key Custodians are required to conduct a physical inventory audit for all master keys once a month. Emergency duplicate keys in the administrative safe must have their envelope seal integrity verified and logged here. Any missing keys must be reported immediately.'}
          </p>
        </div>
      </div>

      {/* Audits Log Table Card */}
      <Card className="rounded-2xl shadow-soft bg-white border border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            {language === 'ms' ? 'Sejarah Pemeriksaan Audit Kunci' : 'Key Audit Inspection History'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {language === 'ms' ? 'Memuatkan data audit...' : 'Loading audit records...'}
            </div>
          ) : audits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8 text-slate-300" />
              <span>
                {language === 'ms' 
                  ? 'Tiada rekod audit disimpan. Klik butang di atas untuk melakukan audit pertama.' 
                  : 'No audit records logged yet. Click the button above to record the first inspection.'}
              </span>
            </div>
          ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">{language === 'ms' ? 'Tarikh Audit' : 'Audit Date'}</th>
                      <th className="p-4">{language === 'ms' ? 'Kunci (Kod)' : 'Key (Code)'}</th>
                      <th className="p-4">{language === 'ms' ? 'Fizikal Pintu/Peti' : 'Door / Cabinet Location'}</th>
                      <th className="p-4">{language === 'ms' ? 'Pegawai Auditor' : 'Auditing Officer'}</th>
                      <th className="p-4">{language === 'ms' ? 'Status Fizikal' : 'Physical Status'}</th>
                      <th className="p-4">{language === 'ms' ? 'Meterai Sampul (Pendua)' : 'Sealed Envelope (Duplicate)'}</th>
                      <th className="p-4">{language === 'ms' ? 'Ulasan / Siri Catatan' : 'Remarks / Seal Serial'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.map((audit) => {
                      const auditor = MOCK_AUDITORS.find(a => a.id === audit.auditor_id)?.full_name || (language === 'ms' ? 'Auditor Hospital' : 'Hospital Auditor')
                      const isDuplicate = audit.kunci?.status_sampul !== 'not_applicable'

                      return (
                        <tr key={audit.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-500">
                            {audit.tarikh_audit}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{audit.kunci?.nama_kunci}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{audit.kunci?.kod_kunci}</div>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {audit.kunci?.lokasi_fizikal}
                          </td>
                          <td className="p-4 font-medium text-slate-800 text-xs">
                            {auditor}
                          </td>
                          <td className="p-4">
                            {getFizikalBadge(audit.status_fizikal)}
                          </td>
                          <td className="p-4">
                            {isDuplicate ? (
                              audit.sampul_bermeterai_utuh ? (
                                <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px]">
                                  {language === 'ms' ? 'UTUH' : 'INTACT'}
                                </Badge>
                              ) : (
                                <Badge className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] animate-pulse">
                                  {language === 'ms' ? 'TERBUKA / ROSAK' : 'BROKEN / OPENED'}
                                </Badge>
                              )
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-slate-500 max-w-xs truncate" title={audit.catatan || ''}>
                            {audit.catatan || <span className="text-slate-300">{language === 'ms' ? 'Tiada catatan khusus' : 'No specific remarks'}</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
              <div className="md:hidden divide-y divide-slate-100">
                {audits.map((audit) => {
                  const auditor = MOCK_AUDITORS.find(a => a.id === audit.auditor_id)?.full_name || (language === 'ms' ? 'Auditor Hospital' : 'Hospital Auditor')
                  const isDuplicate = audit.kunci?.status_sampul !== 'not_applicable'

                  return (
                    <div key={audit.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-slate-500 text-xs block">
                            {audit.kunci?.kod_kunci}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {audit.kunci?.nama_kunci}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {getFizikalBadge(audit.status_fizikal)}
                          {isDuplicate && (
                            audit.sampul_bermeterai_utuh ? (
                              <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[9px]">
                                {language === 'ms' ? 'SAMPUL UTUH' : 'SEAL INTACT'}
                              </Badge>
                            ) : (
                              <Badge className="border-rose-200 text-rose-700 bg-rose-50 text-[9px] animate-pulse">
                                {language === 'ms' ? 'TERBUKA / ROSAK' : 'SEAL BROKEN'}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Tarikh Audit' : 'Audit Date'}
                          </span>
                          <span className="font-mono text-slate-700 font-semibold block">
                            {audit.tarikh_audit}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Pegawai Auditor' : 'Auditor'}
                          </span>
                          <span className="text-slate-800 font-semibold truncate block">
                            {auditor}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Lokasi Pintu / Peti' : 'Location'}
                          </span>
                          <span className="text-slate-700 block">
                            {audit.kunci?.lokasi_fizikal || '-'}
                          </span>
                        </div>
                      </div>

                      {audit.catatan && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 italic font-medium">
                          "{audit.catatan}"
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* NEW AUDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={language === 'ms' ? 'Daftar Pemeriksaan Bulanan Baru (Audit Kunci)' : 'Log Monthly Key Audit Inspection'}
      >
        <form onSubmit={handleAuditSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Pilih Kunci Untuk Diaudit *' : 'Select Key To Audit *'}
            </label>
            <select
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">{language === 'ms' ? '-- Sila Pilih Kunci --' : '-- Please Select Key --'}</option>
              {keys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kod_kunci} - {k.nama_kunci} ({k.lokasi_fizikal}) {k.status_sampul !== 'not_applicable' ? `[${language === 'ms' ? 'Kunci Pendua' : 'Duplicate Key'}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Status Fizikal Kunci *' : 'Physical Key Status *'}
              </label>
              <select
                value={physicalStatus}
                onChange={(e) => setPhysicalStatus(e.target.value as any)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="present">{language === 'ms' ? 'Ada / Wujud (Present)' : 'Present / Accounted For'}</option>
                <option value="missing">{language === 'ms' ? 'Hilang / Tiada (Missing)' : 'Missing / Unaccounted'}</option>
                <option value="damaged">{language === 'ms' ? 'Rosak / Bengkok (Damaged)' : 'Damaged / Bent'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Pegawai Auditor (Kakitangan Aktif)' : 'Auditing Officer (Active Staff)'}
              </label>
              <input
                type="text"
                disabled
                value={loggedUser?.full_name || 'Staff (You)'}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-100 text-slate-500"
              />
            </div>
          </div>

          {isSelectedKeyDuplicate && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={envelopeIntact}
                  onChange={(e) => setEnvelopeIntact(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  {language === 'ms' 
                    ? 'Sampul Surat Bermeterai Kunci Pendua Masih Utuh' 
                    : 'Duplicate Key Sealed Security Envelope Is Intact'}
                </span>
              </label>
              <p className="text-[10px] text-slate-400 pl-6 leading-relaxed">
                {language === 'ms' 
                  ? 'Kosongkan kotak semakan jika sampul telah koyak atau terbuka semasa audit dijalankan (cth: kerana digunakan dalam kecemasan atau meterai rosak).'
                  : 'Uncheck if the envelope was torn, opened, or breached during inspection (e.g. used during emergency or broken seal).'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Catatan Semakan & Siri Nombor Meterai' : 'Audit Remarks & Seal Serial Number'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={language === 'ms' ? 'E.g., Semakan fizikal teratur. Tiada tanda kerosakan. Siri meterai sampul KKM-4281 disahkan...' : 'E.g., Physical check satisfactory. No damage detected. Security envelope seal #KKM-4281 verified intact...'}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setModalOpen(false)}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 border rounded-xl"
            >
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-soft"
            >
              {language === 'ms' ? 'Simpan Audit' : 'Save Audit Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default KunciAuditPage
