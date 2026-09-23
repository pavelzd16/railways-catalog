import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import type { Service } from '@/entities/service/model/types'
import { ServiceTableRow } from '@/entities/service/ui/ServiceTableRow'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Pagination } from '@/shared/ui/Pagination'
import { useDebouncedValue } from '@/shared/lib'
import { useAdminServices, ServiceFormModal, DeleteServiceDialog } from '@/features/admin-services'

export function AdminServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery)

  const {
    services,
    pagination,
    isLoading,
    createService,
    updateService,
    deleteService,
    handlePageChange,
  } = useAdminServices({ search: debouncedSearch })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Каталог услуг</h1>
        <p className="mt-1 text-muted-foreground">
          Управление услугами компании
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Поиск
          </label>
          <Input
            placeholder="Поиск по названию или slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          <FiPlus className="h-5 w-5" />
          <span className="hidden sm:inline">Добавить услугу</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </div>

      {isLoading && services.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка услуг...</p>
        </div>
      ) : services.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-16 px-4 py-3 text-left font-semibold text-muted-foreground">Фото</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Название</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Описание</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Особенности</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Создано</th>
                  <th className="w-24 px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <ServiceTableRow
                    key={service.id}
                    service={service}
                    onEdit={(service: Service) => setEditingService(service)}
                    onDelete={(id: string) => {
                      const service = services.find((s: Service) => s.id === id)
                      if (service) setDeletingService(service)
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {services.map((service) => (
              <ServiceTableRow
                key={service.id}
                service={service}
                onEdit={(service: Service) => setEditingService(service)}
                onDelete={(id: string) => {
                  const service = services.find((s: Service) => s.id === id)
                  if (service) setDeletingService(service)
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
          title="Услуги не найдены"
          description={
            searchQuery
              ? 'Измените параметры поиска'
              : 'Добавьте первую услугу в каталог'
          }
        />
      )}

      <ServiceFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={createService}
      />

      {editingService && (
        <ServiceFormModal
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
          onCreate={createService}
          onUpdate={updateService}
        />
      )}

      {deletingService && (
        <DeleteServiceDialog
          open={!!deletingService}
          onOpenChange={(open) => !open && setDeletingService(null)}
          service={deletingService}
          onDelete={deleteService}
        />
      )}
    </div>
  )
}