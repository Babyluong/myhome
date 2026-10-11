import { useState, useEffect } from 'react'

/**
 * Hook to detect mobile/tablet screens (< 1024px)
 * Uses window.matchMedia with change listener for zero-lag reactivity
 */
export function useIsMobile(breakpoint = 1024): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    // Set initial match accurately
    updateMatch(mediaQuery)

    try {
      mediaQuery.addEventListener('change', updateMatch)
      return () => mediaQuery.removeEventListener('change', updateMatch)
    } catch {
      // Safari legacy fallback
      mediaQuery.addListener(updateMatch)
      return () => mediaQuery.removeListener(updateMatch)
    }
  }, [breakpoint])

  return isMobile
}
