import { test } from 'node:test'
import assert from 'node:assert/strict'
import { POSITIONS_FALLBACK, positionsLabel, roundPositions } from '../src/shared/lib/positions-count.ts'

test('число позиций округляется вниз до сотни, чтобы «+» был правдой', () => {
  assert.equal(roundPositions(630), 600)
  assert.equal(roundPositions(600), 600)
  assert.equal(roundPositions(699), 600)
  assert.equal(roundPositions(1234), 1200)
})

test('меньше сотни — вниз до десятка, совсем мало или мусор — ноль', () => {
  assert.equal(roundPositions(87), 80)
  assert.equal(roundPositions(9), 0)
  assert.equal(roundPositions(Number.NaN), 0)
})

test('подпись: разряды неразрывным пробелом, «позиций» после круглого числа', () => {
  assert.equal(positionsLabel(600), '600+ позиций в наличии и под заказ')
  assert.equal(positionsLabel(1200), '1 200+ позиций в наличии и под заказ')
  assert.equal(positionsLabel(12000), '12 000+ позиций в наличии и под заказ')
})

test('запасное число само круглое', () => {
  assert.equal(roundPositions(POSITIONS_FALLBACK), POSITIONS_FALLBACK)
})
