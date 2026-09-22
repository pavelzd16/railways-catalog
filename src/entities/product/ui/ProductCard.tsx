import { productPath } from '@/shared/seo/route-data'
import { plainText } from '@/shared/lib/plain-text'
import { useState } from 'react'
import { Link } from 'react-router'
import type { Product } from '../model/types'
import { formatPrice, getConditionLabel } from '@/shared/lib/catalog-helpers'
import { CatalogImage } from '@/shared/ui/CatalogImage'
import { Button } from '@/shared/ui/Button'
import { PriceNote } from '@/shared/ui/PriceNote'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton'

export function ProductCard({ product }: { product: Product }) {
  const [requestOpen, setRequestOpen] = useState(false)
  const url = productPath(product)
  const unitSpec = product.specs?.find((spec) =>
    spec.label.toLowerCase().includes('единица'),
  )
  const unit = unitSpec ? plainText(unitSpec.value).replace(/[;.]$/, '') : ''
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-white transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-sm">
      <Link
        to={url}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-[4/3] overflow-hidden border-b border-border"
      >
        <CatalogImage
          src={product.images[0]}
          alt={product.title}
          className="p-4"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[13px]">
          <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
            {getConditionLabel(product.condition)}
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span
              className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-muted-foreground'}`}
            />
            {product.stock > 0 ? 'В наличии' : 'Под заказ'}
          </span>
        </div>
        <h3 className="mb-3 text-2xl font-bold leading-tight">
          <Link to={url} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <dl className="mb-5 space-y-1 text-[13px] text-muted-foreground">
          <div>
            <dt className="inline">Артикул: </dt>
            <dd className="inline">{product.sku}</dd>
          </div>
          <div>
            <dt className="inline">ГОСТ: </dt>
            <dd className="inline">{product.gost || 'Не указан'}</dd>
          </div>
        </dl>
        <div className="mt-auto">
          <p className="mb-4 text-xl font-bold">
            {!product.price
              ? 'Цена по запросу'
              : `${formatPrice(product.price)} ₽`}
            {product.price != null && unit && (
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / {unit}
              </span>
            )}
            <PriceNote className="mt-1" />
          </p>
          <div className="flex items-center gap-2">
            <Button
              className="min-w-0 flex-1 px-3"
              onClick={() => setRequestOpen(true)}
            >
              Запросить
            </Button>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      <RequestFormModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        productId={product.id}
        title="Запросить цену и спецификацию"
        description={product.title}
      />
    </article>
  )
}
