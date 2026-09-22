// src/modules/mykunci/pages/KunciLogPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { 
  FileText, 
  Search, 
  Download, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react'
import { getKunciLogs, returnKunci } from '@/modules/mykunci/services/kunciService'
import type { KunciLog } from '@/shared/types/mykunci'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, FileUpload } from '@/components/ui'
import { useToast } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { mockUsers } from '@/services/mockData'

const MOCK_BORROWERS = mockUsers;

export const KunciLogPage: React.FC = () => {
  const toast = useToast()
  const { language } = useLanguage()
  const loggedUser = useAuthStore((state) => state.user)
  const [logs, setLogs] = useState<KunciLog[]>([])
  const [loading, setLoading] = useState(true)

  // Return modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [activeLogToReturn, setActiveLogToReturn] = useState<KunciLog | null>(null)
  const [keyCondition, setKeyCondition] = useState<'good' | 'damaged'>('good')
  const [lockCondition, setLockCondition] = useState<'good' | 'damaged' | 'loose'>('good')
  const [remarks, setRemarks] = useState('')
  const [returnPhoto, setReturnPhoto] = useState<File | null>(null)
  const [returnDateTime, setReturnDateTime] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await getKunciLogs()
      setLogs(res.data || [])
    } catch (err) {
      console.error('Failed to load logs', err)
      toast.error(language === 'ms' ? 'Gagal memuatkan log pergerakan kunci' : 'Failed to load key custody logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLogToReturn) return
    if (!returnPhoto) {
      toast.error(
        language === 'ms' ? 'Semakan Foto' : 'Photo Verification',
        language === 'ms' ? 'Sila snap atau muat naik foto kunci sebelum memulangkan!' : 'Please snap or upload a photo of the key before returning!'
      )
      return
    }

    try {
      const returnPayload = {
        tarikh_masa_pulang: new Date(returnDateTime).toISOString(),
        pegawai_penerima_id: loggedUser?.id || 'user-1',
        keadaan_kunci: keyCondition,
        keadaan_mangga: lockCondition,
        catatan_penggunaan: remarks
      }

      const res = await returnKunci(activeLogToReturn.id, returnPayload)
      if (res.error) throw new Error(res.error)

      toast.success(
        language === 'ms' ? 'Berjaya' : 'Success',
        language === 'ms' ? 'Pemulangan kunci berjaya direkodkan' : 'Key return recorded successfully'
      )
      setReturnModalOpen(false)
      setActiveLogToReturn(null)
      setRemarks('')
      setReturnPhoto(null)
      setReturnDateTime('')
      
      loadLogs()
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat Pemulangan' : 'Return Error',
        err.message || (language === 'ms' ? 'Gagal menyimpan rekod pemulangan' : 'Failed to save return record')
      )
    }
  }

  // Calculate filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const borrowerName = log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || ''
      const matchesSearch = 
        log.kunci?.nama_kunci.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.kunci?.kod_kunci.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.catatan_penggunaan && log.catatan_penggunaan.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = 
        statusFilter === '' ||
        (statusFilter === 'active' && !log.tarikh_masa_pulang) ||
        (statusFilter === 'returned' && log.tarikh_masa_pulang) ||
        (statusFilter === 'overdue' && !log.tarikh_masa_pulang && new Date(log.jangka_masa_pulang).getTime() < new Date().getTime())

      let matchesDate = true
      if (startDate) {
        matchesDate = matchesDate && new Date(log.tarikh_masa_ambil) >= new Date(startDate)
      }
      if (endDate) {
        // Set end date to end of the day
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        matchesDate = matchesDate && new Date(log.tarikh_masa_ambil) <= endDateTime
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [logs, searchTerm, statusFilter, startDate, endDate])

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleString(language === 'ms' ? 'ms-MY' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '-'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const csvHeader = [
        'Checkout Time',
        'Key Code',
        'Key Name',
        'Borrower',
        'Issuing Officer',
        'Witness / Second Officer',
        'Expected Return',
        'Return Time',
        'Receiving Officer',
        'Key Condition',
        'Lock Condition',
        'Remarks',
        'Duration (Seconds)'
      ].join(',')

      const csvRows = filteredLogs.map(log => {
        const borrower = log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'
        const penyerah = log.pegawai_penyerah?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penyerah_id)?.full_name || 'Staff'
        const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_saksi_id)?.full_name || '') : ''
        const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penerima_id)?.full_name || '') : ''

        return [
          `"${formatDateTime(log.tarikh_masa_ambil)}"`,
          `"${log.kunci?.kod_kunci || ''}"`,
          `"${log.kunci?.nama_kunci || ''}"`,
          `"${borrower}"`,
          `"${penyerah}"`,
          `"${saksi}"`,
          `"${formatDateTime(log.jangka_masa_pulang)}"`,
          `"${log.tarikh_masa_pulang ? formatDateTime(log.tarikh_masa_pulang) : 'Active'}"`,
          `"${penerima}"`,
          `"${log.keadaan_kunci || ''}"`,
          `"${log.keadaan_mangga || ''}"`,
          `"${log.catatan_penggunaan || ''}"`,
          log.duration_seconds || ''
        ].join(',')
      })

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [csvHeader, ...csvRows].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Key_Custody_Log_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(language === 'ms' ? 'Log berjaya dieksport ke fail CSV' : 'Custody log exported to CSV successfully')
    } catch (err: any) {
      toast.error(language === 'ms' ? 'Gagal mengeksport fail CSV' : 'Failed to export CSV file')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-500" />
            {language === 'ms' ? 'Log Pergerakan Kunci (Buku Daftar Keluar/Masuk)' : 'Key Custody & Movement Audit Log'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'ms' 
              ? 'Jejak audit lengkap bagi semua anak kunci fizikal mengikut syif tugasan'
              : 'Complete audit trail of physical master key checkouts, returns, and officer handovers'}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl border font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {language === 'ms' ? 'Eksport CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="rounded-xl shadow-soft bg-white border border-slate-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder={language === 'ms' ? 'Cari kunci, peminjam, catatan...' : 'Search key, borrower, remarks...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">{language === 'ms' ? 'Semua Transaksi' : 'All Transactions'}</option>
              <option value="active">{language === 'ms' ? 'Sedang Dipinjam' : 'Currently Borrowed'}</option>
              <option value="returned">{language === 'ms' ? 'Sudah Dipulangkan' : 'Returned / Checked-In'}</option>
              <option value="overdue">{language === 'ms' ? 'Overdue (Lewat)' : 'Overdue (Late)'}</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              placeholder={language === 'ms' ? 'Tarikh Dari' : 'Start Date'}
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              placeholder={language === 'ms' ? 'Tarikh Hingga' : 'End Date'}
            />
          </div>
        </div>
      </Card>

      {/* Logs Table Card */}
      <Card className="rounded-2xl shadow-soft bg-white border border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {language === 'ms' ? 'Memuatkan log...' : 'Loading custody logs...'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-300" />
              <span>
                {language === 'ms' 
                  ? 'Tiada log pergerakan ditemui bagi penapis semasa.' 
                  : 'No key movement records found matching current filters.'}
              </span>
            </div>
          ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">{language === 'ms' ? 'Tarikh & Masa Ambil' : 'Checkout Date & Time'}</th>
                      <th className="p-4">{language === 'ms' ? 'Butiran Kunci' : 'Key Details'}</th>
                      <th className="p-4">{language === 'ms' ? 'Peminjam' : 'Borrower'}</th>
                      <th className="p-4">{language === 'ms' ? 'Pegawai Penyerah / Saksi' : 'Issuing Officer / Witness'}</th>
                      <th className="p-4">{language === 'ms' ? 'Tarikh Masa Pulang' : 'Return Time'}</th>
                      <th className="p-4">{language === 'ms' ? 'Penerima' : 'Receiving Officer'}</th>
                      <th className="p-4">{language === 'ms' ? 'Tempoh Guna' : 'Duration'}</th>
                      <th className="p-4">{language === 'ms' ? 'Catatan Laporan' : 'Remarks / Incident Report'}</th>
                      <th className="p-4 text-right">{language === 'ms' ? 'Tindakan' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log) => {
                      const active = !log.tarikh_masa_pulang
                      const overdue = active && new Date(log.jangka_masa_pulang).getTime() < new Date().getTime()
                      
                      const borrower = log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')
                      const penyerah = log.pegawai_penyerah?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penyerah_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')
                      const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_saksi_id)?.full_name) : null
                      const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penerima_id)?.full_name) : '-'

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-500">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{log.kunci?.nama_kunci}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{log.kunci?.kod_kunci}</div>
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {borrower}
                          </td>
                          <td className="p-4 text-xs">
                            <div className="text-slate-700">
                              {language === 'ms' ? 'Penyerah:' : 'Issuer:'} {penyerah}
                            </div>
                            {saksi && (
                              <div className="text-slate-400 italic mt-0.5">
                                {language === 'ms' ? 'Saksi:' : 'Witness:'} {saksi}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {active ? (
                              <div className="space-y-1">
                                <Badge className="border-amber-200 text-amber-700 bg-amber-50 text-[9px] font-bold">
                                  {language === 'ms' ? 'DALAM PENGGUNAAN' : 'IN USE / BORROWED'}
                                </Badge>
                                {overdue && (
                                  <div>
                                    <Badge className="border-transparent text-white bg-rose-500 text-[9px] font-bold animate-pulse">
                                      {language === 'ms' ? 'OVERDUE (LEWAT)' : 'OVERDUE (LATE)'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-xs text-slate-500">
                                {formatDateTime(log.tarikh_masa_pulang)}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-700 text-xs">
                            {penerima}
                          </td>
                          <td className="p-4 font-mono text-xs">
                            {formatDuration(log.duration_seconds)}
                          </td>
                          <td className="p-4 max-w-xs text-xs text-slate-500 truncate" title={log.catatan_penggunaan || ''}>
                            {log.catatan_penggunaan || <span className="text-slate-300">{language === 'ms' ? 'Tiada laporan insiden' : 'No incident report'}</span>}
                            {log.keadaan_kunci === 'damaged' && (
                              <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                                {language === 'ms' ? '[!] Kunci Rosak' : '[!] Damaged Key'}
                              </div>
                            )}
                            {log.keadaan_mangga === 'damaged' && (
                              <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                                {language === 'ms' ? '[!] Mangga Rosak' : '[!] Damaged Lock'}
                              </div>
                            )}
                            {log.keadaan_mangga === 'loose' && (
                              <div className="text-amber-600 font-bold text-[10px] mt-0.5">
                                {language === 'ms' ? '[!] Mangga Longgar' : '[!] Loose Lock'}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {active ? (
                              <Button 
                                onClick={() => {
                                  const now = new Date()
                                  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                  setReturnDateTime(localIso)
                                  setActiveLogToReturn(log)
                                  setReturnModalOpen(true)
                                }}
                                className="text-xs border-amber-500 text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg border font-bold"
                              >
                                {language === 'ms' ? 'Pulang Kunci' : 'Check-In'}
                              </Button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const active = !log.tarikh_masa_pulang
                  const overdue = active && new Date(log.jangka_masa_pulang).getTime() < new Date().getTime()
                  
                  const borrower = log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')
                  const penyerah = log.pegawai_penyerah?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penyerah_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')
                  const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_saksi_id)?.full_name) : null
                  const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || MOCK_BORROWERS.find(b => b.id === log.pegawai_penerima_id)?.full_name) : '-'

                  return (
                    <div key={log.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-slate-500 text-xs block">
                            {log.kunci?.kod_kunci}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {log.kunci?.nama_kunci}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {active ? (
                            <Badge className="border-amber-200 text-amber-700 bg-amber-50 text-[9px] font-bold">
                              {language === 'ms' ? 'DIPINJAM' : 'BORROWED'}
                            </Badge>
                          ) : (
                            <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[9px] font-bold">
                              {language === 'ms' ? 'SELESAI' : 'RETURNED'}
                            </Badge>
                          )}
                          {overdue && (
                            <Badge className="border-transparent text-white bg-rose-500 text-[9px] font-bold animate-pulse">
                              {language === 'ms' ? 'LEWAT' : 'OVERDUE'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Peminjam' : 'Borrower'}
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {borrower}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Tempoh Guna' : 'Duration'}
                          </span>
                          <span className="font-mono font-bold text-slate-700">
                            {formatDuration(log.duration_seconds)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Masa Ambil' : 'Checkout'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 block">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Masa Pulang' : 'Return'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 block">
                            {log.tarikh_masa_pulang ? formatDateTime(log.tarikh_masa_pulang) : '-'}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Pegawai Penyerah / Penerima' : 'Officers'}
                          </span>
                          <span className="text-slate-600 text-[11px] block">
                            {language === 'ms' ? 'Serah: ' : 'Out: '}<strong>{penyerah}</strong>
                            {penerima !== '-' && <span> • {language === 'ms' ? 'Terima: ' : 'In: '}<strong>{penerima}</strong></span>}
                            {saksi && <span className="italic text-slate-400"> (Saksi: {saksi})</span>}
                          </span>
                        </div>
                      </div>

                      {(log.catatan_penggunaan || log.keadaan_kunci === 'damaged' || log.keadaan_mangga === 'damaged' || log.keadaan_mangga === 'loose') && (
                        <div className="p-2 bg-amber-50/60 border border-amber-200/70 rounded-lg text-xs space-y-0.5">
                          {log.catatan_penggunaan && (
                            <p className="text-slate-700 italic">"{log.catatan_penggunaan}"</p>
                          )}
                          {log.keadaan_kunci === 'damaged' && (
                            <span className="text-rose-600 font-bold text-[10px] block">⚠️ {language === 'ms' ? 'Kunci Rosak' : 'Damaged Key'}</span>
                          )}
                          {log.keadaan_mangga === 'damaged' && (
                            <span className="text-rose-600 font-bold text-[10px] block">⚠️ {language === 'ms' ? 'Mangga Rosak' : 'Damaged Lock'}</span>
                          )}
                          {log.keadaan_mangga === 'loose' && (
                            <span className="text-amber-600 font-bold text-[10px] block">⚠️ {language === 'ms' ? 'Mangga Longgar' : 'Loose Lock'}</span>
                          )}
                        </div>
                      )}

                      {active && (
                        <Button 
                          onClick={() => {
                            const now = new Date()
                            const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                            setReturnDateTime(localIso)
                            setActiveLogToReturn(log)
                            setReturnModalOpen(true)
                          }}
                          className="w-full text-xs border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100 py-2 rounded-xl border font-bold"
                        >
                          {language === 'ms' ? 'Pulang Kunci' : 'Check-In'}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* RETURN MODAL */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title={language === 'ms' ? 'Rekod Pemulangan Kunci Fizikal' : 'Record Physical Key Check-In'}
        size="2xl"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
          {activeLogToReturn && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1 text-slate-600">
              <div>{language === 'ms' ? 'Kunci:' : 'Key:'} <strong className="text-slate-800">{activeLogToReturn.kunci?.nama_kunci} ({activeLogToReturn.kunci?.kod_kunci})</strong></div>
              <div>{language === 'ms' ? 'Peminjam:' : 'Borrower:'} <strong className="text-slate-800">{activeLogToReturn.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === activeLogToReturn.peminjam_id)?.full_name}</strong></div>
              <div>{language === 'ms' ? 'Masa Pinjam:' : 'Borrowed Time:'} <strong className="text-slate-800">{formatDateTime(activeLogToReturn.tarikh_masa_ambil)}</strong></div>
              <div>{language === 'ms' ? 'Masa Pulang (Rekod):' : 'Return Time (Record):'} <strong className="text-slate-800">{formatDateTime(new Date(returnDateTime).toISOString())}</strong></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Keadaan Fizikal Anak Kunci *' : 'Physical Key Condition *'}
              </label>
              <select
                value={keyCondition}
                onChange={(e) => setKeyCondition(e.target.value as any)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="good">{language === 'ms' ? 'Baik / Tiada Keretakan (Good)' : 'Good / Intact (No Damage)'}</option>
                <option value="damaged">{language === 'ms' ? 'Rosak / Bengkok (Damaged)' : 'Damaged / Bent / Broken'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Keadaan Mangga / Padlock Pintu *' : 'Padlock & Door Lock Condition *'}
              </label>
              <select
                value={lockCondition}
                onChange={(e) => setLockCondition(e.target.value as any)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="good">{language === 'ms' ? 'Kukuh / Berfungsi Baik' : 'Secure / Fully Functional'}</option>
                <option value="loose">{language === 'ms' ? 'Longgar / Longgatan Skru' : 'Loose / Wobbly Screws'}</option>
                <option value="damaged">{language === 'ms' ? 'Rosak / Engsel Rosak' : 'Damaged / Broken Hasp'}</option>
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Tarikh & Masa Pulang *' : 'Return Date & Time *'}
            </label>
            <input
              type="datetime-local"
              required
              value={returnDateTime}
              onChange={(e) => setReturnDateTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Catatan Pemulangan & Laporan Kejadian (Jika Ada)' : 'Return Remarks & Incident Report (If Any)'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={language === 'ms' ? 'Cth: Kunci dipulangkan tepat pada masa. Mangga pintu berfungsi dengan baik...' : 'E.g.: Key returned on time. Padlock functioning smoothly with no issues...'}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="mt-4">
            <FileUpload
              label={language === 'ms' ? 'Snap / Muat Naik Foto Kunci (Wajib) *' : 'Snap / Upload Key Photo (Mandatory) *'}
              accept="image/*"
              required
              value={returnPhoto}
              onChange={(file) => setReturnPhoto(file)}
              helperText={language === 'ms' ? 'Ambil gambar anak kunci fizikal yang dipulangkan untuk bukti simpanan' : 'Take a photo of the returned physical key as audit proof of storage.'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setReturnModalOpen(false)
                setActiveLogToReturn(null)
                setReturnPhoto(null)
              }}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 border rounded-xl"
            >
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={!returnPhoto}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ms' ? 'Selesaikan Pulangan' : 'Complete Return'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default KunciLogPage
