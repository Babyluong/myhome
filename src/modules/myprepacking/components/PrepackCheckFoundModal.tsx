// src/modules/myprepacking/components/PrepackCheckFoundModal.tsx
import React, { useState, useEffect } from 'react'
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem } from '../types/prepack'
import { recordPrepackCheckFound } from '../services/prepackKewPs4Service'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface PrepackCheckFoundModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedItem: PrepackItem | null
}

export const PrepackCheckFoundModal: React.FC<PrepackCheckFoundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedItem
}) => {
  const toast = useToast()
  const loggedUser = useAuthStore(state => state.user)
  const [loading, setLoading] = useState(false)
  const [physicalCount, setPhysicalCount] = useState<string>('')
  const [officerName, setOfficerName] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  const currentSystem = selectedItem?.total_balance ?? 0

  useEffect(() => {
    if (isOpen) {
      setPhysicalCount(String(currentSystem))
      setOfficerName(loggedUser?.full_name || (loggedUser as any)?.name || 'Auditing Pharmacist')
      setRemarks('Physical prepacking stock audit verification.')
    }
  }, [isOpen, selectedItem, currentSystem, loggedUser])

  const parsedPhysical = parseInt(physicalCount, 10) || 0
  const discrepancy = parsedPhysical - currentSystem

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      toast.error('Invalid item selected.')
      return
    }

    setLoading(true)
    try {
      const res = await recordPrepackCheckFound({
        prepack_item_id: selectedItem.id,
        physical_count: parsedPhysical,
        officer_name: officerName.trim(),
        officer_id: loggedUser?.id,
        remarks: remarks.trim()
      })

      if (!res.success) throw res.error

      toast.success(`Stock audit recorded successfully. Physical balance verified: ${parsedPhysical} packs.`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error recording check and found:', err)
      toast.error(err.message || 'Failed to record physical stock audit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Stock Count & Discrepancy Verification (KEW.PS-4)"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedItem && (
          <div className="p-3 bg-subtle rounded-lg border border-border-default text-xs flex items-center justify-between">
            <span className="text-text-muted">Selected Item:</span>
            <span className="font-bold text-text-primary">{selectedItem.item_name} [{selectedItem.item_code}]</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-subtle rounded-lg border border-border-default">
            <span className="text-xs text-text-muted">Current System Balance:</span>
            <div className="text-xl font-bold font-mono tabular-nums text-text-primary mt-1">
              {currentSystem.toLocaleString()} <span className="text-xs font-normal text-text-muted">packs</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Actual Physical Count <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={physicalCount}
              onChange={e => setPhysicalCount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border-2 border-teal-500/80 rounded-lg text-text-primary font-bold font-mono text-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        </div>

        {/* Discrepancy Alert */}
        {discrepancy !== 0 ? (
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            discrepancy > 0 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {discrepancy > 0 
                  ? `Stock Surplus (+${discrepancy} packs): Will be adjusted into the ledger.`
                  : `Stock Deficit (${discrepancy} packs): Will be deducted from the ledger.`}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>Physical count matches system balance exactly (No discrepancy).</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Verifying Officer <span className="text-rose-500">*</span>
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
            Audit Justification / Remarks
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
            <Scale className="w-4 h-4 mr-1.5" />
            Confirm Audit Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PrepackCheckFoundModal
