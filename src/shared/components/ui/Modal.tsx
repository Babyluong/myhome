import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full rounded-2xl shadow-2xl',
              'max-h-[90vh] overflow-hidden flex flex-col',
              isDark
                ? 'bg-[#141414] text-white border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'bg-white text-gray-900 dark:bg-[#141414] dark:text-white dark:border dark:border-white/[0.12]',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-start justify-between p-6 border-b',
                  isDark ? 'border-white/[0.08]' : 'border-gray-100 dark:border-white/[0.08]'
                )}
              >
                <div>
                  {title && (
                    <h2
                      className={cn(
                        'text-xl font-semibold',
                        isDark ? 'text-white' : 'text-gray-900 dark:text-white'
                      )}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      className={cn(
                        'mt-1 text-sm',
                        isDark ? 'text-white/50' : 'text-gray-500 dark:text-white/50'
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
                      'p-2 -m-2 rounded-lg transition-colors',
                      isDark
                        ? 'text-white/40 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn('flex-1 overflow-y-auto p-6', contentClassName)}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal

