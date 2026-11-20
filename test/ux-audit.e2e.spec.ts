import { test, expect } from '@playwright/test'
import { join } from 'node:path'
import { productPath } from '../src/shared/seo/route-data'
import { R65_OFFERS } from '../src/shared/lib/r65-offers'

const newR65 = productPath(R65_OFFERS[0])
const usedR65 = productPath(R65_OFFERS[1])

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL || new URL(baseURL).hostname !== '127.0.0.1') throw Error('Only local preview is allowed')
  await context.route(/mc\.yandex\./, route => route.abort())
  // Preview may read production data. Every write must be mocked in the test itself.
  await context.route('**/api/**', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort())
})

for (const width of [320, 340, 390, 454, 768, 1366]) {
  test(`pages and bottom controls fit ${width}px`, async ({ page }) => {
    test.setTimeout(120000)
    await page.setViewportSize({ width, height: 850 })
    for (const path of ['/', '/catalog', '/catalog/zheleznodorozhnye-relsy', newR65]) {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('.chat-launcher')).toBeVisible()
      await expect(page.locator('main h1')).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const cookie = page.getByRole('region', { name: 'Cookies на нашем сайте' })
      if (await cookie.count()) {
        await expect(cookie.getByRole('button', { name: 'Понятно' })).toBeInViewport({ ratio: 1 })
        await cookie.getByRole('button', { name: 'Понятно' }).click()
      }
      if (path.includes('r-65') && width < 1024) {
        const bar = page.getByRole('region', { name: 'Заявка по товару' })
        await expect(bar).toBeInViewport({ ratio: 1 })
        const dockRect = await page.locator('.chat-dock').boundingBox()
        const barRect = await bar.boundingBox()
        expect(barRect!.y + barRect!.height).toBeLessThanOrEqual(dockRect!.y + 1)
        await bar.getByRole('button', { name: 'Запросить спецификацию' }).click()
        await expect(page.getByRole('dialog', { name: 'Запросить спецификацию' })).toBeVisible()
        await expect(page.locator('.chat-widget')).toBeHidden()
        await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
        await expect(page.getByRole('dialog', { name: 'Запросить спецификацию' })).toHaveCount(0)
        await expect(page.locator('.chat-launcher')).toBeVisible()
      }
    }
    if (process.env.UX_AUDIT_SCREENSHOTS) await page.screenshot({ path: join(process.env.UX_AUDIT_SCREENSHOTS, `product-${width}.png`) })
  })
}

test('chat opens on request, cookie notice returns after closing a form, modal traps and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto('/')
  await expect(page.locator('.chat-launcher')).toBeVisible()
  await page.waitForTimeout(13000)
  await expect(page.locator('#prorels-chat')).toBeHidden()
  await page.getByRole('button', { name: 'Написать менеджеру', exact: true }).click()
  await expect(page.locator('#prorels-chat')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Cookies на нашем сайте' })).toHaveCount(0)
  const callback = page.locator('.site-header').getByRole('button', { name: /^Заказать звонок/ })
  await callback.click()
  const modal = page.getByRole('dialog', { name: 'Заказать звонок' })
  await expect(modal).toBeVisible()
  await expect(page.locator('.chat-widget')).toBeHidden()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await modal.getByRole('button', { name: 'Закрыть', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  await expect(modal.getByRole('button', { name: 'Заказать звонок', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(modal.getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(modal).toHaveCount(0)
  await expect(callback).toBeFocused()
  await expect(page.getByRole('region', { name: 'Cookies на нашем сайте' })).toBeVisible()
  await expect(page.locator('#prorels-chat')).toBeHidden()
})

test('R65 variants retain separate prices and submit the selected product with short contacts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 })
  await page.goto(newR65)
  await page.getByRole('button', { name: 'Понятно', exact: true }).click()
  await expect(page.locator('main')).not.toContainText('состояние — новые, б/у')
  const newPrice = await page.locator('main').innerText()
  await page.getByRole('navigation', { name: 'Состояние рельса Р65' }).getByRole('link', { name: 'Б/у (старогодный)', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(usedR65 + '$'))
  await expect(page.getByRole('navigation', { name: 'Состояние рельса Р65' }).getByRole('link', { name: 'Б/у (старогодный)', exact: true })).toHaveAttribute('aria-current', 'page', { timeout: 15000 })
  expect(await page.locator('main').innerText()).not.toBe(newPrice)
  const offerResponse = await page.request.get(`/api/product/${R65_OFFERS[1].slug}`)
  expect(offerResponse.ok()).toBe(true)
  const selectedOffer = await offerResponse.json()
  let submitted: string | undefined
  await page.route('**/api/request', async route => {
    submitted = route.request().postData() || ''
    await route.fulfill({ status: 201, contentType: 'application/json', body: '{"id":"local-mock-request"}' })
  })
  await page.getByRole('region', { name: 'Заявка по товару' }).getByRole('button', { name: 'Запросить спецификацию' }).click()
  const modal = page.getByRole('dialog', { name: 'Запросить спецификацию' })
  await expect(modal).toContainText('старогодный')
  await expect(modal.getByLabel('Электронная почта', { exact: true })).toBeHidden()
  await modal.getByRole('button', { name: 'Отправить заявку', exact: true }).click()
  await expect(modal.getByLabel('Имя или организация *', { exact: true })).toBeFocused()
  await expect(modal.getByText('Введите телефон полностью:', { exact: false })).toBeVisible()
  expect(submitted).toBeUndefined()
  await modal.getByLabel('Имя или организация *', { exact: true }).fill('Проверка локального черновика')
  await modal.getByLabel('Телефон *', { exact: true }).fill('9001234567')
  await modal.getByRole('checkbox').check()
  await modal.getByRole('button', { name: 'Отправить заявку', exact: true }).click()
  await expect(modal).toHaveCount(0)
  expect(submitted).toContain('Проверка локального черновика')
  expect(submitted).toContain('productId')
  expect(submitted).toContain(selectedOffer.id)
  expect(submitted).toContain('+7 (900) 123-45-67')
  await page.getByRole('navigation', { name: 'Состояние рельса Р65' }).getByRole('link', { name: 'Новый', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Состояние рельса Р65' }).getByRole('link', { name: 'Новый', exact: true })).toHaveAttribute('aria-current', 'page', { timeout: 15000 })
  await expect(page.locator('main')).not.toContainText('состояние — новые, б/у')
  if (process.env.UX_AUDIT_SCREENSHOTS) await page.screenshot({ path: join(process.env.UX_AUDIT_SCREENSHOTS, 'used-product-success.png') })
})

test('header contacts call or compose mail and retain separate copy buttons; all grouped categories remain accessible', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto('/')
  const header = page.locator('.site-header')
  await expect(header.getByRole('link', { name: 'zakaz@prorelsa.ru', exact: true })).toHaveAttribute('href', 'mailto:zakaz@prorelsa.ru')
  await expect(header.getByRole('link', { name: '+7 (965) 615-50-59', exact: true })).toHaveAttribute('href', 'tel:+79656155059')
  await header.getByRole('button', { name: 'Скопировать адрес почты', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('zakaz@prorelsa.ru')
  const categories = page.getByRole('complementary', { name: 'Каталог на главной странице' })
  await expect(categories.locator('summary')).toHaveCount(6)
  await categories.getByRole('button', { name: /Показать все разделы/ }).click()
  await expect(categories.locator('details[open]')).toHaveCount(6)
  await expect(categories.getByRole('link', { name: 'Железнодорожные рельсы', exact: true })).toBeVisible()
  if (process.env.UX_AUDIT_SCREENSHOTS) await page.screenshot({ path: join(process.env.UX_AUDIT_SCREENSHOTS, 'home-desktop.png') })
})

test('failed short request preserves contacts and exposes server error without creating an actual request', async ({ page }) => {
  await page.goto(newR65)
  await page.getByRole('button', { name: 'Понятно', exact: true }).click()
  await page.route('**/api/request', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Сервис временно недоступен"}' }))
  await page.locator('main').getByRole('button', { name: 'Запросить спецификацию', exact: true }).click()
  const modal = page.getByRole('dialog', { name: 'Запросить спецификацию' })
  await modal.getByLabel('Имя или организация *', { exact: true }).fill('Локальная проверка')
  await modal.getByLabel('Телефон *', { exact: true }).fill('9001234567')
  await modal.getByRole('checkbox').check()
  await modal.getByRole('button', { name: 'Отправить заявку', exact: true }).click()
  await expect(modal.getByRole('alert')).toHaveText('Сервис временно недоступен')
  await expect(modal.getByLabel('Имя или организация *', { exact: true })).toHaveValue('Локальная проверка')
})
