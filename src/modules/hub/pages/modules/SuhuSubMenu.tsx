// src/modules/hub/pages/modules/SuhuSubMenu.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Thermometer, 
  LayoutDashboard, 
  AlertTriangle, 
  Settings, 
  FileText,
  Activity,
  CheckCircle,
  Plus
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { getUnitPemantauan, getBreachLogs } from '@/modules/mysuhu/services/suhuService'
import { useAuthStore } from '@/stores/authStore'
import { Badge, Skeleton } from '@/components/ui'

import { useLanguage } from '@/shared/contexts/LanguageContext'

export const SuhuSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || 'hosp-1'
  
  const [stats, setStats] = useState({
    totalUnits: 0,
    activeBreaches: 0,
    warningUnits: 0,
    normalUnits: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: units } = await getUnitPemantauan()
        const { data: breaches } = await getBreachLogs(hospitalId)
        
        const totalUnits = units?.length || 0
        const activeBreaches = breaches?.filter(b => !b.is_corrected).length || 0
        const warningUnits = units?.filter(u => u.status_pemantauan === 'warning').length || 0
        const normalUnits = units?.filter(u => u.status_pemantauan === 'normal').length || 0
        
        setStats({
          totalUnits,
          activeBreaches,
          warningUnits,
          normalUnits,
          loading: false
        })
      } catch (e) {
        console.error('Failed to load submenu stats', e)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [hospitalId])

  const menuItems = [
    {
      title: 'Temperature Dashboard',
      description: 'Live telemetry overview of all ward refrigerators, ultra-cold freezers, and specimen storage rooms.',
      icon: LayoutDashboard,
      path: ROUTES.HUB_SUHU_DASHBOARD,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-20 rounded-full" />
      ) : stats.activeBreaches > 0 ? (
        `${stats.activeBreaches} Breaches`
      ) : null,
      badgeColor: 'bg-rose-500 text-white border-transparent'
    },
    {
      title: 'Temperature Breach Log',
      description: 'Out-of-range temperature incident records, MSQH compliance audit trail, and corrective action workflows.',
      icon: AlertTriangle,
      path: ROUTES.HUB_SUHU_BREACHES,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-24 rounded-full" />
      ) : stats.activeBreaches > 0 ? (
        'Action Required'
      ) : null,
      badgeColor: 'bg-amber-500 text-slate-900 border-transparent'
    },
    {
      title: 'Unit Registry & Configuration',
      description: 'Register new cooling units, assign ward physical locations, and configure threshold ranges (Min/Max °C).',
      icon: Settings,
      path: ROUTES.HUB_SUHU_ADMIN,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
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
            <div className="p-3 sm:p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Thermometer className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MySuhu</h1>
                <Badge variant="gray" className="border-rose-500/30 text-rose-400 bg-rose-500/5">
                  MOH Cold Chain System
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Cold Chain Equipment Monitoring & Compliance Ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Units</span>
            <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalUnits}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Actively monitored</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Active Breaches</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeBreaches}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Requires action</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.warningUnits}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Near threshold limit</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Normal Status</span>
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.normalUnits}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Within safe range</p>
        </div>
      </div>

      {/* Main navigation card list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MONITORING MODULE CHOICES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button 
                key={index}
                onClick={() => navigate(item.path)}
                className="text-left bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 active:scale-[0.98] rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[170px] shadow-xl group"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${item.color} shadow-sm`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {item.badge && (
                      typeof item.badge === 'string' ? (
                        <Badge className={`${item.badgeColor} border font-medium px-2.5 py-0.5 rounded-full text-xs`}>
                          {item.badge}
                        </Badge>
                      ) : (
                        item.badge
                      )
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-4 pt-2 flex items-center justify-end text-xs font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                  <span className="mr-1 group-hover:translate-x-0.5 transition-transform">Open Module</span>
                  <span>→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SuhuSubMenu
