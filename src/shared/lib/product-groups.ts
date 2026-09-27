/**
 * Группы разделов каталога по тому, как продают товар: тяжёлые (рельсы и шпалы —
 * тоннами, крупными партиями), тоннажные (прочее, что считают тоннами) и штучные
 * (штуками и комплектами). Отсюда берут объёмы ступеней цены и блок ступеней
 * в карточке, и ответ про цену в «Частых вопросах» — чтобы они не расходились.
 */
export type ProductGroup = 'heavy' | 'bulk' | 'piece'

/** Ступени цены по объёму партии — словами, без процентов (решение пользователя от 24.09.2026). */
export const TIER_NAMES: string[] = ['Розница', 'Мелкий опт', 'Опт', 'Вагонная цена']

/** Объёмы ступеней: рельсы и шпалы берут крупнее, остальное — от тонны. */
const VOLUMES_HEAVY = ['от 10 т', 'от 15 т', 'от 20 т', 'от 40 т']
const VOLUMES_BULK = ['от 1 т', 'от 10 т', 'от 18 т', 'Вагон']

/** Рельсы и шпалы, включая крановые и старогодные (по разделу или подразделу). */
const HEAVY_SECTIONS = new Set([
  'zheleznodorozhnye-relsy',
  'kranovye-relsy',
  'zhd-shpaly',
  'starogodnye-relsy',
  'starogodnye-shpaly',
])

/** Разделы, где товар продают штуками и комплектами, а не тоннами. */
const PIECE_CATEGORIES = new Set([
  'putevoj-instrument',
  'zheleznodorozhnye-znaki',
  'strelochnye-perevody',
  'zheleznodorozhnye-pereezdy',
  'tupikovye-upory',
  'bashmaki-tormoznye',
  'zvenya-relsoshpalnoj-reshetki',
])

export function productGroup(categorySlug?: string, subcategorySlug?: string): ProductGroup {
  if (categorySlug && PIECE_CATEGORIES.has(categorySlug)) return 'piece'
  const heavy = [categorySlug, subcategorySlug].some((slug) => slug && HEAVY_SECTIONS.has(slug))
  return heavy ? 'heavy' : 'bulk'
}

/** Объёмы ступеней в порядке TIER_NAMES; у штучных разделов ступеней нет. */
export function tierVolumes(group: ProductGroup): string[] | null {
  if (group === 'piece') return null
  return group === 'heavy' ? [...VOLUMES_HEAVY] : [...VOLUMES_BULK]
}

/** Раздел старогодных материалов или любой его старогодный подраздел (рельсы, шпалы, скрепления…). */
export function isStarogodnySection(categorySlug?: string, subcategorySlug?: string): boolean {
  return [categorySlug, subcategorySlug].some((slug) => !!slug && slug.startsWith('starogodnye-'))
}
