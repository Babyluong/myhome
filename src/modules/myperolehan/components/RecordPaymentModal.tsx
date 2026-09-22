// src/modules/myperolehan/components/RecordPaymentModal.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CreditCard, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { recordPayment } from '../services/perolehanAdminService'
import type { AdminLPO } from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lpo: AdminLPO | null
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lpo
}) => {
  const { user } = useAuthStore()
  const toast = useToast()

  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [paymentRef, setPaymentRef] = useState<string>(`EFT-KKM-${Date.now().toString().slice(-6)}`)
  const [amount, setAmount] = useState<number>(Number(lpo?.purchase_order?.total_amount) || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !lpo) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentRef.trim() || amount <= 0) {
      toast.error('Please complete a valid payment reference and amount.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await recordPayment({
        lpo_id: lpo.id,
        payment_date: paymentDate,
        payment_reference: paymentRef,
        amount: Number(amount),
        status: 'paid',
        created_by: user?.id
      })

      if (error) throw error

      toast.success('EFT Payment Successfully Recorded to Ledger!')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error recording payment:', err)
      toast.error('Failed to record payment', err.message || 'System error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 text-slate-900 shadow-2xl overflow-hidden my-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Record Payment Voucher / EFT Disbursement</h3>
              <p className="text-xs text-slate-500 font-mono">LPO: {lpo.lpo_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Voucher Reference No. / EFT Transaction No.
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Payment Completion Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Payment Amount (RM)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ledger Synchronization Impact:</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              After recording payment, order status will change to <strong>COMPLETED</strong> and official warrant balance will update automatically.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Recording...' : 'Record EFT Payment'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
