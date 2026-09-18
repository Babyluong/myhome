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
import { Badge } from '@/components/ui'

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
      title: language === 'ms' ? 'Papan Pemuka Pemantauan' : 'Temperature Dashboard',
      description: language === 'ms'
        ? 'Paparan real-time status suhu bagi kesemua unit peti sejuk, peti beku, dan bilik specimen.'
        : 'Live telemetry overview of all ward refrigerators, ultra-cold freezers, and specimen storage rooms.',
      icon: LayoutDashboard,
      path: ROUTES.HUB_SUHU_DASHBOARD,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: stats.activeBreaches > 0 ? `${stats.activeBreaches} ${language === 'ms' ? 'Pelanggaran' : 'Breaches'}` : null,
      badgeColor: 'bg-rose-500 text-white border-transparent'
    },
    {
      title: language === 'ms' ? 'Log Pelanggaran Suhu (Breach Log)' : 'Temperature Breach Log',
      description: language === 'ms'
        ? 'Rekod pelanggaran had suhu (ambang) untuk tujuan kualiti, audit pematuhan MSQH dan tindakan pembetulan.'
        : 'Out-of-range temperature incident records, MSQH compliance audit trail, and corrective action workflows.',
      icon: AlertTriangle,
      path: ROUTES.HUB_SUHU_BREACHES,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: stats.activeBreaches > 0 ? (language === 'ms' ? 'Tindakan Diperlukan' : 'Action Required') : null,
      badgeColor: 'bg-amber-500 text-slate-900 border-transparent'
    },
    {
      title: language === 'ms' ? 'Konfigurasi & Pendaftaran Unit' : 'Unit Registry & Configuration',
      description: language === 'ms'
        ? 'Pendaftaran lokasi fizikal baru, peralatan penyejukan, dan tetapan had julat suhu (Min/Max °C).'
        : 'Register new cooling units, assign ward physical locations, and configure threshold ranges (Min/Max °C).',
      icon: Settings,
      path: ROUTES.HUB_SUHU_ADMIN,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
      badge: null
    }
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* Back navigation */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(ROUTES.HUB)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'ms' ? 'Kembali ke Hub Utama' : 'Back to Main Hub'}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl shadow-inner">
              <Thermometer className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">MySuhu</h1>
                <Badge variant="gray" className="border-rose-500/30 text-rose-400 bg-rose-500/5">
                  {language === 'ms' ? 'Sub-modul KKM' : 'MOH Cold Chain Sub-module'}
                </Badge>
              </div>
              <p className="text-slate-400 mt-1">
                {language === 'ms'
                  ? 'Sistem Pemantauan & Pematuhan Suhu Peralatan Klinikal'
                  : 'Cold Chain Equipment Monitoring & Compliance Ecosystem'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Jumlah Unit' : 'Total Units'}</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-white">
            {stats.loading ? '...' : stats.totalUnits}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Aktif dipantau' : 'Actively monitored'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Pelanggaran Aktif' : 'Active Breaches'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-rose-400">
            {stats.loading ? '...' : stats.activeBreaches}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Perlu tindakan' : 'Requires action'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Amaran' : 'Warnings'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-amber-400">
            {stats.loading ? '...' : stats.warningUnits}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Hampir batas ambang' : 'Near threshold limit'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Status Normal' : 'Normal Status'}</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-emerald-400">
            {stats.loading ? '...' : stats.normalUnits}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Suhu dalam julat selamat' : 'Within safe range'}</p>
        </div>
      </div>

      {/* Main navigation card list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div 
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-slate-900/40 backdrop-blur hover:bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3.5 rounded-2xl border ${item.color} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <Badge className={`${item.badgeColor} border font-medium px-2.5 py-0.5 rounded-full text-xs`}>
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-end text-sm font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                <span className="mr-1 group-hover:translate-x-0.5 transition-transform">{language === 'ms' ? 'Masuk Modul' : 'Open Module'}</span>
                <span>→</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SuhuSubMenu
