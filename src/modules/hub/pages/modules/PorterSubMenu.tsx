// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  PersonStanding,
  LayoutDashboard,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  BarChart3,
  UserCheck,
  Activity,
  AlertTriangle,
  Users,
  Radio
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'
import { getPorterStats } from '@/modules/myporter/services/porterService'

export const PorterSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [stats, setStats] = useState({
    activeJobs: 0,
    availablePorters: 0,
    statJobs: 0,
    completedToday: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getPorterStats()
        if (res.data) {
          setStats({
            activeJobs: (res.data.activeBroadcasting || 0) + (res.data.inProgress || 0) + (res.data.inTransit || 0),
            availablePorters: res.data.availablePortersCount || 0,
            statJobs: res.data.statJobsCount || 0,
            completedToday: res.data.completedToday || 0,
            loading: false
          })
        } else {
          setStats(prev => ({ ...prev, loading: false }))
        }
      } catch (err) {
        console.error('Failed to load MyPorter submenu stats', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [])

  const menuItems = [
    {
      title: 'MyPorter Dashboard',
      description: 'Live operational telemetry of hospital dispatching, active porter locations, and urgent task timers.',
      icon: LayoutDashboard,
      path: ROUTES.PORTER_DASHBOARD,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.activeJobs > 0 ? (
        `${stats.activeJobs} Active`
      ) : null,
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
    },
    {
      title: 'New Porter Request',
      description: 'Request dispatch for patient transfer (bed/wheelchair), STAT blood bank, lab specimen, and medical records.',
      icon: Plus,
      path: ROUTES.PORTER_REQUEST_NEW,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'STAT Form',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
    },
    {
      title: 'My Requests & Live Tracking',
      description: 'Track live dispatch progression, assigned porter identity, and stage-by-stage arrival timestamps.',
      icon: FileText,
      path: ROUTES.PORTER_MY_REQUESTS,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: null
    },
    {
      title: 'Porter Mobile Task Portal',
      description: 'Mobile-first terminal for duty porters to accept broadcast jobs, update milestones, and capture handover proof.',
      icon: Radio,
      path: ROUTES.PORTER_PANEL,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.availablePorters > 0 ? (
        `${stats.availablePorters} Porters`
      ) : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      title: 'Ward Handover & Verification',
      description: 'Ward receiver portal to inspect, verify condition, rate service, and confirm digital custody handover.',
      icon: CheckCircle2,
      path: ROUTES.PORTER_RECEIVER,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: null
    },
    {
      title: 'Dispatch Control & Supervisor',
      description: 'Supervisor dispatch control to oversee porter availability, reassign delayed jobs, and mitigate bottlenecks.',
      icon: UserCheck,
      path: ROUTES.PORTER_MANAGER,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'Supervisor',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      title: 'Porter Duty Roster & Shifts',
      description: 'Three-shift rotation calendar, inter-porter shift exchange requests, and official hospital roster export.',
      icon: Calendar,
      path: ROUTES.PORTER_ROSTER,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: null
    },
    {
      title: 'Performance Analytics & TAT',
      description: 'SLA compliance audits, STAT 15-minute response tracking, turnaround metrics, and ward heatmaps.',
      icon: BarChart3,
      path: ROUTES.PORTER_REPORTS,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: 'MSQH KPI',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
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
            <div className="p-3 sm:p-3.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <PersonStanding className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyPorter</h1>
                <Badge className="border-sky-500/30 text-sky-400 bg-sky-500/5">
                  Hospital Dispatch Ecosystem
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Hospital Porter Dispatch, Patient Mobility Transport & STAT Blood Telemetry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Active Jobs</span>
            <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeJobs}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Broadcasting & in transit</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Available Porters</span>
            <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.availablePorters}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Ready for assignment</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">STAT Urgent Jobs</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.statJobs}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">15 min response target</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-purple-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.completedToday}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Receiver verified</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYPORTER MODULES & OPERATIONS
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400/80 group-hover:text-sky-300 transition-colors mt-auto pt-2">
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

export default PorterSubMenu
