// src/modules/myprepacking/components/StoreToCounterTransferModal.tsx
import React, { useState, useEffect } from 'react'
import { ArrowRightLeft, ShieldAlert } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem } from '../types/prepack'
import type { PrepackLedgerItemWithBalances } from '../services/prepackKewPs4Service'
import { recordStoreToCounterTransfer } from '../services/prepackKewPs4Service'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface StoreToCounterTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  items: (PrepackItem | PrepackLedgerItemWithBalances)[]
  preselectedItemId?: string
}

export const StoreToCounterTransferModal: React.FC<StoreToCounterTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  items,
  preselectedItemId
}) => {
  const toast = useToast()
  const loggedUser = useAuthStore(state => state.user)
  const [loading, setLoading] = useState(false)

  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(500)
  const [referenceNo, setReferenceNo] = useState<string>('')
  const [transferredByName, setTransferredByName] = useState<string>('')
  const [receivedByName, setReceivedByName] = useState<string>('')
  const [sourceBatchNo, setSourceBatchNo] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  const activeItems = React.useMemo(() => {
    return items.filter(i => (i as any).status !== 'inactive')
  }, [items])

  const selectedItem = activeItems.find(i => i.id === selectedItemId) as PrepackLedgerItemWithBalances | undefined
  const storeStock = selectedItem?.store_bulk_stock ?? 0
  const counterStock = selectedItem?.counter_raw_stock ?? 0

  useEffect(() => {
    if (isOpen) {
      const initialId = preselectedItemId || (activeItems.length > 0 ? activeItems[0].id : '')
      setSelectedItemId(initialId)
      const currentYear = new Date().getFullYear()
      const randSeq = Math.floor(100 + Math.random() * 900)
      setReferenceNo(`BPPS-${currentYear}/${randSeq}`)
      setTransferredByName(loggedUser?.full_name || (loggedUser as any)?.name || 'Main Store Pharmacist')
      setReceivedByName('Prepack / UOD Counter Officer')
      setRemarks('Bulk stock transfer for UOD & prepacking operations.')
      setQuantity(500)
    }
  }, [isOpen, preselectedItemId, activeItems, loggedUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) {
      toast.error('Please select an item to transfer')
      return
    }
    if (quantity <= 0) {
      toast.error('Transfer quantity must be greater than 0')
      return
    }
    if (storeStock > 0 && quantity > storeStock) {
      toast.error(`Transfer quantity exceeds Main Store balance (${storeStock.toLocaleString()} units available)`)
      return
    }

    setLoading(true)
    try {
      const res = await recordStoreToCounterTransfer({
        prepack_item_id: selectedItemId,
        drug_id: selectedItem?.drug_id,
        quantity_transferred: Number(quantity),
        reference_no: referenceNo.trim(),
        transferred_by: loggedUser?.id,
        transferred_by_name: transferredByName.trim(),
        received_by_name: receivedByName.trim(),
        source_batch_no: sourceBatchNo.trim() || undefined,
        remarks: remarks.trim()
      })

      if (!res.success) throw res.error

      toast.success(`Successfully transferred ${quantity.toLocaleString()} units! Counter balance is now ${(counterStock + quantity).toLocaleString()} units.`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error executing store-to-counter transfer:', err)
      toast.error(err.message || 'Failed to transfer stock from Store to Counter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Transfer: Main Store to Prepack Counter / UOD"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Selector */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Select Medication / Formulation Item <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          >
            <option value="">-- Please Select Medication --</option>
            {activeItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.item_name} [{item.item_code}] - {item.dosage_form}
              </option>
            ))}
          </select>
        </div>

        {/* Live Multi-Echelon Stock Badges */}
        {selectedItem && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-subtle rounded-xl border border-border-default">
            <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
              <div className="text-[10px] uppercase font-semibold text-sky-700 dark:text-sky-300">Main Store Balance (Tier 1)</div>
              <div className="text-lg font-bold font-mono tabular-nums text-sky-700 dark:text-sky-300 mt-0.5">
                {storeStock.toLocaleString()} <span className="text-xs font-normal text-text-muted">units</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">Unpacked Bulk Stock</div>
            </div>

            <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-300">Prepack Counter Balance (Tier 2)</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300 mt-0.5">
                {counterStock.toLocaleString()} <span className="text-xs font-normal text-text-muted">units</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">Raw Materials at Counter</div>
            </div>

            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-300">Finished Prepack Stock (Tier 3)</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 mt-0.5">
                {(selectedItem.finished_packs_stock || selectedItem.total_balance || 0).toLocaleString()} <span className="text-xs font-normal text-text-muted">packs</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">Ready for Distribution</div>
            </div>
          </div>
        )}

        {/* Quantity Transfer & Projected Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Quantity Transferred from Store (Units) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-surface border-2 border-teal-500/80 rounded-lg text-text-primary font-bold font-mono text-base focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
            {storeStock > 0 && quantity > storeStock && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                <ShieldAlert className="w-3 h-3" />
                Exceeds Main Store balance ({storeStock.toLocaleString()} units)!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Reference No. / BPPS Indent Voucher <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value.toUpperCase())}
              placeholder="e.g. BPPS-2026/089"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Projected Outcome Summary */}
        {selectedItem && quantity > 0 && (
          <div className="p-3 bg-teal-500/10 rounded-lg border border-teal-500/20 text-xs text-text-secondary flex items-center justify-between">
            <div>
              <span className="font-semibold text-text-primary">Projected Outcome After Transfer:</span>
              <div className="text-text-muted mt-0.5">
                Store Balance: <span className="font-mono font-bold text-text-primary">{Math.max(0, storeStock - quantity).toLocaleString()}</span> units • 
                New Counter Balance: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{(counterStock + quantity).toLocaleString()}</span> units
              </div>
            </div>
            <ArrowRightLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
        )}

        {/* Officers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Issued By (Store Officer) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={transferredByName}
              onChange={e => setTransferredByName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Received By (Prepack Counter Officer) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={receivedByName}
              onChange={e => setReceivedByName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Optional Source Batch and Remarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Manufacturer Lot / Batch No. (Optional)
            </label>
            <input
              type="text"
              value={sourceBatchNo}
              onChange={e => setSourceBatchNo(e.target.value.toUpperCase())}
              placeholder="e.g. LOT-99482A"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Transaction Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Monthly allocation for UOD prepacking"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="active:scale-[0.98]">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={storeStock > 0 && quantity > storeStock}
            className="bg-teal-700 hover:bg-teal-600 active:scale-[0.98]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-1.5" />
            Confirm Store to Counter Transfer
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StoreToCounterTransferModal
