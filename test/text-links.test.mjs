import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stripTextLinks, textLinkSegments } from '../src/shared/lib/text-links.ts'

test('textLinkSegments: текст без разметки — один кусок как был', () => {
  assert.deepEqual(textLinkSegments('Старогодные материалы ВСП.'), [{ text: 'Старогодные материалы ВСП.' }])
  assert.deepEqual(textLinkSegments(''), [])
})

test('textLinkSegments: [подпись](/путь) — внутренняя ссылка, текст вокруг на месте', () => {
  assert.deepEqual(
    textLinkSegments('Годность определяют по [инструкции № 1225/р](/normativ/rasporyazhenie-oao-rzhd-1225-r): у рельсов — группа.'),
    [
      { text: 'Годность определяют по ' },
      { text: 'инструкции № 1225/р', href: '/normativ/rasporyazhenie-oao-rzhd-1225-r' },
      { text: ': у рельсов — группа.' },
    ],
  )
})

test('textLinkSegments: несколько ссылок и переносы строк сохраняются', () => {
  assert.deepEqual(textLinkSegments('[А](/a)\n\n[Б](/stati/b#x)'), [
    { text: 'А', href: '/a' },
    { text: '\n\n' },
    { text: 'Б', href: '/stati/b#x' },
  ])
})

test('textLinkSegments: чужие адреса и «//» ссылками не становятся', () => {
  for (const text of ['[сайт](https://example.com/x)', '[сайт](//example.com/x)', '[сайт](javascript:alert(1))', '[пусто]()']) {
    assert.deepEqual(textLinkSegments(text), [{ text }])
  }
})

test('stripTextLinks: подписи остаются, адреса убираются', () => {
  assert.equal(stripTextLinks('По [инструкции](/normativ/x) и [статье](/stati/y).'), 'По инструкции и статье.')
})
