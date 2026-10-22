import type { Category } from '@/entities/category/model/types'
import type { ProductDetailed } from '@/entities/product/api/product.api'
import type { Service } from '@/entities/service/model/types'
import type { ArticleFull, ArticleListItem } from '@/entities/article/model/types'
import type { Product } from '@/entities/product/model/types'
import type { PaginatedResponse } from '@/shared/api'

export type DetailRoute = { kind: 'product' | 'service' | 'article'; slug: string }
export type PageData = {
  url: string
  siteUrl: string
  status: number
  ssr: boolean
  categories?: Category[]
  catalog?: { key: string; response: PaginatedResponse<Product> }
  product?: ProductDetailed
  service?: Service
  article?: ArticleFull
  articles?: PaginatedResponse<ArticleListItem>
}

export function detailRoute(pathname: string): DetailRoute | null {
  const product = pathname.match(/^\/catalog\/[^/]+\/(?:[^/]+\/)?product\/([^/]+)\/?$/)
  const service = pathname.match(/^\/services\/([^/]+)\/?$/)
  const article = pathname.match(/^\/stati\/([^/]+)\/?$/)
  const match = product || service || article
  if (!match) return null
  try { return { kind: product ? 'product' : service ? 'service' : 'article', slug: decodeURIComponent(match[1]) } } catch { return null }
}

/**
 * Адрес статьи в другом регистре (/stati/Relsy-R65): slug в базе только [a-z0-9-], поэтому API ответил бы 404.
 * Возвращает канонический адрес для 301 до запроса к API; null — адрес уже в нижнем регистре или это не статья.
 */
export function articleSlugRedirect(route: DetailRoute | null): string | null {
  if (route?.kind !== 'article') return null
  const slug = route.slug.toLowerCase()
  return slug === route.slug ? null : `/stati/${encodeURIComponent(slug)}`
}

export function productPath(product: { categorySlug: string; subcategorySlug?: string; slug: string }): string {
  return '/catalog/' + [product.categorySlug, ...(product.subcategorySlug ? [product.subcategorySlug] : []), 'product', product.slug].map(encodeURIComponent).join('/')
}

/**
 * Какие страницы сервер отдаёт готовым HTML. Раньше — только карточки товаров и услуг, остальные
 * приходили пустыми (~37 слов, без H1). Корзина живёт в localStorage, админка — за входом: их
 * содержимое на сервере не собрать и в индекс оно не нужно, поэтому они рисуются в браузере.
 */
export function rendersOnServer(pathname: string): boolean {
  return !(pathname === '/cart' || pathname === '/admin' || pathname.startsWith('/admin/'))
}

export type CatalogSelection = { categorySlug?: string; subcategorySlug?: string }

/** Адрес списка каталога в ЧПУ: /catalog, /catalog/<раздел>, /catalog/<раздел>/<категория>. */
export function catalogPath(categorySlug?: string, subcategorySlug?: string): string {
  const slugs = categorySlug ? [categorySlug, ...(subcategorySlug ? [subcategorySlug] : [])] : []
  return ['/catalog', ...slugs.map(encodeURIComponent)].join('/')
}

/** Раздел и категория из адреса списка каталога; null — это не список каталога (карточка товара, другая страница). */
export function catalogSelection(pathname: string): CatalogSelection | null {
  const match = pathname.match(/^\/catalog(?:\/([^/]+)(?:\/([^/]+))?)?\/?$/)
  if (!match) return null
  try { return { categorySlug: match[1] && decodeURIComponent(match[1]), subcategorySlug: match[2] && decodeURIComponent(match[2]) } } catch { return null }
}

/**
 * До 16.10.2026 разделы жили на /catalog?category=…&subcategory=… — такие адреса уже в индексе и в закладках.
 * Возвращает ЧПУ для 301 (поиск, фильтры и страница сохраняются); null — переводить некуда.
 */
export function legacyCatalogRedirect(pathname: string, searchParams: URLSearchParams): string | null {
  const categorySlug = searchParams.get('category')
  if (pathname !== '/catalog' || !categorySlug) return null
  const rest = new URLSearchParams(searchParams)
  rest.delete('category')
  rest.delete('subcategory')
  return catalogPath(categorySlug, searchParams.get('subcategory') || undefined) + (rest.size ? `?${rest}` : '')
}

/**
 * Раздел или категория в адресе каталога, которых нет в базе (/catalog/test). Раньше такой адрес
 * открывал обычный каталог с кодом 200 — для поисковиков это дубль; теперь сервер отвечает 404.
 */
export function isUnknownCatalogSelection({ categorySlug, subcategorySlug }: CatalogSelection, categories: Pick<Category, 'slug' | 'subcategories'>[]): boolean {
  const category = categorySlug ? categories.find((item) => item.slug === categorySlug) : undefined
  if (categorySlug && !category) return true
  return !!subcategorySlug && !category?.subcategories?.some((item) => item.slug === subcategorySlug)
}

/** Номер страницы списка статей из ?page=: целое от 1, всё остальное (мусор, 0, минус, дробь) — первая страница. */
export function articlesPage(searchParams: URLSearchParams): number {
  const raw = searchParams.get('page') ?? ''
  const page = /^\d+$/.test(raw) ? Number(raw) : 1
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

export function isKnownPath(pathname: string): boolean {
  return !!detailRoute(pathname) || !!catalogSelection(pathname) || ['/', '/catalog', '/services', '/about', '/contacts', '/delivery', '/calculator', '/stati', '/privacy', '/cart', '/admin'].includes(pathname) || pathname.startsWith('/admin/')
}
