import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { FiCheck, FiChevronDown, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import type { FilterOption } from '@/entities/category'
import type {
  ProductCondition,
  SortOption,
} from '@/entities/product/model/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

export interface FilterState {
  search: string
  gost: string
  priceMin: string
  priceMax: string
  condition: ProductCondition | 'all'
  stock: 'in-stock' | 'on-order' | 'all'
  sort: SortOption
  attributes: Record<string, string>
}

const emptyFilters: FilterState = {
  search: '',
  gost: '',
  priceMin: '',
  priceMax: '',
  condition: 'all',
  stock: 'all',
  sort: 'name',
  attributes: {},
}
const selectClass =
  'h-11 md:h-10 min-w-0 max-w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground'

interface ProductFilterProps {
  value: FilterState
  onFilterChange: (filters: FilterState) => void
  filters?: FilterOption[]
}

export function ProductFilter({
  value,
  onFilterChange,
  filters = [],
}: ProductFilterProps) {
  const [draft, setDraft] = useState(value)
  const [expanded, setExpanded] = useState(false)
  const formId = useId()
  const priceErrorId = useId()
  const invalidPrice = [draft.priceMin, draft.priceMax].some(
    (price) =>
      price !== '' && (!Number.isFinite(Number(price)) || Number(price) < 0),
  )
  const invalidRange =
    invalidPrice ||
    (draft.priceMin !== '' &&
      draft.priceMax !== '' &&
      Number(draft.priceMin) > Number(draft.priceMax))
  const activeCount = [
    value.search,
    value.gost,
    value.priceMin || value.priceMax,
    value.condition !== 'all',
    value.stock !== 'all',
    ...Object.values(value.attributes).filter((item) => item && item !== 'all'),
  ].filter(Boolean).length

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (invalidRange) return
    onFilterChange(draft)
    setExpanded(false)
  }
  const reset = () => {
    const next = { ...emptyFilters, sort: value.sort }
    setDraft(next)
    onFilterChange(next)
    setExpanded(false)
  }

  return (
    <section aria-label="Фильтры товаров" className="mb-2 min-w-0">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-muted md:hidden"
        aria-expanded={expanded}
        aria-controls={formId}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <FiFilter aria-hidden="true" />
          Фильтры{activeCount > 0 && ` · ${activeCount}`}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={expanded ? 'rotate-180' : ''}
        />
      </button>
      <form
        id={formId}
        onSubmit={submit}
        className={`relative mt-3 md:mt-0 ${expanded ? 'block' : 'hidden md:block'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative w-full min-w-0 sm:w-52 sm:grow sm:basis-48">
            <span className="sr-only">Название или артикул</span>
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 md:top-3 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="search"
              value={draft.search}
              onChange={(event) =>
                setDraft({ ...draft, search: event.target.value })
              }
              placeholder="Название или артикул"
              className="h-11 rounded-md bg-white pl-9 pr-3 md:h-10"
            />
          </label>
          <FilterDropdown label="ГОСТ" active={!!draft.gost}>
            <label className="block text-sm font-bold">
              ГОСТ
              <Input
                value={draft.gost}
                onChange={(event) =>
                  setDraft({ ...draft, gost: event.target.value })
                }
                placeholder="Например, 16017-79"
                className="mt-2 bg-white font-normal"
              />
            </label>
          </FilterDropdown>
          <select
            aria-label="Состояние"
            value={draft.condition}
            onChange={(event) =>
              setDraft({
                ...draft,
                condition: event.target.value as FilterState['condition'],
              })
            }
            className={selectClass}
          >
            <option value="all">Состояние</option>
            <option value="new">Новый</option>
            <option value="used">Б/У</option>
            <option value="service">Услуга</option>
          </select>
          <select
            aria-label="Наличие"
            value={draft.stock}
            onChange={(event) =>
              setDraft({
                ...draft,
                stock: event.target.value as FilterState['stock'],
              })
            }
            className={selectClass}
          >
            <option value="all">Наличие</option>
            <option value="in-stock">В наличии</option>
            <option value="on-order">Под заказ</option>
          </select>
          <FilterDropdown
            label="Цена, ₽"
            active={!!(draft.priceMin || draft.priceMax)}
          >
            <fieldset>
              <legend className="mb-2 text-sm font-bold">Цена, ₽</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0 text-xs text-muted-foreground">
                  От
                  <Input
                    aria-label="Цена от"
                    type="number"
                    min="0"
                    step="any"
                    value={draft.priceMin}
                    onChange={(event) =>
                      setDraft({ ...draft, priceMin: event.target.value })
                    }
                    placeholder="0"
                    aria-invalid={invalidRange}
                    aria-describedby={invalidRange ? priceErrorId : undefined}
                    className="mt-1 bg-white px-3"
                  />
                </label>
                <label className="min-w-0 text-xs text-muted-foreground">
                  До
                  <Input
                    aria-label="Цена до"
                    type="number"
                    min="0"
                    step="any"
                    value={draft.priceMax}
                    onChange={(event) =>
                      setDraft({ ...draft, priceMax: event.target.value })
                    }
                    placeholder="Любая"
                    aria-invalid={invalidRange}
                    aria-describedby={invalidRange ? priceErrorId : undefined}
                    className="mt-1 bg-white px-3"
                  />
                </label>
              </div>
            </fieldset>
          </FilterDropdown>
          {filters
            .filter((filter) => filter.options?.length)
            .map((filter) => (
              <select
                key={filter.key}
                aria-label={filter.label}
                value={draft.attributes[filter.key] ?? 'all'}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    attributes: {
                      ...draft.attributes,
                      [filter.key]: event.target.value,
                    },
                  })
                }
                className={selectClass}
              >
                <option value="all">{filter.label}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          <Button
            type="submit"
            size="sm"
            disabled={invalidRange}
            className="min-h-11 rounded-md px-3 text-sm md:min-h-10"
          >
            <FiCheck aria-hidden="true" />
            Применить
          </Button>
          <button
            type="button"
            onClick={reset}
            aria-label="Сбросить фильтры"
            title="Сбросить фильтры"
            className="flex h-11 w-11 shrink-0 md:h-10 md:w-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary"
          >
            <FiX aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        {invalidRange && (
          <p
            id={priceErrorId}
            role="alert"
            className="mt-3 text-sm text-destructive"
          >
            {invalidPrice
              ? 'Укажите цену не меньше 0.'
              : 'Цена «до» должна быть не меньше цены «от».'}
          </p>
        )}
      </form>
    </section>
  )
}

function FilterDropdown({
  label,
  active,
  children,
}: {
  label: string
  active: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const closeOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        ref.current.open = false
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('focusin', closeOutside)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('focusin', closeOutside)
    }
  }, [])
  return (
    <details
      ref={ref}
      name="catalog-parameter"
      className="group sm:relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && ref.current?.open) {
          event.preventDefault()
          ref.current.open = false
          ref.current.querySelector('summary')?.focus()
        }
      }}
    >
      <summary
        className={`flex h-11 cursor-pointer list-none md:h-10 items-center gap-2 rounded-md border px-3 text-sm [&::-webkit-details-marker]:hidden ${active ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-muted'} group-open:border-primary/40`}
      >
        {label}
        {active && (
          <span
            aria-label="Задан"
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
        <FiChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-muted-foreground group-open:rotate-180"
        />
      </summary>
      <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-lg border border-border bg-white p-4 shadow-sm sm:left-auto sm:w-72">
        {children}
      </div>
    </details>
  )
}
