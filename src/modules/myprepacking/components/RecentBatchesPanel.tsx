// src/modules/myprepacking/components/RecentBatchesPanel.tsx
import React from 'react'
import { PackageCheck, Printer, ArrowRight, Boxes } from 'lucide-react'
import type { PrepackBatch } from '../types/prepack'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface RecentBatchesPanelProps {
  batches: PrepackBatch[]
  loading: boolean
  onPrintLabel: (batch: PrepackBatch) => void
  onViewAllBatches: () => void
}

export const RecentBatchesPanel: React.FC<RecentBatchesPanelProps> = ({
  batches,
  loading,
  onPrintLabel,
  onViewAllBatches
}) => {
  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-xs flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-3 bg-subtle/40">
        <div>
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Recent Prepack Batches</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Verified output ready for ward dispatch or label printing.
          </p>
        </div>

        <button
          onClick={onViewAllBatches}
          className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-medium flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>View All ({batches.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Batches Feed */}
      <div className="divide-y divide-border-subtle max-h-[460px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded bg-subtle" />
                  <Skeleton className="h-3 w-28 rounded bg-subtle" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg bg-subtle" />
              </div>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Boxes className="w-8 h-8 text-text-muted mx-auto opacity-50 mb-1" />
            <h3 className="text-xs font-semibold text-text-secondary">
              No Batches Recorded Yet
            </h3>
            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
              Newly packaged batches will appear here for inspection and thermal label printing.
            </p>
          </div>
        ) : (
          batches.slice(0, 6).map(batch => {
            const percentRemaining = Math.round(
              ((batch.current_balance || 0) / (batch.quantity_packed || 1)) * 100
            )

            return (
              <div
                key={batch.id}
                className="p-3.5 hover:bg-subtle/50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                {/* Batch Identifiers */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-text-primary">
                      {batch.batch_number}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      Mfg: {batch.mfg_batch_number}
                    </span>
                  </div>

                  <div className="font-medium text-text-primary truncate">
                    {batch.prepack_item?.item_name || 'Item'}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-text-muted flex-wrap">
                    <span>
                      BUD: <strong className="text-text-secondary font-mono">{batch.prepack_expiry_date}</strong>
                    </span>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        batch.is_expired
                          ? 'text-rose-600 dark:text-rose-400'
                          : batch.is_near_expiry
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-text-muted'
                      }`}
                    >
                      {batch.days_to_expiry !== undefined
                        ? batch.days_to_expiry < 0
                          ? 'Expired'
                          : `${batch.days_to_expiry}d left`
                        : ''}
                    </span>
                  </div>
                </div>

                {/* Stock Quantity & Label Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-bold tabular-nums text-text-primary">
                      {batch.current_balance} / {batch.quantity_packed}
                    </div>
                    <div className="text-[9px] text-text-muted font-medium">
                      {percentRemaining}% stock
                    </div>
                  </div>

                  <button
                    onClick={() => onPrintLabel(batch)}
                    title="Print Thermal / Sheet Label"
                    className="px-2.5 py-1.5 bg-subtle hover:bg-muted-surface text-text-secondary hover:text-text-primary active:scale-[0.98] border border-border-subtle rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-text-muted" />
                    <span className="hidden sm:inline">Print</span>
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

export default RecentBatchesPanel
