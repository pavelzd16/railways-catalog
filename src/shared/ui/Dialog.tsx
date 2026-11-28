import { useId, type KeyboardEventHandler, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { useModalFocus } from '@/shared/lib/use-modal-focus'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  onKeyDown,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  const panelRef = useModalFocus(open, onOpenChange)

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="dialog-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50"
        >
          <div
            className="flex min-h-full items-center justify-center p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onOpenChange(false)
              }
            }}
          >
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descriptionId : undefined}
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                'relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg',
                className,
              )}
              onClick={(event: any) => event.stopPropagation()}
              onKeyDown={onKeyDown}
            >
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => onOpenChange(false)}
                className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {(title || description) && (
                <div className="shrink-0 border-b border-border bg-background px-4 py-5 pr-16 sm:px-6 sm:pr-16">
                  {title && (
                    <h2 id={titleId} className="text-lg font-semibold">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}
              <div
                className={cn(
                  'min-h-0 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6',
                  title || description ? 'pt-5' : 'pt-14',
                )}
              >
                {children}
              </div>
              {footer && (
                <div className="shrink-0 border-t border-border bg-background px-4 py-4 sm:px-6">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
