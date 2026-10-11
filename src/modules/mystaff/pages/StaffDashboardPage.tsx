// src/modules/mystaff/pages/StaffDashboardPage.tsx
// Standardized MyStaff Dashboard Page

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ChevronRight,
  Building2,
  FileText,
  Bell,
  Stethoscope,
  MapPin,
  TrendingUp,
  Activity,
  ArrowLeft,
  Network
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { ROUTES } from '@/lib/constants'
import {
  getStaffDashboardStats,
  getStaffMovements,
  getStaffReminders
} from '@/modules/mystaff/services/staffService'
import type {
  StaffDashboardStats,
  StaffMovement,
  StaffReminder
} from '@/shared/types/mystaff'
import { Badge, Button, Skeleton, SkeletonMobileCardList, ModulePageHeader } from '@/components/ui'
import { Fab } from '@/shared/components/mobile'

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const user = useAuthStore(state => state.user)

  const [stats, setStats] = useState<StaffDashboardStats>({
    totalStaff: 30,
    presentToday: 26,
    onLeaveToday: 0,
    onCourseToday: 1,
    onMeetingToday: 2,
    onMovementToday: 3,
    pendingLeaveApprovals: 0,
    pendingMovementApprovals: 0,
    activeDeadlinesCount: 3,
    upcomingRemindersCount: 2
  })
  const [movements, setMovements] = useState<StaffMovement[]>([])
  const [reminders, setReminders] = useState<StaffReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      const hospitalId = user?.hospital_id
      const deptId = user?.department_id

      const [statsRes, movRes, remRes] = await Promise.all([
        getStaffDashboardStats(hospitalId, deptId),
        getStaffMovements({ hospitalId, departmentId: deptId }),
        getStaffReminders({ hospitalId, departmentId: deptId })
      ])

      if (statsRes.data) setStats(statsRes.data)
      if (movRes.data) setMovements(movRes.data)
      if (remRes.data) setReminders(remRes.data)
    } catch (err: any) {
      console.error('Error loading staff dashboard data', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [user?.hospital_id, user?.department_id])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  return (
    <div className="w-full space-y-6">
      {/* Header Panel */}
      <ModulePageHeader
        title="MyStaff Dashboard"
        subtitle="Workforce Management, Staff Movement Monitoring & Department Operations"
        badge="Workforce Management"
        icon={<Users className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.STAFF_MOVEMENT)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Record Movement</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.STAFF_REMINDERS)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>Event Log</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.STAFF_CALENDAR)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>Department Calendar</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.STAFF_ORG_CHART)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>Org Chart</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Today */}
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              On Duty Station
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 tabular-nums">
            {isLoading ? (
              <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" />
            ) : (
              stats.presentToday
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            {isLoading ? (
              <Skeleton className="h-3 w-24 mt-1 inline-block bg-subtle rounded" />
            ) : (
              `Out of ${stats.totalStaff} total staff`
            )}
          </p>
        </div>

        {/* Out of Office / Movement */}
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Out of Station / Duty
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-sky-600 tabular-nums">
            {isLoading ? (
              <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" />
            ) : (
              stats.onMovementToday
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Meetings & Official Duties
          </p>
        </div>

        {/* Courses & Training */}
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Courses & Training
            </span>
            <div className="p-1.5 rounded-lg bg-accent-base/10 text-accent-base">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-accent-base tabular-nums">
            {isLoading ? (
              <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" />
            ) : (
              stats.onCourseToday
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Training & Presentations
          </p>
        </div>

        {/* CME & Department Events */}
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Event Log / CME
            </span>
            <div className="p-1.5 rounded-lg bg-accent-base/10 text-accent-base">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-text-primary tabular-nums">
            {isLoading ? (
              <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" />
            ) : (
              stats.upcomingRemindersCount
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Active Sessions & Reminders
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Movement & Department Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Out of Office Summary */}
          <div className="bg-surface border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent-base/10 text-accent-base">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Today's Movement Status
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    Officers on official duty outside station or hospital premises
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(ROUTES.STAFF_MOVEMENT)}
                className="text-xs text-accent-base hover:underline font-semibold flex items-center"
              >
                <span>View All Logs</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* List of active movements today */}
            {isLoading ? (
              <SkeletonMobileCardList count={3} />
            ) : movements.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border-default rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2 opacity-70" />
                <p className="text-xs font-bold text-text-primary">
                  All staff are currently on station.
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  No official duty travel or external meetings recorded for today.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {movements.slice(0, 4).map(mov => {
                  const staffName = mov.user?.full_name || mov.tajuk || 'Duty Officer'
                  return (
                    <div
                      key={mov.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-subtle/50 border border-border-default hover:bg-subtle transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-base/10 text-accent-base flex items-center justify-center font-bold text-xs shrink-0 border border-accent-base/20">
                          {staffName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-text-primary">{staffName}</h4>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border border-border-default bg-surface text-text-secondary uppercase">
                              {mov.jenis_pergerakan}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span>{mov.destination || mov.tujuan || 'Location not specified'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:text-right text-xs text-text-secondary font-mono">
                        <div>
                          <span className="text-[10px] text-text-muted block font-sans uppercase">
                            Out - Return Time
                          </span>
                          <span className="font-semibold text-text-primary tabular-nums">
                            {mov.masa_keluar?.slice(0, 5) || '08:00'} — {mov.masa_balik?.slice(0, 5) || '17:00'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                          {mov.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <button
              onClick={() => navigate(ROUTES.STAFF_MOVEMENT)}
              className="text-left p-5 rounded-xl bg-surface border border-border-default shadow-sm hover:border-accent-base/40 transition-colors group"
            >
              <div className="p-2.5 w-fit rounded-lg bg-subtle text-text-secondary border border-border-default mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-base transition-colors">
                Station Exit Form
              </h3>
              <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed">
                Register official out-of-office travel and station duty permits.
              </p>
            </button>

            <button
              onClick={() => navigate(ROUTES.STAFF_REMINDERS)}
              className="text-left p-5 rounded-xl bg-surface border border-border-default shadow-sm hover:border-accent-base/40 transition-colors group"
            >
              <div className="p-2.5 w-fit rounded-lg bg-subtle text-text-secondary border border-border-default mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-base transition-colors">
                Department Event Log
              </h3>
              <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed">
                Schedule CME sessions, CPD points, periodic meetings & staff broadcasts.
              </p>
            </button>

            <button
              onClick={() => navigate(ROUTES.STAFF_CALENDAR)}
              className="text-left p-5 rounded-xl bg-surface border border-border-default shadow-sm hover:border-accent-base/40 transition-colors group"
            >
              <div className="p-2.5 w-fit rounded-lg bg-subtle text-text-secondary border border-border-default mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-base transition-colors">
                Department Calendar
              </h3>
              <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed">
                View officer absence schedules, leave, and monthly department activities.
              </p>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Log Event & CME Reminders */}
        <div className="space-y-6">
          {/* CME & Event Reminders Widget */}
          <div className="bg-surface border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-base/10 text-accent-base">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Event Log & CME
                  </h3>
                  <p className="text-[11px] text-text-muted font-medium">
                    Active events & schedule reminders
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.STAFF_REMINDERS)}
                className="text-xs text-accent-base hover:underline font-semibold flex items-center"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {isLoading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-subtle border border-border-default space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-14 rounded-full bg-subtle" />
                        <Skeleton className="h-3 w-8 bg-subtle" />
                      </div>
                      <Skeleton className="h-3.5 w-3/4 bg-subtle rounded" />
                      <Skeleton className="h-3 w-1/2 bg-subtle rounded" />
                    </div>
                  ))}
                </div>
              ) : reminders.length === 0 ? (
                <div className="p-5 text-center rounded-lg bg-subtle/50 border border-dashed border-border-default">
                  <Bell className="w-5 h-5 text-text-muted/60 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-text-primary">
                    No events scheduled.
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Upcoming CME sessions and meetings will be listed here.
                  </p>
                </div>
              ) : (
                reminders.slice(0, 5).map(rem => {
                  const remDate = new Date(rem.tarikh_peringatan)
                  return (
                    <div
                      key={rem.id}
                      className="p-3 rounded-lg bg-subtle/50 border border-border-default hover:bg-subtle transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-border-default bg-surface text-text-secondary uppercase font-mono">
                          {rem.jenis_peringatan}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono tabular-nums">
                          {remDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary line-clamp-1">{rem.tajuk}</h4>
                      {rem.penerangan && (
                        <p className="text-[11px] text-text-muted line-clamp-2 mt-1 leading-relaxed">{rem.penerangan}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-default text-[10px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-text-muted" />
                          <span>{remDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        </span>
                        <span className="text-accent-base font-semibold">Department</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => navigate(ROUTES.STAFF_MOVEMENT)} 
        aria-label="Record Movement" 
      />
    </div>
  )
}

export default StaffDashboardPage
