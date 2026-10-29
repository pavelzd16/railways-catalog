/**
 * Число позиций на сайте: «700+ позиций».
 * Задано вручную, каталог не опрашивается (решение пользователя 29.10.2026: «просто цифра»).
 */
export const POSITIONS = 700

// «и под заказ» держится вместе неразрывными пробелами: на первом экране подпись
// переносится «позиций в наличии / и под заказ».
export const POSITIONS_CAPTION = 'позиций в наличии и под заказ'

/** «700+» — крупная цифра на первом экране. Разряды — неразрывным пробелом, как пишут цены. */
export function positionsValue(count: number = POSITIONS): string {
  return `${String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}+`
}

/** «700+ позиций» — строка в шапке: полная подпись не помещается рядом с меню. */
export function positionsLabel(count: number = POSITIONS): string {
  return `${positionsValue(count)} позиций`
}
