import type { PageContextServer } from 'vike/types'
import { redirect, render } from 'vike/abort'
import { apiOrigins, siteUrl } from '@/renderer/server-config'
import { fetchFromApi } from '@/renderer/api-fetch'
import { articlesPage, articleSlugRedirect, catalogSelection, detailRoute, isKnownPath, isUnknownCatalogSelection, legacyCatalogRedirect, productPath, rendersOnServer, type PageData } from '@/shared/seo/route-data'
import { movedProductSlug } from '@/shared/seo/product-slug-moves'
import { catalogQuery, productQueryString } from '@/shared/lib/catalog-query'

export async function data(pageContext: PageContextServer): Promise<PageData> {
  const url = new URL(pageContext.urlOriginal, siteUrl)
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  if (pathname !== url.pathname) throw redirect(pathname + url.search, 301)
  const legacy = legacyCatalogRedirect(pathname, url.searchParams)
  if (legacy) throw redirect(legacy, 301)
  const catalog = catalogSelection(pathname)
  const route = detailRoute(pathname)
  const articleRedirect = articleSlugRedirect(route)
  if (articleRedirect) throw redirect(articleRedirect + url.search, 301)
  const result: PageData = { url: pathname + url.search, siteUrl, status: isKnownPath(pathname) ? 200 : 404, ssr: rendersOnServer(pathname) }
  const categories = (route && route.kind !== 'article') || catalog
    ? fetchFromApi(apiOrigins, '/api/product-category?limit=100', 8000).then(async (response) => response.ok ? (await response.json()).items : undefined).catch(() => undefined)
    : Promise.resolve(undefined)
  const catalogKey = catalog ? productQueryString(catalogQuery(url.searchParams, catalog.categorySlug, catalog.subcategorySlug)) : ''
  const catalogProducts = catalog
    ? fetchFromApi(apiOrigins, `/api/product?${catalogKey}`, 8000).then(async response => response.ok ? await response.json() : null).catch(() => null)
    : Promise.resolve(null)
  if (route) {
    try {
      let response = await fetchFromApi(apiOrigins, `/api/${route.kind}/${encodeURIComponent(route.slug)}`, 8000)
      const moved = route.kind === 'product' && response.status === 404 ? movedProductSlug(route.slug) : undefined
      if (moved) response = await fetchFromApi(apiOrigins, `/api/product/${encodeURIComponent(moved)}`, 8000)
      if (response.status === 404) result.status = 404
      else if (!response.ok) result.status = 503
      else {
        const value = await response.json()
        if (route.kind === 'product') result.product = value
        else if (route.kind === 'service') result.service = value
        else result.article = value
      }
    } catch { result.status = 503 }
  }
  // Список статей: нет ответа сервера — 503, страница за концом списка — 404 (мусор в ?page= даёт первую).
  if (pathname === '/stati') {
    const page = articlesPage(url.searchParams)
    try {
      const response = await fetchFromApi(apiOrigins, `/api/article?page=${page}&limit=12`, 8000)
      const value = response.ok ? await response.json() : null
      if (!value || !Array.isArray(value.items) || !value.pagination) result.status = 503
      else if (page > 1 && page > value.pagination.totalPages) result.status = 404
      else result.articles = value
    } catch { result.status = 503 }
  }
  result.categories = await categories
  if (catalog && !result.categories) result.status = 503
  if (catalog && result.categories && isUnknownCatalogSelection(catalog, result.categories)) result.status = 404
  if (catalog && result.status === 200) {
    const value = await catalogProducts
    if (!value || !Array.isArray(value.items) || !value.pagination) result.status = 503
    else if (value.pagination.page > 1 && value.pagination.page > value.pagination.totalPages) result.status = 404
    else result.catalog = { key: catalogKey, response: value }
  }
  if (result.product) {
    const canonical = productPath(result.product)
    if (pathname !== canonical) throw redirect(canonical + url.search, 301)
  }
  if (result.service) {
    const canonical = `/services/${encodeURIComponent(result.service.slug)}`
    if (pathname !== canonical) throw redirect(canonical + url.search, 301)
  }
  if (result.article) {
    const canonical = `/stati/${encodeURIComponent(result.article.slug)}`
    if (pathname !== canonical) throw redirect(canonical + url.search, 301)
  }
  if (result.status >= 400) throw render(result.status === 404 ? 404 : 503, result)
  return result
}
