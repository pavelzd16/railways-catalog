// Подписи типов и статусов документов по-русски, группы типов для фильтра, дата введения и размер файла.
import type { NormKind, NormStatus } from '../model/types.ts'

const KIND_LABELS: Record<NormKind, string> = {
  gost: 'ГОСТ',
  'gost-r': 'ГОСТ Р',
  ost: 'ОСТ',
  sp: 'СП',
  tu: 'ТУ',
  rzd: 'Документ РЖД',
  law: 'Закон',
  order: 'Приказ',
  album: 'Альбом',
  series: 'Серия',
  other: 'Документ',
}

const STATUS_LABELS: Record<NormStatus, string> = { active: 'Действует', replaced: 'Заменён', cancelled: 'Отменён' }

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind as NormKind] ?? KIND_LABELS.other
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as NormStatus] ?? STATUS_LABELS.active
}

/** Чипы типа в списке: приказы и законы, альбомы и серии идут одним чипом. */
export const KIND_GROUPS = [
  { id: 'gost', label: 'ГОСТ', kinds: ['gost'] },
  { id: 'gost-r', label: 'ГОСТ Р', kinds: ['gost-r'] },
  { id: 'ost', label: 'ОСТ', kinds: ['ost'] },
  { id: 'sp', label: 'СП', kinds: ['sp'] },
  { id: 'tu', label: 'ТУ', kinds: ['tu'] },
  { id: 'rzd', label: 'Документы РЖД', kinds: ['rzd'] },
  { id: 'law', label: 'Законы и приказы', kinds: ['law', 'order'] },
  { id: 'album', label: 'Альбомы и серии', kinds: ['album', 'series'] },
  { id: 'other', label: 'Прочие', kinds: ['other'] },
] as const

export type KindGroupId = (typeof KIND_GROUPS)[number]['id']

export function kindGroupOf(kind: string): KindGroupId {
  return KIND_GROUPS.find((group) => (group.kinds as readonly string[]).includes(kind))?.id ?? 'other'
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/** «1 января 2011 г.» из `YYYY-MM-DD`; даты разбираются как строка, без часового пояса. Не дата — пустая строка. */
export function formatIntroducedAt(value?: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ''
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return ''
  return `${day} ${MONTHS[month - 1]} ${Number(match[1])} г.`
}

/** Размер файла для кнопки «Скачать PDF (1,5 МБ)»: мегабайты с одним знаком после запятой. */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return ''
  const megabytes = Math.round((bytes / (1024 * 1024)) * 10) / 10
  return `${String(megabytes).replace('.', ',')} МБ`
}

// В ссылку на источник пускаем только http(s): адрес приходит из базы
export function safeHttpUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
