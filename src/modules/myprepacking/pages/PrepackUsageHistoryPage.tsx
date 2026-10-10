// src/modules/myprepacking/pages/PrepackUsageHistoryPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  Send,
  Building,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowDownCircle,
  FileText,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react'
import { getPrepackUsageLogs, getPrepackItems } from '../services/prepackService'
import type { PrepackUsageLog, PrepackItem } from '../types/prepack'
import { PrepackUsageModal } from '../components/PrepackUsageModal'
import { useToast } from '@/stores/toastStore'

export const PrepackUsageHistoryPage: React.FC = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<PrepackUsageLog[]>([])
  const [items, setItems] = useState<PrepackItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [wardFilter, setWardFilter] = useState('all')
  const [usageModalOpen, setUsageModalOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [logsRes, itemsRes] = await Promise.all([
        getPrepackUsageLogs(undefined, 200),
        getPrepackItems()
      ])
      setLogs(logsRes.data || [])
      setItems(itemsRes.data || [])
    } catch (err: any) {
      console.error('Error loading usage logs:', err)
      toast.error('Failed to load ward consumption records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const uniqueWards = useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.ward_name) set.add(l.ward_name)
    })
    return Array.from(set).sort()
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        (l.prepack_item?.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.batch?.batch_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.recipient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.reference_no || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesWard = wardFilter === 'all' || l.ward_name === wardFilter

      return matchesSearch && matchesWard
    })
  }, [logs, searchQuery, wardFilter])

  const totalUnitsDistributed = useMemo(() => {
    return filteredLogs.reduce((acc, l) => acc + (l.quantity || 0), 0)
  }, [filteredLogs])

  return (
    <div className="w-full space-y-6">
      {/* Unified Elevated Header */}
      <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg border border-border-subtle bg-subtle text-teal-600 dark:text-teal-400 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-subtle text-text-muted border border-border-subtle">
                  Pharmacy Prepacking System (UOD & Bulk)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Ward Consumption & Dispensing Logs
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Audit trail of UOD and prepack medication dispatches to hospital wards, outpatient pharmacy, and clinical units.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUsageModalOpen(true)}
              className="min-h-[38px] px-3.5 py-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <Send className="w-4 h-4" />
              <span>New Ward Dispatch</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh Logs"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Focused Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs hover:border-border-strong transition-colors">
          <div className="text-xs font-medium text-text-muted">Total Units Dispatched</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-600 dark:text-teal-400 mt-1">
            {totalUnitsDistributed.toLocaleString()} <span className="text-xs font-normal text-text-muted">units</span>
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Filtered issuance volume</div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs hover:border-border-strong transition-colors">
          <div className="text-xs font-medium text-text-muted">Total Dispatch Transactions</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-text-primary mt-1">
            {filteredLogs.length}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Individual ledger entries</div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs hover:border-border-strong transition-colors">
          <div className="text-xs font-medium text-text-muted">Active Wards / Units</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-text-primary mt-1">
            {uniqueWards.length}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Clinical receiving stations</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search item, batch, recipient, reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-subtle border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={wardFilter}
            onChange={e => setWardFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-subtle border border-border-default rounded-lg text-text-secondary focus:outline-none focus:ring-1 focus:ring-teal-500/50 font-medium"
          >
            <option value="all">All Wards / Units</option>
            {uniqueWards.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6 text-text-muted opacity-60" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              No Dispensing Records Found
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              No prepack consumption records found matching the current search or ward filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle/80 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-default">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-3">Prepack / UOD Item</th>
                  <th className="py-2.5 px-3">Batch No.</th>
                  <th className="py-2.5 px-3">Transaction Type</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Destination Ward</th>
                  <th className="py-2.5 px-3">Recipient & Reference</th>
                  <th className="py-2.5 px-4">Issued By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">
                        {new Date(log.created_at).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-text-primary">
                        {log.prepack_item?.item_name || 'Item'}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {log.prepack_item?.dosage_form} • {log.prepack_item?.strength}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {log.batch?.batch_number || '-'}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 capitalize">
                        {log.transaction_type === 'ward_supply' ? 'Ward Supply' : log.transaction_type === 'inpatient_trolley' ? 'UOD Trolley' : log.transaction_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400 text-xs">
                      -{log.quantity}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-text-primary">
                      {log.ward_name || '-'}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-text-primary font-medium">
                        {log.recipient_name || '-'}
                      </div>
                      {log.reference_no && (
                        <div className="font-mono text-[10px] text-text-muted">
                          Ref: {log.reference_no}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-text-muted">
                      {log.issued_by_name || 'Pharmacy Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PrepackUsageModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        onSuccess={() => loadData()}
        items={items}
      />
    </div>
  )
}

export default PrepackUsageHistoryPage
