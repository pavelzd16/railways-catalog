// Документ на странице норматива: картинки страниц для листалки в шапке, подпись и файл для карточки — чистые правила,
// и выжимка без ссылок на другие сайты (дополнение 24.10: документ — у нас на сайте, источник называется текстом).
import { formatFileSize } from './norm-labels.ts'
import type { NormDocumentFull } from '../model/types.ts'

/** «1 страница», «3 страницы», «9 страниц». */
export function pagesLabel(count: number): string {
  const tens = count % 100
  const units = count % 10
  const word = tens >= 11 && tens <= 14 ? 'страниц' : units === 1 ? 'страница' : units >= 2 && units <= 4 ? 'страницы' : 'страниц'
  return `${count} ${word}`
}

/** «9 страниц · PDF · 0,2 МБ»; неизвестное число страниц или размер пропускаются. */
export function documentFacts({ pageCount, fileSize }: { pageCount?: number | null; fileSize?: number | null }): string {
  const parts: string[] = []
  if (pageCount && pageCount > 0) parts.push(pagesLabel(pageCount))
  parts.push('PDF')
  const size = formatFileSize(fileSize)
  if (size) parts.push(size)
  return parts.join(' · ')
}

// Файлы документа лежат в хранилище API и отдаются с нашего же адреса (/uploads/… проксирует сайт).
const OWN_UPLOAD = /^\/uploads\/[^/?#\s][^?#\s]*$/

/** Картинок страниц в листалке — не больше 100 (как NORM_PREVIEWS_MAX в API); остальное — в PDF-файле. */
export const MAX_PREVIEW_PAGES = 100

export interface DocumentViewer {
  /** pages — есть картинки страниц (листалка); placeholder — файл есть, картинок нет (лист-заглушка); request — «Документ по запросу». */
  mode: 'pages' | 'placeholder' | 'request'
  /** Картинки страниц по порядку — только свои (/uploads/…), не больше MAX_PREVIEW_PAGES. */
  pages: string[]
  /** Страниц в PDF; если не известно — по числу картинок. */
  pageCount: number
  /** PDF длиннее картинок — последний лист листалки «Дальше — в PDF-файле». */
  more: boolean
  /** Листов в листалке: страницы и лист «Дальше»; у заглушки — 1, без файла — 0. */
  sheets: number
  file: string | null
  downloadName: string
  facts: string
}

type ViewerInput = Pick<NormDocumentFull, 'code' | 'file' | 'fileName' | 'fileSize'> & {
  pageCount?: number | null
  previews?: string[] | null
}

export function documentViewer(document: ViewerInput): DocumentViewer {
  const file = document.file && OWN_UPLOAD.test(document.file) ? document.file : null
  const downloadName = document.fileName || `${document.code}.pdf`
  const known = document.pageCount && document.pageCount > 0 ? document.pageCount : 0
  if (!file) return { mode: 'request', pages: [], pageCount: known, more: false, sheets: 0, file: null, downloadName, facts: '' }
  const pages = (document.previews ?? []).filter((src) => OWN_UPLOAD.test(src)).slice(0, MAX_PREVIEW_PAGES)
  const facts = documentFacts({ pageCount: document.pageCount, fileSize: document.fileSize })
  if (!pages.length) return { mode: 'placeholder', pages, pageCount: known, more: false, sheets: 1, file, downloadName, facts }
  const pageCount = Math.max(known, pages.length)
  const more = pageCount > pages.length
  return { mode: 'pages', pages, pageCount, more, sheets: pages.length + (more ? 1 : 0), file, downloadName, facts }
}

// Адрес сайта в тексте: «protect.gost.ru», «www.minstroyrf.gov.ru», «https://…/путь».
const DOMAIN = String.raw`(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s()]*)?`
const DOMAIN_IN_PARENS = new RegExp(String.raw`\s*\([^()]*?\b${DOMAIN}[^()]*\)`, 'gi')
const BARE_DOMAIN = new RegExp(String.raw`(?:^|\s)${DOMAIN}`, 'gi')

/**
 * Источник текста для страницы — названием, без домена и адреса (дополнение 24.10: на другие сайты не ссылаемся
 * и не отсылаем): «Росстандарт (protect.gost.ru)» → «Росстандарт». Скобки без адреса остаются.
 */
export function sourceLabel(sourceName?: string | null): string {
  if (!sourceName) return ''
  return sourceName
    .replace(DOMAIN_IN_PARENS, '')
    .replace(BARE_DOMAIN, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:—–-]+|[\s,;:—–-]+$/g, '')
}

const OWN_HOST =/^(?:https?:)?\/\/(?:www\.)?prorelsa\.ru(?:[/?#:]|$)/i

/** Ссылка на другой сайт: адрес со схемой и хостом (или «//хост»), кроме prorelsa.ru; tel:, mailto:, свои пути и якоря — не внешние. */
export function isExternalHref(href: string): boolean {
  const value = href.trim()
  if (!/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value)) return false
  return !OWN_HOST.test(value)
}

const ANCHOR = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi
const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i

/** Внешние <a> выжимки заменяются на <span> с тем же содержимым — текст остаётся, ссылки на другие сайты нет. */
export function unlinkExternalLinks(html: string): string {
  return html.replace(ANCHOR, (whole, attrs: string, inner: string) => {
    const match = HREF.exec(attrs)
    const href = match ? (match[1] ?? match[2] ?? match[3] ?? '') : ''
    return href && isExternalHref(href) ? `<span>${inner}</span>` : whole
  })
}
