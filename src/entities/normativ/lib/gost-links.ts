// Разметка строки ГОСТ товара: номера из справочника — ссылки, остальное (разделители, «(заменён на …)») — текст.
// Чистая функция: склейка `text` всех частей даёт исходную строку.
import { GOST_REPLACED, normalizeCode, splitGostParts } from './norm-code.ts'

export type GostSegment = { text: string; slug?: string }

export function gostSegments(gost: string, normDocs?: { code: string; slug: string }[] | null): GostSegment[] {
  if (!gost) return []
  const slugs = new Map((normDocs ?? []).map((doc) => [normalizeCode(doc.code), doc.slug]))
  const segments: GostSegment[] = []
  const push = (text: string, slug?: string) => {
    if (!text) return
    const last = segments[segments.length - 1]
    if (!slug && last && !last.slug) last.text += text
    else segments.push(slug ? { text, slug } : { text })
  }
  // Номер внутри куска: пробелы по краям остаются текстом, ссылкой — только сам номер
  const pushCode = (raw: string) => {
    const code = raw.trim()
    const slug = code ? slugs.get(normalizeCode(code)) : undefined
    if (!slug) return push(raw)
    const from = raw.indexOf(code)
    push(raw.slice(0, from))
    push(code, slug)
    push(raw.slice(from + code.length))
  }
  const parts = splitGostParts(gost)
  let offset = 0
  parts.forEach((part, index) => {
    const replaced = part.match(GOST_REPLACED)
    if (replaced && replaced.index !== undefined) {
      pushCode(part.slice(0, replaced.index))
      push(replaced[1])
      pushCode(replaced[2])
      push(replaced[3])
      push(part.slice(replaced.index + replaced[0].length))
    } else pushCode(part)
    offset += part.length
    if (index < parts.length - 1) {
      push(gost[offset])
      offset += 1
    }
  })
  return segments
}
