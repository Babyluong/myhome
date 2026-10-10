// src/modules/myprepacking/components/CriticalPrepackQueue.tsx
import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Boxes,
  Plus,
  ArrowRight,
  XCircle,
  Layers
} from 'lucide-react'
import type { PrepackItem } from '../types/prepack'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface CriticalPrepackQueueProps {
  items: PrepackItem[]
  loading: boolean
  onPackNow: (itemId: string) => void
  onViewCatalog: () => void
}

export const CriticalPrepackQueue: React.FC<CriticalPrepackQueueProps> = ({
  items,
  loading,
  onPackNow,
  onViewCatalog
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Items currently at or below minimum safety buffer level
  const urgentItems = useMemo(() => {
    return items.filter(item => (item.total_balance ?? 0) <= item.min_buffer_level)
  }, [items])

  // Filtered and priority-sorted items
  const filteredItems = useMemo(() => {
    let result = [...urgentItems]

    if (categoryFilter !== 'all') {
      result = result.filter(item => {
        if (categoryFilter === 'uod') return item.pack_type === 'uod'
        if (categoryFilter === 'internal') return item.pack_type === 'internal'
        if (categoryFilter === 'external') return item.pack_type === 'external'
        return true
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        item =>
          item.item_name.toLowerCase().includes(q) ||
          item.item_code.toLowerCase().includes(q) ||
          (item.generic_name && item.generic_name.toLowerCase().includes(q))
      )
    }

    // Sort order: completely depleted first, then lowest stock percentage
    return result.sort((a, b) => {
      const aBal = a.total_balance ?? 0
      const bBal = b.total_balance ?? 0
      if (aBal === 0 && bBal > 0) return -1
      if (bBal === 0 && aBal > 0) return 1
      const aRatio = aBal / (a.min_buffer_level || 1)
      const bRatio = bBal / (b.min_buffer_level || 1)
      return aRatio - bRatio
    })
  }, [urgentItems, categoryFilter, searchQuery])

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-xs flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-subtle/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Critical Prepack Work Queue</span>
            </h2>
            {!loading && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {urgentItems.length} Urgent
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Medications requiring packaging sessions to replenish ward safety buffers.
          </p>
        </div>

        <button
          onClick={onViewCatalog}
          className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-medium flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Repack Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-surface">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medication or code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-subtle border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Urgent' },
            { id: 'uod', label: 'UOD' },
            { id: 'internal', label: 'Internal' },
            { id: 'external', label: 'External' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-subtle text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="divide-y divide-border-subtle max-h-[460px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-52 rounded bg-subtle" />
                  <Skeleton className="h-3 w-32 rounded bg-subtle" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg bg-subtle" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            {urgentItems.length === 0 ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  All Buffer Levels Healthy
                </h3>
                <p className="text-xs text-text-muted max-w-sm mt-0.5">
                  No standard formulations are currently below their minimum safety threshold.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Boxes className="w-8 h-8 text-text-muted mb-2 opacity-60" />
                <h3 className="text-xs font-semibold text-text-secondary">
                  No matching items found
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Try adjusting your search query or category filter.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredItems.map(item => {
            const currentStock = item.total_balance ?? 0
            const bufferLevel = item.min_buffer_level || 1
            const percentMet = Math.min(100, Math.round((currentStock / bufferLevel) * 100))
            const isStockout = currentStock === 0
            const availableRawStock = (item.store_bulk_stock ?? 0) + (item.counter_raw_stock ?? 0)
            const hasRawMaterial = availableRawStock > 0

            return (
              <div
                key={item.id}
                className="p-3.5 hover:bg-subtle/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Item Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-text-primary truncate">
                      {item.item_name}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-subtle text-text-secondary border border-border-subtle">
                      {item.item_code}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded uppercase bg-subtle text-text-secondary border border-border-subtle">
                      {item.pack_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap">
                    <span>{item.dosage_form}</span>
                    <span>•</span>
                    <span>{item.package_type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-text-muted" />
                      <span>Std Batch: {item.optimal_batch_size || 50} units</span>
                    </span>
                  </div>

                  {/* Raw Material Readiness */}
                  <div className="pt-1 flex items-center gap-2">
                    {hasRawMaterial ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Raw Material: {availableRawStock} in store</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <span>Raw Material Empty</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Level & Action */}
                <div className="flex items-center gap-4 shrink-0 sm:self-center">
                  <div className="text-right min-w-[90px]">
                    <div className="flex items-baseline justify-end gap-1">
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${
                          isStockout
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {currentStock}
                      </span>
                      <span className="text-xs text-text-muted">/ {bufferLevel}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-subtle h-1.5 rounded-full overflow-hidden mt-1 border border-border-subtle">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isStockout
                            ? 'bg-rose-500'
                            : percentMet < 50
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${percentMet}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-text-muted font-medium">
                      {isStockout ? 'Stockout' : `${percentMet}% of buffer`}
                    </span>
                  </div>

                  {/* Pack Now CTA */}
                  <button
                    onClick={() => onPackNow(item.id)}
                    className="min-h-[34px] px-3 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-teal-500/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pack Now</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CriticalPrepackQueue
