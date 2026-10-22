import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiArrowRight, FiBookOpen, FiClock } from 'react-icons/fi'
import { Layout } from '@/widgets/Layout'
import { ContactMeModal } from '@/widgets/header/ui/ContactMeModal'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { useArticle } from '@/entities/article/model/useArticle'
import { splitArticleBody } from '@/entities/article/lib/article-body'
import { ArticleCard } from '@/entities/article/ui/ArticleCard'
import { ArticleProductCard } from '@/entities/article/ui/ArticleProductCard'
import type { ArticleFull, ArticleProduct } from '@/entities/article/model/types'
import { catalogPath } from '@/shared/seo/route-data'
import { Accordion } from '@/shared/ui/Accordion'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import './stati.css'

// Дата публикации в шапке: «22 октября 2026 г.»; часовой пояс задан, чтобы сервер и браузер написали одно и то же.
function publishedDate(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' })
}

// Сетка шапки и текста одна: оглавление слева от 1024px, колонка текста до 780px.
const GRID = 'lg:grid lg:grid-cols-[220px_minmax(0,780px)] lg:justify-center lg:gap-14'

/** Статья целиком (без шапки и подвала сайта): тёмная шапка, оглавление, текст, вопросы, призыв, ссылки. */
export function ArticleView({ article }: { article: ArticleFull }) {
  const [contactOpen, setContactOpen] = useState(false)
  const { blocks, toc, faq } = useMemo(() => splitArticleBody(article.body), [article.body])
  const productsBySku = useMemo(() => new Map(article.products.map((product) => [product.sku, product])), [article.products])
  const servicesBySlug = useMemo(() => new Map(article.services.map((service) => [service.slug, service])), [article.services])
  // «Разделы каталога» — разные раздел/подраздел товаров статьи
  const sections = useMemo(() => {
    const result = new Map<string, string>()
    for (const product of article.products) {
      const href = catalogPath(product.categorySlug, product.subcategorySlug ?? undefined)
      if (!result.has(href)) result.set(href, product.subcategoryName ?? product.categoryName)
    }
    return [...result]
  }, [article.products])
  const date = publishedDate(article.publishedAt)
  const hasFaqHeading = toc.some((item) => item.title.toLowerCase() === 'частые вопросы')
  const openContact = () => setContactOpen(true)

  return (
    <>
      <article>
        <header className="stati-hero bg-[#151D25] text-white">
          <div className="container mx-auto px-4 pb-10 pt-6 lg:pb-16">
            <Breadcrumbs
              items={[
                { label: 'Главная', href: '/' },
                { label: 'Статьи', href: '/stati' },
                { label: article.h1 },
              ]}
            />
            <div className={GRID}>
              <div aria-hidden="true" />
              <div className="lg:pt-4">
                <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#c7cfd6]">
                  <span className="rounded-[5px] bg-[#2c3742] px-2.5 py-1 text-white">{article.category}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <FiClock className="h-4 w-4" aria-hidden="true" />
                    {article.readingMinutes} мин чтения
                  </span>
                  {date && <time dateTime={article.publishedAt ?? undefined}>{date}</time>}
                </div>
                <h1 className="text-[clamp(1.875rem,3.6vw,2.875rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                  {article.h1}
                </h1>
                <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#d5dce2] lg:text-[17px]">{article.description}</p>
                <p className="mt-5 text-xs text-[#aeb8c2]">Материал ПроРельс</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 lg:py-14">
          <div className={`flex flex-col gap-8 ${GRID}`}>
            <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
              <nav
                aria-labelledby="stati-toc-title"
                className="border-t-2 border-[hsl(var(--primary))] bg-muted p-5 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4"
              >
                <p id="stati-toc-title" className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <FiBookOpen className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
                  В этой статье
                </p>
                {toc.length > 0 && (
                  <ol className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block py-1.5 text-[13px] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
                <Button size="sm" className="mt-4" onClick={openContact}>
                  Узнать цену
                </Button>
              </nav>
            </aside>

            <div className="min-w-0">
              <div className="stati-body">
                {blocks.map((block, index) => {
                  if (block.type === 'html') {
                    // HTML статьи чистит API при сохранении (скрипты, обработчики, javascript:)
                    return <div key={index} className="stati-html" dangerouslySetInnerHTML={{ __html: block.html }} />
                  }
                  if (block.type === 'cards') {
                    const products = block.skus
                      .map((sku) => productsBySku.get(sku))
                      .filter((product): product is ArticleProduct => !!product)
                    if (!products.length) return null
                    return (
                      <div key={index} className="my-6 grid gap-4 sm:grid-cols-2">
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
                      key={index}
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
                })}
              </div>

              {faq.length > 0 && (
                <section aria-label="Частые вопросы" className="mt-4">
                  {!hasFaqHeading && <h2 className="mb-4 mt-10 text-2xl font-bold">Частые вопросы</h2>}
                  <Accordion
                    items={faq.map((item, index) => ({
                      id: `faq-${index}`,
                      trigger: <span className="pr-3 font-bold text-foreground">{item.question}</span>,
                      content: <p className="text-[15px] leading-relaxed text-muted-foreground">{item.answer}</p>,
                    }))}
                  />
                </section>
              )}

              <section className="mt-10 flex flex-col gap-4 rounded-[10px] bg-[#151D25] p-6 text-white sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-lg font-bold">Подберём материалы под ваш путь</p>
                  <p className="mt-1 text-sm text-[#c7cfd6]">Пришлите объём и адрес — посчитаем стоимость с доставкой.</p>
                </div>
                <Button onClick={openContact} className="shrink-0">
                  Узнать цену
                </Button>
              </section>

              {sections.length > 0 && (
                <nav aria-labelledby="stati-sections-title" className="mt-8">
                  <p id="stati-sections-title" className="font-bold text-foreground">
                    Разделы каталога
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {sections.map(([href, label]) => (
                      <li key={href}>
                        <Link
                          to={href}
                          className="inline-block rounded-full border border-border px-3.5 py-1.5 text-[13px] text-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </article>

      {article.related.length > 0 && (
        <section aria-labelledby="stati-related-title" className="container mx-auto px-4 pb-14">
          <h2 id="stati-related-title" className="mb-5 text-2xl font-bold">
            Похожие статьи
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {article.related.map((item) => (
              <ArticleCard key={item.id} article={item} compact />
            ))}
          </div>
        </section>
      )}

      <ContactMeModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  )
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { article, isLoading, notFound, error } = useArticle(slug)
  if (notFound) return <NotFoundPage />
  return (
    <Layout>
      {article ? (
        <ArticleView article={article} />
      ) : (
        <div className="container mx-auto px-4 py-16 text-center" role={error ? 'alert' : 'status'}>
          <p className={error ? 'text-red-500' : 'text-muted-foreground'}>{error ?? (isLoading ? 'Загрузка статьи…' : '')}</p>
          {error && (
            <Link to="/stati" className="mt-4 inline-block font-bold text-[hsl(var(--primary))] hover:underline">
              Все статьи
            </Link>
          )}
        </div>
      )}
    </Layout>
  )
}
