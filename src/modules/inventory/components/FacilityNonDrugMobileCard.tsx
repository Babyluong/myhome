// src/modules/inventory/components/FacilityNonDrugMobileCard.tsx
import React from 'react'
import { Trash2, Edit3, Package, ChevronRight } from 'lucide-react'
import type { FacilityNonDrugItem } from '@/services/pharmacy/facilityNonDrugInventoryService'

interface FacilityNonDrugMobileCardProps {
  item: FacilityNonDrugItem
  onOpenEdit: (item: FacilityNonDrugItem) => void
  onDelete: (itemId: string, itemName: string, e: React.MouseEvent) => void
}

export const FacilityNonDrugMobileCard: React.FC<FacilityNonDrugMobileCardProps> = ({
  item,
  onOpenEdit,
  onDelete,
}) => {
  const code = item.item_code || item.sku || '-'
  const priceVal = item.price ?? ('unit_price' in item && typeof item.unit_price === 'number' ? item.unit_price : undefined) ?? 0
  const batchNo = item.batch_number || item.batch_no || '-'
  const expDate = item.expiry_date || item.exp_date || '-'
  const stockVal = item.facility_stock ?? 0
  const isOutOfStock = stockVal <= 0
  const uom = item.unit_of_measure || ('uom' in item && typeof item.uom === 'string' ? item.uom : undefined) || 'PACK'

  return (
    <div
      className="bg-surface hover:bg-subtle/40 border border-border-default rounded-xl p-3.5 space-y-3 transition-colors shadow-xs"
    >
      {/* Top Header: Code, Badges, Status & Delete Action */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-mono text-[10px] font-bold text-accent-base bg-accent-base/10 px-2 py-0.5 rounded border border-accent-base/20 shrink-0">
            {code}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 uppercase">
            {(item.procurement_vote || 'APPL').toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Aktif
          </span>
          <button
            type="button"
            onClick={(e) => onDelete(item.id, item.item_name, e)}
            className="p-2 rounded-md text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2"
            aria-label={`Padam ${item.item_name} daripada inventori fasiliti`}
            title="Padam daripada inventori fasiliti"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Item Name & Packaging */}
      <div>
        <h4 className="font-semibold text-sm text-text-primary leading-snug line-clamp-2">
          {item.item_name}
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-text-secondary mt-1">
          <Package className="w-3 h-3 text-text-muted shrink-0" />
          <span className="uppercase text-text-muted font-medium shrink-0">{uom}</span>
          {item.packaging_description && (
            <>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted truncate">{item.packaging_description}</span>
            </>
          )}
        </div>
      </div>

      {/* Clinical Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 bg-subtle/50 rounded-lg p-2.5 border border-border-subtle text-xs">
        {/* Current Stock */}
        <div>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            Stok Fasiliti
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-mono text-sm font-bold tabular-nums ${isOutOfStock ? 'text-rose-400' : 'text-text-primary'}`}>
              {stockVal}
            </span>
            <span className="text-[10px] text-text-muted uppercase font-medium">{uom}</span>
          </div>
        </div>

        {/* Unit Price */}
        <div>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            Harga Unit
          </span>
          <div className="font-mono text-sm font-bold text-text-primary tabular-nums mt-0.5">
            RM {priceVal.toFixed(2)}
          </div>
        </div>

        {/* Batch Number */}
        <div className="pt-1.5 border-t border-border-subtle">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            No. Batch
          </span>
          <span className="font-mono text-[11px] text-text-secondary font-medium truncate block mt-0.5">
            {batchNo}
          </span>
        </div>

        {/* Expiry Date */}
        <div className="pt-1.5 border-t border-border-subtle">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            Tarikh Luput
          </span>
          <span className={`font-mono text-[11px] font-medium truncate block mt-0.5 ${
            expDate !== '-' ? 'text-amber-400' : 'text-text-muted'
          }`}>
            {expDate}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Tap Action Hint */}
      <button
        type="button"
        onClick={() => onOpenEdit(item)}
        aria-label={`Kemas kini stok dan lokasi ${item.item_name}`}
        className="w-full flex items-center justify-between py-2 rounded-md text-[11px] text-text-muted transition-colors duration-200 hover:bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2"
      >
        <span className="flex items-center gap-1 text-accent-base font-medium">
          <Edit3 className="w-3 h-3" />
          Kemas kini stok & lokasi
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
      </button>
    </div>
  )
}
