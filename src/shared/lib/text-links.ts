/** Кусок текста описания: обычный текст или внутренняя ссылка. */
export type TextLinkSegment = { text: string; href?: string }

// [подпись](/путь) — только адреса нашего сайта: начинаются с «/», но не с «//».
const LINK = /\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g

/**
 * Описание раздела из админки → куски для вывода: «[подпись](/normativ/…)» становится ссылкой,
 * всё остальное (в том числе ссылки на чужие сайты) остаётся текстом как было.
 */
export function textLinkSegments(text: string): TextLinkSegment[] {
  const segments: TextLinkSegment[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const start = match.index ?? 0
    if (start > last) segments.push({ text: text.slice(last, start) })
    segments.push({ text: match[1], href: match[2] })
    last = start + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}

/** Текст без разметки ссылок: подписи остаются, адреса убираются (для мест, где ссылки не нужны). */
export function stripTextLinks(text: string): string {
  return textLinkSegments(text).map((segment) => segment.text).join('')
}
