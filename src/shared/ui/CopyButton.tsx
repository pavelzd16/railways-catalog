import { useEffect, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

// Буфер обмена браузер даёт только на https и localhost; на остальных адресах
// и в старых браузерах копируем через скрытое поле ввода.
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    return copied
  }
}

/**
 * Кнопка «Скопировать». `compact` — одна иконка (для шапки), подсказка
 * «Скопировано» всплывает под ней; иначе — иконка с подписью.
 */
export function CopyButton({
  value,
  label,
  compact = false,
  className = '',
}: {
  value: string
  label: string
  compact?: boolean
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const Icon = copied ? FiCheck : FiCopy
  const copy = async () => setCopied(await copyText(value))

  if (compact) {
    return (
      <span className={`relative inline-flex ${className}`}>
        <button
          type="button"
          onClick={copy}
          aria-label={label}
          title={copied ? 'Скопировано' : label}
          className={`inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-current/10 ${copied ? 'text-success' : 'text-current/60 hover:text-current'}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          role="status"
          className={`pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-bold text-white shadow-md ring-1 ring-white/20 transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
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
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-bold transition-colors ${copied ? 'border-success/40 text-success' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Скопировано' : 'Скопировать'}</span>
    </button>
  )
}
