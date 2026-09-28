import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAIN_SPECS_COUNT, splitSpecs } from '../src/shared/lib/product-specs.ts'

const rows = (...labels) => labels.map((label) => ({ label }))
const labels = (items) => items.map((item) => item.label)

test('рельс Р-50: наверху тип рельса, ГОСТ, масса, длина, состояние, назначение; остальное — под кнопкой по порядку карточки', () => {
  const specs = rows(
    'Тип рельса', 'Назначение', 'Состояние', 'Длина', 'Ширина', 'Высота', 'Ширина головки', 'Толщина шейки',
    'Высота шейки', 'Высота пера подошвы', 'Мерная длина', 'Стандарт', 'Материал', 'Единица измерения',
    'Немерная длина', 'Масса 1 м', 'Метров в тонне', 'Масса рельса длиной 12,5 м',
  )
  const { main, rest } = splitSpecs(specs)
  assert.deepEqual(labels(main), ['Тип рельса', 'Стандарт', 'Масса 1 м', 'Длина', 'Состояние', 'Назначение'])
  assert.deepEqual(labels(rest), labels(specs.filter((spec) => !main.includes(spec))))
  assert.equal(main.length + rest.length, specs.length)
})

test('накладка: «Тип» и «Тип рельса» — две разные строки, «Масса 1 шт.» берётся один раз', () => {
  const { main } = splitSpecs(rows('Тип рельса', 'Болт стыковой', 'Тип', 'Длина', 'Материал', 'Масса 1 шт.', 'Масса 1 шт.', 'Стандарт'))
  assert.deepEqual(labels(main), ['Тип', 'Тип рельса', 'Стандарт', 'Масса 1 шт.', 'Длина', 'Материал'])
})

test('«Марка стали», «Типовая документация» и «Стандарт (по 1С)» не выдают себя за тип и ГОСТ', () => {
  const { main } = splitSpecs(rows('Марка стали', 'Типовая документация', 'Стандарт (по 1С)', 'Стандарт'), 3)
  assert.deepEqual(labels(main), ['Стандарт', 'Марка стали', 'Типовая документация'])
})

test('недобор главных добирается по порядку карточки, без «Единицы измерения»', () => {
  const { main, rest } = splitSpecs(rows('Единица измерения', 'Масса 1 шт.', 'Ширина', 'Высота', 'Норма загрузки вагона', 'Стандарт'))
  assert.deepEqual(labels(main), ['Стандарт', 'Масса 1 шт.', 'Ширина', 'Высота', 'Норма загрузки вагона'])
  assert.deepEqual(labels(rest), ['Единица измерения'])
})

test('короткий список не делится и не теряет строк', () => {
  const specs = rows('Резьба', 'Длина', 'Масса')
  const { main, rest } = splitSpecs(specs)
  assert.equal(main.length, 3)
  assert.equal(rest.length, 0)
  assert.equal(MAIN_SPECS_COUNT, 6)
  assert.deepEqual(splitSpecs([]), { main: [], rest: [] })
})
