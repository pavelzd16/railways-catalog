/**
 * Номер счётчика Яндекс.Метрики. Не является секретом: он виден в исходном
 * коде каждой страницы. Хранится в коде, потому что настройки боевой сборки
 * лежат в секрете VITE_ENV, прочитать который нельзя, а значит нельзя и
 * дописать в него ключ, не потеряв остальные значения.
 */
import { optionalTrackingAllowed } from '../privacy/cookie-consent'

const DEFAULT_METRIKA_ID = '112450496'

const configured = (import.meta.env.VITE_METRIKA_ID ?? '').trim()

/**
 * В сборке для боевого сервера счётчик включён по умолчанию, при разработке —
 * выключен, чтобы не искажать статистику. VITE_METRIKA_ID переопределяет
 * номер, любое нечисловое значение (например off) отключает счётчик совсем.
 */
const resolved = configured === '' ? (import.meta.env.PROD ? DEFAULT_METRIKA_ID : '') : configured

export const metrikaId = /^\d+$/.test(resolved) ? resolved : ''

declare global {
  interface Window {
    ym?: ((id: number, action: string, ...args: unknown[]) => void) & { a?: unknown[][]; l?: number }
  }
}

/** Сообщает Метрике о переходе на новый адрес внутри сайта. */
export function metrikaHit(url: string, referrer: string): void {
  if (!optionalTrackingAllowed() || !metrikaId || typeof window.ym !== 'function') return
  window.ym(Number(metrikaId), 'hit', url, { referer: referrer })
}

/**
 * Цель «Отправка формы» в Метрике. Вызывать только после успешной отправки:
 * сервер ответил успехом и пользователь видит подтверждение. На ошибках
 * валидации, ошибках отправки и открытии формы цель не засчитывается.
 */
export const FORM_GOAL = 'forma'

/**
 * Цель «Копирование почты»: нажатие на адрес zakaz@traer.ru или на значок
 * копирования рядом с ним — в шапке, подвале, на главной и в «Контактах».
 */
export const EMAIL_COPY_GOAL = 'pochta'

/**
 * Засчитывает цель в Метрике. Ошибка счётчика сюда не выходит: действие,
 * ради которого засчитывается цель (отправка формы, копирование), не должно
 * от неё зависеть.
 */
export function metrikaReachGoal(goal: string): void {
  if (!optionalTrackingAllowed() || !metrikaId || typeof window.ym !== 'function') return
  try {
    window.ym(Number(metrikaId), 'reachGoal', goal)
  } catch {
    // Счётчик сломан или заблокирован — цель теряется, сайт работает.
  }
}

let initialized = false

export function startMetrika(): boolean {
  if (!optionalTrackingAllowed() || !metrikaId || initialized) return false
  initialized = true
  if (!window.ym) {
    const queue: NonNullable<Window['ym']> = (...args) => { (queue.a ??= []).push(args) }
    queue.l = Date.now()
    window.ym = queue
  }
  if (!document.getElementById('metrika-script')) {
    const script = document.createElement('script')
    script.id = 'metrika-script'
    script.async = true
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}`
    document.head.append(script)
  }
  window.ym(Number(metrikaId), 'init', { ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true })
  return true
}

export function stopMetrika() {
  if (initialized && window.ym) {
    try { window.ym(Number(metrikaId), 'destruct') } catch { /* Сайт не зависит от счётчика. */ }
    if (window.ym.a) window.ym.a = []
  }
  initialized = false
}
