// Пересчёт цены за тонну в цену за кг, погонный метр и штуку.
// Покупатель часто считает в метрах, рельсах или штуках, а не в тоннах.
// Источники массы по порядку:
//  1) «Масса 1 м» в характеристиках — рельсы: т / кг / пог. м / рельс мерной длины;
//  2) у рельса без массы метра — масса того же типа из наших карточек (RAIL_MASS);
//  3) «Масса 1 шт.» (или «Масса 1000 шт.») — крепёж, накладки, подкладки: т / кг / шт.
// Без массы пересчёта нет — карточка показывает цену как раньше.

import { priceUnitLabel } from './price-unit.ts'

interface SpecLike {
  label: string
  unit?: string | null
  value?: unknown
}

interface PricedProduct {
  price?: number | null
  specs?: SpecLike[] | null
  title: string
  categorySlug?: string
  subcategorySlug?: string | null
}

export interface PriceOption {
  /** Ключ варианта: t, kg, m, pc, pc-12.5 … */
  key: string
  /** Короткая подпись на переключателе: «т», «кг», «пог. м», «шт 12,5 м». */
  tab: string
  /** Подпись рядом с ценой: «за тонну», «за пог. м», «за рельс 12,5 м». */
  unit: string
  price: number
}

export interface PriceConversion {
  options: PriceOption[]
  /** Пояснение под ценой: по какой массе считали и сколько в тонне. */
  note: string
}

/**
 * Масса 1 м рельса по типу — те же числа, что в характеристиках наших карточек
 * (Р-50 TM-0020, Р-65 TM-0039, Р-43 TM-0051 …). Нужна карточкам рельсов, у которых
 * массы метра в характеристиках нет («Рельс Р65 ДТ350, 25 м, новый», старогодные).
 */
const RAIL_MASS: Record<string, number> = {
  '8': 8.42,
  '11': 11.18,
  '18': 17.9,
  '24': 24.9,
  '33': 33.48,
  '38': 38.51,
  '43': 44.745,
  '50': 51.8,
  '65': 64.88,
  '75': 74.6,
}

const text = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').trim()
const num = (value: string) => Number(value.replace(',', '.'))

/** Первое число из строки: «51,8 кг» → 51.8; «около 0,12 кг» → 0.12. */
function firstNumber(value: string): number {
  const match = value.match(/\d+(?:[.,]\d+)?/)
  return match ? num(match[0]) : NaN
}

const findSpec = (specs: SpecLike[] | undefined | null, test: (label: string) => boolean) =>
  specs?.find((item) => test(item.label.toLowerCase().trim()))

/** Масса погонного метра, кг: характеристика «Масса 1 м» / «Масса 1 м, кг» / «Масса 1 пог. м». */
export function massPerMeter(specs: SpecLike[] | undefined | null): number {
  const spec = findSpec(specs, (label) => /^масса\s+(1\s*)?(пог\.?\s*)?(м|метра)(?![а-яё])/.test(label) && !label.includes('длин'))
  const mass = firstNumber(text(spec?.value))
  return mass > 0 ? mass : 0
}

/** Масса одной штуки, кг: «Масса 1 шт.», «Теоретическая масса 1 шт., кг», «Масса 1000 шт., кг». */
export function massPerPiece(specs: SpecLike[] | undefined | null): number {
  const one = findSpec(specs, (label) => /масса\s+1\s*шт/.test(label))
  const oneMass = firstNumber(text(one?.value))
  if (oneMass > 0) return oneMass
  const thousand = findSpec(specs, (label) => /масса\s+1\s*000\s*шт/.test(label))
  const thousandMass = firstNumber(text(thousand?.value))
  return thousandMass > 0 ? thousandMass / 1000 : 0
}

const isRailTitle = (title: string) => /рельс/i.test(title)

export function isRailProduct(product: Pick<PricedProduct, 'title' | 'categorySlug' | 'subcategorySlug'>): boolean {
  return (
    (product.categorySlug === 'zheleznodorozhnye-relsy' ||
      product.categorySlug === 'kranovye-relsy' ||
      product.subcategorySlug === 'starogodnye-relsy') &&
    /(?:^|\s)рельс(?:ы|а)?(?=\s|$)/i.test(product.title) &&
    !/^(?:профиль|заготовк|уголок|тяга|шина)/i.test(product.title)
  )
}

/** Тип рельса из названия: «Рельс Р65 ДТ350» → «65». КР-, РП-, РТ- не берём — у них своя масса. */
function railTypeFromTitle(title: string): string | undefined {
  if (!isRailTitle(title)) return undefined
  return title.match(/(?:^|[^А-Яа-яЁёA-Za-z])Р-?(\d{1,3})(?!\d)/)?.[1]
}

const inRange = (meters: number) => meters >= 1 && meters <= 120

/**
 * Мерные длины, м, из «Мерной длины» или «Длины рельса»: «12,5 м» → [12.5]; «12,5 и 25 м» → [12.5, 25];
 * «12500 мм» → [12.5]; «отрезки по 2 м» → [2]; «немерная» → []. «Немерная длина 6-25 м» не читаем.
 */
export function measuredLengths(specs: SpecLike[] | undefined | null): number[] {
  const spec = findSpec(specs, (label) => label.startsWith('мерная длина') || label === 'длина рельса')
  const value = text(spec?.value)
  if (/\d\s*[-–—]\s*\d/.test(value)) return []
  const inMm = /мм/.test(value) || /^мм$/i.test(spec?.unit ?? '')
  // В старых карточках есть запись «5,6,7 м» без пробелов.
  const numbers = /^\d(?:,\d){2,}\s*м$/.test(value)
    ? value.match(/\d/g)
    : value.match(/\d+(?:[.,]\d+)?/g)
  const lengths = (numbers ?? [])
    .map((n) => num(n) / (inMm ? 1000 : 1))
    .filter(inRange)
  return [...new Set(lengths)]
}

/** Длина рельса из названия: «Рельс Р65 ДТ350, 25 м, новый» → [25]. */
function lengthsFromTitle(title: string): number[] {
  const match = title.match(/(\d+(?:[.,]\d+)?)\s*м(?![а-яёa-z])/i)
  const meters = match ? num(match[1]) : NaN
  return inRange(meters) ? [meters] : []
}

const decimal = (value: number) => String(value).replace('.', ',')

const roundKopecks = (value: number) => Math.round(value * 100) / 100

/** Копейки — только у сумм до 1 000 ₽: 130,5 ₽ за кг и 7,94 ₽ за шайбу, но 64 103 ₽ за рельс. */
const roundPrice = (value: number) => (value < 1000 ? roundKopecks(value) : Math.round(value))

/** «в тонне ≈ 19,3 м», «в тонне ≈ 1 314 шт.» */
const perTon = (mass: number) => {
  const amount = 1000 / mass
  return amount < 100 ? decimal(Math.round(amount * 10) / 10) : new Intl.NumberFormat('ru-RU').format(Math.round(amount))
}

/**
 * Варианты цены для переключателя. null — когда пересчитывать нечего:
 * цены нет, она не за тонну или у товара не указана масса.
 */
export function convertTonPrice(
  price: number | null | undefined,
  specs: SpecLike[] | undefined | null,
  title = '',
  knownLengths: number[] = [],
): PriceConversion | null {
  if (!price || price <= 0 || priceUnitLabel(specs) !== 'за тонну') return null
  const ton: PriceOption = { key: 't', tab: 'т', unit: 'за тонну', price }
  const kg: PriceOption = { key: 'kg', tab: 'кг', unit: 'за кг', price: roundPrice(price / 1000) }

  const ownMeterMass = massPerMeter(specs)
  const railType = ownMeterMass ? undefined : railTypeFromTitle(title)
  const meterMass = ownMeterMass || (railType ? RAIL_MASS[railType] ?? 0 : 0)
  if (meterMass) {
    const perMeter = (price * meterMass) / 1000
    const piece = /отрез/i.test(title) ? 'отрезок' : isRailTitle(title) ? 'рельс' : 'шт.'
    const specLengths = measuredLengths(specs)
    const lengths = knownLengths.length > 0
      ? knownLengths
      : specLengths.length > 0 || !isRailTitle(title) ? specLengths : lengthsFromTitle(title)
    const source = ownMeterMass ? 'по массе 1 м' : `по массе 1 м нового рельса Р${railType}`
    return {
      options: [
        ton,
        kg,
        { key: 'm', tab: 'пог. м', unit: 'за пог. м', price: roundPrice(perMeter) },
        ...lengths.map((length) => ({
          key: `pc-${length}`,
          tab: `шт ${decimal(length)} м`,
          unit: `за ${piece} ${decimal(length)} м`,
          price: knownLengths.length > 0 ? roundKopecks(perMeter * length) : roundPrice(perMeter * length),
        })),
      ],
      note: `Ориентировочно, ${source} — ${decimal(meterMass)} кг; в тонне ≈ ${perTon(meterMass)} м.`,
    }
  }

  const pieceMass = massPerPiece(specs)
  if (pieceMass) {
    return {
      options: [ton, kg, { key: 'pc', tab: 'шт', unit: 'за шт.', price: roundPrice((price * pieceMass) / 1000) }],
      note: `Ориентировочно, по массе 1 шт. — ${decimal(pieceMass)} кг; в тонне ≈ ${perTon(pieceMass)} шт.`,
    }
  }
  return null
}

/** Только длины продаваемых рельсов. Проектные диапазоны из ГОСТа сюда не входят. */
function railLengths(product: PricedProduct): number[] {
  const { specs, title } = product
  const measured = measuredLengths(specs)
  const lengthSpec = findSpec(specs, (label) => /^длина(?:\s*,\s*м)?$/.test(label))
  const lengthSpecText = text(lengthSpec?.value)
  if (/^\d+(?:[.,]\d+)?(?:\s*(?:мм|м))?$/i.test(lengthSpecText)) {
    const millimeters = /мм/i.test(lengthSpecText) || /^мм$/i.test(lengthSpec?.unit ?? '')
    const meters = firstNumber(lengthSpecText) / (millimeters ? 1000 : 1)
    if (inRange(meters)) return [meters, ...measured.filter((length) => length !== meters)]
  }
  if (measured.length) return measured
  if (!/\d\s*[-–—]\s*\d/.test(lengthSpecText)) {
    const listed = [...lengthSpecText.matchAll(/(\d+(?:[.,]\d+)?)\s*м(?![а-яё])/gi)]
      .map((match) => num(match[1]))
      .filter(inRange)
    if (listed.length) return [...new Set(listed)]
  }
  return lengthsFromTitle(title)
}

/** Первый вариант для рельсов — цена за рельс известной длины. */
export function productPriceConversion(product: PricedProduct): PriceConversion | null {
  if (!isRailProduct(product)) return convertTonPrice(product.price, product.specs, product.title)

  const reference = findSpec(product.specs, (label) => label === 'длина для пересчёта цены')
  const referenceLength = firstNumber(text(reference?.value))
  const productLengths = railLengths(product)
  const lengths = inRange(referenceLength)
    ? [referenceLength, ...productLengths.filter((length) => length !== referenceLength)]
    : productLengths
  const conversion = convertTonPrice(product.price, product.specs, product.title, lengths)
  if (!conversion) return null
  const piece = conversion.options.find((option) => option.key.startsWith('pc'))
  if (!piece) return conversion
  return {
    ...conversion,
    note: inRange(referenceLength) && !productLengths.includes(referenceLength)
      ? conversion.note + ' Фактическую длину рельса уточняйте при заказе.'
      : conversion.note,
    options: [piece, ...conversion.options.filter((option) => option !== piece)],
  }
}

export function primaryRailPrice(product: PricedProduct): PriceOption | undefined {
  if (!isRailProduct(product)) return undefined
  const first = productPriceConversion(product)?.options[0]
  return first?.key.startsWith('pc') ? first : undefined
}

/** Единица количества в заявке совпадает с единицей цены, которую умножает API. */
export function railOrderUnit(product: PricedProduct): string {
  return isRailProduct(product) && priceUnitLabel(product.specs) === 'за тонну' ? 'т' : 'шт'
}
