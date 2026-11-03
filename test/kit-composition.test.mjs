import { test } from 'node:test'
import assert from 'node:assert/strict'
import { kitForSku, kitMassKg } from '../src/shared/lib/kit-composition.ts'

test('состав есть только у комплектов КБ-65 на шпалу и на узел', () => {
  assert.ok(kitForSku('TM-0890'))
  assert.ok(kitForSku('TM-0756'))
  assert.equal(kitForSku('TM-0889'), undefined)
  assert.equal(kitForSku(undefined), undefined)
})

test('на шпалу — два узла: детали узла по табл. 20 альбома, удвоенные', () => {
  const sleeper = kitForSku('TM-0890')
  const node = kitForSku('TM-0756')
  assert.equal(sleeper.nodes, 2)
  assert.equal(node.nodes, 1)
  const perSleeper = Object.fromEntries(sleeper.parts.map((part) => [part.name, part.perNode * sleeper.nodes]))
  assert.deepEqual(perSleeper, {
    'Прокладка под подкладку ЦП-328': 2,
    'Подкладка КБ-65': 2,
    'Гайка М22': 8,
    'Болт клеммный М22×75': 4,
    'Шайба двухвитковая 25': 8,
    'Клемма ПК': 4,
    'Болт закладной М22×175': 4,
    'Скоба ЦП-138 для изолирующей втулки': 4,
    'Втулка изолирующая ЦП-142': 4,
    'Прокладка подрельсовая ЦП-143': 2,
  })
})

test('масса: узел около 12,3 кг, шпала около 24,6 кг', () => {
  assert.equal(kitMassKg(kitForSku('TM-0756')), 12.3)
  assert.equal(kitMassKg(kitForSku('TM-0890')), 24.6)
})

test('позиции 1–10 по порядку, ссылки — на карточки каталога и страницы нормативов', () => {
  const kit = kitForSku('TM-0890')
  assert.deepEqual(kit.parts.map((part) => part.pos), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  for (const part of kit.parts) {
    assert.match(part.product.sku, /^TM-\d{4}$/)
    assert.match(part.product.href, /^\/catalog\/[a-z0-9-]+(\/[a-z0-9-]+)?\/product\/[a-z0-9-]+$/)
    if (part.standard.slug) assert.match(part.standard.slug, /^[a-z0-9-]+$/)
  }
})
