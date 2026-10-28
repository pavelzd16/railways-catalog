import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { FiBookOpen, FiSearch } from 'react-icons/fi'
import { Layout } from '@/widgets/Layout'
import { normativApi } from '@/entities/normativ/api/normativ.api'
import type { NormListItem } from '@/entities/normativ/model/types'
import { normalizeCode } from '@/entities/normativ/lib/norm-code'
import { filterNorms, filtersUrl, kindGroupsWithDocs, readFilters, sectionsWithDocs, type ListFilters as Filters } from '@/entities/normativ/lib/norm-filter'
import { KIND_GROUPS, formatIntroducedAt, kindLabel } from '@/entities/normativ/lib/norm-labels'
import { useCategoryData, usePageData } from '@/shared/seo/page-context'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { NormStatus } from './NormDocumentCard'
import '../stati/stati.css'
import './normativ.css'

// Список документов приходит с сервера вместе со страницей; при переходе по ссылкам внутри сайта — догружаем.
// Копия последнего списка (только в браузере) нужна, чтобы возврат со страницы документа не мигал загрузкой.
let lastList: NormListItem[] | undefined

function useNormativList() {
  const data = usePageData()
  const [fetched, setFetched] = useState<{ list?: NormListItem[]; failed?: boolean }>({})
  useEffect(() => {
    if (data.normativList || data.status !== 200) return
    let cancelled = false
    normativApi
      .getAll()
      .then((response) => { if (!cancelled) setFetched({ list: response.items }) })
      .catch(() => { if (!cancelled) setFetched({ failed: true }) })
    return () => { cancelled = true }
  }, [data.normativList, data.status])
  // Копию читаем и пишем только в браузере: модуль на сервере живёт между запросами
  const browser = typeof window !== 'undefined'
  const list = data.normativList ?? fetched.list ?? (browser ? lastList : undefined)
  useEffect(() => { if (list) lastList = list }, [list])
  return { list, error: data.status >= 500 || (!!fetched.failed && !list) }
}

export function NormativListPage() {
  const { search, key } = useLocation()
  const { list, error } = useNormativList()
  const { categories } = useCategoryData()
  const [filters, setFilters] = useState<Filters>(() => readFilters(search))

  // Новый переход (ссылка «ГОСТы и нормативы» в подвале) читает фильтры из адреса заново: адрес без параметров = чистый список.
  // Свои правки фильтров адрес меняют через replaceState мимо роутера, key при этом не меняется.
  const lastKey = useRef(key)
  useEffect(() => {
    if (lastKey.current === key) return
    lastKey.current = key
    setFilters(readFilters(search))
  }, [key, search])

  // Поиск и фильтры работают в браузере. Адрес обновляем без перехода по роутеру: иначе данные страницы
  // сбросились бы на каждую букву. Состояние истории роутера сохраняем как было.
  const update = useCallback((next: Filters) => {
    setFilters(next)
    try { window.history.replaceState(window.history.state, '', filtersUrl(next)) } catch { /* адрес не обновился — список всё равно отфильтрован */ }
  }, [])

  const items = useMemo(() => list ?? [], [list])
  const sectionIds = useMemo(() => sectionsWithDocs(items), [items])
  const kindIds = useMemo(() => kindGroupsWithDocs(items), [items])
  // Название раздела — по порядку и именам категорий каталога; раздел без названия чипом не показываем
  const sectionChips = useMemo(
    () => categories.filter((category) => sectionIds.includes(category.slug)).map((category) => ({ id: category.slug, label: category.name })),
    [categories, sectionIds],
  )
  const razdel = sectionChips.some((chip) => chip.id === filters.razdel) ? filters.razdel : ''
  const tip = kindIds.some((id) => id === filters.tip) ? filters.tip : ''
  const shown = useMemo(() => filterNorms(items, { q: filters.q, section: razdel, kind: tip }), [items, filters.q, razdel, tip])
  const slugByCode = useMemo(() => new Map(items.map((item) => [normalizeCode(item.code), item.slug])), [items])
  const hasFilters = !!(filters.q.trim() || razdel || tip)
  const reset = () => update({ q: '', razdel: '', tip: '' })

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-14 pt-8">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'ГОСТы и нормативы' }]} />

        <div className="mb-3 inline-flex items-center gap-2.5 text-[13px] font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#151D25] text-[hsl(var(--accent))]">
            <FiBookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          Документы ПроРельс
        </div>
        <h1 className="mb-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.03em]">ГОСТы и нормативы</h1>
        <p className="mb-8 max-w-[760px] text-[15px] leading-relaxed text-muted-foreground">
          Документы на рельсы, шпалы, скрепления и крановые пути: что в них главное, действует ли документ и какие наши товары выпускают по нему.
        </p>

        {error && (
          <p className="py-12 text-center text-red-500" role="alert">
            Раздел временно недоступен. Повторите попытку позже.
          </p>
        )}
        {!list && !error && (
          <p className="py-12 text-center text-muted-foreground" role="status">
            Загрузка документов…
          </p>
        )}

        {list && list.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg font-bold">Документы скоро появятся</p>
            <p className="mt-2 text-muted-foreground">Пока можно посмотреть материалы в каталоге.</p>
            <Link to="/catalog" className="mt-4 inline-block font-bold text-[hsl(var(--primary))] hover:underline">
              Открыть каталог
            </Link>
          </div>
        )}

        {list && list.length > 0 && (
          <>
            <div className="relative mb-5 max-w-[640px]">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={filters.q}
                onChange={(event) => update({ ...filters, q: event.target.value })}
                placeholder="Номер или название: «4121», «крановые»"
                aria-label="Поиск по номеру и названию документа"
                className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-base outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {sectionChips.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Раздел каталога">
                <span className="mr-1 text-[13px] text-muted-foreground">Раздел:</span>
                {sectionChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="normativ-filter"
                    aria-pressed={razdel === chip.id}
                    onClick={() => update({ ...filters, razdel: razdel === chip.id ? '' : chip.id })}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            {kindIds.length > 1 && (
              <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Тип документа">
                <span className="mr-1 text-[13px] text-muted-foreground">Тип:</span>
                {KIND_GROUPS.filter((group) => kindIds.includes(group.id)).map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className="normativ-filter"
                    aria-pressed={tip === group.id}
                    onClick={() => update({ ...filters, tip: tip === group.id ? '' : group.id })}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mb-5 flex justify-between gap-4 border-t border-border pt-4 text-[13px]">
              <span>{hasFilters ? 'Найдено' : 'Все документы'}</span>
              <span className="text-muted-foreground" aria-live="polite">Документов: {shown.length}</span>
            </div>

            {shown.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg font-bold">Ничего не нашлось</p>
                <p className="mt-2 text-muted-foreground">Проверьте номер или уберите фильтры.</p>
                <button type="button" onClick={reset} className="mt-4 font-bold text-[hsl(var(--primary))] hover:underline">
                  Сбросить поиск и фильтры
                </button>
              </div>
            ) : (
              <ul className="grid gap-3">
                {shown.map((item) => {
                  const introduced = formatIntroducedAt(item.introducedAt)
                  const replacementSlug = item.replacedBy ? slugByCode.get(normalizeCode(item.replacedBy)) : undefined
                  return (
                    <li key={item.slug} className="normativ-row">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="normativ-chip normativ-chip--kind">{kindLabel(item.kind)}</span>
                        <NormStatus document={item} />
                        {item.status === 'replaced' && replacementSlug && (
                          <Link to={`/normativ/${encodeURIComponent(replacementSlug)}`} className="text-[13px] text-[hsl(var(--primary))] underline underline-offset-2">
                            Открыть замену
                          </Link>
                        )}
                        {introduced && <span className="text-[13px] text-muted-foreground">Введён {introduced}</span>}
                      </div>
                      <Link to={`/normativ/${encodeURIComponent(item.slug)}`} className="normativ-row-link break-words text-lg font-bold leading-snug">
                        {item.code}
                      </Link>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">{item.name}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
