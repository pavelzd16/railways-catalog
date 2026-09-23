import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ADMIN_PRODUCTS_PER_PAGE,
  adminProductsQuery,
} from '../src/features/admin-products/adminProductsQuery.ts'

test('admin search goes to the server, not to the loaded page', () => {
  const query = adminProductsQuery({ search: 'петуш' }, 1)
  assert.equal(query.search, 'петуш')
  assert.equal(query.page, 1)
  assert.equal(query.limit, ADMIN_PRODUCTS_PER_PAGE)
})

test('category and subcategory are sent as filters too', () => {
  const query = adminProductsQuery(
    { search: '  ЗД-17  ', category: 'skrepleniya', subcategory: 'prizhimy' },
    3,
  )
  assert.equal(query.search, 'ЗД-17')
  assert.equal(query.category, 'skrepleniya')
  assert.equal(query.subcategory, 'prizhimy')
  assert.equal(query.page, 3)
})

test('empty filters are left out of the request', () => {
  const query = adminProductsQuery({ search: '   ', category: '', subcategory: '' }, 1)
  assert.equal(query.search, undefined)
  assert.equal(query.category, undefined)
  assert.equal(query.subcategory, undefined)
})
