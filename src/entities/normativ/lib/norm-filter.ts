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
