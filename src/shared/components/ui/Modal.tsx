import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/shared/hooks/useIsMobile'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  theme?: 'light' | 'dark' | 'auto'
  contentClassName?: string
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-6xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  theme = 'auto',
  contentClassName,
}) => {
  const isDark = theme === 'dark' || (typeof className === 'string' && (className.includes('dark') || className.includes('bg-[#') || className.includes('bg-gray-900') || className.includes('bg-neutral-900')))
  const isMobile = useIsMobile(640)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={cn(
              'relative w-full rounded-t-2xl sm:rounded-2xl shadow-2xl',
              'max-h-[90vh] overflow-hidden flex flex-col pb-safe sm:pb-0',
              isDark
                ? 'bg-[#141414] text-white border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'bg-surface text-text-primary dark:bg-[#141414] dark:text-white dark:border dark:border-white/[0.12]',
              sizes[size],
              className
            )}
          >
            {/* Mobile Drag Indicator */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden touch-none">
              <div className="w-10 h-1 bg-border-strong/60 rounded-full" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-start justify-between px-4 py-3.5 sm:p-6 border-b',
                  isDark ? 'border-white/[0.08]' : 'border-border-subtle dark:border-white/[0.08]'
                )}
              >
                <div>
                  {title && (
                    <h2
                      className={cn(
                        'text-lg sm:text-xl font-semibold',
                        isDark ? 'text-white' : 'text-text-primary dark:text-white'
                      )}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      className={cn(
                        'mt-0.5 sm:mt-1 text-xs sm:text-sm',
                        isDark ? 'text-white/50' : 'text-text-muted dark:text-white/50'
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-1.5 sm:p-2 -m-1 sm:-m-2 rounded-lg transition-colors',
                      isDark
                        ? 'text-white/40 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-text-muted hover:bg-subtle dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn('flex-1 overflow-y-auto p-4 sm:p-6 native-scroll', contentClassName)}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal

