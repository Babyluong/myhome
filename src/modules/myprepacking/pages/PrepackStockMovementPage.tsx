// src/modules/myprepacking/pages/PrepackStockMovementPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowRightLeft,
  Building2,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  FileText,
  Calendar,
  Layers,
  PackageCheck,
  Boxes,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react'
import { getPrepackUsageLogs, getPrepackItems } from '../services/prepackService'
import { getPrepackTransfers, PrepackLedgerItemWithBalances, getPrepackLedgerItems } from '../services/prepackKewPs4Service'
import type { PrepackUsageLog, PrepackItem, PrepackTransfer } from '../types/prepack'
import { StoreToCounterTransferModal } from '../components/StoreToCounterTransferModal'
import { PrepackUsageModal } from '../components/PrepackUsageModal'
import { PrepackBatchCreateModal } from '../components/PrepackBatchCreateModal'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

export const PrepackStockMovementPage: React.FC = () => {
  const toast = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transfers' | 'dispensing'>('transfers')

  const [transfers, setTransfers] = useState<PrepackTransfer[]>([])
  const [usageLogs, setUsageLogs] = useState<PrepackUsageLog[]>([])
  const [items, setItems] = useState<PrepackLedgerItemWithBalances[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [transfersRes, logsRes, itemsRes] = await Promise.all([
        getPrepackTransfers(user?.hospital_id, undefined, 100),
        getPrepackUsageLogs(user?.hospital_id, 100),
        getPrepackLedgerItems(user?.hospital_id)
      ])
      setTransfers(transfersRes.data || [])
      setUsageLogs(logsRes.data || [])
      setItems(itemsRes.data || [])
    } catch (err: any) {
      console.error('Error loading stock movement data:', err)
      toast.error('Failed to load stock movement records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.hospital_id])

  const totalTransferredUnits = useMemo(() => {
    return transfers.reduce((acc, t) => acc + (t.quantity_transferred || 0), 0)
  }, [transfers])

  const totalCounterRawUnits = useMemo(() => {
    return items.reduce((acc, i) => acc + (i.counter_raw_stock || 0), 0)
  }, [items])

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const q = searchQuery.toLowerCase()
      return (
        t.transfer_number.toLowerCase().includes(q) ||
        (t.reference_no || '').toLowerCase().includes(q) ||
        (t.prepack_item?.item_name || '').toLowerCase().includes(q) ||
        t.transferred_by_name.toLowerCase().includes(q)
      )
    })
  }, [transfers, searchQuery])

  const filteredUsage = useMemo(() => {
    return usageLogs.filter(u => {
      const q = searchQuery.toLowerCase()
      return (
        (u.prepack_item?.item_name || '').toLowerCase().includes(q) ||
        (u.batch?.batch_number || '').toLowerCase().includes(q) ||
        (u.ward_name || '').toLowerCase().includes(q) ||
        (u.recipient_name || '').toLowerCase().includes(q) ||
        (u.reference_no || '').toLowerCase().includes(q)
      )
    })
  }, [usageLogs, searchQuery])

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 uppercase tracking-wider">
                  Movement Log
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-subtle text-text-muted border border-border-subtle">
                  Main Store &rarr; Prepack Counter
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-1">
                Stock Transfer &amp; Movement Log
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                Log of bulk medication transfers from Main Pharmacy Store to Pre-pack / UOD Counter and counter distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setTransferModalOpen(true)}
              className="min-h-[36px] px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Store to Counter</span>
            </button>

            <button
              onClick={() => setBatchModalOpen(true)}
              className="min-h-[36px] px-3 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-primary rounded-lg text-xs font-medium border border-border-default hover:border-border-strong transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PackageCheck className="w-3.5 h-3.5 text-text-muted" />
              <span>Pack UOD</span>
            </button>

            <button
              onClick={() => setUsageModalOpen(true)}
              className="min-h-[36px] px-3 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-primary rounded-lg text-xs font-medium border border-border-default hover:border-border-strong transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-text-muted" />
              <span>Counter Distribution</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh Movement Data"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-all cursor-pointer shadow-xs flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Units Transferred from Store</div>
          <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
            {totalTransferredUnits.toLocaleString()} <span className="text-xs font-normal text-text-muted ml-0.5">units</span>
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">Cumulative total from Main Store to Counter</div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Raw Material Balance at Counter (Tier 2)</div>
          <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
            {totalCounterRawUnits.toLocaleString()} <span className="text-xs font-normal text-text-muted ml-0.5">base units</span>
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">Ready to be packed into UOD sachets</div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Transfer Transactions</div>
          <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
            {transfers.length}
          </div>
          <div className="text-[11px] text-text-muted mt-1 leading-relaxed">Completed store transfer records</div>
        </div>
      </div>

      {/* View Switcher Tabs & Search */}
      <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center p-0.5 bg-subtle rounded-lg border border-border-subtle">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
              activeTab === 'transfers'
                ? 'bg-surface text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Store Transfers ({transfers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dispensing')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
              activeTab === 'dispensing'
                ? 'bg-surface text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Counter Distribution ({usageLogs.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search reference no., batch, item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary placeholder:text-text-muted outline-none transition-all"
          />
        </div>
      </div>

      {/* Tab 1: Transfers Table */}
      {activeTab === 'transfers' && (
        <div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
          {filteredTransfers.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowRightLeft className="w-12 h-12 mx-auto text-text-muted mb-3 opacity-40" />
              <h3 className="text-base font-bold text-text-primary">
                No Store Transfer Records Found
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No bulk stock transfer transactions from Main Store to Pre-pack Counter recorded yet.
              </p>
              <button
                onClick={() => setTransferModalOpen(true)}
                className="mt-4 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer First Stock</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle/80 text-text-muted uppercase font-semibold border-b border-border-default">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Transfer No. (TRF)</th>
                    <th className="py-3 px-3">Prepack / UOD Item</th>
                    <th className="py-3 px-3 text-right">Quantity Transferred</th>
                    <th className="py-3 px-3 text-right">Store Balance (Before &rarr; After)</th>
                    <th className="py-3 px-3 text-right">Counter Balance (Before &rarr; After)</th>
                    <th className="py-3 px-3">Transferring Officer</th>
                    <th className="py-3 px-4">Reference No. / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary">
                  {filteredTransfers.map(trf => (
                    <tr key={trf.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">
                          {new Date(trf.transfer_date).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {new Date(trf.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-blue-400">
                        {trf.transfer_number}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-text-primary">
                          {trf.prepack_item?.item_name || 'Item'}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {trf.prepack_item?.dosage_form} • {trf.prepack_item?.strength}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-blue-400 text-sm">
                        +{trf.quantity_transferred.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                        {trf.store_stock_before} &rarr; <span className="font-bold text-text-primary">{trf.store_stock_after}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[11px] text-amber-500">
                        {trf.counter_stock_before} &rarr; <span className="font-bold text-amber-400">{trf.counter_stock_after}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-text-primary">{trf.transferred_by_name}</div>
                        {trf.received_by_name && (
                          <div className="text-[10px] text-text-muted">Receiver: {trf.received_by_name}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-teal-400 font-bold">{trf.reference_no}</div>
                        <div className="text-[10px] text-text-muted truncate max-w-xs">{trf.remarks || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dispensing Table */}
      {activeTab === 'dispensing' && (
        <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
          {filteredUsage.length === 0 ? (
            <div className="p-12 text-center">
              <Send className="w-12 h-12 mx-auto text-text-muted mb-3 opacity-40" />
              <h3 className="text-base font-bold text-text-primary">
                No Counter Distribution Records Found
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No UOD pack distribution transactions to wards or patients recorded yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle/80 text-text-muted uppercase font-semibold border-b border-border-default">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Prepack / UOD Item</th>
                    <th className="py-3 px-3">Batch No.</th>
                    <th className="py-3 px-3">Transaction Type</th>
                    <th className="py-3 px-3 text-right">Quantity (Packs)</th>
                    <th className="py-3 px-3">Destination Ward / Unit</th>
                    <th className="py-3 px-3">Recipient & Reference</th>
                    <th className="py-3 px-4">Issued By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary">
                  {filteredUsage.map(log => (
                    <tr key={log.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">
                          {new Date(log.created_at).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-text-primary">
                          {log.prepack_item?.item_name || 'Item'}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {log.prepack_item?.dosage_form} • {log.prepack_item?.strength}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-teal-400">
                        {log.batch?.batch_number || '-'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {log.transaction_type === 'ward_supply' ? 'Ward Supply' : log.transaction_type === 'inpatient_trolley' ? 'UOD Trolley' : log.transaction_type}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-rose-400 text-sm">
                        -{log.quantity}
                      </td>

                      <td className="py-3 px-3 font-semibold text-text-primary">
                        {log.ward_name || '-'}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-text-primary">
                          {log.recipient_name || '-'}
                        </div>
                        {log.reference_no && (
                          <div className="font-mono text-[10px] text-text-muted">
                            Ref: {log.reference_no}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-text-muted">
                        {log.issued_by_name || 'Pharmacist'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <StoreToCounterTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={loadData}
        items={items}
      />

      <PrepackBatchCreateModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={loadData}
        items={items}
      />

      <PrepackUsageModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        onSuccess={loadData}
        items={items}
      />
    </div>
  )
}

export default PrepackStockMovementPage
