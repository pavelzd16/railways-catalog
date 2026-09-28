import { useSyncExternalStore } from 'react'
import { getCookieConsent, subscribeCookieConsent } from './cookie-consent'

export function useCookieConsent() {
  return useSyncExternalStore(subscribeCookieConsent, getCookieConsent, () => null)
}
