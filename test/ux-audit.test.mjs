import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeR65Offer, R65_OFFERS } from '../src/shared/lib/r65-offers.ts'
import { groupCategories } from '../src/shared/lib/category-groups.ts'
import { validateRequestContact } from '../src/shared/lib/request-validation.ts'

test('R65 condition text agrees with the offer without changing its price, stock or identity', () => {
  const source = { slug: R65_OFFERS[0].slug, condition: 'new', price: 126000, stock: 112,
    description: 'Рельс, состояние — новые, б/у.', specs: [{ label: 'Состояние', value: 'новые, б/у' }, { label: 'Длина', value: '12500 мм' }] }
  const result = normalizeR65Offer(source)
  assert.equal(result.description, 'Рельс, состояние — новый.')
  assert.equal(result.specs[0].value, 'новый')
  assert.deepEqual([result.price, result.stock, result.slug, result.specs[1]], [source.price, source.stock, source.slug, source.specs[1]])
  assert.equal(source.specs[0].value, 'новые, б/у', 'source data is not mutated')
  assert.equal(normalizeR65Offer({ ...source, slug: R65_OFFERS[1].slug, condition: 'used' }).specs[0].value, 'б/у (старогодный)')
  const other = { ...source, slug: 'another-product' }
  assert.equal(normalizeR65Offer(other), other)
})

test('navigation retains every category exactly once, including unfamiliar categories', () => {
  const categories = ['zhd-shpaly', 'zheleznodorozhnye-relsy', 'zhd-krepezh', 'strelochnye-perevody', 'putevoj-instrument', 'starogodnye-materialy-vsp', 'new-category', 'vagonnye-zapchasti'].map(slug => ({ slug }))
  const groups = groupCategories(categories)
  assert.equal(groups.length, 6)
  assert.deepEqual(groups[0].categories, categories.slice(0, 2), 'order inside a group is preserved')
  assert.deepEqual(groups.flatMap(group => group.categories).map(category => category.slug).sort(), categories.map(category => category.slug).sort())
  assert.deepEqual(groupCategories([]), [])
})

test('a short request accepts only complete contacts and consent, optional email stays optional', () => {
  const valid = { name: 'Иван', phone: '+7 (900) 123-45-67', email: '', policyAccepted: true }
  assert.deepEqual(validateRequestContact(valid), {})
  assert.deepEqual(Object.keys(validateRequestContact({ name: ' ', phone: '+7 (900)', email: 'bad', policyAccepted: false })), ['name', 'phone', 'email', 'policyAccepted'])
  assert.deepEqual(validateRequestContact({ ...valid, email: ' sales@example.org ' }), {})
})
