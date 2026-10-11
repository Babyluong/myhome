// src/modules/myperolehan/pages/tabs/PembangunanBudgetTab.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HardHat,
  Plus,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { BudgetProgressBar } from '../../components/BudgetProgressBar'
import type {
  BudgetHierarchySummary,
  AdminPembangunan
} from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface PembangunanBudgetTabProps {
  hierarchy: BudgetHierarchySummary[]
  pembangunan: AdminPembangunan[]
  onOpenAddWarrant: () => void
  onOpenCreatePO: (programCode?: string) => void
}

export const PembangunanBudgetTab: React.FC<PembangunanBudgetTabProps> = ({
  hierarchy,
  pembangunan,
  onOpenAddWarrant,
  onOpenCreatePO
}) => {
  const [expandedObjek, setExpandedObjek] = useState<Record<string, boolean>>({
    '01100 117 4002': true,
    '01200 117 1002': true,
    '00105 106 1105': true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const toggleExpand = (objekCode: string) => {
    setExpandedObjek((prev) => ({ ...prev, [objekCode]: !prev[objekCode] }))
  }

  const p42Program = hierarchy.find((h) => h.programCode === 'P42' || h.budgetType === 'pembangunan')

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-100 flex items-center justify-center">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-text-primary">Development Budget (P42)</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                DEVELOPMENT & LEASING
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Monitoring Medical Equipment Leasing 3.0, PSH Concessions & Training Allocations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenAddWarrant}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm text-xs rounded-xl px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add P42 Allocation</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenCreatePO('P42')}
            className="border-border-default bg-surface hover:bg-subtle/50 text-text-secondary font-bold text-xs rounded-xl px-4 py-2 shadow-sm"
          >
            + Create P42 PO
          </Button>
        </div>
      </div>

      {/* 2. Main P42 Executive Overview Card */}
      {p42Program && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-xs font-black font-mono rounded-lg border border-amber-500/20">
                  PROGRAM P42
                </span>
                <h3 className="text-lg font-black text-text-primary">Hospital Development Program</h3>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Development Projects, Equipment Leasing Agreements & Support Concessions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-subtle/50 p-3.5 rounded-2xl border border-border-default text-center">
              <div className="px-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Allocation</span>
                <span className="text-sm font-black text-text-primary font-mono">{formatCurrency(p42Program.totalAllocated)}</span>
              </div>
              <div className="px-3 border-x border-border-default">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Committed & Spent</span>
                <span className="text-sm font-black text-amber-600 font-mono">
                  {formatCurrency(p42Program.committedAmount + p42Program.actualSpent)}
                </span>
              </div>
              <div className="px-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Balance</span>
                <span className="text-sm font-black text-emerald-600 font-mono">
                  {formatCurrency(p42Program.remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <BudgetProgressBar
            utilizationRate={p42Program.utilizationRate}
            spentAmount={p42Program.committedAmount + p42Program.actualSpent}
            totalAmount={p42Program.totalAllocated}
            height="h-2.5"
          />

          {/* Breakdown of the 3 Key Pembangunan Objek */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              P42 Component Breakdown (Equipment Leasing, PSH Concession & Training)
            </h4>

            <div className="space-y-3">
              {p42Program.objekSummaries.map((obj) => {
                const isExpanded = expandedObjek[obj.objekCode] ?? true
                return (
                  <div
                    key={obj.objekCode}
                    className="rounded-2xl bg-subtle/50 border border-border-default overflow-hidden transition-colors"
                  >
                    {/* Head bar */}
                    <div
                      onClick={() => toggleExpand(obj.objekCode)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-subtle transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface text-amber-700 rounded-xl font-mono text-xs font-bold border border-border-default shadow-xs">
                          {obj.objekCode}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-black text-text-primary">{obj.objekLabel}</h5>
                          <span className="text-[10px] text-text-muted">
                            {obj.kategoriSummaries.length} Categories under this Object
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-text-muted block font-mono">
                            Balance: <strong className="text-emerald-600">{formatCurrency(obj.remainingBalance)}</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Allocated: {formatCurrency(obj.totalAllocated)}
                          </span>
                        </div>

                        <div className="p-1 rounded-lg bg-surface border border-border-default text-text-muted">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Table of Sub-categories */}
                    {isExpanded && (
                      <div className="border-t border-border-default bg-surface p-4 space-y-2.5">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-subtle/50 border-b border-border-default text-[10px] uppercase font-bold text-text-muted">
                              <th className="py-2.5 px-3">Category Code</th>
                              <th className="py-2.5 px-3">Description / Equipment Details</th>
                              <th className="py-2.5 px-3 text-right">Allocated</th>
                              <th className="py-2.5 px-3 text-right">Committed / Spent</th>
                              <th className="py-2.5 px-3 text-right">Net Balance</th>
                              <th className="py-2.5 px-3 text-center w-28">% Utilized</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle">
                            {obj.kategoriSummaries.map((kat) => (
                              <tr key={kat.kategoriCode} className="hover:bg-subtle/50">
                                <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                                  {kat.kategoriCode}
                                </td>
                                <td className="py-2.5 px-3 text-text-primary font-semibold">
                                  {kat.kategoriLabel}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-text-secondary font-semibold">
                                  {formatCurrency(kat.totalAllocated)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-amber-600 font-semibold">
                                  {formatCurrency(kat.committedAmount + kat.actualSpent)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                                  {formatCurrency(kat.remainingBalance)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="font-mono text-[11px] font-bold text-text-secondary">
                                    {kat.utilizationRate}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Live Pembangunan Transaction Records (admin_pembangunan) */}
      <div className="bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">
                Development Warrant Records (P42 Ledger)
              </h3>
              <p className="text-[11px] text-text-muted">
                Incoming development warrants & equipment lease contracts
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-text-muted font-bold">{pembangunan.length} Development Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Warrant Doc No.</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Object Code</th>
                <th className="py-2.5 px-3">Category Code</th>
                <th className="py-2.5 px-3">Description / Project Details</th>
                <th className="py-2.5 px-3 text-right">Allocation Amount (RM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pembangunan.map((p) => (
                <tr key={p.id} className="hover:bg-subtle/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-text-primary">{p.document_no}</td>
                  <td className="py-2.5 px-3 text-text-muted">{p.pembangunan_date}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">{p.objek_code}</td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary font-semibold">{p.kategori_code}</td>
                  <td className="py-2.5 px-3 text-text-secondary font-medium">{p.description || '-'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                    {formatCurrency(Number(p.amount) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
