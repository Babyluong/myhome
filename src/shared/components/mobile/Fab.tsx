import React from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/shared/hooks/useHaptic'

export interface FabProps {
  onClick: () => void
  label?: string
  icon?: React.ReactNode
  ariaLabel?: string
  className?: string
}

export const Fab: React.FC<FabProps> = ({
  onClick,
  label,
  icon = <Plus className="w-5 h-5" />,
  ariaLabel = 'Add item',
  className,
}) => {
  const { triggerHaptic } = useHaptic()

  const handleClick = () => {
    triggerHaptic('light')
    onClick()
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "fixed right-4 z-30 flex items-center justify-center gap-2",
        "bottom-[calc(var(--tabbar-total-height)+1rem)]",
        "bg-accent-base text-accent-foreground font-semibold",
        "rounded-full shadow-lg border border-accent-active/20",
        "transition-colors hover:bg-accent-hover",
        label ? "px-4 py-3 text-sm" : "w-13 h-13 p-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2",
        className
      )}
    >
      {icon}
      {label && <span>{label}</span>}
    </motion.button>
  )
}
