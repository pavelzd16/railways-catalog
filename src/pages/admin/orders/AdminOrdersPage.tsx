import { useState } from 'react'
import { FiSearch, FiEye, FiX } from 'react-icons/fi'
import { useAdminOrders } from '@/features/admin-orders'
import { Dialog } from '@/shared/ui/Dialog'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Pagination } from '@/shared/ui/Pagination'
import { getImageUrl } from '@/shared/lib'
import type { OrderStatus } from '@/entities/order/model/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from '@/entities/order/model/types'

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  })),
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminOrdersPage() {
  const {
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
  } = useAdminOrders()

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const handleViewOrder = async (orderId: string) => {
    await loadOrderById(orderId)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedOrder(null)
  }

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return
    setIsChangingStatus(true)
    await updateOrderStatus(selectedOrder.id, status)
    setIsChangingStatus(false)
  }

  const getTotalItems = () => {
    if (!selectedOrder) return 0
    return selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-2 text-[hsl(var(--foreground))]">Заказы</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Управление заказами клиентов</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру или клиенту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="w-full sm:w-48"
        />
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка заказов...</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Ошибка загрузки"
          description={error}
          action={
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={
            searchQuery || statusFilter !== 'all'
              ? 'Заказы не найдены'
              : 'Заказов пока нет'
          }
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Измените параметры фильтрации или поиска'
              : 'Когда пользователи оформят заказы, они появятся здесь'
          }
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Заказ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Клиент
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Товары
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Сумма
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Дата
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono font-semibold text-primary">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{order.name}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} шт.
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold">
                        {order.totalAmount.toLocaleString('ru-RU')} ₽
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                        className="gap-2"
                      >
                        <FiEye className="h-4 w-4" />
                        Просмотр
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="font-mono font-semibold text-primary">
                      {order.orderNumber}
                    </span>
                    <div className="text-sm font-medium mt-1">{order.name}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                  </div>
                  <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} шт.
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {order.totalAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order.id)}
                    className="gap-2"
                  >
                    <FiEye className="h-4 w-4" />
                    Просмотр
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {selectedOrder && (
        <Dialog
          open={isDetailOpen}
          onOpenChange={handleCloseDetail}
          title={`Заказ ${selectedOrder.orderNumber}`}
          className="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant={ORDER_STATUS_VARIANTS[selectedOrder.status]}>
                {ORDER_STATUS_LABELS[selectedOrder.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <h3 className="font-bold mb-3">Контактные данные</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Клиент:</span>
                  <span className="font-medium">{selectedOrder.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Телефон:</span>
                  <span>{selectedOrder.phone}</span>
                </div>
                {selectedOrder.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedOrder.email}</span>
                  </div>
                )}
                {selectedOrder.address && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Адрес:</span>
                    <span className="text-right">{selectedOrder.address}</span>
                  </div>
                )}
                {selectedOrder.comment && (
                  <div className="pt-2 mt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Комментарий:</span>
                    <p className="text-sm">{selectedOrder.comment}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Товары в заказе</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.productImage ? (
                        <img
                          src={getImageUrl(item.productImage)}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productTitle}</p>
                      <p className="text-xs text-muted-foreground">Арт. {item.productSku}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span>
                          {item.quantity} шт × {item.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {(item.quantity * item.price).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Итого ({getTotalItems()} шт):</span>
                <span className="text-xl font-bold text-primary">
                  {selectedOrder.totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-bold mb-3">Изменить статус</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => {
                  const isActive = selectedOrder.status === status
                  return (
                    <Button
                      key={status}
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      disabled={isChangingStatus || isActive}
                      onClick={() => handleStatusChange(status)}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={handleCloseDetail} className="gap-2">
                <FiX className="h-4 w-4" />
                Закрыть
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}