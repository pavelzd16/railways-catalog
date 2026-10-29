import { test } from 'node:test'
import assert from 'node:assert/strict'
import { POSITIONS, POSITIONS_CAPTION, positionsLabel, positionsValue } from '../src/shared/lib/positions-count.ts'

test('число позиций задано вручную — 700', () => {
  assert.equal(POSITIONS, 700)
  assert.equal(positionsValue(), '700+')
  assert.equal(positionsLabel(), '700+ позиций')
})

test('строка шапки: разряды неразрывным пробелом, «позиций» после числа', () => {
  assert.equal(positionsLabel(1200), '1 200+ позиций')
  assert.equal(positionsLabel(12000), '12 000+ позиций')
})

test('длинная подпись вынесена отдельно', () => {
  assert.equal(POSITIONS_CAPTION, 'позиций в наличии и под заказ')
})

test('крупная цифра первого экрана — то же число без подписи', () => {
  assert.equal(positionsValue(1200), '1 200+')
})
