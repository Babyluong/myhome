// src/modules/myprepacking/pages/PrepackBatchListPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { PackageCheck, Plus, Search, Printer, Send, ShieldCheck, RefreshCw } from 'lucide-react'
import { getPrepackBatches, getPrepackItems } from '../services/prepackService'
import type { PrepackBatch, PrepackItem } from '../types/prepack'
import { PrepackBatchCreateModal } from '../components/PrepackBatchCreateModal'
import { PrepackBatchCard } from '../components/PrepackBatchCard'
import { PrepackLabelPrintModal } from '../components/PrepackLabelPrintModal'
import { PrepackUsageModal } from '../components/PrepackUsageModal'
import { useToast } from '@/stores/toastStore'

export const PrepackBatchListPage: React.FC = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<PrepackBatch[]>([])
  const [items, setItems] = useState<PrepackItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [selectedBatchForLabel, setSelectedBatchForLabel] = useState<PrepackBatch | null>(null)
  const [selectedBatchForUsage, setSelectedBatchForUsage] = useState<PrepackBatch | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [batchesRes, itemsRes] = await Promise.all([
        getPrepackBatches(),
        getPrepackItems()
      ])
      setBatches(batchesRes.data || [])
      setItems(itemsRes.data || [])
    } catch (err: any) {
      console.error('Error loading batches:', err)
      toast.error('Failed to load prepack batch records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch = 
        b.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.mfg_batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.prepack_item?.item_name || '').toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === 'active') {
        matchesStatus = b.status === 'active' && !b.is_expired
      } else if (statusFilter === 'near_expiry') {
        matchesStatus = !!b.is_near_expiry && b.current_balance > 0
      } else if (statusFilter === 'depleted') {
        matchesStatus = b.current_balance === 0 || b.status === 'depleted'
      } else if (statusFilter === 'expired') {
        matchesStatus = !!b.is_expired
      }

      return matchesSearch && matchesStatus
    })
  }, [batches, searchQuery, statusFilter])

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Batch Run Records
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                Comprehensive log of repackaging runs, manufacturer lot numbers, BUD expiry dates, and QA verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="min-h-[36px] px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>New Prepack Batch</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh Batches"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors cursor-pointer shadow-xs flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search batch or manufacturer lot no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary placeholder:text-text-muted font-mono outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
          >
            <option value="all">All Batch Statuses</option>
            <option value="active">Active Stock Only</option>
            <option value="near_expiry">Near Expiry (&lt; 60 days)</option>
            <option value="depleted">Depleted Stock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
        {filteredBatches.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3.5 text-text-muted">
              <PackageCheck className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              No Batch Records Found
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              No packaging records found matching your filter criteria. Click &quot;New Prepack Batch&quot; to start a packaging run.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setBatchModalOpen(true)}
                className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Prepack Batch</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Zero Horizontal Scrolling) */}
            <div className="block md:hidden divide-y divide-border-subtle">
              {filteredBatches.map(batch => (
                <PrepackBatchCard
                  key={batch.id}
                  batch={batch}
                  onPrintLabel={b => {
                    setSelectedBatchForLabel(b)
                    setLabelModalOpen(true)
                  }}
                  onIssueStock={b => {
                    setSelectedBatchForUsage(b)
                    setUsageModalOpen(true)
                  }}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider border-b border-border-default">
                <tr>
                  <th className="py-3 px-4">Prepack Batch No.</th>
                  <th className="py-3 px-3">Item / UOD</th>
                  <th className="py-3 px-3">Mfg Batch &amp; Pack Date</th>
                  <th className="py-3 px-3">Expiry Date (BUD)</th>
                  <th className="py-3 px-3 text-right">Quantity &amp; Balance</th>
                  <th className="py-3 px-3">Officer / Checker</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {filteredBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                        {batch.batch_number}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {new Date(batch.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-text-primary">
                        {batch.prepack_item?.item_name || 'Item'}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {batch.prepack_item?.dosage_form} • {batch.prepack_item?.package_type}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-text-primary">
                        Mfg: {batch.mfg_batch_number}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        Packed: {batch.pack_date}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-text-primary font-mono">
                        {batch.prepack_expiry_date}
                      </div>
                      <div className={`text-[10px] font-medium ${
                        batch.is_expired ? 'text-rose-500 font-bold' : batch.is_near_expiry ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {batch.days_to_expiry !== undefined 
                          ? batch.days_to_expiry < 0 
                            ? 'Expired' 
                            : `${batch.days_to_expiry} days left` 
                          : ''}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-text-primary text-sm tabular-nums">
                        {batch.current_balance} / {batch.quantity_packed}
                      </div>
                      {batch.wastage_quantity > 0 && (
                        <div className="text-[10px] text-rose-500 font-mono">
                          Wastage: {batch.wastage_quantity}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-text-primary font-medium">
                        {batch.packed_by_name || 'Pharmacist'}
                      </div>
                      <div className="text-[10px] text-text-muted flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{batch.verified_by_name || 'QA Officer'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        batch.current_balance === 0 || batch.status === 'depleted'
                          ? 'bg-subtle text-text-muted border border-border-subtle'
                          : batch.is_expired
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : batch.is_near_expiry
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {batch.current_balance === 0 ? 'Depleted' : batch.is_expired ? 'Expired' : batch.is_near_expiry ? 'Near Expiry' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedBatchForLabel(batch)
                            setLabelModalOpen(true)
                          }}
                          title="Print Thermal / Sticker Label"
                          className="px-2 py-1 bg-surface hover:bg-subtle text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong rounded font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98] shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-text-muted" />
                          <span>Label</span>
                        </button>

                        {batch.current_balance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedBatchForUsage(batch)
                              setUsageModalOpen(true)
                            }}
                            title="Issue Stock to Counter / Prescription"
                            className="px-2 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 rounded font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98] shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Issue</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* Modals */}
      <PrepackBatchCreateModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={() => loadData()}
        items={items}
      />

      <PrepackLabelPrintModal
        isOpen={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        batch={selectedBatchForLabel}
      />

      <PrepackUsageModal
        isOpen={usageModalOpen}
        onClose={() => {
          setUsageModalOpen(false)
          setSelectedBatchForUsage(null)
        }}
        onSuccess={() => loadData()}
        items={items}
        preselectedBatch={selectedBatchForUsage}
      />
    </div>
  )
}

export default PrepackBatchListPage
