// Подпись к цене на странице товара: «за тонну», «за шт.», «за комплект» — по характеристике «Единица измерения».
// Раньше страница всегда писала «за тонну», и цена за штуку или комплект читалась как цена за тонну.

interface SpecLike {
  label: string
  value?: unknown
}

const LABELS: [RegExp, string][] = [
  [/^(т|тн|тонна|тонны)$/, 'за тонну'],
  [/^(шт|шт\.|штука|штуки)$/, 'за шт.'],
  [/^комплект/, 'за комплект'],
  [/^(м|метр|пог\.? ?м)$/, 'за метр'],
  [/^(кг|килограмм)$/, 'за кг'],
]

/** Подпись единицы цены; пустая строка, если единица не указана или неоднозначна («шт или т»). */
export function priceUnitLabel(specs: SpecLike[] | undefined | null): string {
  const spec = specs?.find((item) => item.label.toLowerCase().includes('единица'))
  const value = String(spec?.value ?? '').replace(/<[^>]*>/g, '').replace(/[;.]\s*$/, '').trim().toLowerCase()
  if (!value) return ''
  return LABELS.find(([pattern]) => pattern.test(value))?.[1] ?? ''
}
