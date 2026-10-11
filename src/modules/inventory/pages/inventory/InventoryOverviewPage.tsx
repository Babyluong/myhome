// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, 
  Package, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  Layers, 
  Info,
  Calendar,
  AlertOctagon,
  FileText,
  QrCode,
  Database
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Table, Spinner, Input, Badge, Button } from '@/components/ui'
import { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getStockLevelSummary, 
  getNearExpiryItems, 
  getSlowMovingItems, 
  getStockTransactions,
  getFastMovingItems
} from '../../services/inventoryService'
import { useInventoryStore } from '../../context/InventoryStoreContext'
import { StoreLocationSelector } from '../../components/StoreLocationSelector'
import { isPharmacyLogisticsUser } from '@/shared/utils/inventoryRbac'
import { Fab } from '@/shared/components/mobile/Fab'
import type { StockLevelSummary, ExpiryItem, SlowMovingItem, StockTransaction } from '@/types/pharmacy'

export const InventoryOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { language, t } = useLanguage()
  const { activeStore, activeStoreId, isConsolidatedView } = useInventoryStore()
  const hospitalId = user?.hospital_id
  const isLogisticsUser = isPharmacyLogisticsUser(user)

  // State lists
  const [items, setItems] = useState<StockLevelSummary[]>([])
  const [nearExpiry, setNearExpiry] = useState<ExpiryItem[]>([])
  const [slowMoving, setSlowMoving] = useState<SlowMovingItem[]>([])
  const [fastMoving, setFastMoving] = useState<any[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  
  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'drug' | 'non_drug' | 'low_stock' | 'near_expiry' | 'slow_moving' | 'fast_moving'>('low_stock')

  // Rollup Metrics
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    lowStockCount: 0,
    nearExpiryCount: 0,
    slowMovingCount: 0,
    fastMovingCount: 0,
  })

  // Rolling Average Monthly Consumption (AMC) map
  const [amcMap, setAmcMap] = useState<Map<string, number>>(new Map())

  // Load dashboard data
  useEffect(() => {
    if (!hospitalId) return

    const loadDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const effectiveStoreId = activeStoreId || undefined
        const [summaryRes, expiryRes, slowRes, fastRes, txnRes] = await Promise.all([
          getStockLevelSummary(hospitalId, undefined, effectiveStoreId),
          getNearExpiryItems(hospitalId, 180, effectiveStoreId), // near expiry within 180 days (less than 6 months)
          getSlowMovingItems(hospitalId, 90, effectiveStoreId),
          getFastMovingItems(hospitalId, 90, effectiveStoreId),
          getStockTransactions(hospitalId, { transaction_type: 'issue', store_location_id: effectiveStoreId })
        ])

        const summaryData = summaryRes.data || []
        const expiryData = expiryRes.data || []
        const slowData = slowRes.data || []
        const fastData = fastRes.data || []
        const txnData = txnRes.data || []

        setItems(summaryData)
        setNearExpiry(expiryData)
        setSlowMoving(slowData)
        setFastMoving(fastData)
        setTransactions(txnData)

        // Calculate rolling AMC for each item based on last 90 days of issue transactions
        const localAmcMap = new Map<string, number>()
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        txnData.forEach((t: any) => {
          const txnDate = new Date(t.transaction_date || t.created_at)
          if (txnDate >= ninetyDaysAgo && t.transaction_type === 'issue') {
            const key = t.item_id
            const currentQty = localAmcMap.get(key) || 0
            localAmcMap.set(key, currentQty + (t.quantity || 0))
          }
        })

        // Divide by 3 to get monthly average
        const amcDividedMap = new Map<string, number>()
        localAmcMap.forEach((totalQty, itemId) => {
          amcDividedMap.set(itemId, parseFloat((totalQty / 3).toFixed(1)))
        })
        setAmcMap(amcDividedMap)

        // Calculate item-focused unique counts
        const total = summaryData.length
        
        // Low stock: items below min_stock, or status is low_stock/critical/out_of_stock
        const low = summaryData.filter(i => 
          i.status === 'low_stock' || 
          i.status === 'critical' || 
          i.status === 'out_of_stock' || 
          i.current_stock <= (i.min_stock || 0)
        ).length

        // Near Expiry: count of unique items expiring in < 180 days
        const nearExpiryUniqueCount = new Set(expiryData.map(e => e.item_id)).size

        // Slow Moving: count of unique items matching slowMoving list
        const slowCount = slowData.length

        // Fast Moving: count of unique items matching fastMoving list
        const fastCount = fastData.length

        setMetrics({
          totalItems: total,
          lowStockCount: low,
          nearExpiryCount: nearExpiryUniqueCount,
          slowMovingCount: slowCount,
          fastMovingCount: fastCount
        })

      } catch (err) {
        console.error('Error loading dashboard stats:', err)
        setError('Gagal memuatkan data ringkasan inventori.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboardData()
  }, [hospitalId, activeStoreId])

  const renderStatusBadge = (status: StockLevelSummary['status']) => {
    const map: Record<
      StockLevelSummary['status'],
      { color: 'success' | 'warning' | 'error' | 'secondary'; labelEn: string; labelMs: string }
    > = {
      in_stock: { color: 'success', labelEn: 'In Stock', labelMs: 'Dalam Stok' },
      low_stock: { color: 'warning', labelEn: 'Low Stock', labelMs: 'Kekurangan' },
      critical: { color: 'error', labelEn: 'Critical', labelMs: 'Kritikal' },
      out_of_stock: { color: 'secondary', labelEn: 'Out of Stock', labelMs: 'Tiada Stok' },
    }
    const cfg = map[status] || { color: 'secondary', labelEn: status, labelMs: status }
    return <Badge variant={cfg.color}>{language === 'ms' ? cfg.labelMs : cfg.labelEn}</Badge>
  }

  // Filter items based on active tab and search query
  const getFilteredItems = () => {
    let filtered = [...items]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(i => 
        i.item_code.toLowerCase().includes(q) || 
        i.item_name.toLowerCase().includes(q)
      )
    }

    if (activeTab === 'drug') {
      filtered = filtered.filter(i => i.item_type === 'drug')
    } else if (activeTab === 'non_drug') {
      filtered = filtered.filter(i => i.item_type === 'non_drug')
    } else if (activeTab === 'low_stock') {
      filtered = filtered.filter(i => 
        i.status === 'low_stock' || 
        i.status === 'critical' || 
        i.status === 'out_of_stock' || 
        i.current_stock <= (i.min_stock || 0)
      )
    } else if (activeTab === 'near_expiry') {
      const expiringItemIds = new Set(nearExpiry.map(e => e.item_id))
      filtered = filtered.filter(i => expiringItemIds.has(i.item_id))
    } else if (activeTab === 'slow_moving') {
      const slowItemIds = new Set(slowMoving.map(s => s.item_id))
      filtered = filtered.filter(i => slowItemIds.has(i.item_id))
    } else if (activeTab === 'fast_moving') {
      const fastItemIds = new Set(fastMoving.map(f => f.item_id))
      filtered = filtered.filter(i => fastItemIds.has(i.item_id))
    }

    return filtered
  }

  // Calculate recommended purchases based on Min/Max levels
  const getRecommendedPurchases = () => {
    return items
      .filter(i => i.status === 'low_stock' || i.status === 'critical' || i.current_stock <= i.min_stock)
      .map(i => {
        const minVal = i.min_stock || 0
        const currentVal = i.current_stock || 0
        const maxVal = i.max_stock || (minVal * 3) // estimate max if undefined
        const suggestedQty = Math.max(0, maxVal - currentVal)
        
        // Find if this item has near expiry batches
        const nearExpiryBatch = nearExpiry.find(e => e.item_id === i.item_id)
        
        // Find if this item is fast moving
        const fastMovingItem = fastMoving.find(f => f.item_id === i.item_id)

        // Formulate reason
        let reason = ''
        if (currentVal === 0) {
          reason = language === 'ms' ? 'No stock balance in storage' : 'No stock in storage'
        } else {
          reason = language === 'ms'
            ? `Baki stok semasa (${currentVal}) di bawah paras minimum (${minVal})`
            : `Current stock balance (${currentVal}) is below minimum level (${minVal})`
        }

        if (nearExpiryBatch) {
          reason += language === 'ms'
            ? ` • Batch (${nearExpiryBatch.batch_number}) hampir luput (${nearExpiryBatch.days_to_expiry} hari)`
            : ` • Batch (${nearExpiryBatch.batch_number}) near expiry (${nearExpiryBatch.days_to_expiry} days)`
        }
        if (fastMovingItem) {
          reason += language === 'ms'
            ? ` • Penggunaan tinggi (${fastMovingItem.usage_per_month} unit/bulan)`
            : ` • High consumption (${fastMovingItem.usage_per_month} units/month)`
        }
        
        return {
          ...i,
          suggestedQty,
          reason,
          isCritical: currentVal === 0 || i.status === 'critical',
          isNearExpiry: !!nearExpiryBatch,
          isFastMoving: !!fastMovingItem
        }
      })
      .filter(i => i.suggestedQty > 0)
      .sort((a, b) => {
        // Sort critical first
        if (a.isCritical && !b.isCritical) return -1
        if (!a.isCritical && b.isCritical) return 1
        // Then sort near expiry
        if (a.isNearExpiry && !b.isNearExpiry) return -1
        if (!a.isNearExpiry && b.isNearExpiry) return 1
        // Then sort suggestedQty descending
        return b.suggestedQty - a.suggestedQty
      })
      .slice(0, 5) // Show top 5 urgent purchases
  }

  const filteredItemsList = getFilteredItems()
  const recommendedPurchases = getRecommendedPurchases()

  return (
    <div className="w-full space-y-6 text-text-primary">
      
      {/* Standard Module Header */}
      <ModulePageHeader
        badge={language === 'ms' ? 'EKOSISTEM INVENTORI KKM' : 'MOH INVENTORY ECOSYSTEM'}
        title={language === 'ms' ? 'Inventori Stor Farmasi' : 'Pharmacy Store Inventory'}
        description={
          language === 'ms'
            ? 'Paparan ekosistem inventori masa-nyata bagi bekalan ubat dan bukan ubat mengikut standard Tatacara Pengurusan Stor KKM.'
            : 'Real-time inventory ecosystem view for drug and non-drug supplies following MOH Store Management Procedures standards.'
        }
        icon={<Package className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <StoreLocationSelector />
            <Button
              onClick={() => navigate('/pharmacy/inventory/ledger?openScan=true')}
              className="bg-accent-base hover:bg-accent-dark text-white rounded-lg font-semibold text-xs gap-1.5 px-3.5 py-2 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              {language === 'ms' ? 'Imbas & Transaksi QR' : 'QR Scan & Transaction'}
            </Button>
            {isLogisticsUser ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Katalog Ubat' : 'Drug Catalog'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/non-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Bukan Ubat' : 'Non-Drug'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/facility-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Inventori Ubat' : 'Facility Drugs'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/facility-non-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Inventori Bukan Ubat' : 'Facility Non-Drugs'}
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Metrics Grid Layout (Luxury theme with colored left borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Items */}
        <div className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{language === 'ms' ? 'TOTAL ITEMS' : 'TOTAL ITEMS'}</span>
            <span className="text-2xl font-bold text-text-primary">{metrics.totalItems}</span>
          </div>
          <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Near Expiry */}
        <div className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{language === 'ms' ? 'HAMPIR LUPUT (< 6B)' : 'NEAR EXPIRY (< 6M)'}</span>
            <span className="text-2xl font-black text-orange-600">{metrics.nearExpiryCount}</span>
          </div>
          <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{language === 'ms' ? 'KURANG STOK' : 'LOW STOCK'}</span>
            <span className="text-2xl font-black text-amber-600">{metrics.lowStockCount}</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Slow Moving */}
        <div className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{language === 'ms' ? 'LAMBAT BERGERAK' : 'SLOW MOVING'}</span>
            <span className="text-2xl font-black text-indigo-600">{metrics.slowMovingCount}</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5 rotate-180" />
          </div>
        </div>

        {/* Fast Moving */}
        <div className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{language === 'ms' ? 'CEPAT BERGERAK' : 'FAST MOVING'}</span>
            <span className="text-2xl font-black text-teal-600">{metrics.fastMovingCount}</span>
          </div>
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Content Sections: List & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Ledger & Filters (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-border-default rounded-xl shadow-xs p-5 sm:p-6 space-y-5">
            
            {/* Header + Tabs + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
              <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-slate-400" />
                <span>{language === 'ms' ? 'Kedudukan Stok Semasa' : 'Current Stock Position'}</span>
              </h3>
              
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <Input
                  placeholder={language === 'ms' ? 'Cari kod atau nama...' : 'Search code or name...'}
                  className="pl-9 rounded-xl text-xs py-1.5"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'low_stock', labelEn: 'Low Stock', labelMs: 'Kurang Stok' },
                { id: 'near_expiry', labelEn: 'Near Expiry', labelMs: 'Hampir Luput' },
                { id: 'slow_moving', labelEn: 'Slow Moving', labelMs: 'Lambat Bergerak' },
                { id: 'fast_moving', labelEn: 'Fast Moving', labelMs: 'Cepat Bergerak' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                    activeTab === tab.id 
                      ? 'bg-accent-base border-accent-base text-white shadow-xs' 
                      : 'bg-subtle hover:bg-subtle/80 text-text-secondary border-border-default'
                  }`}
                >
                  {language === 'ms' ? tab.labelMs : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Loading / Error States */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            )}

            {!isLoading && error && (
              <div className="p-6 text-center text-rose-600 text-xs font-bold bg-rose-50 rounded-2xl border border-rose-100">
                {error}
              </div>
            )}

            {/* Table Listing */}
            {!isLoading && !error && (
              <div className="border border-border-default rounded-xl overflow-hidden">
                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.Row className="bg-subtle/50 border-b border-border-default">
                        <Table.Cell as="th" className="text-text-muted font-semibold text-xs py-3">{language === 'ms' ? 'KOD' : 'CODE'}</Table.Cell>
                        <Table.Cell as="th" className="text-text-muted font-semibold text-xs py-3">{language === 'ms' ? 'NAMA ITEM' : 'ITEM NAME'}</Table.Cell>
                        <Table.Cell as="th" className="text-slate-500 font-bold text-xs py-3.5 text-right">{language === 'ms' ? 'CURRENT BALANCE' : 'CURRENT BALANCE'}</Table.Cell>
                        <Table.Cell as="th" className="text-slate-500 font-bold text-xs py-3.5 text-right font-mono">AMC</Table.Cell>
                        <Table.Cell as="th" className="text-slate-500 font-bold text-xs py-3.5 text-right font-mono">MOS</Table.Cell>
                        <Table.Cell as="th" className="text-slate-500 font-bold text-xs py-3.5 text-center">STATUS</Table.Cell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body className="divide-y divide-border-default">
                      {filteredItemsList.length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={6} className="text-center text-slate-400 py-12 text-sm font-medium">
                            {language === 'ms' 
                              ? 'Tiada item inventori ditemui sepadan dengan tapisan anda.'
                              : 'No inventory items found matching your filters.'}
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        filteredItemsList.map(item => {
                          const amcVal = amcMap.get(item.item_id) || 0
                          const mosVal = amcVal > 0 ? parseFloat((item.current_stock / amcVal).toFixed(1)) : null
                          
                          return (
                            <Table.Row key={`${item.item_type}-${item.item_id}`} className="hover:bg-subtle/30 transition-colors">
                              <Table.Cell className="font-mono text-xs font-bold text-slate-500">{item.item_code}</Table.Cell>
                              <Table.Cell className="py-3 text-sm font-black text-slate-800">
                                <div className="flex flex-col">
                                  <span>{item.item_name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                                    {item.item_type} • {item.unit_of_measure}
                                  </span>
                                </div>
                              </Table.Cell>
                              <Table.Cell className="text-right font-mono font-black text-sm text-slate-700">
                                {item.current_stock}
                              </Table.Cell>
                              <Table.Cell className="text-right font-mono text-xs text-slate-500 font-bold">
                                {amcVal > 0 ? `${amcVal}/${language === 'ms' ? 'bln' : 'mo'}` : `0/${language === 'ms' ? 'bln' : 'mo'}`}
                              </Table.Cell>
                              <Table.Cell className="text-right font-mono text-xs font-black">
                                {mosVal !== null ? (
                                  <span className={mosVal < 1.0 ? 'text-rose-600' : mosVal < 2.0 ? 'text-amber-600' : 'text-emerald-600'}>
                                    {mosVal} {language === 'ms' ? 'bln' : 'mo'}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </Table.Cell>
                              <Table.Cell className="text-center">
                                {renderStatusBadge(item.status)}
                              </Table.Cell>
                            </Table.Row>
                          )
                        })
                      )}
                    </Table.Body>
                  </Table>
                </div>

                {/* Mobile View: Native App Responsive Cards (Zero Horizontal Scrolling) */}
                <div className="md:hidden divide-y divide-border-default bg-surface">
                  {filteredItemsList.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 px-4 text-xs font-medium">
                      {language === 'ms' 
                        ? 'Tiada item inventori ditemui sepadan dengan tapisan anda.'
                        : 'No inventory items found matching your filters.'}
                    </div>
                  ) : (
                    filteredItemsList.map(item => {
                      const amcVal = amcMap.get(item.item_id) || 0
                      const mosVal = amcVal > 0 ? parseFloat((item.current_stock / amcVal).toFixed(1)) : null
                      
                      return (
                        <div 
                          key={`${item.item_type}-${item.item_id}`} 
                          className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Top Row: Code & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                              {item.item_code}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>

                          {/* Item Name & Details */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                              {item.item_name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              {item.item_type} • {item.unit_of_measure}
                            </span>
                          </div>

                          {/* Metrics Grid Chip */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <div>
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                                {language === 'ms' ? 'Baki Semasa' : 'Balance'}
                              </span>
                              <span className="font-mono font-black text-xs text-slate-800">
                                {item.current_stock}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                                AMC
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-600">
                                {amcVal > 0 ? `${amcVal}` : '0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                                MOS
                              </span>
                              {mosVal !== null ? (
                                <span className={`font-mono font-bold text-xs ${mosVal < 1.0 ? 'text-rose-600' : mosVal < 2.0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {mosVal} {language === 'ms' ? 'bln' : 'mo'}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Alert Lists & Procurement suggestions (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          

          {/* Recommended Purchases (Pembelian Disyorkan) */}
          <div className="bg-surface border border-border-default rounded-xl shadow-xs p-5 space-y-4 relative overflow-hidden">
            
            
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 border-b border-border-default pb-3">
              <ShoppingBag className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>{language === 'ms' ? 'Saranan Pembelian' : 'Purchase Suggestions'}</span>
              <Badge variant="danger" className="ml-auto text-[9px] font-black uppercase">
                {language === 'ms' ? 'Tindakan Segera' : 'Urgent Action'}
              </Badge>
            </h4>
            
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              {language === 'ms' 
                ? 'Senarai item di bawah paras keselamatan minimum. Segera mulakan perolehan pembekal untuk menjamin kesinambungan penjagaan pesakit.'
                : 'List of items below minimum safety stock. Initiate supplier procurement immediately to ensure patient care continuity.'}
            </p>
            
            {recommendedPurchases.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                {language === 'ms' 
                  ? 'Stok mencukupi. Tiada saranan pembelian baru buat masa ini.'
                  : 'Sufficient stock. No purchase suggestions at this time.'}
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {recommendedPurchases.map(p => (
                  <div key={`${p.item_type}-${p.item_id}`} className="bg-subtle/30 border border-border-default rounded-lg p-3 space-y-2 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 max-w-[70%]">
                        <span className="font-black text-slate-800 text-[11px] block leading-tight">{p.item_name}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.isCritical ? (
                            <Badge variant="danger" className="text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-wide">
                              {language === 'ms' ? 'Kritikal' : 'Critical'}
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-wide">
                              {language === 'ms' ? 'Stok Rendah' : 'Low Stock'}
                            </Badge>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {language === 'ms' ? 'Baki' : 'Bal'}: {p.current_stock} / Min: {p.min_stock}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
                          {language === 'ms' ? 'Saran Beli' : 'Suggested Buy'}
                        </span>
                        <span className="font-mono font-black text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg block mt-0.5">+{p.suggestedQty} unit</span>
                      </div>
                    </div>
                    
                    <div className="text-[9.5px] text-slate-500 bg-slate-50 p-2 rounded-xl font-medium leading-normal border border-slate-100/50 flex items-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{p.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for fast QR action */}
      <div className="sm:hidden">
        <Fab
          icon={<QrCode className="w-5 h-5" />}
          onClick={() => navigate('/pharmacy/inventory/ledger?openScan=true')}
          ariaLabel="QR Scan & Transaction"
        />
      </div>
    </div>
  )
}

export default InventoryOverviewPage
