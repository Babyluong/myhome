import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/shared/hooks/useHaptic'

export interface ListCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  badge?: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
  action?: React.ReactNode
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  subtitle,
  meta,
  badge,
  icon,
  onClick,
  className,
  action,
}) => {
  const { triggerHaptic } = useHaptic()

  const handleClick = () => {
    if (onClick) {
      triggerHaptic('light')
      onClick()
    }
  }

  const isClickable = Boolean(onClick)

  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick()
              }
            }
          : undefined
      }
      className={cn(
        "w-full bg-surface border border-border-default rounded-xl p-3.5 mb-2.5",
        "flex items-center gap-3 transition-colors text-left",
        isClickable && "cursor-pointer hover:border-border-strong hover:bg-subtle/50 active:bg-subtle",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-1",
        className
      )}
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-subtle border border-border-subtle flex items-center justify-center text-text-secondary">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="font-semibold text-sm text-text-primary truncate">
            {title}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <div className="text-xs text-text-secondary truncate mb-1">
            {subtitle}
          </div>
        )}

        {meta && (
          <div className="text-[11px] text-text-muted tabular-nums flex items-center gap-2">
            {meta}
          </div>
        )}
      </div>

      {action ? (
        <div className="flex-shrink-0">{action}</div>
      ) : isClickable ? (
        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 opacity-60" />
      ) : null}
    </motion.div>
  )
}
