import React from 'react'
import { AlertCircle, CheckCircle2, TrendingDown, Clock } from 'lucide-react'

interface QuotaProgressBarProps {
  monthlyQuota: number
  quotaUsed: number
  quotaRemaining: number
  unit: string
  lowStockThreshold: number
  isLowStock: boolean
  isCriticalShortage?: boolean
  estimatedRunOutDays?: number
  compact?: boolean
}

export const QuotaProgressBar: React.FC<QuotaProgressBarProps> = ({
  monthlyQuota,
  quotaUsed,
  quotaRemaining,
  unit,
  lowStockThreshold,
  isLowStock,
  isCriticalShortage,
  estimatedRunOutDays,
  compact = false
}) => {
  const percentUsed = Math.min(100, Math.round((quotaUsed / Math.max(1, monthlyQuota)) * 100))
  const percentRemaining = Math.max(0, 100 - percentUsed)

  const getStatusColor = () => {
    if (isCriticalShortage || percentRemaining <= 10) {
      return {
        bg: 'bg-rose-600',
        text: 'text-rose-400 dark:text-rose-300 font-bold font-black',
        border: 'border-rose-300',
        badge: 'bg-rose-100 text-rose-400 dark:text-rose-300 font-bold border border-rose-300'
      }
    }
    if (isLowStock || percentRemaining <= 25) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-400 dark:text-amber-300 font-bold font-black',
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-400 dark:text-amber-300 font-bold border border-amber-300'
      }
    }
    return {
      bg: 'bg-emerald-600',
      text: 'text-emerald-400 dark:text-emerald-300 font-bold font-black',
      border: 'border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-400 dark:text-emerald-300 font-bold border border-emerald-300'
    }
  }

  const status = getStatusColor()

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
          <span className="text-text-secondary">Baki Kuota:</span>
          <span className={`${status.text}`}>
            {quotaRemaining.toLocaleString()} / {monthlyQuota.toLocaleString()} {unit} ({percentRemaining}%)
          </span>
        </div>
        <div className="w-full bg-subtle rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${status.bg} transition-colors duration-500 rounded-full`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${status.border} bg-surface shadow-xs`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-text-muted mb-0.5">
            Status Kuota Bulanan
          </div>
          <div className="text-2xl font-black text-slate-950 flex items-baseline gap-2 flex-wrap">
            <span>{quotaRemaining.toLocaleString()} {unit}</span>
            <span className="text-xs text-text-muted font-semibold">
              tinggal drpd kuota {monthlyQuota.toLocaleString()} {unit}
            </span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full shrink-0 shadow-elevation-1 ${status.badge}`}>
          {isCriticalShortage ? (
            <>
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>KRITIKAL HABIS</span>
            </>
          ) : isLowStock ? (
            <>
              <TrendingDown className="w-4 h-4 text-amber-700 shrink-0" />
              <span>STOK RENDAH</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>KUOTA STABIL</span>
            </>
          )}
        </span>
      </div>

      {/* Progress Bar with background */}
      <div className="relative w-full bg-subtle rounded-full h-3.5 mb-2.5 overflow-hidden p-0.5 border border-border-default">
        <div
          className={`h-full ${status.bg} transition-colors duration-500 rounded-full`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span>Digunakan:</span>
          <strong className="text-slate-950 font-black">{quotaUsed.toLocaleString()} {unit} ({percentUsed}%)</strong>
        </span>
        
        {estimatedRunOutDays !== undefined && (
          <span className="flex items-center gap-1.5 font-bold text-text-primary">
            <Clock className="w-4 h-4 text-text-muted shrink-0" />
            <span>Anggaran Habis: ~{estimatedRunOutDays} Hari</span>
          </span>
        )}
      </div>

      {isLowStock && (
        <div className="mt-3 pt-2.5 border-t border-border-default flex items-center justify-between text-xs font-bold">
          <span className="text-amber-400 dark:text-amber-300 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Di bawah ambang paras rendah ({lowStockThreshold.toLocaleString()} {unit})</span>
          </span>
          <span className="text-indigo-700 underline font-extrabold cursor-pointer">
            Semak Ubat Alternatif
          </span>
        </div>
      )}
    </div>
  )
}
