import { test, expect } from '@playwright/test'

test('admin previews and cancels AI, resumes the timer, visitor receives only the sent answer', async ({
  browser,
  request,
  baseURL,
}) => {
  test.skip(
    process.env.CHAT_TEST_AI !== 'true',
    'Run with the isolated backend test provider',
  )
  if (!baseURL || new URL(baseURL).hostname !== '127.0.0.1')
    throw Error('Only local test servers are allowed')
  const sessionResponse = await request.post('/api/chat/session', {
    data: {
      name: `ИИ браузер ${Date.now()}`,
      policyAccepted: true,
      pageUrl: '/catalog',
    },
  })
  expect(sessionResponse.status()).toBe(201)
  const session = await sessionResponse.json()
  const login = await (
    await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'admin' },
    })
  ).json()
  expect(login.token).toBeTruthy()
  const visitorContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  const errors: string[] = []
  for (const context of [visitorContext, adminContext])
    await context.route(/mc\.yandex\./, (route) => route.abort())
  await visitorContext.addInitScript((value) => {
    localStorage.setItem('prorels-chat-session-v1', JSON.stringify(value))
    localStorage.setItem('prorels-chat-auto-opened', '1')
  }, session)
  await adminContext.addInitScript(
    (token) => localStorage.setItem('admin_access_token', token),
    login.token,
  )
  const visitor = await visitorContext.newPage()
  const admin = await adminContext.newPage()
  for (const page of [visitor, admin])
    page.on('pageerror', (error) => errors.push(error.message))
  try {
    await Promise.all([
      visitor.goto(`${baseURL}/catalog`),
      admin.goto(
        `${baseURL}/admin/chats?conversation=${session.conversation.id}`,
      ),
    ])
    await visitor.getByRole('button', { name: 'Написать менеджеру' }).click()
    await expect(
      admin.getByRole('region', { name: 'ИИ-консультант' }),
    ).toContainText('ИИ-консультант включён')
    await expect(
      visitor.getByText('Соединение установлено', { exact: true }),
    ).toBeVisible()
    await visitor
      .getByRole('textbox', { name: 'Сообщение', exact: true })
      .fill('Хочу купить рельсы Р65')
    await visitor.getByRole('button', { name: 'Отправить сообщение' }).click()
    await expect(admin.locator('.chat-ai-body')).toContainText(
      'Тестовый ответ ИИ',
    )
    await expect(
      admin.locator('.chat-ai-preview .chat-ai-countdown'),
    ).toContainText(/отправка через [1-7] с/)
    await expect(visitor.getByText(/Тестовый ответ ИИ/)).toHaveCount(0)
    await admin.screenshot({ path: '../local/ai-admin-desktop.png' })
    await admin.setViewportSize({ width: 390, height: 844 })
    await expect.poll(() => admin.locator('aside.fixed').evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(1)
    await expect(
      admin.getByRole('button', { name: 'Отменить ответ и взять чат' }),
    ).toBeInViewport({ ratio: 1 })
    expect(
      await admin
        .locator('.chat-compose')
        .evaluate((element) => element.getBoundingClientRect().bottom),
    ).toBeLessThanOrEqual(844)
    expect(
      await admin
        .locator('.admin-chat-detail')
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    ).toBe(true)
    await admin.screenshot({ path: '../local/ai-admin-mobile.png' })
    await admin
      .getByRole('button', { name: 'Отменить ответ и взять чат' })
      .click()
    await expect(
      admin.getByRole('region', { name: 'ИИ-консультант' }),
    ).toContainText('Отвечает менеджер')
    await visitor.waitForTimeout(7300)
    await expect(visitor.locator('.chat-message')).toHaveCount(1)
    await admin
      .getByRole('button', { name: 'Включить ИИ', exact: true })
      .click()
    await expect(admin.locator('.chat-ai-body')).toBeVisible()
    await expect(visitor.locator('.chat-message').last()).toContainText(
      'ИИ-консультант ПроРельс',
      { timeout: 12000 },
    )
    await expect(visitor.locator('.chat-message')).toHaveCount(2)
    await expect(admin.locator('.chat-ai-body')).toHaveCount(0)
    await visitor.screenshot({ path: '../local/ai-visitor-mobile.png' })
    await admin
      .getByRole('textbox', { name: 'Сообщение', exact: true })
      .fill('Подключился менеджер, уточню комплектность.')
    await admin.getByRole('button', { name: 'Отправить сообщение' }).click()
    await expect(visitor.locator('.chat-message').last()).toContainText(
      'Подключился менеджер',
    )
    await expect(
      admin.getByRole('region', { name: 'ИИ-консультант' }),
    ).toContainText('Отвечает менеджер')
    expect(errors).toEqual([])
  } finally {
    await visitorContext.close()
    await adminContext.close()
  }
})
