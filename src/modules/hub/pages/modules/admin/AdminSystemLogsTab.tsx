// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Search, Calendar, User, Download, RefreshCw, Eye, FileText, CheckCircle, XCircle, AlertTriangle, LogIn, LogOut, Compass, Layers, Copy, Check, X, ChevronLeft, ChevronRight, Clock, ShieldCheck, Activity, Laptop, Globe, SlidersHorizontal, FolderGit2, Code, Info, Key } from 'lucide-react'
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

// Module metadata & friendly labels (no emoji slop)
const MODULE_VISUALS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  auth: { label: 'Authentication & Security', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: ShieldCheck },
  myadmin: { label: 'MyAdmin (Administration)', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Shield },
  mystaff: { label: 'MyStaff (Personnel Operations)', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: User },
  myformulari: { label: 'MyFormulari (Drug Formulary)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: FileText },
  mykunci: { label: 'MyKunci (Key Management)', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Key },
  mysuhu: { label: 'MySuhu (Cold Chain Monitoring)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Activity },
  cylinder: { label: 'MyCylinder (Medical Oxygen)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Layers },
  mycylinder: { label: 'MyCylinder (Medical Oxygen)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Layers },
  myperolehan: { label: 'MyPerolehan (Procurement & Orders)', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: FileText },
  mytransporter: { label: 'MyTransporter (Fleet & Logistics)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Compass },
  mytempahan: { label: 'MyTempahan (Facility & Venue Bookings)', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: Calendar },
  mypriviledging: { label: 'MyPriviledging (Clinical Privileges)', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: ShieldCheck },
  crossborder: { label: 'MyCrossBorder (Cross-Border Referrals)', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Globe },
  pharmacy: { label: 'MyWarrant & Pharmacy Logistics', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Layers },
  users: { label: 'User Management', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: User },
  roles: { label: 'User Roles & Access', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Shield },
  departments: { label: 'Hospital Departments & Units', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Layers },
  hub: { label: 'System Main Hub', color: 'text-teal-300', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Activity },
}

// Action styling & friendly human labels
const getActionBadgeStyle = (action: string) => {
  const act = action?.toUpperCase() || ''
  if (act.includes('LOGIN')) {
    return {
      label: 'User Login (LOGIN)',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: LogIn,
    }
  }
  if (act.includes('LOGOUT')) {
    return {
      label: 'User Logout (LOGOUT)',
      badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: LogOut,
    }
  }
  if (act.includes('NAVIGATE') || act.includes('PAGE') || act.includes('VIEW')) {
    return {
      label: 'View Page (VIEW)',
      badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      icon: Compass,
    }
  }
  if (act.includes('CREATE') || act.includes('INSERT') || act.includes('ADD')) {
    return {
      label: 'Create Record (CREATE)',
      badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      icon: CheckCircle,
    }
  }
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY') || act.includes('RESET')) {
    return {
      label: 'Update Data (UPDATE)',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: SlidersHorizontal,
    }
  }
  if (act.includes('DELETE') || act.includes('REMOVE')) {
    return {
      label: 'Delete Record (DELETE)',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
    }
  }
  if (act.includes('APPROVE')) {
    return {
      label: 'Approve Request (APPROVE)',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
    }
  }
  if (act.includes('REJECT')) {
    return {
      label: 'Reject Request (REJECT)',
      badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: AlertTriangle,
    }
  }
  if (act.includes('EXPORT') || act.includes('DOWNLOAD')) {
    return {
      label: 'Export Report (EXPORT)',
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
  delete_reason: 'Deletion Reason',
  status: 'Record Status',
  remarks: 'Remarks / Notes',
  description: 'Action Description',
  full_name: 'Officer / Staff Name',
  email: 'Email Address',
  phone_number: 'Phone Number',
  ic_number: 'NRIC Number',
  employee_id: 'Staff ID',
  jawatan: 'Official Designation',
  role_id: 'Role / Access Level',
  role_assigned: 'Assigned Role',
  department_id: 'Department / Unit',
  hospital_id: 'Hospital',
  approver: 'Approving Officer',
  reviewer: 'Reviewing Officer',
  rejection_reason: 'Rejection Reason',
  temperature: 'Temperature (°C)',
  humidity: 'Humidity (%)',
  unit_name: 'Unit / Refrigerator Name',
  unit_id: 'Unit Code',
  key_name: 'Key Name',
  key_id: 'Key Code',
  borrower: 'Borrower Name',
  purpose: 'Purpose of Access',
  item_name: 'Item / Supply Name',
  quantity: 'Quantity',
  po_number: 'Local Purchase Order (LPO) No.',
  total_allocated: 'Total Allocation (RM)',
  location: 'Location / Ward',
  pressure_psi: 'Gas Pressure (PSI)',
  dose: 'Medication Dose',
  renal_adjustment: 'Renal Dose Adjustment',
  staff_name: 'Staff Name',
  destination: 'Delivery Destination',
  urgency: 'Priority Level',
  permissions_count: 'Total Permissions',
  added_permissions: 'Added Permissions',
}

// Malay Human Dictionary for values
const VALUE_LABELS: Record<string, string> = {
  duplicate: 'Duplicate Record',
  completed: 'Completed',
  pending: 'Pending Approval',
  active: 'Active',
  inactive: 'Inactive',
  approved: 'Approved',
  rejected: 'Rejected',
  in_use: 'In Use',
  full: 'Full / Ready',
  empty: 'Empty / Needs Refill',
  routine: 'Routine',
  urgent: 'Urgent / Emergency',
  normal: 'Normal / Safe',
  system_admin: 'System Administrator (Super Admin)',
  hospital_admin: 'Hospital Administrator',
  pharmacist: 'Pharmacist',
  assistant_pharmacist: 'Assistant Pharmacist',
  storekeeper: 'Storekeeper',
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
  if (typeof val === 'boolean') return val ? 'Yes (Active)' : 'No (Inactive)'
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
  const staffName = log.user?.full_name || 'System Operator'
  const action = log.action?.toUpperCase() || ''
  const moduleName = MODULE_VISUALS[log.module?.toLowerCase()]?.label || log.module?.toUpperCase() || 'System'

  // Explicit description if provided
  if (log.new_values?.description) {
    return String(log.new_values.description)
  }

  if (action.includes('LOGIN')) {
    return `${staffName} logged in to the H.O.M.E. ecosystem.`
  }
  if (action.includes('LOGOUT')) {
    return `${staffName} logged out of the system.`
  }
  if (action.includes('NAVIGATE') || action.includes('PAGE') || action.includes('VIEW')) {
    return `${staffName} accessed menu [${moduleName}].`
  }
  if (action.includes('DELETE')) {
    const reason = log.new_values?.delete_reason || log.new_values?.reason
    if (reason) {
      const reasonLabel = VALUE_LABELS[String(reason).toLowerCase()] || String(reason)
      return `${staffName} DELETED a record in ${moduleName} due to "${reasonLabel}".`
    }
    return `${staffName} DELETED a record in ${moduleName}.`
  }
  if (action.includes('APPROVE')) {
    const approver = log.new_values?.approver || staffName
    return `Request was reviewed and APPROVED by ${approver}.`
  }
  if (action.includes('REJECT')) {
    const reason = log.new_values?.rejection_reason || log.new_values?.reason
    if (reason) {
      return `Request was REJECTED by ${staffName}. Reason: "${reason}".`
    }
    return `Request was REJECTED by ${staffName}.`
  }
  if (action.includes('CREATE') || action.includes('INSERT')) {
    return `${staffName} created and registered a new record in ${moduleName}.`
  }
  if (action.includes('UPDATE')) {
    return `${staffName} updated data in ${moduleName}.`
  }
  if (action.includes('EXPORT')) {
    return `${staffName} downloaded / exported a report from ${moduleName}.`
  }
  return `Activity ${action} was recorded in ${moduleName}.`
}

// Relative time formatter helper in Malay
const formatRelativeTimeMalay = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60)
      return `${mins}m ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    }
    const days = Math.floor(diffInSeconds / 86400)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
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
  const [pageSize, ] = useState(15)
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
      showError('Error', 'Failed to load audit logs.')
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

      showSuccess('Success', 'Audit Log CSV report successfully downloaded.')
    } catch (err) {
      console.error('Export error:', err)
      showError('Error', 'Failed to export CSV file.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyJson = () => {
    if (!selectedLog) return
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    showSuccess('Copied', 'Technical metadata copied to clipboard.')
  }

  // Filter out internal technical keys for clean user presentation
  const getCleanObjectEntries = (obj?: Record<string, any> | null) => {
    if (!obj || typeof obj !== 'object') return []
    return Object.entries(obj).filter(([key]) => !TECHNICAL_KEYS.has(key))
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MOH Security Audit & Transparency Trail</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            System Logs & Staff Activity Trail
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Centralized audit trail tracking staff authentication, hospital module access, and data modification across the H.O.M.E. ecosystem.
          </p>
        </div>
      </div>

      {/* 2. Top KPI Analytics Ribbon (2x2 on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Logs */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Records</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">
              {stats.totalLogs}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              Permanent audit trail
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Today Logins */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Login Sessions</p>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-1 tabular-nums">
              {stats.todayLogins}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              Active personnel
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Navigation Events */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Modules Visited</p>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-400 mt-1 tabular-nums">
              {stats.navigationEvents}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              Module access
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 4: Critical Mutations */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Data Actions</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 tabular-nums">
              {stats.criticalActions}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              Create, Update & Delete
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Control Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">
        {/* Top Row: Search & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staff name, IC number, designation, module, or remarks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Reload audit records"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Download CSV'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Multi-Dropdown Filters & Date Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          {/* Module Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary font-bold uppercase tracking-wider mb-1.5">
              Module / Menu Filter
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Hospital Modules</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {MODULE_VISUALS[mod]?.label || mod.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary font-bold uppercase tracking-wider mb-1.5">
              Activity / Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Activity Types</option>
              <option value="LOGIN_LOGOUT">Login & Logout (LOGIN / LOGOUT)</option>
              <option value="NAVIGATION">Page / Menu View (VIEW)</option>
              <option value="CREATE">Create New Record (CREATE)</option>
              <option value="UPDATE">Update Record (UPDATE)</option>
              <option value="DELETE">Delete Record (DELETE)</option>
              <option value="APPROVE_REJECT">Approvals & Rejections (APPROVE / REJECT)</option>
              <option value="EXPORT">Export Reports (EXPORT)</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary font-bold uppercase tracking-wider mb-1.5">
              Staff / User
            </label>
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Personnel</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.jawatan || u.employee_id || u.ic_number?.slice(0, 6)})
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary font-bold uppercase tracking-wider mb-1.5">
              Time Period
            </label>
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => handleDatePresetChange('all')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  datePreset === 'all' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleDatePresetChange('today')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  datePreset === 'today' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => handleDatePresetChange('7days')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  datePreset === '7days' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => handleDatePresetChange('30days')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-text-muted font-medium">Active Filters:</span>
              {search && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs">
                  Search: &quot;{search}&quot;
                </span>
              )}
              {moduleFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs">
                  Module: {MODULE_VISUALS[moduleFilter]?.label || moduleFilter}
                </span>
              )}
              {actionFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
                  Action: {actionFilter}
                </span>
              )}
              {userFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs">
                  Specific Staff
                </span>
              )}
              {datePreset !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs">
                  Date: {datePreset}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold self-start sm:self-auto underline underline-offset-4"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Interactive Audit Log Table / Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Activity Timeline ({totalRecords} Records)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 sm:p-12 space-y-4">
            <div className="h-6 bg-slate-800/60 rounded-lg w-full animate-pulse" />
            <div className="h-6 bg-slate-800/60 rounded-lg w-11/12 animate-pulse" />
            <div className="h-6 bg-slate-800/60 rounded-lg w-10/12 animate-pulse" />
            <div className="h-6 bg-slate-800/60 rounded-lg w-9/12 animate-pulse" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-text-muted flex items-center justify-center mx-auto border border-slate-700">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-300">No Records Found</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              No activities match the search or filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 min-h-[40px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3.5 sm:p-4 w-48">Timestamp & Date</th>
                    <th className="p-3.5 sm:p-4 w-64">Officer / Staff Name</th>
                    <th className="p-3.5 sm:p-4 w-44">Module / Section</th>
                    <th className="p-3.5 sm:p-4">Action & Activity Summary</th>
                    <th className="p-3.5 sm:p-4 w-36">Device / IP</th>
                    <th className="p-3.5 sm:p-4 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-sm font-medium">
                  {logs.map((log) => {
                    const actionMeta = getActionBadgeStyle(log.action)
                    const ActionIcon = actionMeta.icon
                    const modMeta = MODULE_VISUALS[log.module?.toLowerCase()] || {
                      label: log.module?.toUpperCase() || 'SISTEM',
                      color: 'text-slate-300',
                      bg: 'bg-slate-800',
                      border: 'border-slate-700',
                      icon: Layers,
                    }
                    const ModIcon = modMeta.icon || Layers
                    const humanSentence = generateHumanSummary(log)

                    return (
                      <tr
                        key={log.id}
                        onClick={() => {
                          setSelectedLog(log)
                          setShowTechnicalJson(false)
                        }}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        {/* 1. Date & Time */}
                        <td className="p-3.5 sm:p-4 align-top">
                          <div className="font-mono text-xs text-slate-200">
                            {formatDateTime(log.created_at)}
                          </div>
                          <div className="text-[11px] text-teal-400 font-sans mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{formatRelativeTimeMalay(log.created_at)}</span>
                          </div>
                        </td>

                        {/* 2. Staff / User Info */}
                        <td className="p-3.5 sm:p-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
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
                        <td className="p-3.5 sm:p-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${modMeta.bg} ${modMeta.color} border ${modMeta.border}`}
                          >
                            <ModIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[130px]">{modMeta.label.split('(')[0]}</span>
                          </span>
                        </td>

                        {/* 4. Action & Human-Readable Sentence */}
                        <td className="p-3.5 sm:p-4 align-top space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${actionMeta.badgeBg}`}
                            >
                              <ActionIcon className="w-3 h-3" />
                              <span>{actionMeta.label}</span>
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 leading-relaxed font-sans">
                            {humanSentence}
                          </div>
                        </td>

                        {/* 5. IP & User Agent */}
                        <td className="p-3.5 sm:p-4 align-top">
                          <div className="text-xs font-mono text-slate-400">
                            {log.ip_address || '192.168.1.100'}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Laptop className="w-3 h-3 text-text-muted shrink-0" />
                            <span className="truncate max-w-[120px]" title={log.user_agent}>
                              {log.user_agent?.includes('Macintosh')
                                ? 'macOS'
                                : log.user_agent?.includes('iPhone')
                                ? 'iPhone'
                                : log.user_agent?.includes('Windows')
                                ? 'Windows PC'
                                : 'Web Browser'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Action: View Details */}
                        <td className="p-3.5 sm:p-4 align-top text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLog(log)
                              setShowTechnicalJson(false)
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800">
              {logs.map((log) => {
                const actionMeta = getActionBadgeStyle(log.action)
                const ActionIcon = actionMeta.icon
                const modMeta = MODULE_VISUALS[log.module?.toLowerCase()] || {
                  label: log.module?.toUpperCase() || 'SISTEM',
                  color: 'text-slate-300',
                  bg: 'bg-slate-800',
                  border: 'border-slate-700',
                  icon: Layers,
                }
                const ModIcon = modMeta.icon || Layers
                const humanSentence = generateHumanSummary(log)

                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      setSelectedLog(log)
                      setShowTechnicalJson(false)
                    }}
                    className="p-3.5 space-y-2.5 hover:bg-slate-800/40 active:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    {/* Top row: Module + Action + Time */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${modMeta.bg} ${modMeta.color} border ${modMeta.border}`}>
                          <ModIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{modMeta.label.split('(')[0]}</span>
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${actionMeta.badgeBg}`}>
                          <ActionIcon className="w-3 h-3 shrink-0" />
                          <span>{actionMeta.label.split('(')[0]}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-teal-400 font-mono shrink-0">
                        {formatRelativeTimeMalay(log.created_at)}
                      </span>
                    </div>

                    {/* User row */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-teal-400 shrink-0">
                        {log.user?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate block">
                          {log.user?.full_name || 'Pegawai Sistem'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">
                          {log.user?.jawatan ? `${log.user.jawatan} • ` : ''}IC: {log.user?.ic_number || log.user?.employee_id || 'AUTO'}
                        </span>
                      </div>
                    </div>

                    {/* Natural summary sentence */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {humanSentence}
                    </p>

                    {/* Bottom row: Device / IP + View button */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Laptop className="w-3 h-3 text-text-muted shrink-0" />
                        <span>{log.ip_address || '192.168.1.100'}</span>
                      </div>
                      <button
                        type="button"
                        className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Table Pagination footer */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="text-center sm:text-left">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono flex items-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Human-Friendly Details Modal (Pemeriksaan Terperinci Log) */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold uppercase">
                      Audit Record #{selectedLog.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      MOH Verified
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Action Details & Activity Trail
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Timestamp: {formatDateTime(selectedLog.created_at)} ({formatRelativeTimeMalay(selectedLog.created_at)})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  aria-label="Close modal"
                  className="min-h-[40px] min-w-[40px] p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-sm">
                {/* 1. Human Language Narrative Summary Banner */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Staff Action Summary</span>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                    {generateHumanSummary(selectedLog)}
                  </p>
                </div>

                {/* 2. User & Environment Profile Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Staff Info Card */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Staff / Officer Profile</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-text-muted block text-[11px]">Full Name:</span>
                        <span className="text-white font-bold text-sm">
                          {selectedLog.user?.full_name || 'Pegawai Sistem (System/Auto)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-text-muted block text-[11px]">IC / Staff ID:</span>
                          <span className="text-slate-300 font-mono">
                            {selectedLog.user?.ic_number || selectedLog.user?.employee_id || selectedLog.user_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[11px]">Designation:</span>
                          <span className="text-slate-300">
                            {selectedLog.user?.jawatan || 'Duty Officer'}
                          </span>
                        </div>
                      </div>
                      {selectedLog.user?.email && (
                        <div>
                          <span className="text-text-muted block text-[11px]">Email Address:</span>
                          <span className="text-slate-400">{selectedLog.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module & Access Environment Card */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>Module & Access Location</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-text-muted block text-[11px]">Module / Section:</span>
                        <span className="text-indigo-300 font-bold">
                          {MODULE_VISUALS[selectedLog.module?.toLowerCase()]?.label || selectedLog.module?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-text-muted block text-[11px]">Action Type:</span>
                          <span className="text-slate-300 font-semibold">{selectedLog.action}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[11px]">IP Address:</span>
                          <span className="text-slate-300 font-mono">{selectedLog.ip_address || '192.168.1.100'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Device Used:</span>
                        <span className="text-slate-400">
                          {selectedLog.user_agent?.includes('Macintosh')
                            ? 'Apple Mac (macOS)'
                            : selectedLog.user_agent?.includes('iPhone')
                            ? 'iPhone Smartphone (iOS)'
                            : selectedLog.user_agent?.includes('Windows')
                            ? 'Windows PC (Hospital Workstation)'
                            : 'Pelayar Web'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Human Data Changes Comparison Cards */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Information Details & Data Mutations</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Old Values */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Previous / Initial Value:
                        </span>
                        {getCleanObjectEntries(selectedLog.old_values).length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-slate-800 text-xs">
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
                          <p className="text-xs text-text-muted italic py-2">
                            No prior record (New Record Creation)
                          </p>
                        )}
                      </div>

                      {/* New Values */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Current Value / Action Record:
                        </span>
                        {getCleanObjectEntries(selectedLog.new_values).length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-slate-800 text-xs">
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
                          <p className="text-xs text-text-muted italic py-2">
                            No additional details
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Optional Collapsible Raw Technical Code (For IT Specialists) */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowTechnicalJson(!showTechnicalJson)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>
                      {showTechnicalJson ? 'Hide Raw JSON' : 'View Raw JSON (Technical IT)'}
                    </span>
                  </button>

                  {showTechnicalJson && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <pre className="text-slate-300 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(selectedLog, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-2">
                <button
                  onClick={handleCopyJson}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied' : 'Copy Log JSON'}</span>
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="min-h-[40px] px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-colors"
                >
                  Tutup
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
