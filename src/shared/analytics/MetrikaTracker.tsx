import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { metrikaHit, startMetrika, stopMetrika } from './metrika'
import { startGudok } from './gudok'
import { useCookieConsent } from '../privacy/use-cookie-consent'

/**
 * Метрика включается сразу у всех посетителей, коллтрекинг — после согласия.
 * Начальный просмотр учитывает init.
 */
export function MetrikaTracker() {
  const { pathname, search } = useLocation()
  const consent = useCookieConsent()
  const previous = useRef<string | null>(null)
  const active = useRef(false)

  useEffect(() => {
    const admin = pathname.startsWith('/admin')
    // У коллтрекинга нет API остановки: после отказа или перехода в админку
    // загружаем страницу без его скрипта, Метрика при этом стартует заново.
    const gudokLoaded = !!document.getElementById('gudok-script')
    if (gudokLoaded && (admin || consent !== 'accepted')) {
      window.location.reload()
      return
    }
    if (admin) {
      if (active.current) {
        active.current = false
        stopMetrika()
        window.location.reload()
      }
      previous.current = null
      return
    }
    active.current = true
    const initialized = startMetrika()
    if (consent === 'accepted') startGudok()
    const current = pathname + search
    if (!initialized && previous.current !== null && previous.current !== current) {
      metrikaHit(window.location.origin + current, window.location.origin + previous.current)
    }
    previous.current = current
  }, [consent, pathname, search])

  return null
}
