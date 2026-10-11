// @ts-nocheck
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Wrench, 
  Sparkles, 
  Info, 
  ChevronDown, 
  Calendar, 
  Clock, 
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react'
import type { SystemAnnouncement } from '@/services/systemAnnouncementService'

interface SystemBroadcastBannerProps {
  announcements: SystemAnnouncement[]
  isLoading?: boolean
  language?: 'ms' | 'en'
  onOpenUpdateLogs?: () => void
}

export const SystemBroadcastBanner: React.FC<SystemBroadcastBannerProps> = ({
  announcements,
  isLoading = false,
  language = 'ms',
  onOpenUpdateLogs
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Prioritize maintenance or urgent announcements
  const activeNotices = announcements.filter(a => a.is_active && a.status === 'published')
  const maintenanceNotices = activeNotices.filter(a => a.type === 'maintenance')
  const updateNotices = activeNotices.filter(a => a.type === 'system_update')
  const advisoryNotices = activeNotices.filter(a => a.type === 'advisory' || a.type === 'incident')

  const topNotice = maintenanceNotices[0] || updateNotices[0] || advisoryNotices[0]

  // If there are no notices and not loading
  if (!isLoading && activeNotices.length === 0) {
    return (
      <div className="w-full bg-surface border border-border-default rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-elevation-1 transition-colors">
        <div className="flex items-center gap-2.5 text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-text-primary">
            System Status: All Services &amp; Databases Operational
          </span>
          <span className="hidden md:inline text-text-muted">•</span>
          <span className="hidden md:inline text-text-secondary">
            No active maintenance at this time
          </span>
        </div>

        {onOpenUpdateLogs && (
          <button
            type="button"
            onClick={onOpenUpdateLogs}
            className="text-[11px] font-semibold text-accent-base hover:text-accent-hover transition-colors flex items-center gap-1 shrink-0 py-0.5"
          >
            <span>Changelog</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-11 bg-surface-subtle border border-border-default rounded-xl animate-pulse" />
    )
  }

  // Determine styling based on top notice severity/type
  const getBannerBadge = (notice: SystemAnnouncement) => {
    if (notice.type === 'maintenance') {
      return {
        icon: Wrench,
        badgeText: 'System Maintenance',
        containerBorder: 'border-amber-500/25 dark:border-amber-500/30',
        containerBg: 'bg-amber-500/5 dark:bg-amber-500/10',
        badgeBg: 'bg-amber-500/15 text-amber-400 dark:text-amber-300 border-amber-500/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
      }
    }
    if (notice.type === 'system_update') {
      return {
        icon: Sparkles,
        badgeText: notice.version_tag ? `System Update ${notice.version_tag}` : 'System Update',
        containerBorder: 'border-accent-base/30',
        containerBg: 'bg-accent-subtle/40',
        badgeBg: 'bg-accent-subtle text-accent-base border-accent-base/30',
        iconColor: 'text-accent-base',
      }
    }
    if (notice.severity === 'critical' || notice.type === 'incident') {
      return {
        icon: AlertTriangle,
        badgeText: 'Critical Advisory',
        containerBorder: 'border-rose-500/25 dark:border-rose-500/30',
        containerBg: 'bg-rose-500/5 dark:bg-rose-500/10',
        badgeBg: 'bg-rose-500/15 text-rose-400 dark:text-rose-300 border-rose-500/30',
        iconColor: 'text-rose-600 dark:text-rose-400',
      }
    }
    return {
      icon: Info,
      badgeText: 'Operational Notice',
      containerBorder: 'border-border-default',
      containerBg: 'bg-surface',
      badgeBg: 'bg-surface-subtle text-text-secondary border-border-default',
      iconColor: 'text-text-muted',
    }
  }

  const currentStyle = topNotice ? getBannerBadge(topNotice) : getBannerBadge({ type: 'advisory', severity: 'info' } as any)
  const CurrentIcon = currentStyle.icon

  return (
    <div className={`w-full ${currentStyle.containerBg} border ${currentStyle.containerBorder} rounded-xl p-3 sm:p-4 shadow-elevation-1 transition-colors duration-150`}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-surface border border-border-default shrink-0 shadow-elevation-1">
            <CurrentIcon className={`w-4 h-4 ${currentStyle.iconColor}`} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0 flex-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${currentStyle.badgeBg}`}>
              {currentStyle.badgeText}
            </span>

            <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
              {topNotice?.title}
            </p>

            {topNotice?.scheduled_start && topNotice?.scheduled_end && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(topNotice.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(topNotice.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeNotices.length > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border-default text-[10px] font-bold text-text-secondary">
              {activeNotices.length} {activeNotices.length === 1 ? 'Notice' : 'Notices'}
            </span>
          )}

          <button 
            type="button"
            className="p-1 text-text-muted hover:text-text-primary transition-transform"
            aria-label="Toggle notice details"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-3 mt-3 border-t border-border-default space-y-3"
          >
            {activeNotices.map((notice) => {
              const style = getBannerBadge(notice)
              const NoticeIcon = style.icon

              return (
                <div 
                  key={notice.id}
                  className="p-3 rounded-lg bg-surface border border-border-default flex flex-col gap-2 shadow-elevation-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.badgeBg}`}>
                        {notice.type === 'maintenance' 
                          ? 'Maintenance'
                          : notice.type === 'system_update' 
                            ? 'Update'
                            : 'Advisory'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                        {notice.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      {notice.scheduled_start && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.scheduled_start).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span>
                        {new Date(notice.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>

                  {notice.affected_modules && notice.affected_modules.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-text-muted">
                      <Layers className="w-3 h-3 text-text-muted" />
                      <span className="font-medium text-text-secondary">
                        Affected Modules:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {notice.affected_modules.map((mod, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border-default font-mono text-[9px]">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default SystemBroadcastBanner
