import type { Category } from '@/entities/category/model/types'
import type { ProductDetailed } from '@/entities/product/api/product.api'
import type { Service } from '@/entities/service/model/types'

export type DetailRoute = { kind: 'product' | 'service'; slug: string }
export type PageData = {
  url: string
  siteUrl: string
  status: number
  ssr: boolean
  categories?: Category[]
  product?: ProductDetailed
  service?: Service
}

export function detailRoute(pathname: string): DetailRoute | null {
  const product = pathname.match(/^\/catalog\/[^/]+\/(?:[^/]+\/)?product\/([^/]+)\/?$/)
  const service = pathname.match(/^\/services\/([^/]+)\/?$/)
  const match = product || service
  if (!match) return null
  try { return { kind: product ? 'product' : 'service', slug: decodeURIComponent(match[1]) } } catch { return null }
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

export function isKnownPath(pathname: string): boolean {
  return !!detailRoute(pathname) || ['/', '/catalog', '/services', '/about', '/contacts', '/delivery', '/calculator', '/privacy', '/cart', '/admin'].includes(pathname) || pathname.startsWith('/admin/')
}
