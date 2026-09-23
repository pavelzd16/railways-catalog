import type { GetRequestsParams } from '@/entities/request/model/types'

export const ADMIN_REQUESTS_PER_PAGE = 20

export interface AdminRequestsFilters {
  search?: string
  type?: 'all' | 'service' | 'product'
}

const filled = (value?: string): string | undefined => {
  const trimmed = value?.trim()
  return trimmed && trimmed !== 'all' ? trimmed : undefined
}

export function adminRequestsQuery(
  filters: AdminRequestsFilters,
  page: number,
): GetRequestsParams {
  return {
    page,
    limit: ADMIN_REQUESTS_PER_PAGE,
    search: filled(filters.search),
    type: filled(filters.type) as GetRequestsParams['type'],
  }
}
