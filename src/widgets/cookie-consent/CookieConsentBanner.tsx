import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router'
import { FiShield, FiX } from 'react-icons/fi'
import { Button } from '@/shared/ui/Button'
import { useCookieConsent } from '@/shared/privacy/use-cookie-consent'
import { COOKIE_SETTINGS_EVENT, saveCookieConsent, type CookieChoice } from '@/shared/privacy/cookie-consent'

const subscribeHydration = () => () => {}

export function CookieConsentBanner() {
  const choice = useCookieConsent()
  const { pathname } = useLocation()
  const ready = useSyncExternalStore(subscribeHydration, () => true, () => false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useEffect(() => {
    const open = () => setSettingsOpen(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, open)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open)
  }, [])
  if (!ready || pathname.startsWith('/admin') || (choice && !settingsOpen)) return null
  function choose(value: CookieChoice) {
    saveCookieConsent(value)
    setSettingsOpen(false)
  }
  return (
    <section aria-labelledby="cookie-consent-title" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-h-[85dvh] max-w-5xl overflow-y-auto rounded-xl border border-border bg-card p-5 text-foreground shadow-[0_8px_40px_rgb(28_31_34/0.18)] sm:inset-x-6 sm:bottom-6 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div aria-hidden="true" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary sm:flex"><FiShield className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="pr-8 text-base font-bold sm:text-lg">{settingsOpen ? 'Настройки cookies' : 'Cookies на нашем сайте'}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Необходимые данные сохраняют корзину и настройки сайта. С вашего согласия подключим аналитику и коллтрекинг, чтобы улучшать сайт.{' '}
            <Link to="/privacy#cookies" className="font-semibold text-primary underline underline-offset-2">Подробнее</Link>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => choose('necessary')}>Только необходимые</Button>
            <Button size="sm" onClick={() => choose('accepted')}>Принять все</Button>
          </div>
        </div>
        {settingsOpen && choice && <button type="button" aria-label="Закрыть настройки cookies" onClick={() => setSettingsOpen(false)} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><FiX className="h-5 w-5" /></button>}
      </div>
    </section>
  )
}
