import { optionalTrackingAllowed } from '../privacy/cookie-consent'

/**
 * Проект коллтрекинга Gudok. Как и номер счётчика Метрики, не секрет: виден в коде
 * каждой страницы, поэтому хранится здесь, а не в секрете боевой сборки.
 */
const GUDOK_PROJECT_ID = 'fzbaipz2lb'

/**
 * Коллтрекинг подменяет номера телефонов на странице, поэтому включён только в сборке
 * для боевого сервера — при разработке звонки и визиты не должны попадать в статистику.
 */
export const gudokProjectId = import.meta.env.PROD ? GUDOK_PROJECT_ID : ''

declare global {
  interface Window {
    GudokData?: string
    gd?: { projects: string[] }
  }
}

export function startGudok() {
  if (!optionalTrackingAllowed() || !gudokProjectId || document.getElementById('gudok-script')) return
  window.GudokData = 'gd'
  window.gd = { projects: [gudokProjectId] }
  const script = document.createElement('script')
  script.id = 'gudok-script'
  script.async = true
  const check = location.search.startsWith('?gudok_check=') ? location.search.replace('?', '&') : ''
  script.src = `https://mod.gudok.tel/script.js?sid=${gudokProjectId}${check}`
  document.head.append(script)
}
