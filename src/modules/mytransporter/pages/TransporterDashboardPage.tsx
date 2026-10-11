// src/modules/mytransporter/pages/TransporterDashboardPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Car, 
  FileText, 
  Plus, 
  ArrowRight, 
  ClipboardList, 
  TrendingUp, 
  AlertOctagon, 
  Settings, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar,
  XCircle,
  Truck
} from 'lucide-react'
import { Ambulance } from '../components/AmbulanceIcon'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { 
  getTransporterAggregateStats,
  getRequests,
  getTransporterRoles
} from '../services/transporterService'
import type { TransportRequest } from '@/shared/types/mytransporter'
import { Skeleton, SkeletonTable, SkeletonMobileCardList } from '@/shared/components/ui/skeleton'
import { 
  Badge,
  ModulePageHeader 
} from '@/components/ui'
import { Fab } from '@/shared/components/mobile'

const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const toast = useToast()
  
  const [stats, setStats] = useState<any>(null)
  const [requests, setRequests] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('staff') // Default to regular staff

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const hospitalId = loggedUser?.hospital_id || 'hosp-1'
        const userId = loggedUser?.id || ''
        
        // 1. Fetch Transporter Roles
        const roleRes = await getTransporterRoles()
        if (roleRes.data && userId) {
          const assignedRole = roleRes.data[userId]
          if (assignedRole) {
            setUserRole(assignedRole)
          } else if (loggedUser?.role?.role_code === 'system_admin' || loggedUser?.role?.role_code === 'hospital_admin') {
            setUserRole('transport_admin') // System/Hospital Admins double as transport admins
          }
        }
        
        // 2. Fetch Stats
        const statsRes = await getTransporterAggregateStats()
        if (statsRes.data) {
          setStats(statsRes.data)
        }

        // 3. Fetch Recent Requests
        const reqsRes = await getRequests()
        if (reqsRes.data) {
          setRequests(reqsRes.data.slice(0, 5)) // get recent 5
        }
      } catch (err: any) {
        toast.error(
          'Failed to Load Data', 
          err.message || 'An error occurred while fetching dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [loggedUser?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="gray">Draft</Badge>
      case 'submitted':
        return <Badge variant="info">Submitted (New)</Badge>
      case 'driver_accepted':
        return <Badge variant="warning">Driver Accepted</Badge>
      case 'driver_rejected':
        return <Badge variant="error">Driver Rejected</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="error">Admin Rejected</Badge>
      case 'in_transit':
        return <Badge variant="warning">In Transit</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'cancelled':
        return <Badge variant="gray">Cancelled</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }



  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ModulePageHeader
        title="MyTransporter"
        subtitle="Integrated Hospital Fleet & Transport Management System"
        badge="Fleet Management"
        icon={<Car className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => navigate('/transporter/requests/new')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>

            {userRole === 'transport_admin' && (
              <button 
                onClick={() => navigate('/transporter/admin/roles')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Settings className="w-3.5 h-3.5 text-text-muted" />
                <span>Driver Permissions</span>
              </button>
            )}
          </div>
        }
      />

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Total Requests
            </p>
            <h3 className="text-2xl font-bold font-mono text-text-primary tabular-nums">
              {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats?.totalRequests || 0)}
            </h3>
          </div>
          <div className="p-2.5 bg-accent-base/10 text-accent-base rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Pending Approvals
            </p>
            <h3 className="text-2xl font-bold font-mono text-amber-500 tabular-nums">
              {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats?.pendingApprovals || 0)}
            </h3>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Active Trips
            </p>
            <h3 className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats?.activeTrips || 0)}
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border-default p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Open Defects
            </p>
            <h3 className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats?.totalIssuesOpen || 0)}
            </h3>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-lg">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Role Navigation Dashboard Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Requester Portal */}
        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-accent-base/40 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-subtle text-text-secondary flex items-center justify-center mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors">
              Staff Portal
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Submit Ambulance or Department Vehicle requests and track approval statuses in real-time.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-border-default flex justify-between items-center">
            <button 
              onClick={() => navigate('/transporter/requests/my')}
              className="text-xs font-semibold text-accent-base flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Manage My Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Driver Portal */}
        <div className={`bg-surface border border-border-default rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-accent-base/40 transition-colors ${
          userRole !== 'transport_driver' && userRole !== 'transport_admin' ? 'opacity-60' : ''
        }`}>
          <div>
            <div className="w-9 h-9 rounded-lg bg-subtle text-text-secondary flex items-center justify-center mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <Ambulance className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors">
              Driver Operations Panel
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Accept trip dispatches, conduct vehicle inspections (pre/post-trip), and log mileage.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-border-default flex justify-between items-center">
            {userRole === 'transport_driver' || userRole === 'transport_admin' ? (
              <button 
                onClick={() => navigate('/transporter/driver/panel')}
                className="text-xs font-semibold text-accent-base flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Open Driver Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-medium text-text-muted italic">
                Restricted to duty drivers only
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Admin Portal */}
        <div className={`bg-surface border border-border-default rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-accent-base/40 transition-colors ${
          userRole !== 'transport_admin' ? 'opacity-60' : ''
        }`}>
          <div>
            <div className="w-9 h-9 rounded-lg bg-subtle text-text-secondary flex items-center justify-center mb-3 group-hover:bg-accent-base/10 group-hover:text-accent-base transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors">
              Fleet Administrator
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Approve requests, manage vehicle registry, resolve defect issues, and audit monthly movements.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-border-default flex justify-between items-center">
            {userRole === 'transport_admin' ? (
              <button 
                onClick={() => navigate('/transporter/admin/approval')}
                className="text-xs font-semibold text-accent-base flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Open Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-medium text-text-muted italic">
                Administrator access only
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Operations Hub (Conditional) */}
      {userRole === 'transport_admin' && (
        <div className="bg-surface border border-border-default rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-default flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent-base" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Full Fleet Administration Hub
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <button 
              onClick={() => navigate('/transporter/admin/vehicles')}
              className="p-3.5 bg-subtle hover:bg-surface border border-border-default hover:border-accent-base/40 rounded-xl transition-all duration-200 text-center flex flex-col items-center gap-2 group"
            >
              <Truck className="w-5 h-5 text-text-secondary group-hover:text-accent-base transition-colors" />
              <span className="text-xs font-medium text-text-primary group-hover:text-accent-base transition-colors">
                Fleet Registry
              </span>
            </button>
            <button 
              onClick={() => navigate('/transporter/admin/vehicles/issues')}
              className="p-3.5 bg-subtle hover:bg-surface border border-border-default hover:border-accent-base/40 rounded-xl transition-all duration-200 text-center flex flex-col items-center gap-2 group"
            >
              <AlertOctagon className="w-5 h-5 text-text-secondary group-hover:text-rose-500 transition-colors" />
              <span className="text-xs font-medium text-text-primary group-hover:text-rose-500 transition-colors">
                Vehicle Defect Logs
              </span>
            </button>
            <button 
              onClick={() => navigate('/transporter/admin/vehicles/movement')}
              className="p-3.5 bg-subtle hover:bg-surface border border-border-default hover:border-accent-base/40 rounded-xl transition-all duration-200 text-center flex flex-col items-center gap-2 group"
            >
              <Activity className="w-5 h-5 text-text-secondary group-hover:text-accent-base transition-colors" />
              <span className="text-xs font-medium text-text-primary group-hover:text-accent-base transition-colors">
                Monthly Movements
              </span>
            </button>
            <button 
              onClick={() => navigate('/transporter/driver/monitor')}
              className="p-3.5 bg-subtle hover:bg-surface border border-border-default hover:border-accent-base/40 rounded-xl transition-all duration-200 text-center flex flex-col items-center gap-2 group"
            >
              <Users className="w-5 h-5 text-text-secondary group-hover:text-accent-base transition-colors" />
              <span className="text-xs font-medium text-text-primary group-hover:text-accent-base transition-colors">
                Driver Monitor
              </span>
            </button>
            <button 
              onClick={() => navigate('/transporter/admin/reports')}
              className="p-3.5 bg-subtle hover:bg-surface border border-border-default hover:border-accent-base/40 rounded-xl transition-all duration-200 text-center flex flex-col items-center gap-2 group"
            >
              <TrendingUp className="w-5 h-5 text-text-secondary group-hover:text-accent-base transition-colors" />
              <span className="text-xs font-medium text-text-primary group-hover:text-accent-base transition-colors">
                Reports & Claims
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Requests Queue */}
      <div className="bg-surface border border-border-default rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default flex flex-row justify-between items-center">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Recent Transport Requests
          </h3>
          <button 
            onClick={() => navigate('/transporter/requests/my')}
            className="text-xs font-semibold text-accent-base hover:opacity-80 p-0 flex items-center gap-1 transition-opacity"
          >
            <span>All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="hidden md:block">
                <SkeletonTable rows={5} columns={6} className="border-none shadow-none rounded-xl" />
              </div>
              <div className="md:hidden">
                <SkeletonMobileCardList count={3} />
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-xs">
              No transport requests found in record.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-subtle/50 border-b border-border-default text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      <th className="px-5 py-3">Reference No.</th>
                      <th className="px-5 py-3">Vehicle Type</th>
                      <th className="px-5 py-3">Destination / Purpose</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Assigned Vehicle / Driver</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default text-xs text-text-primary">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-subtle/40 transition-colors">
                        <td className="px-5 py-3 font-mono font-semibold text-accent-base select-all">{req.no_rujukan}</td>
                        <td className="px-5 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {req.jenis_permohonan === 'ambulance' ? (
                              <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg"><Ambulance className="w-4 h-4" /></span>
                            ) : req.jenis_permohonan === 'van_jenazah' ? (
                              <span className="p-1.5 bg-subtle text-text-secondary rounded-lg"><Truck className="w-4 h-4" /></span>
                            ) : (
                              <span className="p-1.5 bg-accent-base/10 text-accent-base rounded-lg"><Car className="w-4 h-4" /></span>
                            )}
                            <span className="text-text-primary">
                              {req.jenis_permohonan === 'sg' 
                                ? 'Official Car (SG)' 
                                : req.jenis_permohonan === 'van_jenazah' 
                                ? 'Hearse Van' 
                                : 'Ambulance'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-text-primary truncate max-w-xs">{req.destinasi}</div>
                          <div className="text-[11px] text-text-muted truncate max-w-xs">{req.tujuan_permohonan}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            {new Date(req.tarikh_masa_diperlukan).toLocaleString('en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {req.kenderaan ? (
                            <div>
                              <div className="font-semibold text-text-primary">{req.kenderaan.no_kenderaan}</div>
                              <div className="text-[11px] text-text-muted">{req.kenderaan.model}</div>
                            </div>
                          ) : (
                            <span className="text-text-muted italic text-xs">
                              Not yet assigned
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">{getStatusBadge(req.status_semasa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Native Card View (Zero Horizontal Scroll!) */}
              <div className="md:hidden divide-y divide-border-default">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {req.jenis_permohonan === 'ambulance' ? (
                          <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg"><Ambulance className="w-4 h-4" /></span>
                        ) : req.jenis_permohonan === 'van_jenazah' ? (
                          <span className="p-1.5 bg-subtle text-text-secondary rounded-lg"><Truck className="w-4 h-4" /></span>
                        ) : (
                          <span className="p-1.5 bg-accent-base/10 text-accent-base rounded-lg"><Car className="w-4 h-4" /></span>
                        )}
                        <div>
                          <span className="font-mono font-bold text-accent-base text-xs block">{req.no_rujukan}</span>
                          <span className="text-xs font-semibold text-text-primary">
                            {req.jenis_permohonan === 'sg' 
                              ? 'Official Car (SG)' 
                              : req.jenis_permohonan === 'van_jenazah' 
                              ? 'Hearse Van' 
                              : 'Ambulance'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(req.status_semasa)}
                      </div>
                    </div>

                    <div className="bg-subtle/50 p-3 rounded-xl border border-border-default space-y-1.5 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                          Destination / Purpose
                        </span>
                        <span className="font-semibold text-text-primary block truncate">{req.destinasi}</span>
                        <span className="text-text-muted text-[11px] block truncate">{req.tujuan_permohonan}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border-default">
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Date & Time
                          </span>
                          <span className="font-mono text-[11px] text-text-secondary block">
                            {new Date(req.tarikh_masa_diperlukan).toLocaleString('en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                            Assigned Vehicle
                          </span>
                          <span className="font-semibold text-text-primary text-[11px] block truncate">
                            {req.kenderaan ? req.kenderaan.no_kenderaan : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => navigate('/transporter/requests/new')} 
        aria-label="New Trip Request" 
      />
    </div>
  )
}

// ChevronRight helper fallback
const ChevronRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

export default TransporterDashboardPage
