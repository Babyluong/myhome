import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogFocusScope } from './Modal'

export interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '3xl' | '4xl' | '5xl' | '7xl' | 'screen'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[96vw]',
  screen: 'max-w-full',
}

export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'xl',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}) => {
  const reducedMotion = useReducedMotion()

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Panel */}
          <DialogFocusScope label={title || 'Dialog'} onClose={onClose} closeOnEscape={closeOnEscape}>
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={cn(
              'relative w-full h-full bg-surface shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-black text-text-primary tracking-tight leading-none">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-xs font-bold text-text-secondary font-bold uppercase tracking-wider">{description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                    {showCloseButton && (
                    <button
                        type="button"
                        aria-label="Close dialog"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-text-primary hover:bg-subtle rounded-xl transition-colors group active:scale-95"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-[#f8fafc]/30">
                {children}
            </div>
          </motion.div>
          </DialogFocusScope>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SlideOver
