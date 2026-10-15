import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/shared/hooks/useIsMobile'

const dialogStack: HTMLElement[] = []
let originalBodyOverflow = ''
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const DialogFocusScope: React.FC<{
  children: React.ReactElement
  label: string
  onClose: () => void
  closeOnEscape?: boolean
}> = ({ children, label, onClose, closeOnEscape = true }) => {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  const escapeRef = useRef(closeOnEscape)
  closeRef.current = onClose
  escapeRef.current = closeOnEscape

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (dialogStack.length === 0) originalBodyOverflow = document.body.style.overflow
    dialogStack.push(panel)
    document.body.style.overflow = 'hidden'
    const isTop = () => dialogStack[dialogStack.length - 1] === panel
    const controls = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(element => element.getClientRects().length > 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]'))
    const focusFirst = () => (controls()[0] || panel).focus({ preventScroll: true })
    focusFirst()
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop()) return
      if (event.key === 'Escape' && escapeRef.current) {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeRef.current()
      }
      if (event.key !== 'Tab') return
      const elements = controls()
      const first = elements[0] || panel
      const last = elements[elements.length - 1] || panel
      if (!panel.contains(document.activeElement) || document.activeElement === panel ||
        (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target.focus({ preventScroll: true })
      }
    }
    const onFocus = (event: FocusEvent) => {
      if (isTop() && event.target instanceof Node && !panel.contains(event.target)) focusFirst()
    }
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocus, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocus, true)
      const index = dialogStack.indexOf(panel)
      const wasTop = isTop()
      if (index >= 0) dialogStack.splice(index, 1)
      if (dialogStack.length === 0) document.body.style.overflow = originalBodyOverflow
      if (!wasTop) return
      const remaining = dialogStack[dialogStack.length - 1]
      if (opener?.isConnected && (!remaining || remaining.contains(opener))) opener.focus({ preventScroll: true })
      else remaining?.focus({ preventScroll: true })
    }
  }, [])

  return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>, {
    ref: panelRef,
    role: 'dialog',
    'aria-modal': true,
    'aria-label': label,
    tabIndex: -1,
  })
}

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
  const reducedMotion = useReducedMotion()

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
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal / Bottom Sheet */}
          <DialogFocusScope label={title || 'Dialog'} onClose={onClose} closeOnEscape={closeOnEscape}>
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
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
                    type="button"
                    aria-label="Close dialog"
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
          </DialogFocusScope>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal

