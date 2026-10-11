// src/modules/myperolehan/pages/tabs/PengurusanBudgetTab.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Plus,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react'
import { BudgetProgressBar } from '../../components/BudgetProgressBar'
import type {
  BudgetHierarchySummary,
  AdminWarrant
} from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface PengurusanBudgetTabProps {
  hierarchy: BudgetHierarchySummary[]
  warrants: AdminWarrant[]
  onOpenAddWarrant: () => void
  onOpenCreatePO: (programCode?: string) => void
}

export const PengurusanBudgetTab: React.FC<PengurusanBudgetTabProps> = ({
  hierarchy,
  warrants,
  onOpenAddWarrant,
  onOpenCreatePO
}) => {
  const [selectedProgram, setSelectedProgram] = useState<'all' | '020200' | '022300'>('all')
  const [expandedObjek, setExpandedObjek] = useState<Record<string, boolean>>({})

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

  const pengurusanPrograms = hierarchy.filter((h) => h.budgetType === 'warrant')

  const filteredPrograms = pengurusanPrograms.filter((p) => {
    if (selectedProgram === 'all') return true
    return p.programCode === selectedProgram
  })

  return (
    <div className="space-y-6">
      {/* 1. Header Navigation & Program Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-text-primary">Operating Budget (MOH Warrants)</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20">
                OPERATIONAL BUDGET
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Monitoring operating allocations & healthcare expenditures for Lawas Hospital
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenAddWarrant}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm text-xs rounded-xl px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Inflow Warrant</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenCreatePO('020200')}
            className="border-border-default bg-surface hover:bg-subtle/50 text-text-secondary font-bold text-xs rounded-xl px-4 py-2 shadow-sm"
          >
            + Create Operating PO
          </Button>
        </div>
      </div>

      {/* Program Code Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          onClick={() => setSelectedProgram('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedProgram === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary bg-surface border border-border-default'
          }`}
        >
          All Programs ({pengurusanPrograms.length})
        </button>
        <button
          onClick={() => setSelectedProgram('020200')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedProgram === '020200'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary bg-surface border border-border-default'
          }`}
        >
          020200 - Hospital Management
        </button>
        <button
          onClick={() => setSelectedProgram('022300')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedProgram === '022300'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary bg-surface border border-border-default'
          }`}
        >
          022300 - Dietetics & Food Services
        </button>
      </div>

      {/* 2. Detailed Program Breakdown Cards */}
      <div className="space-y-6">
        {filteredPrograms.map((prog) => (
          <motion.div
            key={prog.programCode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-6"
          >
            {/* Program Header KPI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 text-xs font-black font-mono rounded-lg border border-blue-500/20">
                    CODE {prog.programCode}
                  </span>
                  <h3 className="text-lg font-black text-text-primary">{prog.programLabel}</h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Original Allocation + Additional MOH Warrants (Current Fiscal Year)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-subtle/50 p-3.5 rounded-2xl border border-border-default text-center">
                <div className="px-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Allocation</span>
                  <span className="text-sm font-black text-text-primary font-mono">{formatCurrency(prog.totalAllocated)}</span>
                </div>
                <div className="px-3 border-x border-border-default">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Committed & Spent</span>
                  <span className="text-sm font-black text-amber-600 font-mono">
                    {formatCurrency(prog.committedAmount + prog.actualSpent)}
                  </span>
                </div>
                <div className="px-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Balance</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">
                    {formatCurrency(prog.remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress for Program */}
            <BudgetProgressBar
              utilizationRate={prog.utilizationRate}
              spentAmount={prog.committedAmount + prog.actualSpent}
              totalAmount={prog.totalAllocated}
              height="h-2.5"
            />

            {/* Objek & Kategori Nested Accordions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Object & Category Breakdown ({prog.objekSummaries.length} Object Codes)
              </h4>

              <div className="space-y-3">
                {prog.objekSummaries.map((obj) => {
                  const isExpanded = expandedObjek[obj.objekCode] ?? true
                  return (
                    <div
                      key={obj.objekCode}
                      className="rounded-2xl bg-subtle/50 border border-border-default overflow-hidden transition-colors"
                    >
                      {/* Objek Head Bar */}
                      <div
                        onClick={() => toggleExpand(obj.objekCode)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-subtle transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface text-indigo-600 rounded-xl font-mono text-xs font-bold border border-border-default shadow-xs">
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

                      {/* Expanded Kategori Table */}
                      {isExpanded && (
                        <div className="border-t border-border-default bg-surface p-4 space-y-2.5">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-subtle/50 border-b border-border-default text-[10px] uppercase font-bold text-text-muted">
                                <th className="py-2.5 px-3">Category Code</th>
                                <th className="py-2.5 px-3">Description / Details</th>
                                <th className="py-2.5 px-3 text-right">Allocated</th>
                                <th className="py-2.5 px-3 text-right">Committed / Spent</th>
                                <th className="py-2.5 px-3 text-right">Net Balance</th>
                                <th className="py-2.5 px-3 text-center w-28">% Utilized</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                              {obj.kategoriSummaries.map((kat) => (
                                <tr key={kat.kategoriCode} className="hover:bg-subtle/50">
                                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                                    {kat.kategoriCode}
                                  </td>
                                  <td className="py-2.5 px-3 text-text-primary">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{kat.kategoriLabel}</span>
                                      {kat.isShared && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-purple-700 border border-indigo-500/20 font-bold">
                                          SHARED POOL
                                        </span>
                                      )}
                                    </div>
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
        ))}
      </div>

      {/* 3. Live Waran Inflow Ledger (admin_warrants) */}
      <div className="bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">Received Warrant Allocation Ledger</h3>
              <p className="text-[11px] text-text-muted">Official incoming fund inflows recorded from MOH</p>
            </div>
          </div>
          <span className="text-xs font-mono text-text-muted font-bold">{warrants.length} Warrant Documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Warrant Doc No.</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Program / Activity</th>
                <th className="py-2.5 px-3">Vote / Object Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Warrant Amount (RM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {warrants.map((w) => (
                <tr key={w.id} className="hover:bg-subtle/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-text-primary">{w.document_no}</td>
                  <td className="py-2.5 px-3 text-text-muted">{w.warrant_date}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">{w.vote_activity || w.program_code}</td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary font-semibold">{w.vote_code || w.objek_code}</td>
                  <td className="py-2.5 px-3 text-text-secondary font-medium">{w.description || '-'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">
                    {formatCurrency(Number(w.amount) || 0)}
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
