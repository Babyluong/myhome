// src/modules/myprepacking/pages/PrepackKewPs4LedgerPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  ArrowRightLeft,
  PackageCheck,
  FastForward,
  Scale,
  ShieldCheck,
  Printer,
  Download,
  RefreshCw,
  Boxes,
  Package,
  Calendar,
  AlertTriangle,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Layers,
  History,
  CheckCircle2,
  X
} from 'lucide-react'
import {
  getPrepackLedgerItems,
  getPrepackKewPs4Transactions,
  getPrepackStoreVerifications,
  exportPrepackKewPs4Pdf,
  exportPrepackKewPs4Csv,
  PrepackLedgerItemWithBalances
} from '../services/prepackKewPs4Service'
import type { PrepackKewPs4Transaction, PrepackStoreVerification } from '../types/prepack'
import { PrepackCheckFoundModal } from '../components/PrepackCheckFoundModal'
import { PrepackStoreVerificationModal } from '../components/PrepackStoreVerificationModal'
import { PrepackBringForwardModal } from '../components/PrepackBringForwardModal'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'

export const PrepackKewPs4LedgerPage: React.FC = () => {
  const toast = useToast()
  const { user } = useAuthStore()
  const hospitalId = user?.hospital_id

  // Data states
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)
  const [items, setItems] = useState<PrepackLedgerItemWithBalances[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [transactions, setTransactions] = useState<PrepackKewPs4Transaction[]>([])
  const [verifications, setVerifications] = useState<PrepackStoreVerification[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showVerifDrawer, setShowVerifDrawer] = useState(false)

  // Modals
  const [checkFoundModalOpen, setCheckFoundModalOpen] = useState(false)
  const [storeVerifModalOpen, setStoreVerifModalOpen] = useState(false)
  const [bringForwardModalOpen, setBringForwardModalOpen] = useState(false)

  // Load items catalog (active items only)
  const loadItems = async () => {
    setLoadingItems(true)
    try {
      const res = await getPrepackLedgerItems(hospitalId, true)
      const list = (res.data || []).filter(item => item.status === 'active')
      setItems(list)
      if (list.length > 0) {
        setSelectedItemId(prev => {
          if (prev && list.some(i => i.id === prev)) return prev
          return list[0].id
        })
      } else {
        setSelectedItemId('')
      }
    } catch (err) {
      console.error('Error loading prepack ledger items:', err)
      toast.error('Failed to load Bin Card item list')
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [hospitalId])

  // Load transactions when selectedItemId changes
  const loadTransactions = async () => {
    if (!selectedItemId) return
    setLoadingTx(true)
    try {
      const [txRes, verifRes] = await Promise.all([
        getPrepackKewPs4Transactions(hospitalId, selectedItemId, {
          transaction_type: txTypeFilter,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          search: searchQuery || undefined
        }),
        getPrepackStoreVerifications(hospitalId, selectedItemId)
      ])
      setTransactions(txRes.data || [])
      setVerifications(verifRes.data || [])
    } catch (err) {
      console.error('Error loading KEW.PS-4 transactions:', err)
      toast.error('Failed to load ledger transaction records')
    } finally {
      setLoadingTx(false)
    }
  }

  useEffect(() => {
    if (selectedItemId) {
      loadTransactions()
    }
  }, [selectedItemId, txTypeFilter, dateFrom, dateTo, searchQuery])

  const selectedItem = useMemo(() => {
    return items.find(i => i.id === selectedItemId) || null
  }, [items, selectedItemId])

  // Filtered transactions for display
  const filteredTransactions = useMemo(() => {
    return transactions
  }, [transactions])

  const handleRefresh = () => {
    loadItems()
    loadTransactions()
  }

  return (
    <div className="w-full space-y-5">
      {/* 1. Official Header & Statutory Badge */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 uppercase tracking-wider">
                  KEW.PS-4
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-subtle text-text-secondary border border-border-subtle">
                  TPS 1PP (Government Store Management Procedure)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-subtle text-text-muted border border-border-subtle">
                  Pre-pack &amp; UOD Unit &bull; Lawas Hospital
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary mt-1 tracking-tight">
                KEW.PS-4 Bin Card Ledger (UOD &amp; Prepacking)
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                Official electronic stock ledger adhering to Store Management Procedures (TPS). Tracks bulk movement from Main Store, pre-pack transfers, and finished UOD batch balances.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Statutory Utilities */}
            <button
              onClick={() => setBringForwardModalOpen(true)}
              title="Bring Forward (Previous Card Balance)"
              className="min-h-[36px] px-3 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FastForward className="w-3.5 h-3.5 text-text-muted" />
              <span>B.F.</span>
            </button>

            <button
              onClick={() => setCheckFoundModalOpen(true)}
              title="Physical Stock Check & Audit (KEW.PS-10)"
              className="min-h-[36px] px-2.5 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 text-text-muted" />
              <span className="hidden md:inline">Stock Audit</span>
            </button>

            <button
              onClick={() => setStoreVerifModalOpen(true)}
              title="Annual Store Verification (KEW.PS-14)"
              className="min-h-[36px] px-2.5 py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden md:inline">KEW.PS-14</span>
            </button>

            <button
              disabled={!selectedItem}
              onClick={() => selectedItem && exportPrepackKewPs4Pdf(selectedItem, filteredTransactions)}
              title="Print KEW.PS-4 PDF Form (Official Form)"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs flex items-center justify-center"
            >
              <Printer className="w-4 h-4 text-text-muted" />
            </button>

            <button
              disabled={!selectedItem}
              onClick={() => selectedItem && exportPrepackKewPs4Csv(selectedItem, filteredTransactions)}
              title="Export Ledger CSV File"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs flex items-center justify-center"
            >
              <Download className="w-4 h-4 text-text-muted" />
            </button>

            <button
              onClick={handleRefresh}
              title="Refresh Ledger Data"
              className="min-h-[36px] min-w-[36px] p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors cursor-pointer shadow-xs flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 text-text-muted ${loadingTx || loadingItems ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Drug Item Selector & Live 3-Tier Multi-Echelon Metrics */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs space-y-4">
        {/* Drug Selector Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-border-subtle">
          <div className="flex-1 max-w-xl">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Select Medication / UOD Item Bin Card
            </label>
            <select
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              disabled={items.length === 0}
              className="w-full px-3 py-2 text-sm bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong focus:ring-2 focus:ring-teal-500/20 rounded-lg text-text-primary font-medium transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {items.length === 0 ? (
                <option value="">No active medications found in catalog</option>
              ) : (
                items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} [{item.item_code}] - {item.dosage_form.toUpperCase()} ({item.pack_type})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-text-muted">Buffer Status:</span>
              <span className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                selectedItem.needs_repack 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {selectedItem.needs_repack ? '⚠️ REPACK NEEDED' : '✓ STABLE STOCK'}
              </span>
              <button
                onClick={() => setShowVerifDrawer(!showVerifDrawer)}
                className="px-2.5 py-1 bg-surface hover:bg-subtle text-text-secondary rounded-md font-medium text-xs border border-border-default hover:border-border-strong flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <History className="w-3.5 h-3.5 text-text-muted" />
                <span>Verifications ({verifications.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* 3-Tier Multi-Echelon Metric Cards (Clinical Density & Hairline Restraint) */}
        {selectedItem && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* Tier 1: Main Store */}
            <div className="p-3.5 rounded-xl bg-subtle/40 hover:bg-subtle/70 border border-border-subtle relative transition-colors duration-150">
              <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-text-muted">
                  <Building2 className="w-3.5 h-3.5" />
                  Tier 1: Main Store
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-medium">Bulk</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
                {selectedItem.store_bulk_stock.toLocaleString()}
                <span className="text-xs font-normal text-text-muted ml-1">units</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Current bulk inventory in Main Pharmacy Store.
              </p>
            </div>

            {/* Tier 2: Prepack Counter */}
            <div className="p-3.5 rounded-xl bg-subtle/40 hover:bg-subtle/70 border border-border-subtle relative transition-colors duration-150">
              <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-text-muted">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Tier 2: Prepack Counter
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-medium">Raw</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
                {selectedItem.counter_raw_stock.toLocaleString()}
                <span className="text-xs font-normal text-text-muted ml-1">units</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Transferred from store, awaiting packaging into UOD.
              </p>
            </div>

            {/* Tier 3: Finished Packs */}
            <div className="p-3.5 rounded-xl bg-subtle/40 hover:bg-subtle/70 border border-border-subtle relative transition-colors duration-150">
              <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-text-muted">
                  <PackageCheck className="w-3.5 h-3.5" />
                  Tier 3: Finished Packs
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-medium">UOD Packs</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
                {selectedItem.finished_packs_stock.toLocaleString()}
                <span className="text-xs font-normal text-text-muted ml-1">packs ({selectedItem.finished_packs_stock * selectedItem.units_per_pack} units)</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Sealed UOD packs ready for distribution/dispensing.
              </p>
            </div>

            {/* Aggregate Total */}
            <div className="p-3.5 rounded-xl bg-subtle/40 hover:bg-subtle/70 border border-border-subtle relative transition-colors duration-150">
              <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-text-muted">
                  <Boxes className="w-3.5 h-3.5" />
                  Facility Aggregate Total
                </span>
                <span className="text-[10px] bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 px-1.5 py-0.5 rounded font-mono font-medium">Total</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono tabular-nums tracking-tight mt-1">
                {selectedItem.total_aggregate_units.toLocaleString()}
                <span className="text-xs font-normal text-text-muted ml-1">units</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Total active stock across all tiers in Lawas Hospital.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Verification History Drawer */}
      {showVerifDrawer && (
        <div className="p-4 bg-surface rounded-xl border border-border-default shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Annual Store Verification Records (KEW.PS-14)</span>
            </h3>
            <button
              onClick={() => setShowVerifDrawer(false)}
              className="p-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {verifications.length === 0 ? (
            <div className="text-xs text-text-muted p-4 text-center bg-subtle/50 rounded-lg border border-border-subtle">
              No annual KEW.PS-14 physical inspection records found for this item.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Physical Count</th>
                    <th className="py-2.5 px-3">Bin Card Balance</th>
                    <th className="py-2.5 px-3">Discrepancy</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Verifying Officer</th>
                    <th className="py-2.5 px-3">Verification Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary">
                  {verifications.map(v => (
                    <tr key={v.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold font-mono">{v.verification_year}</td>
                      <td className="py-2.5 px-3 font-mono">{v.physical_count} packs</td>
                      <td className="py-2.5 px-3 font-mono">{v.kewps_balance} packs</td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${v.diff_physical_kewps === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {v.diff_physical_kewps > 0 ? `+${v.diff_physical_kewps}` : v.diff_physical_kewps}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          v.is_tally 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {v.is_tally ? 'TALLY' : 'DISCREPANCY'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        {v.verifier_name} {v.verifier_jawatan ? `(${v.verifier_jawatan})` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-text-muted font-mono">
                        {new Date(v.verified_at).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Filters & Search */}
      <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search reference no., batch, officer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary placeholder:text-text-muted outline-none transition-colors"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <select
            value={txTypeFilter}
            onChange={e => setTxTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong rounded-lg text-text-secondary font-medium outline-none cursor-pointer"
          >
            <option value="all">All Transaction Types</option>
            <option value="store_to_counter">Store to Counter Transfer</option>
            <option value="production_prepack">UOD Packaging Session</option>
            <option value="counter_dispense">Counter Distribution / Prescription</option>
            <option value="bring_forward">Bring Forward (B.F.)</option>
            <option value="check_found">Stock Audit (Physical Check)</option>
            <option value="store_verification">Store Verification (KEW.PS-14)</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-2 py-1 text-xs bg-subtle/70 hover:bg-subtle border border-border-default rounded-lg text-text-secondary outline-none font-mono"
          />
          <span className="text-xs text-text-muted">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-2 py-1 text-xs bg-subtle/70 hover:bg-subtle border border-border-default rounded-lg text-text-secondary outline-none font-mono"
          />

          {(dateFrom || dateTo || searchQuery || txTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setSearchQuery('')
                setTxTypeFilter('all')
              }}
              className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-2 py-1 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 5. Chronological KEW.PS-4 Transaction Ledger Table */}
      <div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3.5 text-text-muted">
              <FileText className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              No Bin Card Transaction Records Found
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              No store stock movements, UOD packaging sessions, or transactions recorded for this item's bin card yet.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Zero Horizontal Scrolling) */}
            <div className="block md:hidden divide-y divide-border-subtle">
              {filteredTransactions.map((tx, idx) => {
                const isTransfer = tx.transaction_type === 'store_to_counter'
                const isProduction = tx.transaction_type === 'production_prepack'
                const isDispense = tx.transaction_type === 'counter_dispense'
                const isBF = tx.transaction_type === 'bring_forward'
                const isCheckFound = tx.transaction_type === 'check_found'
                const isVerif = tx.transaction_type === 'store_verification'

                return (
                  <div key={tx.id} className="p-4 space-y-2 bg-surface text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-text-muted">#{idx + 1}</span>
                        <div>
                          <div className="font-bold text-text-primary text-xs">
                            {new Date(tx.transaction_date).toLocaleDateString('en-GB')}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono">
                            {new Date(tx.transaction_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {(tx.receipt_qty || 0) > 0 && (
                          <div className="font-mono font-bold text-emerald-500 text-sm">
                            +{tx.receipt_qty}
                          </div>
                        )}
                        {(tx.issue_qty || 0) > 0 && (
                          <div className="font-mono font-bold text-rose-500 text-sm">
                            -{tx.issue_qty}
                          </div>
                        )}
                        <div className="text-[10px] text-text-muted">
                          Bal: <span className="font-mono font-black text-text-primary">{tx.balance_qty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isTransfer ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        isProduction ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                        isDispense ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        isBF ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        isCheckFound ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-subtle text-text-muted border border-border-subtle'
                      }`}>
                        {isTransfer ? 'Store Transfer' :
                         isProduction ? 'Prepack Production' :
                         isDispense ? 'Counter Dispense' :
                         isBF ? 'Bring Forward' :
                         isCheckFound ? 'Check / Found' :
                         isVerif ? 'Store Verification' : tx.transaction_type}
                      </span>

                      {tx.reference_no && (
                        <span className="font-mono text-[11px] text-text-secondary font-semibold">
                          Ref: {tx.reference_no}
                        </span>
                      )}
                    </div>

                    <div className="bg-subtle/30 rounded p-2 border border-border-subtle flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-text-muted">Party: </span>
                        <span className="font-medium text-text-primary">{tx.source_destination || '-'}</span>
                      </div>
                      <div className="text-text-muted">
                        Officer: <span className="font-medium text-text-primary">{tx.officer_name}</span>
                      </div>
                    </div>

                    {(tx.remarks || tx.batch_number) && (
                      <div className="text-[10px] text-text-muted truncate">
                        {tx.batch_number ? `Batch: ${tx.batch_number} • ` : ''}{tx.remarks || ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider border-b border-border-default">
                <tr>
                  <th className="py-3 px-3 text-center">No.</th>
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3">Reference No. / PK</th>
                  <th className="py-3 px-3">Transaction Type</th>
                  <th className="py-3 px-3">Received From / Issued To</th>
                  <th className="py-3 px-3 text-right">Receipt (+)</th>
                  <th className="py-3 px-3 text-right">Issue (-)</th>
                  <th className="py-3 px-3 text-right">Card Balance</th>
                  <th className="py-3 px-3">Officer / Sign</th>
                  <th className="py-3 px-3">Remarks / Batch No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {filteredTransactions.map((tx, idx) => {
                  const isTransfer = tx.transaction_type === 'store_to_counter'
                  const isProduction = tx.transaction_type === 'production_prepack'
                  const isDispense = tx.transaction_type === 'counter_dispense'
                  const isBF = tx.transaction_type === 'bring_forward'
                  const isCheckFound = tx.transaction_type === 'check_found'
                  const isVerif = tx.transaction_type === 'store_verification'

                  return (
                    <tr key={tx.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-3 px-3 text-center text-text-muted font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-text-primary">
                          {new Date(tx.transaction_date).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {new Date(tx.transaction_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {tx.transaction_number}
                      </td>

                      <td className="py-3 px-3">
                        {isTransfer ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Store &rarr; Counter
                          </span>
                        ) : isProduction ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            UOD Packaging
                          </span>
                        ) : isDispense ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Counter Distribution
                          </span>
                        ) : isBF ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-subtle text-text-muted border border-border-subtle">
                            Brought Forward
                          </span>
                        ) : isCheckFound ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Stock Audit
                          </span>
                        ) : isVerif ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                            KEW.PS-14 Verification
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-subtle text-text-muted">
                            {tx.transaction_type}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium text-text-primary">
                        {tx.source_destination}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {tx.receipt_qty !== null ? `+${tx.receipt_qty}` : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {tx.issue_qty !== null ? `-${tx.issue_qty}` : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-text-primary text-base tabular-nums">
                        {tx.balance_qty}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-text-primary font-medium">
                          {tx.officer_name}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-text-muted max-w-xs truncate">
                        {tx.remarks || tx.batch_number || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* Modals */}
      <PrepackCheckFoundModal
        isOpen={checkFoundModalOpen}
        onClose={() => setCheckFoundModalOpen(false)}
        onSuccess={handleRefresh}
        selectedItem={selectedItem}
      />

      <PrepackStoreVerificationModal
        isOpen={storeVerifModalOpen}
        onClose={() => setStoreVerifModalOpen(false)}
        onSuccess={handleRefresh}
        selectedItem={selectedItem}
      />

      <PrepackBringForwardModal
        isOpen={bringForwardModalOpen}
        onClose={() => setBringForwardModalOpen(false)}
        onSuccess={handleRefresh}
        selectedItem={selectedItem}
      />
    </div>
  )
}

export default PrepackKewPs4LedgerPage
