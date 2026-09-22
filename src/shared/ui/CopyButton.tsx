import { FiCheck, FiCopy } from 'react-icons/fi'

import type { CopyState } from './use-copy'
import { useCopy } from './use-copy'

/** Текст (адрес почты), нажатие на который копирует так же, как значок. */
export function CopyValue({
  state,
  label,
  className = '',
  children,
}: {
  state: CopyState
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={state.copy}
      title={label}
      className={`copy-value rounded-sm text-left transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Кнопка «Скопировать». `compact` — одна иконка (шапка, подвал), подсказка
 * «Скопировано» всплывает под ней; иначе — иконка с подписью.
 * `state` передают, когда рядом стоит кликабельный текст с тем же адресом.
 */
export function CopyButton({
  value = '',
  label,
  compact = false,
  className = '',
  state,
}: {
  value?: string
  label: string
  compact?: boolean
  className?: string
  state?: CopyState
}) {
  const own = useCopy(value)
  const { copied, copy } = state ?? own

  const Icon = copied ? FiCheck : FiCopy

  if (compact) {
    return (
      <span className={`relative inline-flex ${className}`}>
        <button
          type="button"
          onClick={copy}
          aria-label={label}
          title={copied ? 'Скопировано' : label}
          className={`copy-icon inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-current/10 ${copied ? 'text-success' : 'text-current/60 hover:text-primary'}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          role="status"
          className={`copy-hint pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-bold text-white shadow-md ring-1 ring-white/20 transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
        >
          {copied ? 'Скопировано' : ''}
        </span>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={`copy-icon inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-bold transition-colors ${copied ? 'border-success/40 text-success' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Скопировано' : 'Скопировать'}</span>
    </button>
  )
}
