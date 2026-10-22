import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'
import { articleApi } from '@/entities/article/api/article.api'
import type { ArticleFull } from '@/entities/article/model/types'
import { ArticleView } from '@/pages/stati/ArticlePage'

/** Предпросмотр статьи (в том числе неопубликованной) тем же видом, что и на сайте. */
export function ArticlePreviewPage() {
  const { id } = useParams<{ id: string }>()
  // key: при смене статьи состояние загрузки начинается заново
  return id ? <ArticlePreview key={id} id={id} /> : null
}

function ArticlePreview({ id }: { id: string }) {
  const [article, setArticle] = useState<ArticleFull | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    articleApi
      .adminGet(id)
      .then((full) => !cancelled && setArticle(full))
      .catch(() => !cancelled && setError('Не удалось загрузить статью для предпросмотра'))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/40 px-4 py-3 md:px-6">
        <Link to="/admin/articles" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-[hsl(var(--primary))]">
          <FiArrowLeft className="h-4 w-4" />
          К списку статей
        </Link>
        <span className="text-sm text-muted-foreground">
          Предпросмотр{article && !article.published ? ': статья не опубликована, на сайте её не видно' : ''}
        </span>
      </div>
      {error && <p role="alert" className="p-6 text-red-500">{error}</p>}
      {!error && !article && <p role="status" className="p-6 text-muted-foreground">Загрузка...</p>}
      {article && <ArticleView article={article} />}
    </div>
  )
}
