import { useState, useEffect, useCallback, useRef } from 'react'
import type { Request } from '@/entities/request/model/types'
import type { PaginationMeta } from '@/shared/api'
import { requestApi } from '@/entities/request/api/request.api'
import {
  ADMIN_REQUESTS_PER_PAGE,
  adminRequestsQuery,
  type AdminRequestsFilters,
} from './adminRequestsQuery'

interface UseAdminRequestsReturn {
  requests: Request[]
  pagination: PaginationMeta
  isLoading: boolean
  error: string | null
  loadRequests: (page?: number) => Promise<void>
  deleteRequest: (id: string) => Promise<void>
  handlePageChange: (page: number) => void
}

export function useAdminRequests(filters: AdminRequestsFilters = {}): UseAdminRequestsReturn {
  const { search = '', type = 'all' } = filters
  const [requests, setRequests] = useState<Request[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ADMIN_REQUESTS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const pageRef = useRef(1)

  const loadRequests = useCallback(async (page: number = 1) => {
    pageRef.current = page
    const attempt = ++requestRef.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await requestApi.getAll(adminRequestsQuery({ search, type }, page))
      if (attempt !== requestRef.current) return
      setRequests(response.items)
      setPagination(response.pagination)
    } catch (err: any) {
      if (attempt !== requestRef.current) return
      setError(err.message || 'Ошибка загрузки заявок')
    } finally {
      if (attempt === requestRef.current) setIsLoading(false)
    }
  }, [search, type])

  useEffect(() => {
    loadRequests(1)
  }, [loadRequests])

  const deleteRequest = useCallback(async (id: string) => {
    try {
      await requestApi.delete(id)
      await loadRequests(pageRef.current)
    } catch (err: any) {
      throw new Error(err.message || 'Ошибка удаления заявки')
    }
  }, [loadRequests])

  const handlePageChange = useCallback((page: number) => {
    loadRequests(page)
  }, [loadRequests])

  return {
    requests,
    pagination,
    isLoading,
    error,
    loadRequests,
    deleteRequest,
    handlePageChange,
  }
}
