import { useState } from 'react'
import { FiMessageCircle, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { CopyButton, CopyValue } from './CopyButton'
import { Dialog } from './Dialog'
import { useCopy } from './use-copy'

// Номер мессенджеров отдела продаж. В секрете боевой сборки VITE_MESSENGER_PHONE может
// оставаться заглушка из нулей — прочитать и поправить секрет нельзя, поэтому заглушку
// считаем незаданной и берём этот номер.
const DEFAULT_MESSENGER_PHONE = '+7 (965) 615-50-59'
const isRealPhone = (value: string | undefined) => {
  const valueDigits = (value ?? '').replace(/\D/g, '')
  return /^\d{10,15}$/.test(valueDigits) && !/^7?0+$/.test(valueDigits)
}
const phone = isRealPhone(import.meta.env.VITE_MESSENGER_PHONE) ? import.meta.env.VITE_MESSENGER_PHONE : DEFAULT_MESSENGER_PHONE
const digits = phone.replace(/\D/g, '')
const configuredPhone = isRealPhone(phone)
const safeUrl = (value: string | undefined) => {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' ? url.href : '' } catch { return '' }
}
const messengers = [
  { label: 'MAX', icon: FiMessageCircle, href: safeUrl(import.meta.env.VITE_MAX_URL) },
  { label: 'Telegram', icon: FiSend, href: safeUrl(import.meta.env.VITE_TELEGRAM_URL) || (configuredPhone ? `https://t.me/+${digits}` : '') },
  { label: 'WhatsApp', icon: FaWhatsapp, href: safeUrl(import.meta.env.VITE_WHATSAPP_URL) || (configuredPhone ? `https://wa.me/${digits}` : '') },
]

export function MessengerLinks({ compact = false, showPhone = false }: { compact?: boolean; showPhone?: boolean }) {
  const [placeholder, setPlaceholder] = useState('')
  const phoneCopy = useCopy(phone)
  return <div>
    <div className="flex flex-wrap items-center gap-2" aria-label="Мессенджеры">
      {messengers.map(({ label, icon: Icon, href }) => {
        const className = `inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-current/25 transition-colors hover:text-primary ${compact ? 'h-8 w-8' : 'min-h-11 px-3 text-sm'}`
        const content = <><Icon className="h-4 w-4" aria-hidden="true" />{!compact && <span>{label}{label === 'WhatsApp' ? '*' : ''}</span>}</>
        return href ? <a key={label} href={href} aria-label={label} title={label} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <button key={label} type="button" aria-label={label} title={label} className={className} onClick={() => setPlaceholder(label)}>{content}</button>
      })}
    </div>
    {showPhone && <div className="mt-2 flex items-center gap-2 text-sm font-normal text-muted-foreground">
      <CopyValue state={phoneCopy} label="Скопировать номер телефона" className="whitespace-nowrap hover:text-primary">{phone}</CopyValue>
      <CopyButton compact state={phoneCopy} label="Скопировать номер телефона" />
    </div>}
    <Dialog open={!!placeholder} onOpenChange={() => setPlaceholder('')} title={placeholder} description="Контакт для связи">
      <p className="text-xl font-bold">{phone}</p>
      <p className="mt-3 text-sm text-muted-foreground">Найдите нас в {placeholder} по этому номеру.</p>
    </Dialog>
  </div>
}
