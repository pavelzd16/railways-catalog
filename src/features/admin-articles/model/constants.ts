// Рубрики статей — ровно эти строки (по ним группируются статьи на сайте).
export const ARTICLE_CATEGORIES = [
  'Стрелочные переводы',
  'Рельсы',
  'Шпалы',
  'Скрепления и крепёж',
  'Подкрановые пути',
  'Путевое хозяйство',
  'Закупка',
] as const

// Тот же шаблон и те же зарезервированные адреса, что проверяет API.
export const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const RESERVED_ARTICLE_SLUGS = ['admin', 'upload']

export const ARTICLE_DESCRIPTION_HINT = 160

/** Текст ошибки адреса или null, если адрес годится. */
export function slugError(slug: string): string | null {
  if (!slug) return 'Укажите адрес статьи'
  if (!ARTICLE_SLUG_PATTERN.test(slug)) {
    return 'Адрес: только латинские буквы, цифры и дефисы, без пробелов и дефиса в начале и конце'
  }
  if (RESERVED_ARTICLE_SLUGS.includes(slug)) return 'Этот адрес занят служебным разделом, выберите другой'
  return null
}

/** Сообщение пользователю по ошибке запроса: дубль адреса (409) — отдельным текстом. */
export function articleSaveError(err: unknown, fallback: string): string {
  const response = (err as { response?: { status?: number; data?: { message?: string | string[] } } })?.response
  if (response?.status === 409) {
    const message = response.data?.message
    return (Array.isArray(message) ? message[0] : message) || 'Статья с таким адресом уже есть'
  }
  return fallback
}
