import { izdelie, rels } from './dannye.ts'
import { fmt } from './format.ts'
import { itogoTonn, type Stroka, type VvodPuti } from './raschet.ts'

/**
 * Текст расчёта — он же уходит в буфер по кнопке «Скопировать» и в комментарий
 * заявки. Первая строка всегда называет источник: это заодно метка авторства
 * (см. reference/kalkulyator/METKI.md).
 */
const NACHALO = 'Расчёт с калькулятора traer.ru'

export function tekstRelsov(
  relsId: string,
  dlinaRelsa: number,
  itog: { metry: number; tonny: number; relsov: number },
): string {
  const r = rels(relsId)
  return [
    `${NACHALO}: рельс ${r.name}.`,
    `— ${fmt(itog.metry, 2)} пог. м`,
    `— ${fmt(itog.tonny, 3)} т`,
    `— ${fmt(itog.relsov, 0)} рельсов длиной ${fmt(dlinaRelsa)} м`,
    `Масса 1 м — ${fmt(r.kgNaM)} кг (${r.istochnik.doc}, ${r.istochnik.mesto}).`,
  ].join('\n')
}

export function tekstIzdeliya(id: string, itog: { sht: number; kg: number }): string {
  const item = izdelie(id)
  const massa = itog.kg >= 1000 ? `${fmt(itog.kg / 1000, 3)} т` : `${fmt(itog.kg, 2)} кг`
  return [
    `${NACHALO}: ${item.name}.`,
    `— ${fmt(itog.sht, 0)} шт.`,
    `— ${massa}`,
    `Масса одной штуки — ${fmt(item.kgNaSht)} кг (${item.istochnik.doc}, ${item.istochnik.mesto}).`,
  ].join('\n')
}

export function tekstVedomosti(v: VvodPuti, rows: Stroka[]): string {
  return [
    `${NACHALO}: ${fmt(v.dlinaM, 1)} м пути, рельсы ${v.relsId.replace('R', 'Р')}, ` +
      `${v.shpaly === 'zhb' ? 'ж/б' : 'деревянные'} шпалы, эпюра ${v.epura} шт/км.`,
    ...rows.map((row) => `— ${row.name}: ${fmt(row.sht, 0)} шт.${row.tonny === null ? '' : `, ${fmt(row.tonny, 3)} т`}`),
    `Итого по позициям с массой: ${fmt(itogoTonn(rows), 3)} т.`,
  ].join('\n')
}
