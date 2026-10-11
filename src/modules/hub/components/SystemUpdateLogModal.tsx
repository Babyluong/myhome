// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  FileCode, 
  GitCommit, 
  ExternalLink,
  GitBranch,
  RefreshCw
} from 'lucide-react'
import { 
  type SystemAnnouncement, 
  getRecentProductionCommits,
  getLiveDeploymentMetadata,
  getSystemUpdateLogs,
  syncLiveProductionReleases,
  CURRENT_SYSTEM_VERSION,
  BUILD_COMMIT_HASH
} from '@/services/systemAnnouncementService'

interface SystemUpdateLogModalProps {
  isOpen: boolean
  onClose: () => void
  logs: SystemAnnouncement[]
  isLoading?: boolean
  language?: 'ms' | 'en'
}

export const SystemUpdateLogModal: React.FC<SystemUpdateLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  isLoading = false,
  language = 'ms',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'updates' | 'maintenance' | 'commits'>('all')
  const [displayLogs, setDisplayLogs] = useState<SystemAnnouncement[]>(logs)
  const [commits, setCommits] = useState<any[]>([])
  const [buildMeta, setBuildMeta] = useState<any>(null)
  const [isCommitsLoading, setIsCommitsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Keep displayLogs in sync with parent props
  useEffect(() => {
    if (logs && logs.length > 0) {
      setDisplayLogs(logs)
    }
  }, [logs])

  // Explicit sync handler
  const handleSync = async () => {
    try {
      setIsSyncing(true)
      const res = await syncLiveProductionReleases()
      setBuildMeta(res.metadata)
      setCommits(res.commits || [])
      if (res.logs && res.logs.length > 0) {
        setDisplayLogs(res.logs)
      }
    } catch (err) {
      console.warn('Sync failed:', err)
    } finally {
      setIsSyncing(false)
    }
  }

  // Fetch live commits and verified releases when modal opens
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const loadData = async () => {
      try {
        setIsCommitsLoading(true)
        const [metaData, commitList, freshLogs] = await Promise.all([
          getLiveDeploymentMetadata(),
          getRecentProductionCommits(),
          getSystemUpdateLogs()
        ])
        if (isMounted) {
          setBuildMeta(metaData)
          setCommits(commitList || [])
          if (freshLogs && freshLogs.length > 0) {
            setDisplayLogs(freshLogs)
          }
        }
      } catch (err) {
        console.warn('Error loading commit history:', err)
      } finally {
        if (isMounted) setIsCommitsLoading(false)
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredLogs = displayLogs.filter((item) => {
    if (activeTab === 'updates') return item.type === 'system_update'
    if (activeTab === 'maintenance') return item.type === 'maintenance'
    return true
  })

  const semverLog = displayLogs.find(l => l.version_tag && /^v?\d+\.\d+\.\d+/i.test(l.version_tag))
  const currentVersion = semverLog?.version_tag || buildMeta?.version || CURRENT_SYSTEM_VERSION
  const activeCommit = buildMeta?.commitHash || BUILD_COMMIT_HASH

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent-base/30 flex items-center justify-center text-accent-base">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                    System Releases &amp; Update Log
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-accent-subtle border border-accent-base/30 text-accent-base font-mono text-[10px] font-bold">
                    {currentVersion}
                  </span>
                  {activeCommit && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle border border-border-default text-text-secondary font-mono text-[10px]">
                      <GitCommit className="w-2.5 h-2.5 text-accent-base" />
                      {activeCommit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Automated release and production deployment synchronization.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle hover:bg-subtle border border-border-default rounded-lg transition-colors disabled:opacity-50"
                title="Sync and verify latest production releases"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-accent-base ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-subtle transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-subtle border-b border-border-default text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              All Releases ({displayLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('updates')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'updates'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              System Updates ({displayLogs.filter(l => l.type === 'system_update').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('maintenance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'maintenance'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Maintenance ({displayLogs.filter(l => l.type === 'maintenance').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('commits')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === 'commits'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Git Commits ({commits.length})</span>
            </button>
          </div>

          {/* Log List Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-border-default">
            {activeTab === 'commits' ? (
              // Dedicated Production Git Commits Feed
              <div className="space-y-3">
                {isCommitsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-accent-base/20 border-t-accent-base rounded-full animate-spin" />
                    <span className="text-xs text-text-muted">Loading git commits...</span>
                  </div>
                ) : commits.length === 0 ? (
                  <div className="py-12 text-center text-text-muted text-xs">
                    No commits found.
                  </div>
                ) : (
                  commits.map((commit, idx) => (
                    <div 
                      key={commit.hash || idx}
                      className="p-3 rounded-xl bg-surface border border-border-default hover:border-border-strong transition-colors flex flex-col gap-2 shadow-elevation-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-accent-subtle text-accent-base border border-accent-base/30">
                            {commit.shortHash || commit.hash?.slice(0, 7)}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {(!commit.author || commit.author.toLowerCase().includes('lawas') || commit.author.toLowerCase().includes('ci/cd'))
                              ? 'H.O.M.E. System Administrator'
                              : commit.author}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <Calendar className="w-3 h-3" />
                          <span>{commit.date ? new Date(commit.date).toLocaleDateString('en-US') : 'Recent'}</span>
                          {commit.hash && (
                            <a
                              href={`https://github.com/ehslawas/hospital-operation-management-ecosystem/commit/${commit.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-muted hover:text-accent-base transition-colors p-0.5"
                              title="View on GitHub"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-text-primary font-medium leading-relaxed">
                        {commit.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Standard Release Announcements
              isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-accent-base/20 border-t-accent-base rounded-full animate-spin" />
                  <span className="text-xs text-text-muted">Loading logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No logs found for this category.
                </div>
              ) : (
                filteredLogs.map((item, idx) => {
                  const isUpdate = item.type === 'system_update'
                  const isMaintenance = item.type === 'maintenance'
                  const cleanVersionTag = item.version_tag 
                    ? (item.version_tag.toLowerCase().startsWith('build-') ? 'v' + item.version_tag.slice(6) : item.version_tag)
                    : (isUpdate ? 'Update' : 'Maintenance')

                  return (
                    <div key={item.id} className={`pt-3.5 ${idx === 0 ? 'pt-0' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            isUpdate 
                              ? 'bg-accent-subtle text-accent-base border-accent-base/30'
                              : isMaintenance
                                ? 'bg-amber-500/15 text-amber-400 dark:text-amber-300 border-amber-500/30'
                                : 'bg-surface-subtle text-text-secondary border-border-default'
                          }`}>
                            {cleanVersionTag}
                          </span>
                          
                          <h4 className="text-sm font-bold text-text-primary">
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted shrink-0 font-medium">
                          <Calendar className="w-3 h-3 text-text-muted" />
                          <span>{new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed mt-2 whitespace-pre-line">
                        {item.content?.replace(/\(Lawas@2025\)/gi, '')?.replace(/Lawas@2025/gi, 'H.O.M.E. System Administrator')}
                      </p>

                      {item.scheduled_start && item.scheduled_end && (
                        <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Maintenance Window:{' '}
                            {new Date(item.scheduled_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} — {new Date(item.scheduled_end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[10px] text-text-muted border-t border-border-default">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-text-muted" />
                          <span className="font-semibold text-text-secondary">Modules:</span>
                          <div className="flex flex-wrap gap-1">
                            {(item.affected_modules || ['All Modules']).map((mod, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-surface-subtle text-text-secondary border border-border-default font-mono text-[9px]">
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-text-muted">
                          <span>Published by:</span>
                          <span className="font-semibold text-text-secondary">
                            {(!item.created_by_name || item.created_by_name.toLowerCase().includes('ci/cd') || item.created_by_name.toLowerCase().includes('lawas'))
                              ? 'H.O.M.E. System Administrator'
                              : item.created_by_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:px-5 bg-surface/50 border-t border-border-default flex items-center justify-between text-[11px] text-text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Production Sync Active
                {activeCommit ? ` • Deployed: ${activeCommit}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="text-[11px] text-accent-base hover:underline disabled:opacity-50 flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Check Updates'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-ink text-ink-text hover:bg-ink-hover font-medium text-xs transition-colors shadow-elevation-1"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default SystemUpdateLogModal
