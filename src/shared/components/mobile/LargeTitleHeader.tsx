import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScrollCollapse } from '@/shared/hooks/useScrollCollapse'
import { useHaptic } from '@/shared/hooks/useHaptic'

export interface LargeTitleHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export const LargeTitleHeader: React.FC<LargeTitleHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  action,
  badge,
  className,
}) => {
  const navigate = useNavigate()
  const { isCollapsed } = useScrollCollapse({ threshold: 40 })
  const { triggerHaptic } = useHaptic()

  const handleBack = () => {
    triggerHaptic('light')
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn("w-full block lg:hidden select-none", className)}>
      {/* Compact Sticky Top Bar (Shown when collapsed) */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-30 h-13 px-3",
          "flex items-center justify-between border-b transition-all duration-200",
          isCollapsed
            ? "bg-surface/95 backdrop-blur-md border-border-default shadow-xs"
            : "bg-transparent border-transparent pointer-events-none"
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1 rounded-lg text-text-primary hover:bg-subtle active:scale-95 transition-all"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <motion.div
            animate={{ opacity: isCollapsed ? 1 : 0, y: isCollapsed ? 0 : 6 }}
            transition={{ duration: 0.15 }}
            className="font-semibold text-sm text-text-primary truncate max-w-[200px]"
          >
            {title}
          </motion.div>
        </div>

        {action && (
          <div className="pointer-events-auto flex items-center gap-1.5">
            {action}
          </div>
        )}
      </div>

      {/* Large Title Section (In document flow) */}
      <div className="px-1 pt-2 pb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 -ml-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle active:scale-95 transition-all"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
