import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plainText, formatSpec, jsonForHtml, paragraphs } from '../src/shared/lib/plain-text.ts'
import { getMetadata } from '../src/shared/seo/metadata.ts'
import { detailRoute, productPath, rendersOnServer } from '../src/shared/seo/route-data.ts'
import { siteOrigin, hostRedirect, publicRequestUrl } from '../src/renderer/site-origin.ts'
import { apiOriginList, fetchFromApi } from '../src/renderer/api-fetch.ts'

test('legacy HTML units become safe readable text without changing units', () => {
  assert.equal(formatSpec('0,25', 'м<sup>3</sup>'), '0,25 м³')
  assert.equal(plainText('м&lt;sup&gt;2&lt;/sup&gt; &amp; &nbsp;'), 'м² &')
  assert.equal(plainText('<script>alert(1)</script><b>15</b>&nbsp;мм'), '15 мм')
  assert.equal(plainText('x < 5'), 'x < 5')
  assert.equal(plainText('&#99999999;'), '')
})
test('JSON serialization cannot terminate the containing script', () => {
  const value = { description: '</script><script>alert(1)</script>\u2028&' }
  const json = jsonForHtml(value)
  assert.ok(!json.includes('<') && !json.includes('&'))
  assert.deepEqual(JSON.parse(json), value)
})
test('product metadata is unique, self canonical and uses the configured domain', () => {
  const product = { slug: 'bolt', title: 'Болт М22', gost: 'ГОСТ 16017', images: [], categorySlug: 'fasteners', description: 'Закладной болт' }
  const url = productPath(product)
  const data = { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product }
  const meta = getMetadata(url + '?utm_source=test', data)
  assert.equal(meta.canonical, 'https://catalog.example/catalog/fasteners/product/bolt')
  assert.match(meta.title, /Болт М22/)
  assert.match(meta.description, /Закладной болт/)
  assert.deepEqual(detailRoute(url), { kind: 'product', slug: 'bolt' })
})
test('public navigation clears noindex and stale service metadata', () => {
  const data = { url: '/', siteUrl: 'https://catalog.example', status: 200, ssr: false }
  assert.match(getMetadata('/cart', data).robots, /noindex/)
  assert.match(getMetadata('/about', data).robots, /^index/)
  assert.notEqual(getMetadata('/about', data).title, getMetadata('/contacts', data).title)
  assert.deepEqual(getMetadata('/about', data).jsonLd, [])
})

test('product search text only overrides the search description, without truncation', () => {
  const searchText = 'Поставка крепежа М22 для железнодорожного пути. '.repeat(5).trim()
  const product = { slug: 'bolt', title: 'Болт М22', gost: 'ГОСТ 16017', images: [], categorySlug: 'fasteners', description: 'Описание на странице', descriptionTags: searchText }
  const url = productPath(product)
  const data = { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product }
  const meta = getMetadata(url, data)
  assert.equal(meta.description, searchText)
  assert.match(meta.socialDescription, /Описание на странице/)
  assert.ok(!meta.socialDescription.includes('Поставка крепежа'))
  assert.ok(!JSON.stringify(meta.jsonLd).includes('Поставка крепежа'))
  assert.equal(product.description, 'Описание на странице')
  assert.ok(!getMetadata('/about', { ...data, url: '/about' }).description.includes('Поставка крепежа'))
})

test('empty search text falls back to generated metadata and markup becomes plain text', () => {
  const product = { slug: 'bolt', title: 'Болт М22', images: [], categorySlug: 'fasteners', description: 'Описание товара' }
  const url = productPath(product)
  const data = { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product }
  for (const descriptionTags of [undefined, null, '', '  \n ', '<b></b>']) {
    const meta = getMetadata(url, { ...data, product: { ...product, descriptionTags } })
    assert.equal(meta.description, meta.socialDescription)
    assert.match(meta.description, /Описание товара/)
  }
  const meta = getMetadata(url, { ...data, product: { ...product, descriptionTags: '<b>М22</b> &quot;ГОСТ&quot; &amp; доставка<script>alert(1)</script>' } })
  assert.equal(meta.description, 'М22 "ГОСТ" & доставка')
})
test('category pagination has its own canonical; filter variants remain out of the index', () => {
  const data = { url: '/catalog', siteUrl: 'https://catalog.example', status: 200, ssr: false, categories: [{ slug: 'rails', name: 'Рельсы', description: 'Железнодорожные рельсы разных профилей', subcategories: [] }] }
  const meta = getMetadata('/catalog?category=rails&page=2', data)
  assert.equal(meta.canonical, 'https://catalog.example/catalog?category=rails&page=2')
  assert.match(meta.title, /страница 2/)
  assert.match(getMetadata('/catalog?search=rails', data).robots, /noindex/)
})
test('product descriptions keep their paragraphs', () => {
  assert.deepEqual(paragraphs('Первый абзац.\r\n\r\nВторой абзац.\n\n\nТретий'), ['Первый абзац.', 'Второй абзац.', 'Третий'])
  assert.deepEqual(paragraphs('Одна строка\nс переносом'), ['Одна строка с переносом'])
  assert.deepEqual(paragraphs('  \n\n  '), [])
  assert.deepEqual(paragraphs(null), [])
  assert.deepEqual(paragraphs('<b>15</b>&nbsp;мм\n\nдалее'), ['15 мм', 'далее'])
})

test('the retired tatrels.ru origin becomes traer.ru in canonical and social links', () => {
  for (const old of ['https://tatrels.ru', 'https://tatrels.ru/', 'http://tatrels.ru', 'https://www.tatrels.ru', 'https://www.traer.ru']) {
    assert.equal(siteOrigin(old), 'https://traer.ru')
  }
  assert.equal(siteOrigin('https://traer.ru'), 'https://traer.ru')
  assert.equal(siteOrigin('http://localhost:3000'), 'http://localhost:3000')
  assert.throws(() => siteOrigin('https://tatrels.ru/catalog'), /must be an HTTP\(S\) origin/)
  assert.throws(() => siteOrigin(undefined), /SITE_URL is required/)

  const service = { slug: 'rezka-rels', title: 'Резка рельсов', description: 'Режем рельсы.', image: '/uploads/rezka.jpg' }
  const url = '/services/rezka-rels'
  const meta = getMetadata(url, { url, siteUrl: siteOrigin('https://tatrels.ru'), status: 200, ssr: true, service })
  assert.equal(meta.canonical, 'https://traer.ru/services/rezka-rels')
  assert.equal(meta.image, 'https://traer.ru/uploads/rezka.jpg')
  assert.ok(!JSON.stringify(meta).includes('tatrels.ru/'))

  const home = getMetadata('/', { url: '/', siteUrl: siteOrigin('https://tatrels.ru'), status: 200, ssr: true })
  const organization = home.jsonLd.find((item) => item['@type'] === 'Organization')
  assert.equal(organization.url, 'https://traer.ru')
  assert.equal(organization.email, 'zakaz@traer.ru')
  assert.ok(!JSON.stringify(home).includes('tatrels'))
})

test('SSR falls back to the public API origin when the configured one fails', async () => {
  assert.deepEqual(apiOriginList('http://api:3001', 'https://traer.ru', 'https://traer.ru'), ['http://api:3001', 'https://traer.ru'])
  const calls = []
  const fakeFetch = (responses) => async (url) => {
    calls.push(url)
    const next = responses.shift()
    if (next instanceof Error) throw next
    return new Response('{}', { status: next })
  }
  const origins = ['http://dead', 'https://traer.ru']

  const recovered = await fetchFromApi(origins, '/api/product/bolt', 1000, fakeFetch([new Error('ECONNREFUSED'), 200]))
  assert.equal(recovered.status, 200)
  assert.deepEqual(calls, ['http://dead/api/product/bolt', 'https://traer.ru/api/product/bolt'])

  calls.length = 0
  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([502, 200]))).status, 200)
  assert.equal(calls.length, 2)

  calls.length = 0
  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([404]))).status, 404)
  assert.equal(calls.length, 1, 'a real 404 must not be retried')

  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([500, 503]))).status, 503)
  await assert.rejects(fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([new Error('a'), new Error('b')])), /b/)
})

test('product snippet does not repeat the title when the description starts with it', () => {
  const meta = (product) => getMetadata(productPath(product), { url: productPath(product), siteUrl: 'https://traer.ru', status: 200, ssr: true, product }).socialDescription
  const base = { slug: 'znak', images: [], categorySlug: 'znaki', title: 'Берегись поезда', gost: '' }
  const repeated = meta({ ...base, description: 'Берегись поезда — предупреждающий знак для пешеходов у путей.' })
  assert.ok(repeated.startsWith('Берегись поезда — предупреждающий знак'), repeated)
  assert.equal(repeated.match(/Берегись поезда/g).length, 1)

  const withGost = meta({ ...base, gost: 'ГОСТ 12.4.026', description: 'берегись поезда — знак.' })
  assert.ok(withGost.startsWith('ГОСТ 12.4.026. берегись поезда — знак.'), withGost)

  const distinct = meta({ ...base, description: 'Предупреждающий знак для пешеходов.' })
  assert.ok(distinct.startsWith('Берегись поезда. Предупреждающий знак'), distinct)
})
test('public pages are rendered on the server; cart and admin stay in the browser', () => {
  for (const path of ['/', '/catalog', '/services', '/about', '/contacts', '/delivery', '/price', '/privacy', '/catalog/rails/product/r65', '/services/rezka', '/missing']) assert.equal(rendersOnServer(path), true, path)
  for (const path of ['/cart', '/admin', '/admin/login', '/admin/products']) assert.equal(rendersOnServer(path), false, path)
  assert.equal(rendersOnServer('/administration'), true)
})
test('product page carries Product markup without an offer until a price is set', () => {
  const product = { sku: 'TM-0033', slug: 'bolt', title: 'Болт закладной М22х175', gost: 'ГОСТ 16017-79', condition: 'new', price: null, stock: 0, images: ['/uploads/bolt.jpg'], categorySlug: 'zhd-krepezh', subcategorySlug: 'bolty', category: { name: 'ЖД крепеж' }, subcategory: { name: 'Болты' }, description: 'Закладной болт крепит подкладку к шпале.', specs: [{ label: 'ГОСТ', value: '16017-79.' }, { label: 'Масса', value: '0,65', unit: 'кг' }, { label: 'Пусто', value: '' }] }
  const url = productPath(product)
  const markup = (value) => getMetadata(url, { url, siteUrl: 'https://traer.ru', status: 200, ssr: true, product: value }).jsonLd.find((item) => item['@type'] === 'Product')
  const item = markup(product)
  assert.equal(item.name, 'Болт закладной М22х175')
  assert.equal(item.sku, 'TM-0033')
  assert.equal(item.url, 'https://traer.ru/catalog/zhd-krepezh/bolty/product/bolt')
  assert.deepEqual(item.image, ['https://traer.ru/uploads/bolt.jpg'])
  assert.equal(item.category, 'ЖД крепеж / Болты')
  assert.equal(item.itemCondition, 'https://schema.org/NewCondition')
  assert.deepEqual(item.additionalProperty.map((property) => [property.name, property.value, property.unitText]), [['ГОСТ', 'ГОСТ 16017-79', undefined], ['Масса', '0,65', 'кг']])
  assert.equal(item.offers, undefined)
  assert.equal(getMetadata(url, { url, siteUrl: 'https://traer.ru', status: 200, ssr: true, product }).jsonLd.filter((entry) => entry['@type'] === 'BreadcrumbList').length, 0, 'breadcrumbs are already microdata in the page')

  const priced = markup({ ...product, price: 1250, stock: 40, images: [] })
  assert.deepEqual(priced.offers, { '@type': 'Offer', price: 1250, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', url: item.url, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'ООО «ИНВИА»' } })
  assert.equal(priced.image, undefined)
  assert.equal(markup({ ...product, price: 900, stock: 0 }).offers.availability, 'https://schema.org/BackOrder')
})
test('www and the retired domain redirect to the same page on traer.ru; the main host keeps https in redirects', () => {
  const site = 'https://traer.ru'
  assert.equal(hostRedirect('http://www.traer.ru/catalog?category=rails&page=2', 'GET', site), 'https://traer.ru/catalog?category=rails&page=2')
  assert.equal(hostRedirect('http://tatrels.ru/catalog/zhd/product/bolt', 'HEAD', site), 'https://traer.ru/catalog/zhd/product/bolt')
  assert.equal(hostRedirect('http://www.tatrels.ru/', 'GET', site), 'https://traer.ru/')
  assert.equal(hostRedirect('http://traer.ru/catalog', 'GET', site), null)
  assert.equal(hostRedirect('http://www.traer.ru/api/request', 'POST', site), null, 'form posts are never redirected')
  assert.equal(hostRedirect('http://app:3000/catalog', 'GET', site), null, 'internal requests pass through')
  assert.equal(hostRedirect('http://tatrels.ru/', 'GET', 'http://localhost:3000'), null, 'old domain maps only to the real site')
  assert.equal(hostRedirect('http://www.localhost:3000/', 'GET', 'http://localhost:3000'), 'http://localhost:3000/')

  assert.equal(publicRequestUrl('http://traer.ru/catalog/?page=2', site), 'https://traer.ru/catalog/?page=2')
  assert.equal(publicRequestUrl('http://127.0.0.1:3011/catalog/', site), 'http://127.0.0.1:3011/catalog/')
  assert.equal(publicRequestUrl('http://localhost:3000/x', 'http://localhost:3000'), 'http://localhost:3000/x')
})

test('moved product slugs lead straight to a current slug', async () => {
  const { PRODUCT_SLUG_MOVES, movedProductSlug } = await import('../src/shared/seo/product-slug-moves.ts')
  const olds = Object.keys(PRODUCT_SLUG_MOVES)
  const news = Object.values(PRODUCT_SLUG_MOVES)
  assert.equal(new Set(news).size, news.length)
  for (const slug of news) assert.equal(movedProductSlug(slug), undefined)
  assert.ok(olds.every((slug) => /^[a-z0-9-]+$/.test(slug)) && news.every((slug) => /^[a-z0-9-]+$/.test(slug)))
  assert.equal(movedProductSlug('bashmak-kolesosbrasyvayushchij-ksb-r'), 'bashmak-kolesosbrasyvayushchij-ksb-r-tm0376')
  assert.equal(movedProductSlug('__proto__'), undefined)
  assert.equal(movedProductSlug('bolt'), undefined)
})
