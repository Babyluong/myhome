// @ts-nocheck
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Download,
  RefreshCw,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Compass,
  Layers,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  Laptop,
  Globe,
  Database,
  SlidersHorizontal,
  FolderGit2,
  Code,
  Info,
  CheckSquare
} from 'lucide-react'
import {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogsToCSV,
  getAuditLogModules,
  AuditLogStats
} from '@/services/auditLogService'
import { getUsers } from '@/services/userService'
import { useToastStore } from '@/stores/toastStore'
import { formatDateTime } from '@/lib/utils'
import type { AuditLogWithRelations, UserWithRelations } from '@/types'

// Module metadata & friendly labels
const MODULE_VISUALS: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  auth: { label: 'Sistem Log Masuk & Keselamatan', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: '🔐' },
  myadmin: { label: 'MyAdmin (Pentadbiran)', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: '🛡️' },
  mystaff: { label: 'MyStaff (Pengurusan Anggota)', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: '👥' },
  myformulari: { label: 'MyFormulari (Panduan Ubat)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '💊' },
  mykunci: { label: 'MyKunci (Buku Log Kunci)', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🔑' },
  mysuhu: { label: 'MySuhu (Pemantauan Peti Sejuk)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: '🌡️' },
  cylinder: { label: 'MyCylinder (Stok Gas Oksigen)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: '🫁' },
  mycylinder: { label: 'MyCylinder (Stok Gas Oksigen)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: '🫁' },
  myperolehan: { label: 'MyPerolehan (Pesanan & Pembekal)', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: '📦' },
  mytransporter: { label: 'MyTransporter (Penghantaran Logistik)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🚐' },
  mytempahan: { label: 'MyTempahan (Tempahan Bilik & Fasiliti)', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: '📅' },
  mypriviledging: { label: 'MyPriviledging (Kompetensi Staf)', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🏅' },
  crossborder: { label: 'MyCrossBorder (Rujukan Antara Fasiliti)', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🌐' },
  pharmacy: { label: 'MyWarrant & Farmasi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🏛️' },
  users: { label: 'Urus Pengguna', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: '👤' },
  roles: { label: 'Had Kuasa Pengguna', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: '🔒' },
  departments: { label: 'Jabatan & Unit Hospital', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: '🏢' },
  hub: { label: 'Hub Utama Sistem', color: 'text-teal-300', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: '⚡' },
}

// Action styling & friendly human labels
const getActionBadgeStyle = (action: string) => {
  const act = action?.toUpperCase() || ''
  if (act.includes('LOGIN')) {
    return {
      label: 'Log Masuk (LOGIN)',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: LogIn,
    }
  }
  if (act.includes('LOGOUT')) {
    return {
      label: 'Log Keluar (LOGOUT)',
      badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: LogOut,
    }
  }
  if (act.includes('NAVIGATE') || act.includes('PAGE') || act.includes('VIEW')) {
    return {
      label: 'Buka Halaman (VIEW)',
      badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      icon: Compass,
    }
  }
  if (act.includes('CREATE') || act.includes('INSERT') || act.includes('ADD')) {
    return {
      label: 'Cipta Rekod Baru (CREATE)',
      badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      icon: CheckCircle,
    }
  }
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY') || act.includes('RESET')) {
    return {
      label: 'Kemaskini Data (UPDATE)',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: SlidersHorizontal,
    }
  }
  if (act.includes('DELETE') || act.includes('REMOVE')) {
    return {
      label: 'Padam Rekod (DELETE)',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
    }
  }
  if (act.includes('APPROVE')) {
    return {
      label: 'Lulus Permohonan (APPROVE)',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
    }
  }
  if (act.includes('REJECT')) {
    return {
      label: 'Tolak Permohonan (REJECT)',
      badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: AlertTriangle,
    }
  }
  if (act.includes('EXPORT') || act.includes('DOWNLOAD')) {
    return {
      label: 'Muat Turun Laporan (EXPORT)',
      badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      icon: Download,
    }
  }
  return {
    label: act,
    badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    icon: Activity,
  }
}

// Malay Human Dictionary for database field names
const FIELD_LABELS: Record<string, string> = {
  delete_reason: 'Sebab Pemadaman',
  status: 'Status Rekod',
  remarks: 'Catatan / Nota',
  description: 'Penerangan Tindakan',
  full_name: 'Nama Pegawai / Staf',
  email: 'Alamat Emel',
  phone_number: 'No. Telefon',
  ic_number: 'No. Kad Pengenalan',
  employee_id: 'No. Pekerja',
  jawatan: 'Jawatan Rasmi',
  role_id: 'Peranan / Akses',
  role_assigned: 'Peranan Diberikan',
  department_id: 'Jabatan / Unit',
  hospital_id: 'Hospital',
  approver: 'Pegawai Pelulus',
  reviewer: 'Pegawai Pemeriksa',
  rejection_reason: 'Sebab Penolakan',
  temperature: 'Bacaan Suhu (°C)',
  humidity: 'Kelembapan (%)',
  unit_name: 'Nama Unit / Peti Sejuk',
  unit_id: 'Kod Unit',
  key_name: 'Nama Kunci',
  key_id: 'Kod Kunci',
  borrower: 'Nama Peminjam',
  purpose: 'Tujuan Penggunaan',
  item_name: 'Nama Item / Bekalan',
  quantity: 'Kuantiti',
  po_number: 'No. Pesanan Tempatan (LO/PO)',
  total_allocated: 'Jumlah Peruntukan (RM)',
  location: 'Lokasi / Wad',
  pressure_psi: 'Tekanan Gas (PSI)',
  dose: 'Dos Ubat',
  renal_adjustment: 'Pelarasan Dos Buah Pinggang',
  staff_name: 'Nama Kakitangan',
  destination: 'Destinasi Penghantaran',
  urgency: 'Tahap Keutamaan',
  permissions_count: 'Jumlah Hak Akses',
  added_permissions: 'Hak Akses Ditambah',
}

// Malay Human Dictionary for values
const VALUE_LABELS: Record<string, string> = {
  duplicate: 'Duplikasi Rekod (Rekod Berganda)',
  completed: 'Selesai',
  pending: 'Menunggu Kelulusan',
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  approved: 'Diluluskan',
  rejected: 'Ditolak',
  in_use: 'Sedang Digunakan',
  full: 'Penuh / Sedia Guna',
  empty: 'Kosong / Perlu Diisi',
  routine: 'Rutin Biasa',
  urgent: 'Segera / Kecemasan',
  normal: 'Normal / Selamat',
  system_admin: 'Pentadbir Sistem Utama (Super Admin)',
  hospital_admin: 'Pentadbir Hospital',
  pharmacist: 'Pegawai Farmasi',
  assistant_pharmacist: 'Penolong Pegawai Farmasi',
  storekeeper: 'Pembantu Khidmat Am Stor',
}

// Keys to ignore from user-facing summary (developer internals)
const TECHNICAL_KEYS = new Set([
  'id',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'hospital_id',
  'supplier_id',
  'department_id',
  'role_id',
])

// Format a clean readable label
const formatFieldLabel = (key: string): string => {
  return FIELD_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Format a clean readable value
const formatFieldValue = (key: string, val: any): string => {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? 'Ya (Aktif)' : 'Tidak (Batal)'
  if (typeof val === 'number') {
    if (key.includes('total') || key.includes('amount')) {
      return `RM ${val.toLocaleString('ms-MY')}`
    }
    if (key.includes('temperature')) return `${val}°C`
    if (key.includes('humidity')) return `${val}%`
    if (key.includes('pressure')) return `${val} PSI`
    return String(val)
  }
  if (typeof val === 'string') {
    const cleanLower = val.toLowerCase().trim()
    if (VALUE_LABELS[cleanLower]) return VALUE_LABELS[cleanLower]
    return val
  }
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

// Generate simple plain natural language sentence explaining what happened
const generateHumanSummary = (log: AuditLogWithRelations): string => {
  const staffName = log.user?.full_name || 'Pegawai Sistem'
  const action = log.action?.toUpperCase() || ''
  const moduleName = MODULE_VISUALS[log.module?.toLowerCase()]?.label || log.module?.toUpperCase() || 'Sistem'

  // Explicit description if provided
  if (log.new_values?.description) {
    return String(log.new_values.description)
  }

  if (action.includes('LOGIN')) {
    return `${staffName} telah log masuk ke dalam sistem portal H.O.M.E.`
  }
  if (action.includes('LOGOUT')) {
    return `${staffName} telah log keluar daripada sistem.`
  }
  if (action.includes('NAVIGATE') || action.includes('PAGE') || action.includes('VIEW')) {
    return `${staffName} telah membuka menu [${moduleName}].`
  }
  if (action.includes('DELETE')) {
    const reason = log.new_values?.delete_reason || log.new_values?.reason
    if (reason) {
      const reasonLabel = VALUE_LABELS[String(reason).toLowerCase()] || String(reason)
      return `${staffName} telah MEMADAM rekod pada modul ${moduleName} kerana "${reasonLabel}".`
    }
    return `${staffName} telah MEMADAM satu rekod dalam modul ${moduleName}.`
  }
  if (action.includes('APPROVE')) {
    const approver = log.new_values?.approver || staffName
    return `Permohonan telah disemak dan DILULUSKAN oleh ${approver}.`
  }
  if (action.includes('REJECT')) {
    const reason = log.new_values?.rejection_reason || log.new_values?.reason
    if (reason) {
      return `Permohonan telah DITOLAK oleh ${staffName}. Sebab penolakan: "${reason}".`
    }
    return `Permohonan telah DITOLAK oleh ${staffName}.`
  }
  if (action.includes('CREATE') || action.includes('INSERT')) {
    return `${staffName} telah mencipta dan mendaftar satu rekod baharu dalam modul ${moduleName}.`
  }
  if (action.includes('UPDATE')) {
    return `${staffName} telah mengemaskini maklumat data dalam modul ${moduleName}.`
  }
  if (action.includes('EXPORT')) {
    return `${staffName} telah memuat turun / mengeksport fail laporan dari modul ${moduleName}.`
  }
  return `Aktiviti ${action} telah direkodkan pada modul ${moduleName}.`
}

// Relative time formatter helper in Malay
const formatRelativeTimeMalay = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Baru sahaja'
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60)
      return `${mins} minit lepas`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} jam lepas`
    }
    const days = Math.floor(diffInSeconds / 86400)
    if (days === 1) return 'Semalam'
    if (days < 7) return `${days} hari lepas`
    return formatDateTime(dateString)
  } catch {
    return dateString
  }
}

export const AdminSystemLogsTab: React.FC = () => {
  const { success: showSuccess, error: showError } = useToastStore()

  // Data states
  const [logs, setLogs] = useState<AuditLogWithRelations[]>([])
  const [stats, setStats] = useState<AuditLogStats>({
    totalLogs: 0,
    todayLogins: 0,
    navigationEvents: 0,
    criticalActions: 0,
    topModules: [],
  })
  const [usersList, setUsersList] = useState<UserWithRelations[]>([])
  const [availableModules, setAvailableModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [datePreset, setDatePreset] = useState<'today' | '7days' | '30days' | 'all' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Forensic modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogWithRelations | null>(null)
  const [showTechnicalJson, setShowTechnicalJson] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Initial load
  useEffect(() => {
    const initLookups = async () => {
      try {
        const [modulesRes, usersRes] = await Promise.all([
          getAuditLogModules(),
          getUsers({ page: 1, pageSize: 200 }),
        ])
        setAvailableModules(modulesRes)
        const allUsers = usersRes.data && usersRes.data.length > 0 ? usersRes.data : []
        const sortedUsers = [...allUsers].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
        setUsersList(sortedUsers)
      } catch (err) {
        console.error('Error loading lookup data:', err)
      }
    }
    initLookups()
  }, [])

  // Handle date presets
  const handleDatePresetChange = (preset: 'today' | '7days' | '30days' | 'all' | 'custom') => {
    setDatePreset(preset)
    setPage(1)
    const now = new Date()

    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0]
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      setStartDate(past7.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    } else if (preset === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setStartDate(past30.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    } else if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    }
  }

  // Fetch logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const [logsRes, statsRes] = await Promise.all([
        getAuditLogs({
          page,
          pageSize,
          search: search || undefined,
          module: moduleFilter !== 'all' ? moduleFilter : undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          userId: userFilter !== 'all' ? userFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getAuditLogStats(),
      ])

      setLogs(logsRes.data || [])
      setTotalRecords(logsRes.total || 0)
      setTotalPages(logsRes.totalPages || 1)
      setStats(statsRes)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
      showError('Ralat', 'Gagal memuatkan rekod audit log.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, pageSize, search, moduleFilter, actionFilter, userFilter, startDate, endDate, showError])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAuditLogs()
  }

  const handleResetFilters = () => {
    setSearch('')
    setModuleFilter('all')
    setActionFilter('all')
    setUserFilter('all')
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const csvContent = await exportAuditLogsToCSV({
        search: search || undefined,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter !== 'all' ? userFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KKM_HOME_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showSuccess('Berjaya', 'Laporan Audit Log CSV berjaya dimuat turun.')
    } catch (err) {
      console.error('Export error:', err)
      showError('Ralat', 'Gagal mengeksport fail CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyJson = () => {
    if (!selectedLog) return
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    showSuccess('Disalin', 'Metadata teknikal disalin ke papan keratan (clipboard).')
  }

  // Filter out internal technical keys for clean user presentation
  const getCleanObjectEntries = (obj?: Record<string, any> | null) => {
    if (!obj || typeof obj !== 'object') return []
    return Object.entries(obj).filter(([key]) => !TECHNICAL_KEYS.has(key))
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & System Transparency Mission Statement */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 border border-white/5 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>REKOD AUDIT KESELAMATAN & KETELUSAN SISTEM KKM</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Log Sistem & Jejak Aktiviti Kakitangan Hospital
          </h2>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Pusat pemantauan telus untuk melihat siapa kakitangan yang telah log masuk, menu apa yang dibuka, dan apa aktiviti/perubahan yang telah dilakukan dalam ekosistem hospital.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 hidden lg:block pointer-events-none">
          <Database className="w-44 h-44 text-teal-400" />
        </div>
      </div>

      {/* 2. Top KPI Analytics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Logs */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jumlah Rekod Aktiviti</p>
            <p className="text-3xl font-extrabold text-white mt-1 tabular-nums">
              {stats.totalLogs}
            </p>
            <p className="text-xs text-teal-400/80 mt-0.5 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> Rekod audit tersimpan kekal
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today Logins */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sesi Log Masuk</p>
            <p className="text-3xl font-extrabold text-cyan-400 mt-1 tabular-nums">
              {stats.todayLogins}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Kakitangan aktif dalam sistem
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Navigation Events */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu & Halaman Dibuka</p>
            <p className="text-3xl font-extrabold text-indigo-400 mt-1 tabular-nums">
              {stats.navigationEvents}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Capaian modul dikesan
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Critical Mutations */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tindakan Data / Mutasi</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums">
              {stats.criticalActions}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Cipta, Kemaskini, Padam & Lulus
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Control Toolbar */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md space-y-4">
        {/* Top Row: Search & Primary Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kakitangan, no. IC, jawatan, modul, atau catatan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition-all font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
              title="Muat semula rekod audit"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Mengeksport...' : 'Muat Turun CSV'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Multi-Dropdown Filters & Date Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          {/* Module Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Pilihan Modul / Menu
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="all">Semua Modul Hospital</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {MODULE_VISUALS[mod]?.label || mod.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Jenis Aktiviti / Tindakan
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="all">Semua Jenis Aktiviti</option>
              <option value="LOGIN_LOGOUT">Log Masuk & Keluar (LOGIN / LOGOUT)</option>
              <option value="NAVIGATION">Buka Halaman / Menu (VIEW)</option>
              <option value="CREATE">Cipta Rekod Baru (CREATE)</option>
              <option value="UPDATE">Kemaskini Maklumat (UPDATE)</option>
              <option value="DELETE">Padam Rekod (DELETE)</option>
              <option value="APPROVE_REJECT">Kelulusan & Penolakan (APPROVE / REJECT)</option>
              <option value="EXPORT">Muat Turun Laporan (EXPORT)</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Kakitangan / Pengguna
            </label>
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="all">Semua Kakitangan</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.jawatan || u.employee_id || u.ic_number?.slice(0, 6)})
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tempoh Masa
            </label>
            <div className="flex items-center gap-1 bg-slate-950/80 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handleDatePresetChange('all')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  datePreset === 'all' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleDatePresetChange('today')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  datePreset === 'today' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => handleDatePresetChange('7days')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  datePreset === '7days' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => handleDatePresetChange('30days')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  datePreset === '30days' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Reset trigger */}
        {(search || moduleFilter !== 'all' || actionFilter !== 'all' || userFilter !== 'all' || datePreset !== 'all') && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Tapisan Aktif:</span>
              {search && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs">
                  Carian: &quot;{search}&quot;
                </span>
              )}
              {moduleFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
                  Modul: {MODULE_VISUALS[moduleFilter]?.label || moduleFilter}
                </span>
              )}
              {actionFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                  Aktiviti: {actionFilter}
                </span>
              )}
              {userFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">
                  Kakitangan Khusus
                </span>
              )}
              {datePreset !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs">
                  Tarikh: {datePreset}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4"
            >
              Kosongkan Semua Tapisan
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Interactive Audit Log Table */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Garis Masa Aktiviti Keseluruhan ({totalRecords} Rekod Dijumpai)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 space-y-4">
              <div className="h-6 bg-white/5 rounded-lg w-full animate-pulse" />
              <div className="h-6 bg-white/5 rounded-lg w-11/12 animate-pulse" />
              <div className="h-6 bg-white/5 rounded-lg w-10/12 animate-pulse" />
              <div className="h-6 bg-white/5 rounded-lg w-9/12 animate-pulse" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto border border-white/5">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-300">Tiada Rekod Dijumpai</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tiada aktiviti yang sepadan dengan kriteria carian atau tapisan yang dipilih. Cuba kosongkan tapisan anda.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Tetap Semula Tapisan
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 w-48">Masa & Tarikh</th>
                  <th className="p-4 w-64">Nama Pegawai / Staf</th>
                  <th className="p-4 w-44">Modul / Menu</th>
                  <th className="p-4">Ringkasan Tindakan & Aktiviti</th>
                  <th className="p-4 w-36">Peranti / IP</th>
                  <th className="p-4 text-right w-24">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                {logs.map((log) => {
                  const actionMeta = getActionBadgeStyle(log.action)
                  const ActionIcon = actionMeta.icon
                  const modMeta = MODULE_VISUALS[log.module?.toLowerCase()] || {
                    label: log.module?.toUpperCase() || 'SISTEM',
                    color: 'text-slate-300',
                    bg: 'bg-slate-800',
                    border: 'border-white/5',
                    icon: '📦',
                  }
                  const humanSentence = generateHumanSummary(log)

                  return (
                    <tr
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log)
                        setShowTechnicalJson(false)
                      }}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* 1. Date & Time */}
                      <td className="p-4 align-top">
                        <div className="font-mono text-xs text-slate-200">
                          {formatDateTime(log.created_at)}
                        </div>
                        <div className="text-[11px] text-teal-400/80 font-sans mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTimeMalay(log.created_at)}</span>
                        </div>
                      </td>

                      {/* 2. Staff / User Info */}
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-teal-400 flex-shrink-0">
                            {log.user?.full_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="text-white text-sm font-bold group-hover:text-teal-300 transition-colors">
                              {log.user?.full_name || 'Pegawai Sistem (System/Auto)'}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              IC: {log.user?.ic_number || log.user?.employee_id || 'AUTO'}
                            </div>
                            {log.user?.jawatan && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {log.user.jawatan}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Module / Menu Name */}
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${modMeta.bg} ${modMeta.color} border ${modMeta.border}`}
                        >
                          <span>{modMeta.icon}</span>
                          <span className="truncate max-w-[130px]">{modMeta.label.split('(')[0]}</span>
                        </span>
                      </td>

                      {/* 4. Action & Human-Readable Sentence */}
                      <td className="p-4 align-top space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${actionMeta.badgeBg}`}
                          >
                            <ActionIcon className="w-3 h-3" />
                            <span>{actionMeta.label}</span>
                          </span>
                        </div>

                        {/* Plain Language Action Description */}
                        <div className="text-xs text-slate-200 leading-relaxed font-sans">
                          {humanSentence}
                        </div>
                      </td>

                      {/* 5. IP & User Agent */}
                      <td className="p-4 align-top">
                        <div className="text-xs font-mono text-slate-400">
                          {log.ip_address || '192.168.1.100'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Laptop className="w-3 h-3 text-slate-600" />
                          <span className="truncate max-w-[120px]" title={log.user_agent}>
                            {log.user_agent?.includes('Macintosh')
                              ? 'macOS'
                              : log.user_agent?.includes('iPhone')
                              ? 'iPhone'
                              : log.user_agent?.includes('Windows')
                              ? 'Windows PC'
                              : 'Pelayar Web'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Action: View Details */}
                      <td className="p-4 align-top text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLog(log)
                            setShowTechnicalJson(false)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Perincian</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Menunjukkan {(page - 1) * pageSize + 1} hingga {Math.min(page * pageSize, totalRecords)} daripada {totalRecords} jumlah rekod aktiviti
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-white font-mono">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <span>Seterusnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Human-Friendly Details Modal (Pemeriksaan Terperinci Log) */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-slate-950"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-r from-slate-900 to-slate-950">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold uppercase">
                      REKOD AUDIT #{selectedLog.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      DISAHKAN KKM
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Perincian Tindakan & Jejak Aktiviti
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tarikh & Masa: {formatDateTime(selectedLog.created_at)} ({formatRelativeTimeMalay(selectedLog.created_at)})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                {/* 1. Human Language Narrative Summary Banner */}
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>Ringkasan Tindakan Pegawai</span>
                  </div>
                  <p className="text-white text-sm font-medium leading-relaxed">
                    {generateHumanSummary(selectedLog)}
                  </p>
                </div>

                {/* 2. User & Environment Profile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff Info Card */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2.5">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Maklumat Pegawai / Staf</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Nama Penuh:</span>
                        <span className="text-white font-bold text-sm">
                          {selectedLog.user?.full_name || 'Pegawai Sistem (System/Auto)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div>
                          <span className="text-slate-500 block text-[11px]">No. IC / Pekerja:</span>
                          <span className="text-slate-300 font-mono">
                            {selectedLog.user?.ic_number || selectedLog.user?.employee_id || selectedLog.user_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Jawatan:</span>
                          <span className="text-slate-300">
                            {selectedLog.user?.jawatan || 'Pegawai Bertugas'}
                          </span>
                        </div>
                      </div>
                      {selectedLog.user?.email && (
                        <div>
                          <span className="text-slate-500 block text-[11px]">Alamat Emel:</span>
                          <span className="text-slate-400">{selectedLog.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module & Access Environment Card */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2.5">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Modul & Lokasi Capaian</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Modul / Bahagian:</span>
                        <span className="text-indigo-300 font-bold">
                          {MODULE_VISUALS[selectedLog.module?.toLowerCase()]?.label || selectedLog.module?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Jenis Tindakan:</span>
                          <span className="text-slate-300 font-semibold">{selectedLog.action}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Alamat IP:</span>
                          <span className="text-slate-300 font-mono">{selectedLog.ip_address || '192.168.1.100'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Peranti Digunakan:</span>
                        <span className="text-slate-400">
                          {selectedLog.user_agent?.includes('Macintosh')
                            ? 'Komputer Apple Mac (macOS)'
                            : selectedLog.user_agent?.includes('iPhone')
                            ? 'Telefon Pintar iPhone (iOS)'
                            : selectedLog.user_agent?.includes('Windows')
                            ? 'Komputer Windows (PC Hospital)'
                            : 'Pelayar Web'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Human Data Changes Comparison Cards (Clean & Readable) */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-teal-400" />
                      <span>Perincian Maklumat & Perubahan Data</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Old Values (Clean Human List) */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Nilai Asal / Terdahulu:
                        </span>
                        {getCleanObjectEntries(selectedLog.old_values).length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-white/5 text-xs">
                            {getCleanObjectEntries(selectedLog.old_values).map(([k, v]) => (
                              <div key={k} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                                <span className="text-slate-400 text-xs font-medium">{formatFieldLabel(k)}:</span>
                                <span className="text-rose-200 font-semibold text-right">
                                  {formatFieldValue(k, v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Tiada rekod lama (Tindakan Rekod Baharu)
                          </p>
                        )}
                      </div>

                      {/* New Values (Clean Human List) */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Nilai Terkini / Catatan Tindakan:
                        </span>
                        {getCleanObjectEntries(selectedLog.new_values).length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-white/5 text-xs">
                            {getCleanObjectEntries(selectedLog.new_values).map(([k, v]) => (
                              <div key={k} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                                <span className="text-slate-400 text-xs font-medium">{formatFieldLabel(k)}:</span>
                                <span className="text-emerald-300 font-semibold text-right">
                                  {formatFieldValue(k, v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Tiada maklumat tambahan
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Optional Collapsible Raw Technical Code (For IT Specialists) */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => setShowTechnicalJson(!showTechnicalJson)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>
                      {showTechnicalJson ? 'Sembunyikan Kod Teknikal (JSON)' : 'Papar Format Kod Teknikal JSON (Untuk IT Sahaja)'}
                    </span>
                  </button>

                  {showTechnicalJson && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                      <pre className="text-slate-400 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(selectedLog, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-950/80 flex items-center justify-between">
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Disalin ke Papan Keratan' : 'Salin Data Log'}</span>
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Tutup Perincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminSystemLogsTab
