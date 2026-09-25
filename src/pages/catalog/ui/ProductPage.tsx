import { formatSpec, paragraphs, plainText } from '@/shared/lib/plain-text'
import { useCart } from '@/entities/cart'
import { ProductCard } from '@/entities/product/ui/ProductCard'
import {
  formatPrice,
  getConditionBadgeColor,
  getConditionLabel,
  getProductBreadcrumbs,
} from '@/shared/lib/catalog-helpers'
import { getImageUrl } from '@/shared/lib/product-helpers'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { PriceNote } from '@/shared/ui/PriceNote'
import { ProductImage } from '@/shared/ui/ProductImage'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { Layout } from '@/widgets/Layout'
import { VolumeTiers } from '@/widgets/volume-tiers/VolumeTiers'
import { useState } from 'react'
import { FiFileText, FiSettings, FiShoppingCart, FiTruck } from 'react-icons/fi'
import { Link, useParams } from 'react-router'
import { useProduct } from '../model/use-product'

const specLabels: Record<string, string> = {
  type: 'Тип',
  steel: 'Марка стали',
  material: 'Материал',
  length: 'Длина',
  weight: 'Масса',
  diameter: 'Диаметр',
  thickness: 'Толщина',
  size: 'Размер',
  drive: 'Привод',
}

export function ProductPage() {
  const { productSlug } = useParams<{
    categorySlug: string
    subcategorySlug: string
    productSlug: string
  }>()

  const [requestFormOpen, setRequestFormOpen] = useState(false)
  const { addToCart } = useCart()

  const {
    product,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    railLength,
    setRailLength,
    weightPerMeter,
    defaultRailLength,
    totalWeight,
    tons,
    displaySpecs,
    selectedProductImage,
    similarProducts,
    isRail,
  } = useProduct(productSlug)

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4 py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </Layout>
    )
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground">
            {error ?? 'Товар не найден'}
          </h1>
          <Link
            to="/catalog"
            className="mt-4 inline-block text-primary hover:underline"
          >
            ← Вернуться в каталог
          </Link>
        </div>
      </Layout>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  const breadcrumbs = getProductBreadcrumbs(
    product,
    product.category?.name || 'Все',
    product.subcategory?.name,
  )

  return (
    <Layout>
      <RequestFormModal
        open={requestFormOpen}
        onOpenChange={setRequestFormOpen}
        productId={product.id}
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-10">
        {/* Приписка нарочно еле заметна: юридическая оговорка, а не призыв к действию. */}
        <div className="mb-6 flex flex-col lg:mb-0 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8">
          <Breadcrumbs items={breadcrumbs} />

          <p className="-mt-4 text-[11px] uppercase tracking-wide text-muted-foreground/60 lg:mt-0 lg:shrink-0 lg:text-right">
            Информация, представленная на сайте, не является публичной офертой
          </p>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-4 aspect-4/3 overflow-hidden rounded-xl border border-border bg-muted">
              <ProductImage
                src={getImageUrl(selectedProductImage)}
                alt={product.title}
                className="h-full w-full object-cover"
                fallbackClassName="h-full w-full"
                iconClassName="h-24 w-24"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-primary'
                    }`}
                  >
                    <ProductImage
                      src={getImageUrl(image)}
                      alt=""
                      className="h-full w-full object-cover"
                      fallbackClassName="h-full w-full"
                      iconClassName="h-8 w-8"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-md border px-2 py-1 text-xs font-medium ${getConditionBadgeColor(
                  product.condition,
                )}`}
              >
                {getConditionLabel(product.condition)}
              </span>

              <span className="text-sm text-muted-foreground">
                Артикул: {product.sku}
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
              {product.title}
            </h1>

            {product.gost && (
              <p className="mb-5 text-sm text-muted-foreground">
                {product.gost}
              </p>
            )}

            <div className="mb-5">
              {!product.price ? (
                <span className="text-2xl font-bold text-primary">
                  По запросу
                </span>
              ) : (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    от {formatPrice(product.price)} ₽
                  </span>

                  <span className="text-sm text-muted-foreground">
                    за тонну
                  </span>
                </div>
              )}
              <PriceNote variant="chip" className="mt-3" />
            </div>

            <VolumeTiers
              categorySlug={product.category?.slug}
              subcategorySlug={product.subcategory?.slug}
              className="mb-6"
              onRequest={() => setRequestFormOpen(true)}
            />

            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="mb-1 text-sm text-muted-foreground">Наличие</div>

              <div className="font-bold text-foreground">
                {product.stock > 100
                  ? '✓ В наличии, отгрузка 1-3 дня'
                  : product.stock > 0
                    ? `✓ Остаток: ${product.stock} шт`
                    : 'Под заказ, срок 7-14 дней'}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <FiSettings className="h-5 w-5 text-primary" />

                <h2 className="text-2xl font-bold text-foreground">
                  Характеристики
                </h2>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {displaySpecs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-center justify-between gap-6 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {specLabels[spec.id] ?? plainText(spec.label)}
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {formatSpec(spec.value, spec.unit)}
                    </span>
                  </div>
                ))}

                {product.category && (
                  <div className="flex items-center justify-between gap-6 border-b border-border px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Категория
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {product.category.name}
                    </span>
                  </div>
                )}

                {product.subcategory && (
                  <div className="flex items-center justify-between gap-6 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Подкатегория
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {product.subcategory.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={() => setRequestFormOpen(true)}
                className="flex-1"
              >
                Запросить спецификацию
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleAddToCart}
              >
                <FiShoppingCart className="h-5 w-5" />
                <span>В корзину</span>
              </Button>
            </div>
          </div>
        </div>

        <section className="mb-12 border-t border-border pt-10">
          <div className="mb-5 flex items-center gap-2">
            <FiFileText className="h-5 w-5 text-primary" />

            <h2 className="section-title">Описание</h2>
          </div>

          <div className="max-w-4xl text-base leading-7 text-muted-foreground">
            {(
              paragraphs(product.description || `${product.title} — высококачественная продукция, соответствующая всем требованиям ГОСТ и техническим условиям. Изделие прошло обязательную сертификацию и готово к отгрузке.`)
            ).map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-12 border-t border-border pt-10">
          <div className="mb-5 flex items-center gap-2">
            <FiTruck className="h-5 w-5 text-primary" />

            <h2 className="section-title">Доставка и оплата</h2>
          </div>

          {/* Общий для всех товаров текст держим коротким и вне блока «Описание»:
              одинаковые абзацы на сотнях карточек делают страницы похожими для поисковиков. */}
          <div className="max-w-4xl text-base leading-7 text-muted-foreground">
            <p className="mb-4">
              Поставляем по России и в страны СНГ ж/д, автомобильным и смешанным
              транспортом, возможен самовывоз со склада в Зеленодольске, упаковка
              и консервация груза. Отгрузка в течение 1-3 дней при наличии.
              Условия оплаты обсуждаются, постоянным клиентам — скидки.
            </p>

            <Link
              to="/delivery"
              className="inline-block font-medium text-primary hover:underline"
            >
              Подробнее о доставке →
            </Link>
          </div>
        </section>

        {isRail && (
          <section className="mb-12 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold text-foreground">
              Калькулятор массы рельса
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Тип рельса
                </label>

                <div className="flex h-11 items-center rounded-lg border border-border bg-muted/50 px-4 text-sm text-foreground">
                  {product.specs?.find((spec) => spec.id === 'type')?.value ??
                    product.title}
                </div>
              </div>

              <div>
                <label
                  htmlFor="rail-length"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Длина, м
                </label>

                <Input
                  id="rail-length"
                  type="number"
                  min="0"
                  step="0.1"
                  value={railLength}
                  onChange={(event) => setRailLength(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Итого
                </label>

                <div className="flex h-11 items-center rounded-lg bg-muted px-4 font-bold text-foreground">
                  {totalWeight.toFixed(1)} кг ({tons.toFixed(3)} т)
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Расчёт выполнен исходя из массы {weightPerMeter} кг/м.
              {defaultRailLength
                ? ` Стандартная длина товара: ${defaultRailLength} м.`
                : ''}
            </p>
          </section>
        )}

        {similarProducts.length > 0 && (
          <section className="border-t border-border pt-10">
            <h2 className="section-title mb-6">Похожие товары</h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
