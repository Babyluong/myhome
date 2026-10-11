import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray' | 'primary'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  gray: 'bg-subtle text-text-muted border-border-default',
  primary: 'bg-accent-base/10 text-accent-base border-accent-base/20',
}

const dotColors: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
  gray: 'bg-text-muted',
  primary: 'bg-accent-base',
}

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border tracking-tight transition-colors',
        variants[variant] || variants.gray,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.gray)} />
      )}
      {children}
    </span>
  )
}

export default Badge
