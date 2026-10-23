import { test } from 'node:test'
import assert from 'node:assert/strict'
import { documentFacts, documentViewer, isExternalHref, pagesLabel, sourceLabel, unlinkExternalLinks } from '../src/entities/normativ/lib/norm-document-view.ts'

const doc = (over) => ({ code: 'ГОСТ 4121-96', file: '/uploads/a.pdf', fileName: 'ГОСТ 4121-96.pdf', fileSize: 187641, pageCount: 9, previews: ['/uploads/p1.webp', '/uploads/p2.webp', '/uploads/p3.webp'], ...over })

test('число страниц по-русски', () => {
  assert.equal(pagesLabel(1), '1 страница')
  assert.equal(pagesLabel(3), '3 страницы')
  assert.equal(pagesLabel(9), '9 страниц')
  assert.equal(pagesLabel(11), '11 страниц')
  assert.equal(pagesLabel(12), '12 страниц')
  assert.equal(pagesLabel(21), '21 страница')
  assert.equal(pagesLabel(104), '104 страницы')
  assert.equal(pagesLabel(517), '517 страниц')
})

test('подпись «N страниц · PDF · M МБ»; без числа страниц — без него', () => {
  assert.equal(documentFacts({ pageCount: 9, fileSize: 187641 }), '9 страниц · PDF · 0,2 МБ')
  assert.equal(documentFacts({ pageCount: 128, fileSize: 1572864 }), '128 страниц · PDF · 1,5 МБ')
  assert.equal(documentFacts({ pageCount: null, fileSize: 1572864 }), 'PDF · 1,5 МБ')
  assert.equal(documentFacts({ pageCount: 2, fileSize: null }), '2 страницы · PDF')
})

test('блок «Документ»: лист первой страницы и не больше двух миниатюр', () => {
  const view = documentViewer(doc())
  assert.equal(view.mode, 'sheet')
  assert.equal(view.sheet, '/uploads/p1.webp')
  assert.deepEqual(view.thumbs, [{ src: '/uploads/p2.webp', page: 2, href: '/uploads/a.pdf#page=2' }, { src: '/uploads/p3.webp', page: 3, href: '/uploads/a.pdf#page=3' }])
  assert.equal(view.file, '/uploads/a.pdf')
  assert.equal(view.downloadName, 'ГОСТ 4121-96.pdf')
  assert.equal(view.facts, '9 страниц · PDF · 0,2 МБ')
  assert.equal(view.morePages, 6, 'ещё страниц после миниатюр')
})

test('блок «Документ»: файл без картинок — лист-заглушка; без файла — «Документ по запросу»', () => {
  const placeholder = documentViewer(doc({ previews: [], pageCount: null }))
  assert.equal(placeholder.mode, 'placeholder')
  assert.equal(placeholder.sheet, null)
  assert.deepEqual(placeholder.thumbs, [])
  assert.equal(placeholder.file, '/uploads/a.pdf')
  assert.equal(placeholder.facts, 'PDF · 0,2 МБ')
  assert.equal(documentViewer(doc({ previews: undefined })).mode, 'placeholder', 'старый ответ API без поля previews')
  assert.equal(documentViewer(doc({ file: null, fileName: null, fileSize: null })).mode, 'request')
  assert.equal(documentViewer(doc({ fileName: null })).downloadName, 'ГОСТ 4121-96.pdf', 'имя по номеру')
})

test('блок «Документ»: файл и картинки — только со своего сайта', () => {
  assert.equal(documentViewer(doc({ file: 'https://files.stroyinf.ru/a.pdf' })).mode, 'request', 'чужой адрес файла не выводится')
  const view = documentViewer(doc({ previews: ['https://evil.example/p1.webp', '/uploads/p2.webp'] }))
  assert.equal(view.sheet, '/uploads/p2.webp')
  assert.deepEqual(view.thumbs, [])
})

test('внешняя ссылка — любой другой домен, свои адреса и якоря — нет', () => {
  for (const href of ['https://protect.gost.ru/x', 'http://publication.pravo.gov.ru/a', '//example.org/x', 'HTTPS://Example.org', 'ftp://x.ru/a']) {
    assert.equal(isExternalHref(href), true, href)
  }
  for (const href of ['/stati/kranovye-relsy', '#razdel', 'https://prorelsa.ru/normativ', 'https://www.prorelsa.ru/', '/uploads/a.pdf', 'tel:+78002501287', 'mailto:zakaz@prorelsa.ru']) {
    assert.equal(isExternalHref(href), false, href)
  }
})

test('в выжимке внешние <a> становятся простым текстом, свои ссылки остаются', () => {
  const html = '<p>См. <a href="/stati/kranovye-relsy">статью</a> и <a href="https://protect.gost.ru/x" rel="noopener">Росстандарт, <b>ГОСТ</b></a>. А также <a class="x" href=\'//evil.example\'>там</a>, <a href=https://evil.example/y>тут</a> и <a href="https://prorelsa.ru/normativ">раздел</a>.</p>'
  assert.equal(
    unlinkExternalLinks(html),
    '<p>См. <a href="/stati/kranovye-relsy">статью</a> и <span>Росстандарт, <b>ГОСТ</b></span>. А также <span>там</span>, <span>тут</span> и <a href="https://prorelsa.ru/normativ">раздел</a>.</p>',
  )
  assert.equal(unlinkExternalLinks('<p>Без ссылок</p>'), '<p>Без ссылок</p>')
})

test('источник текста — без домена и адреса, даже если они записаны в sourceName', () => {
  assert.equal(sourceLabel('Росстандарт'), 'Росстандарт')
  assert.equal(sourceLabel('Росстандарт (protect.gost.ru)'), 'Росстандарт')
  assert.equal(sourceLabel('Официальный интернет-портал правовой информации (pravo.gov.ru)'), 'Официальный интернет-портал правовой информации')
  assert.equal(sourceLabel('ФГБУ «Институт стандартизации» (gostinfo.ru)'), 'ФГБУ «Институт стандартизации»')
  assert.equal(sourceLabel('files.stroyinf.ru'), '')
  assert.equal(sourceLabel('Росстандарт, https://protect.gost.ru/gost/details/1'), 'Росстандарт')
  assert.equal(sourceLabel('Минстрой России — www.minstroyrf.gov.ru'), 'Минстрой России')
  assert.equal(sourceLabel('ОАО «РЖД» (сайт rzd.ru, раздел документов)'), 'ОАО «РЖД»')
  assert.equal(sourceLabel('Росстандарт (издание 2019 г.)'), 'Росстандарт (издание 2019 г.)', 'скобки без адреса остаются')
  assert.equal(sourceLabel(null), '')
})
