import { Link } from 'react-router'
import { FiArrowRight } from 'react-icons/fi'
import type { ArticleBlock } from '../lib/article-body'
import type { ArticleProduct, ArticleService } from '../model/types'
import { ArticleProductCard } from './ArticleProductCard'

/**
 * Один блок текста выжимки: кусок HTML, карточки товаров по меткам или ссылка на услугу.
 * Общий для статей и документов раздела «ГОСТы и нормативы».
 */
export function ArticleBlockView({
  block,
  productsBySku,
  servicesBySlug,
}: {
  block: ArticleBlock
  productsBySku: Map<string, ArticleProduct>
  servicesBySlug: Map<string, ArticleService>
}) {
  if (block.type === 'html') {
    // HTML чистит API при сохранении (скрипты, обработчики, javascript:)
    return <div className="stati-html" dangerouslySetInnerHTML={{ __html: block.html }} />
  }
  if (block.type === 'cards') {
    const products = block.skus
      .map((sku) => productsBySku.get(sku))
      .filter((product): product is ArticleProduct => !!product)
    if (!products.length) return null
    return (
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <ArticleProductCard key={product.sku} product={product} specs={block.specs} />
        ))}
      </div>
    )
  }
  const service = servicesBySlug.get(block.slug)
  if (!service) return null
  return (
    <Link
      to={`/services/${encodeURIComponent(service.slug)}`}
      className="my-6 flex items-center gap-4 rounded-[10px] border border-border bg-muted p-4 text-sm transition-colors hover:border-[hsl(var(--primary))]"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-foreground">Услуга: {service.title}</span>
        {service.description && (
          <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{service.description}</span>
        )}
      </span>
      <FiArrowRight className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
    </Link>
  )
}
