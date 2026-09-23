import { useState } from 'react'
import type { Request } from '@/entities/request/model/types'
import { RequestTableRow } from '@/entities/request/ui/RequestTableRow'
import { Select } from '@/shared/ui/Select'
import { Input } from '@/shared/ui/Input'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Pagination } from '@/shared/ui/Pagination'
import { useDebouncedValue } from '@/shared/lib'
import { useAdminRequests, DeleteRequestDialog } from '@/features/admin-requests'

export function AdminRequestsPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'service' | 'product'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingRequest, setDeletingRequest] = useState<Request | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery)

  const {
    requests,
    pagination,
    isLoading,
    deleteRequest,
    handlePageChange,
  } = useAdminRequests({ search: debouncedSearch, type: selectedType })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Заявки</h1>
        <p className="mt-1 text-muted-foreground">
          Управление заявками клиентов
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="w-full md:w-56">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Тип заявки
          </label>
          <Select
            options={[
              { value: 'all', label: 'Все заявки' },
              { value: 'service', label: 'На услуги' },
              { value: 'product', label: 'На продукты' },
            ]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | 'service' | 'product')}
          />
        </div>

        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Поиск
          </label>
          <Input
            placeholder="Поиск по имени, телефону, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && requests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка заявок...</p>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Клиент</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Тип</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Комментарий</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Файлы</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Дата</th>
                  <th className="w-24 px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <RequestTableRow
                    key={request.id}
                    request={request}
                    onDelete={(id: string) => {
                      const req = requests.find((r) => r.id === id)
                      if (req) setDeletingRequest(req)
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                onDelete={(id: string) => {
                  const req = requests.find((r) => r.id === id)
                  if (req) setDeletingRequest(req)
                }}
              />
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
      ) : (
        <EmptyState
          title="Заявки не найдены"
          description={
            searchQuery || selectedType !== 'all'
              ? 'Измените параметры фильтрации или поиска'
              : 'Заявок пока нет'
          }
        />
      )}

      {deletingRequest && (
        <DeleteRequestDialog
          open={!!deletingRequest}
          onOpenChange={(open) => !open && setDeletingRequest(null)}
          request={deletingRequest}
          onDelete={deleteRequest}
        />
      )}
    </div>
  )
}