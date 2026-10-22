import { useState, useEffect, useCallback, useRef } from 'react'
import { articleApi } from '@/entities/article/api/article.api'
import type { ArticleFull, ArticleListItem, CreateArticleDto, UpdateArticleDto } from '@/entities/article/model/types'
import type { PaginationMeta } from '@/shared/api'

export const ADMIN_ARTICLES_PER_PAGE = 20

interface UseAdminArticlesReturn {
  articles: ArticleListItem[]
  pagination: PaginationMeta
  isLoading: boolean
  error: string | null
  /** Создаёт статью (и обложку, если выбрана); ошибки запроса пробрасывает как есть. */
  createArticle: (dto: CreateArticleDto, cover: File | null) => Promise<ArticleListItem>
  updateArticle: (id: string, dto: UpdateArticleDto, cover: File | null) => Promise<ArticleListItem>
  deleteArticle: (id: string) => Promise<void>
  getArticle: (id: string) => Promise<ArticleFull>
  handlePageChange: (page: number) => void
}

export function useAdminArticles(): UseAdminArticlesReturn {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ADMIN_ARTICLES_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const pageRef = useRef(1)

  const loadArticles = useCallback(async (page: number = 1) => {
    pageRef.current = page
    const attempt = ++requestRef.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await articleApi.adminList({ page, limit: ADMIN_ARTICLES_PER_PAGE })
      if (attempt !== requestRef.current) return
      setArticles(response.items)
      setPagination(response.pagination)
    } catch {
      if (attempt !== requestRef.current) return
      setError('Не удалось загрузить статьи')
    } finally {
      if (attempt === requestRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles(1)
  }, [loadArticles])

  const createArticle = useCallback(async (dto: CreateArticleDto, cover: File | null) => {
    let saved: ArticleListItem = await articleApi.create(dto)
    try {
      if (cover) saved = await articleApi.uploadCover(saved.id, cover)
    } finally {
      await loadArticles(pageRef.current)
    }
    return saved
  }, [loadArticles])

  const updateArticle = useCallback(async (id: string, dto: UpdateArticleDto, cover: File | null) => {
    let saved: ArticleListItem = await articleApi.update(id, dto)
    try {
      if (cover) saved = await articleApi.uploadCover(id, cover)
    } finally {
      await loadArticles(pageRef.current)
    }
    return saved
  }, [loadArticles])

  const deleteArticle = useCallback(async (id: string) => {
    await articleApi.remove(id)
    // Удалили последнюю на странице — вернёмся на предыдущую
    await loadArticles(articles.length === 1 && pageRef.current > 1 ? pageRef.current - 1 : pageRef.current)
  }, [loadArticles, articles.length])

  const getArticle = useCallback((id: string) => articleApi.adminGet(id), [])

  return {
    articles,
    pagination,
    isLoading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticle,
    handlePageChange: loadArticles,
  }
}
