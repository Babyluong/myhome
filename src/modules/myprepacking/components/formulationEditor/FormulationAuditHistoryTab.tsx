import React, { useState, useEffect } from 'react'
import {
  History,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  FileText,
  ShieldCheck
} from 'lucide-react'
import type { PrepackFormulationAuditLog } from '../../types/prepack'
import { getPrepackItemAuditLogs } from '../../services/prepackService'

interface FormulationAuditHistoryTabProps {
  prepackItemId?: string
}

export const FormulationAuditHistoryTab: React.FC<FormulationAuditHistoryTabProps> = ({
  prepackItemId
}) => {
  const [logs, setLogs] = useState<PrepackFormulationAuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  useEffect(() => {
    if (!prepackItemId) return

    let isMounted = true
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await getPrepackItemAuditLogs(prepackItemId)
        if (err) throw err
        if (isMounted) {
          setLogs(data || [])
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load revision audit trail')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLogs()
    return () => {
      isMounted = false
    }
  }, [prepackItemId])

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-medium">Loading formulation audit trail...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 px-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center space-y-2">
        <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
        <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">Failed to Load Audit Trail</h4>
        <p className="text-[11px] text-text-muted">{error}</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 px-4 rounded-xl border border-dashed border-border-default bg-subtle/50 text-center space-y-2.5">
        <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-text-primary">Official Baseline Specifications Active</h4>
        <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
          No facility revisions have been recorded for this item yet. This formulation currently follows the official Ministry of Health Malaysia baseline compounding monograph.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
        <span className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
          <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Formulation Revision History ({logs.length})</span>
        </span>
        <span className="text-[10px] text-text-muted">100% Genuine Database Audit Records</span>
      </div>

      <div className="space-y-2.5">
        {logs.map((log) => {
          const isExpanded = expandedLogId === log.id
          return (
            <div
              key={log.id}
              className="rounded-xl border border-border-default bg-surface p-3.5 shadow-2xs hover:border-border-strong transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/25 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-primary">
                        {log.user_name}
                      </span>
                      {log.user_role && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          {log.user_role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text-primary bg-subtle hover:bg-surface border border-border-default rounded-md flex items-center gap-1 cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Diff'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Change Summary */}
              <p className="text-xs text-text-secondary mt-2.5 font-medium leading-relaxed pl-11">
                {log.change_summary}
              </p>

              {/* Modified Fields Badges */}
              {log.changed_fields && log.changed_fields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pl-11">
                  {log.changed_fields.map((field) => (
                    <span
                      key={field}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-subtle text-text-secondary border border-border-default"
                    >
                      {field.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Detailed Diff View */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-border-subtle pl-11 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/20">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
                      Previous Values
                    </span>
                    <pre className="text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap max-h-40">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                      Updated Values
                    </span>
                    <pre className="text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap max-h-40">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
