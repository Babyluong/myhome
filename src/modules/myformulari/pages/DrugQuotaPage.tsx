import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  AlertCircle,
  Clock,
  Printer,
  Building2,
  PackageCheck,
  Plus,
  History,
  RotateCcw,
  Users,
  CheckCircle2,
  AlertTriangle,
  Package,
  Activity,
  Check,
  Trash2,
  FileCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Pill,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import {
  getAllDrugQuotas,
  loadRealFacilityQuotas,
  getQuotaSummaryStats,
  getUniqueHospitals,
  resetDrugQuotasToDefault,
  deleteDrugQuota
} from '../services/drugQuotaService'
import { DrugQuotaItem, QuotaCategory } from '../types/drugQuotaTypes'
import { AddQuotaDrugModal } from '../components/AddQuotaDrugModal'
import { EditQuotaDrugModal } from '../components/EditQuotaDrugModal'
import { RecordQuotaDispenseModal } from '../components/RecordQuotaDispenseModal'
import { QuotaDispenseHistoryModal } from '../components/QuotaDispenseHistoryModal'
import { PatientQuotaDrawer } from '../components/PatientQuotaDrawer'

export const DrugQuotaPage: React.FC = () => {
  const navigate = useNavigate()

  const [quotaList, setQuotaList] = useState<DrugQuotaItem[]>([])
  const [selectedHospital, setSelectedHospital] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<QuotaCategory | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'critical' | 'low' | 'stable'>('ALL')
  const [sortBy, setSortBy] = useState<'remainingAsc' | 'usageDesc' | 'nameAsc' | 'budgetDesc'>('nameAsc')
  const [isLoading, setIsLoading] = useState(false)

  // Modals & Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPatientQuotaItem, setSelectedPatientQuotaItem] = useState<DrugQuotaItem | null>(null)
  const [editTargetItem, setEditTargetItem] = useState<DrugQuotaItem | null>(null)
  const [dispenseTargetItem, setDispenseTargetItem] = useState<DrugQuotaItem | null>(null)
  const [historyTargetItem, setHistoryTargetItem] = useState<DrugQuotaItem | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Load and sync quotas with real facility inventory
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const realItems = await loadRealFacilityQuotas()
      setQuotaList(realItems)
    } catch (err) {
      console.error('Error refreshing quota data', err)
      setQuotaList(getAllDrugQuotas())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const hospitals = useMemo(() => getUniqueHospitals(), [quotaList])

  const stats = useMemo(() => {
    return getQuotaSummaryStats(selectedHospital, selectedCategory, quotaList)
  }, [quotaList, selectedHospital, selectedCategory])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return quotaList
      .filter(item => {
        // Hospital Filter
        if (selectedHospital !== 'ALL' && item.hospitalName.toLowerCase() !== selectedHospital.toLowerCase()) {
          return false
        }

        // Category Filter
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false
        }

        // Text Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim()
          const matchGeneric = item.genericName.toLowerCase().includes(q)
          const matchBrand = item.brandNames?.some(b => b.toLowerCase().includes(q))
          const matchMohCode = item.mohDrugCode?.toLowerCase().includes(q)
          const matchAtc = item.atcCode?.toLowerCase().includes(q)
          const matchTherapeutic = item.therapeuticClass?.toLowerCase().includes(q)
          const matchDept = item.department?.toLowerCase().includes(q)
          const matchIndication = item.approvedIndications?.some(ind => ind.toLowerCase().includes(q))

          if (!matchGeneric && !matchBrand && !matchMohCode && !matchAtc && !matchTherapeutic && !matchDept && !matchIndication) {
            return false
          }
        }

        // Status Filter
        if (statusFilter === 'critical') return item.isCriticalShortage
        if (statusFilter === 'low') return item.isLowStock && !item.isCriticalShortage
        if (statusFilter === 'stable') return !item.isLowStock && !item.isCriticalShortage

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'remainingAsc') {
          return a.quotaRemaining - b.quotaRemaining
        }
        if (sortBy === 'usageDesc') {
          const pctA = (a.quotaUsed / Math.max(1, a.monthlyQuota)) * 100
          const pctB = (b.quotaUsed / Math.max(1, b.monthlyQuota)) * 100
          return pctB - pctA
        }
        if (sortBy === 'budgetDesc') {
          return (b.totalBudgetRM || 0) - (a.totalBudgetRM || 0)
        }
        return a.genericName.localeCompare(b.genericName)
      })
  }, [quotaList, selectedHospital, selectedCategory, searchTerm, statusFilter, sortBy])

  const showToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
  }

  const handleDeleteItem = (item: DrugQuotaItem) => {
    if (window.confirm(`Are you sure you want to delete the quota record for "${item.genericName}"? This record will no longer be displayed.`)) {
      deleteDrugQuota(item.id)
      setQuotaList(prev => prev.filter(i => i.id !== item.id && i.drugId !== item.drugId && i.facilityInventoryId !== item.facilityInventoryId))
      refreshData()
      showToast(`Quota for "${item.genericName}" has been successfully deleted.`)
    }
  }

  const getCategoryTheme = (cat: QuotaCategory) => {
    switch (cat) {
      case 'KELULUSAN_KHAS_KPK':
        return {
          label: 'DG Special Approval',
          badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
          dotClass: 'bg-amber-500'
        }
      case 'KATEGORI_A_STAR':
        return {
          label: 'Category A*',
          badgeClass: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
          dotClass: 'bg-indigo-500'
        }
      case 'KOS_TINGGI_BIOLOGIK':
        return {
          label: 'High-Cost & Biologics',
          badgeClass: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
          dotClass: 'bg-purple-500'
        }
      case 'PROGRAM_KHAS_KKM':
        return {
          label: 'MOH Special Program',
          badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
          dotClass: 'bg-blue-500'
        }
      case 'HIGH_ALERT_MEDICATION':
        return {
          label: 'High Alert (HAM)',
          badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
          dotClass: 'bg-rose-500'
        }
      default:
        return {
          label: 'Category A*',
          badgeClass: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
          dotClass: 'bg-slate-500'
        }
    }
  }

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-top-4 duration-150">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Modern Top Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-white/10 rounded-xl border border-white/15 text-indigo-300">
                <Pill className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Drug Quota Monitoring & Stock Alerts
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-[11px] font-mono font-semibold">
                MyPhIS Cloud Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-3xl">
              Direct integration of pharmacy physical inventory, named monthly patient quota registration, hospital allocation ceilings, and real-time balance tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Drug Quota</span>
            </button>

            <button
              onClick={refreshData}
              title="Refresh Data"
              disabled={isLoading}
              className="p-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl border border-white/15 cursor-pointer transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => window.print()}
              title="Print Quota Report"
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium border border-white/15 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Luxury Metric Pods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Fill Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Fill Rate
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {stats.overallUsagePercentage}%
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {stats.totalUsedQuantity.toLocaleString()} / {stats.totalAllocatedQuantity.toLocaleString()} Approved Units
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.overallUsagePercentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Physical Stock in MyInventory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Physical Store Stock Balance
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {stats.totalPhysicalStockOnHand.toLocaleString()} <span className="text-sm font-normal text-slate-500">Units</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.totalItems} Active Quota Drugs in MyInventory</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Available in Main Pharmacy & Cold Chain Store
          </div>
        </div>

        {/* Metric 3: Total Quota Allocation Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quota Allocation Value
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              RM {stats.totalBudgetRM.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Utilized: RM {stats.usedBudgetRM.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Remaining Budget: RM {stats.remainingBudgetRM.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Metric 4: Registered Named Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registered Named Patients
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {stats.totalRegisteredPatients} <span className="text-sm font-normal text-slate-500">Patients</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {stats.totalFilledPatientsThisMonth} Filled • {stats.totalPendingPatientsThisMonth} Awaiting Refill
            </p>
          </div>
          <div className="text-[11px] text-purple-700 font-medium">
            100% Verified Formal Approval
          </div>
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'All Quotas', count: stats.totalItems },
          { key: 'KATEGORI_A_STAR', label: 'Category A*', count: quotaList.filter(i => i.category === 'KATEGORI_A_STAR').length },
          { key: 'KELULUSAN_KHAS_KPK', label: 'DG Special Approval', count: quotaList.filter(i => i.category === 'KELULUSAN_KHAS_KPK').length },
          { key: 'KOS_TINGGI_BIOLOGIK', label: 'High-Cost & Biologics', count: quotaList.filter(i => i.category === 'KOS_TINGGI_BIOLOGIK').length },
          { key: 'PROGRAM_KHAS_KKM', label: 'MOH Special Program', count: quotaList.filter(i => i.category === 'PROGRAM_KHAS_KKM').length },
          { key: 'HIGH_ALERT_MEDICATION', label: 'High Alert (HAM)', count: quotaList.filter(i => i.category === 'HIGH_ALERT_MEDICATION').length }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
              selectedCategory === tab.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              selectedCategory === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drug names (Apixaban, Empagliflozin...), brands, indications..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Hospital Filter */}
          <select
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Quota Statuses</option>
            <option value="critical">Critical / Exhausted</option>
            <option value="low">Low Stock Warning</option>
            <option value="stable">Stable Stock</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="nameAsc">Sort: Drug Name (A-Z)</option>
            <option value="remainingAsc">Sort: Lowest Balance</option>
            <option value="usageDesc">Sort: Highest Utilization</option>
            <option value="budgetDesc">Sort: Budget Value</option>
          </select>
        </div>
      </div>

      {/* Modern Drug Quota Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-8 h-8 stroke-1.5 text-indigo-600" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Clean Slate Quota Database</h3>
              <p className="text-xs text-slate-500">
                No quota drugs or registered patients at this time. You can begin registering special approval medications for your facility.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Drug Quota</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const pctUsed = Math.round((item.quotaUsed / Math.max(1, item.monthlyQuota)) * 100)
            const isCritical = item.isCriticalShortage || item.quotaRemaining === 0
            const isLow = item.isLowStock && !isCritical
            const theme = getCategoryTheme(item.category)

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPatientQuotaItem(item)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 p-6 cursor-pointer space-y-5"
              >
                {/* Top Row: Title, Badges & Live Status */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-2 flex-1">
                    {/* Badge Strip */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${theme.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dotClass}`} />
                        <span>{theme.label}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                        Prescriber {item.prescriberCategory}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] text-slate-600 bg-slate-100 border border-slate-200 font-medium">
                        Scheme: {item.skimPerolehan}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] text-slate-600 bg-slate-100 border border-slate-200 font-medium">
                        {item.hospitalName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] text-slate-600 bg-slate-100 border border-slate-200 font-medium">
                        {item.department}
                      </span>
                    </div>

                    {/* Drug Title */}
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.genericName}
                      </h3>
                      {item.brandNames && item.brandNames.length > 0 && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Brand: <span className="text-slate-700 font-semibold">{item.brandNames.join(', ')}</span> • Form: {item.dosageForm} ({item.strength})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Top-Right Quota Status Pill */}
                  <div className="text-left md:text-right space-y-1 shrink-0 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-0 border-slate-200">
                    <div className="flex items-center md:justify-end gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                        isCritical
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isLow
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCritical ? 'bg-rose-600 animate-pulse' : isLow ? 'bg-amber-600' : 'bg-emerald-600'
                        }`} />
                        <span>{isCritical ? 'Critical / Exhausted' : isLow ? 'Low Stock' : 'Stable Quota'}</span>
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                      {item.quotaRemaining.toLocaleString()} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Remaining of {item.monthlyQuota.toLocaleString()} {item.unit} ceiling
                    </p>
                  </div>
                </div>

                {/* Middle Row: 4 Modern Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Tile 1: MyInventory Physical Stock */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Package className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">MyInventory Physical Stock</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      {(item.physicalStockOnHand ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-600">{item.unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate" title={item.storeLocation}>
                      {item.storeLocation || 'Main Pharmacy Store'}
                    </p>
                  </div>

                  {/* Tile 2: Named Patient Quota */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Named Patient Quota</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900">
                      {item.totalRegisteredPatients} Patients
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.filledPatientsCount} Filled • {item.pendingPatientsCount} Pending
                    </p>
                  </div>

                  {/* Tile 3: Monthly Commitment */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Utilization</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      {(item.totalPatientMonthlyUsage || 0).toLocaleString()} <span className="text-xs font-normal text-slate-600">{item.unit}/mo</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Usage: {pctUsed}% this month
                    </p>
                  </div>

                  {/* Tile 4: Price & Approval */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Price & Approval</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      RM {(item.costPerUnit || 0).toFixed(2)} <span className="text-xs font-normal text-slate-600">/ {item.unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate" title={item.specialApprovalRef}>
                      {item.specialApprovalRef || 'JKUT/2026'}
                    </p>
                  </div>
                </div>

                {/* Approved Indications Strip */}
                {item.approvedIndications && item.approvedIndications.length > 0 && (
                  <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Approved Indications under Quota:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                      {item.approvedIndications.slice(0, 2).map((ind, idx) => (
                        <li key={idx} className="truncate">{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">Updated: <strong className="text-slate-800 font-semibold">{item.lastUpdated || item.createdDate || '2026-08-25'}</strong></span>
                    <span>•</span>
                    <span className="text-[11px] font-medium">{item.verifiedBy || 'Facility Pharmacist'}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* View Patient Drawer Primary Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPatientQuotaItem(item)
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Patient Registry ({item.totalRegisteredPatients})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* View History Audit Log */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setHistoryTargetItem(item)
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>Logs ({item.dispenseLogs?.length || 0})</span>
                    </button>

                    {/* Delete Quota Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteItem(item)
                      }}
                      title="Delete Quota Record"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Slide-over Patient Quota Registry Drawer */}
      <PatientQuotaDrawer
        isOpen={!!selectedPatientQuotaItem}
        quotaItem={selectedPatientQuotaItem}
        onClose={() => setSelectedPatientQuotaItem(null)}
        onQuotaUpdated={refreshData}
      />

      {/* Add Quota Modal */}
      <AddQuotaDrugModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultHospital={selectedHospital !== 'ALL' ? selectedHospital : 'Hospital Lawas'}
        onSuccess={newItem => {
          refreshData()
          showToast(`Quota for "${newItem.genericName}" added successfully!`)
        }}
      />

      {/* Edit Quota Modal */}
      <EditQuotaDrugModal
        isOpen={!!editTargetItem}
        quotaItem={editTargetItem}
        onClose={() => setEditTargetItem(null)}
        onSuccess={updated => {
          refreshData()
          showToast(`Quota for "${updated.genericName}" updated successfully.`)
        }}
        onDeleteSuccess={deletedId => {
          setQuotaList(prev => prev.filter(item => item.id !== deletedId && item.drugId !== deletedId && item.facilityInventoryId !== deletedId))
          refreshData()
          showToast('Drug quota record deleted successfully.')
        }}
      />

      {/* Record Dispense Modal */}
      <RecordQuotaDispenseModal
        isOpen={!!dispenseTargetItem}
        quotaItem={dispenseTargetItem}
        onClose={() => setDispenseTargetItem(null)}
        onSuccess={(updated, log) => {
          refreshData()
          showToast(`Dispensed ${log.quantity} ${updated.unit} recorded for RN ${log.patientRn || '-'}.`)
        }}
      />

      {/* History Audit Log Modal */}
      <QuotaDispenseHistoryModal
        isOpen={!!historyTargetItem}
        quotaItem={historyTargetItem}
        onClose={() => setHistoryTargetItem(null)}
      />
    </div>
  )
}

export default DrugQuotaPage
