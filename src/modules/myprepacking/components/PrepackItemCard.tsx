// src/modules/myprepacking/components/PrepackItemCard.tsx
import React from 'react'
import { BookOpen, Edit2, Plus } from 'lucide-react'
import type { PrepackItem } from '../types/prepack'
import { formatUnitQuantityDisplay } from '../services/prepackService'

interface PrepackItemCardProps {
  item: PrepackItem
  isActive: boolean
  isToggling: boolean
  onToggleStatus: (item: PrepackItem) => void
  onItemClick: (item: PrepackItem) => void
  onStartBatch?: (item: PrepackItem) => void
  onEditItem?: (item: PrepackItem) => void
  renderCategoryBadge: (item: PrepackItem) => React.ReactNode
}

export const PrepackItemCard: React.FC<PrepackItemCardProps> = ({
  item,
  isActive,
  isToggling,
  onToggleStatus,
  onItemClick,
  onStartBatch,
  onEditItem,
  renderCategoryBadge,
}) => {
  const balance = item.total_balance ?? 0
  const buffer = item.min_buffer_level
  const isLow = balance <= buffer
  const isCritical = balance === 0
  const isMonograph = item.pack_type === 'internal' || item.pack_type === 'external'

  const formatPackagingText = () => {
    if (item.pack_type === 'uod') {
      return `${(item.package_type || 'sachet').replace('_', ' ')} • ${formatUnitQuantityDisplay(item.units_per_pack || 1)} dose (UOD)`
    }
    if (item.pack_type === 'prepack_liquid' || item.dosage_form === 'syrup' || item.dosage_form === 'suspension') {
      return `${(item.package_type || 'bottle').replace('_', ' ')} • ${item.units_per_pack} ml/bottle`
    }
    if (item.pack_type === 'prepack_cream' || item.dosage_form === 'cream' || item.dosage_form === 'ointment') {
      return `${(item.package_type || 'container').replace('_', ' ')} • ${item.units_per_pack} g/container`
    }
    return `${(item.package_type || 'sachet').replace('_', ' ')} • Pack of ${item.units_per_pack} (${item.units_per_pack} units/pack)`
  }

  return (
    <div className={`p-4 space-y-3 transition-colors ${!isActive ? 'bg-subtle/30 opacity-75' : 'bg-surface'}`}>
      {/* Top Header: Code, Badges & Facility Activation Switch */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold shrink-0">
            {item.item_code}
          </span>
          {renderCategoryBadge(item)}
          {isMonograph && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded shrink-0">
              <BookOpen className="w-2.5 h-2.5" />
              <span>SOP</span>
            </span>
          )}
        </div>

        {/* Facility Active Toggle Switch */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            disabled={isToggling}
            onClick={() => onToggleStatus(item)}
            title={isActive ? 'Deactivate for facility' : 'Activate for facility'}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              isActive ? 'bg-teal-700 hover:bg-teal-600' : 'bg-subtle border border-border-default'
            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-xs ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            isActive ? 'text-teal-600 dark:text-teal-400' : 'text-text-muted'
          }`}>
            {isActive ? 'Active' : 'Off'}
          </span>
        </div>
      </div>

      {/* Item Name & Generic */}
      <div>
        <button
          type="button"
          onClick={() => onItemClick(item)}
          className="text-left font-bold text-text-primary text-sm hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-start gap-1.5 group cursor-pointer w-full"
        >
          <span className="group-hover:underline">{item.item_name}</span>
          {!isMonograph && (
            <Edit2 className="w-3 h-3 text-text-muted shrink-0 mt-1 opacity-60 group-hover:opacity-100" />
          )}
        </button>
        {item.generic_name && (
          <div className="text-[11px] text-text-muted mt-0.5">
            Gen: {item.generic_name}
          </div>
        )}
      </div>

      {/* Form, Packaging Specs & Stock Status */}
      <div className="bg-subtle/50 rounded-lg p-2.5 border border-border-subtle flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs text-text-primary capitalize truncate">
            {item.dosage_form} {item.strength ? `(${item.strength})` : ''}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5 truncate capitalize">
            {formatPackagingText()}
          </div>
        </div>

        <div className="shrink-0">
          {!isActive ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-subtle text-text-muted border border-border-subtle">
              Inactive
            </span>
          ) : isCritical ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-500 border border-red-500/30">
              Out of Stock
            </span>
          ) : isLow ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
              Needs Repack
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Optimal
            </span>
          )}
        </div>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-subtle/40 rounded-lg p-2 border border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase font-semibold block">Current Balance</span>
          <span className={`font-mono text-base font-black block tabular-nums ${
            !isActive ? 'text-text-muted' : isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {balance.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted block">
            {item.active_batches_count || 0} active batches
          </span>
        </div>

        <div className="bg-subtle/40 rounded-lg p-2 border border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase font-semibold block">Buffer Threshold</span>
          <span className="font-mono text-base font-bold text-text-secondary block tabular-nums">
            {buffer} units
          </span>
          <span className="text-[10px] text-text-muted block">
            Opt: {item.optimal_batch_size || 50} units
          </span>
        </div>
      </div>

      {/* Action Footer */}
      {isMonograph ? (
        <button
          type="button"
          onClick={() => onItemClick(item)}
          className="w-full py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 active:scale-[0.98] text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Preparation Monograph (SOP)</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 pt-0.5">
          {onStartBatch && (
            <button
              type="button"
              onClick={() => onStartBatch(item)}
              className="flex-1 py-1.5 px-3 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Batch</span>
            </button>
          )}
          {onEditItem && (
            <button
              type="button"
              onClick={() => onEditItem(item)}
              className="py-1.5 px-3 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary border border-border-default hover:border-border-strong rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
