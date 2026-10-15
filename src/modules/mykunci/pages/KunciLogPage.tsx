// src/modules/mykunci/pages/KunciLogPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { FileText, Search, Download, Calendar } from 'lucide-react'
import { getKunciLogs, returnKunci } from '@/modules/mykunci/services/kunciService'
import { getUsers } from '@/services/userService'
import type { KunciLog } from '@/shared/types/mykunci'
import type { User } from '@/shared/types'
import { Card, CardContent, Button, Badge, Modal, FileUpload } from '@/components/ui'
import { SkeletonTable, SkeletonMobileCardList } from '@/shared/components/ui/skeleton'
import { useToast } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

export const KunciLogPage: React.FC = () => {
  const toast = useToast()
  const loggedUser = useAuthStore((state) => state.user)
  const [logs, setLogs] = useState<KunciLog[]>([])
  const [borrowers, setBorrowers] = useState<User[]>([])
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
      const [res, usersRes] = await Promise.all([
        getKunciLogs(),
        getUsers({ pageSize: 200 })
      ])
      setLogs(res.data || [])
      setBorrowers(usersRes.data || [])
    } catch (err) {
      console.error('Failed to load logs', err)
      toast.error('Failed to load key custody logs')
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
        'Photo Verification',
        'Please snap or upload a photo of the key before returning!'
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
        'Success',
        'Key return recorded successfully'
      )
      setReturnModalOpen(false)
      setActiveLogToReturn(null)
      setRemarks('')
      setReturnPhoto(null)
      setReturnDateTime('')
      
      loadLogs()
    } catch (err: any) {
      toast.error(
        'Return Error',
        err.message || 'Failed to save return record'
      )
    }
  }

  // Calculate filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const borrowerName = log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || ''
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
    return date.toLocaleString('en-GB', {
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
        const borrower = log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'
        const penyerah = log.pegawai_penyerah?.full_name || borrowers.find(b => b.id === log.pegawai_penyerah_id)?.full_name || 'Staff'
        const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || borrowers.find(b => b.id === log.pegawai_saksi_id)?.full_name || '') : ''
        const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || borrowers.find(b => b.id === log.pegawai_penerima_id)?.full_name || '') : ''

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
      toast.success('Custody log exported to CSV successfully')
    } catch (err: any) {
      toast.error('Failed to export CSV file')
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-500" />
            Key Custody & Movement Audit Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit trail of physical master key checkouts, returns, and officer handovers
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="min-h-[44px] border-border-default text-text-secondary bg-surface hover:bg-subtle/50 rounded-xl border font-semibold flex items-center gap-2 px-4 py-2.5"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="rounded-xl shadow-elevation-1 bg-surface border border-border-subtle p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search key, borrower, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border-default pl-9 pr-4 py-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-border-default px-3 py-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
            >
              <option value="">All Transactions</option>
              <option value="active">Currently Borrowed</option>
              <option value="returned">Returned / Checked-In</option>
              <option value="overdue">Overdue (Late)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-border-default px-3 py-2 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
              placeholder="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-border-default px-3 py-2 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
              placeholder="End Date"
            />
          </div>
        </div>
      </Card>

      {/* Logs Table Card */}
      <Card className="rounded-2xl shadow-elevation-1 bg-surface border border-border-default">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="hidden md:block">
                <SkeletonTable rows={6} columns={9} className="border-none shadow-none rounded-xl" />
              </div>
              <div className="md:hidden">
                <SkeletonMobileCardList count={4} />
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-300" />
              <span>
                No key movement records found matching current filters.
              </span>
            </div>
          ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-text-muted">
                  <thead className="bg-subtle/50 text-text-muted font-semibold border-b border-border-subtle">
                    <tr>
                      <th className="p-4">Checkout Date & Time</th>
                      <th className="p-4">Key Details</th>
                      <th className="p-4">Borrower</th>
                      <th className="p-4">Issuing Officer / Witness</th>
                      <th className="p-4">Return Time</th>
                      <th className="p-4">Receiving Officer</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Remarks / Incident Report</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredLogs.map((log) => {
                      const active = !log.tarikh_masa_pulang
                      const overdue = active && new Date(log.jangka_masa_pulang).getTime() < new Date().getTime()
                      
                      const borrower = log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'
                      const penyerah = log.pegawai_penyerah?.full_name || borrowers.find(b => b.id === log.pegawai_penyerah_id)?.full_name || 'Staff'
                      const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || borrowers.find(b => b.id === log.pegawai_saksi_id)?.full_name) : null
                      const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || borrowers.find(b => b.id === log.pegawai_penerima_id)?.full_name) : '-'

                      return (
                        <tr key={log.id} className="hover:bg-subtle/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-text-muted">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-text-primary">{log.kunci?.nama_kunci}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{log.kunci?.kod_kunci}</div>
                          </td>
                          <td className="p-4 font-medium text-text-primary">
                            {borrower}
                          </td>
                          <td className="p-4 text-xs">
                            <div className="text-text-secondary">
                              Issuer: {penyerah}
                            </div>
                            {saksi && (
                              <div className="text-slate-400 italic mt-0.5">
                                Witness: {saksi}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {active ? (
                              <div className="space-y-1">
                                <Badge className="border-amber-500/20 text-amber-700 bg-amber-500/10 text-[9px] font-bold">
                                  IN USE / BORROWED
                                </Badge>
                                {overdue && (
                                  <div>
                                    <Badge className="border-transparent text-white bg-rose-500 text-[9px] font-bold animate-pulse">
                                      OVERDUE (LATE)
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-xs text-text-muted">
                                {formatDateTime(log.tarikh_masa_pulang)}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-text-secondary text-xs">
                            {penerima}
                          </td>
                          <td className="p-4 font-mono text-xs">
                            {formatDuration(log.duration_seconds)}
                          </td>
                          <td className="p-4 max-w-xs text-xs text-text-muted truncate" title={log.catatan_penggunaan || ''}>
                            {log.catatan_penggunaan || <span className="text-slate-300">No incident report</span>}
                            {log.keadaan_kunci === 'damaged' && (
                              <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                                [!] Damaged Key
                              </div>
                            )}
                            {log.keadaan_mangga === 'damaged' && (
                              <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                                [!] Damaged Lock
                              </div>
                            )}
                            {log.keadaan_mangga === 'loose' && (
                              <div className="text-amber-600 font-bold text-[10px] mt-0.5">
                                [!] Loose Lock
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
                                className="text-xs border-amber-500 text-amber-600 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg border font-bold"
                              >
                                Check-In
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
              <div className="md:hidden divide-y divide-border-subtle">
                {filteredLogs.map((log) => {
                  const active = !log.tarikh_masa_pulang
                  const overdue = active && new Date(log.jangka_masa_pulang).getTime() < new Date().getTime()
                  
                  const borrower = log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'
                  const penyerah = log.pegawai_penyerah?.full_name || borrowers.find(b => b.id === log.pegawai_penyerah_id)?.full_name || 'Staff'
                  const saksi = log.pegawai_saksi_id ? (log.pegawai_saksi?.full_name || borrowers.find(b => b.id === log.pegawai_saksi_id)?.full_name) : null
                  const penerima = log.pegawai_penerima_id ? (log.pegawai_penerima?.full_name || borrowers.find(b => b.id === log.pegawai_penerima_id)?.full_name) : '-'

                  return (
                    <div key={log.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-text-muted text-xs block">
                            {log.kunci?.kod_kunci}
                          </span>
                          <h4 className="font-extrabold text-text-primary text-sm">
                            {log.kunci?.nama_kunci}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {active ? (
                            <Badge className="border-amber-500/20 text-amber-700 bg-amber-500/10 text-[9px] font-bold">
                              BORROWED
                            </Badge>
                          ) : (
                            <Badge className="border-emerald-500/20 text-emerald-700 bg-emerald-500/10 text-[9px] font-bold">
                              RETURNED
                            </Badge>
                          )}
                          {overdue && (
                            <Badge className="border-transparent text-white bg-rose-500 text-[9px] font-bold animate-pulse">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-subtle/50 p-3 rounded-xl border border-border-subtle">
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                            Borrower
                          </span>
                          <span className="font-semibold text-text-primary truncate block">
                            {borrower}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                            Duration
                          </span>
                          <span className="font-mono font-bold text-text-secondary">
                            {formatDuration(log.duration_seconds)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                            Checkout
                          </span>
                          <span className="font-mono text-[11px] text-text-muted block">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                            Return
                          </span>
                          <span className="font-mono text-[11px] text-text-muted block">
                            {log.tarikh_masa_pulang ? formatDateTime(log.tarikh_masa_pulang) : '-'}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-border-default">
                          <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                            Officers
                          </span>
                          <span className="text-text-muted text-[11px] block">
                            Out: <strong>{penyerah}</strong>
                            {penerima !== '-' && <span> • In: <strong>{penerima}</strong></span>}
                            {saksi && <span className="italic text-slate-400"> (Witness: {saksi})</span>}
                          </span>
                        </div>
                      </div>

                      {(log.catatan_penggunaan || log.keadaan_kunci === 'damaged' || log.keadaan_mangga === 'damaged' || log.keadaan_mangga === 'loose') && (
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-0.5">
                          {log.catatan_penggunaan && (
                            <p className="text-text-secondary italic">"{log.catatan_penggunaan}"</p>
                          )}
                          {log.keadaan_kunci === 'damaged' && (
                            <span className="text-rose-600 font-bold text-[10px] block">⚠️ Damaged Key</span>
                          )}
                          {log.keadaan_mangga === 'damaged' && (
                            <span className="text-rose-600 font-bold text-[10px] block">⚠️ Damaged Lock</span>
                          )}
                          {log.keadaan_mangga === 'loose' && (
                            <span className="text-amber-600 font-bold text-[10px] block">⚠️ Loose Lock</span>
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
                          className="w-full min-h-[44px] text-xs border-amber-500 bg-amber-500/10 text-amber-700 hover:bg-amber-100 py-2 rounded-xl border font-bold flex items-center justify-center"
                        >
                          Check-In
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
        title="Record Physical Key Check-In"
        size="2xl"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
          {activeLogToReturn && (
            <div className="bg-subtle/50 rounded-xl p-3 border border-border-subtle text-xs space-y-1 text-text-muted">
              <div>Key: <strong className="text-text-primary">{activeLogToReturn.kunci?.nama_kunci} ({activeLogToReturn.kunci?.kod_kunci})</strong></div>
              <div>Borrower: <strong className="text-text-primary">{activeLogToReturn.peminjam?.full_name || borrowers.find(b => b.id === activeLogToReturn.peminjam_id)?.full_name}</strong></div>
              <div>Borrowed Time: <strong className="text-text-primary">{formatDateTime(activeLogToReturn.tarikh_masa_ambil)}</strong></div>
              <div>Return Time (Record): <strong className="text-text-primary">{formatDateTime(new Date(returnDateTime).toISOString())}</strong></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                Physical Key Condition *
              </label>
              <select
                value={keyCondition}
                onChange={(e) => setKeyCondition(e.target.value as any)}
                required
                className="w-full rounded-xl border border-border-default p-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
              >
                <option value="good">Good / Intact (No Damage)</option>
                <option value="damaged">Damaged / Bent / Broken</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                Padlock & Door Lock Condition *
              </label>
              <select
                value={lockCondition}
                onChange={(e) => setLockCondition(e.target.value as any)}
                required
                className="w-full rounded-xl border border-border-default p-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
              >
                <option value="good">Secure / Fully Functional</option>
                <option value="loose">Loose / Wobbly Screws</option>
                <option value="damaged">Damaged / Broken Hasp</option>
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
              Return Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={returnDateTime}
              onChange={(e) => setReturnDateTime(e.target.value)}
              className="w-full rounded-xl border border-border-default p-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
              Return Remarks & Incident Report (If Any)
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="E.g.: Key returned on time. Padlock functioning smoothly with no issues..."
              className="w-full rounded-xl border border-border-default p-2.5 text-sm bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-surface transition-colors resize-none"
            />
          </div>

          <div className="mt-4">
            <FileUpload
              label="Snap / Upload Key Photo (Mandatory) *"
              accept="image/*"
              required
              value={returnPhoto}
              onChange={(file) => setReturnPhoto(file)}
              helperText="Take a photo of the returned physical key as audit proof of storage."
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
              className="border-border-default text-text-muted hover:bg-subtle/50 px-4 py-2 border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!returnPhoto}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-elevation-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Return
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default KunciLogPage
