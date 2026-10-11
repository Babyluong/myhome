// src/modules/myperolehan/components/BudgetProgressBar.tsx
import React from 'react'

interface BudgetProgressBarProps {
  utilizationRate: number
  spentAmount: number
  totalAmount: number
  showLabels?: boolean
  height?: string
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  utilizationRate,
  spentAmount,
  totalAmount,
  showLabels = true,
  height = 'h-2'
}) => {
  const clampedRate = Math.min(100, Math.max(0, utilizationRate))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Color selection based on government financial threshold
  const getColorScheme = (rate: number) => {
    if (rate >= 90) {
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-600 font-bold',
        badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20'
      }
    }
    if (rate >= 75) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-600 font-bold',
        badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      }
    }
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 font-bold',
      badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
    }
  }

  const colors = getColorScheme(clampedRate)

  return (
    <div className="w-full space-y-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-text-muted">Kadar Penggunaan:</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${colors.badge}`}>
              {clampedRate}%
            </span>
          </div>
          <div className="text-right font-mono text-[11px] text-text-muted">
            <strong className="text-text-primary">{formatCurrency(spentAmount)}</strong> / {formatCurrency(totalAmount)}
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full bg-subtle rounded-full overflow-hidden ${height} border border-border-default`}>
        <div
          className={`${colors.bar} ${height} rounded-full transition-colors duration-500 ease-out`}
          style={{ width: `${clampedRate}%` }}
        />
      </div>
    </div>
  )
}
