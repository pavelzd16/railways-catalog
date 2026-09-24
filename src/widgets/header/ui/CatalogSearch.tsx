import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FiSearch } from 'react-icons/fi'
import { useTypingPlaceholder } from './use-typing-placeholder'

/**
 * Примеры, которые печатаются в пустом поле. Каждый проверен на поиске
 * traer.ru 24.09.2026 — по нему находятся товары.
 */
const EXAMPLES = [
  'Рельс Р65',
  'Шпала Ш1-1',
  'Накладка 1Р-65',
  'Подкладка КБ-65',
  'Рельс крановый КР-80',
  'Болт закладной',
  'Клемма ПК',
  'Костыль путевой',
  'Брус переводной',
  'Стрелочный перевод Р65',
] as const

/** Прежняя неподвижная подсказка: остаётся после круга примеров (по просьбе пользователя). */
const STILL_PLACEHOLDER = 'Рельс Р65, шпала Ш-1, накладка…'

interface CatalogSearchProps {
  className?: string
  onSearch?: () => void
}

export function CatalogSearch(props: CatalogSearchProps) {
  const location = useLocation()
  const currentSearch = new URLSearchParams(location.search).get('search') ?? ''
  return (
    <SearchForm key={location.key} initialValue={currentSearch} {...props} />
  )
}

function SearchForm({
  initialValue,
  className = '',
  onSearch,
}: CatalogSearchProps & { initialValue: string }) {
  const navigate = useNavigate()
  const [value, setValue] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const placeholder = useTypingPlaceholder(
    EXAMPLES,
    STILL_PLACEHOLDER,
    focused || value !== '',
  )
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (value.trim()) params.set('search', value.trim())
    navigate(`/catalog${params.size ? `?${params}` : ''}`)
    onSearch?.()
  }
  return (
    <form
      role="search"
      aria-label="Поиск по каталогу"
      onSubmit={submit}
      className={`header-search flex min-w-0 items-center rounded-lg border border-border bg-white text-foreground ${className}`}
    >
      <input
        aria-label="Поиск по каталогу"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="h-12 min-w-0 flex-1 text-ellipsis rounded-l-lg bg-transparent pl-3 text-sm outline-offset-[-3px] placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label="Найти"
        className="flex h-12 w-11 shrink-0 items-center justify-center rounded-r-lg text-primary hover:bg-muted"
      >
        <FiSearch className="h-5 w-5" />
      </button>
    </form>
  )
}
