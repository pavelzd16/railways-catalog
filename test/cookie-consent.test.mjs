import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { COOKIE_CONSENT_KEY, getCookieConsent, parseCookieConsent, saveCookieConsent, optionalTrackingAllowed, subscribeCookieConsent } from '../src/shared/privacy/cookie-consent.ts'

test('consent requires a valid explicit choice and expires after one year', () => {
  const now = 1800000000000
  for (const choice of ['accepted', 'necessary']) {
    assert.equal(parseCookieConsent(JSON.stringify({ version: 1, choice, savedAt: now - 1 }), now), choice)
  }
  for (const raw of [null, 'bad', '{}', JSON.stringify({ version: 1, choice: 'accepted', savedAt: now - 365 * 86400000 }), JSON.stringify({ version: 1, choice: 'accepted', savedAt: now + 1 }), JSON.stringify({ version: 2, choice: 'accepted', savedAt: now })]) {
    assert.equal(parseCookieConsent(raw, now), null)
  }
  assert.equal(getCookieConsent(), null, 'SSR never starts optional tracking')
})

test('tracking waits for consent, starts once and stops sending goals after refusal', async t => {
  const storage = new Map()
  const scripts = new Map()
  const calls = []
  const window = new EventTarget()
  window.location = { pathname: '/', href: 'http://localhost/', search: '' }
  window.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
  window.ym = (...args) => calls.push(args)
  const old = { window: globalThis.window, document: globalThis.document, location: globalThis.location }
  globalThis.window = window
  globalThis.location = window.location
  globalThis.document = { referrer: '', getElementById: id => scripts.get(id), createElement: () => ({}), head: { append: script => scripts.set(script.id, script) } }
  t.after(() => { Object.assign(globalThis, old) })
  async function load(name) {
    const source = (await readFile(new URL(`../src/shared/analytics/${name}.ts`, import.meta.url), 'utf8'))
      .replaceAll('import.meta.env', '({ PROD: true, VITE_METRIKA_ID: "123456" })')
      .replaceAll("'../privacy/cookie-consent'", JSON.stringify(new URL('../src/shared/privacy/cookie-consent.ts', import.meta.url).href))
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
    return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
  }
  const metrika = await load('metrika')
  const gudok = await load('gudok')
  metrika.startMetrika(); gudok.startGudok(); metrika.metrikaReachGoal('forma')
  assert.equal(scripts.size, 0)
  assert.equal(calls.length, 0)
  let changes = 0
  const unsubscribe = subscribeCookieConsent(() => changes++)
  saveCookieConsent('necessary')
  metrika.startMetrika(); gudok.startGudok()
  assert.equal(scripts.size, 0)
  saveCookieConsent('accepted')
  assert.equal(metrika.startMetrika(), true)
  assert.equal(metrika.startMetrika(), false)
  gudok.startGudok(); gudok.startGudok()
  assert.equal(scripts.size, 2)
  assert.equal(calls.filter(call => call[1] === 'init').length, 1)
  assert.equal(getCookieConsent(), 'accepted')
  metrika.metrikaReachGoal('forma')
  assert.deepEqual(calls.at(-1), [123456, 'reachGoal', 'forma'])
  window.location.pathname = '/catalog/rels-r65'
  const pochta = metrika.emailCopyGoal('Подвал')
  metrika.metrikaReachGoal(pochta.name, pochta.params?.())
  assert.deepEqual(calls.at(-1), [123456, 'reachGoal', 'pochta', { 'Почта': { 'Подвал': '/catalog/rels-r65' } }])
  window.location.pathname = '/'
  saveCookieConsent('necessary')
  const count = calls.length
  metrika.metrikaReachGoal('forma'); metrika.metrikaHit('/catalog', '/')
  assert.equal(calls.length, count)
  assert.equal(changes, 3)
  unsubscribe()
  saveCookieConsent('accepted')
  window.location.pathname = '/admin/login'
  assert.equal(optionalTrackingAllowed(), false)
  window.location.pathname = '/'
  window.localStorage.setItem = () => { throw new Error('storage blocked') }
  saveCookieConsent('necessary')
  assert.equal(getCookieConsent(), 'necessary', 'choice works in memory if writes are blocked')
  assert.equal(optionalTrackingAllowed(), false)
  assert.ok(storage.has(COOKIE_CONSENT_KEY))
})
