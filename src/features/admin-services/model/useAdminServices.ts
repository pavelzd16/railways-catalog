import { useState, useEffect, useCallback, useRef } from 'react'
import type { Service, CreateServiceDto, UpdateServiceDto } from '@/entities/service/model/types'
import type { PaginationMeta } from '@/shared/api'
import { serviceApi } from '@/entities/service/api/service.api'
import {
  ADMIN_SERVICES_PER_PAGE,
  adminServicesQuery,
  type AdminServicesFilters,
} from './adminServicesQuery'

interface UseAdminServicesReturn {
  services: Service[]
  pagination: PaginationMeta
  isLoading: boolean
  error: string | null
  loadServices: (page?: number) => Promise<void>
  createService: (dto: CreateServiceDto, image: File | null) => Promise<void>
  updateService: (id: string, dto: UpdateServiceDto, image: File | null) => Promise<void>
  deleteService: (id: string) => Promise<void>
  handlePageChange: (page: number) => void
}

export function useAdminServices(filters: AdminServicesFilters = {}): UseAdminServicesReturn {
  const { search = '' } = filters
  const [services, setServices] = useState<Service[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ADMIN_SERVICES_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const pageRef = useRef(1)

  const loadServices = useCallback(async (page: number = 1) => {
    pageRef.current = page
    const attempt = ++requestRef.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await serviceApi.getAll(adminServicesQuery({ search }, page))
      if (attempt !== requestRef.current) return
      setServices(response.items)
      setPagination(response.pagination)
    } catch (err: any) {
      if (attempt !== requestRef.current) return
      setError(err.message || 'Ошибка загрузки услуг')
    } finally {
      if (attempt === requestRef.current) setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadServices(1)
  }, [loadServices])

  const createService = useCallback(async (dto: CreateServiceDto, image: File | null) => {
    try {
      await serviceApi.create(dto, image)
      await loadServices(pageRef.current)
    } catch (err: any) {
      throw new Error(err.message || 'Ошибка создания услуги')
    }
  }, [loadServices])

  const updateService = useCallback(async (id: string, dto: UpdateServiceDto, image: File | null) => {
    try {
      await serviceApi.update(id, dto, image)
      await loadServices(pageRef.current)
    } catch (err: any) {
      throw new Error(err.message || 'Ошибка обновления услуги')
    }
  }, [loadServices])

  const deleteService = useCallback(async (id: string) => {
    try {
      await serviceApi.delete(id)
      await loadServices(pageRef.current)
    } catch (err: any) {
      throw new Error(err.message || 'Ошибка удаления услуги')
    }
  }, [loadServices])

  const handlePageChange = useCallback((page: number) => {
    loadServices(page)
  }, [loadServices])

  return {
    services,
    pagination,
    isLoading,
    error,
    loadServices,
    createService,
    updateService,
    deleteService,
    handlePageChange,
  }
}
