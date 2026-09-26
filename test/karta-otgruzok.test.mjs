import { test } from 'node:test'
import assert from 'node:assert/strict'
import { REGIONY, SKLAD } from '../src/widgets/shipment-map/model/goroda.ts'
import { MARSHRUTY, RAZMER, TOCHKA_SKLADA } from '../src/widgets/shipment-map/model/marshruty.ts'
import { OZERA, REKI, SUSHA } from '../src/widgets/shipment-map/model/kontury.ts'

test('shipment map shows every key city with room for its label', () => {
  const nazvaniya = MARSHRUTY.map((m) => m.gorod.nazvanie)
  for (const gorod of ['Москва', 'Смоленск', 'Брянск', 'Ростов-на-Дону', 'Краснодар', 'Астрахань', 'Екатеринбург', 'Челябинск', 'Новосибирск', 'Астана']) {
    assert.ok(nazvaniya.includes(gorod), gorod)
  }
  assert.equal(SKLAD.nazvanie, 'Зеленодольск')
  assert.equal(new Set(MARSHRUTY.map((m) => m.gorod.id)).size, MARSHRUTY.length)
  for (const tochka of [TOCHKA_SKLADA, ...MARSHRUTY]) {
    assert.ok(tochka.x > 60 && tochka.x < RAZMER.shirina - 60, `${tochka.gorod.nazvanie} x=${tochka.x}`)
    assert.ok(tochka.y > 40 && tochka.y < RAZMER.vysota - 40, `${tochka.gorod.nazvanie} y=${tochka.y}`)
  }
  for (const region of REGIONY) assert.ok(region.goroda.length > 0, region.nazvanie)
})

test('each route is an arc from the warehouse, farther cities take longer', () => {
  for (const m of MARSHRUTY) {
    assert.ok(m.put.startsWith(`M${TOCHKA_SKLADA.x} ${TOCHKA_SKLADA.y}Q`), m.gorod.id)
    assert.ok(m.put.endsWith(` ${m.x} ${m.y}`), m.gorod.id)
    assert.ok(m.period >= 2.4, m.gorod.id)
  }
  const po = (id) => MARSHRUTY.find((m) => m.gorod.id === id)
  assert.ok(po('novosibirsk').period > po('moskva').period)
})

test('map outlines were generated for the current frame', () => {
  for (const put of [SUSHA, OZERA, REKI]) assert.match(put, /^M[\d.-]+ [\d.-]+L/)
})
