import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { kitForSku, kitMassKg, ZHBR65_ALBUM_1995 } from '../src/shared/lib/kit-composition.ts'

test('состав четырёх известных комплектов; ЖБР-65 альбома 1995 не подключён к карточке современного ЖБР-65', () => {
  for (const sku of ['TM-0890', 'TM-0756', 'TM-0889', 'TM-0757']) assert.ok(kitForSku(sku))
  for (const sku of ['TM-0230', 'TM-0758', 'TM-0759', 'TM-0760', 'unknown', '', undefined, null]) assert.equal(kitForSku(sku), undefined)
})

test('КБ-50: таблица 21 ×2, на шпалу клеммы ПК, СК — только у стыка, без альтернативной шайбы и втулки', () => {
  const kit = kitForSku('TM-0889')
  assert.equal(kit.nodes, 2)
  assert.deepEqual(kit.parts.map(p => p.perNode * kit.nodes), [4, 8, 0, 4, 8, 4, 4, 2, 2, 2, 4, 0])
  assert.deepEqual(kit.parts.slice(0, 11).map(p => p.massKg), [.345, .126, .58, .635, .12, .09, .04, .6, 6.95, .165, .62])
  assert.equal(kitMassKg(kit), 24.3)
  assert.equal(kit.parts[11].product.sku, 'TM-0020')
  assert.equal(kit.parts[7].product, undefined, 'прокладка КБ-65 не подменяет прокладку КБ-50')
  assert.equal(kit.parts[9].product, undefined, 'прокладка Р65 не подменяет Р50')
})

test('ЖБР-65: таблица 27 на один узел, без подмены деталей более поздними исполнениями', () => {
  const kit = ZHBR65_ALBUM_1995
  assert.equal(kit.nodes, 1)
  assert.deepEqual(kit.parts.map(p => p.perNode), [2, 2, 2, 2, 1, 2, 2, 2, 0])
  assert.deepEqual(kit.parts.slice(0, 8).map(p => p.massKg), [.08, .73, .126, .635, .52, .055, .02, .82])
  assert.equal(kitMassKg(kit), 5.5)
  for (const i of [0, 1, 4, 5, 6, 7]) assert.equal(kit.parts[i].product, undefined)
})

test('АРС: анкер в шпале не входит, монорегулятор (позиции 2 и 3) одной строкой', () => {
  const kit = kitForSku('TM-0757')
  assert.equal(kit.nodes, 1)
  assert.deepEqual(kit.parts.map(p => p.pos), [1, 2, 4, 5, 6, 7, 8])
  assert.deepEqual(kit.parts.map(p => p.perNode), [2, 2, 2, 0, 2, 1, 0])
  assert.deepEqual(kit.parts.map(p => p.massKg), [.825, .35, .218, null, .032, .52, null])
  assert.equal(kitMassKg(kit), 3.4)
  assert.equal(kit.parts[1].label, '2, 3')
  assert.equal(kit.parts[1].product.sku, 'TM-0049')
  assert.equal(kit.parts[3].massLabel, '4,1–4,7')
  assert.deepEqual(kit.figures[0].callouts.filter(c => c.part === 2).map(c => c.n), [3])
  assert.equal(kit.figures.length, 1)
})

test('неизвестная масса включённой детали скрывает итог; исключённый рельс не влияет', () => {
  const kit = kitForSku('TM-0756')
  assert.equal(kitMassKg({ ...kit, parts: [{ pos: 1, name: 'деталь', perNode: 2, massKg: 1.25 }, { pos: 2, name: 'рельс', perNode: 0, massKg: null }] }), 2.5)
  assert.equal(kitMassKg({ ...kit, parts: [{ pos: 1, name: 'деталь', perNode: 1, massKg: null }] }), null)
})

test('позиции, координаты и адреса всех комплектов согласованы', () => {
  for (const kit of [...['TM-0890', 'TM-0756', 'TM-0889', 'TM-0757'].map(kitForSku), ZHBR65_ALBUM_1995]) {
    const order = kit.parts.map(p => p.pos)
    assert.deepEqual(order, [...order].sort((a, b) => a - b))
    assert.equal(new Set(order).size, order.length)
    assert.equal(kit.parts.at(-1).perNode, 0)
    for (const p of kit.parts) {
      if (p.product) {
        assert.match(p.product.sku, /^TM-\d{4}$/)
        assert.match(p.product.href, /^\/catalog\/[a-z0-9-]+\/[a-z0-9-]+\/product\/[a-z0-9-]+$/)
      }
      if (p.standard?.slug) assert.match(p.standard.slug, /^[a-z0-9-]+$/)
    }
    for (const [i, f] of kit.figures.entries()) {
      assert.match(f.src, /^\/schemes\/[a-z0-9-]+\.svg$/)
      assert.ok(f.w > 0 && f.h > 0 && f.alt && f.caption)
      if (i > 0) assert.equal(f.callouts, undefined)
      const positions = (f.callouts ?? []).map(c => c.n)
      assert.equal(new Set(positions).size, positions.length)
      for (const c of f.callouts ?? []) {
        assert.ok(kit.parts.some(p => p.pos === (c.part ?? c.n)))
        assert.ok(c.x > 0 && c.x < f.w && c.y > 0 && c.y < f.h)
      }
    }
  }
})

test('чертежи комплектов автономны, векторны и соответствуют размерам данных', () => {
  const checked = new Set()
  for (const kit of [...['TM-0890', 'TM-0756', 'TM-0889', 'TM-0757'].map(kitForSku), ZHBR65_ALBUM_1995]) {
    for (const figure of kit.figures) {
      if (checked.has(figure.src)) continue
      checked.add(figure.src)
      const svg = readFileSync(new URL(`../public${figure.src}`, import.meta.url), 'utf8')
      assert.ok(Buffer.byteLength(svg) < 150 * 1024)
      assert.ok(svg.includes(`viewBox="0 0 ${figure.w} ${figure.h}"`))
      assert.doesNotMatch(svg, /<(?:\w+:)?(?:image|text|script|foreignObject)\b|@font-face|(?:href|src)="(?:https?:|data:)/i)
      const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
      assert.equal(ids.length, new Set(ids).size)
      for (const id of ids) assert.match(id, /^(?:kb65|kb50|zhbr|ars4)[a-z0-9]*-/)
      const webp = readFileSync(new URL(`../public${figure.src.replace(/\.svg$/, '.webp')}`, import.meta.url))
      assert.equal(webp.toString('ascii', 0, 4), 'RIFF')
      assert.equal(webp.toString('ascii', 8, 12), 'WEBP')
    }
  }
})

test('на шпалу — два узла: детали узла по табл. 20 альбома, удвоенные', () => {
  const sleeper = kitForSku('TM-0890')
  const node = kitForSku('TM-0756')
  assert.equal(sleeper.nodes, 2)
  assert.equal(node.nodes, 1)
  const perSleeper = Object.fromEntries(sleeper.parts.filter((part) => part.perNode).map((part) => [part.name, part.perNode * sleeper.nodes]))
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

test('рельс Р65 — позиция 11 со ссылкой, в комплект и его массу не входит', () => {
  const rail = kitForSku('TM-0890').parts.find((part) => part.pos === 11)
  assert.equal(rail.name, 'Рельс Р65')
  assert.equal(rail.perNode, 0)
  assert.equal(rail.product.sku, 'TM-0039')
  assert.equal(rail.standard.slug, 'gost-r-51685-2022')
})

test('позиции 1–11 по порядку, ссылки — на карточки каталога и страницы нормативов', () => {
  const kit = kitForSku('TM-0890')
  assert.deepEqual(kit.parts.map((part) => part.pos), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  for (const part of kit.parts) {
    assert.match(part.product.sku, /^TM-\d{4}$/)
    assert.match(part.product.href, /^\/catalog\/[a-z0-9-]+(\/[a-z0-9-]+)?\/product\/[a-z0-9-]+$/)
    if (part.standard.slug) assert.match(part.standard.slug, /^[a-z0-9-]+$/)
  }
})
