import { IZDELIYA, type Izdelie } from './dannye.ts'

/** Приводим к виду, в котором «ё» = «е», а ×, x, х и * — одно и то же. */
function uprostit(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/[x×*х]/g, '*').replace(/\s+/g, ' ').trim()
}

/**
 * Подсказки к полю «Изделие»: ищем по всем словам запроса сразу, в любом порядке.
 * «болт клеммный», «клеммный болт» и «м22 75» приводят к одному и тому же.
 * Пустой запрос — весь список, чтобы поле работало и как обычный список.
 */
export function naytiIzdeliya(zapros: string, gruppa?: string): Izdelie[] {
  const spisok = gruppa ? IZDELIYA.filter((item) => item.gruppa === gruppa) : IZDELIYA
  const slova = uprostit(zapros).split(' ').filter(Boolean)
  if (!slova.length) return spisok
  const podhodit = spisok.filter((item) => {
    const stog = uprostit(`${item.name} ${item.gruppa} ${item.istochnik.doc}`)
    return slova.every((s) => stog.includes(s))
  })
  // сначала то, что нашлось в самом начале названия: по слову «костыль» первыми
  // должны идти костыли, а не подкладки костыльного скрепления
  const ves = (item: Izdelie) => {
    const name = uprostit(item.name)
    if (name.startsWith(slova[0])) return 0
    if (slova.every((s) => name.includes(s))) return 1
    return 2
  }
  return podhodit.sort((a, b) => ves(a) - ves(b))
}
