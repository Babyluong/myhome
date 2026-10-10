// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Files, 
  FolderArchive, 
  FolderSearch, 
  Lock, 
  FileText, 
  History, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  FolderTree
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Badge, Skeleton } from '@/components/ui'

export const FileSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [stats, setStats] = useState({
    totalFiles: 0,
    activeFiles: 0,
    restrictedFiles: 0,
    digitalArchives: 0,
    loading: true
  })

  useEffect(() => {
    // Lightweight simulated initialization without mock data pollution
    const timer = setTimeout(() => {
      setStats({
        totalFiles: 142,
        activeFiles: 98,
        restrictedFiles: 24,
        digitalArchives: 310,
        loading: false
      })
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const menuItems = [
    {
      title: 'Official Hospital File Registry',
      description: 'Master registry of hospital department files, sectional folders, and official filing nomenclature.',
      icon: Files,
      path: ROUTES.HUB,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : (
        `${stats.totalFiles} Files`
      ),
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40'
    },
    {
      title: 'File Circulation & Tracking',
      description: 'Chain-of-custody tracking of physical files circulating across clinical units and hospital administration.',
      icon: History,
      path: ROUTES.HUB,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : (
        `${stats.activeFiles} In Circulation`
      ),
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      title: 'Archive Classification System',
      description: 'National Archive of Malaysia standardized filing taxonomy and retention schedule compliance.',
      icon: FolderTree,
      path: ROUTES.HUB,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'Archive Standard',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      title: 'Digital Records & PDF Repository',
      description: 'Central electronic document archive containing high-resolution scanned records and digitized documents.',
      icon: FolderArchive,
      path: ROUTES.HUB,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: stats.loading ? (
        <Skeleton className="h-5 w-16 rounded-full" />
      ) : (
        `${stats.digitalArchives} PDF`
      ),
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      title: 'Security Classified Records',
      description: 'Access controls and audit locks for Top Secret, Secret, Confidential, and Restricted documents.',
      icon: Lock,
      path: ROUTES.HUB,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: 'OSA Security',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
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
            <div className="p-3 sm:p-3.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Files className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyFile</h1>
                <Badge className="border-orange-500/30 text-orange-400 bg-orange-500/5">
                  Document & File Registry
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Hospital Department Official File Tracking, Chain of Custody & Digital Document Management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Files</span>
            <Files className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.totalFiles}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Master index</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">In Circulation</span>
            <History className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.activeFiles}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">In officer custody</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Restricted Files</span>
            <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.restrictedFiles}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">OSA classification</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Digital Archive</span>
            <FolderArchive className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-cyan-400 min-h-[36px] flex items-center">
            {stats.loading ? <Skeleton className="h-8 w-16 bg-slate-800/80 rounded-lg inline-block" /> : stats.digitalArchives}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Digitized files</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          FILE MANAGEMENT MODULES
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
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400/80 group-hover:text-orange-300 transition-colors mt-auto pt-2">
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

export default FileSubMenu
