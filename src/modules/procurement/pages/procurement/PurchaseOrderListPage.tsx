import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { SlideOver } from '@/components/ui'
import { PurchaseOrderDetailView } from './PurchaseOrderDetailView'
import { getPurchaseOrders, getPurchaseOrderStats, getProcurementMetadata } from '@/services/pharmacy/procurementService'
import type { PurchaseOrderWithRelations, ProcurementFilter, POStatus } from '@/types/pharmacy'
import { ROUTES } from '@/lib/constants'
import { IconShoppingCart, IconPlus, IconSearch, IconFilter, IconReceipt, IconMoney, IconClock, IconCheck, IconArrowLeft, IconArrowRight } from '@/components/ui/Icons'
import { cn, formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ChevronRight, Sparkles, FileText } from 'lucide-react'

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const hospitalId = user?.hospital_id

  const [orders, setOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'PO' | 'MANUAL' | 'SQ'>('PO')
  const [stats, setStats] = useState({
    totalCount: 0,
    totalValue: 0,
    draftCount: 0,
    pendingApprovalCount: 0,
    approvedCount: 0,
    sentCount: 0,
    partialReceivedCount: 0,
    completedCount: 0,
    cancelledCount: 0
  })
  const [metadata, setMetadata] = useState<{ voteCodes: string[], categories: string[] }>({
    voteCodes: [],
    categories: []
  })

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<POStatus | 'all'>('all')
  const [voteCodeFilter, setVoteCodeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const pageSize = 15


  // Load orders with filters
  const loadOrders = useCallback(async () => {
    if (!hospitalId) return

    setIsLoading(true)
    setError(null)

    const filter: ProcurementFilter = {
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      po_type: activeTab === 'SQ' ? 'sq' : (activeTab === 'MANUAL' ? 'manual' : 'regular'),
      vote_code: voteCodeFilter || undefined,
      category: categoryFilter || undefined,
      department: departmentFilter || undefined,
    }

    const res = await getPurchaseOrders(hospitalId, filter, page, pageSize)

    if (res.error && (typeof navigator === 'undefined' || navigator.onLine)) {
      setError(res.error)
      setOrders([])
    } else if (res.data) {
      setError(null)
      setOrders(res.data.data)
      setTotalRecords(res.data.total || 0)
    } else {
      setError(null)
    }

    setIsLoading(false)
  }, [hospitalId, search, statusFilter, page, activeTab, voteCodeFilter, categoryFilter, departmentFilter])

  // Load stats separately (for entire hospital)
  const loadStats = useCallback(async () => {
    if (!hospitalId) return
    const res = await getPurchaseOrderStats(hospitalId)
    if (res.data) {
      setStats(res.data)
    }
  }, [hospitalId])

  // Load metadata
  const loadMetadata = useCallback(async () => {
    if (!hospitalId) return
    const res = await getProcurementMetadata(hospitalId)
    if (res.data) {
      setMetadata(res.data)
    }
  }, [hospitalId])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    void loadOrders()
    void loadStats()
    void loadMetadata()
  }, [loadOrders, loadStats, loadMetadata])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, voteCodeFilter, categoryFilter, departmentFilter])


  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const kpis = {
    totalOrders: stats.totalCount,
    totalValue: stats.totalValue,
    draftOrders: stats.draftCount + stats.pendingApprovalCount,
    approvedOrders: stats.approvedCount + stats.sentCount + stats.partialReceivedCount + stats.completedCount,
    sentOrders: stats.sentCount,
    cancelledOrders: stats.cancelledCount,
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] relative font-sans overflow-x-hidden">
      {/* Premium Ambient Radial Lights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/[0.04] to-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/[0.02] to-teal-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full p-6 lg:p-8 space-y-6">
        {/* Breadcrumbs & Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          {/* Enhanced Breadcrumb navigation with mini icons */}
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <button onClick={() => navigate('/financial')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              Financial
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => navigate('/procurement')} className="hover:text-indigo-600 transition-colors">
              Procurement
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-text-primary font-extrabold tracking-wide">Purchase Orders</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-surface border border-border-default rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 hover:rotate-2 transition-transform duration-300">
                <IconShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-surface border border-border-default">
                  Purchase Orders
                </h1>
                <p className="text-text-muted font-semibold text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Procurement Lifecycle Registry & Control Center
                </p>
              </div>
            </div>

            {/* Header Action Buttons Container */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => navigate(ROUTES.PHARMACY_PO_CREATE)}
                className="h-10 px-5 bg-surface border border-border-default hover:from-slate-950 hover:to-black text-white font-bold text-xs rounded-xl shadow-md transition-colors duration-150 flex items-center gap-1.5 active:scale-95 hover:shadow-lg hover:shadow-slate-300/30"
              >
                <IconPlus className="h-4 w-4" />
                New PO
              </button>
            </div>
          </div>
        </motion.div>

        {/* Elevated Dashboard KPI Metrics Section wrapped in a luxurious white background card */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border-default shadow-xl mb-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Total POs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-surface border border-border-default hover:border-slate-500/40 p-6 rounded-2xl relative overflow-hidden group hover:border-border-default hover:shadow-xl hover:shadow-slate-100/40 hover:-translate-y-1 transition-colors duration-150 cursor-default"
            >
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center text-slate-300 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <IconReceipt className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Registry</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">{kpis.totalOrders}</h3>
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>{kpis.totalOrders} Records</span>
                    {stats.cancelledCount > 0 && (
                      <span className="text-slate-200">|</span>
                    )}
                    {stats.cancelledCount > 0 && (
                      <span className="text-rose-500 font-bold">{stats.cancelledCount} Cancelled</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Total Value - Primary Hero Metric Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-surface border border-border-default hover:border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden group hover:from-indigo-50/60 hover:to-blue-50/40 hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-100/30 hover:-translate-y-1 transition-colors duration-150 cursor-default"
            >
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.05] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <IconMoney className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Value</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight truncate" title={formatCurrency(kpis.totalValue)}>
                    {formatCurrency(kpis.totalValue).replace('MYR', 'RM')}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 pt-0.5">Excludes Cancelled Orders</p>
                </div>
              </div>
            </motion.div>

            {/* Approved */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-surface border border-border-default hover:border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 hover:shadow-xl hover:shadow-slate-100/40 hover:-translate-y-1 transition-colors duration-150 cursor-default"
            >
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <IconCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Orders</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">{kpis.approvedOrders}</h3>
                  <p className="text-[11px] font-semibold text-slate-400 pt-0.5">Approved & In Delivery</p>
                </div>
              </div>
            </motion.div>

            {/* Pending / Drafts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-surface border border-border-default hover:border-amber-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/20 hover:shadow-xl hover:shadow-slate-100/40 hover:-translate-y-1 transition-colors duration-150 cursor-default"
            >
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <IconClock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending Action</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">{kpis.draftOrders}</h3>
                    {kpis.draftOrders > 0 && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 pt-0.5">Awaiting Approval / Draft</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Area Container with Premium Rounding */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border-default overflow-hidden relative z-10">
          <div className="p-6">
            {/* Tabs Row - Beautiful Segmented Tabs to Match LPO Registry */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
              <div className="flex flex-wrap bg-subtle p-1 rounded-2xl w-fit max-w-full border border-border-default">
                {/* Purchase Order Tab */}
                <button
                  onClick={() => setActiveTab('PO')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'PO'
                      ? 'bg-surface text-indigo-600 shadow-sm border border-border-default ring-1 ring-black/[0.02]'
                      : 'text-text-muted hover:text-text-primary hover:bg-subtle'
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap">
                    <span className={cn("w-1.5 h-1.5 rounded-full", activeTab === 'PO' ? "bg-indigo-500 animate-pulse" : "bg-slate-300")} />
                    Purchase Order
                  </div>
                </button>

                {/* Manual PO Tab */}
                <button
                  onClick={() => setActiveTab('MANUAL')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'MANUAL'
                      ? 'bg-surface text-indigo-600 shadow-sm border border-border-default ring-1 ring-black/[0.02]'
                      : 'text-text-muted hover:text-text-primary hover:bg-subtle'
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap">
                    <span className={cn("w-1.5 h-1.5 rounded-full", activeTab === 'MANUAL' ? "bg-amber-500 animate-pulse" : "bg-slate-300")} />
                    Manual PO
                  </div>
                </button>

                {/* Invite Quotation Tab */}
                <button
                  onClick={() => setActiveTab('SQ')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'SQ'
                      ? 'bg-surface text-indigo-600 shadow-sm border border-border-default ring-1 ring-black/[0.02]'
                      : 'text-text-muted hover:text-text-primary hover:bg-subtle'
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap">
                    <span className={cn("w-1.5 h-1.5 rounded-full", activeTab === 'SQ' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    Invite Quotation
                  </div>
                </button>
              </div>
            </div>

            {/* Premium Unified Filters Bar matching LPO list style */}
            <div className="bg-subtle/50 p-4 rounded-3xl border border-border-default shadow-sm mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                {/* Search Input Container */}
                <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between ml-0.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Search Registry</label>
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="relative flex-1 w-full group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <IconSearch className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search PO number, supplier, or items..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-11 pr-4 py-2.5 w-full bg-surface border border-border-default rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm outline-none h-11 font-semibold text-text-primary placeholder:text-text-muted/80"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as POStatus | 'all')}
                    className="w-full bg-surface border border-border-default text-text-secondary text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm h-11 font-bold cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="sent">Sent to Supplier</option>
                    <option value="partial_received">Partial Received</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Vote Code Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Vote Code</label>
                  <select 
                    value={voteCodeFilter}
                    onChange={(e) => setVoteCodeFilter(e.target.value)}
                    className="w-full bg-surface border border-border-default text-text-secondary text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm h-11 font-bold cursor-pointer"
                  >
                    <option value="">All Vote Codes</option>
                    {metadata?.voteCodes?.length > 0 ? (
                      metadata.voteCodes.map((vc) => (
                        <option key={vc} value={vc}>{vc}</option>
                      ))
                    ) : (
                      <>
                        <option value="080702">080702</option>
                        <option value="990102">990102</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Category</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-surface border border-border-default text-text-secondary text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm h-11 font-bold cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {metadata?.categories?.length > 0 ? (
                      metadata.categories.map((cat) => (
                        <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                      ))
                    ) : (
                      <>
                        <option value="drug">Drug</option>
                        <option value="non_drug">Non Drug</option>
                        <option value="non_standard">Non Standard</option>
                        <option value="reagent">Reagent</option>
                        <option value="vaccine">Vaccine</option>
                        <option value="insulin">Insulin</option>
                        <option value="hepc">HepC</option>
                        <option value="medical_oxygen">Medical Oxygen</option>
                        <option value="sglt2">SGLT-2</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Reset Action Button with Active Badge Count */}
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setVoteCodeFilter('');
                      setCategoryFilter('');
                      setDepartmentFilter('');
                    }}
                    className={cn(
                      "w-full px-4 py-2 bg-surface border border-border-default text-text-secondary text-xs rounded-xl transition-colors duration-150 h-11 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm font-bold",
                      (search || statusFilter !== 'all' || voteCodeFilter || categoryFilter || departmentFilter) 
                        ? "text-indigo-600 border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/10"
                        : "text-text-muted hover:text-text-primary hover:bg-subtle/50"
                    )}
                  >
                    <IconFilter className="w-3.5 h-3.5" />
                    <span>Reset</span>
                    {(search || statusFilter !== 'all' || voteCodeFilter || categoryFilter || departmentFilter) && (
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">
                        {((search ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (voteCodeFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (departmentFilter ? 1 : 0))}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Area - Desktop: Table, Mobile: Cards */}
            <div className="mt-6">
                {/* Desktop View Table */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border border-border-default shadow-sm">
                  {isLoading ? (
                    <SkeletonTable rows={8} columns={7} className="border-none shadow-none rounded-none" />
                  ) : orders.length === 0 ? (
                    <div className="bg-surface py-12">
                      <EmptyState
                        icon={<FileText className="w-12 h-12 text-slate-300" />}
                        title={activeTab === 'PO' ? "No purchase orders found" : (activeTab === 'MANUAL' ? "No manual POs found" : "No stock quotations found")}
                        description="Your search terms or filter selection didn't return any records. Try clearing filters or checking your spelling."
                        className="max-w-md mx-auto"
                      />
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-subtle/50 border-b border-border-default">
                          <th className="w-1.5 p-0"></th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Date</th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">{activeTab === 'SQ' ? 'SQ Number' : 'PO Number'}</th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Supplier</th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Vote Code</th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Category</th>
                          <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Total (RM)</th>
                          <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-text-secondary font-bold">Status</th>
                          <th className="w-10 px-3 py-3.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {orders.map((order) => (
                          <tr 
                            key={order.id} 
                            onClick={() => setSelectedOrderId(order.id)}
                            className="hover:bg-subtle/50 transition-colors duration-200 group cursor-pointer relative"
                          >
                            {/* Slide-in Hover Accent Indicator */}
                            <td className="w-1.5 p-0 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-r" />
                            </td>
                            
                            <td className="px-5 py-3.5">
                              <div className="text-xs font-bold text-slate-400 tabular-nums">{formatDate(order.order_date)}</div>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-extrabold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tabular-nums">
                                {order.po_number}
                              </span>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              <div className="text-sm font-semibold text-text-primary line-clamp-1 max-w-[240px]" title={order.supplier?.company_name}>
                                {order.sq_suppliers && order.sq_suppliers.length > 0 
                                  ? order.sq_suppliers.join(', ')
                                  : (order.manual_supplier_name || order.supplier?.company_name || '-')}
                              </div>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-0.5 bg-subtle border border-border-default rounded-lg text-[10px] font-bold text-text-muted tracking-wider">
                                {order.vote_code || '-'}
                              </span>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              {order.category ? (
                                <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                                  {order.category.replace('_', ' ')}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-300">-</span>
                              )}
                            </td>
                            
                            <td className="px-5 py-3.5 text-right">
                              <div className="text-sm font-black text-text-primary tabular-nums">
                                {formatCurrency(order.total_amount || 0).replace('MYR', '').trim()}
                              </div>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              <div className="flex justify-center">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border",
                                  order.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                  order.status === 'pending_approval' || order.status === 'draft' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                  order.status === 'cancelled' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                  "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                )}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    order.status === 'completed' ? "bg-emerald-500" :
                                    order.status === 'pending_approval' || order.status === 'draft' ? "bg-amber-500" :
                                    order.status === 'cancelled' ? "bg-rose-500" :
                                    "bg-indigo-500"
                                  )}></span>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </div>
                            </td>

                            {/* Chevron Action Indicator */}
                            <td className="w-10 px-3 py-3.5 text-right">
                              <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-colors duration-150" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile View Cards */}
                <div className="lg:hidden">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-surface border border-border-default rounded-2xl p-4 space-y-3 shadow-sm animate-pulse">
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-subtle rounded w-1/3" />
                            <div className="h-5 bg-subtle rounded-full w-1/4" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-3 bg-subtle rounded w-1/2" />
                            <div className="h-3 bg-subtle rounded w-2/3" />
                          </div>
                          <div className="h-3 bg-subtle rounded w-3/4" />
                          <div className="h-4 bg-subtle rounded w-1/2 pt-2" />
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-surface p-8 rounded-2xl border border-border-subtle">
                      <EmptyState
                        icon={<FileText className="w-10 h-10 text-slate-300" />}
                        title="No records found"
                        description="Your search terms or filters didn't return any purchase order records. Try adjusting filters."
                        className="max-w-md mx-auto"
                      />
                    </div>
                  ) : (
                    <motion.div 
                      variants={{
                        show: { transition: { staggerChildren: 0.05 } }
                      }}
                      initial="hidden"
                      animate="show"
                      className="space-y-4"
                    >
                      {orders.map((order) => (
                        <motion.div 
                          key={order.id} 
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                          }}
                          className="bg-surface border border-border-default rounded-2xl p-4 shadow-sm hover:shadow-md transition-colors active:scale-[0.99] cursor-pointer relative overflow-hidden pl-5"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          {/* Left Accent Bar */}
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5",
                            order.status === 'completed' ? "bg-emerald-500" :
                            order.status === 'pending_approval' || order.status === 'draft' ? "bg-amber-500" :
                            order.status === 'cancelled' ? "bg-rose-500" :
                            "bg-indigo-500"
                          )} />

                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {activeTab === 'SQ' ? 'SQ Number' : 'PO Number'}
                              </span>
                              <h4 className="text-sm font-black text-indigo-600 tabular-nums">{order.po_number}</h4>
                            </div>
                            <div className={cn(
                              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border",
                              order.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              order.status === 'pending_approval' || order.status === 'draft' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              order.status === 'cancelled' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                              "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                            )}>
                              {order.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                              <p className="text-xs font-bold text-text-secondary tabular-nums">{formatDate(order.order_date)}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                              <p className="text-xs font-black text-text-primary tabular-nums">{formatCurrency(order.total_amount || 0)}</p>
                            </div>
                          </div>

                          <div className="space-y-0.5 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</span>
                            <p className="text-xs font-semibold text-text-primary line-clamp-1">
                              {order.sq_suppliers && order.sq_suppliers.length > 0 
                                ? order.sq_suppliers.join(', ')
                                : (order.manual_supplier_name || order.supplier?.company_name || '-')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                            <span className="px-2.5 py-0.5 bg-subtle rounded-lg text-[9px] font-bold text-text-muted uppercase tracking-wider">
                              {order.vote_code || '-'}
                            </span>
                            {order.category && (
                              <span className="px-2.5 py-0.5 bg-indigo-500/10 rounded-lg text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
                                {order.category.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
            </div>

            {/* Premium Pagination Section */}
            {totalRecords > pageSize && (
              <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Count Summary */}
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  Showing <span className="text-text-primary font-bold">{(page - 1) * pageSize + 1}</span> to <span className="text-text-primary font-bold">{Math.min(page * pageSize, totalRecords)}</span> of <span className="text-text-primary font-bold">{totalRecords}</span> entries
                </div>

                {/* Page Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Quick Jump Selector */}
                  {Math.ceil(totalRecords / pageSize) > 1 && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold bg-subtle/50 px-3 py-1.5 rounded-xl border border-border-default">
                      <span>Jump to</span>
                      <select 
                        value={page}
                        onChange={(e) => setPage(Number(e.target.value))}
                        className="bg-surface border border-border-default rounded-lg px-1.5 py-0.5 font-bold text-text-secondary outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {Array.from({ length: Math.ceil(totalRecords / pageSize) }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Standard Pill Controls */}
                  <div className="flex items-center gap-1 bg-subtle p-1 rounded-2xl border border-border-default">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors disabled:opacity-20 disabled:cursor-not-allowed hover:bg-surface hover:shadow-sm text-text-muted active:scale-95"
                      title="Previous Page"
                    >
                      <IconArrowLeft size={15} />
                    </button>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(5, Math.ceil(totalRecords / pageSize)) }, (_, i) => {
                        const pageNum = i + 1;
                        const totalPages = Math.ceil(totalRecords / pageSize);
                        let displayPage = pageNum;
                        
                        if (totalPages > 5) {
                          if (page > 3) displayPage = page - 3 + pageNum;
                          if (displayPage > totalPages) displayPage = totalPages - (5 - pageNum);
                        }

                        if (displayPage > totalPages) return null;

                        return (
                          <button
                            key={displayPage}
                            onClick={() => setPage(displayPage)}
                            className={cn(
                              "w-9 h-9 rounded-xl text-xs font-bold transition-colors active:scale-95",
                              page === displayPage
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                : 'text-text-muted hover:bg-surface hover:text-text-primary hover:shadow-sm'
                            )}
                          >
                            {displayPage}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(Math.ceil(totalRecords / pageSize), p + 1))}
                      disabled={page >= Math.ceil(totalRecords / pageSize)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors disabled:opacity-20 disabled:cursor-not-allowed hover:bg-surface hover:shadow-sm text-text-muted active:scale-95"
                      title="Next Page"
                    >
                      <IconArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SlideOver
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        title="Purchase Order Details"
        size="5xl"
      >
        {selectedOrderId && (
          <PurchaseOrderDetailView 
            id={selectedOrderId} 
            isSlideOver={true} 
            onClose={() => setSelectedOrderId(null)} 
            onMutate={() => {
              void loadOrders()
              void loadStats()
            }}
          />
        )}
      </SlideOver>
    </div>
  )
}

export default PurchaseOrderListPage
