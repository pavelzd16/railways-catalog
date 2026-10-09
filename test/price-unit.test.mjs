import { test } from 'node:test'
import assert from 'node:assert/strict'
import { priceUnitLabel } from '../src/shared/lib/price-unit.ts'

const unit = (value) => [{ label: 'Тип', value: 'Р65' }, { label: 'Единица измерения', value }]

test('тонна, штука, комплект — своя подпись', () => {
  assert.equal(priceUnitLabel(unit('тонна')), 'за тонну')
  assert.equal(priceUnitLabel(unit('т')), 'за тонну')
  assert.equal(priceUnitLabel(unit('шт')), 'за шт.')
  assert.equal(priceUnitLabel(unit('штука')), 'за шт.')
  assert.equal(priceUnitLabel(unit('комплект')), 'за комплект')
  assert.equal(priceUnitLabel(unit('комплект на стык')), 'за комплект')
})

test('нет единицы или она неоднозначна — подписи нет, а не «за тонну»', () => {
  assert.equal(priceUnitLabel([]), '')
  assert.equal(priceUnitLabel(undefined), '')
  assert.equal(priceUnitLabel([{ label: 'Тип', value: 'Р65' }]), '')
  assert.equal(priceUnitLabel(unit('шт или т')), '')
  assert.equal(priceUnitLabel(unit('')), '')
})

test('точка в конце и регистр не мешают', () => {
  assert.equal(priceUnitLabel(unit('Тонна.')), 'за тонну')
  assert.equal(priceUnitLabel(unit('шт;')), 'за шт.')
})
