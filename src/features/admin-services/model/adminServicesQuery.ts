import type { GetServicesParams } from '@/entities/service/model/types'

export const ADMIN_SERVICES_PER_PAGE = 20

export interface AdminServicesFilters {
  search?: string
}

const filled = (value?: string): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function adminServicesQuery(
  filters: AdminServicesFilters,
  page: number,
): GetServicesParams {
  return {
    page,
    limit: ADMIN_SERVICES_PER_PAGE,
    search: filled(filters.search),
  }
}
