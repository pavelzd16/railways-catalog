import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import type { ArticleListItem } from '@/entities/article/model/types'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Pagination } from '@/shared/ui/Pagination'
import { useAdminArticles, ArticleFormModal, DeleteArticleDialog } from '@/features/admin-articles'

// Дата публикации по Москве: сервер и браузер пишут одно и то же
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }) : '—'

export function AdminArticlesPage() {
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ArticleListItem | null>(null)
  const [deleting, setDeleting] = useState<ArticleListItem | null>(null)

  const { articles, pagination, isLoading, error, createArticle, updateArticle, deleteArticle, getArticle, handlePageChange } =
    useAdminArticles()

  const openPreview = (id: string) => navigate(`/admin/articles/preview/${id}`)
  const formProps = { onLoad: getArticle, onCreate: createArticle, onUpdate: updateArticle, onPreview: openPreview }

  const published = (article: ArticleListItem) => (article.published ? 'Да' : 'Нет')

  const actions = (article: ArticleListItem) => (
    <div className="flex gap-1">
      <button
        type="button"
        aria-label="Изменить"
        title="Изменить"
        onClick={() => setEditing(article)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Удалить"
        title="Удалить"
        onClick={() => setDeleting(article)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Статьи</h1>
          <p className="mt-1 text-muted-foreground">Раздел «Статьи» на сайте: добавление и правка материалов</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
          <FiPlus className="h-5 w-5" />
          Добавить
        </Button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-red-500">{error}</p>}

      {isLoading && articles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка статей...</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Заголовок</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Адрес</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Рубрика</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Опубликовано</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Дата публикации</th>
                  <th className="w-24 px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-4 font-medium text-foreground">{article.h1 || article.title}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{article.slug}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{article.category}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{published(article)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(article.publishedAt)}</td>
                    <td className="px-4 py-4">{actions(article)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {articles.map((article) => (
              <div key={article.id} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium text-foreground">{article.h1 || article.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{article.slug}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {article.category} · опубликовано: {published(article)} · {formatDate(article.publishedAt)}
                </p>
                <div className="mt-2">{actions(article)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      ) : (
        <EmptyState title="Статей пока нет" description="Добавьте первую статью" />
      )}

      <ArticleFormModal open={isCreateOpen} onOpenChange={setIsCreateOpen} {...formProps} />

      {editing && (
        <ArticleFormModal
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          article={editing}
          {...formProps}
        />
      )}

      {deleting && (
        <DeleteArticleDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          article={deleting}
          onDelete={deleteArticle}
        />
      )}
    </div>
  )
}
