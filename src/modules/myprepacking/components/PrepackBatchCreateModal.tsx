// src/modules/myprepacking/components/PrepackBatchCreateModal.tsx
import React, { useState, useEffect } from 'react'
import { 
  PackageCheck, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  Printer, 
  CheckCircle, 
  Boxes,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem, PrepackBatch } from '../types/prepack'
import { 
  createPrepackBatch, 
  generateNextBatchNumber, 
  calculateDefaultExpiryDate 
} from '../services/prepackService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface PrepackBatchCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (batch: PrepackBatch, shouldOpenPrint: boolean) => void
  items: PrepackItem[]
  preselectedItemId?: string
}

export const PrepackBatchCreateModal: React.FC<PrepackBatchCreateModalProps> = ({
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
  const [batchNumber, setBatchNumber] = useState<string>('')
  const [mfgBatchNumber, setMfgBatchNumber] = useState<string>('')
  const [mfgExpiryDate, setMfgExpiryDate] = useState<string>('')
  const [packDate, setPackDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [prepackExpiryDate, setPrepackExpiryDate] = useState<string>('')
  const [quantityPacked, setQuantityPacked] = useState<number>(200)
  const [wastageQuantity, setWastageQuantity] = useState<number>(0)
  const [packedByName, setPackedByName] = useState<string>('')
  const [verifiedByName, setVerifiedByName] = useState<string>('')
  const [verificationNotes, setVerificationNotes] = useState<string>('')
  const [openPrintAfterSave, setOpenPrintAfterSave] = useState<boolean>(true)
  const [deductFromStoreDirectly, setDeductFromStoreDirectly] = useState<boolean>(false)

  // Only active items can be packaged
  const activeItems = React.useMemo(() => {
    return items.filter(i => i.status !== 'inactive')
  }, [items])

  const selectedItem = activeItems.find(i => i.id === selectedItemId) || items.find(i => i.id === selectedItemId)

  useEffect(() => {
    if (isOpen) {
      const initialItemId = preselectedItemId || (activeItems.length > 0 ? activeItems[0].id : '')
      setSelectedItemId(initialItemId)
      setPackedByName(loggedUser?.full_name || (loggedUser as any)?.name || 'Pharmacy Assistant')
      setVerifiedByName('Supervising Pharmacist')
      setPackDate(new Date().toISOString().split('T')[0])
      setMfgBatchNumber('')
      setMfgExpiryDate('')
      setWastageQuantity(0)
    }
  }, [isOpen, preselectedItemId, items, loggedUser])

  // When selected item or packDate changes, generate next batch number and default quantity
  useEffect(() => {
    if (selectedItem) {
      setQuantityPacked(selectedItem.optimal_batch_size || 200)
      generateNextBatchNumber(selectedItem.pack_type).then(num => {
        setBatchNumber(num)
      })
    }
  }, [selectedItemId, selectedItem])

  // Recalculate prepack expiry when mfgExpiryDate or packDate changes
  useEffect(() => {
    if (mfgExpiryDate && selectedItem) {
      const bud = calculateDefaultExpiryDate(
        packDate, 
        mfgExpiryDate, 
        selectedItem.shelf_life_months || 6
      )
      setPrepackExpiryDate(bud)
    }
  }, [mfgExpiryDate, packDate, selectedItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) {
      toast.error('Please select an item')
      return
    }
    if (!mfgBatchNumber.trim()) {
      toast.error('Manufacturer batch number is required')
      return
    }
    if (!mfgExpiryDate) {
      toast.error('Manufacturer expiry date is required')
      return
    }
    if (!prepackExpiryDate) {
      toast.error('Prepack expiry date (BUD) is required')
      return
    }
    if (quantityPacked <= 0) {
      toast.error('Quantity packed must be greater than 0')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await createPrepackBatch({
        prepack_item_id: selectedItemId,
        batch_number: batchNumber.trim(),
        mfg_batch_number: mfgBatchNumber.trim(),
        mfg_expiry_date: mfgExpiryDate,
        pack_date: packDate,
        prepack_expiry_date: prepackExpiryDate,
        quantity_packed: Number(quantityPacked),
        wastage_quantity: Number(wastageQuantity) || 0,
        packed_by: loggedUser?.id,
        packed_by_name: packedByName.trim(),
        verified_by: loggedUser?.id,
        verified_by_name: verifiedByName.trim(),
        verification_notes: verificationNotes.trim() || undefined
      })

      if (error) throw error

      toast.success(`Batch ${batchNumber} recorded successfully (${quantityPacked} units)!`)
      if (data) {
        onSuccess(data, openPrintAfterSave)
      }
      onClose()
    } catch (err: any) {
      console.error('Error creating batch:', err)
      toast.error(err.message || 'Failed to record prepack batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Packaging Run (Production Run / UOD)"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Selection */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Select Prepack / UOD Item <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          >
            <option value="">-- Please Select Item --</option>
            {activeItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.item_name} [{item.item_code}] - {item.pack_type.toUpperCase()} ({item.dosage_form})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Item Info Callout: 3-Tier Multi-Echelon Balances */}
        {selectedItem && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                <div className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold uppercase">Main Store Balance</div>
                <div className="text-base font-bold font-mono tabular-nums text-sky-700 dark:text-sky-300 mt-0.5">
                  {(selectedItem.store_bulk_stock ?? 0).toLocaleString()} <span className="text-[10px] text-text-muted font-normal">units</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold uppercase">Counter Raw Stock</div>
                <div className="text-base font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300 mt-0.5">
                  {(selectedItem.counter_raw_stock ?? 0).toLocaleString()} <span className="text-[10px] text-text-muted font-normal">units</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Finished Prepack Stock</div>
                <div className="text-base font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {(selectedItem.total_balance ?? 0).toLocaleString()} <span className="text-[10px] text-text-muted font-normal">packs</span>
                </div>
              </div>
            </div>

            {/* Source Deduction Selector */}
            <div className="p-2.5 bg-subtle rounded-lg border border-border-default flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deductStoreDirectly"
                  checked={deductFromStoreDirectly}
                  onChange={e => setDeductFromStoreDirectly(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-border-default focus:ring-teal-500"
                />
                <label htmlFor="deductStoreDirectly" className="text-text-secondary font-medium cursor-pointer">
                  Deduct directly from Main Store (if not yet transferred to counter)
                </label>
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-bold">
                {selectedItem.pack_type === 'uod'
                  ? `Required: ${(quantityPacked * (selectedItem.units_per_pack || 1) + (wastageQuantity || 0)).toLocaleString()} base doses (${quantityPacked} sachets)`
                  : `Required: ${(quantityPacked * (selectedItem.units_per_pack || 1) + (wastageQuantity || 0)).toLocaleString()} base tablet units (${quantityPacked} packs × ${selectedItem.units_per_pack}s)`}
              </div>
            </div>
          </div>
        )}

        {/* Batch Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Prepack Batch No. (Auto / Internal) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={e => setBatchNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UOD-2609-001"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Manufacturer Lot No. (Mfg Lot) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={mfgBatchNumber}
              onChange={e => setMfgBatchNumber(e.target.value.toUpperCase())}
              placeholder="e.g. BX88412"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Dates & Expiry Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Packaging Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={packDate}
              onChange={e => setPackDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Manufacturer Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={mfgExpiryDate}
              onChange={e => setMfgExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">
              Prepack Expiry Date (BUD) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={prepackExpiryDate}
              onChange={e => setPrepackExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border-2 border-teal-500/80 rounded-lg text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
            <span className="text-[10px] text-text-muted">Auto-calculated ({selectedItem?.shelf_life_months || 6} mos max)</span>
          </div>
        </div>

        {/* Quantities & Wastage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              {selectedItem?.pack_type === 'uod'
                ? 'Quantity Successfully Prepared (UOD Sachets)'
                : selectedItem?.pack_type === 'prepack_liquid'
                ? 'Quantity Successfully Packed (Bottles)'
                : selectedItem?.pack_type === 'prepack_cream'
                ? 'Quantity Successfully Packed (Jars / Tubes)'
                : `Quantity Successfully Packed (Packs of ${selectedItem?.units_per_pack || 1}s)`} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantityPacked}
              onChange={e => setQuantityPacked(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-bold font-mono text-base focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
            {selectedItem && (
              <span className="text-[10px] text-text-muted mt-1 block">
                {selectedItem.pack_type === 'uod'
                  ? `${quantityPacked} sachets (${selectedItem.units_per_pack} tablet units per sachet)`
                  : `${quantityPacked} packs × ${selectedItem.units_per_pack} units = ${(quantityPacked * (selectedItem.units_per_pack || 1)).toLocaleString()} base tablets/units`}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Wastage / Defect Units
            </label>
            <input
              type="number"
              min="0"
              value={wastageQuantity}
              onChange={e => setWastageQuantity(parseInt(e.target.value) || 0)}
              placeholder="e.g. 2 damaged foils"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-rose-600 dark:text-rose-400 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500/50"
            />
            <span className="text-[10px] text-text-muted">Damaged tablet/sachet units during packaging process</span>
          </div>
        </div>

        {/* Dual Sign-off verification */}
        <div className="p-3 bg-subtle rounded-lg border border-border-default">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Quality Control & Dual Verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Packed By (Pharmacy Assistant / Staff)
              </label>
              <input
                type="text"
                value={packedByName}
                onChange={e => setPackedByName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Verified & Approved By (Pharmacist)
              </label>
              <input
                type="text"
                value={verifiedByName}
                onChange={e => setVerifiedByName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
            </div>
          </div>
        </div>

        {/* Direct print checkbox prompt */}
        <div className="flex items-center gap-2 p-2.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
          <input
            type="checkbox"
            id="openPrintAfterSave"
            checked={openPrintAfterSave}
            onChange={e => setOpenPrintAfterSave(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-border-default focus:ring-teal-500"
          />
          <label htmlFor="openPrintAfterSave" className="text-xs text-text-secondary font-medium cursor-pointer flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Open Label Studio immediately after saving to print labels for this batch
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="active:scale-[0.98]">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="bg-teal-700 hover:bg-teal-600 active:scale-[0.98]">
            <PackageCheck className="w-4 h-4 mr-1.5" />
            Save Batch Record
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PrepackBatchCreateModal
