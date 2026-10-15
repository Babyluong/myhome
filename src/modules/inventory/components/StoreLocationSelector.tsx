import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Warehouse, ChevronDown, Check, Layers, MapPin, Lock, Unlock } from 'lucide-react'
import { useInventoryStore } from '../context/InventoryStoreContext'
import { useAuthStore } from '@/stores/authStore'
import { useStoreAccessLock } from '../hooks/useStoreAccessLock'
import { StoreAccessPasswordModal } from './StoreAccessPasswordModal'

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
  const userDeptId = user?.department_id
  const userDeptName = (user as any)?.department?.department_name || (userDeptId ? 'Jabatan Berdaftar' : null)

  const { isUnlocked, unlock, lock, isStoreRestricted, userHomeStore } = useStoreAccessLock(
    availableStores,
    userDeptId,
    (user as any)?.department?.department_name
  )

  const [isOpen, setIsOpen] = useState(false)
  const [pendingStore, setPendingStore] = useState<{ id: string | 'all'; name: string } | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuCoords, setMenuCoords] = useState<{
    top: number
    left: number
    width: number
    placement: 'bottom' | 'top'
  } | null>(null)

  const handleSelectStore = (storeId: string | 'all', storeName: string) => {
    if (isStoreRestricted(storeId)) {
      setPendingStore({ id: storeId, name: storeName })
      setIsAuthModalOpen(true)
      setIsOpen(false)
      return
    }

    setActiveStoreId(storeId)
    setIsOpen(false)
  }

  const handleAuthConfirm = (password: string) => {
    const success = unlock(password)
    if (success && pendingStore) {
      setActiveStoreId(pendingStore.id)
      setPendingStore(null)
    }
    return success
  }

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const desiredWidth = Math.min(viewportWidth >= 640 ? 384 : 320, viewportWidth - 24)

    let left = rect.left
    if (left + desiredWidth > viewportWidth - 12) {
      left = Math.max(12, rect.right - desiredWidth)
    }
    if (left < 12) {
      left = 12
    }

    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const openAbove = spaceBelow < 340 && spaceAbove > spaceBelow

    const top = openAbove ? rect.top - 6 : rect.bottom + 6

    setMenuCoords({
      top,
      left,
      width: desiredWidth,
      placement: openAbove ? 'top' : 'bottom',
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      updateMenuPosition()
      const handleReposition = () => updateMenuPosition()
      window.addEventListener('resize', handleReposition)
      window.addEventListener('scroll', handleReposition, true)
      return () => {
        window.removeEventListener('resize', handleReposition)
        window.removeEventListener('scroll', handleReposition, true)
      }
    }
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <div className={`relative inline-block text-left ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          disabled={isLoading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="group inline-flex items-center justify-between sm:justify-start gap-2.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white hover:border-slate-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shrink-0">
              {isConsolidatedView ? (
                <Layers className="w-4 h-4" />
              ) : (
                <Warehouse className="w-4 h-4" />
              )}
            </div>

            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-300">
                Lokasi Stor Aktif
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white max-w-[180px] xs:max-w-[220px] sm:max-w-[280px] truncate">
                {isConsolidatedView
                  ? 'Semua Stor (Konsolidasi)'
                  : activeStore?.location_name || 'Pilih Lokasi Stor'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            {!isConsolidatedView && activeStore?.location_code && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {activeStore.location_code}
              </span>
            )}

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && menuCoords && typeof document !== 'undefined' && createPortal(
          <div
            ref={menuRef}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: menuCoords.top,
              left: menuCoords.left,
              width: `${menuCoords.width}px`,
              transform: menuCoords.placement === 'top' ? 'translateY(-100%)' : undefined,
              zIndex: 9999,
            }}
            className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800 select-none"
          >
            {/* Header Info */}
            <div className="px-3 py-2 text-xs text-slate-400 bg-slate-950/40">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-300">Penukaran Inventori Stor</span>
                <div className="flex items-center gap-1.5">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        lock()
                      }}
                      title="Kunci semula akses stor lain"
                      className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      Kunci Semula
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Akses Terhad
                    </span>
                  )}
                  {userDeptName && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <MapPin className="w-3 h-3" />
                      {userDeptName}
                    </span>
                  )}
                </div>
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
                  onClick={() => handleSelectStore('all', 'Semua Stor (Paparan Berpusat)')}
                  className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
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
                      <div className="font-medium flex items-center gap-1.5">
                        <span>Semua Stor (Paparan Berpusat)</span>
                        {!isUnlocked && <Lock className="w-3 h-3 text-text-muted" />}
                      </div>
                      <div className="text-[11px] text-slate-400">Gabungan jumlah stok hospital keseluruhan</div>
                    </div>
                  </div>
                  {isConsolidatedView && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              )}

              {availableStores.map(store => {
                const isSelected = activeStoreId === store.id
                const isUserDepartment = store.department_id === user?.department_id || store.id === userHomeStore?.id
                const isRestricted = isStoreRestricted(store.id)

                return (
                  <button
                    key={store.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectStore(store.id, store.location_name)}
                    className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
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
                          {isUserDepartment ? (
                            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.2 rounded font-sans font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Unit Anda
                            </span>
                          ) : isRestricted ? (
                            <Lock className="w-3 h-3 text-text-muted flex-shrink-0" />
                          ) : null}
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
          </div>,
          document.body
        )}
      </div>

      <StoreAccessPasswordModal
        isOpen={isAuthModalOpen}
        targetStoreName={pendingStore?.name || ''}
        onConfirm={handleAuthConfirm}
        onClose={() => {
          setIsAuthModalOpen(false)
          setPendingStore(null)
        }}
      />
    </>
  )
}
