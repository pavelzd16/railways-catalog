import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FiSearch } from 'react-icons/fi'

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
        placeholder="Рельс Р65, шпала Ш-1, накладка…"
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
