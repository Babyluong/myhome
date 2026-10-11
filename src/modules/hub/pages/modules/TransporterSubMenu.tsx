// src/modules/hub/pages/modules/TransporterSubMenu.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Car, 
  FileText, 
  Plus, 
  Settings, 
  Activity, 
  TrendingUp, 
  UserCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Ambulance } from '../../../mytransporter/components/AmbulanceIcon'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'
import { getTransporterRoles, getRequests, getVehicles } from '@/modules/mytransporter/services/transporterService'
import { Badge, Skeleton } from '@/components/ui'

import { useLanguage } from '@/shared/contexts/LanguageContext'

interface TransporterMenuItem {
  title: string
  description: string
  icon: React.ComponentType<any>
  path: string
  color: string
  badge: React.ReactNode | string | null
  badgeColor?: string
}

export const TransporterSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const [userRole, setUserRole] = useState<string>('staff')
  const [stats, setStats] = useState({
    activeTrips: 0,
    pendingRequests: 0,
    totalVehicles: 0,
    activeIssues: 0,
    loading: true
  })

  useEffect(() => {
    const checkRoleAndStats = async () => {
      try {
        const userId = loggedUser?.id
        if (userId) {
          const res = await getTransporterRoles()
          if (res.data && res.data[userId]) {
            setUserRole(res.data[userId])
          } else if (loggedUser?.role?.role_code === 'system_admin' || loggedUser?.role?.role_code === 'hospital_admin') {
            setUserRole('transport_admin')
          }
        }

        const requestsRes = await getRequests()
        const vehiclesRes = await getVehicles()

        if (requestsRes.data && vehiclesRes.data) {
          const activeTrips = requestsRes.data.filter(r => r.status_semasa === 'in_transit').length
          const pendingRequests = requestsRes.data.filter(r => r.status_semasa === 'submitted').length
          const totalVehicles = vehiclesRes.data.length
          const activeIssues = vehiclesRes.data.filter(v => v.status === 'maintenance').length

          setStats({
            activeTrips,
            pendingRequests,
            totalVehicles,
            activeIssues,
            loading: false
          })
        }
      } catch (err) {
        console.error(err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    checkRoleAndStats()
  }, [loggedUser])

  // Build menu items based on roles
  const menuItems: TransporterMenuItem[] = [
    {
      title: 'Transporter Dashboard',
      description: 'View real-time fleet movement analytics, active driver tasks, and operational metrics.',
      icon: Activity,
      path: '/transporter/dashboard',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.activeTrips > 0 ? (
        `${stats.activeTrips} Active`
      ) : null,
      badgeColor: 'bg-blue-500 text-slate-950 border-transparent'
    },
    {
      title: 'New Transport Request',
      description: 'Requisition form for MOH Ambulance (Referral/Emergency) or Official Department Vehicle (SG).',
      icon: Plus,
      path: '/transporter/requests/new',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Request'
    },
    {
      title: 'My Requests & Status',
      description: 'Track admin approval status, driver dispatch progress, and download official PDF approval slips.',
      icon: FileText,
      path: '/transporter/requests/my',
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-20 rounded-full" />
      ) : stats.pendingRequests > 0 ? (
        `${stats.pendingRequests} Processing`
      ) : null,
      badgeColor: 'bg-amber-500 text-slate-950 border-transparent'
    }
  ]

  // Add driver panel if driver or admin
  if (userRole === 'transport_driver' || userRole === 'transport_admin') {
    menuItems.push({
      title: 'Driver Task Panel',
      description: 'Duty driver portal to accept trips, complete pre/post trip safety inspections, and log odometers.',
      icon: Ambulance,
      path: '/transporter/driver/panel',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.activeTrips > 0 ? (
        'Active Shift'
      ) : null,
      badgeColor: 'bg-emerald-500 text-slate-950 border-transparent'
    })
  }

  // Add admin modules if admin
  if (userRole === 'transport_admin') {
    menuItems.push(
      {
        title: 'Admin Approval Queue',
        description: 'Approve vehicle requisitions and authorize trip release after driver pre-trip safety verification.',
        icon: UserCheck,
        path: '/transporter/admin/approval',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        badge: stats.loading ? (
          <Skeleton className="h-5 w-20 rounded-full" />
        ) : stats.pendingRequests > 0 ? (
          `${stats.pendingRequests} Pending`
        ) : null,
        badgeColor: 'bg-rose-500 text-white border-transparent'
      },
      {
        title: 'Fleet Vehicle Registry',
        description: 'Register hospital ambulances and SG cars, update road tax, odometer telemetry, and active fleet status.',
        icon: Settings,
        path: '/transporter/admin/vehicles',
        color: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
        badge: null
      },
      {
        title: 'Vehicle Issues & Maintenance',
        description: 'Manage and resolve physical/mechanical defects and workshop service reports submitted by drivers.',
        icon: ShieldAlert,
        path: '/transporter/admin/vehicles/issues',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        badge: stats.loading ? (
          <Skeleton className="h-5 w-16 rounded-full" />
        ) : stats.activeIssues > 0 ? (
          `${stats.activeIssues} Issues`
        ) : null,
        badgeColor: 'bg-rose-500 text-white border-transparent'
      },
      {
        title: 'Mileage & Claims Log',
        description: 'Vehicle movement logbook (start/end odometer readings) for monthly mileage and allowance claims.',
        icon: TrendingUp,
        path: '/transporter/admin/vehicles/movement',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        badge: 'Claims'
      },
      {
        title: 'Fleet Reports & Justifications',
        description: 'Official MOH fleet utilization reports and justifications for hospital vehicle acquisitions.',
        icon: FileText,
        path: '/transporter/admin/reports',
        color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
        badge: 'MOH'
      },
      {
        title: 'Role Assignments',
        description: 'Manage access controls and roles for hospital duty drivers and transport administrators.',
        icon: UserCheck,
        path: '/transporter/admin/roles',
        color: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
        badge: 'Access'
      }
    )
  }

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
            <div className="p-3 sm:p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Car className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyTransporter</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  Fleet & Transport System
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Hospital Ambulance & Fleet Transport Management Ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Trips in Transit</span>
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeTrips}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Currently active</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">New Requests</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.pendingRequests}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Pending action</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Registered Fleet</span>
            <Car className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalVehicles}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Ambulances & SG Cars</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Maintenance Status</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeIssues}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Vehicles in service</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          OPERATIONS & ADMINISTRATION
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/40 hover:border-slate-700/80 active:scale-[0.98] transition-colors duration-150 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] cursor-pointer"
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500/80 group-hover:text-blue-400 transition-colors mt-auto pt-2">
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

export default TransporterSubMenu
