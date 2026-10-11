import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react'

interface StoreAccessPasswordModalProps {
  isOpen: boolean
  targetStoreName: string
  onConfirm: (password: string) => boolean
  onClose: () => void
}

export const StoreAccessPasswordModal: React.FC<StoreAccessPasswordModalProps> = ({
  isOpen,
  targetStoreName,
  onConfirm,
  onClose,
}) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError(false)
      setShowPassword(false)
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setError(true); return }
    const success = onConfirm(password)
    if (!success) {
      setError(true)
      inputRef.current?.focus()
      inputRef.current?.select()
    } else {
      setError(false)
      onClose()
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-auth-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-700/80 bg-slate-900 p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="store-auth-title" className="text-sm font-semibold text-white">Pengesahan Akses Stor</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Kebenaran khas diperlukan untuk melihat stor lain.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <span className="text-slate-400">Stor Dipilih: </span>
            <span className="font-medium text-emerald-300">{targetStoreName}</span>
          </div>

          <div>
            <label htmlFor="store-access-password" className="block text-xs font-medium text-slate-300 mb-1.5">
              Kata Laluan Keselamatan
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="store-access-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (error) setError(false)
                }}
                placeholder="Masukkan kata laluan stor..."
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-950 border ${
                  error ? 'border-rose-500 text-rose-200 focus:ring-rose-500/30' : 'border-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/30'
                } focus:outline-none focus:ring-2 pr-9 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                aria-label={showPassword ? 'Sembunyi kata laluan' : 'Papar kata laluan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Kata laluan tidak tepat. Sila cuba lagi.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-colors shadow-sm"
            >
              Buka Akses
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
