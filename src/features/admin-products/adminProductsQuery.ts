import type { GetProductsParams } from '@/entities/product'

export const ADMIN_PRODUCTS_PER_PAGE = 20

export interface AdminProductsFilters {
  search?: string
  category?: string
  subcategory?: string
}

const filled = (value?: string): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function adminProductsQuery(
  filters: AdminProductsFilters,
  page: number,
): GetProductsParams {
  return {
    page,
    limit: ADMIN_PRODUCTS_PER_PAGE,
    search: filled(filters.search),
    category: filled(filters.category),
    subcategory: filled(filters.subcategory),
  }
}
