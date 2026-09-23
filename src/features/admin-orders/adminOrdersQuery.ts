import type { GetOrdersParams, OrderStatus } from '@/entities/order/model/types'

export const ADMIN_ORDERS_PER_PAGE = 20

export interface AdminOrdersFilters {
  search?: string
  status?: OrderStatus | 'all'
}

const filled = (value?: string): string | undefined => {
  const trimmed = value?.trim()
  return trimmed && trimmed !== 'all' ? trimmed : undefined
}

export function adminOrdersQuery(
  filters: AdminOrdersFilters,
  page: number,
): GetOrdersParams {
  return {
    page,
    limit: ADMIN_ORDERS_PER_PAGE,
    search: filled(filters.search),
    status: filled(filters.status) as OrderStatus | undefined,
  }
}
