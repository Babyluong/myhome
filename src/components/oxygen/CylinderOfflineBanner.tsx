// @ts-nocheck
import React, { useState } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowUpCircle,
  HardDriveDownload,
  Info,
} from 'lucide-react'
import { useCylinderOffline } from '@/modules/mycylinder/hooks/useCylinderOffline'
import { useLanguage } from '@/shared/contexts/LanguageContext'

interface CylinderOfflineBannerProps {
  hospitalId?: string
}

export const CylinderOfflineBanner: React.FC<CylinderOfflineBannerProps> = ({ hospitalId }) => {
  const { language } = useLanguage()
  const {
    isOnline,
    isSyncing,
    pendingCount,
    cachedCount,
    lastSyncAt,
    lastCacheWarmupAt,
    syncNow,
    warmUpCache,
  } = useCylinderOffline(hospitalId)

  const [isWarming, setIsWarming] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return
    const res = await syncNow()
    if (res.synced > 0) {
      setSuccessToast(
        language === 'ms'
          ? `Berjaya menyegerakkan ${res.synced} transaksi luar talian ke pangkalan data Supabase!`
          : `Successfully synchronized ${res.synced} offline transaction(s) to Supabase!`
      )
      setTimeout(() => setSuccessToast(null), 4000)
    }
  }

  const handleManualWarmup = async () => {
    if (!isOnline || isWarming) return
    setIsWarming(true)
    try {
      await warmUpCache()
      setSuccessToast(
        language === 'ms'
          ? 'Data silinder dan pembekal berjaya disimpan ke peranti untuk kegunaan luar talian.'
          : 'Cylinder and supplier data cached to device for offline usage.'
      )
      setTimeout(() => setSuccessToast(null), 4000)
    } finally {
      setIsWarming(false)
    }
  }

  // Only display if offline, or if there are pending sync items, or if cache is warming up, or success toast is active
  const showBanner = !isOnline || pendingCount > 0 || isSyncing || successToast

  return (
    <div className="w-full mb-4 transition-all duration-300">
      {/* Toast Alert for sync completion */}
      {successToast && (
        <div className="mb-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {showBanner && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
            !isOnline
              ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border-amber-300 text-amber-950'
              : pendingCount > 0
              ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/15 border-blue-300 text-blue-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          {/* Status Details */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                !isOnline
                  ? 'bg-amber-500 text-white animate-pulse'
                  : pendingCount > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {!isOnline ? (
                <WifiOff className="w-5 h-5" />
              ) : isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wifi className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {!isOnline
                    ? language === 'ms'
                      ? 'Mod Luar Talian Aktif (Tiada Liputan Rangkaian)'
                      : 'Offline Mode Active (No Network Coverage)'
                    : isSyncing
                    ? language === 'ms'
                      ? 'Sedang Menyegerakkan Data ke Supabase...'
                      : 'Synchronizing Data to Supabase...'
                    : language === 'ms'
                    ? 'Rangkaian Dalam Talian (Tersambung)'
                    : 'Online Network Connected'}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    !isOnline
                      ? 'bg-amber-200 text-amber-900 border border-amber-300'
                      : pendingCount > 0
                      ? 'bg-blue-200 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {pendingCount > 0
                    ? `${pendingCount} ${language === 'ms' ? 'menunggu sync' : 'pending sync'}`
                    : language === 'ms'
                    ? 'Terkini'
                    : 'Synced'}
                </span>
              </div>

              <p className="text-xs mt-0.5 text-slate-600">
                {!isOnline
                  ? language === 'ms'
                    ? 'Imbasan QR, carian silinder, dan penerimaan stok berfungsi lancar dari memori peranti anda. Transaksi akan disegerakkan secara automatik apabila talian kembali pulih.'
                    : 'QR scanning, cylinder searches, and stock receiving work seamlessly from device memory. Transactions will auto-sync upon reconnection.'
                  : pendingCount > 0
                  ? language === 'ms'
                    ? `Terdapat ${pendingCount} rekod transaksi disimpan di peranti menunggu penyegerakan ke pangkalan data hospital.`
                    : `There are ${pendingCount} transactions stored on device waiting to sync with hospital database.`
                  : language === 'ms'
                  ? `Memori luar talian sedia: ${cachedCount} silinder disimpan setempat.`
                  : `Offline cache primed: ${cachedCount} cylinders available locally.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {/* Sync Now Button */}
            {isOnline && pendingCount > 0 && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (language === 'ms' ? 'Menyegerak...' : 'Syncing...') : (language === 'ms' ? 'Segerak Sekarang' : 'Sync Now')}</span>
              </button>
            )}

            {/* Offline Cache Preload Button */}
            {isOnline && (
              <button
                type="button"
                onClick={handleManualWarmup}
                disabled={isWarming}
                title={
                  language === 'ms'
                    ? 'Muat turun data silinder terkini ke peranti sebelum masuk ke kawasan stor tanpa liputan internet'
                    : 'Preload cylinder records onto device before entering areas without cellular signal'
                }
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <HardDriveDownload className={`w-3.5 h-3.5 text-slate-500 ${isWarming ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">
                  {isWarming
                    ? language === 'ms'
                      ? 'Menyimpan...'
                      : 'Caching...'
                    : language === 'ms'
                    ? `Kemas Kini Cache (${cachedCount})`
                    : `Refresh Cache (${cachedCount})`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Offline Mini Pill (Visible when online with 0 pending, but giving assurance) */}
      {!showBanner && (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 mb-1 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
            <span className="font-semibold text-slate-900 shrink-0 text-[11px] sm:text-xs">
              {language === 'ms' ? 'Sistem Dalam Talian' : 'System Online'}
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 truncate hidden sm:inline text-xs">
              {language === 'ms'
                ? `Pangkalan data peranti: ${cachedCount} rekod silinder sedia`
                : `Local memory: ${cachedCount} cylinder records synced`}
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-600 sm:hidden bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {cachedCount} {language === 'ms' ? 'rekod' : 'synced'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualWarmup}
            disabled={isWarming}
            className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer text-xs active:scale-95 transition-all"
            title={language === 'ms' ? 'Kemas kini cache tempatan' : 'Refresh local cache'}
          >
            <HardDriveDownload className={`w-3.5 h-3.5 ${isWarming ? 'animate-spin' : ''}`} />
            <span className="font-medium">{isWarming ? (language === 'ms' ? 'Kemas kini...' : 'Updating...') : (language === 'ms' ? 'Kemas Kini Cache' : 'Update Cache')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
