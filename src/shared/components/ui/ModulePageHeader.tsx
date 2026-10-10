import React from 'react'
import { cn } from '@/lib/utils'

export interface ModulePageHeaderProps {
  icon?: React.ElementType | React.ReactNode
  title: string
  subtitle?: string
  description?: string
  badge?: string
  badges?: Array<{
    label: string
    variant?: 'default' | 'accent' | 'warning' | 'neutral'
  }>
  actions?: React.ReactNode
  className?: string
}

export const ModulePageHeader: React.FC<ModulePageHeaderProps> = ({
  icon,
  title,
  subtitle,
  description,
  badge,
  badges,
  actions,
  className,
}) => {
  const finalDescription = description || subtitle
  const allBadges = badges && badges.length > 0
    ? badges
    : badge
    ? [{ label: badge, variant: 'accent' as const }]
    : []

  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon as React.ElementType
    return <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-xl bg-surface border border-border-default shadow-2xs transition-colors duration-150',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {icon && (
          <div className="p-2.5 sm:p-3 rounded-lg bg-accent-subtle text-accent-base border border-accent-base/20 shrink-0 flex items-center justify-center">
            {renderIcon()}
          </div>
        )}
        <div className="min-w-0">
          {allBadges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {allBadges.map((b, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase border',
                    b.variant === 'accent'
                      ? 'bg-accent-subtle text-accent-base border-accent-base/25'
                      : b.variant === 'warning'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-subtle text-text-secondary border-border-default'
                  )}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
            {title}
          </h1>
          {finalDescription && (
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 max-w-3xl leading-relaxed">
              {finalDescription}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  )
}
