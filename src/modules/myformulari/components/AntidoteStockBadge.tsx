// src/modules/myformulari/components/AntidoteStockBadge.tsx
import React from 'react'
import { Flame, Clock, Building2, ShieldAlert } from 'lucide-react'
import { KKMStockTier } from '../types/antidoteTypes'

interface AntidoteStockBadgeProps {
  tier: KKMStockTier
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
}

export const AntidoteStockBadge: React.FC<AntidoteStockBadgeProps> = ({
  tier,
  size = 'md',
  showDescription = false
}) => {
  const getTierConfig = (t: KKMStockTier) => {
    switch (t) {
      case 'List A':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
          dot: 'bg-rose-500',
          icon: Flame,
          label: 'List A: Segera (< 15-30 min)',
          fullDesc: 'Stok Mandatori Zon Merah ED, ICU & Resus Trolley',
          pulse: true
        }
      case 'List B':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'List B: Kecemasan (< 2 jam)',
          fullDesc: 'Stok Farmasi Pusat 24 Jam Hospital',
          pulse: false
        }
      case 'List C':
        return {
          bg: 'bg-accent-base/10 border-accent-base/30 text-accent-base',
          dot: 'bg-accent-base',
          icon: Building2,
          label: 'List C: Depot Negeri (< 4-6 jam)',
          fullDesc: 'Depot Rujukan Negeri / Hospital Tertier Utama',
          pulse: false
        }
      default:
        return {
          bg: 'bg-subtle border-border-default text-text-muted',
          dot: 'bg-text-muted',
          icon: ShieldAlert,
          label: 'Antidot Berdaftar',
          fullDesc: 'Simpanan hospital berjadual',
          pulse: false
        }
    }
  }

  const config = getTierConfig(tier)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size]

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${config.bg} ${sizeClasses}`}
        title={config.fullDesc}
      >
        <span className="relative flex h-2 w-2">
          {config.pulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[10px] text-text-muted pl-1 font-normal">
          {config.fullDesc}
        </span>
      )}
    </div>
  )
}
