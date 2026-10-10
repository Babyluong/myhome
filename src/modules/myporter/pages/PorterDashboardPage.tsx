// src/modules/myporter/pages/PorterDashboardPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PersonStanding, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  ClipboardList, 
  Shield, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  FlaskConical,
  Droplets,
  Pill,
  Bed,
  AirVent,
  Radio,
  FileText
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, ModulePageHeader } from '@/components/ui'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { 
  getPorterStats, 
  getPorterJobs, 
  getPorterProfiles, 
  getPorterRoles 
} from '../services/porterService'
import type { 
  PorterAggregateStats, 
  PorterJobRequest, 
  PorterProfile 
} from '@/shared/types/myporter'
import { JobStatusBadge, UrgencyBadge, StaffStatusBadge } from '../components/PorterStatusBadge'
import { PorterJobTrackerStepper } from '../components/PorterJobTrackerStepper'

export const PorterDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const toast = useToast()

  const [stats, setStats] = useState<PorterAggregateStats | null>(null)
  const [recentJobs, setRecentJobs] = useState<PorterJobRequest[]>([])
  const [porters, setPorters] = useState<PorterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('ward_requester')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, jobsRes, profilesRes, rolesRes] = await Promise.all([
        getPorterStats(),
        getPorterJobs(),
        getPorterProfiles(),
        getPorterRoles()
      ])

      if (statsRes.data) setStats(statsRes.data)
      if (jobsRes.data) setRecentJobs(jobsRes.data.slice(0, 6))
      if (profilesRes.data) setPorters(profilesRes.data)

      if (loggedUser?.id && rolesRes.data) {
        const assignedRole = rolesRes.data[loggedUser.id]
        if (assignedRole) {
          setUserRole(assignedRole)
        } else if (loggedUser.role?.role_code === 'system_admin' || loggedUser.role?.role_code === 'hospital_admin') {
          setUserRole('porter_manager')
        }
      }
    } catch (err: any) {
      toast.error(
        'Error Loading Data',
        err.message || 'Failed to load dashboard data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 8000)
    return () => clearInterval(interval)
  }, [loggedUser?.id])

  if (loading && !stats) {
    return (
      <div className="w-full max-w-full overflow-x-hidden space-y-8 animate-pulse-subtle">
        {/* Top Banner Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" className="w-14 h-14 rounded-2xl bg-slate-800/80" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-8 w-44 bg-slate-800/80" />
              <Skeleton variant="text" className="h-4 w-72 max-w-full bg-slate-800/60" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-48 rounded-xl bg-slate-800/90" />
            <Skeleton className="h-11 w-36 rounded-xl bg-slate-800/80" />
            <Skeleton className="h-11 w-36 rounded-xl bg-slate-800/80" />
          </div>
        </div>

        {/* 4 Metric Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton variant="text" className="h-3.5 w-28 bg-slate-800/80" />
                <Skeleton variant="text" className="h-8 w-16 bg-slate-800/90" />
                <Skeleton variant="text" className="h-3 w-32 bg-slate-800/60" />
              </div>
              <Skeleton variant="rectangular" className="w-12 h-12 rounded-2xl bg-slate-800/70 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Quick Request Categories Skeletons (8 buttons) */}
        <div className="space-y-3">
          <Skeleton variant="text" className="h-4 w-48 bg-slate-800/80" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-2 min-h-[90px]">
                <Skeleton variant="rectangular" className="w-6 h-6 rounded-lg bg-slate-800/80" />
                <Skeleton variant="text" className="h-3 w-14 bg-slate-800/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Split Grid: Live Jobs + Porter Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs Feed Skeleton (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-6 w-56 bg-slate-800/80" />
              <Skeleton variant="text" className="h-4 w-28 bg-slate-800/60" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Skeleton variant="text" className="h-4 w-24 bg-slate-800/80 font-mono" />
                      <Skeleton className="h-5 w-16 rounded-full bg-slate-800/70" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full bg-slate-800/70" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Skeleton className="w-4 h-4 rounded-full bg-slate-800 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton variant="text" className="h-3 w-16 bg-slate-800/60" />
                        <Skeleton variant="text" className="h-4 w-32 bg-slate-800/80" />
                        <Skeleton variant="text" className="h-3 w-20 bg-slate-800/50" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Skeleton className="w-4 h-4 rounded-full bg-slate-800 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton variant="text" className="h-3 w-16 bg-slate-800/60" />
                        <Skeleton variant="text" className="h-4 w-32 bg-slate-800/80" />
                        <Skeleton variant="text" className="h-3 w-20 bg-slate-800/50" />
                      </div>
                    </div>
                  </div>

                  {/* Stepper Skeleton */}
                  <div className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      {Array.from({ length: 5 }).map((_, stepIdx) => (
                        <React.Fragment key={stepIdx}>
                          <div className="flex flex-col items-center gap-1.5">
                            <Skeleton className="w-7 h-7 rounded-full bg-slate-800" />
                            <Skeleton variant="text" className="h-2.5 w-12 bg-slate-800/60" />
                          </div>
                          {stepIdx < 4 && <Skeleton className="h-1 flex-1 rounded bg-slate-800/60 mb-4" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <Skeleton variant="text" className="h-4 w-36 bg-slate-800/70" />
                    <Skeleton variant="text" className="h-4 w-24 bg-slate-800/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Porter Status Radar Skeleton (1 col) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-6 w-40 bg-slate-800/80" />
              <Skeleton variant="text" className="h-4 w-20 bg-slate-800/60" />
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="rectangular" className="w-10 h-10 rounded-xl bg-slate-800 ring-2 ring-slate-800" />
                    <div className="space-y-1">
                      <Skeleton variant="text" className="h-3.5 w-24 bg-slate-800/80" />
                      <Skeleton variant="text" className="h-2.5 w-16 bg-slate-800/60" />
                      <Skeleton variant="text" className="h-2.5 w-20 bg-slate-800/50" />
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col items-end">
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-800" />
                    <Skeleton variant="text" className="h-2.5 w-14 bg-slate-800/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ModulePageHeader
        title="MyPorter"
        subtitle="Hospital Patient Transfer, Porter Dispatch & Specimen Logistics"
        badge="Logistics & Porter"
        icon={<PersonStanding className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/porter/requests/new')}
              className="min-h-[38px] px-4 py-2 bg-accent-base hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Request Porter</span>
            </button>
            <button
              onClick={() => navigate('/porter/panel')}
              className="min-h-[38px] px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary border border-border-default rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-accent-base" />
              <span>Porter Panel</span>
            </button>
            {userRole === 'porter_manager' && (
              <button
                onClick={() => navigate('/porter/manager')}
                className="min-h-[38px] px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary border border-border-default rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Dispatch Control</span>
              </button>
            )}
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Today's Requests
            </p>
            <h3 className="text-2xl font-bold font-mono text-text-primary tabular-nums">{stats?.totalJobsToday || 0}</h3>
            <p className="text-[11px] text-accent-base font-medium">
              {stats?.activeBroadcasting || 0} searching for porters
            </p>
          </div>
          <div className="p-2.5 bg-accent-base/10 text-accent-base rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Active In Transit
            </p>
            <h3 className="text-2xl font-bold font-mono text-text-primary tabular-nums">{stats?.inTransit || 0}</h3>
            <p className="text-[11px] text-text-muted">
              {stats?.pendingReceiverConfirmation || 0} at destination
            </p>
          </div>
          <div className="p-2.5 bg-accent-base/10 text-accent-base rounded-lg">
            <PersonStanding className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Available Porters
            </p>
            <h3 className="text-2xl font-bold font-mono text-text-primary tabular-nums">
              {stats?.availablePortersCount || 0} <span className="text-xs font-normal text-text-muted">/ {stats?.totalPortersOnDuty || 0}</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">
              Sufficient duty coverage
            </p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Average TAT (SLA)
            </p>
            <h3 className="text-2xl font-bold font-mono text-text-primary tabular-nums">
              {stats?.averageTATMinutes || 14} <span className="text-xs font-normal text-text-muted">min</span>
            </h3>
            <p className="text-[11px] text-amber-500 font-medium">
              {stats?.slaCompliancePercentage || 96.8}% SLA compliance
            </p>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grab-Style Quick 1-Click Order Categories */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <span>Quick Request Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { 
              cat: 'patient_transfer', 
              label: 'Patient Transfer', 
              icon: Bed, 
              color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' 
            },
            { 
              cat: 'lab_specimen', 
              label: 'Lab Specimen', 
              icon: FlaskConical, 
              color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' 
            },
            { 
              cat: 'blood_bank', 
              label: 'Blood Bank', 
              icon: Droplets, 
              color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
            },
            { 
              cat: 'pharmacy_run', 
              label: 'Pharmacy Run', 
              icon: Pill, 
              color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
            },
            { 
              cat: 'gas_equipment', 
              label: 'Gas & Equipment', 
              icon: AirVent, 
              color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' 
            },
            { 
              cat: 'mortuary', 
              label: 'Mortuary', 
              icon: Shield, 
              color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' 
            },
            { 
              cat: 'medical_records', 
              label: 'Medical Records', 
              icon: FileText, 
              color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
            },
            { 
              cat: 'cssd_linen', 
              label: 'CSSD & Linen', 
              icon: Activity, 
              color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20' 
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.cat}
                onClick={() => navigate(`/porter/requests/new?category=${item.cat}`)}
                className={`min-h-[64px] p-3 sm:p-4 rounded-xl border ${item.color} flex flex-col items-center justify-center gap-2 hover:scale-[1.02] hover:bg-subtle transition-all duration-200 active:scale-98 shadow-xs text-center`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-text-primary">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Split: Recent Jobs Feed + PPK Status Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-base" />
              <span>Live Dispatch & Movement Status</span>
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/porter/requests/my')}
              className="text-xs font-semibold text-accent-base hover:text-accent-dark p-0 flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {recentJobs.length === 0 ? (
              <div className="p-12 text-center text-text-muted bg-surface rounded-xl border border-border-default">
                No active requests at this time.
              </div>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 bg-surface hover:bg-subtle/30 border border-border-default hover:border-accent-base/30 rounded-xl shadow-xs transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-text-muted">{job.no_rujukan}</span>
                      <UrgencyBadge urgency={job.urgency} />
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-text-muted text-[10px] uppercase font-semibold">
                          From (Origin):
                        </p>
                        <p className="font-semibold text-text-primary">{job.origin_department_name}</p>
                        <p className="text-text-muted">{job.origin_location_details}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-text-muted text-[10px] uppercase font-semibold">
                          To (Destination):
                        </p>
                        <p className="font-semibold text-text-primary">{job.destination_department_name}</p>
                        <p className="text-text-muted">{job.destination_location_details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step Progress Bar */}
                  <PorterJobTrackerStepper job={job} compact />

                  <div className="flex items-center justify-between pt-1 border-t border-border-default text-xs">
                    <div className="text-text-muted">
                      Porter: <span className="font-medium text-text-primary">
                        {job.assigned_porter_name || 'Awaiting assignment'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/porter/requests/my')}
                      className="text-accent-base hover:text-accent-dark font-medium flex items-center gap-1"
                    >
                      <span>Track Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available PPK Fleet Status (1 col) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-base" />
              <span>Porter Duty Status</span>
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/porter/roster')}
              className="text-xs font-semibold text-accent-base hover:text-accent-dark p-0 flex items-center gap-1"
            >
              <span>Duty Roster</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-surface border border-border-default rounded-xl p-4 divide-y divide-border-default space-y-3 shadow-xs">
            {porters.map((p) => (
              <div key={p.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                      alt={p.full_name}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-border-default"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                        p.current_status === 'available'
                          ? 'bg-emerald-500'
                          : p.current_status === 'in_job'
                            ? 'bg-blue-500'
                            : p.current_status === 'on_break'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">{p.full_name}</h4>
                    <p className="text-[10px] text-text-muted">{p.assigned_zone}</p>
                    <p className="text-[10px] text-text-muted">{p.current_location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StaffStatusBadge status={p.current_status} />
                  <p className="text-[10px] text-text-muted mt-1 font-mono">
                    {p.total_completed_today} completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PorterDashboardPage
