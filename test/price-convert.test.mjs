import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convertTonPrice, massPerMeter, massPerPiece, measuredLengths } from '../src/shared/lib/price-convert.ts'

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
  assert.equal(result.note, 'Ориентировочно, по массе 1 м — 51,8 кг; в тонне ≈ 19,3 м.')
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
  // «Длина рельса» у трамвайных: число — мерная длина, «немерная» — нет; «Немерная длина 6-25 м» не мерная.
  assert.deepEqual(measuredLengths([{ label: 'Длина рельса', value: '12,5 м' }]), [12.5])
  assert.deepEqual(measuredLengths([{ label: 'Длина рельса', value: 'немерная' }]), [])
  assert.deepEqual(measuredLengths([{ label: 'Длина рельса', value: 'отрезки по 2 м' }]), [2])
  assert.deepEqual(measuredLengths([{ label: 'Немерная длина', value: '6-25 м' }]), [])
})

test('трамвайный РТ62: масса из карточки, отрезки по 2 м — «за отрезок 2 м»', () => {
  const specs = [
    { label: 'Тип', value: 'РТ62' },
    { label: 'Длина рельса', value: 'отрезки по 2 м' },
    { label: 'Масса 1 м', value: '62,10 кг' },
    { label: 'Единица измерения', value: 'тонна' },
  ]
  const result = convertTonPrice(148500, specs, 'Рельс трамвайный РТ62, фрезерованный, отрезки по 2 м, новый')
  assert.deepEqual(result.options.map((o) => [o.tab, o.unit, o.price]), [
    ['т', 'за тонну', 148500],
    ['кг', 'за кг', 148.5],
    ['пог. м', 'за пог. м', 9222],
    ['шт 2 м', 'за отрезок 2 м', 18444],
  ])
})

test('без мерной длины — только т, кг и метр; не рельс — «шт.»', () => {
  const specs = r50.filter((s) => s.label !== 'Мерная длина')
  assert.deepEqual(convertTonPrice(99000, specs, 'Рельс').options.map((o) => o.tab), ['т', 'кг', 'пог. м'])
  const beam = convertTonPrice(99000, r50, 'Балка двутавровая')
  assert.equal(beam.options.at(-1).unit, 'за шт. 12,5 м')
})

test('пересчёта нет: без цены, не за тонну, без массы', () => {
  assert.equal(convertTonPrice(0, r50), null)
  assert.equal(convertTonPrice(null, r50), null)
  const perPiece = r50.map((s) => (s.label === 'Единица измерения' ? { ...s, value: 'шт' } : s))
  assert.equal(convertTonPrice(99000, perPiece), null)
  assert.equal(convertTonPrice(99000, r50.filter((s) => s.label !== 'Масса 1 м'), 'Балка'), null)
  // Трамвайный РТ62 и крановый КР — не «Р62»/«Р100»: масса другая, без характеристики не считаем.
  assert.equal(convertTonPrice(99000, tonOnly, 'Рельс трамвайный РТ62, 12,5 м, с отверстиями, новый'), null)
  assert.equal(convertTonPrice(99000, tonOnly, 'Рельс крановый КР-100'), null)
})

const tonOnly = [{ label: 'Единица измерения', value: 'тонна' }]

test('рельс без массы метра: масса по типу из названия, длина из названия', () => {
  const r65 = convertTonPrice(126000, tonOnly, 'Рельс Р65 ДТ350, 25 м, новый')
  assert.deepEqual(
    r65.options.map((o) => [o.tab, o.unit, o.price]),
    [
      ['т', 'за тонну', 126000],
      ['кг', 'за кг', 126],
      ['пог. м', 'за пог. м', 8175],
      ['шт 25 м', 'за рельс 25 м', 204372],
    ],
  )
  assert.equal(r65.note, 'Ориентировочно, по массе 1 м нового рельса Р65 — 64,88 кг; в тонне ≈ 15,4 м.')
  assert.equal(convertTonPrice(126000, tonOnly, 'Рельс Р65 ДТ350, 100 м, новый').options.at(-1).unit, 'за рельс 100 м')
  // Старогодный: длины в названии нет — только т, кг и метр.
  const old = convertTonPrice(60000, tonOnly, 'Рельс железнодорожный Р50, старогодный (б/у)')
  assert.deepEqual(old.options.map((o) => o.tab), ['т', 'кг', 'пог. м'])
})

test('штучный товар за тонну: т, кг, шт и сколько штук в тонне', () => {
  const bolt = convertTonPrice(160000, [...tonOnly, { label: 'Масса 1 шт.', value: '0,761 кг' }], 'Болт закладной М22х175')
  assert.deepEqual(
    bolt.options.map((o) => [o.tab, o.unit, o.price]),
    [
      ['т', 'за тонну', 160000],
      ['кг', 'за кг', 160],
      ['шт', 'за шт.', 121.76],
    ],
  )
  // Разряды — неразрывным пробелом, как во всех ценах сайта (Intl ru-RU).
  assert.equal(bolt.note, 'Ориентировочно, по массе 1 шт. — 0,761 кг; в тонне ≈ 1 314 шт.')
  // Мелочь — с копейками; «около 0,12 кг» и «Масса 1000 шт.» тоже читаются.
  const washer = convertTonPrice(200000, [...tonOnly, { label: 'Масса 1 шт.', value: '0,049 кг' }], 'Шайба')
  assert.equal(washer.options.at(-1).price, 9.8)
  // Цена за кг не округляется до рубля: 130 500 ₽/т → 130,5 ₽/кг.
  assert.equal(convertTonPrice(130500, [...tonOnly, { label: 'Масса 1 шт.', value: '0,761 кг' }]).options[1].price, 130.5)
  assert.equal(massPerPiece([{ label: 'Масса 1 шт.', value: 'около 0,12 кг' }]), 0.12)
  assert.equal(massPerPiece([{ label: 'Масса 1000 шт. (теоретическая), кг', value: '135,83' }]), 0.13583)
  assert.equal(massPerPiece([{ label: 'Теоретическая масса 1 шт., кг', value: '0,458' }]), 0.458)
})
