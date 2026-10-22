import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detailRoute, isKnownPath, articlesPage } from '../src/shared/seo/route-data.ts'

test('адрес статьи распознаётся, список статей — нет', () => {
  assert.deepEqual(detailRoute('/stati/relsy-r65'), { kind: 'article', slug: 'relsy-r65' })
  assert.deepEqual(detailRoute('/stati/relsy-r65/'), { kind: 'article', slug: 'relsy-r65' })
  assert.equal(detailRoute('/stati'), null)
  assert.equal(detailRoute('/stati/a/b'), null)
})
test('/stati и статьи — известные адреса', () => {
  assert.equal(isKnownPath('/stati'), true)
  assert.equal(isKnownPath('/stati/relsy-r65'), true)
  assert.equal(isKnownPath('/stati/a/b'), false)
})
test('articlesPage: целое от 1, мусор — первая страница', () => {
  assert.equal(articlesPage(new URLSearchParams('page=abc')), 1)
  assert.equal(articlesPage(new URLSearchParams('page=3')), 3)
  assert.equal(articlesPage(new URLSearchParams('page=-2')), 1)
  assert.equal(articlesPage(new URLSearchParams('page=0')), 1)
  assert.equal(articlesPage(new URLSearchParams('page=2.5')), 1)
  assert.equal(articlesPage(new URLSearchParams('')), 1)
})
