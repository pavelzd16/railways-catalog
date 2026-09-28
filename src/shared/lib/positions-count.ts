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

/**
 * «1 200+ позиций в наличии и под заказ». Разряды — неразрывным пробелом, как пишут цены.
 * Число кратно десяти, поэтому «позиций» подходит всегда.
 */
export function positionsLabel(count: number): string {
  const digits = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${digits}+ позиций в наличии и под заказ`
}
