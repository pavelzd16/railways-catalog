import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizeCode, parseGostField } from '../src/entities/normativ/lib/norm-code.ts'
import { gostSegments } from '../src/entities/normativ/lib/gost-links.ts'

// Те же примеры лежат в railways-catalog-api/test/fixtures/norm-codes.json: разбор номеров в двух репозиториях обязан совпадать.
const fixture = JSON.parse(readFileSync(new URL('./fixtures/norm-codes.json', import.meta.url), 'utf8'))

test('normalizeCode: примеры из общей фикстуры', () => {
  for (const { input, output } of fixture.normalizeCode) assert.equal(normalizeCode(input), output, JSON.stringify(input))
})
test('parseGostField: примеры из общей фикстуры', () => {
  for (const { gost, items } of fixture.parseGostField) assert.deepEqual(parseGostField(gost), items, JSON.stringify(gost))
})
test('normalizeCode: латинская и кириллическая запись одного номера совпадают', () => {
  assert.equal(normalizeCode('ГОСТ P 53866-2010'), normalizeCode('гост р 53866-2010'))
  assert.notEqual(normalizeCode('ГОСТ 53866-2010'), normalizeCode('ГОСТ Р 53866-2010'))
})
test('совпадение номера со строкой ГОСТ товара (общие примеры): ссылка есть ровно там, где match', () => {
  for (const { code, gost, match } of fixture.match) {
    const linked = gostSegments(gost ?? '', [{ code, slug: 'doc' }]).some((segment) => segment.slug === 'doc')
    assert.equal(linked, match, `${code} в «${gost}»`)
  }
})
