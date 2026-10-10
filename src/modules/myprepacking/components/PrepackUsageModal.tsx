// src/modules/myprepacking/components/PrepackUsageModal.tsx
import React, { useState, useEffect } from 'react'
import { Send, Building, FileText, User, AlertCircle, ArrowDownCircle } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem, PrepackBatch, UsageTransactionType } from '../types/prepack'
import { recordPrepackUsage, getPrepackBatches } from '../services/prepackService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface PrepackUsageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  items: PrepackItem[]
  preselectedBatch?: PrepackBatch | null
}

const COMMON_WARDS = [
  'Male Ward (Medical & Surgical)',
  'Female Ward (Medical & Surgical)',
  'Paediatric Ward',
  'Maternity Ward',
  'Emergency & Trauma Department (ETD)',
  'Intensive Care Unit (ICU)',
  'Outpatient Pharmacy (OPD)',
  'Inpatient Pharmacy',
  'Lawas Specialist Clinic',
  'Hemodialysis Centre',
  'Operating Theatre (OT)'
]

export const PrepackUsageModal: React.FC<PrepackUsageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  items,
  preselectedBatch
}) => {
  const toast = useToast()
  const loggedUser = useAuthStore(state => state.user)
  const [loading, setLoading] = useState(false)

  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [batches, setBatches] = useState<PrepackBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [transactionType, setTransactionType] = useState<UsageTransactionType>('ward_supply')
  const [quantity, setQuantity] = useState<number>(10)
  const [wardName, setWardName] = useState<string>(COMMON_WARDS[0])
  const [customWard, setCustomWard] = useState<string>('')
  const [recipientName, setRecipientName] = useState<string>('')
  const [referenceNo, setReferenceNo] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      if (preselectedBatch) {
        setSelectedItemId(preselectedBatch.prepack_item_id)
        setSelectedBatchId(preselectedBatch.id)
        setQuantity(Math.min(10, preselectedBatch.current_balance || 1))
      } else if (items.length > 0) {
        setSelectedItemId(items[0].id)
      }
    }
  }, [isOpen, preselectedBatch, items])

  // Load batches for selected item
  useEffect(() => {
    if (selectedItemId) {
      getPrepackBatches(undefined, { itemId: selectedItemId, status: 'active' }).then(res => {
        const activeList = (res.data || []).filter(b => b.current_balance > 0)
        setBatches(activeList)
        if (activeList.length > 0 && !preselectedBatch) {
          // Default to oldest unexpired batch (FIFO principle!)
          setSelectedBatchId(activeList[0].id)
        }
      })
    }
  }, [selectedItemId, preselectedBatch])

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || preselectedBatch
  const selectedItem = items.find(i => i.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || !selectedBatchId) {
      toast.error('Please select prepack item and batch')
      return
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }
    if (selectedBatch && quantity > selectedBatch.current_balance) {
      toast.error(`Quantity exceeds batch balance (${selectedBatch.current_balance} units available)`)
      return
    }

    const finalWard = wardName === 'Other' || wardName === 'Lain-lain' ? customWard.trim() : wardName

    setLoading(true)
    try {
      const res = await recordPrepackUsage({
        batch_id: selectedBatchId,
        prepack_item_id: selectedItemId,
        transaction_type: transactionType,
        quantity: Number(quantity),
        ward_name: finalWard || undefined,
        recipient_name: recipientName.trim() || undefined,
        reference_no: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
        issued_by: loggedUser?.id,
        issued_by_name: loggedUser?.full_name || (loggedUser as any)?.name
      })

      if (!res.success) throw res.error

      toast.success(`Successfully recorded issuance of ${quantity} units to ${finalWard}!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error recording usage:', err)
      toast.error(err.message || 'Failed to record usage transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Counter Dispensing / Prescription Issuance"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Selector */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Select Prepack Item <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            disabled={!!preselectedBatch}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          >
            <option value="">-- Select Item --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.item_name} [{item.item_code}]
              </option>
            ))}
          </select>
        </div>

        {/* Batch Selector (FIFO highlighted) */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Select Issuance Batch (FIFO) <span className="text-rose-500">*</span>
          </label>
          {batches.length === 0 && !preselectedBatch ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400">
              No active batches with stock balance available for this item.
            </div>
          ) : (
            <select
              required
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            >
              {batches.map((b, idx) => (
                <option key={b.id} value={b.id}>
                  {b.batch_number} • Balance: {b.current_balance} units • Exp: {b.prepack_expiry_date} {idx === 0 ? '(Recommended - FIFO)' : ''}
                </option>
              ))}
              {preselectedBatch && !batches.some(b => b.id === preselectedBatch.id) && (
                <option value={preselectedBatch.id}>
                  {preselectedBatch.batch_number} • Balance: {preselectedBatch.current_balance} units • Exp: {preselectedBatch.prepack_expiry_date}
                </option>
              )}
            </select>
          )}
        </div>

        {/* Batch Stock Indicator */}
        {selectedBatch && (
          <div className="p-2.5 bg-subtle rounded-lg border border-border-default flex items-center justify-between text-xs">
            <span className="text-text-muted">Available Balance in Batch:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400 font-mono text-sm">{selectedBatch.current_balance} Units</span>
          </div>
        )}

        {/* Transaction Type & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Issuance Type
            </label>
            <select
              value={transactionType}
              onChange={e => setTransactionType(e.target.value as UsageTransactionType)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            >
              <option value="ward_supply">Ward Indent Supply</option>
              <option value="inpatient_trolley">Ward Unit Dose Trolley (UOD)</option>
              <option value="outpatient_dispense">Outpatient Dispensing (OPD)</option>
              <option value="stock_adjustment">Physical Stock Adjustment</option>
              <option value="wastage_disposal">Damaged / Expired Disposal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Issuance Quantity (Units) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedBatch?.current_balance || 9999}
              required
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-bold font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Ward / Location Destination */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Destination Ward / Unit <span className="text-rose-500">*</span>
          </label>
          <select
            value={wardName}
            onChange={e => setWardName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          >
            {COMMON_WARDS.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
            <option value="Other">Other Locations...</option>
          </select>
          {(wardName === 'Other' || wardName === 'Lain-lain') && (
            <input
              type="text"
              required
              placeholder="Enter ward / clinic name..."
              value={customWard}
              onChange={e => setCustomWard(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          )}
        </div>

        {/* Recipient & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Recipient Name (Nurse / Staff)
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="e.g. Staff Nurse Faridah"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Reference No. / Indent Slip
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value)}
              placeholder="e.g. IND-2026/089"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="active:scale-[0.98]">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="bg-teal-700 hover:bg-teal-600 active:scale-[0.98]">
            <ArrowDownCircle className="w-4 h-4 mr-1.5" />
            Confirm Counter Dispensing
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PrepackUsageModal
