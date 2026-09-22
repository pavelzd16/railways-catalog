import { test } from 'node:test'
import assert from 'node:assert/strict'
import { IZDELIYA, RELSY, GRUPPY } from '../src/features/kalkulyator/model/dannye.ts'
import { DLYA_RELSA, itogoTonn, perevestiIzdelie, perevestiRelsy, proveritPut, rasschitatPut } from '../src/features/kalkulyator/model/raschet.ts'

const close = (actual, expected, eps = 1e-6) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≠ ${expected}`)

test('every value in the calculator names its standard and place in it', () => {
  for (const item of [...RELSY, ...IZDELIYA]) {
    assert.match(item.istochnik.doc, /^ГОСТ (Р )?\d+-\d{2,4}$/, item.id)
    assert.ok(item.istochnik.mesto.length > 0, item.id)
  }
  for (const item of IZDELIYA) {
    assert.ok(GRUPPY.includes(item.gruppa), item.id)
    assert.ok(item.kgNaSht > 0, item.id)
  }
  assert.equal(new Set([...RELSY, ...IZDELIYA].map((item) => item.id)).size, RELSY.length + IZDELIYA.length)
})

test('rails convert between metres, tonnes and pieces', () => {
  const tonna = perevestiRelsy('R65', 1, 't', 25)
  close(tonna.metry, 1000 / 64.88)
  assert.equal(tonna.relsov, 1)
  const km = perevestiRelsy('R50', 1000, 'm', 12.5)
  close(km.tonny, 51.8)
  assert.equal(km.relsov, 80)
  const shtuki = perevestiRelsy('KR100', 3, 'sht', 12.5)
  close(shtuki.metry, 37.5)
  close(shtuki.tonny, 37.5 * 83.09 / 1000)
})

test('pieces from weight are whole and never exceed the weight', () => {
  const r = perevestiIzdelie('k-16-165', 1, 't')
  assert.equal(r.sht, 2645)
  assert.ok(r.kg <= 1000)
  close(perevestiIzdelie('bs-m27-160', 480, 'sht').kg, 392.64)
  assert.equal(perevestiIzdelie('klemma-pk', 6.4, 'kg').sht, 10)
})

const put = {
  dlinaKm: 1, relsId: 'R65', dlinaRelsa: 25, shpaly: 'zhb', epura: 1840,
  nakladkaId: 'nakl-r65-1', boltId: 'bs-m27-160', podkladkaZhbId: 'p-1kb65',
  podkladkaDerId: 'p-d65', kostylId: 'k-16-165', kostyleyNaPodkladku: 5,
}

test('one kilometre of R65 track on concrete sleepers', () => {
  const rows = rasschitatPut(put)
  const byName = Object.fromEntries(rows.map((row) => [row.name, row]))
  assert.equal(byName['Рельс Р65 длиной 25 м'].sht, 80)
  close(byName['Рельс Р65 длиной 25 м'].tonny, 129.76)
  assert.equal(byName['Шпала железобетонная'].sht, 1840)
  assert.equal(byName['Шпала железобетонная'].tonny, null)
  assert.equal(rows.find((row) => row.name.startsWith('Накладка')).sht, 160)
  assert.equal(rows.find((row) => row.name.startsWith('Болт стыковой')).sht, 480)
  assert.equal(rows.find((row) => row.name === 'Гайка М27, исп. 2').sht, 480)
  assert.equal(rows.find((row) => row.name.startsWith('Подкладка 1 КБ65')).sht, 3680)
  assert.equal(rows.find((row) => row.name.startsWith('Болт закладной')).sht, 7360)
  assert.equal(rows.find((row) => row.name.startsWith('Болт клеммный')).sht, 7360)
  assert.equal(rows.find((row) => row.name === 'Клемма жёсткая ПК').sht, 7360)
  assert.equal(rows.find((row) => row.name.startsWith('Шайба')).sht, 14720)
  close(itogoTonn(rows), 129.76 + 4.7104 + 0.39264 + 0.1056 + 25.76 + 4.6736 + 2.5392 + 4.7104 + 1.7664)
})

test('wooden sleepers use spike plates and the chosen number of spikes', () => {
  const rows = rasschitatPut({ ...put, relsId: 'R50', dlinaRelsa: 12.5, shpaly: 'der', epura: 2000, dlinaKm: 0.5, nakladkaId: 'nakl-r50-2', boltId: 'bs-m24-150', podkladkaDerId: 'p-d50', kostyleyNaPodkladku: 3 })
  assert.equal(rows[0].sht, 80)
  assert.equal(rows[1].sht, 1000)
  assert.equal(rows.find((row) => row.name.startsWith('Болт стыковой')).sht, 80 * 4)
  assert.equal(rows.find((row) => row.name.startsWith('Подкладка Д50')).sht, 2000)
  assert.equal(rows.find((row) => row.name.startsWith('Костыль')).sht, 6000)
  assert.ok(!rows.some((row) => row.name.startsWith('Клемма')))
})

test('options offered for each rail exist and invalid input is reported', () => {
  const ids = new Set(IZDELIYA.map((item) => item.id))
  for (const set of Object.values(DLYA_RELSA)) {
    for (const id of [...set.nakladki, ...set.bolty, set.gayka, ...set.podkladkiZhb, ...set.podkladkiDer]) assert.ok(ids.has(id), id)
  }
  assert.deepEqual(proveritPut(put), [])
  assert.equal(proveritPut({ ...put, relsId: 'R75' }).length, 1)
  assert.equal(proveritPut({ ...put, dlinaKm: 0, epura: 10 }).length, 2)
})
