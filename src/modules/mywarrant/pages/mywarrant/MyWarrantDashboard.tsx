// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ChevronRight
} from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ModulePageHeader } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { supabase } from '@/services/supabase'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalBudget: number
  utilizationPercent: number
  activeContracts: number
  pendingApprovals: number
}

interface ActivityLog {
  title: string
  sub: string
  time: string
  color: string
}

export const MyWarrantDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    utilizationPercent: 0,
    activeContracts: 0,
    pendingApprovals: 0
  })
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // 1. Fetch Total Budget
        const { data: warrantData } = await supabase
          .from('pharmacy_warrants')
          .select('amount')
        
        const totalBudget = warrantData?.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) || 0

        // 2. Fetch Utilized Budget (Approved POs + Completed Oxygen Receptions)
        const [poRes, oxyRes] = await Promise.all([
          supabase
            .from('pharmacy_purchase_orders')
            .select('total_amount, status'),
          supabase
            .from('pharmacy_oxygen_reception_records')
            .select('total_amount, refill_amount, vote_code, status')
            .eq('status', 'completed')
        ])
        
        const poSpent = poRes.data?.filter(po => po.status === 'approved' || po.status === 'sent' || po.status === 'partial_received' || po.status === 'completed')
          .reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0) || 0

        const oxySpent = oxyRes.data
          ?.filter(r => !String(r.vote_code || '').trim().startsWith('24') && String(r.vote_code || '').trim() !== '020200')
          ?.reduce((acc, curr) => acc + parseFloat((curr as any).refill_amount != null ? (curr as any).refill_amount : curr.total_amount || 0), 0) || 0

        const utilizedBudget = poSpent + oxySpent
        
        const pendingApprovals = poRes.data?.filter(po => po.status === 'draft').length || 0

        const utilizationPercent = totalBudget > 0 ? Math.round((utilizedBudget / totalBudget) * 100) : 0

        // 3. Fetch Active Contracts
        const { count: contractCount } = await supabase
          .from('pharmacy_lou')
          .select('*', { count: 'exact', head: true })

        // 4. Fetch Recent Activities
        const { data: logs } = await supabase
          .from('approval_logs')
          .select(`
            id,
            action,
            notes,
            created_at,
            entity_type
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        const mappedActivities = logs?.map(log => {
          let title = 'System Activity'
          let color = 'bg-indigo-500'
          
          if (log.action?.includes('approved')) {
            title = 'Request Approved'
            color = 'bg-emerald-500'
          } else if (log.action?.includes('rejected')) {
            title = 'Request Rejected'
            color = 'bg-rose-500'
          } else if (log.action?.includes('draft')) {
            title = 'New Draft Created'
            color = 'bg-amber-500'
          }

          // Format time (e.g., "2 hours ago")
          const diffMs = new Date().getTime() - new Date(log.created_at).getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMins / 60)
          const diffDays = Math.floor(diffHours / 24)
          
          let timeStr = 'Just now'
          if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
          else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
          else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`

          return {
            title,
            sub: log.notes || `${log.entity_type} processed`,
            time: timeStr,
            color
          }
        }) || []

        setStats({
          totalBudget,
          utilizationPercent,
          activeContracts: contractCount || 0,
          pendingApprovals
        })
        setActivities(mappedActivities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ModulePageHeader
        title="MyWarrant"
        subtitle="Pharmacy Financial Warrant, Budget Allocations & Expenditure Ledger"
        badge="Financial Management"
        icon={<Wallet className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.PHARMACY_BUDGET)}
              className="min-h-[38px] px-4 py-2 bg-accent-base hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <PieChart className="w-4 h-4" />
              <span>Budget Overview</span>
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
        {/* Budget Overview */}
        <Link 
          to={ROUTES.PHARMACY_BUDGET} 
          className="group bg-surface border border-border-default hover:border-accent-base/40 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors cursor-pointer min-h-[170px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Financial</span>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">Budget Overview</h3>
            <p className="text-text-muted text-xs">Status & performance metrics</p>
          </div>
          <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
            <span>EXPLORE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Warrant Management */}
        <Link 
          to={ROUTES.PHARMACY_WARRANT} 
          className="group bg-surface border border-border-default hover:border-accent-base/40 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors cursor-pointer min-h-[170px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Allocation</span>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">Warrant Management</h3>
            <p className="text-text-muted text-xs">Distribution & limits control</p>
          </div>
          <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
            <span>MANAGE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Purchase Orders */}
        <Link 
          to={ROUTES.PHARMACY_PO} 
          className="group bg-surface border border-border-default hover:border-accent-base/40 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors cursor-pointer min-h-[170px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Procurement</span>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">Purchase Orders</h3>
            <p className="text-text-muted text-xs">Registry lifecycle & tracking</p>
          </div>
          <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
            <span>PROCURE</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* LOU & Penalties */}
        <Link 
          to={ROUTES.PHARMACY_LOU} 
          className="group bg-surface border border-border-default hover:border-accent-base/40 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors cursor-pointer min-h-[170px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contracts</span>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">LOU & Penalties</h3>
            <p className="text-text-muted text-xs">Deficits & performance logs</p>
          </div>
          <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
            <span>TRACK</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Item Catalogs */}
        <Link 
          to={ROUTES.PHARMACY_CATALOG} 
          className="group bg-surface border border-border-default hover:border-accent-base/40 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors cursor-pointer min-h-[170px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-text-secondary group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Directory</span>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors leading-tight">Item Catalogs</h3>
            <p className="text-text-muted text-xs">Drugs & logistics indices</p>
          </div>
          <div className="flex items-center text-accent-base text-xs font-semibold gap-1 pt-3 border-t border-border-default mt-3">
            <span>VIEW</span> <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

        {/* Dynamic Multi-Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Statistics Metric Cards */}
          <div className="bg-surface rounded-xl border border-border-default p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-subtle border border-border-default rounded-lg flex items-center justify-center text-accent-base">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary tracking-tight">Quick Statistics</h2>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Real-time ledger overview</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between">
                    <Skeleton className="h-3 w-28 bg-subtle mb-3" />
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                      <Skeleton className="h-7 w-36 bg-subtle" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Total Allocated */}
                <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Allocated Budget</p>
                  <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                    <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
                      RM {stats.totalBudget.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-[11px] text-text-muted">Total hospital warrants registry</p>
                  </div>
                </div>

                {/* Utilization */}
                <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Budget Utilization</p>
                  <div className="space-y-2 flex-1 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">{stats.utilizationPercent}%</h4>
                      <span className="text-[10px] font-bold text-accent-base">Active</span>
                    </div>
                    <div className="w-full h-2 bg-subtle rounded-full overflow-hidden relative border border-border-default">
                      <div 
                        className="h-full bg-accent-base rounded-full transition-all duration-1000" 
                        style={{ width: `${stats.utilizationPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Active Contracts */}
                <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Active Contracts</p>
                  <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                    <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight tabular-nums">{stats.activeContracts.toString().padStart(2, '0')}</h4>
                    <p className="text-[11px] text-text-muted">Total verified agreements</p>
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="p-4 bg-subtle/50 border border-border-default rounded-lg flex flex-col justify-between hover:border-accent-base/40 transition-colors">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Pending Action</p>
                  <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                    <h4 className="text-xl font-bold font-mono text-amber-500 tracking-tight tabular-nums">{stats.pendingApprovals.toString().padStart(2, '0')}</h4>
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
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Live procurement logstream</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 flex-1">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border-default bg-subtle/40">
                    <Skeleton className="h-3 w-3 rounded-full mt-1.5 shrink-0 bg-subtle" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-subtle" />
                      <Skeleton className="h-3 w-1/2 bg-subtle" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3 flex-1">
                {activities.map((activity, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 p-3 hover:bg-subtle/60 rounded-lg transition-colors border border-transparent hover:border-border-default group cursor-pointer"
                  >
                    <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", activity.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary group-hover:text-accent-base transition-colors leading-tight">{activity.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">{activity.sub}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-1.5">
                        <Clock className="w-3 h-3" /> {activity.time}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-subtle/30 rounded-xl border border-dashed border-border-default flex-1">
                <LayoutDashboard className="w-10 h-10 text-text-muted mb-2" />
                <p className="text-text-muted font-medium text-xs">No recent log records found</p>
              </div>
            )}
          </div>

        </div>
    </div>
  )
}

export default MyWarrantDashboard
