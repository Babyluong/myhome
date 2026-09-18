// src/modules/myperolehan/pages/tabs/PurchaseOrdersTab.tsx
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronUp,
  Building,
  HardHat
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import {
  updatePurchaseOrderStatus
} from '../../services/perolehanAdminService'
import type { AdminPurchaseOrder, AdminLPO } from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface PurchaseOrdersTabProps {
  orders: AdminPurchaseOrder[]
  lpos: AdminLPO[]
  onRefresh: () => void
  onOpenCreatePO: () => void
  onViewLPO: (lpo: AdminLPO) => void
}

export const PurchaseOrdersTab: React.FC<PurchaseOrdersTabProps> = ({
  orders,
  lpos,
  onRefresh,
  onOpenCreatePO,
  onViewLPO
}) => {
  const { user } = useAuthStore()
  const toast = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [budgetTypeFilter, setBudgetTypeFilter] = useState<string>('all')
  const [expandedPO, setExpandedPO] = useState<Record<string, boolean>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const toggleExpand = (id: string) => {
    setExpandedPO((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>
      case 'pending_approval':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Approved (LPO)</span>
      case 'ordered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Ordered</span>
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>
    }
  }

  // Filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.supplier?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.program_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.objek_code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesType = budgetTypeFilter === 'all' || order.budget_type === budgetTypeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [orders, searchTerm, statusFilter, budgetTypeFilter])

  // Approve PO Action
  const handleApprovePO = async (poId: string) => {
    setProcessingId(poId)
    try {
      const { error } = await updatePurchaseOrderStatus(poId, 'approved', user?.id)
      if (error) throw error

      toast.success('Purchase Order (PO) Approved and LPO Generated!')
      onRefresh()
    } catch (err: any) {
      console.error('Error approving PO:', err)
      toast.error('Failed to approve purchase order', err.message || 'System error.')
    } finally {
      setProcessingId(null)
    }
  }

  // Cancel PO Action
  const handleCancelPO = async (poId: string) => {
    if (!window.confirm('Are you sure you want to cancel this purchase order?')) return

    setProcessingId(poId)
    try {
      const { error } = await updatePurchaseOrderStatus(poId, 'cancelled')
      if (error) throw error

      toast.success('Purchase Order Cancelled.')
      onRefresh()
    } catch (err: any) {
      console.error('Error cancelling PO:', err)
      toast.error('Failed to cancel order', err.message || 'System error.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Purchase Orders & Local Purchase Orders (LPO)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage administrative purchase approvals, official LPO printing & expenditure commitments
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenCreatePO}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm text-xs rounded-xl px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Purchase Order (PO)</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO No., supplier, vote code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved / LPO Generated</option>
            <option value="ordered">Ordered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={budgetTypeFilter}
            onChange={(e) => setBudgetTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Budget Types</option>
            <option value="warrant">Operating (020200 / 022300)</option>
            <option value="pembangunan">Development (P42)</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isExpanded = expandedPO[order.id] || false
            const isProcessing = processingId === order.id
            const matchedLPO = lpos.find((l) => l.purchase_order_id === order.id)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] bg-white border-2 border-slate-100 p-5.5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      order.budget_type === 'pembangunan'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {order.budget_type === 'pembangunan' ? (
                        <HardHat className="w-5 h-5" />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: <span className="text-slate-700 font-mono font-semibold">{order.order_date}</span> | Supplier:{' '}
                        <strong className="text-slate-800">{order.supplier?.company_name || 'Open Vendor'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                      <span className="text-base font-black text-indigo-600 font-mono">
                        {formatCurrency(Number(order.total_amount) || 0)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {order.status === 'pending_approval' && (
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleApprovePO(order.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-xs rounded-xl shadow-xs"
                        >
                          Approve & Generate LPO
                        </Button>
                      )}

                      {matchedLPO && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewLPO(matchedLPO)}
                          className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 bg-white flex items-center gap-1.5 text-xs rounded-xl font-bold"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View LPO</span>
                        </Button>
                      )}

                      {order.status === 'pending_approval' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => handleCancelPO(order.id)}
                          className="border-rose-200 hover:bg-rose-50 text-rose-600 text-xs rounded-xl font-semibold"
                        >
                          Cancel
                        </Button>
                      )}

                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meta Details Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Program:</span>
                    <span className="font-mono text-slate-800 font-bold">{order.program_code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Object & Category:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {order.objek_code} ({order.kategori_code})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Generated LPO No.:</span>
                    <span className="font-mono text-indigo-600 font-bold">
                      {matchedLPO ? matchedLPO.lpo_number : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Prepared By:</span>
                    <span className="text-slate-700 font-medium truncate block">
                      {order.creator?.full_name || 'Procurement Officer'}
                    </span>
                  </div>
                </div>

                {/* Expandable Items List */}
                {isExpanded && order.items && order.items.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Order Items List ({order.items.length})
                    </h5>
                    {/* Desktop View: Items Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold">
                            <th className="py-2 px-3">No.</th>
                            <th className="py-2 px-3">Item Description</th>
                            <th className="py-2 px-3 text-center">Quantity</th>
                            <th className="py-2 px-3 text-right">Unit Price (RM)</th>
                            <th className="py-2 px-3 text-right">Total (RM)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.items.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 text-slate-800 font-medium">{it.item_description}</td>
                              <td className="py-2 px-3 text-center font-mono text-slate-700">{it.quantity} {it.unit || ''}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-700">{Number(it.unit_price).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600">
                                {formatCurrency(Number(it.total_price) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: High-End Item Cards (Zero Horizontal Scroll!) */}
                    <div className="sm:hidden space-y-2">
                      {order.items.map((it, idx) => (
                        <div key={it.id || idx} className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">
                              <span className="text-slate-400 font-mono mr-1">#{idx + 1}</span>
                              {it.item_description}
                            </span>
                            <span className="font-mono font-bold text-indigo-600 flex-shrink-0">
                              {formatCurrency(Number(it.total_price) || 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                            <span>Qty: <strong>{it.quantity} {it.unit || ''}</strong></span>
                            <span>@ RM{Number(it.unit_price).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })
        ) : (
          <div className="rounded-[2rem] bg-white border-2 border-slate-100 p-12 text-center text-slate-400 space-y-3">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">No purchase orders found matching current filter.</p>
            <Button size="sm" onClick={onOpenCreatePO} className="bg-indigo-600 text-white font-bold rounded-xl">
              Create Purchase Order Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
