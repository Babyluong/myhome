// src/modules/myperolehan/pages/tabs/ReceivingPaymentsTab.tsx
import React, { useState } from 'react'
import 'framer-motion'
import { CreditCard, Truck, DollarSign } from 'lucide-react'
import type {
  AdminLPO,
  AdminReceivingRecord,
  AdminPayment
} from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface ReceivingPaymentsTabProps {
  lpos: AdminLPO[]
  receivingRecords: AdminReceivingRecord[]
  payments: AdminPayment[]
  onOpenRecordPayment: (lpo: AdminLPO) => void
  onRefresh: () => void
}

export const ReceivingPaymentsTab: React.FC<ReceivingPaymentsTabProps> = ({
  lpos,
  receivingRecords,
  payments,
  onOpenRecordPayment,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'payments' | 'receiving'>('payments')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Eligible LPOs for payment (approved LPOs that do not have full payments yet)
  const payableLPOs = lpos.filter((l) => l.status !== 'cancelled')

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border-2 border-border-subtle rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary">Goods Receiving & Payment Vouchers (EFT)</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Verification of delivery orders (DO) and payment voucher disbursements against warrants
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-border-default pb-2">
        <button
          onClick={() => setSubTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            subTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary bg-surface border border-border-default'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>EFT Payment Vouchers Ledger ({payments.length})</span>
        </button>

        <button
          onClick={() => setSubTab('receiving')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            subTab === 'receiving'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary bg-surface border border-border-default'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>DO Receiving Records ({receivingRecords.length})</span>
        </button>
      </div>

      {/* PAYMENTS SUBTAB */}
      {subTab === 'payments' && (
        <div className="space-y-6">
          {/* Active LPOs awaiting payment recording */}
          <div className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Local Purchase Orders (LPO) Ready for Payment
            </h3>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">LPO No.</th>
                    <th className="py-3 px-3">PO No.</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-3">Program / Object</th>
                    <th className="py-3 px-3 text-right">Total Value (RM)</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {payableLPOs.length > 0 ? (
                    payableLPOs.map((lpo) => {
                      const isPaid = payments.some((p) => p.lpo_id === lpo.id)
                      return (
                        <tr key={lpo.id} className="hover:bg-subtle/50">
                          <td className="py-3 px-3 font-mono font-bold text-text-primary">{lpo.lpo_number}</td>
                          <td className="py-3 px-3 font-mono text-text-muted">{lpo.purchase_order?.order_number}</td>
                          <td className="py-3 px-3 text-text-primary font-medium">
                            {lpo.purchase_order?.supplier?.company_name || 'Supplier'}
                          </td>
                          <td className="py-3 px-3 font-mono text-text-secondary font-semibold">
                            {lpo.purchase_order?.program_code} - {lpo.purchase_order?.objek_code}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600">
                            {formatCurrency(Number(lpo.purchase_order?.total_amount) || 0)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isPaid ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                Paid
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => onOpenRecordPayment(lpo)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 text-xs rounded-xl shadow-xs"
                              >
                                Record EFT Payment
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted font-medium italic">
                        No active LPOs requiring payment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: High-End LPO Cards (Zero Horizontal Scroll!) */}
            <div className="md:hidden space-y-3">
              {payableLPOs.length > 0 ? (
                payableLPOs.map((lpo) => {
                  const isPaid = payments.some((p) => p.lpo_id === lpo.id)
                  return (
                    <div key={lpo.id} className="p-4 bg-subtle/50 border border-border-default rounded-2xl space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-black text-text-primary text-sm block">
                            {lpo.lpo_number}
                          </span>
                          <span className="font-mono text-xs text-text-muted">
                            PO: {lpo.purchase_order?.order_number || '-'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-indigo-600 text-sm">
                          {formatCurrency(Number(lpo.purchase_order?.total_amount) || 0)}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Supplier:</span>
                          <span className="font-semibold text-text-primary">{lpo.purchase_order?.supplier?.company_name || 'Supplier'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Prog/Obj:</span>
                          <span className="font-mono text-text-secondary">{lpo.purchase_order?.program_code} - {lpo.purchase_order?.objek_code}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-default">
                        {isPaid ? (
                          <span className="w-full inline-flex justify-center py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                            Paid
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onOpenRecordPayment(lpo)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs rounded-xl"
                          >
                            Record EFT Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No active LPOs requiring payment.
                </div>
              )}
            </div>
          </div>

          {/* Payment History Ledger */}
          <div className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Completed Payment Transactions Ledger (EFT / Voucher)
            </h3>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">EFT Reference No.</th>
                    <th className="py-3 px-3">Payment Date</th>
                    <th className="py-3 px-3">LPO No.</th>
                    <th className="py-3 px-3">Payee Supplier</th>
                    <th className="py-3 px-3 text-right">Amount Paid (RM)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-subtle/50">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">{p.payment_reference}</td>
                        <td className="py-3 px-3 text-text-muted">{p.payment_date}</td>
                        <td className="py-3 px-3 font-mono text-text-secondary font-semibold">{p.lpo?.lpo_number || '-'}</td>
                        <td className="py-3 px-3 text-text-primary">
                          {p.lpo?.purchase_order?.supplier?.company_name || 'Supplier'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-text-primary">
                          {formatCurrency(Number(p.amount) || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted font-medium italic">
                        No EFT payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: High-End Payment Cards (Zero Horizontal Scroll!) */}
            <div className="md:hidden space-y-3">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div key={p.id} className="p-4 bg-subtle/50 border border-border-default rounded-2xl space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-emerald-700 text-sm block">
                          {p.payment_reference}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          LPO: {p.lpo?.lpo_number || '-'}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-text-primary text-sm">
                        {formatCurrency(Number(p.amount) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border-default">
                      <span className="font-medium text-text-secondary truncate">
                        {p.lpo?.purchase_order?.supplier?.company_name || 'Supplier'}
                      </span>
                      <span className="font-mono text-text-muted text-[11px] flex-shrink-0">
                        {p.payment_date}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No EFT payment records found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIVING SUBTAB */}
      {subTab === 'receiving' && (
        <div className="rounded-[2rem] bg-surface border-2 border-border-subtle p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            Goods Receiving & Delivery Order (DO) Log
          </h3>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-subtle/50 border-y border-border-subtle text-text-muted font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">DO No. (Delivery Order)</th>
                  <th className="py-3 px-3">Received Date</th>
                  <th className="py-3 px-3">LPO No.</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {receivingRecords.length > 0 ? (
                  receivingRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-subtle/50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{r.do_number}</td>
                      <td className="py-3 px-3 text-text-muted">{r.received_date}</td>
                      <td className="py-3 px-3 font-mono text-text-secondary font-semibold">{r.lpo?.lpo_number || '-'}</td>
                      <td className="py-3 px-3 text-text-primary font-medium">
                        {r.lpo?.purchase_order?.supplier?.company_name || 'Supplier'}
                      </td>
                      <td className="py-3 px-3 text-text-muted">{r.notes || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          Fully Received
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted font-medium italic">
                      No DO receiving records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: High-End Receiving Cards (Zero Horizontal Scroll!) */}
          <div className="md:hidden space-y-3">
            {receivingRecords.length > 0 ? (
              receivingRecords.map((r) => (
                <div key={r.id} className="p-4 bg-subtle/50 border border-border-default rounded-2xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-indigo-700 text-sm block">
                        {r.do_number}
                      </span>
                      <span className="font-mono text-xs text-text-muted">
                        LPO: {r.lpo?.lpo_number || '-'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      Received
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Supplier:</span>
                      <span className="font-medium text-text-primary">{r.lpo?.purchase_order?.supplier?.company_name || 'Supplier'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Date:</span>
                      <span className="font-mono text-text-muted">{r.received_date}</span>
                    </div>
                    {r.notes && (
                      <p className="text-text-muted italic text-[11px] pt-1">"{r.notes}"</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No DO receiving records found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
