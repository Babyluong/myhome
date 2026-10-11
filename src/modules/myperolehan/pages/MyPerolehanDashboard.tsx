// src/modules/myperolehan/pages/MyPerolehanDashboard.tsx
// Master Container Page for MyPerolehan (Hospital Administrator Procurement & Budget Monitoring)
// Built to match MyWarrantDashboard.tsx structure, sidebar, colors, and layout components 100%

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Wallet,
  FileText,
  ShoppingCart,
  PieChart,
  Activity,
  Clock,
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  Sparkles,
  ChevronRight,
  Building,
  HardHat,
  CreditCard,
  Plus
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { supabase } from '@/services/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton, SkeletonCard } from '@/shared/components/ui/skeleton'
import { ModulePageHeader } from '@/components/ui'
import { Fab } from '@/shared/components/mobile'

// Detail Tabs & Components
import { PengurusanBudgetTab } from './tabs/PengurusanBudgetTab'
import { PembangunanBudgetTab } from './tabs/PembangunanBudgetTab'
import { PurchaseOrdersTab } from './tabs/PurchaseOrdersTab'
import { ReceivingPaymentsTab } from './tabs/ReceivingPaymentsTab'
import { PerihalSuppliersTab } from './tabs/PerihalSuppliersTab'

// Modals
import { CreateAdminPOModal } from '../components/CreateAdminPOModal'
import { AdminLpoViewerModal } from '../components/AdminLpoViewerModal'
import { RecordPaymentModal } from '../components/RecordPaymentModal'
import { AddWarrantModal } from '../components/AddWarrantModal'

// Service
import {
  getAggregatedPerolehanData,
  getLPOs,
  getReceivingRecords,
  getPayments,
  getPerihalCatalog,
  getSuppliers
} from '../services/perolehanAdminService'

import type {
  OverallPerolehanKPIs,
  BudgetHierarchySummary,
  AdminPurchaseOrder,
  AdminWarrant,
  AdminPembangunan,
  AdminLPO,
  AdminReceivingRecord,
  AdminPayment,
  AdminPerihalItem,
  AdminSupplier,
  BudgetType
} from '@/shared/types/myperolehan'

interface ActivityLog {
  title: string
  sub: string
  time: string
  color: string
}

interface MyPerolehanDashboardProps {
  initialTab?: string
}

export const MyPerolehanDashboard: React.FC<MyPerolehanDashboardProps> = ({ initialTab }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active view from URL path or prop
  const getTabFromPath = () => {
    const path = location.pathname
    if (path.includes('/pengurusan')) return 'pengurusan'
    if (path.includes('/pembangunan')) return 'pembangunan'
    if (path.includes('/orders')) return 'orders'
    if (path.includes('/payments')) return 'receiving_payments'
    if (path.includes('/catalog')) return 'catalog'
    return initialTab || 'dashboard'
  }

  const [activeView, setActiveView] = useState<string>(getTabFromPath())
  const [loading, setLoading] = useState(true)

  // Aggregated Data State
  const [kpis, setKpis] = useState<OverallPerolehanKPIs>({
    totalAllocatedPengurusan: 0,
    totalAllocatedPembangunan: 0,
    totalAllocatedGrand: 0,
    totalCommitted: 0,
    totalActualSpent: 0,
    totalNetBalance: 0,
    overallUtilizationRate: 0,
    activePOCount: 0,
    pendingApprovalCount: 0,
    totalSuppliersCount: 0,
    fiscalYear: 2026
  })

  const [hierarchy, setHierarchy] = useState<BudgetHierarchySummary[]>([])
  const [orders, setOrders] = useState<AdminPurchaseOrder[]>([])
  const [warrants, setWarrants] = useState<AdminWarrant[]>([])
  const [pembangunan, setPembangunan] = useState<AdminPembangunan[]>([])
  const [lpos, setLpos] = useState<AdminLPO[]>([])
  const [receivingRecords, setReceivingRecords] = useState<AdminReceivingRecord[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [catalogItems, setCatalogItems] = useState<AdminPerihalItem[]>([])
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])

  // Modal States
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false)
  const [poPreselectedBudgetType, setPoPreselectedBudgetType] = useState<BudgetType>('warrant')
  const [poPreselectedProgramCode, setPoPreselectedProgramCode] = useState<string>('020200')

  const [isAddWarrantOpen, setIsAddWarrantOpen] = useState(false)
  const [warrantInitialType, setWarrantInitialType] = useState<BudgetType>('warrant')

  const [selectedLPOForView, setSelectedLPOForView] = useState<AdminLPO | null>(null)
  const [selectedLPOForPayment, setSelectedLPOForPayment] = useState<AdminLPO | null>(null)

  useEffect(() => {
    setActiveView(getTabFromPath())
  }, [location.pathname, initialTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [aggData, lposRes, recRes, payRes, catRes, supRes] = await Promise.all([
        getAggregatedPerolehanData(2026),
        getLPOs(),
        getReceivingRecords(),
        getPayments(),
        getPerihalCatalog(),
        getSuppliers()
      ])

      setKpis(aggData.kpis)
      setHierarchy(aggData.hierarchy)
      setOrders(aggData.recentOrders)
      setWarrants(aggData.warrants)
      setPembangunan(aggData.pembangunan)
      setLpos(lposRes)
      setReceivingRecords(recRes)
      setPayments(payRes)
      setCatalogItems(catRes)
      setSuppliers(supRes)

      // Map live activities
      const mappedActivities: ActivityLog[] = []
      aggData.recentOrders.slice(0, 5).forEach((po) => {
        if (po.status === 'completed') {
          mappedActivities.push({
            title: 'Payment Completed',
            sub: `${po.order_number} - RM ${Number(po.total_amount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`,
            time: po.order_date,
            color: 'bg-emerald-500'
          })
        } else if (po.status === 'approved') {
          mappedActivities.push({
            title: 'Order Approved (LPO)',
            sub: `${po.order_number} - ${po.supplier?.company_name || 'Appointed Supplier'}`,
            time: po.order_date,
            color: 'bg-indigo-500'
          })
        } else {
          mappedActivities.push({
            title: 'New Order Created',
            sub: `${po.order_number} - Awaiting administrator approval`,
            time: po.order_date,
            color: 'bg-amber-500'
          })
        }
      })

      if (mappedActivities.length === 0) {
        mappedActivities.push(
          {
            title: 'System Activity',
            sub: 'Procurement & warrant database synchronized live',
            time: 'Just now',
            color: 'bg-indigo-500'
          },
          {
            title: 'MOH Warrant Recorded',
            sub: 'P42 & 022300 allocations updated',
            time: '1 day ago',
            color: 'bg-emerald-500'
          }
        )
      }

      setActivities(mappedActivities)
    } catch (error) {
      console.error('Error fetching perolehan dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const openCreatePOWithPreset = (programCode?: string) => {
    if (programCode === 'P42') {
      setPoPreselectedBudgetType('pembangunan')
      setPoPreselectedProgramCode('P42')
    } else if (programCode === '022300') {
      setPoPreselectedBudgetType('warrant')
      setPoPreselectedProgramCode('022300')
    } else {
      setPoPreselectedBudgetType('warrant')
      setPoPreselectedProgramCode('020200')
    }
    setIsCreatePOOpen(true)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ModulePageHeader
        title="MyPerolehan"
        subtitle="Hospital Procurement, LPO Tracking, Supplier Directory & Budget Oversight"
        badge="Procurement"
        icon={<ShoppingCart className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openCreatePOWithPreset('020200')}
              className="min-h-[38px] px-4 py-2 bg-accent-base hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Order</span>
            </button>
            <div className="px-3 py-1.5 bg-subtle rounded-lg border border-border-default flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Operational
              </span>
            </div>
          </div>
        }
      />

        {/* Central Operations Ledger Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Budget Overview */}
          <div
            onClick={() => {
              setActiveView(activeView === 'pengurusan' ? 'dashboard' : 'pengurusan')
              navigate('/perolehan/pengurusan')
            }}
            className={`group bg-surface border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-accent-base/40 shadow-xs transition-colors cursor-pointer min-h-[170px] ${
              activeView === 'pengurusan' ? 'border-accent-base ring-1 ring-accent-base' : 'border-border-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <PieChart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Financial</span>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">
                Budget Overview
              </h3>
              <p className="text-text-muted text-xs">Status & performance metrics</p>
            </div>
            <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
              <span>EXPLORE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* 2. Warrant Management */}
          <div
            onClick={() => {
              setActiveView(activeView === 'pembangunan' ? 'dashboard' : 'pembangunan')
              navigate('/perolehan/pembangunan')
            }}
            className={`group bg-surface border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-accent-base/40 shadow-xs transition-colors cursor-pointer min-h-[170px] ${
              activeView === 'pembangunan' ? 'border-accent-base ring-1 ring-accent-base' : 'border-border-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Allocation</span>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">
                Warrant Management
              </h3>
              <p className="text-text-muted text-xs">Distribution & limits control</p>
            </div>
            <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
              <span>MANAGE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* 3. Purchase Orders */}
          <div
            onClick={() => {
              setActiveView(activeView === 'orders' ? 'dashboard' : 'orders')
              navigate('/perolehan/orders')
            }}
            className={`group bg-surface border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-accent-base/40 shadow-xs transition-colors cursor-pointer min-h-[170px] ${
              activeView === 'orders' ? 'border-accent-base ring-1 ring-accent-base' : 'border-border-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Procurement</span>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">
                Purchase Orders
              </h3>
              <p className="text-text-muted text-xs">Registry lifecycle & tracking</p>
            </div>
            <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
              <span>PROCURE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* 4. LOU & Penalties / Payments */}
          <div
            onClick={() => {
              setActiveView(activeView === 'receiving_payments' ? 'dashboard' : 'receiving_payments')
              navigate('/perolehan/payments')
            }}
            className={`group bg-surface border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-accent-base/40 shadow-xs transition-colors cursor-pointer min-h-[170px] ${
              activeView === 'receiving_payments' ? 'border-accent-base ring-1 ring-accent-base' : 'border-border-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Settlement</span>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">
                Receiving & Payments
              </h3>
              <p className="text-text-muted text-xs">DO Receiving & EFT Vouchers</p>
            </div>
            <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
              <span>TRACK</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* 5. Item Catalogs */}
          <div
            onClick={() => {
              setActiveView(activeView === 'catalog' ? 'dashboard' : 'catalog')
              navigate('/perolehan/catalog')
            }}
            className={`group bg-surface border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-accent-base/40 shadow-xs transition-colors cursor-pointer min-h-[170px] ${
              activeView === 'catalog' ? 'border-accent-base ring-1 ring-accent-base' : 'border-border-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Directory</span>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">
                Item Catalogs
              </h3>
              <p className="text-text-muted text-xs">54+ items & registered MOF</p>
            </div>
            <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
              <span>VIEW</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Section Grid (Quick Statistics + Recent Activities) matching MyWarrantDashboard */}
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Statistics Metric Cards */}
            <div className="bg-surface rounded-xl border border-border-default p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-accent-base">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Quick Statistics</h2>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                    Real-time ledger overview
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Total Allocated Budget
                    </p>
                    <Skeleton className="h-7 w-36 bg-subtle" />
                  </div>
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Budget Utilization
                    </p>
                    <Skeleton className="h-7 w-20 bg-subtle" />
                  </div>
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Active Contracts / PO
                    </p>
                    <Skeleton className="h-7 w-16 bg-subtle" />
                  </div>
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Pending Action
                    </p>
                    <Skeleton className="h-7 w-16 bg-subtle" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {/* Total Allocated */}
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Total Allocated Budget
                    </p>
                    <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                      <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
                        RM {kpis.totalAllocatedGrand.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </h4>
                      <p className="text-[11px] text-text-muted">Total hospital warrants registry</p>
                    </div>
                  </div>

                  {/* Utilization */}
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Budget Utilization
                    </p>
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                      <div className="flex items-end justify-between">
                        <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
                          {kpis.overallUtilizationRate}%
                        </h4>
                        <span className="text-[10px] font-bold text-accent-base">Active</span>
                      </div>
                      <div className="w-full h-2 bg-subtle rounded-full overflow-hidden relative border border-border-default">
                        <div
                          className="h-full bg-accent-base rounded-full transition-colors duration-1000"
                          style={{ width: `${kpis.overallUtilizationRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Contracts / POs */}
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Active Contracts / PO
                    </p>
                    <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                      <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
                        {kpis.activePOCount.toString().padStart(2, '0')}
                      </h4>
                      <p className="text-[11px] text-text-muted">Total verified agreements</p>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Pending Action
                    </p>
                    <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                      <h4 className="text-xl font-bold font-mono text-amber-500 tracking-tight tabular-nums">
                        {kpis.pendingApprovalCount.toString().padStart(2, '0')}
                      </h4>
                      <p className="text-[11px] text-text-muted">Awaiting management approvals</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Logs Stream */}
            <div className="bg-surface rounded-xl border border-border-default p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-accent-base">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Recent Activities</h2>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                    Live procurement logstream
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Skeleton variant="circular" className="w-2.5 h-2.5 mt-1.5 shrink-0 bg-subtle" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton variant="text" className="h-4 w-40 bg-subtle" />
                        <Skeleton variant="text" className="h-3 w-64 max-w-full bg-subtle" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full ${activity.color} mt-1.5 shrink-0`} />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-text-primary leading-tight">{activity.title}</h4>
                          <span className="text-[10px] font-medium text-text-muted">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">{activity.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detailed Sub-view Content */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveView('dashboard')
                  navigate('/perolehan')
                }}
                className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary bg-surface border border-border-default px-4 py-2.5 min-h-[44px] rounded-xl shadow-xs"
              >
                <span>← Back to Operations Portal</span>
              </button>
            </div>

            {activeView === 'pengurusan' && (
              <PengurusanBudgetTab
                hierarchy={hierarchy}
                warrants={warrants}
                onOpenAddWarrant={() => {
                  setWarrantInitialType('warrant')
                  setIsAddWarrantOpen(true)
                }}
                onOpenCreatePO={(code) => openCreatePOWithPreset(code || '020200')}
              />
            )}

            {activeView === 'pembangunan' && (
              <PembangunanBudgetTab
                hierarchy={hierarchy}
                pembangunan={pembangunan}
                onOpenAddWarrant={() => {
                  setWarrantInitialType('pembangunan')
                  setIsAddWarrantOpen(true)
                }}
                onOpenCreatePO={() => openCreatePOWithPreset('P42')}
              />
            )}

            {activeView === 'orders' && (
              <PurchaseOrdersTab
                orders={orders}
                lpos={lpos}
                onRefresh={fetchDashboardData}
                onOpenCreatePO={() => openCreatePOWithPreset('020200')}
                onViewLPO={(lpo) => setSelectedLPOForView(lpo)}
              />
            )}

            {activeView === 'receiving_payments' && (
              <ReceivingPaymentsTab
                lpos={lpos}
                receivingRecords={receivingRecords}
                payments={payments}
                onOpenRecordPayment={(lpo) => setSelectedLPOForPayment(lpo)}
                onRefresh={fetchDashboardData}
              />
            )}

            {activeView === 'catalog' && (
              <PerihalSuppliersTab
                catalogItems={catalogItems}
                suppliers={suppliers}
                onRefresh={fetchDashboardData}
              />
            )}
          </div>
        )}

        {/* Modals */}
        <CreateAdminPOModal
          isOpen={isCreatePOOpen}
          onClose={() => setIsCreatePOOpen(false)}
          onSuccess={fetchDashboardData}
          preselectedBudgetType={poPreselectedBudgetType}
          preselectedProgramCode={poPreselectedProgramCode}
        />

        <AdminLpoViewerModal
          isOpen={!!selectedLPOForView}
          onClose={() => setSelectedLPOForView(null)}
          lpo={selectedLPOForView}
        />

        <RecordPaymentModal
          isOpen={!!selectedLPOForPayment}
          onClose={() => setSelectedLPOForPayment(null)}
          onSuccess={fetchDashboardData}
          lpo={selectedLPOForPayment}
        />

        <AddWarrantModal
          isOpen={isAddWarrantOpen}
          onClose={() => setIsAddWarrantOpen(false)}
          onSuccess={fetchDashboardData}
          initialType={warrantInitialType}
        />

        {/* Mobile Floating Action Button */}
        <Fab 
          onClick={() => openCreatePOWithPreset('020200')} 
          aria-label="New Purchase Order" 
        />
      </div>
  )
}

export default MyPerolehanDashboard
