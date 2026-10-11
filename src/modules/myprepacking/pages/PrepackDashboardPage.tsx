// src/modules/myprepacking/pages/PrepackDashboardPage.tsx
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  FileText,
  RefreshCw,
  FileSpreadsheet,
  FileDown,
  ChevronDown
} from 'lucide-react'
import {
  getPrepackItems,
  getPrepackBatches,
  getPrepackUsageLogs,
  getPrepackDashboardStats,
  exportPrepackReportExcel,
  generatePrepackPdfReport
} from '../services/prepackService'
import type {
  PrepackItem,
  PrepackBatch,
  PrepackUsageLog,
  PrepackDashboardStats
} from '../types/prepack'
import { PrepackBatchCreateModal } from '../components/PrepackBatchCreateModal'
import { PrepackItemModal } from '../components/PrepackItemModal'
import { PrepackUsageModal } from '../components/PrepackUsageModal'
import { PrepackLabelPrintModal } from '../components/PrepackLabelPrintModal'
import { StoreToCounterTransferModal } from '../components/StoreToCounterTransferModal'
import { PrepackKpiCards } from '../components/PrepackKpiCards'
import { CriticalPrepackQueue } from '../components/CriticalPrepackQueue'
import { RecentBatchesPanel } from '../components/RecentBatchesPanel'
import { useToast } from '@/stores/toastStore'
import { Fab } from '@/shared/components/mobile'

export const PrepackDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState<boolean>(true)
  const [items, setItems] = useState<PrepackItem[]>([])
  const [batches, setBatches] = useState<PrepackBatch[]>([])
  const [usageLogs, setUsageLogs] = useState<PrepackUsageLog[]>([])
  const [stats, setStats] = useState<PrepackDashboardStats | null>(null)

  // Export dropdown state
  const [exportOpen, setExportOpen] = useState<boolean>(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Modals state
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false)
  const [itemModalOpen, setItemModalOpen] = useState<boolean>(false)
  const [usageModalOpen, setUsageModalOpen] = useState<boolean>(false)
  const [labelModalOpen, setLabelModalOpen] = useState<boolean>(false)
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)
  const [selectedBatchForLabel, setSelectedBatchForLabel] = useState<PrepackBatch | null>(null)
  const [preselectedItemIdForBatch, setPreselectedItemIdForBatch] = useState<string | undefined>()

  const loadData = async () => {
    setLoading(true)
    try {
      const [itemsRes, batchesRes, usageRes, statsRes] = await Promise.all([
        getPrepackItems(),
        getPrepackBatches(),
        getPrepackUsageLogs(undefined, 10),
        getPrepackDashboardStats()
      ])

      setItems(itemsRes.data || [])
      setBatches(batchesRes.data || [])
      setUsageLogs(usageRes.data || [])
      setStats(statsRes.data || null)
    } catch (err: any) {
      console.error('Error loading prepacking dashboard:', err)
      toast.error('Failed to load MyPrepacking dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpenBatchForSpecificItem = (itemId: string) => {
    setPreselectedItemIdForBatch(itemId)
    setBatchModalOpen(true)
  }

  const handleOpenLabelModal = (batch: PrepackBatch) => {
    setSelectedBatchForLabel(batch)
    setLabelModalOpen(true)
  }

  // Derived KPI values directly from real database items
  const itemsNeedingRepack = useMemo(() => {
    return items.filter(i => (i.total_balance ?? 0) <= i.min_buffer_level).length
  }, [items])

  const zeroStockItems = useMemo(() => {
    return items.filter(i => (i.total_balance ?? 0) <= 0).length
  }, [items])

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-subtle text-text-secondary border border-border-subtle rounded-md flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-text-muted" />
              Pharmacy Prepacking System (UOD & Bulk)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            MyPrepacking Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Operational buffer monitoring, UOD packaging queue, BUD tracking & batch dispatch.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {/* Primary Action: New Prepack */}
          <button
            onClick={() => {
              setPreselectedItemIdForBatch(undefined)
              setBatchModalOpen(true)
            }}
            className="flex-1 sm:flex-initial min-h-[38px] px-4 py-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/40"
          >
            <Plus className="w-4 h-4" />
            <span>New Prepack</span>
          </button>

          {/* Secondary Action: Store Transfer */}
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex-1 sm:flex-initial min-h-[38px] px-3.5 py-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-primary border border-border-default hover:border-border-strong rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-text-muted" />
            <span>Store Transfer</span>
          </button>

          {/* Export Menu Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="min-h-[38px] px-3 py-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-text-muted" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-surface rounded-lg shadow-md border border-border-default py-1 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    exportPrepackReportExcel(items, batches, usageLogs)
                    setExportOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-subtle flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export to Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    generatePrepackPdfReport(items, batches, usageLogs)
                    setExportOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-subtle flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span>PDF Summary Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Refresh Data */}
          <button
            onClick={loadData}
            title="Refresh Prepacking Data"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 bg-surface hover:bg-subtle active:scale-[0.98] text-text-muted hover:text-text-primary rounded-lg border border-border-default hover:border-border-strong transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Focused Operational KPIs */}
      <PrepackKpiCards
        loading={loading}
        itemsNeedingRepack={itemsNeedingRepack}
        zeroStockItems={zeroStockItems}
        todayPackedUnits={stats?.today_packed_units ?? 0}
        batchesExpiringSoon={stats?.batches_expiring_soon ?? 0}
      />

      {/* Main Split View: 60% Critical Work Queue / 40% Recent Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (60% / 7 cols): Critical Prepack Work Queue */}
        <div className="lg:col-span-7">
          <CriticalPrepackQueue
            items={items}
            loading={loading}
            onPackNow={handleOpenBatchForSpecificItem}
            onViewCatalog={() => navigate('/prepacking/catalog?filter=repack')}
          />
        </div>

        {/* Right Column (40% / 5 cols): Recent Prepack Batches Feed */}
        <div className="lg:col-span-5">
          <RecentBatchesPanel
            batches={batches}
            loading={loading}
            onPrintLabel={handleOpenLabelModal}
            onViewAllBatches={() => navigate('/prepacking/batches')}
          />
        </div>
      </div>

      {/* Modals */}
      <PrepackBatchCreateModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={(createdBatch, shouldOpenPrint) => {
          loadData()
          if (shouldOpenPrint) {
            handleOpenLabelModal(createdBatch)
          }
        }}
        items={items}
        preselectedItemId={preselectedItemIdForBatch}
      />

      <PrepackItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSuccess={() => loadData()}
        defaultCategory="uod"
      />

      <PrepackUsageModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        onSuccess={() => loadData()}
        items={items}
      />

      <StoreToCounterTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={() => loadData()}
        items={items}
      />

      <PrepackLabelPrintModal
        isOpen={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        batch={selectedBatchForLabel}
      />

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => {
          setPreselectedItemIdForBatch(undefined)
          setBatchModalOpen(true)
        }} 
        aria-label="New Prepack Batch" 
      />
    </div>
  )
}

export default PrepackDashboardPage
