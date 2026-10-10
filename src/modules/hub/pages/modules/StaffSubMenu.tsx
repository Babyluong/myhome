// src/modules/hub/pages/modules/StaffSubMenu.tsx
// Luxury sub-menu hub for MyStaff module

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  LayoutDashboard,
  Calendar,
  Briefcase,
  CalendarDays,
  Clock,
  Bell,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Network
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Badge, Skeleton } from '@/components/ui'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { getStaffDashboardStats } from '@/modules/mystaff/services/staffService'
import type { StaffDashboardStats } from '@/shared/types/mystaff'

export const StaffSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [stats, setStats] = useState<StaffDashboardStats>({
    totalStaff: 0,
    presentToday: 0,
    onLeaveToday: 0,
    onCourseToday: 0,
    onMeetingToday: 0,
    onMovementToday: 0,
    pendingLeaveApprovals: 0,
    pendingMovementApprovals: 0,
    activeDeadlinesCount: 0,
    upcomingRemindersCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getStaffDashboardStats()
        if (res.data) setStats(res.data)
      } catch (e) {
        console.error('Failed to load MyStaff submenu stats', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const menuItems = [
    {
      title: 'MyStaff Main Dashboard',
      description: 'Live presence summary, absence metrics, quick actions, and holistic workforce visibility.',
      icon: LayoutDashboard,
      path: ROUTES.STAFF_DASHBOARD,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-20 rounded-full" />
      ) : (
        `${stats.presentToday}/${stats.totalStaff} Present`
      ),
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      title: 'Staff Movement Registry',
      description: 'Official out-of-office logs for meetings, training, site visits, presentations, and duty trips.',
      icon: Briefcase,
      path: ROUTES.STAFF_MOVEMENT,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.onMovementToday > 0 ? (
        `${stats.onMovementToday} Out of Office`
      ) : null,
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
    },
    {
      title: 'Event Log & CME Alerts',
      description: 'Automated reminders for hospital CME/CPD sessions, committee meetings, and duty schedules.',
      icon: Bell,
      path: ROUTES.STAFF_REMINDERS,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.upcomingRemindersCount > 0 ? (
        `${stats.upcomingRemindersCount} Events`
      ) : null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    },
    {
      title: 'Department Staff Calendar',
      description: 'Interactive monthly and weekly calendar of all staff meetings, training, visits, and official events.',
      icon: Calendar,
      path: ROUTES.STAFF_CALENDAR,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: null
    },
    {
      title: 'Department Organizational Chart',
      description: 'Official leadership hierarchy, sectional units, staff roles, grades, and live presence status.',
      icon: Network,
      path: ROUTES.STAFF_ORG_CHART,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: loading ? (
        <Skeleton className="h-5 w-20 rounded-full" />
      ) : (
        `${stats.totalStaff} Members`
      ),
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40'
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
            <div className="p-3 sm:p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Users className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyStaff</h1>
                <Badge className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                  Staff Operations Ecosystem
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Staff Movement Tracking, Event Log &amp; Department Calendar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Staff</span>
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalStaff}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">In department</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">On Duty</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.presentToday}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">At station</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Out of Office</span>
            <Briefcase className="w-4 h-4 text-sky-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-sky-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.onMovementToday + stats.onCourseToday}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Meetings &amp; Courses
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Active Deadlines</span>
            <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeDeadlinesCount}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Reports &amp; deliverables</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYSTAFF MODULES &amp; OPERATIONS
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500/80 group-hover:text-emerald-400 transition-colors mt-auto pt-2">
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

export default StaffSubMenu
