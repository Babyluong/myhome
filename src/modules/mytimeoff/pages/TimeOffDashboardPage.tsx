// Standardized MyTimeOff (Cuti Gantian) Dashboard Page

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CalendarDays,
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { ROUTES } from '@/lib/constants'
import {
  getToilBalance,
  getToilClaims,
  getToilRedemptions,
  getToilDashboardStats
} from '@/modules/mytimeoff/services/toilService'
import type { ToilClaim, ToilBalance, ToilDashboardStats } from '@/shared/types/mytimeoff'
import { Button, Badge, Skeleton, SkeletonTable, SkeletonMobileCardList, ModulePageHeader } from '@/components/ui'
import { Fab } from '@/shared/components/mobile'

export const TimeOffDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [stats, setStats] = useState<ToilDashboardStats>({
    balanceHours: 0,
    totalEarnedHours: 0,
    totalUsedHours: 0,
    pendingClaimsCount: 0,
    pendingRedemptionsCount: 0,
    approvedClaimsCount: 0,
  })
  const [balance, setBalance] = useState<ToilBalance | null>(null)
  const [recentClaims, setRecentClaims] = useState<ToilClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentYear = new Date().getFullYear()

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const [statsRes, balRes, claimsRes] = await Promise.all([
        getToilDashboardStats(user.id, currentYear),
        getToilBalance(user.id, currentYear),
        getToilClaims({ userId: user.id, year: currentYear }),
      ])

      if (statsRes.data) setStats(statsRes.data)
      if (balRes.data) setBalance(balRes.data)
      if (claimsRes.data) setRecentClaims(claimsRes.data.slice(0, 5))
    } catch (err) {
      console.error(err)
      toast.error('Error loading MyTimeOff dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user?.id])

  // Conversion of hours to standard 8-hour work days
  const equivalentDays = useMemo(() => {
    const hours = stats.balanceHours || 0
    const days = Math.floor(hours / 8)
    const remHours = hours % 8
    return { days, remHours }
  }, [stats.balanceHours])

  return (
    <div className="w-full space-y-6">
      {/* Universal Module Header */}
      <ModulePageHeader
        badge={`Year ${currentYear}`}
        title="MyTimeOff"
        description="Time Off Claims & Leave Redemption System under General Orders Chapter C"
        icon={<Clock className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => navigate(ROUTES.TIMEOFF_REDEEM)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <CalendarDays className="w-4 h-4 text-accent-base shrink-0" />
              <span>Redeem Time Off</span>
            </Button>
            <Button
              onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
              size="sm"
              className="bg-accent-base hover:bg-accent-dark text-white gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Submit Time Off Claim</span>
            </Button>
          </div>
        }
      />

      {/* Main Balance Hero & KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Large Balance Showcase */}
        <div className="lg:col-span-5 bg-surface border border-border-default rounded-xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-accent-base/10 text-accent-base border border-accent-base/20">
                Current Net Balance
              </span>
              <span className="text-xs text-text-muted font-mono font-medium">
                Rate 1 Day = 8 Hours
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              {isLoading ? (
                <Skeleton className="h-14 w-28 rounded-xl inline-block" />
              ) : (
                <span className="text-5xl font-black font-mono tracking-tight text-text-primary">
                  {stats.balanceHours}
                </span>
              )}
              <span className="text-base font-semibold text-text-muted">Hours</span>
            </div>

            {isLoading ? (
              <Skeleton className="h-7 w-52 mt-3 rounded-lg" />
            ) : (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-subtle text-xs font-medium text-text-secondary border border-border-default">
                <Award className="w-4 h-4 text-accent-base" />
                <span>
                  {`Equivalent: ${equivalentDays.days} Days ${equivalentDays.remHours > 0 ? `${equivalentDays.remHours} Hours` : ''}`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-border-default grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-muted font-medium block">
                Total Earned
              </span>
              <div className="text-lg font-mono font-bold text-text-primary mt-1">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 rounded inline-block" />
                ) : (
                  `${stats.totalEarnedHours} hrs`
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">
                Total Redeemed
              </span>
              <div className="text-lg font-mono font-bold text-text-primary mt-1">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 rounded inline-block" />
                ) : (
                  `${stats.totalUsedHours} hrs`
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: 4 Stat Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Pending Claims */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="p-5 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">
                Pending HOD Approval
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-text-primary">
                {isLoading ? (
                  <Skeleton className="h-8 w-14 inline-block rounded" />
                ) : (
                  stats.pendingClaimsCount
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Overtime claims awaiting approval
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs font-semibold text-accent-base group-hover:text-accent-dark">
              <span>View Claims</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Approved Claims */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="p-5 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">
                Approved Claims
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-emerald-500">
                {isLoading ? (
                  <Skeleton className="h-8 w-14 inline-block rounded" />
                ) : (
                  stats.approvedClaimsCount
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Hours credited to balance
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs font-semibold text-accent-base group-hover:text-accent-dark">
              <span>Claim History</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Pending Redemptions */}
          <div
            onClick={() => navigate(ROUTES.TIMEOFF_HISTORY)}
            className="p-5 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">
                Pending Redemptions
              </span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-text-primary">
                {isLoading ? (
                  <Skeleton className="h-8 w-14 inline-block rounded" />
                ) : (
                  stats.pendingRedemptionsCount
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Time Off leave requests
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs font-semibold text-accent-base group-hover:text-accent-dark">
              <span>Redemption Status</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Quick Policy Reference */}
          <div className="p-5 rounded-xl bg-subtle border border-border-default shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-primary">
              <Info className="w-4 h-4 text-accent-base" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                General Orders Guideline
              </span>
            </div>
            <div className="text-xs text-text-secondary space-y-1.5 mt-3 leading-relaxed">
              <p>
                <strong>General Orders Chapter C:</strong>{' '}
                Time Off is granted for work performed on rest days, public holidays, or overtime.
              </p>
              <p className="text-text-muted">
                Attendance card / duty letter must be uploaded as proof.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[11px] font-mono text-text-muted border-t border-border-default/50">
              Lawas Hospital • H.O.M.E. Ecosystem
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
          className="p-4 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors text-left flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-subtle text-accent-base group-hover:bg-accent-base group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Submit Claim
            </div>
            <div className="text-xs text-text-muted">
              Submit overtime proof
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_REDEEM)}
          className="p-4 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors text-left flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-subtle text-accent-base group-hover:bg-accent-base group-hover:text-white transition-colors">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Redeem Time Off
            </div>
            <div className="text-xs text-text-muted">
              Use hours for holiday
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
          className="p-4 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors text-left flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-subtle text-accent-base group-hover:bg-accent-base group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              My Claims
            </div>
            <div className="text-xs text-text-muted">
              Check approval status
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(ROUTES.TIMEOFF_HISTORY)}
          className="p-4 rounded-xl bg-surface border border-border-default shadow-xs hover:border-accent-base/40 transition-colors text-left flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-subtle text-accent-base group-hover:bg-accent-base group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Ledger & History
            </div>
            <div className="text-xs text-text-muted">
              Hours in/out transactions
            </div>
          </div>
        </button>
      </div>

      {/* Recent Claims Table */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-base/10 text-accent-base">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Recent Time Off Claims
              </h3>
              <p className="text-xs text-text-muted">
                Latest 5 submitted claims
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.TIMEOFF_MY_CLAIMS)}
            className="text-accent-base hover:text-accent-dark text-xs font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {isLoading ? (
            <SkeletonTable rows={4} columns={6} />
          ) : (
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-subtle/50 border-b border-border-default text-xs uppercase font-semibold text-text-muted">
                <tr>
                  <th className="px-5 py-3.5">Claim No</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Work Type</th>
                  <th className="px-5 py-3.5">Hours Claimed</th>
                  <th className="px-5 py-3.5">Location & Details</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default font-normal">
                {recentClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted">
                      <div className="space-y-2">
                        <p className="font-semibold text-text-primary">
                          No Claim Records Found
                        </p>
                        <p className="text-xs text-text-muted">
                          You have not submitted any claims for this year.
                        </p>
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
                            className="bg-accent-base hover:bg-accent-dark text-white rounded-lg text-xs font-semibold min-h-[38px]"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Submit New Claim
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentClaims.map((claim) => {
                    const isApproved = claim.status === 'approved'
                    const isPending = claim.status === 'pending'
                    const isRejected = claim.status === 'rejected'
                    const isCancelled = claim.status === 'cancelled'

                    const workTypeLabel =
                      claim.work_type === 'rest_day'
                        ? 'Rest Day'
                        : claim.work_type === 'public_holiday'
                        ? 'Public Holiday'
                        : 'Overtime'

                    return (
                      <tr key={claim.id} className="hover:bg-subtle/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-text-primary text-xs">
                          {claim.claim_no || 'REF-TIMEOFF'}
                        </td>

                        <td className="px-5 py-3.5 text-xs font-mono">
                          <div className="font-semibold text-text-primary">{claim.work_date}</div>
                          <div className="text-text-muted">
                            {claim.time_start} - {claim.time_end}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-subtle text-text-secondary border border-border-default">
                            {workTypeLabel}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-base font-black font-mono text-accent-base">
                            {claim.hours_worked}
                          </span>{' '}
                          <span className="text-xs text-text-muted">Hrs</span>
                        </td>

                        <td className="px-5 py-3.5 text-xs">
                          <div className="font-semibold text-text-primary">{claim.location}</div>
                          <div className="text-text-muted max-w-xs truncate">
                            {claim.work_description}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-subtle text-text-muted border border-border-default">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden p-4 space-y-3">
          {isLoading ? (
            <SkeletonMobileCardList count={3} />
          ) : recentClaims.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p className="font-semibold text-text-primary">
                No Claim Records Found
              </p>
              <p className="text-xs text-text-muted mt-1">
                You have not submitted any claims for this year.
              </p>
              <div className="pt-3">
                <Button
                  size="sm"
                  onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)}
                  className="bg-accent-base hover:bg-accent-dark text-white rounded-lg text-xs font-semibold min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Submit New Claim
                </Button>
              </div>
            </div>
          ) : (
            recentClaims.map((claim) => {
              const isApproved = claim.status === 'approved'
              const isPending = claim.status === 'pending'
              const isRejected = claim.status === 'rejected'
              const isCancelled = claim.status === 'cancelled'

              const workTypeLabel =
                claim.work_type === 'rest_day'
                  ? 'Rest Day'
                  : claim.work_type === 'public_holiday'
                  ? 'Public Holiday'
                  : 'Overtime'

              return (
                <div
                  key={claim.id}
                  className="p-4 rounded-xl bg-subtle/40 border border-border-default space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-xs text-text-primary">
                      {claim.claim_no || 'REF-TIMEOFF'}
                    </span>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-subtle text-text-muted border border-border-default">
                        Cancelled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium px-2 py-0.5 rounded-md bg-surface border border-border-default text-text-secondary">
                      {workTypeLabel}
                    </span>
                    <span className="font-mono font-bold text-accent-base text-sm">
                      {claim.hours_worked} Hrs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs text-text-secondary pt-2 border-t border-border-default">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{claim.work_date}</span>
                      <span className="text-text-muted">•</span>
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{claim.time_start} - {claim.time_end}</span>
                    </div>
                    {claim.location && (
                      <div className="text-text-primary font-medium truncate mt-0.5">
                        {claim.location}
                      </div>
                    )}
                    {claim.work_description && (
                      <div className="text-text-muted text-[11px] line-clamp-2">
                        {claim.work_description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => navigate(ROUTES.TIMEOFF_CLAIM_NEW)} 
        aria-label="Submit Time Off Claim" 
      />
    </div>
  )
}

export default TimeOffDashboardPage
