import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getLoginError, formatWait } from '../src/entities/auth/model/login-error.ts'

const failure = (status, data = {}, headers = {}) => ({ isAxiosError: true, response: { status, data, headers } })

test('login cooldown uses server seconds and Retry-After header, including HTTP dates', () => {
  assert.equal(getLoginError(failure(429, { retryAfter: 47 })).retryAfter, 47)
  assert.equal(getLoginError(failure(429, {}, { 'retry-after': '58' })).retryAfter, 58)
  const now = Date.parse('2026-09-27T12:00:00Z')
  assert.equal(getLoginError(failure(429, {}, { 'retry-after': 'Sun, 27 Sep 2026 12:01:00 GMT' }), now).retryAfter, 60)
  assert.equal(getLoginError(failure(429, { retryAfter: 'broken' })).retryAfter, 900)
  assert.equal(formatWait(900), '15:00')
  assert.equal(formatWait(9), '0:09')
})

test('login displays failed attempts without leaking server errors', () => {
  assert.equal(getLoginError(failure(401, { attemptsRemaining: 2 })).attemptsRemaining, 2)
  assert.equal(getLoginError(failure(401, { attemptsRemaining: -1 })).attemptsRemaining, undefined)
  assert.doesNotMatch(getLoginError(failure(500, { message: 'database private detail' })).message, /database/)
  assert.match(getLoginError({ isAxiosError: true }).message, /Нет связи/)
})
