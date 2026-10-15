// src/modules/myprepacking/pages/PrepackReportsPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { FileSpreadsheet, FileDown, BarChart3, Building, Boxes, PackageCheck, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  getPrepackItems,
  getPrepackBatches,
  getPrepackUsageLogs,
  exportPrepackReportExcel,
  generatePrepackPdfReport
} from '../services/prepackService'
import type { PrepackItem, PrepackBatch, PrepackUsageLog } from '../types/prepack'
import { useToast } from '@/stores/toastStore'

export const PrepackReportsPage: React.FC = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PrepackItem[]>([])
  const [batches, setBatches] = useState<PrepackBatch[]>([])
  const [usageLogs, setUsageLogs] = useState<PrepackUsageLog[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [itemsRes, batchesRes, usageRes] = await Promise.all([
        getPrepackItems(),
        getPrepackBatches(),
        getPrepackUsageLogs(undefined, 500)
      ])
      setItems(itemsRes.data || [])
      setBatches(batchesRes.data || [])
      setUsageLogs(usageRes.data || [])
    } catch (err: any) {
      console.error('Error loading reports data:', err)
      toast.error('Failed to load prepacking report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Aggregate stats
  const totalUnitsPacked = useMemo(() => {
    return batches.reduce((acc, b) => acc + (b.quantity_packed || 0), 0)
  }, [batches])

  const totalUnitsDistributed = useMemo(() => {
    return usageLogs.reduce((acc, u) => acc + (u.quantity || 0), 0)
  }, [usageLogs])

  const totalWastageUnits = useMemo(() => {
    return batches.reduce((acc, b) => acc + (b.wastage_quantity || 0), 0)
  }, [batches])

  const packagingEfficiencyRate = useMemo(() => {
    const totalAttempted = totalUnitsPacked + totalWastageUnits
    if (totalAttempted === 0) return 100
    return Math.round((totalUnitsPacked / totalAttempted) * 1000) / 10
  }, [totalUnitsPacked, totalWastageUnits])

  // Consumption by ward
  const wardUsageMap = useMemo(() => {
    const map: Record<string, number> = {}
    usageLogs.forEach(log => {
      const ward = log.ward_name || 'Lain-lain'
      map[ward] = (map[ward] || 0) + (log.quantity || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [usageLogs])

  // Top packed items
  const itemPackingMap = useMemo(() => {
    const map: Record<string, { name: string; type: string; totalPacked: number; batchesCount: number }> = {}
    batches.forEach(b => {
      const name = b.prepack_item?.item_name || 'Item'
      const type = b.prepack_item?.pack_type || 'uod'
      if (!map[name]) {
        map[name] = { name, type, totalPacked: 0, batchesCount: 0 }
      }
      map[name].totalPacked += b.quantity_packed || 0
      map[name].batchesCount += 1
    })
    return Object.values(map).sort((a, b) => b.totalPacked - a.totalPacked)
  }, [batches])

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Prepacking Statistics &amp; Analytics Reports
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                Analysis of packaging &amp; UOD output, packaging yield efficiency, hospital ward utilization, and expired stock audits.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => exportPrepackReportExcel(items, batches, usageLogs)}
              className="min-h-[36px] px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => generatePrepackPdfReport(items, batches, usageLogs)}
              className="min-h-[36px] px-3.5 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-primary border border-border-default hover:border-border-strong rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-text-muted" />
              <span>Official PDF Report</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh Reports Data"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors cursor-pointer shadow-xs flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Units Packaged</span>
            <PackageCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
            {totalUnitsPacked.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">
            From {batches.length} packaging batch sessions
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Ward Consumption</span>
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
            {totalUnitsDistributed.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">
            Units distributed to wards &amp; outpatient
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Yield Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums tracking-tight mt-1">
            {packagingEfficiencyRate}%
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">
            Damage-free packaging efficiency
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Damaged Units (Wastage)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500 font-mono tabular-nums tracking-tight mt-1">
            {totalWastageUnits}
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">
            Damaged sachets/foils during packaging
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ward Consumption Ranking */}
        <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Prepack &amp; UOD Consumption by Ward</span>
          </h2>

          {wardUsageMap.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-lg">
              No ward consumption data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {wardUsageMap.map(([ward, qty]) => {
                const percentage = totalUnitsDistributed > 0 ? Math.round((qty / totalUnitsDistributed) * 100) : 0
                return (
                  <div key={ward} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-primary">{ward}</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400 tabular-nums">{qty.toLocaleString()} unit ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-subtle h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-colors duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Repacked Formulations */}
        <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Packaging Productivity by Item</span>
          </h2>

          {itemPackingMap.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-lg">
              No drug packaging records recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {itemPackingMap.slice(0, 7).map(item => {
                const percentage = totalUnitsPacked > 0 ? Math.round((item.totalPacked / totalUnitsPacked) * 100) : 0
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-primary truncate max-w-[200px]">{item.name}</span>
                      <span className="font-mono text-text-muted tabular-nums">{item.totalPacked.toLocaleString()} unit ({item.batchesCount} batch)</span>
                    </div>
                    <div className="w-full bg-subtle h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-colors duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrepackReportsPage
