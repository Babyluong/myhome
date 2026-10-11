import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  pullProgress: number
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  pullProgress,
}) => {
  if (pullDistance <= 0 && !isRefreshing) return null

  return (
    <div
      style={{ height: `${pullDistance}px` }}
      className="w-full flex items-center justify-center overflow-hidden transition-all duration-75"
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : { rotate: pullProgress * 180 }}
        transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
        className="w-8 h-8 rounded-full bg-surface border border-border-default shadow-sm flex items-center justify-center text-accent-base"
      >
        <Loader2 className="w-4 h-4" />
      </motion.div>
    </div>
  )
}
