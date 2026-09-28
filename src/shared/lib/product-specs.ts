export interface SpecRow {
  label: string
}

/** Сколько строк характеристик видно в карточке до раскрытия полного списка. */
export const MAIN_SPECS_COUNT = 6

/**
 * Что покупатель ищет в характеристиках первым: что это за изделие, по какому стандарту,
 * сколько весит, какого размера, новое ли, для чего, из чего сделано. Каждое правило берёт одну строку —
 * первую подходящую, чтобы «Масса 1 шт.» не заняла два места из шести.
 */
const MAIN_RULES: RegExp[] = [
  /^(тип|марка|проект|вид)(?=$|[\s,.(:])(?! рельса| стали)/i,
  /^тип рельса/i,
  /^(стандарт|нормативный документ|гост|технические условия|чертёж)(?!.*1[сc])/i,
  /^(масса|вес)/i,
  /^(длина|мерная длина|размер|габарит)/i,
  /^состояние/i,
  /^(назначение|применение)/i,
  /^(материал|марка стали|сталь)/i,
  /^(штук|метров) в тонне/i,
  /^(резьба|класс прочности|ширина колеи|марка крестовины)/i,
]

/** Служебные строки не поднимаем в главные, даже когда главных не набралось. */
const MINOR = /^единица измерения|\(по 1[сc]\)/i

/**
 * Делит характеристики на главные (видны сразу) и остальные (под «Все характеристики»).
 * Главные идут в порядке MAIN_RULES, недобор — по порядку карточки; остальные — как в карточке.
 */
export function splitSpecs<T extends SpecRow>(
  specs: T[],
  limit = MAIN_SPECS_COUNT,
): { main: T[]; rest: T[] } {
  const main: T[] = []
  for (const rule of MAIN_RULES) {
    if (main.length >= limit) break
    const found = specs.find((spec) => !main.includes(spec) && rule.test(spec.label.trim()))
    if (found) main.push(found)
  }
  for (const spec of specs) {
    if (main.length >= limit) break
    if (!main.includes(spec) && !MINOR.test(spec.label)) main.push(spec)
  }
  return { main, rest: specs.filter((spec) => !main.includes(spec)) }
}
