import { useState, useMemo } from 'react'
import { FiPlus } from 'react-icons/fi'
import type { Product } from '@/entities/product/model/types'
import type { Category } from '@/entities/category'
import { ProductTableRow } from '@/entities/product/ui/ProductTableRow'
import { Select } from '@/shared/ui/Select'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Pagination } from '@/shared/ui/Pagination'
import { useDebouncedValue } from '@/shared/lib'
import { useAdminCategories, CategoriesSection } from '@/features/admin-categories'
import { useAdminProducts, ProductFormModal, DeleteProductDialog } from '@/features/admin-products'

export function AdminProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const {
    categories: categoriesList,
    isLoading: categoriesLoading,
    loadCategories,
  } = useAdminCategories()

  const debouncedSearch = useDebouncedValue(searchQuery)

  const {
    products: productsList,
    pagination,
    isLoading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    handlePageChange,
  } = useAdminProducts({
    search: debouncedSearch,
    category: selectedCategory,
    subcategory: selectedSubcategory,
  })

  const currentCategory = useMemo(
    () => categoriesList.find((c: Category) => c.slug === selectedCategory),
    [categoriesList, selectedCategory],
  )

  const filteredSubcategories = currentCategory?.subcategories ?? []

  const categoryOptions = useMemo(
    () =>
      categoriesList.map((cat: Category) => ({
        value: cat.slug,
        label: cat.name,
      })),
    [categoriesList],
  )

  const subcategoryOptions = useMemo(
    () =>
      filteredSubcategories.map((sub) => ({
        value: sub.slug,
        label: sub.name,
      })),
    [filteredSubcategories],
  )

  const isLoading = categoriesLoading || productsLoading

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Каталог продуктов</h1>
        <p className="mt-1 text-muted-foreground">
          Управление продуктами, категориями и субкатегориями
        </p>
      </div>

      <CategoriesSection
        categories={categoriesList}
        isLoading={categoriesLoading}
        onRefresh={loadCategories}
      />

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="w-full md:w-56">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Категория
          </label>
          <Select
            options={[{ value: '', label: 'Все категории' }, ...categoryOptions]}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedSubcategory('')
            }}
          />
        </div>

        <div className="w-full md:w-56">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Субкатегория
          </label>
          <Select
            options={[{ value: '', label: 'Все субкатегории' }, ...subcategoryOptions]}
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
          />
        </div>

        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Поиск
          </label>
          <Input
            placeholder="Поиск по названию или SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          <FiPlus className="h-5 w-5" />
          <span className="hidden sm:inline">Добавить продукт</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </div>

      {isLoading && productsList.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка продуктов...</p>
        </div>
      ) : productsList.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-16 px-4 py-3 text-left font-semibold text-muted-foreground">Фото</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Название</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ГОСТ</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Состояние</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Масса</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Остаток</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Цена</th>
                  <th className="w-24 px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    onEdit={(product: Product) => setEditingProduct(product)}
                    onDelete={(id: string) => {
                      const product = productsList.find((p: Product) => p.id === id)
                      if (product) setDeletingProduct(product)
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {productsList.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onEdit={(product: Product) => setEditingProduct(product)}
                onDelete={(id: string) => {
                  const product = productsList.find((p: Product) => p.id === id)
                  if (product) setDeletingProduct(product)
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
          title="Продукты не найдены"
          description={
            searchQuery || selectedCategory || selectedSubcategory
              ? 'Измените параметры фильтрации или поиска'
              : 'Добавьте первый продукт в каталог'
          }
        />
      )}

      <ProductFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={createProduct}
        categories={categoriesList}
      />

      {editingProduct && (
        <ProductFormModal
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          product={editingProduct}
          onCreate={createProduct}
          onUpdate={updateProduct}
          categories={categoriesList}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          open={!!deletingProduct}
          onOpenChange={(open) => !open && setDeletingProduct(null)}
          product={deletingProduct}
          onDelete={deleteProduct}
        />
      )}
    </div>
  )
}