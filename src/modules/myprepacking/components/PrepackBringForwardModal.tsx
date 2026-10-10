// src/modules/myprepacking/components/PrepackBringForwardModal.tsx
import React, { useState, useEffect } from 'react'
import { FastForward } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem } from '../types/prepack'
import { recordPrepackBringForward } from '../services/prepackKewPs4Service'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface PrepackBringForwardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedItem: PrepackItem | null
}

export const PrepackBringForwardModal: React.FC<PrepackBringForwardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedItem
}) => {
  const toast = useToast()
  const loggedUser = useAuthStore(state => state.user)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState<number>(0)
  const [officerName, setOfficerName] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setQuantity(selectedItem?.total_balance || 0)
      setOfficerName(loggedUser?.full_name || (loggedUser as any)?.name || 'Head of Pharmacy Unit')
      setRemarks(`Opening balance brought forward for year ${new Date().getFullYear()}.`)
    }
  }, [isOpen, selectedItem, loggedUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      toast.error('Invalid item selected.')
      return
    }

    setLoading(true)
    try {
      const res = await recordPrepackBringForward({
        prepack_item_id: selectedItem.id,
        quantity: Number(quantity),
        officer_name: officerName.trim(),
        officer_id: loggedUser?.id,
        remarks: remarks.trim()
      })

      if (!res.success) throw res.error

      toast.success(`Opening balance (${quantity.toLocaleString()} packs) recorded into ledger successfully!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error recording bring forward:', err)
      toast.error(err.message || 'Failed to record opening balance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bring Forward Balance (B.K.H) - Ledger Opening"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedItem && (
          <div className="p-3 bg-subtle rounded-lg border border-border-default text-xs flex items-center justify-between">
            <span className="text-text-muted">Item:</span>
            <span className="font-bold text-text-primary">{selectedItem.item_name} [{selectedItem.item_code}]</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Opening Balance Quantity (Packs) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-surface border-2 border-teal-500/80 rounded-lg text-text-primary font-bold font-mono text-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          <span className="text-[10px] text-text-muted mt-1 block">
            Opening stock brought forward from previous year or previous ledger card.
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Authorizing Officer Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Remarks
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="active:scale-[0.98]">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="bg-teal-700 hover:bg-teal-600 active:scale-[0.98]">
            <FastForward className="w-4 h-4 mr-1.5" />
            Record Opening Balance
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PrepackBringForwardModal
