// src/modules/myprepacking/components/PrepackBatchCard.tsx
import React from 'react'
import { Printer, Send, ShieldCheck } from 'lucide-react'
import type { PrepackBatch } from '../types/prepack'

interface PrepackBatchCardProps {
  batch: PrepackBatch
  onPrintLabel: (batch: PrepackBatch) => void
  onIssueStock?: (batch: PrepackBatch) => void
}

export const PrepackBatchCard: React.FC<PrepackBatchCardProps> = ({
  batch,
  onPrintLabel,
  onIssueStock,
}) => {
  const isDepleted = batch.current_balance === 0 || batch.status === 'depleted'
  const isExpired = !!batch.is_expired
  const isNearExpiry = !!batch.is_near_expiry

  return (
    <div className="p-4 space-y-3 bg-surface transition-colors hover:bg-subtle/30">
      {/* Header: Batch No, Pack Time & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
            {batch.batch_number}
          </div>
          <div className="text-[10px] text-text-muted font-mono mt-0.5">
            Packed {batch.pack_date} • {new Date(batch.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
          isDepleted
            ? 'bg-subtle text-text-muted border border-border-subtle'
            : isExpired
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            : isNearExpiry
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
        }`}>
          {isDepleted ? 'Depleted' : isExpired ? 'Expired' : isNearExpiry ? 'Near Expiry' : 'Active'}
        </span>
      </div>

      {/* Item Name & Details */}
      <div className="bg-subtle/40 rounded-lg p-2.5 border border-border-subtle">
        <div className="font-bold text-xs text-text-primary">
          {batch.prepack_item?.item_name || 'Item'}
        </div>
        <div className="text-[11px] text-text-muted mt-0.5 capitalize">
          {batch.prepack_item?.dosage_form} • {batch.prepack_item?.package_type}
        </div>
      </div>

      {/* Data Grid: Balance, Mfg Lot, Expiry BUD */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-subtle/30 rounded-lg p-2 border border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase font-semibold block">Balance / Packed</span>
          <span className="font-mono text-sm font-black text-text-primary block tabular-nums">
            {batch.current_balance} / {batch.quantity_packed}
          </span>
          {batch.wastage_quantity > 0 && (
            <span className="text-[10px] text-rose-500 font-mono block">
              Wastage: {batch.wastage_quantity}
            </span>
          )}
        </div>

        <div className="bg-subtle/30 rounded-lg p-2 border border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase font-semibold block">Expiry BUD</span>
          <span className="font-mono text-xs font-bold text-text-primary block">
            {batch.prepack_expiry_date}
          </span>
          <span className={`text-[10px] font-medium block ${
            isExpired ? 'text-rose-500 font-bold' : isNearExpiry ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {batch.days_to_expiry !== undefined 
              ? batch.days_to_expiry < 0 
                ? 'Expired' 
                : `${batch.days_to_expiry} days left` 
              : ''}
          </span>
        </div>
      </div>

      {/* Mfg Lot & Officers */}
      <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
        <div className="font-mono text-[10px] text-text-muted truncate">
          Mfg Lot: <span className="text-text-primary font-semibold">{batch.mfg_batch_number}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted shrink-0">
          <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>{batch.verified_by_name || 'QA Verified'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
        <button
          type="button"
          onClick={() => onPrintLabel(batch)}
          className="flex-1 py-1.5 px-3 bg-surface hover:bg-subtle text-text-primary border border-border-default hover:border-border-strong rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-text-muted" />
          <span>Print Label</span>
        </button>

        {batch.current_balance > 0 && onIssueStock && (
          <button
            type="button"
            onClick={() => onIssueStock(batch)}
            className="flex-1 py-1.5 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Issue Stock</span>
          </button>
        )}
      </div>
    </div>
  )
}
