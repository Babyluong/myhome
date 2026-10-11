import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

interface OfflineBannerProps {
  onOpenDrawer?: () => void
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onOpenDrawer }) => {
  const { isOnline, isSyncing, pendingCount, syncNow, lastSyncError } = useOfflineStatus()

  // Only render if offline or currently syncing or there are pending items
  const shouldShow = !isOnline || isSyncing || pendingCount > 0

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full overflow-hidden"
        >
          <div
            className={`px-3 py-2 text-xs font-medium flex items-center justify-between gap-2 border-b transition-colors ${
              !isOnline
                ? 'bg-amber-950/80 border-amber-800/80 text-amber-200'
                : isSyncing
                ? 'bg-teal-950/80 border-teal-800/80 text-teal-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {!isOnline ? (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <WifiOff className="w-3 h-3" />
                </div>
              ) : isSyncing ? (
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}

              <div className="truncate">
                {!isOnline ? (
                  <span>
                    <strong className="font-semibold">Mod Luar Talian:</strong> Rekod disimpan setempat dan disinkron automatik sebaik capaian internet pulih.
                  </span>
                ) : isSyncing ? (
                  <span>
                    <strong className="font-semibold">Menyegerak rekod ke pangkalan data...</strong>
                  </span>
                ) : (
                  <span>
                    <strong className="font-semibold">{pendingCount} rekod setempat</strong> sedia untuk disegerakkan.
                  </span>
                )}
                {lastSyncError && !isSyncing && (
                  <span className="text-rose-400 ml-1.5 flex-inline items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline mr-0.5" />
                    {lastSyncError}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingCount} menunggu
                </span>
              )}

              {isOnline && pendingCount > 0 && (
                <button
                  onClick={() => void syncNow()}
                  disabled={isSyncing}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Menyegerak' : 'Sync Sekarang'}
                </button>
              )}

              {onOpenDrawer && (
                <button
                  onClick={onOpenDrawer}
                  className="px-2 py-1 rounded text-[11px] underline text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Butiran
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
