// Листалка документа в шапке и окно чтения: номер листа, границы, подписи, какие картинки грузить, свайп.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { documentViewer } from '../src/entities/normativ/lib/norm-document-view.ts'
import { MORE_SHEET_TEXT, clampSheet, imagesToLoad, sheetAt, sheetCounter, sheetLabel, stepSheet, swipeStep } from '../src/entities/normativ/lib/page-flipper.ts'

const pages = (count) => Array.from({ length: count }, (_, i) => `/uploads/p${i + 1}.webp`)
const view = (count, pageCount = count) => documentViewer({ code: 'ГОСТ Р 58615-2019', file: '/uploads/a.pdf', fileName: null, fileSize: 1000, pageCount, previews: pages(count) })

test('номер листа держится в границах 1…листов', () => {
  assert.equal(clampSheet(0, 11), 1)
  assert.equal(clampSheet(-5, 11), 1)
  assert.equal(clampSheet(12, 11), 11)
  assert.equal(clampSheet(3, 11), 3)
  assert.equal(clampSheet(2.7, 11), 2)
  assert.equal(clampSheet(Number.NaN, 11), 1)
  assert.equal(clampSheet(5, 0), 1, 'листов нет — первый')
})

test('стрелки листают по одному листу и не уходят за первый и последний', () => {
  assert.equal(stepSheet(3, 1, 11), 4)
  assert.equal(stepSheet(3, -1, 11), 2)
  assert.equal(stepSheet(1, -1, 11), 1, 'на первом левая стрелка ничего не делает')
  assert.equal(stepSheet(11, 1, 11), 11, 'на последнем правая стрелка ничего не делает')
  assert.equal(stepSheet(1, 1, 1), 1)
})

test('лист — страница с картинкой или лист «Дальше — в PDF-файле»', () => {
  const v = view(3, 9)
  assert.deepEqual(sheetAt(v, 1), { kind: 'page', page: 1, src: '/uploads/p1.webp' })
  assert.deepEqual(sheetAt(v, 3), { kind: 'page', page: 3, src: '/uploads/p3.webp' })
  assert.deepEqual(sheetAt(v, 4), { kind: 'more', from: 4, to: 9 })
  assert.deepEqual(sheetAt(v, 99), { kind: 'more', from: 4, to: 9 }, 'за краем — последний лист')
  assert.deepEqual(sheetAt(view(11), 11), { kind: 'page', page: 11, src: '/uploads/p11.webp' })
  assert.match(MORE_SHEET_TEXT, /^Дальше — в PDF-файле: скачать его можно в карточке документа$/)
})

test('подпись под листом «Стр. N из M» и счётчик окна «N / M»', () => {
  const v = view(11)
  assert.equal(sheetLabel(v, 3), 'Стр. 3 из 11')
  assert.equal(sheetCounter(v, 3), '3 / 11')
  const long = view(100, 130)
  assert.equal(sheetLabel(long, 100), 'Стр. 100 из 130')
  assert.equal(sheetLabel(long, 101), 'Стр. 101–130 — в PDF-файле')
  assert.equal(sheetCounter(long, 101), '101–130 / 130')
  assert.equal(sheetLabel(view(3, 4), 4), 'Стр. 4 — в PDF-файле', 'одна оставшаяся страница — без диапазона')
})

test('картинки грузятся по мере листания: текущая и соседние, не все сразу', () => {
  const v = view(11)
  assert.deepEqual(imagesToLoad(v, 1), ['/uploads/p1.webp', '/uploads/p2.webp'])
  assert.deepEqual(imagesToLoad(v, 5), ['/uploads/p5.webp', '/uploads/p6.webp', '/uploads/p4.webp'])
  assert.deepEqual(imagesToLoad(v, 11), ['/uploads/p11.webp', '/uploads/p10.webp'])
  const long = view(100, 130)
  assert.deepEqual(imagesToLoad(long, 101), ['/uploads/p100.webp'], 'на листе «Дальше» — только предыдущая страница')
  assert.deepEqual(imagesToLoad(documentViewer({ code: 'X', file: '/uploads/a.pdf', fileName: null, fileSize: null, previews: [] }), 1), [])
})

test('свайп: влево — следующий лист, вправо — предыдущий; короткий или вертикальный — не листает', () => {
  assert.equal(swipeStep(-80, 5), 1)
  assert.equal(swipeStep(80, -10), -1)
  assert.equal(swipeStep(-20, 0), 0, 'короче порога')
  assert.equal(swipeStep(-60, 120), 0, 'больше вниз, чем вбок, — это прокрутка')
  assert.equal(swipeStep(-50, 0, 60), 0, 'свой порог')
})

// Полоса маленьких страниц в шапке (дополнение 24.10 (3))
import { clampStart, revealSheet, shiftStart, stripLabel, stripSheets, stripSize, tileLabel } from '../src/entities/normativ/lib/page-flipper.ts'

test('сколько страниц в ряд: 5 от 1280 px, иначе 3', () => {
  assert.equal(stripSize(1920), 5)
  assert.equal(stripSize(1280), 5)
  assert.equal(stripSize(1279), 3)
  assert.equal(stripSize(390), 3)
  assert.equal(stripSize(0), 3)
})

test('полоса сдвигается на одну страницу и не выходит за края', () => {
  assert.equal(shiftStart(1, 1, 11, 5), 2)
  assert.equal(shiftStart(1, -1, 11, 5), 1, 'слева упёрлись')
  assert.equal(shiftStart(7, 1, 11, 5), 7, 'в ряду 7–11 — дальше некуда')
  assert.equal(shiftStart(1, 1, 3, 5), 1, 'документ короче ряда не сдвигается')
  assert.equal(clampStart(20, 11, 3), 9)
  assert.equal(clampStart(0, 11, 3), 1)
  assert.equal(clampStart(Number.NaN, 11, 3), 1)
})

test('какие страницы видны: столько, сколько есть', () => {
  assert.deepEqual(stripSheets(1, 11, 5), [1, 2, 3, 4, 5])
  assert.deepEqual(stripSheets(9, 11, 3), [9, 10, 11])
  assert.deepEqual(stripSheets(1, 2, 5), [1, 2])
  assert.deepEqual(stripSheets(1, 0, 5), [])
})

test('выбранная страница всегда оказывается в полосе', () => {
  assert.equal(revealSheet(1, 4, 11, 5), 1, 'уже видна')
  assert.equal(revealSheet(1, 8, 11, 5), 4, 'справа — последней в ряду')
  assert.equal(revealSheet(6, 2, 11, 5), 2, 'слева — первой в ряду')
  assert.equal(revealSheet(1, 11, 11, 3), 9)
})

test('подпись полосы «Стр. 1–5 из 11»', () => {
  const v = view(11)
  assert.equal(stripLabel(v, 1, 5), 'Стр. 1–5 из 11')
  assert.equal(stripLabel(v, 7, 5), 'Стр. 7–11 из 11')
  assert.equal(stripLabel(view(2), 1, 5), 'Стр. 1–2 из 2')
  assert.equal(stripLabel(view(1), 1, 5), 'Стр. 1 из 1')
  assert.equal(stripLabel(view(100, 130), 99, 3), 'Стр. 99–130 из 130', 'лист «Дальше» в полосе — до конца PDF')
  assert.equal(tileLabel(v, 3), 'Стр. 3')
  assert.equal(tileLabel(view(3, 9), 4), 'Стр. 4–9')
})
