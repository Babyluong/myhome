import React, { useState, useRef, useEffect } from 'react'
import { Warehouse, ChevronDown, Check, Layers, MapPin, Building2 } from 'lucide-react'
import { useInventoryStore } from '../context/InventoryStoreContext'
import { useAuthStore } from '@/stores/authStore'

interface StoreLocationSelectorProps {
  className?: string
  showAllStoresOption?: boolean
}

export const StoreLocationSelector: React.FC<StoreLocationSelectorProps> = ({
  className = '',
  showAllStoresOption = true,
}) => {
  const {
    activeStore,
    activeStoreId,
    availableStores,
    isConsolidatedView,
    setActiveStoreId,
    isLoading,
  } = useInventoryStore()

  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const userDeptName = (user as any)?.department?.department_name || (user?.department_id ? 'Jabatan Berdaftar' : null)

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="group inline-flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white hover:border-slate-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
          {isConsolidatedView ? (
            <Layers className="w-4 h-4" />
          ) : (
            <Warehouse className="w-4 h-4" />
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-300">
            Lokasi Stor Aktif
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white max-w-[200px] sm:max-w-[280px] truncate">
            {isConsolidatedView
              ? 'Semua Stor (Konsolidasi)'
              : activeStore?.location_name || 'Pilih Lokasi Stor'}
          </span>
        </div>

        {!isConsolidatedView && activeStore?.location_code && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {activeStore.location_code}
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800"
        >
          {/* Header Info */}
          <div className="px-3 py-2 text-xs text-slate-400 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Penukaran Inventori Stor</span>
              {userDeptName && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <MapPin className="w-3 h-3" />
                  {userDeptName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Data stok, kad petak dan pergerakan item ditapis mengikut stor yang dipilih.
            </p>
          </div>

          {/* Store List */}
          <div className="py-1 max-h-72 overflow-y-auto">
            {showAllStoresOption && (
              <button
                type="button"
                role="option"
                aria-selected={isConsolidatedView}
                onClick={() => {
                  setActiveStoreId('all')
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                  isConsolidatedView
                    ? 'bg-emerald-500/15 text-emerald-200 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${isConsolidatedView ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Semua Stor (Paparan Berpusat)</div>
                    <div className="text-[11px] text-slate-400">Gabungan jumlah stok hospital keseluruhan</div>
                  </div>
                </div>
                {isConsolidatedView && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            )}

            {availableStores.map(store => {
              const isSelected = activeStoreId === store.id
              const isUserDepartment = store.department_id === user?.department_id

              return (
                <button
                  key={store.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveStoreId(store.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-200 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate flex items-center gap-1.5">
                        <span className="truncate">{store.location_name}</span>
                        {isUserDepartment && (
                          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.2 rounded font-sans font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Unit Anda
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {store.location_code} {store.location_type ? `• ${store.location_type}` : ''}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
