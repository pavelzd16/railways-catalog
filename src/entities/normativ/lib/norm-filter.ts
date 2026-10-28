// Поиск и фильтры списка документов: работают в браузере (и на сервере при первой отрисовке) без запросов к API.
import type { NormListItem } from '../model/types.ts'
import { normalizeCode } from './norm-code.ts'
import { KIND_GROUPS, kindGroupOf, type KindGroupId } from './norm-labels.ts'

export interface NormFilter {
  q?: string
  /** Slug раздела каталога. */
  section?: string
  /** Группа типов из KIND_GROUPS. */
  kind?: string
}

// Слова запроса и текст документа приводятся одинаково: регистр, «ё», латиница-двойники, пробелы
const haystack = (item: NormListItem) => normalizeCode(`${item.code} ${item.name}`)

export function filterNorms(items: NormListItem[], filter: NormFilter): NormListItem[] {
  const words = normalizeCode(filter.q ?? '').split(' ').filter(Boolean)
  return items.filter((item) => {
    if (filter.section && !item.sections.includes(filter.section)) return false
    if (filter.kind && kindGroupOf(item.kind) !== filter.kind) return false
    if (!words.length) return true
    const text = haystack(item)
    return words.every((word) => text.includes(word))
  })
}

/** Разделы каталога, в которых есть документы, по алфавиту slug-ов. */
export function sectionsWithDocs(items: NormListItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.sections))].sort()
}

/** Группы типов, в которых есть документы, в порядке KIND_GROUPS. */
export function kindGroupsWithDocs(items: NormListItem[]): KindGroupId[] {
  const present = new Set(items.map((item) => kindGroupOf(item.kind)))
  return KIND_GROUPS.map((group) => group.id).filter((id) => present.has(id))
}

export interface ListFilters {
  q: string
  razdel: string
  tip: string
}

/** Фильтры списка из строки адреса (?q=…&razdel=…&tip=…); нет параметров - пустые. */
export function readFilters(search: string): ListFilters {
  const params = new URLSearchParams(search)
  return { q: params.get('q') ?? '', razdel: params.get('razdel') ?? '', tip: params.get('tip') ?? '' }
}

/** Адрес списка с фильтрами; пустые параметры не пишутся, без фильтров - чистый /normativ. */
export function filtersUrl(filters: ListFilters): string {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q)
  if (filters.razdel) params.set('razdel', filters.razdel)
  if (filters.tip) params.set('tip', filters.tip)
  const query = params.toString()
  return '/normativ' + (query ? `?${query}` : '')
}
