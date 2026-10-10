// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Package, 
  LayoutDashboard,
  Pill,
  Layers,
  AlertTriangle,
  Clock,
  TrendingDown,
  ScrollText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { 
  getStockLevelSummary, 
  getNearExpiryItems, 
  getSlowMovingItems 
} from '@/modules/inventory/services/inventoryService'

export const InventorySubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  const [metrics, setMetrics] = useState({
    totalItems: 0,
    lowStockCount: 0,
    nearExpiryCount: 0,
    slowMovingCount: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [summaryRes, expiryRes, slowRes] = await Promise.all([
          getStockLevelSummary(hospitalId),
          getNearExpiryItems(hospitalId, 180),
          getSlowMovingItems(hospitalId, 90)
        ])

        const summaryData = summaryRes.data || []
        const expiryData = expiryRes.data || []
        const slowData = slowRes.data || []

        const lowStock = summaryData.filter(
          (item: any) => item.status === 'out_of_stock' || item.status === 'low_stock'
        ).length

        setMetrics({
          totalItems: summaryData.length,
          lowStockCount: lowStock,
          nearExpiryCount: expiryData.length,
          slowMovingCount: slowData.length,
          loading: false
        })
      } catch (err) {
        console.error('Failed to load MyInventory submenu stats', err)
        setMetrics(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [hospitalId])

  const menuItems = [
    {
      title: 'Inventory Overview Dashboard',
      description: 'Live telemetry overview of hospital stock holdings, shortage alerts, and warehouse movement trends.',
      icon: LayoutDashboard,
      path: ROUTES.PHARMACY_INVENTORY,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: metrics.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : metrics.totalItems > 0 ? (
        `${metrics.totalItems} Items`
      ) : null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    },
    {
      title: 'Facility Drug Inventory',
      description: 'Registered clinical pharmaceutical stock, live unit quantities, active batch tracking, and min-max buffers.',
      icon: Pill,
      path: ROUTES.PHARMACY_FACILITY_DRUGS,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Clinical',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      title: 'Non-Drug & Consumables Inventory',
      description: 'Medical consumables, clinical disposables, surgical instruments, and laboratory chemical stock.',
      icon: Layers,
      path: ROUTES.PHARMACY_FACILITY_NON_DRUGS,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: null
    },
    {
      title: 'Buffer Level & Reorder Status',
      description: 'Safety buffer monitoring, lead-time thresholds, and auto-generated indent reorder flags.',
      icon: TrendingDown,
      path: ROUTES.PHARMACY_BUFFER_LEVEL,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: metrics.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : metrics.lowStockCount > 0 ? (
        `${metrics.lowStockCount} Low`
      ) : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      title: 'Near-Expiry Stock Watch',
      description: 'Batch expiry monitoring within 180 days to trigger inter-facility mobilization or vendor credit returns.',
      icon: Clock,
      path: ROUTES.PHARMACY_NEAR_EXPIRY,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: metrics.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : metrics.nearExpiryCount > 0 ? (
        `${metrics.nearExpiryCount} Expiring`
      ) : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    },
    {
      title: 'Slow-Moving Stock Analysis',
      description: 'Stagnant stock analysis exceeding 90 days of zero issues to prevent capital tie-up and obsolescence.',
      icon: AlertTriangle,
      path: ROUTES.PHARMACY_SLOW_MOVING,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      badge: null
    },
    {
      title: 'Official KEW.PS-4 Ledger',
      description: 'Statutory government warehouse treasury ledger tracking delivery orders, issues, and physical audit balances.',
      icon: ScrollText,
      path: ROUTES.PHARMACY_LEDGER,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'TPS Treasury',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      title: 'Storage Locations & Bin Registry',
      description: 'Physical rack configurations, cold room zones, aisle layouts, and bin tag barcode mapping.',
      icon: MapPin,
      path: ROUTES.PHARMACY_STORE_LOCATIONS,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: null
    }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* Back navigation */}
      <div className="mb-6 sm:mb-8">
        <button 
          onClick={() => navigate(ROUTES.HUB)}
          className="min-h-[44px] flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 sm:mb-6 group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Main Hub</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-3 sm:p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Package className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyInventory</h1>
                <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">
                  Hospital Inventory System
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Hospital Central Store, Pharmaceutical/Consumable Stock Control & KEW.PS-4 Ledger
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Items</span>
            <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {metrics.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : metrics.totalItems}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Drugs & Consumables</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {metrics.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : metrics.lowStockCount}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Below safety buffer</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Near Expiry</span>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {metrics.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : metrics.nearExpiryCount}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Action needed</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Slow-Moving</span>
            <TrendingDown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-yellow-400 min-h-[36px] flex items-center">
            {metrics.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : metrics.slowMovingCount}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">&gt; 90 days stagnant</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYINVENTORY MODULES & OPERATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/40 hover:border-slate-700/80 active:scale-[0.98] transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {item.badge && (
                      typeof item.badge === 'string' ? (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            item.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        item.badge
                      )
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400/80 group-hover:text-blue-300 transition-colors mt-auto pt-2">
                  <span>Open Module</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default InventorySubMenu
