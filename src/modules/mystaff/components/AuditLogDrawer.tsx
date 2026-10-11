// src/modules/mystaff/components/AuditLogDrawer.tsx
// Comprehensive Audit Trail & History Viewer for MyStaff Module (Reminders & Movements)

import React, { useState, useEffect, useMemo } from 'react'
import {
  History,
  Search,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit3,
  PlusCircle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  FileText,
  Briefcase,
  Bell,
  X
} from 'lucide-react'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { SlideOver, Badge } from '@/components/ui'
import { getStaffAuditLogs } from '@/modules/mystaff/services/staffService'
import type { StaffAuditLog, AuditModuleType, AuditActionType } from '@/shared/types/mystaff'

interface AuditLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  defaultModule?: AuditModuleType | 'ALL'
  title?: string
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  defaultModule = 'ALL',
  title
}) => {
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const defaultTitle = isMs ? 'Log Audit & Sejarah Pindaan Rasmi' : 'Official Audit Trail & Modification History'
  const displayTitle = title || defaultTitle

  const [logs, setLogs] = useState<StaffAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string>(defaultModule)
  const [selectedAction, setSelectedAction] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      const res = await getStaffAuditLogs()
      if (res.data) setLogs(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadLogs()
      if (defaultModule) setSelectedModule(defaultModule)
    }
  }, [isOpen, defaultModule])

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (selectedModule !== 'ALL' && l.module !== selectedModule) return false
      if (selectedAction !== 'ALL' && l.action !== selectedAction) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = l.record_title?.toLowerCase().includes(q)
        const matchReason = l.reason?.toLowerCase().includes(q)
        const matchActor = l.actor_name?.toLowerCase().includes(q)
        if (!matchTitle && !matchReason && !matchActor) return false
      }
      return true
    })
  }, [logs, selectedModule, selectedAction, searchQuery])

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'DELETE':
        return {
          bg: 'bg-rose-100 text-rose-400 dark:text-rose-300 font-bold border-rose-300',
          icon: <Trash2 className="w-3 h-3 text-rose-700" />,
          label: isMs ? 'PEMADAMAN' : 'DELETION'
        }
      case 'EDIT':
        return {
          bg: 'bg-amber-100 text-amber-400 dark:text-amber-300 font-bold border-amber-300',
          icon: <Edit3 className="w-3 h-3 text-amber-700" />,
          label: isMs ? 'PINDAAN DATA' : 'DATA MODIFICATION'
        }
      case 'CREATE':
        return {
          bg: 'bg-emerald-100 text-emerald-400 dark:text-emerald-300 font-bold border-emerald-300',
          icon: <PlusCircle className="w-3 h-3 text-emerald-700" />,
          label: isMs ? 'PENDAFTARAN' : 'REGISTRATION'
        }
      case 'STATUS_CHANGE':
        return {
          bg: 'bg-purple-100 text-indigo-400 dark:text-indigo-300 font-bold border-purple-300',
          icon: <CheckCircle2 className="w-3 h-3 text-purple-700" />,
          label: isMs ? 'STATUS SELESAI' : 'STATUS COMPLETED'
        }
      default:
        return {
          bg: 'bg-subtle text-text-primary border-border-default',
          icon: <History className="w-3 h-3 text-text-muted" />,
          label: action
        }
    }
  }

  const getModuleBadge = (module: AuditModuleType) => {
    switch (module) {
      case 'MOVEMENT':
        return {
          bg: 'bg-accent-base/10 text-teal-800 border-accent-base/20',
          label: isMs ? 'Pergerakan Staf' : 'Staff Movement',
          icon: <Briefcase className="w-3 h-3 text-teal-600" />
        }
      case 'REMINDER':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          label: isMs ? 'Log Event / CME' : 'Event Log / CME',
          icon: <Bell className="w-3 h-3 text-purple-600" />
        }
      default:
        return {
          bg: 'bg-subtle/50 text-text-secondary border-border-default',
          label: module,
          icon: <FileText className="w-3 h-3 text-text-muted" />
        }
    }
  }

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={displayTitle}
      description={
        isMs
          ? 'Jejak audit penuh merekodkan siapa, bila dan mengapa sesuatu rekod dipinda atau dipadam bagi tujuan ketelusan & integriti data.'
          : 'Comprehensive audit trail recording who, when, and why a record was modified or deleted for transparency and data integrity.'
      }
    >
      <div className="p-6 md:p-8 space-y-6 text-text-primary pb-20">
        {/* Top Filter and Search Bar */}
        <div className="space-y-3 bg-subtle/50 border border-border-default p-4 rounded-2xl">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isMs ? "Cari sebab, pegawai, tajuk acara..." : "Search reason, officer, record title..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-default text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          {/* Module Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">
              {isMs ? 'Modul:' : 'Module:'}
            </span>
            {[
              { id: 'ALL', label: isMs ? 'Semua Modul' : 'All Modules' },
              { id: 'REMINDER', label: isMs ? 'Log Event / CME' : 'Event Log / CME' },
              { id: 'MOVEMENT', label: isMs ? 'Pergerakan Staf' : 'Staff Movement' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedModule === m.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-surface text-text-muted border border-border-default hover:bg-subtle'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Action Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border-default">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">
              {isMs ? 'Tindakan:' : 'Action:'}
            </span>
            {[
              { id: 'ALL', label: isMs ? 'Semua' : 'All' },
              { id: 'EDIT', label: isMs ? 'Pindaan' : 'Modifications', dot: 'bg-amber-500' },
              { id: 'DELETE', label: isMs ? 'Pemadaman' : 'Deletions', dot: 'bg-rose-500' }
            ].map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAction(a.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  selectedAction === a.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-surface text-text-muted border border-border-default hover:bg-subtle'
                }`}
              >
                {a.dot && <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />}
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Log List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-text-muted px-1">
            <span>
              {isMs ? `Jumlah Rekod Audit: ${filteredLogs.length}` : `Total Audit Records: ${filteredLogs.length}`}
            </span>
            <span className="text-[11px] text-slate-400">
              {isMs ? 'Susunan: Terkini ke Terawal' : 'Sort: Newest to Oldest'}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-slate-400" />
              <p className="text-xs font-bold text-text-muted">
                {isMs ? 'Memuatkan rekod audit...' : 'Loading audit records...'}
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-subtle/50 rounded-2xl border border-dashed border-border-default">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-text-muted text-sm">
                {isMs ? 'No audit records found' : 'No audit records found'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMs
                  ? 'Sebarang pindaan atau pemadaman rekod akan direkodkan di sini secara automatik.'
                  : 'Any record modifications or deletions will be automatically logged here.'}
              </p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const actBadge = getActionBadge(log.action)
              const modBadge = getModuleBadge(log.module)
              const date = new Date(log.created_at)

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-surface border border-border-default shadow-xs hover:border-border-default transition-colors space-y-3 relative overflow-hidden"
                >
                  {/* Top Bar: Action Badge + Module Tag + Timestamp */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${actBadge.bg}`}>
                        {actBadge.icon}
                        <span>{actBadge.label}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${modBadge.bg}`}>
                        {modBadge.icon}
                        <span>{modBadge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-text-muted font-mono text-[11px] font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {date.toLocaleDateString(isMs ? 'ms-MY' : 'en-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}{' '}
                        •{' '}
                        {date.toLocaleTimeString(isMs ? 'ms-MY' : 'en-MY', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Record Title */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isMs ? 'Tajuk Rekod Terlibat:' : 'Target Record Title:'}
                    </span>
                    <h4 className="font-extrabold text-sm text-text-primary leading-snug">
                      "{log.record_title}"
                    </h4>
                  </div>

                  {/* Reason Callout Box */}
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    log.action === 'DELETE'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 dark:text-rose-300 font-bold'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400 dark:text-amber-300 font-bold'
                  }`}>
                    <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isMs ? 'Sebab / Justifikasi Rasmi:' : 'Official Reason / Justification:'}</span>
                    </div>
                    <p className="font-semibold italic">"{log.reason}"</p>
                  </div>

                  {/* Actor Strip */}
                  <div className="flex items-center justify-between gap-3 pt-1 text-xs border-t border-border-subtle">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-subtle text-text-primary flex items-center justify-center font-bold text-[10px]">
                        {log.actor_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <span className="font-bold text-text-primary text-xs">
                          {log.actor_name}
                        </span>
                        {log.actor_role && (
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({log.actor_role})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {log.id.slice(-6)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </SlideOver>
  )
}
