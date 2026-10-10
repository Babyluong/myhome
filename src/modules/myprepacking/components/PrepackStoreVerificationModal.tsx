// src/modules/myprepacking/components/PrepackStoreVerificationModal.tsx
import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackItem } from '../types/prepack'
import { recordPrepackStoreVerification } from '../services/prepackKewPs4Service'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

interface PrepackStoreVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedItem: PrepackItem | null
}

export const PrepackStoreVerificationModal: React.FC<PrepackStoreVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedItem
}) => {
  const toast = useToast()
  const loggedUser = useAuthStore(state => state.user)
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [physicalCount, setPhysicalCount] = useState<string>('')
  const [verifierName, setVerifierName] = useState<string>('')
  const [verifierIc, setVerifierIc] = useState<string>('')
  const [verifierJawatan, setVerifierJawatan] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  const currentSystem = selectedItem?.total_balance ?? 0

  useEffect(() => {
    if (isOpen) {
      setYear(new Date().getFullYear())
      setPhysicalCount(String(currentSystem))
      setVerifierName(loggedUser?.full_name || (loggedUser as any)?.name || 'Store Verifying Officer')
      setVerifierIc('')
      setVerifierJawatan('Pharmacist Grade UF44')
      setRemarks(`Annual Store Verification ${new Date().getFullYear()} in accordance with Store Management Procedure (TPS KEW.PS-14).`)
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
      const res = await recordPrepackStoreVerification({
        prepack_item_id: selectedItem.id,
        verification_year: Number(year),
        physical_count: parsedPhysical,
        verifier_name: verifierName.trim(),
        verifier_ic: verifierIc.trim() || undefined,
        verifier_jawatan: verifierJawatan.trim() || undefined,
        remarks: remarks.trim()
      })

      if (!res.success) throw res.error

      toast.success(`Annual Store Verification ${year} recorded successfully (KEW.PS-14)!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error recording store verification:', err)
      toast.error(err.message || 'Failed to record store verification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Annual Store Verification (KEW.PS-14) - Year ${year}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedItem && (
          <div className="p-3 bg-subtle rounded-lg border border-border-default text-xs flex justify-between items-center">
            <div>
              <span className="text-text-muted">Prepack / UOD Item: </span>
              <span className="font-bold text-text-primary">{selectedItem.item_name} [{selectedItem.item_code}]</span>
            </div>
            <div className="font-mono text-teal-600 dark:text-teal-400 font-bold">
              System Balance: {currentSystem.toLocaleString()} packs
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Verification Year <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="2020"
              max="2035"
              required
              value={year}
              onChange={e => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-bold font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Verified Physical Count <span className="text-rose-500">*</span>
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

        {/* Tally status */}
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          discrepancy === 0 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
        }`}>
          <div className="flex items-center gap-2">
            {discrepancy === 0 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>
              {discrepancy === 0 
                ? 'Verification Status: TALLY (Physical count matches records exactly).' 
                : `Verification Status: DISCREPANCY (${discrepancy > 0 ? `+${discrepancy}` : discrepancy} packs). Audit certification required.`}
            </span>
          </div>
        </div>

        {/* Officer details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Verifying Officer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={verifierName}
              onChange={e => setVerifierName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              National ID / IC No. (Optional)
            </label>
            <input
              type="text"
              value={verifierIc}
              onChange={e => setVerifierIc(e.target.value)}
              placeholder="e.g. 881023-13-5541"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Designation & Grade
            </label>
            <input
              type="text"
              value={verifierJawatan}
              onChange={e => setVerifierJawatan(e.target.value)}
              placeholder="e.g. Pharmacist Grade UF44"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Inspection Certification Remarks
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
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Certify Verification (KEW.PS-14)
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PrepackStoreVerificationModal
