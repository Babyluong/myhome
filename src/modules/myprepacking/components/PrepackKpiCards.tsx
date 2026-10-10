// src/modules/myprepacking/components/PrepackKpiCards.tsx
import React from 'react'
import { AlertTriangle, PackageX, PackageCheck, Clock } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface PrepackKpiCardsProps {
  loading: boolean
  itemsNeedingRepack: number
  zeroStockItems: number
  todayPackedUnits: number
  batchesExpiringSoon: number
}

export const PrepackKpiCards: React.FC<PrepackKpiCardsProps> = ({
  loading,
  itemsNeedingRepack,
  zeroStockItems,
  todayPackedUnits,
  batchesExpiringSoon
}) => {
  const cards = [
    {
      id: 'buffer',
      label: 'Below Safety Buffer',
      value: itemsNeedingRepack,
      suffix: '',
      subtext: 'Items requiring packaging session',
      icon: AlertTriangle,
      isCritical: itemsNeedingRepack > 0,
      iconColor: itemsNeedingRepack > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-muted',
      valueColor: itemsNeedingRepack > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary',
      badge: itemsNeedingRepack > 0 ? 'Action Required' : 'Optimal'
    },
    {
      id: 'zero',
      label: 'Depleted / Zero Stock',
      value: zeroStockItems,
      suffix: '',
      subtext: 'Critical finished stockouts',
      icon: PackageX,
      isCritical: zeroStockItems > 0,
      iconColor: zeroStockItems > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-text-muted',
      valueColor: zeroStockItems > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary',
      badge: zeroStockItems > 0 ? 'Stockout Alert' : 'No Outages'
    },
    {
      id: 'output',
      label: "Today's Output",
      value: todayPackedUnits.toLocaleString(),
      suffix: 'units',
      subtext: "Packaged in today's sessions",
      icon: PackageCheck,
      isCritical: false,
      iconColor: 'text-text-secondary',
      valueColor: 'text-text-primary',
      badge: 'Production'
    },
    {
      id: 'expiry',
      label: 'Expiring Soon (≤ 60d)',
      value: batchesExpiringSoon,
      suffix: '',
      subtext: 'Batches nearing Beyond-Use Date',
      icon: Clock,
      isCritical: batchesExpiringSoon > 0,
      iconColor: batchesExpiringSoon > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-muted',
      valueColor: batchesExpiringSoon > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary',
      badge: batchesExpiringSoon > 0 ? 'BUD Watch' : 'Clear'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const IconComponent = card.icon
        return (
          <div
            key={card.id}
            className="p-4 bg-surface rounded-xl border border-border-default shadow-xs relative overflow-hidden transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">
                {card.label}
              </span>
              <div className="p-2 rounded-lg border border-border-subtle bg-subtle">
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-1.5">
              {loading ? (
                <Skeleton className="h-8 w-20 rounded-md bg-subtle" />
              ) : (
                <>
                  <span className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${card.valueColor}`}>
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span className="text-xs font-normal text-text-muted">
                      {card.suffix}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
              <span className="truncate">{card.subtext}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 uppercase tracking-wider border ${
                  card.isCritical
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                    : 'bg-subtle text-text-muted border-border-subtle'
                }`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PrepackKpiCards
