import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detailRoute, isKnownPath, normativRedirect } from '../src/shared/seo/route-data.ts'
import { getMetadata } from '../src/shared/seo/metadata.ts'

test('адрес документа распознаётся, список — нет', () => {
  assert.deepEqual(detailRoute('/normativ/gost-4121-96'), { kind: 'normativ', slug: 'gost-4121-96' })
  assert.deepEqual(detailRoute('/normativ/gost-4121-96/'), { kind: 'normativ', slug: 'gost-4121-96' })
  assert.equal(detailRoute('/normativ'), null)
  assert.equal(detailRoute('/normativ/a/b'), null)
})
test('/normativ и документы — известные адреса', () => {
  assert.equal(isKnownPath('/normativ'), true)
  assert.equal(isKnownPath('/normativ/gost-4121-96'), true)
  assert.equal(isKnownPath('/normativ/a/b'), false)
})
test('normativRedirect: любой регистр — 301 на нижний, канонический адрес — null', () => {
  assert.equal(normativRedirect('/Normativ/GOST-4121-96'), '/normativ/gost-4121-96')
  assert.equal(normativRedirect('/NORMATIV'), '/normativ')
  assert.equal(normativRedirect('/normativ/Gost-4121-96'), '/normativ/gost-4121-96')
  assert.equal(normativRedirect('/Normativ/%47ost'), '/normativ/gost')
  assert.equal(normativRedirect('/normativ/gost-4121-96'), null)
  assert.equal(normativRedirect('/normativ'), null)
  assert.equal(normativRedirect('/stati/Relsy'), null)
  assert.equal(normativRedirect('/normativ-x'), null)
})

const site = 'https://catalog.example'
const base = { siteUrl: site, ssr: true }
const doc = {
  slug: 'gost-4121-96', code: 'ГОСТ 4121-96', title: 'ГОСТ 4121-96: рельсы крановые — что в документе',
  description: 'Коротко о ГОСТ 4121-96: профили КР, марки стали, допуски и маркировка крановых рельсов.', h1: 'ГОСТ 4121-96 «Рельсы крановые»',
  body: '<h1>x</h1><p>Введение</p>[[TOC]]<h2>Частые вопросы</h2><div class="faq"><h3>Какой профиль?</h3><p>КР-70.</p></div>',
  publishedAt: '2026-10-23T09:00:00.000Z', updatedAt: '2026-10-24T09:00:00.000Z', products: [], relatedProducts: [], services: [], replacedByDoc: null,
}

test('список /normativ: индексируется, canonical без параметров', () => {
  const meta = getMetadata('/normativ', { ...base, url: '/normativ', status: 200 })
  assert.match(meta.title, /^ГОСТы и нормативы.* \| ПроРельс$/)
  assert.ok(meta.title.length <= 70, `title ${meta.title.length}`)
  assert.ok(meta.description.length >= 120 && meta.description.length <= 170, `description ${meta.description.length}`)
  assert.equal(meta.canonical, site + '/normativ')
  assert.match(meta.robots, /^index/)
  assert.equal(meta.jsonLd[0]['@type'], 'CollectionPage')
})
test('список /normativ с ?q= ?razdel= ?tip= — noindex, canonical на /normativ', () => {
  for (const query of ['?q=4121', '?razdel=kranovye-relsy', '?tip=tu', '?q=a&razdel=b&tip=gost']) {
    const meta = getMetadata('/normativ' + query, { ...base, url: '/normativ' + query, status: 200 })
    assert.match(meta.robots, /^noindex/, query)
    assert.equal(meta.canonical, site + '/normativ', query)
  }
  assert.match(getMetadata('/normativ?utm_source=x', { ...base, url: '/normativ?utm_source=x', status: 200 }).robots, /^index/)
})
test('страница документа: Title с «ПроРельс», canonical, Article и FAQPage', () => {
  const meta = getMetadata('/normativ/gost-4121-96', { ...base, url: '/normativ/gost-4121-96', status: 200, normativ: doc })
  assert.equal(meta.title, 'ГОСТ 4121-96: рельсы крановые — что в документе | ПроРельс')
  assert.equal(meta.description, doc.description)
  assert.equal(meta.canonical, site + '/normativ/gost-4121-96')
  assert.match(meta.robots, /^index/)
  assert.deepEqual(meta.jsonLd.map((item) => item['@type']), ['Article', 'FAQPage'])
  assert.equal(meta.jsonLd[0].headline, doc.h1)
  assert.equal(meta.jsonLd[1].mainEntity[0].name, 'Какой профиль?')
})
test('страница документа: Title уже оканчивается на «ПроРельс» — без дубля', () => {
  const meta = getMetadata('/normativ/x', { ...base, url: '/normativ/x', status: 200, normativ: { ...doc, slug: 'x', title: 'ГОСТ 1 | ПроРельс' } })
  assert.equal(meta.title, 'ГОСТ 1 | ПроРельс')
})
test('нет документа — «Документ не найден», noindex; API недоступен — 503', () => {
  const missing = getMetadata('/normativ/net', { ...base, url: '/normativ/net', status: 404 })
  assert.equal(missing.title, 'Документ не найден | ПроРельс')
  assert.match(missing.robots, /^noindex/)
  const down = getMetadata('/normativ', { ...base, url: '/normativ', status: 503 })
  assert.equal(down.title, 'Страница временно недоступна | ПроРельс')
  assert.match(down.robots, /^noindex/)
})
