import { useState, useRef, useCallback } from 'react'
import { useHaptic } from './useHaptic'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  pullThreshold?: number
  maxPullDistance?: number
}

/**
 * Native touch pull-to-refresh hook for mobile views
 */
export function usePullToRefresh({
  onRefresh,
  pullThreshold = 64,
  maxPullDistance = 96,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const { triggerHaptic } = useHaptic()

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return
    const scrollEl = e.currentTarget as HTMLElement
    if (scrollEl.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY
      isPullingRef.current = true
    }
  }, [isRefreshing])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startYRef.current

    if (deltaY > 0) {
      // Apply rubber-band damping resistance
      const damped = Math.min(maxPullDistance, deltaY * 0.45)
      setPullDistance(damped)

      if (damped >= pullThreshold && pullDistance < pullThreshold) {
        triggerHaptic('light')
      }
    } else {
      setPullDistance(0)
    }
  }, [isRefreshing, maxPullDistance, pullThreshold, pullDistance, triggerHaptic])

  const onTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return
    isPullingRef.current = false

    if (pullDistance >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true)
      triggerHaptic('medium')
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, pullThreshold, isRefreshing, onRefresh, triggerHaptic])

  return {
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(1, pullDistance / pullThreshold),
    bindPull: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
