// src/modules/hub/pages/modules/KunciSubMenu.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Key, 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Shield, 
  ScrollText,
  Activity,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { getKunciDaftar, getKunciLogs } from '@/modules/mykunci/services/kunciService'
import { Badge, Skeleton } from '@/components/ui'
import { useLanguage } from '@/shared/contexts/LanguageContext'

export const KunciSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  
  const [stats, setStats] = useState({
    totalKeys: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    normalKeys: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: keys } = await getKunciDaftar()
        const { data: logs } = await getKunciLogs()
        
        const totalKeys = keys?.length || 0
        const activeBorrowsList = logs?.filter(l => !l.tarikh_masa_pulang) || []
        const activeBorrows = activeBorrowsList.length
        
        // Calculate overdue borrows
        const now = new Date().getTime()
        const overdueBorrows = activeBorrowsList.filter(l => {
          return new Date(l.jangka_masa_pulang).getTime() < now
        }).length

        const normalKeys = totalKeys - activeBorrows
        
        setStats({
          totalKeys,
          activeBorrows,
          overdueBorrows,
          normalKeys,
          loading: false
        })
      } catch (e) {
        console.error('Failed to load MyKunci submenu stats', e)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [])

  const menuItems = [
    {
      title: 'MyKunci Main Dashboard',
      description: 'Live statistics dashboard for key movements, overdue alerts, active custody loans, and security compliance.',
      icon: LayoutDashboard,
      path: '/kunci/dashboard',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.overdueBorrows > 0 ? (
        `${stats.overdueBorrows} Overdue`
      ) : null,
      badgeColor: 'bg-rose-500 text-white border-transparent'
    },
    {
      title: 'Key Register & Inventory',
      description: 'Complete inventory of master keys, locks, key boxes, physical storage locations, and double-custody rules.',
      icon: ClipboardList,
      path: '/kunci/daftar',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: null
    },
    {
      title: 'Key Movement Log',
      description: 'Complete audit trail for key borrowing and return (custodian, timestamp, duration, and incidents).',
      icon: FileText,
      path: '/kunci/log',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.activeBorrows > 0 ? (
        `${stats.activeBorrows} Active`
      ) : null,
      badgeColor: 'bg-emerald-500 text-slate-900 border-transparent'
    },
    {
      title: 'Monthly Audit & Verification',
      description: 'Periodic security audit compliance, physical key checks, and sealed envelope duplicate key verification.',
      icon: Shield,
      path: '/kunci/audit',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badge: null
    },
    {
      title: 'MOH Key Security Policy',
      description: 'Official government key security guidelines, loss procedure protocols, and MOH security directives.',
      icon: ScrollText,
      path: '/kunci/polisi',
      color: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
      badge: 'Policy'
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
            <div className="p-3 sm:p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Key className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyKunci</h1>
                <Badge className="border-amber-500/30 text-amber-400 bg-amber-500/5">
                  Security Sub-module
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Key Management System &amp; Government Security Policy Compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Master Keys</span>
            <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalKeys}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Registered in department</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Currently Borrowed</span>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeBorrows}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Outside cabinet</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Overdue Warnings</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.overdueBorrows}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Exceeding shift duration</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Available in Storage</span>
            <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.normalKeys}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Inside key cabinet</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          KEY OPERATIONS &amp; AUDIT LOGS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${item.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'}`}>
                          {item.badge}
                        </span>
                      ) : (
                        item.badge
                      )
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500/80 group-hover:text-amber-400 transition-colors mt-auto pt-2">
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

export default KunciSubMenu
