// Разбор тела статьи на блоки отрисовки, оглавление и частые вопросы.
// Чистая функция на регулярных выражениях, без DOM — работает и при SSR на сервере.

export type ArticleBlock =
  | { type: 'html'; html: string }
  | { type: 'cards'; skus: string[]; specs: string[] }
  | { type: 'service'; slug: string }

export interface ArticleToc {
  id: string
  title: string
}

export interface ArticleFaq {
  question: string
  answer: string
}

// Транслитерация для id заголовков (латиница в нижнем регистре)
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => TRANSLIT[c] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'razdel'
}

// Чистый текст: без тегов, с разобранными основными сущностями
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// Пары <h3> → <p> из куска html
function parseFaqPairs(inner: string, faq: ArticleFaq[]): void {
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*(?:<p[^>]*>([\s\S]*?)<\/p>)?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(inner))) {
    const question = plainText(m[1])
    if (question) faq.push({ question, answer: plainText(m[2] ?? '') })
  }
}

// Место вопросов в тексте: вырезанный раздел заменяется этой меткой, по ней блоки делятся на «до» и «после».
// Символ метки U+E000 (частная область Юникода) splitArticleBody заранее убирает из тела — с текстом её не спутать.
const FAQ_SLOT = '\uE000faq\uE000'

function extractFaq(html: string): { html: string; faq: ArticleFaq[] } {
  const faq: ArticleFaq[] = []
  let found = false
  const rest = html.replace(/<div\s+class="faq"\s*>([\s\S]*?)<\/div>/gi, (_m, inner: string) => {
    parseFaqPairs(inner, faq)
    if (found) return ''
    found = true
    return FAQ_SLOT
  })
  if (found) return { html: rest, faq }

  // Без div.faq: раздел после <h2>«Частые вопросы» до следующего <h2> или конца текста
  const head = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
  let h: RegExpExecArray | null
  while ((h = head.exec(rest))) {
    if (plainText(h[1]).toLowerCase() !== 'частые вопросы') continue
    const start = h.index + h[0].length
    const next = rest.slice(start).search(/<h2[\s>]/i)
    const end = next === -1 ? rest.length : start + next
    parseFaqPairs(rest.slice(start, end), faq)
    return { html: rest.slice(0, start) + FAQ_SLOT + rest.slice(end), faq }
  }
  return { html: rest, faq }
}

// Добавляет id каждому <h2> (существующие сохраняет) и собирает оглавление
function numberHeadings(html: string): { html: string; toc: ArticleToc[] } {
  const toc: ArticleToc[] = []
  const used = new Set<string>()
  const unique = (base: string): string => {
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return id
  }
  const out = html.replace(/<h2((?:\s[^>]*)?)>([\s\S]*?)<\/h2>/gi, (_m, attrs: string, inner: string) => {
    const title = plainText(inner)
    const own = /\sid\s*=\s*"([^"]*)"/i.exec(attrs)
    if (own && own[1]) {
      const id = unique(own[1])
      toc.push({ id, title })
      return `<h2${attrs.replace(/(\sid\s*=\s*")[^"]*"/i, `$1${id}"`)}>${inner}</h2>`
    }
    const id = unique(slugify(title))
    toc.push({ id, title })
    return `<h2${attrs} id="${id}">${inner}</h2>`
  })
  return { html: out, toc }
}

export function splitArticleBody(body: string): {
  blocks: ArticleBlock[]
  toc: ArticleToc[]
  faq: ArticleFaq[]
  /** Сколько блоков рисуется до частых вопросов: вопросы встают на своё место в тексте, а не всегда в конец. */
  faqAfter: number
} {
  // H1 рисует шапка статьи; в теле он может быть, а может и не быть
  let html = (body ?? '').replace(/\uE000/g, '').replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, '')
  html = html.replace(/(?:<p>\s*)?\[\[TOC\]\](?:\s*<\/p>)?/g, '')

  const faqPart = extractFaq(html)
  const heads = numberHeadings(faqPart.html)

  const blocks: ArticleBlock[] = []
  const pushHtml = (chunk: string) => {
    // Остаточные неизвестные метки не должны попасть на страницу
    const clean = chunk.replace(/\[\[[^\]]*\]\]/g, '').trim()
    if (clean) blocks.push({ type: 'html', html: clean })
  }

  const marker = /(?:<p>\s*)?\[\[(CARD|SERVICE)\s+([^\]]*?)\s*\]\](?:\s*<\/p>)?|\uE000faq\uE000/g
  let last = 0
  let faqAfter: number | null = null
  let m: RegExpExecArray | null
  while ((m = marker.exec(heads.html))) {
    pushHtml(heads.html.slice(last, m.index))
    last = m.index + m[0].length
    if (m[0] === FAQ_SLOT) {
      faqAfter = blocks.length
    } else if (m[1] === 'SERVICE') {
      blocks.push({ type: 'service', slug: m[2].trim() })
    } else {
      // {Подпись|Подпись} после артикула — показываемые характеристики
      const skus: string[] = []
      const specs: string[] = []
      const re = /([A-Za-z]{2}-\d+)(?:\{([^}]*)\})?/g
      let c: RegExpExecArray | null
      while ((c = re.exec(m[2]))) {
        skus.push(c[1])
        if (c[2]) specs.push(...c[2].split('|').map((s) => s.trim()).filter(Boolean))
      }
      if (skus.length) blocks.push({ type: 'cards', skus, specs })
    }
  }
  pushHtml(heads.html.slice(last))

  return {
    blocks,
    toc: heads.toc,
    faq: faqPart.faq,
    faqAfter: faqPart.faq.length > 0 && faqAfter !== null ? faqAfter : blocks.length,
  }
}
