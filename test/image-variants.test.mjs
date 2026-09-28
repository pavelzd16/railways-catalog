import { test } from 'node:test'
import assert from 'node:assert/strict'
import { IMAGE_VARIANT_WIDTHS, uploadVariantSrcSet } from '../src/shared/lib/image-variants.ts'

test('для картинки из /uploads строится набор WebP-копий всех ширин', () => {
  const srcset = uploadVariantSrcSet('/uploads/419d0972-4b6b-4072-bb02-3e57e7e48fe2.jpg')
  assert.equal(
    srcset,
    IMAGE_VARIANT_WIDTHS.map((w) => `/uploads/w/${w}/419d0972-4b6b-4072-bb02-3e57e7e48fe2.jpg.webp ${w}w`).join(', '),
  )
})

test('адрес с доменом сохраняет домен', () => {
  const srcset = uploadVariantSrcSet('https://traer.ru/uploads/a.png')
  assert.match(srcset, /^https:\/\/traer\.ru\/uploads\/w\/160\/a\.png\.webp 160w, /)
  assert.match(srcset, /https:\/\/traer\.ru\/uploads\/w\/1280\/a\.png\.webp 1280w$/)
})

test('ширины совпадают со списком API', () => {
  assert.deepEqual([...IMAGE_VARIANT_WIDTHS], [160, 320, 480, 640, 960, 1280])
})

test('для чужих адресов, файлов не-картинок и пустой строки копий нет', () => {
  assert.equal(uploadVariantSrcSet(''), undefined)
  assert.equal(uploadVariantSrcSet('/logo.png'), undefined)
  assert.equal(uploadVariantSrcSet('/uploads/spec.pdf'), undefined)
  assert.equal(uploadVariantSrcSet('/uploads/sub/a.jpg'), undefined)
  assert.equal(uploadVariantSrcSet('https://example.com/pic.jpg'), undefined)
})
