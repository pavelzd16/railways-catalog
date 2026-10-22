import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { splitArticleBody } from '../src/entities/article/lib/article-body.ts'

const fixture = fs.readFileSync(new URL('./fixtures/stati-05.html', import.meta.url), 'utf8')

test('разбор статьи 05: оглавление, вопросы, карточки', () => {
  const { blocks, toc, faq } = splitArticleBody(fixture)
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

test('пустое тело не падает', () => {
  assert.deepEqual(splitArticleBody(''), { blocks: [], toc: [], faq: [] })
})

const SRC = 'D:/ClaudeWork/tatrels/reference/statyi-ii-2026-10-16/src'
test('все 24 исходные статьи разбираются без остатков меток', { skip: !fs.existsSync(SRC) }, () => {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.txt'))
  assert.equal(files.length, 24)
  for (const f of files) {
    const body = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^[\s\S]*?\n===\r?\n/, '')
    const { blocks, toc } = splitArticleBody(body)
    assert.ok(toc.length > 0, f)
    for (const b of blocks.filter((x) => x.type === 'html')) {
      assert.ok(!b.html.includes('[['), f)
      assert.ok(!b.html.includes('<h1'), f)
    }
  }
})
