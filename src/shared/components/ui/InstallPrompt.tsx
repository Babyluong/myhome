import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, PlusSquare, X, Smartphone, ShieldCheck } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useAuthStore } from '@/stores/authStore'

export const InstallPrompt: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const { isStandalone, isIOS, canShowPrompt, promptInstall, dismissPrompt } = usePWAInstall()
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  // Only show if user is authenticated, not already running in standalone app, and prompt has not been dismissed
  if (!isAuthenticated || isStandalone || !canShowPrompt) {
    return null
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
    } else {
      const outcome = await promptInstall()
      if (outcome === 'manual') {
        setShowIOSGuide(true)
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40">
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl shadow-2xl shadow-slate-950/80 p-4 relative overflow-hidden"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={dismissPrompt}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content Area */}
          <div className="flex items-start gap-3.5 pr-6">
            {/* App Icon */}
            <div className="relative shrink-0">
              <img
                src="/icons/icon-192.png"
                alt="H.O.M.E. App Icon"
                className="w-14 h-14 rounded-2xl shadow-md border border-teal-500/30 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 border-2 border-slate-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-3 h-3" />
              </span>
            </div>

            {/* Texts */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight">Pasang Aplikasi H.O.M.E.</h4>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Pasang pada telefon pintar anda untuk akses pantas, mod luar talian (offline), dan pengalaman aplikasi penuh.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all active:scale-95"
            >
              {isIOS ? (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-950" />
                  Panduan Pasang iOS
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  Pasang Sekarang
                </>
              )}
            </button>

            <button
              onClick={dismissPrompt}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              Nanti
            </button>
          </div>

          {/* iOS Specific Instructions Modal / Bottom Sheet */}
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-2"
            >
              <p className="font-semibold text-teal-400 flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                Langkah Pemasangan di iPhone / iPad:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <li className="leading-snug">
                  Ketik butang <strong>Kongsi (Share)</strong> <Share2 className="w-3 h-3 inline text-teal-400 mx-0.5" /> di bar pelayar Safari.
                </li>
                <li className="leading-snug">
                  Skrol ke bawah dan pilih <strong>Tambah ke Skrin Utama (Add to Home Screen)</strong> <PlusSquare className="w-3 h-3 inline text-teal-400 mx-0.5" />.
                </li>
                <li className="leading-snug">
                  Ketik <strong>Tambah (Add)</strong> di bucu atas kanan. Ikon rasmi H.O.M.E. akan disimpan pada skrin telefon anda.
                </li>
              </ol>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
