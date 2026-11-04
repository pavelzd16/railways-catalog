import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convertTonPrice, massPerMeter, measuredLengths } from '../src/shared/lib/price-convert.ts'

// Характеристики как у карточки Р-50 на боевом (TM-0020).
const r50 = [
  { label: 'Тип рельса', value: 'Р-50' },
  { label: 'Длина', value: '12500 мм' },
  { label: 'Мерная длина', value: '12,5 м' },
  { label: 'Единица измерения', value: 'тонна' },
  { label: 'Немерная длина', value: '6-25 м' },
  { label: 'Масса 1 м', value: '51,8 кг' },
  { label: 'Метров в тонне', value: '19,3 м' },
  { label: 'Масса рельса длиной 12,5 м', value: '647 кг' },
]

test('Р-50 за 99 000 ₽/т: кг, метр и рельс 12,5 м', () => {
  const result = convertTonPrice(99000, r50, 'Железнодорожные рельсы Р-50')
  assert.equal(result.massPerMeter, 51.8)
  assert.deepEqual(
    result.options.map((o) => [o.tab, o.unit, o.price]),
    [
      ['т', 'за тонну', 99000],
      ['кг', 'за кг', 99],
      ['пог. м', 'за пог. м', 5128],
      ['шт 12,5 м', 'за рельс 12,5 м', 64103],
    ],
  )
})

test('масса метра — не путать с массой рельса заданной длины', () => {
  assert.equal(massPerMeter(r50), 51.8)
  assert.equal(massPerMeter([{ label: 'Масса рельса длиной 12,5 м', value: '647 кг' }]), 0)
  assert.equal(massPerMeter([{ label: 'Масса 1 пог. м', value: '64,72 кг' }]), 64.72)
})

test('мерные длины: метры, миллиметры, две длины', () => {
  assert.deepEqual(measuredLengths(r50), [12.5])
  assert.deepEqual(measuredLengths([{ label: 'Мерная длина', value: '12,5 и 25 м' }]), [12.5, 25])
  assert.deepEqual(measuredLengths([{ label: 'Мерная длина', value: '25000 мм' }]), [25])
  assert.deepEqual(measuredLengths([]), [])
})

test('без мерной длины — только т, кг и метр; не рельс — «шт.»', () => {
  const specs = r50.filter((s) => s.label !== 'Мерная длина')
  assert.deepEqual(convertTonPrice(99000, specs, 'Рельс').options.map((o) => o.tab), ['т', 'кг', 'пог. м'])
  const beam = convertTonPrice(99000, r50, 'Балка двутавровая')
  assert.equal(beam.options.at(-1).unit, 'за шт. 12,5 м')
})

test('пересчёта нет: без цены, не за тонну, без массы метра', () => {
  assert.equal(convertTonPrice(0, r50), null)
  assert.equal(convertTonPrice(null, r50), null)
  const perPiece = r50.map((s) => (s.label === 'Единица измерения' ? { ...s, value: 'шт' } : s))
  assert.equal(convertTonPrice(99000, perPiece), null)
  assert.equal(convertTonPrice(99000, r50.filter((s) => s.label !== 'Масса 1 м')), null)
})
