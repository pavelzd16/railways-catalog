import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useCatalog } from '../model/use-catalog'
import {
  ProductFilter,
  type FilterState,
} from '@/features/product-filter/ProductFilter'
import type { SortOption } from '@/entities/product/model/types'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { CatalogList } from '@/widgets/catalog-list/CatalogList'
import { CatalogCategories } from '@/widgets/catalog-categories/CatalogCategories'
import { Layout } from '@/widgets/Layout'
import { Pagination } from '@/shared/ui/Pagination'

// Высота шапки после прокрутки: 72 px строки с логотипом + 1 px рамки (index.css, .is-scrolled).
const STICKY_TOP = 73

export function CatalogPage() {
  const [params] = useSearchParams()
  const category = params.get('category') ?? ''
  const {
    products,
    categories,
    currentCategory,
    currentSubcategory,
    filterValue,
    pagination,
    loading,
    error,
    handleFilterChange,
    handlePageChange,
  } = useCatalog()
  const crumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: currentCategory ? '/catalog' : undefined },
    ...(currentCategory
      ? [
          {
            label: currentCategory.name,
            href: currentSubcategory
              ? `/catalog?category=${currentCategory.slug}`
              : undefined,
          },
        ]
      : []),
    ...(currentSubcategory
      ? [{ label: currentSubcategory.name, href: undefined }]
      : []),
  ]
  const scopeName = currentCategory
    ? [currentCategory.name, currentSubcategory?.name]
        .filter(Boolean)
        .join(' → ')
    : ''
  const scope = scopeName
    ? `Поиск в разделе «${scopeName}»`
    : category
      ? undefined
      : 'Поиск по всем материалам'
  // Тот же запрос и общие фильтры, но без раздела и его собственных параметров.
  const searchAll = new URLSearchParams(params)
  for (const key of Array.from(searchAll.keys()))
    if (
      ['category', 'subcategory', 'page'].includes(key) ||
      key.startsWith('attribute_')
    )
      searchAll.delete(key)
  const searchAllHref =
    filterValue.search && (category || params.get('subcategory'))
      ? `/catalog?${searchAll}`
      : undefined
  // Панель «прилипла», когда её исходное место ушло под шапку: тогда у неё тень,
  // а новый запрос возвращает к началу списка, а не оставляет посреди старой выдачи.
  const toolbarStartRef = useRef<HTMLDivElement>(null)
  const [toolbarStuck, setToolbarStuck] = useState(false)
  useEffect(() => {
    const check = () => {
      const top = toolbarStartRef.current?.getBoundingClientRect().top
      setToolbarStuck(top !== undefined && top < STICKY_TOP)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])
  const applyFilters = (next: FilterState) => {
    const start = toolbarStartRef.current
    if (toolbarStuck && start)
      window.scrollTo({
        top: start.getBoundingClientRect().top + window.scrollY - STICKY_TOP,
      })
    handleFilterChange(next)
  }
  return (
    <Layout>
      <div className="container mx-auto px-6 py-10 xl:px-8">
        <Breadcrumbs items={crumbs} />
        <div className="mb-8">
          <h1 className="page-title">
            {currentSubcategory?.name ??
              currentCategory?.name ??
              'Каталог материалов'}
          </h1>
          <p className="mt-3 text-muted-foreground" role="status">
            {loading
              ? 'Загрузка товаров…'
              : error
                ? 'Не удалось получить товары'
                : `Найдено позиций: ${pagination.total}`}
          </p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[252px_minmax(0,1fr)]">
          <CatalogCategories key={category} categories={categories} />
          <div className="min-w-0">
            <div ref={toolbarStartRef} aria-hidden="true" />
            {/* С 768 px поиск и сортировка закреплены под шапкой: искать можно,
                не возвращаясь наверх списка. */}
            <div
              className={`catalog-toolbar z-30 mb-3 rounded-lg border px-3 py-2 md:sticky ${toolbarStuck ? 'md:shadow-[0_10px_10px_-10px_rgb(0_0_0_/_0.25)]' : ''}`}
              style={{ top: STICKY_TOP }}
            >
              <ProductFilter
                key={JSON.stringify([
                  category,
                  currentSubcategory?.slug,
                  filterValue,
                ])}
                value={filterValue}
                onFilterChange={applyFilters}
                filters={
                  currentSubcategory?.filters ?? currentCategory?.filters
                }
              />
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="min-w-0 text-[13px] text-muted-foreground">
                  {[
                    scope,
                    !loading && pagination.total > 0
                      ? `Показано ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} из ${pagination.total}`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Материалы верхнего строения пути'}
                </p>
                <label className="flex min-w-0 items-center gap-2 text-sm">
                  <span>Сортировка</span>
                  <select
                    aria-label="Сортировка"
                    value={filterValue.sort}
                    onChange={(e) =>
                      applyFilters({
                        ...filterValue,
                        sort: e.target.value as SortOption,
                      })
                    }
                    className="min-h-11 min-w-0 max-w-full rounded-md border border-border bg-white px-2 text-sm md:min-h-8"
                  >
                    <option value="name">По названию</option>
                    <option value="popular">По популярности</option>
                    <option value="newest">Сначала новые</option>
                    <option value="price-asc">Сначала дешевле</option>
                    <option value="price-desc">Сначала дороже</option>
                  </select>
                </label>
              </div>
            </div>
            <div aria-busy={loading}>
              {loading ? (
                <div
                  role="status"
                  className="divide-y divide-border border-y border-border"
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="flex h-28 animate-pulse items-center gap-4 px-3"
                    >
                      <div className="h-16 w-16 shrink-0 rounded-md bg-muted" />
                      <div className="h-5 w-1/2 rounded bg-muted" />
                    </div>
                  ))}
                  <span className="sr-only">Загрузка товаров</span>
                </div>
              ) : error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-border p-6 text-destructive"
                >
                  {error}. Обновите страницу или измените фильтры.
                </p>
              ) : (
                <CatalogList products={products} searchAllHref={searchAllHref} />
              )}
            </div>
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
        {currentCategory?.description && !currentSubcategory && (
          <section
            className="mt-12 max-w-4xl border-t border-border pt-8"
            aria-label={`О категории ${currentCategory.name}`}
          >
            <h2 className="mb-4 text-2xl font-bold">
              {currentCategory.name}: подбор материалов
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {currentCategory.description}
            </p>
          </section>
        )}
      </div>
    </Layout>
  )
}
