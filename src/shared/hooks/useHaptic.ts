import { useCallback } from 'react'

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/**
 * Hook providing tactile micro-haptic feedback on mobile devices.
 * Gracefully no-ops when navigator.vibrate is unsupported.
 */
export function useHaptic() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return

    try {
      switch (type) {
        case 'light':
          navigator.vibrate(8)
          break
        case 'medium':
          navigator.vibrate(15)
          break
        case 'heavy':
          navigator.vibrate(25)
          break
        case 'success':
          navigator.vibrate([10, 40, 15])
          break
        case 'warning':
          navigator.vibrate([20, 50, 20])
          break
        case 'error':
          navigator.vibrate([30, 60, 30, 60, 30])
          break
      }
    } catch {
      // Ignore vibration permission or browser sandbox issues
    }
  }, [])

  return { triggerHaptic }
}
