import { useState, useEffect } from 'react'

interface ScrollCollapseOptions {
  threshold?: number
  containerSelector?: string
}

/**
 * Tracks scroll offset to collapse large-title headers into compact navigation bars.
 */
export function useScrollCollapse({
  threshold = 32,
  containerSelector,
}: ScrollCollapseOptions = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = containerSelector
            ? document.querySelector(containerSelector)
            : window
          
          const currentY = target === window 
            ? window.scrollY 
            : (target as HTMLElement)?.scrollTop || 0

          setScrollY(currentY)
          setIsCollapsed(currentY > threshold)
          ticking = false
        })
        ticking = true
      }
    }

    const targetEl = containerSelector
      ? document.querySelector(containerSelector)
      : window

    if (targetEl) {
      targetEl.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    return () => {
      targetEl?.removeEventListener('scroll', handleScroll)
    }
  }, [threshold, containerSelector])

  return { isCollapsed, scrollY }
}
