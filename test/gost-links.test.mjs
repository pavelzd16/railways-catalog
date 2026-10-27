import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gostSegments } from '../src/entities/normativ/lib/gost-links.ts'

const docs = [
  { code: 'ГОСТ 4121-96', slug: 'gost-4121-96' },
  { code: 'ГОСТ Р 53866-2010', slug: 'gost-r-53866-2010' },
]
const joined = (segments) => segments.map((segment) => segment.text).join('')

test('gostSegments: номер из справочника — ссылка, разделитель на месте', () => {
  assert.deepEqual(gostSegments('ГОСТ 4121-96, ГОСТ Р 53866-2010', docs), [
    { text: 'ГОСТ 4121-96', slug: 'gost-4121-96' },
    { text: ', ' },
    { text: 'ГОСТ Р 53866-2010', slug: 'gost-r-53866-2010' },
  ])
})
test('gostSegments: номера не из справочника остаются текстом', () => {
  assert.deepEqual(gostSegments('ГОСТ 8141-56; ГОСТ 4121-96; ТУ 14-2-472-82', docs), [
    { text: 'ГОСТ 8141-56; ' },
    { text: 'ГОСТ 4121-96', slug: 'gost-4121-96' },
    { text: '; ТУ 14-2-472-82' },
  ])
})
test('gostSegments: «(заменён на …)» сохраняется как было', () => {
  assert.deepEqual(gostSegments('ГОСТ 4121-96 (заменён на ГОСТ 99-1)', docs), [
    { text: 'ГОСТ 4121-96', slug: 'gost-4121-96' },
    { text: ' (заменён на ГОСТ 99-1)' },
  ])
})
test('gostSegments: замена, которая есть в справочнике, тоже ссылка', () => {
  assert.deepEqual(gostSegments('ГОСТ 5812-82 (заменён на ГОСТ Р 53866-2010)', docs), [
    { text: 'ГОСТ 5812-82 (заменён на ' },
    { text: 'ГОСТ Р 53866-2010', slug: 'gost-r-53866-2010' },
    { text: ')' },
  ])
})
test('gostSegments: без документов справочника — одна текстовая часть, как было', () => {
  assert.deepEqual(gostSegments('ГОСТ 4121-96; ГОСТ 1 (заменён на ГОСТ 2)', undefined), [{ text: 'ГОСТ 4121-96; ГОСТ 1 (заменён на ГОСТ 2)' }])
  assert.deepEqual(gostSegments('ГОСТ 4121-96', []), [{ text: 'ГОСТ 4121-96' }])
  assert.deepEqual(gostSegments('', docs), [])
})
test('gostSegments: латиница и регистр в номере не мешают совпадению', () => {
  assert.deepEqual(gostSegments('гост p 53866-2010', docs), [{ text: 'гост p 53866-2010', slug: 'gost-r-53866-2010' }])
})
test('gostSegments: склейка частей даёт исходную строку', () => {
  for (const gost of ['ГОСТ 4121-96, ГОСТ Р 53866-2010', ' ГОСТ 4121-96 ;ТУ 1 (заменён на ГОСТ 4121-96) ; ', 'ЦП-369 ТУ-3', 'ГОСТ 1 (заменён на ГОСТ 2, ГОСТ 3); ГОСТ 4']) {
    assert.equal(joined(gostSegments(gost, docs)), gost)
  }
})
