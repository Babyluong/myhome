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
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'teal' | 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'purple'
  link?: string
  subtitle?: string
  loading?: boolean
  className?: string
}

const colorMap: Record<string, { icon: string; badge: string; highlight: string }> = {
  primary: {
    icon: 'bg-accent-base/10 text-accent-base border-accent-base/20',
    badge: 'bg-accent-base/10 text-accent-base border-accent-base/20',
    highlight: 'from-accent-base/20 to-transparent',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlight: 'from-emerald-500/20 to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlight: 'from-emerald-500/20 to-transparent',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlight: 'from-amber-500/20 to-transparent',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlight: 'from-amber-500/20 to-transparent',
  },
  error: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlight: 'from-rose-500/20 to-transparent',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlight: 'from-rose-500/20 to-transparent',
  },
  info: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    highlight: 'from-sky-500/20 to-transparent',
  },
  sky: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    highlight: 'from-sky-500/20 to-transparent',
  },
  teal: {
    icon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    highlight: 'from-teal-500/20 to-transparent',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    highlight: 'from-indigo-500/20 to-transparent',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    highlight: 'from-purple-500/20 to-transparent',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  link,
  subtitle,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("p-5 rounded-2xl border border-border-default bg-surface/80 backdrop-blur-sm shadow-elevation-1 animate-pulse-subtle", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-subtle animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-subtle rounded animate-pulse" />
          <div className="h-7 w-24 bg-subtle rounded animate-pulse" />
          <div className="h-2.5 w-32 bg-subtle/70 rounded animate-pulse mt-1" />
        </div>
      </div>
    )
  }

  const theme = colorMap[color] || colorMap.primary
  const isPositive = change !== undefined && change >= 0

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group relative bg-surface/90 backdrop-blur-md p-5 rounded-2xl border border-border-default shadow-elevation-1 transition-[transform,opacity,box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden',
        link && 'cursor-pointer',
        className
      )}
    >
      {/* Top subtle hairline highlight */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity", theme.highlight)} />

      {/* Background Icon Watermark */}
      <div className="absolute top-2 right-2 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none text-text-primary">
        <Icon size={64} strokeWidth={1.2} />
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200',
            theme.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>

          {change !== undefined && (
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border tabular-nums',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              )}
            >
              <TrendingUp className={cn('w-3 h-3', !isPositive && 'rotate-180')} />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
            {value}
          </div>

          {subtitle && (
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-default/80">
              <span className="text-xs text-text-muted font-normal truncate">
                {subtitle}
              </span>
              {link && (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }

  return content
}
