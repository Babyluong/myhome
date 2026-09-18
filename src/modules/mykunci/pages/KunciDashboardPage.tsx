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
  FileUpload
} from '@/components/ui'
import { ScanKunciMovementModal } from '@/components/kunci/ScanKunciMovementModal'

import { mockUsers } from '@/services/mockData'

// Mock list of departments matching database seed values
const MOCK_DEPARTMENTS = [
  { id: '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880', department_name: 'Farmasi Logistik', department_code: 'PH-LOG' },
  { id: '0c6c6f1b-d3b6-4779-91c3-536956858fca', department_name: 'Farmasi Klinik Pakar', department_code: 'PH-CLIN' },
  { id: 'dept-3', department_name: 'Klinik Pakar Pesakit Luar', department_code: 'OPD' },
  { id: 'dept-4', department_name: 'Jabatan Kecemasan & Trauma', department_code: 'ED' },
  { id: 'dept-5', department_name: 'Pejabat Pentadbiran Utama', department_code: 'ADMIN' }
];

// Mock list of users for borrowing dropdown
const MOCK_BORROWERS = mockUsers;

export const KunciDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const loggedUser = useAuthStore((state) => state.user)
  const hospitalId = loggedUser?.hospital_id || 'hosp-1'
  const toast = useToast()
  
  const [keys, setKeys] = useState<KunciDaftar[]>([])
  const [logs, setLogs] = useState<KunciLog[]>([])
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
      const [keysRes, logsRes] = await Promise.all([
        getKunciDaftar(),
        getKunciLogs()
      ])
      setKeys(keysRes.data || [])
      setLogs(logsRes.data || [])
    } catch (err) {
      console.error('Failed to load MyKunci dashboard data', err)
      toast.error(
        language === 'ms' ? 'Ralat Sistem' : 'System Error',
        language === 'ms' ? 'Gagal memuatkan data papan pemuka' : 'Failed to load dashboard data'
      )
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
    
    MOCK_DEPARTMENTS.forEach(dept => {
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
  }, [keys, logs])

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
      toast.error(
        language === 'ms' ? 'Semakan Borang' : 'Form Validation',
        language === 'ms' ? 'Sila isi butiran wajib!' : 'Please fill in all mandatory fields!'
      )
      return
    }

    // High security double-custody co-signing witness check
    if (selectedKeyDetails?.tahap_kawalan === 'high' && !witnessId) {
      toast.error(
        language === 'ms' ? 'Semakan Saksi' : 'Witness Verification',
        language === 'ms' 
          ? 'Kunci DDA memerlukan Saksi / Pegawai Kedua mengikut Arahan Sarawak KKM!'
          : 'High-security DDA keys require a mandatory Co-signing Witness / Second Officer in accordance with MOH Sarawak directives!'
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

      toast.success(
        language === 'ms' ? 'Berjaya' : 'Success',
        language === 'ms' ? 'Peminjaman kunci berjaya direkodkan' : 'Key checkout loan recorded successfully'
      )
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
      toast.error(
        language === 'ms' ? 'Ralat Peminjaman' : 'Checkout Error',
        err.message || (language === 'ms' ? 'Gagal menyimpan rekod pinjaman' : 'Failed to record checkout loan')
      )
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLogToReturn) return
    if (!returnPhoto) {
      toast.error(
        language === 'ms' ? 'Semakan Foto' : 'Photo Verification',
        language === 'ms' ? 'Sila snap atau muat naik foto kunci sebelum memulangkan!' : 'Please snap or upload a photo of the physical key before returning!'
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
        language === 'ms' ? 'Pemulangan kunci berjaya direkodkan' : 'Key return checked in successfully'
      )
      setReturnModalOpen(false)
      setActiveLogToReturn(null)
      setRemarks('')
      setReturnPhoto(null)
      setReturnDateTime('')
      
      loadData()
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat Pemulangan' : 'Return Error',
        err.message || (language === 'ms' ? 'Gagal menyimpan rekod pemulangan' : 'Failed to record key return')
      )
    }
  }

  const formatDateTime = (isoString: string) => {
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

  const isOverdueItem = (etaString: string) => {
    return new Date(etaString).getTime() < new Date().getTime()
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-8 text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <span>{language === 'ms' ? 'Papan Pemuka MyKunci' : 'MyKunci Dashboard'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {language === 'ms' 
              ? 'Sistem Pemantauan Pergerakan Kunci Fizikal & Pematuhan Arahan JKNS Sarawak' 
              : 'Physical Key Custody Monitoring & Security Audit Compliance (MOH Sarawak)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setScanModalOpen(true)}
            className="border-amber-500 hover:bg-amber-50 text-amber-600 rounded-2xl border shadow-sm font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <QrCode className="w-5 h-5" />
            {language === 'ms' ? 'Imbas QR Kunci' : 'Scan Key QR'}
          </Button>
          <Button 
            onClick={() => setCheckoutModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-md hover:shadow-lg font-bold flex items-center gap-2 px-5 py-2.5 transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            {language === 'ms' ? 'Rekod Pinjaman' : 'Record Loan / Check-out'}
          </Button>
        </div>
      </div>

      {/* Global Breach Notification (Pulsating Overdue Banner) */}
      {stats.overdue > 0 && (
        <div 
          onClick={() => navigate('/kunci/log')}
          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl cursor-pointer hover:bg-rose-100/50 transition-all shadow-md group animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-800">
                {language === 'ms' ? 'Amaran Kelewatan Kunci (Sangkut / Overdue) Dikesan' : 'Key Overdue Security Alert Detected'}
              </p>
              <p className="text-xs text-rose-600 font-medium">
                {language === 'ms' 
                  ? `Terdapat ${stats.overdue} anak kunci belum dipulangkan melampaui had syif. Klik untuk semak log.`
                  : `There are ${stats.overdue} keys not returned beyond the assigned shift limit. Click to review custody log.`}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-rose-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            {language === 'ms' ? 'Buka Log Rekod →' : 'Open Custody Log →'}
          </span>
        </div>
      )}

      {/* Hospital KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'ms' ? 'Jumlah Kunci Induk' : 'Total Master Keys'}
          </span>
          <p className="text-3xl font-black font-mono text-slate-800 mt-2">
            {loading ? '0' : stats.total}
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'ms' ? 'Tersedia Simpan' : 'Available in Storage'}
          </span>
          <p className="text-3xl font-black font-mono text-emerald-600 mt-2">
            {loading ? '0' : stats.available}
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'ms' ? 'Sedang Dipinjam' : 'Currently Borrowed'}
          </span>
          <p className="text-3xl font-black font-mono text-amber-600 mt-2">
            {loading ? '0' : stats.borrowed}
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg border-l-4 border-l-rose-500">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'ms' ? 'Amaran Overdue' : 'Overdue Alerts'}
          </span>
          <p className="text-3xl font-black font-mono text-rose-600 mt-2">
            {loading ? '0' : stats.overdue}
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg border-l-4 border-l-slate-400">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'ms' ? 'Rosak & Hilang' : 'Damaged & Lost'}
          </span>
          <p className="text-3xl font-black font-mono text-slate-500 mt-2">
            {loading ? '0' : (stats.damaged + stats.lost)}
          </p>
        </div>
      </div>

      {/* Hospital Departments Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {language === 'ms' ? 'Jabatan Hospital' : 'Hospital Departments'}
        </h2>
        
        {loading ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-lg text-slate-400 text-sm">
            {language === 'ms' ? 'Memuatkan maklumat jabatan...' : 'Loading department information...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DEPARTMENTS.map(dept => {
              const stat = departmentStats[dept.id] || { total: 0, available: 0, borrowed: 0, overdue: 0 }
              const hasOverdue = stat.overdue > 0
              
              let borderClass = 'border-slate-100 hover:border-amber-500/30'
              if (hasOverdue) borderClass = 'border-rose-100 hover:border-rose-300/60 ring-2 ring-rose-500/5'

              return (
                <div 
                  key={dept.id}
                  onClick={() => navigate(`/kunci/daftar?dept=${dept.id}`)}
                  className={`bg-white border rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${borderClass}`}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-500 transition-all duration-300" />
                  
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-all">
                        <Building className="w-5 h-5" />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {hasOverdue && (
                          <Badge className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg border-transparent text-white bg-rose-500 animate-pulse">
                            OVERDUE
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 font-bold font-mono">
                          {dept.department_code}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1 mb-1">
                      {dept.department_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {stat.total === 0 
                        ? (language === 'ms' ? 'Tiada anak kunci berdaftar' : 'No registered master keys')
                        : (language === 'ms' ? `${stat.total} Kunci Induk Berdaftar` : `${stat.total} Registered Master Keys`)}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      {stat.total > 0 && (
                        <>
                          {stat.available > 0 && (
                            <span className="text-[10px] font-black font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {stat.available} OK
                            </span>
                          )}
                          {stat.borrowed > 0 && (
                            <span className="text-[10px] font-black font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {stat.borrowed} OUT
                            </span>
                          )}
                          {stat.overdue > 0 && (
                            <span className="text-[10px] font-black font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {stat.overdue} LATE
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1 transform group-hover:translate-x-1 transition-all">
                      {language === 'ms' ? 'Buka →' : 'Open →'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Loans Section at Bottom */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {language === 'ms' ? 'Log Pinjaman Aktif Semasa' : 'Active Key Loans & Custody Log'}
        </h2>
        <Card className="rounded-2xl shadow-soft bg-white border border-slate-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {language === 'ms' ? 'Memuatkan data pinjaman...' : 'Loading active loan records...'}
              </div>
            ) : activeBorrows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-slate-300" />
                <span>
                  {language === 'ms' 
                    ? 'Tiada kunci yang aktif dipinjam. Semua kunci tersimpan selamat.' 
                    : 'No active key loans. All master keys are securely accounted for.'}
                </span>
              </div>
            ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">{language === 'ms' ? 'Kunci (Kod)' : 'Key (Code)'}</th>
                      <th className="p-4">{language === 'ms' ? 'Jabatan' : 'Department'}</th>
                      <th className="p-4">{language === 'ms' ? 'Peminjam' : 'Borrower'}</th>
                      <th className="p-4">{language === 'ms' ? 'Jam Ambil' : 'Checkout Time'}</th>
                      <th className="p-4">{language === 'ms' ? 'Jangka Pulang' : 'Expected Return'}</th>
                      <th className="p-4 text-right">{language === 'ms' ? 'Tindakan' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeBorrows.map((log) => {
                      const overdue = isOverdueItem(log.jangka_masa_pulang)
                      const isHighSec = log.kunci?.tahap_kawalan === 'high'
                      const deptName = MOCK_DEPARTMENTS.find(d => d.id === log.kunci?.department_id)?.department_name || '-'

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-slate-800">{log.kunci?.nama_kunci || (language === 'ms' ? 'Kunci' : 'Key')}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Badge className="text-[10px] px-1.5 py-0.5 border-slate-200 text-slate-600 bg-slate-100">
                                  {log.kunci?.kod_kunci}
                                </Badge>
                                {isHighSec && (
                                  <Badge className="text-[10px] px-1.5 py-0.5 border-rose-200 text-rose-600 bg-rose-50 font-bold">
                                    Double-Custody DDA
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-700">
                            {deptName}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-800">
                              {log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')}
                            </div>
                            <div className="text-xs text-slate-400">
                              {log.peminjam?.jawatan || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.jawatan || ''}
                            </div>
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-500">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </td>
                          <td className="p-4">
                            <div className={`text-xs font-mono font-medium ${overdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                              {formatDateTime(log.jangka_masa_pulang)}
                            </div>
                            {overdue && (
                              <Badge className="text-[9px] mt-1 border-transparent text-white bg-rose-500 animate-pulse uppercase font-extrabold tracking-wide">
                                {language === 'ms' ? 'SANGKUT' : 'OVERDUE'}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
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
                              {language === 'ms' ? 'Pulang Kunci' : 'Check-In Key'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
              <div className="md:hidden divide-y divide-slate-100">
                {activeBorrows.map((log) => {
                  const overdue = isOverdueItem(log.jangka_masa_pulang)
                  const isHighSec = log.kunci?.tahap_kawalan === 'high'
                  const deptName = MOCK_DEPARTMENTS.find(d => d.id === log.kunci?.department_id)?.department_name || '-'
                  const borrowerName = log.peminjam?.full_name || MOCK_BORROWERS.find(b => b.id === log.peminjam_id)?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')

                  return (
                    <div key={log.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-slate-500 text-xs block">
                            {log.kunci?.kod_kunci}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {log.kunci?.nama_kunci || (language === 'ms' ? 'Kunci' : 'Key')}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {overdue ? (
                            <Badge className="text-[9px] border-transparent text-white bg-rose-500 animate-pulse font-extrabold uppercase">
                              {language === 'ms' ? 'SANGKUT' : 'OVERDUE'}
                            </Badge>
                          ) : (
                            <Badge className="text-[9px] border-amber-200 text-amber-700 bg-amber-50 font-bold">
                              {language === 'ms' ? 'AKTIF' : 'BORROWED'}
                            </Badge>
                          )}
                          {isHighSec && (
                            <Badge className="text-[9px] border-rose-200 text-rose-600 bg-rose-50 font-bold">
                              DDA
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
                            {borrowerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Jabatan' : 'Department'}
                          </span>
                          <span className="font-medium text-slate-700 truncate block">
                            {deptName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Jam Ambil' : 'Checkout Time'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 block">
                            {formatDateTime(log.tarikh_masa_ambil)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'ms' ? 'Jangka Pulang' : 'Expected Return'}
                          </span>
                          <span className={`font-mono text-[11px] font-bold block ${overdue ? 'text-rose-600' : 'text-slate-600'}`}>
                            {formatDateTime(log.jangka_masa_pulang)}
                          </span>
                        </div>
                      </div>

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
                        {language === 'ms' ? 'Pulang Kunci' : 'Check-In Key'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={language === 'ms' ? 'Daftar Rekod Pinjaman Kunci Baru' : 'Register Key Checkout Loan'}
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Pilih Kunci Fizikal *' : 'Select Physical Key *'}
            </label>
            <select
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">{language === 'ms' ? '-- Sila Pilih Kunci --' : '-- Please Select Key --'}</option>
              {availableKeys.map((k) => (
                <option key={k.id} value={k.id}>
                  [{k.kod_kunci}] - {k.nama_kunci} ({k.lokasi_fizikal}) {k.tahap_kawalan === 'high' ? '[!] DDA High-Sec' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Nama Peminjam Kunci *' : 'Key Borrower Name *'}
              </label>
              <input
                type="text"
                readOnly
                value={loggedUser?.full_name || (language === 'ms' ? 'Kakitangan' : 'Staff')}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                {language === 'ms' ? 'Tempoh Pinjaman *' : 'Loan Duration *'}
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="1">{language === 'ms' ? '1 Jam (1 Hour)' : '1 Hour'}</option>
                <option value="2">{language === 'ms' ? '2 Jam (2 Hours)' : '2 Hours'}</option>
                <option value="until_done">{language === 'ms' ? 'Sehingga Selesai (Until Done)' : 'Until Shift Completion (Until Done)'}</option>
                <option value="other">{language === 'ms' ? 'Lain-lain (Others)' : 'Custom Duration (Others)'}</option>
              </select>
              {durationHours === 'other' && (
                <input
                  type="number"
                  min="1"
                  required
                  placeholder={language === 'ms' ? 'Masukkan bilangan jam...' : 'Enter number of hours...'}
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-full mt-2 rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              )}
            </div>
          </div>

          {/* Double-Custody Co-Signing Witness Dropdown (KKM DDA Cabinet Mandate) */}
          {selectedKeyDetails?.tahap_kawalan === 'high' && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                {language === 'ms' ? 'Saksi / Pegawai Kedua (Co-Signer Mandatori) *' : 'Co-signing Witness / Second Officer (Mandatory) *'}
              </label>
              <select
                value={witnessId}
                onChange={(e) => setWitnessId(e.target.value)}
                required
                className="w-full rounded-xl border border-rose-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-800"
              >
                <option value="">{language === 'ms' ? '-- Sila Pilih Saksi Kedua --' : '-- Select Co-signing Witness --'}</option>
                {MOCK_BORROWERS.map((b) => (
                  // Cannot co-sign for yourself
                  b.id !== borrowerId && (
                    <option key={b.id} value={b.id}>
                      {b.full_name} ({b.jawatan})
                    </option>
                  )
                ))}
              </select>
              <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
                {language === 'ms' 
                  ? 'Peringatan: Polisi Sarawak Dangerous Drugs Act (DDA) menghendaki pengesahan saksi kedua bagi kunci kabinet dadah berbahaya.'
                  : 'Notice: Dangerous Drugs Act (DDA) policies mandate dual-officer co-signing for all high-security controlled drug cabinet keys.'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
              {language === 'ms' ? 'Tujuan Peminjaman Kunci' : 'Key Checkout Purpose'}
            </label>
            <input
              type="text"
              placeholder={language === 'ms' ? 'Cth: Ambil stok ubat DDA Wad Kanak-Kanak / Pendaftaran stok LPO...' : 'E.g.: Retrieve Paediatric Ward DDA stock / LPO stock inspection...'}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setCheckoutModalOpen(false)}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 border rounded-xl"
            >
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-soft"
            >
              {language === 'ms' ? 'Rekod Pinjaman' : 'Record Checkout'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* RETURN MODAL */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title={language === 'ms' ? 'Rekod Pemulangan Kunci Fizikal' : 'Record Physical Key Return'}
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

          <div>
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

      {/* SCAN QR MOVEMENT MODAL */}
      <ScanKunciMovementModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  )
}

export default KunciDashboardPage
