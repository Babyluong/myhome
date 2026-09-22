// src/modules/myperolehan/components/AdminLpoViewerModal.tsx
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Printer, FileText } from 'lucide-react'
import { Button } from '@/components/ui'
import type { AdminLPO } from '@/shared/types/myperolehan'

interface AdminLpoViewerModalProps {
  isOpen: boolean
  onClose: () => void
  lpo: AdminLPO | null
}

export const AdminLpoViewerModal: React.FC<AdminLpoViewerModalProps> = ({
  isOpen,
  onClose,
  lpo
}) => {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !lpo) return null

  const po = lpo.purchase_order
  const supplier = po?.supplier
  const items = po?.items || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 text-slate-900 shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Official Local Purchase Order (LPO)</h3>
              <p className="text-xs text-slate-500 font-mono">{lpo.lpo_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 rounded-xl shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print LPO</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government LPO Container */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6 text-xs leading-relaxed"
        >
          {/* Header Hospital & KKM */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                MINISTRY OF HEALTH MALAYSIA
              </h2>
              <p className="font-bold text-sm text-slate-800">LAWAS HOSPITAL, SARAWAK</p>
              <p className="text-slate-600 text-[11px]">
                Jalan Hospital, 98850 Lawas, Sarawak | Tel: 085-283333
              </p>
            </div>
            <div className="text-right space-y-1 font-mono">
              <span className="px-3 py-1 bg-slate-900 text-white font-black rounded text-[11px] uppercase tracking-widest inline-block">
                LOCAL PURCHASE ORDER (LPO)
              </span>
              <p className="font-bold text-slate-800 text-sm mt-1">{lpo.lpo_number}</p>
              <p className="text-slate-600">Date: {lpo.lpo_date}</p>
            </div>
          </div>

          {/* Supplier & Delivery Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                TO SUPPLIER:
              </span>
              <p className="font-bold text-slate-900 text-sm">{supplier?.company_name || 'REGISTERED SUPPLIER'}</p>
              <p className="text-slate-600">{supplier?.address || 'System registered address'}</p>
              <p className="text-slate-600 font-mono">
                Tel: {supplier?.contact_person_phone || '-'} | Email: {supplier?.email || '-'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                ALLOCATION & ORDER DETAILS:
              </span>
              <p className="text-slate-700">
                <span className="font-bold">Order No. (PO):</span> {po?.order_number}
              </p>
              <p className="text-slate-700 font-mono">
                <span className="font-bold">Vote / Program Code:</span> {po?.program_code} - {po?.objek_code} ({po?.kategori_code})
              </p>
              <p className="text-slate-700">
                <span className="font-bold">Budget Type:</span>{' '}
                {po?.budget_type === 'pembangunan' ? 'Development (P42)' : 'Operating (MOH Warrant)'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black text-[11px] uppercase tracking-wider border-b border-slate-300">
                  <th className="border border-slate-300 px-3 py-2 text-center w-12">No.</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Supply / Service Description</th>
                  <th className="border border-slate-300 px-3 py-2 text-center w-20">Quantity</th>
                  <th className="border border-slate-300 px-3 py-2 text-center w-24">Unit</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-28">Unit Price (RM)</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-32">Total (RM)</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-3 py-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 px-3 py-2 font-medium">{item.item_description}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center text-slate-600">{item.unit || 'Unit'}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono">{Number(item.unit_price).toFixed(2)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">
                        {(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-slate-500 italic">
                      No items listed
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-black">
                  <td colSpan={5} className="border border-slate-300 px-4 py-2.5 text-right uppercase tracking-wider text-slate-800">
                    GRAND TOTAL AMOUNT (RM)
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-right font-mono text-sm text-slate-950">
                    {formatCurrency(Number(po?.total_amount) || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures & Certification */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center">
            <div className="space-y-12">
              <p className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                Prepared By (Procurement Officer)
              </p>
              <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                <p className="font-bold text-slate-800">Signature & Official Stamp</p>
                <p className="text-[10px] text-slate-500">Date: {lpo.lpo_date}</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                Approved By (Hospital Administrator / Director)
              </p>
              <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                <p className="font-bold text-slate-800">Official Signature & Seal</p>
                <p className="text-[10px] text-slate-500">Lawas Hospital, MOH</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
