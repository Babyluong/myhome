import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { offlineQueue, QueuedMutation } from '@/services/offlineQueue'

interface OfflineSyncDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const OfflineSyncDrawer: React.FC<OfflineSyncDrawerProps> = ({ isOpen, onClose }) => {
  const { isOnline, isSyncing, pendingCount, pendingByModule, syncNow, lastSyncTime } = useOfflineStatus()
  const [items, setItems] = useState<QueuedMutation[]>([])

  useEffect(() => {
    if (isOpen) {
      void offlineQueue.getAll().then((all) => {
        setItems(all)
      })
    }
  }, [isOpen, pendingCount, isSyncing])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 max-h-[85vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOnline ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Status Operasi Luar Talian
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {isOnline ? 'Tersambung' : 'Luar Talian'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lastSyncTime
                      ? `Penyegerakan terakhir: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Belum ada penyegerakan sesi ini'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Module Breakdown Badges */}
            <div className="py-3">
              <h4 className="text-xs font-semibold text-text-secondary font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Pecahan Modul Menunggu ({pendingCount})
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(pendingByModule).length === 0 ? (
                  <div className="text-xs text-slate-400 py-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Semua rekod telah disegerakkan dengan pangkalan data.
                  </div>
                ) : (
                  Object.entries(pendingByModule).map(([mod, count]) => (
                    <div
                      key={mod}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-200 flex items-center gap-2"
                    >
                      <span className="capitalize">{mod}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              <h4 className="text-xs font-semibold text-text-secondary font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                Senarai Baris Gilir Mutasi
              </h4>
              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Database className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                  Tiada sebarang operasi tertunggak.
                </div>
              ) : (
                items.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold text-[10px]">
                          {m.action}
                        </span>
                        <span className="font-semibold text-slate-200 capitalize">{m.module}</span>
                        <span className="text-slate-400">({m.table})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        {' • '}
                        Polisi: {m.conflictPolicy}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'syncing'
                            ? 'bg-teal-500/20 text-teal-300 animate-pulse'
                            : m.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {m.status === 'syncing' ? 'Menyegerak...' : m.status === 'failed' ? 'Gagal' : 'Menunggu'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => void syncNow()}
                disabled={!isOnline || isSyncing || pendingCount === 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sedang Menyegerak...' : 'Segerakkan Sekarang'}
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
