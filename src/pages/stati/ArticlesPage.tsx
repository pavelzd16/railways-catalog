import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { FiBookOpen } from 'react-icons/fi'
import { Layout } from '@/widgets/Layout'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { articleApi } from '@/entities/article/api/article.api'
import { ArticleCard } from '@/entities/article/ui/ArticleCard'
import type { ArticleListItem } from '@/entities/article/model/types'
import type { PaginatedResponse } from '@/shared/api'
import { usePageData } from '@/shared/seo/page-context'
import { articlesPage } from '@/shared/seo/route-data'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Pagination } from '@/shared/ui/Pagination'

const PAGE_SIZE = 12

// Список приходит с сервера вместе со страницей; при переходе по ссылкам внутри сайта — догружаем.
function useArticlesList(page: number) {
  const data = usePageData()
  const [loaded, setLoaded] = useState<{ page: number; list?: PaginatedResponse<ArticleListItem>; failed?: boolean }>()
  useEffect(() => {
    if (data.articles || data.status !== 200) return
    let cancelled = false
    articleApi
      .getAll({ page, limit: PAGE_SIZE })
      .then((list) => { if (!cancelled) setLoaded({ page, list }) })
      .catch(() => { if (!cancelled) setLoaded({ page, failed: true }) })
    return () => { cancelled = true }
  }, [data.articles, data.status, page])
  const fetched = loaded?.page === page ? loaded : undefined
  const list = data.articles ?? fetched?.list
  return {
    list,
    notFound: data.status === 404 || (!!list && page > 1 && page > list.pagination.totalPages),
    error: data.status >= 500 || !!fetched?.failed,
  }
}

export function ArticlesPage() {
  const { search } = useLocation()
  const page = articlesPage(new URLSearchParams(search))
  const { list, notFound, error } = useArticlesList(page)
  if (notFound) return <NotFoundPage />

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-14 pt-8">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Статьи' }]} />

        <div className="mb-3 inline-flex items-center gap-2.5 text-[13px] font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#151D25] text-[hsl(var(--accent))]">
            <FiBookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          Статьи ПроРельс
        </div>
        <h1 className="mb-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.03em]">
          Полезные материалы
          <br />о верхнем строении пути
        </h1>
        <p className="mb-8 max-w-[760px] text-[15px] leading-relaxed text-muted-foreground">
          Рельсы, шпалы, стрелочные переводы и крепёж: что выбрать, как проверить и что указать в заявке.
        </p>

        <div className="mb-6 flex justify-between gap-4 border-t border-border pt-4 text-[13px]">
          <span>Все материалы</span>
          {list && <span className="text-muted-foreground">Материалов: {list.pagination.total}</span>}
        </div>

        {error && (
          <p className="py-12 text-center text-red-500" role="alert">
            Не удалось загрузить статьи. Повторите попытку позже.
          </p>
        )}
        {!list && !error && (
          <p className="py-12 text-center text-muted-foreground" role="status">
            Загрузка статей…
          </p>
        )}
        {list && list.items.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Статей пока нет.</p>
        )}
        {list && list.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {list.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {list && (
          <Pagination
            className="mt-10"
            currentPage={page}
            totalPages={list.pagination.totalPages}
            onPageChange={() => {}}
            pageHref={(target) => (target > 1 ? `/stati?page=${target}` : '/stati')}
          />
        )}
      </div>
    </Layout>
  )
}
