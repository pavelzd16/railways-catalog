import { useCallback, useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import type { Order, OrderStatus } from '@/entities/order/model/types'
import type { PaginationMeta } from '@/shared/api'
import { orderApi } from '@/entities/order/api/order.api'
import { useDebouncedValue } from '@/shared/lib'
import { ADMIN_ORDERS_PER_PAGE, adminOrdersQuery } from './adminOrdersQuery'

interface UseAdminOrdersReturn {
  orders: Order[]
  pagination: PaginationMeta
  isLoading: boolean
  error: string | null
  selectedOrder: Order | null
  searchQuery: string
  statusFilter: OrderStatus | 'all'
  setSearchQuery: (value: string) => void
  setStatusFilter: (value: OrderStatus | 'all') => void
  loadOrderById: (id: string) => Promise<Order | null>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>
  setSelectedOrder: (order: Order | null) => void
  handlePageChange: (page: number) => void
  reloadOrders: () => Promise<void>
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ADMIN_ORDERS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const debouncedSearch = useDebouncedValue(searchQuery)
  const requestRef = useRef(0)
  const pageRef = useRef(1)

  const loadOrders = useCallback(async (page: number = 1) => {
    pageRef.current = page
    const attempt = ++requestRef.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await orderApi.getAll(
        adminOrdersQuery({ search: debouncedSearch, status: statusFilter }, page),
      )
      if (attempt !== requestRef.current) return
      setOrders(response.items)
      setPagination(response.pagination)
    } catch (err: any) {
      if (attempt !== requestRef.current) return
      setError(err.message || 'Ошибка загрузки заказов')
    } finally {
      if (attempt === requestRef.current) setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    loadOrders(1)
  }, [loadOrders])

  const loadOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const order = await orderApi.getById(id)
      setSelectedOrder(order)
      return order
    } catch (err: any) {
      toast.error(err.message || 'Ошибка загрузки заказа')
      return null
    }
  }, [])

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<boolean> => {
      try {
        const updatedOrder = await orderApi.update(id, { status })
        setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)))
        if (selectedOrder?.id === id) {
          setSelectedOrder(updatedOrder)
        }
        toast.success('Статус заказа обновлён')
        return true
      } catch (err: any) {
        toast.error(err.message || 'Ошибка обновления статуса')
        return false
      }
    },
    [selectedOrder],
  )

  const handlePageChange = useCallback((page: number) => {
    loadOrders(page)
  }, [loadOrders])

  const reloadOrders = useCallback(async () => {
    await loadOrders(pageRef.current)
  }, [loadOrders])

  return {
    orders,
    pagination,
    isLoading,
    error,
    selectedOrder,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    loadOrderById,
    updateOrderStatus,
    setSelectedOrder,
    handlePageChange,
    reloadOrders,
  }
}
