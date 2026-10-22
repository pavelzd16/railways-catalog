import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { splitArticleBody } from '../src/entities/article/lib/article-body.ts'

const fixture = fs.readFileSync(new URL('./fixtures/stati-05.html', import.meta.url), 'utf8')

test('разбор статьи 05: оглавление, вопросы, карточки', () => {
  const { blocks, toc, faq, faqAfter } = splitArticleBody(fixture)
  assert.equal(faqAfter, blocks.length)
  assert.equal(toc[0].title, 'Как устроено обозначение рельсов жд')
  assert.equal(toc[toc.length - 1].title, 'Частые вопросы')
  assert.equal(faq.length, 5)
  assert.equal(faq[0].question, 'Чем отличаются рельсы Р65 и Р50?')
  assert.ok(!/<|>/.test(faq[0].answer))
  const cards = blocks.filter((b) => b.type === 'cards')
  assert.equal(cards.length, 4)
  assert.deepEqual(cards[0], { type: 'cards', skus: ['TM-0747', 'TM-0039'], specs: ['Высота', 'Ширина головки', 'Масса 1 м'] })
  for (const b of blocks.filter((x) => x.type === 'html')) {
    assert.ok(!b.html.includes('[['))
    assert.ok(!b.html.includes('<h1'))
    assert.ok(!b.html.includes('class="faq"'))
  }
  const ids = toc.map((t) => t.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)))
})

test('повторяющиеся заголовки получают -2', () => {
  const { toc, blocks } = splitArticleBody('<h2>А</h2><h2>А</h2>')
  assert.deepEqual(toc.map((t) => t.id), ['a', 'a-2'])
  assert.ok(blocks[0].html.includes('id="a-2"'))
})

test('метки SERVICE, одиночная CARD, существующий id и тело без h1', () => {
  const { blocks, toc } = splitArticleBody(
    '<p>x</p>\n[[CARD TM-0751]]\n<h2 id="moj">Мой раздел</h2>\n[[SERVICE rezka-rels]]\n'
  )
  assert.deepEqual(blocks.map((b) => b.type), ['html', 'cards', 'html', 'service'])
  assert.deepEqual(blocks[1], { type: 'cards', skus: ['TM-0751'], specs: [] })
  assert.deepEqual(blocks[3], { type: 'service', slug: 'rezka-rels' })
  assert.deepEqual(toc, [{ id: 'moj', title: 'Мой раздел' }])
})

test('вопросы без div.faq: раздел после h2 «Частые вопросы»', () => {
  const { blocks, toc, faq } = splitArticleBody(
    '<h2>Тема</h2><p>т</p><h2> частые вопросы </h2><h3>Q1?</h3><p>A1</p><h3>Q2?</h3><p>A2</p><h2>После</h2><p>п</p>'
  )
  assert.deepEqual(faq, [{ question: 'Q1?', answer: 'A1' }, { question: 'Q2?', answer: 'A2' }])
  assert.equal(toc.length, 3)
  const html = blocks.map((b) => b.html).join('')
  assert.ok(!html.includes('<h3') && html.includes('частые вопросы') && html.includes('После'))
})

test('faqAfter: вопросы встают сразу за h2 «Частые вопросы», разделы после — ниже', () => {
  const { blocks, faqAfter } = splitArticleBody(
    '<h2>Тема</h2><p>т</p>[[CARD TM-0001]]<p>о</p><h2>Частые вопросы</h2><h3>Q?</h3><p>A</p><h2>После</h2><p>п</p>[[SERVICE rezka-rels]]'
  )
  assert.deepEqual(blocks.map((b) => b.type), ['html', 'cards', 'html', 'html', 'service'])
  assert.equal(faqAfter, 3)
  assert.match(blocks[faqAfter - 1].html, /<h2[^>]*>Частые вопросы<\/h2>$/)
  assert.match(blocks[faqAfter].html, /^<h2[^>]*>После<\/h2><p>п<\/p>$/)
})

test('faqAfter: div.faq в середине статьи', () => {
  const { blocks, faq, faqAfter } = splitArticleBody(
    '<h2>Частые вопросы</h2>\n<div class="faq"><h3>Q?</h3><p>A</p></div>\n<h2>После</h2><p>п</p>'
  )
  assert.deepEqual(faq, [{ question: 'Q?', answer: 'A' }])
  assert.equal(blocks.length, 2)
  assert.equal(faqAfter, 1)
  assert.match(blocks[0].html, /Частые вопросы<\/h2>$/)
  assert.match(blocks[1].html, /^<h2[^>]*>После/)
})

test('faqAfter: без вопросов — после всех блоков', () => {
  const { blocks, faq, faqAfter } = splitArticleBody('<h2>Тема</h2><p>т</p>[[CARD TM-0001]]')
  assert.equal(faq.length, 0)
  assert.equal(faqAfter, blocks.length)
})

test('повтор готового id в h2 уникализируется', () => {
  const { toc } = splitArticleBody('<h2 id="x">А</h2><h2 id="x">Б</h2>')
  assert.deepEqual(toc.map((t) => t.id), ['x', 'x-2'])
})

test('пустое тело не падает', () => {
  assert.deepEqual(splitArticleBody(''), { blocks: [], toc: [], faq: [], faqAfter: 0 })
})

const SRC = 'D:/ClaudeWork/tatrels/reference/statyi-ii-2026-10-16/src'
test('все 24 исходные статьи разбираются без остатков меток', { skip: !fs.existsSync(SRC) }, () => {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.txt'))
  assert.equal(files.length, 24)
  for (const f of files) {
    const body = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^[\s\S]*?\n===\r?\n/, '')
    const { blocks, toc, faq, faqAfter } = splitArticleBody(body)
    assert.ok(toc.length > 0, f)
    assert.ok(faq.length > 0, f)
    // Вопросы в конце каждой статьи: аккордеон рисуется после всех блоков, как и раньше
    assert.equal(faqAfter, blocks.length, f)
    for (const b of blocks.filter((x) => x.type === 'html')) {
      assert.ok(!b.html.includes('[['), f)
      assert.ok(!b.html.includes('<h1'), f)
    }
  }
})
