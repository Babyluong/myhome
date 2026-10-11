import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Building2,
  ShieldAlert,
  ArrowRight,
  Database,
  ShieldCheck,
  Activity,
  Clock,
  ChevronRight
} from 'lucide-react'
import { getAccessRequests } from '@/services/accessRequestManagementService'
import { getUsers } from '@/services/userService'
import { getRoles } from '@/services/roleService'
import { getDepartments } from '@/services/departmentService'
import { getAuditLogs } from '@/services/auditLogService'
import { formatDate } from '@/lib/utils'
import type { AuditLogWithRelations } from '@/types'

interface AdminOverviewTabProps {
  onTabChange: (tabId: string) => void
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalUsers: 0,
    totalDepartments: 0,
    totalRoles: 0
  })
  const [recentLogs, setRecentLogs] = useState<AuditLogWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchOverviewData = async () => {
      setIsLoading(true)
      try {
        const [requestsRes, usersRes, rolesRes, deptsRes, logsRes] = await Promise.all([
          getAccessRequests({ page: 1, pageSize: 1, status: 'pending' }),
          getUsers({ page: 1, pageSize: 1 }),
          getRoles({ page: 1, pageSize: 1 }),
          getDepartments({ page: 1, pageSize: 1 }),
          getAuditLogs({ page: 1, pageSize: 5 })
        ])

        if (isMounted) {
          setStats({
            pendingRequests: requestsRes.total || 0,
            totalUsers: usersRes.total || 0,
            totalDepartments: deptsRes.total || 0,
            totalRoles: rolesRes.total || 0
          })

          setRecentLogs(logsRes.data || [])
        }
      } catch (error) {
        console.error('Error loading overview stats:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchOverviewData()
    return () => {
      isMounted = false
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } }
  }

  const statCards = [
    {
      id: 'approvals',
      title: 'Permohonan Akses',
      badge: stats.pendingRequests > 0 ? 'Menunggu' : 'Selesai',
      value: stats.pendingRequests,
      desc: 'Kelulusan pendaftaran staf',
      icon: UserCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      action: () => onTabChange('approvals')
    },
    {
      id: 'users',
      title: 'Jumlah Pengguna',
      badge: 'Aktif',
      value: stats.totalUsers,
      desc: 'Akaun staf ekosistem',
      icon: Users,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      border: 'border-sky-400/20',
      action: () => onTabChange('users')
    },
    {
      id: 'departments',
      title: 'Bilangan Jabatan',
      badge: 'Klinikal',
      value: stats.totalDepartments,
      desc: 'Unit & wad hospital',
      icon: Building2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20',
      action: () => onTabChange('departments')
    },
    {
      id: 'rbac',
      title: 'Peranan RBAC',
      badge: 'Matriks',
      value: stats.totalRoles,
      desc: 'Konfigurasi had kuasa',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      action: () => onTabChange('rbac')
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hospital Operations Admin Banner - Clean & Restrained */}
      <div className="p-4 sm:p-6 rounded-xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Hospital Lawas • Modul Pentadbiran Rasmi</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">
            Panel Kawalan Pentadbiran Ekosistem Hospital
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Pusat pemantauan integriti akaun kakitangan, semakan kelulusan akses klinikal di bawah regulasi KKM, pemantauan unit jabatan serta pengauditan jejak transaksi sistem H.O.M.E.
          </p>
        </div>
      </div>

      {/* Stats Grid - 2x2 on Mobile, 4 columns on Desktop */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
      >
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.id}
              variants={itemVariants}
              onClick={card.action}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 sm:p-5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors duration-150 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  card.action()
                }
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 sm:p-3 rounded-lg border ${card.bg} ${card.border} ${card.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                    {card.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted sm:hidden" />
                </div>
                <div className="space-y-0.5">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      {card.value}
                    </p>
                  )}
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1">{card.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-normal line-clamp-1">{card.desc}</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-teal-400 transition-colors pt-3 mt-3 border-t border-slate-800/60">
                <span>Semak Terperinci</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main Section: Audit Logs + Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Logs (Left 2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
              <span>Jejak Audit Aktiviti Terkini</span>
            </h3>
            <button
              onClick={() => onTabChange('logs')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors min-h-[36px] px-2 py-1 rounded hover:bg-teal-400/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
            >
              <span>Lihat Semua Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-slate-800">
            {isLoading ? (
              <div className="p-8 space-y-3">
                <div className="h-5 bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-5 bg-slate-800 rounded w-11/12 animate-pulse" />
                <div className="h-5 bg-slate-800 rounded w-10/12 animate-pulse" />
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-sm">
                Tiada aktiviti audit terkini direkodkan.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3.5">Staf / Pengguna</th>
                    <th className="p-3.5">Modul</th>
                    <th className="p-3.5">Aktiviti (Tindakan)</th>
                    <th className="p-3.5 text-right">Tarikh & Masa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 text-xs sm:text-sm">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div>
                          <div className="text-white text-sm font-semibold">
                            {log.user?.full_name || 'Sistem / Automasi'}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {log.user?.employee_id || 'AUTO'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-teal-300 border border-slate-700 capitalize">
                          {log.module?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-300">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-right text-xs text-slate-400 font-mono">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Card List View (Eliminates horizontal table overflow) */}
          <div className="md:hidden space-y-2.5">
            {isLoading ? (
              <div className="space-y-2.5">
                <div className="h-16 bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-16 bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-16 bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-xs">
                Tiada aktiviti audit terkini direkodkan.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[180px]">
                      {log.user?.full_name || 'Sistem / Automasi'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-text-muted" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-teal-300 border border-slate-700">
                      {log.module?.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300 text-xs truncate max-w-[170px] text-right font-medium">
                      {log.action}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Panel (Right 1 column) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              <span>Tindakan Pantas Pentadbir</span>
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onTabChange('approvals')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <div>
                  <div className="text-white text-xs sm:text-sm font-semibold group-hover:text-teal-400 transition-colors">
                    Semakan Kelulusan Staf
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Semak dan sahkan permohonan akaun baru
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-teal-400 transition-colors group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onTabChange('rbac')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
              >
                <div>
                  <div className="text-white text-xs sm:text-sm font-semibold group-hover:text-emerald-400 transition-colors">
                    Matriks Had Kuasa (RBAC)
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Konfigurasi kebenaran akses mengikut peranan
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-emerald-400 transition-colors group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onTabChange('users')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <div>
                  <div className="text-white text-xs sm:text-sm font-semibold group-hover:text-sky-400 transition-colors">
                    Pengurusan Akaun Staf
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Tetapan jabatan, jawatan dan status akaun
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-sky-400 transition-colors group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Pematuhan Keselamatan ICT KKM</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-normal">
                Selaras dengan Dasar Keselamatan ICT KKM dan Akta Perlindungan Data Peribadi 2010 (PDPA), setiap kelulusan peranan dan transaksi sistem direkodkan dalam jejak audit kekal bagi akauntabiliti klinikal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverviewTab
