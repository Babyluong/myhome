import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'teal' | 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'purple'
  link?: string
  subtitle?: string
  loading?: boolean
  className?: string
}

const colorClasses: Record<string, { icon: string; border: string }> = {
  primary: {
    icon: 'bg-accent-subtle text-accent-base border border-accent-base/20',
    border: 'border-accent-base/20',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    border: 'border-emerald-500/20',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    border: 'border-amber-500/20',
  },
  error: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    border: 'border-rose-500/20',
  },
  info: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    border: 'border-sky-500/20',
  },
  teal: {
    icon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    border: 'border-teal-500/20',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    border: 'border-emerald-500/20',
  },
  sky: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    border: 'border-sky-500/20',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    border: 'border-amber-500/20',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    border: 'border-rose-500/20',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    border: 'border-indigo-500/20',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    border: 'border-purple-500/20',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  link,
  subtitle,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("p-5 rounded-xl border border-border-default bg-surface shadow-2xs animate-pulse-subtle", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-subtle animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-20 bg-subtle rounded animate-pulse" />
          <div className="h-8 w-24 bg-subtle rounded animate-pulse" />
          <div className="h-2.5 w-32 bg-subtle/70 rounded animate-pulse mt-1" />
        </div>
      </div>
    )
  }

  const colors = colorClasses[color] || colorClasses.primary
  const isPositive = change !== undefined && change > 0

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group relative bg-surface p-5 rounded-xl border border-border-default shadow-2xs transition-all duration-150 hover:border-border-strong hover:bg-subtle/30',
        link && 'cursor-pointer'
      )}
    >
      {/* Background Icon Pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none text-text-primary">
        <Icon size={72} strokeWidth={1} />
      </div>

      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 duration-150',
            colors.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              <TrendingUp className={cn('w-3 h-3', !isPositive && 'rotate-180')} />
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="text-2xl font-bold text-text-primary leading-none mb-1 tracking-tight tabular-nums">
            {value}
          </h3>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {title}
          </p>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
            <span className="text-xs text-text-muted font-normal">
              {subtitle || 'Click to view details'}
            </span>
            {link && (
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }

  return content
}
