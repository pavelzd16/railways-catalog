import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterNorms, sectionsWithDocs, kindGroupsWithDocs } from '../src/entities/normativ/lib/norm-filter.ts'
import { formatIntroducedAt, formatFileSize, kindLabel, statusLabel, kindGroupOf, safeHttpUrl } from '../src/entities/normativ/lib/norm-labels.ts'

const item = (over) => ({ slug: 'x', code: 'X', name: 'Y', kind: 'gost', status: 'active', replacedBy: null, introducedAt: null, scope: '', sections: [], hasFile: true, updatedAt: '2026-10-23T00:00:00Z', ...over })
const items = [
  item({ slug: 'gost-4121-96', code: 'ГОСТ 4121-96', name: 'Рельсы крановые. Технические условия', kind: 'gost', sections: ['kranovye-relsy'] }),
  item({ slug: 'gost-r-53866-2010', code: 'ГОСТ Р 53866-2010', name: 'Рельсы железнодорожные узкой колеи', kind: 'gost-r', sections: ['zheleznodorozhnye-relsy'] }),
  item({ slug: 'tu-14-2r-383-2004', code: 'ТУ 14-2Р-383-2004', name: 'Рельсы Р33', kind: 'tu', status: 'replaced', sections: ['zheleznodorozhnye-relsy', 'kranovye-relsy'] }),
  item({ slug: 'prikaz-461', code: 'Приказ Ростехнадзора № 461', name: 'Правила безопасности опасных производственных объектов', kind: 'order', sections: ['kranovye-relsy'] }),
]
const slugs = (list) => list.map((entry) => entry.slug)

test('поиск: «4121», «ГОСТ 4121-96» и «крановые» находят ГОСТ 4121-96', () => {
  for (const q of ['4121', 'ГОСТ 4121-96', 'гост 4121', 'крановые', 'КРАНОВЫЕ рельсы']) {
    assert.deepEqual(slugs(filterNorms(items, { q })), ['gost-4121-96'], q)
  }
})
test('поиск: латинская Р в номере находит русский номер', () => {
  assert.deepEqual(slugs(filterNorms(items, { q: 'ТУ 14-2P-383' })), ['tu-14-2r-383-2004'])
})
test('пустой запрос и ничего не найдено', () => {
  assert.equal(filterNorms(items, { q: '  ' }).length, 4)
  assert.deepEqual(filterNorms(items, { q: 'шпалы бетонные' }), [])
})
test('фильтры по разделу и типу сочетаются с поиском', () => {
  assert.deepEqual(slugs(filterNorms(items, { section: 'kranovye-relsy' })), ['gost-4121-96', 'tu-14-2r-383-2004', 'prikaz-461'])
  assert.deepEqual(slugs(filterNorms(items, { section: 'kranovye-relsy', kind: 'tu' })), ['tu-14-2r-383-2004'])
  assert.deepEqual(slugs(filterNorms(items, { section: 'kranovye-relsy', q: 'рельсы' })), ['gost-4121-96', 'tu-14-2r-383-2004'])
  assert.deepEqual(slugs(filterNorms(items, { kind: 'law' })), ['prikaz-461'], 'группа «законы и приказы» включает приказы')
})
test('чипы: только разделы и типы, где есть документы', () => {
  assert.deepEqual(sectionsWithDocs(items), ['kranovye-relsy', 'zheleznodorozhnye-relsy'])
  assert.deepEqual(kindGroupsWithDocs(items), ['gost', 'gost-r', 'tu', 'law'])
})
test('подписи по-русски', () => {
  assert.equal(kindLabel('gost-r'), 'ГОСТ Р')
  assert.equal(kindLabel('rzd'), 'Документ РЖД')
  assert.equal(statusLabel('active'), 'Действует')
  assert.equal(statusLabel('replaced'), 'Заменён')
  assert.equal(kindGroupOf('order'), 'law')
  assert.equal(kindGroupOf('series'), 'album')
})
test('дата введения без часового пояса и размер файла', () => {
  assert.equal(formatIntroducedAt('2011-01-01'), '1 января 2011 г.')
  assert.equal(formatIntroducedAt('1996-12-31'), '31 декабря 1996 г.')
  assert.equal(formatIntroducedAt(null), '')
  assert.equal(formatIntroducedAt('не дата'), '')
  assert.equal(formatFileSize(1572864), '1,5 МБ')
  assert.equal(formatFileSize(10 * 1024 * 1024), '10 МБ')
  assert.equal(formatFileSize(200 * 1024), '0,2 МБ')
  assert.equal(formatFileSize(null), '')
})
test('ссылка на источник: только http и https', () => {
  assert.equal(safeHttpUrl('https://protect.gost.ru/document.aspx?control=7&id=1'), 'https://protect.gost.ru/document.aspx?control=7&id=1')
  assert.equal(safeHttpUrl('javascript:alert(1)'), null)
  assert.equal(safeHttpUrl('data:text/html,x'), null)
  assert.equal(safeHttpUrl('не адрес'), null)
  assert.equal(safeHttpUrl(null), null)
})
