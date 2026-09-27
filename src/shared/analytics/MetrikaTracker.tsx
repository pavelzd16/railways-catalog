import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { metrikaHit, startMetrika, stopMetrika } from './metrika'
import { startGudok } from './gudok'
import { useCookieConsent } from '../privacy/use-cookie-consent'

/**
 * Счётчики включаются после согласия. Начальный просмотр учитывает init.
 */
export function MetrikaTracker() {
  const { pathname, search } = useLocation()
  const consent = useCookieConsent()
  const previous = useRef<string | null>(null)
  const active = useRef(false)

  useEffect(() => {
    const allowed = consent === 'accepted' && !pathname.startsWith('/admin')
    if (!allowed) {
      if (active.current) {
        active.current = false
        stopMetrika()
        // У коллтрекинга нет API остановки: загружаем страницу без его скрипта.
        window.location.reload()
      }
      previous.current = null
      return
    }
    active.current = true
    const initialized = startMetrika()
    startGudok()
    const current = pathname + search
    if (!initialized && previous.current !== null && previous.current !== current) {
      metrikaHit(window.location.origin + current, window.location.origin + previous.current)
    }
    previous.current = current
  }, [consent, pathname, search])

  return null
}
