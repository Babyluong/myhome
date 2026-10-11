// src/modules/mykunci/pages/KunciDashboardPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Calendar,
  AlertCircle,
  Building,
  ChevronRight,
  QrCode
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getKunciDaftar, 
  getKunciLogs, 
  checkoutKunci, 
  returnKunci 
} from '@/modules/mykunci/services/kunciService'
import { getDepartmentsByHospital } from '@/modules/admin/services/departmentService'
import { getUsers } from '@/services/userService'
import type { KunciDaftar, KunciLog } from '@/shared/types/mykunci'
import type { Department, User } from '@/shared/types'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  Modal,
  FileUpload,
  ModulePageHeader
} from '@/components/ui'
import { ScanKunciMovementModal } from '@/components/kunci/ScanKunciMovementModal'
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMobileCardList } from '@/shared/components/ui/skeleton'
import { Fab } from '@/shared/components/mobile'

export const KunciDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const loggedUser = useAuthStore((state) => state.user)
  const hospitalId = loggedUser?.hospital_id || 'hosp-1'
  const toast = useToast()
  
  const [keys, setKeys] = useState<KunciDaftar[]>([])
  const [logs, setLogs] = useState<KunciLog[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [borrowers, setBorrowers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [borrowerId, setBorrowerId] = useState('')
  const [witnessId, setWitnessId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [durationHours, setDurationHours] = useState('1') // Default to 1 hour
  const [customHours, setCustomHours] = useState('')

  // Return modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [activeLogToReturn, setActiveLogToReturn] = useState<KunciLog | null>(null)
  const [keyCondition, setKeyCondition] = useState<'good' | 'damaged'>('good')
  const [lockCondition, setLockCondition] = useState<'good' | 'damaged' | 'loose'>('good')
  const [remarks, setRemarks] = useState('')
  const [returnPhoto, setReturnPhoto] = useState<File | null>(null)
  const [returnDateTime, setReturnDateTime] = useState('')

  // Scan movement modal state
  const [scanModalOpen, setScanModalOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [keysRes, logsRes, deptsRes, usersRes] = await Promise.all([
        getKunciDaftar(),
        getKunciLogs(),
        getDepartmentsByHospital(hospitalId),
        getUsers({ pageSize: 200 })
      ])
      setKeys(keysRes.data || [])
      setLogs(logsRes.data || [])
      setDepartments(deptsRes || [])
      setBorrowers(usersRes.data || [])
    } catch (err) {
      console.error('Failed to load MyKunci dashboard data', err)
      toast.error('System Error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (loggedUser?.id) {
      setBorrowerId(loggedUser.id)
    }
  }, [loggedUser])

  // Calculate metrics
  const stats = useMemo(() => {
    const total = keys.length
    const borrowed = keys.filter(k => k.status === 'borrowed').length
    const damaged = keys.filter(k => k.status === 'damaged').length
    const lost = keys.filter(k => k.status === 'lost').length
    const available = keys.filter(k => k.status === 'available').length

    // Overdue count
    const now = new Date().getTime()
    const borrowedKeyIds = new Set(keys.filter(k => k.status === 'borrowed').map(k => k.id))
    const overdue = logs.filter(l => 
      borrowedKeyIds.has(l.kunci_id) && !l.tarikh_masa_pulang && new Date(l.jangka_masa_pulang).getTime() < now
    ).length

    return { total, borrowed, damaged, lost, available, overdue }
  }, [keys, logs])

  // Compute stats per department
  const departmentStats = useMemo(() => {
    const statsMap: Record<string, { total: number; available: number; borrowed: number; overdue: number }> = {}
    
    departments.forEach(dept => {
      const deptKeys = keys.filter(k => k.department_id === dept.id)
      const deptBorrowed = deptKeys.filter(k => k.status === 'borrowed')
      const deptAvailable = deptKeys.filter(k => k.status === 'available')
      
      const now = new Date().getTime()
      const deptOverdue = logs.filter(l => 
        !l.tarikh_masa_pulang && 
        new Date(l.jangka_masa_pulang).getTime() < now &&
        deptKeys.some(k => k.id === l.kunci_id && k.status === 'borrowed')
      ).length

      statsMap[dept.id] = {
        total: deptKeys.length,
        available: deptAvailable.length,
        borrowed: deptBorrowed.length,
        overdue: deptOverdue
      }
    })

    return statsMap
  }, [keys, logs, departments])

  // Get active borrows list
  const activeBorrows = useMemo(() => {
    const map = new Map(keys.map(k => [k.id, k]))
    const active = logs.filter(l => !l.tarikh_masa_pulang && map.has(l.kunci_id) && map.get(l.kunci_id)?.status === 'borrowed')
    return active.map(l => ({
      ...l,
      kunci: map.get(l.kunci_id)
    }))
  }, [logs, keys])

  // Filter out available keys for checkout dropdown
  const availableKeys = useMemo(() => {
    return keys.filter(k => k.status === 'available')
  }, [keys])

  // Watch selected key in checkout to check security clearance level
  const selectedKeyDetails = useMemo(() => {
    return keys.find(k => k.id === selectedKeyId)
  }, [selectedKeyId, keys])

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKeyId || !borrowerId) {
      toast.error('Form Validation', 'Please fill in all mandatory fields!')
      return
    }

    // High security double-custody co-signing witness check
    if (selectedKeyDetails?.tahap_kawalan === 'high' && !witnessId) {
      toast.error(
        'Witness Verification',
        'High-security DDA keys require a mandatory Co-signing Witness / Second Officer in accordance with MOH Sarawak directives!'
      )
      return
    }

    try {
      const now = new Date()
      let hours = 1
      if (durationHours === 'until_done') {
        hours = 24 // 24 hours for "until done"
      } else if (durationHours === 'other') {
        hours = parseInt(customHours) || 1
      } else {
        hours = parseInt(durationHours) || 1
      }
      const eta = new Date(now.getTime() + hours * 3600 * 1000)

      const checkoutPayload = {
        kunci_id: selectedKeyId,
        peminjam_id: borrowerId,
        pegawai_penyerah_id: loggedUser?.id || 'user-1',
        pegawai_saksi_id: witnessId || undefined,
        tujuan: purpose,
        tarikh_masa_ambil: now.toISOString(),
        jangka_masa_pulang: eta.toISOString(),
        is_overdue: false,
        hospital_id: hospitalId
      }

      const res = await checkoutKunci(checkoutPayload)
      if (res.error) throw new Error(res.error)

      toast.success('Success', 'Key checkout loan recorded successfully')
      setCheckoutModalOpen(false)
      // Reset form fields
      setSelectedKeyId('')
      setBorrowerId('')
      setWitnessId('')
      setPurpose('')
      setDurationHours('1')
      setCustomHours('')
      
      loadData()
    } catch (err: any) {
      toast.error('Checkout Error', err.message || 'Failed to record checkout loan')
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLogToReturn) return
    if (!returnPhoto) {
      toast.error('Photo Verification', 'Please snap or upload a photo of the physical key before returning!')
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

      toast.success('Success', 'Key return checked in successfully')
      setReturnModalOpen(false)
      setActiveLogToReturn(null)
      setRemarks('')
      setReturnPhoto(null)
      setReturnDateTime('')
      
      loadData()
    } catch (err: any) {
      toast.error('Return Error', err.message || 'Failed to record key return')
    }
  }

  const formatDateTime = (isoString: string) => {
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

  const isOverdueItem = (etaString: string) => {
    return new Date(etaString).getTime() < new Date().getTime()
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Panel */}
      <ModulePageHeader
        title={language === 'ms' ? 'Papan Pemuka MyKunci' : 'MyKunci Dashboard'}
        subtitle={language === 'ms' 
          ? 'Sistem Pemantauan Pergerakan Kunci Fizikal & Pematuhan Arahan JKNS Sarawak' 
          : 'Physical Key Custody Monitoring & Security Audit Compliance (MOH Sarawak)'}
        badge="Key Custody & Audit"
        icon={<Key className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScanModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4 text-text-muted" />
              <span>Scan Key QR</span>
            </button>
            <button 
              onClick={() => setCheckoutModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Loan</span>
            </button>
          </div>
        }
      />

      {/* Global Breach Notification (Pulsating Overdue Banner) */}
      {stats.overdue > 0 && (
        <div 
          onClick={() => navigate('/kunci/log')}
          className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl cursor-pointer hover:bg-rose-500/15 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-600">
                Key Overdue Security Alert Detected
              </p>
              <p className="text-xs text-text-muted font-medium">
                There are {stats.overdue} keys not returned beyond the assigned shift limit. Click to review custody log.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Open Custody Log →
          </span>
        </div>
      )}

      {/* Hospital KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Total Master Keys
          </span>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.total}
          </div>
        </div>
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Available in Storage
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.available}
          </div>
        </div>
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Currently Borrowed
          </span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.borrowed}
          </div>
        </div>
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Overdue Alerts
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.overdue}
          </div>
        </div>
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Damaged & Lost
          </span>
          <div className="text-2xl font-bold font-mono text-text-muted mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats.damaged + stats.lost)}
          </div>
        </div>
      </div>

      {/* Hospital Departments Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Hospital Departments
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-subtle flex-shrink-0" />
                  <Skeleton className="h-4 w-14 rounded bg-subtle" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-subtle rounded" />
                  <Skeleton className="h-3 w-1/2 bg-subtle rounded" />
                </div>
                <div className="mt-6 pt-3 border-t border-border-default flex items-center justify-between">
                  <Skeleton className="h-3.5 w-20 rounded bg-subtle" />
                  <Skeleton className="h-3.5 w-10 rounded bg-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-surface border border-border-default rounded-xl p-10 text-center shadow-sm text-text-muted text-xs">
            No registered hospital departments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => {
              const stat = departmentStats[dept.id] || { total: 0, available: 0, borrowed: 0, overdue: 0 }
              const hasOverdue = stat.overdue > 0
              
              let borderClass = 'border-border-default hover:border-accent-base/40'
              if (hasOverdue) borderClass = 'border-rose-500/30 hover:border-rose-500/50 ring-1 ring-rose-500/20'

              return (
                <div 
                  key={dept.id}
                  onClick={() => navigate(`/kunci/daftar?dept=${dept.id}`)}
                  className={`bg-surface border rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group ${borderClass}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="p-2.5 bg-subtle text-text-secondary rounded-lg group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                        <Building className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {hasOverdue && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600">
                            OVERDUE
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted font-bold font-mono">
                          {dept.department_code}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors line-clamp-1 mb-1">
                      {dept.department_name}
                    </h3>
                    <p className="text-xs text-text-muted font-medium">
                      {stat.total === 0 
                        ? 'No registered master keys'
                        : `${stat.total} Registered Master Keys`}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border-default flex items-center justify-between">
                    <div className="flex gap-2">
                      {stat.total > 0 && (
                        <>
                          {stat.available > 0 && (
                            <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 tabular-nums">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {stat.available} OK
                            </span>
                          )}
                          {stat.borrowed > 0 && (
                            <span className="text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1 tabular-nums">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {stat.borrowed} OUT
                            </span>
                          )}
                          {stat.overdue > 0 && (
                            <span className="text-[10px] font-bold font-mono text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1 tabular-nums">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {stat.overdue} LATE
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <span className="text-xs font-semibold text-accent-base flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Loans Section at Bottom */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Active Key Loans & Custody Log
        </h2>
        <div className="rounded-xl shadow-sm bg-surface border border-border-default overflow-hidden">
          {loading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="hidden md:block">
                <SkeletonTable rows={4} columns={6} className="border-none shadow-none rounded-xl" />
              </div>
              <div className="md:hidden">
                <SkeletonMobileCardList count={3} />
              </div>
            </div>
          ) : activeBorrows.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-2">
              <CheckCircle className="w-7 h-7 text-text-muted/60" />
              <span>
                No active key loans. All master keys are securely accounted for.
              </span>
            </div>
          ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-text-primary">
                  <thead className="bg-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
                    <tr>
                      <th className="p-3.5">Key (Code)</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Borrower</th>
                      <th className="p-3.5">Checkout Time</th>
                      <th className="p-3.5">Expected Return</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {activeBorrows.map((log) => {
                      const overdue = isOverdueItem(log.jangka_masa_pulang)
                      const isHighSec = log.kunci?.tahap_kawalan === 'high'
                      const deptName = departments.find(d => d.id === log.kunci?.department_id)?.department_name || '-'

                      return (
                        <tr key={log.id} className="hover:bg-subtle/50 transition-colors">
                          <td className="p-3.5">
                            <div>
                              <div className="font-bold text-text-primary">{log.kunci?.nama_kunci || 'Key'}</div>
                              <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border-default bg-subtle text-text-secondary">
                                  {log.kunci?.kod_kunci}
                                </span>
                                {isHighSec && (
                                  <span className="text-[10px] px-1.5 py-0.5 border border-rose-500/20 text-rose-600 bg-rose-500/10 font-bold rounded">
                                    Double-Custody DDA
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-xs font-medium text-text-secondary">
                            {deptName}
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-text-primary">
                              {log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'}
                            </div>
                            <div className="text-[11px] text-text-muted">
                              {log.peminjam?.jawatan || borrowers.find(b => b.id === log.peminjam_id)?.jawatan || ''}
                            </div>
                          </td>
                          <td className="p-3.5 text-xs font-mono text-text-secondary tabular-nums">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </td>
                          <td className="p-3.5">
                            <div className={`text-xs font-mono tabular-nums ${overdue ? 'text-rose-600 font-bold' : 'text-text-secondary'}`}>
                              {formatDateTime(log.jangka_masa_pulang)}
                            </div>
                            {overdue && (
                              <span className="inline-block text-[9px] mt-1 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 uppercase font-bold tracking-wide">
                                OVERDUE
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button 
                              onClick={() => {
                                const now = new Date()
                                const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                setReturnDateTime(localIso)
                                setActiveLogToReturn(log)
                                setReturnModalOpen(true)
                              }}
                              className="text-xs border border-accent-base/30 text-accent-base hover:bg-accent-base/10 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                            >
                              Check-In Key
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards */}
              <div className="md:hidden divide-y divide-border-default">
                {activeBorrows.map((log) => {
                  const overdue = isOverdueItem(log.jangka_masa_pulang)
                  const isHighSec = log.kunci?.tahap_kawalan === 'high'
                  const deptName = departments.find(d => d.id === log.kunci?.department_id)?.department_name || '-'
                  const borrowerName = log.peminjam?.full_name || borrowers.find(b => b.id === log.peminjam_id)?.full_name || 'Staff'

                  return (
                    <div key={log.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-text-muted text-xs block">
                            {log.kunci?.kod_kunci}
                          </span>
                          <h4 className="font-bold text-text-primary text-sm">
                            {log.kunci?.nama_kunci || 'Key'}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {overdue ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold uppercase">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                              BORROWED
                            </span>
                          )}
                          {isHighSec && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold">
                              DDA
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-subtle/60 p-3 rounded-lg border border-border-default">
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Borrower
                          </span>
                          <span className="font-semibold text-text-primary truncate block">
                            {borrowerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Department
                          </span>
                          <span className="font-medium text-text-secondary truncate block">
                            {deptName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Checkout Time
                          </span>
                          <span className="font-mono text-[11px] text-text-secondary block tabular-nums">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Expected Return
                          </span>
                          <span className={`font-mono text-[11px] font-bold block tabular-nums ${overdue ? 'text-rose-600' : 'text-text-secondary'}`}>
                            {formatDateTime(log.jangka_masa_pulang)}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const now = new Date()
                          const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setReturnDateTime(localIso)
                          setActiveLogToReturn(log)
                          setReturnModalOpen(true)
                        }}
                        className="w-full text-xs border border-accent-base/30 bg-accent-base/10 text-accent-base hover:bg-accent-base/20 py-2.5 rounded-lg font-semibold flex items-center justify-center transition-colors"
                      >
                        Check-In Key
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Register Key Checkout Loan"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
              Select Physical Key *
            </label>
            <select
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
              required
              className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
            >
              <option value="">-- Please Select Key --</option>
              {availableKeys.map((k) => (
                <option key={k.id} value={k.id}>
                  [{k.kod_kunci}] - {k.nama_kunci} ({k.lokasi_fizikal}) {k.tahap_kawalan === 'high' ? '[!] DDA High-Sec' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                {language === 'ms' ? 'Nama Peminjam Kunci *' : 'Key Borrower Name *'}
              </label>
              <input
                type="text"
                readOnly
                value={loggedUser?.full_name || 'Staff'}
                className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle/50 text-text-muted cursor-not-allowed focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                Loan Duration *
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                required
                className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="until_done">Until Shift Completion (Until Done)</option>
                <option value="other">Custom Duration (Others)</option>
              </select>
              {durationHours === 'other' && (
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter number of hours..."
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
                />
              )}
            </div>
          </div>

          {/* Double-Custody Co-Signing Witness Dropdown (KKM DDA Cabinet Mandate) */}
          {selectedKeyDetails?.tahap_kawalan === 'high' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-rose-600 uppercase flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Co-signing Witness / Second Officer (Mandatory) *
              </label>
              <select
                value={witnessId}
                onChange={(e) => setWitnessId(e.target.value)}
                required
                className="w-full rounded-lg border border-rose-500/30 p-2.5 text-xs bg-surface focus:outline-none focus:border-rose-500 text-text-primary font-medium"
              >
                <option value="">-- Select Co-signing Witness --</option>
                {borrowers.map((b) => (
                  // Cannot co-sign for yourself
                  b.id !== borrowerId && (
                    <option key={b.id} value={b.id}>
                      {b.full_name} ({b.jawatan})
                    </option>
                  )
                ))}
              </select>
              <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
                Notice: Dangerous Drugs Act (DDA) policies mandate dual-officer co-signing for all high-security controlled drug cabinet keys.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
              Key Checkout Purpose
            </label>
            <input
              type="text"
              placeholder="E.g.: Retrieve Paediatric Ward DDA stock / LPO stock inspection..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(false)}
              className="border border-border-default text-text-secondary hover:bg-subtle px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-accent-base hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors"
            >
              Record Checkout
            </button>
          </div>
        </form>
      </Modal>

      {/* RETURN MODAL */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Record Physical Key Return"
        size="2xl"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
          {activeLogToReturn && (
            <div className="bg-subtle rounded-xl p-3 border border-border-default text-xs space-y-1 text-text-secondary">
              <div>Key: <strong className="text-text-primary">{activeLogToReturn.kunci?.nama_kunci} ({activeLogToReturn.kunci?.kod_kunci})</strong></div>
              <div>Borrower: <strong className="text-text-primary">{activeLogToReturn.peminjam?.full_name || borrowers.find(b => b.id === activeLogToReturn.peminjam_id)?.full_name}</strong></div>
              <div>Borrowed Time: <strong className="text-text-primary">{formatDateTime(activeLogToReturn.tarikh_masa_ambil)}</strong></div>
              <div>Return Time (Record): <strong className="text-text-primary">{formatDateTime(new Date(returnDateTime).toISOString())}</strong></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                Physical Key Condition *
              </label>
              <select
                value={keyCondition}
                onChange={(e) => setKeyCondition(e.target.value as any)}
                required
                className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
              >
                <option value="good">Good / Intact (No Damage)</option>
                <option value="damaged">Damaged / Bent / Broken</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                Padlock & Door Lock Condition *
              </label>
              <select
                value={lockCondition}
                onChange={(e) => setLockCondition(e.target.value as any)}
                required
                className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
              >
                <option value="good">Secure / Fully Functional</option>
                <option value="loose">Loose / Wobbly Screws</option>
                <option value="damaged">Damaged / Broken Hasp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
              Return Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={returnDateTime}
              onChange={(e) => setReturnDateTime(e.target.value)}
              className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
              Return Remarks & Incident Report (If Any)
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="E.g.: Key returned on time. Padlock functioning smoothly with no issues..."
              className="w-full rounded-lg border border-border-default p-2.5 text-xs bg-subtle text-text-primary focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all resize-none font-medium"
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

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setReturnModalOpen(false)
                setActiveLogToReturn(null)
                setReturnPhoto(null)
              }}
              className="border border-border-default text-text-secondary hover:bg-subtle px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!returnPhoto}
              className="bg-accent-base hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Complete Return
            </button>
          </div>
        </form>
      </Modal>

      {/* SCAN QR MOVEMENT MODAL */}
      <ScanKunciMovementModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => setCheckoutModalOpen(true)} 
        aria-label="Record Loan" 
      />
    </div>
  )
}

export default KunciDashboardPage
