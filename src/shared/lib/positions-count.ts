/**
 * Счётчик позиций в шапке: «600+ позиций в наличии и под заказ».
 * Число из каталога округляется вниз — «+» тогда всегда правда.
 */

// Пока ответ каталога не пришёл (и если он не придёт). На 28.09.2026 в каталоге 630.
export const POSITIONS_FALLBACK = 600

/** Вниз до сотни, до сотни не набралось — до десятка; 0 — показывать нечего. */
export function roundPositions(total: number): number {
  if (!Number.isFinite(total) || total < 10) return 0
  const step = total >= 100 ? 100 : 10
  return Math.floor(total / step) * step
}

// Число кратно десяти, поэтому «позиций» подходит всегда. «и под заказ» держится вместе
// неразрывными пробелами: на первом экране подпись переносится «позиций в наличии / и под заказ».
export const POSITIONS_CAPTION = 'позиций в наличии и\u00a0под\u00a0заказ'

/** «1 200+» — крупная цифра на первом экране. Разряды — неразрывным пробелом, как пишут цены. */
export function positionsValue(count: number): string {
  return `${String(count).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}+`
}

/** «1 200+ позиций в наличии и под заказ» — строка в шапке. */
export function positionsLabel(count: number): string {
  return `${positionsValue(count)} ${POSITIONS_CAPTION}`
}
