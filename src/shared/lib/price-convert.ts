// Пересчёт цены за тонну в цену за кг, погонный метр и штуку (рельс мерной длины).
// Покупатель часто считает в метрах или рельсах, а не в тоннах. Пересчёт идёт по
// характеристикам товара «Масса 1 м» и «Мерная длина» — без них пересчёта нет.

import { priceUnitLabel } from './price-unit.ts'

interface SpecLike {
  label: string
  value?: unknown
}

export interface PriceOption {
  /** Ключ варианта: t, kg, m, pc-12.5 … */
  key: string
  /** Короткая подпись на переключателе: «т», «кг», «пог. м», «шт 12,5 м». */
  tab: string
  /** Подпись рядом с ценой: «за тонну», «за пог. м», «за рельс 12,5 м». */
  unit: string
  price: number
}

export interface PriceConversion {
  options: PriceOption[]
  /** Масса 1 м, кг — для пояснения под ценой. */
  massPerMeter: number
}

const text = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').trim()

/** Первое число из строки: «51,8 кг» → 51.8. */
function firstNumber(value: string): number {
  const match = value.match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : NaN
}

/** Масса погонного метра, кг: характеристика «Масса 1 м» / «Масса 1 пог. м». */
export function massPerMeter(specs: SpecLike[] | undefined | null): number {
  const spec = specs?.find((item) => {
    const label = item.label.toLowerCase()
    return /^масса\s+(1\s*)?(пог\.?\s*)?(м|метра)(?![а-яё])/.test(label) && !label.includes('длин')
  })
  const mass = firstNumber(text(spec?.value))
  return mass > 0 ? mass : 0
}

/** Мерные длины, м: «12,5 м» → [12.5]; «12,5 и 25 м» → [12.5, 25]; «12500 мм» → [12.5]. */
export function measuredLengths(specs: SpecLike[] | undefined | null): number[] {
  const spec = specs?.find((item) => item.label.toLowerCase().startsWith('мерная длина'))
  const value = text(spec?.value)
  const inMm = /мм/.test(value)
  const lengths = (value.match(/\d+(?:[.,]\d+)?/g) ?? [])
    .map((n) => Number(n.replace(',', '.')) / (inMm ? 1000 : 1))
    .filter((n) => n >= 4 && n <= 30)
  return [...new Set(lengths)].slice(0, 2)
}

const lengthText = (meters: number) => String(meters).replace('.', ',')

/**
 * Варианты цены для переключателя. null — когда пересчитывать нечего:
 * цены нет, она не за тонну или у товара не указана масса метра.
 */
export function convertTonPrice(
  price: number | null | undefined,
  specs: SpecLike[] | undefined | null,
  title = '',
): PriceConversion | null {
  if (!price || priceUnitLabel(specs) !== 'за тонну') return null
  const mass = massPerMeter(specs)
  if (!mass) return null

  const perMeter = (price * mass) / 1000
  const piece = /рельс/i.test(title) ? 'рельс' : 'шт.'
  const options: PriceOption[] = [
    { key: 't', tab: 'т', unit: 'за тонну', price },
    { key: 'kg', tab: 'кг', unit: 'за кг', price: Math.round(price / 10) / 100 },
    { key: 'm', tab: 'пог. м', unit: 'за пог. м', price: Math.round(perMeter) },
    ...measuredLengths(specs).map((length) => ({
      key: `pc-${length}`,
      tab: `шт ${lengthText(length)} м`,
      unit: `за ${piece} ${lengthText(length)} м`,
      price: Math.round(perMeter * length),
    })),
  ]
  return { options, massPerMeter: mass }
}
