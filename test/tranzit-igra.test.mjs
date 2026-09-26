import { test } from 'node:test'
import assert from 'node:assert/strict'
import { avtopilot, blizhayshaya, novayaIgra, polosaPoY, shag, vplotnuyu } from '../src/widgets/shipment-map/model/igra.ts'

// Повторяемый генератор случайных чисел, чтобы прогон был одинаковым.
function sluchaynoe(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

test('the second driver dodges traffic on his own — no hard braking in ten minutes', () => {
  for (const shirina of [300, 440, 520]) {
    for (const seed of [1, 7, 42]) {
      const igra = novayaIgra(shirina, 84)
      const r = sluchaynoe(seed)
      let tormozov = 0
      for (let i = 0; i < 60 * 600; i++) if (shag(igra, 1 / 60, null, r) === 'tormoz') tormozov++
      assert.equal(tormozov, 0, `ширина ${shirina}, seed ${seed}`)
    }
  }
})

test('driving straight at a car ends in hard braking: the car pulls away, then the truck speeds up again', () => {
  const igra = novayaIgra(440, 84)
  igra.mashiny.push({ x: igra.gruzovik.x + 60, polosa: 1, dlina: 30, cvet: 0 })
  igra.doSpavna = 1e9
  const sobytiya = []
  let zazor = null
  for (let i = 0; i < 60 * 2; i++) {
    const s = shag(igra, 1 / 60, 1, () => 0.5)
    if (s) sobytiya.push(s)
    if (s === 'poehali') zazor = blizhayshaya(igra, 1)
  }
  assert.deepEqual(sobytiya.slice(0, 2), ['tormoz', 'poehali'])
  assert.ok(zazor > 20, `после торможения машина впереди на ${zazor} px`)
  assert.equal(igra.proydeno > 0, true)
})

test('autopilot leaves a lane with a car close ahead and never cuts into a car alongside', () => {
  const igra = novayaIgra(440, 84)
  const x = igra.gruzovik.x
  igra.mashiny.push({ x: x + 80, polosa: 1, dlina: 30, cvet: 0 })
  assert.notEqual(avtopilot(igra), 1)
  igra.mashiny.push({ x, polosa: 0, dlina: 30, cvet: 0 }, { x, polosa: 2, dlina: 30, cvet: 0 })
  assert.equal(avtopilot(igra), 1)
  assert.equal(vplotnuyu(igra), false)
})

test('pointer height picks the lane', () => {
  assert.equal(polosaPoY(5, 84), 0)
  assert.equal(polosaPoY(42, 84), 1)
  assert.equal(polosaPoY(83, 84), 2)
  assert.equal(polosaPoY(-10, 84), 0)
  assert.equal(polosaPoY(200, 84), 2)
})
