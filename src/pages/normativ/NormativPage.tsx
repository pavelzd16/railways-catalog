import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiBookOpen } from 'react-icons/fi'
import { Layout } from '@/widgets/Layout'
import { useNormativ } from '@/entities/normativ/model/useNormativ'
import { splitArticleBody, type ArticleBlock } from '@/entities/article/lib/article-body'
import { ArticleBlockView } from '@/entities/article/ui/ArticleBlockView'
import { ArticleProductCard } from '@/entities/article/ui/ArticleProductCard'
import type { NormDocumentFull } from '@/entities/normativ/model/types'
import { kindLabel } from '@/entities/normativ/lib/norm-labels'
import { unlinkExternalLinks } from '@/entities/normativ/lib/norm-document-view'
import { catalogPath } from '@/shared/seo/route-data'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { Accordion } from '@/shared/ui/Accordion'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import { NormDocumentCard, NormStatus } from './NormDocumentCard'
import { NormPageFlipper } from './NormPageFlipper'
import '../stati/stati.css'
import './normativ.css'

// Сетка текста та же, что у статей: оглавление слева от 1024px, колонка текста до 780px.
const GRID = 'lg:grid lg:grid-cols-[220px_minmax(0,780px)] lg:justify-center lg:gap-14'

type Request = 'file' | 'price'

/** Страница документа целиком (без шапки и подвала сайта): карточка документа рядом с заголовком, выжимка, товары по номеру. */
export function NormativView({ document }: { document: NormDocumentFull }) {
  // Форма берёт текст комментария один раз при монтировании — монтируем её только по нажатию, с нужным текстом.
  const [request, setRequest] = useState<Request | null>(null)
  // Внешние ссылки выжимки рисуются простым текстом: страница документа не уводит на другие сайты.
  const { blocks, toc, faq, faqAfter } = useMemo(() => splitArticleBody(unlinkExternalLinks(document.body)), [document.body])
  const productsBySku = useMemo(() => new Map(document.products.map((product) => [product.sku, product])), [document.products])
  const servicesBySlug = useMemo(() => new Map(document.services.map((service) => [service.slug, service])), [document.services])
  // «Разделы каталога» — разные раздел/подраздел товаров документа
  const sections = useMemo(() => {
    const result = new Map<string, string>()
    for (const product of [...document.products, ...document.relatedProducts]) {
      const href = catalogPath(product.categorySlug, product.subcategorySlug ?? undefined)
      if (!result.has(href)) result.set(href, product.subcategoryName ?? product.categoryName)
    }
    return [...result]
  }, [document.products, document.relatedProducts])
  const hasFaqHeading = toc.some((item) => item.title.toLowerCase() === 'частые вопросы')
  const requestFile = () => setRequest('file')
  const requestPrice = () => setRequest('price')

  const renderBlock = (block: ArticleBlock, index: number) => (
    <ArticleBlockView key={index} block={block} productsBySku={productsBySku} servicesBySlug={servicesBySlug} />
  )

  return (
    <>
      <article>
        <header className="stati-hero bg-[#151D25] text-white">
          <div className="container mx-auto px-4 pb-10 pt-6 lg:pb-14">
            <Breadcrumbs
              items={[
                { label: 'Главная', href: '/' },
                { label: 'ГОСТы и нормативы', href: '/normativ' },
                { label: document.code },
              ]}
            />
            {/* На ПК карточка документа — справа от заголовка, на телефоне — под ним; в обоих случаях над выжимкой */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14">
              <div className="min-w-0 lg:pt-4">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="normativ-chip normativ-chip--kind">{kindLabel(document.kind)}</span>
                  <NormStatus document={document} />
                </div>
                <h1 className="text-[clamp(1.875rem,3.6vw,2.875rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white [overflow-wrap:anywhere]">
                  {document.h1}
                </h1>
                <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#d5dce2] lg:text-[17px]">{document.description}</p>
                <p className="mt-5 text-xs text-[#aeb8c2]">Выжимка ПроРельс</p>
                {/* Сам документ — листалка страниц; кнопки «Скачать PDF» и «Открыть в новом окне» — только в карточке */}
                <NormPageFlipper key={document.slug} document={document} />
              </div>
              <NormDocumentCard document={document} onRequestFile={requestFile} onRequestPrice={requestPrice} />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 lg:py-14">
          <div className={`flex flex-col gap-8 ${GRID}`}>
            <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
              <nav
                aria-labelledby="normativ-toc-title"
                className="border-t-2 border-[hsl(var(--primary))] bg-muted p-5 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4"
              >
                <p id="normativ-toc-title" className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <FiBookOpen className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
                  В этом документе
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
                <Button size="sm" className="mt-4" onClick={requestPrice}>
                  Запросить цену
                </Button>
              </nav>
            </aside>

            <div className="min-w-0">
              <div className="stati-body">{blocks.slice(0, faqAfter).map(renderBlock)}</div>

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

              {/* Разделы, которые в тексте идут после частых вопросов */}
              {faqAfter < blocks.length && (
                <div className="stati-body-rest">{blocks.slice(faqAfter).map((block, index) => renderBlock(block, faqAfter + index))}</div>
              )}

              {document.relatedProducts.length > 0 && (
                <section aria-labelledby="normativ-products-title" className="mt-12">
                  <h2 id="normativ-products-title" className="mb-4 text-2xl font-bold leading-tight tracking-[-0.02em]">
                    Наши товары по {document.code}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {document.relatedProducts.map((product) => (
                      <ArticleProductCard key={product.sku} product={product} specs={[]} />
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-10 flex flex-col gap-4 rounded-[10px] bg-[#151D25] p-6 text-white sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-lg font-bold">Материалы по {document.code}</p>
                  <p className="mt-1 text-sm text-[#c7cfd6]">Пришлите объём и адрес — посчитаем стоимость с доставкой.</p>
                </div>
                <Button onClick={requestPrice} className="shrink-0">
                  Запросить цену
                </Button>
              </section>

              {sections.length > 0 && (
                <nav aria-labelledby="normativ-sections-title" className="mt-8">
                  <p id="normativ-sections-title" className="font-bold text-foreground">
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

      {request && (
        <RequestFormModal
          open
          onOpenChange={(open) => !open && setRequest(null)}
          title={request === 'file' ? 'Запросить документ' : 'Запросить цену'}
          description={request === 'file' ? 'Пришлём файл на почту или в мессенджер' : 'Укажите объём партии — менеджер назовёт цену'}
          comment={request === 'file' ? `Прошу прислать ${document.code}` : `Запрос цены по ${document.code}`}
        />
      )}
    </>
  )
}

export function NormativPage() {
  const { slug } = useParams<{ slug: string }>()
  const { document, isLoading, notFound, error } = useNormativ(slug)
  if (notFound) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20">
          <h1 className="page-title">Документ не найден</h1>
          <p className="my-6 text-muted-foreground">Проверьте адрес или откройте список документов.</p>
          <Link to="/normativ" className="font-bold text-primary hover:underline">
            ГОСТы и нормативы
          </Link>
        </div>
      </Layout>
    )
  }
  return (
    <Layout>
      {document ? (
        <NormativView document={document} />
      ) : (
        <div className="container mx-auto px-4 py-16 text-center" role={error ? 'alert' : 'status'}>
          <p className={error ? 'text-red-500' : 'text-muted-foreground'}>{error ?? (isLoading ? 'Загрузка документа…' : '')}</p>
          {error && (
            <Link to="/normativ" className="mt-4 inline-block font-bold text-[hsl(var(--primary))] hover:underline">
              Все документы
            </Link>
          )}
        </div>
      )}
    </Layout>
  )
}
