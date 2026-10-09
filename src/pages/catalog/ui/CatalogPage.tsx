import { useSearchParams } from 'react-router'
import { useCatalog } from '../model/use-catalog'
import { ProductFilter } from '@/features/product-filter/ProductFilter'
import type { SortOption } from '@/entities/product/model/types'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { CatalogList } from '@/widgets/catalog-list/CatalogList'
import { CatalogCategories } from '@/widgets/catalog-categories/CatalogCategories'
import { Layout } from '@/widgets/Layout'
import { Pagination } from '@/shared/ui/Pagination'

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
            <ProductFilter
              key={JSON.stringify([
                category,
                currentSubcategory?.slug,
                filterValue,
              ])}
              value={filterValue}
              onFilterChange={handleFilterChange}
              filters={currentSubcategory?.filters ?? currentCategory?.filters}
              scope={scope}
            />
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {!loading && pagination.total > 0
                  ? `Показано ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} из ${pagination.total}`
                  : 'Материалы верхнего строения пути'}
              </p>
              <label className="flex min-w-0 items-center gap-2 text-sm">
                <span>Сортировка</span>
                <select
                  aria-label="Сортировка"
                  value={filterValue.sort}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filterValue,
                      sort: e.target.value as SortOption,
                    })
                  }
                  className="min-h-11 min-w-0 max-w-full rounded-md border border-border bg-white px-2"
                >
                  <option value="name">По названию</option>
                  <option value="popular">По популярности</option>
                  <option value="newest">Сначала новые</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                </select>
              </label>
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
