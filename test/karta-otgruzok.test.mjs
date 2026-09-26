import { test } from 'node:test'
import assert from 'node:assert/strict'
import { REGIONY, SKLADY } from '../src/widgets/shipment-map/model/goroda.ts'
import { GORODA_NA_KARTE, MARSHRUTY, RAZMER, TOCHKI_SKLADOV, VSE_GORODA } from '../src/widgets/shipment-map/model/marshruty.ts'
import { OZERA, REKI, SUSHA } from '../src/widgets/shipment-map/model/kontury.ts'

const MILLIONNIKI = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Красноярск', 'Нижний Новгород', 'Челябинск', 'Уфа', 'Самара', 'Ростов-на-Дону', 'Краснодар', 'Омск', 'Воронеж', 'Пермь', 'Волгоград']

test('shipment map lists every million-plus city and the cities asked for by name', () => {
  const nazvaniya = VSE_GORODA.map((g) => g.nazvanie)
  for (const gorod of [...MILLIONNIKI, 'Смоленск', 'Брянск', 'Астрахань', 'Астана']) {
    assert.ok(nazvaniya.includes(gorod), gorod)
  }
  assert.deepEqual(SKLADY.map((s) => s.nazvanie), ['Зеленодольск', 'Екатеринбург'])
  assert.equal(new Set(nazvaniya).size, nazvaniya.length)
  for (const region of REGIONY) assert.ok(region.goroda.length > 0, region.nazvanie)
})

test('every city is served by a known warehouse and gets a route unless it sits next to one', () => {
  const sklady = new Set(SKLADY.map((s) => s.id))
  for (const gorod of VSE_GORODA) {
    assert.ok(gorod.sklady.length > 0 && gorod.sklady.every((id) => sklady.has(id)), gorod.id)
    const marshruty = MARSHRUTY.filter((m) => m.gorod.id === gorod.id)
    assert.equal(marshruty.length, gorod.ryadomSoSkladom ? 0 : gorod.sklady.length, gorod.id)
  }
  assert.ok(MARSHRUTY.some((m) => m.sklad.id === 'ekaterinburg'))
  assert.equal(new Set(MARSHRUTY.map((m) => m.id)).size, MARSHRUTY.length)
})

test('every city has a delivery time from Kazan, so the Zelenodolsk warehouse serves it', () => {
  for (const gorod of VSE_GORODA) {
    if (gorod.ryadomSoSkladom) continue
    assert.match(gorod.srok ?? '', /^\d(–\d)? (день|дня|дней)$/, gorod.id)
    assert.ok(gorod.sklady.includes('zelenodolsk'), gorod.id)
  }
  assert.equal(VSE_GORODA.find((g) => g.id === 'novosibirsk').srok, '4–5 дней')
})

test('warehouses and city points fit the frame with room for labels', () => {
  for (const t of [...TOCHKI_SKLADOV, ...GORODA_NA_KARTE]) {
    const imya = 'sklad' in t ? t.sklad.nazvanie : t.gorod.nazvanie
    assert.ok(t.x > 60 && t.x < RAZMER.shirina - 60, `${imya} x=${t.x}`)
    assert.ok(t.y > 40 && t.y < RAZMER.vysota - 40, `${imya} y=${t.y}`)
  }
})

test('each route is an arc from its warehouse, farther cities take longer', () => {
  for (const m of MARSHRUTY) {
    const sklad = TOCHKI_SKLADOV.find((t) => t.sklad.id === m.sklad.id)
    assert.ok(m.put.startsWith(`M${sklad.x} ${sklad.y}Q`), m.id)
    assert.ok(m.put.endsWith(` ${m.x} ${m.y}`), m.id)
    assert.ok(m.period >= 2.4, m.id)
  }
  const po = (id) => MARSHRUTY.find((m) => m.id === id)
  assert.ok(po('zelenodolsk-novosibirsk').period > po('zelenodolsk-moskva').period)
  assert.ok(po('zelenodolsk-novosibirsk').period > po('ekaterinburg-novosibirsk').period)
})

test('map outlines were generated for the current frame', () => {
  for (const put of [SUSHA, OZERA, REKI]) assert.match(put, /^M[\d.-]+ [\d.-]+L/)
})
