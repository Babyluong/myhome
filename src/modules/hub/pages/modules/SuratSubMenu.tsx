// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  Inbox, 
  FileText, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Archive,
  ChevronRight,
  ScrollText
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getMemos } from '@/services/memoService'

export const SuratSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || '1a2b3c4d-5e6f-7890-abcd-ef1234567890'

  const [stats, setStats] = useState({
    totalMemos: 0,
    pendingMemos: 0,
    publishedMemos: 0,
    urgentMemos: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getMemos(hospitalId)
        const memos = res.data?.data || res.data || []
        const total = Array.isArray(memos) ? memos.length : 0
        const pending = Array.isArray(memos) ? memos.filter((m: any) => m.status === 'pending_approval' || m.status === 'draft').length : 0
        const published = Array.isArray(memos) ? memos.filter((m: any) => m.status === 'published' || m.status === 'approved').length : 0
        const urgent = Array.isArray(memos) ? memos.filter((m: any) => m.priority === 'urgent' || m.priority === 'high').length : 0

        setStats({
          totalMemos: total,
          pendingMemos: pending,
          publishedMemos: published,
          urgentMemos: urgent,
          loading: false
        })
      } catch (err) {
        console.error('Failed to load MySurat submenu stats', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [hospitalId])

  const menuItems = [
    {
      title: 'Letters & Memo Dashboard',
      description: 'Overview of hospital correspondence dispatch, incoming/outgoing registry, and broadcast directives.',
      icon: Mail,
      path: ROUTES.ADMIN_MEMOS || '/admin/memos',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.publishedMemos > 0 ? (
        `${stats.publishedMemos} Active`
      ) : null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    },
    {
      title: 'Incoming Correspondence',
      description: 'Incoming government correspondence logs from MOH headquarters, state health department, and external bodies.',
      icon: Inbox,
      path: '/admin/memos',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : stats.pendingMemos > 0 ? (
        `${stats.pendingMemos} Action Required`
      ) : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      title: 'Draft New Letter or Memo',
      description: 'Official MOH standardized letter drafting with automatic file reference indexing and digital routing.',
      icon: Send,
      path: ROUTES.ADMIN_MEMO_CREATE || '/admin/memos/create',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'MOH Standard',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Circulars & Directives',
      description: 'Official hospital operational circulars, administrative directives, and clinical standard procedures.',
      icon: ScrollText,
      path: '/admin/memos',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'Circulars',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      title: 'Correspondence Archives',
      description: 'Searchable historical archive indexed by year, security classification, file serials, and issuing officer.',
      icon: Archive,
      path: '/admin/memos',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: null
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
            <div className="p-3 sm:p-3.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Mail className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MySurat</h1>
                <Badge className="border-purple-500/30 text-purple-400 bg-purple-500/5">
                  Official Correspondence
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Government Official Correspondence, Departmental Memos &amp; Administrative Circulars
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Total Records</span>
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalMemos}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Letters &amp; memos</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.pendingMemos}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Drafts &amp; approvals</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">Published Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-emerald-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.publishedMemos}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">In circulation</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-xs sm:text-sm font-medium">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.urgentMemos}
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted mt-1">Urgent &amp; STAT</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          MYSURAT MODULES &amp; OPERATIONS
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400/80 group-hover:text-purple-300 transition-colors mt-auto pt-2">
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

export default SuratSubMenu
