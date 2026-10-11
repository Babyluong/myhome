// src/modules/myperolehan/pages/tabs/PerolehanOverviewTab.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  HardHat,
  Plus,
  ChevronRight,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { BudgetSummaryCards } from '../../components/BudgetSummaryCards'
import { BudgetProgressBar } from '../../components/BudgetProgressBar'
import type {
  OverallPerolehanKPIs,
  BudgetHierarchySummary,
  AdminPurchaseOrder
} from '@/shared/types/myperolehan'
import { Button, Badge } from '@/components/ui'

interface PerolehanOverviewTabProps {
  kpis: OverallPerolehanKPIs
  hierarchy: BudgetHierarchySummary[]
  recentOrders: AdminPurchaseOrder[]
  onOpenCreatePO: () => void
  onOpenAddWarrant: () => void
  onTabChange: (tab: string) => void
}

export const PerolehanOverviewTab: React.FC<PerolehanOverviewTabProps> = ({
  kpis,
  hierarchy,
  recentOrders,
  onOpenCreatePO,
  onOpenAddWarrant,
  onTabChange
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-subtle text-text-muted border border-border-default">Draft</span>
      case 'pending_approval':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">Pending Approval</span>
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">Approved (LPO)</span>
      case 'ordered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">Ordered</span>
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">Completed</span>
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">Cancelled</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-subtle text-text-muted">{status}</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Main KPI Cards */}
      <BudgetSummaryCards
        kpis={kpis}
        onSelectType={(type) => {
          if (type === 'pengurusan') onTabChange('pengurusan')
          else if (type === 'pembangunan') onTabChange('pembangunan')
        }}
      />

      {/* 2. Visual Budget Allocation & Progress by Program */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pengurusan Column (020200 & 022300) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-text-primary">Operating Budget Performance</h3>
                <p className="text-xs text-text-muted font-mono">020200 Hospital Management & 022300 Dietetics</p>
              </div>
            </div>
            <button
              onClick={() => onTabChange('pengurusan')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>Details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Program List under Pengurusan */}
          <div className="space-y-4">
            {hierarchy
              .filter((h) => h.budgetType === 'warrant')
              .map((prog) => (
                <div
                  key={prog.programCode}
                  className="bg-subtle/50 border border-border-default rounded-2xl p-4.5 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black font-mono text-blue-700 uppercase tracking-widest px-2 py-0.5 bg-blue-100/60 rounded border border-blue-500/20">
                        CODE {prog.programCode}
                      </span>
                      <h4 className="text-sm font-black text-text-primary mt-1">{prog.programLabel}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Balance</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {formatCurrency(prog.remainingBalance)}
                      </span>
                    </div>
                  </div>

                  <BudgetProgressBar
                    utilizationRate={prog.utilizationRate}
                    spentAmount={prog.committedAmount + prog.actualSpent}
                    totalAmount={prog.totalAllocated}
                  />

                  {/* Objek Quick Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border-default">
                    {prog.objekSummaries.map((obj) => (
                      <div key={obj.objekCode} className="text-[11px] bg-surface p-2.5 rounded-xl border border-border-default shadow-xs">
                        <span className="text-text-muted font-mono font-bold block text-[10px]">{obj.objekCode}</span>
                        <span className="text-text-primary font-semibold truncate block">{obj.objekLabel}</span>
                        <span className="text-indigo-600 font-mono font-bold text-[10px]">{formatCurrency(obj.totalAllocated)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Pembangunan Column (P42) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-100 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-text-primary">Development Budget Performance</h3>
                <p className="text-xs text-text-muted font-mono">P42 Development Projects & Equipment Leasing</p>
              </div>
            </div>
            <button
              onClick={() => onTabChange('pembangunan')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
            >
              <span>Details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Program List under Pembangunan */}
          <div className="space-y-4">
            {hierarchy
              .filter((h) => h.budgetType === 'pembangunan')
              .map((prog) => (
                <div
                  key={prog.programCode}
                  className="bg-subtle/50 border border-border-default rounded-2xl p-4.5 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black font-mono text-amber-700 uppercase tracking-widest px-2 py-0.5 bg-amber-100/60 rounded border border-amber-500/20">
                        CODE {prog.programCode}
                      </span>
                      <h4 className="text-sm font-black text-text-primary mt-1">{prog.programLabel}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Balance</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {formatCurrency(prog.remainingBalance)}
                      </span>
                    </div>
                  </div>

                  <BudgetProgressBar
                    utilizationRate={prog.utilizationRate}
                    spentAmount={prog.committedAmount + prog.actualSpent}
                    totalAmount={prog.totalAllocated}
                  />

                  {/* Objek Quick Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border-default">
                    {prog.objekSummaries.map((obj) => (
                      <div key={obj.objekCode} className="text-[11px] bg-surface p-2.5 rounded-xl border border-border-default shadow-xs">
                        <span className="text-text-muted font-mono font-bold block text-[10px]">{obj.objekCode}</span>
                        <span className="text-text-primary font-semibold truncate block">{obj.objekLabel}</span>
                        <span className="text-amber-700 font-mono font-bold text-[10px]">{formatCurrency(obj.totalAllocated)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* 3. Live Financial Feed & Recent Transactions */}
      <div className="bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-text-primary">Recent Orders & Transactions</h3>
              <p className="text-xs text-text-muted">Local purchase order status & current expenditure workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={onOpenCreatePO}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm text-xs rounded-xl px-3.5 py-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Order (PO)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTabChange('orders')}
              className="border-border-default bg-surface hover:bg-subtle/50 text-text-secondary font-semibold text-xs rounded-xl px-3.5 py-2"
            >
              View All POs
            </Button>
          </div>
        </div>

        {/* Table of Recent Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Order No. (PO)</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Budget Type</th>
                <th className="py-3 px-3">Program / Object Code</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3 text-right">Total (RM)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-text-primary">{order.order_number}</td>
                    <td className="py-3.5 px-3 text-text-muted">{order.order_date}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        order.budget_type === 'pembangunan'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                      }`}>
                        {order.budget_type === 'pembangunan' ? 'P42 Development' : 'Operating'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-text-secondary font-semibold">
                      {order.program_code} - {order.objek_code}
                    </td>
                    <td className="py-3.5 px-3 text-text-primary font-medium">
                      {order.supplier?.company_name || 'Open Supplier'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-600">
                      {formatCurrency(Number(order.total_amount) || 0)}
                    </td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(order.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted font-medium italic">
                    No order records found yet. Click "Create Order (PO)" to start a new transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
