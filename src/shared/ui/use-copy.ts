import { useEffect, useState } from 'react'

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

export type CopyState = ReturnType<typeof useCopy>

/**
 * Состояние копирования. Общее на значок и на сам текст: нажатие на любой
 * из них зажигает галочку на значке, но кнопки остаются разными.
 */
export function useCopy(value: string) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])
  return { copied, copy: async () => setCopied(await copyText(value)) }
}
