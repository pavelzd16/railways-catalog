import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FIT_FRAME,
  clampFrame,
  coverZoom,
  finalImageOrder,
  frameLayout,
  isOriginalFrame,
  moveItem,
  retainedImages,
} from '../src/features/admin-products/imageFrame.ts'

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`)

test('vertical photo «целиком» stands in the middle of the 4:3 frame with white sides', () => {
  // Накладка Р-18: снимок 591×1280 — сайт сейчас обрезает его в 4,7 раза по высоте.
  const layout = frameLayout(591, 1280, FIT_FRAME)
  close(layout.height, 1)
  close(layout.top, 0)
  assert.ok(layout.width < 0.4)
  close(layout.left, (1 - layout.width) / 2)
  close(coverZoom(591, 1280), 1 / layout.width)
})

test('4:3 photo fills the frame at 100 % and goes up unchanged', () => {
  const layout = frameLayout(1600, 1200, FIT_FRAME)
  close(layout.width, 1)
  close(layout.height, 1)
  assert.equal(isOriginalFrame(1600, 1200, FIT_FRAME), true)
  assert.equal(isOriginalFrame(1600, 1200, { zoom: 1.2, x: 0, y: 0 }), false)
  assert.equal(isOriginalFrame(591, 1280, FIT_FRAME), false)
})

test('frame cannot be dragged off the picture or zoomed past the limits', () => {
  const big = clampFrame(1600, 1200, { zoom: 2, x: 5, y: -5 })
  assert.deepEqual(big, { zoom: 2, x: 0.5, y: -0.5 })
  const small = clampFrame(591, 1280, { zoom: 1, x: 1, y: 1 })
  close(small.y, 0)
  assert.ok(small.x > 0 && small.x < 0.5)
  assert.equal(clampFrame(1600, 1200, { zoom: 100, x: 0, y: 0 }).zoom, 4)
  assert.equal(clampFrame(1600, 1200, { zoom: 0.01, x: 0, y: 0 }).zoom, 0.5)
})

test('moveItem reorders and ignores moves past the ends', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c'])
  const same = ['a', 'b']
  assert.equal(moveItem(same, 0, 2), same)
  assert.equal(moveItem(same, -1, 0), same)
})

test('new and reframed photos are uploaded, the rest is kept in form order', () => {
  const file = { name: 'new.jpg' }
  const images = [
    { id: '1', file },
    { id: '2', url: '/uploads/b.jpg' },
    { id: '3', url: '/uploads/a.jpg', frame: FIT_FRAME },
    { id: '4', url: '/uploads/c.jpg' },
  ]
  assert.deepEqual(retainedImages(images), ['/uploads/b.jpg', '/uploads/c.jpg'])
  // Сервер отвечает: сначала оставленные, потом новые файлы в порядке отправки.
  const saved = ['/uploads/b.jpg', '/uploads/c.jpg', '/uploads/n1.jpg', '/uploads/n2.jpg']
  assert.deepEqual(finalImageOrder(images, saved, 2), [
    '/uploads/n1.jpg',
    '/uploads/b.jpg',
    '/uploads/n2.jpg',
    '/uploads/c.jpg',
  ])
})
