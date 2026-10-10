import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState<boolean>(false)
  const [isIOS, setIsIOS] = useState<boolean>(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(false)

  useEffect(() => {
    // Check if running in standalone PWA window
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(ua)
    setIsIOS(isAppleDevice)

    // Check if user dismissed prompt recently
    const dismissedTime = localStorage.getItem('home_pwa_prompt_dismissed_at')
    if (dismissedTime) {
      // Re-prompt after 7 days if still not installed
      const diff = Date.now() - parseInt(dismissedTime, 10)
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
      localStorage.setItem('home_pwa_is_installed', 'true')
      console.info('[PWA] H.O.M.E. successfully installed to device!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (!deferredPrompt) {
      if (isIOS) return 'manual'
      return 'dismissed'
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') {
        setIsStandalone(true)
      }
      return outcome
    } catch (err) {
      console.error('[PWA] Prompt install error:', err)
      return 'dismissed'
    }
  }, [deferredPrompt, isIOS])

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem('home_pwa_prompt_dismissed_at', Date.now().toString())
  }, [])

  // Can show install banner if not in standalone mode, not dismissed, and (has prompt event OR is iOS Safari)
  const canShowPrompt = !isStandalone && !isDismissed && (Boolean(deferredPrompt) || isIOS)

  return {
    isStandalone,
    isIOS,
    canInstall: Boolean(deferredPrompt),
    canShowPrompt,
    promptInstall,
    dismissPrompt,
  }
}
