// src/modules/mysuhu/pages/SuhuDashboardPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle,
  Building,
  ArrowRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Badge, ModulePageHeader } from '@/components/ui'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getUnitPemantauan } from '@/modules/mysuhu/services/suhuService'
import { getDepartmentsByHospital } from '@/services/departmentService'
import type { UnitPemantauanWithRelations } from '@/types/mysuhu'
import type { Department } from '@/types'

export const SuhuDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || 'hosp-1'
  const userRole = user?.role?.role_code || ''
  const isAdmin = ['system_admin', 'hospital_admin', 'hospital_administrator'].includes(userRole)
  const userDeptId = user?.department_id || ''

  const [departments, setDepartments] = useState<Department[]>([])
  const [units, setUnits] = useState<UnitPemantauanWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [deptsRes, unitsRes] = await Promise.all([
          getDepartmentsByHospital(hospitalId),
          getUnitPemantauan()
        ])
        setDepartments(deptsRes || [])
        setUnits(unitsRes.data || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [hospitalId])

  // Map units to departments and calculate stats per department
  const deptStats = useMemo(() => {
    const stats: Record<string, {
      total: number
      normal: number
      warning: number
      breach: number
      noReading: number
    }> = {}

    units.forEach(unit => {
      const deptId = unit.lokasi?.department_id
      if (!deptId) return

      if (!stats[deptId]) {
        stats[deptId] = { total: 0, normal: 0, warning: 0, breach: 0, noReading: 0 }
      }

      stats[deptId].total++
      if (unit.status_pemantauan === 'normal') stats[deptId].normal++
      else if (unit.status_pemantauan === 'warning') stats[deptId].warning++
      else if (unit.status_pemantauan === 'breach') stats[deptId].breach++
      else stats[deptId].noReading++
    })

    return stats;
  }, [units])

  // Filter visible departments based on user credentials (non-admins only see their department)
  const visibleDepartments = useMemo(() => {
    return departments.filter(dept => {
      if (!isAdmin && userDeptId) {
        return dept.id === userDeptId
      }
      return true
    })
  }, [departments, isAdmin, userDeptId])

  // Global counts across visible departments
  const summary = useMemo(() => {
    let total = 0
    let normal = 0
    let warning = 0
    let breach = 0
    let noReading = 0

    visibleDepartments.forEach(dept => {
      const stat = deptStats[dept.id]
      if (stat) {
        total += stat.total
        normal += stat.normal
        warning += stat.warning
        breach += stat.breach
        noReading += stat.noReading
      }
    })

    return { total, normal, warning, breach, noReading }
  }, [visibleDepartments, deptStats])



  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* Header Panel */}
      <ModulePageHeader
        icon={Thermometer}
        title="Temperature Monitoring Dashboard"
        description="Select a hospital department to inspect cold chain storage devices and record clinical temperature logs."
        badges={[
          { label: 'KKM Cold Chain Standard', variant: 'accent' },
          { label: 'Pharmacy Quality Assurance', variant: 'neutral' },
        ]}
      />

      {/* Global Breach Notification */}
      {summary.breach > 0 && (
        <div 
          onClick={() => navigate('/suhu/breaches')}
          className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl cursor-pointer hover:bg-rose-500/15 transition-colors shadow-elevation-1 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Active Temperature Breach Incident Detected</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">Click to inspect and annotate correct action logs immediately.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Breach Log &rarr;
          </span>
        </div>
      )}

      {/* Hospital KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Units</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-primary mt-1 tabular-nums">{loading ? <Skeleton className="h-8 w-14 bg-subtle inline-block rounded" /> : summary.total}</div>
        </div>
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Normal
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{loading ? <Skeleton className="h-8 w-14 bg-subtle inline-block rounded" /> : summary.normal}</div>
        </div>
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">{loading ? <Skeleton className="h-8 w-14 bg-subtle inline-block rounded" /> : summary.warning}</div>
        </div>
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Breach
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">{loading ? <Skeleton className="h-8 w-14 bg-subtle inline-block rounded" /> : summary.breach}</div>
        </div>
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            No Readings
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-muted mt-1 tabular-nums">{loading ? <Skeleton className="h-8 w-14 bg-subtle inline-block rounded" /> : summary.noReading}</div>
        </div>
      </div>

      {/* Department Selector Grid */}
      <div className="space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Hospital Departments</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border-default rounded-xl p-5 shadow-elevation-1 space-y-4 animate-pulse">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <Skeleton className="w-10 h-10 rounded-lg bg-subtle flex-shrink-0" />
                  <Skeleton className="h-4 w-16 rounded bg-subtle" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-subtle rounded" />
                  <Skeleton className="h-3.5 w-1/2 bg-subtle/70 rounded" />
                </div>
                <div className="mt-6 pt-3 border-t border-border-default flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded bg-subtle/70" />
                  <Skeleton className="h-4 w-12 rounded bg-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleDepartments.length === 0 ? (
          <div className="bg-surface border border-border-default rounded-xl p-12 text-center shadow-elevation-1">
            <Building className="w-12 h-12 text-text-muted opacity-40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-primary">No departments configured with temperature monitoring</p>
            <p className="text-xs text-text-muted mt-1">Please contact system administrator to enroll your department.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleDepartments.map(dept => {
              const stat = deptStats[dept.id] || { total: 0, normal: 0, warning: 0, breach: 0, noReading: 0 }
              const hasBreach = stat.breach > 0
              const hasWarning = stat.warning > 0
              
              let borderClass = 'border-border-default hover:border-border-strong'
              if (hasBreach) borderClass = 'border-rose-500/40 hover:border-rose-500/60 ring-1 ring-rose-500/10'
              else if (hasWarning) borderClass = 'border-amber-500/40 hover:border-amber-500/60 ring-1 ring-amber-500/10'

              return (
                <div 
                  key={dept.id}
                  onClick={() => navigate(`/suhu/department/${dept.id}`)}
                  className={`bg-surface border rounded-xl p-5 shadow-elevation-1 hover:bg-subtle/30 cursor-pointer transition-colors duration-150 flex flex-col justify-between group relative overflow-hidden ${borderClass}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="p-2.5 bg-subtle text-text-secondary rounded-lg group-hover:bg-accent-subtle group-hover:text-accent-base transition-colors">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {hasBreach && (
                          <Badge variant="error" className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md">
                            Breach
                          </Badge>
                        )}
                        {hasWarning && !hasBreach && (
                          <Badge variant="warning" className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md">
                            Warning
                          </Badge>
                        )}
                        <span className="text-xs text-text-muted font-semibold font-mono">
                          {dept.department_code}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent-base transition-colors line-clamp-1 mb-1">
                      {dept.department_name}
                    </h3>
                    <p className="text-xs text-text-muted font-normal">
                      {stat.total === 0 ? 'No monitoring points registered' : `${stat.total} Active Monitoring Points`}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border-default flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {stat.total > 0 && (
                        <>
                          {stat.normal > 0 && (
                            <span className="text-[10px] font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {stat.normal} OK
                            </span>
                          )}
                          {stat.warning > 0 && (
                            <span className="text-[10px] font-semibold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {stat.warning} WRN
                            </span>
                          )}
                          {stat.breach > 0 && (
                            <span className="text-[10px] font-semibold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {stat.breach} BRCH
                            </span>
                          )}
                          {stat.noReading > 0 && (
                            <span className="text-[10px] font-semibold font-mono text-text-muted bg-subtle border border-border-default px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                              {stat.noReading} N/A
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <span className="text-xs font-semibold text-accent-base flex items-center gap-1 transform group-hover:translate-x-0.5 transition-colors">
                      Open &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuhuDashboardPage
