import { Link } from 'react-router'
import { AddToCartButton } from '@/features/cart'
import type { Product, ProductCondition } from '@/entities/product/model/types'
import { formatPrice } from '@/shared/lib/catalog-helpers'
import { formatSpec, plainText } from '@/shared/lib/plain-text'
import { priceUnitLabel } from '@/shared/lib/price-unit'
import { productPath } from '@/shared/seo/route-data'
import { CatalogImage } from '@/shared/ui/CatalogImage'
import type { ArticleProduct, ArticleSpec } from '../model/types'

// Корзина хранит товар каталога целиком, а читает из него id, артикул, название, адрес, цену и фото —
// собираем их из товара статьи, тип корзины не расширяем.
function toCartProduct(product: ArticleProduct): Product {
  return {
    id: product.id,
    sku: product.sku,
    title: product.title,
    slug: product.slug,
    gost: '',
    price: product.price ?? null,
    stock: product.stock,
    condition: product.condition as ProductCondition,
    images: product.images,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug ?? undefined,
  }
}

// Характеристики из метки {Высота|Масса 1 м}; если их нет или ни одна не нашлась у товара — первые три
// (без «Единицы измерения» и длинных описаний, как у сборщика статей).
function pickSpecs(specs: ArticleSpec[], labels: string[]): ArticleSpec[] {
  const chosen = labels.flatMap((label) => specs.filter((spec) => spec.label === label).slice(0, 1))
  if (chosen.length) return chosen
  return specs
    .filter((spec) => !spec.label.toLowerCase().includes('единица') && plainText(spec.value).length <= 60)
    .slice(0, 3)
}

/** Живая карточка товара в тексте статьи: фото, название, характеристики, наличие, цена, «В корзину». */
export function ArticleProductCard({ product, specs }: { product: ArticleProduct; specs: string[] }) {
  const url = productPath({ ...product, subcategorySlug: product.subcategorySlug ?? undefined })
  const unit = priceUnitLabel(product.specs)
  const shown = pickSpecs(product.specs, specs)
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[10px] border border-[#e1e5e9] bg-white">
      <Link to={url} tabIndex={-1} aria-hidden="true" className="block h-36 shrink-0 overflow-hidden bg-[#eef1f4]">
        <CatalogImage
          src={product.images[0]}
          alt={product.title}
          sizes="(min-width: 640px) 380px, calc(100vw - 32px)"
          className="p-3"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 text-sm">
        <h3 className="mb-2 text-base font-bold leading-snug text-foreground">
          <Link to={url} className="hover:text-[hsl(var(--primary))]">
            {product.title}
          </Link>
        </h3>
        {shown.length > 0 && (
          <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
            {shown.map((spec) => `${plainText(spec.label)}: ${formatSpec(spec.value, spec.unit ?? undefined)}`).join(' · ')}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className={`text-[13px] font-bold ${product.stock > 0 ? 'text-success' : 'text-muted-foreground'}`}>
            {product.stock > 0 ? 'В наличии' : 'Под заказ'}
          </span>
          <span className="font-bold text-foreground">
            {product.price ? `${formatPrice(product.price)} ₽` : 'Цена по запросу'}
            {product.price && unit ? <span className="text-[13px] font-normal text-muted-foreground"> {unit}</span> : null}
          </span>
        </div>
        <div className="mt-3">
          <AddToCartButton product={toCartProduct(product)} variant="accent" label="В корзину" />
        </div>
      </div>
    </article>
  )
}
