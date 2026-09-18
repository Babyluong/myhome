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

import { useLanguage } from '@/shared/contexts/LanguageContext'

interface TransporterMenuItem {
  title: string
  description: string
  icon: React.ComponentType<any>
  path: string
  color: string
  badge: string | null
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
      title: language === 'ms' ? 'Papan Pemuka Transporter' : 'Transporter Dashboard',
      description: language === 'ms' 
        ? 'Lihat statistik masa nyata pergerakan kenderaan, tugasan aktif pemandu, dan analitik ringkas.'
        : 'View real-time fleet movement analytics, active driver tasks, and operational metrics.',
      icon: Activity,
      path: '/transporter/dashboard',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: stats.activeTrips > 0 ? (language === 'ms' ? `${stats.activeTrips} Aktif` : `${stats.activeTrips} Active`) : null,
      badgeColor: 'bg-blue-500 text-slate-950 border-transparent'
    },
    {
      title: language === 'ms' ? 'Permohonan Baru' : 'New Transport Request',
      description: language === 'ms'
        ? 'Borang permohonan Ambulans KKM (Rujukan/Kecemasan) atau Kereta Jabatan (SG) bagi urusan rasmi.'
        : 'Requisition form for MOH Ambulance (Referral/Emergency) or Official Department Vehicle (SG).',
      icon: Plus,
      path: '/transporter/requests/new',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: language === 'ms' ? 'Borang' : 'Request'
    },
    {
      title: language === 'ms' ? 'Senarai Permohonan Saya' : 'My Requests & Status',
      description: language === 'ms'
        ? 'Semak status kelulusan pentadbir, status perjalanan pemandu, dan muat turun borang kelulusan PDF.'
        : 'Track admin approval status, driver dispatch progress, and download official PDF approval slips.',
      icon: FileText,
      path: '/transporter/requests/my',
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      badge: stats.pendingRequests > 0 ? (language === 'ms' ? `${stats.pendingRequests} Diproses` : `${stats.pendingRequests} Processing`) : null,
      badgeColor: 'bg-amber-500 text-slate-950 border-transparent'
    }
  ]

  // Add driver panel if driver or admin
  if (userRole === 'transport_driver' || userRole === 'transport_admin') {
    menuItems.push({
      title: language === 'ms' ? 'Panel Tugasan Pemandu' : 'Driver Task Panel',
      description: language === 'ms'
        ? 'Log pemandu bertugas untuk menerima trip, melakukan checklist pre/post safety trip, dan memandu.'
        : 'Duty driver portal to accept trips, complete pre/post trip safety inspections, and log odometers.',
      icon: Ambulance,
      path: '/transporter/driver/panel',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.activeTrips > 0 ? (language === 'ms' ? 'Syif Aktif' : 'Active Shift') : null,
      badgeColor: 'bg-emerald-500 text-slate-950 border-transparent'
    })
  }

  // Add admin modules if admin
  if (userRole === 'transport_admin') {
    menuItems.push(
      {
        title: language === 'ms' ? 'Kelulusan Pentadbir (Admin Queue)' : 'Admin Approval Queue',
        description: language === 'ms'
          ? 'Kelulusan permohonan kenderaan dan pelepasan trip selepas semakan keselamatan pre-trip pemandu.'
          : 'Approve vehicle requisitions and authorize trip release after driver pre-trip safety verification.',
        icon: UserCheck,
        path: '/transporter/admin/approval',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        badge: stats.pendingRequests > 0 ? (language === 'ms' ? `${stats.pendingRequests} Kelulusan` : `${stats.pendingRequests} Pending`) : null,
        badgeColor: 'bg-rose-500 text-white border-transparent'
      },
      {
        title: language === 'ms' ? 'Pendaftaran Kenderaan (Fleet)' : 'Fleet Vehicle Registry',
        description: language === 'ms'
          ? 'Daftar kenderaan ambulans/SG baru, kemaskini status cukai jalan, odometer, dan status aktif fleet.'
          : 'Register hospital ambulances and SG cars, update road tax, odometer telemetry, and active fleet status.',
        icon: Settings,
        path: '/transporter/admin/vehicles',
        color: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
        badge: null
      },
      {
        title: language === 'ms' ? 'Aduan & Penyelenggaraan Kenderaan' : 'Vehicle Issues & Maintenance',
        description: language === 'ms'
          ? 'Selesaikan laporan kerosakan fizikal/enjin kenderaan yang dilaporkan oleh pemandu.'
          : 'Manage and resolve physical/mechanical defects and workshop service reports submitted by drivers.',
        icon: ShieldAlert,
        path: '/transporter/admin/vehicles/issues',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        badge: stats.activeIssues > 0 ? (language === 'ms' ? `${stats.activeIssues} Rosak` : `${stats.activeIssues} Issues`) : null,
        badgeColor: 'bg-rose-500 text-white border-transparent'
      },
      {
        title: language === 'ms' ? 'Tuntutan & Laporan Pergerakan' : 'Mileage & Claims Log',
        description: language === 'ms'
          ? 'Log pergerakan kenderaan (odometer start/end) untuk tuntutan perbatuan (mileage claims) bulanan.'
          : 'Vehicle movement logbook (start/end odometer readings) for monthly mileage and allowance claims.',
        icon: TrendingUp,
        path: '/transporter/admin/vehicles/movement',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        badge: 'Claims'
      },
      {
        title: language === 'ms' ? 'Laporan & Justifikasi Aset' : 'Fleet Reports & Justifications',
        description: language === 'ms'
          ? 'Penjanaan laporan rasmi dan justifikasi KKM untuk pertambahan aset fleet hospital.'
          : 'Official MOH fleet utilization reports and justifications for hospital vehicle acquisitions.',
        icon: FileText,
        path: '/transporter/admin/reports',
        color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
        badge: 'MOH'
      },
      {
        title: language === 'ms' ? 'Penugasan Peranan (Roles)' : 'Role Assignments',
        description: language === 'ms'
          ? 'Urus peranan dan hak akses pemandu bertugas (driver) dan pentadbir pengangkutan (admin).'
          : 'Manage access controls and roles for hospital duty drivers and transport administrators.',
        icon: UserCheck,
        path: '/transporter/admin/roles',
        color: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
        badge: 'Access'
      }
    )
  }

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
            <div className="p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl shadow-inner">
              <Car className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">MyTransporter</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  {language === 'ms' ? 'Sub-modul Pengangkutan' : 'Fleet & Transport Sub-module'}
                </span>
              </div>
              <p className="text-slate-400 mt-1">
                {language === 'ms'
                  ? 'Sistem Pengurusan Pengangkutan & Ambulans Hospital'
                  : 'Hospital Ambulance & Fleet Transport Management Ecosystem'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Trip Dalam Perjalanan' : 'Trips in Transit'}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-white">
            {stats.loading ? '...' : stats.activeTrips}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Sedang aktif' : 'Currently active'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Permohonan Baru' : 'New Requests'}</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-amber-400">
            {stats.loading ? '...' : stats.pendingRequests}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Menunggu tindakan' : 'Pending action'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Jumlah Fleet Terdaftar' : 'Registered Fleet'}</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-cyan-400">
            {stats.loading ? '...' : stats.totalVehicles}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Ambulans & SG' : 'Ambulances & SG Cars'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-sm font-medium">{language === 'ms' ? 'Status Penyelenggaraan' : 'Maintenance Status'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-bold font-mono mt-2 text-rose-400">
            {stats.loading ? '...' : stats.activeIssues}
          </p>
          <p className="text-xs text-slate-500 mt-1">{language === 'ms' ? 'Kenderaan diservis' : 'Vehicles in service'}</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">
          {language === 'ms' ? 'PILIHAN OPERASI & PENTADBIRAN' : 'OPERATIONS & ADMINISTRATION'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[190px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${item.badgeColor || 'border-slate-800 text-slate-400 bg-slate-950'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500/80 group-hover:text-blue-400 transition-colors mt-auto">
                  <span>{language === 'ms' ? 'Masuk Menu' : 'Open Module'}</span>
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
