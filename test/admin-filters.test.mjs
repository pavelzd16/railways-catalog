import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adminRequestsQuery } from '../src/features/admin-requests/model/adminRequestsQuery.ts'
import { adminServicesQuery } from '../src/features/admin-services/model/adminServicesQuery.ts'
import { adminOrdersQuery } from '../src/features/admin-orders/adminOrdersQuery.ts'

test('requests: search and kind go to the server', () => {
  const query = adminRequestsQuery({ search: '  Иванов ', type: 'service' }, 2)
  assert.equal(query.search, 'Иванов')
  assert.equal(query.type, 'service')
  assert.equal(query.page, 2)
  assert.equal(query.limit, 20)
})

test('requests: «все типы» is not a filter', () => {
  const query = adminRequestsQuery({ search: '', type: 'all' }, 1)
  assert.equal(query.search, undefined)
  assert.equal(query.type, undefined)
})

test('services: search goes to the server', () => {
  assert.equal(adminServicesQuery({ search: ' Укладка ' }, 1).search, 'Укладка')
  assert.equal(adminServicesQuery({ search: '   ' }, 1).search, undefined)
})

test('orders: search and status go to the server', () => {
  const query = adminOrdersQuery({ search: ' ORD-2026 ', status: 'PENDING' }, 3)
  assert.equal(query.search, 'ORD-2026')
  assert.equal(query.status, 'PENDING')
  assert.equal(query.page, 3)
  assert.equal(adminOrdersQuery({ search: '', status: 'all' }, 1).status, undefined)
})
