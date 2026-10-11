// @ts-nocheck
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Megaphone, 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  ShieldAlert,
  Trash2,
  Archive,
  Power
} from 'lucide-react'
import { 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  type SystemAnnouncement,
  type SystemAnnouncementType,
  type SystemAnnouncementSeverity 
} from '@/services/systemAnnouncementService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

interface AdminBroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  announcements: SystemAnnouncement[]
  onRefresh: () => void
  language?: 'ms' | 'en'
}

const AVAILABLE_MODULES = [
  'All Modules',
  'MyFormulari',
  'MySuhu',
  'MyCylinder',
  'MyPrepacking',
  'MyWarrant',
  'MyPriviledging',
  'MyPHiS',
  'MyMSDS',
  'MyInventory',
  'MyPerolehan',
  'MyTransporter',
  'MyPorter',
  'MyTempahan',
  'MyKunci',
  'MyAdmin',
  'MyStaff',
  'MyTimeOff',
  'MySurat',
  'MyBorang',
  'MyMemo',
  'MyFile',
  'MyGallery',
  'MyPerhimpunan'
]

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  isOpen,
  onClose,
  announcements,
  onRefresh,
}) => {
  const { user } = useAuthStore()
  const { success, error: toastError } = useToastStore()

  // Gating check: strictly system admin
  const isSystemAdmin = 
    user?.role?.role_code === 'system_admin' || 
    user?.role?.role_name?.toLowerCase().includes('system admin') ||
    user?.role_code === 'system_admin'

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [type, setType] = useState<SystemAnnouncementType>('maintenance')
  const [severity, setSeverity] = useState<SystemAnnouncementSeverity>('warning')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [versionTag, setVersionTag] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>(['All Modules'])
  const [enableMaintenanceMode, setEnableMaintenanceMode] = useState(false)

  if (!isOpen) return null

  // If unauthorized, show warning modal or close
  if (!isSystemAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-surface border border-rose-500/40 rounded-2xl p-6 max-w-sm text-center shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary mb-1">Access Denied</h3>
          <p className="text-xs text-text-secondary mb-4">
            System broadcast and maintenance configuration is strictly restricted to System Administrators.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-subtle hover:bg-muted-surface text-xs font-semibold text-text-primary rounded-xl border border-border-default"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleModuleToggle = (mod: string) => {
    if (mod === 'All Modules') {
      setSelectedModules(['All Modules'])
      return
    }
    const filtered = selectedModules.filter(m => m !== 'All Modules')
    if (filtered.includes(mod)) {
      const remaining = filtered.filter(m => m !== mod)
      setSelectedModules(remaining.length === 0 ? ['All Modules'] : remaining)
    } else {
      setSelectedModules([...filtered, mod])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toastError('Please provide notice title and details')
      return
    }

    setIsSubmitting(true)
    try {
      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        type,
        severity,
        version_tag: versionTag.trim() || null,
        scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
        affected_modules: selectedModules,
        created_by: user?.id || null,
        created_by_name: user?.full_name || 'System Administrator',
        enable_maintenance_mode: enableMaintenanceMode,
        is_active: true,
      })

      success('System broadcast notice published successfully!')
      
      // Reset form
      setTitle('')
      setContent('')
      setVersionTag('')
      setScheduledStart('')
      setScheduledEnd('')
      setSelectedModules(['All Modules'])
      setEnableMaintenanceMode(false)

      onRefresh()
      setActiveTab('manage')
    } catch (err: any) {
      toastError(err?.message || 'Failed to publish broadcast')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await updateAnnouncement(id, {
        status: 'resolved',
        is_active: false,
      })
      success('Notice marked as resolved')
      onRefresh()
    } catch (err: any) {
      toastError('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return
    }
    try {
      await deleteAnnouncement(id)
      success('Notice deleted successfully')
      onRefresh()
    } catch (err: any) {
      toastError('Failed to delete notice')
    }
  }

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
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                    System Broadcast &amp; Maintenance Console
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 dark:text-amber-300 font-mono text-[9px] font-bold uppercase">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Broadcast maintenance windows, downtime schedules, and system version releases.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-subtle transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-subtle border-b border-border-default text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              New Broadcast
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'manage'
                  ? 'bg-surface text-text-primary border border-border-default shadow-elevation-1'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Manage Notices ({announcements.length})
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeTab === 'create' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Notice Type & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Announcement Type:
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SystemAnnouncementType)}
                      className="w-full bg-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-base"
                    >
                      <option value="maintenance">System Maintenance</option>
                      <option value="system_update">System Update / Changelog</option>
                      <option value="advisory">Hospital Operational Advisory</option>
                      <option value="incident">Technical Incident / Service Outage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Severity Level:
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as SystemAnnouncementSeverity)}
                      className="w-full bg-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-base"
                    >
                      <option value="info">Informative / Low</option>
                      <option value="warning">Warning / Planned Downtime</option>
                      <option value="critical">Critical / Immediate Attention</option>
                      <option value="urgent">Urgent / Emergency Outage</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Notice Title:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === 'maintenance'
                        ? 'e.g. Scheduled Server Maintenance & Database Backup'
                        : 'e.g. Launch of System Update v2.4.1'
                    }
                    className="w-full bg-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base"
                    required
                  />
                </div>

                {/* Version Tag (if update) */}
                {type === 'system_update' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Version Tag (Optional):
                    </label>
                    <input
                      type="text"
                      value={versionTag}
                      onChange={(e) => setVersionTag(e.target.value)}
                      placeholder="e.g. v2.4.1"
                      className="w-full sm:w-48 bg-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base font-mono"
                    />
                  </div>
                )}

                {/* Maintenance Window (Start & End) */}
                {type === 'maintenance' && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scheduled Maintenance Window:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-text-secondary mb-1">
                          Start Time:
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledStart}
                          onChange={(e) => setScheduledStart(e.target.value)}
                          className="w-full bg-surface border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-text-secondary mb-1">
                          Estimated Completion:
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledEnd}
                          onChange={(e) => setScheduledEnd(e.target.value)}
                          className="w-full bg-surface border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-text-primary">
                          Activate Full System Maintenance Mode
                        </p>
                        <p className="text-[10px] text-text-muted">
                          Locks general access and presents maintenance screen to staff.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnableMaintenanceMode(!enableMaintenanceMode)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          enableMaintenanceMode ? 'bg-amber-500' : 'bg-surface-subtle border border-border-default'
                        }`}
                      >
                        <div className={`bg-surface w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                          enableMaintenanceMode ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Details */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Instructions &amp; Guidance for Staff:
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Detail operational impact, ward instructions, and offline procedures if applicable..."
                    className="w-full bg-subtle border border-border-default rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base resize-y"
                    required
                  />
                </div>

                {/* Affected Modules */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Affected Modules:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-subtle border border-border-default rounded-xl">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isSelected = selectedModules.includes(mod)
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => handleModuleToggle(mod)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-400 dark:text-amber-300 border border-amber-500/40'
                              : 'bg-surface hover:bg-surface-hover text-text-muted border border-border-default'
                          }`}
                        >
                          {mod}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-ink hover:bg-ink-hover text-ink-text text-xs font-medium transition-colors flex items-center gap-1.5 shadow-elevation-1"
                  >
                    {isSubmitting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Publish Broadcast</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Manage Notices Tab */
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="py-12 text-center text-text-muted text-xs">
                    No active broadcast notices at this time.
                  </div>
                ) : (
                  announcements.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.is_active 
                          ? 'bg-surface border-border-default' 
                          : 'bg-surface-subtle border-border-subtle opacity-60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.type === 'maintenance'
                              ? 'bg-amber-500/15 text-amber-400 dark:text-amber-300 border border-amber-500/30'
                              : item.type === 'system_update'
                                ? 'bg-accent-subtle text-accent-base border border-accent-base/30'
                                : 'bg-surface-subtle text-text-secondary border border-border-default'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            item.is_active ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-subtle text-text-muted'
                          }`}>
                            {item.is_active ? 'Active' : 'Resolved'}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {item.is_active && (
                          <button
                            type="button"
                            onClick={() => handleResolve(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="Mark as resolved"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-surface hover:bg-rose-500/20 text-text-muted hover:text-rose-600 transition-colors border border-border-default"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default AdminBroadcastModal
